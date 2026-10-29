/* ==========================================================================
   Dreamspree — Travel Cart page (cart.html)
   Three steps like an online checkout: 1 Cart → 2 Your details → 3 Request sent.
   The "checkout" sends a quotation request, not a payment. Frontend-only.
   ========================================================================== */
(function (DS) {
  'use strict';
  const { $, $$, esc, fmtPHP, fmtDate, html } = DS;
  const C = DS.cartCatalog;
  const ORDER = ['package', 'custom', 'visa', 'flight', 'hotel', 'transport', 'insurance', 'cruise'];

  function init() {
    const root = $('[data-cart-page]'); if (!root || !DS.cart) return;
    let step = location.hash === '#checkout' && DS.cart.count() ? 'checkout' : 'cart';
    let sent = null; // snapshot shown after the request is "sent"
    const steps = $('[data-cart-steps]'), mbar = $('[data-cart-bar]');

    const sorted = () => DS.cart.list().slice().sort((a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind) || a.addedAt - b.addedAt);

    function renderSteps() {
      const idx = { cart: 0, checkout: 1, done: 2 }[step];
      steps.innerHTML = ['Your cart', 'Your details', 'Request sent'].map((l, i) => `<li class="${i < idx ? 'is-done' : ''} ${i === idx ? 'is-current' : ''}" ${i === idx ? 'aria-current="step"' : ''}><span class="checkout-steps__n">${i < idx ? DS.icon('check') : i + 1}</span>${l}</li>`).join('');
    }

    /* ----- Line items ----- */
    function line(it) {
      const x = DS.cart.describe(it), d = it.d || {};
      const noun = DS.cart.noun(it.kind), a = Math.max(1, +d.adults || 1);
      return `<article class="cart-line" data-uid="${it.uid}">
        <div class="cart-line__media">${x.href ? `<a href="${x.href}" tabindex="-1" aria-hidden="true">${DS.cart.media(x, 240)}</a>` : DS.cart.media(x, 240)}</div>
        <div class="cart-line__body">
          <div class="cart-line__top">
            <div class="cart-line__info"><span class="cart-line__kind">${DS.icon(x.icon)}${esc(x.kindLabel)}</span><h3>${x.href ? `<a href="${x.href}">${esc(x.title)}</a>` : esc(x.title)}</h3>
              <ul class="cart-line__meta">${x.lines.map(([ic, t]) => `<li>${DS.icon(ic)}${esc(t)}</li>`).join('')}</ul></div>
            <div class="cart-line__price"><span class="${x.price != null ? 'price' : 'price price--request'}">${x.price != null ? fmtPHP(x.price) : 'Price on request'}</span><small>${esc(x.price != null ? x.note : 'Quoted by your consultant')}</small></div>
          </div>
          <div class="cart-line__actions">
            <div class="cart-line__qty"><span class="small muted">Adults</span><div class="counter counter--sm"><button type="button" class="counter__btn" data-qty="-1" aria-label="Fewer ${noun}s for ${esc(x.title)}" ${a <= 1 ? 'disabled' : ''}>${DS.icon('minus')}</button><span class="counter__val" aria-live="polite">${a}</span><button type="button" class="counter__btn" data-qty="1" aria-label="More ${noun}s for ${esc(x.title)}" ${a >= 12 ? 'disabled' : ''}>${DS.icon('plus')}</button></div></div>
            <div class="cluster" style="gap:4px"><button type="button" class="btn btn--ghost btn--sm" data-edit>${DS.icon('edit')} Edit details</button><button type="button" class="btn btn--link btn--sm" data-remove>${DS.icon('trash')} Remove</button></div>
          </div>
        </div></article>`;
    }

    /* Suggest visa assistance when a package needs a visa and none is in the cart */
    function suggestions(list) {
      const out = [];
      list.filter(i => i.kind === 'package').forEach(i => {
        const p = DS.getPackage(i.ref), dest = DS.getDestination(p.destinationId);
        const v = C.visa.find(x => x.destinationId === p.destinationId);
        if (dest.visa === 'required' && v && !list.some(j => j.kind === 'visa' && j.d.country === v.id)) out.push(`<div class="notice cart-suggest">${DS.icon('passport')}<div><strong>${esc(p.destination)} needs a visa for Philippine passport holders.</strong> Add ${esc(v.name)} visa assistance so your consultant prepares the checklist and books the appointment.</div><button type="button" class="btn btn--sm btn--primary" data-cart-new="visa" data-pre-country="${v.id}">${DS.icon('bagPlus')} Add visa</button></div>`);
      });
      return out.slice(0, 2).join('');
    }

    function summary(t, opts = {}) {
      const start = t.items.map(x => x.start).filter(Boolean).sort()[0];
      return `<h2>Order summary</h2>
        <ul class="cart-summary__items">${t.items.map(x => `<li><span>${esc(x.title)}</span><strong class="${x.price != null ? '' : 'muted'}">${x.price != null ? fmtPHP(x.price) : 'On request'}</strong></li>`).join('')}</ul>
        ${start ? `<p class="cart-summary__when">${DS.icon('calendar')}Trip starts around <strong>${esc(start.length === 10 ? fmtDate(start) : start)}</strong></p>` : ''}
        ${DS.cart.summaryRows(t)}
        ${opts.cta ? `<button type="button" class="btn btn--primary btn--lg btn--block" data-checkout>Request quotation ${DS.icon('arrowRight', 'arrow')}</button><a class="btn btn--ghost btn--block" href="explore.html">Continue browsing</a><button type="button" class="btn btn--link btn--sm" data-clear-cart>Clear cart</button>` : ''}
        ${opts.edit ? `<button type="button" class="btn btn--ghost btn--block" data-back-cart>${DS.icon('chevronLeft')} Back to cart</button>` : ''}`;
    }

    function renderCart() {
      const list = sorted(), t = DS.cart.totals();
      if (!list.length) {
        root.innerHTML = `<div class="empty cart-empty"><div class="empty__icon">${DS.icon('bag')}</div><h3>Your Travel Cart is empty</h3><p>Start with a package, then add visa assistance, flights, a hotel or transport. Everything goes to your consultant as one quotation request.</p><div class="cluster" style="justify-content:center"><a class="btn btn--primary" href="explore.html">Browse packages ${DS.icon('arrowRight', 'arrow')}</a><a class="btn btn--ghost" href="visa.html">Check visa readiness</a></div></div>
          ${completeTrip(true)}`;
        mbar.hidden = true; document.body.classList.remove('has-mobile-bar');
        return;
      }
      root.innerHTML = `<div class="cart-layout">
          <div class="cart-main">
            <div class="cart-main__head"><h2>${list.length} item${list.length === 1 ? '' : 's'} in your cart</h2><span class="small muted">Prices are optional: anything without a price is quoted by your consultant.</span></div>
            ${suggestions(list)}
            <div class="cart-lines" aria-live="polite">${list.map(line).join('')}</div>
            ${completeTrip(false)}
          </div>
          <aside class="cart-summary" aria-label="Order summary">${summary(t, { cta: true })}</aside>
        </div>`;
      mbar.hidden = false; document.body.classList.add('has-mobile-bar');
      mbar.innerHTML = `<div><span class="${t.pricedCount ? 'price' : 'price price--request'}">${t.pricedCount ? fmtPHP(t.subtotal) : 'On request'}</span><small>${list.length} item${list.length === 1 ? '' : 's'}${t.requestCount ? ` · ${t.requestCount} on request` : ''}</small></div><button type="button" class="btn btn--primary" data-checkout>Request quotation</button>`;
      DS.hydrateImages(root);
    }
    function completeTrip(empty) {
      const kinds = ['custom', 'visa', 'flight', 'hotel', 'transport', 'insurance', 'cruise'];
      return `<section class="complete-trip" aria-labelledby="complete-title"><h2 id="complete-title">${empty ? 'Or start with a service' : 'Complete your trip'}</h2>
        <div class="complete-trip__grid">${kinds.map(k => { const n = DS.cart.list().filter(i => i.kind === k).length; return `<button type="button" class="add-tile ${k === 'custom' ? 'add-tile--wide' : ''}" data-cart-new="${k}"><span class="add-tile__icon">${DS.icon(C.kinds[k].icon)}</span><span class="add-tile__text"><strong>${esc(C.kinds[k].label)}</strong><small>${esc(C.kinds[k].blurb)}</small></span><span class="add-tile__cta">${n ? `${n} added · add another` : 'Add'} ${DS.icon('plus')}</span></button>`; }).join('')}</div></section>`;
    }

    /* ----- Step 2: details ----- */
    function renderCheckout() {
      const t = DS.cart.totals();
      root.innerHTML = `<div class="cart-layout">
        <div class="cart-main">
          <form class="checkout" novalidate>
            <h2>Who should we send the quotation to?</h2>
            <p class="muted">A consultant reviews every item, confirms availability and sends one written quotation. No payment is taken.</p>
            <div class="form-grid">
              <div class="field"><label class="field__label" for="co-name">Full name</label><input class="input" id="co-name" name="name" autocomplete="name" required placeholder="Juan dela Cruz"><span class="field__error" aria-live="polite"></span></div>
              <div class="field"><label class="field__label" for="co-email">Email</label><input class="input" id="co-email" name="email" type="email" autocomplete="email" required placeholder="you@example.com"><span class="field__error" aria-live="polite"></span></div>
              <div class="field"><label class="field__label" for="co-phone">Mobile number</label><input class="input" id="co-phone" name="phone" type="tel" autocomplete="tel" required placeholder="+63 9XX XXX XXXX"><span class="field__error" aria-live="polite"></span></div>
              <div class="field"><label class="field__label" for="co-contact">Preferred contact</label><select class="select" id="co-contact" name="contact"><option>Viber</option><option>WhatsApp</option><option>Messenger</option><option>Phone call</option><option>Email</option></select></div>
              <div class="field"><label class="field__label" for="co-budget">Budget for the whole trip (optional)</label><select class="select" id="co-budget" name="budget"><option value="">Prefer not to say</option><option>Under ₱50,000</option><option>₱50,000 – ₱150,000</option><option>₱150,000 – ₱300,000</option><option>Over ₱300,000</option></select></div>
              <div class="field"><label class="field__label" for="co-flex">Are your dates flexible?</label><select class="select" id="co-flex" name="flex"><option>Exact dates</option><option>Flexible by a few days</option><option>Flexible by a few weeks</option></select></div>
              <div class="field field--full"><label class="field__label" for="co-notes">Anything else your consultant should know?</label><textarea class="textarea" id="co-notes" name="notes" placeholder="Room preferences, ages of children, special occasions, dietary needs…"></textarea></div>
              <div class="field field--full"><label class="checkbox"><input type="checkbox" name="consent" required><span>I understand this is a prototype demonstration. No information is sent or stored. (In the live site this would link to the privacy notice.)</span></label><span class="field__error" aria-live="polite"></span></div>
            </div>
            <div class="checkout__foot"><button type="button" class="btn btn--ghost" data-back-cart>${DS.icon('chevronLeft')} Back to cart</button><button type="submit" class="btn btn--primary btn--lg">Send quotation request ${DS.icon('arrowRight', 'arrow')}</button></div>
          </form>
        </div>
        <aside class="cart-summary" aria-label="Order summary">${summary(t, {})}</aside></div>`;
      mbar.hidden = true; document.body.classList.remove('has-mobile-bar');
      const form = $('form', root);
      form.addEventListener('submit', e => {
        e.preventDefault(); if (!DS.validate(form)) return;
        const data = Object.fromEntries(new FormData(form).entries());
        sent = { name: data.name.split(' ')[0], contact: data.contact, ref: 'DSQ-DEMO-' + Math.floor(10000 + Math.random() * 89999), totals: DS.cart.totals() };
        DS.cart.clear(); // like an order: the cart empties once the request is sent
        go('done');
      });
      setTimeout(() => $('#co-name', root).focus(), 50);
    }

    /* ----- Step 3: confirmation ----- */
    function renderDone() {
      const t = sent.totals;
      root.innerHTML = `<div class="cart-done">
        <div class="success-icon">${DS.icon('check')}</div>
        <h2>Thanks, ${esc(sent.name)}. Your quotation request is in.</h2>
        <p class="muted">Reference <strong>${esc(sent.ref)}</strong> · ${t.items.length} item${t.items.length === 1 ? '' : 's'}${t.requestCount ? `, ${t.requestCount} priced on request` : ''}</p>
        <ol class="cart-done__next">
          <li><strong>Within one business day</strong><span>A consultant reviews every item and contacts you on ${esc(sent.contact)}.</span></li>
          <li><strong>Your written quotation</strong><span>Prices for every item, including the ones priced on request, with what is and is not included.</span></li>
          <li><strong>You decide</strong><span>Accept, change or ask questions. Nothing is booked or charged until you confirm.</span></li>
        </ol>
        <div class="demo-banner">${DS.icon('info')}<span>Prototype only: nothing was transmitted or stored. In production this would create a quotation request for the consultant team.</span></div>
        <div class="cluster" style="justify-content:center"><a class="btn btn--primary" href="index.html">Back to home</a><a class="btn btn--ghost" href="explore.html">Browse more packages</a></div></div>`;
      mbar.hidden = true; document.body.classList.remove('has-mobile-bar');
    }

    function go(next) {
      step = next; renderSteps();
      const draw = () => { ({ cart: renderCart, checkout: renderCheckout, done: renderDone })[step](); if (DS.motion && DS.motion.tabIn) DS.motion.tabIn(root); };
      draw();
      history.replaceState(null, '', location.pathname + (step === 'checkout' ? '#checkout' : ''));
      $('[data-cart-steps]').scrollIntoView({ block: 'nearest' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /* ----- Events ----- */
    document.addEventListener('click', e => {
      if (e.target.closest('[data-checkout]')) { e.preventDefault(); go('checkout'); return; }
      if (e.target.closest('[data-back-cart]')) { e.preventDefault(); go('cart'); return; }
      const lineEl = e.target.closest('.cart-line'); if (!lineEl) {
        if (e.target.closest('[data-clear-cart]')) {
          const box = DS.modal.open(`<p class="muted">Remove all ${DS.cart.count()} items from your Travel Cart on this device?</p><div class="cluster" style="justify-content:flex-end;margin-top:1rem"><button type="button" class="btn btn--ghost" data-modal-close>Keep my cart</button><button type="button" class="btn btn--danger" data-confirm-clear>Clear cart</button></div>`, { title: 'Clear your Travel Cart?' });
          $('[data-confirm-clear]', box).addEventListener('click', () => { DS.cart.clear(); DS.modal.close(); DS.toast('Travel Cart cleared.'); });
        }
        return;
      }
      const id = lineEl.dataset.uid, it = DS.cart.get(id); if (!it) return;
      const q = e.target.closest('[data-qty]');
      if (q && !q.disabled) { DS.cart.update(id, { adults: Math.min(12, Math.max(1, (+it.d.adults || 1) + +q.dataset.qty)) }); return; }
      if (e.target.closest('[data-edit]')) { DS.cart.openForm(it.kind, { uid: id }); return; }
      if (e.target.closest('[data-remove]')) {
        const title = DS.cart.describe(it).title;
        lineEl.style.transition = 'opacity .2s, transform .2s'; lineEl.style.opacity = '0'; lineEl.style.transform = 'translateX(12px)';
        setTimeout(() => { DS.cart.remove(id); DS.toast(`${title} removed.`); }, 200);
      }
    });
    // Re-render on any cart change (drawer removals, edits, other tabs). Keep the
    // focused control in place where possible so steppers stay keyboard friendly.
    document.addEventListener('ds:cart', () => {
      if (step !== 'cart') { if (step === 'checkout' && !DS.cart.count()) go('cart'); return; }
      const active = document.activeElement, uid = active && active.closest && active.closest('.cart-line')?.dataset.uid, qty = active && active.dataset ? active.dataset.qty : null;
      renderCart();
      if (uid && qty) { const btn = $(`.cart-line[data-uid="${uid}"] [data-qty="${qty}"]`, root); if (btn && !btn.disabled) btn.focus(); }
    });
    renderSteps(); (step === 'checkout' ? renderCheckout : renderCart)();
  }
  document.addEventListener('DOMContentLoaded', init);
})(window.DS);
