/* ==========================================================================
   Elite Industries — Use Cases photo wall

   1. 3D tilt: each tile leans toward the pointer and a glare follows it.
      Fine pointers only, and never under prefers-reduced-motion.
   2. Viewer: a tile with a photo opens it large in the <dialog>.
   ========================================================================== */
(function () {
  'use strict';

  var grid = document.querySelector('[data-uc-grid]');
  if (!grid) { return; }

  var canTilt = window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
                !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Tilt -------------------------------------------------------------- */

  if (canTilt) {
    Array.prototype.forEach.call(grid.querySelectorAll('[data-uc-tilt]'), function (tile) {
      var frame = 0;

      tile.addEventListener('pointermove', function (e) {
        if (frame) { return; }
        frame = window.requestAnimationFrame(function () {
          frame = 0;
          var box = tile.getBoundingClientRect();
          var x = (e.clientX - box.left) / box.width;   /* 0..1 */
          var y = (e.clientY - box.top) / box.height;   /* 0..1 */
          tile.style.setProperty('--uc-rx', ((0.5 - y) * 14).toFixed(2) + 'deg');
          tile.style.setProperty('--uc-ry', ((x - 0.5) * 16).toFixed(2) + 'deg');
          tile.style.setProperty('--uc-gx', (x * 100).toFixed(1) + '%');
          tile.style.setProperty('--uc-gy', (y * 100).toFixed(1) + '%');
        });
      });

      tile.addEventListener('pointerenter', function () { tile.classList.add('is-tilting'); });

      tile.addEventListener('pointerleave', function () {
        tile.classList.remove('is-tilting');
        tile.style.removeProperty('--uc-rx');
        tile.style.removeProperty('--uc-ry');
      });
    });
  }

  /* ---- Viewer ------------------------------------------------------------ */

  var viewer = document.querySelector('[data-uc-viewer]');
  if (!viewer || typeof viewer.showModal !== 'function') { return; }

  var img = viewer.querySelector('[data-uc-viewer-img]');
  var name = viewer.querySelector('[data-uc-viewer-name]');

  grid.addEventListener('click', function (e) {
    var tile = e.target.closest('button[data-uc-src]');
    if (!tile) { return; }
    img.src = tile.getAttribute('data-uc-src');
    img.alt = tile.getAttribute('data-uc-name');
    name.textContent = tile.getAttribute('data-uc-name');
    viewer.showModal();
  });

  /* A click on the backdrop (the dialog itself, outside the figure) closes. */
  viewer.addEventListener('click', function (e) {
    if (e.target === viewer) { viewer.close(); }
  });
})();
