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

const INTERNAL_PAGES = [
  'index.html',
  'servicios.html',
  'seguimiento.html',
  'tienda.html',
  'nosotros.html',
  'contacto.html'
];

const prefetchedPages = new Set();

function getCurrentPage() {
  const fileName = window.location.pathname.split('/').pop() || '';
  return PAGE_BY_FILE[fileName] || '';
}

function normalizeInternalHref(href) {
  const url = new URL(href, window.location.href);

  if (url.origin !== window.location.origin) return '';
  if (url.hash || url.search) return '';

  const fileName = url.pathname.split('/').pop() || 'index.html';
  if (!INTERNAL_PAGES.includes(fileName)) return '';

  return url.href;
}

function prefetchPage(href) {
  const url = normalizeInternalHref(href);
  if (!url || prefetchedPages.has(url)) return;

  prefetchedPages.add(url);

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  link.as = 'document';
  document.head.appendChild(link);
}

function prefetchImportantPages() {
  const currentPage = getCurrentPage();
  const priorityPages = currentPage === 'inicio'
    ? ['servicios.html', 'seguimiento.html', 'contacto.html']
    : ['index.html', 'contacto.html'];

  const run = () => priorityPages.forEach(prefetchPage);

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(run, { timeout: 1200 });
  } else {
    window.setTimeout(run, 350);
  }
}

function refreshPageState() {
  document.body.dataset.page = getCurrentPage();

  if (typeof window.megabyteSetActivePage === 'function') {
    window.megabyteSetActivePage();
  }

  if (typeof window.megabyteInitPage === 'function') {
    window.megabyteInitPage();
  }

  prefetchImportantPages();
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

document.addEventListener('pointerenter', (event) => {
  const link = event.target.closest('a[href]');
  if (link) prefetchPage(link.href);
}, true);

document.addEventListener('touchstart', (event) => {
  const link = event.target.closest('a[href]');
  if (link) prefetchPage(link.href);
}, { passive: true, capture: true });

swup.hooks.on('page:view', refreshPageState);
prefetchImportantPages();
