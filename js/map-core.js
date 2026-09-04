// map-core.js — the Leaflet map instance, tile layers, panes, heatmap
// gradient math, region↔lat/lng coordinate conversion, number formatting,
// icon SVGs, and the canvas-based heatmap overlay renderer.
// Requires data.js (loaded first).

// ── Map setup ─────────────────────────────────────────────
const map = L.map('map', {
  crs: PaddedCRS,
  zoomControl: false, center: [25, 10], zoom: 2,
  maxBounds: MAP_MAX_BOUNDS, maxBoundsViscosity: 0.3,
  zoomSnap: 0.25,          // allow quarter-level zoom instead of snapping to whole numbers
  zoomDelta: 0.25,         // +/- buttons and keyboard zoom move by the same finer increment
  wheelPxPerZoomLevel: 60  // back to Leaflet's default scroll-wheel sensitivity
});
L.control.zoom({ position: 'bottomright' }).addTo(map);

// Standard OpenStreetMap tiles — no API key, genuinely free for reasonable
// use (unlike CARTO's raster basemaps, which started requiring a key).
// Only one style exists (labels baked into the tile, no separate
// nolabels/only_labels variants like CARTO offered), so dark mode is done
// with a CSS filter on this same layer instead of swapping to a second
// tile source — see [data-theme="dark"] .osm-base-tiles in styles.css.
// Base tiles and the heatmap overlay share one pane deliberately (see
// below) — mix-blend-mode only blends with content in the *same*
// stacking context, and Leaflet's panes (position:absolute + explicit
// z-index) each create their own separate one. Putting the heatmap in
// its usual default overlay pane, a sibling of the tile pane, meant its
// blend mode had nothing valid to blend with and silently did nothing.
map.createPane('mapContentPane');
map.getPane('mapContentPane').style.zIndex = '200';
map.getPane('mapContentPane').classList.add('map-content-pane'); // explicit class for CSS to target — not relying on Leaflet's own internal pane class-naming convention

const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

const baseTileLayer = L.tileLayer(TILE_URL, {
  attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  subdomains: 'abc', maxZoom: 13, noWrap: true,
  className: 'osm-base-tiles', pane: 'mapContentPane'
}).addTo(map);

// Sit above labels so highlight/selection indicators stay visible even
// when the base map + labels are showing (not just in heatmap-only mode).
map.createPane('countryHighlightPane');
map.getPane('countryHighlightPane').style.zIndex = '460';
map.getPane('countryHighlightPane').style.pointerEvents = 'none';
map.createPane('selectionPane');
map.getPane('selectionPane').style.zIndex = '470';
map.getPane('selectionPane').style.pointerEvents = 'none';

// ── Gradient ──────────────────────────────────────────────
const STOPS = [
  [0.00, [26,  5, 64]],
  [0.20, [91, 33,182]],
  [0.45, [124,111,247]],
  [0.65, [ 34,211,238]],
  [0.85, [245,158, 11]],
  [1.00, [255, 45,111]],
];
// The selection box reuses the gradient's own "high value" colour, kept as
// a single derived constant so the two stay in sync if STOPS ever changes.
const SELECTION_RGB = STOPS[STOPS.length - 1][1];
const SELECTION_COLOR = `rgb(${SELECTION_RGB.join(',')})`;

function gradRGB(t) {
  for (let i = 1; i < STOPS.length; i++) {
    const [t0,c0] = STOPS[i-1], [t1,c1] = STOPS[i];
    if (t <= t1) {
      const f = (t-t0)/(t1-t0);
      return [c0[0]+f*(c1[0]-c0[0])|0, c0[1]+f*(c1[1]-c0[1])|0, c0[2]+f*(c1[2]-c0[2])|0];
    }
  }
  return [255,45,111];
}

// Precomputed lookup table for gradRGB(), used only by buildOffscreen()'s
// hot loop below (up to 262,144 calls per heatmap build — once per
// snapshot load, date change, or heatmap mode switch). gradRGB() itself
// does a linear search over STOPS plus an array allocation on every call;
// at that call volume those add up to real, measurable main-thread time.
// Built once here (reusing gradRGB() itself, so it can't drift out of
// sync with the real gradient), then buildOffscreen() just does an O(1)
// typed-array read instead.
const GRAD_LUT_SIZE = 2048;
const GRAD_LUT = new Uint8Array(GRAD_LUT_SIZE * 3); // interleaved r,g,b
for (let i = 0; i < GRAD_LUT_SIZE; i++) {
  const [r,g,b] = gradRGB(i / (GRAD_LUT_SIZE - 1));
  GRAD_LUT[i*3] = r; GRAD_LUT[i*3+1] = g; GRAD_LUT[i*3+2] = b;
}

// ── Region coordinates — forward (id → lat/lng) and inverse ─
function regionCoords(rid) {
  const x = (rid-1) % 512, y = (rid-1)/512|0;
  const lng = ((x+0.5)/512)*360 - 180;
  const n   = Math.PI - 2*Math.PI*(y+0.5)/512;
  const lat = (180/Math.PI) * Math.atan(0.5*(Math.exp(n)-Math.exp(-n)));
  return [lat, lng];
}

// Inverse of regionCoords — turns a click's lat/lng straight into a region ID
// in O(1), no scanning needed. The grid is a perfect Mercator projection so
// this is an exact cell-membership test, not a nearest-neighbour approximation.
function latlngToRegionId(lat, lng) {
  lng = ((lng % 360) + 360) % 360;
  if (lng >= 180) lng -= 360;
  const x = Math.min(511, Math.max(0, Math.floor((lng + 180) / 360 * 512)));
  const clampedLat = Math.min(WORLD_LAT, Math.max(WORLD_LAT2, lat));
  const latRad = clampedLat * Math.PI / 180;
  const n = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const y = Math.min(511, Math.max(0, Math.floor((Math.PI - n) / (2 * Math.PI) * 512)));
  return y * 512 + x + 1;
}

// Same Mercator math as regionCoords, but for a cell edge (integer row)
// rather than its center (row + 0.5) — used to build the cell's four corners.
function mercLatFromRow(yFrac) {
  const n = Math.PI - 2*Math.PI*yFrac/512;
  return (180/Math.PI) * Math.atan(0.5*(Math.exp(n)-Math.exp(-n)));
}

// Exact SW/NE bounds of a region's grid cell, for drawing a selection box
// that lines up pixel-perfectly with the heatmap overlay.
function regionCellBounds(rid) {
  const x = (rid-1) % 512, y = (rid-1)/512|0;
  const lngW = (x/512)*360 - 180;
  const lngE = ((x+1)/512)*360 - 180;
  const latN = mercLatFromRow(y);
  const latS = mercLatFromRow(y+1);
  return [[latS, lngW], [latN, lngE]];
}

// ── Format ────────────────────────────────────────────────
const fmt = n => n>=1e9?(n/1e9).toFixed(2)+'B':n>=1e6?(n/1e6).toFixed(2)+'M':n>=1e3?(n/1e3).toFixed(1)+'K':String(Math.round(n));

// Cancellable via a shared token: animCount is only ever used for
// #big-num, so a new call always means "whatever's currently animating
// there is now stale" — without this, switching heatmap mode (or
// loading a new snapshot) while a previous animCount is still ticking
// left its requestAnimationFrame loop free to keep overwriting the
// display with the old value for up to 800ms after the new one was set.
let animCountToken = 0;
function animCount(el, to, prefix = '') {
  const token = ++animCountToken;
  const s = Date.now(), d = 800;
  const tick = () => {
    if (token !== animCountToken) return; // superseded by a newer animCount call
    const p = Math.min((Date.now()-s)/d,1), e = 1-Math.pow(1-p,3);
    el.textContent = prefix + fmt(Math.round(to*e));
    if (p<1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// ── Row action icons (used by the virtual list below) ──────
const ICON_LOCATE  = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="7"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/></svg>';
const ICON_EXTLINK = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>';
const ICON_EYE     = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"/><circle cx="12" cy="12" r="3"/></svg>';
const ICON_EYE_OFF = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a20.3 20.3 0 0 1 5.06-6.06M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a20.3 20.3 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
const ICON_MOON    = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/></svg>';
const ICON_SUN     = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="6.34" y2="17.66"/><line x1="17.66" y1="6.34" x2="19.07" y2="4.93"/></svg>';
const ICON_TREND   = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 17 9 11 13 15 21 6"/><polyline points="15 6 21 6 21 12"/></svg>';
const ICON_LINK    = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 0 0 7.07 7.07l1.5-1.5"/></svg>';
const ICON_CHECK   = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

// ── Image overlay ─────────────────────────────────────────
// pane: 'mapContentPane' — same pane as baseTileLayer above, deliberately,
// so the blend-mode CSS (see styles.css) can actually see the tiles as
// its backdrop. DOM append order (tiles added first at load, this
// overlay added/replaced later per snapshot) keeps it painting on top
// within that shared stacking context.
const OVERLAY_OPTS = { opacity: 1, interactive: false, className: 'filled-overlay', pane: 'mapContentPane' };
let filledOverlays = [];
let lastOverlayBlobUrl = null;
let heatmapVisible = true; // toggled via toggleHeatmapVisibility(); persists across snapshot switches
let heatmapRefreshToken = 0; // guards refreshHeatmapOverlay() against overlapping fetches (rapid mode/date changes)

// Renders the 512×512 bitmap via toBlob()+ObjectURL instead of toDataURL() —
// non-blocking, and skips the ~33% size overhead of base64 encoding.
function setFilledOverlay(canvas) {
  canvas.toBlob(blob => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    filledOverlays.forEach(o => map.removeLayer(o));
    const overlay = L.imageOverlay(url, WORLD_BOUNDS_MAIN, OVERLAY_OPTS).addTo(map);
    overlay.setOpacity(heatmapVisible ? 1 : 0);
    filledOverlays = [overlay];
    if (lastOverlayBlobUrl) URL.revokeObjectURL(lastOverlayBlobUrl);
    lastOverlayBlobUrl = url;
  }, 'image/png');
}

function buildOffscreen(rows, maxPx) {
  const os  = document.createElement('canvas');
  os.width = os.height = 512;
  const ctx = os.getContext('2d');
  const img = ctx.createImageData(512, 512);
  const d   = img.data;
  // Uint32Array view over the same buffer lets one native .fill() set all
  // 262,144 background pixels at once, instead of a 262,144-iteration JS
  // loop writing 4 bytes each. Byte order is little-endian on all
  // browsers that matter here, so 0xAABBGGRR encodes A=255,B=34,G=23,R=18.
  new Uint32Array(d.buffer).fill(0xff221712);
  const logMax = Math.log1p(maxPx) || 1;
  for (const row of rows) {
    const x = (row.regionId-1) % 512, y = (row.regionId-1)/512|0;
    if (x<0||x>511||y<0||y>511) continue;
    const t = Math.log1p(row.pixels)/logMax;
    const lutIdx = ((t * (GRAD_LUT_SIZE - 1)) | 0) * 3;
    const idx = (y*512+x)*4;
    d[idx]=GRAD_LUT[lutIdx]; d[idx+1]=GRAD_LUT[lutIdx+1]; d[idx+2]=GRAD_LUT[lutIdx+2]; d[idx+3]=255;
  }
  ctx.putImageData(img, 0, 0);
  return os;
}