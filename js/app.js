/* ==========================================================================
   Dreamspree — Shared application layer
   Navigation, modal, toast, enquiry form, saved-trip store, search widget,
   card renderers and homepage rendering. Vanilla ES6+, no frameworks.
   ========================================================================== */
(function (DS) {
  'use strict';

  /* ---------- Tiny helpers ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmtPHP = n => '₱' + Math.round(n).toLocaleString('en-PH');
  const fmtDate = iso => { if (!iso) return ''; const d = new Date(iso + 'T00:00:00'); return isNaN(d) ? iso : d.toLocaleDateString('en-PH', { day: 'numeric', month: 'short', year: 'numeric' }); };
  const fmtDateLong = iso => { if (!iso) return ''; const d = new Date(iso + 'T00:00:00'); return isNaN(d) ? iso : d.toLocaleDateString('en-PH', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }); };
  const html = str => { const t = document.createElement('template'); t.innerHTML = str.trim(); return t.content.firstElementChild; };
  const params = () => new URLSearchParams(location.search);
  const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-');
  Object.assign(DS, { $, $$, esc, fmtPHP, fmtDate, fmtDateLong, html, params, slug });

  /* ---------- Icons (inline SVG, stroke-based) ---------- */
  const P = {
    compass: '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
    passport: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M15 8h3M15 12h3M7 16h10"/>',
    plane: '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 11l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 2.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
    bed: '<path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9"/>',
    car: '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>',
    ship: '<path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1s1.2 1 2.5 1c2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M19.4 17.4 21 14a1 1 0 0 0-.6-1.3L12 10l-8.4 2.7A1 1 0 0 0 3 14l1.6 3.4"/><path d="M12 10V2.5L6 5"/><path d="M4 11V8a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v3"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.7 9a1 1 0 0 1-.6 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.7a1 1 0 0 1 1.6 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    briefcase: '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect x="2" y="6" width="20" height="14" rx="2"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    chevronDown: '<path d="m6 9 6 6 6-6"/>',
    chevronRight: '<path d="m9 18 6-6-6-6"/>',
    chevronLeft: '<path d="m15 18-6-6 6-6"/>',
    arrowRight: '<path d="M5 12h14M12 5l7 7-7 7"/>',
    arrowUpRight: '<path d="M7 17 17 7M7 7h10v10"/>',
    heart: '<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.9 2.1z"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 7L2 7"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    alert: '<path d="m21.7 18-8-14a2 2 0 0 0-3.4 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3z"/><path d="M12 9v4M12 17h.01"/>',
    sparkles: '<path d="m12 3 1.9 5.6L19.5 10.5l-5.6 1.9L12 18l-1.9-5.6L4.5 10.5l5.6-1.9z"/><path d="M5 3v4M3 5h4M19 17v4M17 19h4"/>',
    bank: '<path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
    minus: '<path d="M5 12h14"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20"/>',
    message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    tag: '<path d="M12.6 2.6a2 2 0 0 1 1.4-.6H20a2 2 0 0 1 2 2v6c0 .5-.2 1-.6 1.4l-9.6 9.6a2 2 0 0 1-2.8 0l-6-6a2 2 0 0 1 0-2.8z"/><circle cx="17" cy="7" r="1.5"/>',
    luggage: '<path d="M6 20a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2"/><path d="M8 18V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v14M10 20h4M6 20h.01M18 20h.01"/>',
    headset: '<path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3zM21 11h-3a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h3z"/><path d="M3 11v-1a9 9 0 0 1 18 0v1M21 16v2a3 3 0 0 1-3 3h-5"/>',
    map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15M15 6v15"/>',
    star: '<polygon points="12 2 15.1 8.3 22 9.3 17 14.1 18.2 21 12 17.8 5.8 21 7 14.1 2 9.3 8.9 8.3 12 2"/>',
    zoom: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3M11 8v6M8 11h6"/>',
    trash: '<path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    filter: '<path d="M3 6h18M7 12h10M10 18h4"/>',
    history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
    userCheck: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m16 11 2 2 4-4"/>',
    wallet: '<path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>',
    bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0"/>',
    bagPlus: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18M12 10v6M9 13h6"/>',
    bagCheck: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="m9 14 2 2 4-4"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>'
  };
  DS.icon = (name, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${P[name] || P.info}</svg>`;

  /* ---------- Images with loading + fallback ---------- */
  DS.picture = (id, alt, opts = {}) => {
    const w = opts.w || 800, h = opts.h || Math.round(w * 0.75);
    return `<img src="${DS.img(id, w, h)}" alt="${esc(alt)}" loading="${opts.eager ? 'eager' : 'lazy'}" decoding="async" class="is-loading ${opts.cls || ''}" data-fallback="${esc(opts.label || alt || 'Image')}" width="${w}" height="${h}">`;
  };
  function imgLoaded(img) { img.classList.remove('is-loading'); img.classList.add('is-loaded'); }
  function imgFailed(img) {
    if (img.dataset.failed) return; img.dataset.failed = '1';
    const box = html(`<div class="img-fallback" role="img" aria-label="${esc(img.alt || 'Image unavailable')}"><div>${DS.icon('image')}<span>${esc(img.dataset.fallback || 'Image')}</span></div></div>`);
    img.replaceWith(box);
  }
  document.addEventListener('load', e => { if (e.target.tagName === 'IMG') imgLoaded(e.target); }, true);
  document.addEventListener('error', e => { if (e.target.tagName === 'IMG' && e.target.dataset.fallback !== undefined) imgFailed(e.target); }, true);
  DS.hydrateImages = (root = document) => $$('img.is-loading', root).forEach(img => { if (img.complete) { img.naturalWidth ? imgLoaded(img) : (img.dataset.fallback !== undefined && imgFailed(img)); } });

  /* ---------- Travel Cart hooks ----------
     The cart store, header badge, mini-cart and add-to-cart handling live in cart.js,
     which loads after this file. Renderers below only emit [data-cart-add] buttons. */
  function refreshSavedBadges() { if (DS.cart) DS.cart.refresh(); }

  /* ---------- Toasts ---------- */
  let toastRoot;
  DS.toast = (msg, opts = {}) => {
    if (!toastRoot) { toastRoot = html('<div class="toasts" role="status" aria-live="polite"></div>'); document.body.appendChild(toastRoot); }
    const t = html(`<div class="toast ${opts.type === 'error' ? 'toast--error' : ''}">${DS.icon(opts.type === 'error' ? 'alert' : 'check')}<span>${esc(msg)}</span>${opts.action ? `<a href="${esc(opts.action.href)}">${esc(opts.action.label)}</a>` : ''}</div>`);
    toastRoot.appendChild(t);
    if (DS.motion && DS.motion.toastIn) DS.motion.toastIn(t);
    const remove = () => { if (DS.motion && DS.motion.toastOut) DS.motion.toastOut(t, () => t.remove()); else t.remove(); };
    setTimeout(remove, opts.duration || 3600);
  };

  /* ---------- Modal (single root, focus managed) ---------- */
  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  let modalRoot, lastFocus;
  function ensureModal() {
    if (modalRoot) return modalRoot;
    modalRoot = html(`<div class="modal" id="ds-modal" role="dialog" aria-modal="true" aria-labelledby="ds-modal-title"><div class="modal__backdrop" data-modal-close></div><div class="modal__dialog" tabindex="-1"><div class="modal__head"><div><h2 id="ds-modal-title"></h2><p data-modal-sub hidden></p></div><button type="button" class="icon-btn modal__close" data-modal-close aria-label="Close dialog">${DS.icon('x')}</button></div><div class="modal__body"></div></div></div>`);
    document.body.appendChild(modalRoot);
    modalRoot.addEventListener('click', e => {
      const closer = e.target.closest('[data-modal-close]'); if (!closer) return;
      // An accidental backdrop click must not throw away a half-completed form
      if (closer.classList.contains('modal__backdrop') && isDirty()) { if (DS.motion && DS.motion.shake) DS.motion.shake($('.modal__dialog', modalRoot)); DS.toast('Use Close or Cancel to discard your enquiry.', { duration: 2400 }); return; }
      DS.modal.close();
    });
    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape' || !modalRoot.classList.contains('is-open')) return;
      // Escape inside a dropdown or date picker should only dismiss that picker
      if (e.target.matches && e.target.matches('select, input[type="date"], input[type="month"]')) return;
      e.preventDefault(); DS.modal.close();
    });
    modalRoot.addEventListener('keydown', e => {
      if (e.key === 'Tab') {
        const f = $$(FOCUSABLE, modalRoot).filter(el => el.offsetParent !== null); if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    return modalRoot;
  }
  // A form inside the modal counts as dirty once the user has typed or changed something
  function isDirty() { const f = modalRoot && $('form', modalRoot); return !!(f && f.dataset.dirty === 'true'); }
  document.addEventListener('input', e => { const f = e.target.closest && e.target.closest('.modal form'); if (f) f.dataset.dirty = 'true'; });
  DS.modal = {
    open(content, opts = {}) {
      const root = ensureModal();
      const dialog = $('.modal__dialog', root), body = $('.modal__body', root), sub = $('[data-modal-sub]', root);
      $('#ds-modal-title', root).textContent = opts.title || '';
      sub.textContent = opts.subtitle || ''; sub.hidden = !opts.subtitle;
      dialog.classList.toggle('modal__dialog--lg', !!opts.large);
      body.innerHTML = ''; body.append(typeof content === 'string' ? html(`<div>${content}</div>`) : content);
      lastFocus = document.activeElement;
      root.classList.add('is-open'); document.body.style.overflow = 'hidden';
      DS.hydrateImages(body);
      const focusTarget = opts.focus ? $(opts.focus, body) : ($$(FOCUSABLE, body)[0] || dialog);
      if (DS.motion && DS.motion.modalIn) DS.motion.modalIn(root, dialog, () => focusTarget.focus()); else focusTarget.focus();
      return body;
    },
    close() {
      if (!modalRoot || !modalRoot.classList.contains('is-open')) return;
      const done = () => { modalRoot.classList.remove('is-open'); document.body.style.overflow = ''; if (lastFocus && lastFocus.focus) lastFocus.focus(); };
      if (DS.motion && DS.motion.modalOut) DS.motion.modalOut(modalRoot, $('.modal__dialog', modalRoot), done); else done();
    },
    isOpen: () => !!(modalRoot && modalRoot.classList.contains('is-open')),
    setTitle(t) { if (modalRoot) $('#ds-modal-title', modalRoot).textContent = t; }
  };

  /* ---------- Form validation ---------- */
  DS.validate = form => {
    let ok = true, firstBad = null;
    $$('.field', form).forEach(field => {
      const input = $('input, select, textarea', field); if (!input) return;
      const err = $('.field__error', field); let msg = '';
      const v = input.value.trim();
      if (input.required && !v) msg = 'This field is required.';
      else if (v && input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) msg = 'Enter a valid email address.';
      else if (v && input.type === 'tel' && v.replace(/\D/g, '').length < 7) msg = 'Enter a valid phone number.';
      else if (v && input.dataset.minlen && v.length < +input.dataset.minlen) msg = `Please add a little more detail (at least ${input.dataset.minlen} characters).`;
      field.classList.toggle('is-invalid', !!msg);
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (err) err.textContent = msg;
      if (msg && !firstBad) firstBad = input;
      if (msg) ok = false;
    });
    if (firstBad) { firstBad.focus(); if (DS.motion && DS.motion.shake) DS.motion.shake(firstBad.closest('.field')); }
    return ok;
  };
  document.addEventListener('input', e => { const f = e.target.closest('.field.is-invalid'); if (f) { f.classList.remove('is-invalid'); e.target.removeAttribute('aria-invalid'); } });

  /* ---------- Enquiry modal (shared from every page) ---------- */
  const SERVICE_LABELS = { tours: 'Tours & Packages', visa: 'Visa Assistance', flights: 'Flights', hotels: 'Hotels', transport: 'Private Transportation', cruises: 'Cruises', insurance: 'Travel Insurance', corporate: 'Corporate Travel', consult: 'Talk to a Consultant', booking: 'Package Booking Request', quote: 'Travel Cart Quotation' };
  DS.openEnquiry = (pre = {}) => {
    const serviceOpts = Object.entries(SERVICE_LABELS).map(([k, v]) => `<option value="${k}" ${pre.service === k ? 'selected' : ''}>${v}</option>`).join('');
    const destOpts = ['<option value="">Select a destination</option>', ...DS.destinations.map(d => `<option value="${d.name}" ${pre.destination === d.name ? 'selected' : ''}>${d.name}</option>`), `<option value="Multiple / undecided" ${pre.destination === 'Multiple / undecided' ? 'selected' : ''}>Multiple / undecided</option>`, `<option value="Other" ${pre.destination === 'Other' ? 'selected' : ''}>Other</option>`].join('');
    const summary = pre.summary ? `<div class="summary-box">${pre.summary}</div>` : '';
    const form = html(`
      <form class="enquiry-form" novalidate>
        ${summary}
        <div class="form-grid">
          <div class="field"><label class="field__label" for="enq-name">Full name</label><input class="input" id="enq-name" name="name" type="text" autocomplete="name" required placeholder="Juan dela Cruz"><span class="field__error" aria-live="polite"></span></div>
          <div class="field"><label class="field__label" for="enq-email">Email</label><input class="input" id="enq-email" name="email" type="email" autocomplete="email" required placeholder="you@example.com"><span class="field__error" aria-live="polite"></span></div>
          <div class="field"><label class="field__label" for="enq-phone">Mobile number</label><input class="input" id="enq-phone" name="phone" type="tel" autocomplete="tel" required placeholder="+63 9XX XXX XXXX"><span class="field__error" aria-live="polite"></span></div>
          <div class="field"><label class="field__label" for="enq-service">Service</label><select class="select" id="enq-service" name="service" required>${serviceOpts}</select><span class="field__error"></span></div>
          <div class="field"><label class="field__label" for="enq-dest">Preferred destination</label><select class="select" id="enq-dest" name="destination" required>${destOpts}</select><span class="field__error" aria-live="polite"></span></div>
          <div class="field"><label class="field__label" for="enq-pax">Number of travellers</label><input class="input" id="enq-pax" name="travellers" type="number" min="1" max="60" required value="${pre.travellers || 2}"><span class="field__error" aria-live="polite"></span></div>
          <div class="field"><label class="field__label" for="enq-date">Estimated travel date</label><input class="input" id="enq-date" name="date" type="date" min="${new Date().toISOString().slice(0, 10)}" value="${pre.date || ''}"><span class="field__help">Leave blank if you are still flexible.</span><span class="field__error"></span></div>
          <div class="field"><label class="field__label" for="enq-contact">Preferred contact</label><select class="select" id="enq-contact" name="contact"><option>Viber</option><option>WhatsApp</option><option>Messenger</option><option>Phone call</option><option>Email</option></select></div>
          <div class="field field--full"><label class="field__label" for="enq-msg">Tell us about your trip</label><textarea class="textarea" id="enq-msg" name="message" required data-minlen="12" placeholder="Who is travelling, what you would like to see, your budget range, and anything we should know.">${esc(pre.message || '')}</textarea><span class="field__error" aria-live="polite"></span></div>
          <div class="field field--full"><label class="checkbox"><input type="checkbox" name="consent" required><span>I understand this is a prototype demonstration. No information is sent or stored. (In the live site this would link to the privacy notice.)</span></label><span class="field__error" aria-live="polite"></span></div>
        </div>
        <div class="cluster" style="margin-top:1.5rem;justify-content:space-between">
          <span class="small muted">A consultant replies within one business day (sample service promise).</span>
          <button type="submit" class="btn btn--primary">${pre.cta || 'Send enquiry'} ${DS.icon('arrowRight', 'arrow')}</button>
        </div>
      </form>`);
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!DS.validate(form)) return;
      const data = Object.fromEntries(new FormData(form).entries());
      const body = form.parentElement;
      const success = html(`<div class="modal__success"><div class="success-icon">${DS.icon('check')}</div><h3 style="font-size:var(--fs-xl);margin-bottom:.5rem">Thanks, ${esc(data.name.split(' ')[0])}. We have your enquiry.</h3><p class="muted" style="max-width:40ch;margin:0 auto 1.25rem">A Dreamspree consultant would normally reach you on ${esc(data.contact)} within one business day about <strong>${esc(SERVICE_LABELS[data.service] || data.service)}</strong> to <strong>${esc(data.destination)}</strong>${data.date ? ' around ' + esc(fmtDate(data.date)) : ''}.</p><div class="demo-banner" style="text-align:left;margin:0 auto 1.25rem;max-width:460px">${DS.icon('info')}<span>Prototype only: nothing was transmitted or stored. In production this would create a lead for the consultant team.</span></div><div class="cluster" style="justify-content:center"><button type="button" class="btn btn--primary" data-modal-close>Done</button><a class="btn btn--ghost" href="explore.html">Keep exploring</a></div></div>`);
      form.replaceWith(success); DS.modal.setTitle('Enquiry received');
      $('[data-modal-close]', success).focus();
    });
    DS.modal.open(form, { title: pre.title || 'Talk to a travel consultant', subtitle: pre.subtitle || 'Tell us the basics and a human consultant takes it from there.', large: true, focus: '#enq-name' });
  };
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-enquiry]'); if (!t) return;
    e.preventDefault();
    const pre = {};
    ['service', 'destination', 'title', 'subtitle', 'message', 'cta'].forEach(k => { if (t.dataset[k]) pre[k] = t.dataset[k]; });
    DS.openEnquiry(pre);
  });

  /* ---------- Header: scroll state, active link, drawer ---------- */
  function initHeader() {
    const header = $('.site-header'); if (!header) return;
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
    const page = document.body.dataset.page;
    $$('[data-nav]').forEach(a => { if (a.dataset.nav === page) { a.classList.add('is-active'); a.setAttribute('aria-current', 'page'); } });

    const toggle = $('.nav-toggle'), drawer = $('.drawer');
    if (!toggle || !drawer) return;
    let drawerLast;
    const open = () => { drawer.classList.add('is-open'); toggle.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden'; drawerLast = document.activeElement; const first = $('.drawer__close', drawer); if (DS.motion && DS.motion.drawerIn) DS.motion.drawerIn(drawer, () => first.focus()); else first.focus(); };
    const close = () => { const done = () => { drawer.classList.remove('is-open'); document.body.style.overflow = ''; toggle.setAttribute('aria-expanded', 'false'); (drawerLast || toggle).focus(); }; if (DS.motion && DS.motion.drawerOut) DS.motion.drawerOut(drawer, done); else done(); };
    toggle.addEventListener('click', () => drawer.classList.contains('is-open') ? close() : open());
    drawer.addEventListener('click', e => { if (e.target.closest('[data-drawer-close]')) close(); });
    drawer.addEventListener('keydown', e => {
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') { const f = $$(FOCUSABLE, drawer); const first = f[0], last = f[f.length - 1]; if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); } }
    });
    window.addEventListener('resize', () => { if (window.innerWidth > 1023 && drawer.classList.contains('is-open')) close(); });
  }

  /* ---------- Accordion & tabs (shared) ---------- */
  DS.accordion = root => {
    $$('.acc-btn', root).forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.acc-item'), panel = $('.acc-panel', item), open = item.classList.contains('is-open');
        if (root.dataset.single === 'true') $$('.acc-item.is-open', root).forEach(o => { if (o !== item) collapse(o); });
        open ? collapse(item) : expand(item);
        function expand(it) { it.classList.add('is-open'); $('.acc-btn', it).setAttribute('aria-expanded', 'true'); const p = $('.acc-panel', it); if (DS.motion && DS.motion.expand) DS.motion.expand(p); else p.style.height = 'auto'; }
        function collapse(it) { it.classList.remove('is-open'); $('.acc-btn', it).setAttribute('aria-expanded', 'false'); const p = $('.acc-panel', it); if (DS.motion && DS.motion.collapse) DS.motion.collapse(p); else p.style.height = '0px'; }
        void panel;
      });
    });
  };
  DS.tabs = root => {
    const tabs = $$('[role="tab"]', root), panels = tabs.map(t => document.getElementById(t.getAttribute('aria-controls')));
    const activate = (i, focus) => {
      tabs.forEach((t, j) => { const on = i === j; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; const p = panels[j]; if (!p) return; if (on) { if (p.hidden) { p.hidden = false; if (DS.motion && DS.motion.tabIn) DS.motion.tabIn(p); } } else p.hidden = true; });
      if (focus) tabs[i].focus();
      root.dispatchEvent(new CustomEvent('ds:tab', { detail: { index: i, tab: tabs[i] } }));
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => activate(i));
      t.addEventListener('keydown', e => { const k = e.key; let n = i; if (k === 'ArrowRight') n = (i + 1) % tabs.length; else if (k === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length; else if (k === 'Home') n = 0; else if (k === 'End') n = tabs.length - 1; else return; e.preventDefault(); activate(n, true); });
    });
    return { activate };
  };

  /* ---------- Card renderers ---------- */
  DS.badgeForVisa = v => v === 'required' ? `<span class="badge badge--glass">${DS.icon('passport')}Visa assisted</span>` : v === 'visa-free' ? `<span class="badge badge--glass">${DS.icon('check')}Visa-free</span>` : v === 'check' ? `<span class="badge badge--glass">${DS.icon('info')}Entry rules vary</span>` : `<span class="badge badge--glass">${DS.icon('sun')}Domestic</span>`;
  /* "Japan, Japan" reads badly: show the country once when destination and country match */
  DS.placeLabel = p => (p.destination === p.country || p.country.startsWith(p.destination)) ? p.country : `${p.destination}, ${p.country}`;
  DS.renderDestinationCard = (d, opts = {}) => {
    const pkgs = DS.packagesFor(d.id), priced = pkgs.filter(DS.hasPrice), from = priced.length ? Math.min(...priced.map(p => p.priceFrom)) : 0;
    return `<a class="dest-card ${opts.wide ? 'dest-card--wide' : ''}" href="explore.html?dest=${d.id}">
      <div class="dest-card__media">${DS.picture(d.image, '', { w: 600, h: 750, label: d.name })}</div>
      <div class="dest-card__top">${DS.badgeForVisa(d.visa)}</div>
      <div class="dest-card__body">
        <h3 class="dest-card__name">${esc(d.name)}</h3>
        <p class="dest-card__tag">${esc(d.tagline)}</p>
        <div class="dest-card__meta"><span>${from ? `From <strong>${fmtPHP(from)}</strong>` : 'Price on request'} · ${pkgs.length} package${pkgs.length === 1 ? '' : 's'}</span><span class="dest-card__arrow" aria-hidden="true">${DS.icon('arrowUpRight')}</span></div>
      </div></a>`;
  };
  /* Short inclusion tags for cards (derived from the full inclusion list) */
  DS.keyInclusions = p => {
    const tags = [];
    const has = re => p.inclusions.some(i => re.test(i));
    if (has(/airfare|flights/i)) tags.push('Flights included');
    const n = p.inclusions.map(i => i.match(/(\d+)\s*nights?/i)).find(Boolean); if (n) tags.push(`${n[1]} night${n[1] === '1' ? '' : 's'} stay`);
    if (has(/breakfast/i)) tags.push('Daily breakfast');
    if (has(/visa/i)) tags.push('Visa assistance');
    if (has(/transfer/i) && tags.length < 3) tags.push('Transfers');
    if (has(/insurance/i) && tags.length < 3) tags.push('Insurance');
    return tags.slice(0, 3);
  };
  /* Optional pricing: packages without priceFrom read "Price on request" everywhere */
  DS.priceBlock = p => DS.hasPrice(p)
    ? `<div class="pkg-card__price"><small>From, per person</small><span class="price">${fmtPHP(p.priceFrom)} <em>sample</em></span></div>`
    : `<div class="pkg-card__price"><small>Quoted by a consultant</small><span class="price price--request">Price on request</span></div>`;
  DS.renderPackageCard = (p, opts = {}) => {
    const incl = DS.keyInclusions(p).map(i => `<span class="badge">${esc(i)}</span>`).join('');
    const next = p.departures[0];
    return `<article class="card pkg-card ${opts.row ? 'pkg-card--row' : ''}" data-pkg="${p.id}">
      <div class="card__media"><a href="package.html?id=${p.id}" tabindex="-1" aria-hidden="true">${DS.picture(p.images[0], '', { w: 640, h: 480, label: p.destination })}</a>
        <div class="card__tags"><span class="badge badge--glass">${DS.icon('clock')}${p.duration.days} days · ${p.duration.nights} nights</span><span class="badge badge--glass">${esc(p.category)}</span></div>
        <button type="button" class="icon-btn card__save" data-cart-add="package" data-ref="${p.id}" aria-pressed="false" aria-label="Add ${esc(p.title)} to Travel Cart">${DS.icon('bagPlus')}</button></div>
      <div class="pkg-card__body">
        <div class="pkg-card__loc">${DS.icon('pin')}${esc(DS.placeLabel(p))}</div>
        <h3 class="pkg-card__title"><a href="package.html?id=${p.id}">${esc(p.title)}</a></h3>
        <div class="pkg-card__meta"><span>${DS.icon('calendar')}Next: ${esc(fmtDate(next.date))}</span><span>${p.departures.length} sample dates</span></div>
        <div class="pkg-card__incl">${incl}</div>
        <div class="pkg-card__foot">${DS.priceBlock(p)}<a class="btn btn--sm btn--primary" href="package.html?id=${p.id}">View details ${DS.icon('arrowRight', 'arrow')}</a></div>
      </div></article>`;
  };
  DS.renderStoryCard = s => `<button type="button" class="card story-card" data-story="${s.id}" aria-haspopup="dialog">
      <div class="card__media">${DS.picture(s.image, s.title, { w: 640, h: 400, label: s.category })}</div>
      <div class="story-card__body"><span class="story-card__cat">${esc(s.category)}</span><h3 class="story-card__title">${esc(s.title)}</h3><p class="story-card__excerpt">${esc(s.excerpt)}</p><div class="story-card__foot"><span>${esc(s.date)}</span><span>${esc(s.readTime)} read</span></div></div></button>`;
  DS.renderServiceCard = s => `<button type="button" class="service-card" data-service-card="${s.id}">
      <div class="service-card__media">${DS.picture(s.image, s.name, { w: 560, h: 350, label: s.short })}</div>
      <div class="service-card__body"><span class="service-card__icon" aria-hidden="true">${DS.icon(s.icon)}</span><h3>${esc(s.name)} ${DS.icon('arrowRight')}</h3><p>${esc(s.blurb)}</p></div></button>`;
  DS.skeletons = n => Array.from({ length: n }, () => `<div class="skeleton-card" aria-hidden="true"><div class="sk-media shimmer"></div><div class="sk-body"><div class="sk-line sk-line--w40 shimmer"></div><div class="sk-line sk-line--w80 shimmer"></div><div class="sk-line sk-line--w60 shimmer"></div></div></div>`).join('');

  /* Service routing: services without a dedicated demo flow open an enquiry panel */
  DS.routeService = (id, extra = {}) => {
    const s = DS.services.find(x => x.id === id); if (!s) return;
    if (s.flow === 'packages') { location.href = 'explore.html' + (extra.query ? '?' + extra.query : ''); return; }
    if (s.flow === 'visa') { location.href = 'visa.html' + (extra.dest ? '?dest=' + extra.dest : ''); return; }
    // Bookable services become Travel Cart requests; corporate travel stays a proposal enquiry
    const kind = { flights: 'flight', hotels: 'hotel', transport: 'transport', cruises: 'cruise', insurance: 'insurance' }[id];
    if (kind && DS.cart && !extra.destination) { DS.cart.openForm(kind, { values: { adults: 2, children: 0 } }); return; }
    DS.openEnquiry({ service: id, title: `${s.name} enquiry`, subtitle: `${s.blurb} A consultant prepares options and sends a quotation.`, ...extra });
  };
  // Only explicit service-card buttons route. (Previously this matched any [data-service] ancestor,
  // including the Flights/Hotels/... search forms, so clicking a field opened the enquiry modal.)
  document.addEventListener('click', e => { const c = e.target.closest('[data-service-card]'); if (c) DS.routeService(c.dataset.serviceCard); });

  /* Story reader */
  DS.openStory = id => {
    const s = DS.stories.find(x => x.id === id); if (!s) return;
    const related = DS.packages.filter(p => s.title.toLowerCase().includes(p.destination.toLowerCase()) || s.id.includes(p.destinationId.split('-')[0])).slice(0, 2);
    DS.modal.open(`<div class="story-body"><div class="story-hero">${DS.picture(s.image, s.title, { w: 900, h: 506, label: s.category })}</div>${s.body}${related.length ? `<hr class="divider"><h3>Related sample packages</h3><div class="grid grid--2">${related.map(p => DS.renderPackageCard(p)).join('')}</div>` : ''}<div class="cluster" style="margin-top:1.5rem"><button type="button" class="btn btn--dark" data-enquiry data-title="Ask a consultant about this" data-message="I read “${esc(s.title)}” and would like advice on planning a similar trip.">Ask a consultant ${DS.icon('arrowRight', 'arrow')}</button></div></div>`, { title: s.title, subtitle: `${s.category} · ${s.readTime} read · ${s.date}`, large: true });
  };
  document.addEventListener('click', e => { const c = e.target.closest('[data-story]'); if (c) DS.openStory(c.dataset.story); });

  /* ---------- Shared form pieces: month list, destination list, traveller picker ---------- */
  /* Next 12 months as YYYY-MM values (readable labels instead of a raw date field) */
  DS.monthOptions = (sel = '', anyLabel = 'Any month') => {
    const now = new Date(); const out = [`<option value="">${esc(anyLabel)}</option>`];
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const v = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      out.push(`<option value="${v}" ${sel === v ? 'selected' : ''}>${d.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })}</option>`);
    }
    return out.join('');
  };
  DS.fmtMonth = v => { if (!/^\d{4}-\d{2}$/.test(v || '')) return v || ''; const [y, m] = v.split('-'); return new Date(+y, +m - 1, 1).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' }); };
  /* Destinations for one trip type, grouped by region. Trip type comes first in every
     form, so the list never mixes Boracay with Japan. */
  DS.destOptions = (type, sel = '', opts = {}) => {
    const list = DS.destinations.filter(d => !type || d.type === type);
    const regions = [...new Set(list.map(d => d.region))];
    const any = opts.anyLabel !== undefined ? opts.anyLabel : 'Any destination';
    const count = d => { const n = DS.packagesFor(d.id).length; return opts.counts ? ` (${n} package${n === 1 ? '' : 's'})` : ''; };
    return (any ? `<option value="">${esc(any)}</option>` : '') +
      regions.map(r => `<optgroup label="${esc(r)}">${list.filter(d => d.region === r).map(d => `<option value="${d.id}" ${sel === d.id ? 'selected' : ''}>${esc(d.name)}${count(d)}</option>`).join('')}</optgroup>`).join('') +
      (opts.other ? `<option value="other" ${sel === 'other' ? 'selected' : ''}>Somewhere else</option>` : '');
  };
  DS.paxLabel = (a, c, noun = 'traveller') => {
    if (noun !== 'traveller') { const n = a + c; return `${n} ${noun}${n === 1 ? '' : 's'}`; }
    return `${a} adult${a === 1 ? '' : 's'}${c ? `, ${c} child${c === 1 ? '' : 'ren'}` : ''}`;
  };
  /* Traveller picker: a button that opens a small panel with adult/child counters.
     Values travel in hidden inputs named adults/children so FormData just works. */
  let paxSeq = 0;
  DS.paxPicker = (o = {}) => {
    const id = 'pax-' + (++paxSeq), a = o.adults ?? 2, c = o.children ?? 0, max = o.max || 12;
    return `<div class="field pax" data-pax data-max="${max}" data-noun="${esc(o.noun || 'traveller')}">
      <span class="field__label" id="${id}-l">${esc(o.label || 'Travellers')}</span>
      <button type="button" class="pax__btn" id="${id}-b" aria-haspopup="true" aria-expanded="false" aria-controls="${id}-p" aria-labelledby="${id}-l ${id}-b">${DS.icon('users')}<span data-pax-text>${esc(DS.paxLabel(a, c, o.noun))}</span>${DS.icon('chevronDown', 'pax__chev')}</button>
      <div class="pax__pop" id="${id}-p" hidden>
        <div class="counter-row"><div><strong>Adults</strong><span>12 years and above</span></div><div class="counter"><button type="button" class="counter__btn" data-pax-step="adults" data-d="-1" aria-label="Fewer adults">${DS.icon('minus')}</button><span class="counter__val" data-pax-val="adults" aria-live="polite">${a}</span><button type="button" class="counter__btn" data-pax-step="adults" data-d="1" aria-label="More adults">${DS.icon('plus')}</button></div></div>
        <div class="counter-row"><div><strong>Children</strong><span>2 to 11 years</span></div><div class="counter"><button type="button" class="counter__btn" data-pax-step="children" data-d="-1" aria-label="Fewer children">${DS.icon('minus')}</button><span class="counter__val" data-pax-val="children" aria-live="polite">${c}</span><button type="button" class="counter__btn" data-pax-step="children" data-d="1" aria-label="More children">${DS.icon('plus')}</button></div></div>
        <button type="button" class="btn btn--sm btn--dark btn--block" data-pax-done>Done</button>
      </div>
      <input type="hidden" name="adults" value="${a}"><input type="hidden" name="children" value="${c}">
    </div>`;
  };
  const paxSync = root => {
    const a = +$('input[name="adults"]', root).value, c = +$('input[name="children"]', root).value, max = +root.dataset.max;
    $('[data-pax-val="adults"]', root).textContent = a; $('[data-pax-val="children"]', root).textContent = c;
    $('[data-pax-text]', root).textContent = DS.paxLabel(a, c, root.dataset.noun);
    $$('[data-pax-step]', root).forEach(b => { const k = b.dataset.paxStep, n = (k === 'adults' ? a : c) + +b.dataset.d; b.disabled = (k === 'adults' ? n < 1 : n < 0) || a + c + +b.dataset.d > max && +b.dataset.d > 0; });
  };
  const paxClose = (root, focus) => { const pop = $('.pax__pop', root); if (pop.hidden) return; pop.hidden = true; $('.pax__btn', root).setAttribute('aria-expanded', 'false'); if (focus) $('.pax__btn', root).focus(); };
  document.addEventListener('click', e => {
    const open = $$('[data-pax]').filter(r => !$('.pax__pop', r).hidden);
    const btn = e.target.closest('.pax__btn');
    open.forEach(r => { if (!r.contains(e.target)) paxClose(r); });
    if (btn) { const root = btn.closest('[data-pax]'), pop = $('.pax__pop', root), show = pop.hidden; pop.hidden = !show; btn.setAttribute('aria-expanded', String(show)); if (show) { const r = btn.getBoundingClientRect(); pop.classList.toggle('pax__pop--up', !!btn.closest('.modal') && r.bottom + 270 > window.innerHeight && r.top > 280); paxSync(root); $('[data-pax-step="adults"][data-d="1"]', root).focus(); } return; }
    const step = e.target.closest('[data-pax-step]');
    if (step && !step.disabled) { const root = step.closest('[data-pax]'), inp = $(`input[name="${step.dataset.paxStep}"]`, root); inp.value = +inp.value + +step.dataset.d; paxSync(root); inp.dispatchEvent(new Event('change', { bubbles: true })); if (DS.motion && DS.motion.pop) DS.motion.pop($(`[data-pax-val="${step.dataset.paxStep}"]`, root)); return; }
    const done = e.target.closest('[data-pax-done]'); if (done) paxClose(done.closest('[data-pax]'), true);
  });
  // Escape closes only the open picker (and must not also close a surrounding modal)
  document.addEventListener('keydown', e => { if (e.key !== 'Escape') return; const r = e.target.closest && e.target.closest('[data-pax]'); if (r && !$('.pax__pop', r).hidden) { e.stopPropagation(); paxClose(r, true); } }, true);

  /* ---------- Search widget (homepage) ----------
     Trip type comes first; the destination list is rebuilt from it. Tours searches the
     catalogue; every other service adds a request to the Travel Cart. */
  function initSearchWidget() {
    const w = $('[data-search-widget]'); if (!w) return;
    const tabs = $('.search-tabs', w), panel = $('.search-panel', w);
    const TAB_LABEL = { tours: 'Tours & Packages', visa: 'Visa', flights: 'Flights', hotels: 'Hotels', transport: 'Transport', cruises: 'Cruises', insurance: 'Insurance', corporate: 'Corporate' };
    const KIND = { flights: 'flight', hotels: 'hotel', transport: 'transport', cruises: 'cruise', insurance: 'insurance', visa: 'visa' };
    tabs.innerHTML = DS.services.map((s, i) => `<button type="button" role="tab" class="search-tab" id="stab-${s.id}" aria-selected="${i === 0}" aria-controls="spanel" data-tab="${s.id}" tabindex="${i === 0 ? 0 : -1}">${DS.icon(s.icon)}${esc(TAB_LABEL[s.id] || s.name)}</button>`).join('');
    const today = new Date().toISOString().slice(0, 10);
    const st = { type: 'international' };
    const C = DS.cartCatalog;
    const typeField = () => `<div class="field trip-type" role="radiogroup" aria-labelledby="sw-type-l"><span class="field__label" id="sw-type-l">${DS.icon('compass')}Trip type</span><div class="seg seg--type">
        <label class="seg__opt"><input type="radio" name="type" value="international" ${st.type === 'international' ? 'checked' : ''}><span>${DS.icon('globe')}International</span></label>
        <label class="seg__opt"><input type="radio" name="type" value="domestic" ${st.type === 'domestic' ? 'checked' : ''}><span>${DS.icon('sun')}Domestic</span></label></div><span class="trip-type__help" data-type-help>${typeHelp()}</span></div>`;
    const typeHelp = () => { const n = DS.destinations.filter(d => d.type === st.type).length; return st.type === 'domestic' ? `${n} Philippine destinations, no visa needed` : `${n} destinations across Asia, visa help included`; };
    const sel = (id, label, icon, options, name) => `<div class="field"><label class="field__label" for="${id}">${label}</label><div class="field__control">${DS.icon(icon)}<select class="select" id="${id}" name="${name}">${options}</select></div></div>`;
    const date = (id, label, name) => `<div class="field"><label class="field__label" for="${id}">${label}</label><div class="field__control">${DS.icon('calendar')}<input class="input" id="${id}" name="${name}" type="date" min="${today}"></div></div>`;
    const addBtn = `<button type="submit" class="btn btn--primary btn--lg search-form__submit" data-action="cart">${DS.icon('bagPlus')} Add to Travel Cart</button>`;
    const hint = (icon, text) => `<p class="search-form__hint">${DS.icon(icon)}<span>${text}</span></p>`;
    const destSel = (id, label, other) => sel(id, label, 'pin', DS.destOptions(st.type, '', { other }), 'dest');
    const FORMS = {
      tours: () => ({ cols: 3, type: true, body: destSel('sw-dest', 'Destination') + sel('sw-month', 'Travel month', 'calendar', DS.monthOptions(), 'month') + DS.paxPicker({ label: 'Travellers' }),
        cta: `<button type="submit" class="btn btn--primary btn--lg search-form__submit" data-action="search">${DS.icon('search')} Search packages</button>`,
        hint: hint('sparkles', 'Choose a trip type first: the destination list follows it. Prices are sample data, and some packages are priced on request.') }),
      visa: () => ({ cols: 3, body: sel('sw-visa', 'Visa for', 'passport', C.visa.map(v => `<option value="${v.id}">${esc(v.name)}</option>`).join(''), 'country') + sel('sw-vmonth', 'Travel month', 'calendar', DS.monthOptions('', 'Not decided yet'), 'month') + DS.paxPicker({ label: 'Applicants', adults: 1, noun: 'applicant' }),
        cta: addBtn, hint: hint('passport', 'Visa assistance is for international trips. Want to see the documents first? <a href="visa.html">Run the Visa Readiness Checker</a>.') }),
      flights: () => ({ cols: 4, type: true, body: sel('sw-from', 'From', 'plane', C.origins.map(o => `<option value="${o.id}">${esc(o.name)}</option>`).join(''), 'origin') + destSel('sw-to', 'To', true).replace(/<option value="">[^<]*<\/option>/, '<option value="">Where to?</option>') + date('sw-fdate', 'Departure', 'depart') + DS.paxPicker({ label: 'Passengers', noun: 'passenger' }),
        cta: addBtn, hint: hint('headset', 'Fares are found and booked by your consultant. Add return dates and cabin class in your cart.') }),
      hotels: () => ({ cols: 3, type: true, body: destSel('sw-hdest', 'Destination') + date('sw-hin', 'Check-in', 'checkin') + DS.paxPicker({ label: 'Guests', noun: 'guest' }),
        cta: addBtn, hint: hint('bed', 'Set nights, rooms and hotel class in your cart. Your consultant sends options that match your package.') }),
      transport: () => ({ cols: 3, type: true, body: destSel('sw-tdest', 'Destination') + date('sw-tdate', 'Date', 'date') + DS.paxPicker({ label: 'Passengers', noun: 'passenger' }),
        cta: addBtn, hint: hint('car', 'Airport transfer by default. Switch to a day tour or a private van in your cart.') }),
      cruises: () => ({ cols: 3, body: sel('sw-region', 'Cruise region', 'ship', C.cruiseRegions.map(r => `<option>${esc(r)}</option>`).join(''), 'region') + sel('sw-cmonth', 'Sailing month', 'calendar', DS.monthOptions('', 'Flexible'), 'month') + DS.paxPicker({ label: 'Guests', noun: 'guest' }),
        cta: addBtn, hint: hint('ship', 'Cruise fares are quoted by your consultant, with pre- and post-cruise plans.') }),
      insurance: () => ({ cols: 3, type: true, body: destSel('sw-idest', 'Destination') + date('sw-idate', 'Departure', 'depart') + DS.paxPicker({ label: 'Travellers' }),
        cta: addBtn, hint: hint('shield', 'Cover is explained in plain language before you buy. Choose standard or comprehensive in your cart.') }),
      corporate: () => ({ cols: 3, type: true, body: destSel('sw-cdest', 'Destination') + sel('sw-codate', 'Travel month', 'calendar', DS.monthOptions('', 'Not decided yet'), 'month') + DS.paxPicker({ label: 'Delegates', noun: 'delegate', adults: 10, max: 60 }),
        cta: `<button type="submit" class="btn btn--dark btn--lg search-form__submit" data-action="enquiry">${DS.icon('briefcase')} Request a proposal</button>`,
        hint: hint('briefcase', 'Corporate and group travel gets a dedicated consultant and a written proposal.') })
    };
    let current = 'tours';
    const render = id => {
      current = id;
      const f = FORMS[id]();
      panel.innerHTML = `<form class="search-form ${f.type ? 'has-type' : ''}" style="--cols:${f.cols}" data-tabform="${id}" novalidate>${f.type ? typeField() : ''}${f.body}${f.cta}${f.hint}</form>`;
      // Tours lists show how many sample packages each destination has
      if (id === 'tours') $('#sw-dest', panel).innerHTML = DS.destOptions(st.type, '', { counts: true });
      panel.id = 'spanel'; panel.setAttribute('role', 'tabpanel'); panel.setAttribute('aria-labelledby', 'stab-' + id);
      if (DS.motion && DS.motion.tabIn) DS.motion.tabIn(panel);
    };
    DS.tabs(w); w.addEventListener('ds:tab', e => render(e.detail.tab.dataset.tab));
    render('tours');
    // Trip type change: rebuild every destination list in the form, keep other values
    w.addEventListener('change', e => {
      if (e.target.name !== 'type') return;
      st.type = e.target.value;
      const form = e.target.form;
      const help = $('[data-type-help]', form); if (help) help.textContent = typeHelp();
      $$('select[name="dest"]', form).forEach(s => {
        const flights = s.id === 'sw-to';
        s.innerHTML = DS.destOptions(st.type, '', { counts: current === 'tours', other: flights });
        if (flights) s.options[0].textContent = 'Where to?';
        if (DS.motion && DS.motion.pop) DS.motion.pop(s.closest('.field__control'));
      });
    });
    w.addEventListener('submit', e => {
      e.preventDefault(); const f = e.target; const data = Object.fromEntries(new FormData(f).entries());
      const action = (e.submitter && e.submitter.dataset.action) || 'search';
      const adults = +data.adults || 1, children = +data.children || 0;
      if (action === 'search') {
        const q = new URLSearchParams(); if (data.dest) q.set('dest', data.dest); if (data.type) q.set('type', data.type); if (data.month) q.set('month', data.month); q.set('adults', adults); if (children) q.set('children', children);
        location.href = 'explore.html?' + q.toString(); return;
      }
      if (action === 'enquiry') {
        const d = DS.getDestination(data.dest);
        DS.routeService('corporate', { destination: d ? d.name : 'Multiple / undecided', travellers: adults + children, message: data.month ? `Planned travel month: ${DS.fmtMonth(data.month)}.` : '' }); return;
      }
      const kind = KIND[current];
      if (kind === 'flight' && !data.dest) { DS.toast('Choose where you are flying to.', { type: 'error' }); $('#sw-to', f).focus(); return; }
      const details = { ...data, adults, children }; delete details.type;
      if (kind === 'hotel') Object.assign(details, { nights: 3, rooms: 1, stars: 'Any' });
      if (kind === 'flight') Object.assign(details, { to: data.dest, cabin: 'Economy', ret: '' });
      if (kind === 'transport') details.service = 'Airport transfer';
      if (kind === 'cruise') details.cabin = 'Ocean view';
      if (kind === 'insurance') Object.assign(details, { plan: 'Standard cover', ret: '' });
      if (DS.cart) DS.cart.addAndShow(kind, details);
    });
  }

  /* ---------- Homepage rendering ---------- */
  function initHome() {
    if (document.body.dataset.page !== 'home') return;
    const dests = $('[data-destinations]'), feat = $('[data-featured]'), stories = $('[data-stories]'), services = $('[data-services]');
    if (dests) dests.innerHTML = DS.destinations.map(d => DS.renderDestinationCard(d)).join('');
    if (feat) { feat.innerHTML = DS.skeletons(3); setTimeout(() => { feat.innerHTML = DS.featuredIds.map(id => DS.renderPackageCard(DS.getPackage(id))).join(''); DS.hydrateImages(feat); refreshSavedBadges(); if (DS.motion && DS.motion.revealNew) DS.motion.revealNew(feat); }, 420); }
    if (stories) stories.innerHTML = DS.stories.map(DS.renderStoryCard).join('');
    if (services) services.innerHTML = DS.services.map(DS.renderServiceCard).join('');
    initSearchWidget();
  }

  /* ---------- Share helper ---------- */
  DS.share = async (title, url) => {
    try { if (navigator.share) { await navigator.share({ title, url }); return; } } catch { /* user cancelled */ return; }
    try { await navigator.clipboard.writeText(url); DS.toast('Link copied to clipboard.'); } catch { DS.toast('Copy this link: ' + url); }
  };

  /* ---------- Boot ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    $$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
    initHeader(); initHome(); refreshSavedBadges(); DS.hydrateImages();
    $$('[data-accordion]').forEach(DS.accordion);
    $$('[data-tabs]').forEach(DS.tabs);
    document.addEventListener('click', e => {
      const l = e.target.closest('[data-consult]'); if (!l) return; e.preventDefault();
      DS.openEnquiry({ service: 'consult', title: 'Talk to a travel consultant', subtitle: 'A real travel consultant reads every message. Tell us where you are headed and we will plan around you.' });
    });
    const tel = $$('a[href^="tel:"]'); tel.forEach(a => a.setAttribute('rel', 'nofollow'));
  });
})(window.DS);
