/* ==========================================================================
   Dreamspree — Package catalogue (explore.html) and package detail (package.html)
   ========================================================================== */
(function (DS) {
  'use strict';
  const { $, $$, esc, fmtPHP, fmtDate, html } = DS;

  /* ======================================================================
     EXPLORE: filters, sort, results
     ====================================================================== */
  function initExplore() {
    const root = $('[data-explore]'); if (!root) return;
    const q = DS.params();
    const MAX = Math.max(...DS.packages.filter(DS.hasPrice).map(p => p.priceFrom));
    const regions = [...new Set(DS.destinations.map(d => d.region))];
    const categories = [...new Set(DS.packages.map(p => p.category))];
    const state = {
      q: q.get('q') || '', dest: q.get('dest') || '', type: q.get('type') ? [q.get('type')] : [], region: [], budget: MAX, duration: 'any', category: [], sort: q.get('sort') || 'recommended',
      pax: q.get('pax') || '', date: q.get('date') || '', month: q.get('month') || '', adults: q.get('adults') || '', children: q.get('children') || ''
    };
    // Search sends adults/children; older links send pax
    if (!state.pax && state.adults) state.pax = String(+state.adults + (+state.children || 0));

    /* ----- Destination rail ----- */
    const rail = $('[data-dest-rail]');
    rail.innerHTML = `<button type="button" class="dest-pill" data-dest="" aria-pressed="${!state.dest}"><span style="width:36px;height:36px;border-radius:50%;background:var(--color-brand-dark);color:var(--color-text-on-dark);display:grid;place-items:center">${DS.icon('globe')}</span>All destinations</button>` +
      DS.destinations.map(d => `<button type="button" class="dest-pill" data-dest="${d.id}" aria-pressed="${state.dest === d.id}"><img src="${DS.img(d.image, 80, 80)}" alt="" width="36" height="36" loading="lazy">${esc(d.name)}</button>`).join('');
    rail.addEventListener('click', e => { const b = e.target.closest('[data-dest]'); if (!b) return; state.dest = b.dataset.dest === state.dest ? '' : b.dataset.dest; syncRail(); apply(); });
    const syncRail = () => $$('[data-dest]', rail).forEach(b => b.setAttribute('aria-pressed', b.dataset.dest === state.dest));

    /* ----- Filters panel ----- */
    const filters = $('[data-filters]');
    filters.innerHTML = `
      <div class="filters__head"><h2>Filters</h2><button type="button" class="btn btn--link btn--sm" data-clear>Clear all</button></div>
      <div class="filter-group"><label class="field__label" for="f-q">Search</label><div class="field__control">${DS.icon('search')}<input class="input" id="f-q" type="search" placeholder="Destination or package" value="${esc(state.q)}"></div></div>
      <div class="filter-group"><span class="field__label">Trip type</span>
        <label class="checkbox"><input type="checkbox" name="type" value="domestic" ${state.type.includes('domestic') ? 'checked' : ''}><span>Domestic (Philippines)</span></label>
        <label class="checkbox"><input type="checkbox" name="type" value="international" ${state.type.includes('international') ? 'checked' : ''}><span>International</span></label></div>
      <div class="filter-group"><span class="field__label">Region</span>${regions.map(r => `<label class="checkbox"><input type="checkbox" name="region" value="${esc(r)}"><span>${esc(r)}</span></label>`).join('')}</div>
      <div class="filter-group"><label class="field__label" for="f-budget">Budget per person (up to)</label><input class="range" id="f-budget" type="range" min="10000" max="${MAX}" step="1000" value="${MAX}" aria-valuetext="${fmtPHP(MAX)}"><div class="range-out"><span>₱10,000</span><span data-budget-out>${fmtPHP(MAX)}</span></div></div>
      <div class="filter-group"><label class="field__label" for="f-dur">Trip duration</label><select class="select" id="f-dur"><option value="any">Any length</option><option value="short">Up to 3 days</option><option value="mid">4 to 5 days</option><option value="long">6 days or more</option></select></div>
      <div class="filter-group"><span class="field__label">Travel type</span><div class="cluster" style="gap:6px">${categories.map(c => `<button type="button" class="chip" data-cat="${esc(c)}" aria-pressed="false">${esc(c)}</button>`).join('')}</div></div>
      <p class="small muted" style="margin:0">All packages are sample data for this prototype. Prices are illustrative, per person, in PHP. Packages priced on request are hidden while a budget limit is set.</p>`;
    $('#f-q', filters).addEventListener('input', debounce(e => { state.q = e.target.value.trim(); apply(); }, 180));
    filters.addEventListener('change', e => {
      const t = e.target; if (t.id === 'f-q') return; // search input is handled on input (debounced)
      if (t.name === 'type') state.type = $$('input[name="type"]:checked', filters).map(i => i.value);
      if (t.name === 'region') state.region = $$('input[name="region"]:checked', filters).map(i => i.value);
      if (t.id === 'f-dur') state.duration = t.value;
      apply();
    });
    $('#f-budget', filters).addEventListener('input', e => { state.budget = +e.target.value; $('[data-budget-out]', filters).textContent = fmtPHP(state.budget); e.target.setAttribute('aria-valuetext', fmtPHP(state.budget)); apply(); });
    filters.addEventListener('click', e => {
      const c = e.target.closest('[data-cat]'); if (c) { const on = c.getAttribute('aria-pressed') !== 'true'; c.setAttribute('aria-pressed', on); state.category = $$('[data-cat][aria-pressed="true"]', filters).map(x => x.dataset.cat); apply(); }
      if (e.target.closest('[data-clear]')) clearAll();
    });
    $('[data-filters-toggle]').addEventListener('click', e => { const open = filters.classList.toggle('is-open'); e.currentTarget.setAttribute('aria-expanded', open); });
    $('[data-sort]').value = state.sort;
    $('[data-sort]').addEventListener('change', e => { state.sort = e.target.value; apply(); });

    function clearAll() {
      Object.assign(state, { q: '', dest: '', type: [], region: [], budget: MAX, duration: 'any', category: [] });
      $('#f-q', filters).value = ''; $$('input[type="checkbox"]', filters).forEach(i => i.checked = false); $('#f-budget', filters).value = MAX; $('[data-budget-out]', filters).textContent = fmtPHP(MAX); $('#f-dur', filters).value = 'any'; $$('[data-cat]', filters).forEach(c => c.setAttribute('aria-pressed', 'false'));
      syncRail(); apply(); DS.toast('Filters cleared.');
    }

    /* ----- Apply ----- */
    const results = $('[data-results]'), count = $('[data-result-count]'), active = $('[data-active-filters]'), context = $('[data-context]'), intro = $('[data-dest-intro]');
    const VISA_ROUTE = { japan: 'japan', 'south-korea': 'korea' };
    function renderIntro() {
      const d = state.dest && DS.getDestination(state.dest);
      if (!intro) return;
      if (!d) { intro.hidden = true; intro.innerHTML = ''; return; }
      const visaLine = d.visa === 'required' ? 'Visa required for Philippine passport holders. Dreamspree prepares the checklist and books the appointment.' : d.visa === 'visa-free' ? 'Visa-free for short visits on a Philippine passport. Your consultant confirms the latest entry rules.' : d.visa === 'check' ? 'Entry rules change. Your consultant confirms what applies to your dates.' : 'Domestic trip, no visa needed.';
      const cta = VISA_ROUTE[d.id] ? `<a class="btn btn--sm btn--primary" href="visa.html?dest=${VISA_ROUTE[d.id]}">${DS.icon('passport')} Check visa readiness</a>` : `<button type="button" class="btn btn--sm btn--ghost" data-enquiry data-destination="${esc(d.name)}" data-title="Plan a ${esc(d.name)} trip">${DS.icon('headset')} Ask a consultant</button>`;
      intro.hidden = false;
      intro.innerHTML = `<div class="dest-intro__media">${DS.picture(d.image, '', { w: 480, h: 360, label: d.name })}</div><div class="dest-intro__body"><p class="eyebrow" style="margin:0">${esc(d.region)} · Best ${esc(d.bestTime)}</p><h2>${esc(d.name)}</h2><p>${esc(d.blurb)}</p>${/visa/i.test(d.blurb) ? '' : `<p class="small"><strong>${esc(visaLine)}</strong></p>`}<div class="cluster" style="gap:8px;margin-top:4px">${cta}<button type="button" class="btn btn--sm btn--link" data-clear-dest>Show all destinations</button></div></div>`;
      DS.hydrateImages(intro);
      $('[data-clear-dest]', intro).addEventListener('click', () => { state.dest = ''; syncRail(); apply(); });
    }
    const when = state.month ? DS.fmtMonth(state.month) : state.date ? fmtDate(state.date) : '';
    const who = state.adults ? DS.paxLabel(+state.adults || 1, +state.children || 0) : state.pax ? `${state.pax} traveller${state.pax === '1' ? '' : 's'}` : '';
    if (who || when) { context.hidden = false; context.innerHTML = `${DS.icon('info')}<span>Showing packages${who ? ` for <strong>${esc(who)}</strong>` : ''}${when ? ` travelling around <strong>${esc(when)}</strong>` : ''}. Open a package to see dates and add it to your Travel Cart with your group.</span>`; }
    let first = true;
    function apply() {
      let list = DS.packages.filter(p => {
        if (state.dest && p.destinationId !== state.dest) return false;
        if (state.type.length && !state.type.includes(p.type)) return false;
        if (state.region.length && !state.region.includes(p.region)) return false;
        if (state.budget < MAX && (!DS.hasPrice(p) || p.priceFrom > state.budget)) return false;
        if (state.duration === 'short' && p.duration.days > 3) return false;
        if (state.duration === 'mid' && (p.duration.days < 4 || p.duration.days > 5)) return false;
        if (state.duration === 'long' && p.duration.days < 6) return false;
        if (state.category.length && !state.category.includes(p.category)) return false;
        if (state.q) { const s = state.q.toLowerCase(); if (![p.title, p.destination, p.country, p.summary, p.category, ...p.highlights].join(' ').toLowerCase().includes(s)) return false; }
        return true;
      });
      const pv = (p, hi) => DS.hasPrice(p) ? p.priceFrom : (hi ? -1 : Infinity); // priced on request sorts last
      const sorters = { 'price-asc': (a, b) => pv(a) - pv(b), 'price-desc': (a, b) => pv(b, 1) - pv(a, 1), 'dur-asc': (a, b) => a.duration.days - b.duration.days, 'dur-desc': (a, b) => b.duration.days - a.duration.days, recommended: (a, b) => (DS.featuredIds.indexOf(a.id) + 1 || 99) - (DS.featuredIds.indexOf(b.id) + 1 || 99) };
      list.sort(sorters[state.sort] || sorters.recommended);
      renderIntro();
      count.innerHTML = `<span>${list.length}</span> package${list.length === 1 ? '' : 's'}${list.length !== DS.packages.length ? ` of ${DS.packages.length}` : ''}`;
      renderActive();
      const draw = () => {
        if (!list.length) {
          results.innerHTML = `<div class="empty" style="grid-column:1/-1"><div class="empty__icon">${DS.icon('search')}</div><h3>No packages match those filters</h3><p>Try widening your budget or duration, or ask a consultant to design a custom itinerary for you.</p><div class="cluster"><button type="button" class="btn btn--primary" data-clear-empty>Clear all filters</button><button type="button" class="btn btn--ghost" data-enquiry data-title="Request a custom itinerary" data-service="tours" data-message="None of the sample packages matched my filters. I am looking for: ">Request a custom trip</button></div></div>`;
          $('[data-clear-empty]', results).addEventListener('click', clearAll);
        } else {
          results.innerHTML = list.map(p => DS.renderPackageCard(p)).join('');
          if (state.pax || state.date || state.month) $$('a[href^="package.html"]', results).forEach(a => { const u = new URL(a.getAttribute('href'), location.href); if (state.adults) { u.searchParams.set('adults', state.adults); if (+state.children) u.searchParams.set('children', state.children); } else if (state.pax) u.searchParams.set('pax', state.pax); if (state.month) u.searchParams.set('month', state.month); else if (state.date) u.searchParams.set('date', state.date); a.setAttribute('href', u.pathname.split('/').pop() + u.search); });
        }
        DS.hydrateImages(results); if (DS.cart) DS.cart.refresh();
        if (DS.motion && DS.motion.revealNew) DS.motion.revealNew(results);
      };
      if (first) { first = false; results.innerHTML = DS.skeletons(4); setTimeout(draw, 380); } else draw();
      // Keep the URL shareable
      const u = new URLSearchParams(); if (state.dest) u.set('dest', state.dest); if (state.type.length === 1) u.set('type', state.type[0]); if (state.q) u.set('q', state.q); if (state.sort !== 'recommended') u.set('sort', state.sort); if (state.adults) { u.set('adults', state.adults); if (+state.children) u.set('children', state.children); } else if (state.pax) u.set('pax', state.pax); if (state.month) u.set('month', state.month); else if (state.date) u.set('date', state.date);
      history.replaceState(null, '', location.pathname + (u.toString() ? '?' + u : '') + location.hash);
    }
    function renderActive() {
      const chips = [];
      const chip = (label, fn) => chips.push({ label, fn });
      if (state.dest) chip(DS.getDestination(state.dest)?.name || state.dest, () => { state.dest = ''; syncRail(); });
      state.type.forEach(t => chip(t === 'domestic' ? 'Domestic' : 'International', () => { state.type = state.type.filter(x => x !== t); $(`input[name="type"][value="${t}"]`, filters).checked = false; }));
      state.region.forEach(r => chip(r, () => { state.region = state.region.filter(x => x !== r); $(`input[name="region"][value="${r}"]`, filters).checked = false; }));
      if (state.budget < MAX) chip('Up to ' + fmtPHP(state.budget), () => { state.budget = MAX; $('#f-budget', filters).value = MAX; $('[data-budget-out]', filters).textContent = fmtPHP(MAX); });
      if (state.duration !== 'any') chip({ short: 'Up to 3 days', mid: '4 to 5 days', long: '6+ days' }[state.duration], () => { state.duration = 'any'; $('#f-dur', filters).value = 'any'; });
      state.category.forEach(c => chip(c, () => { state.category = state.category.filter(x => x !== c); $(`[data-cat="${c}"]`, filters).setAttribute('aria-pressed', 'false'); }));
      if (state.q) chip(`“${state.q}”`, () => { state.q = ''; $('#f-q', filters).value = ''; });
      active.innerHTML = chips.map((c, i) => `<button type="button" class="chip is-active" data-i="${i}" aria-label="Remove filter ${esc(c.label)}">${esc(c.label)} ${DS.icon('x')}</button>`).join('');
      $$('[data-i]', active).forEach(b => b.addEventListener('click', () => { chips[+b.dataset.i].fn(); apply(); }));
    }
    apply();
    if (location.hash === '#packages') setTimeout(() => $('#packages').scrollIntoView({ behavior: 'smooth' }), 300);
  }
  function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

  /* ======================================================================
     PACKAGE DETAIL
     ====================================================================== */
  function initPackage() {
    const root = $('[data-package]'); if (!root) return;
    const q = DS.params(); const p = DS.getPackage(q.get('id'));
    if (!p) {
      root.innerHTML = `<div class="container" style="padding:8rem 0"><div class="empty"><div class="empty__icon">${DS.icon('map')}</div><h3>We could not find that package</h3><p>It may have been renamed or removed from the sample catalogue. Browse the current list instead.</p><div class="cluster"><a class="btn btn--primary" href="explore.html">Browse packages</a><button type="button" class="btn btn--ghost" data-consult>Talk to a consultant</button></div></div></div>`;
      return;
    }
    document.title = `${p.title} · Dreamspree Travel & Tours`;
    const dest = DS.getDestination(p.destinationId);
    const priced = DS.hasPrice(p);
    const clamp = (v, lo, hi, dflt) => Math.min(hi, Math.max(lo, parseInt(v, 10) || dflt));
    const sel = { adults: clamp(q.get('adults') || q.get('pax'), 1, 12, 2), children: clamp(q.get('children'), 0, 8, 0), date: p.departures[0].date, custom: '' };
    const month = q.get('month');
    if (month) { const m = p.departures.find(x => x.date.startsWith(month)); if (m) sel.date = m.date; else { sel.date = 'custom'; sel.custom = month + '-01'; } }
    else if (q.get('date')) { sel.date = 'custom'; sel.custom = q.get('date'); }
    // Already in the Travel Cart: start from what the traveller chose last time
    const cartItem = DS.cart && DS.cart.findPackage(p.id);
    if (cartItem) { const d = cartItem.d || {}; sel.adults = clamp(d.adults, 1, 12, 2); sel.children = clamp(d.children, 0, 8, 0); if (d.date && p.departures.some(x => x.date === d.date)) sel.date = d.date; else if (d.date) { sel.date = 'custom'; sel.custom = d.date; } }

    /* ----- Header + gallery ----- */
    const visaBadge = p.type === 'domestic' ? `<span class="badge badge--lime">${DS.icon('sun')}No visa needed</span>` : (dest.visa === 'required' ? `<span class="badge badge--info">${DS.icon('passport')}Visa assistance included</span>` : `<span class="badge badge--info">${DS.icon('check')}${dest.visa === 'visa-free' ? 'Visa-free entry' : 'Entry rules checked'}</span>`);
    $('[data-pkg-head]').innerHTML = `
      <ol class="breadcrumbs" aria-label="Breadcrumb"><li><a href="index.html">Home</a></li><li><a href="explore.html">Packages</a></li><li><a href="explore.html?dest=${p.destinationId}">${esc(p.destination)}</a></li><li aria-current="page">${esc(p.title)}</li></ol>
      <div class="pkg-head">
        <div>
          <div class="cluster" style="gap:6px;margin-bottom:.75rem"><span class="badge badge--ocean">${esc(p.category)}</span><span class="badge">${p.type === 'domestic' ? 'Domestic' : 'International'}</span>${visaBadge}<span class="badge badge--demo">Sample package</span></div>
          <h1 class="display">${esc(p.title)}</h1>
          <div class="pkg-head__meta"><span>${DS.icon('pin')}${esc(DS.placeLabel(p))}</span><span>${DS.icon('clock')}${p.duration.days} days, ${p.duration.nights} nights</span><span>${DS.icon('users')}${esc(p.groupSize)}</span><span>${DS.icon('calendar')}Next sample departure ${esc(fmtDate(p.departures[0].date))}</span></div>
          ${priced ? `<div class="pkg-head__price"><span class="price">${fmtPHP(p.priceFrom)}</span><small>per person, from · sample price</small></div>` : `<div class="pkg-head__price"><span class="price price--request">Price on request</span><small>quoted by a consultant for your dates and group</small></div>`}
          <div class="cluster" style="gap:5px;margin-top:.5rem">${DS.keyInclusions(p).map(i => `<span class="badge badge--teal">${DS.icon('check')}${esc(i)}</span>`).join('')}</div>
        </div>
        <div class="pkg-head__actions"><button type="button" class="btn btn--ghost" data-share>${DS.icon('share')} Share</button><button type="button" class="btn btn--ghost" data-pkg-add>${DS.icon('bagPlus')} <span data-pkg-add-label>Add to cart</span></button><a class="btn btn--primary" href="#booking">Choose dates ${DS.icon('arrowRight', 'arrow')}</a></div>
      </div>
      <div class="gallery" aria-label="Photo gallery">${p.images.slice(0, 5).map((im, i) => `<button type="button" class="gallery__item" data-gallery="${i}" aria-label="Open photo ${i + 1} of ${p.images.length}">${DS.picture(im, `${p.destination} photo ${i + 1}`, { w: i === 0 ? 1000 : 600, h: i === 0 ? 760 : 400, label: p.destination, eager: i === 0 })}${i === 4 || (i === p.images.length - 1 && i < 4) ? `<span class="badge badge--glass gallery__more">${DS.icon('image')}${p.images.length} photos</span>` : ''}</button>`).join('')}</div>`;
    $('[data-share]').addEventListener('click', () => DS.share(p.title, location.href));
    $$('[data-gallery]').forEach(b => b.addEventListener('click', () => openLightbox(+b.dataset.gallery)));
    function openLightbox(i) {
      const render = idx => `<div class="lightbox" style="display:grid;gap:1rem"><div class="ratio ratio--3x2" style="border-radius:var(--r-lg);overflow:hidden;background:var(--color-surface-muted)">${DS.picture(p.images[idx], `${p.destination} photo ${idx + 1}`, { w: 1200, h: 800, label: p.destination })}</div><div class="cluster" style="justify-content:space-between"><button type="button" class="btn btn--ghost btn--sm" data-lb="${(idx - 1 + p.images.length) % p.images.length}">${DS.icon('chevronLeft')} Previous</button><span class="small muted">${idx + 1} of ${p.images.length} · Sample photography (Unsplash)</span><button type="button" class="btn btn--ghost btn--sm" data-lb="${(idx + 1) % p.images.length}">Next ${DS.icon('chevronRight')}</button></div></div>`;
      const body = DS.modal.open(render(i), { title: p.destination, subtitle: p.title, large: true });
      body.addEventListener('click', e => { const b = e.target.closest('[data-lb]'); if (!b) return; const dir = b.textContent.includes('Next') ? ':last-child' : ''; body.innerHTML = render(+b.dataset.lb); DS.hydrateImages(body); if (DS.motion && DS.motion.tabIn) DS.motion.tabIn(body.firstElementChild); $(`[data-lb]${dir}`, body).focus(); });
      body.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { e.preventDefault(); $('[data-lb]:last-child', body)?.click(); } if (e.key === 'ArrowLeft') { e.preventDefault(); $('[data-lb]', body)?.click(); } });
    }

    /* ----- Main content ----- */
    const needsVisa = p.type === 'international' && dest.visa === 'required';
    $('[data-pkg-main]').innerHTML = `
      <div class="tabs" role="tablist" aria-label="Package information" data-pkg-tabs>
        ${[['overview', 'Overview'], ['itinerary', 'Itinerary'], ['inclusions', 'Inclusions'], ['prepare', 'Prepare'], ['policy', 'Policy & FAQs']].map(([id, l], i) => `<button type="button" class="tab" role="tab" id="tab-${id}" aria-controls="panel-${id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${l}</button>`).join('')}
      </div>
      <section class="tab-panel prose" id="panel-overview" role="tabpanel" aria-labelledby="tab-overview">
        <h2>Overview</h2><p class="lede" style="color:var(--color-text-secondary)">${esc(p.summary)}</p>
        <h3>Destination highlights</h3>
        <ul class="highlights">${p.highlights.map(h => `<li>${DS.icon('sparkles')}${esc(h)}</li>`).join('')}</ul>
        <h3>About ${esc(p.destination)}</h3><p>${esc(dest.blurb)} Best time to go: ${esc(dest.bestTime)}.</p>
        <h3>Accommodation</h3><div class="info-card"><h3>${DS.icon('bed')}Where you stay</h3><p class="small" style="margin:0">${esc(p.accommodation)}</p></div>
      </section>
      <section class="tab-panel prose" id="panel-itinerary" role="tabpanel" aria-labelledby="tab-itinerary" hidden>
        <div class="section-head" style="margin-bottom:1.25rem;align-items:center"><h2 style="margin:0">Day by day</h2><button type="button" class="btn btn--link btn--sm" data-expand-all>Expand all</button></div>
        <div class="accordion" data-itinerary>${p.itinerary.map((d, i) => `<div class="acc-item ${i === 0 ? 'is-open' : ''}"><h3 style="margin:0;font-size:inherit"><button type="button" class="acc-btn" aria-expanded="${i === 0}" aria-controls="day-${d.day}"><span class="acc-btn__day">Day<br>${d.day}</span><span class="acc-btn__title">${esc(d.title)}<small>${esc((d.items || [])[0] || '')}</small></span>${DS.icon('chevronDown', 'acc-btn__chev')}</button></h3><div class="acc-panel" id="day-${d.day}" style="height:${i === 0 ? 'auto' : '0px'}"><div class="acc-panel__inner"><p>${esc(d.desc)}</p>${d.items ? `<ul>${d.items.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}</div></div></div>`).join('')}</div>
        <p class="small muted" style="margin-top:1rem">Sample itinerary. Sequence may change with flight times, weather and local conditions.</p>
      </section>
      <section class="tab-panel prose" id="panel-inclusions" role="tabpanel" aria-labelledby="tab-inclusions" hidden>
        <h2>What is included</h2>
        <div class="incl-grid"><div class="info-card"><h3>${DS.icon('check')}Inclusions</h3><ul class="ticks">${p.inclusions.map(i => `<li>${esc(i)}</li>`).join('')}</ul></div><div class="info-card"><h3>${DS.icon('x')}Not included</h3><ul class="ticks ticks--x">${p.exclusions.map(i => `<li>${esc(i)}</li>`).join('')}</ul></div></div>
      </section>
      <section class="tab-panel prose" id="panel-prepare" role="tabpanel" aria-labelledby="tab-prepare" hidden>
        <h2>Travel preparation</h2>
        ${needsVisa ? `<div class="notice" style="margin-bottom:1.25rem">${DS.icon('passport')}<div><strong>Visa required for Philippine passport holders.</strong> ${esc(p.visaNote)} <a href="visa.html?dest=${p.destinationId === 'south-korea' ? 'korea' : p.destinationId}">Run the Visa Readiness Checker</a> for an illustrative document list.</div></div>` : `<div class="notice" style="margin-bottom:1.25rem">${DS.icon('info')}<div>${esc(p.visaNote)}</div></div>`}
        <ul class="ticks">${p.preparation.map(i => `<li>${esc(i)}</li>`).join('')}</ul>
        <h3>Packing and on-trip support</h3><p>Your consultant sends a destination-specific packing list and a day-by-day plan with local contacts before departure. During the trip, the same consultant stays reachable on your preferred messaging app.</p>
      </section>
      <section class="tab-panel prose" id="panel-policy" role="tabpanel" aria-labelledby="tab-policy" hidden>
        <h2>Cancellation policy</h2><div class="notice notice--warn" style="margin-bottom:1.5rem">${DS.icon('alert')}<div>${esc(p.cancellation)}</div></div>
        <h3>Frequently asked questions</h3>
        <div class="accordion" data-faq data-single="true">${p.faqs.map((f, i) => `<div class="acc-item acc-item--faq"><h4 style="margin:0;font-size:inherit"><button type="button" class="acc-btn" aria-expanded="false" aria-controls="faq-${i}"><span class="acc-btn__title">${esc(f.q)}</span>${DS.icon('chevronDown', 'acc-btn__chev')}</button></h4><div class="acc-panel" id="faq-${i}" style="height:0px"><div class="acc-panel__inner">${esc(f.a)}</div></div></div>`).join('')}</div>
      </section>`;
    DS.tabs($('[data-pkg-tabs]')); DS.accordion($('[data-itinerary]')); DS.accordion($('[data-faq]'));
    $('[data-expand-all]').addEventListener('click', e => { const items = $$('[data-itinerary] .acc-item'); const allOpen = items.every(i => i.classList.contains('is-open')); items.forEach(i => { const open = i.classList.contains('is-open'); if (allOpen ? open : !open) $('.acc-btn', i).click(); }); e.target.textContent = allOpen ? 'Expand all' : 'Collapse all'; });

    /* ----- Booking panel ----- */
    const panel = $('[data-booking]');
    const depOpts = p.departures.map(d => `<option value="${d.date}" ${sel.date === d.date ? 'selected' : ''}>${fmtDate(d.date)} · ${esc(d.note)}</option>`).join('') + `<option value="custom" ${sel.date === 'custom' ? 'selected' : ''}>Another date (request)</option>`;
    panel.innerHTML = `
      <div>${priced ? `<div class="booking__price"><span class="price">${fmtPHP(p.priceFrom)}</span><small>per person, from</small></div><span class="badge badge--demo">Illustrative sample price</span>` : `<div class="booking__price"><span class="price price--request">Price on request</span></div><span class="badge">Quoted for your dates and group</span>`}</div>
      <div class="field"><label class="field__label" for="bk-date">Departure date</label><div class="field__control">${DS.icon('calendar')}<select class="select" id="bk-date">${depOpts}</select></div></div>
      <div class="field" data-custom-date ${sel.date === 'custom' ? '' : 'hidden'}><label class="field__label" for="bk-custom">Preferred date</label><input class="input" id="bk-custom" type="date" min="${new Date().toISOString().slice(0, 10)}" value="${esc(sel.custom)}"><span class="field__help">Custom dates are quoted by a consultant.</span></div>
      <div>
        <div class="counter-row"><div><strong>Adults</strong><span>12 years and above</span></div><div class="counter"><button type="button" class="counter__btn" data-ctr="adults" data-d="-1" aria-label="Fewer adults">${DS.icon('minus')}</button><span class="counter__val" data-val="adults" aria-live="polite">${sel.adults}</span><button type="button" class="counter__btn" data-ctr="adults" data-d="1" aria-label="More adults">${DS.icon('plus')}</button></div></div>
        <div class="counter-row"><div><strong>Children</strong><span>2 to 11 years${priced ? ` · ${Math.round(p.childRate * 100)}% of adult rate (sample)` : ''}</span></div><div class="counter"><button type="button" class="counter__btn" data-ctr="children" data-d="-1" aria-label="Fewer children">${DS.icon('minus')}</button><span class="counter__val" data-val="children" aria-live="polite">${sel.children}</span><button type="button" class="counter__btn" data-ctr="children" data-d="1" aria-label="More children">${DS.icon('plus')}</button></div></div>
      </div>
      ${priced ? `<div class="booking__total" aria-live="polite"><div><span data-line-adults></span><span data-sub-adults></span></div><div data-row-children hidden><span data-line-children></span><span data-sub-children></span></div><div class="total"><span>Estimated total</span><span data-total data-value="0">₱0</span></div></div>
      <p class="booking__note">${DS.icon('info')}<span>Estimate only. Final pricing depends on dates, airfare and room configuration and is confirmed in writing by your consultant. No payment is taken on this prototype.</span></p>` : `<p class="booking__note booking__note--request">${DS.icon('info')}<span>This package is priced on request. Add it to your Travel Cart with your dates and group, and your consultant sends the price in your quotation.</span></p>`}
      <button type="button" class="btn btn--primary btn--lg btn--block" data-pkg-add>${DS.icon('bagPlus')} <span data-pkg-add-label>Add to Travel Cart</span></button>
      <p class="booking__incart" data-incart hidden>${DS.icon('bagCheck')}<span>In your Travel Cart. <button type="button" class="btn btn--link btn--sm" data-cart-open>View cart</button></span></p>
      <button type="button" class="btn btn--ghost btn--block" data-request-booking>Request a quotation for this package only</button>
      <button type="button" class="btn btn--link booking__consult" data-enquiry data-service="consult" data-destination="${esc(p.destination)}" data-title="Talk to a consultant about this trip" data-message="I am looking at “${esc(p.title)}” and have a few questions.">${DS.icon('headset')} Talk to a consultant</button>
      <ul class="booking__assure"><li>${DS.icon('check')}No payment until a consultant confirms</li><li>${DS.icon('check')}Add visa, flights or a hotel in your cart</li><li>${DS.icon('check')}One quotation for the whole trip</li></ul>`;
    const limits = { adults: [1, 12], children: [0, 8] };
    function calc(animate) {
      $$('[data-ctr]', panel).forEach(b => { const k = b.dataset.ctr, n = sel[k] + +b.dataset.d; b.disabled = n < limits[k][0] || n > limits[k][1]; });
      if (!priced) return 0;
      const a = sel.adults * p.priceFrom, c = sel.children * p.priceFrom * p.childRate, total = a + c;
      $('[data-line-adults]', panel).textContent = `${sel.adults} adult${sel.adults > 1 ? 's' : ''} × ${fmtPHP(p.priceFrom)}`; $('[data-sub-adults]', panel).textContent = fmtPHP(a);
      $('[data-row-children]', panel).hidden = !sel.children; $('[data-line-children]', panel).textContent = `${sel.children} child${sel.children > 1 ? 'ren' : ''} × ${fmtPHP(p.priceFrom * p.childRate)}`; $('[data-sub-children]', panel).textContent = fmtPHP(c);
      const t = $('[data-total]', panel); if (animate && DS.motion && DS.motion.countTo) DS.motion.countTo(t, total, fmtPHP); else { t.textContent = fmtPHP(total); t.dataset.value = total; }
      const mb = $('[data-mobile-total]'); if (mb) mb.textContent = fmtPHP(total);
      return total;
    }
    panel.addEventListener('click', e => { const b = e.target.closest('[data-ctr]'); if (!b || b.disabled) return; sel[b.dataset.ctr] += +b.dataset.d; $(`[data-val="${b.dataset.ctr}"]`, panel).textContent = sel[b.dataset.ctr]; if (DS.motion && DS.motion.pop) DS.motion.pop($(`[data-val="${b.dataset.ctr}"]`, panel)); calc(true); });
    $('#bk-date', panel).addEventListener('change', e => { sel.date = e.target.value; $('[data-custom-date]', panel).hidden = sel.date !== 'custom'; if (sel.date === 'custom') $('#bk-custom', panel).focus(); });
    $('#bk-custom', panel).addEventListener('change', e => { sel.custom = e.target.value; });
    calc(false);

    const dateLabel = () => sel.date === 'custom' ? (sel.custom ? fmtDate(sel.custom) + ' (custom request)' : 'Flexible / to be confirmed') : fmtDate(sel.date);
    /* Add to Travel Cart with the chosen date and group (or update it if already there) */
    function addToCart() {
      if (!DS.cart) return;
      const d = { date: sel.date === 'custom' ? sel.custom : sel.date, adults: sel.adults, children: sel.children };
      const existing = DS.cart.findPackage(p.id);
      if (existing) { DS.cart.update(existing.uid, d); DS.cart.open(); DS.toast('Travel Cart updated with your dates and group.'); }
      else DS.cart.addAndShow('package', d, p.id);
    }
    const syncCartState = () => {
      const on = !!(DS.cart && DS.cart.findPackage(p.id));
      $$('[data-pkg-add-label]').forEach(l => { l.textContent = on ? (l.closest('.booking, .mobile-bar') ? 'Update Travel Cart' : 'In your cart') : (l.closest('.booking, .mobile-bar') ? 'Add to Travel Cart' : 'Add to cart'); });
      $$('[data-pkg-add]').forEach(b => { const svg = b.querySelector('svg'); if (svg) svg.outerHTML = DS.icon(on ? 'bagCheck' : 'bagPlus'); });
      const note = $('[data-incart]', panel); if (note) note.hidden = !on;
    };
    document.addEventListener('click', e => { if (e.target.closest('[data-pkg-add]')) { e.preventDefault(); addToCart(); } });
    document.addEventListener('ds:cart', syncCartState);
    function requestBooking() {
      const total = calc(false);
      const summary = `<div><span>Package</span><strong>${esc(p.title)}</strong></div><div><span>Departure</span><strong>${esc(dateLabel())}</strong></div><div><span>Travellers</span><strong>${sel.adults} adult${sel.adults > 1 ? 's' : ''}${sel.children ? `, ${sel.children} child${sel.children > 1 ? 'ren' : ''}` : ''}</strong></div><div class="total"><span>${priced ? 'Estimated total (sample)' : 'Price'}</span><strong>${priced ? fmtPHP(total) : 'On request'}</strong></div>`;
      DS.openEnquiry({ service: 'booking', destination: p.destination, travellers: sel.adults + sel.children, date: sel.date === 'custom' ? sel.custom : sel.date, summary, title: 'Request a quotation for this package', subtitle: 'A consultant checks availability and confirms the final price. Nothing is charged and no reservation is made on this prototype.', cta: 'Send quotation request', message: `Quotation request for “${p.title}”, departing ${dateLabel()}, ${sel.adults} adult(s)${sel.children ? ` and ${sel.children} child(ren)` : ''}.` });
    }
    $('[data-request-booking]', panel).addEventListener('click', requestBooking);
    const mbar = $('[data-mobile-bar]'); if (mbar) { mbar.innerHTML = `<div><span class="${priced ? 'price' : 'price price--request'}" data-mobile-total>${priced ? fmtPHP(calc(false)) : 'Price on request'}</span><small>${priced ? 'Sample total · ' : ''}<a href="#booking">change dates</a></small></div><button type="button" class="btn btn--primary" data-pkg-add>${DS.icon('bagPlus')} <span data-pkg-add-label>Add to Travel Cart</span></button>`; document.body.classList.add('has-mobile-bar'); }
    syncCartState();

    /* ----- Related ----- */
    const related = DS.packages.filter(x => x.id !== p.id && (x.destinationId === p.destinationId || x.category === p.category || x.type === p.type)).slice(0, 3);
    $('[data-related]').innerHTML = related.map(x => DS.renderPackageCard(x)).join('');
    DS.hydrateImages(root); if (DS.cart) DS.cart.refresh();
    if (location.hash === '#booking') setTimeout(() => panel.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
  }

  document.addEventListener('DOMContentLoaded', () => { initExplore(); initPackage(); });
})(window.DS);
