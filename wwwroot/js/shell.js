/* ==========================================================================
   Elite Industries — site shell behaviour

   Everything the masthead needs and nothing else: the scrolled state, the
   dropdown panels, the slide-in panel on narrow screens, and the document
   scroll lock the panel holds while it is open.

   The markup is already correct without this file. Every dropdown trigger is a
   real <button>, every destination is a real <a>, and the panels are laid out
   and reachable in the DOM — so with the script blocked or still loading the
   nav degrades to a visible list of links rather than to nothing. Nothing here
   creates content; it only manages state that CSS then draws.

   Loaded with `defer` from _Layout, alongside reveal.js. The two do not talk
   to each other and can load in either order.
   ========================================================================== */
(function () {
  'use strict';

  var header = document.querySelector('[data-hd]');
  if (!header) { return; }

  var nav = header.querySelector('[data-hd-nav]');
  var burger = header.querySelector('[data-hd-burger]');
  var scrim = header.querySelector('[data-hd-scrim]');

  var triggers = Array.prototype.slice.call(header.querySelectorAll('[data-hd-trigger]'));
  var tabLinks = Array.prototype.slice.call(header.querySelectorAll('[data-hd-tab]'));

  /* The breakpoint lives in shell.css too. It is repeated rather than read out
     of the stylesheet because the value has to be known before first paint and
     getComputedStyle on a custom property would tie the JS to a token that no
     other consumer needs. If one moves, move the other. */
  var mobileQuery = window.matchMedia('(max-width: 999.98px)');

  /* Hover-to-open is a pointer affordance. A touch device reports (hover:none)
     and would otherwise fire a synthetic mouseenter on tap, opening the panel
     and immediately toggling it shut again on the click that follows. */
  var pointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');


  /* ====================================================================== */
  /* Scroll lock                                                            */
  /* ====================================================================== */
  /*
     A counter, not a flag. The nav will not be the only thing that wants the
     document held still, and two booleans racing means whichever releases
     first unlocks the page while the other is still open. Published on window so anything else in the build
     shares this one counter instead of starting a second.
  */

  var lockDepth = 0;

  var scrollLock = window.eiScrollLock || {
    lock: function () {
      lockDepth += 1;
      document.documentElement.classList.add('ei-noscroll');
      document.body.classList.add('ei-noscroll');
    },
    release: function () {
      lockDepth = Math.max(0, lockDepth - 1);
      if (lockDepth === 0) {
        document.documentElement.classList.remove('ei-noscroll');
        document.body.classList.remove('ei-noscroll');
      }
    }
  };
  window.eiScrollLock = scrollLock;


  /* ====================================================================== */
  /* Scrolled state                                                         */
  /* ====================================================================== */
  /*
     Ten pixels rather than zero: a rubber-band overscroll on a trackpad can
     report a pixel or two of offset at rest, and a shadow flickering on and
     off at the top of the page is worse than no shadow at all.
  */

  var SCROLLED_AT = 10;
  var scrolled = false;
  var ticking = false;

  function readScroll() {
    var next = window.pageYOffset > SCROLLED_AT;
    if (next !== scrolled) {
      scrolled = next;
      header.classList.toggle('is-scrolled', scrolled);
    }
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    /* Passive, and coalesced into one rAF — the listener fires far more often
       than the class can meaningfully change. */
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(readScroll);
    }
  }, { passive: true });

  readScroll();


  /* ====================================================================== */
  /* Dropdowns                                                              */
  /* ====================================================================== */

  function panelFor(trigger) {
    return document.getElementById(trigger.getAttribute('aria-controls'));
  }

  function isOpen(trigger) {
    return trigger.getAttribute('aria-expanded') === 'true';
  }

  function setPanel(trigger, open) {
    var panel = panelFor(trigger);
    trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (panel) { panel.classList.toggle('is-open', open); }
  }

  /* `except` keeps the caller from closing the panel it is about to open —
     otherwise moving between two triggers would close and reopen the same one
     when the pointer crosses it. */
  function closeAllPanels(except) {
    triggers.forEach(function (t) {
      if (t !== except) { setPanel(t, false); }
    });
  }

  function openPanel(trigger) {
    closeAllPanels(trigger);
    setPanel(trigger, true);
  }

  triggers.forEach(function (trigger) {
    var tab = trigger.closest('.ei-hd-tab');

    /* A <button> already fires click on Enter and Space, so there is no
       separate key handler here: adding one would double-toggle the panel. */
    trigger.addEventListener('click', function () {
      if (isOpen(trigger)) { setPanel(trigger, false); } else { openPanel(trigger); }
    });

    if (!tab) { return; }

    tab.addEventListener('mouseenter', function () {
      if (pointerQuery.matches && !mobileQuery.matches) { openPanel(trigger); }
    });

    tab.addEventListener('mouseleave', function () {
      if (pointerQuery.matches && !mobileQuery.matches) { setPanel(trigger, false); }
    });

    /* Tabbing off the last link in a panel should close it. Checking the
       related target rather than a timer means a click that moves focus
       elsewhere in the panel does not trip it. */
    tab.addEventListener('focusout', function (event) {
      if (mobileQuery.matches) { return; }
      if (!event.relatedTarget || !tab.contains(event.relatedTarget)) {
        setPanel(trigger, false);
      }
    });
  });


  /* ====================================================================== */
  /* Slide-in panel                                                         */
  /* ====================================================================== */

  var navOpen = false;

  function setNav(open) {
    if (!nav || !burger || open === navOpen) { return; }
    navOpen = open;

    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (scrim) { scrim.classList.toggle('is-open', open); }

    if (open) { scrollLock.lock(); } else { scrollLock.release(); }

    /* Accordions left expanded would be the first thing visible next time the
       panel opens, which reads as the panel having remembered a state nobody
       set. Close them on the way out. */
    if (!open) { closeAllPanels(null); }
  }

  if (burger) {
    burger.addEventListener('click', function () { setNav(!navOpen); });
  }

  if (scrim) {
    scrim.addEventListener('click', function () { setNav(false); });
  }


  /* ====================================================================== */
  /* Global dismissal                                                       */
  /* ====================================================================== */

  document.addEventListener('click', function (event) {
    if (header.contains(event.target)) { return; }
    closeAllPanels(null);
    setNav(false);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') { return; }

    /* Escape returns focus to whatever opened the thing it closed. Without
       that a keyboard visitor is dropped at the top of the document and has to
       tab back to where they were. */
    var openTrigger = triggers.filter(isOpen)[0];

    if (openTrigger) {
      setPanel(openTrigger, false);
      openTrigger.focus();
      return;
    }

    if (navOpen) {
      setNav(false);
      if (burger) { burger.focus(); }
    }
  });


  /* ====================================================================== */
  /* Arrow keys across the tab row                                          */
  /* ====================================================================== */
  /*
     Tab still walks every link in order — this only adds the left/right
     movement a menubar is expected to have. Down opens a panel and lands on
     its first link, which is the other half of that expectation and saves a
     keyboard visitor a click they cannot make.
  */

  function focusTab(index) {
    var wrapped = (index + tabLinks.length) % tabLinks.length;
    tabLinks[wrapped].focus();
  }

  tabLinks.forEach(function (link, index) {
    link.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        focusTab(index + 1);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        focusTab(index - 1);
      } else if (event.key === 'ArrowDown' && link.hasAttribute('data-hd-trigger')) {
        event.preventDefault();
        openPanel(link);
        var panel = panelFor(link);
        var first = panel && panel.querySelector('a');
        if (first) { first.focus(); }
      }
    });
  });


  /* ====================================================================== */
  /* Breakpoint changes                                                     */
  /* ====================================================================== */
  /*
     Crossing the breakpoint re-parents the nav from a slide-in panel to a tab
     row and back. Any state carried across is wrong on the other side — an
     open accordion becomes an open dropdown floating over the page, and a
     locked document with no visible panel is unrecoverable — so everything is
     closed on the change rather than translated.
  */

  function onBreakpoint() {
    closeAllPanels(null);
    setNav(false);
  }

  if (typeof mobileQuery.addEventListener === 'function') {
    mobileQuery.addEventListener('change', onBreakpoint);
  } else if (typeof mobileQuery.addListener === 'function') {
    /* Safari below 14. */
    mobileQuery.addListener(onBreakpoint);
  }
})();
