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
      // Swapping one form for another keeps focus returning to what opened the first
      if (!root.classList.contains('is-open')) lastFocus = document.activeElement;
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
          <div class="field"><label class="field__label" for="enq-pax">Number of travelers</label><input class="input" id="enq-pax" name="travelers" type="number" min="1" max="100" required value="${pre.travelers || 2}"><span class="field__error" aria-live="polite"></span></div>
          <div class="field"><label class="field__label" for="enq-date">Estimated travel date</label><input class="input" id="enq-date" name="date" type="date" min="${new Date().toISOString().slice(0, 10)}" value="${pre.date || ''}"><span class="field__help">Leave blank if you are still flexible.</span><span class="field__error"></span></div>
          <div class="field"><label class="field__label" for="enq-contact">Preferred contact</label><select class="select" id="enq-contact" name="contact"><option>Viber</option><option>WhatsApp</option><option>Messenger</option><option>Phone call</option><option>Email</option></select></div>
          <div class="field field--full"><label class="field__label" for="enq-msg">Tell us about your trip</label><textarea class="textarea" id="enq-msg" name="message" required data-minlen="12" placeholder="Who is traveling, what you would like to see, your budget range, and anything we should know.">${esc(pre.message || '')}</textarea><span class="field__error" aria-live="polite"></span></div>
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
    const next = DS.departuresFor(p)[0];
    return `<article class="card pkg-card ${opts.row ? 'pkg-card--row' : ''}" data-pkg="${p.id}">
      <div class="card__media"><a href="package.html?id=${p.id}" tabindex="-1" aria-hidden="true">${DS.picture(p.images[0], '', { w: 640, h: 480, label: p.destination })}</a>
        <div class="card__tags"><span class="badge badge--glass">${DS.icon('clock')}${p.duration.days} days · ${p.duration.nights} nights</span><span class="badge badge--glass">${esc(p.category)}</span></div>
        <button type="button" class="icon-btn card__save" data-cart-add="package" data-ref="${p.id}" aria-pressed="false" aria-label="Add ${esc(p.title)} to Travel Cart">${DS.icon('bagPlus')}</button></div>
      <div class="pkg-card__body">
        <div class="pkg-card__loc">${DS.icon('pin')}${esc(DS.placeLabel(p))}</div>
        <h3 class="pkg-card__title"><a href="package.html?id=${p.id}">${esc(p.title)}</a></h3>
        <div class="pkg-card__meta"><span>${DS.icon('calendar')}${next ? (opts.match ? `<strong class="pkg-card__match">${esc(opts.match)}</strong>` : `Next: ${esc(DS.fmtRange(next.date, next.ret))}`) : 'Dates on request'}</span>${p.validUntil ? `<span>Valid until ${esc(fmtDate(p.validUntil))}</span>` : ''}</div>
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

  /* ---------- Shared form pieces: months, destinations, travelers, dates, places ---------- */
  /* Next n months as YYYY-MM values (readable labels instead of a raw date field) */
  const nextMonths = (n = 18) => { const now = new Date(); return Array.from({ length: n }, (_, i) => { const d = new Date(now.getFullYear(), now.getMonth() + i, 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; }); };
  DS.monthOptions = (sel = '', anyLabel = 'Any month') => [`<option value="">${esc(anyLabel)}</option>`, ...nextMonths(12).map(v => `<option value="${v}" ${sel === v ? 'selected' : ''}>${DS.fmtMonth(v)}</option>`)].join('');
  DS.fmtMonth = v => { if (!/^\d{4}-\d{2}$/.test(v || '')) return v || ''; const [y, m] = v.split('-'); return new Date(+y, +m - 1, 1).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' }); };
  DS.fmtMonthShort = v => { if (!/^\d{4}-\d{2}$/.test(v || '')) return v || ''; const [y, m] = v.split('-'); return new Date(+y, +m - 1, 1).toLocaleDateString('en-PH', { month: 'short', year: 'numeric' }); };
  const asDate = iso => new Date(iso + 'T00:00:00');
  /* "Mar 18 – 23, 2027", "Mar 28 – Apr 2, 2027", "Dec 28, 2026 – Jan 2, 2027" */
  DS.fmtRange = (a, b) => {
    if (!a) return ''; if (!b) return fmtDate(a);
    const x = asDate(a), y = asDate(b), md = { month: 'short', day: 'numeric' };
    if (x.getFullYear() !== y.getFullYear()) return `${fmtDate(a)} – ${fmtDate(b)}`;
    if (x.getMonth() === y.getMonth()) return `${x.toLocaleDateString('en-PH', md)} – ${y.getDate()}, ${y.getFullYear()}`;
    return `${x.toLocaleDateString('en-PH', md)} – ${y.toLocaleDateString('en-PH', md)}, ${y.getFullYear()}`;
  };
  DS.weekday = iso => asDate(iso).toLocaleDateString('en-PH', { weekday: 'short' });

  /* Destinations for one trip type, grouped by region. Trip type comes first in the
     Tours form, so the list never mixes Boracay with Japan. */
  DS.destOptions = (type, sel = '', opts = {}) => {
    const list = DS.destinations.filter(d => !type || d.type === type);
    const regions = [...new Set(list.map(d => d.region))];
    const any = opts.anyLabel !== undefined ? opts.anyLabel : 'Any destination';
    const count = d => { const n = DS.packagesFor(d.id).length; return opts.counts ? ` (${n} package${n === 1 ? '' : 's'})` : ''; };
    return (any ? `<option value="">${esc(any)}</option>` : '') +
      regions.map(r => `<optgroup label="${esc(r)}">${list.filter(d => d.region === r).map(d => `<option value="${d.id}" ${sel === d.id ? 'selected' : ''}>${esc(d.name)}${count(d)}</option>`).join('')}</optgroup>`).join('') +
      (opts.other ? `<option value="other" ${sel === 'other' ? 'selected' : ''}>Somewhere else</option>` : '');
  };
  /* Travelers: counters go up to 12 people. Larger parties (13 to 100) switch to a
     group booking with a single number, a dedicated coordinator and group rates. */
  const PAX_MAX = 12, GROUP_MIN = 13, GROUP_MAX = 100;
  Object.assign(DS, { PAX_MAX, GROUP_MIN, GROUP_MAX });
  DS.paxLabel = (a, c, noun = 'traveler', rooms, group) => {
    const r = rooms ? ` · ${rooms} room${rooms === 1 ? '' : 's'}` : '';
    if (group) return `Group of ${a} ${noun}s${r}`;
    if (noun !== 'traveler') { const n = a + c; return `${n} ${noun}${n === 1 ? '' : 's'}${r}`; }
    return `${a} adult${a === 1 ? '' : 's'}${c ? `, ${c} child${c === 1 ? '' : 'ren'}` : ''}${r}`;
  };
  /* Traveler picker. On the page it is a button with a small popover; inside a modal
     (inline: true) the counters sit in the form, so nothing opens on top of other fields.
     Values travel in hidden inputs adults / children / rooms / group so FormData just works. */
  let paxSeq = 0;
  const counterRow = (key, title, sub, val, noun) => `<div class="counter-row"><div><strong>${title}</strong><span>${sub}</span></div><div class="counter"><button type="button" class="counter__btn" data-pax-step="${key}" data-d="-1" aria-label="Fewer ${noun}">${DS.icon('minus')}</button><span class="counter__val" data-pax-val="${key}" aria-live="polite">${val}</span><button type="button" class="counter__btn" data-pax-step="${key}" data-d="1" aria-label="More ${noun}">${DS.icon('plus')}</button></div></div>`;
  DS.paxPicker = (o = {}) => {
    const id = 'pax-' + (++paxSeq), noun = o.noun || 'traveler', rooms = o.rooms;
    let a = o.adults ?? 2, c = o.children ?? 0;
    const group = o.group === true || o.group === '1' || a + c > PAX_MAX;
    if (group) { a = Math.min(GROUP_MAX, Math.max(GROUP_MIN, a + c)); c = 0; }
    const panel = `<div class="pax__counters" ${group ? 'hidden' : ''}>
        ${counterRow('adults', 'Adults', '12 years and above', a, 'adults')}
        ${counterRow('children', 'Children', o.childNote || '2 to 11 years', c, 'children')}
      </div>
      <div class="pax__group" ${group ? '' : 'hidden'}>
        <label class="pax__group-label" for="${id}-g"><strong>Group size</strong><span>${GROUP_MIN} to ${GROUP_MAX} ${esc(noun)}s</span></label>
        <input class="input pax__group-input" type="number" id="${id}-g" min="${GROUP_MIN}" max="${GROUP_MAX}" step="1" inputmode="numeric" value="${group ? a : GROUP_MIN}" data-pax-groupn>
        <p class="pax__note">${DS.icon('users')}<span>Groups get a dedicated coordinator and group rates. Add children's ages in your notes.</span></p>
      </div>
      ${rooms ? counterRow('rooms', 'Rooms', 'We suggest a mix', rooms, 'rooms') : ''}
      <button type="button" class="btn btn--link btn--sm pax__switch" data-pax-group="${group ? 'off' : 'on'}">${group ? `Back to individual counts` : `More than ${PAX_MAX}? Book as a group (up to ${GROUP_MAX})`}</button>`;
    const hidden = `<input type="hidden" name="adults" value="${a}"><input type="hidden" name="children" value="${c}">${rooms ? `<input type="hidden" name="rooms" value="${rooms}">` : ''}<input type="hidden" name="group" value="${group ? '1' : ''}">`;
    if (o.inline) return `<div class="field pax pax--inline ${o.full === false ? '' : 'field--full'}" data-pax data-noun="${esc(noun)}" role="group" aria-labelledby="${id}-l">
      <span class="field__label" id="${id}-l">${esc(o.label || 'Travelers')}</span>
      <div class="pax__panel">${panel}</div>${hidden}<span class="field__error" aria-live="polite"></span></div>`;
    return `<div class="field pax" data-pax data-noun="${esc(noun)}">
      <span class="field__label" id="${id}-l">${esc(o.label || 'Travelers')}</span>
      <button type="button" class="pax__btn" id="${id}-b" aria-haspopup="true" aria-expanded="false" aria-controls="${id}-p" aria-labelledby="${id}-l ${id}-b">${DS.icon('users')}<span data-pax-text>${esc(DS.paxLabel(a, c, noun, rooms, group))}</span>${DS.icon('chevronDown', 'pax__chev')}</button>
      <div class="pax__pop" id="${id}-p" hidden>${panel}<button type="button" class="btn btn--sm btn--dark btn--block" data-pax-done>Done</button></div>
      ${hidden}<span class="field__error" aria-live="polite"></span></div>`;
  };
  const paxVal = (root, k) => { const i = $(`input[name="${k}"]`, root); return i ? +i.value || 0 : 0; };
  const paxSync = root => {
    const group = $('input[name="group"]', root).value === '1';
    if (group) { const n = Math.round(+$('[data-pax-groupn]', root).value || 0); if (n >= GROUP_MIN && n <= GROUP_MAX) { $('input[name="adults"]', root).value = n; $('input[name="children"]', root).value = 0; } }
    const a = paxVal(root, 'adults'), c = paxVal(root, 'children'), r = paxVal(root, 'rooms');
    const roomsMax = Math.min(50, Math.max(1, a + c));
    const ri = $('input[name="rooms"]', root); if (ri && r > roomsMax) ri.value = roomsMax;
    ['adults', 'children', 'rooms'].forEach(k => { const el = $(`[data-pax-val="${k}"]`, root); if (el) el.textContent = paxVal(root, k); });
    const t = $('[data-pax-text]', root); if (t) t.textContent = DS.paxLabel(a, c, root.dataset.noun, paxVal(root, 'rooms') || undefined, group);
    $$('[data-pax-step]', root).forEach(b => {
      const k = b.dataset.paxStep, d = +b.dataset.d, n = paxVal(root, k) + d;
      if (k === 'rooms') { b.disabled = n < 1 || n > roomsMax; return; }
      b.disabled = (k === 'adults' ? n < 1 : n < 0) || (d > 0 && a + c + d > PAX_MAX);
    });
    // At the 12-person limit, point to group booking
    const sw = $('[data-pax-group="on"]', root); if (sw) sw.classList.toggle('is-hint', a + c >= PAX_MAX);
  };
  DS.paxSync = paxSync;
  const paxClose = (root, focus) => { const pop = $('.pax__pop', root); if (!pop || pop.hidden) return; pop.hidden = true; $('.pax__btn', root).setAttribute('aria-expanded', 'false'); if (focus) $('.pax__btn', root).focus(); };
  function paxGroup(root, on) {
    $('input[name="group"]', root).value = on ? '1' : '';
    $('.pax__counters', root).hidden = on; $('.pax__group', root).hidden = !on;
    const sw = $('.pax__switch', root), noun = root.dataset.noun;
    sw.dataset.paxGroup = on ? 'off' : 'on'; sw.textContent = on ? 'Back to individual counts' : `More than ${PAX_MAX}? Book as a group (up to ${GROUP_MAX})`;
    const gi = $('[data-pax-groupn]', root);
    if (on) { gi.value = Math.max(GROUP_MIN, paxVal(root, 'adults') + paxVal(root, 'children')); gi.focus(); gi.select(); }
    else { $('input[name="adults"]', root).value = Math.min(PAX_MAX, Math.max(1, paxVal(root, 'adults'))); $('input[name="children"]', root).value = 0; void noun; }
    paxSync(root); $('input[name="adults"]', root).dispatchEvent(new Event('change', { bubbles: true }));
  }
  document.addEventListener('click', e => {
    const open = $$('[data-pax]').filter(r => { const p = $('.pax__pop', r); return p && !p.hidden; });
    const btn = e.target.closest('.pax__btn:not(.when__btn)');
    open.forEach(r => { if (!r.contains(e.target)) paxClose(r); });
    if (btn) {
      const root = btn.closest('[data-pax]'), pop = $('.pax__pop', root), show = pop.hidden;
      pop.hidden = !show; btn.setAttribute('aria-expanded', String(show));
      if (show) { paxSync(root); const g = $('input[name="group"]', root).value === '1'; (g ? $('[data-pax-groupn]', root) : $('[data-pax-step="adults"][data-d="1"]', root)).focus({ preventScroll: true }); const r = pop.getBoundingClientRect(); if (r.bottom > window.innerHeight - 8) window.scrollBy({ top: Math.min(r.bottom - window.innerHeight + 16, btn.getBoundingClientRect().top - 80), behavior: 'smooth' }); }
      return;
    }
    const step = e.target.closest('[data-pax-step]');
    if (step && !step.disabled) { const root = step.closest('[data-pax]'), inp = $(`input[name="${step.dataset.paxStep}"]`, root); inp.value = +inp.value + +step.dataset.d; paxSync(root); inp.dispatchEvent(new Event('change', { bubbles: true })); if (DS.motion && DS.motion.pop) DS.motion.pop($(`[data-pax-val="${step.dataset.paxStep}"]`, root)); return; }
    const sw = e.target.closest('[data-pax-group]'); if (sw) { paxGroup(sw.closest('[data-pax]'), sw.dataset.paxGroup === 'on'); return; }
    const done = e.target.closest('[data-pax-done]'); if (done) { const root = done.closest('[data-pax]'); if (DS.paxValidate(root)) paxClose(root, true); }
  });
  document.addEventListener('input', e => { if (e.target.matches && e.target.matches('[data-pax-groupn]')) { const root = e.target.closest('[data-pax]'); root.classList.remove('is-invalid'); paxSync(root); $('input[name="adults"]', root).dispatchEvent(new Event('change', { bubbles: true })); } });
  /* A group must be 13 to 100. Returns false (and shows why) when it is not. */
  DS.paxValidate = root => {
    if (!root || $('input[name="group"]', root).value !== '1') return true;
    const gi = $('[data-pax-groupn]', root), n = +gi.value;
    if (Number.isInteger(n) && n >= GROUP_MIN && n <= GROUP_MAX) { root.classList.remove('is-invalid'); return true; }
    const pop = $('.pax__pop', root); if (pop && pop.hidden) { pop.hidden = false; $('.pax__btn', root).setAttribute('aria-expanded', 'true'); }
    root.classList.add('is-invalid'); $('.field__error', root).textContent = `Enter a group size from ${GROUP_MIN} to ${GROUP_MAX}.`;
    gi.focus(); if (DS.motion && DS.motion.shake) DS.motion.shake(gi);
    return false;
  };
  // Escape closes only the open picker (and must not also close a surrounding modal)
  document.addEventListener('keydown', e => { if (e.key !== 'Escape') return; const r = e.target.closest && e.target.closest('[data-pax]'); const p = r && $('.pax__pop', r); if (p && !p.hidden) { e.stopPropagation(); paxClose(r, true); } }, true);

  /* ---------- Date picker with modes ----------
     One control for "when": exact dates (departure + return), a month, or flexible
     (number of nights, optionally in a month). Each form turns on the modes that make
     sense for it. Values travel in hidden inputs: when, depart, ret, month, nights, retopen.
     In a modal it renders inline (no popover inside a popover). */
  const MODE_LABEL = { dates: 'Exact dates', month: 'Month', flex: 'Flexible' };
  let whenSeq = 0;
  DS.whenText = (v = {}, o = {}) => {
    const when = v.when || (v.depart ? 'dates' : v.month ? 'month' : v.nights ? 'flex' : '');
    const n = +v.nights || 0;
    if (when === 'dates' && v.depart) return v.ret ? DS.fmtRange(v.depart, v.ret) : `From ${fmtDate(v.depart)}${o.oneWay ? ' · one way' : ' · return open'}`;
    if (when === 'month' && v.month) return DS.fmtMonth(v.month);
    if (when === 'flex' && n) return `${n} night${n === 1 ? '' : 's'} · ${v.month ? DS.fmtMonthShort(v.month) : 'any month'}`;
    return o.placeholder || 'Dates to confirm';
  };
  const monthChips = (list, sel) => list.length ? list.map(m => `<button type="button" class="when__month" data-when-month="${m.value}" aria-pressed="${m.value === sel}"><strong>${DS.fmtMonthShort(m.value)}</strong>${m.count ? `<small>${m.count} departure${m.count === 1 ? '' : 's'}</small>` : ''}</button>`).join('') : '<p class="when__help">No scheduled departures for this choice yet. Pick exact dates or try a custom trip.</p>';
  const suggestHTML = (s, v) => s && s.items && s.items.length ? `<div class="when__suggest"><span class="when__sub">${esc(s.heading || 'Scheduled departures')}</span><ul>${s.items.map(d => `<li><button type="button" class="when__dep" data-when-pick data-d="${d.depart}" data-r="${d.ret}" aria-pressed="${v.depart === d.depart && v.ret === d.ret}"><strong>${DS.fmtRange(d.depart, d.ret)}</strong><span>${esc(d.title)}</span></button></li>`).join('')}</ul></div>` : (s && s.empty ? `<p class="when__help when__help--muted">${s.empty}</p>` : '');
  DS.whenPicker = (o = {}) => {
    const id = o.id || 'when-' + (++whenSeq), modes = o.modes || ['dates'];
    const v = { ...(o.value || {}) };
    if (!v.when) v.when = v.depart ? 'dates' : (v.month && modes.includes('month')) ? 'month' : (v.nights && modes.includes('flex')) ? 'flex' : '';
    const mode = modes.includes(v.when) ? v.when : modes[0];
    const L = { depart: 'Departure', ret: 'Return', ...(o.labels || {}) };
    const min = o.min || DS.todayISO(), retOpen = v.retopen === '1' || v.retopen === true;
    const months = o.months || nextMonths(18).map(value => ({ value }));
    const nights = +v.nights || o.nights || 4;
    const panel = (m, inner) => `<div class="when__panel" data-when-panel="${m}" ${m === mode ? '' : 'hidden'}>${inner}</div>`;
    const text = DS.whenText(v, { placeholder: o.placeholder, oneWay: o.oneWay });
    const pop = `${modes.length > 1 ? `<div class="seg seg--when" role="radiogroup" aria-label="How do you want to set dates?">${modes.map(m => `<label class="seg__opt"><input type="radio" name="_mode-${id}" value="${m}" data-when-mode ${m === mode ? 'checked' : ''}><span>${MODE_LABEL[m]}</span></label>`).join('')}</div>` : ''}
      ${modes.includes('dates') ? panel('dates', `<div data-when-suggest>${suggestHTML(o.suggest, v)}</div>
        <div class="when__dates">
          <div class="field"><label class="field__label" for="${id}-d">${L.depart}</label><input class="input" type="date" id="${id}-d" data-when-depart min="${min}" ${o.max ? `max="${o.max}"` : ''} value="${esc(v.when === 'dates' ? v.depart || '' : '')}"><span class="field__error" aria-live="polite"></span></div>
          <div class="field" data-when-retfield ${o.oneWay || retOpen ? 'hidden' : ''}><label class="field__label" for="${id}-r">${L.ret}</label><input class="input" type="date" id="${id}-r" data-when-ret min="${esc(v.depart || min)}" value="${esc(v.when === 'dates' ? v.ret || '' : '')}"><span class="field__error" aria-live="polite"></span></div>
        </div>
        ${o.retOptional ? `<label class="checkbox when__open"><input type="checkbox" data-when-retopen ${retOpen ? 'checked' : ''}><span>${esc(o.retOpenLabel || 'Return date not decided yet')}</span></label>` : ''}
        ${o.datesHelp ? `<p class="when__help">${o.datesHelp}</p>` : ''}`) : ''}
      ${modes.includes('month') ? panel('month', `<div class="when__months" data-when-months>${monthChips(months, v.when === 'month' ? v.month : '')}</div>${o.monthHelp ? `<p class="when__help">${o.monthHelp}</p>` : ''}`) : ''}
      ${modes.includes('flex') ? panel('flex', `<div class="counter-row"><div><strong>Trip length</strong><span>Nights away</span></div><div class="counter"><button type="button" class="counter__btn" data-when-step="-1" aria-label="Fewer nights">${DS.icon('minus')}</button><span class="counter__val" data-when-nights aria-live="polite">${nights}</span><button type="button" class="counter__btn" data-when-step="1" aria-label="More nights">${DS.icon('plus')}</button></div></div>
        <div class="field"><label class="field__label" for="${id}-fm">Around</label><select class="select" id="${id}-fm" data-when-flexmonth>${[`<option value="">Any month</option>`, ...nextMonths(18).map(m => `<option value="${m}" ${v.when === 'flex' && v.month === m ? 'selected' : ''}>${DS.fmtMonth(m)}</option>`)].join('')}</select></div>
        <p class="when__help">Your consultant suggests the best dates for the trip length.</p>`) : ''}
      ${o.inline ? '' : `<div class="when__foot"><button type="button" class="btn btn--link btn--sm" data-when-clear>Clear</button><button type="button" class="btn btn--sm btn--dark" data-when-done>Done</button></div>`}`;
    const hidden = ['when', 'depart', 'ret', 'month', 'nights', 'retopen'].map(k => `<input type="hidden" name="${o.prefix || ''}${k}" data-when-val="${k}" value="${esc(k === 'when' ? (v.when || '') : k === 'retopen' ? (retOpen ? '1' : '') : v[k] || '')}">`).join('');
    return `<div class="field when ${o.inline ? 'when--inline field--full' : ''}" data-when id="${id}" data-placeholder="${esc(o.placeholder || '')}" ${o.oneWay ? 'data-oneway="1"' : ''} data-flex-nights="${nights}">
      ${o.inline ? `<span class="field__label">${esc(o.label || 'Travel dates')}</span>` : `<span class="field__label" id="${id}-l">${esc(o.label || 'Travel dates')}</span>
      <button type="button" class="pax__btn when__btn" id="${id}-b" aria-haspopup="true" aria-expanded="false" aria-controls="${id}-p" aria-labelledby="${id}-l ${id}-b">${DS.icon('calendar')}<span data-when-text>${esc(text)}</span>${DS.icon('chevronDown', 'pax__chev')}</button>`}
      <div class="when__pop" id="${id}-p" ${o.inline ? '' : 'hidden'}>${pop}</div>
      ${hidden}<span class="field__error when__error" aria-live="polite"></span></div>`;
  };
  const wv = (root, k) => $(`[data-when-val="${k}"]`, root);
  const whenMode = root => { const r = $('[data-when-mode]:checked', root); return r ? r.value : ($('[data-when-panel]', root) || {}).dataset?.whenPanel || 'dates'; };
  DS.whenValues = root => Object.fromEntries(['when', 'depart', 'ret', 'month', 'nights', 'retopen'].map(k => [k, wv(root, k).value]));
  function whenSync(root) {
    const mode = whenMode(root), set = (k, val) => { wv(root, k).value = val || ''; };
    ['depart', 'ret', 'month', 'nights', 'retopen'].forEach(k => set(k, ''));
    if (mode === 'dates') {
      const d = $('[data-when-depart]', root).value, open = $('[data-when-retopen]', root), oneWay = root.dataset.oneway === '1';
      const r = (oneWay || (open && open.checked)) ? '' : $('[data-when-ret]', root).value;
      set('depart', d); set('ret', r); set('retopen', open && open.checked ? '1' : '');
      set('when', d ? 'dates' : '');
      if (d && r) set('nights', String(DS.daysBetween(d, r)));
      $$('[data-when-pick]', root).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.d === d && b.dataset.r === r)));
    } else if (mode === 'month') {
      const m = $('[data-when-month][aria-pressed="true"]', root);
      set('month', m ? m.dataset.whenMonth : ''); set('when', m ? 'month' : '');
    } else {
      set('nights', $('[data-when-nights]', root).textContent); set('month', $('[data-when-flexmonth]', root).value); set('when', 'flex');
    }
    const t = $('[data-when-text]', root); if (t) t.textContent = DS.whenText(DS.whenValues(root), { placeholder: root.dataset.placeholder, oneWay: root.dataset.oneway === '1' });
    root.classList.remove('is-invalid');
    root.dispatchEvent(new CustomEvent('ds:when', { bubbles: true }));
  }
  DS.whenSync = whenSync;
  /* Tours: the destination decides which months and departures are offered */
  DS.whenSetMonths = (root, list) => { const box = $('[data-when-months]', root); if (!box) return; const cur = wv(root, 'month').value; box.innerHTML = monthChips(list, whenMode(root) === 'month' ? cur : ''); whenSync(root); };
  DS.whenSetSuggest = (root, s) => { const box = $('[data-when-suggest]', root); if (!box) return; box.innerHTML = suggestHTML(s, DS.whenValues(root)); };
  DS.whenSetLabels = (root, L = {}) => { const d = $('[data-when-depart]', root), r = $('[data-when-ret]', root); if (d && L.depart) $(`label[for="${d.id}"]`, root).textContent = L.depart; if (r && L.ret) $(`label[for="${r.id}"]`, root).textContent = L.ret; };
  DS.whenSetOneWay = (root, on) => { root.dataset.oneway = on ? '1' : ''; const f = $('[data-when-retfield]', root); if (f) f.hidden = on; whenSync(root); };
  const whenOpen = root => {
    const pop = $('.when__pop', root), btn = $('.when__btn', root); if (!btn) return;
    pop.hidden = false; btn.setAttribute('aria-expanded', 'true');
    pop.classList.remove('when__pop--up', 'when__pop--right');
    const r = pop.getBoundingClientRect();
    if (r.right > window.innerWidth - 8) pop.classList.add('when__pop--right');
    const inModal = !!btn.closest('.modal');
    if (inModal && r.bottom > window.innerHeight - 8 && btn.getBoundingClientRect().top > r.height + 16) pop.classList.add('when__pop--up');
    // On the page, bring a popover that opens below the fold into view
    else if (!inModal && r.bottom > window.innerHeight - 8) window.scrollBy({ top: Math.min(r.bottom - window.innerHeight + 16, btn.getBoundingClientRect().top - 80), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    const first = $('[data-when-mode]:checked', pop) || $('input, button', pop); if (first) first.focus({ preventScroll: true });
  };
  const whenClose = (root, focus) => { const pop = $('.when__pop', root), btn = $('.when__btn', root); if (!btn || pop.hidden) return; pop.hidden = true; btn.setAttribute('aria-expanded', 'false'); if (focus) btn.focus(); };
  DS.whenOpen = whenOpen;
  /* Validation shared by every form that has a date picker */
  DS.whenValidate = (root, o = {}) => {
    const v = DS.whenValues(root), mode = whenMode(root);
    const err = (sel, msg) => {
      if (!root.classList.contains('when--inline')) whenOpen(root);
      const inp = $(sel, root), f = inp ? inp.closest('.field') : root;
      f.classList.add('is-invalid'); const e = $('.field__error', f); if (e) e.textContent = msg;
      root.classList.add('is-invalid'); const top = $('.when__error', root); if (top) top.textContent = msg;
      if (inp) inp.focus(); if (DS.motion && DS.motion.shake) DS.motion.shake(f);
      return false;
    };
    $$('.field.is-invalid', root).forEach(f => f.classList.remove('is-invalid')); const top = $('.when__error', root); if (top) top.textContent = '';
    if (mode === 'dates') {
      const d = $('[data-when-depart]', root).value, r = $('[data-when-ret]', root).value;
      const needRet = o.requireRet && root.dataset.oneway !== '1' && !($('[data-when-retopen]', root) || {}).checked;
      if (o.requireDepart && !d) return err('[data-when-depart]', o.departMsg || 'Choose a departure date.');
      if (d && d < DS.todayISO()) return err('[data-when-depart]', 'Choose a date from today onwards.');
      if (needRet && d && !r) return err('[data-when-ret]', o.retMsg || 'Choose a return date.');
      if (d && r && r < d && root.dataset.oneway !== '1') return err('[data-when-ret]', `${o.retLabel || 'Return'} date must be after ${o.departLabel || 'departure'}.`);
    }
    if (mode === 'month' && o.requireDepart && !v.month) return err('[data-when-month]', 'Choose a month.');
    return true;
  };
  document.addEventListener('click', e => {
    $$('[data-when]').forEach(r => { if (!r.contains(e.target)) whenClose(r); });
    const root = e.target.closest('[data-when]'); if (!root) return;
    if (e.target.closest('.when__btn')) { const pop = $('.when__pop', root); pop.hidden ? (document.querySelectorAll('[data-pax]').forEach(p => paxClose(p)), whenOpen(root)) : whenClose(root); return; }
    const pick = e.target.closest('[data-when-pick]');
    if (pick) { $('[data-when-depart]', root).value = pick.dataset.d; const r = $('[data-when-ret]', root); r.min = pick.dataset.d; r.value = pick.dataset.r; const open = $('[data-when-retopen]', root); if (open) { open.checked = false; $('[data-when-retfield]', root).hidden = root.dataset.oneway === '1'; } whenSync(root); whenClose(root, true); return; }
    const m = e.target.closest('[data-when-month]');
    if (m) { const on = m.getAttribute('aria-pressed') !== 'true'; $$('[data-when-month]', root).forEach(b => b.setAttribute('aria-pressed', 'false')); m.setAttribute('aria-pressed', String(on)); whenSync(root); if (on) whenClose(root, true); return; }
    const step = e.target.closest('[data-when-step]');
    if (step) { const el = $('[data-when-nights]', root), n = Math.min(30, Math.max(1, +el.textContent + +step.dataset.whenStep)); el.textContent = n; $$('[data-when-step]', root).forEach(b => { b.disabled = (+b.dataset.whenStep < 0 && n <= 1) || (+b.dataset.whenStep > 0 && n >= 30); }); whenSync(root); if (DS.motion && DS.motion.pop) DS.motion.pop(el); return; }
    if (e.target.closest('[data-when-clear]')) {
      $$('[data-when-depart], [data-when-ret]', root).forEach(i => { i.value = ''; }); const open = $('[data-when-retopen]', root); if (open) open.checked = false;
      const rf = $('[data-when-retfield]', root); if (rf) rf.hidden = root.dataset.oneway === '1';
      $$('[data-when-month]', root).forEach(b => b.setAttribute('aria-pressed', 'false'));
      const fm = $('[data-when-flexmonth]', root); if (fm) fm.value = '';
      const nn = $('[data-when-nights]', root); if (nn) nn.textContent = root.dataset.flexNights;
      // "Clear" returns to the first mode so the summary reads as unset
      const firstMode = $('[data-when-mode]', root); if (firstMode && !firstMode.checked) { firstMode.checked = true; showPanel(root); }
      whenSync(root); if (whenMode(root) === 'flex') { wv(root, 'when').value = ''; wv(root, 'nights').value = ''; const t = $('[data-when-text]', root); if (t) t.textContent = DS.whenText({}, { placeholder: root.dataset.placeholder }); }
      return;
    }
    if (e.target.closest('[data-when-done]')) { if (DS.whenValidate(root)) whenClose(root, true); }
  });
  const showPanel = root => { const mode = whenMode(root); $$('[data-when-panel]', root).forEach(p => { p.hidden = p.dataset.whenPanel !== mode; }); };
  document.addEventListener('change', e => {
    const root = e.target.closest && e.target.closest('[data-when]'); if (!root) return;
    if (e.target.matches('[data-when-mode]')) { showPanel(root); whenSync(root); if (DS.motion && DS.motion.tabIn) DS.motion.tabIn($(`[data-when-panel="${e.target.value}"]`, root)); return; }
    if (e.target.matches('[data-when-retopen]')) { const f = $('[data-when-retfield]', root); f.hidden = e.target.checked || root.dataset.oneway === '1'; if (e.target.checked) $('[data-when-ret]', root).value = ''; whenSync(root); return; }
    if (e.target.matches('[data-when-depart]')) {
      const d = e.target.value, r = $('[data-when-ret]', root);
      r.min = d || r.min; if (d && r.value && r.value < d) r.value = '';
      whenSync(root); if (d && !r.value && !$('[data-when-retfield]', root).hidden) r.focus();
      return;
    }
    if (e.target.matches('[data-when-ret], [data-when-flexmonth]')) whenSync(root);
  });
  document.addEventListener('keydown', e => { if (e.key !== 'Escape') return; const r = e.target.closest && e.target.closest('[data-when]'); if (r && $('.when__btn', r) && !$('.when__pop', r).hidden) { e.stopPropagation(); whenClose(r, true); } }, true);

  /* ---------- Place search (airports, cities, countries) ----------
     A combobox: type a 3-letter code, a city or a country and pick from the list.
     Anything typed that is not on the list is kept as written, because flights, hotels
     and insurance are quoted worldwide by a consultant. */
  const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  const cityOf = a => `${a.city.replace(/ \(.*\)$/, '')}, ${a.country}`;
  DS.airportCity = code => { const a = DS.getAirport(code); return a ? cityOf(a) : ''; };
  DS.placeText = (source, v) => { if (source === 'airports') { const a = DS.getAirport(v); return a ? `${a.city} (${a.code})` : (v || ''); } return v || ''; };
  const POPULAR = { airports: ['MNL', 'NRT', 'ICN', 'HKG', 'SIN', 'TPE', 'DXB', 'LAX'], places: ['Tokyo, Japan', 'Seoul, South Korea', 'Hong Kong, Hong Kong SAR', 'Singapore, Singapore', 'Boracay, Philippines', 'El Nido, Philippines'], countries: ['Japan', 'South Korea', 'Schengen area (Europe)', 'United States', 'Singapore', 'Multiple countries'] };
  DS.searchPlaces = (source, q, limit = 8) => {
    const n = norm(q);
    if (source === 'airports') {
      if (!n) return POPULAR.airports.map(DS.getAirport);
      return DS.airports.map(a => {
        const city = norm(a.city), country = norm(a.country), code = a.code.toLowerCase();
        const score = code === n ? 0 : city.startsWith(n) ? 1 : country.startsWith(n) ? 2 : code.startsWith(n) && n.length < 3 ? 3 : (city.includes(n) || norm(a.name).includes(n)) ? 4 : country.includes(n) ? 5 : 99;
        return { a, score };
      }).filter(x => x.score < 99).sort((x, y) => x.score - y.score).slice(0, limit).map(x => x.a);
    }
    const list = source === 'countries' ? DS.countries : DS.places;
    if (!n) return POPULAR[source].map(label => ({ label }));
    return list.map(p => { const l = norm(p.label); return { p, score: l.startsWith(n) ? 0 : l.includes(', ' + n) ? 1 : l.includes(n) ? 2 : 99 }; }).filter(x => x.score < 99).sort((x, y) => x.score - y.score).slice(0, limit).map(x => x.p);
  };
  let comboSeq = 0;
  DS.placeField = (o = {}) => {
    const id = o.id || 'combo-' + (++comboSeq);
    return `<div class="field combo ${o.full ? 'field--full' : ''}" data-combo="${o.source || 'places'}" ${o.required ? 'data-required="1"' : ''} data-picked="${esc(o.value ? DS.placeText(o.source, o.value) : '')}">
      <label class="field__label" for="${id}">${esc(o.label || 'Destination')}</label>
      <div class="field__control">${DS.icon(o.icon || 'pin')}<input class="input combo__input" id="${id}" type="text" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="${id}-list" autocomplete="off" spellcheck="false" placeholder="${esc(o.placeholder || 'Search')}" value="${esc(DS.placeText(o.source, o.value))}">
      <ul class="combo__list" id="${id}-list" role="listbox" aria-label="${esc(o.label || 'Destination')} suggestions" hidden></ul></div>
      <input type="hidden" name="${o.name || 'place'}" value="${esc(o.value || '')}">
      ${o.help ? `<span class="field__help">${o.help}</span>` : ''}<span class="field__error" aria-live="polite"></span></div>`;
  };
  const comboParts = root => ({ input: $('.combo__input', root), list: $('.combo__list', root), hidden: $('input[type="hidden"]', root), source: root.dataset.combo });
  function comboRender(root) {
    const { input, list, source, hidden } = comboParts(root);
    // A field already showing its chosen place lists popular choices, not "no match"
    const q = root.dataset.picked && input.value === root.dataset.picked ? '' : input.value;
    const res = DS.searchPlaces(source, q);
    const head = !norm(q) ? `<li class="combo__head" role="presentation">${source === 'airports' ? 'Popular airports' : 'Popular choices'}</li>` : '';
    list.innerHTML = head + (res.length ? res.map((r, i) => source === 'airports'
      ? `<li role="option" id="${input.id}-o${i}" class="combo__opt" data-value="${r.code}" data-label="${esc(`${r.city} (${r.code})`)}" aria-selected="false"><span class="combo__code">${r.code}</span><span class="combo__main"><strong>${esc(r.city)}</strong><small>${esc(r.name)} · ${esc(r.country)}</small></span></li>`
      : `<li role="option" id="${input.id}-o${i}" class="combo__opt" data-value="${esc(r.label)}" data-label="${esc(r.label)}" aria-selected="false">${DS.icon(source === 'countries' ? 'globe' : 'pin')}<span class="combo__main"><strong>${esc(r.label)}</strong></span></li>`).join('')
      : `<li class="combo__empty" role="presentation">${source === 'airports' ? `No airport matches “${esc(q)}”. Keep it as typed and your consultant will check it.` : `Not on our list: we will use “${esc(q)}” as typed.`}</li>`);
    list.hidden = false; input.setAttribute('aria-expanded', 'true'); input.removeAttribute('aria-activedescendant');
  }
  const comboClose = root => { const { input, list } = comboParts(root); list.hidden = true; input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); };
  function comboPick(root, opt) {
    const { input, hidden } = comboParts(root);
    input.value = opt.dataset.label; hidden.value = opt.dataset.value; root.dataset.picked = opt.dataset.label;
    root.classList.remove('is-invalid'); comboClose(root);
    hidden.dispatchEvent(new Event('change', { bubbles: true }));
  }
  DS.comboSet = (root, value) => { const { input, hidden, source } = comboParts(root); hidden.value = value || ''; input.value = DS.placeText(source, value); root.dataset.picked = value ? input.value : ''; };
  // Suggestions open on click, typing or ArrowDown, not on focus alone, so a form that
  // focuses its first field does not open with a list covering it
  document.addEventListener('focusin', e => { if (e.target.matches && e.target.matches('.combo__input')) e.target.select(); });
  document.addEventListener('click', e => { if (e.target.matches && e.target.matches('.combo__input')) { const root = e.target.closest('[data-combo]'); if ($('.combo__list', root).hidden) comboRender(root); } });
  document.addEventListener('input', e => {
    if (!e.target.matches || !e.target.matches('.combo__input')) return;
    const root = e.target.closest('[data-combo]'), { hidden } = comboParts(root);
    hidden.value = e.target.value.trim(); // free text is allowed until something is picked
    root.classList.remove('is-invalid'); comboRender(root);
  });
  document.addEventListener('focusout', e => {
    if (!e.target.matches || !e.target.matches('.combo__input')) return;
    const root = e.target.closest('[data-combo]');
    setTimeout(() => {
      if (root.contains(document.activeElement)) return;
      const { input, hidden, source } = comboParts(root), n = norm(input.value);
      // A typed code or an exact name counts as picking it
      if (source === 'airports' && n) { const a = DS.airports.find(x => x.code.toLowerCase() === n) || (DS.airports.filter(x => norm(x.city) === n).length === 1 && DS.airports.find(x => norm(x.city) === n)); if (a) { hidden.value = a.code; input.value = `${a.city} (${a.code})`; root.dataset.picked = input.value; } }
      else if (n) { const list = source === 'countries' ? DS.countries : DS.places; const p = list.find(x => norm(x.label) === n || norm(x.label.split(',')[0]) === n); if (p) { hidden.value = p.label; input.value = p.label; root.dataset.picked = input.value; } }
      comboClose(root);
    }, 120);
  });
  document.addEventListener('mousedown', e => { const opt = e.target.closest('.combo__opt'); if (opt) { e.preventDefault(); comboPick(opt.closest('[data-combo]'), opt); } });
  document.addEventListener('keydown', e => {
    if (!e.target.matches || !e.target.matches('.combo__input')) return;
    const root = e.target.closest('[data-combo]'), { list, input } = comboParts(root), opts = $$('.combo__opt', list);
    if (e.key === 'Escape' && !list.hidden) { e.preventDefault(); e.stopPropagation(); comboClose(root); return; }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault(); if (list.hidden) comboRender(root); if (!opts.length) return;
      const cur = opts.findIndex(o => o.getAttribute('aria-selected') === 'true');
      const next = e.key === 'ArrowDown' ? (cur + 1) % opts.length : (cur <= 0 ? opts.length - 1 : cur - 1);
      opts.forEach((o, i) => o.setAttribute('aria-selected', String(i === next)));
      input.setAttribute('aria-activedescendant', opts[next].id); opts[next].scrollIntoView({ block: 'nearest' });
      return;
    }
    if (e.key === 'Enter' && !list.hidden) { const sel = opts.find(o => o.getAttribute('aria-selected') === 'true') || (opts.length === 1 && norm(input.value) ? opts[0] : null); if (sel) { e.preventDefault(); comboPick(root, sel); } else comboClose(root); }
    if (e.key === 'Tab' && !list.hidden) { const sel = opts.find(o => o.getAttribute('aria-selected') === 'true'); if (sel) comboPick(root, sel); }
  }, true);
  DS.comboError = (root, msg) => { root.classList.add('is-invalid'); const e = $('.field__error', root); if (e) e.textContent = msg; const i = $('.combo__input', root); i.focus(); if (DS.motion && DS.motion.shake) DS.motion.shake(root); };

  /* ---------- Package departures ----------
     Every scheduled departure shows as a date range (departure + nights). "Another date"
     opens departure and return fields and turns the booking into a custom trip. */
  DS.departureList = (p, sel = {}, o = {}) => {
    const deps = DS.departuresFor(p), name = o.name || 'dep', today = DS.todayISO();
    const custom = !!sel.custom || (!!sel.date && !deps.some(d => d.date === sel.date)) || !deps.length;
    const cur = custom ? 'custom' : (sel.date || deps[0].date);
    const dur = `${p.duration.days} days, ${p.duration.nights} nights`;
    return `<fieldset class="dep-list" data-dep-list data-nights="${p.duration.nights}" data-valid="${p.validUntil || ''}">
      <legend class="field__label">${esc(o.legend || 'Departure date')}</legend>
      <div class="dep-list__opts">
      ${deps.map(d => `<label class="dep-opt"><input type="radio" name="${name}" value="${d.date}" ${cur === d.date ? 'checked' : ''}><span class="dep-opt__radio" aria-hidden="true"></span><span class="dep-opt__body"><strong>${DS.fmtRange(d.date, d.ret)}</strong><small>${DS.weekday(d.date)} to ${DS.weekday(d.ret)} · ${dur}</small></span><span class="dep-opt__note">${esc(d.note)}</span></label>`).join('')}
      <label class="dep-opt dep-opt--custom"><input type="radio" name="${name}" value="custom" ${cur === 'custom' ? 'checked' : ''}><span class="dep-opt__radio" aria-hidden="true"></span><span class="dep-opt__body"><strong>Another date</strong><small>Pick your own departure and return</small></span><span class="dep-opt__note dep-opt__note--custom">${DS.icon('sparkles')}Custom trip</span></label>
      </div>
      <div class="dep-custom" data-dep-custom ${cur === 'custom' ? '' : 'hidden'}>
        <div class="dep-custom__fields">
          <div class="field"><label class="field__label" for="${name}-d">Departure</label><input class="input" type="date" id="${name}-d" data-dep-depart min="${today}" ${p.validUntil ? `max="${p.validUntil}"` : ''} value="${esc(custom ? sel.date || '' : '')}"><span class="field__error" aria-live="polite"></span></div>
          <div class="field"><label class="field__label" for="${name}-r">Return</label><input class="input" type="date" id="${name}-r" data-dep-ret min="${esc(custom && sel.date ? sel.date : today)}" value="${esc(custom ? sel.ret || '' : '')}"><span class="field__error" aria-live="polite"></span></div>
        </div>
        <p class="dep-custom__note">${DS.icon('sparkles')}<span>Your own dates make this a <strong>custom trip</strong>. Your consultant checks flights and hotels for those dates and quotes the price.</span></p>
      </div>
      ${p.validUntil ? `<p class="dep-valid">${DS.icon('clock')}<span>Valid for departures until <strong>${fmtDate(p.validUntil)}</strong> (sample)</span></p>` : ''}
    </fieldset>`;
  };
  DS.readDeparture = root => {
    const r = $('.dep-list__opts input:checked', root);
    if (!r || r.value === 'custom') return { date: $('[data-dep-depart]', root).value, ret: $('[data-dep-ret]', root).value, custom: true };
    return { date: r.value, ret: DS.addDays(r.value, +root.dataset.nights), custom: false };
  };
  DS.validateDeparture = root => {
    const v = DS.readDeparture(root); if (!v.custom) return true;
    $$('.field.is-invalid', root).forEach(f => f.classList.remove('is-invalid'));
    const fail = (sel, msg) => { const i = $(sel, root), f = i.closest('.field'); f.classList.add('is-invalid'); $('.field__error', f).textContent = msg; i.focus(); if (DS.motion && DS.motion.shake) DS.motion.shake(f); return false; };
    if (!v.date) return fail('[data-dep-depart]', 'Choose your departure date.');
    if (v.date < DS.todayISO()) return fail('[data-dep-depart]', 'Choose a date from today onwards.');
    if (root.dataset.valid && v.date > root.dataset.valid) return fail('[data-dep-depart]', `This package is valid for departures until ${fmtDate(root.dataset.valid)}.`);
    if (!v.ret) return fail('[data-dep-ret]', 'Choose your return date.');
    if (v.ret <= v.date) return fail('[data-dep-ret]', 'Return date must be after departure.');
    return true;
  };
  document.addEventListener('change', e => {
    const root = e.target.closest && e.target.closest('[data-dep-list]'); if (!root) return;
    if (e.target.matches('.dep-list__opts input')) {
      const box = $('[data-dep-custom]', root), on = e.target.value === 'custom';
      box.hidden = !on; if (on) { if (DS.motion && DS.motion.tabIn) DS.motion.tabIn(box); $('[data-dep-depart]', root).focus(); }
    }
    if (e.target.matches('[data-dep-depart]')) {
      // Return defaults to the package length; the traveler can still change it
      const d = e.target.value, r = $('[data-dep-ret]', root);
      r.min = d || r.min; if (d && (!r.value || r.value <= d)) r.value = DS.addDays(d, +root.dataset.nights);
    }
    root.dispatchEvent(new CustomEvent('ds:dep', { bubbles: true }));
  });

  /* ---------- Custom trip: what to include ----------
     A custom trip needs at least two things. With only one ticked, the traveler is
     pointed to the tab that books that one service directly. */
  const INCL_MIN = 2;
  const SINGLE = {
    flights: { tab: 'flights', kind: 'flight', label: 'flights' }, hotel: { tab: 'hotels', kind: 'hotel', label: 'a hotel' },
    'airport-transfers': { tab: 'transport', kind: 'transport', service: 'airport-transfer', label: 'an airport transfer' }, 'private-car': { tab: 'transport', kind: 'transport', service: 'private-car', label: 'a private car' },
    visa: { tab: 'visa', kind: 'visa', label: 'visa assistance' }, insurance: { tab: 'insurance', kind: 'insurance', label: 'travel insurance' },
    'city-tour': { tab: 'tours', label: 'a tour package' }, activities: { tab: 'tours', label: 'a tour package' }, 'theme-parks': { tab: 'tours', label: 'a tour package' }, 'island-hopping': { tab: 'tours', label: 'a tour package' }
  };
  DS.inclSingle = id => SINGLE[id];
  const inclCount = n => n === 0 ? `Pick at least ${INCL_MIN}` : n < INCL_MIN ? `${n} picked · pick ${INCL_MIN - n} more` : `${n} picked`;
  DS.inclPicker = (o = {}) => {
    const sel = [].concat(o.selected || []);
    return `<fieldset class="field field--full incl-pick ${o.compact ? 'incl-pick--compact' : ''} ${sel.length >= INCL_MIN ? 'is-ok' : ''}" data-incl>
      <legend class="field__label">${esc(o.legend || 'What should we include?')}<span class="incl-pick__count" data-incl-count aria-live="polite">${inclCount(sel.length)}</span></legend>
      <div class="incl-pick__grid">${DS.cartCatalog.customIncludes.map(x => `<label class="incl-chip"><input type="checkbox" name="incl" value="${x.id}" ${sel.includes(x.id) ? 'checked' : ''}><span>${DS.icon(x.icon)}${esc(x.label)}</span></label>`).join('')}</div>
      <div class="incl-pick__hint" data-incl-hint hidden></div>
      <span class="field__error" aria-live="polite"></span>
    </fieldset>`;
  };
  function inclSync(root) {
    const on = $$('input[name="incl"]:checked', root).map(i => i.value);
    $('[data-incl-count]', root).textContent = inclCount(on.length);
    root.classList.toggle('is-ok', on.length >= INCL_MIN);
    const hint = $('[data-incl-hint]', root), one = on.length === 1 && SINGLE[on[0]];
    hint.hidden = !one;
    if (one) hint.innerHTML = `${DS.icon('info')}<span>Only need ${one.label}? You can request it directly.</span><button type="button" class="btn btn--sm btn--ghost" data-incl-single="${on[0]}">${one.kind ? `Request ${one.label}` : 'Browse tour packages'} ${DS.icon('arrowRight', 'arrow')}</button>`;
    if (on.length >= INCL_MIN) { root.classList.remove('is-invalid'); }
  }
  DS.inclSync = inclSync;
  DS.inclValidate = root => {
    if (!root) return true;
    const n = $$('input[name="incl"]:checked', root).length; inclSync(root);
    if (n >= INCL_MIN) return true;
    root.classList.add('is-invalid');
    $('.field__error', root).textContent = n === 0 ? `Pick at least ${INCL_MIN} things for your custom trip.` : `A custom trip combines at least ${INCL_MIN} things. Pick one more, or request the single service instead.`;
    root.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    const first = $('input[name="incl"]:not(:checked)', root); if (first) first.focus({ preventScroll: true });
    if (DS.motion && DS.motion.shake) DS.motion.shake($('.incl-pick__grid', root));
    return false;
  };
  document.addEventListener('change', e => { if (e.target.matches && e.target.matches('[data-incl] input[name="incl"]')) inclSync(e.target.closest('[data-incl]')); });
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-incl-single]'); if (!b) return;
    b.dispatchEvent(new CustomEvent('ds:incl-single', { bubbles: true, detail: { id: b.dataset.inclSingle, ...SINGLE[b.dataset.inclSingle] } }));
  });

  /* ---------- Search widget (homepage) ----------
     Each tab asks only what that service needs. Tours: trip type, then a destination,
     then dates that follow the destination's departures. Custom Trip: what to include,
     where, when and who. Flights, hotels, transport, insurance and corporate travel are
     worldwide (no trip type). Visa, flights, hotels and transport can add several lines
     at once ("Add another ..."). Everything except Tours and Custom Trip goes straight
     into the Travel Cart (corporate travel stays a proposal request). */
  function initSearchWidget() {
    const w = $('[data-search-widget]'); if (!w) return;
    const tabs = $('.search-tabs', w), panel = $('.search-panel', w);
    const TAB_LABEL = { tours: 'Tours & Packages', custom: 'Custom Trip', visa: 'Visa', flights: 'Flights', hotels: 'Hotels', transport: 'Transport', cruises: 'Cruises', insurance: 'Insurance', corporate: 'Corporate' };
    const KIND = { flights: 'flight', hotels: 'hotel', transport: 'transport', cruises: 'cruise', insurance: 'insurance', visa: 'visa' };
    // Custom Trip gets its own tab, right after packages
    const TABS = [DS.services[0], { id: 'custom', icon: 'sparkles' }, ...DS.services.slice(1)];
    tabs.innerHTML = TABS.map((s, i) => `<button type="button" role="tab" class="search-tab ${s.id === 'custom' ? 'search-tab--custom' : ''}" id="stab-${s.id}" aria-selected="${i === 0}" aria-controls="spanel" data-tab="${s.id}" tabindex="${i === 0 ? 0 : -1}">${DS.icon(s.icon)}${esc(TAB_LABEL[s.id] || s.name)}</button>`).join('');
    const st = { type: 'international', trip: 'return' };
    const C = DS.cartCatalog;
    const typeHelp = () => { const n = DS.destinations.filter(d => d.type === st.type).length; return st.type === 'domestic' ? `${n} Philippine destinations, no visa needed` : `${n} destinations across Asia, visa help included`; };
    const typeField = () => `<div class="field trip-type" role="radiogroup" aria-labelledby="sw-type-l"><span class="field__label" id="sw-type-l">${DS.icon('compass')}Trip type</span><div class="seg seg--type">
        <label class="seg__opt"><input type="radio" name="type" value="international" ${st.type === 'international' ? 'checked' : ''}><span>${DS.icon('globe')}International</span></label>
        <label class="seg__opt"><input type="radio" name="type" value="domestic" ${st.type === 'domestic' ? 'checked' : ''}><span>${DS.icon('sun')}Domestic</span></label></div><span class="trip-type__help" data-type-help>${typeHelp()}</span></div>`;
    const tripField = () => `<div class="field trip-type" role="radiogroup" aria-labelledby="sw-trip-l"><span class="field__label" id="sw-trip-l">${DS.icon('plane')}Flight</span><div class="seg seg--type">
        <label class="seg__opt"><input type="radio" name="trip" value="return" ${st.trip === 'return' ? 'checked' : ''}><span>Round trip</span></label>
        <label class="seg__opt"><input type="radio" name="trip" value="oneway" ${st.trip === 'oneway' ? 'checked' : ''}><span>One way</span></label></div><span class="trip-type__help">Airfare only, to any airport in the world</span></div>`;
    const sel = (id, label, icon, options, name) => `<div class="field"><label class="field__label" for="${id}">${label}</label><div class="field__control">${DS.icon(icon)}<select class="select" id="${id}" name="${name}">${options}</select></div></div>`;
    const addBtn = `<button type="submit" class="btn btn--primary btn--lg search-form__submit" data-action="cart">${DS.icon('bagPlus')} Add to Travel Cart</button>`;
    const hint = (icon, text) => `<p class="search-form__hint">${DS.icon(icon)}<span>${text}</span></p>`;
    const alt = (attr, icon, strong, text) => `<button type="button" class="search-form__alt" ${attr}>${DS.icon(icon)}<span><strong>${strong}</strong>${text ? ` ${text}` : ''}</span>${DS.icon('arrowRight', 'arrow')}</button>`;
    const svc = id => DS.getTransport(id);

    /* Tours: months and departures that exist for the chosen trip type and destination */
    const tourPkgs = dest => DS.packages.filter(p => p.type === st.type && (!dest || p.destinationId === dest));
    const tourMonths = dest => {
      const m = {}; tourPkgs(dest).forEach(p => DS.departuresFor(p).forEach(d => { const k = d.date.slice(0, 7); m[k] = (m[k] || 0) + 1; }));
      return Object.keys(m).sort().map(value => ({ value, count: m[value] }));
    };
    const tourSuggest = dest => {
      const d = DS.getDestination(dest);
      if (!d) return { empty: 'Choose a destination to see its scheduled departures, or enter any dates.' };
      const items = tourPkgs(dest).flatMap(p => DS.departuresFor(p).map(x => ({ depart: x.date, ret: x.ret, title: `${p.title.split(':')[0]} · ${p.duration.days}D${p.duration.nights}N` }))).sort((a, b) => a.depart.localeCompare(b.depart));
      return { heading: `Scheduled departures for ${d.name}`, items };
    };
    let carry = {}; // values carried from one tab to another (e.g. Tours → Custom Trip)
    const FORMS = {
      tours: () => ({ cols: 3, top: typeField(), body: sel('sw-dest', 'Destination', 'pin', DS.destOptions(st.type, '', { counts: true }), 'dest') +
          DS.whenPicker({ id: 'sw-when', label: 'Travel dates', modes: ['dates', 'month', 'flex'], months: tourMonths(''), suggest: tourSuggest(''), placeholder: 'Any dates', datesHelp: 'Dates that do not match a scheduled departure are quoted as a custom trip.', monthHelp: 'Months with scheduled departures. Prefer another month? Build a custom trip.' }) +
          DS.paxPicker({ label: 'Travelers' }),
        cta: `<button type="submit" class="btn btn--primary btn--lg search-form__submit" data-action="search">${DS.icon('search')} Search packages</button>`,
        foot: hint('sparkles', 'Pick a destination and the dates follow its departures. Prices are sample data.') + alt('data-goto-custom', 'sparkles', 'No package fits?', 'Build a custom trip') }),
      custom: () => ({ cols: 3, top: DS.inclPicker({ compact: true, legend: 'What should we include?', selected: carry.incl }),
        body: DS.placeField({ id: 'sw-where', name: 'where', label: 'Where to?', source: 'places', value: carry.where || '', placeholder: 'City, country, or several' }) +
          DS.whenPicker({ id: 'sw-xwhen', label: 'Travel dates', modes: ['dates', 'month', 'flex'], value: carry, placeholder: 'Any dates' }) +
          DS.paxPicker({ label: 'Travelers', adults: carry.adults || 2, children: carry.children || 0, group: carry.group }),
        cta: `<button type="submit" class="btn btn--primary btn--lg search-form__submit" data-action="custom">${DS.icon('sparkles')} Plan my trip</button>`,
        foot: hint('headset', 'Pick at least 2 things. Next you can add pace, hotel class, budget and notes. A consultant designs the trip and quotes it; nothing is booked.') }),
      visa: () => ({ cols: 3, body: sel('sw-visa', 'Visa for', 'passport', C.visa.map(v => `<option value="${v.id}">${esc(v.name)}</option>`).join(''), 'country') +
          DS.whenPicker({ id: 'sw-vwhen', label: 'Travel dates', modes: ['dates', 'month'], retOptional: true, placeholder: 'Not decided yet', datesHelp: 'Not sure yet? Leave the dates empty. Your consultant plans the application around them later.' }) +
          DS.paxPicker({ label: 'Applicants', adults: 1, noun: 'applicant' }),
        cta: addBtn, foot: hint('passport', 'Want to see the documents first? <a href="visa.html">Run the Visa Readiness Checker</a>.') + alt('data-multi="visa"', 'plus', 'Add another country', 'for a multi-country trip') }),
      flights: () => ({ cols: 4, top: tripField(), body: DS.placeField({ id: 'sw-from', name: 'origin', label: 'From', source: 'airports', icon: 'plane', value: 'MNL', placeholder: 'City, airport or code' }) +
          DS.placeField({ id: 'sw-to', name: 'to', label: 'To', source: 'airports', icon: 'pin', placeholder: 'City, airport or code', required: true }) +
          DS.whenPicker({ id: 'sw-fwhen', label: 'Dates', modes: ['dates'], oneWay: st.trip === 'oneway', placeholder: 'Add dates' }) +
          DS.paxPicker({ label: 'Passengers', noun: 'passenger' }),
        cta: addBtn, foot: hint('headset', 'Type a city, a country or a 3-letter code such as NRT. Choose the cabin in your cart.') + alt('data-multi="flight"', 'plus', 'Add another flight', 'for a multi-city trip') }),
      hotels: () => ({ cols: 3, body: DS.placeField({ id: 'sw-hcity', name: 'city', label: 'Destination', source: 'places', placeholder: 'City or area', required: true }) +
          DS.whenPicker({ id: 'sw-hwhen', label: 'Check-in – check-out', labels: { depart: 'Check-in', ret: 'Check-out' }, modes: ['dates'], placeholder: 'Add dates' }) +
          DS.paxPicker({ label: 'Guests and rooms', noun: 'guest', rooms: 1 }),
        cta: addBtn, foot: hint('bed', 'Hotel class and preferences are set in your cart.') + alt('data-multi="hotel"', 'plus', 'Add another city', 'for a multi-city stay') }),
      transport: () => ({ cols: 4, body: sel('sw-tsvc', 'Service', 'car', C.transportServices.map(t => `<option value="${t.id}">${esc(t.label)}</option>`).join(''), 'service') +
          DS.placeField({ id: 'sw-tplace', name: 'place', label: 'Pick-up city or airport', source: 'places', placeholder: 'City, airport or area' }) +
          DS.whenPicker({ id: 'sw-twhen', label: 'Dates', labels: svc('airport-transfer').labels, modes: ['dates'], oneWay: true, placeholder: 'Add a date' }) +
          DS.paxPicker({ label: 'Passengers', noun: 'passenger' }),
        cta: addBtn, foot: hint('car', 'Transfers, chauffeured cars, self-drive rentals and group coaches, anywhere you travel.') + alt('data-multi="transport"', 'plus', 'Add another', 'transfer or car') }),
      cruises: () => ({ cols: 3, body: sel('sw-region', 'Cruise region', 'ship', C.cruiseRegions.map(r => `<option>${esc(r)}</option>`).join(''), 'region') +
          DS.whenPicker({ id: 'sw-cwhen', label: 'Sailing dates', modes: ['month', 'dates', 'flex'], placeholder: 'Flexible', labels: { depart: 'Sail from', ret: 'Back by' } }) + DS.paxPicker({ label: 'Guests', noun: 'guest' }),
        cta: addBtn, foot: hint('ship', 'Cruise fares are quoted by your consultant, with pre- and post-cruise plans.') }),
      insurance: () => ({ cols: 3, body: DS.placeField({ id: 'sw-idest', name: 'dest', label: 'Destination', source: 'countries', icon: 'globe', placeholder: 'Country or region' }) +
          DS.whenPicker({ id: 'sw-iwhen', label: 'Travel dates', modes: ['dates'], placeholder: 'Add dates' }) + DS.paxPicker({ label: 'Travelers' }),
        cta: addBtn, foot: hint('shield', 'Cover is explained in plain language before you buy. Choose standard or comprehensive in your cart.') }),
      corporate: () => ({ cols: 3, body: DS.placeField({ id: 'sw-cdest', name: 'dest', label: 'Destination', source: 'places', placeholder: 'City, or several cities' }) +
          DS.whenPicker({ id: 'sw-cowhen', label: 'Travel dates', modes: ['dates', 'month', 'flex'], placeholder: 'Not decided yet' }) +
          DS.paxPicker({ label: 'Delegates', noun: 'delegate', adults: 10 }),
        cta: `<button type="submit" class="btn btn--dark btn--lg search-form__submit" data-action="enquiry">${DS.icon('briefcase')} Request a proposal</button>`,
        foot: hint('briefcase', 'Corporate and group travel gets a dedicated consultant and a written proposal.') })
    };
    let current = 'tours';
    const render = id => {
      current = id;
      const f = FORMS[id](); carry = {};
      panel.innerHTML = `<form class="search-form search-form--${id} ${f.top ? 'has-type' : ''}" style="--cols:${f.cols}" data-tabform="${id}" novalidate>${f.top || ''}${f.body}${f.cta}<div class="search-form__foot">${f.foot}</div></form>`;
      panel.id = 'spanel'; panel.setAttribute('role', 'tabpanel'); panel.setAttribute('aria-labelledby', 'stab-' + id);
      if (DS.motion && DS.motion.tabIn) DS.motion.tabIn(panel);
    };
    const tabCtl = DS.tabs(w); w.addEventListener('ds:tab', e => render(e.detail.tab.dataset.tab));
    const goTab = (id, values) => { carry = values || {}; const i = TABS.findIndex(t => t.id === id); if (i >= 0) tabCtl.activate(i, true); };
    DS.searchTab = goTab;
    render('tours');
    // index.html#custom opens straight on the Custom Trip tab (used by the menu)
    if (location.hash === '#custom') { goTab('custom'); setTimeout(() => w.scrollIntoView({ block: 'center' }), 300); }
    window.addEventListener('hashchange', () => { if (location.hash === '#custom') { goTab('custom'); w.scrollIntoView({ block: 'center', behavior: 'smooth' }); } });
    const syncTourDates = form => {
      const root = $('#sw-when', form); if (!root) return;
      const dest = $('#sw-dest', form).value;
      DS.whenSetMonths(root, tourMonths(dest)); DS.whenSetSuggest(root, tourSuggest(dest));
    };
    // Transport: one date for transfers and day tours, a start and end for hires and rentals
    const syncTransport = form => { const t = svc($('#sw-tsvc', form).value), root = $('#sw-twhen', form); DS.whenSetLabels(root, t.labels); DS.whenSetOneWay(root, t.dates === 'single'); };
    w.addEventListener('change', e => {
      const form = e.target.form || e.target.closest('form');
      if (e.target.name === 'type') {
        st.type = e.target.value;
        const help = $('[data-type-help]', form); if (help) help.textContent = typeHelp();
        $$('select[name="dest"]', form).forEach(s => { s.innerHTML = DS.destOptions(st.type, '', { counts: current === 'tours' }); if (DS.motion && DS.motion.pop) DS.motion.pop(s.closest('.field__control')); });
        syncTourDates(form);
      }
      if (e.target.id === 'sw-dest') syncTourDates(form);
      if (e.target.id === 'sw-tsvc') syncTransport(form);
      if (e.target.name === 'trip') { st.trip = e.target.value; DS.whenSetOneWay($('#sw-fwhen', form), st.trip === 'oneway'); }
    });
    const formData = form => Object.fromEntries([...new FormData(form).entries()].filter(([k]) => !k.startsWith('_')));
    // Secondary actions under the form
    w.addEventListener('click', e => {
      const form = $('form', panel);
      if (e.target.closest('[data-goto-custom]')) {
        const data = formData(form), d = DS.getDestination(data.dest);
        goTab('custom', { ...data, where: d ? (d.type === 'domestic' ? `${d.name}, Philippines` : d.country) : '' });
        return;
      }
      const m = e.target.closest('[data-multi]');
      if (m && DS.cart) {
        if (!DS.paxValidate($('[data-pax]', form))) return;
        const data = formData(form), pax = { adults: +data.adults || 1, children: +data.children || 0, group: data.group, rooms: +data.rooms || 1 };
        const rows = {
          hotel: [{ city: data.city, depart: data.depart, ret: data.ret }, { depart: data.ret }],
          transport: [{ service: data.service, place: data.place, depart: data.depart, ret: data.ret }, { service: data.service === 'airport-transfer' ? 'airport-transfer' : 'day-tour', place: data.place }],
          visa: [{ country: data.country, depart: data.depart, ret: data.ret }, { country: data.country === 'japan' ? 'korea' : 'japan', depart: data.ret }],
          flight: [{ origin: data.origin, to: data.to, depart: data.depart }, { origin: data.to, to: '', depart: data.ret }]
        }[m.dataset.multi];
        DS.cart.openMulti(m.dataset.multi, { rows, ...pax });
      }
    });
    // "Only need flights?" inside the Custom Trip tab: jump to that service's tab
    w.addEventListener('ds:incl-single', e => {
      const form = $('form', panel), data = formData(form);
      goTab(e.detail.tab, { ...data, place: data.where });
    });
    w.addEventListener('submit', e => {
      e.preventDefault(); const f = e.target; const data = formData(f);
      const action = (e.submitter && e.submitter.dataset.action) || $('.search-form__submit', f).dataset.action;
      const adults = +data.adults || 1, children = +data.children || 0;
      const whenRoot = $('[data-when]', f);
      if (!DS.paxValidate($('[data-pax]', f))) return;
      if (action === 'search') {
        if (whenRoot && !DS.whenValidate(whenRoot)) return;
        const q = new URLSearchParams(); if (data.dest) q.set('dest', data.dest); if (data.type) q.set('type', data.type);
        ['when', 'depart', 'ret', 'month', 'nights'].forEach(k => { if (data[k]) q.set(k, data[k]); });
        q.set('adults', adults); if (children) q.set('children', children); if (data.group) q.set('group', '1');
        location.href = 'explore.html?' + q.toString(); return;
      }
      if (action === 'custom') {
        if (!DS.inclValidate($('[data-incl]', f))) return;
        if (whenRoot && !DS.whenValidate(whenRoot)) return;
        DS.cart.openForm('custom', { values: { ...data, incl: new FormData(f).getAll('incl'), adults, children } });
        return;
      }
      if (action === 'enquiry') {
        if (whenRoot && !DS.whenValidate(whenRoot)) return;
        DS.routeService('corporate', { destination: data.dest ? 'Other' : 'Multiple / undecided', travelers: adults + children, message: [data.dest ? `Destination: ${data.dest}.` : '', data.when ? `Travel dates: ${DS.whenText(data)}.` : '', data.group ? `Group of ${adults} delegates.` : ''].filter(Boolean).join(' ') }); return;
      }
      const kind = KIND[current];
      if (kind === 'flight') {
        if (!data.to) { DS.comboError($('#sw-to', f).closest('[data-combo]'), 'Enter where you are flying to.'); return; }
        if (!DS.whenValidate(whenRoot, { requireDepart: true, requireRet: true })) return;
      }
      if (kind === 'hotel') {
        if (!data.city) { DS.comboError($('#sw-hcity', f).closest('[data-combo]'), 'Enter a city or area.'); return; }
        if (!DS.whenValidate(whenRoot, { retLabel: 'Check-out', departLabel: 'check-in' })) return;
      }
      if (kind === 'transport' && !data.place) { DS.comboError($('#sw-tplace', f).closest('[data-combo]'), 'Enter a city, airport or area.'); return; }
      if (whenRoot && !DS.whenValidate(whenRoot)) return;
      const details = { ...data, adults, children }; delete details.type;
      if (kind === 'hotel') Object.assign(details, { rooms: +data.rooms || 1, stars: 'Any' });
      if (kind === 'flight') Object.assign(details, { cabin: 'Economy', trip: st.trip });
      if (kind === 'cruise') details.cabin = 'Ocean view';
      if (kind === 'insurance') details.plan = 'Standard cover';
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
    const chips = $('[data-custom-chips]');
    if (chips) chips.innerHTML = DS.inclPicker({ legend: 'What should your trip include?' });
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
