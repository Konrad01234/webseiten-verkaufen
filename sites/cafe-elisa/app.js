/* Café Elisa – progressive enhancement
   Vanilla JS, keine Abhängigkeiten. Ohne JS bleibt alles nutzbar. */
(function () {
  "use strict";
  document.documentElement.classList.add("js");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Preloader ---------- */
  var pl = document.getElementById("preloader");
  if (pl) {
    var hidePl = function () { pl.classList.add("hidden"); };
    window.addEventListener("load", function () { setTimeout(hidePl, 1200); });
    setTimeout(hidePl, 2800); // Fallback
  }

  document.addEventListener("DOMContentLoaded", function () {
    /* ---------- Overlay-Navigation ---------- */
    var toggle  = document.querySelector(".nav-toggle");
    var overlay = document.getElementById("nav-overlay");
    var ovClose = overlay ? overlay.querySelector(".ov-close") : null;

    function openNav() {
      if (!overlay) return;
      overlay.classList.add("open");
      toggle && toggle.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    }
    function closeNav() {
      if (!overlay) return;
      overlay.classList.remove("open");
      toggle && toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }
    if (toggle) {
      toggle.addEventListener("click", function () {
        overlay && overlay.classList.contains("open") ? closeNav() : openNav();
      });
    }
    if (ovClose) ovClose.addEventListener("click", closeNav);
    if (overlay) {
      overlay.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeNav); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeNav(); });
    }

    /* ---------- Foto-Platzhalter ----------
       Jede .photo enthält ein <img> und einen .ph-fallback.
       Lädt das Bild nicht (noch nicht hochgeladen), zeigen wir den
       hübschen Platzhalter statt eines kaputten Bild-Icons. */
    document.querySelectorAll(".photo").forEach(function (ph) {
      var img = ph.querySelector("img");
      if (!img) return;
      function empty() { ph.classList.add("is-empty"); }
      function ok()    { ph.classList.remove("is-empty"); }
      if (img.complete) {
        img.naturalWidth > 0 ? ok() : empty();
      } else {
        img.addEventListener("load", ok);
        img.addEventListener("error", empty);
      }
    });

    /* Hero-Hintergrundfoto nur setzen, wenn es existiert */
    var heroBg = document.querySelector(".hero-bg[data-photo]");
    if (heroBg) {
      var probe = new Image();
      probe.onload = function () {
        heroBg.style.backgroundImage = "url('" + heroBg.getAttribute("data-photo") + "')";
        heroBg.classList.add("has-photo");
      };
      probe.src = heroBg.getAttribute("data-photo");
    }

    /* ---------- Reveal beim Scrollen ---------- */
    var reveal = document.querySelectorAll(".reveal, .reveal-l, .reveal-r");
    if ("IntersectionObserver" in window && reveal.length && !reduce) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
      reveal.forEach(function (el) { io.observe(el); });
    } else {
      reveal.forEach(function (el) { el.classList.add("in"); });
    }

    /* ---------- Nav-Schatten + Scroll-Fortschritt + Parallax ---------- */
    var nav     = document.querySelector(".nav");
    var bar     = document.getElementById("scroll-progress");
    var hero    = document.querySelector(".hero-bg");
    var ticking = false;
    function onScroll() {
      var y = window.pageYOffset || document.documentElement.scrollTop || 0;
      if (nav) nav.classList.toggle("scrolled", y > 8);
      if (bar) {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.setProperty("--sp", h > 0 ? (y / h).toFixed(4) : 0);
      }
      if (!reduce && hero && y < window.innerHeight * 1.3) {
        hero.style.setProperty("--py", (y * 0.18).toFixed(1) + "px");
      }
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
    onScroll();

    /* ---------- Jahr im Footer ---------- */
    var yr = document.getElementById("year");
    if (yr) yr.textContent = new Date().getFullYear();
  });
})();
