/* ==========================================================================
   Elite Industries — About page tabs

   Overview / Ideology / Achievements as an accessible tablist. The markup
   ships with every panel visible; this script hides the unselected ones, so
   with the script blocked the page is simply one long page.

   Deep links: /About#ideology (the header dropdown) and /About#overview (the
   homepage "Know more") open that panel on load, and a hashchange while on
   the page — clicking the header dropdown again — switches panels too.
   ========================================================================== */
(function () {
  'use strict';

  var tablist = document.querySelector('[data-ab-tabs]');
  if (!tablist) { return; }

  var bar = document.querySelector('[data-ab-tabbar]');
  var tabs = Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"]'));
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function panelFor(tab) {
    return document.getElementById(tab.getAttribute('aria-controls'));
  }

  function tabForId(id) {
    return tabs.filter(function (t) { return t.getAttribute('aria-controls') === id; })[0];
  }

  function select(tab, opts) {
    opts = opts || {};
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      var panel = panelFor(t);
      if (panel) { panel.hidden = !on; }
    });

    if (opts.focus) { tab.focus(); }

    if (opts.updateHash && history.replaceState) {
      history.replaceState(null, '', '#' + tab.getAttribute('aria-controls'));
    }

    /* A reveal inside a panel that was hidden never got measured, so anything
       now on screen is shown straight away rather than waiting for a scroll. */
    var panel = panelFor(tab);
    if (panel) {
      Array.prototype.forEach.call(panel.querySelectorAll('.ei-reveal:not(.is-in)'), function (el) {
        window.requestAnimationFrame(function () {
          var box = el.getBoundingClientRect();
          if (box.top < window.innerHeight && box.bottom > 0) { el.classList.add('is-in'); }
        });
      });
    }

    if (opts.scroll && bar) {
      window.requestAnimationFrame(function () {
        bar.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      });
    }
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () {
      select(tab, { updateHash: true });
    });

    tab.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowRight') { next = tabs[(i + 1) % tabs.length]; }
      else if (e.key === 'ArrowLeft') { next = tabs[(i - 1 + tabs.length) % tabs.length]; }
      else if (e.key === 'Home') { next = tabs[0]; }
      else if (e.key === 'End') { next = tabs[tabs.length - 1]; }
      if (next) {
        e.preventDefault();
        select(next, { focus: true, updateHash: true });
      }
    });
  });

  function fromHash(scroll) {
    var t = tabForId(window.location.hash.replace('#', ''));
    if (t) { select(t, { scroll: scroll }); return true; }
    return false;
  }

  if (!fromHash(true)) { select(tabs[0]); }

  window.addEventListener('hashchange', function () { fromHash(true); });
})();
