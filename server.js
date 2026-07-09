const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = Number(process.env.PORT || 8130);
const HOST = process.env.HOST || '127.0.0.1';
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const DEFAULT_PRODUCTS_FILE = path.join(DATA_DIR, 'default-products.json');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'MegabyteAdmin2026!';
const TOKEN_SECRET = process.env.TOKEN_SECRET || crypto.createHash('sha256').update(`${ADMIN_PASSWORD}:megabyte-store`).digest('hex');
const TOKEN_TTL_MS = 1000 * 60 * 60 * 8;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.xml': 'application/xml; charset=utf-8'
};

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error('Payload demasiado grande'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('JSON invalido'));
      }
    });
    req.on('error', reject);
  });
}

function readProducts() {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
}

function writeProducts(products) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(PRODUCTS_FILE, `${JSON.stringify(products.map(normalizeProduct), null, 2)}\n`, 'utf8');
}

function ensureDataFile() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(PRODUCTS_FILE)) {
    fs.copyFileSync(DEFAULT_PRODUCTS_FILE, PRODUCTS_FILE);
  }
}

function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || `producto-${Date.now()}`;
}

function normalizeProduct(product) {
  const categories = ['computadores', 'accesorios', 'componentes', 'redes', 'seguridad', 'software'];
  const imageTypes = ['laptop', 'desktop', 'audio', 'camera', 'drive', 'router'];
  const price = Math.max(0, Number(product.price) || 0);
  const oldPrice = Math.max(price, Number(product.oldPrice) || price);
  const discount = oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : Math.max(0, Number(product.discount) || 0);

  return {
    id: String(product.id || slugify(product.name)),
    name: String(product.name || 'Producto sin nombre').trim(),
    brand: String(product.brand || 'Megabyte').trim(),
    category: categories.includes(product.category) ? product.category : 'computadores',
    price,
    oldPrice,
    discount,
    stock: Math.max(0, Number(product.stock) || 0),
    rating: Math.min(5, Math.max(0, Number(product.rating) || 4.8)),
    badge: String(product.badge || 'Disponible').trim(),
    imageType: imageTypes.includes(product.imageType) ? product.imageType : 'laptop',
    shortDescription: String(product.shortDescription || 'Producto disponible en Megabyte Store.').trim(),
    description: String(product.description || product.shortDescription || 'Producto disponible en Megabyte Store.').trim(),
    specs: Array.isArray(product.specs)
      ? product.specs.map((spec) => String(spec).trim()).filter(Boolean)
      : String(product.specs || '').split('\n').map((spec) => spec.trim()).filter(Boolean),
    warranty: String(product.warranty || 'Garantia segun disponibilidad y condiciones del producto.').trim(),
    availability: String(product.availability || (Number(product.stock) > 0 ? 'Disponible' : 'Agotado')).trim()
  };
}

function sign(value) {
  return crypto.createHmac('sha256', TOKEN_SECRET).update(value).digest('base64url');
}

function createToken() {
  const payload = Buffer.from(JSON.stringify({ role: 'admin', exp: Date.now() + TOKEN_TTL_MS })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

function verifyToken(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const [payload, signature] = token.split('.');
  if (!payload || !signature || sign(payload) !== signature) return false;

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return data.role === 'admin' && Number(data.exp) > Date.now();
  } catch (err) {
    return false;
  }
}

function requireAdmin(req, res) {
  if (verifyToken(req)) return true;
  sendJson(res, 401, { error: 'No autorizado' });
  return false;
}

async function handleApi(req, res, url) {
  if (req.method === 'GET' && url.pathname === '/api/products') {
    return sendJson(res, 200, { products: readProducts() });
  }

  if (req.method === 'POST' && url.pathname === '/api/admin/login') {
    const body = await readBody(req);
    if (String(body.password || '') !== ADMIN_PASSWORD) {
      return sendJson(res, 401, { error: 'Contraseña incorrecta' });
    }
    return sendJson(res, 200, { token: createToken() });
  }

  if (req.method === 'GET' && url.pathname === '/api/admin/me') {
    if (!requireAdmin(req, res)) return;
    return sendJson(res, 200, { ok: true, role: 'admin' });
  }

  if (req.method === 'POST' && url.pathname === '/api/admin/products/restore') {
    if (!requireAdmin(req, res)) return;
    const defaults = JSON.parse(fs.readFileSync(DEFAULT_PRODUCTS_FILE, 'utf8'));
    writeProducts(defaults);
    return sendJson(res, 200, { products: readProducts() });
  }

  if (req.method === 'POST' && url.pathname === '/api/admin/products') {
    if (!requireAdmin(req, res)) return;
    const product = normalizeProduct(await readBody(req));
    const products = readProducts();
    let id = product.id;
    let suffix = 2;
    while (products.some((item) => item.id === id)) {
      id = `${product.id}-${suffix}`;
      suffix += 1;
    }
    products.unshift({ ...product, id });
    writeProducts(products);
    return sendJson(res, 201, { product: products[0], products });
  }

  const productMatch = url.pathname.match(/^\/api\/admin\/products\/([^/]+)$/);
  if (productMatch && req.method === 'PUT') {
    if (!requireAdmin(req, res)) return;
    const id = decodeURIComponent(productMatch[1]);
    const product = normalizeProduct({ ...(await readBody(req)), id });
    const products = readProducts();
    const index = products.findIndex((item) => item.id === id);
    if (index < 0) return sendJson(res, 404, { error: 'Producto no encontrado' });
    products[index] = product;
    writeProducts(products);
    return sendJson(res, 200, { product, products });
  }

  if (productMatch && req.method === 'DELETE') {
    if (!requireAdmin(req, res)) return;
    const id = decodeURIComponent(productMatch[1]);
    const products = readProducts().filter((item) => item.id !== id);
    writeProducts(products);
    return sendJson(res, 200, { products });
  }

  sendJson(res, 404, { error: 'Ruta no encontrada' });
}

function serveStatic(req, res, url) {
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/') pathname = '/index.html';

  const filePath = path.normalize(path.join(ROOT, pathname));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('No encontrado');
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME_TYPES[path.extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (url.pathname.startsWith('/api/')) {
      await handleApi(req, res, url);
      return;
    }
    serveStatic(req, res, url);
  } catch (err) {
    sendJson(res, 500, { error: err.message || 'Error interno' });
  }
});

ensureDataFile();
server.listen(PORT, HOST, () => {
  console.log(`Megabyte MB corriendo en http://${HOST}:${PORT}`);
  console.log('Admin password:', ADMIN_PASSWORD);
});
