(function () {
  'use strict';

  const STATUS_MAP = {
    'Recibido': 'recibido',
    'En diagnóstico': 'diagnostico',
    'Esperando repuesto': 'repuesto',
    'En reparación': 'reparacion',
    'En pruebas': 'pruebas',
    'Listo para entrega': 'listo',
    'Entregado': 'entregado'
  };

  const DEMO_TICKETS = {
    'MB-2026-0001': {
      ticket: 'MB-2026-0001',
      cliente: 'Carlos Méndez',
      telefono: '3204293863',
      estado: 'En reparación',
      fechaIngreso: '2026-05-28',
      tecnico: 'Andrés Gómez',
      observaciones: 'Cambio de pantalla LCD 15.6" y limpieza interna. Repuesto en camino.',
      fechaEstimada: '2026-06-10',
      historial: [
        { fecha: '2026-05-28', texto: 'Equipo recibido en taller' },
        { fecha: '2026-05-29', texto: 'Diagnóstico completado - pantalla dañada' },
        { fecha: '2026-06-02', texto: 'Repuesto solicitado al proveedor' },
        { fecha: '2026-06-07', texto: 'En reparación - instalación de pantalla' }
      ]
    },
    'MB-2026-0002': {
      ticket: 'MB-2026-0002',
      cliente: 'Ana Rodríguez',
      telefono: '3105551234',
      estado: 'Listo para entrega',
      fechaIngreso: '2026-06-01',
      tecnico: 'Laura Vargas',
      observaciones: 'Instalación de 4 cámaras IP y configuración de DVR. Sistema operativo.',
      fechaEstimada: '2026-06-08',
      historial: [
        { fecha: '2026-06-01', texto: 'Servicio programado - visita en sitio' },
        { fecha: '2026-06-03', texto: 'Instalación de cámaras completada' },
        { fecha: '2026-06-05', texto: 'Configuración remota y pruebas OK' },
        { fecha: '2026-06-07', texto: 'Listo para entrega - pendiente retiro' }
      ]
    }
  };

  function initScrollEffects() {
    const header = document.getElementById('header');
    if (!header || window.megabyteScrollEffectsReady) return;

    window.megabyteScrollEffectsReady = true;
    window.addEventListener('scroll', () => {
      header.classList.toggle('header--scrolled', window.scrollY > 50);
    });
  }

  function initAnimations() {
    const animatedElements = document.querySelectorAll('[data-animate]');
    if (!animatedElements.length) return;

    const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.15,
    rootMargin: "0px 0px -40px 0px"
  }
);

animatedElements.forEach((element) => {
  observer.observe(element);
});
  }

  function normalizePhone(phone) {
    return phone.replace(/\D/g, '');
  }

  function findTicket(ticketId, phone) {
    if (ticketId) {
      const key = ticketId.toUpperCase().trim();
      if (DEMO_TICKETS[key]) return DEMO_TICKETS[key];
    }

    if (phone) {
      const normalized = normalizePhone(phone);
      return Object.values(DEMO_TICKETS).find(
        (t) => normalizePhone(t.telefono) === normalized
      ) || null;
    }

    return null;
  }

  function formatDate(dateStr) {
    const [y, m, d] = dateStr.split('-');
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
  }

  function renderTicket(data) {
    const result = document.getElementById('ticketResult');
    const error = document.getElementById('ticketError');
    const statusClass = STATUS_MAP[data.estado] || 'recibido';

    document.getElementById('resultTicket').textContent = data.ticket;

    const statusEl = document.getElementById('resultStatus');
    statusEl.textContent = data.estado;
    statusEl.className = `ticket-status ticket-status--${statusClass}`;

    document.getElementById('resultCliente').textContent = data.cliente;
    document.getElementById('resultFecha').textContent = formatDate(data.fechaIngreso);
    document.getElementById('resultTecnico').textContent = data.tecnico;
    document.getElementById('resultEstimada').textContent = formatDate(data.fechaEstimada);
    document.getElementById('resultObs').textContent = data.observaciones;

    document.getElementById('resultHistorial').innerHTML = data.historial
      .map((h) => `<li><time>${formatDate(h.fecha)}</time><span>${h.texto}</span></li>`)
      .join('');

    error.hidden = true;
    result.hidden = false;
  }

  function initTicketForm() {
    const ticketForm = document.getElementById('ticketForm');
    if (!ticketForm) return;

    ticketForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const ticketId = document.getElementById('ticketInput').value.trim();
      const phone = document.getElementById('phoneInput').value.trim();
      if (!ticketId && !phone) return;

      const data = findTicket(ticketId, phone);
      const result = document.getElementById('ticketResult');
      const error = document.getElementById('ticketError');

      if (data) {
        renderTicket(data);
      } else {
        result.hidden = true;
        error.hidden = false;
      }
    });
  }

  function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const honeypot = contactForm.querySelector('.honeypot');
      if (honeypot && honeypot.value) return;

      const nombre = document.getElementById('nombre').value;
      const servicio = document.getElementById('servicio');
      const servicioText = servicio.options[servicio.selectedIndex].text;
      const mensaje = document.getElementById('mensaje').value;

      const waMessage = encodeURIComponent(
        `Hola, soy ${nombre}. Me interesa el servicio de ${servicioText}. ${mensaje}`
      );

      window.open(`https://wa.me/573133141701?text=${waMessage}`, '_blank');

      document.getElementById('formSuccess').hidden = false;
      contactForm.reset();

      setTimeout(() => {
        document.getElementById('formSuccess').hidden = true;
      }, 5000);
    });
  }

  function init() {
    initScrollEffects();
    initAnimations();
    initTicketForm();
    initContactForm();
  }

  window.megabyteInitPage = init;

  if (document.getElementById('site-header')) {
    window.addEventListener('layoutready', init);
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
