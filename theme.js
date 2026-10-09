/* Theme switcher: light / dark, remembered in localStorage.
   Loaded as a plain (non-deferred) script in <head> so the saved theme
   is applied before the first paint — no flash of the wrong theme. */
(function () {
  'use strict';

  var KEY = 'theme';
  var root = document.documentElement;
  var THEME_COLOR = { dark: '#07080d', light: '#f4f6fb' };

  function saved() {
    try {
      var v = localStorage.getItem(KEY);
      return v === 'light' || v === 'dark' ? v : null;
    } catch (e) { return null; } // storage blocked (private mode etc.)
  }

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', THEME_COLOR[theme]);
    var btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.setAttribute('aria-label', 'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' theme');
    }
  }

  // First visit: follow the system setting. Later visits: whatever was saved.
  var current = saved() ||
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  apply(current);

  document.addEventListener('DOMContentLoaded', function () {
    apply(current); // the button exists now, so label it
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      current = current === 'dark' ? 'light' : 'dark';
      apply(current);
      try { localStorage.setItem(KEY, current); } catch (e) {}
    });
  });
})();
