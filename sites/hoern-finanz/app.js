/* =========================================================================
   Hörn Finanz Vermittlung GmbH – app.js
   Navigation, Scroll-Reveals, Zähler, Akkordeon, Formular, Cookie-Hinweis.
   Kein Framework, keine externen Requests, kein Tracking.
   ========================================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Navigation: Sticky-Zustand ---------- */
  var nav = $('.nav');
  var progress = $('.scroll-progress');

  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    if (nav) nav.classList.toggle('is-stuck', y > 12);
    if (progress) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    }
  }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () { onScroll(); ticking = false; });
  }, { passive: true });
  onScroll();

  /* ---------- Mobile-Menü ---------- */
  var toggle  = $('.nav-toggle');
  var overlay = $('#nav-overlay');
  var closeBtn = $('.ov-close');
  var lastFocus = null;

  function openMenu() {
    if (!overlay) return;
    lastFocus = document.activeElement;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    if (toggle) toggle.setAttribute('aria-expanded', 'true');
    if (closeBtn) closeBtn.focus();
  }
  function closeMenu() {
    if (!overlay) return;
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
    if (lastFocus) lastFocus.focus();
  }
  if (toggle) toggle.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  if (overlay) $$('a', overlay).forEach(function (a) { a.addEventListener('click', closeMenu); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay && overlay.classList.contains('open')) closeMenu();
  });

  /* Fokus im geöffneten Overlay halten */
  if (overlay) {
    overlay.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab' || !overlay.classList.contains('open')) return;
      var items = $$('a[href], button', overlay).filter(function (el) { return el.offsetParent !== null; });
      if (!items.length) return;
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* ---------- Scroll-Reveal ---------- */
  var reveals = $$('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Zähler ---------- */
  var counters = $$('[data-count]');
  function runCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var suffix = el.getAttribute('data-suffix') || '';
    var prefix = el.getAttribute('data-prefix') || '';
    var dur = 1300, start = null;

    function fmt(v) {
      return prefix + v.toLocaleString('de-DE', {
        minimumFractionDigits: decimals, maximumFractionDigits: decimals
      }) + suffix;
    }
    if (reduceMotion) { el.textContent = fmt(target); return; }

    function frame(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * eased);
      if (p < 1) window.requestAnimationFrame(frame);
      else el.textContent = fmt(target);
    }
    window.requestAnimationFrame(frame);
  }
  if (counters.length) {
    if (!('IntersectionObserver' in window)) {
      counters.forEach(runCount);
    } else {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          runCount(entry.target);
          cio.unobserve(entry.target);
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { cio.observe(el); });
    }
  }

  /* ---------- Akkordeon ---------- */
  $$('.acc-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      var open = btn.getAttribute('aria-expanded') === 'true';

      // Geschwister schließen (Single-Open-Akkordeon)
      var group = btn.closest('.acc');
      if (group && !open) {
        $$('.acc-btn', group).forEach(function (other) {
          if (other === btn) return;
          other.setAttribute('aria-expanded', 'false');
          var op = document.getElementById(other.getAttribute('aria-controls'));
          if (op) op.style.maxHeight = null;
        });
      }
      btn.setAttribute('aria-expanded', open ? 'false' : 'true');
      if (panel) panel.style.maxHeight = open ? null : panel.scrollHeight + 'px';
    });
  });
  window.addEventListener('resize', function () {
    $$('.acc-btn[aria-expanded="true"]').forEach(function (btn) {
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      if (panel) panel.style.maxHeight = panel.scrollHeight + 'px';
    });
  });

  /* ---------- Kontaktformular (ohne Backend: erzeugt eine E-Mail) ---------- */
  var form = $('#kontakt-form');
  if (form) {
    var status = $('#form-status');
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Honeypot gegen einfache Bots
      if (form.querySelector('[name="website"]') && form.querySelector('[name="website"]').value) return;

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var d = new FormData(form);
      var get = function (k) { return (d.get(k) || '').toString().trim(); };

      var betreff = 'Beratungsanfrage: ' + (get('thema') || 'Allgemein') + ' – ' + get('name');
      var zeilen = [
        'Name: ' + get('name'),
        'E-Mail: ' + get('email'),
        'Telefon: ' + (get('telefon') || '—'),
        'Thema: ' + (get('thema') || '—'),
        'Wunschkontakt: ' + (get('kanal') || '—'),
        '',
        'Nachricht:',
        get('nachricht'),
        '',
        '--',
        'Gesendet über das Kontaktformular von hoern-finanz.de'
      ];

      var href = 'mailto:info@hoern-finanz.de'
        + '?subject=' + encodeURIComponent(betreff)
        + '&body=' + encodeURIComponent(zeilen.join('\n'));

      window.location.href = href;

      if (status) {
        status.className = 'form-status ok show';
        status.textContent = 'Ihr E-Mail-Programm wurde geöffnet – bitte die vorbereitete Nachricht noch absenden. '
          + 'Klappt das nicht, schreiben Sie uns direkt an info@hoern-finanz.de oder rufen Sie an: 07265 91 70 96-0.';
        status.focus && status.focus();
      }
    });
  }

  /* ---------- Cookie-/Datenschutz-Hinweis ---------- */
  var cookie = $('#cookie');
  var STORE = 'hf-hinweis-2024';
  function hasConsent() {
    try { return localStorage.getItem(STORE) === 'ok'; } catch (err) { return false; }
  }
  function setConsent() {
    try { localStorage.setItem(STORE, 'ok'); } catch (err) { /* Speicher blockiert – Hinweis erscheint erneut */ }
  }
  if (cookie) {
    if (!hasConsent()) {
      window.setTimeout(function () { cookie.classList.add('show'); }, 900);
    }
    $$('[data-cookie-ok]', cookie).forEach(function (btn) {
      btn.addEventListener('click', function () { setConsent(); cookie.classList.remove('show'); });
    });
    $$('[data-cookie-open]').forEach(function (btn) {
      btn.addEventListener('click', function (e) { e.preventDefault(); cookie.classList.add('show'); });
    });
  }

  /* ---------- Jahr im Footer ---------- */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
