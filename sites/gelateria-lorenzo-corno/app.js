/* Gelateria Lorenzo Corno – Interaktionen & Animationen */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Intro: Eiskugel fällt ins Hörnchen ---------- */
  var preloader = document.getElementById("preloader");
  var skipBtn = document.getElementById("pl-skip");
  var introSeen = false;
  try { introSeen = sessionStorage.getItem("lc-intro") === "1"; } catch (e) {}

  function hidePreloader() {
    if (!preloader || preloader.classList.contains("done")) return;
    preloader.classList.add("done");
    try { sessionStorage.setItem("lc-intro", "1"); } catch (e) {}
  }
  if (prefersReduced || introSeen) {
    // Keine (erneute) Animation: sofort ausblenden
    if (preloader) preloader.classList.add("done");
  } else {
    // Animation dauert ~2,9 s, danach sanft ausblenden
    setTimeout(hidePreloader, 3300);
  }
  if (skipBtn) skipBtn.addEventListener("click", hidePreloader);

  /* ---------- Scroll-Fortschritt ---------- */
  var progress = document.getElementById("scroll-progress");
  var nav = document.getElementById("nav");
  function onScroll() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    if (progress) {
      progress.style.width = (max > 0 ? (doc.scrollTop / max) * 100 : 0) + "%";
    }
    if (nav) nav.classList.toggle("scrolled", doc.scrollTop > 10);
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
  if (overlay) {
    overlay.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () { setMenu(false); });
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setMenu(false);
  });

  /* ---------- Scroll-Reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Zähler-Animation ---------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    var duration = 1400;
    var start = null;

    function format(value) {
      return prefix + value.toFixed(decimals).replace(".", ",") + suffix;
    }
    if (prefersReduced) {
      el.textContent = format(target);
      return;
    }
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = format(target * eased);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var counters = document.querySelectorAll(".count");
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          cio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- Aktiven Nav-Link markieren ---------- */
  var sections = document.querySelectorAll("main section[id]");
  var navLinks = document.querySelectorAll(".nav-links a");
  if ("IntersectionObserver" in window && sections.length && navLinks.length) {
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navLinks.forEach(function (link) {
            link.classList.toggle(
              "active",
              link.getAttribute("href") === "#" + entry.target.id
            );
          });
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    sections.forEach(function (sec) { sio.observe(sec); });
  }

  /* ---------- Hero-Video bei reduzierter Bewegung anhalten ---------- */
  if (prefersReduced) {
    document.querySelectorAll("video").forEach(function (v) {
      v.removeAttribute("autoplay");
      v.pause();
    });
  }

  /* ---------- Jahr im Footer ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
