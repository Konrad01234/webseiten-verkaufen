/* Gelateria Lorenzo Corno – cineastische Interaktionen */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Intro ---------- */
  var preloader = document.getElementById("preloader");
  var seen = false;
  try { seen = sessionStorage.getItem("lc-intro") === "1"; } catch (e) {}
  function hideIntro() {
    if (!preloader || preloader.classList.contains("done")) return;
    preloader.classList.add("done");
    try { sessionStorage.setItem("lc-intro", "1"); } catch (e) {}
  }
  if (reduce || seen) { if (preloader) preloader.classList.add("done"); }
  else { setTimeout(hideIntro, 2200); }

  /* ---------- Scroll-Fortschritt + Nav-Zustand ---------- */
  var progress = document.getElementById("scroll-progress");
  var nav = document.getElementById("nav");
  function onScroll() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    if (progress) progress.style.width = (max > 0 ? (doc.scrollTop / max) * 100 : 0) + "%";
    if (nav) nav.classList.toggle("scrolled", doc.scrollTop > 80);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobiles Menü ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var overlay = document.getElementById("nav-overlay");
  var closeBtn = overlay ? overlay.querySelector(".ov-close") : null;
  function setMenu(open) {
    if (!overlay) return;
    overlay.classList.toggle("open", open);
    overlay.setAttribute("aria-hidden", String(!open));
    if (toggle) toggle.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  }
  if (toggle) toggle.addEventListener("click", function () { setMenu(true); });
  if (closeBtn) closeBtn.addEventListener("click", function () { setMenu(false); });
  if (overlay) overlay.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });

  /* ---------- Scroll-Reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -60px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Parallax (Szenen) ---------- */
  var parallax = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
  var ticking = false;
  function applyParallax() {
    var vh = window.innerHeight;
    parallax.forEach(function (img) {
      var scene = img.closest("[data-scene]");
      if (!scene) return;
      var rect = scene.getBoundingClientRect();
      if (rect.bottom < -100 || rect.top > vh + 100) return;
      // -1..1 relativ zur Bildschirmmitte
      var progressPos = (rect.top + rect.height / 2 - vh / 2) / (vh / 2 + rect.height / 2);
      var shift = progressPos * -6; // Prozent
      img.style.transform = "translate3d(0," + shift.toFixed(2) + "%,0)";
    });
    ticking = false;
  }
  function requestParallax() { if (!ticking) { ticking = true; requestAnimationFrame(applyParallax); } }
  if (parallax.length && !reduce) {
    window.addEventListener("scroll", requestParallax, { passive: true });
    window.addEventListener("resize", requestParallax);
    applyParallax();
  }

  /* ---------- Aktiven Nav-Link markieren ---------- */
  var sections = document.querySelectorAll("main section[id]");
  var links = document.querySelectorAll(".nav-links a");
  if ("IntersectionObserver" in window && sections.length && links.length) {
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (l) { l.classList.toggle("active", l.getAttribute("href") === "#" + en.target.id); });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { sio.observe(s); });
  }

  /* ---------- Jahr ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
