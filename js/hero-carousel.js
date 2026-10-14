/* ==========================================================================
   Dreamspree — Homepage hero campaign carousel
   - Slide 1 (brand) is static HTML in index.html, so the page works without JS.
   - Campaign slides are rendered from DS.campaigns (js/data.js).
   - Autoplay advances when the active tab's progress bar finishes; it pauses on
     hover, on keyboard focus, when the tab is hidden, or via the pause button.
     No autoplay at all under prefers-reduced-motion (WCAG 2.2.2).
   - Inactive slides are hidden + inert, so their links are never focusable.
   ========================================================================== */
(function (DS) {
  'use strict';
  const { $, $$, esc, fmtPHP } = DS;

  function init() {
    const root = $('[data-hero-carousel]'); if (!root) return;
    const track = $('[data-carousel-track]', root), controls = $('[data-carousel-controls]', root);
    const campaigns = DS.campaigns || [];

    /* ----- Render campaign slides ----- */
    track.insertAdjacentHTML('beforeend', campaigns.map(c => {
      const second = !c.secondary ? '' : c.secondary.enquiry
        ? `<button type="button" class="btn btn--ghost-light btn--lg" data-enquiry data-campaign-cta="${esc(c.id)}" data-service="${esc(c.secondary.enquiry.service || 'tours')}" data-destination="${esc(c.secondary.enquiry.destination || '')}" data-title="${esc(c.secondary.enquiry.title || c.secondary.label)}" data-message="${esc(c.secondary.enquiry.message || '')}">${esc(c.secondary.label)}</button>`
        : `<a class="btn btn--ghost-light btn--lg" href="${esc(c.secondary.href)}" data-campaign-cta="${esc(c.id)}">${esc(c.secondary.label)}</a>`;
      return `<div class="hero__slide" role="group" aria-roledescription="slide" data-slide-label="${esc(c.label)}" data-campaign="${esc(c.id)}">
        <div class="hero__media"><img src="${DS.img(c.image, 2000, 1250)}" alt="${esc(c.alt || '')}" decoding="async" fetchpriority="low" data-fallback="${esc(c.label)}"></div>
        <div class="container hero__content">
          <p class="eyebrow eyebrow--light">${esc(c.eyebrow)}</p>
          <h2 class="display hero__title">${esc(c.title)} <span class="em">${esc(c.accent)}</span></h2>
          <p class="hero__lede">${esc(c.lede)}</p>
          ${c.priceFrom ? `<p class="hero__price">From <strong>${fmtPHP(c.priceFrom)}</strong> per person · sample price</p>` : ''}
          <div class="hero__ctas"><a class="btn btn--lime btn--lg" href="${esc(c.primary.href)}" data-campaign-cta="${esc(c.id)}">${esc(c.primary.label)} ${DS.icon('arrowRight', 'arrow')}</a>${second}</div>
        </div>
      </div>`;
    }).join(''));

    const slides = $$('.hero__slide', track), n = slides.length;
    slides.forEach((s, i) => s.setAttribute('aria-label', `${i + 1} of ${n}: ${s.dataset.slideLabel}`));
    if (n < 2) return; // nothing to rotate

    /* ----- Controls ----- */
    controls.hidden = false;
    controls.innerHTML = `
      <div class="hero__tabs" role="group" aria-label="Choose a featured trip">
        ${slides.map((s, i) => `<button type="button" class="hero__tab" data-go="${i}" aria-label="Show slide ${i + 1} of ${n}: ${esc(s.dataset.slideLabel)}"${i === 0 ? ' aria-current="true"' : ''}><span class="hero__tab-label">${esc(s.dataset.slideLabel)}</span><span class="hero__tab-bar" aria-hidden="true"><i></i></span></button>`).join('')}
      </div>
      <div class="hero__nav">
        <button type="button" class="hero__btn" data-prev aria-label="Previous slide">${DS.icon('chevronLeft')}</button>
        <button type="button" class="hero__btn" data-toggle aria-label="Pause slideshow">${pauseIcon()}</button>
        <button type="button" class="hero__btn" data-next aria-label="Next slide">${DS.icon('chevronRight')}</button>
      </div>`;
    const tabs = $$('.hero__tab', controls), toggle = $('[data-toggle]', controls);
    DS.hydrateImages(track);

    /* ----- State ----- */
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let index = 0, userPaused = false, hoverPaused = false, focusPaused = false, hiddenPaused = false;
    root.style.setProperty('--hero-interval', (DS.heroIntervalMs || 7000) + 'ms');
    root.classList.toggle('is-autoplay', !reduce);

    function applyPause() {
      const paused = reduce || userPaused || hoverPaused || focusPaused || hiddenPaused;
      root.classList.toggle('is-paused', paused);
      // announce slide changes only when the user is driving the carousel
      track.setAttribute('aria-live', paused ? 'polite' : 'off');
    }
    function setInactive(s, on) { if (on) { s.setAttribute('aria-hidden', 'true'); s.inert = true; } else { s.removeAttribute('aria-hidden'); s.inert = false; } }

    function go(i, opts = {}) {
      const next = (i + n) % n; if (next === index && !opts.force) return;
      const prev = slides[index];
      prev.classList.remove('is-active'); prev.classList.add('is-leaving'); setInactive(prev, true);
      setTimeout(() => prev.classList.remove('is-leaving'), 800);
      index = next;
      const cur = slides[index];
      cur.classList.add('is-active'); setInactive(cur, false);
      tabs.forEach((t, j) => { if (j === index) t.setAttribute('aria-current', 'true'); else t.removeAttribute('aria-current'); });
      if (DS.motion && DS.motion.heroSlideIn) DS.motion.heroSlideIn(cur);
      if (opts.focusTab) tabs[index].focus();
    }
    slides.forEach((s, i) => { if (i > 0) setInactive(s, true); });

    /* Autoplay: advance when the active tab's progress animation completes */
    controls.addEventListener('animationend', e => { if (e.target.closest('.hero__tab') === tabs[index] && root.classList.contains('is-autoplay')) go(index + 1); });

    controls.addEventListener('click', e => {
      const t = e.target.closest('[data-go]'); if (t) { go(+t.dataset.go); return; }
      if (e.target.closest('[data-prev]')) go(index - 1);
      if (e.target.closest('[data-next]')) go(index + 1);
      if (e.target.closest('[data-toggle]')) {
        userPaused = !userPaused;
        toggle.setAttribute('aria-label', userPaused ? 'Play slideshow' : 'Pause slideshow');
        toggle.innerHTML = userPaused ? playIcon() : pauseIcon();
        applyPause();
      }
    });
    controls.addEventListener('keydown', e => {
      if (!e.target.closest('.hero__tab')) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1, { focusTab: true }); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1, { focusTab: true }); }
    });

    /* Pause while a mouse hovers, while focus is inside, and while the tab is hidden */
    root.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { hoverPaused = true; applyPause(); } });
    root.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') { hoverPaused = false; applyPause(); } });
    root.addEventListener('focusin', () => { focusPaused = true; applyPause(); });
    root.addEventListener('focusout', e => { if (!root.contains(e.relatedTarget)) { focusPaused = false; applyPause(); } });
    document.addEventListener('visibilitychange', () => { hiddenPaused = document.hidden; applyPause(); });

    /* Swipe on touch screens */
    let x0 = null, y0 = null;
    track.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    track.addEventListener('touchend', e => {
      if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0; x0 = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.2) go(index + (dx < 0 ? 1 : -1));
    }, { passive: true });

    applyPause();
    DS.heroCarousel = { go: i => go(i, { force: true }), get index() { return index; }, count: n, pause() { userPaused = true; applyPause(); } };
  }
  function pauseIcon() { return '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>'; }
  function playIcon() { return '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>'; }

  document.addEventListener('DOMContentLoaded', init);
})(window.DS);
