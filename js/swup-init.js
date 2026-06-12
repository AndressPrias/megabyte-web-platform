import Swup from 'https://unpkg.com/swup@4?module';

const PAGE_BY_FILE = {
  '': 'inicio',
  'index.html': 'inicio',
  'servicios.html': 'servicios',
  'seguimiento.html': 'seguimiento',
  'tienda.html': 'tienda',
  'nosotros.html': 'nosotros',
  'contacto.html': 'contacto'
};

function getCurrentPage() {
  const fileName = window.location.pathname.split('/').pop() || '';
  return PAGE_BY_FILE[fileName] || '';
}

function refreshPageState() {
  document.body.dataset.page = getCurrentPage();

  if (typeof window.megabyteSetActivePage === 'function') {
    window.megabyteSetActivePage();
  }

  if (typeof window.megabyteInitPage === 'function') {
    window.megabyteInitPage();
  }
}

const swup = new Swup({
  containers: ['#swup'],
  linkSelector: [
    'a[href]',
    ':not([href^="#"])',
    ':not([href^="mailto:"])',
    ':not([href^="tel:"])',
    ':not([href^="https://wa.me/"])',
    ':not([target="_blank"])',
    ':not([download])'
  ].join('')
});

swup.hooks.on('page:view', refreshPageState);
