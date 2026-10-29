/* ==========================================================================
   Dreamspree — Travel Cart (shared on every page)
   An e-commerce style cart for a consultant-led agency: travelers add packages,
   visa assistance, flights, hotels, transport, cruises and insurance, then send
   one quotation request. Prices are optional: items without a price read
   "Price on request" and are quoted by a consultant.
   Frontend-only: the cart lives in this browser's localStorage. Nothing is
   reserved, transmitted or charged.
   ========================================================================== */
(function (DS) {
  'use strict';
  const { $, $$, esc, fmtPHP, fmtDate, html } = DS;
  const C = DS.cartCatalog;
  const KEY = 'dreamspree.cart.v1', OLD_KEY = 'dreamspree.saved.v1';
  const NOUN = { package: 'traveler', visa: 'applicant', flight: 'passenger', hotel: 'guest', transport: 'passenger', cruise: 'guest', insurance: 'traveler', custom: 'traveler' };

  /* ---------- Store ---------- */
  const uid = () => 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } };
  let memory = null; // fallback when storage is blocked
  const load = () => memory || read();
  const save = list => {
    memory = null;
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { memory = list; }
    document.dispatchEvent(new CustomEvent('ds:cart'));
  };
  // One-time move of packages saved in the old Trip Builder into the cart
  (function migrate() {
    try {
      if (localStorage.getItem(KEY)) return;
      const old = JSON.parse(localStorage.getItem(OLD_KEY) || '[]');
      if (old.length) localStorage.setItem(KEY, JSON.stringify(old.filter(s => DS.getPackage(s.id)).map(s => ({ uid: uid(), kind: 'package', ref: s.id, d: { date: s.date || '', adults: s.adults || 2, children: s.children || 0 }, addedAt: s.savedAt || Date.now() }))));
      localStorage.removeItem(OLD_KEY);
    } catch { /* storage unavailable */ }
  })();
  const valid = it => it && C.kinds[it.kind] && (it.kind !== 'package' || DS.getPackage(it.ref));

  /* ---------- Describe an item for display ----------
     Older carts stored destination ids and check-in + nights; both still read correctly. */
  const destName = id => id === 'other' ? 'somewhere else' : ((DS.getDestination(id) || {}).name || '');
  const pax = d => ({ a: Math.max(1, +d.adults || 1), c: Math.max(0, +d.children || 0) });
  const airportName = v => { if (!v) return ''; const a = DS.getAirport(v); if (a) return `${a.city.replace(/ \(.*\)$/, '')} (${a.code})`; const d = DS.getDestination(v); return d ? d.name : v === 'other' ? 'another city' : v; };
  const placeName = v => (DS.getDestination(v) || {}).name || v || '';
  const hotelDates = d => { const inD = d.depart || d.checkin, outD = d.ret || (d.checkin && d.nights ? DS.addDays(d.checkin, +d.nights) : ''); return { inD, outD, n: inD && outD ? DS.daysBetween(inD, outD) : +d.nights || 0 }; };
  function describe(it) {
    const d = it.d || {}, { a, c } = pax(d), kind = C.kinds[it.kind];
    const out = { kind: it.kind, kindLabel: kind.label, icon: kind.icon, image: '', href: '', lines: [], price: null, note: 'Price on request', paxText: DS.paxLabel(a, c, NOUN[it.kind], undefined, d.group === '1' || d.group === true) };
    const group = d.group === '1' || d.group === true;
    const whenLine = fallback => DS.whenText(d, { placeholder: fallback });
    switch (it.kind) {
      case 'package': {
        const p = DS.getPackage(it.ref), ret = d.ret || (d.date ? DS.addDays(d.date, p.duration.nights) : '');
        const custom = !!d.custom || (!!d.date && !p.departures.some(x => x.date === d.date));
        out.title = p.title; out.image = p.images[0]; out.href = `package.html?id=${p.id}`; out.dest = p.destinationId; out.custom = custom;
        if (custom) { out.kindLabel = 'Custom trip · based on a package'; out.icon = 'sparkles'; }
        const len = custom && d.date && ret ? `${DS.daysBetween(d.date, ret) + 1} days, ${DS.daysBetween(d.date, ret)} nights` : `${p.duration.days} days, ${p.duration.nights} nights`;
        out.lines = [[ 'calendar', d.date ? `${custom ? 'Your dates: ' : ''}${DS.fmtRange(d.date, ret)}` : d.month ? `Around ${DS.fmtMonth(d.month)}` : 'Departure date to confirm' ], [ 'clock', len ], [ 'users', out.paxText ]];
        if (group) out.note = 'Group rates are quoted by your consultant';
        else if (DS.hasPrice(p) && !custom) { out.price = a * p.priceFrom + c * p.priceFrom * p.childRate; out.note = `${a} × ${fmtPHP(p.priceFrom)}${c ? ` + ${c} × ${fmtPHP(p.priceFrom * p.childRate)}` : ''} · sample`; }
        else if (custom) out.note = 'Custom dates are quoted by your consultant';
        out.start = d.date || (d.month ? d.month + '-01' : '');
        break;
      }
      case 'visa': {
        const v = C.visa.find(x => x.id === d.country) || C.visa[0];
        out.title = `${v.name} visa assistance`; out.dest = v.destinationId || '';
        const t = (d.when || d.depart || d.month) ? `Traveling ${whenLine('')}`.replace('return open', d.retopen ? 'return not decided' : 'return open') : 'Travel dates not decided yet';
        out.lines = [[ 'calendar', t ], [ 'users', out.paxText ], [ 'check', 'Checklist, appointment booking and document review' ]];
        if (v.fee) { out.price = v.fee * (a + c); out.note = `${a + c} × ${fmtPHP(v.fee)} service fee · sample`; }
        out.start = d.depart || (d.month ? d.month + '-01' : '');
        break;
      }
      case 'flight': {
        if (d.legs && d.legs.length) {
          // Multi-city: one quotation for every leg
          const stops = [d.legs[0].origin, ...d.legs.map(l => l.to)].map(v => airportName(v).replace(/ \(.*\)$/, '') || '?');
          out.title = `Flights: ${stops.join(' → ')}`; out.kindLabel = 'Flights · multi-city';
          out.lines = [...d.legs.map((l, i) => [ 'plane', `${i + 1}. ${airportName(l.origin) || '?'} → ${airportName(l.to) || '?'} · ${l.depart ? fmtDate(l.depart) : 'date to confirm'}` ]), [ 'users', `${out.paxText} · ${d.cabin || 'Economy'}` ]];
          out.start = d.legs.map(l => l.depart).filter(Boolean).sort()[0] || '';
          break;
        }
        const oneWay = d.trip === 'oneway';
        out.title = `Flights: ${airportName(d.origin || 'MNL')} to ${airportName(d.to) || 'destination'}`; out.dest = DS.getDestination(d.to) ? d.to : '';
        out.lines = [[ 'calendar', d.depart ? (oneWay ? `${fmtDate(d.depart)} · one way` : d.ret ? DS.fmtRange(d.depart, d.ret) : `${fmtDate(d.depart)} · return to confirm`) : 'Dates to confirm' ], [ 'users', out.paxText ], [ 'plane', `${oneWay ? 'One way' : 'Round trip'} · ${d.cabin || 'Economy'}` ]];
        out.start = d.depart || '';
        break;
      }
      case 'hotel': {
        const { inD, outD, n } = hotelDates(d), r = +d.rooms || 1;
        out.title = `Hotel in ${placeName(d.city || d.dest) || 'your destination'}`; out.dest = DS.getDestination(d.dest) ? d.dest : '';
        out.lines = [[ 'calendar', inD ? (outD ? `${DS.fmtRange(inD, outD)} · ${n} night${n === 1 ? '' : 's'}` : `Check-in ${fmtDate(inD)}`) : 'Dates to confirm' ], [ 'bed', `${r} room${r === 1 ? '' : 's'} · ${d.stars && d.stars !== 'Any' ? d.stars : 'any class'}` ], [ 'users', out.paxText ]];
        out.start = inD || '';
        break;
      }
      case 'transport': {
        const t = DS.getTransport(d.service), start = d.depart || d.date || '';
        out.title = `${t.label}: ${placeName(d.place || d.dest) || 'your destination'}`; out.dest = DS.getDestination(d.dest) ? d.dest : '';
        out.lines = [[ 'calendar', start ? (t.dates === 'range' && d.ret ? `${DS.fmtRange(start, d.ret)} · ${DS.daysBetween(start, d.ret) + 1} days` : fmtDate(start)) : 'Date to confirm' ], [ 'users', out.paxText ]];
        out.start = start;
        break;
      }
      case 'cruise': {
        out.title = `Cruise: ${d.region || 'Asia & Japan'}`;
        out.lines = [[ 'calendar', (d.when || d.month || d.depart) ? `Sailing ${whenLine('')}` : 'Sailing dates flexible' ], [ 'ship', `${d.cabin || 'Ocean view'} cabin` ], [ 'users', out.paxText ]];
        out.start = d.depart || (d.month ? d.month + '-01' : '');
        break;
      }
      case 'insurance': {
        out.title = `${d.plan || 'Standard cover'}: ${placeName(d.dest) || 'your trip'}`; out.dest = DS.getDestination(d.dest) ? d.dest : '';
        out.lines = [[ 'calendar', d.depart ? (d.ret ? DS.fmtRange(d.depart, d.ret) : `${fmtDate(d.depart)} · return to confirm`) : 'Travel dates to confirm' ], [ 'users', out.paxText ]];
        out.start = d.depart || '';
        break;
      }
      case 'custom': {
        const inc = [].concat(d.incl || []).map(id => (C.customIncludes.find(x => x.id === id) || {}).label).filter(Boolean);
        out.title = `Custom trip: ${d.where || 'destination to suggest'}`;
        out.lines = [[ 'calendar', whenLine('Dates to confirm') ], [ 'users', out.paxText ], [ 'sparkles', inc.length ? `Includes ${inc.slice(0, 3).join(', ')}${inc.length > 3 ? ` and ${inc.length - 3} more` : ''}` : 'Your consultant suggests what to include' ]];
        if (d.notes) out.lines.push([ 'message', d.notes.length > 90 ? d.notes.slice(0, 88) + '…' : d.notes ]);
        out.note = 'Designed and quoted by your consultant';
        out.start = d.depart || (d.month ? d.month + '-01' : '');
        break;
      }
    }
    return out;
  }

  /* ---------- Public API ---------- */
  DS.cart = {
    list: () => load().filter(valid),
    count: () => DS.cart.list().length,
    get: id => DS.cart.list().find(i => i.uid === id),
    findPackage: ref => DS.cart.list().find(i => i.kind === 'package' && i.ref === ref),
    add(kind, d = {}, ref = '') { const list = load(); const item = { uid: uid(), kind, ref, d, addedAt: Date.now() }; list.push(item); save(list); return item.uid; },
    update(id, patch) { save(load().map(i => i.uid === id ? { ...i, d: { ...i.d, ...patch } } : i)); },
    remove(id) { save(load().filter(i => i.uid !== id)); },
    clear() { save([]); },
    describe,
    noun: kind => NOUN[kind],
    totals() {
      const items = DS.cart.list().map(describe);
      const priced = items.filter(x => x.price != null);
      return { items, subtotal: priced.reduce((s, x) => s + x.price, 0), pricedCount: priced.length, requestCount: items.length - priced.length };
    },
    /* Package from a card: add with sensible defaults, or remove if already there */
    togglePackage(ref) {
      const p = DS.getPackage(ref); if (!p) return;
      const existing = DS.cart.findPackage(ref);
      if (existing) { DS.cart.remove(existing.uid); DS.toast(`${p.title} removed from your Travel Cart.`); return false; }
      const dep = DS.departuresFor(p)[0];
      DS.cart.add('package', dep ? { date: dep.date, ret: dep.ret, adults: 2, children: 0 } : { adults: 2, children: 0 }, ref);
      DS.toast(`${p.title} added to your Travel Cart.`, { action: { label: 'View cart', href: 'cart.html' } });
      return true;
    },
    /* Add anything, then show the mini cart (the e-commerce "added to cart" moment) */
    addAndShow(kind, d, ref = '') { DS.cart.add(kind, d, ref); DS.cart.open({ highlightLast: true }); },
    refresh,
    open: openDrawer,
    close: closeDrawer,
    openForm,
    openHotels: o => openMulti('hotel', o),
    openMulti: (k, o) => openMulti(k, o)
  };

  /* ---------- Badges, card buttons ---------- */
  function refresh() {
    const n = DS.cart.count();
    $$('[data-cart-count]').forEach(el => { el.textContent = n; el.dataset.count = n; });
    $$('[data-cart-open]').forEach(b => b.setAttribute('aria-label', `Travel Cart, ${n} item${n === 1 ? '' : 's'}`));
    $$('[data-cart-add="package"]').forEach(btn => {
      const on = !!DS.cart.findPackage(btn.dataset.ref);
      const name = (DS.getPackage(btn.dataset.ref) || {}).title || 'package';
      btn.classList.toggle('is-active', on); btn.setAttribute('aria-pressed', String(on));
      btn.setAttribute('aria-label', on ? `Remove ${name} from Travel Cart` : `Add ${name} to Travel Cart`);
      btn.title = on ? 'In your Travel Cart' : 'Add to Travel Cart';
      const want = on ? 'bagCheck' : 'bagPlus';
      if (btn.dataset.icon !== want) { const svg = btn.querySelector('svg'); if (svg) svg.outerHTML = DS.icon(want); btn.dataset.icon = want; }
      const label = btn.querySelector('[data-cart-label]'); if (label) label.textContent = on ? 'In your cart' : 'Add to cart';
    });
    if (drawer && drawer.classList.contains('is-open')) renderDrawer();
  }
  document.addEventListener('ds:cart', refresh);
  // Another tab changed the cart
  window.addEventListener('storage', e => { if (e.key === KEY) document.dispatchEvent(new CustomEvent('ds:cart')); });

  document.addEventListener('click', e => {
    const add = e.target.closest('[data-cart-add="package"]');
    if (add) { e.preventDefault(); e.stopPropagation(); DS.cart.togglePackage(add.dataset.ref); if (DS.motion && DS.motion.pop) DS.motion.pop(add); return; }
    const opener = e.target.closest('[data-cart-open]');
    if (opener) { e.preventDefault(); openDrawer(); return; }
    const ct = e.target.closest('[data-custom-trip]');
    if (ct && !ct.closest('[data-search-widget]')) {
      e.preventDefault();
      // The homepage section lets travelers tick what to include before the form opens
      const box = ct.closest('[data-custom-section]');
      const incl = box ? $$('input[name="incl"]:checked', box).map(i => i.value) : [];
      openForm('custom', { values: { adults: 2, children: 0, incl, where: ct.dataset.where || '' } });
      return;
    }
    const neu = e.target.closest('[data-cart-new]');
    if (neu) {
      e.preventDefault();
      const pre = {}; Object.keys(neu.dataset).forEach(k => { if (k.startsWith('pre') && neu.dataset[k]) pre[k.slice(3, 4).toLowerCase() + k.slice(4)] = neu.dataset[k]; });
      const show = () => openForm(neu.dataset.cartNew, { values: { ...contextDefaults(neu.dataset.cartNew), ...pre } });
      // From inside the mini cart: close it first so the form is not stacked under it
      if (drawer && drawer.contains(neu)) { closeDrawer(); setTimeout(show, 320); } else show();
    }
  });

  /* ---------- Mini cart (slide-in drawer) ---------- */
  let drawer, lastFocus;
  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
  function ensureDrawer() {
    if (drawer) return drawer;
    drawer = html(`<div class="drawer cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title">
      <div class="drawer__backdrop" data-cart-close></div>
      <div class="drawer__panel cart-drawer__panel">
        <div class="cart-drawer__head"><h2 id="cart-drawer-title">${DS.icon('bag')}Travel Cart <span data-cart-drawer-count></span></h2><button type="button" class="icon-btn" data-cart-close aria-label="Close Travel Cart">${DS.icon('x')}</button></div>
        <div class="cart-drawer__body" data-cart-drawer-body></div>
        <div class="cart-drawer__foot" data-cart-drawer-foot></div>
      </div></div>`);
    document.body.appendChild(drawer);
    drawer.addEventListener('click', e => {
      if (e.target.closest('[data-cart-close]')) { closeDrawer(); return; }
      const rm = e.target.closest('[data-mini-remove]');
      if (rm) { const row = rm.closest('.mini-item'); const go = () => DS.cart.remove(rm.dataset.miniRemove); row.style.transition = 'opacity .2s'; row.style.opacity = '0'; setTimeout(go, 180); }
    });
    drawer.addEventListener('keydown', e => {
      if (e.key === 'Escape') { e.preventDefault(); closeDrawer(); }
      if (e.key === 'Tab') { const f = $$(FOCUSABLE, drawer).filter(el => el.offsetParent !== null); if (!f.length) return; const first = f[0], last = f[f.length - 1]; if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); } }
    });
    return drawer;
  }
  function itemMedia(x, size = 120) {
    // Eager: the drawer is hidden until opened, and lazy images there load late
    return x.image ? DS.picture(x.image, '', { w: size, h: size, eager: true, label: x.kindLabel }) : `<span class="cart-icon-tile">${DS.icon(x.icon)}</span>`;
  }
  DS.cart.media = itemMedia;
  function renderDrawer(highlightLast) {
    const t = DS.cart.totals(), list = DS.cart.list();
    $('[data-cart-drawer-count]', drawer).textContent = `(${list.length})`;
    const body = $('[data-cart-drawer-body]', drawer), foot = $('[data-cart-drawer-foot]', drawer);
    if (!list.length) {
      body.innerHTML = `<div class="cart-empty-mini"><span class="cart-icon-tile cart-icon-tile--lg">${DS.icon('bag')}</span><h3>Your Travel Cart is empty</h3><p>Add a package, then visa assistance, flights or a hotel. Send it all as one quotation request.</p></div>`;
      foot.innerHTML = `<a class="btn btn--primary btn--block" href="explore.html">Browse packages ${DS.icon('arrowRight', 'arrow')}</a><div class="cart-quick">${quickAdd()}</div>`;
      return;
    }
    body.innerHTML = `<ul class="mini-list">${list.map((it, i) => { const x = describe(it); return `<li class="mini-item ${highlightLast && i === list.length - 1 ? 'is-new' : ''}">
        <div class="mini-item__media">${itemMedia(x)}</div>
        <div class="mini-item__info"><span class="mini-item__kind">${esc(x.kindLabel)}</span><strong>${x.href ? `<a href="${x.href}">${esc(x.title)}</a>` : esc(x.title)}</strong><span>${esc((x.lines.find(l => l[0] === 'calendar') || x.lines[0])[1])} · ${esc(x.paxText)}</span></div>
        <div class="mini-item__side"><span class="${x.price != null ? 'price' : 'price price--request'}">${x.price != null ? fmtPHP(x.price) : 'On request'}</span><button type="button" class="btn btn--link btn--sm" data-mini-remove="${it.uid}" aria-label="Remove ${esc(x.title)}">Remove</button></div></li>`; }).join('')}</ul>
      <div class="cart-quick"><span class="field__label">Add to this trip</span>${quickAdd()}</div>`;
    foot.innerHTML = `${summaryRows(t)}
      <div class="cart-drawer__ctas"><a class="btn btn--ghost" href="cart.html">View cart</a><a class="btn btn--primary" href="cart.html#checkout">Request quotation ${DS.icon('arrowRight', 'arrow')}</a></div>`;
    DS.hydrateImages(drawer);
  }
  function quickAdd() {
    return `<div class="cart-quick__row">${['custom', 'visa', 'flight', 'hotel', 'transport', 'insurance', 'cruise'].map(k => `<button type="button" class="chip" data-cart-new="${k}">${DS.icon(C.kinds[k].icon)}${esc(C.kinds[k].label)}</button>`).join('')}</div>`;
  }
  /* Shared order-summary rows (drawer and cart page) */
  function summaryRows(t) {
    return `<div class="cart-totals">
      ${t.pricedCount ? `<div><span>Priced items (${t.pricedCount})</span><strong>${fmtPHP(t.subtotal)}</strong></div>` : ''}
      ${t.requestCount ? `<div><span>Priced on request (${t.requestCount})</span><strong class="muted">Quoted by consultant</strong></div>` : ''}
      <div class="cart-totals__total"><span>Estimated total${t.requestCount && t.pricedCount ? ' so far' : ''}</span><strong>${t.pricedCount ? fmtPHP(t.subtotal) : 'On request'}</strong></div>
      <p>${DS.icon('info')}<span>Sample prices. Your consultant confirms every price in one written quotation. Nothing is reserved or charged.</span></p></div>`;
  }
  DS.cart.summaryRows = summaryRows;
  function openDrawer(opts = {}) {
    ensureDrawer(); renderDrawer(opts.highlightLast);
    if (drawer.classList.contains('is-open')) return;
    lastFocus = document.activeElement;
    drawer.classList.add('is-open'); document.body.style.overflow = 'hidden';
    const first = $('[data-cart-close].icon-btn', drawer);
    if (DS.motion && DS.motion.drawerIn) DS.motion.drawerIn(drawer, () => first.focus()); else first.focus();
  }
  function closeDrawer() {
    if (!drawer || !drawer.classList.contains('is-open')) return;
    const done = () => { drawer.classList.remove('is-open'); document.body.style.overflow = ''; if (lastFocus && lastFocus.focus && document.contains(lastFocus)) lastFocus.focus(); };
    if (DS.motion && DS.motion.drawerOut) DS.motion.drawerOut(drawer, done); else done();
  }

  /* ---------- Add / edit forms (one modal for every kind) ----------
     Inside a modal nothing pops over other fields: dates and travelers are shown
     inline, and only the place search opens a list (above everything else). */
  // Pre-fill new items from what is already in the cart (first package's destination and dates)
  function contextDefaults(kind) {
    const pkg = DS.cart.list().find(i => i.kind === 'package');
    if (!pkg) return { adults: 2, children: 0 };
    const p = DS.getPackage(pkg.ref), d = pkg.d || {};
    const visa = C.visa.find(v => v.destinationId === p.destinationId);
    const base = { adults: d.adults || 2, children: d.children || 0, group: d.group };
    const ret = d.ret || (d.date ? DS.addDays(d.date, p.duration.nights) : '');
    const dates = d.date ? { when: 'dates', depart: d.date, ret } : {};
    return ({
      visa: { ...base, ...dates, country: visa ? visa.id : 'other' },
      flight: { ...base, ...dates, origin: 'MNL', to: p.airport, trip: 'return' },
      hotel: { ...base, ...dates, city: DS.airportCity(p.airport), rooms: 1 },
      transport: { ...base, service: 'airport-transfer', place: DS.airportCity(p.airport), depart: d.date || '' },
      insurance: { ...base, ...dates, dest: p.country },
      custom: { ...base, ...dates, where: DS.placeLabel(p) },
      cruise: { ...base }
    })[kind] || base;
  }
  const fSel = (id, label, name, options, icon) => `<div class="field"><label class="field__label" for="${id}">${label}</label><div class="field__control">${icon ? DS.icon(icon) : ''}<select class="select" id="${id}" name="${name}">${options}</select></div></div>`;
  const opts = (list, sel) => list.map(o => `<option ${o === sel ? 'selected' : ''}>${esc(o)}</option>`).join('');
  const svcOpts = sel => C.transportServices.map(t => `<option value="${t.id}" ${t.id === sel ? 'selected' : ''}>${esc(t.label)}</option>`).join('');
  // Legacy items stored a destination id where a place name is expected now
  const asPlace = v => { const d = DS.getDestination(v); return d ? (d.type === 'domestic' ? `${d.name}, Philippines` : d.country) : (v === 'other' ? '' : v || ''); };
  const asAirport = v => (DS.getDestination(v) || {}).airport || (v === 'other' ? '' : v || '');

  function formFields(kind, v, item) {
    const P = (label, extra = {}) => DS.paxPicker({ inline: true, label, adults: +v.adults || (kind === 'visa' ? 1 : 2), children: +v.children || 0, group: v.group, noun: NOUN[kind], ...extra });
    const W = o => DS.whenPicker({ id: 'cf-when', inline: true, value: v, ...o });
    switch (kind) {
      case 'package': {
        const p = DS.getPackage(item.ref);
        return `<div class="field--full">${DS.departureList(p, { date: v.date, ret: v.ret, custom: v.custom }, { name: 'cf-dep' })}</div>` + P('Travelers');
      }
      case 'visa':
        return fSel('cf-country', 'Visa for', 'country', C.visa.map(x => `<option value="${x.id}" ${v.country === x.id ? 'selected' : ''}>${esc(x.name)}${x.fee ? ` · ${fmtPHP(x.fee)} each` : ' · on request'}</option>`).join(''), 'passport') +
          W({ label: 'Travel dates', modes: ['dates', 'month'], retOptional: true, datesHelp: 'Not sure yet? Leave the dates empty and decide with your consultant.' }) + P('Applicants');
      case 'flight': {
        const one = v.trip === 'oneway';
        return `<div class="field field--full trip-type" role="radiogroup" aria-labelledby="cf-trip-l"><span class="field__label" id="cf-trip-l">Flight</span><div class="seg seg--type">
            <label class="seg__opt"><input type="radio" name="trip" value="return" ${one ? '' : 'checked'}><span>Round trip</span></label>
            <label class="seg__opt"><input type="radio" name="trip" value="oneway" ${one ? 'checked' : ''}><span>One way</span></label></div></div>` +
          DS.placeField({ id: 'cf-from', name: 'origin', label: 'From', source: 'airports', icon: 'plane', value: v.origin || 'MNL', placeholder: 'City, airport or code' }) +
          DS.placeField({ id: 'cf-to', name: 'to', label: 'To', source: 'airports', value: asAirport(v.to), placeholder: 'City, airport or code', required: true }) +
          W({ label: 'Dates', modes: ['dates'], oneWay: one }) + fSel('cf-cabin', 'Cabin', 'cabin', opts(C.cabins, v.cabin || 'Economy'), 'plane') + P('Passengers');
      }
      case 'hotel': {
        const { inD, outD } = hotelDates(v);
        return DS.placeField({ id: 'cf-city', name: 'city', label: 'Destination', source: 'places', value: v.city || asPlace(v.dest), placeholder: 'City or area', required: true }) +
          fSel('cf-stars', 'Hotel class', 'stars', opts(C.hotelClass, v.stars || 'Any'), 'star') +
          DS.whenPicker({ id: 'cf-when', inline: true, label: 'Stay', labels: { depart: 'Check-in', ret: 'Check-out' }, modes: ['dates'], value: { when: inD ? 'dates' : '', depart: inD, ret: outD } }) +
          P('Guests and rooms', { rooms: +v.rooms || 1 });
      }
      case 'transport': {
        const t = DS.getTransport(v.service);
        return fSel('cf-service', 'Service', 'service', svcOpts(t.id), 'car') +
          DS.placeField({ id: 'cf-place', name: 'place', label: 'Pick-up city or airport', source: 'places', value: v.place || asPlace(v.dest), placeholder: 'City, airport or area', required: true }) +
          DS.whenPicker({ id: 'cf-when', inline: true, label: 'Dates', labels: t.labels, modes: ['dates'], oneWay: t.dates === 'single', value: { when: (v.depart || v.date) ? 'dates' : '', depart: v.depart || v.date || '', ret: v.ret || '' } }) +
          `<p class="field--full cart-form__note" data-svc-note>${DS.icon('info')}<span>${esc(t.blurb)}</span></p>` + P('Passengers');
      }
      case 'cruise':
        return fSel('cf-region', 'Cruise region', 'region', opts(C.cruiseRegions, v.region || 'Asia & Japan'), 'ship') + fSel('cf-cabin', 'Cabin', 'cabin', opts(C.cruiseCabins, v.cabin || 'Ocean view'), 'bed') +
          W({ label: 'Sailing dates', modes: ['month', 'dates', 'flex'], labels: { depart: 'Sail from', ret: 'Back by' } }) + P('Guests');
      case 'insurance':
        return DS.placeField({ id: 'cf-dest', name: 'dest', label: 'Destination', source: 'countries', icon: 'globe', value: asPlace(v.dest), placeholder: 'Country or region' }) +
          fSel('cf-plan', 'Plan', 'plan', opts(C.insurancePlans, v.plan || 'Standard cover'), 'shield') + W({ label: 'Travel dates', modes: ['dates'] }) + P('Travelers');
      case 'custom':
        return DS.inclPicker({ selected: v.incl }) +
          DS.placeField({ id: 'cf-where', name: 'where', label: 'Where do you want to go?', source: 'places', value: v.where || '', placeholder: 'A city, a country, or several', full: true, help: 'Not sure yet? Leave it empty and your consultant suggests places.' }) +
          W({ label: 'When', modes: ['dates', 'month', 'flex'] }) + P('Travelers') +
          fSel('cf-style', 'Pace', 'style', opts(C.travelStyles, v.style || 'Balanced'), 'clock') +
          fSel('cf-stars', 'Hotel class', 'stars', opts(C.hotelClass, v.stars || 'Any'), 'star') +
          `<div class="field field--full"><label class="field__label" for="cf-budget">Budget per person (optional)</label><div class="field__control">${DS.icon('wallet')}<select class="select" id="cf-budget" name="budget">${['', 'Under ₱30,000', '₱30,000 – ₱60,000', '₱60,000 – ₱100,000', 'Over ₱100,000'].map(b => `<option value="${esc(b)}" ${v.budget === b ? 'selected' : ''}>${b || 'Prefer not to say'}</option>`).join('')}</select></div></div>` +
          `<div class="field field--full"><label class="field__label" for="cf-notes">Anything else?</label><textarea class="textarea" id="cf-notes" name="notes" placeholder="Must-see places, activities, a birthday or honeymoon, dietary needs…">${esc(v.notes || '')}</textarea></div>`;
    }
    return '';
  }

  const SUBMIT_LABEL = { custom: 'Add custom trip to cart' };
  function openForm(kind, o = {}) {
    if (!C.kinds[kind]) return;
    const item = o.uid ? DS.cart.get(o.uid) : null;
    // Multi-city flights are edited in the multi-line form
    if (item && kind === 'flight' && item.d.legs) { openMulti('flight', { uid: item.uid }); return; }
    const v = item ? { ...item.d } : { ...(o.values || {}) };
    const k = C.kinds[kind];
    const form = html(`<form class="cart-form cart-form--${kind}" novalidate>
      <div class="form-grid">${formFields(kind, v, item)}</div>
      <div class="cart-form__foot"><p class="small muted">${DS.icon('info')}<span>${kind === 'visa' ? 'Sample service fee where shown. ' : ''}${kind === 'custom' ? 'A consultant designs the trip and sends one quotation. ' : ''}${item ? 'Changes update your cart straight away.' : 'Prices you do not see here are quoted by your consultant.'}</span></p>
        <div class="cluster"><button type="button" class="btn btn--ghost" data-modal-close>Cancel</button><button type="submit" class="btn btn--primary">${item ? 'Save changes' : `${DS.icon('bagPlus')} ${SUBMIT_LABEL[kind] || 'Add to Travel Cart'}`}</button></div></div>
    </form>`);
    form.addEventListener('change', e => {
      if (e.target.name === 'trip') DS.whenSetOneWay($('[data-when]', form), e.target.value === 'oneway');
      if (e.target.id === 'cf-service') { const t = DS.getTransport(e.target.value), w = $('[data-when]', form); DS.whenSetLabels(w, t.labels); DS.whenSetOneWay(w, t.dates === 'single'); $('[data-svc-note] span', form).textContent = t.blurb; }
    });
    // Custom trip with a single thing ticked: offer that service's own form instead
    form.addEventListener('ds:incl-single', e => {
      const data = Object.fromEntries(new FormData(form).entries()), x = e.detail;
      const carry = { adults: +data.adults || 2, children: +data.children || 0, group: data.group, when: data.when, depart: data.depart, ret: data.ret, month: data.month };
      if (!x.kind) { location.href = 'explore.html'; return; }
      const place = data.where || '';
      // Swap the form in place (closing and reopening would race the close animation)
      openForm(x.kind, { values: { ...carry, service: x.service, place, city: place, dest: place.split(',').pop().trim() } });
    });
    form.addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(form);
      const data = Object.fromEntries([...fd.entries()].filter(([key]) => !key.startsWith('_') && key !== 'cf-dep'));
      const whenRoot = $('[data-when]', form);
      if (kind === 'custom' && !DS.inclValidate($('[data-incl]', form))) return;
      if (kind === 'flight' && !data.to) { DS.comboError($('#cf-to', form).closest('[data-combo]'), 'Enter where you are flying to.'); return; }
      if (kind === 'hotel' && !data.city) { DS.comboError($('#cf-city', form).closest('[data-combo]'), 'Enter a city or area.'); return; }
      if (kind === 'transport' && !data.place) { DS.comboError($('#cf-place', form).closest('[data-combo]'), 'Enter a city, airport or area.'); return; }
      if (kind === 'package') { const dl = $('[data-dep-list]', form); if (!DS.validateDeparture(dl)) return; Object.assign(data, DS.readDeparture(dl)); }
      if (whenRoot && !DS.whenValidate(whenRoot, kind === 'flight' ? { requireDepart: true, requireRet: true } : kind === 'hotel' ? { retLabel: 'Check-out', departLabel: 'check-in' } : {})) return;
      if (!DS.paxValidate($('[data-pax]', form))) return;
      if (kind === 'custom') data.incl = fd.getAll('incl');
      delete data.type;
      data.adults = +data.adults || 1; data.children = +data.children || 0;
      if (data.rooms) data.rooms = +data.rooms;
      // Older items kept other field names; clear them so the new ones win
      const legacy = { hotel: { dest: '', checkin: '', nights: '' }, transport: { dest: '', date: '' } }[kind] || {};
      DS.modal.close();
      if (item) { DS.cart.update(item.uid, { ...legacy, ...data }); DS.toast('Cart updated.'); }
      else setTimeout(() => DS.cart.addAndShow(kind, data), 280);
    });
    const title = item ? `Edit ${k.label.toLowerCase()}` : kind === 'custom' ? 'Build a custom trip' : `Add ${k.label.toLowerCase()}`;
    DS.modal.open(form, { title, subtitle: kind === 'custom' ? 'Tell us what to include, where and when. A consultant designs the itinerary and quotes it.' : (k.blurb || ''), large: kind !== 'package' && kind !== 'visa' });
    const incl = $('[data-incl]', form); if (incl) DS.inclSync(incl);
  }

  /* ---------- Several lines at once ----------
     Visa (several countries), flights (multi-city), hotels (several cities) and
     transport (several transfers or cars) share one form: a row per line, an
     "Add another" button, and shared traveler counts. Hotels, visas and transport add
     one cart item per row; a multi-city flight is one item with its legs.
     Tours, cruises, insurance and corporate travel do not need it: a package or cruise is
     already a whole trip, one policy covers every country, and corporate trips are
     planned in a proposal. */
  const today = () => DS.todayISO();
  const rowDate = (n, key, label, value, min) => `<div class="field"><label class="field__label" for="r-${key}-${n}">${label}</label><input class="input" type="date" id="r-${key}-${n}" data-r="${key}" min="${esc(min || today())}" value="${esc(value || '')}"><span class="field__error" aria-live="polite"></span></div>`;
  const rowSel = (n, key, label, options) => `<div class="field"><label class="field__label" for="r-${key}-${n}">${label}</label><select class="select" id="r-${key}-${n}" data-r="${key}">${options}</select></div>`;
  const MULTI = {
    hotel: {
      title: 'Hotels in more than one city', sub: 'Add a row for each city. Dates follow on from the previous stay.', add: 'Add another city', unit: ['hotel', 'hotels'], noun: 'guest', paxLabel: 'Guests and rooms (each city)', rooms: true,
      row: (r, n) => DS.placeField({ id: `r-city-${n}`, name: `_city-${n}`, label: 'City or area', source: 'places', value: r.city || '', placeholder: 'City or area', required: true }) +
        rowDate(n, 'depart', 'Check-in', r.depart) + rowDate(n, 'ret', 'Check-out', r.ret, r.depart) + rowSel(n, 'stars', 'Hotel class', opts(C.hotelClass, r.stars || 'Any')),
      next: prev => ({ depart: prev.ret }),
      read: (row, fail) => { const x = { city: rowPlace(row), depart: rv(row, 'depart'), ret: rv(row, 'ret'), stars: rv(row, 'stars') }; if (!x.city) return fail(row, '.combo__input', 'Enter a city or area.'); if (x.depart && x.ret && x.ret <= x.depart) return fail(row, '[data-r="ret"]', 'Check-out must be after check-in.'); return { ...x, when: x.depart ? 'dates' : '' }; }
    },
    transport: {
      title: 'Transfers and cars', sub: 'Add a row for each transfer, hire or rental. Each one is quoted separately.', add: 'Add another transfer or car', unit: ['transport request', 'transport requests'], noun: 'passenger', paxLabel: 'Passengers',
      row: (r, n) => { const t = DS.getTransport(r.service); return rowSel(n, 'service', 'Service', svcOpts(t.id)) +
        DS.placeField({ id: `r-place-${n}`, name: `_place-${n}`, label: 'Pick-up city or airport', source: 'places', value: r.place || '', placeholder: 'City, airport or area', required: true }) +
        rowDate(n, 'depart', t.labels.depart, r.depart) + `<div class="multi-row__ret" ${t.dates === 'range' ? '' : 'hidden'}>${rowDate(n, 'ret', t.labels.ret || 'End date', r.ret, r.depart)}</div>`; },
      next: prev => ({ service: 'airport-transfer', place: prev.place, depart: prev.ret || prev.depart }),
      read: (row, fail) => { const t = DS.getTransport(rv(row, 'service')), x = { service: t.id, place: rowPlace(row), depart: rv(row, 'depart'), ret: t.dates === 'range' ? rv(row, 'ret') : '' }; if (!x.place) return fail(row, '.combo__input', 'Enter a city, airport or area.'); if (x.depart && x.ret && x.ret < x.depart) return fail(row, '[data-r="ret"]', 'End date must be after the start.'); return x; },
      change: (row, e) => { if (e.target.dataset.r !== 'service') return; const t = DS.getTransport(e.target.value), box = $('.multi-row__ret', row); box.hidden = t.dates !== 'range'; $('label', $('[data-r="depart"]', row).closest('.field')).textContent = t.labels.depart; if (t.labels.ret) $('label', box).textContent = t.labels.ret; }
    },
    visa: {
      title: 'Visas for more than one country', sub: 'Add a row for each country you need a visa for. Applicants apply to every row.', add: 'Add another country', unit: ['visa request', 'visa requests'], noun: 'applicant', paxLabel: 'Applicants',
      row: (r, n) => rowSel(n, 'country', 'Visa for', C.visa.map(x => `<option value="${x.id}" ${x.id === r.country ? 'selected' : ''}>${esc(x.name)}${x.fee ? ` · ${fmtPHP(x.fee)} each` : ''}</option>`).join('')) +
        rowDate(n, 'depart', 'Entry date (optional)', r.depart) + rowDate(n, 'ret', 'Exit date (optional)', r.ret, r.depart),
      next: prev => ({ country: prev.country === 'japan' ? 'korea' : 'japan', depart: prev.ret }),
      read: (row, fail) => { const x = { country: rv(row, 'country'), depart: rv(row, 'depart'), ret: rv(row, 'ret') }; if (x.depart && x.ret && x.ret < x.depart) return fail(row, '[data-r="ret"]', 'Exit date must be after entry.'); return { ...x, when: x.depart ? 'dates' : '', retopen: x.depart && !x.ret ? '1' : '' }; }
    },
    flight: {
      title: 'Multi-city flights', sub: 'Add each flight in order. The next flight starts where the last one landed.', add: 'Add another flight', unit: ['flight', 'flights'], noun: 'passenger', paxLabel: 'Passengers', combine: true, min: 2, cabin: true,
      row: (r, n) => DS.placeField({ id: `r-from-${n}`, name: `_from-${n}`, label: 'From', source: 'airports', icon: 'plane', value: r.origin || '', placeholder: 'City, airport or code', required: true }) +
        DS.placeField({ id: `r-to-${n}`, name: `_to-${n}`, label: 'To', source: 'airports', value: r.to || '', placeholder: 'City, airport or code', required: true }) + rowDate(n, 'depart', 'Date', r.depart),
      next: prev => ({ origin: prev.to }),
      read: (row, fail) => { const [from, to] = $$('[data-combo] input[type="hidden"]', row).map(i => i.value.trim()); const x = { origin: from, to, depart: rv(row, 'depart') }; if (!from) return fail(row, '[data-combo]:nth-of-type(1) .combo__input', 'Enter where this flight leaves from.'); if (!to) return fail(row, '[data-combo]:nth-of-type(2) .combo__input', 'Enter where this flight goes.'); if (!x.depart) return fail(row, '[data-r="depart"]', 'Choose a date for this flight.'); return x; }
    }
  };
  const rv = (row, key) => { const el = $(`[data-r="${key}"]`, row); return el ? el.value : ''; };
  const rowPlace = row => $('[data-combo] input[type="hidden"]', row).value.trim();
  function openMulti(kind, o = {}) {
    const M = MULTI[kind]; if (!M) return;
    const item = o.uid ? DS.cart.get(o.uid) : null, d = item ? item.d : o;
    let rows = item ? d.legs : (o.rows && o.rows.length ? o.rows : [{}, {}]);
    rows = rows.map((r, i) => i && !r.depart && !r.origin && !r.place && !r.city ? { ...M.next(rows[i - 1] || {}), ...r } : r);
    let seq = 0;
    const rowHTML = r => { const n = ++seq; return `<li class="multi-row multi-row--${kind}" data-multi-row><span class="multi-row__n" aria-hidden="true"></span>${M.row(r, n)}<button type="button" class="icon-btn multi-row__rm" data-row-remove aria-label="Remove this row">${DS.icon('trash')}</button></li>`; };
    const form = html(`<form class="cart-form multi-form" novalidate>
      <ol class="multi-rows" data-rows>${rows.map(rowHTML).join('')}</ol>
      <button type="button" class="btn btn--ghost btn--sm multi-form__add" data-row-add>${DS.icon('plus')} ${M.add}</button>
      <div class="form-grid multi-form__shared">${M.cabin ? fSel('mf-cabin', 'Cabin', 'cabin', opts(C.cabins, d.cabin || 'Economy'), 'plane') : ''}${DS.paxPicker({ inline: true, label: M.paxLabel, adults: +d.adults || (kind === 'visa' ? 1 : 2), children: +d.children || 0, group: d.group, noun: M.noun, rooms: M.rooms ? (+d.rooms || 1) : undefined })}</div>
      <div class="cart-form__foot"><p class="small muted">${DS.icon('info')}<span>${M.combine ? 'All flights are quoted together as one itinerary.' : 'Each row is added as its own request. Your consultant quotes every one.'}</span></p>
        <div class="cluster"><button type="button" class="btn btn--ghost" data-modal-close>Cancel</button><button type="submit" class="btn btn--primary">${DS.icon('bagPlus')} <span data-row-count></span></button></div></div>
    </form>`);
    const list = $('[data-rows]', form), min = M.min || 1;
    const renumber = () => {
      const rs = $$('[data-multi-row]', list);
      rs.forEach((r, i) => { $('.multi-row__n', r).textContent = i + 1; $('[data-row-remove]', r).disabled = rs.length <= min; });
      $('[data-row-count]', form).textContent = item ? 'Save changes' : M.combine ? `Add ${rs.length} ${M.unit[1]} to cart` : `Add ${rs.length} ${rs.length === 1 ? M.unit[0] : M.unit[1]} to cart`;
      $('[data-row-add]', form).disabled = rs.length >= 8;
    };
    const lastRowData = () => { const r = $$('[data-multi-row]', list).pop(); if (!r) return {}; const hid = $$('[data-combo] input[type="hidden"]', r).map(i => i.value); return { ret: rv(r, 'ret'), depart: rv(r, 'depart'), country: rv(r, 'country'), place: hid[0], city: hid[0], to: hid[1] }; };
    form.addEventListener('click', e => {
      if (e.target.closest('[data-row-add]')) {
        list.insertAdjacentHTML('beforeend', rowHTML(M.next(lastRowData())));
        renumber(); const row = list.lastElementChild; if (DS.motion && DS.motion.tabIn) DS.motion.tabIn(row);
        const first = $('.combo__input, select, input[type="date"]', row); if (first) first.focus();
      }
      const rm = e.target.closest('[data-row-remove]'); if (rm && !rm.disabled) { rm.closest('[data-multi-row]').remove(); renumber(); }
    });
    form.addEventListener('change', e => {
      const row = e.target.closest('[data-multi-row]'); if (!row) return;
      if (e.target.dataset.r === 'depart') { const r = $('[data-r="ret"]', row); if (r) { r.min = e.target.value || today(); if (r.value && r.value < e.target.value) r.value = ''; } }
      if (M.change) M.change(row, e);
    });
    form.addEventListener('submit', e => {
      e.preventDefault();
      $$('.is-invalid', form).forEach(f => f.classList.remove('is-invalid'));
      let bad = false;
      const fail = (row, sel, msg) => { const el = $(sel, row) || $('input', row), f = el.closest('.field'); f.classList.add('is-invalid'); const er = $('.field__error', f); if (er) er.textContent = msg; el.focus(); if (DS.motion && DS.motion.shake) DS.motion.shake(f); bad = true; return null; };
      const out = [];
      for (const row of $$('[data-multi-row]', list)) { const x = M.read(row, fail); if (bad) return; out.push(x); }
      if (!DS.paxValidate($('[data-pax]', form))) return;
      const v = name => { const i = $(`input[name="${name}"]`, form); return i ? i.value : ''; };
      const pax = { adults: +v('adults') || 1, children: +v('children') || 0, group: v('group') };
      if (M.rooms) pax.rooms = +v('rooms') || 1;
      DS.modal.close();
      if (M.combine) {
        const data = { ...pax, legs: out, trip: 'multi', cabin: $('#mf-cabin', form).value, origin: out[0].origin, to: out[out.length - 1].to, depart: out[0].depart };
        if (item) { DS.cart.update(item.uid, data); DS.toast('Cart updated.'); return; }
        setTimeout(() => DS.cart.addAndShow(kind, data), 280); return;
      }
      setTimeout(() => { out.forEach(x => DS.cart.add(kind, { ...x, ...pax })); DS.cart.open({ highlightLast: true }); DS.toast(`${out.length} ${out.length === 1 ? M.unit[0] : M.unit[1]} added to your Travel Cart.`); }, 280);
    });
    DS.modal.open(form, { title: item ? `Edit ${M.title.toLowerCase()}` : M.title, subtitle: M.sub, large: true });
    renumber();
  }

  // Homepage custom-trip section: "Only need a hotel?" opens that service's form
  document.addEventListener('ds:incl-single', e => {
    if (!e.target.closest('[data-custom-section]')) return;
    if (!e.detail.kind) { location.href = 'explore.html'; return; }
    openForm(e.detail.kind, { values: { ...contextDefaults(e.detail.kind), service: e.detail.service } });
  });
  document.addEventListener('DOMContentLoaded', refresh);
})(window.DS);
