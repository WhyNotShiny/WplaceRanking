// ── Country mapping (ID→name+ISO, alphabetical ISO 3166-1 order) ────────
const CM={1:{n:"Afghanistan",c:"AF"},2:{n:"Albania",c:"AL"},3:{n:"Algeria",c:"DZ"},4:{n:"American Samoa",c:"AS"},5:{n:"Andorra",c:"AD"},6:{n:"Angola",c:"AO"},7:{n:"Anguilla",c:"AI"},8:{n:"Antarctica",c:"AQ"},9:{n:"Antigua & Barbuda",c:"AG"},
10:{n:"Argentina",c:"AR"},11:{n:"Armenia",c:"AM"},12:{n:"Aruba",c:"AW"},13:{n:"Australia",c:"AU"},14:{n:"Austria",c:"AT"},15:{n:"Azerbaijan",c:"AZ"},16:{n:"Bahamas",c:"BS"},17:{n:"Bahrain",c:"BH"},18:{n:"Bangladesh",c:"BD"},19:{n:"Barbados",c:"BB"},
20:{n:"Belarus",c:"BY"},21:{n:"Belgium",c:"BE"},22:{n:"Belize",c:"BZ"},23:{n:"Benin",c:"BJ"},24:{n:"Bermuda",c:"BM"},25:{n:"Bhutan",c:"BT"},26:{n:"Bolivia",c:"BO"},27:{n:"Bonaire",c:"BQ"},28:{n:"Bosnia & Herzegovina",c:"BA"},29:{n:"Botswana",c:"BW"},
30:{n:"Bouvet Island",c:"BV"},31:{n:"Brazil",c:"BR"},32:{n:"British Indian Ocean Territory",c:"IO"},33:{n:"Brunei",c:"BN"},34:{n:"Bulgaria",c:"BG"},35:{n:"Burkina Faso",c:"BF"},36:{n:"Burundi",c:"BI"},37:{n:"Cabo Verde",c:"CV"},38:{n:"Cambodia",c:"KH"},39:{n:"Cameroon",c:"CM"},
40:{n:"Canada",c:"CA"},41:{n:"Cayman Islands",c:"KY"},42:{n:"Central African Republic",c:"CF"},43:{n:"Chad",c:"TD"},44:{n:"Chile",c:"CL"},45:{n:"China",c:"CN"},46:{n:"Christmas Island",c:"CX"},47:{n:"Cocos Islands",c:"CC"},48:{n:"Colombia",c:"CO"},49:{n:"Comoros",c:"KM"},
50:{n:"Congo",c:"CG"},51:{n:"Cook Islands",c:"CK"},52:{n:"Costa Rica",c:"CR"},53:{n:"Croatia",c:"HR"},54:{n:"Cuba",c:"CU"},55:{n:"Cura\u00e7ao",c:"CW"},56:{n:"Cyprus",c:"CY"},57:{n:"Czechia",c:"CZ"},58:{n:"C\u00f4te d'Ivoire",c:"CI"},59:{n:"Denmark",c:"DK"},
60:{n:"Djibouti",c:"DJ"},61:{n:"Dominica",c:"DM"},62:{n:"Dominican Republic",c:"DO"},63:{n:"Ecuador",c:"EC"},64:{n:"Egypt",c:"EG"},65:{n:"El Salvador",c:"SV"},66:{n:"Equatorial Guinea",c:"GQ"},67:{n:"Eritrea",c:"ER"},68:{n:"Estonia",c:"EE"},69:{n:"Eswatini",c:"SZ"},
70:{n:"Ethiopia",c:"ET"},71:{n:"Falkland Islands",c:"FK"},72:{n:"Faroe Islands",c:"FO"},73:{n:"Fiji",c:"FJ"},74:{n:"Finland",c:"FI"},75:{n:"France",c:"FR"},76:{n:"French Guiana",c:"GF"},77:{n:"French Polynesia",c:"PF"},78:{n:"French Southern Territories",c:"TF"},79:{n:"Gabon",c:"GA"},
80:{n:"Gambia",c:"GM"},81:{n:"Georgia",c:"GE"},82:{n:"Germany",c:"DE"},83:{n:"Ghana",c:"GH"},84:{n:"Gibraltar",c:"GI"},85:{n:"Greece",c:"GR"},86:{n:"Greenland",c:"GL"},87:{n:"Grenada",c:"GD"},88:{n:"Guadeloupe",c:"GP"},89:{n:"Guam",c:"GU"},
90:{n:"Guatemala",c:"GT"},91:{n:"Guernsey",c:"GG"},92:{n:"Guinea",c:"GN"},93:{n:"Guinea-Bissau",c:"GW"},94:{n:"Guyana",c:"GY"},95:{n:"Haiti",c:"HT"},96:{n:"Heard & McDonald Islands",c:"HM"},97:{n:"Honduras",c:"HN"},98:{n:"Hong Kong",c:"HK"},99:{n:"Hungary",c:"HU"},
100:{n:"Iceland",c:"IS"},101:{n:"India",c:"IN"},102:{n:"Indonesia",c:"ID"},103:{n:"Iran",c:"IR"},104:{n:"Iraq",c:"IQ"},105:{n:"Ireland",c:"IE"},106:{n:"Isle of Man",c:"IM"},107:{n:"Israel",c:"IL"},108:{n:"Italy",c:"IT"},109:{n:"Jamaica",c:"JM"},
110:{n:"Japan",c:"JP"},111:{n:"Jersey",c:"JE"},112:{n:"Jordan",c:"JO"},113:{n:"Kazakhstan",c:"KZ"},114:{n:"Kenya",c:"KE"},115:{n:"Kiribati",c:"KI"},116:{n:"Kosovo",c:"XK"},117:{n:"Kuwait",c:"KW"},118:{n:"Kyrgyzstan",c:"KG"},119:{n:"Laos",c:"LA"},
120:{n:"Latvia",c:"LV"},121:{n:"Lebanon",c:"LB"},122:{n:"Lesotho",c:"LS"},123:{n:"Liberia",c:"LR"},124:{n:"Libya",c:"LY"},125:{n:"Liechtenstein",c:"LI"},126:{n:"Lithuania",c:"LT"},127:{n:"Luxembourg",c:"LU"},128:{n:"Macau",c:"MO"},129:{n:"Madagascar",c:"MG"},
130:{n:"Malawi",c:"MW"},131:{n:"Malaysia",c:"MY"},132:{n:"Maldives",c:"MV"},133:{n:"Mali",c:"ML"},134:{n:"Malta",c:"MT"},135:{n:"Marshall Islands",c:"MH"},136:{n:"Martinique",c:"MQ"},137:{n:"Mauritania",c:"MR"},138:{n:"Mauritius",c:"MU"},139:{n:"Mayotte",c:"YT"},
140:{n:"Mexico",c:"MX"},141:{n:"Micronesia",c:"FM"},142:{n:"Moldova",c:"MD"},143:{n:"Monaco",c:"MC"},144:{n:"Mongolia",c:"MN"},145:{n:"Montenegro",c:"ME"},146:{n:"Montserrat",c:"MS"},147:{n:"Morocco",c:"MA"},148:{n:"Mozambique",c:"MZ"},149:{n:"Myanmar",c:"MM"},
150:{n:"Namibia",c:"NA"},151:{n:"Nauru",c:"NR"},152:{n:"Nepal",c:"NP"},153:{n:"Netherlands",c:"NL"},154:{n:"New Caledonia",c:"NC"},155:{n:"New Zealand",c:"NZ"},156:{n:"Nicaragua",c:"NI"},157:{n:"Niger",c:"NE"},158:{n:"Nigeria",c:"NG"},159:{n:"Niue",c:"NU"},
160:{n:"Norfolk Island",c:"NF"},161:{n:"North Korea",c:"KP"},162:{n:"North Macedonia",c:"MK"},163:{n:"Northern Mariana Islands",c:"MP"},164:{n:"Norway",c:"NO"},165:{n:"Oman",c:"OM"},166:{n:"Pakistan",c:"PK"},167:{n:"Palau",c:"PW"},168:{n:"Palestine",c:"PS"},169:{n:"Panama",c:"PA"},
170:{n:"Papua New Guinea",c:"PG"},171:{n:"Paraguay",c:"PY"},172:{n:"Peru",c:"PE"},173:{n:"Philippines",c:"PH"},174:{n:"Pitcairn Islands",c:"PN"},175:{n:"Poland",c:"PL"},176:{n:"Portugal",c:"PT"},177:{n:"Puerto Rico",c:"PR"},178:{n:"Qatar",c:"QA"},179:{n:"DR Congo",c:"CD"},
180:{n:"Romania",c:"RO"},181:{n:"Russia",c:"RU"},182:{n:"Rwanda",c:"RW"},183:{n:"R\u00e9union",c:"RE"},184:{n:"Saint Barth\u00e9lemy",c:"BL"},185:{n:"Saint Helena",c:"SH"},186:{n:"Saint Kitts & Nevis",c:"KN"},187:{n:"Saint Lucia",c:"LC"},188:{n:"Saint Martin",c:"MF"},189:{n:"Saint Pierre & Miquelon",c:"PM"},
190:{n:"Saint Vincent & Grenadines",c:"VC"},191:{n:"Samoa",c:"WS"},192:{n:"San Marino",c:"SM"},193:{n:"S\u00e3o Tom\u00e9 & Pr\u00edncipe",c:"ST"},194:{n:"Saudi Arabia",c:"SA"},195:{n:"Senegal",c:"SN"},196:{n:"Serbia",c:"RS"},197:{n:"Seychelles",c:"SC"},198:{n:"Sierra Leone",c:"SL"},199:{n:"Singapore",c:"SG"},
200:{n:"Sint Maarten",c:"SX"},201:{n:"Slovakia",c:"SK"},202:{n:"Slovenia",c:"SI"},203:{n:"Solomon Islands",c:"SB"},204:{n:"Somalia",c:"SO"},205:{n:"South Africa",c:"ZA"},206:{n:"South Georgia",c:"GS"},207:{n:"South Korea",c:"KR"},208:{n:"South Sudan",c:"SS"},209:{n:"Spain",c:"ES"},
210:{n:"Sri Lanka",c:"LK"},211:{n:"Sudan",c:"SD"},212:{n:"Suriname",c:"SR"},213:{n:"Svalbard",c:"SJ"},214:{n:"Sweden",c:"SE"},215:{n:"Switzerland",c:"CH"},216:{n:"Syria",c:"SY"},217:{n:"Taiwan",c:"TW"},218:{n:"Tajikistan",c:"TJ"},219:{n:"Tanzania",c:"TZ"},
220:{n:"Thailand",c:"TH"},221:{n:"Timor-Leste",c:"TL"},222:{n:"Togo",c:"TG"},223:{n:"Tokelau",c:"TK"},224:{n:"Tonga",c:"TO"},225:{n:"Trinidad & Tobago",c:"TT"},226:{n:"Tunisia",c:"TN"},227:{n:"Turkmenistan",c:"TM"},228:{n:"Turks & Caicos Islands",c:"TC"},229:{n:"Tuvalu",c:"TV"},
230:{n:"Turkey",c:"TR"},231:{n:"Uganda",c:"UG"},232:{n:"Ukraine",c:"UA"},233:{n:"United Arab Emirates",c:"AE"},234:{n:"United Kingdom",c:"GB"},235:{n:"United States",c:"US"},236:{n:"US Minor Outlying Islands",c:"UM"},237:{n:"Uruguay",c:"UY"},238:{n:"Uzbekistan",c:"UZ"},239:{n:"Vanuatu",c:"VU"},
240:{n:"Vatican City",c:"VA"},241:{n:"Venezuela",c:"VE"},242:{n:"Vietnam",c:"VN"},243:{n:"British Virgin Islands",c:"VG"},244:{n:"US Virgin Islands",c:"VI"},245:{n:"Wallis & Futuna",c:"WF"},246:{n:"Western Sahara",c:"EH"},247:{n:"Yemen",c:"YE"},248:{n:"Zambia",c:"ZM"},249:{n:"Zimbabwe",c:"ZW"},
250:{n:"\u00c5land Islands",c:"AX"}};
function cFlag(id){const e=CM[id];if(!e)return"";return[...e.c].map(ch=>String.fromCodePoint(0x1F1E6+ch.charCodeAt(0)-65)).join("");}
function cName(id){return CM[id]?.n||"";}

// ── Repo config ── only edit these if you fork or rename ────
const REPO_OWNER  = 'WhyNotShiny';
const REPO_NAME   = 'WplaceRanking';
const REPO_BRANCH = 'main';
const REPO_DIR    = 'Leaderboard_files';   // sub-folder the CSVs actually live in
// CSV files must be named exactly:  region_leaderboard_YYYY-MM-DD.csv
const CSV_PREFIX  = 'region_leaderboard_';

// Preferred discovery source — a plain JSON array of date strings
// (e.g. ["2026-06-22","2026-06-28"]) at this path in the repo, served over
// raw.githubusercontent.com's CDN like the CSVs themselves. Unlike the
// GitHub Contents API below, this has no per-hour rate limit. Whichever
// script generates the CSVs should also write/update this file.
const MANIFEST_URL = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${REPO_BRANCH}/${REPO_DIR}/manifest.json`;

// Last-resort fallback — used only if BOTH the manifest above and the
// GitHub API discovery call fail (e.g. manifest not created yet, or a
// rate limit hit before it exists), so the app doesn't get stuck on
// "Fetching…" forever. Confirmed present in REPO_DIR as of this writing.
const FALLBACK_DATES = [
  '2026-06-22',
  '2026-06-28',
];

// Populated automatically on load — no manual editing needed.
let SNAPSHOTS          = [];
let usingFallbackDates = false; // true when discovery failed and FALLBACK_DATES was used instead
const snapshotCache    = new Map(); // date → parsed rows (avoids re-fetching)
let currentSnapshotIdx = 0;
let loadingSnapshotIdx = -1;        // race-condition guard

// ── World bounds — needed before map init (maxBounds) and by
// the image overlay + the inverse-projection click lookup below.
const WORLD_LAT  =  85.0511287798066;
const WORLD_LAT2 = -85.0511287798066;
const WORLD_BOUNDS_MAIN = [[WORLD_LAT2, -180], [WORLD_LAT, 180]];

// A slightly padded copy used only as the map's maxBounds — flying to an
// edge region no longer snaps back the instant the viewport pokes past the
// true world edge; it has to drift further before the pull-back kicks in.
// WORLD_BOUNDS_MAIN itself stays exact since the overlays are pinned to it.
const MAP_MAX_BOUNDS = L.latLngBounds(WORLD_BOUNDS_MAIN).pad(0.2);

// Mercator's projection clamps latitude to WORLD_LAT internally, which
// made the padded maxBounds a no-op vertically (no clamp exists for
// longitude, which is why horizontal padding worked). This CRS just
// raises that clamp so the padding has vertical room to actually use.
const PaddedMercator = L.extend({}, L.Projection.SphericalMercator, { MAX_LATITUDE: 89.9 });
const PaddedCRS = L.extend({}, L.CRS.EPSG3857, { projection: PaddedMercator });

// ── Map setup ─────────────────────────────────────────────
const map = L.map('map', {
  crs: PaddedCRS,
  zoomControl: false, center: [25, 10], zoom: 2,
  maxBounds: MAP_MAX_BOUNDS, maxBoundsViscosity: 0.3
});
L.control.zoom({ position: 'bottomright' }).addTo(map);

L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
  attribution: '© <a href="https://openstreetmap.org/copyright">OSM</a> © <a href="https://carto.com/">CARTO</a>',
  subdomains: 'abcd', maxZoom: 13, noWrap: true
}).addTo(map);

map.createPane('labelsPane');
map.getPane('labelsPane').style.zIndex = '450';
map.getPane('labelsPane').style.pointerEvents = 'none';
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', {
  subdomains: 'abcd', maxZoom: 13, pane: 'labelsPane', noWrap: true
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

function animCount(el, to) {
  const s = Date.now(), d = 800;
  const tick = () => {
    const p = Math.min((Date.now()-s)/d,1), e = 1-Math.pow(1-p,3);
    el.textContent = fmt(Math.round(to*e));
    if (p<1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// ── Row action icons (used by the virtual list below) ──────
const ICON_LOCATE  = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="7"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/></svg>';
const ICON_EXTLINK = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>';
const ICON_EYE     = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"/><circle cx="12" cy="12" r="3"/></svg>';
const ICON_EYE_OFF = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a20.3 20.3 0 0 1 5.06-6.06M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a20.3 20.3 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';

// ── Image overlay ─────────────────────────────────────────
const OVERLAY_OPTS = { opacity: 1, interactive: false, className: 'filled-overlay' };
let filledOverlays = [];
let lastOverlayBlobUrl = null;
let heatmapVisible = true; // toggled via toggleHeatmapVisibility(); persists across snapshot switches

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
  for (let i = 0; i < 512*512*4; i += 4) { d[i]=18; d[i+1]=23; d[i+2]=34; d[i+3]=255; }
  const logMax = Math.log1p(maxPx) || 1;
  for (const row of rows) {
    const x = (row.regionId-1) % 512, y = (row.regionId-1)/512|0;
    if (x<0||x>511||y<0||y>511) continue;
    const t = Math.log1p(row.pixels)/logMax;
    const [cr,cg,cb] = gradRGB(t);
    const idx = (y*512+x)*4;
    d[idx]=cr; d[idx+1]=cg; d[idx+2]=cb; d[idx+3]=255;
  }
  ctx.putImageData(img, 0, 0);
  return os;
}

// ── Tab switching ─────────────────────────────────────────
function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab===tab));
  document.getElementById('panel-list').classList.toggle('active', tab==='list');
  document.getElementById('panel-stats').classList.toggle('active', tab==='stats');
  document.getElementById('panel-info').classList.toggle('active', tab==='info');
}

// ── Sort ──────────────────────────────────────────────────
let sortKey = 'px', sortDir = 'desc';

// Default direction when a column is first clicked
const SORT_DEFAULTS = { px: 'desc', id: 'asc' };

let currentView = 'regions';
let ctySortKey = 'px', ctySortDir = 'desc';

function setCtySort(key) {
  // Same key → toggle direction; new key → default to descending
  ctySortDir = (ctySortKey === key) ? (ctySortDir === 'asc' ? 'desc' : 'asc') : 'desc';
  ctySortKey = key;
  updateCtySortUI();
  filterCountriesView(document.getElementById('searchinput').value);
}

// Scoped to [data-cty] only — kept separate from updateSortUI's [data-key]
// selector so sorting one list never touches the other's active/arrow state.
function updateCtySortUI() {
  document.querySelectorAll('[data-cty]').forEach(chip => {
    const isActive = chip.dataset.cty === ctySortKey;
    chip.classList.toggle('active', isActive);
    chip.querySelector('.arr').textContent = isActive ? (ctySortDir === 'asc' ? '▲' : '▼') : '';
  });
}
function setView(v) {
  currentView = v;
  const isC = v === 'countries';
  document.getElementById('vtog-regions').classList.toggle('on', !isC);
  document.getElementById('vtog-countries').classList.toggle('on', isC);
  document.getElementById('sort-bar').style.display     = isC ? 'none' : '';
  document.getElementById('cty-sort-bar').style.display = isC ? 'flex' : 'none';
  document.getElementById('col-heads').style.display     = isC ? 'none' : '';
  document.getElementById('cty-col-heads').style.display  = isC ? 'flex' : 'none';
  document.getElementById('lr-panel').style.display   = isC ? 'none' : '';
  document.getElementById('lc-panel').style.display   = isC ? 'block' : 'none';
  const si = document.getElementById('searchinput');
  si.value = '';
  si.placeholder = isC ? 'Search country…' : 'Search name, region ID or country…';
  const srEl = document.getElementById('srcount');
  srEl.textContent = '';
  srEl.classList.remove('empty-hint');
  // Refresh sort-chip UI for whichever list is now visible, so switching
  // tabs never leaves stale active/arrow state on the chips you can't see.
  if (isC) { updateCtySortUI(); filterCountriesView(''); } else { updateSortUI(); if (vlist) vlist.filter(''); }
}

function setSort(key) {
  sortDir = (sortKey === key) ? (sortDir==='asc' ? 'desc' : 'asc') : SORT_DEFAULTS[key];
  sortKey = key;
  updateSortUI();
  if (rowsData.length) {
    const q = document.getElementById('searchinput').value;
    getVlist().load(applySort(rowsData), maxPxGlobal);
    if (q) getVlist().filter(q);
  }
}

// Scoped to [data-key] only — see updateCtySortUI above for why these two
// stay separate rather than sharing a single ".sort-chip" selector.
function updateSortUI() {
  document.querySelectorAll('[data-key]').forEach(chip => {
    const isActive = chip.dataset.key === sortKey;
    chip.classList.toggle('active', isActive);
    chip.querySelector('.arr').textContent = isActive ? (sortDir==='asc' ? '▲' : '▼') : '';
  });
}

function applySort(rows) {
  return [...rows].sort((a, b) => {
    const av = sortKey==='id' ? a.regionId : a.pixels;
    const bv = sortKey==='id' ? b.regionId : b.pixels;
    return sortDir==='asc' ? av-bv : bv-av;
  });
}

// ── Accessibility helper ────────────────────────────────────────────────
// Both list types render plain <div> rows for performance (real <button>/<li>
// elements would be heavier at these counts). That means the :focus-visible
// CSS already defined for `.li` / `.cty-lb-row` has nothing to focus unless
// we opt them into the tab order and wire up Enter/Space ourselves — this
// does exactly that for any row, for either list.
function makeActivatable(el, handler) {
  el.tabIndex = 0;
  el.setAttribute('role', 'button');
  el.addEventListener('keydown', e => {
    if (e.target !== el) return; // let nested buttons/links handle their own Enter/Space
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handler();
    }
  });
}

// ── Virtual list ──────────────────────────────────────────
class VirtualList {
  constructor(container, itemH=36) {
    this._el=container; this._ih=itemH;
    this._all=[]; this._rows=[]; this._mx=1; this._key=null;
    const sp=document.createElement('div');
    sp.style.cssText='position:relative;width:100%;';
    const inn=document.createElement('div');
    inn.style.cssText='position:absolute;top:0;left:0;right:0;';
    sp.appendChild(inn); container.appendChild(sp);
    this._sp=sp; this._in=inn;
    container.addEventListener('scroll', ()=>this._paint(), {passive:true});
    if (typeof ResizeObserver!=='undefined')
      new ResizeObserver(()=>{this._key=null;this._paint();}).observe(container);
  }

  load(rows, maxPx) {
    this._all=rows; this._mx=maxPx||1;
    this._el.scrollTop=0; this._key=null;
    this.filter('');
  }

  filter(q) {
    const s=q.trim().toLowerCase();
    this._rows=s ? this._all.filter(r=>r.name.toLowerCase().includes(s)||String(r.regionId).includes(s)||cName(r.countryId).toLowerCase().includes(s)) : this._all;
    this._el.scrollTop=0; this._key=null;
    this._paint();
    const n=this._rows.length, tot=this._all.length;
    const el=document.getElementById('srcount');
    if (el) {
      el.textContent = n<tot ? `${n.toLocaleString()} of ${tot.toLocaleString()} match` : `${n.toLocaleString()} regions`;
      el.classList.toggle('empty-hint', n===0);
    }
  }

  _paint() {
    const {_el:el,_ih:ih,_sp:sp,_in:inn,_rows:rows,_mx:mx}=this;
    const n=rows.length;
    sp.style.height=`${n*ih}px`;

    // Empty state — a search with zero matches gets an explicit message
    // instead of a silently blank panel.
    if (!n) {
      if (this._key === 'empty') return;
      this._key = 'empty';
      const q = document.getElementById('searchinput').value.trim();
      inn.style.transform = 'translateY(0)';
      inn.replaceChildren();
      const row = document.createElement('div');
      row.className = 'empty-row';
      row.textContent = q ? `No regions match "${q}"` : 'No regions to show';
      inn.appendChild(row);
      return;
    }

    const viewH=el.clientHeight||400, top=el.scrollTop;
    const start=Math.max(0,Math.floor(top/ih)-10);
    const end=Math.min(n,start+Math.ceil(viewH/ih)+15);
    const key=`${start}:${end}:${n}:${selectedRegionId}`;
    if (key===this._key) return;
    this._key=key;
    inn.style.transform=`translateY(${start*ih}px)`;
    const frag=document.createDocumentFragment();
    for (let i=start;i<end;i++) {
      const r=rows[i];
      const div=document.createElement('div');
      let cls='li';
      if (r.rank===1) cls+=' rank-gold';
      else if (r.rank===2) cls+=' rank-silver';
      else if (r.rank===3) cls+=' rank-bronze';
      if (r.regionId===selectedRegionId) cls+=' selected';
      div.className=cls;
      const pct=mx>0?(r.pixels/mx*100).toFixed(1):0;
      const hasUrl = !!r.url;
      const flagHtml = r.countryId ? `<span class="flag-ic">${cFlag(r.countryId)}</span>` : '';
      div.innerHTML=
        `<span class="lrank">${r.rank}</span>`+
        `<span class="lid">#${r.regionId}</span>`+
        `<span class="lname" title="${cName(r.countryId)?cName(r.countryId)+": ":""}${r.name}">${flagHtml}<span class="lname-txt">${r.name}</span></span>`+
        `<div class="lbar-w"><div class="lbar" style="width:${pct}%"></div></div>`+
        `<span class="lval">${fmt(r.pixels)}</span>`+
        `<button class="lgo" title="Fly to region">${ICON_LOCATE}</button>`+
        `<button class="lwp${hasUrl?'':' lwp-off'}"${hasUrl?'':' disabled'} title="${hasUrl?'Open on wplace.live':'No wplace link in this snapshot'}">${ICON_EXTLINK}</button>`;
      const cap=r;
      const activate = () => selectOrToggleRegion(cap);
      div.addEventListener('click', activate);
      makeActivatable(div, activate);
      div.querySelector('.lgo').addEventListener('click',e=>{e.stopPropagation();activate();});
      if (hasUrl) div.querySelector('.lwp').addEventListener('click',e=>{e.stopPropagation();window.open(cap.url,'_blank','noopener,noreferrer');});
      frag.appendChild(div);
    }
    inn.replaceChildren(frag);
  }

  scrollToRegion(regionId) {
    const idx=this._rows.findIndex(r=>r.regionId===regionId);
    if (idx<0) return;
    const target=idx*this._ih, viewH=this._el.clientHeight||400, cur=this._el.scrollTop;
    if (target<cur || target>cur+viewH-this._ih) {
      this._el.scrollTop=Math.max(0, target-viewH/2+this._ih/2);
    }
  }

  // Exact-match filter by country ID — used when navigating from a country
  // click, where a name-substring filter would incorrectly pull in other
  // countries whose name contains this one (e.g. "Niger" inside "Nigeria").
  filterByCountryId(id) {
    this._rows = this._all.filter(r => r.countryId === id);
    this._el.scrollTop = 0; this._key = null;
    this._paint();
    const n = this._rows.length, tot = this._all.length;
    const el = document.getElementById('srcount');
    if (el) {
      el.textContent = `${n.toLocaleString()} of ${tot.toLocaleString()} match`;
      el.classList.toggle('empty-hint', n===0);
    }
  }
}

let vlist=null;
function getVlist() {
  if (!vlist) vlist=new VirtualList(document.getElementById('lr-panel'));
  return vlist;
}
let searchDebounceT = null;
function onSearch(val) {
  clearTimeout(searchDebounceT);
  searchDebounceT = setTimeout(() => {
    if (currentView === 'countries') filterCountriesView(val);
    else getVlist().filter(val);
  }, 100);
}

// ── State ─────────────────────────────────────────────────
let rowsData=[], maxPxGlobal=1, selectedRegionId=null, rowById=new Map();
let selectedCountryId=null, selectionRect=null;
let countryHighlightOverlay=null, countryHighlightBlobUrl=null;
let heatmapOnly=false;

// ── Date helpers ──────────────────────────────────────────
function fmtDate(iso) {
  const [y,m,d] = iso.split('-').map(Number);
  const mon = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m-1];
  return `${d} ${mon} ${y}`;
}

function extractRepoUrl(csvUrl) {
  // Built directly from REPO_OWNER/REPO_NAME so it stays correct regardless
  // of how many sub-folders the CSV path has.
  return `https://github.com/${REPO_OWNER}/${REPO_NAME}`;
}

// ── Slider init ───────────────────────────────────────────
function initSlider() {
  const n = SNAPSHOTS.length;
  if (n > 1) {
    document.getElementById('mwrap').classList.add('has-slider');
    document.body.classList.add('has-slider');
    const range = document.getElementById('date-range');
    range.max   = n - 1;
    range.value = currentSnapshotIdx;
    buildSliderTicks();
  }
  updateSliderUI(currentSnapshotIdx);
}

function buildSliderTicks() {
  const n = SNAPSHOTS.length;
  const ticks = document.getElementById('ds-ticks');
  ticks.innerHTML = '';
  // Show at most 5 date labels; always include first & last
  const maxLabels = Math.min(n, 5);
  const labelSet  = new Set([0, n - 1]);
  for (let i = 1; i < maxLabels - 1; i++) {
    labelSet.add(Math.round(i * (n - 1) / (maxLabels - 1)));
  }
  for (let i = 0; i < n; i++) {
    const pct  = n <= 1 ? 50 : (i / (n - 1)) * 100;
    const tick = document.createElement('div');
    tick.className = 'ds-tick' + (i === currentSnapshotIdx ? ' current' : '');
    tick.id = `dstick-${i}`;
    tick.style.left = `${pct}%`;
    tick.innerHTML = labelSet.has(i)
      ? `<div class="ds-tick-mark"></div><span class="ds-tick-label">${fmtDate(SNAPSHOTS[i].date)}</span>`
      : `<div class="ds-tick-mark"></div>`;
    ticks.appendChild(tick);
  }
}

function updateSliderUI(idx) {
  const n    = SNAPSHOTS.length;
  const snap = SNAPSHOTS[idx];

  document.getElementById('ds-date').textContent = fmtDate(snap.date);
  document.getElementById('ds-pos').textContent  = n > 1 ? `${idx + 1} / ${n}` : '';
  document.getElementById('minfo-date').textContent = fmtDate(snap.date);

  if (n > 1) {
    const pct = n <= 1 ? 100 : (idx / (n - 1)) * 100;
    const range = document.getElementById('date-range');
    range.value = idx;
    range.style.setProperty('--fill', `${pct}%`);
    document.getElementById('ds-prev').disabled = idx <= 0;
    document.getElementById('ds-next').disabled = idx >= n - 1;
    // Highlight the current tick
    document.querySelectorAll('.ds-tick').forEach((t, i) =>
      t.classList.toggle('current', i === idx));
  }
}

// ── Load-error UI helpers ─────────────────────────────────
// Tracks whatever most recently failed so the Retry button can re-run it
// without the caller needing to remember snapshot discovery vs. a specific date.
let lastFailedAction = null; // 'discover' | { type: 'snapshot', idx }

function setLoadError(msg) {
  document.getElementById('load-msg').textContent  = msg;
  document.getElementById('mload-msg').textContent = msg;
  document.getElementById('load-bar').style.background = 'color-mix(in srgb, var(--red) 12%, var(--raised))';
  document.getElementById('load-spin').style.display  = 'none';
  document.getElementById('mload-spin').style.display = 'none';
  document.getElementById('load-retry').style.display  = 'inline-block';
  document.getElementById('mload-retry').style.display = 'inline-block';
  document.getElementById('load-bar').classList.remove('done');
  document.getElementById('mload').classList.remove('done');
}

function clearLoadError() {
  document.getElementById('load-bar').style.background = '';
  document.getElementById('load-spin').style.display  = '';
  document.getElementById('mload-spin').style.display = '';
  document.getElementById('load-retry').style.display  = 'none';
  document.getElementById('mload-retry').style.display = 'none';
}

function retryLoad() {
  clearLoadError();
  if (lastFailedAction === 'discover') discoverAndLoad();
  else if (lastFailedAction && lastFailedAction.type === 'snapshot') loadSnapshot(lastFailedAction.idx);
}

// ── Snapshot loading ──────────────────────────────────────
// Builds the same wplace.live deep-link the CSV's `url` column used to
// store per row — lat/lng come straight from regionCoords(), so this is
// only ever a fallback for CSVs that no longer include the (redundant,
// fully-derivable) url column. Matches the historical format exactly:
// https://wplace.live/?lat=<6dp>&lng=<6dp>&zoom=12
function buildWplaceUrl(lat, lng) {
  return `https://wplace.live/?lat=${lat.toFixed(6)}&lng=${lng.toFixed(6)}&zoom=12`;
}

function parseCSVData(data) {
  const rows = data
    .filter(r => r.regionId)
    .map(r => ({
      rank:     +r.rank     || 0,
      regionId: +r.regionId,
      name:     r.name      || `Region #${r.regionId}`,
      pixels:   +r.pixels   || 0,
      countryId:+r.countryId || 0,
      url:      r.url       || '' // filled in below from regionCoords() if the CSV omits it
    }));
  for (const r of rows) {
    r._ll = regionCoords(r.regionId);
    if (!r.url) r.url = buildWplaceUrl(r._ll[0], r._ll[1]);
  }
  return rows;
}

// ── Streaming CSV download with progress ─────────────────────────────────────
// PapaParse's worker:true + download:true cannot spawn a worker from a CDN
// script URL when served over HTTPS (strict same-origin Web Worker rule).
// We use the Fetch API instead — the download is fully async and non-blocking;
// the ~0.5s main-thread parse that follows is covered by the "Parsing…" notice.
async function fetchCSV(url, onProgress) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${res.statusText || 'fetch failed'} (${url})`);

  // Stream the body so we can report download progress
  const total  = +res.headers.get('content-length') || 0;
  const reader = res.body.getReader();
  const chunks = [];
  let   received = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    if (total && onProgress) onProgress(received / total);
  }

  // Concatenate all Uint8Array chunks into one string
  const merged = new Uint8Array(received);
  let   offset = 0;
  for (const c of chunks) { merged.set(c, offset); offset += c.length; }
  return new TextDecoder().decode(merged);
}

async function loadSnapshot(idx) {
  if (idx < 0 || idx >= SNAPSHOTS.length) return;
  currentSnapshotIdx = idx;
  updateSliderUI(idx);

  const snap   = SNAPSHOTS[idx];
  const reqIdx = idx;
  loadingSnapshotIdx = reqIdx;
  clearLoadError(); // clears any red/error state left over from a previous failed attempt

  // Serve from cache — no re-download needed
  if (snapshotCache.has(snap.date)) {
    rowsData = snapshotCache.get(snap.date);
    render(rowsData, snap);
    return;
  }

  const msgEl  = document.getElementById('mload-msg');
  document.getElementById('mload').classList.remove('done');
  msgEl.textContent = `Downloading ${fmtDate(snap.date)}… 0%`;

  try {
    const csvText = await fetchCSV(snap.url, pct => {
      if (loadingSnapshotIdx !== reqIdx) return;
      msgEl.textContent = `Downloading ${fmtDate(snap.date)}… ${Math.round(pct*100)}%`;
    });

    if (loadingSnapshotIdx !== reqIdx) return; // a newer click overtook this one

    msgEl.textContent = `Parsing…`;
    // yield one frame so the browser paints "Parsing…" before the sync parse
    await new Promise(r => requestAnimationFrame(r));

    const { data } = Papa.parse(csvText, { header: true, skipEmptyLines: true });
    if (loadingSnapshotIdx !== reqIdx) return;

    const rows = parseCSVData(data);
    if (!rows.length) throw new Error('CSV parsed but contained no valid rows');

    snapshotCache.set(snap.date, rows);
    rowsData = rows;
    render(rows, snap);
    document.getElementById('load-bar').classList.add('done');
    document.getElementById('mload').classList.add('done');
  } catch(err) {
    if (loadingSnapshotIdx !== reqIdx) return;
    lastFailedAction = { type: 'snapshot', idx: reqIdx };
    setLoadError(`Error: ${err.message}`);
  }
}

function stepSnapshot(dir) { loadSnapshot(currentSnapshotIdx + dir); }
function onSliderInput(val) { loadSnapshot(parseInt(val)); }

// ── Discover snapshots via manifest.json (preferred) ────────
// A tiny CDN-served JSON file listing available dates — no rate limit,
// unlike the GitHub Contents API fallback below. Doesn't exist until
// whatever generates the CSVs starts writing it.
async function fetchSnapshotListFromManifest() {
  const res = await fetch(MANIFEST_URL);
  if (!res.ok) throw new Error(`manifest.json not found (HTTP ${res.status})`);
  const dates = await res.json();
  if (!Array.isArray(dates)) throw new Error('manifest.json is not a JSON array');
  const list = dates
    .filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d))
    .sort()
    .map(date => ({
      date,
      url: `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${REPO_BRANCH}/${REPO_DIR}/${CSV_PREFIX}${date}.csv`
    }));
  if (!list.length) throw new Error('manifest.json contained no valid dates');
  return list;
}

// ── Discover snapshots via GitHub Contents API (fallback) ──
// Scans REPO_OWNER/REPO_NAME/REPO_DIR for files matching CSV_PREFIX + YYYY-MM-DD + .csv,
// sorts them oldest → newest, and builds the SNAPSHOTS list automatically.
// Rate-limited to 60 requests/hour per IP — only used when manifest.json is unavailable.
async function fetchSnapshotList() {
  const apiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${REPO_DIR}?ref=${REPO_BRANCH}`;
  const res = await fetch(apiUrl, {
    headers: { 'Accept': 'application/vnd.github.v3+json' }
  });
  if (!res.ok) {
    const hint = res.status === 403
      ? 'GitHub API rate limit hit — wait a minute and reload'
      : res.status === 404
      ? `Folder "${REPO_DIR}" not found in ${REPO_OWNER}/${REPO_NAME}`
      : `GitHub API returned ${res.status}`;
    throw new Error(hint);
  }
  const files = await res.json();
  const list = files
    .filter(f => f.type === 'file' && f.name.startsWith(CSV_PREFIX) && f.name.endsWith('.csv'))
    .map(f => ({
      date: f.name.slice(CSV_PREFIX.length, -4), // strip prefix + .csv → YYYY-MM-DD
      url:  `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${REPO_BRANCH}/${REPO_DIR}/${f.name}`
    }))
    .filter(s => /^\d{4}-\d{2}-\d{2}$/.test(s.date)) // skip any oddly named files
    .sort((a, b) => a.date.localeCompare(b.date));     // oldest → newest

  if (!list.length)
    throw new Error(`No files matching "${CSV_PREFIX}YYYY-MM-DD.csv" found in ${REPO_OWNER}/${REPO_NAME}/${REPO_DIR}`);
  return list;
}

// ── Auto-load ─────────────────────────────────────────────
async function discoverAndLoad() {
  clearLoadError();
  document.getElementById('mload').classList.remove('done');
  document.getElementById('mload-msg').textContent = 'Discovering snapshots…';

  let usedFallback = false;
  try {
    SNAPSHOTS = await fetchSnapshotListFromManifest();
  } catch (manifestErr) {
    try {
      SNAPSHOTS = await fetchSnapshotList();
    } catch (apiErr) {
      if (!FALLBACK_DATES.length) {
        lastFailedAction = 'discover';
        setLoadError(`Error: ${apiErr.message}`);
        return;
      }
      // Both manifest.json and the GitHub API failed — build SNAPSHOTS from
      // the hardcoded list instead of hanging on "Fetching leaderboard…".
      usedFallback = true;
      SNAPSHOTS = [...FALLBACK_DATES].sort().map(date => ({
        date,
        url: `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${REPO_BRANCH}/${REPO_DIR}/${CSV_PREFIX}${date}.csv`
      }));
    }
  }
  usingFallbackDates = usedFallback;

  currentSnapshotIdx = SNAPSHOTS.length - 1; // start on the newest
  const n = SNAPSHOTS.length;
  document.getElementById('load-msg').textContent = usingFallbackDates
    ? `Using ${n} cached snapshot${n === 1 ? '' : 's'} (live list unavailable)…`
    : `Found ${n} snapshot${n === 1 ? '' : 's'} — loading latest…`;
  initSlider();
  await loadSnapshot(currentSnapshotIdx);
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('minfo-pill').addEventListener('click', () => switchTab('info'));
  discoverAndLoad();
});

// ── Render ────────────────────────────────────────────────
function render(rows, snap) {
  selectedRegionId = null;
  selectedCountryId = null;
  updateSelectionMarker(null);
  clearCountryHighlight();
  map.closePopup();
  const totalPx = rows.reduce((s,r)=>s+r.pixels, 0);
  const maxPx   = rows.reduce((m,r)=>Math.max(m,r.pixels), 0);
  maxPxGlobal = maxPx;
  rowById = new Map(rows.map(r => [r.regionId, r])); // O(1) lookup for map clicks

  const numEl = document.getElementById('big-num');
  numEl.classList.remove('idle');
  animCount(numEl, totalPx);
  document.getElementById('minfo-count').textContent = `${rows.length.toLocaleString()} regions`;

  // ── Date & Info panel ──────────────────────────────────
  if (snap) {
    const dateStr  = fmtDate(snap.date);
    const filename = snap.url.split('/').pop();
    const repoUrl  = extractRepoUrl(snap.url);

    document.getElementById('minfo-date').textContent    = dateStr;
    document.getElementById('info-refdate').textContent  = dateStr;
    document.getElementById('info-reffile').textContent  = filename;
    document.getElementById('info-csvlink').href         = snap.url;
    document.getElementById('info-repolink').href        = repoUrl;
    document.getElementById('info-creditlink').href      = repoUrl;
  }

  renderStats(rows, totalPx, maxPx);
  setFilledOverlay(buildOffscreen(rows, maxPx));

  document.getElementById('searchinput').value = '';
  getVlist().load(applySort(rows), maxPx);
  buildCountryData(rows);
  if (currentView === 'countries') filterCountriesView('');
}

// ── Stats tab ─────────────────────────────────────────────
function renderStats(rows, totalPx, maxPx) {
  const n = rows.length;
  if (!n) return;
  const avgPx = totalPx / n;

  // Median — sort pixel values, pick middle
  const pxArr = [...rows].map(r=>r.pixels).sort((a,b)=>a-b);
  const medPx = n%2===1 ? pxArr[n>>1] : (pxArr[(n>>1)-1]+pxArr[n>>1])/2;

  const topRow  = rows.reduce((m,r)=>r.pixels>m.pixels?r:m, rows[0]);
  const aboveAvg = rows.filter(r=>r.pixels>avgPx).length;

  document.getElementById('st-regions').textContent  = n.toLocaleString();
  document.getElementById('st-max').textContent      = fmt(maxPx);
  document.getElementById('st-max-name').textContent = topRow.name;
  document.getElementById('st-avg').textContent      = fmt(Math.round(avgPx));
  document.getElementById('st-med').textContent      = fmt(Math.round(medPx));
  document.getElementById('st-above').textContent    = aboveAvg.toLocaleString();
  document.getElementById('st-above-sd').textContent = `${((aboveAvg/n)*100).toFixed(1)}% of all regions`;

  renderDistBar(pxArr, maxPx);
  renderDistInsights(pxArr, n);
  renderCountryStats(rows);
}

function renderDistBar(sortedPx, maxPx) {
  const n = sortedPx.length;
  const bar = document.getElementById('dist-bar');
  bar.innerHTML = '';
  const logMax = Math.log1p(maxPx) || 1;
  for (let i = 0; i < 10; i++) {
    const lo = Math.floor(i/10*n), hi = Math.floor((i+1)/10*n);
    const slice = sortedPx.slice(lo, hi);
    const avg = slice.reduce((s,v)=>s+v, 0) / (slice.length||1);
    const [r,g,b] = gradRGB(Math.log1p(avg)/logMax);
    const seg = document.createElement('div');
    seg.className = 'dist-seg';
    seg.style.background = `rgb(${r},${g},${b})`;
    const lo_v = fmt(sortedPx[lo] || 0);
    const hi_v = fmt(sortedPx[Math.min(hi,n)-1] || 0);
    seg.setAttribute('data-tip', `${i*10}–${(i+1)*10}%: ${lo_v}–${hi_v} px`);
    bar.appendChild(seg);
  }
}

function renderDistInsights(pxArr, n) {
  if (!n) return;
  // Trimmed mean — exclude bottom & top 10%
  const trimLo = Math.floor(n * 0.1), trimHi = Math.ceil(n * 0.9);
  const trimmed = pxArr.slice(trimLo, trimHi);
  const trimMean = trimmed.reduce((s,v)=>s+v,0) / (trimmed.length||1);
  // Standard deviation
  const mean = pxArr.reduce((s,v)=>s+v,0) / n;
  const variance = pxArr.reduce((s,v)=>s+(v-mean)**2,0) / n;
  const std = Math.sqrt(variance);
  // Coefficient of variation
  const cv = mean > 0 ? (std / mean * 100) : 0;
  // Percentiles (pxArr is already sorted ascending)
  const p10 = pxArr[Math.floor(n * 0.10)] || 0;
  const p90 = pxArr[Math.min(Math.floor(n * 0.90), n-1)] || 0;

  document.getElementById('st-trim').textContent    = fmt(Math.round(trimMean));
  document.getElementById('st-trim-sd').textContent = `middle ${trimmed.length.toLocaleString()} of ${n.toLocaleString()} regions`;
  document.getElementById('st-std').textContent     = fmt(Math.round(std));
  document.getElementById('st-cv').textContent      = cv.toFixed(1) + '%';
  document.getElementById('st-p10').textContent     = fmt(p10);
  document.getElementById('st-p90').textContent     = fmt(p90);
}

// Clicking a country row in Countries view jumps to that country's regions —
// switches to the Regions tab, filters the list by country name, washes all
// of that country's regions on the map, and fits the view to show them.
// Clicking the same country again toggles the highlight off.
function goToCountry(id) {
  if (selectedCountryId === id) {
    deselectCountry();
    return;
  }

  const countryRows = countryRegionsMap.get(id) || [];
  if (!countryRows.length) return;

  selectedCountryId = id;
  setCountryHighlight(id);

  // A country highlight replaces any individual region selection
  selectedRegionId = null;
  updateSelectionMarker(null);

  const nm = cName(id) || ('Country ' + id);
  setView('regions');
  const si = document.getElementById('searchinput');
  si.value = nm;
  getVlist().filterByCountryId(id);

  if (countryRows.length === 1) {
    map._stop();
    map.flyTo(countryRows[0]._ll, REGION_FLY_ZOOM, { duration: REGION_FLY_DURATION });
  } else {
    map._stop();
    const bounds = L.latLngBounds(countryRows.map(r => r._ll));
    map.flyToBounds(bounds.pad(0.2), { maxZoom: REGION_FLY_ZOOM, duration: REGION_FLY_DURATION });
  }

  closeMobileSidebarIfNeeded();
}

let countryData = [];
// countryId → array of that country's row objects, rebuilt once per snapshot
// load. Both goToCountry() and the highlight-canvas painter used to run
// their own full scan over rowsData (up to hundreds of thousands of rows)
// every single time a country was clicked; this map turns that into an O(1)
// lookup, reusing the single pass buildCountryData() already makes for stats.
let countryRegionsMap = new Map();

function buildCountryData(rows) {
  const tot={}, cnt={};
  countryRegionsMap = new Map();
  for (const r of rows) {
    if (!r.countryId) continue;
    tot[r.countryId] = (tot[r.countryId]||0) + r.pixels;
    cnt[r.countryId] = (cnt[r.countryId]||0) + 1;
    let bucket = countryRegionsMap.get(r.countryId);
    if (!bucket) countryRegionsMap.set(r.countryId, bucket = []);
    bucket.push(r);
  }
  countryData = Object.keys(tot)
    .map(id => ({id:+id, px:tot[id], n:cnt[id]}))
    .sort((a,b) => b.px - a.px);
  countryData.forEach((c, i) => c.rank = i + 1);
}

function filterCountriesView(q) {
  const s = q.trim().toLowerCase();
  // Filter by name
  const base = s ? countryData.filter(c => cName(c.id).toLowerCase().includes(s)) : [...countryData];
  // Apply sort
  base.sort((a, b) => {
    const av = ctySortKey === 'px' ? a.px : a.n;
    const bv = ctySortKey === 'px' ? b.px : b.n;
    return ctySortDir === 'asc' ? av - bv : bv - av;
  });
  renderCountriesLeaderboard(base, q.trim());
  const el = document.getElementById('srcount');
  if (el) {
    el.textContent = base.length < countryData.length
      ? `${base.length} of ${countryData.length} countries`
      : `${countryData.length} countries`;
    el.classList.toggle('empty-hint', base.length===0);
  }
}

function renderCountriesLeaderboard(list, query) {
  const el = document.getElementById('lc-panel');
  if (!el) return;

  if (!list.length) {
    el.replaceChildren();
    const row = document.createElement('div');
    row.className = 'empty-row';
    row.textContent = query ? `No countries match "${query}"` : 'No countries to show';
    el.appendChild(row);
    return;
  }

  // Always use the global pixel max so bars stay proportional across sort changes
  const mx = countryData.reduce((m,c)=>Math.max(m,c.px),0) || 1;
  const frag = document.createDocumentFragment();
  list.forEach(({id, px, n, rank}) => {
    const d = document.createElement('div');
    let cls = 'cty-lb-row';
    if (rank===1) cls+=' rank-gold';
    else if (rank===2) cls+=' rank-silver';
    else if (rank===3) cls+=' rank-bronze';
    if (id === selectedCountryId) cls+=' selected';
    d.className = cls;
    const nm = cName(id) || 'Country ' + id;
    d.innerHTML =
      `<span class="lrank">${rank}</span>`+
      `<span class="lid"></span>`+
      `<span class="lname" title="${nm}"><span class="flag-ic">${cFlag(id)}</span><span class="lname-txt">${nm}</span></span>`+
      `<div class="lbar-w"><div class="lbar" style="width:${(px/mx*100).toFixed(1)}%"></div></div>`+
      `<span class="lval">${fmt(px)}</span>`+
      `<span class="cty-reg-cnt">${n.toLocaleString()}</span>`;
    const activate = () => goToCountry(id);
    d.addEventListener('click', activate);
    makeActivatable(d, activate);
    frag.appendChild(d);
  });
  el.replaceChildren(frag);
}

function renderCountryStats(rows) {
  const tot={}, cnt={};
  for (const r of rows) {
    if (!r.countryId) continue;
    tot[r.countryId] = (tot[r.countryId]||0) + r.pixels;
    cnt[r.countryId] = (cnt[r.countryId]||0) + 1;
  }
  const ids = Object.keys(tot).map(Number);
  if (!ids.length) return;
  const activeCount = ids.length;
  const totalPx     = ids.reduce((s,id)=>s+tot[id], 0);
  const totalReg    = ids.reduce((s,id)=>s+cnt[id], 0);
  const topPxId     = ids.reduce((a,b)=>tot[a]>tot[b]?a:b);
  const topRegId    = ids.reduce((a,b)=>cnt[a]>cnt[b]?a:b);
  // Painting density — total pixels ÷ that country's own region count.
  // Distinct from "Top Country by Pixels" (a raw total, which a country
  // can lead just by having more regions): this surfaces whichever
  // country's regions are painted most intensely on average.
  const density     = id => tot[id] / cnt[id];
  const topDensityId = ids.reduce((a,b)=> density(a) > density(b) ? a : b);
  const set = (id,v) => { const e=document.getElementById(id); if(e) e.textContent=v; };
  set('st-cty-count',        activeCount.toLocaleString());
  set('st-cty-avg-reg',      (totalReg/activeCount).toFixed(1));
  set('st-cty-top-px',       fmt(tot[topPxId]));
  set('st-cty-top-px-name',  `${cFlag(topPxId)} ${cName(topPxId)||'Country '+topPxId}`);
  set('st-cty-density',      fmt(Math.round(density(topDensityId))));
  set('st-cty-density-name', `${cFlag(topDensityId)} ${cName(topDensityId)||'Country '+topDensityId}`);
  // Value stays a bare number — matches every other .sv in this tab; the
  // unit ("regions") lives only in the .sl caption above, same as elsewhere.
  set('st-cty-top-reg',      cnt[topRegId].toLocaleString());
  set('st-cty-top-reg-name', `${cFlag(topRegId)} ${cName(topRegId)||'Country '+topRegId}`);
  set('st-cty-avg-px',       fmt(Math.round(totalPx/activeCount)));
}

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
  if (currentView === 'countries') filterCountriesView(document.getElementById('searchinput').value);
}

function deselectRegion() {
  selectedRegionId = null;
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
    const asideEl = document.querySelector('aside');
    if (asideEl && !asideEl.classList.contains('folded')) toggleSidebar();
  }
}

// ── Heatmap-only mode — hides the base map tiles + place labels, leaving
// just the coloured region squares (and any highlight/selection indicators).
function toggleHeatmapOnly() {
  heatmapOnly = !heatmapOnly;
  document.getElementById('map').classList.toggle('heatmap-only', heatmapOnly);
  document.getElementById('heatmap-toggle').classList.toggle('on', heatmapOnly);
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
  btn.title = heatmapVisible ? 'Hide the pixel-count heatmap (keep the base map)' : 'Show the pixel-count heatmap';
  btn.innerHTML = heatmapVisible ? ICON_EYE : ICON_EYE_OFF;
}

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
  updateSelectionMarker(null); // hide immediately — flyTo() redraws it once the flight settles
  flyTo(r);
  if (vlist) {
    vlist._key = null;
    vlist._paint();
    if (scroll) vlist.scrollToRegion(r.regionId);
  }
  closeMobileSidebarIfNeeded();
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

// ── Sidebar toggle ────────────────────────────────────────
function toggleSidebar() {
  const asideEl = document.querySelector('aside');
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
  document.querySelector('aside').classList.add('folded');
  document.getElementById('sidebar-reopen').style.display = 'flex';
}

// ── Sidebar resize handle ─────────────────────────────────
(function() {
  const handle  = document.getElementById('resize-handle');
  const asideEl = document.querySelector('aside');
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
    const newW = Math.min(620, Math.max(260, startW + e.clientX - startX));
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
  } else if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && document.activeElement !== search && SNAPSHOTS.length > 1) {
    e.preventDefault();
    stepSnapshot(e.key === 'ArrowLeft' ? -1 : 1);
  }
});