(function () {
  'use strict';

  const HEADER_HTML = `
<header class="header" id="header">
  <div class="header__top">
    <div class="container header__inner">
      <a href="index.html" class="header__logo">
        <img src="assets/logo-megabyte.jpeg" alt="Megabyte MB" width="48" height="48">
        <div class="header__brand">
          <span class="header__name">MEGABYTE</span>
          <span class="header__slogan">Tu tecnología, nuestro cuidado</span>
        </div>
      </a>
      <div class="header__actions">
        <a href="contacto.html" class="btn btn--primary btn--sm header__cta">Solicitar Servicio</a>
        <a href="https://wa.me/573204293863" target="_blank" rel="noopener noreferrer" class="btn btn--whatsapp btn--sm header__wa" aria-label="WhatsApp">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          <span class="header__wa-text">320 429 3863</span>
        </a>
      </div>
    </div>
  </div>
  <nav class="header__nav" id="nav" aria-label="Navegación principal">
    <div class="container header__nav-inner">
      <a href="index.html" class="header__nav-link" data-page="inicio">Inicio</a>
      <a href="servicios.html" class="header__nav-link" data-page="servicios">Servicios</a>
      <a href="seguimiento.html" class="header__nav-link" data-page="seguimiento">Seguimiento</a>
      <a href="tienda.html" class="header__nav-link" data-page="tienda">Tienda</a>
      <a href="nosotros.html" class="header__nav-link" data-page="nosotros">Nosotros</a>
      <a href="contacto.html" class="header__nav-link" data-page="contacto">Contacto</a>
    </div>
  </nav>
</header>`;

  const WHATSAPP_HTML = `
<a href="https://wa.me/573204293863" target="_blank" rel="noopener noreferrer" class="whatsapp-float" aria-label="Chatear por WhatsApp">
  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
</a>`;

  function setActivePage() {
    const currentPage = document.body.dataset.page || '';
    document.querySelectorAll('.header__nav-link[data-page]').forEach((link) => {
      link.classList.toggle('active', link.dataset.page === currentPage);
    });
  }

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
      const base = new URL('.', window.location.href).href;
      const res = await fetch(base + 'partials/footer.html');
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
