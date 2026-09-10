/* =========================================================================
   FAIR konzept – Interaktion
   Navigation · Reveals · Zähler · Akkordeon · Formular · Cookie-Banner
   ========================================================================= */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Navigation: Schatten beim Scrollen + Fortschritt ---------- */
  var nav = document.querySelector('.nav');
  var progress = document.getElementById('scroll-progress');

  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    if (nav) nav.classList.toggle('scrolled', y > 12);
    if (progress) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobiles Menü ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var overlay = document.getElementById('nav-overlay');
  var closeBtn = document.querySelector('.ov-close');

  function setNav(open) {
    document.body.classList.toggle('nav-open', open);
    if (toggle) toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (overlay) overlay.setAttribute('aria-hidden', open ? 'false' : 'true');
  }
  if (toggle) toggle.addEventListener('click', function () {
    setNav(!document.body.classList.contains('nav-open'));
  });
  if (closeBtn) closeBtn.addEventListener('click', function () { setNav(false); });
  if (overlay) overlay.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { setNav(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setNav(false);
  });

  /* ---------- Reveal beim Scrollen ---------- */
  var revealTargets = document.querySelectorAll('.reveal, [data-count], .steps, .hero-visual');

  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        if (entry.target.hasAttribute('data-count')) countUp(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -60px 0px' });
    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    revealTargets.forEach(function (el) {
      el.classList.add('is-in');
      if (el.hasAttribute('data-count')) el.textContent = el.getAttribute('data-count');
    });
  }

  /* ---------- Zähler ---------- */
  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var prefix = el.getAttribute('data-prefix') || '';
    if (isNaN(target)) return;
    var dur = 1500, start = null;

    function frame(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(target * eased).toLocaleString('de-DE') + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ---------- Akkordeon (FAQ) ---------- */
  document.querySelectorAll('.acc-q').forEach(function (btn) {
    var acc = btn.closest('.acc');
    var panel = acc.querySelector('.acc-a');
    btn.setAttribute('aria-expanded', 'false');

    btn.addEventListener('click', function () {
      var open = acc.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      panel.style.maxHeight = open ? panel.scrollHeight + 'px' : '0px';
    });
  });
  window.addEventListener('resize', function () {
    document.querySelectorAll('.acc.open .acc-a').forEach(function (p) {
      p.style.maxHeight = p.scrollHeight + 'px';
    });
  });

  /* ---------- Terminanfrage: erzeugt eine vorausgefüllte E-Mail ---------- */
  var form = document.getElementById('contact-form');
  if (form) {
    var status = document.getElementById('form-status');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;

      form.querySelectorAll('[required]').forEach(function (input) {
        var err = input.parentElement.querySelector('.err');
        var ok = input.type === 'checkbox' ? input.checked : input.value.trim() !== '';
        if (ok && input.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
        if (err) err.classList.toggle('show', !ok);
        if (!ok && valid) { input.focus(); valid = false; }
      });
      if (!valid) return;

      var get = function (name) {
        var el = form.elements[name];
        return el ? el.value.trim() : '';
      };

      var lines = [
        'Name: ' + get('name'),
        'E-Mail: ' + get('email'),
        'Telefon: ' + (get('phone') || '–'),
        'Thema: ' + get('topic'),
        'Wunschtermin: ' + (get('slot') || 'flexibel'),
        '',
        'Nachricht:',
        get('message') || '–'
      ];

      var mail = 'mailto:' + form.getAttribute('data-mail') +
        '?subject=' + encodeURIComponent('Terminanfrage über die Website – ' + get('name')) +
        '&body=' + encodeURIComponent(lines.join('\n'));

      window.location.href = mail;
      if (status) {
        status.textContent = 'Danke! Ihr E-Mail-Programm öffnet sich mit der fertigen Anfrage. Falls nicht, schreiben Sie uns direkt an ' + form.getAttribute('data-mail') + '.';
        status.classList.add('show');
      }
    });
  }

  /* ---------- Cookie-Hinweis ---------- */
  var cookie = document.getElementById('cookie');
  var KEY = 'fk-cookie-consent';

  function showCookie() {
    if (!cookie) return;
    cookie.classList.add('show');
    requestAnimationFrame(function () { cookie.classList.add('in'); });
  }
  function hideCookie(value) {
    if (!cookie) return;
    try { localStorage.setItem(KEY, value); } catch (err) { /* Speicher gesperrt */ }
    cookie.classList.remove('in');
    setTimeout(function () { cookie.classList.remove('show'); }, 400);
  }

  if (cookie) {
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (err) { /* Speicher gesperrt */ }
    if (!saved) setTimeout(showCookie, 900);

    cookie.querySelectorAll('[data-consent]').forEach(function (btn) {
      btn.addEventListener('click', function () { hideCookie(btn.getAttribute('data-consent')); });
    });
  }
  document.querySelectorAll('[data-open-cookie]').forEach(function (link) {
    link.addEventListener('click', function (e) { e.preventDefault(); showCookie(); });
  });

  /* ---------- Jahreszahl im Footer ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
