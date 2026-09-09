/* =========================================================================
   Frommelt Capital Partners – Interaktion
   ========================================================================= */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Mobile-Navigation ─────────────────────── */
  var overlay = document.getElementById('nav-overlay');
  var toggle  = document.querySelector('.nav-toggle');
  var closeBt = document.querySelector('.ov-close');

  function setNav(open) {
    if (!overlay) return;
    overlay.classList.toggle('open', open);
    overlay.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.style.overflow = open ? 'hidden' : '';
    if (toggle) toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  if (toggle)  toggle.addEventListener('click', function () { setNav(true); });
  if (closeBt) closeBt.addEventListener('click', function () { setNav(false); });
  if (overlay) {
    overlay.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setNav(false); });
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setNav(false);
  });

  /* ── Sticky Nav + Scroll-Fortschritt ───────── */
  var nav   = document.querySelector('.nav');
  var prog  = document.getElementById('scroll-progress');
  var toTop = document.querySelector('.to-top');
  var ticking = false;

  function onScroll() {
    var y   = window.scrollY || document.documentElement.scrollTop;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (nav)   nav.classList.toggle('scrolled', y > 8);
    if (prog)  prog.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    if (toTop) toTop.classList.toggle('show', y > 700);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    });
  }

  /* ── Reveal beim Scrollen ──────────────────── */
  var revealables = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || reduced) {
    revealables.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    revealables.forEach(function (el) { io.observe(el); });
  }

  /* ── Zahlen hochzählen ─────────────────────── */
  var counters = document.querySelectorAll('[data-count]');
  function runCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var dur    = 1400;
    if (reduced) { el.textContent = target + suffix; return; }
    var start = null;
    function frame(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  if (counters.length) {
    if (!('IntersectionObserver' in window)) {
      counters.forEach(runCount);
    } else {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { runCount(entry.target); cio.unobserve(entry.target); }
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { cio.observe(el); });
    }
  }

  /* ── Kontaktformular (ohne Backend) ────────── */
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var lines = [
        'Anliegen: ' + (data.get('thema') || '–'),
        'Name: '     + (data.get('name') || '–'),
        'E-Mail: '   + (data.get('email') || '–'),
        'Telefon: '  + (data.get('telefon') || '–'),
        '',
        (data.get('nachricht') || '')
      ];
      var href = 'mailto:info@frommeltundpartner.de'
        + '?subject=' + encodeURIComponent('Anfrage über die Website – ' + (data.get('thema') || 'Beratung'))
        + '&body='    + encodeURIComponent(lines.join('\n'));

      var status = document.getElementById('form-status');
      if (status) {
        status.textContent = 'Ihr E-Mail-Programm wird geöffnet. Falls nichts passiert, schreiben Sie bitte direkt an info@frommeltundpartner.de.';
        status.classList.add('show');
      }
      window.location.href = href;
    });
  }

  /* ── Jahr im Footer ────────────────────────── */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
