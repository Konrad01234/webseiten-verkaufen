/* Mamand Motors — progressive enhancement, vanilla JS, zero deps.
   Everything degrades gracefully without JS. */
(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.remove("no-js");
  root.classList.add("js");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Preloader ---------- */
  var pl = document.getElementById("preloader");
  if (pl) {
    var hidePl = function () { pl.classList.add("hidden"); };
    window.addEventListener("load", function () { setTimeout(hidePl, 700); });
    setTimeout(hidePl, 2600); // safety fallback
  }

  document.addEventListener("DOMContentLoaded", function () {

    /* ---------- Year ---------- */
    var y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();

    /* ---------- Fullscreen overlay nav ---------- */
    var toggle  = document.querySelector(".nav-toggle");
    var overlay = document.getElementById("nav-overlay");
    var ovClose = overlay ? overlay.querySelector(".ov-close") : null;

    function openNav()  { if (!overlay) return; overlay.classList.add("open");  toggle && toggle.setAttribute("aria-expanded","true");  document.body.style.overflow = "hidden"; }
    function closeNav() { if (!overlay) return; overlay.classList.remove("open"); toggle && toggle.setAttribute("aria-expanded","false"); document.body.style.overflow = ""; }
    if (toggle)  toggle.addEventListener("click", function () { overlay && overlay.classList.contains("open") ? closeNav() : openNav(); });
    if (ovClose) ovClose.addEventListener("click", closeNav);
    if (overlay) overlay.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeNav); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeNav(); });

    /* ---------- Reveal on scroll ---------- */
    var reveal = document.querySelectorAll(".reveal, .reveal-l, .reveal-r, .reveal-scale");
    if ("IntersectionObserver" in window && reveal.length && !reduce) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
      }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
      reveal.forEach(function (el) { io.observe(el); });
    } else {
      reveal.forEach(function (el) { el.classList.add("in"); });
    }

    /* ---------- Nav shrink + scroll progress ---------- */
    var nav = document.querySelector(".nav");
    var bar = document.getElementById("scroll-progress");
    var ticking = false;
    function onScroll() {
      var yy = window.pageYOffset || document.documentElement.scrollTop || 0;
      if (nav) nav.classList.toggle("scrolled", yy > 20);
      if (bar) {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = (h > 0 ? (yy / h) * 100 : 0) + "%";
      }
      ticking = false;
    }
    window.addEventListener("scroll", function () { if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
    onScroll();

    /* ---------- Count-up stats ---------- */
    var counters = document.querySelectorAll("[data-count]");
    if (counters.length && "IntersectionObserver" in window && !reduce) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          cio.unobserve(e.target);
          var el = e.target;
          var target = parseFloat(el.getAttribute("data-count"));
          var suffix = el.getAttribute("data-suffix") || "";
          var dec = (target % 1 !== 0) ? 1 : 0;
          var start = performance.now(), dur = 1600;
          (function tick(now) {
            var p = Math.min((now - start) / dur, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = (target * eased).toFixed(dec).replace(".", ",") + suffix;
            if (p < 1) requestAnimationFrame(tick);
            else el.textContent = target.toFixed(dec).replace(".", ",") + suffix;
          })(start);
        });
      }, { threshold: 0.4 });
      counters.forEach(function (c) { cio.observe(c); });
    } else {
      counters.forEach(function (c) {
        var t = parseFloat(c.getAttribute("data-count"));
        c.textContent = t.toFixed(t % 1 !== 0 ? 1 : 0).replace(".", ",") + (c.getAttribute("data-suffix") || "");
      });
    }

    /* ---------- Service card mouse-follow glow ---------- */
    document.querySelectorAll(".svc").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - r.left) + "px");
        card.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });

    /* ---------- Magnetic buttons ---------- */
    if (!reduce && window.matchMedia("(pointer:fine)").matches) {
      document.querySelectorAll("[data-magnetic]").forEach(function (btn) {
        btn.addEventListener("pointermove", function (e) {
          var r = btn.getBoundingClientRect();
          var mx = e.clientX - r.left - r.width / 2;
          var my = e.clientY - r.top - r.height / 2;
          btn.style.transform = "translate(" + mx * 0.22 + "px," + my * 0.28 + "px)";
        });
        btn.addEventListener("pointerleave", function () { btn.style.transform = ""; });
      });
    }

    /* ---------- FAQ accordion ---------- */
    document.querySelectorAll(".faq-item").forEach(function (item) {
      var q = item.querySelector(".faq-q");
      var a = item.querySelector(".faq-a");
      if (!q || !a) return;
      q.addEventListener("click", function () {
        var open = item.classList.contains("open");
        document.querySelectorAll(".faq-item.open").forEach(function (o) {
          if (o !== item) { o.classList.remove("open"); o.querySelector(".faq-a").style.maxHeight = null; o.querySelector(".faq-q").setAttribute("aria-expanded","false"); }
        });
        item.classList.toggle("open", !open);
        q.setAttribute("aria-expanded", String(!open));
        a.style.maxHeight = open ? null : a.scrollHeight + "px";
      });
    });

    /* ---------- Reviews WATERFALL ----------
       Each .wf-col holds review cards. We duplicate its content once so the
       CSS keyframe (translateY -50% → 0) loops seamlessly as a falling stream. */
    if (!reduce) {
      document.querySelectorAll(".waterfall .wf-col").forEach(function (col) {
        col.innerHTML += col.innerHTML;
      });
    }

    /* ---------- Contact form (demo, no backend) ---------- */
    var form = document.getElementById("kontaktform");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var ok = form.querySelector(".form-ok");
        if (ok) ok.classList.add("show");
        form.querySelectorAll("input, textarea, select").forEach(function (f) { f.value = ""; });
        setTimeout(function () { ok && ok.classList.remove("show"); }, 6000);
      });
    }
  });
})();
