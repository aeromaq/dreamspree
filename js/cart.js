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
  const NOUN = { package: 'traveller', visa: 'applicant', flight: 'passenger', hotel: 'guest', transport: 'passenger', cruise: 'guest', insurance: 'traveller' };

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

  /* ---------- Describe an item for display ---------- */
  const destName = id => id === 'other' ? 'somewhere else' : ((DS.getDestination(id) || {}).name || '');
  const pax = d => ({ a: Math.max(1, +d.adults || 1), c: Math.max(0, +d.children || 0) });
  function describe(it) {
    const d = it.d || {}, { a, c } = pax(d), kind = C.kinds[it.kind];
    const out = { kind: it.kind, kindLabel: kind.label, icon: kind.icon, image: '', href: '', lines: [], price: null, note: 'Price on request', paxText: DS.paxLabel(a, c, NOUN[it.kind]) };
    const when = (date, month, fallback) => date ? fmtDate(date) : month ? DS.fmtMonth(month) : fallback;
    switch (it.kind) {
      case 'package': {
        const p = DS.getPackage(it.ref);
        out.title = p.title; out.image = p.images[0]; out.href = `package.html?id=${p.id}`; out.dest = p.destinationId;
        out.lines = [[ 'clock', `${p.duration.days} days, ${p.duration.nights} nights` ], [ 'calendar', d.date ? `Departs ${fmtDate(d.date)}` : d.month ? `Around ${DS.fmtMonth(d.month)}` : 'Departure date to confirm' ], [ 'users', out.paxText ]];
        if (DS.hasPrice(p)) { out.price = a * p.priceFrom + c * p.priceFrom * p.childRate; out.note = `${a} × ${fmtPHP(p.priceFrom)}${c ? ` + ${c} × ${fmtPHP(p.priceFrom * p.childRate)}` : ''} · sample`; }
        out.start = d.date || (d.month ? d.month + '-01' : '');
        break;
      }
      case 'visa': {
        const v = C.visa.find(x => x.id === d.country) || C.visa[0];
        out.title = `${v.name} visa assistance`; out.dest = v.destinationId || '';
        out.lines = [[ 'calendar', d.month ? `Travelling ${DS.fmtMonth(d.month)}` : 'Travel month to confirm' ], [ 'users', out.paxText ], [ 'check', 'Checklist, appointment booking and document review' ]];
        if (v.fee) { out.price = v.fee * (a + c); out.note = `${a + c} × ${fmtPHP(v.fee)} service fee · sample`; }
        out.start = d.month ? d.month + '-01' : '';
        break;
      }
      case 'flight': {
        const o = (C.origins.find(x => x.id === d.origin) || C.origins[0]).name.replace(/ \(.*\)/, '');
        out.title = `Flights: ${o} to ${d.to === 'other' ? 'another city' : destName(d.to) || 'destination'}`; out.dest = d.to;
        out.lines = [[ 'calendar', `${when(d.depart, '', 'Departure date to confirm')}${d.ret ? ` – ${fmtDate(d.ret)}` : ' · return to confirm'}` ], [ 'users', out.paxText ], [ 'plane', d.cabin || 'Economy' ]];
        out.start = d.depart || '';
        break;
      }
      case 'hotel': {
        const n = +d.nights || 3, r = +d.rooms || 1;
        out.title = `Hotel in ${destName(d.dest) || 'your destination'}`; out.dest = d.dest;
        out.lines = [[ 'calendar', d.checkin ? `${n} night${n === 1 ? '' : 's'} from ${fmtDate(d.checkin)}` : `${n} night${n === 1 ? '' : 's'} · dates to confirm` ], [ 'bed', `${r} room${r === 1 ? '' : 's'} · ${d.stars && d.stars !== 'Any' ? d.stars : 'any class'}` ], [ 'users', out.paxText ]];
        out.start = d.checkin || '';
        break;
      }
      case 'transport': {
        out.title = `${d.service || 'Airport transfer'}: ${destName(d.dest) || 'your destination'}`; out.dest = d.dest;
        out.lines = [[ 'calendar', when(d.date, '', 'Date to confirm') ], [ 'users', out.paxText ]];
        out.start = d.date || '';
        break;
      }
      case 'cruise': {
        out.title = `Cruise: ${d.region || 'Asia & Japan'}`;
        out.lines = [[ 'calendar', d.month ? `Sailing ${DS.fmtMonth(d.month)}` : 'Sailing month flexible' ], [ 'ship', `${d.cabin || 'Ocean view'} cabin` ], [ 'users', out.paxText ]];
        out.start = d.month ? d.month + '-01' : '';
        break;
      }
      case 'insurance': {
        out.title = `${d.plan || 'Standard cover'}: ${destName(d.dest) || 'your trip'}`; out.dest = d.dest;
        out.lines = [[ 'calendar', d.depart ? `${fmtDate(d.depart)}${d.ret ? ` – ${fmtDate(d.ret)}` : ' · return to confirm'}` : 'Travel dates to confirm' ], [ 'users', out.paxText ]];
        out.start = d.depart || '';
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
      DS.cart.add('package', { date: p.departures[0].date, adults: 2, children: 0 }, ref);
      DS.toast(`${p.title} added to your Travel Cart.`, { action: { label: 'View cart', href: 'cart.html' } });
      return true;
    },
    /* Add anything, then show the mini cart (the e-commerce "added to cart" moment) */
    addAndShow(kind, d, ref = '') { DS.cart.add(kind, d, ref); DS.cart.open({ highlightLast: true }); },
    refresh,
    open: openDrawer,
    close: closeDrawer,
    openForm
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
    return `<div class="cart-quick__row">${['visa', 'flight', 'hotel', 'transport', 'insurance', 'cruise'].map(k => `<button type="button" class="chip" data-cart-new="${k}">${DS.icon(C.kinds[k].icon)}${esc(C.kinds[k].label)}</button>`).join('')}</div>`;
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
  const today = () => new Date().toISOString().slice(0, 10);
  // Pre-fill new items from what is already in the cart (first package's destination and dates)
  function contextDefaults(kind) {
    const pkg = DS.cart.list().find(i => i.kind === 'package');
    if (!pkg) return { adults: 2, children: 0 };
    const p = DS.getPackage(pkg.ref), d = pkg.d || {};
    const visa = C.visa.find(v => v.destinationId === p.destinationId);
    const base = { adults: d.adults || 2, children: d.children || 0, dest: p.destinationId };
    const ret = d.date ? new Date(new Date(d.date + 'T00:00:00').getTime() + p.duration.nights * 864e5).toISOString().slice(0, 10) : '';
    return ({
      visa: { ...base, country: visa ? visa.id : 'other', month: d.date ? d.date.slice(0, 7) : '' },
      flight: { ...base, to: p.destinationId, depart: d.date || '', ret },
      hotel: { ...base, checkin: d.date || '', nights: p.duration.nights },
      transport: { ...base, date: d.date || '' },
      insurance: { ...base, depart: d.date || '', ret },
      cruise: { adults: base.adults, children: base.children }
    })[kind] || base;
  }
  const typeOf = dest => (DS.getDestination(dest) || {}).type || 'international';
  const fSel = (id, label, name, options, icon) => `<div class="field"><label class="field__label" for="${id}">${label}</label><div class="field__control">${icon ? DS.icon(icon) : ''}<select class="select" id="${id}" name="${name}">${options}</select></div></div>`;
  const fDate = (id, label, name, value, help) => `<div class="field"><label class="field__label" for="${id}">${label}</label><div class="field__control">${DS.icon('calendar')}<input class="input" id="${id}" name="${name}" type="date" min="${today()}" value="${esc(value || '')}"></div>${help ? `<span class="field__help">${help}</span>` : ''}<span class="field__error" aria-live="polite"></span></div>`;
  const opts = (list, sel) => list.map(o => `<option ${o === sel ? 'selected' : ''}>${esc(o)}</option>`).join('');
  const range = (n, sel, unit) => Array.from({ length: n }, (_, i) => `<option value="${i + 1}" ${+sel === i + 1 ? 'selected' : ''}>${i + 1} ${unit}${i ? 's' : ''}</option>`).join('');
  const typeRadios = t => `<div class="field field--full trip-type" role="radiogroup" aria-labelledby="cf-type-l"><span class="field__label" id="cf-type-l">Trip type</span><div class="seg seg--type">
      <label class="seg__opt"><input type="radio" name="type" value="international" ${t === 'international' ? 'checked' : ''}><span>${DS.icon('globe')}International</span></label>
      <label class="seg__opt"><input type="radio" name="type" value="domestic" ${t === 'domestic' ? 'checked' : ''}><span>${DS.icon('sun')}Domestic</span></label></div></div>`;

  function formFields(kind, v, item) {
    const P = (label, max) => DS.paxPicker({ label, adults: +v.adults || (kind === 'visa' ? 1 : 2), children: +v.children || 0, noun: NOUN[kind], max });
    switch (kind) {
      case 'package': {
        const p = DS.getPackage(item.ref);
        const custom = v.date && !p.departures.some(x => x.date === v.date);
        return fSel('cf-dep', 'Departure', 'date', p.departures.map(x => `<option value="${x.date}" ${v.date === x.date ? 'selected' : ''}>${fmtDate(x.date)} · ${esc(x.note)}</option>`).join('') + `<option value="custom" ${custom ? 'selected' : ''}>Another date (request)</option>`, 'calendar') +
          `<div class="field" data-custom ${custom ? '' : 'hidden'}><label class="field__label" for="cf-custom">Preferred date</label><input class="input" id="cf-custom" name="custom" type="date" min="${today()}" value="${custom ? esc(v.date) : ''}"><span class="field__help">Custom dates are quoted by a consultant.</span></div>` + P('Travellers');
      }
      case 'visa':
        return fSel('cf-country', 'Visa for', 'country', C.visa.map(x => `<option value="${x.id}" ${v.country === x.id ? 'selected' : ''}>${esc(x.name)}${x.fee ? ` · ${fmtPHP(x.fee)} each` : ' · on request'}</option>`).join(''), 'passport') +
          fSel('cf-month', 'Travel month', 'month', DS.monthOptions(v.month || '', 'Not decided yet'), 'calendar') + P('Applicants');
      case 'flight': {
        const t = typeOf(v.to);
        return typeRadios(t) + fSel('cf-origin', 'From', 'origin', C.origins.map(o => `<option value="${o.id}" ${v.origin === o.id ? 'selected' : ''}>${esc(o.name)}</option>`).join(''), 'plane') +
          `<div class="field"><label class="field__label" for="cf-to">To</label><div class="field__control">${DS.icon('pin')}<select class="select" id="cf-to" name="to" data-dest-select data-other="1" required>${DS.destOptions(t, v.to || '', { other: true, anyLabel: 'Choose a destination' }).replace('<option value="">', '<option value="" disabled ' + (v.to ? '' : 'selected') + '>')}</select></div><span class="field__error" aria-live="polite"></span></div>` +
          fDate('cf-depart', 'Departure', 'depart', v.depart) + fDate('cf-ret', 'Return', 'ret', v.ret, 'Leave blank for one way or if unsure.') +
          P('Passengers') + fSel('cf-cabin', 'Cabin', 'cabin', opts(C.cabins, v.cabin || 'Economy'));
      }
      case 'hotel': {
        const t = typeOf(v.dest);
        return typeRadios(t) + `<div class="field"><label class="field__label" for="cf-dest">Destination</label><div class="field__control">${DS.icon('pin')}<select class="select" id="cf-dest" name="dest" data-dest-select>${DS.destOptions(t, v.dest || '', { anyLabel: 'Choose later' })}</select></div></div>` +
          fDate('cf-in', 'Check-in', 'checkin', v.checkin) + fSel('cf-nights', 'Nights', 'nights', range(14, v.nights || 3, 'night')) +
          fSel('cf-rooms', 'Rooms', 'rooms', range(6, v.rooms || 1, 'room')) + fSel('cf-stars', 'Hotel class', 'stars', opts(C.hotelClass, v.stars || 'Any')) + P('Guests');
      }
      case 'transport': {
        const t = typeOf(v.dest);
        return typeRadios(t) + `<div class="field"><label class="field__label" for="cf-dest">Destination</label><div class="field__control">${DS.icon('pin')}<select class="select" id="cf-dest" name="dest" data-dest-select>${DS.destOptions(t, v.dest || '', { anyLabel: 'Choose later' })}</select></div></div>` +
          fSel('cf-service', 'Service', 'service', opts(C.transport, v.service || 'Airport transfer'), 'car') + fDate('cf-date', 'Date', 'date', v.date) + P('Passengers');
      }
      case 'cruise':
        return fSel('cf-region', 'Cruise region', 'region', opts(C.cruiseRegions, v.region || 'Asia & Japan'), 'ship') + fSel('cf-month', 'Sailing month', 'month', DS.monthOptions(v.month || '', 'Flexible'), 'calendar') +
          fSel('cf-cabin', 'Cabin', 'cabin', opts(C.cruiseCabins, v.cabin || 'Ocean view')) + P('Guests');
      case 'insurance': {
        const t = typeOf(v.dest);
        return typeRadios(t) + `<div class="field"><label class="field__label" for="cf-dest">Destination</label><div class="field__control">${DS.icon('pin')}<select class="select" id="cf-dest" name="dest" data-dest-select>${DS.destOptions(t, v.dest || '', { anyLabel: 'Choose later' })}</select></div></div>` +
          fSel('cf-plan', 'Plan', 'plan', opts(C.insurancePlans, v.plan || 'Standard cover'), 'shield') + fDate('cf-depart', 'Departure', 'depart', v.depart) + fDate('cf-ret', 'Return', 'ret', v.ret) + P('Travellers');
      }
    }
    return '';
  }

  function openForm(kind, o = {}) {
    if (!C.kinds[kind]) return;
    const item = o.uid ? DS.cart.get(o.uid) : null;
    const v = item ? { ...item.d } : { ...(o.values || {}) };
    const k = C.kinds[kind];
    const form = html(`<form class="cart-form" novalidate>
      <div class="form-grid">${formFields(kind, v, item)}</div>
      <div class="cart-form__foot"><p class="small muted">${DS.icon('info')}<span>${kind === 'visa' ? 'Sample service fee where shown. ' : ''}${item ? 'Changes update your cart straight away.' : 'Prices you do not see here are quoted by your consultant.'}</span></p>
        <div class="cluster"><button type="button" class="btn btn--ghost" data-modal-close>Cancel</button><button type="submit" class="btn btn--primary">${item ? 'Save changes' : `${DS.icon('bagPlus')} Add to Travel Cart`}</button></div></div>
    </form>`);
    // Trip type first: changing it rebuilds the destination list
    form.addEventListener('change', e => {
      if (e.target.name === 'type') $$('[data-dest-select]', form).forEach(s => { const flights = !!s.dataset.other; s.innerHTML = DS.destOptions(e.target.value, '', flights ? { other: true, anyLabel: 'Choose a destination' } : { anyLabel: 'Choose later' }); if (flights) s.options[0].disabled = true, s.selectedIndex = 0; });
      if (e.target.id === 'cf-dep') { const box = $('[data-custom]', form); box.hidden = e.target.value !== 'custom'; if (!box.hidden) $('#cf-custom', form).focus(); }
    });
    form.addEventListener('submit', e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      // Field checks: flights need a destination, return dates cannot come before departure
      let bad = null;
      const fail = (sel, msg) => { const f = $(sel, form).closest('.field'); f.classList.add('is-invalid'); $('.field__error', f).textContent = msg; bad = bad || $(sel, form); };
      $$('.field.is-invalid', form).forEach(f => f.classList.remove('is-invalid'));
      if (kind === 'flight' && !data.to) fail('#cf-to', 'Choose where you are flying to.');
      if (data.ret && (data.depart || data.checkin) && data.ret < (data.depart || data.checkin)) fail('#cf-ret', 'Return date must be after departure.');
      if (bad) { bad.focus(); if (DS.motion && DS.motion.shake) DS.motion.shake(bad.closest('.field')); return; }
      delete data.type;
      data.adults = +data.adults || 1; data.children = +data.children || 0;
      if (kind === 'package') { if (data.date === 'custom') data.date = data.custom || ''; delete data.custom; }
      ['nights', 'rooms'].forEach(n => { if (data[n]) data[n] = +data[n]; });
      DS.modal.close();
      if (item) { DS.cart.update(item.uid, data); DS.toast('Cart updated.'); }
      else setTimeout(() => DS.cart.addAndShow(kind, data), 280);
    });
    DS.modal.open(form, { title: item ? `Edit ${k.label.toLowerCase()}` : `Add ${k.label.toLowerCase()}`, subtitle: k.blurb || '', large: kind !== 'package' && kind !== 'visa' });
  }

  document.addEventListener('DOMContentLoaded', refresh);
})(window.DS);
