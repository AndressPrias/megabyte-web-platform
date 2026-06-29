(function () {
  'use strict';

  const WHATSAPP_NUMBER = '573133141701';
  const CART_KEY = 'megabyte_store_cart';

  const PRODUCTS = [
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
    return PRODUCTS.find((product) => product.id === id);
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

    let products = PRODUCTS.filter((product) => {
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
    const product = getProduct(params.get('id')) || PRODUCTS[0];

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
      related.innerHTML = PRODUCTS
        .filter((item) => item.id !== product.id)
        .slice(0, 3)
        .map(productCard)
        .join('');
    }
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
    document.addEventListener('click', (event) => {
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
  }

  function initStore() {
    updateCartCount();
    renderProducts();
    renderProductDetail();
    renderCartPage();
    renderCheckoutSummary();
    bindStoreEvents();
  }

  window.MegabyteStore = {
    products: PRODUCTS,
    addToCart,
    getCart,
    removeFromCart,
    updateQuantity
  };

  document.addEventListener('DOMContentLoaded', initStore);
})();
