// theme.js — light/dark theme toggle; swaps CSS variables. The map's
// dark-mode look is a CSS filter on the tile layer (see styles.css),
// applied automatically via the data-theme attribute set here — no
// direct tile-layer reference needed in this file anymore.

// ── Theme (light/dark) ────────────────────────────────────
// The inline script in <head> already applied a saved/system-preferred
// theme to <html> before first paint (avoids a flash of the wrong theme);
// this just keeps everything else — button icon, CSS-driven map filter —
// in sync with whatever attribute ended up set, and handles switching
// afterward.
const THEME_KEY = 'wplace-theme';

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
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