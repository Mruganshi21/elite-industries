/* ==========================================================================
   Elite Industries — homepage intro title card

   Plays CompanyProfile.IntroVideoPath over the whole viewport, masthead
   included, on the first visit of a session, and then lifts to reveal the
   homepage underneath.

   WHY THIS FILE IS PARSER-BLOCKING
   --------------------------------
   It is loaded with no `defer` and no `async`, immediately after the overlay
   markup in Views/Home/_Intro.cshtml. That is deliberate. The card is in the
   markup from first paint so there is never a frame of homepage showing
   through before it appears — which means the decision NOT to show it has to
   be made before the browser paints, or a returning visitor gets a flash of
   the card on every navigation home. A deferred script runs after the document
   is parsed, which is far too late; an injected card is one frame too late in
   the other direction. Parser-blocking, right after the markup, is the only
   position where both cases are clean.

   HOW IT DECIDES
   --------------
     prefers-reduced-motion: reduce   never runs. intro.css also has it at
                                      display:none, so it is gone before this
                                      file is even fetched.
     sessionStorage ei.intro.seen     already shown this session, never runs.
                                      Every storage access is wrapped: private
                                      mode throws on read and on write, and a
                                      throw has to mean "just play it", never
                                      a crash that leaves the curtain down.
     otherwise                        runs, and is marked seen immediately —
                                      not when it ends, so a reload halfway
                                      through does not start it again.

   THE CURTAIN ALWAYS LIFTS
   ------------------------
   Every one of these ends at the same teardown, exactly once:

     the clip ends                     `ended`
     the visitor skips                 the skip button, or Escape
     autoplay is refused               the play() promise rejects
     the file is missing / 404         `error` on the <source> AND on the
                                       <video> — a <video> does NOT fire error
                                       when a <source> fails to resolve, the
                                       <source> does, so both are listened to
     the codec is unsupported          same pair of listeners
     the network stalls                `waiting` / `stalled` with no recovery
     the tab is backgrounded           `visibilitychange`
     anything not thought of           a hard timer: 7s to start with, tightened
                                       to the clip's real length + 1s once
                                       `loadedmetadata` reports it

   The teardown releases the decoder, clears every timer, marks the card seen,
   releases the shared scroll lock, removes the overlay from the DOM after the
   exit transition, and dispatches `intro:done` on document as the lift begins
   — hero.js holds its entrance until then, so the hero arrives with the
   curtain rather than having already played out behind it.
   ========================================================================== */
(function () {
  'use strict';

  var overlay = document.querySelector('[data-intro]');
  if (!overlay) { return; }

  var STORAGE_KEY = 'ei.intro.seen';

  /* Before metadata there is nothing to base a deadline on, so seven seconds:
     comfortably longer than the 5.1s clip plus a slow start, short enough that
     a visitor staring at a dead card is not left there. */
  var FALLBACK_MS = 7000;

  /* A buffer that has not moved for this long is not going to. The hard timer
     would eventually catch it anyway; this catches it sooner and without
     waiting out the whole deadline. */
  var STALL_MS = 3500;

  /* Must match the transition on .ei-intro in intro.css. Used only as the
     backstop for transitionend, which does not fire if the element is never
     painted or the transition is collapsed to nothing. */
  var EXIT_MS = 700;

  var video = overlay.querySelector('[data-intro-video]');
  var source = overlay.querySelector('[data-intro-source]');
  var skipBtn = overlay.querySelector('[data-intro-skip]');
  var soundBtn = overlay.querySelector('[data-intro-sound]');
  var bar = overlay.querySelector('[data-intro-bar]');


  /* ====================================================================== */
  /* Session storage                                                        */
  /* ====================================================================== */
  /*
     Both directions are wrapped. A private window throws on the read as
     readily as on the write, and neither failure is worth a broken homepage:
     an unreadable store means "not seen", an unwritable one means the card
     may play again next navigation, which is a far smaller problem than a
     card that never lifts.
  */

  function hasSeen() {
    try {
      return window.sessionStorage.getItem(STORAGE_KEY) === '1';
    } catch (err) {
      return false;
    }
  }

  function markSeen() {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, '1');
    } catch (err) {
      /* Nothing to do. The card simply shows again next time. */
    }
  }


  /* ====================================================================== */
  /* Scroll lock                                                            */
  /* ====================================================================== */
  /*
     The same shared depth counter shell.js publishes, not a second one. This
     file runs while the document is still being parsed, so shell.js — which is
     deferred — has not created it yet; whichever of the two gets there first
     creates it and the other reuses it (shell.js reads `window.eiScrollLock ||`
     for exactly this reason). Two independent locks race, and whichever
     releases first unlocks the page while the other still needs it held.
  */

  var scrollLock = window.eiScrollLock;

  if (!scrollLock) {
    var depth = 0;
    scrollLock = {
      lock: function () {
        depth += 1;
        document.documentElement.classList.add('ei-noscroll');
        document.body.classList.add('ei-noscroll');
      },
      release: function () {
        depth = Math.max(0, depth - 1);
        if (depth === 0) {
          document.documentElement.classList.remove('ei-noscroll');
          document.body.classList.remove('ei-noscroll');
        }
      }
    };
    window.eiScrollLock = scrollLock;
  }


  /* ====================================================================== */
  /* Skip outright                                                          */
  /* ====================================================================== */
  /*
     Synchronous, before the browser has had a chance to paint the card that is
     sitting in the markup a few lines above this script. Removing the node
     rather than hiding it also takes the <video> and its <source> with it, so
     a preloaded clip is never decoded on a visit that was not going to show it.
  */

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion || hasSeen()) {
    overlay.parentNode.removeChild(overlay);
    return;
  }


  /* ====================================================================== */
  /* Run                                                                    */
  /* ====================================================================== */

  /* hero.js reads this to know whether to wait for `intro:done` or to start
     immediately. It is set before any await point, so by the time the deferred
     scripts run the answer is already true or already absent — there is no
     window in which hero.js can ask and get a stale reply. */
  document.documentElement.setAttribute('data-ei-intro-running', '');

  markSeen();
  scrollLock.lock();

  var done = false;
  var hardTimer = null;
  var stallTimer = null;
  var exitTimer = null;
  var rafId = null;

  function clearTimers() {
    if (hardTimer) { window.clearTimeout(hardTimer); hardTimer = null; }
    if (stallTimer) { window.clearTimeout(stallTimer); stallTimer = null; }
    if (rafId) { window.cancelAnimationFrame(rafId); rafId = null; }
  }

  function armHardTimer(ms) {
    /* A media event can still arrive after teardown — dropping the source
       fires its own — and re-arming then would leave a timer running against
       a card that is already gone. */
    if (done) { return; }
    if (hardTimer) { window.clearTimeout(hardTimer); }
    hardTimer = window.setTimeout(finish, ms);
  }

  armHardTimer(FALLBACK_MS);


  /* ---- Progress -------------------------------------------------------- */
  /*
     Read off the element every frame rather than keyframed in CSS. A keyframe
     started at play() keeps sliding through a rebuffer and finishes while the
     clip is still going; this one stops when the clip stops, which is the only
     honest thing a progress bar can do.
  */

  function drawProgress() {
    rafId = null;
    if (done || !video || !bar) { return; }

    var length = video.duration;
    if (length && isFinite(length) && length > 0) {
      var ratio = Math.min(1, Math.max(0, video.currentTime / length));
      bar.style.transform = 'scaleX(' + ratio + ')';
    }

    rafId = window.requestAnimationFrame(drawProgress);
  }


  /* ---- Stall watchdog -------------------------------------------------- */

  function onStall() {
    if (stallTimer) { return; }
    stallTimer = window.setTimeout(finish, STALL_MS);
  }

  function onMoving() {
    if (stallTimer) { window.clearTimeout(stallTimer); stallTimer = null; }
  }


  /* ---- Teardown -------------------------------------------------------- */

  function finish() {
    if (done) { return; }
    done = true;

    clearTimers();
    document.documentElement.removeAttribute('data-ei-intro-running');
    markSeen();

    document.removeEventListener('keydown', onKey);
    document.removeEventListener('visibilitychange', onVisibility);
    document.removeEventListener('focusin', onFocusIn);

    /* Release the decoder rather than merely hiding the element. Dropping the
       source and calling load() is what actually tells the media stack to let
       go; pause() alone leaves a decoder and a buffered stream alive behind an
       overlay nobody can see. */
    if (video) {
      try {
        video.pause();
        if (source && source.parentNode) { source.parentNode.removeChild(source); }
        video.removeAttribute('src');
        video.load();
      } catch (err) {
        /* A browser that objects to being tidied up is not a reason to leave
           the curtain down. */
      }
    }

    overlay.classList.add('is-out');

    /* Dispatched as the lift starts, not when it ends: the hero's entrance is
       meant to be visible through the last of the fade. */
    document.dispatchEvent(new CustomEvent('intro:done'));

    var removed = false;

    function remove() {
      if (removed) { return; }
      removed = true;
      if (exitTimer) { window.clearTimeout(exitTimer); exitTimer = null; }
      overlay.removeEventListener('transitionend', onExitEnd);
      if (overlay.parentNode) { overlay.parentNode.removeChild(overlay); }
      scrollLock.release();
    }

    function onExitEnd(event) {
      /* Only the overlay's own opacity. A control inside it finishing a hover
         transition would otherwise tear the card off mid-lift. */
      if (event.target === overlay && event.propertyName === 'opacity') { remove(); }
    }

    overlay.addEventListener('transitionend', onExitEnd);

    /* transitionend never fires if the element was not painted, or if the
       transition was collapsed to nothing — and an overlay left in the DOM
       covering the page is the one failure this whole file exists to prevent. */
    exitTimer = window.setTimeout(remove, EXIT_MS);
  }


  /* ---- Input ----------------------------------------------------------- */

  function onKey(event) {
    if (event.key === 'Escape' || event.key === 'Esc') { finish(); }
  }

  function onVisibility() {
    /* A card played to a tab nobody is looking at has already been missed.
       Ending it means the page is ready the moment the visitor comes back,
       rather than showing them the tail of something they did not see start. */
    if (document.hidden) { finish(); }
  }

  /* Tab must not walk out of the card and into a masthead nobody can see. The
     document is not made inert — that would mean reaching into markup this
     file does not own — so focus is simply pulled back to the one control the
     card is built around. The listener comes off again in finish(), before the
     overlay is removed, so the node it points at is always still attached. */
  function onFocusIn(event) {
    if (!skipBtn) { return; }
    if (!overlay.contains(event.target)) { skipBtn.focus({ preventScroll: true }); }
  }

  document.addEventListener('keydown', onKey);
  document.addEventListener('visibilitychange', onVisibility);
  document.addEventListener('focusin', onFocusIn);

  if (skipBtn) {
    skipBtn.addEventListener('click', finish);
  }

  if (soundBtn && video) {
    soundBtn.addEventListener('click', function () {
      var next = video.muted;          /* muted now -> the visitor wants sound */
      video.muted = !next;
      soundBtn.setAttribute('aria-pressed', next ? 'true' : 'false');
      soundBtn.setAttribute('aria-label', next ? 'Mute intro' : 'Unmute intro');
    });
  }


  /* ---- Media ----------------------------------------------------------- */

  if (!video) {
    /* No element to play. Nothing to wait for. */
    finish();
    return;
  }

  video.addEventListener('loadedmetadata', function () {
    /* The real deadline, now that there is one. Duration plus a second of
       slack for a decode that starts late — tighter than the blind 7s, and it
       adapts if the clip is ever replaced with a longer one. */
    var length = video.duration;
    if (length && isFinite(length) && length > 0) {
      armHardTimer(length * 1000 + 1000);
    }
  });

  video.addEventListener('playing', function () {
    onMoving();
    overlay.classList.add('is-playing');

    /* The clip has an audio track, and no browser will autoplay audible video
       — so it starts muted and the control offers the sound. It appears only
       now, because until this fires there is nothing for it to unmute. */
    if (soundBtn) { soundBtn.hidden = false; }

    if (rafId === null) { drawProgress(); }
  });

  video.addEventListener('timeupdate', onMoving);
  video.addEventListener('waiting', onStall);
  video.addEventListener('stalled', onStall);
  video.addEventListener('ended', finish);

  /* Both. A <video> does not fire `error` when a <source> child fails to
     resolve — the <source> does, and it does not bubble. Listening only on the
     video is the classic way to end up with a card that sits there forever
     over a 404. */
  video.addEventListener('error', finish);
  if (source) { source.addEventListener('error', finish); }

  /* Focus the skip control so a keyboard visitor is on top of the card rather
     than somewhere behind it, and so Escape has an obvious partner. Without
     preventScroll, moving focus scrolls the locked document underneath. */
  if (skipBtn) {
    try {
      skipBtn.focus({ preventScroll: true });
    } catch (err) {
      skipBtn.focus();
    }
  }

  var started = video.play();

  /* Older browsers return undefined instead of a promise. */
  if (started && typeof started.catch === 'function') {
    started.catch(function () {
      /* Autoplay refused — muted or not, some configurations simply say no.
         There is no card without the clip, so lift rather than sit on a frozen
         first frame. */
      finish();
    });
  }
})();
