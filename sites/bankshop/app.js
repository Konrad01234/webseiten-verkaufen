/* =========================================================
   Bankshop Broderstorf – Progressive Enhancement
   Vanilla JS, keine Abhängigkeiten. Alles funktioniert auch ohne JS.
   ========================================================= */
(function () {
  "use strict";

  document.documentElement.classList.add("js");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var EUR = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
  var EUR2 = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 });
  var PCT = new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  document.addEventListener("DOMContentLoaded", function () {

    /* ---------- Navigation (Mobile-Overlay) ---------- */
    var toggle  = document.querySelector(".nav-toggle");
    var overlay = document.getElementById("nav-overlay");
    var ovClose = overlay ? overlay.querySelector(".ov-close") : null;

    function setNav(open) {
      if (!overlay) return;
      overlay.classList.toggle("open", open);
      overlay.setAttribute("aria-hidden", open ? "false" : "true");
      if (toggle) {
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        var o = toggle.querySelector(".ic-open"), c = toggle.querySelector(".ic-close");
        if (o) o.style.display = open ? "none" : "";
        if (c) c.style.display = open ? "block" : "";
      }
      document.body.style.overflow = open ? "hidden" : "";
    }
    if (toggle) toggle.addEventListener("click", function () { setNav(!(overlay && overlay.classList.contains("open"))); });
    if (ovClose) ovClose.addEventListener("click", function () { setNav(false); });
    if (overlay) {
      Array.prototype.forEach.call(overlay.querySelectorAll("a"), function (a) {
        a.addEventListener("click", function () { setNav(false); });
      });
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && overlay && overlay.classList.contains("open")) setNav(false);
    });

    /* ---------- Reveal beim Scrollen ---------- */
    var reveal = document.querySelectorAll(".reveal, .reveal-l, .reveal-r");
    if ("IntersectionObserver" in window && reveal.length && !reduce) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
        });
      }, { threshold: .12, rootMargin: "0px 0px -7% 0px" });
      Array.prototype.forEach.call(reveal, function (el) { io.observe(el); });
    } else {
      Array.prototype.forEach.call(reveal, function (el) { el.classList.add("in"); });
    }

    /* ---------- Navbar-Schatten + Lesefortschritt ---------- */
    var nav = document.querySelector(".nav");
    var bar = document.getElementById("scroll-progress");
    var ticking = false;
    function onScroll() {
      var y = window.pageYOffset || document.documentElement.scrollTop || 0;
      if (nav) nav.classList.toggle("scrolled", y > 8);
      if (bar) {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.setProperty("--sp", h > 0 ? (y / h).toFixed(4) : 0);
      }
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
    }, { passive: true });
    onScroll();

    /* ---------- Zähler ---------- */
    function animateCount(el) {
      var to = parseFloat(el.getAttribute("data-to"));
      var suf = el.getAttribute("data-suffix") || "";
      var pre = el.getAttribute("data-prefix") || "";
      var dec = parseInt(el.getAttribute("data-dec") || "0", 10);
      if (isNaN(to)) return;
      var fmt = function (v) { return v.toLocaleString("de-DE", { minimumFractionDigits: dec, maximumFractionDigits: dec }); };
      if (reduce) { el.textContent = pre + fmt(to) + suf; return; }
      var dur = 1400, start = null;
      function step(t) {
        if (!start) start = t;
        var p = Math.min((t - start) / dur, 1);
        var v = to * (1 - Math.pow(1 - p, 3));
        el.textContent = pre + fmt(dec ? Math.round(v * 100) / 100 : Math.round(v)) + suf;
        if (p < 1) window.requestAnimationFrame(step); else el.textContent = pre + fmt(to) + suf;
      }
      window.requestAnimationFrame(step);
    }
    var counts = document.querySelectorAll("[data-to]");
    if ("IntersectionObserver" in window && counts.length) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { animateCount(e.target); cio.unobserve(e.target); }
        });
      }, { threshold: .5 });
      Array.prototype.forEach.call(counts, function (el) { cio.observe(el); });
    } else {
      Array.prototype.forEach.call(counts, animateCount);
    }

    /* ---------- Heutigen Öffnungstag hervorheben ---------- */
    var day = new Date().getDay();
    var iso = day === 0 ? 7 : day;
    Array.prototype.forEach.call(document.querySelectorAll(".hours-table tr[data-day]"), function (tr) {
      tr.getAttribute("data-day").split(",").forEach(function (d) {
        if (parseInt(d, 10) === iso) tr.classList.add("today");
      });
    });

    /* =========================================================
       Baufinanzierungs-Rechner
       Annuitätendarlehen: Rate = Darlehen * (Sollzins + Tilgung) / 12
       ========================================================= */
    var calc = document.getElementById("calc");
    if (calc) {
      var f = {
        preis:   document.getElementById("c-preis"),
        neben:   document.getElementById("c-neben"),
        ek:      document.getElementById("c-ek"),
        zins:    document.getElementById("c-zins"),
        tilgung: document.getElementById("c-tilgung"),
        bindung: document.getElementById("c-bindung")
      };
      var out = {
        rate:      document.getElementById("o-rate"),
        darlehen:  document.getElementById("o-darlehen"),
        gesamt:    document.getElementById("o-gesamt"),
        neben:     document.getElementById("o-neben"),
        quote:     document.getElementById("o-quote"),
        restschuld:document.getElementById("o-restschuld"),
        zinsen:    document.getElementById("o-zinsen"),
        laufzeit:  document.getElementById("o-laufzeit"),
        warn:      document.getElementById("o-warn"),
        chart:     document.getElementById("o-chart")
      };

      function fillTrack(input) {
        var min = parseFloat(input.min), max = parseFloat(input.max), v = parseFloat(input.value);
        input.style.setProperty("--fill", ((v - min) / (max - min) * 100).toFixed(2) + "%");
      }

      function drawChart(points, years) {
        if (!out.chart) return;
        var w = 100, h = 40, max = points[0] || 1;
        var d = "", i;
        for (i = 0; i < points.length; i++) {
          var x = (i / (points.length - 1 || 1)) * w;
          var y = h - (points[i] / max) * h;
          d += (i === 0 ? "M" : "L") + x.toFixed(2) + "," + y.toFixed(2);
        }
        var area = d + "L" + w + "," + h + "L0," + h + "Z";
        out.chart.innerHTML =
          '<defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0%" stop-color="#e3b465" stop-opacity=".55"/>' +
          '<stop offset="100%" stop-color="#e3b465" stop-opacity="0"/></linearGradient></defs>' +
          '<path d="' + area + '" fill="url(#cg)"/>' +
          '<path d="' + d + '" fill="none" stroke="#e3b465" stroke-width="1.4" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>' +
          '<line x1="0" y1="' + h + '" x2="' + w + '" y2="' + h + '" stroke="rgba(255,255,255,.22)" stroke-width=".6" vector-effect="non-scaling-stroke"/>';
        var lbl = document.getElementById("o-chart-label");
        if (lbl) lbl.textContent = "Restschuldverlauf über " + years + " Jahre Zinsbindung";
      }

      function update() {
        var preis   = +f.preis.value;
        var nebenP  = +f.neben.value;
        var ek      = +f.ek.value;
        var zins    = +f.zins.value;
        var tilgung = +f.tilgung.value;
        var bindung = +f.bindung.value;

        Object.keys(f).forEach(function (k) { if (f[k].type === "range") fillTrack(f[k]); });

        var nebenkosten = preis * nebenP / 100;
        var gesamt      = preis + nebenkosten;
        var darlehen    = Math.max(gesamt - ek, 0);
        var rateMonat   = darlehen * (zins + tilgung) / 100 / 12;
        var quote       = preis > 0 ? (darlehen / preis) * 100 : 0;

        /* Monatliche Tilgungsrechnung */
        var rest = darlehen, zinsSumme = 0, m = 0, maxM = 50 * 12, points = [darlehen], restNachBindung = darlehen;
        var zm = zins / 100 / 12;
        while (rest > 0.5 && m < maxM) {
          var z = rest * zm;
          var t = rateMonat - z;
          if (t <= 0) break;                 /* Rate deckt die Zinsen nicht */
          rest = Math.max(rest - t, 0);
          zinsSumme += z;
          m++;
          if (m % 12 === 0 && m <= bindung * 12) points.push(rest);
          if (m === bindung * 12) restNachBindung = rest;
        }
        if (m < bindung * 12) restNachBindung = rest;   /* vorher abbezahlt */

        var jahre = Math.floor(m / 12), monate = m % 12;

        if (out.rate)       out.rate.textContent = EUR2.format(rateMonat);
        if (out.darlehen)   out.darlehen.textContent = EUR.format(darlehen);
        if (out.gesamt)     out.gesamt.textContent = EUR.format(gesamt);
        if (out.neben)      out.neben.textContent = EUR.format(nebenkosten);
        if (out.quote)      out.quote.textContent = PCT.format(quote) + " %";
        if (out.restschuld) out.restschuld.textContent = EUR.format(restNachBindung);
        if (out.zinsen)     out.zinsen.textContent = EUR.format(zinsSumme);
        if (out.laufzeit)   out.laufzeit.textContent = (m >= maxM ? "über 50 Jahre" : jahre + " J. " + monate + " Mon.");

        if (out.warn) {
          var msg = "";
          if (darlehen <= 0) msg = "Ihr Eigenkapital deckt Kaufpreis und Nebenkosten – wir beraten Sie gern zur optimalen Anlage.";
          else if (rateMonat <= darlehen * zm) msg = "Bei dieser Tilgung wird das Darlehen nie zurückgeführt. Bitte Tilgung erhöhen.";
          else if (quote > 100) msg = "Vollfinanzierung über 100 % – möglich, aber zinsintensiv. Sprechen Sie uns an.";
          else if (ek < nebenkosten) msg = "Tipp: Die Kaufnebenkosten sollten möglichst aus Eigenkapital gedeckt sein.";
          out.warn.textContent = msg;
          out.warn.style.display = msg ? "block" : "none";
        }

        drawChart(points, bindung);
      }

      Object.keys(f).forEach(function (k) {
        if (!f[k]) return;
        f[k].addEventListener("input", function () {
          var lbl = document.querySelector('[data-for="' + f[k].id + '"]');
          if (lbl) {
            var unit = lbl.getAttribute("data-unit") || "";
            var v = +f[k].value;
            lbl.textContent = unit === "€"
              ? EUR.format(v)
              : v.toLocaleString("de-DE", { minimumFractionDigits: lbl.getAttribute("data-dec") ? 2 : 0, maximumFractionDigits: 2 }) + " " + unit;
          }
          update();
        });
        /* Startwerte in die Labels schreiben */
        f[k].dispatchEvent(new Event("input"));
      });
      update();

      /* Ergebnis per E-Mail anfragen */
      var calcSend = document.getElementById("calc-send");
      if (calcSend) {
        calcSend.addEventListener("click", function (e) {
          e.preventDefault();
          var lines = [
            "Anfrage über den Finanzierungsrechner auf der Website",
            "-------------------------------------------------------",
            "Kaufpreis:              " + EUR.format(+f.preis.value),
            "Kaufnebenkosten:        " + f.neben.value + " % (" + (out.neben ? out.neben.textContent : "") + ")",
            "Eigenkapital:           " + EUR.format(+f.ek.value),
            "Sollzins (Annahme):     " + f.zins.value + " %",
            "Anfängliche Tilgung:    " + f.tilgung.value + " %",
            "Zinsbindung:            " + f.bindung.value + " Jahre",
            "",
            "Berechnete monatliche Rate: " + (out.rate ? out.rate.textContent : ""),
            "Darlehenssumme:             " + (out.darlehen ? out.darlehen.textContent : ""),
            "Restschuld nach Zinsbindung:" + (out.restschuld ? out.restschuld.textContent : ""),
            "",
            "Bitte melden Sie sich bei mir für ein unverbindliches Angebot.",
            "",
            "Name:      ",
            "Telefon:   ",
            "E-Mail:    "
          ];
          window.location.href = "mailto:baufinanz@bankshop-nord.de?subject=" +
            encodeURIComponent("Finanzierungsanfrage über den Online-Rechner") +
            "&body=" + encodeURIComponent(lines.join("\n"));
        });
      }
    }

    /* ---------- Kontaktformular -> mailto (kein Backend nötig) ---------- */
    var form = document.getElementById("contact-form");
    if (form) {
      form.addEventListener("submit", function (ev) {
        ev.preventDefault();
        var get = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ""; };
        var name = get("k-name");
        var lines = [
          "Anfrage über bankshop-broderstorf (Website)",
          "-------------------------------------------",
          "Name:        " + name,
          "Telefon:     " + get("k-telefon"),
          "E-Mail:      " + get("k-email"),
          "Anliegen:    " + get("k-thema"),
          "Vorhaben:    " + get("k-summe"),
          "Wunschtermin:" + get("k-termin"),
          "",
          "Nachricht:",
          get("k-nachricht")
        ];
        window.location.href = "mailto:baufinanz@bankshop-nord.de?subject=" +
          encodeURIComponent("Beratungsanfrage" + (name ? " – " + name : "")) +
          "&body=" + encodeURIComponent(lines.join("\n"));
        var status = document.getElementById("form-status");
        if (status) {
          status.textContent = "Vielen Dank" + (name ? ", " + name : "") + "! Ihr E-Mail-Programm öffnet sich mit der vorausgefüllten Anfrage. " +
            "Lieber direkt sprechen? Rufen Sie uns unter 038204 69 11 66 an.";
          status.classList.add("show", "ok");
        }
      });
    }

    /* ---------- Cookie-Hinweis ---------- */
    var cookie = document.getElementById("cookie-banner");
    if (cookie) {
      var KEY = "bankshop-cookie-consent";
      var read  = function () { try { return localStorage.getItem(KEY); } catch (e) { return "x"; } };
      var store = function (v) { try { localStorage.setItem(KEY, v); } catch (e) {} cookie.classList.remove("show"); };
      if (!read()) setTimeout(function () { cookie.classList.add("show"); }, 800);
      Array.prototype.forEach.call(cookie.querySelectorAll("[data-cookie]"), function (b) {
        b.addEventListener("click", function () { store(b.getAttribute("data-cookie")); });
      });
      Array.prototype.forEach.call(document.querySelectorAll("[data-cookie-open]"), function (a) {
        a.addEventListener("click", function (e) { e.preventDefault(); cookie.classList.add("show"); });
      });
    }

    /* ---------- Jahreszahl im Footer ---------- */
    var y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();
  });
})();
