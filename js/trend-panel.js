// trend-panel.js — the right-hand pixel-history panel for a selected
// region or country.

// ── Trend panel (region or country) ────────────────────────
// Builds a pixel-count-over-time chart by pulling one value out of each
// of the most recent snapshot CSVs — a single region's row, or a
// country's regions summed. There's no separate history file — each
// date's full CSV has to be downloaded once (same fetchCSV/parseCSVAsync
// pipeline as the main loader) and the result lands in the same
// snapshotCache the timeline slider uses, so browsing dates and opening
// trends for different regions/countries all get cheaper over a session
// as more dates end up cached.
let trendMode        = null; // 'region' | 'country' | null
let trendEntityId    = null; // the regionId or countryId currently shown
let trendFetchToken  = 0;    // guards against overlapping fetches from rapid switching

// Capping the window keeps a trend panel's worst-case cost bounded
// forever, instead of re-downloading every snapshot the project has ever
// produced — at weekly snapshots, 26 is roughly six months, which is
// plenty to see a real trend without the wait growing every single week.
const TREND_MAX_SNAPSHOTS = 26;
// Fetched with limited concurrency rather than one at a time, so opening
// a trend panel takes roughly (window size ÷ concurrency) round-trips,
// not (window size) of them. Bumped from 5 to 8 as an experiment — both
// jsDelivr and GitHub's raw-file serving use HTTP/2, which multiplexes
// many requests over one connection rather than the old ~6-per-domain
// HTTP/1.1 ceiling, so there's plausibly headroom above 5. Untested
// against real network conditions though (nothing in this environment
// can measure that) — worth watching the Network tab on a real trend
// panel load and tuning down if requests start queuing or a slow/mobile
// connection feels worse, not better.
const TREND_FETCH_CONCURRENCY = 8;

function isTrendPanelOpen() {
  return !document.getElementById('trend-panel').classList.contains('closed');
}

function openRegionTrend(regionId) {
  const row = rowById.get(regionId);
  if (!row) return;
  trendMode = 'region';
  trendEntityId = regionId;
  document.getElementById('trend-panel').classList.remove('closed');
  document.getElementById('trend-title').textContent = row.name;
  renderTrendLoading(0, Math.min(SNAPSHOTS.length, TREND_MAX_SNAPSHOTS));
  loadTrendSeries(
    rows => { const r = rows.find(rr => rr.regionId === regionId); return r ? r.pixels : null; },
    points => renderTrendChart(row.name, points)
  );
  closeMobileSidebarIfNeeded(); // room for the trend panel on a phone-width screen
  setTimeout(() => map.invalidateSize(), 270); // matches the panel's width transition
}

function openCountryTrend(countryId) {
  const nm = cName(countryId) || ('Country ' + countryId);
  trendMode = 'country';
  trendEntityId = countryId;
  document.getElementById('trend-panel').classList.remove('closed');
  document.getElementById('trend-title').textContent = nm;
  renderTrendLoading(0, Math.min(SNAPSHOTS.length, TREND_MAX_SNAPSHOTS));
  loadTrendSeries(
    rows => {
      let sum = 0, any = false;
      for (const r of rows) if (r.countryId === countryId) { sum += r.pixels; any = true; }
      return any ? sum : null;
    },
    points => renderTrendChart(nm, points)
  );
  setTimeout(() => map.invalidateSize(), 270);
}

function closeTrendPanel() {
  document.getElementById('trend-panel').classList.add('closed');
  trendMode = null;
  trendEntityId = null;
  trendFetchToken++; // invalidate any fetch still in flight
  setTimeout(() => map.invalidateSize(), 270);
}

function renderTrendLoading(done, total) {
  document.getElementById('trend-body').innerHTML = `
    <div id="trend-loading">
      <div class="spin"></div>
      <span>Loading history… ${done}/${total}</span>
    </div>`;
}

// Shared driver: walks the most recent TREND_MAX_SNAPSHOTS snapshots
// (downloading + caching any not already in snapshotCache, up to
// TREND_FETCH_CONCURRENCY at once), pulls one value per date via
// `extract(rows)`, and hands the finished {date, pixels}[] series
// (oldest→newest, order preserved despite out-of-order completion) to
// `onDone`. `extract` returning null leaves a gap in that date's line
// instead of a hard stop.
async function loadTrendSeries(extract, onDone) {
  const token = ++trendFetchToken;
  const snaps = SNAPSHOTS.slice(-TREND_MAX_SNAPSHOTS); // most recent N; harmless no-op if fewer exist
  const points = new Array(snaps.length);
  let completed = 0;

  async function fetchOne(i) {
    const snap = snaps[i];
    let rows = snapshotCache.get(snap.date) || await readSnapshotFromIdb(snap.date);
    if (token !== trendFetchToken) return; // superseded while the IndexedDB read was in flight

    if (rows) {
      snapshotCache.set(snap.date, rows);
    } else {
      try {
        const csvText = await fetchCSV(snap.url);
        if (token !== trendFetchToken) return; // superseded mid-download
        rows = await parseCSVAsync(csvText, null, () => token !== trendFetchToken);
        cacheSnapshot(snap.date, rows);
      } catch (err) {
        if (token !== trendFetchToken) return;
        points[i] = { date: snap.date, pixels: null }; // gap in the line, not a hard failure
        completed++;
        renderTrendLoading(completed, snaps.length);
        return;
      }
    }

    if (token !== trendFetchToken) return;
    points[i] = { date: snap.date, pixels: extract(rows) };
    completed++;
    renderTrendLoading(completed, snaps.length);
  }

  // Each worker repeatedly claims the next unclaimed index, so at most
  // TREND_FETCH_CONCURRENCY fetches are ever in flight at once; `points`
  // is written by index, so final order stays oldest→newest regardless
  // of which fetch happens to finish first.
  let nextIdx = 0;
  async function worker() {
    while (nextIdx < snaps.length) {
      const i = nextIdx++;
      await fetchOne(i);
      if (token !== trendFetchToken) return;
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(TREND_FETCH_CONCURRENCY, snaps.length) }, worker)
  );

  if (token !== trendFetchToken) return;
  onDone(points);
}

function renderTrendChart(label, points) {
  const valid = points.filter(p => p.pixels != null);
  if (!valid.length) {
    document.getElementById('trend-body').innerHTML =
      `<div class="empty-row">No pixel data available across any snapshot.</div>`;
    return;
  }

  const W = 288, H = 168, padL = 46, padR = 10, padT = 14, padB = 26;
  const innerW = W - padL - padR, innerH = H - padT - padB;
  const n = points.length;

  const xAt = i => padL + (n > 1 ? i * innerW / (n - 1) : innerW / 2);
  const vals = valid.map(p => p.pixels);
  const min = Math.min(...vals), max = Math.max(...vals);
  const span = max - min || 1;
  const yAt = px => (H - padB) - ((px - min) / span) * innerH;

  // Build one <polyline> per unbroken run of non-null points, so a gap
  // (a date whose CSV failed to load) breaks the line instead of
  // stitching straight across missing data.
  const segments = [];
  let current = [];
  points.forEach((p, i) => {
    if (p.pixels == null) { if (current.length > 1) segments.push(current); current = []; return; }
    current.push(`${xAt(i).toFixed(1)},${yAt(p.pixels).toFixed(1)}`);
  });
  if (current.length > 1) segments.push(current);
  const polylines = segments.map(seg =>
    `<polyline points="${seg.join(' ')}" fill="none" stroke="var(--accent)" stroke-width="2"/>`
  ).join('');

  const dots = points.map((p, i) => p.pixels == null ? '' : `
    <circle class="trend-dot" cx="${xAt(i).toFixed(1)}" cy="${yAt(p.pixels).toFixed(1)}" r="3.2">
      <title>${fmtDate(p.date)}: ${p.pixels.toLocaleString()} px</title>
    </circle>`).join('');

  const first = valid[0].pixels, latest = valid[valid.length - 1].pixels;
  const delta = latest - first;
  const deltaClass = delta > 0 ? 'up' : delta < 0 ? 'down' : '';
  const deltaStr = (delta > 0 ? '+' : delta < 0 ? '−' : '±') + fmt(Math.abs(delta));

  document.getElementById('trend-body').innerHTML = `
    <div class="trend-summary">
      <div class="trend-summary-val">${fmt(latest)}</div>
      <div class="trend-summary-sub ${deltaClass}">${deltaStr} over ${n} snapshot${n===1?'':'s'}</div>
    </div>
    <svg viewBox="0 0 ${W} ${H}" class="trend-svg">
      <line x1="${padL}" y1="${padT}" x2="${padL}" y2="${H-padB}" class="trend-axis-line"/>
      <line x1="${padL}" y1="${H-padB}" x2="${W-padR}" y2="${H-padB}" class="trend-axis-line"/>
      <text x="${padL-6}" y="${padT+4}" text-anchor="end" class="trend-axis-label">${fmt(max)}</text>
      <text x="${padL-6}" y="${H-padB+4}" text-anchor="end" class="trend-axis-label">${fmt(min)}</text>
      <text x="${xAt(0).toFixed(1)}" y="${H-8}" text-anchor="start" class="trend-axis-label">${fmtDate(points[0].date)}</text>
      <text x="${xAt(n-1).toFixed(1)}" y="${H-8}" text-anchor="end" class="trend-axis-label">${fmtDate(points[n-1].date)}</text>
      ${polylines}
      ${dots}
    </svg>`;
}