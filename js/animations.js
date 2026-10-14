/* ==========================================================================
   Dreamspree — Motion layer (GSAP 3 + ScrollTrigger)
   Loaded last and deferred. Everything degrades gracefully: if GSAP is not
   available nothing is hidden, and prefers-reduced-motion disables motion.
   ========================================================================== */
(function (DS) {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined';
  const $$ = DS.$$;

  // Fallback hooks keep app behaviour working without GSAP (instant transitions)
  const fallback = {
    expand: p => { p.style.height = 'auto'; },
    collapse: p => { p.style.height = '0px'; },
    tabIn: () => {}, modalIn: (r, d, cb) => cb && cb(), modalOut: (r, d, cb) => cb && cb(), drawerIn: (d, cb) => cb && cb(), drawerOut: (d, cb) => cb && cb(),
    toastIn: () => {}, toastOut: (t, cb) => cb && cb(), pop: () => {}, shake: () => {}, countTo: (el, v, fmt) => { el.textContent = fmt ? fmt(v) : v; }, revealNew: () => {}, stepIn: () => {}, stepOut: (el, cb) => cb && cb(), progress: (bar, pct) => { bar.style.width = pct + '%'; }
  };
  if (!hasGsap || reduce) { DS.motion = fallback; document.documentElement.classList.add(reduce ? 'reduced-motion' : 'no-gsap'); return; }

  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: 'power3.out', duration: 0.8 });
  const isMobile = () => window.matchMedia('(max-width: 767px)').matches;

  /* ---------- Hooks used by app.js, packages.js, visa.js, trip.js ---------- */
  DS.motion = {
    expand(panel) { gsap.killTweensOf(panel); gsap.set(panel, { height: 'auto' }); gsap.from(panel, { height: 0, duration: 0.45, ease: 'power2.inOut', onComplete: () => ScrollTrigger.refresh() }); gsap.from(panel.firstElementChild, { autoAlpha: 0, y: -6, duration: 0.4, delay: 0.1 }); },
    collapse(panel) { gsap.killTweensOf(panel); gsap.to(panel, { height: 0, duration: 0.35, ease: 'power2.inOut', onComplete: () => ScrollTrigger.refresh() }); },
    tabIn(panel) { gsap.fromTo(panel, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45, clearProps: 'transform,opacity' }); },
    modalIn(root, dialog, cb) { gsap.fromTo(root.querySelector('.modal__backdrop'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }); gsap.fromTo(dialog, { autoAlpha: 0, y: isMobile() ? 40 : 24, scale: isMobile() ? 1 : 0.97 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.45, ease: 'power3.out', clearProps: 'transform', onComplete: cb }); },
    modalOut(root, dialog, cb) { gsap.to(dialog, { autoAlpha: 0, y: 16, duration: 0.25, ease: 'power2.in' }); gsap.to(root.querySelector('.modal__backdrop'), { autoAlpha: 0, duration: 0.3, onComplete: () => { gsap.set([dialog, root.querySelector('.modal__backdrop')], { clearProps: 'all' }); cb && cb(); } }); },
    drawerIn(drawer, cb) { const p = drawer.querySelector('.drawer__panel'); gsap.fromTo(drawer.querySelector('.drawer__backdrop'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }); gsap.fromTo(p, { xPercent: 100 }, { xPercent: 0, duration: 0.45, ease: 'power3.out', onComplete: cb }); gsap.from(p.querySelectorAll('.drawer__nav a'), { autoAlpha: 0, x: 24, stagger: 0.05, duration: 0.4, delay: 0.15 }); },
    drawerOut(drawer, cb) { const p = drawer.querySelector('.drawer__panel'); gsap.to(p, { xPercent: 100, duration: 0.3, ease: 'power2.in' }); gsap.to(drawer.querySelector('.drawer__backdrop'), { autoAlpha: 0, duration: 0.3, onComplete: () => { gsap.set([p, drawer.querySelector('.drawer__backdrop')], { clearProps: 'all' }); cb && cb(); } }); },
    toastIn(t) { gsap.from(t, { autoAlpha: 0, y: 20, scale: 0.96, duration: 0.4 }); },
    toastOut(t, cb) { gsap.to(t, { autoAlpha: 0, y: 10, duration: 0.3, onComplete: cb }); },
    pop(el) { gsap.fromTo(el, { scale: 0.8 }, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.45)', clearProps: 'transform' }); },
    shake(el) { if (!el) return; gsap.fromTo(el, { x: -6 }, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)', clearProps: 'transform' }); },
    countTo(el, value, fmt) { const from = parseFloat(el.dataset.value || 0) || 0; const obj = { v: from }; el.dataset.value = value; gsap.to(obj, { v: value, duration: 0.6, ease: 'power2.out', onUpdate: () => { el.textContent = fmt ? fmt(obj.v) : Math.round(obj.v); } }); gsap.fromTo(el, { scale: 1.06, color: '#148f8c' }, { scale: 1, color: '', duration: 0.6, clearProps: 'color,transform' }); },
    revealNew(container) { const items = container.children; if (!items.length) return; gsap.fromTo(items, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, stagger: 0.07, duration: 0.7, clearProps: 'transform', onComplete: () => ScrollTrigger.refresh() }); },
    stepIn(el) { gsap.fromTo(el, { autoAlpha: 0, x: 32 }, { autoAlpha: 1, x: 0, duration: 0.5, clearProps: 'transform' }); gsap.from(el.querySelectorAll('[data-step-item]'), { autoAlpha: 0, y: 14, stagger: 0.05, duration: 0.45, delay: 0.1 }); },
    stepOut(el, cb) { gsap.to(el, { autoAlpha: 0, x: -24, duration: 0.3, ease: 'power2.in', onComplete: () => { gsap.set(el, { clearProps: 'all' }); cb && cb(); } }); },
    progress(bar, pct) { gsap.to(bar, { width: pct + '%', duration: 0.6, ease: 'power2.out' }); }
  };

  /* ---------- Hero ---------- */
  function hero() {
    const lines = $$('[data-hero="line"]'); if (!lines.length) return;
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('.hero__media img', { scale: 1.16, duration: 1.8, ease: 'power2.out' }, 0)
      .from('[data-hero="eyebrow"]', { autoAlpha: 0, y: 16, duration: 0.6 }, 0.2)
      .from(lines, { yPercent: 110, duration: 0.9, stagger: 0.12 }, 0.3)
      .from('[data-hero="lede"]', { autoAlpha: 0, y: 20, duration: 0.7 }, 0.75)
      .from('[data-hero="ctas"] > *', { autoAlpha: 0, y: 16, stagger: 0.08, duration: 0.6 }, 0.95)
      .from('[data-hero="search"]', { autoAlpha: 0, y: 40, duration: 0.8 }, 1.05);
    // Subtle parallax on the hero image while scrolling
    gsap.to('.hero__media img', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  }

  /* ---------- Page-level hero (inner pages) ---------- */
  function pageHero() {
    const h = document.querySelector('.hero--page'); if (!h) return;
    gsap.from(h.querySelectorAll('.hero__content > *'), { autoAlpha: 0, y: 18, stagger: 0.1, duration: 0.7, delay: 0.1 });
    gsap.from(h.querySelector('.hero__media img'), { scale: 1.12, duration: 1.6, ease: 'power2.out' });
  }

  /* ---------- Scroll reveals ---------- */
  function reveals() {
    $$('[data-reveal]').forEach(el => {
      gsap.fromTo(el, { autoAlpha: 0, y: 32 }, { autoAlpha: 1, y: 0, duration: 0.9, clearProps: 'transform', scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
    });
    $$('[data-stagger]').forEach(group => {
      const run = () => {
        const items = Array.from(group.children).filter(c => !c.dataset.animated);
        if (!items.length) return;
        items.forEach(i => i.dataset.animated = '1');
        gsap.fromTo(items, { autoAlpha: 0, y: 36 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: { each: 0.08, from: 'start' }, clearProps: 'transform', scrollTrigger: { trigger: group, start: 'top 92%', once: true } });
      };
      run();
      // Content rendered later (e.g. after a loading state) is picked up too
      new MutationObserver(() => requestAnimationFrame(run)).observe(group, { childList: true });
    });
    // Image mask reveal for large editorial media
    $$('.media-stack__main, .cta-band > img, .gallery__item:first-child').forEach(el => {
      gsap.fromTo(el, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 1.1, ease: 'power3.inOut', scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
    });
  }

  /* ---------- Micro-interactions ---------- */
  function micro() {
    // Magnetic-lite hover on primary buttons (desktop pointer only)
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    document.addEventListener('pointermove', e => {
      const b = e.target.closest('.btn--lg, .btn--primary, .btn--lime, .btn--teal'); if (!b) return;
      const r = b.getBoundingClientRect(); const dx = (e.clientX - (r.left + r.width / 2)) / r.width, dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      gsap.to(b, { x: dx * 6, y: dy * 4 - 2, duration: 0.3, overwrite: 'auto' });
    });
    document.addEventListener('pointerout', e => { const b = e.target.closest('.btn--lg, .btn--primary, .btn--lime, .btn--teal'); if (b && !b.contains(e.relatedTarget)) gsap.to(b, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)', overwrite: 'auto', clearProps: 'transform' }); });
  }

  /* ---------- Header ---------- */
  function header() {
    const h = document.querySelector('.site-header'); if (!h || h.classList.contains('site-header--over')) return;
    gsap.from(h, { y: -16, autoAlpha: 0, duration: 0.6, clearProps: 'all' });
  }

  let booted = false;
  document.addEventListener('DOMContentLoaded', init);
  if (document.readyState !== 'loading') init();
  function init() {
    if (booted) return; booted = true;
    document.documentElement.classList.add('gsap-ready');
    hero(); pageHero(); reveals(); micro(); header();
    window.addEventListener('load', () => ScrollTrigger.refresh());
    document.addEventListener('ds:refresh', () => ScrollTrigger.refresh());
  }
})(window.DS);
