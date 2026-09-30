/* =====================================================================
   AKASH BAMBHANIYA — PORTFOLIO
   script.js — pure vanilla JS, no dependencies.

   This file is self-contained: the particle canvas and the cursor
   glow are both created here in JS (they don't need to exist in
   index.html already). Everything else hooks into elements that
   already exist in index.html — each section below says which ones.

   Sections:
     0. Shared settings (things every feature below checks first)
     0.5 Dynamic years of experience → reads [data-dynamic="exp-years-…"]
         (also fills the footer year from [data-dynamic="year"])
     1. Ambient particle network      → creates its own <canvas>
     2. Custom cursor glow            → creates its own <div>
     3. Animated stat counters        → reads .stat-number in index.html
     4. Smooth-scroll nav + active link → reads .nav-link / #main-nav
     5. Mobile nav toggle             → reads #nav-toggle / #main-nav
     6. Scroll-to-top button          → reads #scroll-top
     7. Boot everything once the DOM is ready
===================================================================== */

(function () {
  'use strict';

  /* ===================================================================
     0. SHARED SETTINGS
     Every animated feature checks these two flags first, so a user
     who has asked their OS for reduced motion, or is on a touch
     phone, gets a calmer / lighter site instead of the full effect.
  =================================================================== */
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

  // "Desktop" here means: has a mouse AND has room for the effect to
  // matter. Below this, the particle network still runs, just lighter
  // and without mouse interaction (see PARTICLE_COUNT below).
  const isDesktopViewport = !isTouchDevice && window.innerWidth > 768;

  /* ===================================================================
     0.5 DYNAMIC YEARS OF EXPERIENCE
     One place to update if the career start date ever changes.
     Every "Eight years" / "8+" figure on the page is computed from
     this single date instead of being hand-typed in multiple spots.

     EXPERIENCE_START — first day of the earliest role on the site
     (Web Designer, Vytech Enterprise, May 2018). Update only this
     line if that changes; everything else recalculates on its own.
  =================================================================== */
  const EXPERIENCE_START = new Date(2018, 4, 1); // May 1, 2018 (month is 0-indexed)

  const YEAR_WORDS = [
    'Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight',
    'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen',
    'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen', 'Twenty',
  ];

  function getYearsOfExperience() {
    const now = new Date();
    let years = now.getFullYear() - EXPERIENCE_START.getFullYear();
    const hadAnniversaryThisYear =
      now.getMonth() > EXPERIENCE_START.getMonth() ||
      (now.getMonth() === EXPERIENCE_START.getMonth() &&
        now.getDate() >= EXPERIENCE_START.getDate());
    if (!hadAnniversaryThisYear) years -= 1;
    return Math.max(years, 0);
  }

  function yearsToWord(years) {
    return YEAR_WORDS[years] || `${years}+`;
  }

  function initExperienceYears() {
    const years = getYearsOfExperience();
    const word = yearsToWord(years);

    // Text spots that read "Eight years" — hero intro, about bio,
    // and the experience section heading.
    document.querySelectorAll('[data-dynamic="exp-years-word"]').forEach((el) => {
      el.textContent = `${word} years`;
    });

    // The animated "Years Experience" stat counts up to this number
    // instead of a hard-coded data-count value.
    const expStat = document.querySelector('[data-dynamic="exp-years-count"]');
    if (expStat) {
      expStat.dataset.count = String(years);
      // Keep the static text in sync too, so reduced-motion / no-observer
      // visitors see the current value without any animation running.
      expStat.textContent = years + (expStat.dataset.suffix || '');
    }

    // Footer copyright year
    document.querySelectorAll('[data-dynamic="year"]').forEach((el) => {
      el.textContent = String(new Date().getFullYear());
    });
  }

  /* A tiny stylesheet the script injects itself, so this JS file can
     be dropped onto the page without also editing style.css. It only
     styles the two elements this script creates (the canvas and the
     cursor glow) plus the ".active" state for nav links. */
  function injectRuntimeStyles() {
    const style = document.createElement('style');
    style.textContent = `
      #particle-canvas {
        position: fixed;
        inset: 0;
        z-index: 0;
        pointer-events: none;
      }
      #cursor-glow {
        position: fixed;
        top: 0;
        left: 0;
        width: 280px;
        height: 280px;
        margin-left: -140px;
        margin-top: -140px;
        border-radius: 50%;
        z-index: 5;
        pointer-events: none;
        background: radial-gradient(
          circle,
          rgba(53, 230, 209, 0.10) 0%,
          rgba(155, 107, 255, 0.06) 45%,
          transparent 72%
        );
        transform: translate3d(-999px, -999px, 0);
        will-change: transform;
      }
      .nav-link.active { color: var(--text, #eef1f8); }
      .nav-link.active::after { width: 100%; }
    `;
    document.head.appendChild(style);
  }

  /* ===================================================================
     1. AMBIENT PARTICLE NETWORK
     Draws drifting dots on a full-screen <canvas>, connects nearby
     dots with faint lines, and lets the mouse gently "push" nearby
     dots on desktop. Mobile gets far fewer particles and no mouse
     interaction at all, which is what keeps it from lagging there.
  =================================================================== */
  function initParticleNetwork() {
    if (prefersReducedMotion) return; // respect the OS-level setting entirely

    const canvas = document.createElement('canvas');
    canvas.id = 'particle-canvas';

    // Slot the canvas in right after the existing .bg-layer div (see
    // index.html) so it sits visually with the other background
    // decoration, behind every real content section.
    const bgLayer = document.querySelector('.bg-layer');
    if (bgLayer) {
      bgLayer.insertAdjacentElement('afterend', canvas);
    } else {
      document.body.prepend(canvas);
    }

    const ctx = canvas.getContext('2d');

    let width = 0;
    let height = 0;
    let particles = [];
    let rafId = null;

    const mouse = { x: 0, y: 0, active: false };

    // Fewer particles + no lines to the mouse on phones/tablets —
    // this is the main lever for "smooth on desktop, light on mobile".
    const PARTICLE_COUNT = isDesktopViewport ? 70 : 26;
    const LINK_DISTANCE = isDesktopViewport ? 140 : 100;
    const MOUSE_RADIUS = 160;
    const MAX_SPEED = 0.6;

    function resizeCanvas() {
      // Cap devicePixelRatio at 2 — a 3x-density phone screen doesn't
      // need 3x the pixels redrawn every frame to look sharp.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function createParticles() {
      particles = Array.from({ length: PARTICLE_COUNT }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
      }));
    }

    function drawFrame() {
      ctx.clearRect(0, 0, width, height);

      // --- move + draw each dot ---
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        // bounce softly off the edges of the screen
        if (p.x <= 0 || p.x >= width) p.vx *= -1;
        if (p.y <= 0 || p.y >= height) p.vy *= -1;

        // gently steer away from the mouse — the "reacts softly" part.
        // Only active on desktop; mouse.active never becomes true on touch.
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.hypot(dx, dy) || 1;
          if (dist < MOUSE_RADIUS) {
            const force = (1 - dist / MOUSE_RADIUS) * 0.03;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }

        // clamp speed so particles never drift to a stop or fly off
        const speed = Math.hypot(p.vx, p.vy);
        if (speed > MAX_SPEED) {
          p.vx = (p.vx / speed) * MAX_SPEED;
          p.vy = (p.vy / speed) * MAX_SPEED;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(53, 230, 209, 0.55)'; // matches --cyan
        ctx.fill();
      }

      // --- connect nearby dots with a faint line ---
      // This is the only O(n²) part of the script; with the particle
      // counts above (26–70) that's at most a few thousand cheap
      // distance checks per frame, which is trivial for the browser.
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist < LINK_DISTANCE) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(155, 107, 255, ${
              0.16 * (1 - dist / LINK_DISTANCE)
            })`; // matches --violet
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      rafId = requestAnimationFrame(drawFrame);
    }

    // Track the mouse only on desktop — on touch devices this listener
    // still exists in the browser but mouse.active simply never flips
    // to true, so the "push" effect never runs.
    window.addEventListener(
      'mousemove',
      (e) => {
        if (!isDesktopViewport) return;
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.active = true;
      },
      { passive: true }
    );

    window.addEventListener('mouseout', () => {
      mouse.active = false;
    });

    // Pause the animation loop when the tab is hidden — saves battery
    // and avoids a big janky "catch-up" frame when the user comes back.
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
      } else {
        rafId = requestAnimationFrame(drawFrame);
      }
    });

    // Debounce resize so dragging a window edge doesn't rebuild the
    // whole particle list 60 times a second.
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resizeCanvas();
        createParticles();
      }, 200);
    });

    resizeCanvas();
    createParticles();
    rafId = requestAnimationFrame(drawFrame);
  }

  /* ===================================================================
     2. CUSTOM CURSOR GLOW
     A soft blurred circle that trails the real cursor with a little
     lag (lerp), instead of snapping to it exactly — that lag is what
     makes it feel like a glow instead of a UI element. Skipped
     entirely on touch devices, since there's no cursor to follow.
  =================================================================== */
  function initCursorGlow() {
    if (prefersReducedMotion || isTouchDevice) return;

    const glow = document.createElement('div');
    glow.id = 'cursor-glow';
    document.body.appendChild(glow);

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;

    window.addEventListener(
      'mousemove',
      (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
      },
      { passive: true }
    );

    function render() {
      // Move 12% of the remaining distance toward the cursor each
      // frame — a simple lerp that produces a smooth trailing motion.
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      glow.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
  }

  /* ===================================================================
     3. ANIMATED STAT COUNTERS
     Connects to the three <p class="stat-number" data-count="…">
     elements inside #stats in index.html. The real values ("8+",
     "10+", "5+") are written in the HTML itself, so crawlers, no-JS
     visitors and reduced-motion users always see the final numbers.
     Only when motion is allowed does this script reset them to 0 and
     count up the first time they scroll into view.
  =================================================================== */
  function initStatCounters() {
    const statNumbers = document.querySelectorAll('.stat-number');
    if (!statNumbers.length) return;

    // Nothing to animate: leave the final values from the HTML alone.
    if (prefersReducedMotion || !('IntersectionObserver' in window)) return;

    // Motion is allowed: start from 0 so the count-up has somewhere to go.
    statNumbers.forEach((el) => {
      el.textContent = '0' + (el.dataset.suffix || '');
    });

    function animateCount(el) {
      const target = parseInt(el.dataset.count, 10) || 0;
      const suffix = el.dataset.suffix || '';

      const duration = 1200;
      const startTime = performance.now();

      function tick(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
        el.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    // IntersectionObserver fires animateCount only once, the first
    // time each number is at least half visible, then stops watching it.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    statNumbers.forEach((el) => observer.observe(el));
  }

  /* ===================================================================
     4. SMOOTH-SCROLL NAV + ACTIVE LINK HIGHLIGHT
     Connects to the <a class="nav-link" href="#…"> links inside
     #main-nav, and to the section each one points to (#about,
     #experience, #services…) in index.html.
  =================================================================== */
  function initSmoothScrollNav() {
    const header = document.querySelector('.site-header');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    if (!navLinks.length) return;

    // --- smooth scroll, offset so the sticky header doesn't cover the heading ---
    navLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        const target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();
        const headerHeight = header ? header.offsetHeight : 0;
        const targetTop =
          target.getBoundingClientRect().top +
          window.pageYOffset -
          headerHeight -
          16; // small breathing room below the header

        window.scrollTo({
          top: targetTop,
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
        });
      });
    });

    // --- highlight whichever section is currently in view ---
    const sections = Array.from(navLinks)
      .map((link) => document.querySelector(link.getAttribute('href')))
      .filter(Boolean); // drops any link whose section doesn't exist yet

    if (!sections.length) return;

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const activeLink = document.querySelector(
            `.nav-link[href="#${entry.target.id}"]`
          );
          if (!activeLink) return;
          navLinks.forEach((l) => l.classList.remove('active'));
          activeLink.classList.add('active');
        });
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 } // "in view" = crossing the middle of the screen
    );

    sections.forEach((section) => sectionObserver.observe(section));
  }

  /* ===================================================================
     5. MOBILE NAV TOGGLE
     Connects to #nav-toggle (the hamburger button) and #main-nav
     (the link list) in index.html. Opens/closes the dropdown and
     closes it again once a link is tapped.
  =================================================================== */
  function initMobileNavToggle() {
    const navToggle = document.getElementById('nav-toggle');
    const mainNav = document.getElementById('main-nav');
    if (!navToggle || !mainNav) return;

    navToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    mainNav.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ===================================================================
     6. SCROLL TO TOP
     Connects to #scroll-top in index.html (a fixed button in the
     bottom-right corner). Fades in once the page has been scrolled
     past one viewport height, and scrolls smoothly back to the top
     when clicked.
  =================================================================== */
  function initScrollTopButton() {
    const button = document.getElementById('scroll-top');
    if (!button) return;

    const SHOW_AFTER = 400; // pixels scrolled before the button appears
    let isVisible = false;
    let ticking = false; // rAF guard so scroll doesn't run this on every single pixel

    function updateVisibility() {
      const shouldShow = window.scrollY > SHOW_AFTER;
      if (shouldShow !== isVisible) {
        isVisible = shouldShow;
        button.classList.toggle('is-visible', isVisible);
      }
      ticking = false;
    }

    window.addEventListener(
      'scroll',
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(updateVisibility);
      },
      { passive: true }
    );

    button.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
    });

    updateVisibility(); // in case the page loads already scrolled (e.g. back navigation)
  }

  /* ===================================================================
     7. BOOT
     Run everything once the DOM is ready. Because this script is
     loaded at the end of <body> in index.html, the DOM is usually
     already parsed by the time this file runs — but this check
     keeps it safe if it's ever moved into <head> instead.
  =================================================================== */
  function init() {
    injectRuntimeStyles();
    initExperienceYears();
    initParticleNetwork();
    initCursorGlow();
    initStatCounters();
    initSmoothScrollNav();
    initMobileNavToggle();
    initScrollTopButton();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
