/* ==========================================================================
   Dreamspree — Visa Readiness Checker (visa.html)
   A guided three-step flow producing an ILLUSTRATIVE checklist. No passport
   numbers, documents or other sensitive data are requested or stored. Only
   the destination, high-level answers and ticked items persist in localStorage.
   ========================================================================== */
(function (DS) {
  'use strict';
  const { $, $$, esc, html } = DS;
  const KEY = 'dreamspree.visa.v1';

  function initVisa() {
    const root = $('[data-visa]'); if (!root) return;
    const q = DS.params();
    const saved = (() => { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { return null; } })() || {};
    const state = {
      step: 1,
      dest: q.get('dest') || saved.dest || '',
      answers: Object.assign({ purpose: 'tourism', period: '', nationality: 'Philippines', employment: 'employed', visitedBefore: false, married: false, minors: false, sponsored: false }, saved.answers || {}),
      checked: new Set(saved.checked || [])
    };
    if (q.get('purpose')) state.answers.purpose = q.get('purpose');
    if (q.get('period')) state.answers.period = q.get('period');
    const persist = () => { try { localStorage.setItem(KEY, JSON.stringify({ dest: state.dest, answers: state.answers, checked: [...state.checked] })); } catch { /* ignore */ } };
    const destData = () => DS.visa.destinations.find(d => d.id === state.dest);

    const stepper = $('[data-stepper]'), panels = { 1: $('[data-step="1"]'), 2: $('[data-step="2"]'), 3: $('[data-step="3"]') };

    /* ----- Step 1: destination ----- */
    panels[1].innerHTML = `
      <div class="visa-step__head"><p class="eyebrow">Step 1 of 3</p><h2 class="display">Where are you applying to go?</h2><p class="lede">The demo covers the three most requested visa routes for Filipino travellers. Other destinations go straight to a consultant.</p></div>
      <div class="dest-choice" role="group" aria-label="Destination">${DS.visa.destinations.map(d => `<button type="button" class="dest-choice__btn" data-choose="${d.id}" aria-pressed="${state.dest === d.id}" data-step-item>${DS.picture(d.image, d.name, { w: 640, h: 480, label: d.name })}<span class="dest-choice__check">${DS.icon('check')}</span><div><strong>${esc(d.name)}</strong><span>${esc(d.note)}</span></div></button>`).join('')}</div>
      <p class="small muted" style="margin-top:1rem">Going somewhere else? <button type="button" class="btn btn--link" data-enquiry data-service="visa" data-title="Visa assistance for another destination">Ask a consultant about your destination</button>.</p>
      <div class="visa-step__foot"><span></span><button type="button" class="btn btn--primary btn--lg" data-next ${state.dest ? '' : 'disabled'}>Continue ${DS.icon('arrowRight', 'arrow')}</button></div>`;
    panels[1].addEventListener('click', e => {
      const b = e.target.closest('[data-choose]'); if (!b) return;
      state.dest = b.dataset.choose; $$('[data-choose]', panels[1]).forEach(x => x.setAttribute('aria-pressed', x === b)); $('[data-next]', panels[1]).disabled = false; persist();
      if (DS.motion && DS.motion.pop) DS.motion.pop(b.querySelector('.dest-choice__check'));
    });

    /* ----- Step 2: trip details ----- */
    function renderStep2() {
      const a = state.answers, d = destData();
      panels[2].innerHTML = `
        <div class="visa-step__head"><p class="eyebrow">Step 2 of 3 · ${esc(d.name)}</p><h2 class="display">Tell us about your trip</h2><p class="lede">These answers shape your checklist. We never ask for passport numbers or document uploads in this checker.</p></div>
        <form novalidate data-trip-form>
          <div class="form-grid">
            <div class="field field--full"><span class="field__label" id="purpose-label">Purpose of travel</span><div class="radio-cards radio-cards--3" role="radiogroup" aria-labelledby="purpose-label" data-step-item>${DS.visa.purposes.map(p => `<label class="radio-card"><input type="radio" name="purpose" value="${p.id}" ${a.purpose === p.id ? 'checked' : ''}><div><strong>${esc(p.label)}</strong><span>${esc(p.hint)}</span></div></label>`).join('')}</div></div>
            <div class="field" data-step-item><label class="field__label" for="v-period">Intended travel period</label><input class="input" id="v-period" name="period" type="month" required value="${esc(a.period)}" min="${new Date().toISOString().slice(0, 7)}"><span class="field__error" aria-live="polite"></span></div>
            <div class="field" data-step-item><label class="field__label" for="v-nat">Passport country</label><select class="select" id="v-nat" name="nationality">${DS.visa.nationalities.map(n => `<option ${a.nationality === n ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select><span class="field__help">Checklists are written for Philippine passport holders.</span></div>
            <div class="field" data-step-item><label class="field__label" for="v-emp">Employment status</label><select class="select" id="v-emp" name="employment">${DS.visa.employment.map(e => `<option value="${e.id}" ${a.employment === e.id ? 'selected' : ''}>${esc(e.label)}</option>`).join('')}</select></div>
            <div class="field" data-step-item><span class="field__label">Travel circumstances</span>
              <label class="checkbox"><input type="checkbox" name="visitedBefore" ${a.visitedBefore ? 'checked' : ''}><span>I have travelled to this destination (or an OECD country) before</span></label>
              <label class="checkbox"><input type="checkbox" name="married" ${a.married ? 'checked' : ''}><span>I am married</span></label>
              <label class="checkbox"><input type="checkbox" name="minors" ${a.minors ? 'checked' : ''}><span>Travelling with children under 18</span></label>
              <label class="checkbox"><input type="checkbox" name="sponsored" ${a.sponsored ? 'checked' : ''}><span>Someone else is funding my trip</span></label></div>
          </div>
          <div class="visa-step__foot"><button type="button" class="btn btn--ghost" data-back>${DS.icon('chevronLeft')} Back</button><button type="submit" class="btn btn--primary btn--lg">Build my checklist ${DS.icon('arrowRight', 'arrow')}</button></div>
        </form>`;
      const form = $('[data-trip-form]', panels[2]);
      form.addEventListener('submit', e => {
        e.preventDefault(); if (!DS.validate(form)) return;
        const fd = new FormData(form);
        state.answers = { purpose: fd.get('purpose'), period: fd.get('period'), nationality: fd.get('nationality'), employment: fd.get('employment'), visitedBefore: !!fd.get('visitedBefore'), married: !!fd.get('married'), minors: !!fd.get('minors'), sponsored: !!fd.get('sponsored') };
        persist(); go(3);
      });
    }

    /* ----- Step 3: checklist ----- */
    const ICON = { identity: 'passport', finance: 'bank', work: 'briefcase', trip: 'calendar' };
    function visibleItems(d) { return d.categories.map(c => ({ ...c, items: c.items.filter(i => !i.cond || i.cond(state.answers)) })).filter(c => c.items.length); }
    function renderStep3() {
      const d = destData(), a = state.answers, cats = visibleItems(d);
      const all = cats.flatMap(c => c.items); const review = all.filter(i => i.review);
      const periodLabel = a.period ? new Date(a.period + '-01T00:00:00').toLocaleDateString('en-PH', { month: 'long', year: 'numeric' }) : 'your travel period';
      const purposeLabel = DS.visa.purposes.find(p => p.id === a.purpose)?.label || a.purpose;
      panels[3].innerHTML = `
        <div class="visa-step__head"><p class="eyebrow">Step 3 of 3 · ${esc(d.name)}</p><h2 class="display">Your preparation checklist</h2><p class="lede">${esc(purposeLabel)} trip in ${esc(periodLabel)}, ${esc(DS.visa.employment.find(e => e.id === a.employment)?.label.toLowerCase() || '')}${a.minors ? ', travelling with children' : ''}${a.sponsored ? ', sponsored' : ''}. Tick items as you gather them. Progress is saved on this device only.</p></div>
        <div class="notice notice--warn" style="margin-bottom:1.5rem" data-step-item>${DS.icon('alert')}<div><strong>Illustrative demo checklist.</strong> Visa requirements change frequently and vary by applicant. Confirm current requirements with the relevant embassy or official visa centre and with your Dreamspree consultant before preparing documents.</div></div>
        <div class="visa-summary" style="margin-bottom:1.5rem" data-step-item>
          <div class="stat"><strong data-stat-done>0</strong><span>of <span data-stat-total>${all.length}</span> items prepared</span></div>
          <div class="stat"><strong>${review.length}</strong><span>items to review with a consultant</span></div>
          <div class="stat"><strong style="font-size:1.05rem;line-height:1.3">${esc(d.processing.split(';')[0])}</strong><span>typical processing (sample guidance)</span></div>
        </div>
        <div class="progress-head"><span>Preparation progress</span><span data-progress-pct>0%</span></div>
        <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="Checklist progress"><div class="progress__bar" data-progress-bar></div></div>
        <div class="stack" style="margin-top:1.5rem" data-checklist>${cats.map(c => `<section class="checklist-cat" data-step-item aria-labelledby="cat-${c.id}"><div class="checklist-cat__head"><span class="checklist-cat__icon">${DS.icon(ICON[c.id] || 'file')}</span><h3 id="cat-${c.id}">${esc(c.name)}</h3><span class="badge" data-cat-count="${c.id}">0 / ${c.items.length}</span></div>${c.items.map(i => `<div class="check-item ${state.checked.has(i.id) ? 'is-done' : ''}"><input type="checkbox" id="ck-${i.id}" data-item="${i.id}" ${state.checked.has(i.id) ? 'checked' : ''}><label for="ck-${i.id}"><strong>${esc(i.label)}</strong><span>${esc(i.why)}</span></label>${i.review ? `<span class="badge badge--warn">${DS.icon('alert')}Review with us</span>` : ''}</div>`).join('')}</section>`).join('')}</div>
        <div class="grid grid--2" style="margin-top:2rem" data-step-item>
          <div class="info-card"><h3>${DS.icon('sparkles')}Next steps</h3><ol style="padding-left:1.2em;font-size:var(--fs-sm);color:var(--color-text-secondary);display:grid;gap:6px"><li>Gather the identity and financial documents first; bank certificates must be recent at lodgement.</li><li>Ask your consultant to review anything marked <strong>Review with us</strong>.</li><li>Dreamspree prepares the itinerary, flight and hotel reservations for the application.</li><li>Book the appointment slot. ${esc(d.processing)}</li><li>${esc(d.validity)}</li></ol></div>
          <div class="info-card" style="background:var(--color-brand-dark);color:var(--color-text-on-dark);border-color:transparent"><h3 style="color:var(--color-text-on-dark)">${DS.icon('headset')}Hand it to a consultant</h3><p class="small" style="color:rgba(255,255,255,.8)">Send this checklist summary to a Dreamspree consultant. They review your documents, book the appointment and prepare the supporting itinerary. No documents are uploaded here.</p><div class="cluster" style="margin-top:1rem"><button type="button" class="btn btn--lime" data-visa-consult>Request a visa consultation ${DS.icon('arrowRight', 'arrow')}</button><a class="btn btn--ghost-light btn--sm" href="explore.html?dest=${d.id === 'korea' ? 'south-korea' : d.id === 'schengen' ? '' : d.id}">See ${esc(d.id === 'schengen' ? 'all' : d.name)} packages</a></div></div>
        </div>
        <div class="visa-step__foot"><button type="button" class="btn btn--ghost" data-back>${DS.icon('chevronLeft')} Edit answers</button><div class="cluster"><button type="button" class="btn btn--ghost" data-restart>${DS.icon('history')} Start over</button><button type="button" class="btn btn--ghost" onclick="window.print()">${DS.icon('file')} Print checklist</button></div></div>`;
      const update = (animate) => {
        const done = all.filter(i => state.checked.has(i.id)).length, pct = all.length ? Math.round(done / all.length * 100) : 0;
        $('[data-stat-done]', panels[3]).textContent = done; $('[data-progress-pct]', panels[3]).textContent = pct + '%';
        const bar = $('[data-progress-bar]', panels[3]); if (animate && DS.motion && DS.motion.progress) DS.motion.progress(bar, pct); else bar.style.width = pct + '%';
        bar.parentElement.setAttribute('aria-valuenow', pct);
        cats.forEach(c => { $(`[data-cat-count="${c.id}"]`, panels[3]).textContent = `${c.items.filter(i => state.checked.has(i.id)).length} / ${c.items.length}`; });
        if (pct === 100 && animate) DS.toast('Checklist complete. Nice work! Send it to a consultant for review.');
      };
      panels[3].addEventListener('change', e => { const cb = e.target.closest('[data-item]'); if (!cb) return; cb.checked ? state.checked.add(cb.dataset.item) : state.checked.delete(cb.dataset.item); cb.closest('.check-item').classList.toggle('is-done', cb.checked); persist(); update(true); });
      $('[data-visa-consult]', panels[3]).addEventListener('click', () => {
        const done = all.filter(i => state.checked.has(i.id)).length;
        const summary = `<div><span>Destination</span><strong>${esc(d.name)}</strong></div><div><span>Purpose</span><strong>${esc(purposeLabel)}</strong></div><div><span>Travel period</span><strong>${esc(periodLabel)}</strong></div><div><span>Checklist</span><strong>${done} of ${all.length} prepared · ${review.length} to review</strong></div>`;
        DS.openEnquiry({ service: 'visa', destination: d.id === 'korea' ? 'South Korea' : d.id === 'japan' ? 'Japan' : 'Other', title: 'Request a visa consultation', subtitle: 'A consultant reviews your checklist and books the application appointment with you.', summary, cta: 'Request consultation', travellers: a.minors ? 3 : 1, message: `Visa consultation for ${d.name}, ${purposeLabel.toLowerCase()} trip in ${periodLabel}. Items to review: ${review.map(r => r.label).join('; ') || 'none flagged'}.` });
      });
      $('[data-restart]', panels[3]).addEventListener('click', () => {
        const box = DS.modal.open(`<p class="muted">This clears your destination, answers and ticked items from this device.</p><div class="cluster" style="justify-content:flex-end;margin-top:1rem"><button type="button" class="btn btn--ghost" data-modal-close>Keep my progress</button><button type="button" class="btn btn--danger" data-confirm-restart>Start over</button></div>`, { title: 'Start over?' });
        $('[data-confirm-restart]', box).addEventListener('click', () => { state.dest = ''; state.checked = new Set(); state.answers = { purpose: 'tourism', period: '', nationality: 'Philippines', employment: 'employed', visitedBefore: false, married: false, minors: false, sponsored: false }; try { localStorage.removeItem(KEY); } catch { /* ignore */ } DS.modal.close(); $$('[data-choose]', panels[1]).forEach(x => x.setAttribute('aria-pressed', 'false')); $('[data-next]', panels[1]).disabled = true; go(1); DS.toast('Checker reset.'); });
      });
      update(false);
    }

    /* ----- Navigation ----- */
    function go(n) {
      const from = state.step; state.step = n;
      if (n === 2) renderStep2(); if (n === 3) renderStep3();
      const show = () => {
        Object.entries(panels).forEach(([k, p]) => { p.hidden = +k !== n; });
        $$('li', stepper).forEach((li, i) => { li.classList.toggle('is-active', i + 1 === n); li.classList.toggle('is-done', i + 1 < n); const dot = $('.stepper__dot', li); dot.innerHTML = i + 1 < n ? DS.icon('check') : String(i + 1); li.setAttribute('aria-current', i + 1 === n ? 'step' : 'false'); });
        if (DS.motion && DS.motion.stepIn) DS.motion.stepIn(panels[n]);
        DS.hydrateImages(panels[n]);
        const h = $('h2', panels[n]); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
        if (from !== n) root.scrollIntoView({ behavior: 'smooth', block: 'start' });
        document.dispatchEvent(new CustomEvent('ds:refresh'));
      };
      if (from !== n && DS.motion && DS.motion.stepOut && !panels[from].hidden) DS.motion.stepOut(panels[from], show); else show();
    }
    root.addEventListener('click', e => { if (e.target.closest('[data-next]')) go(2); if (e.target.closest('[data-back]')) go(state.step - 1); });
    // Resume where the user left off (or jump in from the homepage search)
    if (state.dest && (q.get('dest') || saved.checked?.length)) go(q.get('dest') && !saved.checked?.length ? 2 : 3); else go(1);
  }
  document.addEventListener('DOMContentLoaded', initVisa);
})(window.DS);
