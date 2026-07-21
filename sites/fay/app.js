/* =========================================================================
   Fay Café — interactions & cinematic animation
   Vanilla JS, no dependencies. Respects prefers-reduced-motion.
   ========================================================================= */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Preloader ---------- */
  var pl = document.getElementById("preloader");
  function hidePl() { if (pl) pl.classList.add("hidden"); }
  if (pl) {
    window.addEventListener("load", function () { setTimeout(hidePl, reduce ? 200 : 1500); });
    setTimeout(hidePl, 4000); // safety
  }

  document.addEventListener("DOMContentLoaded", function () {

    /* ---------- Mobile nav overlay ---------- */
    var toggle = document.querySelector(".nav-toggle");
    var overlay = document.getElementById("nav-overlay");
    var ovClose = document.querySelector(".ov-close");
    function openNav() { if (overlay) { overlay.classList.add("open"); document.body.style.overflow = "hidden"; } }
    function closeNav() { if (overlay) { overlay.classList.remove("open"); document.body.style.overflow = ""; } }
    if (toggle) toggle.addEventListener("click", openNav);
    if (ovClose) ovClose.addEventListener("click", closeNav);
    if (overlay) overlay.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeNav); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeNav(); });

    /* ---------- Active nav state + "Angebot" dropdown ---------- */
    var here = (location.pathname.split("/").pop() || "").toLowerCase() || "index.html";
    document.querySelectorAll(".nav-links a[href], .nav-drop-menu a[href]").forEach(function (a) {
      if ((a.getAttribute("href") || "").toLowerCase() === here) {
        a.classList.add("active");
        var d = a.closest(".nav-drop");
        if (d) { var t = d.querySelector(".nav-drop-t"); if (t) t.classList.add("active"); }
      }
    });
    var dropT = document.querySelector(".nav-drop-t");
    var drop = document.querySelector(".nav-drop");
    if (dropT && drop) {
      dropT.addEventListener("click", function (e) { e.stopPropagation(); drop.classList.toggle("open"); });
      document.addEventListener("click", function () { drop.classList.remove("open"); });
    }

    /* ---------- Reveal on scroll ---------- */
    var reveal = document.querySelectorAll(".reveal, .reveal-l, .reveal-r, .reveal-scale");
    if ("IntersectionObserver" in window && reveal.length && !reduce) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
        });
      }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
      reveal.forEach(function (el) { io.observe(el); });
    } else {
      reveal.forEach(function (el) { el.classList.add("in"); });
    }

    /* ---------- Nav shrink + scroll progress + parallax (rAF throttled) ---------- */
    var nav = document.querySelector(".nav");
    var bar = document.getElementById("scroll-progress");
    var parallax = document.querySelectorAll("[data-parallax]");
    var heroBg = document.querySelector(".hero-bg");
    var ticking = false;
    function onScroll() {
      var y = window.pageYOffset || document.documentElement.scrollTop || 0;
      if (nav) nav.classList.toggle("scrolled", y > 8);
      if (bar) {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
      }
      if (!reduce) {
        if (parallax.length) {
          parallax.forEach(function (el) {
            var s = parseFloat(el.getAttribute("data-parallax")) || 0.12;
            el.style.transform = "translateY(" + (-y * s) + "px)";
          });
        }
        if (heroBg && y < window.innerHeight) heroBg.style.transform = "translateY(" + (y * 0.18) + "px) scale(1.08)";
      }
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
    }, { passive: true });
    onScroll();

    /* ---------- Count-up counters ---------- */
    var counts = document.querySelectorAll("[data-count]");
    function runCount(el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var dur = 1600, start = null;
      var suffix = el.getAttribute("data-suffix") || "";
      var dec = (target % 1 !== 0) ? 1 : 0;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.firstChild.nodeValue = (target * eased).toFixed(dec).replace(".", ",") + "";
        if (suffix) {} // suffix handled by sibling
        if (p < 1) window.requestAnimationFrame(step);
      }
      window.requestAnimationFrame(step);
    }
    if ("IntersectionObserver" in window && counts.length && !reduce) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { runCount(en.target); cio.unobserve(en.target); }
        });
      }, { threshold: 0.5 });
      counts.forEach(function (el) { cio.observe(el); });
    } else {
      counts.forEach(function (el) { el.firstChild.nodeValue = el.getAttribute("data-count").replace(".", ","); });
    }

    /* ---------- Highlight today's opening hours ---------- */
    var todayEls = document.querySelectorAll("[data-day]");
    if (todayEls.length) {
      var jsDay = new Date().getDay(); // 0 = Sun
      var map = { 1: "mo", 2: "di", 3: "mi", 4: "do", 5: "fr", 6: "sa", 0: "so" };
      var key = map[jsDay];
      todayEls.forEach(function (el) {
        if (el.getAttribute("data-day") === key) el.classList.add("today");
      });
    }

    /* ---------- Card tilt (subtle, pointer devices) ---------- */
    if (!reduce && window.matchMedia("(pointer:fine)").matches) {
      document.querySelectorAll("[data-tilt]").forEach(function (card) {
        card.addEventListener("mousemove", function (e) {
          var r = card.getBoundingClientRect();
          var rx = ((e.clientY - r.top) / r.height - 0.5) * -6;
          var ry = ((e.clientX - r.left) / r.width - 0.5) * 6;
          card.style.transform = "perspective(800px) rotateX(" + rx + "deg) rotateY(" + ry + "deg) translateY(-6px)";
        });
        card.addEventListener("mouseleave", function () { card.style.transform = ""; });
      });
    }

    /* ---------- Contact form -> mailto ---------- */
    var form = document.getElementById("kontakt-form");
    if (form) {
      form.addEventListener("submit", function (ev) {
        ev.preventDefault();
        var d = new FormData(form);
        var name = (d.get("name") || "").toString();
        var subject = "Anfrage über faycafe.de – " + name;
        var body =
          "Name: " + name + "\n" +
          "E-Mail: " + (d.get("email") || "") + "\n" +
          "Telefon: " + (d.get("phone") || "") + "\n" +
          "Anlass: " + (d.get("topic") || "") + "\n\n" +
          (d.get("message") || "");
        window.location.href = "mailto:hallo@faycafe.de?subject=" +
          encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
        var ok = document.getElementById("form-ok");
        if (ok) ok.style.display = "block";
      });
    }

    /* ---------- Cookie banner ---------- */
    var cookie = document.getElementById("cookie");
    function store(v) { try { localStorage.setItem("fay-cookie", v); } catch (e) {} if (cookie) cookie.classList.remove("show"); }
    if (cookie) {
      var saved = null;
      try { saved = localStorage.getItem("fay-cookie"); } catch (e) {}
      if (!saved) setTimeout(function () { cookie.classList.add("show"); }, 1400);
      cookie.querySelectorAll("[data-cookie]").forEach(function (b) {
        b.addEventListener("click", function () { store(b.getAttribute("data-cookie")); });
      });
    }
    var reopen = document.querySelector("[data-cookie-reopen]");
    if (reopen && cookie) reopen.addEventListener("click", function (e) { e.preventDefault(); cookie.classList.add("show"); });

    /* ---------- Footer year ---------- */
    var yr = document.getElementById("year");
    if (yr) yr.textContent = new Date().getFullYear();
  });
})();
