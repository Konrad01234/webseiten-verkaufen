/* =========================================================================
   DIE WERKSTATT – Hagen
   Navigation · Öffnungsstatus · Reveals · Rezensionen-Wasserfall · Formular
   Vanilla JS, kein Build, keine externen Dienste.
   ========================================================================= */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ── Öffnungszeiten (0 = Sonntag) ───────────────────────────────── */
  var HOURS = {
    0: [],
    1: [["08:00", "12:30"], ["13:30", "17:30"]],
    2: [["08:00", "12:30"], ["13:30", "17:30"]],
    3: [["08:00", "12:30"], ["13:30", "17:30"]],
    4: [["08:00", "12:30"], ["13:30", "17:30"]],
    5: [["08:00", "12:30"], ["13:30", "15:30"]],
    6: []
  };
  var DAYS = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

  function toMin(hhmm) {
    var p = hhmm.split(":");
    return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
  }

  function openState(now) {
    var day = now.getDay();
    var min = now.getHours() * 60 + now.getMinutes();

    var slots = HOURS[day];
    for (var i = 0; i < slots.length; i++) {
      if (min >= toMin(slots[i][0]) && min < toMin(slots[i][1])) {
        return { open: true, until: slots[i][1] };
      }
    }
    // Nächste Öffnung suchen – heute später, sonst an einem der nächsten Tage
    for (var j = 0; j < slots.length; j++) {
      if (min < toMin(slots[j][0])) {
        return { open: false, nextDay: null, nextTime: slots[j][0] };
      }
    }
    for (var d = 1; d <= 7; d++) {
      var nd = (day + d) % 7;
      if (HOURS[nd].length) {
        return { open: false, nextDay: DAYS[nd], nextTime: HOURS[nd][0][0] };
      }
    }
    return { open: false };
  }

  function paintStatus() {
    var els = $$("[data-status]");
    if (!els.length) return;
    var st = openState(new Date());
    els.forEach(function (el) {
      el.classList.remove("is-open", "is-closed");
      el.classList.add(st.open ? "is-open" : "is-closed");
      var txt = el.querySelector(".status-text");
      if (!txt) return;
      if (st.open) {
        txt.textContent = "Jetzt geöffnet · bis " + st.until + " Uhr";
      } else if (st.nextDay) {
        txt.textContent = "Geschlossen · öffnet " + st.nextDay + " " + st.nextTime + " Uhr";
      } else if (st.nextTime) {
        txt.textContent = "Geschlossen · öffnet heute " + st.nextTime + " Uhr";
      } else {
        txt.textContent = "Geschlossen";
      }
    });
  }

  function markToday() {
    var table = $("[data-hours]");
    if (!table) return;
    var d = new Date().getDay();
    var row = table.querySelector('tr[data-day="' + d + '"]');
    if (row) row.classList.add("today");
  }

  /* ── Navigation ─────────────────────────────────────────────────── */
  function nav() {
    var bar    = $(".nav");
    var toggle = $(".nav-toggle");
    var links  = $("#nav-links");
    if (!bar) return;

    function measure() {
      var top = $(".topbar");
      var h = bar.offsetHeight + (top ? Math.max(0, top.getBoundingClientRect().bottom) : 0);
      document.documentElement.style.setProperty("--nav-h", Math.round(h) + "px");
    }

    if (toggle && links) {
      toggle.addEventListener("click", function () {
        var open = links.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        toggle.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
        measure();
      });
      links.addEventListener("click", function (e) {
        if (e.target.closest("a")) {
          links.classList.remove("open");
          toggle.setAttribute("aria-expanded", "false");
        }
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && links.classList.contains("open")) {
          links.classList.remove("open");
          toggle.setAttribute("aria-expanded", "false");
          toggle.focus();
        }
      });
    }

    var onScroll = function () {
      bar.classList.toggle("is-stuck", window.scrollY > 8);
      measure();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    measure();
    onScroll();
  }

  /* ── Reveals ────────────────────────────────────────────────────── */
  function reveals() {
    var items = $$("[data-reveal]");
    if (!items.length) return;
    if (reduced || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        var i = parseInt(el.getAttribute("data-reveal") || "0", 10) || 0;
        el.style.setProperty("--d", (i * 0.07) + "s");
        el.classList.add("in");
        io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ── Zähler ─────────────────────────────────────────────────────── */
  function counters() {
    var nums = $$("[data-count]");
    if (!nums.length) return;
    if (reduced || !("IntersectionObserver" in window)) {
      nums.forEach(function (el) { el.textContent = el.getAttribute("data-count"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        io.unobserve(el);
        var target = el.getAttribute("data-count");
        var dec = target.indexOf(",") > -1;
        var end = parseFloat(target.replace(",", "."));
        var t0 = null;
        function tick(ts) {
          if (!t0) t0 = ts;
          var p = Math.min(1, (ts - t0) / 1100);
          var v = end * (1 - Math.pow(1 - p, 3));
          el.textContent = dec ? v.toFixed(1).replace(".", ",") : Math.round(v).toString();
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = target;
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });
    nums.forEach(function (el) { io.observe(el); });
  }

  /* ── Rezensionen-Wasserfall ─────────────────────────────────────── */
  function wall() {
    var w = $(".wall");
    if (!w || reduced) return;

    $$(".wall-col", w).forEach(function (col) {
      var track = $(".wall-track", col);
      if (!track) return;
      // Spalte so oft wiederholen, bis sie höher als das Fenster ist,
      // danach verdoppeln → nahtlose Endlosschleife bei -50 %
      var base = track.innerHTML;
      var need = w.clientHeight * 1.2;
      for (var n = 0; n < 8 && track.getBoundingClientRect().height < need; n++) {
        track.insertAdjacentHTML("beforeend", base);
      }
      track.innerHTML += track.innerHTML;
      $$("[data-reveal]", track).forEach(function (el) {
        el.removeAttribute("data-reveal");
        el.classList.add("in");
      });
      var speed = parseFloat(col.getAttribute("data-speed")) || 55;
      track.style.setProperty("--dur", speed + "s");
    });
    w.classList.add("is-live");
  }

  /* ── Terminanfrage → vorausgefüllte E-Mail ──────────────────────── */
  function form() {
    var f = $("#termin-form");
    if (!f) return;
    var msg = $("#form-msg");

    f.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!f.reportValidity()) return;

      var d = new FormData(f);
      var g = function (k) { return (d.get(k) || "").toString().trim(); };

      var lines = [
        "Terminanfrage über die Website",
        "",
        "Name:        " + g("name"),
        "Telefon:     " + g("telefon"),
        "E-Mail:      " + g("email"),
        "Fahrzeug:    " + g("fahrzeug"),
        "Kennzeichen: " + g("kennzeichen"),
        "Leistung:    " + g("leistung"),
        "Wunschtermin:" + " " + g("termin"),
        "",
        "Beschreibung:",
        g("nachricht"),
        "",
        "--",
        "Gesendet über die Website von DIE WERKSTATT"
      ];

      var mail = f.getAttribute("data-mail") || "";
      var href = "mailto:" + mail +
        "?subject=" + encodeURIComponent("Terminanfrage – " + (g("leistung") || "Werkstatt") + " – " + g("name")) +
        "&body=" + encodeURIComponent(lines.join("\n"));

      window.location.href = href;

      if (msg) {
        msg.className = "form-msg show";
        msg.textContent = "Ihr E-Mail-Programm öffnet sich mit der fertigen Anfrage. " +
          "Bitte noch abschicken – oder rufen Sie uns einfach unter 02331 3762876 an.";
      }
    });
  }

  /* ── Jahr im Footer ─────────────────────────────────────────────── */
  function year() {
    $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  }

  function init() {
    nav(); paintStatus(); markToday(); reveals(); counters(); wall(); form(); year();
    setInterval(paintStatus, 60000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
