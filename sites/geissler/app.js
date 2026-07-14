/* Geißler Heizungstechnik – kleine Interaktionen */
(function () {
  'use strict';

  /* Mobile-Navigation */
  var burger = document.getElementById('nav-burger');
  var links = document.getElementById('nav-links');
  if (burger && links) {
    burger.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        links.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* Scroll-Reveal */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* Demo-Formular (ohne Backend) */
  var form = document.getElementById('contact-form');
  var ok = document.getElementById('form-ok');
  if (form && ok) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      ok.classList.add('show');
      form.reset();
      setTimeout(function () { ok.classList.remove('show'); }, 6000);
    });
  }

  /* Jahr im Footer */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
