// data-loading.js — app-wide state, CSV fetching/parsing, snapshot
// discovery (manifest.json → GitHub API → hardcoded fallback), and the
// timeline slider.

// ── State ─────────────────────────────────────────────────
let rowsData=[], maxPxGlobal=1, selectedRegionId=null, rowById=new Map();
let selectedCountryId=null, selectionRect=null;
let countryHighlightOverlay=null, countryHighlightBlobUrl=null;
let heatmapOnly=false;

// ── Shareable deep links ────────────────────────────────────
// Keeps ?region=/?country=/?date= in the URL in sync with the current
// selection, so a link can be copied and shared to point straight at a
// specific region, country, or snapshot date. Uses replaceState (not
// pushState) — the URL always reflects "what you're looking at right
// now", not a navigation history, so clicking around never fights with
// the browser's own back button.
function updateUrlParams(updates) {
  try {
    const url = new URL(window.location.href);
    for (const [key, value] of Object.entries(updates)) {
      if (value == null) url.searchParams.delete(key);
      else url.searchParams.set(key, value);
    }
    history.replaceState(null, '', url);
  } catch (e) {}
}

// Parsed once at load — whatever ?region=/?country=/?date= the page was
// opened with, if any.
const deepLinkParams = new URLSearchParams(window.location.search);
let pendingDeepLinkApplied = false; // true once the initial region/country link (if any) has been tried, so it never re-fires on a later snapshot change

// Called once, right after the first snapshot ever renders (rowById and
// countryRegionsMap only become valid at that point). Selecting a region
// takes precedence if a link somehow specifies both.
function applyPendingDeepLink() {
  if (pendingDeepLinkApplied) return;
  pendingDeepLinkApplied = true;
  const wantedRegion = deepLinkParams.get('region');
  if (wantedRegion) {
    const row = rowById.get(parseInt(wantedRegion, 10));
    if (row) { selectRegion(row, true); return; }
  }
  const wantedCountry = deepLinkParams.get('country');
  if (wantedCountry) {
    const cid = parseInt(wantedCountry, 10);
    if (countryRegionsMap.has(cid)) goToCountry(cid);
  }
}

// Called from the region popup's "Copy link" button — the URL is already
// synced to the current region/date by the time that popup exists (see
// selectRegion()/loadSnapshot() above), so this just needs to copy it.
function copyShareLink(btn) {
  const url = window.location.href;
  const showCopied = () => {
    const original = btn.innerHTML;
    btn.innerHTML = ICON_CHECK;
    btn.title = 'Copied!';
    setTimeout(() => { btn.innerHTML = original; btn.title = 'Copy link to this region'; }, 1500);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(showCopied).catch(() => {});
  } else {
    // Fallback for contexts without the async Clipboard API (e.g. non-HTTPS)
    try {
      const ta = document.createElement('textarea');
      ta.value = url;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showCopied();
    } catch (e) {}
  }
}

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

// ── Background prefetch ───────────────────────────────────
// After a snapshot successfully renders, quietly fetch the immediately
// adjacent dates too (no loading UI, no error UI) so the most common
// interaction — stepping the timeline slider through nearby dates — feels
// instant instead of starting a fresh download each click. Purely an
// optimization: if a prefetch fails, loadSnapshot() will just do a normal
// (visible, error-handled) fetch when the user actually navigates there.
const prefetchingDates = new Set(); // in-flight prefetch dates, de-dupes rapid slider stepping

async function prefetchSnapshot(idx) {
  if (idx < 0 || idx >= SNAPSHOTS.length) return;
  const snap = SNAPSHOTS[idx];
  if (snapshotCache.has(snap.date) || prefetchingDates.has(snap.date)) return;
  prefetchingDates.add(snap.date);
  try {
    const csvText = await fetchCSV(snap.url);
    const { data } = Papa.parse(csvText, { header: true, skipEmptyLines: true });
    const rows = parseCSVData(data);
    if (rows.length) snapshotCache.set(snap.date, rows);
  } catch (err) {
    // Silent by design — see comment above.
  } finally {
    prefetchingDates.delete(snap.date);
  }
}

function prefetchAdjacentSnapshots(idx) {
  // Respect Data Saver mode where the browser exposes it (mainly Chromium) —
  // a user who's opted into reduced data usage shouldn't get uninvited
  // multi-megabyte downloads just for stepping near their current date.
  if (navigator.connection && navigator.connection.saveData) return;
  // Deferred to an idle moment rather than fired immediately: the actual
  // CSV parse (Papa.parse + parseCSVData) that follows the download is
  // synchronous and blocks the main thread for a real, measurable span —
  // fine when it's a foreground load the user is already waiting on, but
  // this is a background optimization, so it shouldn't get a chance to
  // stall an active scroll or interaction right after a snapshot loads.
  // requestIdleCallback isn't in Safari, hence the setTimeout fallback.
  const schedule = window.requestIdleCallback || (fn => setTimeout(fn, 300));
  schedule(() => {
    prefetchSnapshot(idx - 1);
    prefetchSnapshot(idx + 1);
  });
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
    updateUrlParams({ date: snap.date });
    applyPendingDeepLink();
    prefetchAdjacentSnapshots(idx);
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
    updateUrlParams({ date: snap.date });
    applyPendingDeepLink();
    prefetchAdjacentSnapshots(idx);
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

  currentSnapshotIdx = SNAPSHOTS.length - 1; // start on the newest, unless a ?date= link says otherwise
  const wantedDate = deepLinkParams.get('date');
  if (wantedDate) {
    const idx = SNAPSHOTS.findIndex(s => s.date === wantedDate);
    if (idx >= 0) currentSnapshotIdx = idx;
  }

  const n = SNAPSHOTS.length;
  document.getElementById('load-msg').textContent = usingFallbackDates
    ? `Using ${n} cached snapshot${n === 1 ? '' : 's'} (live list unavailable)…`
    : `Found ${n} snapshot${n === 1 ? '' : 's'} — loading latest…`;
  initSlider();
  await loadSnapshot(currentSnapshotIdx);
}