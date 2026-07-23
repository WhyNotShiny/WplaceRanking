// theme.js — light/dark theme toggle; swaps CSS variables and the map's
// tile layer URLs. Requires map-core.js (tile layer references).

// ── Theme (light/dark) ────────────────────────────────────
// The inline script in <head> already applied a saved/system-preferred
// theme to <html> before first paint (avoids a flash of the wrong theme);
// this just keeps everything else — button icon, map tiles — in sync with
// whatever attribute ended up set, and handles switching afterward.
const THEME_KEY = 'wplace-theme';

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  baseTileLayer.setUrl(TILE_URLS[theme].base);
  labelsTileLayer.setUrl(TILE_URLS[theme].labels);
  const btn = document.getElementById('theme-toggle');
  btn.innerHTML = theme === 'light' ? ICON_SUN : ICON_MOON;
  const label = theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode';
  btn.title = label;
  btn.setAttribute('aria-label', label);
}

function toggleTheme() {
  const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
  applyTheme(next);
}

function initTheme() {
  const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  applyTheme(current); // syncs button icon + map tiles with whatever <head> already set
}