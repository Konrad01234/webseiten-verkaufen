/* =========================================================================
   Karosserie + Lack D'Aurelio · Potsdam
   Navigation, cineastische Scroll-Animationen, Formular
   Vanilla JS – kein Build, keine Abhängigkeiten
   ========================================================================= */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ------------------------------------------------------------------ *
   * 1 · Navigation: Kondensieren beim Scrollen + Fortschrittsbalken
   * ------------------------------------------------------------------ */
  var nav      = $('.nav');
  var progress = $('#scroll-progress');
  var ticking  = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;

    if (nav) nav.classList.toggle('scrolled', y > 30);

    if (progress) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    }
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* ------------------------------------------------------------------ *
   * 2 · Vollbild-Menü
   * ------------------------------------------------------------------ */
  var overlay = $('#nav-overlay');
  var toggle  = $('.nav-toggle');
  var closeBt = $('.ov-close');

  function setMenu(open) {
    if (!overlay) return;
    overlay.classList.toggle('open', open);
    overlay.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.style.overflow = open ? 'hidden' : '';
    if (toggle) toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      var first = overlay.querySelector('a');
      if (first) setTimeout(function () { first.focus(); }, 260);
    } else if (toggle) {
      toggle.focus();
    }
  }

  if (toggle)  toggle.addEventListener('click', function () { setMenu(!overlay.classList.contains('open')); });
  if (closeBt) closeBt.addEventListener('click', function () { setMenu(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay && overlay.classList.contains('open')) setMenu(false);
  });

  /* ------------------------------------------------------------------ *
   * 3 · Scroll-Reveals (gestaffelt, mit Blur-Auflösung)
   * ------------------------------------------------------------------ */
  var revealables = $$('.reveal');

  if (reduced || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    revealables.forEach(function (el) { io.observe(el); });
  }

  /* Kinder einer Gruppe automatisch staffeln */
  $$('[data-stagger]').forEach(function (group) {
    Array.prototype.slice.call(group.children).forEach(function (child, i) {
      if (child.classList.contains('reveal') && !child.hasAttribute('data-d')) {
        child.setAttribute('data-d', String(Math.min(i + 1, 6)));
      }
    });
  });

  /* ------------------------------------------------------------------ *
   * 4 · Zähler zählen hoch
   * ------------------------------------------------------------------ */
  function countUp(el) {
    var target   = parseFloat(el.dataset.count);
    var decimals = (el.dataset.count.split('.')[1] || '').length;
    var suffix   = el.dataset.suffix || '';
    var dur      = 1500;
    var start    = null;

    function frame(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals).replace('.', ',') + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  var counters = $$('[data-count]');
  if (counters.length) {
    if (reduced || !('IntersectionObserver' in window)) {
      counters.forEach(function (el) {
        var d = (el.dataset.count.split('.')[1] || '').length;
        el.textContent = parseFloat(el.dataset.count).toFixed(d).replace('.', ',') + (el.dataset.suffix || '');
      });
    } else {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { countUp(entry.target); cio.unobserve(entry.target); }
        });
      }, { threshold: 0.6 });
      counters.forEach(function (el) { cio.observe(el); });
    }
  }

  /* ------------------------------------------------------------------ *
   * 5 · Bewertungs-Balken füllen
   * ------------------------------------------------------------------ */
  var bars = $$('.score-bar i b');
  if (bars.length) {
    if (reduced || !('IntersectionObserver' in window)) {
      bars.forEach(function (b) { b.style.width = b.dataset.w; });
    } else {
      var bio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var b = entry.target;
            setTimeout(function () { b.style.width = b.dataset.w; }, 120);
            bio.unobserve(b);
          }
        });
      }, { threshold: 0.5 });
      bars.forEach(function (b) { bio.observe(b); });
    }
  }

  /* ------------------------------------------------------------------ *
   * 6 · Karten-Glow folgt der Maus
   * ------------------------------------------------------------------ */
  if (!reduced && window.matchMedia('(hover: hover)').matches) {
    $$('.card').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
        card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * 7 · Sanfte Parallax für Hero-Medien
   * ------------------------------------------------------------------ */
  if (!reduced) {
    var parallax = $$('[data-parallax]');
    if (parallax.length) {
      var pTicking = false;
      window.addEventListener('scroll', function () {
        if (pTicking) return;
        pTicking = true;
        window.requestAnimationFrame(function () {
          var y = window.scrollY || window.pageYOffset;
          parallax.forEach(function (el) {
            var speed = parseFloat(el.dataset.parallax) || 0.18;
            el.style.transform = 'translate3d(0,' + (y * speed) + 'px,0)';
          });
          pTicking = false;
        });
      }, { passive: true });
    }
  }

  /* ------------------------------------------------------------------ *
   * 8 · Seitenübergang (Kino-Blende)
   * ------------------------------------------------------------------ */
  var curtain = $('#curtain');

  if (curtain && !reduced) {
    document.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('a') : null;
      if (!a) return;

      var href = a.getAttribute('href');
      if (!href || href.charAt(0) === '#' || a.target === '_blank') return;
      if (/^(mailto:|tel:|https?:)/i.test(href)) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

      e.preventDefault();
      curtain.classList.add('on');
      setTimeout(function () { window.location.href = href; }, 340);
    });

    /* Beim Zurücknavigieren die Blende wieder öffnen */
    window.addEventListener('pageshow', function () { curtain.classList.remove('on'); });
  }

  /* ------------------------------------------------------------------ *
   * 9 · Kontaktformular → vorausgefüllte E-Mail (kein Backend nötig)
   * ------------------------------------------------------------------ */
  var form = $('#kontaktformular');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = new FormData(form);
      var get = function (k) { return (d.get(k) || '').toString().trim(); };

      var body = [
        'Name: '        + get('name'),
        'E-Mail: '      + get('email'),
        'Telefon: '     + get('telefon'),
        'Fahrzeug: '    + get('fahrzeug'),
        'Kennzeichen: ' + get('kennzeichen'),
        'Anliegen: '    + get('anliegen'),
        'Versicherung: '+ get('versicherung'),
        '',
        'Nachricht:',
        get('nachricht'),
        '',
        '— gesendet über die Website'
      ].join('\n');

      var mail = form.dataset.mail || 'info@example.de';
      window.location.href = 'mailto:' + mail
        + '?subject=' + encodeURIComponent('Anfrage über die Website – ' + (get('anliegen') || 'Allgemein'))
        + '&body='    + encodeURIComponent(body);

      var status = $('#form-status');
      if (status) {
        status.hidden = false;
        status.textContent = 'Dein E-Mail-Programm öffnet sich mit der fertigen Anfrage. '
          + 'Falls nicht, ruf uns einfach an.';
      }
    });
  }

  /* ------------------------------------------------------------------ *
   * 10 · Aktueller Link in Navigation & Footer markieren
   * ------------------------------------------------------------------ */
  var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  $$('.nav-links a, #nav-overlay a').forEach(function (a) {
    var href = (a.getAttribute('href') || '').toLowerCase();
    if (href === page) { a.classList.add('active'); a.setAttribute('aria-current', 'page'); }
  });

  /* ------------------------------------------------------------------ *
   * 11 · Jahr im Footer
   * ------------------------------------------------------------------ */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
