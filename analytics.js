(function () {
  'use strict';

  var GA_ID = 'G-Y4FJ3TE5SS';
  var ALLOWED_HOSTS = ['akashb.in', 'www.akashb.in'];

  if (ALLOWED_HOSTS.indexOf(location.hostname) === -1) return;
  if (navigator.doNotTrack === '1' || window.doNotTrack === '1') return;

  try {
    if (/[?&]notrack\b/.test(location.search)) localStorage.setItem('ab_notrack', '1');
    if (/[?&]track=on\b/.test(location.search)) localStorage.removeItem('ab_notrack');
    if (localStorage.getItem('ab_notrack')) return;
  } catch (e) {}

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
  document.head.appendChild(s);

  gtag('js', new Date());
  gtag('config', GA_ID);

  function track(name, params) { gtag('event', name, params || {}); }

  if (document.querySelector('.error-page')) {
    track('page_not_found', { page_path: location.pathname, referrer: document.referrer });
  }

  function placement(el) {
    var host = el.closest('section[id], header, footer');
    return host ? (host.id || host.tagName.toLowerCase()) : 'page';
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    var where = placement(a);

    if (href.indexOf('mailto:') === 0) {
      track('contact_click', { method: 'email', placement: where });
    } else if (href.indexOf('wa.me') !== -1) {
      track('contact_click', { method: 'whatsapp', placement: where });
    } else if (href.indexOf('linkedin.com') !== -1) {
      track('social_click', { network: 'linkedin', placement: where });
    } else if (href.indexOf('github.com') !== -1) {
      track('social_click', { network: 'github', placement: where });
    } else if (href.charAt(0) === '#' && (a.classList.contains('btn') || a.classList.contains('nav-link--cta'))) {
      track('cta_click', { target: href, label: (a.textContent || '').trim().slice(0, 40) });
    }
  }, { capture: true });

  if ('IntersectionObserver' in window) {
    var seen = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && !seen[en.target.id]) {
          seen[en.target.id] = true;
          track('section_view', { section_id: en.target.id });
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.4 });
    document.querySelectorAll('section[id]').forEach(function (sec) { io.observe(sec); });
  }

  var marks = [25, 50, 75, 100], fired = {}, ticking = false;
  function checkScroll() {
    ticking = false;
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    if (max <= 0) return;
    var pct = Math.round((window.scrollY / max) * 100);
    marks.forEach(function (m) {
      if (pct >= m - (m === 100 ? 2 : 0) && !fired[m]) {
        fired[m] = true;
        track('scroll_depth', { percent: m });
      }
    });
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(checkScroll); }
  }, { passive: true });
})();
