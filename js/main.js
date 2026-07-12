(function () {
  'use strict';

  const WHATSAPP_NUMBER = '573133141701';

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

  function buildServiceWhatsAppUrl(ticket, request) {
    const trackingUrl = `${window.location.origin}/seguimiento?ticket=${encodeURIComponent(ticket.ticket)}`;
    const message = [
      'Hola Megabyte, acabo de solicitar un servicio desde la web.',
      '',
      `Ticket: ${ticket.ticket}`,
      `Cliente: ${request.nombre}`,
      `Celular: ${request.telefono}`,
      `Servicio: ${request.servicio}`,
      request.email ? `Correo: ${request.email}` : '',
      request.mensaje ? `Mensaje: ${request.mensaje}` : '',
      '',
      `Seguimiento: ${trackingUrl}`
    ].filter(Boolean).join('\n');

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  }

  function showTicketCreatedModal(ticket, whatsappUrl) {
    const trackingUrl = `/seguimiento?ticket=${encodeURIComponent(ticket.ticket)}`;
    let modal = document.getElementById('ticketCreatedModal');

    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'ticketCreatedModal';
      modal.className = 'ticket-created-modal';
      modal.innerHTML = `
        <div class="ticket-created-modal__overlay" data-ticket-modal-close></div>
        <section class="ticket-created-modal__card" role="dialog" aria-modal="true" aria-labelledby="ticketCreatedTitle">
          <button class="ticket-created-modal__close" type="button" data-ticket-modal-close aria-label="Cerrar">×</button>
          <span class="ticket-created-modal__icon">✓</span>
          <p class="ticket-created-modal__eyebrow">Ticket creado exitosamente</p>
          <h2 id="ticketCreatedTitle">Tu solicitud fue registrada</h2>
          <strong data-ticket-created-id>MB-0000-0000</strong>
          <p>Guarda este número para consultar el estado de tu servicio cuando lo necesites.</p>
          <div class="ticket-created-modal__actions">
            <a class="btn btn--primary" data-ticket-created-wa target="_blank" rel="noopener noreferrer">Enviar por WhatsApp</a>
            <a class="btn btn--outline" data-ticket-created-track>Realizar seguimiento</a>
          </div>
        </section>
      `;
      document.body.appendChild(modal);

      modal.addEventListener('click', (event) => {
        if (event.target.closest('[data-ticket-modal-close]')) {
          modal.classList.remove('is-visible');
          document.body.classList.remove('has-ticket-modal');
        }
      });
    }

    modal.querySelector('[data-ticket-created-id]').textContent = ticket.ticket;
    modal.querySelector('[data-ticket-created-wa]').href = whatsappUrl;
    modal.querySelector('[data-ticket-created-track]').href = trackingUrl;
    modal.classList.add('is-visible');
    document.body.classList.add('has-ticket-modal');
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
        result.hidden = true;
        error.hidden = false;
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
        const request = {
          nombre,
          email,
          telefono,
          servicio: servicioText,
          mensaje,
          website: honeypot?.value || ''
        };
        const ticket = await createServiceTicket({
          ...request
        });
        const whatsappUrl = buildServiceWhatsAppUrl(ticket, request);

        if (success) {
          success.textContent = `Ticket ${ticket.ticket} creado exitosamente. Te contactaremos pronto.`;
          success.hidden = false;
        }
        if (ticketBox && ticketId && ticketLink) {
          ticketId.textContent = ticket.ticket;
          ticketLink.href = `/seguimiento?ticket=${encodeURIComponent(ticket.ticket)}`;
          ticketBox.hidden = false;
        }
        showTicketCreatedModal(ticket, whatsappUrl);
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
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

    const params = new URLSearchParams(window.location.search);
    const ticket = params.get('ticket');
    const phone = params.get('phone') || params.get('telefono');
    const phoneInput = document.getElementById('phoneInput');

    if (ticket) ticketInput.value = ticket;
    if (phone && phoneInput) phoneInput.value = phone;

    if (ticket || phone) {
      window.setTimeout(() => {
        document.getElementById('ticketForm')?.requestSubmit();
      }, 80);
    }
  }

  function init() {
    initScrollEffects();
    initAnimations();
    initTicketForm();
    initTrackingQuery();
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
