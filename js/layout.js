(function () {
  'use strict';

  const ASSET_VERSION = 'site-20260712-3';
  const WHATSAPP_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';

  const favicon = document.createElement('link');
  favicon.rel = 'icon';
  favicon.type = 'image/png';
  favicon.href = '/assets/favicon-32x32.png';
  document.head.appendChild(favicon);

  const HEADER_HTML = `
<header class="header" id="header">
  <div class="container header__inner">
    <a href="/" class="header__logo" aria-label="Ir al inicio">
      <img src="/assets/logo-menu-megabyte.png" alt="Megabyte" width="190" height="64">
    </a>

    <label class="header__search">
      <span>Buscar</span>
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
      <input type="search" placeholder="Buscar servicios, productos o soporte...">
      <kbd>Ctrl K</kbd>
    </label>

    <nav class="header__nav" id="nav" aria-label="Navegacion principal">
      <a href="/servicios" class="header__nav-link" data-page="servicios"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m14.7 6.3 3 3M5 19l8.8-8.8M14 5l5 5-2 2-5-5 2-2Z"/><path d="m7 17-2 2"/></svg><span>Servicios</span></a>
      <a href="/seguimiento" class="header__nav-link" data-page="seguimiento"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 15h8M8 11h5M8 8h8"/></svg><span>Seguimiento</span></a>
      <a href="/tienda" class="header__nav-link header__nav-link--store" data-page="tienda"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6h15l-2 8H8L6 6Z"/><path d="M6 6 5 3H2"/><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/></svg><span>Tienda</span><em data-cart-count hidden>0</em></a>
      <a href="/nosotros" class="header__nav-link" data-page="nosotros"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-8 0v2"/><circle cx="12" cy="7" r="4"/><path d="M20 8v6M23 11h-6"/></svg><span>Nosotros</span></a>
      <a href="/contacto" class="header__nav-link" data-page="contacto"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12a8 8 0 0 1 16 0v4a3 3 0 0 1-3 3h-2"/><path d="M4 13v3a2 2 0 0 0 2 2h1v-7H6a2 2 0 0 0-2 2Zm16 0v3a2 2 0 0 1-2 2h-1v-7h1a2 2 0 0 1 2 2Z"/></svg><span>Contacto</span></a>
    </nav>

    <div class="header__actions">
      <a href="/contacto" class="btn btn--primary btn--sm header__cta">
        <span>Solicitar servicio</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </a>
      <a href="https://wa.me/573133141701" target="_blank" rel="noopener noreferrer" class="btn btn--whatsapp btn--sm header__wa" aria-label="WhatsApp 313 314 1701">
        ${WHATSAPP_ICON}
        <span class="header__wa-text">313 314 1701</span>
      </a>
    </div>
  </div>
</header>`;

  const WHATSAPP_HTML = `
<a href="https://wa.me/573133141701" target="_blank" rel="noopener noreferrer" class="whatsapp-float" aria-label="Chatear por WhatsApp">
  ${WHATSAPP_ICON.replace('width="18" height="18"', 'width="28" height="28"')}
</a>`;

  function setActivePage() {
    const currentPage = document.body.dataset.page || '';
    document.querySelectorAll('.header__nav-link[data-page]').forEach((link) => {
      link.classList.toggle('active', link.dataset.page === currentPage);
    });
  }

  window.megabyteSetActivePage = setActivePage;

  function injectLayout() {
    const headerEl = document.getElementById('site-header');
    const floatEl = document.getElementById('site-float');

    if (headerEl) {
      headerEl.innerHTML = HEADER_HTML;
    }
    if (floatEl) {
      floatEl.innerHTML = WHATSAPP_HTML;
    }

    setActivePage();
    window.dispatchEvent(new Event('layoutready'));
  }

  async function loadFooter() {
    const footerEl = document.getElementById('site-footer');
    if (!footerEl) return;

    try {
      const res = await fetch(`/partials/footer.html?v=${ASSET_VERSION}`);
      footerEl.innerHTML = await res.text();
    } catch (err) {
      console.warn('Footer no cargado:', err);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    injectLayout();
    loadFooter();
  });
})();
