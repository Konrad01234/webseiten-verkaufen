/* ACF – Aachener Finanzmakler · UI behaviour */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Mobile navigation ---------- */
  var overlay = document.getElementById('nav-overlay');
  var toggle = document.querySelector('.nav-toggle');
  var closeBtn = document.querySelector('.ov-close');

  function setNav(open) {
    if (!overlay) return;
    overlay.classList.toggle('open', open);
    overlay.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (toggle) toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) {
      var first = overlay.querySelector('a');
      if (first) first.focus();
    } else if (toggle) {
      toggle.focus();
    }
  }

  if (toggle) toggle.addEventListener('click', function () { setNav(!overlay.classList.contains('open')); });
  if (closeBtn) closeBtn.addEventListener('click', function () { setNav(false); });
  if (overlay) {
    overlay.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setNav(false); });
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay && overlay.classList.contains('open')) setNav(false);
  });

  /* ---------- Sticky nav shadow + scroll progress + back to top ---------- */
  var nav = document.querySelector('.nav');
  var progress = document.getElementById('scroll-progress');
  var toTop = document.querySelector('.to-top');
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    if (nav) nav.classList.toggle('is-stuck', y > 8);
    if (progress) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    }
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

  /* ---------- Reveal on scroll ---------- */
  var revealables = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealables.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i % 4, 3) * 70 + 'ms';
      io.observe(el);
    });
  } else {
    revealables.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Animated counters ---------- */
  var counters = document.querySelectorAll('[data-count]');
  function runCounter(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    if (isNaN(target)) return;
    if (reduced) { el.textContent = formatNum(target); return; }
    var start = performance.now();
    var dur = 1200;
    function frame(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = formatNum(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  function formatNum(n) { return n.toLocaleString('de-DE'); }

  if (counters.length) {
    if ('IntersectionObserver' in window) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { runCounter(entry.target); cio.unobserve(entry.target); }
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { cio.observe(el); });
    } else {
      counters.forEach(runCounter);
    }
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var btn = item.querySelector('.faq-q');
    var panel = item.querySelector('.faq-a');
    if (!btn || !panel) return;
    btn.addEventListener('click', function () {
      var open = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      panel.style.maxHeight = open ? panel.scrollHeight + 'px' : '';
    });
  });
  window.addEventListener('resize', function () {
    document.querySelectorAll('.faq-item.open .faq-a').forEach(function (p) {
      p.style.maxHeight = p.scrollHeight + 'px';
    });
  });

  /* ---------- Contact form (client-side validation) ---------- */
  var form = document.getElementById('kontaktformular');
  if (form) {
    form.setAttribute('novalidate', 'novalidate');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;
      form.querySelectorAll('[required]').forEach(function (input) {
        var field = input.closest('.field') || input.closest('.consent');
        var ok = input.type === 'checkbox' ? input.checked : input.value.trim() !== '';
        if (ok && input.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim());
        if (field) field.classList.toggle('invalid', !ok);
        if (!ok && valid) { input.focus(); valid = false; }
        else if (!ok) valid = false;
      });
      if (!valid) return;

      /* Statisches Hosting: Anfrage wird als vorbereitete E-Mail geöffnet.
         Für serverseitigen Versand hier Endpoint eintragen. */
      var get = function (n) { var el = form.elements[n]; return el ? el.value.trim() : ''; };
      var body = [
        'Name: ' + get('name'),
        'E-Mail: ' + get('email'),
        'Telefon: ' + get('telefon'),
        'Thema: ' + get('thema'),
        '',
        get('nachricht')
      ].join('\n');
      var mail = 'mailto:info@aachen-f.de'
        + '?subject=' + encodeURIComponent('Beratungsanfrage über die Website – ' + get('name'))
        + '&body=' + encodeURIComponent(body);

      var status = form.querySelector('.form-status');
      if (status) {
        status.classList.add('ok');
        status.textContent = 'Vielen Dank! Ihr E-Mail-Programm öffnet sich mit der fertigen Anfrage. Alternativ erreichen Sie uns direkt unter 0241 99 00 99 20.';
      }
      window.location.href = mail;
    });

    form.querySelectorAll('[required]').forEach(function (input) {
      input.addEventListener('input', function () {
        var field = input.closest('.field') || input.closest('.consent');
        if (field) field.classList.remove('invalid');
      });
    });
  }

  /* ---------- Current year ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
