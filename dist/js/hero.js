/* ==========================================================================
   Elite Industries — homepage hero band

   Two behaviours, both of which have to be careful about what they cost:

     1. The rotating shipping mark — the ten catalogue names crossfading one
        into the next under the wordmark.
     2. The background video — 20.5 MB of it, which is why most of this file
        is about deciding whether to fetch it at all.

   Loaded with `defer` from the Scripts section, so it runs after the document
   is parsed and after intro.js (which is parser-blocking, and has therefore
   already made its own decision by the time this file exists).

   PROGRESSIVE
   -----------
   Nothing here creates content. The first product name is server-rendered into
   the mark, all ten are in the DOM in a visually-hidden list, the video sits on
   `data-src` and is simply never fetched, and the drawn ground behind it is
   pure CSS. With this file blocked the hero is a finished, static hero.
   ========================================================================== */
(function () {
  'use strict';

  var hero = document.querySelector('[data-hero]');
  if (!hero) { return; }

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  /* ====================================================================== */
  /* Video loading policy                                                   */
  /* ====================================================================== */
  /*
     Every threshold that governs the 20.5 MB fetch is in this one function and
     these three constants, so tuning it is a single edit rather than a hunt.
     The reasoning behind each is in wwwroot/video/README.md.
  */

  /* Below this the video is not offered at all: 20 MB over mobile data is not
     a fair default, and a 16:9 clip cropped to a portrait viewport is mostly
     the middle of the frame anyway. Matches the breakpoint in hero.css that
     restyles the drawn ground for exactly this case. */
  var MIN_VIEWPORT_W = 760;

  /* Megabits per second. Under this the clip would still be arriving long
     after the visitor has scrolled past the band it belongs to. */
  var MIN_DOWNLINK = 1.5;

  /* requestIdleCallback can wait indefinitely on a busy main thread. This caps
     it, and doubles as the plain-setTimeout delay where it is unavailable. */
  var IDLE_TIMEOUT_MS = 2500;

  function shouldSkipVideo() {
    if (reduceMotion) { return true; }
    if (window.innerWidth < MIN_VIEWPORT_W) { return true; }

    var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!conn) { return false; }

    /* An explicit request for less data. Nothing else in this function
       overrides it. */
    if (conn.saveData) { return true; }

    var effective = conn.effectiveType || '';
    if (effective === 'slow-2g' || effective === '2g') { return true; }

    /* downlink is 0 when the browser has no estimate yet — treated as unknown
       rather than as "infinitely slow", or a fresh page load on a fast
       connection would skip the video on the strength of a missing number. */
    if (typeof conn.downlink === 'number' && conn.downlink > 0 && conn.downlink < MIN_DOWNLINK) {
      return true;
    }

    return false;
  }


  /* ====================================================================== */
  /* Video                                                                  */
  /* ====================================================================== */

  var video = hero.querySelector('[data-hero-video]');
  var videoActive = false;
  var inView = true;

  function updatePlayback() {
    if (!videoActive || !video) { return; }

    if (inView && !document.hidden) {
      var started = video.play();
      if (started && typeof started.catch === 'function') {
        /* Refused autoplay is not a failure worth reporting: the drawn ground
           is still behind it and the band looks finished either way. */
        started.catch(function () {});
      }
    } else {
      video.pause();
    }
  }

  function watchViewport() {
    if (!('IntersectionObserver' in window)) { return; }

    /* Deliberately not the shared observer in reveal.js. That one fires once
       and unobserves — it is an entrance. This one has to keep firing in both
       directions for the life of the page, because its job is to stop a decoder
       that nobody is watching. Different lifecycle, different observer; the
       rule in theme.css is about entrances, and this is not one. */
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        inView = entry.isIntersecting;
        updatePlayback();
      });
    }, { threshold: 0.01 });

    observer.observe(hero);
  }

  function activateVideo() {
    if (!video || videoActive) { return; }

    var src = video.getAttribute('data-src');
    if (!src) { return; }

    /* Re-checked here rather than only at schedule time: the connection can
       change, or the window be resized, between load and idle. */
    if (shouldSkipVideo()) { return; }

    /* The attribute is in the markup as well. Some browsers gate autoplay on
       the property rather than the attribute, and a hero that pops audio is
       the single worst thing this band could do. */
    video.muted = true;

    video.addEventListener('playing', function () {
      hero.classList.add('is-video-playing');
    });

    /* Both, for the same reason intro.js listens twice: a failing <source>
       fires on the <source>, not on the <video>. Here the consequence is only
       that the crossfade never starts and the drawn ground stays — which is a
       perfectly good hero, so there is nothing to do but not add the class. */
    video.addEventListener('error', function () {});

    video.src = src;
    video.removeAttribute('data-src');
    video.load();

    videoActive = true;

    watchViewport();
    document.addEventListener('visibilitychange', updatePlayback);

    updatePlayback();
  }

  function scheduleVideo() {
    if (!video || shouldSkipVideo()) { return; }

    function whenIdle() {
      if (typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(activateVideo, { timeout: IDLE_TIMEOUT_MS });
      } else {
        window.setTimeout(activateVideo, IDLE_TIMEOUT_MS);
      }
    }

    /* After `load`, so the fetch cannot compete with the CSS, the three font
       families or the first paint — and after idle on top of that, so it does
       not compete with whatever the browser is still settling. */
    if (document.readyState === 'complete') {
      whenIdle();
    } else {
      window.addEventListener('load', whenIdle, { once: true });
    }
  }


  /* ====================================================================== */
  /* The rotating shipping mark                                             */
  /* ====================================================================== */
  /*
     Two absolutely-stacked layers in a slot that already reserves the width of
     the longest name and the height of one line, so a change is a crossfade
     inside a box that never moves. The outgoing name fades and lifts, the
     incoming one fades and rises into place.

     The names are read out of the visually-hidden list that is in the markup
     for assistive tech and crawlers — one source, server-rendered from
     ProductCatalog.ForNav, rather than a copy of the same ten strings in a data
     attribute that could drift out of step with it.
  */

  /* Long enough to read a three-word product name and look away; short enough
     that the whole range of ten cycles inside half a minute. */
  var NAME_MS = 2600;

  /* Must match the transition on .ei-hero-mark-name in hero.css. Used only to
     tidy the leaving layer back to its base state once it is invisible. */
  var SWAP_MS = 520;

  var mark = hero.querySelector('[data-hero-mark]');
  var layers = mark ? mark.querySelectorAll('[data-hero-name]') : [];
  var counter = mark ? mark.querySelector('[data-hero-count]') : null;
  var listItems = hero.querySelectorAll('[data-hero-names] li');

  var names = Array.prototype.map.call(listItems, function (li) {
    return (li.textContent || '').trim();
  }).filter(Boolean);

  var index = 0;
  var front = 0;
  var rotateTimer = null;
  var tidyTimer = null;

  function pad(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function setCount(i) {
    if (!counter) { return; }
    counter.textContent = pad(i + 1) + ' / ' + pad(names.length);

    /* A blink rather than a crossfade: the counter is two figures and a slash,
       and fading it would read as sluggish next to the name it belongs to. */
    counter.classList.add('is-tick');
    window.setTimeout(function () { counter.classList.remove('is-tick'); }, 180);
  }

  function show(i) {
    var leaving = layers[front];
    var arriving = layers[1 - front];

    arriving.textContent = names[i];
    arriving.classList.remove('is-out');

    /* Forces the base state (below the line, transparent) to be committed
       before .is-in is added. Without the read, a layer that was still marked
       .is-out in this frame would transition from the wrong side and the name
       would drop in from above instead of rising. */
    void arriving.offsetWidth;

    arriving.classList.add('is-in');

    leaving.classList.remove('is-in');
    leaving.classList.add('is-out');

    if (tidyTimer) { window.clearTimeout(tidyTimer); }
    tidyTimer = window.setTimeout(function () {
      leaving.classList.remove('is-out');
    }, SWAP_MS);

    front = 1 - front;
    setCount(i);
  }

  function tick() {
    index = (index + 1) % names.length;
    show(index);
    rotateTimer = window.setTimeout(tick, NAME_MS);
  }

  function startRotation() {
    if (rotateTimer) { return; }
    rotateTimer = window.setTimeout(tick, NAME_MS);
  }

  function stopRotation() {
    if (rotateTimer) { window.clearTimeout(rotateTimer); rotateTimer = null; }
  }

  function rotationCanRun() {
    /* Under reduced motion the first name — already in the markup — is the
       one that stays. One name, stated once, is the accessible form of a line
       whose only other content is the movement. */
    return !reduceMotion && layers.length === 2 && names.length > 1;
  }


  /* ====================================================================== */
  /* Start                                                                  */
  /* ====================================================================== */
  /*
     Held until the intro title card has lifted. Starting underneath it would
     spend the whole clip cycling names nobody can see, and the visitor would
     arrive at the hero mid-list rather than at 01 / 10.

     intro.js marks the document while the card is up and clears the mark on
     teardown, so the state is unambiguous by the time this deferred file runs:
     the attribute is there and the event is still coming, or it was never set
     and there is nothing to wait for.
  */

  /* If the card somehow never reports back, the hero starts anyway. It is a
     backstop for a case intro.js is already built to prevent, not a schedule. */
  var INTRO_BACKSTOP_MS = 9000;

  var started = false;

  function start() {
    if (started) { return; }
    started = true;

    if (rotationCanRun()) {
      startRotation();

      /* Nothing is burning frames for a tab nobody is looking at — and a
         rotation left running in the background arrives back on screen at an
         arbitrary point in the list. */
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) { stopRotation(); } else { startRotation(); }
      });
    }

    /* Scheduled last, so the 20 MB fetch is never queued while the intro clip
       is still decoding. */
    scheduleVideo();
  }

  if (document.documentElement.hasAttribute('data-ei-intro-running')) {
    document.addEventListener('intro:done', start, { once: true });
    window.setTimeout(start, INTRO_BACKSTOP_MS);
  } else {
    start();
  }
})();
