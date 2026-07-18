(function () {
  'use strict';

  const WHATSAPP_NUMBER = '573133141701';
  const CART_KEY = 'megabyte_store_cart';
  const API_PRODUCTS = '/api/products.php';
  const API_ADMIN = '/admin/api.php';
  const API_ADMIN_TRACKING = '/admin/tracking-api.php';
  const VIEWED_TICKETS_KEY = 'megabyte_admin_viewed_tickets';
  let productsCache = [];
  let ticketsCache = [];
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
      description: 'Laptop HP reacondicionada por Megabyte, con mantenimiento preventivo, limpieza interna, pruebas de rendimiento y sistema listo para usar.',
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
    let imageUrls = product.imageUrls || [];

    if (typeof imageUrls === 'string') {
      try {
        const parsed = JSON.parse(imageUrls);
        imageUrls = Array.isArray(parsed) ? parsed : imageUrls;
      } catch (error) {
        imageUrls = imageUrls.split(/[\n,]+/);
      }
    }

    if (!Array.isArray(imageUrls)) imageUrls = [];
    imageUrls = [...new Set(imageUrls.map((url) => String(url || '').trim()).filter(Boolean))];

    const imageUrl = String(product.imageUrl || '').trim();
    if (imageUrl && !imageUrls.includes(imageUrl)) imageUrls.unshift(imageUrl);

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
      imageUrl: imageUrls[0] || '',
      imageUrls,
      isPublished: !(product.isPublished === false || product.isPublished === 0 || product.isPublished === '0' || product.isPublished === 'false'),
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

  function isProductPublished(product) {
    return product?.isPublished !== false;
  }

  function publicProducts() {
    return getProducts().filter(isProductPublished);
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
      const endpoint = adminAuthenticated && document.getElementById('admin-productos')
        ? `${API_ADMIN}?action=products`
        : API_PRODUCTS;
      const payload = await apiRequest(endpoint);
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
    if (adminAuthenticated) {
      await loadProducts();
      renderAdminProducts();
      await loadAdminTickets();
      resetTicketForm();
    }
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
    if (adminAuthenticated && !document.querySelector('.store-admin__screen.is-active')) {
      showAdminScreen('create');
    }
    if (!adminAuthenticated) {
      document.querySelectorAll('.store-admin__screen').forEach((screen) => {
        screen.hidden = true;
        screen.classList.remove('is-active');
      });
    }
    logoutButtons.forEach((button) => {
      button.hidden = !adminAuthenticated;
    });
    if (state) {
      state.textContent = backendAvailable
        ? (adminAuthenticated ? 'Sesión de administrador activa' : 'Ingresa la contraseña de administrador')
        : 'Para administrar productos debes abrir la web desde el servidor backend';
    }
  }

  function showAdminScreen(screenName) {
    const targetName = screenName || 'create';
    document.querySelectorAll('[data-admin-screen]').forEach((screen) => {
      const isActive = screen.dataset.adminScreen === targetName;
      screen.hidden = !isActive;
      screen.classList.toggle('is-active', isActive);
    });
    document.querySelectorAll('[data-admin-screen-target]').forEach((button) => {
      button.classList.toggle('is-active', button.dataset.adminScreenTarget === targetName);
    });
    if (targetName === 'tickets') markAdminTicketsAsViewed();
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
            <h2>Administracion <span>de productos</span></h2>
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

      <div class="admin-login__features">
        <span><strong>Catalogo centralizado</strong><small>Gestiona tus productos desde un solo lugar.</small></span>
        <span><strong>Datos en tiempo real</strong><small>Controla stock, precios y disponibilidad al instante.</small></span>
        <span><strong>Seguridad avanzada</strong><small>Acceso privado para administradores autorizados.</small></span>
        <span><strong>MEGABYTE STORE</strong><small>Panel privado 2026</small></span>
      </div>

    `;
  }

  function formatPrice(value) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(value);
  }

  function currencyInputToNumber(value) {
    return Number(String(value || '').replace(/[^\d]/g, '')) || 0;
  }

  function formatCurrencyInput(input) {
    if (!input) return;
    const value = currencyInputToNumber(input.value);
    input.value = value ? formatPrice(value) : '';
  }

  function parseWarranty(value) {
    const text = String(value || '').toLowerCase();
    const match = text.match(/(\d+)\s*(dia|dias|mes|meses|año|años|ano|anos)/i);
    if (!match) {
      return { value: '', unit: 'dias' };
    }

    const rawUnit = match[2]
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    const unit = rawUnit.startsWith('mes') ? 'meses' : rawUnit.startsWith('ano') ? 'anos' : 'dias';
    return { value: match[1], unit };
  }

  function warrantyFromForm(form) {
    const value = Math.max(0, Number(form.elements.warrantyValue?.value) || 0);
    const unit = form.elements.warrantyUnit?.value || 'dias';
    if (!value) return 'Garantia segun condiciones del producto.';

    const labels = {
      dias: value === 1 ? 'dia' : 'dias',
      meses: value === 1 ? 'mes' : 'meses',
      anos: value === 1 ? 'año' : 'años'
    };
    return `Garantia de ${value} ${labels[unit] || 'dias'}.`;
  }

  function conditionFromBadge(value) {
    const text = String(value || '').toLowerCase();
    if (text.includes('reacondicionado') || text.includes('certificado')) return 'Reacondicionado';
    if (text.includes('usado')) return 'Usado';
    return 'Nuevo';
  }

  function setCheckedValue(group, value) {
    const fields = Array.isArray(group) || group instanceof NodeList || group instanceof RadioNodeList
      ? Array.from(group)
      : [group].filter(Boolean);
    const normalizedValue = String(value || '');
    fields.forEach((field) => {
      field.checked = field.value === normalizedValue;
    });
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
    if (!product || !isProductPublished(product)) {
      showStoreNotice('Este producto no esta disponible en la tienda');
      return;
    }

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
      .filter((item) => item.product && isProductPublished(item.product));
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

  function productImages(product) {
    const gallery = Array.isArray(product.imageUrls) ? product.imageUrls : [];
    return [...new Set([...(gallery || []), product.imageUrl].map((url) => String(url || '').trim()).filter(Boolean))];
  }

  function productVisual(product, className = 'product-image', imageUrl = '') {
    const visualUrl = imageUrl || productImages(product)[0] || '';
    if (visualUrl) {
      return `<img class="${className}" src="${visualUrl}" alt="${product.name}" loading="lazy">`;
    }

    return productIcon(product.imageType);
  }

  function updateAdminImagePreview(form) {
    const preview = form?.querySelector('[data-product-image-preview]');
    if (!preview) return;

    let imageUrls = [];
    try {
      imageUrls = JSON.parse(form.elements.imageUrls?.value || '[]');
    } catch (error) {
      imageUrls = [];
    }

    const imageUrl = form.elements.imageUrl?.value || '';
    if (imageUrl && !imageUrls.includes(imageUrl)) imageUrls.unshift(imageUrl);

    if (imageUrls.length) {
      preview.innerHTML = imageUrls
        .slice(0, 6)
        .map((url, index) => adminImagePreviewTile(`<img src="${url}" alt="Vista previa del producto">`, `data-preview-url="${url}"`, index === 0))
        .join('') + adminImageSelectTile();
      preview.classList.add('has-image');
      return;
    }

    preview.innerHTML = adminImageSelectTile();
    preview.classList.remove('has-image');
  }

  function adminImagePreviewTile(content, attrs = '', isCover = false) {
    return `
      <div class="store-admin__image-tile ${isCover ? 'is-cover' : ''}" draggable="true" ${attrs}>
        ${content}
        <span>Portada</span>
      </div>
    `;
  }

  function adminImageSelectTile() {
    return `
      <button class="store-admin__image-select" type="button" data-product-image-pick>
        <span>Seleccionar</span>
      </button>
    `;
  }

  function syncAdminImageOrder(preview) {
    const form = preview?.closest('form');
    if (!form) return;

    const tiles = Array.from(preview.querySelectorAll('[data-preview-url], [data-preview-file-index]'));
    tiles.forEach((tile, index) => {
      tile.classList.toggle('is-cover', index === 0);
    });

    const savedUrls = tiles.map((tile) => tile.dataset.previewUrl).filter(Boolean);
    if (savedUrls.length) {
      form.elements.imageUrls.value = JSON.stringify(savedUrls);
      form.elements.imageUrl.value = savedUrls[0] || '';
    }

    const visibleFileOrder = tiles
      .map((tile) => Number(tile.dataset.previewFileIndex))
      .filter((index) => Number.isInteger(index));
    const allFileIndexes = Array.isArray(form.__allPendingFileIndexes) ? form.__allPendingFileIndexes : visibleFileOrder;
    form.__pendingImageOrder = [
      ...visibleFileOrder,
      ...allFileIndexes.filter((index) => !visibleFileOrder.includes(index))
    ];
  }

  function moveAdminImageTile(targetTile, pointerX, pointerY) {
    const preview = targetTile?.parentElement;
    const draggingTile = preview?.querySelector('.store-admin__image-tile.is-dragging');
    if (!preview || !draggingTile || draggingTile === targetTile) return;

    const bounds = targetTile.getBoundingClientRect();
    const insertAfter = pointerY > bounds.top + bounds.height / 2 || pointerX > bounds.left + bounds.width / 2;
    preview.insertBefore(draggingTile, insertAfter ? targetTile.nextSibling : targetTile);
    syncAdminImageOrder(preview);
  }

  function productCard(product) {
    return `
      <article class="product-card" data-category="${product.category}">
        <a href="/producto?id=${product.id}" class="product-card__media" aria-label="Ver ${product.name}">
          <span class="product-card__badge">${product.discount}% OFF</span>
          <span class="product-card__stock">${product.stock > 0 ? 'En stock' : 'Agotado'}</span>
          ${productVisual(product, 'product-card__image')}
        </a>
        <div class="product-card__body">
          <div class="product-card__eyebrow">
            <span>${product.brand}</span>
            <span class="product-card__condition">${conditionFromBadge(product.badge)}</span>
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
          <a class="btn btn--outline btn--sm" href="/producto?id=${product.id}">Ver detalle</a>
        </div>
      </article>
    `;
  }

  function renderProducts() {
    const grid = document.getElementById('productGrid');
    if (!grid) return;

    const search = document.getElementById('storeSearch');
    const sort = document.getElementById('storeSort');
    const selectedCategory = document.querySelector('.store-category-select select')?.value;
    const activeCategory = selectedCategory
      || document.querySelector('[data-category-link].is-active')?.dataset.categoryLink
      || document.querySelector('.store-category.is-active')?.dataset.category
      || 'todos';
    const query = (search?.value || '').toLowerCase().trim();
    const sortValue = sort?.value || 'featured';

    let products = publicProducts().filter((product) => {
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
    const products = publicProducts();
    const requestedProduct = getProduct(params.get('id'));
    const product = requestedProduct && isProductPublished(requestedProduct) ? requestedProduct : products[0];

    if (!product) {
      detail.innerHTML = '<div class="store-empty">No hay productos disponibles en el catálogo.</div>';
      return;
    }

    document.title = `${product.name} | Megabyte`;
    const galleryImages = productImages(product);
    const mainGalleryImage = galleryImages[0] || '';
    const galleryThumbs = galleryImages.length
      ? galleryImages
          .map((imageUrl, index) => `
            <button type="button" class="${index === 0 ? 'is-active' : ''}" data-gallery-image="${imageUrl}" aria-label="Ver foto ${index + 1} de ${product.name}">
              ${productVisual(product, 'product-detail__thumb-photo', imageUrl)}
            </button>
          `)
          .join('')
      : `
        <span>${productIcon(product.imageType)}</span>
        <span>${productIcon(product.imageType)}</span>
        <span>${productIcon(product.imageType)}</span>
      `;

    detail.innerHTML = `
      <div class="product-detail__gallery">
        <a class="product-detail__back" href="/tienda">Volver al listado</a>
        <div class="product-detail__image" data-gallery-main>
          ${productVisual(product, 'product-detail__photo', mainGalleryImage)}
        </div>
        <div class="product-detail__thumbs">
          ${galleryThumbs}
        </div>
      </div>
      <div class="product-detail__info">
        <span class="product-detail__badge">${product.badge}</span>
        <h1>${product.name}</h1>
        <div class="product-detail__availability">${product.availability}</div>
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
        <div class="store-admin__icon">${productVisual(product, 'store-admin__thumb')}</div>
        <div>
          <span>${product.category} · ${product.brand}</span>
          <strong>${product.name}</strong>
          <small>${formatPrice(product.price)} · Stock ${product.stock}</small>
        </div>
        <label class="store-admin__publish-toggle">
          <span>${product.isPublished ? 'Publicada' : 'Pausada'}</span>
          <input type="checkbox" data-toggle-product-published="${product.id}" ${product.isPublished ? 'checked' : ''}>
          <i aria-hidden="true"></i>
        </label>
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

    showAdminScreen('create');
    form.elements.productId.value = product.id;
    form.elements.name.value = product.name;
    form.elements.brand.value = product.brand;
    form.elements.category.value = product.category;
    form.elements.price.value = formatPrice(product.price);
    form.elements.oldPrice.value = product.oldPrice ? formatPrice(product.oldPrice) : '';
    form.elements.stock.value = product.stock;
    setCheckedValue(form.elements.badge, conditionFromBadge(product.badge));
    form.elements.imageType.value = product.imageType;
    form.elements.imageUrl.value = product.imageUrl || '';
    form.elements.imageUrls.value = JSON.stringify(productImages(product));
    form.__allPendingFileIndexes = [];
    form.__pendingImageOrder = [];
    if (form.elements.productImage) form.elements.productImage.value = '';
    form.elements.availability.value = product.availability;
    if (form.elements.isPublished) form.elements.isPublished.value = product.isPublished ? '1' : '0';
    const warranty = parseWarranty(product.warranty);
    form.elements.warranty.value = product.warranty;
    if (form.elements.warrantyValue) form.elements.warrantyValue.value = warranty.value;
    if (form.elements.warrantyUnit) form.elements.warrantyUnit.value = warranty.unit;
    form.elements.shortDescription.value = product.shortDescription;
    form.elements.description.value = product.description;
    form.elements.specs.value = product.specs.join('\n');
    form.querySelector('[data-admin-submit]').textContent = 'Guardar cambios';
    document.getElementById('adminFormTitle').textContent = 'Editar producto';
    updateAdminImagePreview(form);
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function resetAdminForm() {
    const form = document.getElementById('adminProductForm');
    if (!form) return;
    form.reset();
    form.elements.productId.value = '';
    form.elements.price.value = '';
    form.elements.oldPrice.value = '';
    form.elements.stock.value = '1';
    form.elements.category.value = 'computadores';
    form.elements.imageType.value = 'laptop';
    setCheckedValue(form.elements.badge, 'Nuevo');
    form.elements.imageUrl.value = '';
    form.elements.imageUrls.value = '[]';
    form.__allPendingFileIndexes = [];
    form.__pendingImageOrder = [];
    if (form.elements.isPublished) form.elements.isPublished.value = '1';
    if (form.elements.warranty) form.elements.warranty.value = '';
    if (form.elements.warrantyValue) form.elements.warrantyValue.value = '';
    if (form.elements.warrantyUnit) form.elements.warrantyUnit.value = 'dias';
    if (form.elements.productImage) form.elements.productImage.value = '';
    updateAdminImagePreview(form);
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
      price: currencyInputToNumber(data.get('price')),
      oldPrice: currencyInputToNumber(data.get('oldPrice')),
      stock: data.get('stock'),
      rating: 0,
      badge: data.get('badge'),
      imageType: data.get('imageType'),
      imageUrl: data.get('imageUrl'),
      imageUrls: data.get('imageUrls'),
      availability: data.get('availability'),
      isPublished: data.get('isPublished') !== '0',
      warranty: warrantyFromForm(form),
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
      const uploadedImageUrls = await uploadProductImages(form);
      if (uploadedImageUrls.length) {
        product.imageUrls = [...new Set([...productImages(product), ...uploadedImageUrls])];
        product.imageUrl = product.imageUrls[0] || '';
        form.elements.imageUrl.value = product.imageUrl;
        form.elements.imageUrls.value = JSON.stringify(product.imageUrls);
      }

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
      if (isEditing) showAdminScreen('edit');
      showStoreNotice('Producto guardado');
    } catch (err) {
      showStoreNotice(err.message || 'No se pudo guardar');
    }
  }

  async function uploadProductImages(form) {
    const input = form.elements.productImage;
    let files = Array.from(input?.files || []);
    if (!files.length) return [];

    if (files.some((file) => file.size > 4 * 1024 * 1024)) {
      throw new Error('Cada imagen debe pesar maximo 4 MB');
    }

    if (Array.isArray(form.__pendingImageOrder) && form.__pendingImageOrder.length) {
      files = form.__pendingImageOrder
        .map((index) => files[index])
        .filter(Boolean);
    }

    const data = new FormData();
    files.forEach((file) => {
      data.append('images[]', file);
    });

    const response = await fetch(`${API_ADMIN}?action=upload-image`, {
      method: 'POST',
      body: data,
      credentials: 'same-origin'
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload.error || 'No se pudo subir la imagen');
    }

    if (Array.isArray(payload.imageUrls)) return payload.imageUrls.filter(Boolean);
    return payload.imageUrl ? [payload.imageUrl] : [];
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

  async function toggleProductPublication(productId, isPublished) {
    if (!adminAuthenticated) {
      showStoreNotice('Inicia sesiÃ³n como administrador');
      return;
    }

    const product = getProduct(productId);
    if (!product) {
      showStoreNotice('Producto no encontrado');
      return;
    }

    try {
      await apiRequest(`${API_ADMIN}?action=product&id=${encodeURIComponent(productId)}`, {
        method: 'PUT',
        headers: adminHeaders(),
        body: JSON.stringify({ ...product, isPublished })
      });
      await refreshProducts();
      showStoreNotice(isPublished ? 'Producto publicado' : 'Producto pausado');
    } catch (err) {
      showStoreNotice(err.message || 'No se pudo cambiar la publicacion');
      await refreshProducts();
    }
  }


  function normalizeTicket(ticket) {
    return {
      ticket: String(ticket.ticket || '').trim().toUpperCase(),
      cliente: String(ticket.cliente || 'Cliente').trim(),
      telefono: String(ticket.telefono || '').trim(),
      servicio: String(ticket.servicio || 'Servicio tecnico').trim(),
      estado: String(ticket.estado || 'Recibido').trim(),
      fechaIngreso: String(ticket.fechaIngreso || today()).trim(),
      tecnico: String(ticket.tecnico || 'Equipo Megabyte').trim(),
      observaciones: String(ticket.observaciones || '').trim(),
      fechaEstimada: String(ticket.fechaEstimada || today()).trim(),
      historial: Array.isArray(ticket.historial)
        ? ticket.historial.map((item) => ({
          fecha: String(item.fecha || today()).trim(),
          texto: String(item.texto || '').trim()
        })).filter((item) => item.texto)
        : []
    };
  }

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  async function loadAdminTickets() {
    if (!adminAuthenticated || !document.getElementById('adminTicketList')) return;

    try {
      const payload = await apiRequest(`${API_ADMIN_TRACKING}?action=tickets`, { headers: adminHeaders() });
      ticketsCache = Array.isArray(payload.tickets) ? payload.tickets.map(normalizeTicket) : [];
      renderAdminTickets();
    } catch (err) {
      ticketsCache = [];
      renderAdminTickets();
      showStoreNotice(err.message || 'No se pudieron cargar los tickets');
    }
  }

  function ticketStatusClass(status) {
    return String(status || 'recibido')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'recibido';
  }

  function ticketStatusOptions(selectedStatus) {
    const statuses = [
      'Recibido',
      'En diagnostico',
      'Esperando repuesto',
      'En reparacion',
      'En pruebas',
      'Listo para entrega',
      'Entregado'
    ];
    return statuses
      .map((status) => `<option value="${status}" ${status === selectedStatus ? 'selected' : ''}>${status}</option>`)
      .join('');
  }

  function viewedTicketIds() {
    try {
      const ids = JSON.parse(localStorage.getItem(VIEWED_TICKETS_KEY) || '[]');
      return Array.isArray(ids) ? ids : [];
    } catch (error) {
      return [];
    }
  }

  function unseenTickets() {
    const viewed = new Set(viewedTicketIds());
    return ticketsCache.filter((ticket) => !viewed.has(ticket.ticket));
  }

  function updateTicketNotification() {
    const unseen = unseenTickets();
    const ticketButton = document.querySelector('[data-admin-screen-target="tickets"]');
    if (ticketButton) {
      ticketButton.classList.toggle('has-notification', unseen.length > 0);
      ticketButton.dataset.notificationCount = String(unseen.length);
      ticketButton.setAttribute(
        'aria-label',
        unseen.length ? `Gestionar tickets, ${unseen.length} sin ver` : 'Gestionar tickets'
      );
    }

    document.querySelectorAll('[data-ticket-row]').forEach((row) => {
      row.classList.toggle('has-notification', unseen.some((ticket) => ticket.ticket === row.dataset.ticketRow));
    });
  }

  function markAdminTicketsAsViewed() {
    if (!ticketsCache.length) {
      updateTicketNotification();
      return;
    }

    localStorage.setItem(
      VIEWED_TICKETS_KEY,
      JSON.stringify([...new Set([...viewedTicketIds(), ...ticketsCache.map((ticket) => ticket.ticket)])])
    );
    if (document.querySelector('[data-admin-screen="tickets"]')?.classList.contains('is-active')) {
      markAdminTicketsAsViewed();
    } else {
      updateTicketNotification();
    }
  }

  function ticketAdminRow(ticket) {
    return `
      <article class="store-admin__item store-admin__item--ticket" data-ticket-row="${ticket.ticket}">
        <div class="store-admin__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a3 3 0 0 0 0 6v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a3 3 0 0 0 0-6V7Z"/><path d="M9 9h6M9 13h6"/></svg>
        </div>
        <div>
          <span>${ticket.ticket} · ${ticket.servicio}</span>
          <strong>${ticket.cliente}</strong>
          <small>${ticket.telefono} · ${ticket.fechaIngreso}</small>
        </div>
        <div class="store-admin__ticket-meta">
          <label class="store-admin__ticket-status-control store-admin__ticket-status-control--${ticketStatusClass(ticket.estado)}">
            <span>Estado</span>
            <select data-ticket-status="${ticket.ticket}" aria-label="Cambiar estado de ${ticket.ticket}">
              ${ticketStatusOptions(ticket.estado)}
            </select>
          </label>
          <small>${ticket.tecnico}</small>
        </div>
        <div class="store-admin__item-actions">
          <button type="button" class="btn btn--outline btn--sm" data-edit-ticket="${ticket.ticket}">Editar</button>
          <button type="button" class="btn btn--outline btn--sm" data-delete-ticket="${ticket.ticket}">Eliminar</button>
        </div>
      </article>
    `;
  }

  function renderAdminTickets() {
    const list = document.getElementById('adminTicketList');
    const total = document.getElementById('adminTicketTotal');
    if (!list) return;

    list.innerHTML = ticketsCache.length
      ? ticketsCache.map(ticketAdminRow).join('')
      : '<div class="store-empty">No hay tickets creados todavÃ­a.</div>';
    if (total) total.textContent = `${ticketsCache.length} tickets`;
    updateTicketNotification();
  }

  function ticketToForm(ticket) {
    const form = document.getElementById('adminTicketForm');
    if (!form || !ticket) return;

    form.elements.currentTicket.value = ticket.ticket;
    form.elements.ticket.value = ticket.ticket;
    form.elements.cliente.value = ticket.cliente;
    form.elements.telefono.value = ticket.telefono;
    form.elements.servicio.value = ticket.servicio;
    form.elements.estado.value = ticket.estado;
    form.elements.fechaIngreso.value = ticket.fechaIngreso;
    form.elements.fechaEstimada.value = ticket.fechaEstimada;
    form.elements.tecnico.value = ticket.tecnico;
    form.elements.observaciones.value = ticket.observaciones;
    form.elements.historial.value = ticket.historial
      .map((item) => `${item.fecha} | ${item.texto}`)
      .join('\n');
    document.getElementById('adminTicketFormTitle').textContent = 'Editar ticket';
    form.querySelector('[data-ticket-submit]').textContent = 'Guardar cambios';
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function resetTicketForm() {
    const form = document.getElementById('adminTicketForm');
    if (!form) return;

    form.reset();
    form.elements.currentTicket.value = '';
    form.elements.estado.value = 'Recibido';
    form.elements.tecnico.value = 'Equipo Megabyte';
    form.elements.fechaIngreso.value = today();
    form.elements.fechaEstimada.value = today();
    form.elements.historial.value = `${today()} | Ticket creado`;
    document.getElementById('adminTicketFormTitle').textContent = 'Nuevo ticket';
    form.querySelector('[data-ticket-submit]').textContent = 'Guardar ticket';
  }

  function parseTicketHistory(value) {
    return String(value || '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split('|');
        if (parts.length > 1) {
          return {
            fecha: parts.shift().trim() || today(),
            texto: parts.join('|').trim()
          };
        }
        return {
          fecha: today(),
          texto: line
        };
      })
      .filter((item) => item.texto);
  }

  function ticketFromForm(form) {
    const data = new FormData(form);
    const ticketId = String(data.get('ticket') || data.get('currentTicket') || '').trim().toUpperCase();

    return normalizeTicket({
      ticket: ticketId,
      cliente: data.get('cliente'),
      telefono: data.get('telefono'),
      servicio: data.get('servicio'),
      estado: data.get('estado'),
      fechaIngreso: data.get('fechaIngreso'),
      fechaEstimada: data.get('fechaEstimada'),
      tecnico: data.get('tecnico'),
      observaciones: data.get('observaciones'),
      historial: parseTicketHistory(data.get('historial'))
    });
  }

  async function saveTicketFromAdmin(form) {
    if (!adminAuthenticated) {
      showStoreNotice('Inicia sesiÃ³n como administrador');
      return;
    }

    try {
      const previousTicket = String(form.elements.currentTicket.value || '').trim().toUpperCase();
      const nextTicket = ticketFromForm(form);
      await apiRequest(`${API_ADMIN_TRACKING}?action=tickets`, {
        method: form.elements.currentTicket.value ? 'PUT' : 'POST',
        headers: adminHeaders(),
        body: JSON.stringify(nextTicket)
      });
      if (previousTicket && previousTicket !== nextTicket.ticket) {
        await apiRequest(`${API_ADMIN_TRACKING}?action=ticket&id=${encodeURIComponent(previousTicket)}`, {
          method: 'DELETE',
          headers: adminHeaders()
        });
      }
      resetTicketForm();
      await loadAdminTickets();
      showStoreNotice('Ticket guardado');
    } catch (err) {
      showStoreNotice(err.message || 'No se pudo guardar el ticket');
    }
  }

  async function updateTicketStatus(ticketId, nextStatus) {
    if (!adminAuthenticated) {
      showStoreNotice('Inicia sesion como administrador');
      return;
    }

    const ticket = ticketsCache.find((item) => item.ticket === ticketId);
    if (!ticket) {
      showStoreNotice('Ticket no encontrado');
      return;
    }

    try {
      const updatedTicket = normalizeTicket({
        ...ticket,
        estado: nextStatus,
        historial: [
          ...ticket.historial,
          { fecha: today(), texto: `Estado actualizado a ${nextStatus}` }
        ]
      });
      await apiRequest(`${API_ADMIN_TRACKING}?action=tickets`, {
        method: 'PUT',
        headers: adminHeaders(),
        body: JSON.stringify(updatedTicket)
      });
      await loadAdminTickets();
      showStoreNotice('Estado del ticket actualizado');
    } catch (err) {
      showStoreNotice(err.message || 'No se pudo actualizar el estado');
      await loadAdminTickets();
    }
  }

  async function deleteTicket(ticketId) {
    if (!adminAuthenticated) {
      showStoreNotice('Inicia sesiÃ³n como administrador');
      return;
    }

    try {
      await apiRequest(`${API_ADMIN_TRACKING}?action=ticket&id=${encodeURIComponent(ticketId)}`, {
        method: 'DELETE',
        headers: adminHeaders()
      });
      await loadAdminTickets();
      showStoreNotice('Ticket eliminado');
    } catch (err) {
      showStoreNotice(err.message || 'No se pudo eliminar el ticket');
    }
  }


  function cartItemTemplate(item) {
    const { product, quantity } = item;
    return `
      <article class="cart-item">
        <div class="cart-item__image">${productVisual(product, 'cart-item__photo')}</div>
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
        document.querySelectorAll('[data-category-link]').forEach((node) => {
          node.classList.toggle('is-active', node.dataset.categoryLink === selectedCategory);
        });
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

      const adminScreenButton = event.target.closest('[data-admin-screen-target]');
      if (adminScreenButton) {
        const target = adminScreenButton.dataset.adminScreenTarget;
        if (target === 'create') resetAdminForm();
        showAdminScreen(target);
      }

      const removeButton = event.target.closest('[data-remove-cart]');
      if (removeButton) removeFromCart(removeButton.dataset.removeCart);

      const editProductButton = event.target.closest('[data-edit-product]');
      if (editProductButton) productToForm(getProduct(editProductButton.dataset.editProduct));

      const deleteProductButton = event.target.closest('[data-delete-product]');
      if (deleteProductButton) await deleteProduct(deleteProductButton.dataset.deleteProduct);

      const resetAdminButton = event.target.closest('[data-admin-reset]');
      if (resetAdminButton) resetAdminForm();


      const editTicketButton = event.target.closest('[data-edit-ticket]');
      if (editTicketButton) {
        ticketToForm(ticketsCache.find((ticket) => ticket.ticket === editTicketButton.dataset.editTicket));
      }

      const deleteTicketButton = event.target.closest('[data-delete-ticket]');
      if (deleteTicketButton) await deleteTicket(deleteTicketButton.dataset.deleteTicket);

      const resetTicketButton = event.target.closest('[data-ticket-reset]');
      if (resetTicketButton) resetTicketForm();


      const removeProductImageButton = event.target.closest('[data-remove-product-image]');
      if (removeProductImageButton) {
        const form = document.getElementById('adminProductForm');
        if (form) {
          form.elements.imageUrl.value = '';
          form.elements.imageUrls.value = '[]';
          form.__allPendingFileIndexes = [];
          form.__pendingImageOrder = [];
          if (form.elements.productImage) form.elements.productImage.value = '';
          updateAdminImagePreview(form);
          showStoreNotice('Fotos retiradas del producto');
        }
      }

      const pickProductImageButton = event.target.closest('[data-product-image-pick]');
      if (pickProductImageButton) {
        const form = pickProductImageButton.closest('form');
        form?.elements.productImage?.click();
      }

      const galleryButton = event.target.closest('[data-gallery-image]');
      if (galleryButton) {
        const mainImage = document.querySelector('[data-gallery-main]');
        const imageUrl = galleryButton.dataset.galleryImage;
        const productName = document.querySelector('.product-detail__info h1')?.textContent || 'Producto';
        if (mainImage && imageUrl) {
          mainImage.innerHTML = `<img class="product-detail__photo" src="${imageUrl}" alt="${productName}" loading="eager">`;
          document.querySelectorAll('[data-gallery-image]').forEach((button) => {
            button.classList.toggle('is-active', button === galleryButton);
          });
        }
      }

      const logoutButton = event.target.closest('[data-admin-logout]');
      if (logoutButton) {
        adminAuthenticated = false;
        await apiRequest(`${API_ADMIN}?action=logout`, { method: 'POST' }).catch(() => {});
        renderAdminAccess();
        resetAdminForm();
        resetTicketForm();
        showStoreNotice('Sesión cerrada');
      }
    });

    document.addEventListener('input', (event) => {
      if (event.target.matches('#storeSearch, #storeSort')) renderProducts();
      if (event.target.matches('[data-cart-qty]')) updateQuantity(event.target.dataset.cartQty, event.target.value);
      if (event.target.matches('[data-currency-cop]')) formatCurrencyInput(event.target);
    });

    document.addEventListener('dragstart', (event) => {
      const tile = event.target.closest('.store-admin__image-tile');
      if (!tile) return;
      tile.classList.add('is-dragging');
      event.dataTransfer.effectAllowed = 'move';
    });

    document.addEventListener('dragover', (event) => {
      const tile = event.target.closest('.store-admin__image-tile');
      if (!tile) return;
      event.preventDefault();
      moveAdminImageTile(tile, event.clientX, event.clientY);
    });

    document.addEventListener('drop', (event) => {
      const preview = event.target.closest('[data-product-image-preview]');
      if (!preview) return;
      event.preventDefault();
      syncAdminImageOrder(preview);
    });

    document.addEventListener('dragend', (event) => {
      const tile = event.target.closest('.store-admin__image-tile');
      if (!tile) return;
      tile.classList.remove('is-dragging');
      syncAdminImageOrder(tile.parentElement);
    });

    document.addEventListener('change', (event) => {
      if (event.target.matches('[data-toggle-product-published]')) {
        toggleProductPublication(event.target.dataset.toggleProductPublished, event.target.checked);
        return;
      }

      if (event.target.matches('[data-ticket-status]')) {
        updateTicketStatus(event.target.dataset.ticketStatus, event.target.value);
        return;
      }

      if (event.target.matches('input[name="productImage"]')) {
        const form = event.target.closest('form');
        const files = Array.from(event.target.files || []);
        const preview = form?.querySelector('[data-product-image-preview]');

        if (!files.length || !preview) {
          updateAdminImagePreview(form);
          return;
        }

        if (files.some((file) => file.size > 4 * 1024 * 1024)) {
          event.target.value = '';
          showStoreNotice('Cada imagen debe pesar maximo 4 MB');
          updateAdminImagePreview(form);
          return;
        }

        preview.innerHTML = '';
        preview.classList.add('has-image');
        form.__allPendingFileIndexes = files.map((_, index) => index);
        form.__pendingImageOrder = [...form.__allPendingFileIndexes];

        files.slice(0, 6).forEach((file) => {
          const fileIndex = files.indexOf(file);
          const previewUrl = URL.createObjectURL(file);
          preview.insertAdjacentHTML(
            'beforeend',
            adminImagePreviewTile(
              `<img src="${previewUrl}" alt="Vista previa del producto">`,
              `data-preview-file-index="${fileIndex}"`,
              fileIndex === 0
            )
          );
        });
        preview.insertAdjacentHTML('beforeend', adminImageSelectTile());
        syncAdminImageOrder(preview);
        return;
      }

      if (!event.target.matches('.store-category-select select')) return;

      const selectedCategory = event.target.value;
      document.querySelectorAll('[data-category-link]').forEach((node) => {
        node.classList.toggle('is-active', node.dataset.categoryLink === selectedCategory);
      });
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

    const adminTicketForm = document.getElementById('adminTicketForm');
    if (adminTicketForm) {
      adminTicketForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        await saveTicketFromAdmin(adminTicketForm);
      });
      resetTicketForm();
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
          await loadProducts();
          renderAdminAccess();
          renderAdminProducts();
          await loadAdminTickets();
          resetTicketForm();
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
    refreshProducts
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
