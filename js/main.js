(function () {
  'use strict';

  const STATUS_MAP = {
    'Recibido': 'recibido',
    'En diagnostico': 'diagnostico',
    'En diagnóstico': 'diagnostico',
    'Esperando repuesto': 'repuesto',
    'En reparacion': 'reparacion',
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

  async function fetchTicket(ticketId, phone) {
    const response = await fetch('/api/tracking.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ ticket: ticketId, phone })
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload.error || 'Servicio no encontrado');
    }

    return payload.ticket;
  }

  async function createServiceTicket(payload) {
    const response = await fetch('/api/service-request.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || 'No se pudo crear el ticket');
    }

    return data.ticket;
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
    const serviceResult = document.getElementById('resultServicio');
    if (serviceResult) serviceResult.textContent = data.servicio || 'Servicio tecnico';
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

    ticketForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const ticketId = document.getElementById('ticketInput').value.trim();
      const phone = document.getElementById('phoneInput').value.trim();
      if (!ticketId && !phone) return;

      const result = document.getElementById('ticketResult');
      const error = document.getElementById('ticketError');
      const button = ticketForm.querySelector('button[type="submit"]');
      const originalText = button?.textContent || 'Consultar Estado';

      if (button) {
        button.disabled = true;
        button.textContent = 'Consultando...';
      }

      try {
        const data = await fetchTicket(ticketId, phone);
        renderTicket(data);
      } catch (err) {
        const demoData = findTicket(ticketId, phone);
        if (demoData && window.location.hostname === '127.0.0.1') {
          renderTicket(demoData);
        } else {
          result.hidden = true;
          error.hidden = false;
        }
      } finally {
        if (button) {
          button.disabled = false;
          button.textContent = originalText;
        }
      }
    });
  }

  function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    const serviceSelect = document.getElementById('servicio');
    const selectedService = new URLSearchParams(window.location.search).get('servicio');
    if (serviceSelect && selectedService && [...serviceSelect.options].some((option) => option.value === selectedService)) {
      serviceSelect.value = selectedService;
    }

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const honeypot = contactForm.querySelector('.honeypot');
      if (honeypot && honeypot.value) return;

      const nombre = document.getElementById('nombre').value.trim();
      const email = document.getElementById('email').value.trim();
      const telefono = document.getElementById('telefono').value.trim();
      const servicio = document.getElementById('servicio');
      const servicioText = servicio.options[servicio.selectedIndex].text;
      const mensaje = document.getElementById('mensaje').value.trim();
      const success = document.getElementById('formSuccess');
      const ticketBox = document.getElementById('serviceTicketSuccess');
      const ticketId = document.getElementById('createdTicketId');
      const ticketLink = document.getElementById('createdTicketLink');
      const submitButton = contactForm.querySelector('button[type="submit"]');
      const originalText = submitButton?.textContent || 'Enviar Solicitud';

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Creando ticket...';
      }

      try {
        const ticket = await createServiceTicket({
          nombre,
          email,
          telefono,
          servicio: servicioText,
          mensaje,
          website: honeypot?.value || ''
        });

        if (success) {
          success.textContent = 'Solicitud registrada. Te contactaremos pronto.';
          success.hidden = false;
        }
        if (ticketBox && ticketId && ticketLink) {
          ticketId.textContent = ticket.ticket;
          ticketLink.href = `/seguimiento?ticket=${encodeURIComponent(ticket.ticket)}`;
          ticketBox.hidden = false;
        }
        contactForm.reset();
        if (serviceSelect && selectedService) serviceSelect.value = selectedService;
      } catch (err) {
        if (success) {
          success.textContent = err.message || 'No se pudo crear el ticket. Intenta nuevamente.';
          success.hidden = false;
        }
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalText;
        }
      }
    });
  }

  function getInitials(name) {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || 'MB';
  }

  function createOpinionCard(opinion) {
    const article = document.createElement('article');
    article.className = 'testimonio-card testimonio-card--user visible';

    const stars = document.createElement('div');
    stars.className = 'testimonio-card__stars';
    const rating = Math.min(5, Math.max(1, Number(opinion.rating) || 5));
    stars.setAttribute('aria-label', `${rating} de 5 estrellas`);
    stars.textContent = '★'.repeat(rating) + '☆'.repeat(5 - rating);

    const text = document.createElement('p');
    text.className = 'testimonio-card__text';
    text.textContent = `"${opinion.text}"`;

    const author = document.createElement('div');
    author.className = 'testimonio-card__author';

    const avatar = document.createElement('div');
    avatar.className = 'testimonio-card__avatar';
    avatar.textContent = getInitials(opinion.name);

    const meta = document.createElement('div');
    const name = document.createElement('strong');
    name.textContent = opinion.name;
    const service = document.createElement('span');
    service.textContent = opinion.service;

    meta.append(name, service);
    author.append(avatar, meta);
    article.append(stars, text, author);

    return article;
  }

  function loadOpinions() {
    try {
      return JSON.parse(localStorage.getItem('megabyteOpinions') || '[]');
    } catch (error) {
      return [];
    }
  }

  function saveOpinions(opinions) {
    try {
      localStorage.setItem('megabyteOpinions', JSON.stringify(opinions));
    } catch (error) {
      return false;
    }
    return true;
  }

  function initOpinionForm() {
    const form = document.getElementById('opinionForm');
    const grid = document.querySelector('.testimonios__grid');
    if (!form || !grid || form.dataset.ready === 'true') return;

    form.dataset.ready = 'true';
    const success = document.getElementById('opinionSuccess');
    const savedOpinions = loadOpinions();

    savedOpinions.forEach((opinion) => {
      grid.prepend(createOpinionCard(opinion));
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const opinion = {
        name: document.getElementById('opinionName').value.trim(),
        service: document.getElementById('opinionService').value.trim(),
        text: document.getElementById('opinionText').value.trim(),
        rating: Number(form.querySelector('input[name="rating"]:checked')?.value || 5)
      };

      if (!opinion.name || !opinion.service || !opinion.text) return;

      const opinions = [opinion, ...savedOpinions].slice(0, 6);
      saveOpinions(opinions);
      grid.prepend(createOpinionCard(opinion));
      savedOpinions.unshift(opinion);
      savedOpinions.splice(6);
      form.reset();

      if (success) {
        success.hidden = false;
        setTimeout(() => {
          success.hidden = true;
        }, 4500);
      }
    });
  }

  function initTrackingQuery() {
    const ticketInput = document.getElementById('ticketInput');
    if (!ticketInput) return;

    const ticket = new URLSearchParams(window.location.search).get('ticket');
    if (ticket) ticketInput.value = ticket;
  }

  function init() {
    initScrollEffects();
    initAnimations();
    initTrackingQuery();
    initTicketForm();
    initContactForm();
    initOpinionForm();
  }

  window.megabyteInitPage = init;

  if (document.getElementById('site-header')) {
    window.addEventListener('layoutready', init);
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
