// render-stats.js — renders a loaded snapshot: the big pixel counter,
// the Stats tab, and both the regions and countries leaderboards.

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
  refreshHeatmapOverlay();

  document.getElementById('searchinput').value = '';
  buildCountryData(rows);
  applyRegionSort(false);
  if (currentView === 'countries') applyCountrySort(false);
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
  openCountryTrend(id);
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
    const av = ctySortKey === 'px' ? a.px
      : ctySortKey === 'delta' ? (countryDeltaById ? (countryDeltaById.get(a.id) || 0) : 0)
      : ctySortKey === 'avg' ? (a.n ? a.px / a.n : 0)
      : a.n;
    const bv = ctySortKey === 'px' ? b.px
      : ctySortKey === 'delta' ? (countryDeltaById ? (countryDeltaById.get(b.id) || 0) : 0)
      : ctySortKey === 'avg' ? (b.n ? b.px / b.n : 0)
      : b.n;
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

  const isDelta = ctySortKey === 'delta' && countryDeltaById;
  const isAvg   = ctySortKey === 'avg';
  // Always use the global max (matching whichever metric is active) so
  // bars stay proportional across sort/filter changes.
  let mx;
  if (isDelta) {
    mx = 0;
    for (const c of countryData) { const d = countryDeltaById.get(c.id) || 0; if (d > mx) mx = d; }
    mx = mx || 1;
  } else if (isAvg) {
    mx = 0;
    for (const c of countryData) { const v = c.n ? c.px / c.n : 0; if (v > mx) mx = v; }
    mx = mx || 1;
  } else {
    mx = countryData.reduce((m,c)=>Math.max(m,c.px),0) || 1;
  }
  const frag = document.createDocumentFragment();
  list.forEach(({id, px, n, rank}) => {
    const deltaVal = isDelta ? (countryDeltaById.get(id) || 0) : null;
    const avgVal   = isAvg ? (n ? px / n : 0) : null;
    const barVal = isDelta ? deltaVal : isAvg ? avgVal : px;
    const d = document.createElement('div');
    let cls = 'cty-lb-row';
    // Medal colours reflect cumulative pixel rank — suppress them for
    // delta/avg modes so a country isn't misleadingly highlighted gold
    // for a metric it's not actually top-3 in.
    if (!isDelta && !isAvg) {
      if (rank===1) cls+=' rank-gold';
      else if (rank===2) cls+=' rank-silver';
      else if (rank===3) cls+=' rank-bronze';
    }
    if (id === selectedCountryId) cls+=' selected';
    d.className = cls;
    const nm = cName(id) || 'Country ' + id;
    const valText = isDelta ? (deltaVal>0?'+':'') + fmt(deltaVal) : isAvg ? fmt(avgVal) : fmt(px);
    d.innerHTML =
      `<span class="lrank">${rank}</span>`+
      `<span class="lid"></span>`+
      `<span class="lname" title="${nm}"><span class="flag-ic">${cFlag(id)}</span><span class="lname-txt">${nm}</span></span>`+
      `<div class="lbar-w"><div class="lbar" style="width:${(barVal/mx*100).toFixed(1)}%"></div></div>`+
      `<span class="lval">${valText}</span>`+
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

