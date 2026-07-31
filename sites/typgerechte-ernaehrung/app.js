/* =========================================================================
   Typgerechte Ernährung – Interaktionen
   Vanilla JS, kein Build, kein Tracking.
   ========================================================================= */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Mobile-Navigation ─────────────────────── */
  var toggle = document.querySelector('.nav-toggle');
  var navLinks = document.getElementById('nav-links');

  if (toggle && navLinks) {
    toggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
    });

    navLinks.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') closeNav();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });
  }

  function closeNav() {
    if (!document.body.classList.contains('nav-open')) return;
    document.body.classList.remove('nav-open');
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Menü öffnen');
    }
  }

  /* ── Sticky-Nav, Scroll-Fortschritt, To-Top ── */
  var nav = document.querySelector('.nav');
  var progress = document.getElementById('scroll-progress');
  var toTop = document.querySelector('.to-top');
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;

    if (nav) nav.classList.toggle('stuck', y > 12);
    if (toTop) toTop.classList.toggle('show', y > 620);

    if (progress) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? Math.min(y / h, 1) * 100 : 0) + '%';
    }
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    });
  }

  /* ── Scroll-Reveals ────────────────────────── */
  var revealables = document.querySelectorAll('[data-reveal]');

  if (!('IntersectionObserver' in window) || reduced) {
    Array.prototype.forEach.call(revealables, function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    Array.prototype.forEach.call(revealables, function (el) {
      // Gestaffelte Verzögerung innerhalb einer Gruppe
      var group = el.parentElement;
      if (group && group.hasAttribute('data-stagger')) {
        var i = Array.prototype.indexOf.call(group.children, el);
        el.style.setProperty('--d', Math.min(i, 6) * 90 + 'ms');
      }
      io.observe(el);
    });
  }

  /* ── Zahlen hochzählen ─────────────────────── */
  var counters = document.querySelectorAll('[data-count]');

  if (counters.length) {
    if (!('IntersectionObserver' in window) || reduced) {
      Array.prototype.forEach.call(counters, function (el) {
        el.textContent = formatNum(parseFloat(el.getAttribute('data-count')), el);
      });
    } else {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          countUp(entry.target);
          cio.unobserve(entry.target);
        });
      }, { threshold: 0.5 });
      Array.prototype.forEach.call(counters, function (el) { cio.observe(el); });
    }
  }

  function formatNum(v, el) {
    var out = Math.round(v).toLocaleString('de-DE');
    return (el.getAttribute('data-prefix') || '') + out + (el.getAttribute('data-suffix') || '');
  }

  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var dur = 1500;
    var start = null;

    function frame(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = formatNum(target * eased, el);
      if (p < 1) window.requestAnimationFrame(frame);
    }
    window.requestAnimationFrame(frame);
  }

  /* ── Parallax auf dekorativen Elementen ────── */
  var parallax = document.querySelectorAll('[data-parallax]');
  if (parallax.length && !reduced) {
    var pTicking = false;
    window.addEventListener('scroll', function () {
      if (pTicking) return;
      pTicking = true;
      window.requestAnimationFrame(function () {
        var y = window.scrollY || 0;
        Array.prototype.forEach.call(parallax, function (el) {
          var f = parseFloat(el.getAttribute('data-parallax')) || 0.1;
          el.style.transform = 'translate3d(0,' + (y * f).toFixed(1) + 'px,0)';
        });
        pTicking = false;
      });
    }, { passive: true });
  }

  /* ── Akkordeon ─────────────────────────────── */
  var accItems = document.querySelectorAll('.acc-item');
  Array.prototype.forEach.call(accItems, function (item) {
    var q = item.querySelector('.acc-q');
    var a = item.querySelector('.acc-a');
    if (!q || !a) return;

    q.addEventListener('click', function () {
      var open = item.classList.toggle('open');
      q.setAttribute('aria-expanded', String(open));
      a.style.maxHeight = open ? a.scrollHeight + 'px' : '0px';
    });
  });

  window.addEventListener('resize', function () {
    Array.prototype.forEach.call(document.querySelectorAll('.acc-item.open .acc-a'), function (a) {
      a.style.maxHeight = a.scrollHeight + 'px';
    });
  });

  /* ── Kontaktformular → vorausgefüllte E-Mail ─ */
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;

      var d = new FormData(form);
      var val = function (k) { return (d.get(k) || '').toString().trim(); };

      var lines = [
        'Name: ' + val('name'),
        'E-Mail: ' + val('email'),
        'Telefon: ' + (val('phone') || '–'),
        'Anliegen: ' + (val('topic') || '–'),
        '',
        'Nachricht:',
        val('message') || '–',
        '',
        '— gesendet über das Kontaktformular von alternativernaehren.de'
      ];

      var to = form.getAttribute('data-mailto') || '';
      var subject = 'Terminanfrage – ' + (val('topic') || 'Typgerechte Ernährung');

      window.location.href = 'mailto:' + to +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(lines.join('\n'));

      var status = document.getElementById('form-status');
      if (status) {
        status.textContent = 'Ihr E-Mail-Programm wurde geöffnet. Bitte die vorbereitete Nachricht noch abschicken.';
        status.hidden = false;
      }
    });
  }

  /* ── Jahr im Footer ────────────────────────── */
  Array.prototype.forEach.call(document.querySelectorAll('[data-year]'), function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
