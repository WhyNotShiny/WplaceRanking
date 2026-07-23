// ui-chrome.js — sidebar collapse/resize, keyboard shortcuts, and the
// final app bootstrap on DOMContentLoaded. Loads last, since it's what
// actually kicks the app off once everything else is defined.

// ── Sidebar toggle ────────────────────────────────────────
function toggleSidebar() {
  const asideEl = document.getElementById('sidebar');
  const reopen  = document.getElementById('sidebar-reopen');
  const folded  = asideEl.classList.toggle('folded');
  reopen.style.display = folded ? 'flex' : 'none';
  // Repaint list and invalidate map after transition
  setTimeout(() => {
    if (vlist) { vlist._key = null; vlist._paint(); }
    map.invalidateSize();
  }, 270);
}

// Mobile starts with the sidebar collapsed so the map is the first thing seen.
if (window.matchMedia('(max-width: 768px)').matches) {
  document.getElementById('sidebar').classList.add('folded');
  document.getElementById('sidebar-reopen').style.display = 'flex';
}

// ── Sidebar resize handle ─────────────────────────────────
(function() {
  const handle  = document.getElementById('resize-handle');
  const asideEl = document.getElementById('sidebar');
  let dragging = false, startX = 0, startW = 0;

  handle.addEventListener('mousedown', e => {
    if (asideEl.classList.contains('folded')) return;
    dragging = true; startX = e.clientX; startW = asideEl.offsetWidth;
    handle.classList.add('active');
    asideEl.style.transition = 'none'; // disable during drag
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    e.preventDefault();
  });

  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    const newW = Math.min(620, Math.max(320, startW + e.clientX - startX));
    asideEl.style.width    = newW + 'px';
    asideEl.style.minWidth = newW + 'px';
    document.documentElement.style.setProperty('--sw', newW + 'px');
    if (vlist) { vlist._key = null; vlist._paint(); }
  });

  document.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    handle.classList.remove('active');
    asideEl.style.transition = ''; // restore
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    map.invalidateSize();
    try { localStorage.setItem('wplace-sidebar-width', asideEl.offsetWidth); } catch (e) {}
  });
})();

// ── Keyboard shortcuts ────────────────────────────────────
document.addEventListener('keydown', e => {
  const search = document.getElementById('searchinput');
  if (e.key === '/' && document.activeElement !== search) {
    e.preventDefault();
    switchTab('list');
    search.focus();
  } else if (e.key === 'Escape') {
    search.blur();
    map.closePopup();
    if (selectedRegionId != null) deselectRegion();
    if (selectedCountryId != null) deselectCountry();
    if (trendMode != null) closeTrendPanel();
  } else if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && document.activeElement !== search && SNAPSHOTS.length > 1) {
    e.preventDefault();
    stepSnapshot(e.key === 'ArrowLeft' ? -1 : 1);
  }
});

// ── App bootstrap ─────────────────────────────────────────
// Consolidated here (rather than left near discoverAndLoad's definition
// in data-loading.js) so there's one obvious place that shows everything
// that kicks off once the DOM is ready.

// Restores last-used view/sort choices (theme and sidebar width are
// restored even earlier, via the inline <head> script, since those affect
// layout/paint — these three only affect state read once render() first
// runs, so restoring them here, just before discoverAndLoad(), is early
// enough). Values are validated against the actual known keys before use,
// since localStorage can be edited or stale.
function restoreListPreferences() {
  try {
    const savedView = localStorage.getItem('wplace-view');
    if (savedView === 'regions' || savedView === 'countries') setView(savedView);
  } catch (e) {}
  try {
    const s = JSON.parse(localStorage.getItem('wplace-sort-region') || 'null');
    if (s && SORT_DEFAULTS.hasOwnProperty(s.key) && (s.dir === 'asc' || s.dir === 'desc')) {
      sortKey = s.key; sortDir = s.dir; updateSortUI();
    }
  } catch (e) {}
  try {
    const s = JSON.parse(localStorage.getItem('wplace-sort-country') || 'null');
    if (s && ['px','n','delta','avg'].includes(s.key) && (s.dir === 'asc' || s.dir === 'desc')) {
      ctySortKey = s.key; ctySortDir = s.dir; updateCtySortUI();
    }
  } catch (e) {}
}

document.addEventListener('DOMContentLoaded', () => {
  makeActivatable(document.getElementById('minfo-pill'), () => switchTab('info'));
  initTheme();
  restoreListPreferences();
  discoverAndLoad();
});