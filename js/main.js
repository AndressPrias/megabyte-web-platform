(function () {
  'use strict';

  const STATUS_MAP = {
    'Recibido': 'recibido',
    'En diagnstico': 'diagnostico',
    'Esperando repuesto': 'repuesto',
    'En reparacin': 'reparacion',
    'En pruebas': 'pruebas',
    'Listo para entrega': 'listo',
    'Entregado': 'entregado'
  };

  const DEMO_TICKETS = {
    'MB-2026-0001': {
      ticket: 'MB-2026-0001',
      cliente: 'Carlos Mndez',
      telefono: '3204293863',
      estado: 'En reparacin',
      fechaIngreso: '2026-05-28',
      tecnico: 'Andrs Gmez',
      observaciones: 'Cambio de pantalla LCD 15.6" y limpieza interna. Repuesto en camino.',
      fechaEstimada: '2026-06-10',
      historial: [
        { fecha: '2026-05-28', texto: 'Equipo recibido en taller' },
        { fecha: '2026-05-29', texto: 'Diagnstico completado  pantalla daada' },
        { fecha: '2026-06-02', texto: 'Repuesto solicitado al proveedor' },
        { fecha: '2026-06-07', texto: 'En reparacin  instalacin de pantalla' }
      ]
    },
    'MB-2026-0002': {
      ticket: 'MB-2026-0002',
      cliente: 'Ana Rodrguez',
      telefono: '3105551234',
      estado: 'Listo para entrega',
      fechaIngreso: '2026-06-01',
      tecnico: 'Laura Vargas',
      observaciones: 'Instalacin de 4 cmaras IP y configuracin de DVR. Sistema operativo.',
      fechaEstimada: '2026-06-08',
      historial: [
        { fecha: '2026-06-01', texto: 'Servicio programado  visita en sitio' },
        { fecha: '2026-06-03', texto: 'Instalacin de cmaras completada' },
        { fecha: '2026-06-05', texto: 'Configuracin remota y pruebas OK' },
        { fecha: '2026-06-07', texto: 'Listo para entrega  pendiente retiro' }
      ]
    }
  };

  function initScrollEffects() {
    const header = document.getElementById('header');
    if (!header) return;

    window.addEventListener('scroll', () => {
      header.classList.toggle('header--scrolled', window.scrollY > 50);
    });
  }

  function initAnimations() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('[data-animate]').forEach((el) => observer.observe(el));
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

      window.open(`https://wa.me/573204293863?text=${waMessage}`, '_blank');

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

  if (document.getElementById('site-header')) {
    window.addEventListener('layoutready', init);
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
