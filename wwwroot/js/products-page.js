/* ==========================================================================
   Elite Industries — Products listing: category filter

   The pills ship hidden; this reveals them and filters the grid in place.
   The help tile (no data-pl-category) is never filtered out. With the script
   blocked the page is the full list and the pills are never shown.
   ========================================================================== */
(function () {
  'use strict';

  var group = document.querySelector('[data-pl-filters]');
  var grid = document.querySelector('[data-pl-grid]');
  if (!group || !grid) { return; }

  var buttons = Array.prototype.slice.call(group.querySelectorAll('[data-pl-filter]'));
  var cells = Array.prototype.slice.call(grid.querySelectorAll('[data-pl-category]'));
  var count = document.querySelector('[data-pl-count]');
  var total = cells.length;
  var originalCount = count ? count.innerHTML : '';

  group.hidden = false;

  function apply(key) {
    var shown = 0;

    buttons.forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-pl-filter') === key ? 'true' : 'false');
    });

    cells.forEach(function (cell) {
      var match = key === 'all' || cell.getAttribute('data-pl-category') === key;
      cell.hidden = !match;
      if (match) {
        shown += 1;
        /* A card revealed by the filter may never have been observed on screen. */
        cell.classList.add('is-in');
      }
    });

    if (count) {
      count.innerHTML = key === 'all' ? originalCount : 'Showing ' + shown + ' of ' + total;
    }
  }

  buttons.forEach(function (b) {
    b.addEventListener('click', function () { apply(b.getAttribute('data-pl-filter')); });
  });
})();
