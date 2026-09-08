/* B2B Hypo Service GmbH – Progressive Enhancement
   Vanilla JS, keine Abhängigkeiten. Ohne JS bleibt die Seite voll nutzbar. */
(function () {
  "use strict";

  document.documentElement.classList.add("js");

  var reduce = window.matchMedia &&
               window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Preloader ---------- */
  var pl = document.getElementById("preloader");
  if (pl) {
    var hidePl = function () { pl.classList.add("hidden"); };
    if (reduce) { hidePl(); }
    else {
      window.addEventListener("load", function () { setTimeout(hidePl, 1400); });
      setTimeout(hidePl, 2600); // Fallback
    }
  }

  document.addEventListener("DOMContentLoaded", function () {

    /* ---------- Jahr im Footer ---------- */
    var y = document.querySelectorAll("[data-year]");
    for (var i = 0; i < y.length; i++) { y[i].textContent = new Date().getFullYear(); }

    /* ---------- Overlay-Navigation ---------- */
    var toggle  = document.querySelector(".nav-toggle");
    var overlay = document.getElementById("nav-overlay");
    var ovClose = overlay ? overlay.querySelector(".ov-close") : null;

    function setToggleIcons(open) {
      if (!toggle) return;
      var o = toggle.querySelector(".ic-open"), c = toggle.querySelector(".ic-close");
      if (o) o.style.display = open ? "none" : "";
      if (c) c.style.display = open ? "block" : "";
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
    }
    function openNav() {
      if (!overlay) return;
      overlay.classList.add("open");
      overlay.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      setToggleIcons(true);
    }
    function closeNav() {
      if (!overlay) return;
      overlay.classList.remove("open");
      overlay.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      setToggleIcons(false);
    }
    if (toggle) {
      toggle.addEventListener("click", function () {
        overlay && overlay.classList.contains("open") ? closeNav() : openNav();
      });
    }
    if (ovClose) ovClose.addEventListener("click", closeNav);
    if (overlay) {
      Array.prototype.forEach.call(overlay.querySelectorAll("a"), function (a) {
        a.addEventListener("click", closeNav);
      });
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });

    /* ---------- Navbar-Zustand, Scroll-Fortschritt, Back-to-top ---------- */
    var nav      = document.querySelector(".nav");
    var progress = document.getElementById("scroll-progress");
    var toTop    = document.querySelector(".to-top");
    var ticking  = false;

    function onScroll() {
      var top = window.pageYOffset || document.documentElement.scrollTop;
      if (nav) nav.classList.toggle("scrolled", top > 12);
      if (progress) {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.width = (h > 0 ? (top / h) * 100 : 0) + "%";
      }
      if (toTop) toTop.classList.toggle("show", top > 640);
      updateTimeline();
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
    }, { passive: true });

    if (toTop) {
      toTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      });
    }

    /* ---------- Reveal beim Scrollen ---------- */
    var revealEls = document.querySelectorAll("[data-reveal]");
    if (!("IntersectionObserver" in window) || reduce) {
      Array.prototype.forEach.call(revealEls, function (el) { el.classList.add("in"); });
    } else {
      var ro = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var delay = parseFloat(el.getAttribute("data-delay") || "0");
          setTimeout(function () { el.classList.add("in"); }, delay * 1000);
          ro.unobserve(el);
        });
      }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
      Array.prototype.forEach.call(revealEls, function (el) { ro.observe(el); });
    }

    /* ---------- Count-up-Zähler ---------- */
    var counters = document.querySelectorAll("[data-count]");
    function runCounter(el) {
      var target   = parseFloat(el.getAttribute("data-count"));
      var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
      var suffix   = el.getAttribute("data-suffix") || "";
      var prefix   = el.getAttribute("data-prefix") || "";
      if (reduce) {
        el.textContent = prefix + target.toLocaleString("de-DE", {
          minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
        return;
      }
      var dur = 1600, start = null;
      function step(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = prefix + (target * eased).toLocaleString("de-DE", {
          minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
        if (p < 1) window.requestAnimationFrame(step);
      }
      window.requestAnimationFrame(step);
    }
    if (counters.length) {
      if (!("IntersectionObserver" in window)) {
        Array.prototype.forEach.call(counters, runCounter);
      } else {
        var co = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) { runCounter(e.target); co.unobserve(e.target); }
          });
        }, { threshold: 0.5 });
        Array.prototype.forEach.call(counters, function (el) { co.observe(el); });
      }
    }

    /* ---------- Charts beim Sichtbarwerden zeichnen ---------- */
    var charts = document.querySelectorAll(".chart");
    if (charts.length) {
      if (!("IntersectionObserver" in window) || reduce) {
        Array.prototype.forEach.call(charts, function (c) { c.classList.add("on"); });
      } else {
        var cho = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) { e.target.classList.add("on"); cho.unobserve(e.target); }
          });
        }, { threshold: 0.3 });
        Array.prototype.forEach.call(charts, function (c) { cho.observe(c); });
      }
    }

    /* ---------- Timeline: Linie füllt sich mit dem Scroll ---------- */
    var timeline = document.querySelector(".timeline");
    var tlFill   = document.querySelector(".timeline-fill");
    var tlItems  = document.querySelectorAll(".tl-item");

    function updateTimeline() {
      if (!timeline || !tlFill) return;
      var rect = timeline.getBoundingClientRect();
      var mid  = window.innerHeight * 0.62;
      var raw  = (mid - rect.top) / rect.height;
      var pct  = Math.max(0, Math.min(1, raw));
      tlFill.style.height = (pct * (rect.height - 16)) + "px";
      Array.prototype.forEach.call(tlItems, function (item) {
        var r = item.getBoundingClientRect();
        item.classList.toggle("on", r.top < mid);
      });
    }
    updateTimeline();

    /* ---------- Karten-Glow folgt der Maus ---------- */
    if (!reduce && window.matchMedia("(hover: hover)").matches) {
      Array.prototype.forEach.call(document.querySelectorAll(".card"), function (card) {
        card.addEventListener("mousemove", function (e) {
          var r = card.getBoundingClientRect();
          card.style.setProperty("--mx", (e.clientX - r.left) + "px");
          card.style.setProperty("--my", (e.clientY - r.top) + "px");
        });
      });
    }

    /* ---------- Parallax auf dem Hero-Raster ---------- */
    var heroLines = document.querySelector(".hero-grid-lines");
    if (heroLines && !reduce) {
      window.addEventListener("scroll", function () {
        var t = window.pageYOffset;
        if (t < window.innerHeight * 1.2) {
          heroLines.style.transform = "translateY(" + (t * 0.16) + "px)";
        }
      }, { passive: true });
    }

    /* ---------- Akkordeon ---------- */
    Array.prototype.forEach.call(document.querySelectorAll(".acc-btn"), function (btn) {
      btn.addEventListener("click", function () {
        var item  = btn.closest(".acc-item");
        var panel = item.querySelector(".acc-panel");
        var open  = item.classList.contains("open");
        // andere schließen
        Array.prototype.forEach.call(item.parentNode.querySelectorAll(".acc-item.open"), function (other) {
          if (other !== item) {
            other.classList.remove("open");
            other.querySelector(".acc-panel").style.maxHeight = null;
            other.querySelector(".acc-btn").setAttribute("aria-expanded", "false");
          }
        });
        item.classList.toggle("open", !open);
        btn.setAttribute("aria-expanded", !open ? "true" : "false");
        panel.style.maxHeight = !open ? panel.scrollHeight + "px" : null;
      });
    });

    /* ---------- Kontaktformular → vorausgefüllte E-Mail (kein Backend) ---------- */
    var form = document.getElementById("contact-form");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!form.reportValidity()) return;
        var d = new FormData(form);
        var v = function (k) { return (d.get(k) || "").toString().trim(); };
        var lines = [
          "Unternehmen: " + v("company"),
          "Ansprechpartner:in: " + v("name"),
          "E-Mail: " + v("email"),
          "Telefon: " + (v("phone") || "–"),
          "Anliegen: " + v("topic"),
          "Volumen p. a.: " + (v("volume") || "–"),
          "",
          "Nachricht:",
          v("message")
        ];
        var mail = form.getAttribute("data-mailto") || "info@b2b-hypo-service.de";
        var url = "mailto:" + mail +
          "?subject=" + encodeURIComponent("Anfrage über die Website – " + (v("company") || v("name"))) +
          "&body=" + encodeURIComponent(lines.join("\n"));
        window.location.href = url;
        var status = document.getElementById("form-status");
        if (status) status.classList.add("show");
      });
    }

    /* ---------- Cookie-Hinweis ---------- */
    var cookie = document.querySelector(".cookie");
    if (cookie) {
      var KEY = "bhs-cookie-consent";
      var stored = null;
      try { stored = window.localStorage.getItem(KEY); } catch (err) { stored = "skip"; }
      if (!stored) setTimeout(function () { cookie.classList.add("show"); }, 1600);

      function decide(value) {
        try { window.localStorage.setItem(KEY, value); } catch (err) {}
        cookie.classList.remove("show");
      }
      var acc = cookie.querySelector("[data-cookie='accept']");
      var dec = cookie.querySelector("[data-cookie='decline']");
      if (acc) acc.addEventListener("click", function () { decide("all"); });
      if (dec) dec.addEventListener("click", function () { decide("essential"); });

      Array.prototype.forEach.call(document.querySelectorAll("[data-cookie-open]"), function (link) {
        link.addEventListener("click", function (e) {
          e.preventDefault();
          cookie.classList.add("show");
        });
      });
    }
  });
})();
