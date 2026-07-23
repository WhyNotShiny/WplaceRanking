// map-selection.js — region fly-to/selection and the map's click/popup
// event handlers. Requires map-core.js (loaded first).

// ── flyTo ─────────────────────────────────────────────────
// Single-region fly target: zoomed out slightly from a "block-level" zoom so
// a selected region reads in more of its surrounding context.
const REGION_FLY_ZOOM = 9;
const REGION_FLY_DURATION = 0.5;

// `suppressPopupClose` guards against the map's own popup-swap mechanism:
// opening a new popup while one is already showing makes Leaflet close the
// old one first (firing 'popupclose') before opening the new one. Without
// this guard, that internal swap would be mistaken for the user dismissing
// the popup and would incorrectly clear the brand-new selection we just made.
let suppressPopupClose = false;
let flyToken = 0; // guards the "redraw selection once this flight settles" callback below —
                   // without it, a stale listener from an interrupted flight can still fire
                   // alongside the listener for whichever flight actually finishes.

function flyTo(r) {
  map._stop();
  const token = ++flyToken;
  map.flyTo(r._ll, REGION_FLY_ZOOM, {duration: REGION_FLY_DURATION});
  map.once('moveend', () => {
    // Only redraw if this is still the most recent flight AND the region
    // it was flying to is still the current selection.
    if (token !== flyToken || selectedRegionId !== r.regionId) return;
    updateSelectionMarker(r.regionId);
  });
  suppressPopupClose = true;
  L.popup({
    maxWidth: 230,
    // flyTo() above already re-centers the map on this exact latlng, so
    // Leaflet's automatic "nudge the map so the popup is visible" behaviour
    // is not just redundant here — opening the popup immediately (while the
    // fly animation is still mid-flight) makes autoPan measure against the
    // OLD, pre-animation view, decide the popup would be off-screen, and
    // kick off a *second*, independent panBy() animation on top of the
    // flyTo. Those two animations then fight over the map's position every
    // frame, which is what actually produced the dragging/lag feeling
    // (including making the selection box look laggy, since it's fighting
    // to track a view that's being moved by two animations at once).
    autoPan: false
  }).setLatLng(r._ll).setContent(`
    <div class="pu">
      <div class="pu-name">${r.name}</div>
      <div class="pu-row"><b>Region ID</b> ${r.regionId}</div>
      <div class="pu-row"><b>Rank</b> #${r.rank}</div>
      <div class="pu-row"><b>Pixels</b> ${r.pixels.toLocaleString()}</div>
      ${r.countryId?`<div class="pu-row"><b>Country</b> ${cFlag(r.countryId)} ${cName(r.countryId)}</div>`:""}
      ${r.url?`<a class="pu-link" href="${r.url}" target="_blank">Open in wplace ↗</a>`:''}
      <button class="pu-trend-btn" onclick="openRegionTrend(${r.regionId})">Pixel history</button>
      <button class="pu-trend-btn" onclick="copyShareLink(this)">Copy link</button>
    </div>`).openOn(map);
  // The close-then-open swap above (if a popup was already showing) happens
  // fully synchronously, so it's safe to drop the guard immediately after.
  suppressPopupClose = false;
}

// Clicking a popup's own "×" button (or Leaflet's default click-elsewhere-
// to-close behaviour) fires this event. Previously nothing listened for it,
// so the red selection box stayed on the map after the popup was dismissed.
// We only react when the close wasn't just an internal popup swap (see flyTo).
map.on('popupclose', () => {
  if (suppressPopupClose) return;
  if (selectedRegionId != null) deselectRegion();
});

// ── Selection — keeps map clicks and list clicks in sync ──
function selectRegion(r, scroll) {
  clearCountryHighlight();
  selectedCountryId = null;
  selectedRegionId = r.regionId;
  updateUrlParams({ region: r.regionId, country: null });
  updateSelectionMarker(null); // hide immediately — flyTo() redraws it once the flight settles
  flyTo(r);
  if (vlist) {
    vlist._key = null;
    vlist._paint();
    if (scroll) vlist.scrollToRegion(r.regionId);
  }
  closeMobileSidebarIfNeeded();
  // If the trend panel is already open (for this region, another region,
  // or a country), switch it to follow the newly selected region instead
  // of leaving it showing something stale.
  if (isTrendPanelOpen()) openRegionTrend(r.regionId);
}

// Used by list rows only (not the map click handler, to avoid interfering
// with Leaflet's native double-click-to-zoom): a second click on the
// already-selected region deselects it instead of re-selecting it.
function selectOrToggleRegion(r) {
  if (selectedRegionId === r.regionId) { deselectRegion(); return; }
  selectRegion(r, true);
}

// ── Map click — O(1) region lookup via inverse projection ──
// The grid is an exact Mercator projection, so the clicked lat/lng maps
// straight to a region ID — no per-click scan over rowsData needed.
map.on('click', e => {
  if (!rowsData.length) return;
  const id = latlngToRegionId(e.latlng.lat, e.latlng.lng);
  let row = rowById.get(id);

  // Defensive fallback — only matters if a CSV doesn't cover every region
  if (!row) {
    const cx = (id-1) % 512, cy = (id-1)/512|0;
    outer:
    for (let dy=-1; dy<=1; dy++) {
      for (let dx=-1; dx<=1; dx++) {
        if (!dx && !dy) continue;
        const nx=cx+dx, ny=cy+dy;
        if (nx<0||nx>511||ny<0||ny>511) continue;
        row = rowById.get(ny*512+nx+1);
        if (row) break outer;
      }
    }
  }
  if (row) selectRegion(row);
});

// ── Keep the selection box correctly positioned after map movement ────
// Leaflet's SVG renderer already handles smooth, continuous repositioning
// of vector layers during pans and animated zooms — including flyTo — on
// its own, via a CSS transform applied to the whole renderer container.
// That's the built-in mechanism, and it's what keeps the box visually
// glued to the map while a flyTo animation is in flight.
//
// A previous version of this handler also called redraw() on every 'move'
// and 'zoom' tick during the animation. That fights the renderer: redraw()
// re-projects the box's raw SVG coordinates using the current in-between
// zoom level, while the renderer is *simultaneously* applying its own
// compensating transform on top of those same coordinates for the same
// animation. The two corrections stack, and the box appears to lag,
// freeze, or drift out of alignment with the tiles moving underneath it
// instead of tracking smoothly — which is the bug this replaces.
//
// We only need a defensive re-projection once the view has actually
// settled, to guard against the rare case of a flyTo animation getting
// interrupted by a manual pan/zoom mid-flight.
map.on('moveend zoomend', () => {
  if (selectionRect) selectionRect.redraw();
});