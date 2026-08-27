/* ==========================================================================
   Elite Industries — scroll reveal + count-up

   Two behaviours the whole page shares, so no section has to build its own
   IntersectionObserver:

     .ei-reveal        fades and slides in once, when it first scrolls in
     [data-count-to]   counts a number up from 0 once, when it first scrolls in

   Both fire ONCE. The element is unobserved the moment it lands, so scrolling
   back up and down again does not replay anything — a counter that re-runs
   every time it passes the viewport reads as a broken page, not a flourish.

   Loaded with `defer` from the layout. Everything is progressive: with the
   script absent or an observer unavailable, .ei-reveal blocks are made visible
   and counters print their final value, so the page is never blank or stuck
   at zero.
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canObserve = 'IntersectionObserver' in window;

  /* ====================================================================== */
  /* Reveal                                                                 */
  /* ====================================================================== */

  var reveals = document.querySelectorAll('.ei-reveal');

  function showAll() {
    Array.prototype.forEach.call(reveals, function (el) { el.classList.add('is-in'); });
  }

  if (!reveals.length) {
    /* nothing to do */
  } else if (reduceMotion || !canObserve) {
    showAll();
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        entry.target.classList.add('is-in');
        revealObserver.unobserve(entry.target);
      });
    }, {
      /* Negative bottom margin holds the entrance back until the block is
         genuinely in the viewport rather than a pixel past its edge. */
      rootMargin: '0px 0px -12% 0px',
      threshold: 0.05
    });

    Array.prototype.forEach.call(reveals, function (el) { revealObserver.observe(el); });

    /* A block already in view at load — the hero's neighbours on a tall
       screen — would otherwise wait for a scroll that may never come. The
       observer fires on registration for those, so this is only a backstop
       for the case where the page is restored mid-scroll. */
    window.addEventListener('load', function () {
      Array.prototype.forEach.call(reveals, function (el) {
        var box = el.getBoundingClientRect();
        if (box.top < window.innerHeight && box.bottom > 0) { el.classList.add('is-in'); }
      });
    });
  }

  /* ====================================================================== */
  /* Count-up                                                               */
  /* ====================================================================== */
  /*
     <span data-count-to="27" data-count-dur="1800">27</span>

     The element's text content is the final value and is present in the HTML,
     so it is correct before, during and after — a crawler and a visitor with
     no JS both read the real figure. The animation only overwrites it while
     it runs.
  */

  var counters = document.querySelectorAll('[data-count-to]');

  function formatNumber(n) {
    return n.toLocaleString('en-IN');
  }

  function runCounter(el) {
    var target = parseFloat(el.getAttribute('data-count-to'));
    if (isNaN(target)) { return; }

    var duration = parseInt(el.getAttribute('data-count-dur'), 10) || 1800;
    var started = null;

    /* Ease-out cubic: fast off the mark, settling onto the final figure
       rather than stopping dead on it. */
    function ease(t) { return 1 - Math.pow(1 - t, 3); }

    function frame(now) {
      if (started === null) { started = now; }
      var progress = Math.min((now - started) / duration, 1);
      var value = Math.round(ease(progress) * target);

      el.textContent = formatNumber(value);

      if (progress < 1) {
        window.requestAnimationFrame(frame);
      } else {
        el.textContent = formatNumber(target);
      }
    }

    window.requestAnimationFrame(frame);
  }

  if (!counters.length) {
    /* nothing to do */
  } else if (reduceMotion || !canObserve) {
    /* Leave the markup's final value exactly as authored. */
  } else {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        countObserver.unobserve(entry.target);
        runCounter(entry.target);
      });
    }, { threshold: 0.4 });

    Array.prototype.forEach.call(counters, function (el) {
      /* Start from zero only once the counter is registered, so the figure is
         never blanked on a browser that fails before the observer attaches. */
      el.textContent = '0';
      countObserver.observe(el);
    });
  }
})();
