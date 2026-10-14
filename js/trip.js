/* ==========================================================================
   Dreamspree — Trip Builder (trip-builder.html)
   Frontend-only preview: saved packages live in localStorage via DS.saved.
   ========================================================================== */
(function (DS) {
  'use strict';
  const { $, $$, esc, fmtPHP, fmtDate } = DS;

  function initTrip() {
    const root = $('[data-trip]'); if (!root) return;
    const list = $('[data-trip-list]'), summary = $('[data-trip-summary]'), suggest = $('[data-trip-suggest]');
    const lineTotal = (s, p) => s.adults * p.priceFrom + s.children * p.priceFrom * p.childRate;
    const dateLabel = s => s.date && s.date !== 'custom' ? fmtDate(s.date) : 'Flexible';

    function render() {
      const items = DS.saved.list();
      if (!items.length) {
        list.innerHTML = `<div class="empty"><div class="empty__icon">${DS.icon('luggage')}</div><h3>Your Trip Builder is empty</h3><p>Save any package with the heart button and it appears here. Combine several packages, set travellers and dates, and request one combined quotation.</p><div class="cluster"><a class="btn btn--primary" href="explore.html">Browse packages</a><a class="btn btn--ghost" href="visa.html">Check visa readiness</a></div></div>`;
        summary.innerHTML = `<h2>Trip summary</h2><p class="muted small">Nothing saved yet. Totals appear here as you add packages.</p><div class="demo-banner">${DS.icon('info')}<span>Preview of a future Trip Builder. Not a live booking engine.</span></div>`;
      } else {
        list.innerHTML = items.map(s => { const p = DS.getPackage(s.id); return `
          <article class="trip-item" data-id="${p.id}">
            <div class="trip-item__media">${DS.picture(p.images[0], p.title, { w: 480, h: 360, label: p.destination })}</div>
            <div class="trip-item__body">
              <div class="trip-item__top"><div><div class="pkg-card__loc">${DS.icon('pin')}${esc(p.destination)}, ${esc(p.country)}</div><h3><a href="package.html?id=${p.id}">${esc(p.title)}</a></h3><p class="small muted" style="margin:.25rem 0 0">${p.duration.days} days, ${p.duration.nights} nights · ${esc(p.category)} · from ${fmtPHP(p.priceFrom)} per person</p></div><button type="button" class="icon-btn" data-remove="${p.id}" aria-label="Remove ${esc(p.title)} from Trip Builder">${DS.icon('trash')}</button></div>
              <div class="trip-item__controls">
                <div class="field"><label class="field__label" for="ad-${p.id}">Adults</label><select class="select" id="ad-${p.id}" data-field="adults" style="min-height:44px">${Array.from({ length: 12 }, (_, i) => `<option value="${i + 1}" ${s.adults === i + 1 ? 'selected' : ''}>${i + 1}</option>`).join('')}</select></div>
                <div class="field"><label class="field__label" for="ch-${p.id}">Children</label><select class="select" id="ch-${p.id}" data-field="children" style="min-height:44px">${Array.from({ length: 9 }, (_, i) => `<option value="${i}" ${s.children === i ? 'selected' : ''}>${i}</option>`).join('')}</select></div>
                <div class="field" style="flex:1"><label class="field__label" for="dt-${p.id}">Departure</label><select class="select" id="dt-${p.id}" data-field="date" style="min-height:44px"><option value="" ${!s.date ? 'selected' : ''}>Flexible</option>${p.departures.map(d => `<option value="${d.date}" ${s.date === d.date ? 'selected' : ''}>${fmtDate(d.date)} · ${esc(d.note)}</option>`).join('')}</select></div>
              </div>
              <div class="trip-item__sub"><span>${s.adults} adult${s.adults > 1 ? 's' : ''}${s.children ? `, ${s.children} child${s.children > 1 ? 'ren' : ''}` : ''} · ${dateLabel(s)}</span><span class="price" data-line-total>${fmtPHP(lineTotal(s, p))}</span></div>
            </div>
          </article>`; }).join('');
        const total = items.reduce((t, s) => t + lineTotal(s, DS.getPackage(s.id)), 0);
        const pax = items.reduce((t, s) => Math.max(t, s.adults + s.children), 0);
        const days = items.reduce((t, s) => t + DS.getPackage(s.id).duration.days, 0);
        summary.innerHTML = `<h2>Trip summary</h2>
          <div class="trip-summary__rows">${items.map(s => { const p = DS.getPackage(s.id); return `<div><span>${esc(p.destination)} · ${p.duration.days}D</span><span>${fmtPHP(lineTotal(s, p))}</span></div>`; }).join('')}<div><span>Packages</span><span>${items.length}</span></div><div><span>Total travel days</span><span>${days}</span></div><div class="total"><span>Estimated total</span><span data-grand-total data-value="${total}">${fmtPHP(total)}</span></div></div>
          <p class="booking__note">${DS.icon('info')}<span>Sample totals from illustrative prices. Multi-package trips are quoted as one itinerary by a consultant, often with combined flight savings.</span></p>
          <button type="button" class="btn btn--primary btn--lg btn--block" data-quote>Request a combined quotation ${DS.icon('arrowRight', 'arrow')}</button>
          <button type="button" class="btn btn--ghost btn--block" data-clear-trip>Clear Trip Builder</button>
          <ul class="booking__assure"><li>${DS.icon('check')}One consultant, one itinerary, one quotation</li><li>${DS.icon('check')}Visa steps sequenced for ${pax > 1 ? 'the whole group' : 'you'}</li><li>${DS.icon('check')}Saved on this device only; nothing is sent</li></ul>`;
        $('[data-quote]', summary).addEventListener('click', () => {
          const rows = items.map(s => { const p = DS.getPackage(s.id); return `<div><span>${esc(p.title)}</span><strong>${s.adults + s.children} pax · ${dateLabel(s)}</strong></div>`; }).join('') + `<div class="total"><span>Estimated total (sample)</span><strong>${fmtPHP(total)}</strong></div>`;
          const dests = [...new Set(items.map(s => DS.getPackage(s.id).destination))];
          DS.openEnquiry({ service: 'quote', destination: dests.length === 1 ? dests[0] : 'Multiple / undecided', travellers: pax, date: items.find(s => s.date && s.date !== 'custom')?.date || '', summary: rows, title: 'Request a combined quotation', subtitle: 'A consultant turns your saved packages into one itinerary with a single written quotation.', cta: 'Send quotation request', message: `Combined quotation for: ${items.map(s => DS.getPackage(s.id).title).join('; ')}.` });
        });
        $('[data-clear-trip]', summary).addEventListener('click', () => {
          const box = DS.modal.open(`<p class="muted">Remove all ${items.length} saved package${items.length > 1 ? 's' : ''} from this device?</p><div class="cluster" style="justify-content:flex-end;margin-top:1rem"><button type="button" class="btn btn--ghost" data-modal-close>Keep them</button><button type="button" class="btn btn--coral" data-confirm-clear>Clear all</button></div>`, { title: 'Clear Trip Builder?' });
          $('[data-confirm-clear]', box).addEventListener('click', () => { DS.saved.clear(); DS.modal.close(); DS.toast('Trip Builder cleared.'); });
        });
      }
      // Suggestions: packages not yet saved
      const ids = new Set(items.map(s => s.id));
      const sugg = DS.packages.filter(p => !ids.has(p.id)).slice(0, 3);
      suggest.innerHTML = sugg.map(p => DS.renderPackageCard(p)).join('');
      DS.hydrateImages(root); document.dispatchEvent(new CustomEvent('ds:badges'));
      $$('[data-save]', root).forEach(b => { const on = DS.saved.has(b.dataset.save); b.classList.toggle('is-active', on); b.setAttribute('aria-pressed', on); });
    }
    list.addEventListener('change', e => {
      const f = e.target.closest('[data-field]'); if (!f) return; const item = f.closest('[data-id]'); const id = item.dataset.id;
      DS.saved.update(id, { [f.dataset.field]: f.dataset.field === 'date' ? f.value : +f.value });
    });
    list.addEventListener('click', e => { const b = e.target.closest('[data-remove]'); if (!b) return; const p = DS.getPackage(b.dataset.remove); const item = b.closest('.trip-item'); const done = () => { DS.saved.remove(p.id); DS.toast(`${p.title} removed.`); }; if (window.gsap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) gsap.to(item, { autoAlpha: 0, x: 24, duration: 0.3, onComplete: done }); else done(); });
    document.addEventListener('ds:saved', () => { const prev = $('[data-grand-total]'); const prevVal = prev ? +prev.dataset.value : 0; render(); const next = $('[data-grand-total]'); if (next && DS.motion && DS.motion.countTo && prev) { const target = +next.dataset.value; next.dataset.value = prevVal; DS.motion.countTo(next, target, fmtPHP); } });
    render();
  }
  document.addEventListener('DOMContentLoaded', initTrip);
})(window.DS);
