// map-overlay.js — the selection box, country highlight wash, and the
// two heatmap display toggles (base-map-only, and cumulative-vs-change
// mode). Requires map-core.js (loaded first).

// ── Selection box — a crisp vector rectangle around the selected region's
// exact grid cell, so it stays sharp at any zoom instead of a blurry raster dot.
function updateSelectionMarker(regionId) {
  if (selectionRect) { map.removeLayer(selectionRect); selectionRect = null; }
  if (regionId == null) return;
  selectionRect = L.rectangle(regionCellBounds(regionId), {
    pane: 'selectionPane', color: SELECTION_COLOR, weight: 3,
    fill: true, fillColor: SELECTION_COLOR, fillOpacity: 0.25,
    interactive: false
  }).addTo(map);
}

// ── Country highlight — a translucent white wash over every region cell
// belonging to a country, built the same way as the base heatmap image so
// it lines up pixel-for-pixel regardless of how many regions are involved.
function buildCountryHighlightCanvas(countryId) {
  const os = document.createElement('canvas');
  os.width = os.height = 512;
  const ctx = os.getContext('2d');
  const img = ctx.createImageData(512, 512); // fully transparent by default
  const d = img.data;
  for (const row of (countryRegionsMap.get(countryId) || [])) {
    const x = (row.regionId-1) % 512, y = (row.regionId-1)/512|0;
    if (x<0||x>511||y<0||y>511) continue;
    const idx = (y*512+x)*4;
    d[idx]=255; d[idx+1]=255; d[idx+2]=255; d[idx+3]=150;
  }
  ctx.putImageData(img, 0, 0);
  return os;
}

function setCountryHighlight(countryId) {
  buildCountryHighlightCanvas(countryId).toBlob(blob => {
    if (!blob) return;
    if (selectedCountryId !== countryId) return; // selection changed/cleared while this was building
    const url = URL.createObjectURL(blob);
    if (countryHighlightOverlay) map.removeLayer(countryHighlightOverlay);
    countryHighlightOverlay = L.imageOverlay(url, WORLD_BOUNDS_MAIN, {
      pane: 'countryHighlightPane', interactive: false, className: 'filled-overlay'
    }).addTo(map);
    if (countryHighlightBlobUrl) URL.revokeObjectURL(countryHighlightBlobUrl);
    countryHighlightBlobUrl = url;
  }, 'image/png');
}

function deselectCountry() {
  clearCountryHighlight();
  selectedCountryId = null;
  updateUrlParams({ country: null });
  if (currentView === 'countries') filterCountriesView(document.getElementById('searchinput').value);
}

function deselectRegion() {
  selectedRegionId = null;
  updateUrlParams({ region: null });
  updateSelectionMarker(null);
  if (vlist) { vlist._key = null; vlist._paint(); }
}

function clearCountryHighlight() {
  if (countryHighlightOverlay) { map.removeLayer(countryHighlightOverlay); countryHighlightOverlay = null; }
}

// On mobile the sidebar is a full-screen overlay — close it after picking
// a region or country so the fly animation and map are actually visible.
function closeMobileSidebarIfNeeded() {
  if (window.matchMedia('(max-width: 768px)').matches) {
    const asideEl = document.getElementById('sidebar');
    if (asideEl && !asideEl.classList.contains('folded')) toggleSidebar();
  }
}

// ── Heatmap-only mode — hides the base map tiles + place labels, leaving
// just the coloured region squares (and any highlight/selection indicators).
function toggleHeatmapOnly() {
  heatmapOnly = !heatmapOnly;
  document.getElementById('map').classList.toggle('heatmap-only', heatmapOnly);
  const btn = document.getElementById('heatmap-toggle');
  btn.classList.toggle('on', heatmapOnly);
  const label = heatmapOnly ? 'Show the base map and labels again' : 'Show only the coloured region squares';
  btn.title = label;
  btn.setAttribute('aria-label', label);
}

// Hides just the coloured pixel-count overlay (opacity only, no rebuild
// needed) while keeping the base map, labels, and any country highlight —
// useful for seeing which regions a country actually spans without the
// heatmap colouring obscuring region boundaries.
function toggleHeatmapVisibility() {
  heatmapVisible = !heatmapVisible;
  filledOverlays.forEach(o => o.setOpacity(heatmapVisible ? 1 : 0));
  const btn = document.getElementById('heatmap-vis-toggle');
  btn.classList.toggle('off', !heatmapVisible);
  const label = heatmapVisible ? 'Hide the pixel-count heatmap (keep the base map)' : 'Show the pixel-count heatmap';
  btn.title = label;
  btn.setAttribute('aria-label', label);
  btn.innerHTML = heatmapVisible ? ICON_EYE : ICON_EYE_OFF;
}

// ── Heatmap mode (cumulative total vs. change since previous snapshot) ──
// A purely cumulative map looks nearly identical for long stretches once
// a region is mostly painted in — this mode instead colours each region
// by how much it changed relative to the immediately preceding snapshot,
// surfacing where activity is happening *now* rather than historically.
let heatmapMode = 'cumulative'; // 'cumulative' | 'change'

function setHeatmapMode(mode) {
  if (mode !== 'cumulative' && mode !== 'change') return;
  const changed = mode !== heatmapMode;
  heatmapMode = mode;
  document.querySelectorAll('.hms-opt').forEach(btn => btn.classList.toggle('on', btn.dataset.mode === mode));
  if (changed) refreshHeatmapOverlay();

  // Keep the sidebar in sync — switching the map to Change also ranks
  // both leaderboards by Change, and switching back to Total restores
  // ranking by Pixels, so the map and lists always tell the same story
  // instead of two disconnected controls that just happen to share data.
  const wantKey = mode === 'change' ? 'delta' : 'px';
  if (sortKey !== wantKey) {
    sortKey = wantKey;
    sortDir = SORT_DEFAULTS[wantKey];
    updateSortUI();
    if (rowsData.length) applyRegionSort(true);
  }
  if (ctySortKey !== wantKey) {
    ctySortKey = wantKey;
    ctySortDir = 'desc';
    updateCtySortUI();
    if (rowsData.length) applyCountrySort(true);
  }
}

// Rebuilds the map overlay for whichever mode is active. In 'change' mode
// this needs the immediately preceding snapshot's rows, downloading and
// caching them (same fetchCSV/parseCSVAsync/snapshotCache pipeline as
// everywhere else) if they aren't already cached from browsing dates or
// viewing a trend panel.
async function refreshHeatmapOverlay() {
  if (!rowsData.length) return;
  const token = ++heatmapRefreshToken;
  const caption = document.getElementById('mlegend-caption');

  if (heatmapMode === 'cumulative') {
    caption.textContent = '';
    setFilledOverlay(buildOffscreen(rowsData, maxPxGlobal));
    return;
  }

  caption.textContent = 'Loading comparison…';

  let info;
  try {
    info = await getRegionDeltaMap();
  } catch (err) {
    if (token !== heatmapRefreshToken) return;
    caption.textContent = 'Comparison failed to load';
    return;
  }
  if (token !== heatmapRefreshToken) return;

  if (!info) {
    // Earliest available snapshot — nothing earlier exists to diff against.
    caption.textContent = 'No earlier snapshot';
    setFilledOverlay(buildOffscreen([], 1));
    return;
  }

  const deltaRows = rowsData.map(r => ({ regionId: r.regionId, pixels: info.map.get(r.regionId) || 0 }));
  const maxDelta = deltaRows.reduce((m, r) => Math.max(m, r.pixels), 0) || 1;
  caption.textContent = `since ${fmtDate(info.prevDate)}`;
  setFilledOverlay(buildOffscreen(deltaRows, maxDelta));
}