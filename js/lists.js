// lists.js — sidebar tab switching, region/country sort state, the
// change-since-previous-snapshot (delta) computation shared with the
// heatmap and trend panel, the virtual-scrolling region list, and search.

// ── Tab switching ─────────────────────────────────────────
function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab===tab));
  document.getElementById('panel-list').classList.toggle('active', tab==='list');
  document.getElementById('panel-stats').classList.toggle('active', tab==='stats');
  document.getElementById('panel-info').classList.toggle('active', tab==='info');
  if (tab === 'stats' && rowsData.length) renderTopGainer();
}

// ── Sort ──────────────────────────────────────────────────
let sortKey = 'px', sortDir = 'desc';

// Default direction when a column is first clicked
const SORT_DEFAULTS = { px: 'desc', id: 'asc', delta: 'desc' };

let currentView = 'regions';
let ctySortKey = 'px', ctySortDir = 'desc';

// Populated (async) only once 'Change' sort is selected for either list —
// see getRegionDeltaMap()/getCountryDeltaMap() further down.
let regionDeltaById  = null; // Map<regionId, delta>
let countryDeltaById = null; // Map<countryId, delta>
let regionListToken  = 0;    // guards applyRegionSort() against overlapping fetches
let countryListToken = 0;    // guards applyCountrySort() against overlapping fetches

function setCtySort(key) {
  // Same key → toggle direction; new key → default to descending
  ctySortDir = (ctySortKey === key) ? (ctySortDir === 'asc' ? 'desc' : 'asc') : 'desc';
  ctySortKey = key;
  updateCtySortUI();
  try { localStorage.setItem('wplace-sort-country', JSON.stringify({ key: ctySortKey, dir: ctySortDir })); } catch (e) {}
  applyCountrySort(true);
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
  try { localStorage.setItem('wplace-view', v); } catch (e) {}
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
  try { localStorage.setItem('wplace-sort-region', JSON.stringify({ key: sortKey, dir: sortDir })); } catch (e) {}
  if (rowsData.length) applyRegionSort(true);
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
    const av = sortKey==='id' ? a.regionId : sortKey==='delta' ? (regionDeltaById ? (regionDeltaById.get(a.regionId) || 0) : 0) : a.pixels;
    const bv = sortKey==='id' ? b.regionId : sortKey==='delta' ? (regionDeltaById ? (regionDeltaById.get(b.regionId) || 0) : 0) : b.pixels;
    return sortDir==='asc' ? av-bv : bv-av;
  });
}

// ── Delta (change-since-previous-snapshot) data ────────────
// Shared by the heatmap's Δ mode, the regions list's "Change" sort, and
// the countries list's "Change" sort — all three ultimately need the same
// per-region deltas, so this is fetched/cached once per snapshot pairing
// rather than up to three times. Cached by snapshot index, so switching
// between the three consumers (or revisiting a date) reuses the same data.
let regionDeltaCache = null; // { forSnapshotIdx, prevDate, map, countryMap }
let regionDeltaInFlight = null; // { forSnapshotIdx, promise } — de-dupes concurrent callers

async function getRegionDeltaMap() {
  if (currentSnapshotIdx <= 0) return null; // earliest snapshot — nothing earlier to diff against
  if (regionDeltaCache && regionDeltaCache.forSnapshotIdx === currentSnapshotIdx) return regionDeltaCache;

  // The heatmap's Δ mode and both lists' "Change" sort can all call this
  // for the same snapshot pairing from the same render() — share one
  // in-flight fetch instead of letting each kick off its own concurrent
  // download of the identical comparison CSV.
  if (regionDeltaInFlight && regionDeltaInFlight.forSnapshotIdx === currentSnapshotIdx) {
    return regionDeltaInFlight.promise;
  }

  const forSnapshotIdx = currentSnapshotIdx;
  const promise = (async () => {
    const prevSnap = SNAPSHOTS[forSnapshotIdx - 1];
    let prevRows = snapshotCache.get(prevSnap.date);
    if (!prevRows) {
      const csvText = await fetchCSV(prevSnap.url);
      const { data } = Papa.parse(csvText, { header: true, skipEmptyLines: true });
      prevRows = parseCSVData(data);
      snapshotCache.set(prevSnap.date, prevRows);
    }
    const prevById = new Map(prevRows.map(r => [r.regionId, r.pixels]));
    // Clamped to 0: a negative delta can only come from the top-50-per-region
    // cap shifting who counts (see the Accuracy & Limitations note), not an
    // actual loss of painted pixels, so it's treated as "no visible growth".
    const map = new Map();
    for (const r of rowsData) map.set(r.regionId, Math.max(0, r.pixels - (prevById.get(r.regionId) || 0)));
    const result = { forSnapshotIdx, prevDate: prevSnap.date, map, countryMap: null };
    regionDeltaCache = result;
    return result;
  })();

  regionDeltaInFlight = { forSnapshotIdx, promise };
  try {
    return await promise;
  } finally {
    if (regionDeltaInFlight && regionDeltaInFlight.forSnapshotIdx === forSnapshotIdx) regionDeltaInFlight = null;
  }
}

async function getCountryDeltaMap() {
  const info = await getRegionDeltaMap();
  if (!info) return null;
  if (!info.countryMap) {
    const cmap = new Map();
    for (const r of rowsData) {
      if (!r.countryId) continue;
      cmap.set(r.countryId, (cmap.get(r.countryId) || 0) + (info.map.get(r.regionId) || 0));
    }
    info.countryMap = cmap;
  }
  return { prevDate: info.prevDate, map: info.countryMap };
}

// Ensures the regions list reflects the current sortKey, fetching a
// comparison snapshot first if sortKey==='delta' and it isn't cached yet.
// Called both on explicit sort changes and from render() on every new
// snapshot load (since a 'delta' sort's comparison pairing shifts whenever
// the current date does).
async function applyRegionSort(showLoadingUI) {
  const token = ++regionListToken;

  if (sortKey === 'delta') {
    if (showLoadingUI) {
      const srEl = document.getElementById('srcount');
      srEl.textContent = 'Loading comparison snapshot…';
      srEl.classList.remove('empty-hint');
    }
    let info;
    try {
      info = await getRegionDeltaMap();
    } catch (err) {
      if (token !== regionListToken || sortKey !== 'delta') return;
      const srEl = document.getElementById('srcount');
      srEl.textContent = "Couldn't load comparison snapshot.";
      srEl.classList.add('empty-hint');
      return;
    }
    if (token !== regionListToken || sortKey !== 'delta') return;
    regionDeltaById = info ? info.map : null;
  } else {
    regionDeltaById = null;
  }
  if (token !== regionListToken) return;

  document.getElementById('col-h-pixels').textContent = sortKey === 'delta' ? 'Change' : 'Pixels';

  if (sortKey === 'delta' && !regionDeltaById) {
    getVlist().load([], 1);
    const srEl = document.getElementById('srcount');
    srEl.textContent = 'No earlier snapshot to compare against.';
    srEl.classList.add('empty-hint');
    return;
  }

  let maxForBar = maxPxGlobal;
  if (sortKey === 'delta') {
    let m = 0;
    for (const r of rowsData) { const d = regionDeltaById.get(r.regionId) || 0; if (d > m) m = d; }
    maxForBar = m || 1;
  }

  const q = document.getElementById('searchinput').value;
  getVlist().load(applySort(rowsData), maxForBar);
  if (q) getVlist().filter(q);
}

// Countries-list equivalent of applyRegionSort() above.
async function applyCountrySort(showLoadingUI) {
  const token = ++countryListToken;

  if (ctySortKey === 'delta') {
    if (showLoadingUI) {
      const srEl = document.getElementById('srcount');
      srEl.textContent = 'Loading comparison snapshot…';
      srEl.classList.remove('empty-hint');
    }
    let info;
    try {
      info = await getCountryDeltaMap();
    } catch (err) {
      if (token !== countryListToken || ctySortKey !== 'delta') return;
      const srEl = document.getElementById('srcount');
      srEl.textContent = "Couldn't load comparison snapshot.";
      srEl.classList.add('empty-hint');
      return;
    }
    if (token !== countryListToken || ctySortKey !== 'delta') return;
    countryDeltaById = info ? info.map : null;
  } else {
    countryDeltaById = null;
  }
  if (token !== countryListToken) return;

  document.getElementById('cty-col-h-pixels').textContent =
    ctySortKey === 'delta' ? 'Change' : ctySortKey === 'avg' ? 'Avg/Region' : 'Pixels';

  if (ctySortKey === 'delta' && !countryDeltaById) {
    filterCountriesView(document.getElementById('searchinput').value);
    const srEl = document.getElementById('srcount');
    srEl.textContent = 'No earlier snapshot to compare against.';
    srEl.classList.add('empty-hint');
    return;
  }

  filterCountriesView(document.getElementById('searchinput').value);
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
      const isDelta = sortKey === 'delta' && regionDeltaById;
      let cls='li';
      // Medal colours reflect cumulative rank — suppress them in delta
      // mode so a region isn't misleadingly highlighted gold for a metric
      // it's not actually top-3 in.
      if (!isDelta) {
        if (r.rank===1) cls+=' rank-gold';
        else if (r.rank===2) cls+=' rank-silver';
        else if (r.rank===3) cls+=' rank-bronze';
      }
      if (r.regionId===selectedRegionId) cls+=' selected';
      div.className=cls;
      const deltaVal = isDelta ? (regionDeltaById.get(r.regionId) || 0) : null;
      const barVal = isDelta ? deltaVal : r.pixels;
      const pct=mx>0?(barVal/mx*100).toFixed(1):0;
      const valText = isDelta ? (deltaVal>0?'+':'') + fmt(deltaVal) : fmt(r.pixels);
      const hasUrl = !!r.url;
      const flagHtml = r.countryId ? `<span class="flag-ic">${cFlag(r.countryId)}</span>` : '';
      div.innerHTML=
        `<span class="lrank">${r.rank}</span>`+
        `<span class="lid">#${r.regionId}</span>`+
        `<span class="lname" title="${cName(r.countryId)?cName(r.countryId)+": ":""}${r.name}">${flagHtml}<span class="lname-txt">${r.name}</span></span>`+
        `<div class="lbar-w"><div class="lbar" style="width:${pct}%"></div></div>`+
        `<span class="lval">${valText}</span>`+
        `<button class="lgo" title="Fly to region" aria-label="Fly to region">${ICON_LOCATE}</button>`+
        `<button class="ltrend" title="View pixel history" aria-label="View pixel history">${ICON_TREND}</button>`+
        `<button class="lwp${hasUrl?'':' lwp-off'}"${hasUrl?'':' disabled'} title="${hasUrl?'Open on wplace.live':'No wplace link in this snapshot'}" aria-label="${hasUrl?'Open on wplace.live':'No wplace link in this snapshot'}">${ICON_EXTLINK}</button>`;
      const cap=r;
      const activate = () => selectOrToggleRegion(cap);
      div.addEventListener('click', activate);
      makeActivatable(div, activate);
      div.querySelector('.lgo').addEventListener('click',e=>{e.stopPropagation();activate();});
      div.querySelector('.ltrend').addEventListener('click',e=>{e.stopPropagation();openRegionTrend(cap.regionId);});
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