/* ==========================================================================
   Elite Industries — site behaviour

   Sections: navigation shell (masthead, mega menus, search), scroll reveal,
   stat counters, About Us tabs.
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* The one breakpoint the shell changes shape at. Matches the 1024px media
     query in nav.css — if you move one, move the other. */
  var DESKTOP = window.matchMedia('(min-width: 1024px)');

  var header = document.getElementById('siteHeader');
  var nav = document.getElementById('siteNav');
  var navToggle = document.getElementById('navToggle');
  var scrim = header ? header.querySelector('[data-mega-scrim]') : null;

  var megaButtons = Array.prototype.slice.call(
    document.querySelectorAll('[data-mega-btn]')
  );

  /* Body scroll is locked by two independent things — the mobile panel and the
     search overlay — so count the holders rather than clearing the style the
     moment either one closes. */
  var scrollLocks = 0;
  function lockScroll() {
    if (scrollLocks === 0) { document.body.style.overflow = 'hidden'; }
    scrollLocks++;
  }
  function unlockScroll() {
    scrollLocks = Math.max(0, scrollLocks - 1);
    if (scrollLocks === 0) { document.body.style.overflow = ''; }
  }

  /* ------------------------------------------------------- mega menus ----- */

  function panelFor(button) {
    return document.getElementById(button.getAttribute('aria-controls'));
  }

  function panelLinks(button) {
    var panel = panelFor(button);
    return panel
      ? Array.prototype.slice.call(panel.querySelectorAll('a'))
      : [];
  }

  function isOpen(button) {
    return button.getAttribute('aria-expanded') === 'true';
  }

  function closeMega(button) {
    button.setAttribute('aria-expanded', 'false');
  }

  function closeAllMega() {
    megaButtons.forEach(closeMega);
    syncScrim();
  }

  /* The scrim only makes sense on the desktop overlay. In the mobile panel the
     menu already covers the page. */
  function syncScrim() {
    if (!scrim) { return; }
    var anyOpen = DESKTOP.matches && megaButtons.some(isOpen);
    scrim.hidden = !anyOpen;
  }

  function openMega(button) {
    /* One panel at a time: two open cards would overlap, and a screen reader
       would announce two expanded menus. */
    megaButtons.forEach(function (other) {
      if (other !== button) { closeMega(other); }
    });
    button.setAttribute('aria-expanded', 'true');
    syncScrim();
  }

  function toggleMega(button) {
    if (isOpen(button)) {
      closeMega(button);
      syncScrim();
    } else {
      openMega(button);
    }
  }

  megaButtons.forEach(function (button, index) {
    button.addEventListener('click', function () { toggleMega(button); });

    button.addEventListener('keydown', function (e) {
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowLeft': {
          /* Left/right walks the tab row, the way a menubar behaves. Only on
             desktop — stacked, the panel reads as a vertical list. */
          if (!DESKTOP.matches) { return; }
          e.preventDefault();
          var step = e.key === 'ArrowRight' ? 1 : -1;
          var next = megaButtons[(index + step + megaButtons.length) % megaButtons.length];
          next.focus();
          break;
        }
        case 'ArrowDown': {
          e.preventDefault();
          openMega(button);
          var links = panelLinks(button);
          if (links.length) { links[0].focus(); }
          break;
        }
        case 'Escape':
          if (isOpen(button)) {
            e.preventDefault();
            closeMega(button);
            syncScrim();
          }
          break;
      }
    });
  });

  /* Arrow keys inside an open panel. Bound on the header so it also covers
     links added later, and so each panel does not need its own listener. */
  if (header) {
    header.addEventListener('keydown', function (e) {
      var link = e.target.closest ? e.target.closest('.mega a') : null;
      if (!link) { return; }

      var button = megaButtons.filter(function (b) {
        var panel = panelFor(b);
        return panel && panel.contains(link);
      })[0];
      if (!button) { return; }

      var links = panelLinks(button);
      var i = links.indexOf(link);

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          links[(i + 1) % links.length].focus();
          break;
        case 'ArrowUp':
          e.preventDefault();
          links[(i - 1 + links.length) % links.length].focus();
          break;
        case 'Home':
          e.preventDefault();
          links[0].focus();
          break;
        case 'End':
          e.preventDefault();
          links[links.length - 1].focus();
          break;
        case 'Escape':
          e.preventDefault();
          closeMega(button);
          syncScrim();
          button.focus();
          break;
      }
    });
  }

  /* Click anywhere outside the header closes the open panel. */
  document.addEventListener('click', function (e) {
    if (!header || header.contains(e.target)) { return; }
    closeAllMega();
  });

  if (scrim) {
    scrim.addEventListener('click', closeAllMega);
  }

  /* Focus leaving the header entirely — tabbing past the last link — closes it
     too, so the panel does not sit open behind unrelated content. */
  document.addEventListener('focusin', function (e) {
    if (!header || header.contains(e.target)) { return; }
    if (nav && nav.classList.contains('is-open')) { return; }   // mobile panel
    closeAllMega();
  });

  /* ------------------------------------------------ mobile slide-in nav --- */

  function setMobileNav(open) {
    if (!nav || !navToggle) { return; }
    var was = nav.classList.contains('is-open');
    if (was === open) { return; }

    nav.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');

    if (open) {
      lockScroll();
    } else {
      unlockScroll();
      closeAllMega();          // collapse the accordions behind it
    }
  }

  if (navToggle) {
    navToggle.addEventListener('click', function () {
      setMobileNav(!nav.classList.contains('is-open'));
    });
  }

  /* Following a link inside the panel should close it — but the section
     triggers are buttons, so they are not caught here. */
  if (nav) {
    nav.addEventListener('click', function (e) {
      var link = e.target.closest('a');
      if (link && !DESKTOP.matches) { setMobileNav(false); }
    });
  }

  /* --------------------------------------------------- search overlay ----- */

  var searchOverlay = document.getElementById('siteSearch');
  var searchToggle = document.getElementById('searchToggle');
  var searchClose = document.getElementById('searchClose');
  var searchInput = document.getElementById('searchInput');
  var searchReturnFocus = null;

  function searchFocusables() {
    if (!searchOverlay) { return []; }
    return Array.prototype.slice.call(
      searchOverlay.querySelectorAll('a[href], button, input:not([type="hidden"])')
    ).filter(function (el) { return el.offsetParent !== null; });
  }

  function openSearch() {
    if (!searchOverlay || !searchOverlay.hidden) { return; }
    closeAllMega();
    setMobileNav(false);

    /* Remember where focus came from so Escape can put it back — usually the
       search button itself. */
    searchReturnFocus = document.activeElement;
    searchOverlay.hidden = false;
    if (searchToggle) {
      searchToggle.setAttribute('aria-expanded', 'true');
      searchToggle.setAttribute('aria-label', 'Close search');
    }
    lockScroll();
    if (searchInput) { searchInput.focus(); }
  }

  function closeSearch() {
    if (!searchOverlay || searchOverlay.hidden) { return; }
    searchOverlay.hidden = true;
    if (searchToggle) {
      searchToggle.setAttribute('aria-expanded', 'false');
      searchToggle.setAttribute('aria-label', 'Open search');
    }
    unlockScroll();
    if (searchReturnFocus && document.contains(searchReturnFocus)) {
      searchReturnFocus.focus();
    }
    searchReturnFocus = null;
  }

  if (searchToggle) {
    searchToggle.addEventListener('click', function () {
      if (searchOverlay && searchOverlay.hidden) { openSearch(); } else { closeSearch(); }
    });
  }
  if (searchClose) { searchClose.addEventListener('click', closeSearch); }

  if (searchOverlay) {
    /* Clicking the backdrop, but not the panel, dismisses. */
    searchOverlay.addEventListener('mousedown', function (e) {
      if (e.target === searchOverlay) { closeSearch(); }
    });

    /* The overlay is aria-modal, so keep Tab inside it. */
    searchOverlay.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') { return; }
      var items = searchFocusables();
      if (!items.length) { return; }

      var first = items[0];
      var last = items[items.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  /* ----------------------------------------------- global Escape + resize - */

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') { return; }

    if (searchOverlay && !searchOverlay.hidden) { closeSearch(); return; }
    if (nav && nav.classList.contains('is-open')) {
      setMobileNav(false);
      if (navToggle) { navToggle.focus(); }
      return;
    }
    if (megaButtons.some(isOpen)) { closeAllMega(); }
  });

  /* Crossing the breakpoint leaves the shell in the wrong shape — the mobile
     panel would stay translated off-canvas on desktop, and vice versa. */
  function onBreakpointChange() {
    setMobileNav(false);
    closeAllMega();
  }
  if (DESKTOP.addEventListener) {
    DESKTOP.addEventListener('change', onBreakpointChange);
  } else if (DESKTOP.addListener) {
    DESKTOP.addListener(onBreakpointChange);          // Safari < 14
  }

  /* ------------------------------------------------------------- header --- */
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 10);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ------------------------------------------------------ scroll reveal --- */
  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    if (!('IntersectionObserver' in window) || reduceMotion) {
      Array.prototype.forEach.call(reveals, function (el) { el.classList.add('is-visible'); });
    } else {
      var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

      Array.prototype.forEach.call(reveals, function (el, i) {
        el.style.transitionDelay = (i % 4) * 90 + 'ms';
        revealObserver.observe(el);
      });
    }
  }

  /* ----------------------------------------------------- stat counters --- */
  function countUp(el) {
    var target = parseFloat(el.dataset.countTo);
    var suffix = el.dataset.countSuffix || '';
    var duration = 1600;
    var startedAt = null;

    function step(now) {
      if (startedAt === null) { startedAt = now; }
      var p = Math.min((now - startedAt) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString() + suffix;
      if (p < 1) { requestAnimationFrame(step); }
    }
    requestAnimationFrame(step);
  }

  var counters = document.querySelectorAll('[data-count-to]');
  if (counters.length) {
    if (!('IntersectionObserver' in window) || reduceMotion) {
      Array.prototype.forEach.call(counters, function (el) {
        el.textContent = Math.round(parseFloat(el.dataset.countTo)).toLocaleString() +
                         (el.dataset.countSuffix || '');
      });
    } else {
      var countObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) { return; }
          countObserver.unobserve(entry.target);
          countUp(entry.target);
        });
      }, { threshold: 0.4 });

      Array.prototype.forEach.call(counters, function (el) { countObserver.observe(el); });
    }
  }

  /* ------------------------------------------------------ About Us tabs --- */
  var tablist = document.querySelector('[role="tablist"]');
  if (tablist) {
    var tabs = Array.prototype.slice.call(tablist.querySelectorAll('.tab'));

    function selectTab(tab, focus) {
      tabs.forEach(function (t) {
        var selected = t === tab;
        t.setAttribute('aria-selected', String(selected));
        t.tabIndex = selected ? 0 : -1;
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) { panel.hidden = !selected; }
      });
      if (focus) { tab.focus(); }
      if (history.replaceState) {
        history.replaceState(null, '', '#' + tab.getAttribute('aria-controls'));
      }
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () { selectTab(tab, false); });
      tab.addEventListener('keydown', function (e) {
        var i = tabs.indexOf(tab);
        if (e.key === 'ArrowRight') { selectTab(tabs[(i + 1) % tabs.length], true); }
        else if (e.key === 'ArrowLeft') { selectTab(tabs[(i - 1 + tabs.length) % tabs.length], true); }
        else if (e.key === 'Home') { selectTab(tabs[0], true); }
        else if (e.key === 'End') { selectTab(tabs[tabs.length - 1], true); }
      });
    });

    // Deep links like /About#achievements open the right panel.
    var hash = window.location.hash.replace('#', '');
    var fromHash = hash && tabs.filter(function (t) {
      return t.getAttribute('aria-controls') === hash;
    })[0];
    if (fromHash) {
      selectTab(fromHash, false);
      window.requestAnimationFrame(function () {
        tablist.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      });
    }

    window.addEventListener('hashchange', function () {
      var h = window.location.hash.replace('#', '');
      var t = tabs.filter(function (x) { return x.getAttribute('aria-controls') === h; })[0];
      if (t) { selectTab(t, false); }
    });
  }
})();
