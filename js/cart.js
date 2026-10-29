/* ==========================================================================
   Dreamspree — Travel Cart (shared on every page)
   An e-commerce style cart for a consultant-led agency: travellers add packages,
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
  const NOUN = { package: 'traveller', visa: 'applicant', flight: 'passenger', hotel: 'guest', transport: 'passenger', cruise: 'guest', insurance: 'traveller', custom: 'traveller' };

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
    const out = { kind: it.kind, kindLabel: kind.label, icon: kind.icon, image: '', href: '', lines: [], price: null, note: 'Price on request', paxText: DS.paxLabel(a, c, NOUN[it.kind]) };
    const whenLine = fallback => DS.whenText(d, { placeholder: fallback });
    switch (it.kind) {
      case 'package': {
        const p = DS.getPackage(it.ref), ret = d.ret || (d.date ? DS.addDays(d.date, p.duration.nights) : '');
        const custom = !!d.custom || (!!d.date && !p.departures.some(x => x.date === d.date));
        out.title = p.title; out.image = p.images[0]; out.href = `package.html?id=${p.id}`; out.dest = p.destinationId; out.custom = custom;
        if (custom) { out.kindLabel = 'Custom trip · based on a package'; out.icon = 'sparkles'; }
        const len = custom && d.date && ret ? `${DS.daysBetween(d.date, ret) + 1} days, ${DS.daysBetween(d.date, ret)} nights` : `${p.duration.days} days, ${p.duration.nights} nights`;
        out.lines = [[ 'calendar', d.date ? `${custom ? 'Your dates: ' : ''}${DS.fmtRange(d.date, ret)}` : d.month ? `Around ${DS.fmtMonth(d.month)}` : 'Departure date to confirm' ], [ 'clock', len ], [ 'users', out.paxText ]];
        if (DS.hasPrice(p) && !custom) { out.price = a * p.priceFrom + c * p.priceFrom * p.childRate; out.note = `${a} × ${fmtPHP(p.priceFrom)}${c ? ` + ${c} × ${fmtPHP(p.priceFrom * p.childRate)}` : ''} · sample`; }
        else if (custom) out.note = 'Custom dates are quoted by your consultant';
        out.start = d.date || (d.month ? d.month + '-01' : '');
        break;
      }
      case 'visa': {
        const v = C.visa.find(x => x.id === d.country) || C.visa[0];
        out.title = `${v.name} visa assistance`; out.dest = v.destinationId || '';
        const t = (d.when || d.depart || d.month) ? `Travelling ${whenLine('')}`.replace('return open', d.retopen ? 'return not decided' : 'return open') : 'Travel dates not decided yet';
        out.lines = [[ 'calendar', t ], [ 'users', out.paxText ], [ 'check', 'Checklist, appointment booking and document review' ]];
        if (v.fee) { out.price = v.fee * (a + c); out.note = `${a + c} × ${fmtPHP(v.fee)} service fee · sample`; }
        out.start = d.depart || (d.month ? d.month + '-01' : '');
        break;
      }
      case 'flight': {
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
        out.title = `${d.service || 'Airport transfer'}: ${destName(d.dest) || 'your destination'}`; out.dest = d.dest;
        out.lines = [[ 'calendar', d.date ? fmtDate(d.date) : 'Date to confirm' ], [ 'users', out.paxText ]];
        out.start = d.date || '';
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
    openHotels
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
      // The homepage section lets travellers tick what to include before the form opens
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

  /* ---------- Add / edit forms (one modal for every kind) ---------- */
  // Pre-fill new items from what is already in the cart (first package's destination and dates)
  function contextDefaults(kind) {
    const pkg = DS.cart.list().find(i => i.kind === 'package');
    if (!pkg) return { adults: 2, children: 0 };
    const p = DS.getPackage(pkg.ref), d = pkg.d || {};
    const visa = C.visa.find(v => v.destinationId === p.destinationId);
    const base = { adults: d.adults || 2, children: d.children || 0 };
    const ret = d.ret || (d.date ? DS.addDays(d.date, p.duration.nights) : '');
    const dates = d.date ? { when: 'dates', depart: d.date, ret } : {};
    return ({
      visa: { ...base, ...dates, country: visa ? visa.id : 'other' },
      flight: { ...base, ...dates, origin: 'MNL', to: p.airport, trip: 'return' },
      hotel: { ...base, ...dates, city: DS.airportCity(p.airport), rooms: 1 },
      transport: { ...base, dest: p.destinationId, date: d.date || '' },
      insurance: { ...base, ...dates, dest: p.country },
      custom: { ...base, ...dates, where: DS.placeLabel(p) },
      cruise: { ...base }
    })[kind] || base;
  }
  const fSel = (id, label, name, options, icon) => `<div class="field"><label class="field__label" for="${id}">${label}</label><div class="field__control">${icon ? DS.icon(icon) : ''}<select class="select" id="${id}" name="${name}">${options}</select></div></div>`;
  const fDate = (id, label, name, value, help) => `<div class="field"><label class="field__label" for="${id}">${label}</label><div class="field__control">${DS.icon('calendar')}<input class="input" id="${id}" name="${name}" type="date" min="${DS.todayISO()}" value="${esc(value || '')}"></div>${help ? `<span class="field__help">${help}</span>` : ''}<span class="field__error" aria-live="polite"></span></div>`;
  const opts = (list, sel) => list.map(o => `<option ${o === sel ? 'selected' : ''}>${esc(o)}</option>`).join('');
  const typeOf = dest => (DS.getDestination(dest) || {}).type || 'international';
  const typeRadios = t => `<div class="field field--full trip-type" role="radiogroup" aria-labelledby="cf-type-l"><span class="field__label" id="cf-type-l">Trip type</span><div class="seg seg--type">
      <label class="seg__opt"><input type="radio" name="type" value="international" ${t === 'international' ? 'checked' : ''}><span>${DS.icon('globe')}International</span></label>
      <label class="seg__opt"><input type="radio" name="type" value="domestic" ${t === 'domestic' ? 'checked' : ''}><span>${DS.icon('sun')}Domestic</span></label></div></div>`;
  // Legacy items stored a destination id where a place name is expected now
  const asPlace = v => { const d = DS.getDestination(v); return d ? (d.type === 'domestic' ? `${d.name}, Philippines` : d.country) : (v === 'other' ? '' : v || ''); };
  const asAirport = v => (DS.getDestination(v) || {}).airport || (v === 'other' ? '' : v || '');

  function formFields(kind, v, item) {
    const P = (label, max, extra = {}) => DS.paxPicker({ label, adults: +v.adults || (kind === 'visa' ? 1 : 2), children: +v.children || 0, noun: NOUN[kind], max, ...extra });
    const W = o => DS.whenPicker({ id: 'cf-when', inline: true, value: v, ...o });
    switch (kind) {
      case 'package': {
        const p = DS.getPackage(item.ref);
        return `<div class="field--full">${DS.departureList(p, { date: v.date, ret: v.ret, custom: v.custom }, { name: 'cf-dep' })}</div>` + P('Travellers');
      }
      case 'visa':
        return fSel('cf-country', 'Visa for', 'country', C.visa.map(x => `<option value="${x.id}" ${v.country === x.id ? 'selected' : ''}>${esc(x.name)}${x.fee ? ` · ${fmtPHP(x.fee)} each` : ' · on request'}</option>`).join(''), 'passport') + P('Applicants') +
          W({ label: 'Travel dates', modes: ['dates', 'month'], retOptional: true, datesHelp: 'Not sure yet? Leave the dates empty and decide with your consultant.' });
      case 'flight': {
        const one = v.trip === 'oneway';
        return `<div class="field field--full trip-type" role="radiogroup" aria-labelledby="cf-trip-l"><span class="field__label" id="cf-trip-l">Flight</span><div class="seg seg--type">
            <label class="seg__opt"><input type="radio" name="trip" value="return" ${one ? '' : 'checked'}><span>Round trip</span></label>
            <label class="seg__opt"><input type="radio" name="trip" value="oneway" ${one ? 'checked' : ''}><span>One way</span></label></div></div>` +
          DS.placeField({ id: 'cf-from', name: 'origin', label: 'From', source: 'airports', icon: 'plane', value: v.origin || 'MNL', placeholder: 'City, airport or code' }) +
          DS.placeField({ id: 'cf-to', name: 'to', label: 'To', source: 'airports', value: asAirport(v.to), placeholder: 'City, airport or code', required: true }) +
          W({ label: 'Dates', modes: ['dates'], oneWay: one }) + P('Passengers') + fSel('cf-cabin', 'Cabin', 'cabin', opts(C.cabins, v.cabin || 'Economy'));
      }
      case 'hotel': {
        const { inD, outD } = hotelDates(v);
        return DS.placeField({ id: 'cf-city', name: 'city', label: 'Destination', source: 'places', value: v.city || asPlace(v.dest), placeholder: 'City or area', required: true }) +
          P('Guests and rooms', 12, { rooms: +v.rooms || 1 }) +
          DS.whenPicker({ id: 'cf-when', inline: true, label: 'Stay', labels: { depart: 'Check-in', ret: 'Check-out' }, modes: ['dates'], value: { when: inD ? 'dates' : '', depart: inD, ret: outD } }) +
          fSel('cf-stars', 'Hotel class', 'stars', opts(C.hotelClass, v.stars || 'Any'));
      }
      case 'transport': {
        const t = typeOf(v.dest);
        return typeRadios(t) + `<div class="field"><label class="field__label" for="cf-dest">Destination</label><div class="field__control">${DS.icon('pin')}<select class="select" id="cf-dest" name="dest" data-dest-select>${DS.destOptions(t, v.dest || '', { anyLabel: 'Choose later' })}</select></div></div>` +
          fSel('cf-service', 'Service', 'service', opts(C.transport, v.service || 'Airport transfer'), 'car') + fDate('cf-date', 'Date', 'date', v.date) + P('Passengers');
      }
      case 'cruise':
        return fSel('cf-region', 'Cruise region', 'region', opts(C.cruiseRegions, v.region || 'Asia & Japan'), 'ship') + fSel('cf-cabin', 'Cabin', 'cabin', opts(C.cruiseCabins, v.cabin || 'Ocean view')) +
          W({ label: 'Sailing dates', modes: ['month', 'dates', 'flex'], labels: { depart: 'Sail from', ret: 'Back by' } }) + P('Guests');
      case 'insurance':
        return DS.placeField({ id: 'cf-dest', name: 'dest', label: 'Destination', source: 'countries', icon: 'globe', value: asPlace(v.dest), placeholder: 'Country or region' }) +
          fSel('cf-plan', 'Plan', 'plan', opts(C.insurancePlans, v.plan || 'Standard cover'), 'shield') + W({ label: 'Travel dates', modes: ['dates'] }) + P('Travellers');
      case 'custom': {
        const incl = [].concat(v.incl || []);
        return DS.placeField({ id: 'cf-where', name: 'where', label: 'Where do you want to go?', source: 'places', value: v.where || '', placeholder: 'A city, a country, or several', full: true, help: 'Not sure yet? Leave it empty and your consultant suggests places.' }) +
          W({ label: 'When', modes: ['dates', 'month', 'flex'] }) +
          `<fieldset class="field field--full incl-pick"><legend class="field__label">What should we include?</legend><div class="incl-pick__grid">${C.customIncludes.map(x => `<label class="incl-chip"><input type="checkbox" name="incl" value="${x.id}" ${incl.includes(x.id) ? 'checked' : ''}><span>${DS.icon(x.icon)}${esc(x.label)}</span></label>`).join('')}</div></fieldset>` +
          P('Travellers', 30) + fSel('cf-style', 'Pace', 'style', opts(C.travelStyles, v.style || 'Balanced')) +
          fSel('cf-stars', 'Hotel class', 'stars', opts(C.hotelClass, v.stars || 'Any')) +
          fSel('cf-budget', 'Budget per person (optional)', 'budget', ['', 'Under ₱30,000', '₱30,000 – ₱60,000', '₱60,000 – ₱100,000', 'Over ₱100,000'].map(b => `<option value="${esc(b)}" ${v.budget === b ? 'selected' : ''}>${b || 'Prefer not to say'}</option>`).join('')) +
          `<div class="field field--full"><label class="field__label" for="cf-notes">Anything else?</label><textarea class="textarea" id="cf-notes" name="notes" placeholder="Must-see places, activities, a birthday or honeymoon, dietary needs…">${esc(v.notes || '')}</textarea></div>`;
      }
    }
    return '';
  }

  const SUBMIT_LABEL = { custom: 'Add custom trip to cart' };
  function openForm(kind, o = {}) {
    if (!C.kinds[kind]) return;
    const item = o.uid ? DS.cart.get(o.uid) : null;
    const v = item ? { ...item.d } : { ...(o.values || {}) };
    const k = C.kinds[kind];
    const form = html(`<form class="cart-form cart-form--${kind}" novalidate>
      <div class="form-grid">${formFields(kind, v, item)}</div>
      <div class="cart-form__foot"><p class="small muted">${DS.icon('info')}<span>${kind === 'visa' ? 'Sample service fee where shown. ' : ''}${kind === 'custom' ? 'A consultant designs the trip and sends one quotation. ' : ''}${item ? 'Changes update your cart straight away.' : 'Prices you do not see here are quoted by your consultant.'}</span></p>
        <div class="cluster"><button type="button" class="btn btn--ghost" data-modal-close>Cancel</button><button type="submit" class="btn btn--primary">${item ? 'Save changes' : `${DS.icon('bagPlus')} ${SUBMIT_LABEL[kind] || 'Add to Travel Cart'}`}</button></div></div>
    </form>`);
    form.addEventListener('change', e => {
      // Transport keeps a trip type: changing it rebuilds the destination list
      if (e.target.name === 'type') $$('[data-dest-select]', form).forEach(s => { s.innerHTML = DS.destOptions(e.target.value, '', { anyLabel: 'Choose later' }); });
      if (e.target.name === 'trip') DS.whenSetOneWay($('[data-when]', form), e.target.value === 'oneway');
    });
    form.addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(form);
      const data = Object.fromEntries([...fd.entries()].filter(([key]) => !key.startsWith('_') && key !== 'cf-dep'));
      const whenRoot = $('[data-when]', form);
      if (kind === 'flight' && !data.to) { DS.comboError($('#cf-to', form).closest('[data-combo]'), 'Enter where you are flying to.'); return; }
      if (kind === 'hotel' && !data.city) { DS.comboError($('#cf-city', form).closest('[data-combo]'), 'Enter a city or area.'); return; }
      if (kind === 'package') { const dl = $('[data-dep-list]', form); if (!DS.validateDeparture(dl)) return; Object.assign(data, DS.readDeparture(dl)); }
      if (whenRoot && !DS.whenValidate(whenRoot, kind === 'flight' ? { requireDepart: true, requireRet: true } : kind === 'hotel' ? { retLabel: 'Check-out', departLabel: 'check-in' } : {})) return;
      if (kind === 'custom') data.incl = fd.getAll('incl');
      delete data.type;
      data.adults = +data.adults || 1; data.children = +data.children || 0;
      if (data.rooms) data.rooms = +data.rooms;
      if (kind === 'hotel') { delete data.dest; delete data.checkin; delete data.nights; }
      DS.modal.close();
      if (item) { DS.cart.update(item.uid, kind === 'hotel' ? { ...data, dest: '', checkin: '', nights: '' } : data); DS.toast('Cart updated.'); }
      else setTimeout(() => DS.cart.addAndShow(kind, data), 280);
    });
    const title = item ? `Edit ${k.label.toLowerCase()}` : kind === 'custom' ? 'Build a custom trip' : `Add ${k.label.toLowerCase()}`;
    DS.modal.open(form, { title, subtitle: kind === 'custom' ? 'Tell us where, when and what to include. A consultant designs the itinerary and quotes it.' : (k.blurb || ''), large: kind !== 'package' && kind !== 'visa' });
  }

  /* ---------- Hotels in several cities ----------
     One row per city, so a multi-city stay is easy to read and edit. Each row becomes
     its own hotel item in the cart. The next row starts on the previous check-out. */
  let rowSeq = 0;
  function hotelRow(r = {}, i = 0) {
    const n = ++rowSeq;
    return `<li class="hotel-row" data-hotel-row>
      <span class="hotel-row__n" aria-hidden="true">${i + 1}</span>
      ${DS.placeField({ id: `hr-city-${n}`, name: `city-${n}`, label: 'City or area', source: 'places', value: r.city || '', placeholder: 'City or area', required: true })}
      <div class="field"><label class="field__label" for="hr-in-${n}">Check-in</label><input class="input" type="date" id="hr-in-${n}" data-row-in min="${DS.todayISO()}" value="${esc(r.depart || '')}"><span class="field__error" aria-live="polite"></span></div>
      <div class="field"><label class="field__label" for="hr-out-${n}">Check-out</label><input class="input" type="date" id="hr-out-${n}" data-row-out min="${esc(r.depart || DS.todayISO())}" value="${esc(r.ret || '')}"><span class="field__error" aria-live="polite"></span></div>
      <div class="field"><label class="field__label" for="hr-stars-${n}">Hotel class</label><select class="select" id="hr-stars-${n}" data-row-stars>${opts(C.hotelClass, r.stars || 'Any')}</select></div>
      <button type="button" class="icon-btn hotel-row__rm" data-row-remove aria-label="Remove this city">${DS.icon('trash')}</button>
    </li>`;
  }
  function openHotels(o = {}) {
    const rows = (o.rows && o.rows.length ? o.rows : [{}, {}]);
    const form = html(`<form class="cart-form hotels-form" novalidate>
      <ol class="hotel-rows" data-hotel-rows>${rows.map(hotelRow).join('')}</ol>
      <button type="button" class="btn btn--ghost btn--sm hotels-form__add" data-row-add>${DS.icon('plus')} Add another city</button>
      <div class="form-grid hotels-form__guests">${DS.paxPicker({ label: 'Guests and rooms (each city)', adults: o.adults || 2, children: o.children || 0, noun: 'guest', rooms: o.rooms || 1 })}</div>
      <div class="cart-form__foot"><p class="small muted">${DS.icon('info')}<span>Each city is added as its own hotel request. Your consultant sends options for every stay.</span></p>
        <div class="cluster"><button type="button" class="btn btn--ghost" data-modal-close>Cancel</button><button type="submit" class="btn btn--primary">${DS.icon('bagPlus')} <span data-row-count>Add ${rows.length} hotels to cart</span></button></div></div>
    </form>`);
    const list = $('[data-hotel-rows]', form);
    const renumber = () => { const rs = $$('[data-hotel-row]', list); rs.forEach((r, i) => { $('.hotel-row__n', r).textContent = i + 1; $('[data-row-remove]', r).disabled = rs.length === 1; }); $('[data-row-count]', form).textContent = `Add ${rs.length} hotel${rs.length === 1 ? '' : 's'} to cart`; };
    form.addEventListener('click', e => {
      if (e.target.closest('[data-row-add]')) {
        const last = $$('[data-hotel-row]', list).pop(), prevOut = last ? $('[data-row-out]', last).value : '';
        list.insertAdjacentHTML('beforeend', hotelRow({ depart: prevOut }, list.children.length));
        renumber(); const row = list.lastElementChild; if (DS.motion && DS.motion.tabIn) DS.motion.tabIn(row); $('.combo__input', row).focus();
      }
      const rm = e.target.closest('[data-row-remove]'); if (rm && !rm.disabled) { rm.closest('[data-hotel-row]').remove(); renumber(); }
    });
    form.addEventListener('change', e => {
      if (!e.target.matches('[data-row-in]')) return;
      const row = e.target.closest('[data-hotel-row]'), out = $('[data-row-out]', row);
      out.min = e.target.value || out.min; if (out.value && out.value <= e.target.value) out.value = '';
    });
    form.addEventListener('submit', e => {
      e.preventDefault();
      $$('.is-invalid', form).forEach(f => f.classList.remove('is-invalid'));
      const fail = (el, msg) => { const f = el.closest('.field'); f.classList.add('is-invalid'); $('.field__error', f).textContent = msg; (el.matches('input:not([type=hidden])') ? el : $('.combo__input', f) || el).focus(); if (DS.motion && DS.motion.shake) DS.motion.shake(f); return false; };
      const items = [];
      for (const row of $$('[data-hotel-row]', list)) {
        const city = $('[data-combo] input[type="hidden"]', row).value.trim(), inD = $('[data-row-in]', row).value, outD = $('[data-row-out]', row).value;
        if (!city) return fail($('[data-combo] .combo__input', row), 'Enter a city or area.');
        if (outD && inD && outD <= inD) return fail($('[data-row-out]', row), 'Check-out must be after check-in.');
        items.push({ city, depart: inD, ret: outD, stars: $('[data-row-stars]', row).value });
      }
      const adults = +$('input[name="adults"]', form).value || 1, children = +$('input[name="children"]', form).value || 0, rooms = +$('input[name="rooms"]', form).value || 1;
      DS.modal.close();
      setTimeout(() => { items.forEach(it => DS.cart.add('hotel', { ...it, when: it.depart ? 'dates' : '', adults, children, rooms })); DS.cart.open({ highlightLast: true }); DS.toast(`${items.length} hotel request${items.length === 1 ? '' : 's'} added to your Travel Cart.`); }, 280);
    });
    DS.modal.open(form, { title: 'Hotels in more than one city', subtitle: 'Add a row for each city. Dates follow on from the previous stay.', large: true });
    renumber();
  }

  document.addEventListener('DOMContentLoaded', refresh);
})(window.DS);
