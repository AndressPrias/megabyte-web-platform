(function () {
  'use strict';

  const WHATSAPP_NUMBER = '573133141701';
  const CART_KEY = 'megabyte_store_cart';
  const API_PRODUCTS = '/api/products.php';
  const API_ADMIN = '/admin/api.php';
  let productsCache = [];
  let productsLoaded = false;
  let backendAvailable = true;
  let adminAuthenticated = document.body?.dataset.adminAuthenticated === 'true';

  const DEFAULT_PRODUCTS = [
    {
      id: 'laptop-hp-i5',
      name: 'Laptop HP Core i5',
      brand: 'HP',
      category: 'computadores',
      price: 1450000,
      oldPrice: 1690000,
      discount: 14,
      stock: 3,
      rating: 4.8,
      badge: 'Usado certificado',
      imageType: 'laptop',
      shortDescription: 'Equipo revisado, optimizado y listo para oficina, estudio o trabajo remoto.',
      description: 'Laptop HP reacondicionada por Megabyte MB, con mantenimiento preventivo, limpieza interna, pruebas de rendimiento y sistema listo para usar.',
      specs: ['Intel Core i5', '8GB RAM', 'SSD 256GB', 'Windows 11', 'Pantalla 14-15.6 pulgadas'],
      warranty: 'Garantía de 90 días por funcionamiento.',
      availability: 'Listo para entrega'
    },
    {
      id: 'pc-gamer-ryzen',
      name: 'PC Escritorio Gamer',
      brand: 'Armado MB',
      category: 'computadores',
      price: 2850000,
      oldPrice: 3190000,
      discount: 11,
      stock: 2,
      rating: 4.9,
      badge: 'Nuevo',
      imageType: 'desktop',
      shortDescription: 'Torre armada para gaming, diseño, estudio y multitarea exigente.',
      description: 'PC de escritorio configurado según disponibilidad de componentes. Se entrega probado, optimizado y con asesoría para futuras mejoras.',
      specs: ['Ryzen 5', '16GB RAM', 'GTX 1660', 'SSD 512GB', 'Fuente certificada'],
      warranty: 'Garantía según componentes y ensamble.',
      availability: 'Bajo pedido'
    },
    {
      id: 'kit-perifericos',
      name: 'Kit Periféricos',
      brand: 'Accesorios',
      category: 'accesorios',
      price: 185000,
      oldPrice: 230000,
      discount: 20,
      stock: 8,
      rating: 4.7,
      badge: 'Combo',
      imageType: 'audio',
      shortDescription: 'Combo de teclado, mouse y audífonos para oficina o entretenimiento.',
      description: 'Kit de periféricos recomendado para renovar el puesto de trabajo o completar un equipo nuevo.',
      specs: ['Teclado USB', 'Mouse óptico', 'Audífonos con micrófono', 'Compatibilidad Windows', 'Opciones cableadas o inalámbricas'],
      warranty: 'Garantía de 30 días por defectos de fábrica.',
      availability: 'Disponibilidad variable'
    },
    {
      id: 'camara-ip-wifi',
      name: 'Cámara IP Wi-Fi',
      brand: 'CCTV / IP',
      category: 'seguridad',
      price: 210000,
      oldPrice: 260000,
      discount: 19,
      stock: 5,
      rating: 4.6,
      badge: 'Seguridad',
      imageType: 'camera',
      shortDescription: 'Cámara Wi-Fi con visión nocturna, app móvil y configuración inicial.',
      description: 'Solución de vigilancia para hogares y negocios pequeños. Puede instalarse como producto individual o dentro de un sistema de seguridad.',
      specs: ['Resolución 1080p', 'Visión nocturna', 'Audio bidireccional', 'App móvil', 'Instalación opcional'],
      warranty: 'Garantía de 60 días por funcionamiento.',
      availability: 'Instalable'
    },
    {
      id: 'ssd-512gb',
      name: 'SSD 512GB SATA',
      brand: 'Upgrade',
      category: 'componentes',
      price: 220000,
      oldPrice: 280000,
      discount: 21,
      stock: 6,
      rating: 4.8,
      badge: 'Mejora',
      imageType: 'drive',
      shortDescription: 'Actualización recomendada para acelerar computadores lentos.',
      description: 'Unidad SSD ideal para mejorar arranque, apertura de programas y fluidez general. Instalación y clonación disponibles.',
      specs: ['512GB', 'Interfaz SATA', 'Instalación opcional', 'Compatible con laptop y PC', 'Clonación bajo solicitud'],
      warranty: 'Garantía de 90 días.',
      availability: 'Disponible'
    },
    {
      id: 'router-wifi',
      name: 'Router Wi-Fi Doble Banda',
      brand: 'Redes',
      category: 'redes',
      price: 195000,
      oldPrice: 245000,
      discount: 20,
      stock: 4,
      rating: 4.5,
      badge: 'Redes',
      imageType: 'router',
      shortDescription: 'Mejora la cobertura y estabilidad de internet en casa o negocio.',
      description: 'Router doble banda para redes domésticas y pequeños negocios. Configuración profesional disponible.',
      specs: ['2.4GHz + 5GHz', 'Antenas externas', 'Configuración opcional', 'Control de acceso', 'Ideal para fibra o cable'],
      warranty: 'Garantía de 60 días.',
      availability: 'Disponible'
    }
  ];

  const PRODUCT_CATEGORIES = ['computadores', 'accesorios', 'componentes', 'redes', 'seguridad', 'software'];
  const PRODUCT_IMAGE_TYPES = ['laptop', 'desktop', 'audio', 'camera', 'drive', 'router'];

  function normalizeProduct(product) {
    const price = Math.max(0, Number(product.price) || 0);
    const oldPrice = Math.max(price, Number(product.oldPrice) || price);
    const discount = oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : Math.max(0, Number(product.discount) || 0);

    return {
      id: String(product.id || slugify(product.name || `producto-${Date.now()}`)),
      name: String(product.name || 'Producto sin nombre').trim(),
      brand: String(product.brand || 'Megabyte').trim(),
      category: PRODUCT_CATEGORIES.includes(product.category) ? product.category : 'computadores',
      price,
      oldPrice,
      discount,
      stock: Math.max(0, Number(product.stock) || 0),
      rating: Math.min(5, Math.max(0, Number(product.rating) || 4.8)),
      badge: String(product.badge || 'Disponible').trim(),
      imageType: PRODUCT_IMAGE_TYPES.includes(product.imageType) ? product.imageType : 'laptop',
      shortDescription: String(product.shortDescription || 'Producto disponible en Megabyte Store.').trim(),
      description: String(product.description || product.shortDescription || 'Producto disponible en Megabyte Store.').trim(),
      specs: Array.isArray(product.specs)
        ? product.specs.map((spec) => String(spec).trim()).filter(Boolean)
        : String(product.specs || '').split('\n').map((spec) => spec.trim()).filter(Boolean),
      warranty: String(product.warranty || 'Garantía según disponibilidad y condiciones del producto.').trim(),
      availability: String(product.availability || (Number(product.stock) > 0 ? 'Disponible' : 'Agotado')).trim()
    };
  }

  function slugify(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || `producto-${Date.now()}`;
  }

  function defaultProducts() {
    return DEFAULT_PRODUCTS.map(normalizeProduct);
  }

  function getProducts() {
    return productsLoaded ? productsCache : defaultProducts();
  }

  async function apiRequest(path, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    const response = await fetch(path, { ...options, headers, credentials: 'same-origin' });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload.error || 'No se pudo completar la solicitud');
    }

    return payload;
  }

  function adminHeaders() {
    return {};
  }

  async function loadProducts() {
    try {
      const payload = await apiRequest(API_PRODUCTS);
      productsCache = Array.isArray(payload.products) ? payload.products.map(normalizeProduct) : [];
      productsLoaded = true;
      backendAvailable = true;
    } catch (err) {
      console.warn('Backend de productos no disponible, usando datos de ejemplo:', err);
      productsCache = defaultProducts();
      productsLoaded = true;
      backendAvailable = false;
    }
  }

  async function refreshProducts() {
    await loadProducts();
    updateCartCount();
    renderProducts();
    renderProductDetail();
    renderCartPage();
    renderCheckoutSummary();
    renderAdminProducts();
  }

  async function verifyAdminSession() {
    const adminSection = document.getElementById('admin-productos');
    if (!adminSection) return;

    if (!backendAvailable) {
      adminAuthenticated = false;
      renderAdminAccess();
      return;
    }

    try {
      await apiRequest(`${API_ADMIN}?action=me`, { headers: adminHeaders() });
      adminAuthenticated = true;
    } catch (err) {
      adminAuthenticated = false;
    }

    renderAdminAccess();
  }

  function renderAdminAccess() {
    const adminSection = document.getElementById('admin-productos');
    const loginPanel = document.getElementById('adminLoginPanel');
    const workspace = document.getElementById('adminWorkspace');
    const state = document.getElementById('adminAccessState');
    const logoutButtons = document.querySelectorAll('[data-admin-logout]');
    if (!adminSection || !loginPanel || !workspace) return;

    adminSection.classList.toggle('is-authenticated', adminAuthenticated);
    loginPanel.hidden = adminAuthenticated;
    if (adminAuthenticated) {
      loginPanel.style.setProperty('display', 'none', 'important');
    } else {
      loginPanel.style.removeProperty('display');
    }
    workspace.hidden = !adminAuthenticated;
    logoutButtons.forEach((button) => {
      button.hidden = !adminAuthenticated;
    });
    if (state) {
      state.textContent = backendAvailable
        ? (adminAuthenticated ? 'Sesión de administrador activa' : 'Ingresa la contraseña de administrador')
        : 'Para administrar productos debes abrir la web desde el servidor backend';
    }
  }

  function renderAdminLoginPanel() {
    const loginPanel = document.getElementById('adminLoginPanel');
    if (!loginPanel || loginPanel.dataset.rendered === 'true') return;

    loginPanel.dataset.rendered = 'true';
    loginPanel.innerHTML = `
      <div class="admin-login__visual" aria-hidden="true">
        <div class="admin-login__visual-glow"></div>
        <img class="admin-login__visual-logo" src="/assets/logo-menu-megabyte.png" alt="">
        <div class="admin-login__device">
          <span class="admin-login__device-screen">MB</span>
        </div>
        <div class="admin-login__badge-card">
          <span>
            <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
              <path d="M6 8h12l-1 11H7L6 8Z"></path>
              <path d="M9 8a3 3 0 0 1 6 0"></path>
            </svg>
          </span>
          <strong>MEGABYTE</strong>
          <small>Tu tienda tecnologica de confianza</small>
        </div>
      </div>

      <div class="admin-login__panel">
        <div class="admin-login__hero">
          <span class="admin-login__shield">
            <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
              <path d="M12 3 5 6v5c0 4.6 2.9 8.5 7 10 4.1-1.5 7-5.4 7-10V6l-7-3Z"></path>
              <path d="M9.5 11V9.5a2.5 2.5 0 0 1 5 0V11"></path>
              <path d="M9 11h6v5H9z"></path>
            </svg>
          </span>
          <div>
            <span class="admin-login__eyebrow">Panel privado</span>
            <h2>Administracion<br><span>de productos</span></h2>
            <p>Accede al panel privado para gestionar tu catalogo, productos, precios, stock y disponibilidad.</p>
          </div>
        </div>

        <form class="admin-login__card" id="adminLoginForm">
          <div class="admin-login__form-title">
            <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"></path>
            </svg>
            <span>Acceso administrador</span>
          </div>
          <p class="store-admin__error" id="adminLoginError" hidden></p>
          <label class="admin-login__field">
            <span>Usuario</span>
            <div class="admin-login__input">
              <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"></path>
              </svg>
              <input name="username" type="text" autocomplete="username" placeholder="admin" required>
            </div>
          </label>
          <label class="admin-login__field">
            <span>Contrasena</span>
            <div class="admin-login__input">
              <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                <path d="M6 10V8a6 6 0 0 1 12 0v2"></path>
                <path d="M5 10h14v11H5z"></path>
              </svg>
              <input name="password" type="password" autocomplete="current-password" placeholder="Ingresa tu contrasena" required>
            </div>
          </label>
          <div class="admin-login__form-row">
            <label class="admin-login__remember">
              <input type="checkbox" checked>
              <span>Recordarme en este dispositivo</span>
            </label>
            <button class="admin-login__forgot" type="button">Olvidaste tu contrasena?</button>
          </div>
          <button class="btn btn--primary admin-login__submit" type="submit">
            <span>Iniciar sesion</span>
            <span class="admin-login__submit-arrow" aria-hidden="true">-&gt;</span>
          </button>
          <div class="admin-login__secure">
            <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
              <path d="M12 3 5 6v5c0 4.6 2.9 8.5 7 10 4.1-1.5 7-5.4 7-10V6l-7-3Z"></path>
              <path d="m9 12 2 2 4-5"></path>
            </svg>
            <div>
              <strong>Sesion segura y encriptada</strong>
              <small>Acceso exclusivo para administradores autorizados.</small>
            </div>
          </div>
        </form>
      </div>

    `;

    if (!document.getElementById('adminLoginCenterStyle')) {
      const style = document.createElement('style');
      style.id = 'adminLoginCenterStyle';
      style.textContent = `
        .store-admin__login[data-rendered='true'] {
          display: block !important;
        }
        .store-admin__login[data-rendered='true'] .admin-login__panel {
          position: relative !important;
          left: 50% !important;
          grid-column: auto !important;
          width: min(560px, calc(100vw - 2rem)) !important;
          margin: 0 !important;
          transform: translateX(-50%) !important;
        }
        .store-admin__login[data-rendered='true'] .admin-login__features {
          left: 50% !important;
          right: auto !important;
          width: min(1320px, calc(100vw - 2.4rem)) !important;
          transform: translateX(-50%) !important;
        }
        @media (max-width: 680px) {
          .store-admin__login[data-rendered='true'] .admin-login__panel,
          .store-admin__login[data-rendered='true'] .admin-login__features {
            width: calc(100vw - 2rem) !important;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  function formatPrice(value) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(value);
  }

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (err) {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
  }

  function getProduct(id) {
    return getProducts().find((product) => product.id === id);
  }

  function addToCart(productId, quantity) {
    const product = getProduct(productId);
    if (!product) return;

    const cart = getCart();
    const qty = Math.max(1, Number(quantity) || 1);
    const item = cart.find((entry) => entry.id === productId);

    if (item) {
      item.quantity += qty;
    } else {
      cart.push({ id: productId, quantity: qty });
    }

    saveCart(cart);
    showStoreNotice(`${product.name} agregado al carrito`);
  }

  function removeFromCart(productId) {
    saveCart(getCart().filter((item) => item.id !== productId));
    renderCartPage();
    renderCheckoutSummary();
  }

  function updateQuantity(productId, quantity) {
    const qty = Math.max(1, Number(quantity) || 1);
    const cart = getCart().map((item) => (
      item.id === productId ? { ...item, quantity: qty } : item
    ));
    saveCart(cart);
    renderCartPage();
    renderCheckoutSummary();
  }

  function cartWithProducts() {
    return getCart()
      .map((item) => ({ ...item, product: getProduct(item.id) }))
      .filter((item) => item.product);
  }

  function cartTotal() {
    return cartWithProducts().reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }

  function updateCartCount() {
    const count = getCart().reduce((sum, item) => sum + item.quantity, 0);
    const total = cartTotal();
    document.querySelectorAll('[data-cart-count]').forEach((node) => {
      node.textContent = String(count);
      node.hidden = count === 0;
    });
    document.querySelectorAll('[data-cart-total]').forEach((node) => {
      node.textContent = formatPrice(total);
    });
  }

  function productIcon(type) {
    const icons = {
      laptop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.35"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M2 20h20M8 16v4M16 16v4"/></svg>',
      desktop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.35"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/><path d="M7 8h3M14 8h3M7 11h10"/></svg>',
      audio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.35"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3v5zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3v5z"/></svg>',
      camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.35"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>',
      drive: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.35"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h8M8 17h.01M12 17h4"/></svg>',
      router: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.35"><rect x="3" y="11" width="18" height="8" rx="2"/><path d="M7 15h.01M11 15h.01M17 11V7M7 7c3.3-2.2 6.7-2.2 10 0M10 9c1.4-.8 2.6-.8 4 0"/></svg>'
    };
    return icons[type] || icons.laptop;
  }

  function productCard(product) {
    return `
      <article class="product-card" data-category="${product.category}">
        <a href="producto.html?id=${product.id}" class="product-card__media" aria-label="Ver ${product.name}">
          <span class="product-card__badge">${product.discount}% OFF</span>
          <span class="product-card__stock">${product.stock > 0 ? 'En stock' : 'Agotado'}</span>
          ${productIcon(product.imageType)}
        </a>
        <div class="product-card__body">
          <div class="product-card__eyebrow">
            <span>${product.brand}</span>
            <span class="product-card__rating">★ ${product.rating}</span>
          </div>
          <h3>${product.name}</h3>
          <p>${product.shortDescription}</p>
          <div class="product-card__prices">
            <strong>${formatPrice(product.price)}</strong>
            <span>${formatPrice(product.oldPrice)}</span>
          </div>
        </div>
        <div class="product-card__actions">
          <button class="btn btn--primary btn--sm" type="button" data-add-cart="${product.id}">Agregar al carrito</button>
          <a class="btn btn--outline btn--sm" href="producto.html?id=${product.id}">Ver detalle</a>
        </div>
      </article>
    `;
  }

  function renderProducts() {
    const grid = document.getElementById('productGrid');
    if (!grid) return;

    const search = document.getElementById('storeSearch');
    const sort = document.getElementById('storeSort');
    const activeCategory = document.querySelector('.store-category.is-active')?.dataset.category || 'todos';
    const query = (search?.value || '').toLowerCase().trim();
    const sortValue = sort?.value || 'featured';

    let products = getProducts().filter((product) => {
      const matchesCategory = activeCategory === 'todos' || product.category === activeCategory;
      const haystack = `${product.name} ${product.brand} ${product.category} ${product.shortDescription}`.toLowerCase();
      return matchesCategory && haystack.includes(query);
    });

    if (sortValue === 'price-asc') products = products.sort((a, b) => a.price - b.price);
    if (sortValue === 'price-desc') products = products.sort((a, b) => b.price - a.price);
    if (sortValue === 'discount') products = products.sort((a, b) => b.discount - a.discount);

    grid.innerHTML = products.length
      ? products.map(productCard).join('')
      : '<p class="store-empty">No encontramos productos con esos filtros.</p>';
  }

  function renderProductDetail() {
    const detail = document.getElementById('productDetail');
    if (!detail) return;

    const params = new URLSearchParams(window.location.search);
    const products = getProducts();
    const product = getProduct(params.get('id')) || products[0];

    if (!product) {
      detail.innerHTML = '<div class="store-empty">No hay productos disponibles en el catálogo.</div>';
      return;
    }

    document.title = `${product.name} | Megabyte`;
    detail.innerHTML = `
      <div class="product-detail__gallery">
        <div class="product-detail__image">${productIcon(product.imageType)}</div>
        <div class="product-detail__thumbs">
          <span>${productIcon(product.imageType)}</span>
          <span>${productIcon(product.imageType)}</span>
          <span>${productIcon(product.imageType)}</span>
        </div>
      </div>
      <div class="product-detail__info">
        <span class="product-detail__badge">${product.badge}</span>
        <h1>${product.name}</h1>
        <div class="product-detail__rating">★ ${product.rating} · ${product.availability}</div>
        <div class="product-detail__prices">
          <strong>${formatPrice(product.price)}</strong>
          <span>${formatPrice(product.oldPrice)}</span>
          <em>${product.discount}% OFF</em>
        </div>
        <p>${product.description}</p>
        <div class="product-detail__buy">
          <label for="productQty">Cantidad</label>
          <input id="productQty" type="number" min="1" max="${product.stock}" value="1">
          <button class="btn btn--primary" type="button" data-add-detail="${product.id}">Agregar al carrito</button>
          <a class="btn btn--whatsapp" target="_blank" rel="noopener noreferrer" href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hola, quiero comprar ${product.name}`)}">Comprar por WhatsApp</a>
        </div>
        <div class="product-detail__meta">
          <div><strong>Garantía</strong><span>${product.warranty}</span></div>
          <div><strong>Disponibilidad</strong><span>${product.availability}</span></div>
        </div>
        <div class="product-detail__specs">
          <h2>Especificaciones técnicas</h2>
          <ul>${product.specs.map((spec) => `<li>${spec}</li>`).join('')}</ul>
        </div>
      </div>
    `;

    const related = document.getElementById('relatedProducts');
    if (related) {
      related.innerHTML = products
        .filter((item) => item.id !== product.id)
        .slice(0, 3)
        .map(productCard)
        .join('');
    }
  }

  function productAdminRow(product) {
    return `
      <article class="store-admin__item">
        <div class="store-admin__icon">${productIcon(product.imageType)}</div>
        <div>
          <span>${product.category} · ${product.brand}</span>
          <strong>${product.name}</strong>
          <small>${formatPrice(product.price)} · Stock ${product.stock}</small>
        </div>
        <div class="store-admin__item-actions">
          <button type="button" class="btn btn--outline btn--sm" data-edit-product="${product.id}">Editar</button>
          <button type="button" class="btn btn--outline btn--sm" data-delete-product="${product.id}">Eliminar</button>
        </div>
      </article>
    `;
  }

  function renderAdminProducts() {
    const list = document.getElementById('adminProductList');
    const total = document.getElementById('adminProductTotal');
    if (!list) return;

    const products = getProducts();
    list.innerHTML = products.length
      ? products.map(productAdminRow).join('')
      : '<div class="store-empty">No hay productos creados todavía.</div>';
    if (total) total.textContent = `${products.length} productos`;
  }

  function productToForm(product) {
    const form = document.getElementById('adminProductForm');
    if (!form || !product) return;

    form.elements.productId.value = product.id;
    form.elements.name.value = product.name;
    form.elements.brand.value = product.brand;
    form.elements.category.value = product.category;
    form.elements.price.value = product.price;
    form.elements.oldPrice.value = product.oldPrice;
    form.elements.stock.value = product.stock;
    form.elements.rating.value = product.rating;
    form.elements.badge.value = product.badge;
    form.elements.imageType.value = product.imageType;
    form.elements.availability.value = product.availability;
    form.elements.warranty.value = product.warranty;
    form.elements.shortDescription.value = product.shortDescription;
    form.elements.description.value = product.description;
    form.elements.specs.value = product.specs.join('\n');
    form.querySelector('[data-admin-submit]').textContent = 'Guardar cambios';
    document.getElementById('adminFormTitle').textContent = 'Editar producto';
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function resetAdminForm() {
    const form = document.getElementById('adminProductForm');
    if (!form) return;
    form.reset();
    form.elements.productId.value = '';
    form.elements.rating.value = '4.8';
    form.elements.stock.value = '1';
    form.elements.category.value = 'computadores';
    form.elements.imageType.value = 'laptop';
    form.querySelector('[data-admin-submit]').textContent = 'Agregar producto';
    document.getElementById('adminFormTitle').textContent = 'Nuevo producto';
  }

  function productFromForm(form) {
    const data = new FormData(form);
    const name = data.get('name');
    const currentId = data.get('productId');

    return normalizeProduct({
      id: currentId || slugify(name),
      name,
      brand: data.get('brand'),
      category: data.get('category'),
      price: data.get('price'),
      oldPrice: data.get('oldPrice'),
      stock: data.get('stock'),
      rating: data.get('rating'),
      badge: data.get('badge'),
      imageType: data.get('imageType'),
      availability: data.get('availability'),
      warranty: data.get('warranty'),
      shortDescription: data.get('shortDescription'),
      description: data.get('description'),
      specs: data.get('specs')
    });
  }

  async function saveProductFromAdmin(form) {
    const product = productFromForm(form);
    const isEditing = Boolean(form.elements.productId.value);

    if (!product.name || !product.price) {
      showStoreNotice('Completa nombre y precio del producto');
      return;
    }

    if (!adminAuthenticated) {
      showStoreNotice('Inicia sesión como administrador');
      return;
    }

    try {
      const endpoint = isEditing
        ? `${API_ADMIN}?action=product&id=${encodeURIComponent(product.id)}`
        : `${API_ADMIN}?action=products`;
      await apiRequest(endpoint, {
        method: isEditing ? 'PUT' : 'POST',
        headers: adminHeaders(),
        body: JSON.stringify(product)
      });
      resetAdminForm();
      await refreshProducts();
      showStoreNotice('Producto guardado');
    } catch (err) {
      showStoreNotice(err.message || 'No se pudo guardar');
    }
  }

  async function deleteProduct(productId) {
    if (!adminAuthenticated) {
      showStoreNotice('Inicia sesión como administrador');
      return;
    }

    try {
      await apiRequest(`${API_ADMIN}?action=product&id=${encodeURIComponent(productId)}`, {
        method: 'DELETE',
        headers: adminHeaders()
      });
      saveCart(getCart().filter((item) => item.id !== productId));
      await refreshProducts();
      showStoreNotice('Producto eliminado');
    } catch (err) {
      showStoreNotice(err.message || 'No se pudo eliminar');
    }
  }

  async function resetProductsToDefaults() {
    if (!adminAuthenticated) {
      showStoreNotice('Inicia sesión como administrador');
      return;
    }

    try {
      await apiRequest(`${API_ADMIN}?action=restore`, {
        method: 'POST',
        headers: adminHeaders()
      });
      resetAdminForm();
      await refreshProducts();
      showStoreNotice('Catálogo restaurado');
    } catch (err) {
      showStoreNotice(err.message || 'No se pudo restaurar');
    }
    showStoreNotice('Catálogo restaurado');
  }

  function cartItemTemplate(item) {
    const { product, quantity } = item;
    return `
      <article class="cart-item">
        <div class="cart-item__image">${productIcon(product.imageType)}</div>
        <div class="cart-item__info">
          <span>${product.brand}</span>
          <h3>${product.name}</h3>
          <p>${formatPrice(product.price)}</p>
        </div>
        <div class="cart-item__qty">
          <label for="qty-${product.id}">Cantidad</label>
          <input id="qty-${product.id}" type="number" min="1" value="${quantity}" data-cart-qty="${product.id}">
        </div>
        <strong>${formatPrice(product.price * quantity)}</strong>
        <button class="cart-item__remove" type="button" data-remove-cart="${product.id}">Eliminar</button>
      </article>
    `;
  }

  function renderCartPage() {
    const cartItems = document.getElementById('cartItems');
    const subtotal = document.getElementById('cartSubtotal');
    const total = document.getElementById('cartTotal');
    if (!cartItems) return;

    const items = cartWithProducts();
    cartItems.innerHTML = items.length
      ? items.map(cartItemTemplate).join('')
      : '<div class="store-empty">Tu carrito está vacío.</div>';

    const totalValue = cartTotal();
    if (subtotal) subtotal.textContent = formatPrice(totalValue);
    if (total) total.textContent = formatPrice(totalValue);
  }

  function renderCheckoutSummary() {
    const summary = document.getElementById('checkoutSummary');
    const total = document.getElementById('checkoutTotal');
    if (!summary) return;

    const items = cartWithProducts();
    summary.innerHTML = items.length
      ? items.map((item) => `
          <div class="checkout-summary__item">
            <span>${item.quantity}x ${item.product.name}</span>
            <strong>${formatPrice(item.product.price * item.quantity)}</strong>
          </div>
        `).join('')
      : '<p class="store-empty">No hay productos en el carrito.</p>';

    if (total) total.textContent = formatPrice(cartTotal());
  }

  function generateWhatsAppMessage(form) {
    const data = new FormData(form);
    const items = cartWithProducts();
    const lines = items.map((item) => `- ${item.quantity}x ${item.product.name}: ${formatPrice(item.product.price * item.quantity)}`);
    return [
      'Hola Megabyte, quiero finalizar este pedido:',
      '',
      ...lines,
      '',
      `Total: ${formatPrice(cartTotal())}`,
      '',
      `Nombre: ${data.get('nombre')}`,
      `Celular: ${data.get('celular')}`,
      `Correo: ${data.get('correo')}`,
      `Dirección: ${data.get('direccion')}`,
      `Ciudad: ${data.get('ciudad')}`,
      `Entrega: ${data.get('entrega')}`,
      `Observaciones: ${data.get('observaciones') || 'Sin observaciones'}`
    ].join('\n');
  }

  function showStoreNotice(message) {
    let notice = document.querySelector('.store-notice');
    if (!notice) {
      notice = document.createElement('div');
      notice.className = 'store-notice';
      document.body.appendChild(notice);
    }
    notice.textContent = message;
    notice.classList.add('is-visible');
    window.setTimeout(() => notice.classList.remove('is-visible'), 2200);
  }

  function bindStoreEvents() {
    document.addEventListener('click', async (event) => {
      const category = event.target.closest('.store-category');
      if (category) {
        document.querySelectorAll('.store-category').forEach((node) => node.classList.remove('is-active'));
        category.classList.add('is-active');
        const categorySelect = document.querySelector('.store-category-select select');
        if (categorySelect && [...categorySelect.options].some((option) => option.value === category.dataset.category)) {
          categorySelect.value = category.dataset.category;
        }
        renderProducts();
      }

      const categoryLink = event.target.closest('[data-category-link]');
      if (categoryLink) {
        const selectedCategory = categoryLink.dataset.categoryLink;
        document.querySelectorAll('.store-category').forEach((node) => {
          node.classList.toggle('is-active', node.dataset.category === selectedCategory);
        });
        const categorySelect = document.querySelector('.store-category-select select');
        if (categorySelect && [...categorySelect.options].some((option) => option.value === selectedCategory)) {
          categorySelect.value = selectedCategory;
        }
        renderProducts();
      }

      const addButton = event.target.closest('[data-add-cart]');
      if (addButton) addToCart(addButton.dataset.addCart, 1);

      const detailButton = event.target.closest('[data-add-detail]');
      if (detailButton) {
        const qty = document.getElementById('productQty')?.value || 1;
        addToCart(detailButton.dataset.addDetail, qty);
      }

      const removeButton = event.target.closest('[data-remove-cart]');
      if (removeButton) removeFromCart(removeButton.dataset.removeCart);

      const editProductButton = event.target.closest('[data-edit-product]');
      if (editProductButton) productToForm(getProduct(editProductButton.dataset.editProduct));

      const deleteProductButton = event.target.closest('[data-delete-product]');
      if (deleteProductButton) await deleteProduct(deleteProductButton.dataset.deleteProduct);

      const resetAdminButton = event.target.closest('[data-admin-reset]');
      if (resetAdminButton) resetAdminForm();

      const restoreProductsButton = event.target.closest('[data-admin-restore]');
      if (restoreProductsButton) await resetProductsToDefaults();

      const logoutButton = event.target.closest('[data-admin-logout]');
      if (logoutButton) {
        adminAuthenticated = false;
        await apiRequest(`${API_ADMIN}?action=logout`, { method: 'POST' }).catch(() => {});
        renderAdminAccess();
        resetAdminForm();
        showStoreNotice('Sesión cerrada');
      }
    });

    document.addEventListener('input', (event) => {
      if (event.target.matches('#storeSearch, #storeSort')) renderProducts();
      if (event.target.matches('[data-cart-qty]')) updateQuantity(event.target.dataset.cartQty, event.target.value);
    });

    document.addEventListener('change', (event) => {
      if (!event.target.matches('.store-category-select select')) return;

      const selectedCategory = event.target.value;
      document.querySelectorAll('.store-category').forEach((node) => {
        node.classList.toggle('is-active', node.dataset.category === selectedCategory);
      });
      renderProducts();
    });

    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
      checkoutForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!cartWithProducts().length) {
          showStoreNotice('Agrega productos antes de finalizar');
          return;
        }
        const message = encodeURIComponent(generateWhatsAppMessage(checkoutForm));
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
      });
    }

    const adminForm = document.getElementById('adminProductForm');
    if (adminForm) {
      adminForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        await saveProductFromAdmin(adminForm);
      });
    }

    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
      adminLoginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const loginError = document.getElementById('adminLoginError');
        if (loginError) {
          loginError.hidden = true;
          loginError.textContent = '';
        }
        if (!backendAvailable) {
          showStoreNotice('Abre la tienda desde el servidor backend');
          return;
        }

        try {
          const formData = new FormData(adminLoginForm);
          await apiRequest(`${API_ADMIN}?action=login`, {
            method: 'POST',
            body: JSON.stringify({
              username: formData.get('username') || 'admin',
              password: formData.get('password') || ''
            })
          });
          adminAuthenticated = true;
          adminLoginForm.reset();
          renderAdminAccess();
          renderAdminProducts();
          showStoreNotice('Administrador conectado');
        } catch (err) {
          if (loginError) {
            loginError.textContent = err.message || 'Usuario o contrasena incorrectos';
            loginError.hidden = false;
          }
          showStoreNotice(err.message || 'Contraseña incorrecta');
        }
      });
    }
  }

  async function initStore() {
    renderAdminLoginPanel();
    await loadProducts();
    updateCartCount();
    renderProducts();
    renderProductDetail();
    renderCartPage();
    renderCheckoutSummary();
    renderAdminProducts();
    renderAdminAccess();
    bindStoreEvents();
    await verifyAdminSession();
  }

  window.MegabyteStore = {
    products: getProducts,
    addToCart,
    getCart,
    getProducts,
    removeFromCart,
    updateQuantity,
    resetProductsToDefaults
  };

  function bootStore() {
    initStore().catch((err) => console.warn('No se pudo iniciar la tienda:', err));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootStore, { once: true });
  } else {
    bootStore();
  }
})();
