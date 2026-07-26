#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Seiten-Generator für die Website der Kfz-Möckl GmbH.

Die Website selbst ist reines statisches HTML (kein Build-Schritt beim Deploy).
Dieses Skript existiert nur, damit Navigation, Footer, Head und Cookie-Banner
über alle 14 Seiten identisch bleiben.

Inhalte ändern  ->  in diesem Skript bearbeiten  ->  `python3 build.py`
"""

import os

HERE = os.path.dirname(os.path.abspath(__file__))

# ── Stammdaten ───────────────────────────────────────────────────────────────
FIRMA   = "Kfz-Möckl GmbH"
STRASSE = "Ulmer Str. 55"
PLZ_ORT = "86156 Augsburg-Kriegshaber"
TEL     = "0821 4444242"
TEL_URI = "+498214444242"
MAIL    = "kfz-moeckl@web.de"
MAPS    = "https://www.google.com/maps/search/?api=1&query=Kfz-M%C3%B6ckl+GmbH+Ulmer+Str.+55+86156+Augsburg"

# ── Icons (24×24, stroke) ────────────────────────────────────────────────────
I = {
    "phone":   '<path d="M5 3h3l2 5-2 1c1 3 3 5 6 6l1-2 5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2Z"/>',
    "mail":    '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    "pin":     '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    "clock":   '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    "check":   '<path d="M4 12.5 9.5 18 20 6.5"/>',
    "arrow":   '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
    "chevron": '<path d="m6 9 6 6 6-6"/>',
    "menu":    '<path d="M4 7h16M4 12h16M4 17h16"/>',
    "close":   '<path d="M6 6l12 12M18 6 6 18"/>',
    "shield":  '<path d="M12 3l8 3v6c0 5-3.4 8.3-8 9.8C7.4 20.3 4 17 4 12V6l8-3Z"/><path d="m8.8 12.2 2.2 2.2 4.2-4.4"/>',
    "badge":   '<path d="M12 2.6 14.6 5l3.5.2.2 3.5L20.7 12l-2.4 3.3-.2 3.5-3.5.2L12 21.4 9.4 19l-3.5-.2-.2-3.5L3.3 12l2.4-3.3.2-3.5L9.4 5 12 2.6Z"/><path d="m8.7 12.2 2.2 2.2 4.4-4.4"/>',
    "oil":     '<path d="M12 3s5.4 6 5.4 9.7A5.4 5.4 0 0 1 12 18.2a5.4 5.4 0 0 1-5.4-5.5C6.6 9 12 3 12 3Z"/><path d="M12 15.4a2.6 2.6 0 0 1-2.6-2.7"/>',
    "brake":   '<circle cx="11" cy="12" r="8"/><circle cx="11" cy="12" r="2.6"/><path d="M19.2 8.4H21a1 1 0 0 1 1 1v5.2a1 1 0 0 1-1 1h-1.8"/>',
    "tire":    '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.4"/><path d="M12 3v3.6M12 17.4V21M3 12h3.6M17.4 12H21"/>',
    "spring":  '<path d="M7.5 3.2h9M7.5 20.8h9"/><path d="M16 5.8H8l8 3.2H8l8 3.2H8l8 3.2H8"/>',
    "cog":     '<circle cx="12" cy="12" r="3.3"/><path d="M12 2.6v2.6M12 18.8v2.6M4.9 12H2.3M21.7 12h-2.6M6.3 6.3 4.5 4.5M19.5 19.5l-1.8-1.8M17.7 6.3l1.8-1.8M4.5 19.5l1.8-1.8"/>',
    "key":     '<circle cx="7.5" cy="16.5" r="3.5"/><path d="m10 14 8.5-8.5M15 6.5l2.5 2.5M17.5 4l2.5 2.5"/>',
    "car":     '<path d="M4 16v-3.2L6 8h12l2 4.8V16"/><path d="M4 16h16v2.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5V16M7 16v2.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5V16"/><path d="M5.5 12.8h13"/>',
    "star":    '<path d="m12 2.8 2.9 5.9 6.5 1-4.7 4.6 1.1 6.5-5.8-3.1-5.8 3.1 1.1-6.5L2.6 9.7l6.5-1L12 2.8Z"/>',
    "users":   '<circle cx="9" cy="8" r="3.4"/><path d="M2.8 20c0-3.4 2.8-6.2 6.2-6.2s6.2 2.8 6.2 6.2"/><path d="M16 5.2a3.4 3.4 0 0 1 0 6.6M17.5 13.9c2.2.7 3.7 2.7 3.7 5.1"/>',
    "euro":    '<circle cx="12" cy="12" r="9"/><path d="M15.6 8.6a4.4 4.4 0 0 0-6.9 1.2h5M15.6 15.4a4.4 4.4 0 0 1-6.9-1.2h5"/>',
    "info":    '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.8v.4"/>',
    "calendar":'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9.5h18M8 3v4M16 3v4"/>',
    "bolt":    '<path d="M13.5 2.5 5 13.8h5.5L9.8 21.5 18.5 10H13l.5-7.5Z"/>',
    "wrench":  '<path d="M13.8 4.4a4.8 4.8 0 0 1 5.6 6.7l-2.6-2.6-2.4.6-.6-2.4 2.6-2.6a4.8 4.8 0 0 0-2.6.3Z"/><path d="M13.6 10.4 4.8 19.2a1.8 1.8 0 0 0 2.6 2.6l8.8-8.8"/>',
    "leaf":    '<path d="M4 20c0-8.8 6-14.6 16-14.6C20 15.2 14 21 4 20Z"/><path d="M9 15c1.9-2.9 4.8-4.8 8.6-5.8"/>',
}


def ic(name, cls=""):
    """Inline-SVG-Icon."""
    c = ' class="%s"' % cls if cls else ""
    return ('<svg%s viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" '
            'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">%s</svg>' % (c, I[name]))


def ic_fill(name, cls=""):
    c = ' class="%s"' % cls if cls else ""
    return '<svg%s viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">%s</svg>' % (c, I[name])


def stars(n=5):
    return '<div class="tstars" aria-label="%d von 5 Sternen">%s</div>' % (n, ic_fill("star") * n)


# ── Leistungen (jede mit eigener Unterseite) ─────────────────────────────────
SERVICES = [
    ("hu-au",       "HU & AU",                "badge",
     "Hauptuntersuchung und Abgasuntersuchung direkt bei uns im Haus – inklusive Vorabcheck, damit Sie beim ersten Anlauf durchkommen."),
    ("inspektion",  "Inspektion & Ölwechsel", "oil",
     "Wartung nach Herstellervorgabe – und ein Ölwechsel nur dann, wenn er wirklich fällig ist. Nicht, weil eine Anzeige leuchtet."),
    ("bremsen",     "Bremsen",                "brake",
     "Beläge, Scheiben, Bremsflüssigkeit, Handbremse. Wir prüfen die komplette Anlage und tauschen nur die Teile, die verschlissen sind."),
    ("reifen",      "Reifen & Räder",         "tire",
     "Reifenwechsel, Neureifen, Auswuchten, Reparatur und Einlagerung – für Sommer, Winter und Ganzjahresreifen."),
    ("fahrwerk",    "Fahrwerk & Lenkung",     "spring",
     "Stoßdämpfer, Federn, Querlenker, Spurstangen, Radlager: Wir finden die Ursache für Poltern, Ziehen und schwammiges Lenkgefühl."),
    ("reparatur",   "Reparatur & Diagnose",   "cog",
     "Von der Fehlerspeicher-Auslese über Kupplung und Sensorik bis zum Marderschaden – Reparatur an allen Marken."),
]

SERVICE_BY_SLUG = {s[0]: s for s in SERVICES}

# ── Kundenstimmen (Google-Rezensionen, Stand Juli 2026) ──────────────────────
REVIEWS = [
    ("meermensch", "m", "Local Guide · 98 Rezensionen", "vor 4 Jahren", 5,
     "Nachdem ich wieder einen Benziner habe, werde ich wieder zu dieser, meiner, Werkstatt meines "
     "Vertrauens gehen. Da ist 1000 % Vertrauen da. Klare Ansagen, klare Preiskalkulation, klare "
     "Meinungen, beste Arbeit, schnell, pünktlich und immer wieder extrem gut. Danke für Eure Arbeit!!"),
    ("Erika Greiner", "E", "Local Guide · 45 Rezensionen", "vor 2 Jahren", 5,
     "Sehr kompetent, freundlich, Preis mehr als angemessen. Es wird nichts unnötig gemacht, nur um Geld "
     "zu verdienen – z. B. Ölwechsel. Danke. Sehr zum Weiterempfehlen."),
    ("Rebecca Heimerl", "R", "11 Rezensionen für Augsburg", "vor 3 Monaten", 5,
     "Ich hatte ein Problem mit einem Marderschaden an den Zündkerzen und mir wurde hier wirklich schnell "
     "und professionell geholfen. Das Team hat den Schaden innerhalb eines Tages behoben – absolut top! "
     "Die Kommunikation war durchgehend klar, freundlich und zuverlässig."),
    ("Sandra Eberle", "S", "13 Rezensionen", "vor 2 Monaten", 5,
     "Kam auf Empfehlung einer Kollegin und das war definitiv eine gute Empfehlung! Preislich sehr fair, "
     "Auto wurde noch am Tag der Abgabe repariert, obwohl ich auf Wartezeit eingestellt war, Mitarbeiter "
     "alle sehr freundlich. Das wird definitiv meine neue Werkstatt!"),
    ("Fallen Angel", "F", "Local Guide · 23 Rezensionen", "vor 9 Monaten", 5,
     "Ich dachte, ich muss Ölwechsel machen, da es so auf der Anzeige vom Auto stand. Nachdem sich der junge "
     "Mann das Auto angeschaut hat, wurde mir erklärt, dass ich noch nichts machen muss, was das Öl angeht. "
     "Es gibt Leute, die würden diesbezüglich nichts sagen und schön Geld kassieren. Hiermit sage ich danke "
     "für die Ehrlichkeit."),
    ("Katharina Vogt", "K", "18 Rezensionen", "vor einem Jahr", 5,
     "Beste Werkstatt, super freundlich! Helfen immer umgehend mit Problemen, keine Reparaturen ohne "
     "Zustimmung – kann ich zu 100 % weiterempfehlen."),
    ("Dede", "D", "Local Guide · 15 Rezensionen", "vor 8 Monaten", 5,
     "Absolute Empfehlung meinerseits! Bin dort seit langem Kunde. Hab wieder meinen TÜV gemacht, alles "
     "tipptopp. Die Kommunikation ist hervorragend und preislich alles sehr transparent! Vielen Dank."),
    ("Michael Stauer", "M", "11 Rezensionen für Augsburg", "vor 2 Jahren", 5,
     "Super Werkstatt mit sehr freundlichem Chef und Personal. Es wird nur gerichtet, was sein muss."),
    ("Hahni", "H", "11 Rezensionen für Augsburg", "vor 5 Jahren", 5,
     "Sehr freundlich und hilfsbereit, ohne Wartezeit sofort Termin bekommen. Es wird nur repariert, was "
     "wirklich gemacht werden muss, ohne die Leute über den Tisch zu ziehen. Daumen hoch, gerne wieder."),
    ("Rose Maria", "R", "Local Guide · 7 Rezensionen", "vor 2 Jahren", 5,
     "Ich war zum ersten Mal in dieser Werkstatt. Bin mit Freundlichkeit empfangen worden, wurde "
     "professionell beraten. Mein Anliegen wurde sehr schnell erledigt, der Preis mehr als fair."),
    ("Illusion Of Time", "I", "9 Rezensionen", "vor 2 Jahren", 5,
     "Absolut hervorragend! Professionelle Beratung, authentisches Ambiente und Preis-Leistung perfekt. "
     "Gerne wieder."),
    ("Olivia S", "O", "5 Rezensionen", "vor 4 Jahren", 5,
     "Unsere Kupplung wurde innerhalb von 3 Tagen getauscht und das zu einem fairen Preis! Ich kann die "
     "Werkstatt daher nur weiterempfehlen!"),
    ("Scarlett Lettscar", "S", "11 Rezensionen", "vor 4 Jahren", 5,
     "Ob HU, Inspektion oder Reparatur, hier wird alles zu unserer Zufriedenheit schnell und günstig "
     "erledigt. Eine Werkstatt, die ich nur weiterempfehlen kann!"),
    ("Google-Rezension", "G", "3 Rezensionen", "vor 10 Monaten", 5,
     "Sehr kompetente und transparente Beratung, dazu faire Preise. Ich habe mich bestens aufgehoben "
     "gefühlt – klare Empfehlung!"),
    ("Matze Benning", "M", "6 Rezensionen", "vor 3 Jahren", 5,
     "Gute Werkstatt, die weiß, was zu tun ist. Faire Preise, guter Service. Gerne immer wieder."),
    ("Claudia", "C", "2 Rezensionen", "vor einem Jahr", 5,
     "Super Werkstatt, keine unnötigen Kosten, faire Preise."),
    ("Daniel „Tannibal“ Lechner", "D", "3 Rezensionen", "vor einem Jahr", 5,
     "Sehr freundlich, unkompliziert, Preis/Leistung passt."),
    ("Torsten Sommer", "T", "3 Rezensionen", "vor 4 Jahren", 5,
     "Ich habe bei Stefan Möckl ein kleines, sehr preiswertes Auto gekauft und ich muss sagen, dass es voll "
     "und ganz die Zeit wert war – von Nürnberg aus."),
    ("Roland Wittmann", "R", "9 Rezensionen", "vor 2 Jahren", 4,
     "Gute Werkstatt, da wird einem schnell, günstig und qualitativ geholfen. Jederzeit gerne wieder!"),
]

# Kurzzitate für das Laufband
MARQUEE = [
    "„Klare Ansagen, klare Preiskalkulation.“",
    "„Es wird nur repariert, was wirklich gemacht werden muss.“",
    "„Keine Reparaturen ohne Zustimmung.“",
    "„Preislich alles sehr transparent.“",
    "„Ohne Wartezeit sofort Termin bekommen.“",
    "„Schaden innerhalb eines Tages behoben.“",
    "„Danke für die Ehrlichkeit.“",
    "„Werkstatt meines Vertrauens.“",
    "„Faire Preise, guter Service.“",
    "„Keine unnötigen Kosten.“",
]

# ── Öffnungszeiten ───────────────────────────────────────────────────────────
# ACHTUNG: Vom Inhaber noch zu bestätigen – Google Business nennt keine Zeiten.
HOURS = [
    ("Montag – Donnerstag", "08:00 – 17:30", "1,2,3,4", False),
    ("Freitag",             "08:00 – 16:00", "5",       False),
    ("Samstag",             "nach Vereinbarung", "6",   True),
    ("Sonntag",             "geschlossen",   "7",       True),
]
HOURS_SHORT = ["Mo – Do · 08:00 – 17:30", "Fr · 08:00 – 16:00", "Sa · nach Vereinbarung", "So · geschlossen"]


# ── Wiederverwendbare Bausteine ──────────────────────────────────────────────
CREST = '''<svg class="crest" viewBox="0 0 48 48" aria-hidden="true">
        <rect x="1.5" y="1.5" width="45" height="45" rx="11" fill="#0b2949" stroke="#1f5c9e" stroke-width="1.5"/>
        <path d="M12 34V14h5.4L24 24.4 30.6 14H36v20h-5V22.6L24 33.5 17 22.6V34Z" fill="#ffc61a"/>
        <rect x="12" y="37" width="24" height="2.6" rx="1.3" fill="#2f7bc9"/>
      </svg>'''

FAVICON = ("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E"
           "%3Crect width='48' height='48' rx='11' fill='%230b2949'/%3E"
           "%3Cpath d='M12 34V14h5.4L24 24.4 30.6 14H36v20h-5V22.6L24 33.5 17 22.6V34Z' fill='%23ffc61a'/%3E%3C/svg%3E")

# Blueprint-Auto (Seitenansicht) – zeichnet sich beim Laden selbst
CAR_SVG = '''<svg class="hero-car" data-parallax="0.16" viewBox="0 0 660 250" fill="none" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path class="ground" d="M8 214h644" stroke-dasharray="3 9"/>
        <path class="body" data-draw d="M46 186v-30c0-13 9-20 24-24l72-18c19-30 46-52 86-57l148-3c40 2 64 21 90 54l108 20c26 5 42 15 46 30v28"/>
        <path class="glass" data-draw d="M160 112c17-26 40-44 74-47l60-1v48Zm146-48 62 1c31 3 50 20 70 47l-132 1Z"/>
        <circle class="rim" data-draw cx="168" cy="186" r="40"/>
        <circle class="rim" data-draw cx="168" cy="186" r="19"/>
        <circle class="rim" data-draw cx="504" cy="186" r="40"/>
        <circle class="rim" data-draw cx="504" cy="186" r="19"/>
        <path class="body" data-draw d="M300 66v48M232 186h240M120 150h32M556 152h-30"/>
      </svg>'''


def nav_html(active, service_active=None):
    """Sticky-Navigation inklusive Leistungs-Dropdown."""
    items = [("index.html", "Start", "start"),
             ("gebrauchtwagen.html", "Gebrauchtwagen", "gebrauchtwagen"),
             ("ueber-uns.html", "Über uns", "ueber-uns"),
             ("bewertungen.html", "Bewertungen", "bewertungen"),
             ("kontakt.html", "Kontakt", "kontakt")]

    drop = "\n".join(
        '            <a href="%s.html"%s>%s%s</a>' % (
            slug, ' class="active"' if slug == service_active else "", ic(icon), title)
        for slug, title, icon, _ in SERVICES)

    left = '          <a href="%s"%s>%s</a>' % (
        items[0][0], ' class="active"' if items[0][2] == active else "", items[0][1])

    rest = "\n".join(
        '          <a href="%s"%s>%s</a>' % (url, ' class="active"' if key == active else "", label)
        for url, label, key in items[1:])

    is_svc = active == "leistungen"
    return '''      <nav class="nav-links" id="nav-links" aria-label="Hauptnavigation">
%s
        <div class="nav-drop%s">
          <button type="button" aria-expanded="false">Leistungen %s</button>
          <div class="nav-drop-menu">
            <a href="leistungen.html"%s>%s Alle Leistungen</a>
%s
          </div>
        </div>
%s
      </nav>''' % (left, " is-active" if is_svc else "", ic("chevron"),
                  ' class="active"' if active == "leistungen" and not service_active else "",
                  ic("cog"), drop, rest)


def overlay_html(active, service_active=None):
    main = [("index.html", "Start", "start"),
            ("leistungen.html", "Leistungen", "leistungen"),
            ("gebrauchtwagen.html", "Gebrauchtwagen", "gebrauchtwagen"),
            ("ueber-uns.html", "Über uns", "ueber-uns"),
            ("bewertungen.html", "Bewertungen", "bewertungen"),
            ("kontakt.html", "Kontakt", "kontakt")]
    links = "\n".join(
        '        <a href="%s"%s>%s</a>' % (u, ' class="active"' if k == active and not service_active else "", t)
        for u, t, k in main)
    svc = "\n".join(
        '        <a href="%s.html"%s>%s</a>' % (s, ' class="active"' if s == service_active else "", t)
        for s, t, _, _ in SERVICES)
    return '''  <div id="nav-overlay" role="dialog" aria-modal="true" aria-label="Navigation" aria-hidden="true">
    <button class="ov-close" type="button" aria-label="Menü schließen">%s</button>
    <div class="ov-list">
%s
    </div>
    <span class="ov-sub">Unsere Leistungen</span>
    <div class="ov-services">
%s
    </div>
    <div class="ov-foot">
      <a href="tel:%s" class="btn btn-primary">%s %s</a>
    </div>
  </div>''' % (ic("close"), links, svc, TEL_URI, ic("phone"), TEL)


def marquee_html():
    row = "".join('<span class="mq-item">%s<strong>%s</strong></span>' % (ic_fill("star"), q) for q in MARQUEE)
    return '''  <div class="marquee" aria-label="Auszüge aus Google-Bewertungen">
    <div class="marquee-row">%s%s</div>
  </div>''' % (row, row)


def topbar_html():
    return '''  <div class="topbar">
    <div class="wrap">
      <a href="tel:%s" aria-label="Anrufen">%s %s</a>
      <div class="tb-right">
        <span>%s · %s</span>
        <span class="tb-badge">%s Kfz-Meisterbetrieb</span>
      </div>
    </div>
  </div>''' % (TEL_URI, ic("phone"), TEL, STRASSE, PLZ_ORT, ic("badge"))


def footer_html():
    svc = "\n".join('            <li><a href="%s.html">%s</a></li>' % (s, t) for s, t, _, _ in SERVICES)
    hrs = "\n".join('            <li>%s</li>' % h for h in HOURS_SHORT)
    return '''  <footer class="footer">
    <div class="wrap">
      <div class="footer-top">
        <div>
          <a href="index.html" class="brand" aria-label="%s – Startseite">
            %s
            <span class="brand-text">
              <span class="brand-name">KFZ <span>MÖCKL</span></span>
              <span class="brand-sub">Meisterbetrieb · Augsburg</span>
            </span>
          </a>
          <p>Ihre Kfz-Werkstatt in Augsburg-Kriegshaber. Wir reparieren, was nötig ist – und sagen Ihnen
             vorher, was es kostet.</p>
        </div>
        <div>
          <h4>Leistungen</h4>
          <ul>
%s
            <li><a href="gebrauchtwagen.html">Gebrauchtwagen</a></li>
          </ul>
        </div>
        <div>
          <h4>Öffnungszeiten</h4>
          <ul>
%s
          </ul>
        </div>
        <div>
          <h4>Kontakt</h4>
          <ul class="fcontact">
            <li>%s<span>%s<br>%s</span></li>
            <li>%s<a href="tel:%s">%s</a></li>
            <li>%s<a href="mailto:%s">%s</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© <span id="year">2026</span> %s · Alle Rechte vorbehalten</span>
        <div class="legal">
          <a href="ueber-uns.html">Über uns</a>
          <a href="impressum.html">Impressum</a>
          <a href="datenschutz.html">Datenschutz</a>
          <a href="#" data-cookie-open>Cookies</a>
        </div>
      </div>
    </div>
  </footer>

  <div class="cookie" id="cookie-banner" role="dialog" aria-label="Cookie-Hinweis">
    <div class="cookie-inner">
      <div class="cookie-text">
        <strong>Hinweis zu Cookies</strong>
        <p>Diese Website nutzt keine Tracking- oder Werbe-Cookies. Wir speichern lediglich Ihre Auswahl
           hier lokal in Ihrem Browser. Mehr dazu in der <a href="datenschutz.html">Datenschutzerklärung</a>.</p>
      </div>
      <div class="cookie-actions">
        <button class="btn btn-outline" data-cookie="essential" type="button">Nur notwendige</button>
        <button class="btn btn-primary" data-cookie="all" type="button">Verstanden</button>
      </div>
    </div>
  </div>''' % (FIRMA, CREST, svc, hrs,
               ic("pin"), STRASSE, PLZ_ORT,
               ic("phone"), TEL_URI, TEL,
               ic("mail"), MAIL, MAIL, FIRMA)


def cta_band(title, text, eyebrow="Termin vereinbaren"):
    return '''  <section class="cta-band section">
    <div class="wrap reveal">
      <span class="eyebrow">%s</span>
      <h2>%s</h2>
      <p>%s</p>
      <div class="cta-actions">
        <a href="tel:%s" class="btn btn-primary">%s %s</a>
        <a href="kontakt.html" class="btn btn-ghost-light">Termin online anfragen %s</a>
      </div>
    </div>
  </section>''' % (eyebrow, title, text, TEL_URI, ic("phone"), TEL, ic("arrow"))


def page_hero(eyebrow, h1, p, crumb, icon):
    return '''    <section class="pagehero">
      <div class="ph-grid" aria-hidden="true"></div>
      %s
      <div class="wrap">
        <span class="eyebrow">%s</span>
        <h1>%s</h1>
        <p>%s</p>
        <nav class="crumbs" aria-label="Brotkrumen-Navigation">
          <a href="index.html">Start</a><span>/</span>%s
        </nav>
      </div>
    </section>''' % (ic(icon, "ph-icon"), eyebrow, h1, p, crumb)


def service_cards(slugs, dark=False):
    out = []
    for s in slugs:
        slug, title, icon, text = SERVICE_BY_SLUG[s]
        out.append('''        <a class="card reveal" href="%s.html">
          <div class="ic">%s</div>
          <h3>%s</h3>
          <p>%s</p>
          <span class="more">Mehr erfahren %s</span>
        </a>''' % (slug, ic(icon), title, text, ic("arrow")))
    return "\n".join(out)


def review_card(r):
    name, av, meta, when, n, text = r
    return '''        <figure class="tcard reveal">
          %s
          <blockquote>%s</blockquote>
          <footer>
            <span class="av" aria-hidden="true">%s</span>
            <span><strong>%s</strong>%s · %s</span>
          </footer>
        </figure>''' % (stars(n), text, av, name, meta, when)


def faq(items):
    body = "\n".join('''        <details%s>
          <summary>%s</summary>
          <div class="fa-body">%s</div>
        </details>''' % (" open" if i == 0 else "", q, a) for i, (q, a) in enumerate(items))
    return '<div class="faq">\n%s\n      </div>' % body


def checks(items, cls="checks"):
    return '<ul class="%s">\n%s\n        </ul>' % (
        cls, "\n".join('          <li>%s<span>%s</span></li>' % (ic("check"), t) for t in items))


# ── Grundgerüst ──────────────────────────────────────────────────────────────
SHELL = '''<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{{TITLE}}</title>
  <meta name="description" content="{{DESC}}" />
  <meta name="theme-color" content="#061729" />
  <meta name="robots" content="index, follow" />
  <meta property="og:title" content="{{TITLE}}" />
  <meta property="og:description" content="{{DESC}}" />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="de_DE" />
  <link rel="icon" href="{{FAVICON}}" />
  <link rel="stylesheet" href="styles.css" />
  <script>document.documentElement.classList.add('js');</script>
</head>
<body>
{{PRELOADER}}
{{OVERLAY}}

  <div class="scroll-progress" id="scroll-progress" aria-hidden="true"></div>

{{TOPBAR}}

  <header class="nav">
    <div class="wrap">
      <a href="index.html" class="brand" aria-label="{{FIRMA}} – Startseite">
        {{CREST}}
        <span class="brand-text">
          <span class="brand-name">KFZ <span>MÖCKL</span></span>
          <span class="brand-sub">Meisterbetrieb · Augsburg</span>
        </span>
      </a>
{{NAV}}
      <div class="nav-cta">
        <a href="kontakt.html" class="btn btn-primary">Termin anfragen</a>
        <button class="nav-toggle" type="button" aria-label="Menü öffnen" aria-expanded="false" aria-controls="nav-overlay">
          {{IC_MENU}}
          {{IC_CLOSE}}
        </button>
      </div>
    </div>
  </header>

  <main>
{{BODY}}
  </main>

{{FOOTER}}

  <script src="app.js"></script>
</body>
</html>
'''

PRELOADER = '''  <div id="preloader" aria-hidden="true">
    <p class="pl-mark">KFZ <span>MÖCKL</span></p>
    <span class="pl-sub">Meisterbetrieb Augsburg</span>
    <div class="pl-track"><div class="pl-fill"></div></div>
  </div>'''


def render(filename, title, desc, body, active, service_active=None, preloader=False):
    html = (SHELL
            .replace("{{TITLE}}", title)
            .replace("{{DESC}}", desc)
            .replace("{{FAVICON}}", FAVICON)
            .replace("{{PRELOADER}}", PRELOADER if preloader else "")
            .replace("{{OVERLAY}}", overlay_html(active, service_active))
            .replace("{{TOPBAR}}", topbar_html())
            .replace("{{NAV}}", nav_html(active, service_active))
            .replace("{{CREST}}", CREST)
            .replace("{{FIRMA}}", FIRMA)
            .replace("{{IC_MENU}}", ic("menu", "ic-open"))
            .replace("{{IC_CLOSE}}", ic("close", "ic-close"))
            .replace("{{BODY}}", body)
            .replace("{{FOOTER}}", footer_html()))
    with open(os.path.join(HERE, filename), "w", encoding="utf-8") as f:
        f.write(html)
    return filename


# ═════════════════════════════════════════════════════════════════════════════
# STARTSEITE
# ═════════════════════════════════════════════════════════════════════════════
INDEX_BODY = '''    <section class="hero">
      <div class="hero-bg" data-parallax="0.2" aria-hidden="true"></div>
      <div class="hero-grid" aria-hidden="true"></div>
      <div class="hero-sweep" aria-hidden="true"></div>
      ''' + CAR_SVG + '''
      <div class="wrap">
        <div class="hero-inner">
          <span class="eyebrow">Kfz-Meisterbetrieb · Augsburg-Kriegshaber</span>
          <h1>Wir reparieren nur,<br><em>was wirklich nötig ist.</em></h1>
          <p class="lede">Kfz-Möckl ist die Werkstatt, in die man wiederkommt: klare Ansagen, klare
            Preise, keine Reparatur ohne Ihre Zustimmung. HU, Inspektion, Bremsen, Reifen und
            Reparaturen an allen Marken – mitten in Augsburg.</p>
          <div class="hero-actions">
            <a href="kontakt.html" class="btn btn-primary">Termin anfragen ''' + ic("arrow") + '''</a>
            <a href="tel:''' + TEL_URI + '''" class="btn btn-ghost-light">''' + ic("phone") + TEL + '''</a>
          </div>
          <div class="hero-meta">
            <div class="mi">''' + ic("badge") + '''<span><strong>Kfz-Meisterbetrieb</strong>Alle Marken, freie Werkstatt</span></div>
            <div class="mi">''' + ic("clock") + '''<span><strong>Termin oft am selben Tag</strong>Kurze Wege, kurze Wartezeit</span></div>
            <div class="mi">''' + ic("pin") + '''<span><strong>''' + STRASSE + '''</strong>''' + PLZ_ORT + '''</span></div>
          </div>
        </div>
      </div>
      <div class="scroll-ind" aria-hidden="true"><span>Entdecken</span>''' + ic("chevron") + '''</div>
    </section>

''' + marquee_html() + '''

    <!-- ===== Willkommen ===== -->
    <section class="section">
      <div class="wrap split">
        <div class="split-media reveal-l">
          <div class="panel">
            <div class="pgrid" aria-hidden="true"></div>
            <svg class="art" viewBox="0 0 240 200" fill="none" stroke="currentColor" stroke-width="2.4"
                 stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M28 132v-22c0-9 6-14 17-17l50-13c13-21 32-36 60-39l60-1" stroke="rgba(148,196,240,.85)"/>
              <path d="M95 80c12-18 28-31 52-33l40-1v34Z" stroke="rgba(255,214,95,.75)"/>
              <circle cx="76" cy="132" r="27" stroke="rgba(148,196,240,.7)"/>
              <circle cx="76" cy="132" r="13" stroke="rgba(148,196,240,.5)"/>
              <path d="M14 168h212" stroke="rgba(148,196,240,.3)" stroke-dasharray="4 10"/>
            </svg>
            <span class="ptag">Freie Werkstatt · alle Marken</span>
          </div>
        </div>
        <div class="split-body reveal-r">
          <span class="eyebrow">Willkommen bei Kfz-Möckl</span>
          <h2>Die Werkstatt, die auch mal „das muss nicht sein“ sagt</h2>
          <p class="lede">Die meisten Werkstätten rechnen ab, was auf der Liste steht. Wir schauen erst
            nachs Auto – und sagen Ihnen ehrlich, was wirklich gemacht werden muss.</p>
          <p>Unsere Kunden schreiben genau das seit Jahren in ihren Bewertungen: „Es wird nur repariert,
            was wirklich gemacht werden muss.“ „Keine Reparaturen ohne Zustimmung.“ „Danke für die
            Ehrlichkeit.“ Das ist kein Werbeversprechen, sondern einfach die Art, wie wir arbeiten.</p>
          <p>Als Kfz-Meisterbetrieb in Augsburg-Kriegshaber betreuen wir alle Marken – von der
            Hauptuntersuchung über Inspektion und Bremsen bis zur größeren Reparatur. Und wenn es schnell
            gehen muss, bekommen Sie den Termin oft noch am selben Tag.</p>
          <a href="ueber-uns.html" class="btn btn-outline">Mehr über uns ''' + ic("arrow") + '''</a>
        </div>
      </div>
    </section>

    <!-- ===== Leistungen ===== -->
    <section class="section section--alt">
      <div class="wrap">
        <div class="section-head center reveal">
          <span class="eyebrow">Unsere Leistungen</span>
          <h2>Alles rund ums Auto – unter einem Dach</h2>
          <p>Von der Hauptuntersuchung bis zur Motorreparatur. Alles in einer Werkstatt, mit einem
            Ansprechpartner und einem Kostenvoranschlag, auf den Sie sich verlassen können.</p>
        </div>
        <div class="grid grid-3">
''' + service_cards([s[0] for s in SERVICES]) + '''
        </div>
        <div style="text-align:center;margin-top:2.6rem" class="reveal">
          <a href="leistungen.html" class="btn btn-blue">Alle Leistungen im Detail ''' + ic("arrow") + '''</a>
        </div>
      </div>
    </section>

    <!-- ===== Zahlen ===== -->
    <section class="section section--dark section--tight">
      <div class="wrap">
        <div class="stats">
          <div class="stat reveal">
            <div class="n"><span data-to="19">19</span></div>
            <div class="lbl">Kundenstimmen</div>
          </div>
          <div class="stat reveal d1">
            <div class="n">18/19</div>
            <div class="lbl">mit 5 Sternen</div>
          </div>
          <div class="stat reveal d2">
            <div class="n">1 Tag</div>
            <div class="lbl">häufige Durchlaufzeit</div>
          </div>
          <div class="stat reveal d3">
            <div class="n">Meister</div>
            <div class="lbl">Kfz-Meisterbetrieb</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== Ablauf ===== -->
    <section class="section section--alt">
      <div class="wrap">
        <div class="section-head center reveal">
          <span class="eyebrow">So läuft es ab</span>
          <h2>Vier Schritte, keine Überraschungen</h2>
          <p>Sie sollen vorher wissen, was passiert und was es kostet. Deshalb halten wir uns immer an
            denselben Ablauf.</p>
        </div>
        <div class="steps">
          <div class="step reveal">
            <div class="num">1</div>
            <h3>Anrufen oder anfragen</h3>
            <p>Ein Anruf genügt – oft klärt sich am Telefon schon, wie dringend es ist. Termine gibt es
              häufig noch am selben oder nächsten Tag.</p>
          </div>
          <div class="step reveal d1">
            <div class="num">2</div>
            <h3>Fahrzeug ansehen</h3>
            <p>Wir prüfen, was tatsächlich anliegt. Sie bekommen eine klare Ansage: was nötig ist, was
              warten kann und was es kostet.</p>
          </div>
          <div class="step reveal d2">
            <div class="num">3</div>
            <h3>Sie entscheiden</h3>
            <p>Gearbeitet wird erst nach Ihrer Zustimmung. Kommt beim Schrauben etwas Unerwartetes dazu,
              rufen wir vorher an.</p>
          </div>
          <div class="step reveal d3">
            <div class="num">4</div>
            <h3>Abholen &amp; erklärt bekommen</h3>
            <p>Bei der Übergabe erklären wir, was gemacht wurde und worauf Sie künftig achten sollten –
              ohne Fachchinesisch.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== Warum wir ===== -->
    <section class="section">
      <div class="wrap split flip">
        <div class="split-media reveal-r">
          <div class="panel panel--yellow">
            <div class="pgrid" aria-hidden="true"></div>
            <svg class="art" viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="3"
                 stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M100 18l58 22v46c0 38-25 62-58 74-33-12-58-36-58-74V40Z" stroke="rgba(148,196,240,.8)"/>
              <path d="m76 100 18 18 34-38" stroke="#ffc61a" stroke-width="5"/>
            </svg>
            <span class="ptag">Kostenklarheit vorab</span>
          </div>
        </div>
        <div class="split-body reveal-l">
          <span class="eyebrow">Warum Kfz-Möckl</span>
          <h2>Vertrauen entsteht durch das, was wir nicht abrechnen</h2>
          <p class="lede">Eine Werkstatt kann fast alles verkaufen – wer weiß schon, ob die Bremse
            wirklich runter war. Genau deshalb machen wir es anders.</p>
          ''' + checks([
    "<strong>Keine Reparatur ohne Ihre Zustimmung.</strong> Wir rufen an, bevor wir etwas machen, das nicht besprochen war.",
    "<strong>Nur was nötig ist.</strong> Wenn das Öl noch gut ist, sagen wir das – auch wenn die Anzeige im Auto etwas anderes behauptet.",
    "<strong>Preis vorher, nicht nachher.</strong> Sie erfahren die Kosten, bevor der Wagen auf der Hebebühne steht.",
    "<strong>Alle Marken.</strong> Als freie Werkstatt arbeiten wir markenunabhängig – auch Inspektionen im Rahmen der Herstellervorgaben.",
    "<strong>Kurze Wege.</strong> Sie sprechen mit den Leuten, die auch schrauben. Kein Callcenter, keine Warteschleife.",
]) + '''
          <div style="margin-top:1.8rem">
            <a href="bewertungen.html" class="btn btn-outline">Was Kunden schreiben ''' + ic("arrow") + '''</a>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== Bewertungen ===== -->
    <section class="section section--alt">
      <div class="wrap">
        <div class="section-head center reveal">
          <span class="eyebrow">Kundenstimmen</span>
          <h2>Das schreiben unsere Kunden auf Google</h2>
          <p>Unverändert übernommen – inklusive der Formulierungen, die uns am meisten freuen.</p>
        </div>
        <div class="tgrid">
''' + "\n".join(review_card(r) for r in REVIEWS[:6]) + '''
        </div>
        <div style="text-align:center;margin-top:2.4rem" class="reveal">
          <a href="bewertungen.html" class="btn btn-blue">Alle Bewertungen lesen ''' + ic("arrow") + '''</a>
        </div>
      </div>
    </section>

    <!-- ===== Gebrauchtwagen ===== -->
    <section class="section">
      <div class="wrap split">
        <div class="split-media reveal-l">
          <div class="panel">
            <div class="pgrid" aria-hidden="true"></div>
            <svg class="art" viewBox="0 0 220 180" fill="none" stroke="currentColor" stroke-width="2.6"
                 stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="66" cy="118" r="24" stroke="rgba(148,196,240,.8)"/>
              <path d="m84 100 56-56M128 40l18 18M146 30l18 18" stroke="#ffc61a" stroke-width="4"/>
              <path d="M20 158h180" stroke="rgba(148,196,240,.3)" stroke-dasharray="4 10"/>
            </svg>
            <span class="ptag">Fahrzeugverkauf</span>
          </div>
        </div>
        <div class="split-body reveal-r">
          <span class="eyebrow">Gebrauchtwagen</span>
          <h2>Autos, die wir selbst gewartet haben</h2>
          <p class="lede">Wir verkaufen auch Gebrauchtfahrzeuge – überwiegend günstige, solide Autos für
            den Alltag. Geprüft in unserer eigenen Werkstatt.</p>
          <p>Der Vorteil: Das Fahrzeug, das Sie kaufen, war vorher bei uns auf der Hebebühne. Wir wissen,
            was gemacht wurde und was in den nächsten Jahren ansteht – und sagen es Ihnen auch.
            Ein Kunde ist dafür sogar aus Nürnberg angereist.</p>
          <a href="gebrauchtwagen.html" class="btn btn-outline">Zum Fahrzeugverkauf ''' + ic("arrow") + '''</a>
        </div>
      </div>
    </section>

''' + cta_band(
    "Ihr Auto braucht was? Rufen Sie einfach an.",
    "Am schnellsten geht es telefonisch – dann wissen wir gleich, wie dringend es ist und finden einen "
    "passenden Termin. Alternativ schicken Sie uns eine Anfrage.")


# ═════════════════════════════════════════════════════════════════════════════
# LEISTUNGSÜBERSICHT
# ═════════════════════════════════════════════════════════════════════════════
LEISTUNGEN_BODY = page_hero(
    "Leistungen",
    "Werkstattleistungen für alle Marken",
    "Als freier Kfz-Meisterbetrieb übernehmen wir Wartung, Prüfung und Reparatur Ihres Fahrzeugs – "
    "unabhängig von der Marke und immer mit Kostenklarheit vorab.",
    "<span>Leistungen</span>", "cog") + '''

    <section class="section">
      <div class="wrap">
        <div class="section-head reveal">
          <span class="eyebrow">Übersicht</span>
          <h2>Wobei wir Ihnen helfen können</h2>
          <p>Jede Leistung hat eine eigene Seite mit Details, typischen Anzeichen und Antworten auf die
            häufigsten Fragen.</p>
        </div>
        <div class="grid grid-3">
''' + service_cards([s[0] for s in SERVICES]) + '''
          <a class="card reveal" href="gebrauchtwagen.html">
            <div class="ic">''' + ic("key") + '''</div>
            <h3>Gebrauchtwagen</h3>
            <p>Geprüfte Gebrauchtfahrzeuge aus eigener Werkstatt – solide Alltagsautos zu fairen Preisen.</p>
            <span class="more">Mehr erfahren ''' + ic("arrow") + '''</span>
          </a>
        </div>
      </div>
    </section>

    <section class="section section--alt">
      <div class="wrap split">
        <div class="split-body reveal-l">
          <span class="eyebrow">Was immer dazugehört</span>
          <h2>Bei jedem Auftrag, unabhängig von der Leistung</h2>
          ''' + checks([
    "<strong>Fehlerspeicher auslesen</strong>, wenn eine Kontrollleuchte im Spiel ist – bevor wir Teile tauschen.",
    "<strong>Kostenvoranschlag vorab</strong>, damit Sie entscheiden können und nicht wir.",
    "<strong>Rückfrage bei Mehrarbeit.</strong> Findet sich beim Schrauben etwas Zusätzliches, rufen wir an.",
    "<strong>Erklärung bei der Abholung</strong>, was gemacht wurde und was demnächst ansteht.",
    "<strong>Original- oder gleichwertige Ersatzteile</strong> – auf Wunsch auch preisgünstigere Alternativen.",
]) + '''
        </div>
        <div class="split-media reveal-r">
          <div class="checkcard">
            <h3>Sie wissen nicht, was Ihr Auto hat?</h3>
            <p style="color:var(--muted);margin-bottom:1.2rem">Das ist völlig normal – und kein Problem.
              Beschreiben Sie einfach, was Sie merken: ein Geräusch, ein Ruckeln, eine Leuchte im Display.
              Wir finden heraus, woran es liegt.</p>
            ''' + checks([
    "Geräusch beim Bremsen oder Lenken",
    "Kontrollleuchte im Kombiinstrument",
    "Auto zieht zur Seite oder lenkt schwammig",
    "Klappern über Bodenwellen",
    "Fahrzeug springt schlecht an",
    "HU steht an und Sie sind unsicher",
]) + '''
            <div style="margin-top:1.6rem;display:flex;gap:.7rem;flex-wrap:wrap">
              <a href="tel:''' + TEL_URI + '''" class="btn btn-primary">''' + ic("phone") + TEL + '''</a>
              <a href="kontakt.html" class="btn btn-outline">Anfrage senden</a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <div class="section-head reveal">
          <span class="eyebrow">Häufige Fragen</span>
          <h2>Gut zu wissen</h2>
        </div>
        <div class="reveal">
      ''' + faq([
    ("Verliere ich die Herstellergarantie, wenn ich in eine freie Werkstatt gehe?",
     "<p>Nein. Sie dürfen Wartung und Reparaturen in einer freien Werkstatt durchführen lassen, ohne "
     "dass die gesetzliche Gewährleistung entfällt. Wichtig ist, dass die Arbeiten nach Herstellervorgabe "
     "und mit passenden Ersatzteilen erfolgen und im Serviceheft dokumentiert werden – genau so machen wir es.</p>"),
    ("Bekomme ich vorher einen Preis genannt?",
     "<p>Ja, immer. Sie erfahren vor Beginn der Arbeiten, was die Reparatur kostet. Stellt sich beim "
     "Schrauben heraus, dass mehr nötig ist, rufen wir Sie an, bevor wir weitermachen. Nichts wird ohne "
     "Ihre Zustimmung repariert.</p>"),
    ("Wie schnell bekomme ich einen Termin?",
     "<p>Oft noch am selben oder am nächsten Tag – gerade bei kleineren Arbeiten. Kunden berichten "
     "regelmäßig, dass ihr Fahrzeug am Tag der Abgabe fertig war. Bei größeren Reparaturen sprechen wir "
     "die Dauer vorher ab.</p>"),
    ("Betreuen Sie auch ältere Fahrzeuge?",
     "<p>Ja. Wir arbeiten markenunabhängig und reparieren auch Autos, bei denen sich eine "
     "Vertragswerkstatt nicht mehr lohnt. Wenn eine Reparatur wirtschaftlich keinen Sinn mehr ergibt, "
     "sagen wir Ihnen das ehrlich.</p>"),
    ("Kann ich mein Fahrzeug auch ohne Termin vorbeibringen?",
     "<p>Rufen Sie besser kurz vorher an. So können wir einschätzen, ob wir Sie direkt dazwischennehmen "
     "können, und Sie stehen nicht umsonst bei uns auf dem Hof.</p>"),
]) + '''
        </div>
      </div>
    </section>

''' + cta_band("Bereit für einen Termin?",
               "Sagen Sie uns, was Ihr Auto hat – oder was Sie vermuten. Den Rest klären wir gemeinsam.")


# ═════════════════════════════════════════════════════════════════════════════
# SERVICE-UNTERSEITEN
# ═════════════════════════════════════════════════════════════════════════════
def service_page(slug, eyebrow, h1, hero_p, sec_eyebrow, sec_h2, lede, intro_paras,
                 scope_title, scope, signs_title, signs, faq_items, related, panel_tag, note=None):
    """Baut eine Leistungs-Unterseite."""
    _, title, icon, _ = SERVICE_BY_SLUG[slug]
    sign_cards = "\n".join('''          <article class="card reveal%s">
            <div class="ic">%s</div>
            <h3>%s</h3>
            <p>%s</p>
          </article>''' % (" d%d" % (i % 4) if i % 4 else "", ic(si), st, sp)
                           for i, (si, st, sp) in enumerate(signs))

    note_html = ""
    if note:
        note_html = '''
        <div class="note reveal" style="margin-top:2rem">%s<div>%s</div></div>''' % (ic("info"), note)

    return page_hero(eyebrow, h1, hero_p,
                     '<a href="leistungen.html">Leistungen</a><span>/</span><span>%s</span>' % title,
                     icon) + '''

    <section class="section">
      <div class="wrap split">
        <div class="split-body reveal-l">
          <span class="eyebrow">%s</span>
          <h2>%s</h2>
          <p class="lede">%s</p>
          %s
        </div>
        <div class="split-media reveal-r">
          <div class="panel">
            <div class="pgrid" aria-hidden="true"></div>
            %s
            <span class="ptag">%s</span>
          </div>
        </div>
      </div>
    </section>

    <section class="section section--alt">
      <div class="wrap split">
        <div class="split-media reveal-l">
          <div class="checkcard">
            <h3>%s</h3>
            %s
          </div>
        </div>
        <div class="split-body reveal-r">
          <span class="eyebrow">Ablauf</span>
          <h2>Wie wir dabei vorgehen</h2>
          <p>Erst prüfen, dann sprechen, dann schrauben. Sie erfahren vor Beginn, was gemacht werden muss,
            was es kostet und wie lange es dauert. Wenn etwas warten kann, sagen wir das – und wenn etwas
            dringend ist, ebenfalls.</p>
          <p>Gearbeitet wird ausschließlich nach Ihrer Zustimmung. Kommt beim Schrauben etwas dazu, das
            wir vorher nicht sehen konnten, rufen wir Sie an, bevor wir weitermachen.</p>
          <div style="display:flex;gap:.7rem;flex-wrap:wrap;margin-top:1.6rem">
            <a href="tel:%s" class="btn btn-primary">%s%s</a>
            <a href="kontakt.html" class="btn btn-outline">Termin anfragen</a>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <div class="section-head center reveal">
          <span class="eyebrow">Woran Sie es merken</span>
          <h2>%s</h2>
        </div>
        <div class="grid grid-3">
%s
        </div>%s
      </div>
    </section>

    <section class="section section--alt">
      <div class="wrap">
        <div class="section-head reveal">
          <span class="eyebrow">Häufige Fragen</span>
          <h2>%s – gut zu wissen</h2>
        </div>
        <div class="reveal">
      %s
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <div class="section-head center reveal">
          <span class="eyebrow">Passt dazu</span>
          <h2>Weitere Leistungen</h2>
        </div>
        <div class="grid grid-3">
%s
        </div>
      </div>
    </section>

''' % (sec_eyebrow, sec_h2, lede,
       "\n          ".join("<p>%s</p>" % p for p in intro_paras),
       PANEL_ART[slug], panel_tag,
       scope_title, checks(scope),
       TEL_URI, ic("phone"), TEL,
       signs_title, sign_cards, note_html,
       title, faq(faq_items),
       service_cards(related)) + cta_band(
        "%s bei Kfz-Möckl in Augsburg" % title,
        "Rufen Sie an oder schicken Sie eine Anfrage – wir sagen Ihnen, wann es passt und was es kostet.")


# Blueprint-Grafiken für die Leistungsseiten
PANEL_ART = {
    "hu-au": '''<svg class="art" viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="3"
                 stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="46" y="24" width="108" height="152" rx="10" stroke="rgba(148,196,240,.8)"/>
              <path d="M74 24V14h52v10" stroke="rgba(148,196,240,.6)"/>
              <path d="M70 78h60M70 104h60M70 130h34" stroke="rgba(148,196,240,.45)"/>
              <circle cx="146" cy="140" r="30" fill="#04101f" stroke="#ffc61a" stroke-width="4"/>
              <path d="m132 140 10 10 18-20" stroke="#ffc61a" stroke-width="5"/>
            </svg>''',
    "inspektion": '''<svg class="art" viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="3"
                 stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M100 22s46 52 46 84a46 46 0 0 1-92 0c0-32 46-84 46-84Z" stroke="rgba(148,196,240,.8)"/>
              <path d="M100 130a24 24 0 0 1-24-24" stroke="#ffc61a" stroke-width="5"/>
              <path d="M60 176h80" stroke="rgba(148,196,240,.35)" stroke-dasharray="4 10"/>
            </svg>''',
    "bremsen": '''<svg class="art" viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="3"
                 stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="88" cy="100" r="64" stroke="rgba(148,196,240,.8)"/>
              <circle cx="88" cy="100" r="22" stroke="rgba(148,196,240,.55)"/>
              <circle cx="88" cy="100" r="44" stroke="rgba(148,196,240,.3)" stroke-dasharray="3 12"/>
              <path d="M154 72h16a10 10 0 0 1 10 10v36a10 10 0 0 1-10 10h-16" stroke="#ffc61a" stroke-width="5"/>
            </svg>''',
    "reifen": '''<svg class="art" viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="3"
                 stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="100" cy="100" r="70" stroke="rgba(148,196,240,.8)"/>
              <circle cx="100" cy="100" r="28" stroke="rgba(148,196,240,.55)"/>
              <path d="M100 30v20M100 150v20M30 100h20M150 100h20M51 51l14 14M135 135l14 14M149 51l-14 14M65 135l-14 14"
                    stroke="#ffc61a" stroke-width="4"/>
            </svg>''',
    "fahrwerk": '''<svg class="art" viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="3"
                 stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M64 26h72M64 174h72" stroke="rgba(148,196,240,.8)"/>
              <path d="M128 44H72l56 26H72l56 26H72l56 26H72" stroke="#ffc61a" stroke-width="4.5"/>
              <path d="M100 26v18M100 156v18" stroke="rgba(148,196,240,.55)"/>
            </svg>''',
    "reparatur": '''<svg class="art" viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="3"
                 stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="100" cy="100" r="30" stroke="rgba(148,196,240,.8)"/>
              <circle cx="100" cy="100" r="58" stroke="rgba(148,196,240,.3)" stroke-dasharray="6 14"/>
              <path d="M100 20v22M100 158v22M20 100h22M158 100h22M43 43l16 16M141 141l16 16M157 43l-16 16M59 141l-16 16"
                    stroke="#ffc61a" stroke-width="4.5"/>
            </svg>''',
}


HU_BODY = service_page(
    "hu-au", "Hauptuntersuchung", "HU &amp; AU –<br>ohne zweiten Anlauf",
    "Hauptuntersuchung und Abgasuntersuchung erledigen wir bei uns im Haus. Und wir schauen vorher drüber, "
    "damit Sie nicht wegen einer defekten Birne wiederkommen müssen.",
    "Der Vorabcheck", "Damit die Plakette beim ersten Termin drauf ist",
    "Die HU ist der Termin, den niemand mag – vor allem, weil man vorher nicht weiß, was dabei "
    "herauskommt. Bei uns kommt der Prüfer ins Haus, und wir sehen uns Ihr Fahrzeug vorher an.",
    ["Der Vorabcheck ist der eigentliche Punkt: Wir prüfen die typischen Mängelquellen – Beleuchtung, "
     "Bremsen, Reifen, Rost an tragenden Teilen, Auspuffanlage, Achsmanschetten – und sagen Ihnen, was "
     "vor der Prüfung erledigt werden sollte. Dann bekommen Sie die Plakette beim ersten Anlauf.",
     "Wird bei der Prüfung doch etwas gefunden, können wir es meist direkt beheben. Sie müssen nicht "
     "erst in eine andere Werkstatt und danach zur Nachprüfung fahren. Ein Kunde schreibt: „Hab wieder "
     "meinen TÜV gemacht, alles tipptopp. Preislich alles sehr transparent.“"],
    "Was zur HU bei uns gehört",
    ["<strong>Vorabcheck</strong> auf die typischen Mängel, bevor der Prüfer kommt",
     "<strong>Hauptuntersuchung (HU)</strong> nach § 29 StVZO",
     "<strong>Abgasuntersuchung (AU)</strong> als Teil der HU",
     "<strong>Mängelbeseitigung direkt im Haus</strong> – Beleuchtung, Bremsen, Reifen, Auspuff",
     "<strong>Neue Prüfplakette</strong> und Prüfbericht",
     "<strong>Nachprüfung</strong>, falls doch etwas fehlt – ohne Werkstattwechsel"],
    "Wann die HU fällig ist",
    [("calendar", "Plakette abgelaufen",
      "Der Monat steht oben auf der Plakette, das Jahr in der Mitte. Pkw müssen alle 24 Monate zur HU, "
      "Neuwagen erstmals nach 36 Monaten."),
     ("info", "Über den Termin hinaus",
      "Wer zu spät kommt, zahlt ab zwei Monaten Verzug ein Verwarnungsgeld – und der Prüfer nimmt eine "
      "erweiterte Untersuchung vor. Lieber vorher anrufen."),
     ("bolt", "Kontrollleuchte an",
      "Eine dauerhaft leuchtende Motorkontrollleuchte führt zum Mangel bei der AU. Das klären wir am "
      "besten vor dem Prüftermin.")],
    [("Was kostet die HU bei Ihnen?",
      "<p>Die Gebühr für HU und AU gibt die Prüforganisation vor, sie ist bundesweit ähnlich. Was "
      "dazukommt, hängt davon ab, ob etwas beanstandet wird. Rufen Sie an – wir nennen Ihnen die "
      "aktuellen Kosten und sagen Ihnen beim Vorabcheck, ob noch etwas zu erwarten ist.</p>"),
     ("Wie lange dauert der Termin?",
      "<p>Die Prüfung selbst dauert in der Regel unter einer Stunde. Kommt eine Mängelbeseitigung dazu, "
      "sprechen wir die Zeit vorher mit Ihnen ab. Häufig ist das Fahrzeug am selben Tag fertig.</p>"),
     ("Was passiert, wenn mein Auto durchfällt?",
      "<p>Sie bekommen einen Mängelbericht und haben einen Monat Zeit für die Nachprüfung. Da wir die "
      "Mängel bei uns beheben können, sparen Sie sich die Fahrt zu einer zweiten Werkstatt. Bei der "
      "Nachprüfung wird nur noch der beanstandete Punkt geprüft.</p>"),
     ("Brauche ich Unterlagen für den Termin?",
      "<p>Bringen Sie die Zulassungsbescheinigung Teil I (Fahrzeugschein) mit. Falls es Umbauten oder "
      "Sonderteile gibt, auch die zugehörigen Gutachten oder Teilegutachten.</p>")],
    ["inspektion", "bremsen", "reparatur"],
    "HU · AU · Vorabcheck",
    note="<strong>Tipp:</strong> Vereinbaren Sie den Vorabcheck ein bis zwei Wochen vor Ablauf der "
         "Plakette. Dann bleibt Zeit, Kleinigkeiten zu erledigen, ohne dass es eilig wird.")

INSPEKTION_BODY = service_page(
    "inspektion", "Wartung", "Inspektion &amp; Ölwechsel –<br>nur wenn fällig",
    "Wartung nach Herstellervorgabe, mit Eintrag ins Serviceheft. Und ein Ölwechsel dann, wenn das Öl "
    "wirklich durch ist – nicht, weil eine Anzeige im Display etwas behauptet.",
    "Ein Beispiel", "Als eine Kundin für einen Ölwechsel kam, den sie nicht brauchte",
    "Der Ölwechsel ist das beste Beispiel dafür, wie wir arbeiten. Eine Kundin kam, weil die Anzeige im "
    "Auto einen Ölwechsel forderte. Nach der Kontrolle war klar: Das Öl war noch gut. Wir haben es ihr "
    "gesagt, statt einfach abzurechnen.",
    ["„Es gibt Leute, die würden diesbezüglich nichts sagen und schön Geld kassieren“, hat sie danach "
     "geschrieben. Genau das ist der Unterschied. Serviceintervalle sind Richtwerte – ob eine Arbeit "
     "wirklich fällig ist, entscheidet der Zustand des Fahrzeugs, nicht der Kalender.",
     "Die Inspektion selbst führen wir nach den Vorgaben Ihres Herstellers durch und dokumentieren sie "
     "im Serviceheft. Damit bleibt Ihre Wartungshistorie vollständig – wichtig für Gewährleistung und "
     "später für den Wiederverkaufswert."],
    "Umfang der Inspektion",
    ["<strong>Motoröl und Ölfilter</strong> wechseln – mit dem für Ihren Motor freigegebenen Öl",
     "<strong>Luft-, Innenraum- und Kraftstofffilter</strong> prüfen und bei Bedarf tauschen",
     "<strong>Flüssigkeiten kontrollieren:</strong> Kühlmittel, Bremsflüssigkeit, Scheibenwaschanlage",
     "<strong>Bremsanlage und Reifen</strong> auf Verschleiß prüfen",
     "<strong>Beleuchtung, Wischerblätter, Batterie</strong> und Keilrippenriemen kontrollieren",
     "<strong>Fehlerspeicher auslesen</strong> und Serviceanzeige zurücksetzen",
     "<strong>Eintrag ins Serviceheft</strong> nach Herstellervorgabe"],
    "Wann eine Inspektion ansteht",
    [("calendar", "Serviceintervall erreicht",
      "Die meisten Hersteller geben ein Intervall nach Kilometern oder Zeit vor – häufig 15.000 bis "
      "30.000 km oder einmal jährlich, je nach Modell und Ölsorte."),
     ("oil", "Serviceanzeige im Display",
      "Die Anzeige rechnet mit Pauschalwerten. Wir schauen nach, ob die Arbeit tatsächlich fällig ist – "
      "und sagen es Ihnen, wenn nicht."),
     ("info", "Vor längeren Fahrten",
      "Vor Urlaub oder Umzug lohnt ein Durchcheck: Flüssigkeiten, Reifen, Bremsen, Beleuchtung. Das "
      "kostet wenig und erspart Ärger unterwegs.")],
    [("Verliere ich die Herstellergarantie durch eine Inspektion bei Ihnen?",
      "<p>Nein. Entscheidend ist, dass die Wartung nach Herstellervorgabe erfolgt, geeignete Ersatzteile "
      "verwendet und die Arbeiten dokumentiert werden. Genau so führen wir Inspektionen durch – mit "
      "Eintrag ins Serviceheft.</p>"),
     ("Welches Öl verwenden Sie?",
      "<p>Immer eines, das für Ihren Motor freigegeben ist – die Herstellerfreigabe steht in den "
      "Fahrzeugunterlagen und wir prüfen sie. Wir arbeiten unter anderem mit Liqui Moly.</p>"),
     ("Kann ich mein eigenes Öl mitbringen?",
      "<p>Grundsätzlich ja, sprechen Sie uns vorher darauf an. Wichtig ist, dass es die richtige "
      "Spezifikation und Freigabe für Ihren Motor hat – sonst nimmt der Motor auf Dauer Schaden.</p>"),
     ("Wie lange dauert eine Inspektion?",
      "<p>Ein reiner Ölwechsel ist in unter einer Stunde erledigt. Eine große Inspektion mit allen "
      "Filtern und Kontrollpunkten braucht je nach Fahrzeug einen halben Tag. Wir sagen Ihnen bei der "
      "Terminvergabe, womit Sie rechnen müssen.</p>")],
    ["hu-au", "bremsen", "reparatur"],
    "Ölwechsel · Filter · Serviceheft")

BREMSEN_BODY = service_page(
    "bremsen", "Bremsanlage", "Bremsen –<br>das Teil, bei dem nichts warten darf",
    "Beläge, Scheiben, Bremsflüssigkeit, Leitungen, Handbremse: Wir prüfen die komplette Anlage und "
    "tauschen genau die Teile, die verschlissen sind. Nicht mehr.",
    "Messen statt schätzen", "Sie sehen die Restdicke, bevor Sie zahlen",
    "Bremsen sind der einzige Bereich am Auto, bei dem wir nie sagen „das kann noch warten“, wenn es "
    "nicht stimmt. Umgekehrt tauschen wir aber auch keine Scheiben mit, nur weil die Beläge fällig sind.",
    ["Wir messen die Restdicke von Belägen und Scheiben und zeigen Ihnen die Werte. Daraus ergibt sich, "
     "was jetzt nötig ist und was noch eine Inspektion durchhält. Sie bekommen den Preis vorher – "
     "getrennt nach Vorder- und Hinterachse, damit Sie sehen, wofür Sie zahlen.",
     "Häufig unterschätzt wird die Bremsflüssigkeit. Sie zieht Wasser aus der Luft und verliert dadurch "
     "an Siedepunkt – bei starker Belastung kann die Bremse dann weich werden. Deshalb gehört sie alle "
     "zwei Jahre gewechselt, unabhängig von der Laufleistung."],
    "Was wir an der Bremse machen",
    ["<strong>Bremsbeläge</strong> vorne und hinten prüfen und tauschen",
     "<strong>Bremsscheiben</strong> ausmessen und bei Unterschreiten der Mindestdicke ersetzen",
     "<strong>Bremsflüssigkeit</strong> prüfen und wechseln (Empfehlung: alle zwei Jahre)",
     "<strong>Bremsleitungen und -schläuche</strong> auf Korrosion und Risse kontrollieren",
     "<strong>Bremssattel</strong> gangbar machen oder ersetzen, wenn er festsitzt",
     "<strong>Hand- bzw. Feststellbremse</strong> einstellen",
     "<strong>Probefahrt</strong> nach der Reparatur"],
    "Anzeichen für eine fällige Bremse",
    [("bolt", "Quietschen oder Schleifen",
      "Metallisches Schleifen heißt oft: Der Belag ist runter und drückt auf die Scheibe. Dann wird es "
      "teurer, je länger man wartet. Bitte zeitnah vorbeikommen."),
     ("info", "Längerer Bremsweg oder weiches Pedal",
      "Ein Pedal, das sich schwammig anfühlt oder tiefer geht als gewohnt, deutet auf alte "
      "Bremsflüssigkeit oder Luft im System hin."),
     ("brake", "Ziehen oder Rubbeln beim Bremsen",
      "Zieht das Auto beim Bremsen zur Seite oder rubbelt das Lenkrad, sind meist Scheiben verzogen oder "
      "ein Sattel sitzt fest.")],
    [("Wie oft müssen Bremsbeläge gewechselt werden?",
      "<p>Das hängt stark vom Fahrprofil ab – Stadtverkehr verschleißt Beläge deutlich schneller als "
      "Landstraße. Grob liegen Vorderachsbeläge zwischen 30.000 und 70.000 km. Wir messen bei jeder "
      "Inspektion nach, damit Sie es früh wissen.</p>"),
     ("Müssen Scheiben immer mit den Belägen getauscht werden?",
      "<p>Nein. Entscheidend ist die gemessene Restdicke der Scheibe im Verhältnis zur "
      "Mindestdicke des Herstellers. Ist noch genug Material da und die Scheibe läuft rund, bleibt sie "
      "drin. Wir zeigen Ihnen die Messwerte.</p>"),
     ("Warum muss die Bremsflüssigkeit gewechselt werden?",
      "<p>Bremsflüssigkeit ist hygroskopisch, sie nimmt Wasser aus der Luft auf. Mit steigendem "
      "Wasseranteil sinkt der Siedepunkt – bei starker Bremsbelastung kann sich Dampf bilden und die "
      "Bremswirkung nachlassen. Deshalb der Wechsel alle zwei Jahre.</p>"),
     ("Kann ich mit quietschender Bremse noch fahren?",
      "<p>Kurzzeitig und vorsichtig meistens ja – aber nicht abwarten. Wenn es metallisch schleift, ist "
      "der Belag durch und beschädigt die Scheibe. Rufen Sie an, wir schauen zeitnah drauf.</p>")],
    ["hu-au", "reifen", "fahrwerk"],
    "Beläge · Scheiben · Flüssigkeit")

REIFEN_BODY = service_page(
    "reifen", "Reifenservice", "Reifen &amp; Räder –<br>Wechsel, Neureifen, Einlagerung",
    "Umstecken, auswuchten, neue Reifen montieren, Reparatur bei Einfahrschäden und Einlagerung für die "
    "Zwischensaison – alles in einem Termin.",
    "Vier Kontaktflächen", "Der einzige Teil Ihres Autos, der die Straße berührt",
    "Reifen sind die einzige Verbindung zwischen Auto und Straße – und trotzdem das Teil, an dem am "
    "meisten gespart wird. Wir sagen Ihnen offen, ob Ihre Reifen noch eine Saison halten oder ob Sie "
    "jetzt investieren sollten.",
    ["Beim Wechsel prüfen wir Profiltiefe, Alter (das steht als DOT-Nummer auf der Flanke), "
     "Reifendruck und ungleichmäßigen Verschleiß. Läuft ein Reifen einseitig ab, liegt es meist nicht am "
     "Reifen, sondern an der Achsgeometrie – dann lohnt der Blick aufs Fahrwerk, bevor der nächste Satz "
     "genauso schnell verschlissen ist.",
     "Räder mit Reifendrucksensoren (RDKS) sind Standard bei Fahrzeugen ab Baujahr 2014. Wir montieren "
     "sie fachgerecht, programmieren die Sensoren neu und setzen das System zurück."],
    "Unser Reifenservice",
    ["<strong>Räder umstecken</strong> zwischen Sommer und Winter, inklusive Drehmomentkontrolle",
     "<strong>Reifen auf Felge montieren</strong> und auswuchten",
     "<strong>Neureifen</strong> in gängigen Größen – auf Wunsch Marken- oder Preis-Leistungs-Reifen",
     "<strong>Reifenreparatur</strong> bei Nagel- oder Schraubeneinfahrschäden, wenn der Schaden "
     "reparabel ist",
     "<strong>RDKS-Sensoren</strong> montieren, anlernen und zurücksetzen",
     "<strong>Reifeneinlagerung</strong> für den Satz, der gerade nicht am Auto ist",
     "<strong>Profil- und Alterskontrolle</strong> mit klarer Empfehlung"],
    "Wann Reifen dran sind",
    [("tire", "Profil unter 3 mm",
      "Gesetzlich sind 1,6 mm Mindestprofil vorgeschrieben. Praktisch lässt die Haftung auf nasser "
      "Straße schon ab etwa 3 mm deutlich nach – bei Winterreifen ab 4 mm."),
     ("calendar", "Reifen älter als 6 bis 8 Jahre",
      "Gummi härtet aus, auch wenn genug Profil da ist. Das Herstellungsdatum steht als vierstellige "
      "DOT-Nummer auf der Reifenflanke – wir lesen es beim Termin mit ab."),
     ("info", "Einseitiger Verschleiß",
      "Läuft ein Reifen innen oder außen stärker ab, stimmt meist die Spur nicht. Dann sollte vor dem "
      "neuen Satz die Achsgeometrie geprüft werden.")],
    [("Wann soll ich auf Winterreifen wechseln?",
      "<p>Als Faustregel gilt „von O bis O“ – von Oktober bis Ostern. Rechtlich zählt in Deutschland die "
      "situative Winterreifenpflicht: Bei Schnee, Eis und Glätte müssen Reifen mit "
      "Alpine-Symbol montiert sein. Vereinbaren Sie den Termin am besten im Herbst früh, dann bleibt "
      "die Wartezeit kurz.</p>"),
     ("Lagern Sie meine Reifen ein?",
      "<p>Ja, wir lagern den Satz ein, der gerade nicht am Auto ist – trocken und vor Licht geschützt. "
      "Sie müssen die Räder dann nicht im Keller stapeln und beim nächsten Wechsel nicht transportieren. "
      "Sprechen Sie uns bei der Terminvergabe darauf an.</p>"),
     ("Kann ein Reifen mit Nagel repariert werden?",
      "<p>Oft ja, wenn der Einstich in der Lauffläche liegt und nicht zu groß ist. Schäden an der "
      "Seitenwand oder im Schulterbereich lassen sich nicht sicher reparieren – dann muss der Reifen "
      "ersetzt werden. Wir schauen es uns an und sagen Ihnen, was geht.</p>"),
     ("Muss ich nach dem Radwechsel nachziehen lassen?",
      "<p>Wir ziehen die Räder mit dem vom Hersteller vorgegebenen Drehmoment an. Eine Kontrolle nach "
      "etwa 50 bis 100 km ist trotzdem sinnvoll – kommen Sie einfach kurz vorbei, das machen wir "
      "zwischendurch.</p>")],
    ["fahrwerk", "bremsen", "hu-au"],
    "Wechsel · Auswuchten · RDKS")

FAHRWERK_BODY = service_page(
    "fahrwerk", "Fahrwerk", "Fahrwerk &amp; Lenkung –<br>gegen Poltern und Ziehen",
    "Stoßdämpfer, Federn, Querlenker, Spurstangen, Koppelstangen, Radlager: Wir finden heraus, woher das "
    "Geräusch kommt, statt auf Verdacht zu tauschen.",
    "Erst suchen", "Ein Bauteil tauschen ist billiger als vier",
    "Fahrwerksgeräusche sind der Klassiker beim Rätselraten. Es poltert über Bodenwellen, es knackt beim "
    "Einlenken, das Auto zieht nach rechts – und die Ursache kann an einem halben Dutzend Stellen "
    "liegen. Genau deshalb prüfen wir erst systematisch.",
    ["Auf der Hebebühne lässt sich Spiel in Traggelenken, Spurstangenköpfen, Koppelstangen und "
     "Radlagern gezielt feststellen. Erst wenn klar ist, welches Teil das Geräusch macht, wird "
     "getauscht. Das ist der Unterschied zwischen einer Rechnung über ein Bauteil und einer über vier.",
     "Fahrwerksteile stehen ausdrücklich auf unserer Leistungsliste: Reparaturen an Lenkungs- und "
     "Fahrwerksteilen gehören zum Alltag in unserer Werkstatt. Nach der Reparatur gehört immer eine "
     "Probefahrt dazu – ein Geräusch ist erst weg, wenn man es auch auf der Straße nicht mehr hört."],
    "Was wir am Fahrwerk machen",
    ["<strong>Stoßdämpfer und Federn</strong> prüfen und ersetzen",
     "<strong>Querlenker, Traggelenke und Gummilager</strong> auf Spiel und Risse kontrollieren",
     "<strong>Spurstangen und Spurstangenköpfe</strong> tauschen",
     "<strong>Koppelstangen und Stabilisatoren</strong> erneuern – häufige Ursache für Poltern",
     "<strong>Radlager</strong> prüfen und wechseln",
     "<strong>Lenkgetriebe und Servolenkung</strong> auf Undichtigkeit prüfen",
     "<strong>Achsmanschetten</strong> kontrollieren – ein HU-Mangel, der oft übersehen wird"],
    "Typische Anzeichen",
    [("bolt", "Poltern über Bodenwellen",
      "Ein dumpfes Klopfen bei Kopfsteinpflaster oder Schwellen deutet meist auf Koppelstangen, "
      "Querlenkerlager oder ausgeschlagene Gummilager hin."),
     ("spring", "Auto zieht zur Seite",
      "Zieht das Fahrzeug bei gerader Lenkung nach links oder rechts, stimmt oft die Spureinstellung "
      "nicht – manchmal steckt aber auch ein festsitzender Bremssattel dahinter."),
     ("info", "Schwammiges Lenkgefühl",
      "Ungenaue Lenkung, Spiel im Lenkrad oder Nachlaufen nach Kurven weisen auf verschlissene "
      "Spurstangenköpfe oder ein ausgeschlagenes Lenkgetriebe hin.")],
    [("Kann ich mit poltertem Fahrwerk noch fahren?",
      "<p>Kurzfristig meist ja, aber es wird nicht besser. Ausgeschlagene Fahrwerksteile verändern die "
      "Achsgeometrie, verschleißen Reifen schneller und verlängern im Ernstfall den Bremsweg. Außerdem "
      "ist es ein HU-Mangel. Lieber früh prüfen lassen.</p>"),
     ("Müssen Stoßdämpfer immer paarweise getauscht werden?",
      "<p>Ja, achsweise. Ein neuer und ein alter Dämpfer auf derselben Achse dämpfen unterschiedlich – "
      "das Fahrzeug verhält sich dann beim Bremsen und in Kurven unruhig. Deshalb tauschen wir immer "
      "beide Seiten einer Achse.</p>"),
     ("Brauche ich nach einer Fahrwerksreparatur eine Spureinstellung?",
      "<p>Wenn Teile getauscht wurden, die die Achsgeometrie beeinflussen – Spurstangen, Querlenker, "
      "Traggelenke – dann ja. Ohne Nachvermessung läuft der neue Reifensatz schnell einseitig ab. Wir "
      "sprechen das vorher mit Ihnen ab.</p>"),
     ("Woher weiß ich, ob es das Radlager ist?",
      "<p>Ein defektes Radlager macht ein gleichmäßiges Brummen oder Mahlen, das mit der Geschwindigkeit "
      "lauter wird und sich in Kurven verändert. Auf der Hebebühne lässt sich das eindeutig feststellen "
      "– oft in wenigen Minuten.</p>")],
    ["bremsen", "reifen", "reparatur"],
    "Dämpfer · Lenkung · Radlager")

REPARATUR_BODY = service_page(
    "reparatur", "Reparatur", "Reparatur &amp; Diagnose –<br>erst suchen, dann tauschen",
    "Von der Fehlerspeicher-Auslese über Kupplung, Sensorik und Elektrik bis zum Marderschaden: "
    "Reparaturen an allen Marken, mit Kostenvoranschlag vorab.",
    "Diagnose zuerst", "Der Fehlercode ist der Anfang, nicht das Ergebnis",
    "Wenn eine Kontrollleuchte brennt, ist die teure Variante, einfach Teile zu tauschen, bis sie ausgeht. "
    "Wir lesen erst den Fehlerspeicher aus und prüfen, ob der gemeldete Fehler die Ursache ist oder "
    "nur die Folge von etwas anderem.",
    ["Die Beispiele aus unserer Werkstatt sind typisch: ein Marderschaden an den Zündkerzenkabeln, "
     "innerhalb eines Tages behoben. Ein Sensor, der wegen der anstehenden HU sowieso fällig war – "
     "eingebaut nach Rücksprache mit der Kundin. Eine Kupplung, in drei Tagen getauscht, zum "
     "vereinbarten Preis.",
     "Was alle Fälle verbindet: Sie haben vorher gewusst, was gemacht wird und was es kostet. Für uns "
     "ist das keine Extraleistung, sondern die Voraussetzung dafür, dass Kunden wiederkommen."],
    "Was wir reparieren",
    ["<strong>Diagnose:</strong> Fehlerspeicher auslesen, Messwerte prüfen, Ursache eingrenzen",
     "<strong>Kupplung und Getriebe:</strong> Kupplungssatz, Ausrücklager, Undichtigkeiten",
     "<strong>Motor:</strong> Zündkerzen, Zündspulen, Riemen, Wasserpumpe, Thermostat, Undichtigkeiten",
     "<strong>Sensorik und Elektrik:</strong> Lambdasonde, ABS- und Drehzahlsensoren, Beleuchtung, Batterie",
     "<strong>Marder- und Nagetierschäden</strong> an Kabeln, Schläuchen und Dämmmatten",
     "<strong>Abgasanlage:</strong> Undichtigkeiten, Halter, Endschalldämpfer",
     "<strong>Klein- und Verschleißreparaturen</strong>, die bei der HU oder Inspektion auffallen"],
    "Wann Sie zu uns kommen sollten",
    [("bolt", "Kontrollleuchte leuchtet",
      "Motorkontrollleuchte, ABS oder Airbag: Ein ausgelesener Fehlercode sagt, in welchem System das "
      "Problem liegt. Das ist der Anfang der Suche, nicht schon die Diagnose."),
     ("info", "Ungewohnte Geräusche oder Gerüche",
      "Pfeifen, Mahlen, Klackern beim Anfahren oder ein süßlicher Geruch nach Kühlmittel: Solche "
      "Symptome lohnt es sich früh anzuschauen, bevor Folgeschäden entstehen."),
     ("cog", "Auto ruckelt oder springt schlecht an",
      "Startprobleme, unruhiger Motorlauf oder Leistungsverlust haben viele mögliche Ursachen – von der "
      "Batterie über Zündkerzen bis zur Kraftstoffversorgung.")],
    [("Was kostet eine Diagnose?",
      "<p>Das Auslesen des Fehlerspeichers ist schnell erledigt. Aufwendiger ist die eigentliche "
      "Fehlersuche, wenn der Code nicht eindeutig ist. Wir sagen Ihnen vorher, mit welchem Zeitaufwand "
      "wir rechnen, und melden uns, bevor es darüber hinausgeht.</p>"),
     ("Reparieren Sie auch ältere Autos?",
      "<p>Ja, ausdrücklich. Wir arbeiten markenunabhängig und auch an Fahrzeugen, für die sich eine "
      "Vertragswerkstatt nicht mehr interessiert. Wenn eine Reparatur wirtschaftlich keinen Sinn mehr "
      "hat, sagen wir Ihnen das offen – auch wenn wir dann keinen Auftrag haben.</p>"),
     ("Übernehmen Sie Marderschäden über die Versicherung?",
      "<p>Marderschäden sind in vielen Teilkaskoverträgen abgedeckt, teils mit Begrenzung auf Folgeschäden. "
      "Wir dokumentieren den Schaden und stellen die Rechnung so aus, dass Sie sie bei Ihrer Versicherung "
      "einreichen können. Klären Sie den Deckungsumfang am besten vorab mit Ihrem Versicherer.</p>"),
     ("Bekomme ich einen Kostenvoranschlag?",
      "<p>Ja. Bei größeren Reparaturen nennen wir Ihnen die Kosten vor Beginn der Arbeiten. Kommt "
      "während der Reparatur etwas dazu, das vorher nicht sichtbar war, rufen wir an, bevor wir "
      "weitermachen. Ohne Ihre Zustimmung wird nichts repariert.</p>")],
    ["inspektion", "fahrwerk", "hu-au"],
    "Diagnose · Kupplung · Elektrik")


# ═════════════════════════════════════════════════════════════════════════════
# GEBRAUCHTWAGEN
# ═════════════════════════════════════════════════════════════════════════════
GEBRAUCHT_BODY = page_hero(
    "Fahrzeugverkauf",
    "Gebrauchtwagen aus eigener Werkstatt",
    "Wir verkaufen überwiegend günstige, solide Alltagsautos – geprüft und gewartet von den Leuten, die "
    "sie auch verkaufen. Sie erfahren vorher, was gemacht wurde und was ansteht.",
    "<span>Gebrauchtwagen</span>", "key") + '''

    <section class="section">
      <div class="wrap split">
        <div class="split-body reveal-l">
          <span class="eyebrow">Der Unterschied</span>
          <h2>Ein Auto vom Schrauber, nicht vom Verkäufer</h2>
          <p class="lede">Beim Gebrauchtwagenkauf ist die entscheidende Frage nicht, wie das Auto aussieht,
            sondern was in den nächsten zwei Jahren auf Sie zukommt. Diese Frage können wir beantworten –
            weil unsere Fahrzeuge bei uns auf der Hebebühne waren.</p>
          <p>Wir sagen Ihnen, welche Arbeiten am Fahrzeug schon gemacht wurden, welche Verschleißteile
            noch Reserve haben und wo demnächst etwas fällig wird. Das ist unbequemer als „läuft
            einwandfrei“, aber Sie wissen danach, worauf Sie sich einlassen.</p>
          <p>Dass sich das lohnt, hat ein Kunde bestätigt, der für den Kauf aus Nürnberg nach Augsburg
            gefahren ist: „Ich habe bei Stefan Möckl ein kleines, sehr preiswertes Auto gekauft und ich
            muss sagen, dass es voll und ganz die Zeit wert war.“</p>
        </div>
        <div class="split-media reveal-r">
          <div class="panel panel--yellow">
            <div class="pgrid" aria-hidden="true"></div>
            <svg class="art" viewBox="0 0 220 190" fill="none" stroke="currentColor" stroke-width="2.8"
                 stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="62" cy="124" r="26" stroke="rgba(148,196,240,.8)"/>
              <circle cx="62" cy="124" r="10" stroke="rgba(148,196,240,.5)"/>
              <path d="m82 106 58-58M128 42l20 20M148 30l20 20" stroke="#ffc61a" stroke-width="4.5"/>
              <path d="M16 166h188" stroke="rgba(148,196,240,.3)" stroke-dasharray="4 10"/>
            </svg>
            <span class="ptag">Geprüft im eigenen Haus</span>
          </div>
        </div>
      </div>
    </section>

    <section class="section section--alt">
      <div class="wrap">
        <div class="section-head center reveal">
          <span class="eyebrow">Was Sie bekommen</span>
          <h2>Jedes Fahrzeug, das bei uns steht</h2>
        </div>
        <div class="grid grid-3">
          <article class="card reveal">
            <div class="ic">''' + ic("wrench") + '''</div>
            <h3>In der eigenen Werkstatt geprüft</h3>
            <p>Bremsen, Reifen, Fahrwerk, Flüssigkeiten, Fehlerspeicher – das komplette Programm, das
              wir auch bei Kundenfahrzeugen fahren.</p>
          </article>
          <article class="card reveal d1">
            <div class="ic">''' + ic("badge") + '''</div>
            <h3>HU-Status offen genannt</h3>
            <p>Sie erfahren, wann die Hauptuntersuchung fällig ist – und ob wir sie vor der Übergabe
              noch machen.</p>
          </article>
          <article class="card reveal d2">
            <div class="ic">''' + ic("info") + '''</div>
            <h3>Ehrliche Zustandsbeschreibung</h3>
            <p>Wir nennen auch die Mängel. Ein günstiges Auto ist selten perfekt – aber Sie sollen
              wissen, was Sie kaufen.</p>
          </article>
          <article class="card reveal">
            <div class="ic">''' + ic("euro") + '''</div>
            <h3>Was demnächst ansteht</h3>
            <p>Zahnriemen, Kupplung, Reifen: Wir schätzen ein, welche Kosten in den nächsten Jahren auf
              Sie zukommen.</p>
          </article>
          <article class="card reveal d1">
            <div class="ic">''' + ic("cog") + '''</div>
            <h3>Werkstatt gleich mit dabei</h3>
            <p>Wir kennen das Fahrzeug. Wenn später etwas ist, müssen Sie es niemandem neu erklären.</p>
          </article>
          <article class="card reveal d2">
            <div class="ic">''' + ic("users") + '''</div>
            <h3>Probefahrt und Zeit für Fragen</h3>
            <p>Schauen Sie sich das Auto in Ruhe an, fahren Sie es und fragen Sie, was Sie wissen
              wollen. Wir verkaufen nichts unter Zeitdruck.</p>
          </article>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <div class="section-head center reveal">
          <span class="eyebrow">So läuft der Kauf</span>
          <h2>Vom Anruf bis zur Zulassung</h2>
        </div>
        <div class="steps">
          <div class="step reveal">
            <div class="num">1</div>
            <h3>Anrufen</h3>
            <p>Sagen Sie uns, was Sie suchen und was es kosten soll. Wir sagen Ihnen, was gerade
              da ist oder in Kürze reinkommt.</p>
          </div>
          <div class="step reveal d1">
            <div class="num">2</div>
            <h3>Ansehen &amp; fahren</h3>
            <p>Vor Ort schauen wir uns das Fahrzeug gemeinsam an – gern auch auf der Hebebühne, damit
              Sie den Unterboden sehen.</p>
          </div>
          <div class="step reveal d2">
            <div class="num">3</div>
            <h3>Offen besprechen</h3>
            <p>Wir gehen durch, was gemacht wurde, was noch kommt und was das kostet. Danach
              entscheiden Sie ohne Druck.</p>
          </div>
          <div class="step reveal d3">
            <div class="num">4</div>
            <h3>Übernehmen</h3>
            <p>Kaufvertrag, Unterlagen, auf Wunsch frische HU. Danach bleiben wir Ihre Werkstatt,
              wenn Sie möchten.</p>
          </div>
        </div>
        <div class="note reveal" style="margin-top:2.6rem;max-width:820px">''' + ic("info") + '''<div>
          <strong>Der Fahrzeugbestand wechselt laufend.</strong> Weil wir keine große Halle voller Autos
          haben, lohnt der direkte Anruf mehr als jede Liste: Sagen Sie uns, was Sie suchen – wir melden
          uns, wenn etwas Passendes da ist.
        </div></div>
      </div>
    </section>

    <section class="section section--dark">
      <div class="wrap split">
        <div class="split-body reveal-l">
          <span class="eyebrow" style="color:var(--yellow)">Auch beim Verkauf</span>
          <h2 style="color:#fff">Sie wollen Ihr Auto abgeben?</h2>
          <p style="color:var(--chalk-dim)">Sprechen Sie uns an, wenn Sie Ihr Fahrzeug verkaufen möchten
            oder sich nicht sicher sind, ob sich eine anstehende Reparatur noch lohnt. Wir schauen uns
            das Auto an und sagen Ihnen ehrlich, was wirtschaftlich sinnvoll ist – reparieren, verkaufen
            oder abgeben.</p>
          <div style="display:flex;gap:.7rem;flex-wrap:wrap;margin-top:1.6rem">
            <a href="tel:''' + TEL_URI + '''" class="btn btn-primary">''' + ic("phone") + TEL + '''</a>
            <a href="kontakt.html" class="btn btn-ghost-light">Anfrage senden</a>
          </div>
        </div>
        <div class="split-media reveal-r">
          <div class="card">
            <div class="ic">''' + ic("euro") + '''</div>
            <h3>Reparieren oder verkaufen?</h3>
            <p>Bei älteren Fahrzeugen ist das oft die eigentliche Frage. Wir rechnen mit Ihnen durch, was
              die Reparatur kostet und was das Auto danach noch wert ist – und sagen auch, wenn sich
              das nicht mehr rechnet.</p>
          </div>
        </div>
      </div>
    </section>

''' + cta_band("Suchen Sie ein Auto?",
               "Rufen Sie an und sagen Sie uns, was Sie brauchen. Wir halten die Augen offen und melden "
               "uns, wenn etwas Passendes bei uns steht.",
               eyebrow="Gebrauchtwagen")


# ═════════════════════════════════════════════════════════════════════════════
# ÜBER UNS
# ═════════════════════════════════════════════════════════════════════════════
UEBER_BODY = page_hero(
    "Über uns",
    "Kfz-Meisterbetrieb in Augsburg-Kriegshaber",
    "Wir sind die Werkstatt mit der blau-gelb bemalten Halle an der Ulmer Straße – und die, bei der "
    "Kunden seit Jahren schreiben, dass nur repariert wird, was wirklich nötig ist.",
    "<span>Über uns</span>", "users") + '''

    <section class="section">
      <div class="wrap split">
        <div class="split-body reveal-l">
          <span class="eyebrow">Wer wir sind</span>
          <h2>Eine freie Werkstatt, die vom Weiterempfehlen lebt</h2>
          <p class="lede">Die Kfz-Möckl GmbH ist ein Kfz-Meisterbetrieb in Augsburg-Kriegshaber. Wir
            warten, prüfen und reparieren Fahrzeuge aller Marken – und verkaufen gelegentlich
            Gebrauchtwagen, die wir selbst geprüft haben.</p>
          <p>Wir machen keine Werbung. Fast alle Kunden kommen, weil jemand sie geschickt hat: eine
            Kollegin, ein Nachbar, jemand aus der Familie. „Kam auf Empfehlung einer Kollegin und das war
            definitiv eine gute Empfehlung“, hat eine Kundin geschrieben. So funktioniert unser Betrieb
            seit Jahren.</p>
          <p>Bei uns arbeiten Vater und Sohn zusammen – wer anruft oder vorbeikommt, spricht mit den
            Leuten, die anschließend auch am Auto stehen. Das macht Absprachen kurz und Missverständnisse
            selten.</p>
        </div>
        <div class="split-media reveal-r">
          <div class="panel">
            <div class="pgrid" aria-hidden="true"></div>
            <svg class="art" viewBox="0 0 240 190" fill="none" stroke="currentColor" stroke-width="2.6"
                 stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M24 148V70l44-26 44 26v78" stroke="rgba(148,196,240,.8)"/>
              <path d="M112 148V88h104v60" stroke="rgba(148,196,240,.65)"/>
              <rect x="46" y="96" width="44" height="52" stroke="#ffc61a" stroke-width="3.5"/>
              <path d="M132 112h28M176 112h24M132 132h28M176 132h24" stroke="rgba(255,214,95,.65)" stroke-width="3"/>
              <path d="M10 160h220" stroke="rgba(148,196,240,.3)" stroke-dasharray="4 10"/>
            </svg>
            <span class="ptag">Ulmer Str. 55 · Kriegshaber</span>
          </div>
        </div>
      </div>
    </section>

    <section class="section section--dark section--tight">
      <div class="wrap">
        <div class="stats">
          <div class="stat reveal">
            <div class="n"><span data-to="19">19</span></div>
            <div class="lbl">Kundenstimmen</div>
          </div>
          <div class="stat reveal d1">
            <div class="n">18/19</div>
            <div class="lbl">mit 5 Sternen</div>
          </div>
          <div class="stat reveal d2">
            <div class="n">Alle</div>
            <div class="lbl">Marken &amp; Baujahre</div>
          </div>
          <div class="stat reveal d3">
            <div class="n">Meister</div>
            <div class="lbl">Kfz-Meisterbetrieb</div>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <div class="section-head center reveal">
          <span class="eyebrow">Woran wir uns halten</span>
          <h2>Fünf Regeln, die wir nicht verhandeln</h2>
          <p>Sie stehen nirgends an der Wand. Aber unsere Kunden beschreiben sie in ihren Bewertungen
            ziemlich genau.</p>
        </div>
        <div class="grid grid-3">
          <article class="card reveal">
            <div class="ic">''' + ic("shield") + '''</div>
            <h3>Nur was nötig ist</h3>
            <p>Wenn das Öl noch gut ist, wechseln wir es nicht. Auch dann nicht, wenn die Anzeige im
              Auto etwas anderes sagt und die Rechnung höher ausfallen würde.</p>
          </article>
          <article class="card reveal d1">
            <div class="ic">''' + ic("check") + '''</div>
            <h3>Keine Reparatur ohne Zustimmung</h3>
            <p>Es wird nichts gemacht, was nicht besprochen ist. Kommt beim Schrauben etwas dazu, rufen
              wir an, bevor wir weiterarbeiten.</p>
          </article>
          <article class="card reveal d2">
            <div class="ic">''' + ic("euro") + '''</div>
            <h3>Preis vorher nennen</h3>
            <p>Sie sollen vor der Reparatur wissen, was sie kostet. „Klare Ansagen, klare
              Preiskalkulation“ – das ist der Satz, den wir am liebsten lesen.</p>
          </article>
          <article class="card reveal">
            <div class="ic">''' + ic("clock") + '''</div>
            <h3>Schnell, wenn es schnell gehen muss</h3>
            <p>Viele Arbeiten erledigen wir am Tag der Abgabe. Wenn es länger dauert, sagen wir es
              vorher – nicht, wenn Sie das Auto abholen wollen.</p>
          </article>
          <article class="card reveal d1">
            <div class="ic">''' + ic("users") + '''</div>
            <h3>Verständlich erklären</h3>
            <p>Sie müssen kein Schrauber sein, um zu verstehen, was an Ihrem Auto gemacht wurde. Wir
              erklären es ohne Fachchinesisch.</p>
          </article>
          <article class="card reveal d2">
            <div class="ic">''' + ic("info") + '''</div>
            <h3>Auch mal abraten</h3>
            <p>Wenn sich eine Reparatur nicht mehr rechnet, sagen wir das – selbst wenn wir damit
              keinen Auftrag bekommen.</p>
          </article>
        </div>
      </div>
    </section>

    <section class="section section--alt">
      <div class="wrap split flip">
        <div class="split-media reveal-r">
          <div class="panel panel--yellow">
            <div class="pgrid" aria-hidden="true"></div>
            <svg class="art" viewBox="0 0 200 180" fill="none" stroke="currentColor" stroke-width="3"
                 stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M100 22 118 60l42 6-30 29 7 41-37-20-37 20 7-41-30-29 42-6Z" stroke="#ffc61a" stroke-width="4"/>
              <path d="M40 156h120" stroke="rgba(148,196,240,.4)" stroke-dasharray="4 10"/>
            </svg>
            <span class="ptag">Weiterempfehlung als Geschäftsmodell</span>
          </div>
        </div>
        <div class="split-body reveal-l">
          <span class="eyebrow">Unsere Werkstatt finden</span>
          <h2>Die blau-gelbe Halle an der Ulmer Straße</h2>
          <p class="lede">Sie können uns kaum verpassen: Unsere Werkstatthalle in Kriegshaber ist über
            die gesamte Fläche blau-gelb bemalt – ein Motiv, das man aus dem Vorbeifahren erkennt.</p>
          <p>Wir liegen an der Ulmer Straße 55, gut erreichbar von der B17 und aus der Innenstadt. Vor
            der Werkstatt ist Platz zum Abstellen, die Straßenbahn hält in der Nähe – praktisch, wenn Sie
            das Auto bei uns lassen und weiter müssen.</p>
          ''' + checks([
    "<strong>Anfahrt:</strong> Ulmer Str. 55, 86156 Augsburg-Kriegshaber",
    "<strong>Parken:</strong> Stellplätze direkt am Betrieb",
    "<strong>Öffentlich:</strong> Straßenbahn- und Bushaltestellen in der Nähe",
    "<strong>Telefonisch:</strong> " + TEL + " – der schnellste Weg zum Termin",
]) + '''
          <div style="margin-top:1.8rem;display:flex;gap:.7rem;flex-wrap:wrap">
            <a href="kontakt.html" class="btn btn-blue">Anfahrt &amp; Kontakt ''' + ic("arrow") + '''</a>
            <a href="''' + MAPS + '''" target="_blank" rel="noopener" class="btn btn-outline">In Google Maps öffnen</a>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <div class="section-head center reveal">
          <span class="eyebrow">Kundenstimmen</span>
          <h2>Warum Kunden wiederkommen</h2>
        </div>
        <div class="tgrid">
''' + "\n".join(review_card(r) for r in [REVIEWS[0], REVIEWS[5], REVIEWS[3], REVIEWS[9], REVIEWS[4], REVIEWS[17]]) + '''
        </div>
        <div style="text-align:center;margin-top:2.4rem" class="reveal">
          <a href="bewertungen.html" class="btn btn-blue">Alle Bewertungen ''' + ic("arrow") + '''</a>
        </div>
      </div>
    </section>

''' + cta_band("Lernen Sie uns kennen",
               "Am besten mit einer kleinen Sache: Ölwechsel, HU-Vorabcheck, Reifenwechsel. Danach "
               "entscheiden Sie, ob wir Ihre Werkstatt werden.",
               eyebrow="Willkommen")


# ═════════════════════════════════════════════════════════════════════════════
# BEWERTUNGEN
# ═════════════════════════════════════════════════════════════════════════════
BEWERTUNGEN_BODY = page_hero(
    "Bewertungen",
    "Was unsere Kunden schreiben",
    "19 Rezensionen von Google, unverändert übernommen. Ein Muster zieht sich durch fast alle: "
    "Ehrlichkeit, faire Preise und keine Reparatur ohne Zustimmung.",
    "<span>Bewertungen</span>", "star") + '''

    <section class="section section--tight">
      <div class="wrap">
        <div class="grid grid-4">
          <div class="checkcard kpi reveal">
            <div class="kpi-stars">''' + ic_fill("star") * 5 + '''</div>
            <div class="kpi-n">18/19</div>
            <div class="kpi-l">Fünf-Sterne-Bewertungen</div>
          </div>
          <div class="checkcard kpi reveal d1">
            <div class="kpi-ic">''' + ic("euro") + '''</div>
            <div class="kpi-n">Preis</div>
            <div class="kpi-l">häufigstes Lob</div>
          </div>
          <div class="checkcard kpi reveal d2">
            <div class="kpi-ic">''' + ic("shield") + '''</div>
            <div class="kpi-n">Ehrlich</div>
            <div class="kpi-l">meistgenannte Eigenschaft</div>
          </div>
          <div class="checkcard kpi reveal d3">
            <div class="kpi-ic">''' + ic("clock") + '''</div>
            <div class="kpi-n">1 Tag</div>
            <div class="kpi-l">oft genannte Durchlaufzeit</div>
          </div>
        </div>
      </div>
    </section>

    <section class="section" style="padding-top:clamp(1.5rem,3vw,2.5rem)">
      <div class="wrap">
        <div class="section-head reveal">
          <span class="eyebrow">Alle Rezensionen</span>
          <h2>Im Original, ohne Auswahl nach Sternen</h2>
          <p>Sortiert nach Aktualität der jeweiligen Rezension. Auch die Vier-Sterne-Bewertung steht mit
            dabei – das gehört dazu.</p>
        </div>
        <div class="tgrid">
''' + "\n".join(review_card(r) for r in REVIEWS) + '''
        </div>
        <div class="note reveal" style="margin-top:2.6rem;max-width:860px">''' + ic("info") + '''<div>
          <strong>Quelle:</strong> Google-Rezensionen zur Kfz-Möckl GmbH, Stand Juli 2026. Die Texte sind
          im Wortlaut übernommen; offensichtliche Tippfehler wurden stillschweigend korrigiert, längere
          Rezensionen sind gekürzt. Die vollständigen Originale finden Sie
          <a href="''' + MAPS + '''" target="_blank" rel="noopener">im Google-Unternehmensprofil</a>.
        </div></div>
      </div>
    </section>

''' + cta_band("Überzeugen Sie sich selbst",
               "Der beste Test ist ein kleiner Auftrag. Rufen Sie an – wir sagen Ihnen ehrlich, was Ihr "
               "Auto braucht.",
               eyebrow="Ihr Termin")


# ═════════════════════════════════════════════════════════════════════════════
# KONTAKT
# ═════════════════════════════════════════════════════════════════════════════
def hours_rows():
    out = []
    for label, val, day, closed in HOURS:
        out.append('              <tr data-day="%s"%s><td>%s</td><td>%s</td></tr>'
                   % (day, ' class="closed"' if closed else "", label, val))
    return "\n".join(out)


KONTAKT_BODY = page_hero(
    "Kontakt",
    "Termin, Anfahrt und Öffnungszeiten",
    "Am schnellsten geht es telefonisch – dann können wir gleich einschätzen, wie dringend es ist. "
    "Alternativ schicken Sie uns Ihre Anfrage über das Formular.",
    "<span>Kontakt</span>", "phone") + '''

    <section class="section">
      <div class="wrap contact-grid">
        <div class="reveal-l">
          <span class="eyebrow">So erreichen Sie uns</span>
          <h2 style="font-size:clamp(1.8rem,4vw,2.5rem);margin:.9rem 0 1.8rem">Kfz-Möckl GmbH</h2>

          <div class="info-list">
            <div class="info-item">
              <div class="ic">''' + ic("phone") + '''</div>
              <div>
                <h4>Telefon</h4>
                <a href="tel:''' + TEL_URI + '''">''' + TEL + '''</a>
                <p style="color:var(--muted);font-size:.94rem">Der direkte Weg zum Termin</p>
              </div>
            </div>
            <div class="info-item">
              <div class="ic">''' + ic("mail") + '''</div>
              <div>
                <h4>E-Mail</h4>
                <a href="mailto:''' + MAIL + '''">''' + MAIL + '''</a>
              </div>
            </div>
            <div class="info-item">
              <div class="ic">''' + ic("pin") + '''</div>
              <div>
                <h4>Adresse</h4>
                <p>''' + STRASSE + '''<br>''' + PLZ_ORT + '''</p>
                <a href="''' + MAPS + '''" target="_blank" rel="noopener"
                   style="font-size:.94rem;color:var(--navy-500);font-weight:600">In Google Maps öffnen ''' + ic("arrow") + '''</a>
              </div>
            </div>
            <div class="info-item">
              <div class="ic">''' + ic("badge") + '''</div>
              <div>
                <h4>Betrieb</h4>
                <p>Kfz-Meisterbetrieb · freie Werkstatt<br>alle Marken und Baujahre</p>
              </div>
            </div>
          </div>

          <h3 style="font-size:1.3rem;margin:2.6rem 0 1rem">Öffnungszeiten</h3>
          <table class="hours-table">
            <tbody>
''' + hours_rows() + '''
            </tbody>
          </table>
          <p style="font-size:.92rem;color:var(--muted);margin-top:.9rem">Der heutige Tag ist
            hervorgehoben. Außerhalb der Zeiten erreichen Sie uns per E-Mail – wir melden uns am
            nächsten Werktag.</p>

          <div class="mapcard" style="margin-top:2rem">
            <div class="mgrid" aria-hidden="true"></div>
            <svg class="roads" viewBox="0 0 400 300" fill="none" aria-hidden="true">
              <path d="M-10 190h420" stroke="rgba(148,196,240,.45)" stroke-width="14"/>
              <path d="M-10 190h420" stroke="rgba(255,214,95,.45)" stroke-width="2" stroke-dasharray="16 14"/>
              <path d="M120 -10v320" stroke="rgba(148,196,240,.3)" stroke-width="8"/>
              <path d="M300 -10v320" stroke="rgba(148,196,240,.22)" stroke-width="6"/>
              <path d="M-10 250h420" stroke="rgba(148,196,240,.18)" stroke-width="5"/>
              <rect x="150" y="120" width="120" height="46" rx="4" fill="rgba(47,123,201,.3)"
                    stroke="rgba(255,214,95,.6)" stroke-width="2"/>
            </svg>
            <svg class="pin" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2a7 7 0 0 0-7 7c0 5.5 7 13 7 13s7-7.5 7-13a7 7 0 0 0-7-7Z"/>
              <circle cx="12" cy="9" r="2.6" fill="#04101f"/>
            </svg>
            <div class="addr">
              <span><strong>''' + FIRMA + '''</strong><span>''' + STRASSE + ''' · ''' + PLZ_ORT + '''</span></span>
              <a href="''' + MAPS + '''" target="_blank" rel="noopener" class="btn btn-primary"
                 style="min-height:42px;padding:.5rem 1rem;font-size:.88rem">Route</a>
            </div>
          </div>
          <p style="font-size:.86rem;color:var(--muted);margin-top:.7rem">Schematische Darstellung – für
            die Navigation nutzen Sie bitte den Routen-Link.</p>
        </div>

        <div class="reveal-r">
          <div class="form-card">
            <span class="eyebrow">Terminanfrage</span>
            <h2 style="font-size:clamp(1.6rem,3.4vw,2.1rem);margin:.9rem 0 .6rem">Termin anfragen</h2>
            <p style="color:var(--muted);margin-bottom:1.6rem">Füllen Sie aus, was Sie wissen – der Rest
              klärt sich am Telefon. Sie erhalten von uns eine Rückmeldung mit Terminvorschlag und, wenn
              möglich, einer Kostenangabe.</p>

            <form id="termin-form" novalidate>
              <div class="field-row">
                <div class="field">
                  <label for="t-name">Name *</label>
                  <input type="text" id="t-name" name="name" required placeholder="Vor- und Nachname" />
                </div>
                <div class="field">
                  <label for="t-phone">Telefon *</label>
                  <input type="tel" id="t-phone" name="telefon" required placeholder="Für die Rückmeldung" />
                </div>
              </div>
              <div class="field">
                <label for="t-email">E-Mail</label>
                <input type="email" id="t-email" name="email" placeholder="optional" />
              </div>
              <div class="field-row">
                <div class="field">
                  <label for="t-fahrzeug">Fahrzeug</label>
                  <input type="text" id="t-fahrzeug" name="fahrzeug" placeholder="z. B. VW Golf VII, 2016" />
                </div>
                <div class="field">
                  <label for="t-kennzeichen">Kennzeichen</label>
                  <input type="text" id="t-kennzeichen" name="kennzeichen" placeholder="z. B. A-XY 123" />
                </div>
              </div>
              <div class="field-row">
                <div class="field">
                  <label for="t-leistung">Worum geht es?</label>
                  <select id="t-leistung" name="leistung">
                    <option>Ich weiß es nicht genau – bitte beraten</option>
                    <option>HU / AU (TÜV)</option>
                    <option>Inspektion / Ölwechsel</option>
                    <option>Bremsen</option>
                    <option>Reifen / Räder</option>
                    <option>Fahrwerk / Lenkung</option>
                    <option>Reparatur / Diagnose</option>
                    <option>Gebrauchtwagen</option>
                    <option>Sonstiges</option>
                  </select>
                </div>
                <div class="field">
                  <label for="t-datum">Wunschtermin</label>
                  <input type="date" id="t-datum" name="datum" />
                </div>
              </div>
              <div class="field">
                <label for="t-message">Was ist mit dem Auto?</label>
                <textarea id="t-message" name="nachricht"
                  placeholder="Beschreiben Sie einfach, was Sie merken – ein Geräusch, eine Kontrollleuchte, ein Termin, der ansteht."></textarea>
              </div>
              <button type="submit" class="btn btn-primary" style="width:100%">
                Anfrage senden ''' + ic("arrow") + '''</button>
              <p class="form-note">* Pflichtfelder. Mit dem Absenden öffnet sich Ihr E-Mail-Programm mit
                einer vorausgefüllten Nachricht an ''' + MAIL + ''' – so werden keine Daten an Dritte
                übertragen. Details in der <a href="datenschutz.html"
                style="color:var(--navy-500);font-weight:600">Datenschutzerklärung</a>.</p>
              <div class="form-status" id="form-status" role="status" aria-live="polite"></div>
            </form>
          </div>

          <div class="note reveal" style="margin-top:1.6rem">''' + ic("phone") + '''<div>
            <strong>Es ist dringend?</strong> Rufen Sie einfach an: <a href="tel:''' + TEL_URI + '''"
            style="color:var(--navy-500);font-weight:700">''' + TEL + '''</a>. Bei kleineren Arbeiten
            bekommen Sie oft noch am selben Tag einen Termin.
          </div></div>
        </div>
      </div>
    </section>

''' + cta_band("Wir freuen uns auf Ihren Anruf",
               "Sagen Sie uns, was Ihr Auto hat oder was Sie vermuten. Alles Weitere klären wir "
               "gemeinsam – bevor geschraubt wird.")


# ═════════════════════════════════════════════════════════════════════════════
# IMPRESSUM
# ═════════════════════════════════════════════════════════════════════════════
IMPRESSUM_BODY = page_hero(
    "Rechtliches", "Impressum", "Angaben gemäß § 5 Digitale-Dienste-Gesetz (DDG).",
    "<span>Impressum</span>", "info") + '''

    <section class="section">
      <div class="wrap legal-page">
        <h2>Anbieter</h2>
        <address>
          <strong>''' + FIRMA + '''</strong><br>
          ''' + STRASSE + '''<br>
          ''' + PLZ_ORT + '''<br>
          Deutschland
        </address>

        <h2>Kontakt</h2>
        <p>
          Telefon: <a href="tel:''' + TEL_URI + '''">''' + TEL + '''</a><br>
          E-Mail: <a href="mailto:''' + MAIL + '''">''' + MAIL + '''</a>
        </p>

        <h2>Vertretungsberechtigter Geschäftsführer</h2>
        <p>Stefan Möckl</p>

        <h2>Registereintrag</h2>
        <p>
          Registergericht: Amtsgericht Augsburg<br>
          Registernummer: HRB <em>[bitte ergänzen]</em>
        </p>

        <h2>Umsatzsteuer-Identifikationsnummer</h2>
        <p>USt-IdNr. gemäß § 27 a Umsatzsteuergesetz: <em>[bitte ergänzen]</em></p>

        <h2>Aufsichtsbehörde / Kammer</h2>
        <p>
          Handwerkskammer für Schwaben<br>
          Siebentischstraße 52–58, 86161 Augsburg<br>
          <a href="https://www.hwk-schwaben.de" target="_blank" rel="noopener">www.hwk-schwaben.de</a>
        </p>
        <p>
          Gesetzliche Berufsbezeichnung: Kraftfahrzeugtechniker-Handwerk (Kfz-Meisterbetrieb)<br>
          Verliehen in: Deutschland<br>
          Es gelten die Handwerksordnung (HwO) sowie die zugehörigen berufsrechtlichen Regelungen,
          abrufbar unter
          <a href="https://www.gesetze-im-internet.de/hwo/" target="_blank" rel="noopener">gesetze-im-internet.de/hwo</a>.
        </p>

        <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
        <p>Stefan Möckl, Anschrift wie oben.</p>

        <h2>Berufsbezogene Haftpflichtversicherung</h2>
        <p><em>[Name und Anschrift des Versicherers sowie räumlicher Geltungsbereich – bitte ergänzen]</em></p>

        <h2>Verbraucherstreitbeilegung</h2>
        <p>Wir sind nicht verpflichtet und nicht bereit, an einem Streitbeilegungsverfahren vor einer
          Verbraucherschlichtungsstelle teilzunehmen.</p>

        <h2>Haftung für Inhalte</h2>
        <p>Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten nach
          den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir als Diensteanbieter
          jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen
          oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.</p>
        <p>Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den
          allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab
          dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden
          entsprechender Rechtsverletzungen entfernen wir diese Inhalte unverzüglich.</p>

        <h2>Haftung für Links</h2>
        <p>Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen
          Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für
          die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten
          verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche
          Rechtsverstöße überprüft; rechtswidrige Inhalte waren nicht erkennbar. Eine permanente
          inhaltliche Kontrolle der verlinkten Seiten ist ohne konkrete Anhaltspunkte einer
          Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen entfernen wir solche
          Links unverzüglich.</p>

        <h2>Urheberrecht</h2>
        <p>Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem
          deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der
          Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des
          jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten,
          nicht kommerziellen Gebrauch gestattet.</p>
        <p>Die auf dieser Website wiedergegebenen Kundenbewertungen stammen aus dem öffentlich
          zugänglichen Google-Unternehmensprofil der ''' + FIRMA + ''' und sind ihren jeweiligen
          Verfasserinnen und Verfassern zuzuordnen.</p>
      </div>
    </section>
'''

# ═════════════════════════════════════════════════════════════════════════════
# DATENSCHUTZ
# ═════════════════════════════════════════════════════════════════════════════
DATENSCHUTZ_BODY = page_hero(
    "Rechtliches", "Datenschutzerklärung",
    "Diese Website ist bewusst sparsam gebaut: kein Tracking, keine Werbenetzwerke, keine "
    "eingebetteten Karten oder Videos.",
    "<span>Datenschutz</span>", "shield") + '''

    <section class="section">
      <div class="wrap legal-page">
        <div class="note" style="margin-bottom:2.2rem">''' + ic("info") + '''<div>
          <strong>Kurzfassung:</strong> Wir setzen keine Analyse- oder Werbe-Cookies ein, binden keine
          Karten, Fonts oder Videos von Drittanbietern in die Seite ein und betreiben kein
          Kontaktformular mit Server-Übertragung. Ihre Terminanfrage wird als E-Mail aus Ihrem eigenen
          E-Mail-Programm versendet.
        </div></div>

        <h2>1. Verantwortlicher</h2>
        <address>
          <strong>''' + FIRMA + '''</strong><br>
          ''' + STRASSE + '''<br>
          ''' + PLZ_ORT + '''<br>
          Telefon: <a href="tel:''' + TEL_URI + '''">''' + TEL + '''</a><br>
          E-Mail: <a href="mailto:''' + MAIL + '''">''' + MAIL + '''</a>
        </address>

        <h2>2. Grundsätzliches</h2>
        <p>Wir verarbeiten personenbezogene Daten nur, soweit dies für die Bereitstellung dieser Website
          und die Bearbeitung Ihrer Anfragen erforderlich ist. Rechtsgrundlagen sind insbesondere
          Art. 6 Abs. 1 lit. b DSGVO (Vertrag bzw. Vertragsanbahnung), Art. 6 Abs. 1 lit. f DSGVO
          (berechtigtes Interesse an einem sicheren, funktionsfähigen Webangebot) und Art. 6 Abs. 1
          lit. a DSGVO (Einwilligung), soweit eine solche erteilt wurde.</p>

        <h2>3. Server-Logfiles</h2>
        <p>Beim Aufruf dieser Website werden durch den Hosting-Dienstleister automatisch Informationen
          in Server-Logfiles gespeichert, die Ihr Browser übermittelt. Dies sind in der Regel:</p>
        <ul>
          <li>gekürzte oder vollständige IP-Adresse des anfragenden Geräts</li>
          <li>Datum und Uhrzeit des Zugriffs</li>
          <li>Name und URL der abgerufenen Datei</li>
          <li>übertragene Datenmenge und Meldung über den Abrufstatus</li>
          <li>verwendeter Browser und Betriebssystem sowie die verweisende Seite (Referrer)</li>
        </ul>
        <p>Diese Daten sind technisch erforderlich, um die Website auszuliefern, ihre Stabilität und
          Sicherheit zu gewährleisten und Missbrauch aufzuklären. Rechtsgrundlage ist Art. 6 Abs. 1
          lit. f DSGVO. Eine Zusammenführung dieser Daten mit anderen Datenquellen findet nicht statt.
          Die Logfiles werden nach kurzer Zeit gelöscht.</p>

        <h2>4. Hosting</h2>
        <p>Diese Website wird bei einem externen Dienstleister gehostet. Der Anbieter verarbeitet die
          im Rahmen des Seitenaufrufs anfallenden Daten (siehe Ziffer 3) ausschließlich in unserem
          Auftrag auf Grundlage eines Vertrags über die Auftragsverarbeitung gemäß Art. 28 DSGVO.</p>
        <p><em>[Name und Anschrift des Hosting-Anbieters bitte ergänzen.]</em></p>

        <h2>5. Cookies und lokale Speicherung</h2>
        <p>Diese Website setzt keine Cookies zu Analyse-, Marketing- oder Profilbildungszwecken ein.</p>
        <p>Wenn Sie den Hinweis zu Cookies bestätigen, speichern wir Ihre Auswahl im lokalen Speicher
          (<em>localStorage</em>) Ihres Browsers, damit der Hinweis nicht bei jedem Besuch erneut
          erscheint. Es handelt sich um einen technisch notwendigen Eintrag ohne Personenbezug, der
          Ihr Gerät nicht verlässt. Sie können ihn jederzeit über die Einstellungen Ihres Browsers
          löschen.</p>

        <h2>6. Schriftarten</h2>
        <p>Diese Website lädt die verwendeten Schriftarten über den Dienst Google Fonts
          (Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland). Dabei stellt Ihr
          Browser eine Verbindung zu Servern von Google her und übermittelt dabei Ihre IP-Adresse sowie
          technische Angaben zu Browser und Betriebssystem. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f
          DSGVO (berechtigtes Interesse an einer einheitlichen Darstellung der Website). Weitere
          Informationen finden Sie in der
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Datenschutzerklärung von Google</a>.</p>
        <p><em>Hinweis für den Betreiber: Sollen keine Daten an Google übertragen werden, können die
          Schriftdateien lokal auf dem eigenen Server bereitgestellt werden. Diese Ziffer ist dann zu
          streichen.</em></p>

        <h2>7. Kontaktaufnahme und Terminanfrage</h2>
        <p>Das Formular „Termin anfragen“ überträgt keine Daten an unseren Server. Beim Absenden öffnet
          sich Ihr lokales E-Mail-Programm mit einer vorausgefüllten Nachricht, die Sie selbst versenden.
          Erst mit dem Versand dieser E-Mail erhalten wir Ihre Angaben.</p>
        <p>Wenn Sie uns per E-Mail, Telefon oder über das Formular kontaktieren, verarbeiten wir die von
          Ihnen mitgeteilten Daten (z. B. Name, Kontaktdaten, Fahrzeug- und Auftragsangaben), um Ihre
          Anfrage zu bearbeiten und den Termin durchzuführen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b
          DSGVO, bei allgemeinen Anfragen Art. 6 Abs. 1 lit. f DSGVO.</p>
        <p>Ihre Anfrage speichern wir, solange sie zur Bearbeitung erforderlich ist. Daten aus
          Werkstattaufträgen unterliegen darüber hinaus steuer- und handelsrechtlichen
          Aufbewahrungsfristen (in der Regel sechs bis zehn Jahre).</p>

        <h2>8. Weitergabe von Daten</h2>
        <p>Eine Übermittlung Ihrer Daten an Dritte findet nur statt, soweit dies zur Vertragserfüllung
          erforderlich ist (z. B. an Prüforganisationen im Rahmen der Hauptuntersuchung, an
          Ersatzteillieferanten oder an Ihre Versicherung bei einem Schadensfall), wir gesetzlich dazu
          verpflichtet sind oder Sie eingewilligt haben.</p>

        <h2>9. Kundenbewertungen</h2>
        <p>Auf dieser Website geben wir öffentlich zugängliche Rezensionen aus unserem
          Google-Unternehmensprofil wieder. Die Wiedergabe erfolgt in Textform; es werden keine Daten
          von Google nachgeladen und keine Profilbilder übernommen. Wenn Sie als Verfasserin oder
          Verfasser einer Rezension mit der Wiedergabe auf dieser Website nicht einverstanden sind,
          genügt eine kurze Nachricht an <a href="mailto:''' + MAIL + '''">''' + MAIL + '''</a> – wir
          entfernen den Beitrag dann.</p>

        <h2>10. Externe Links</h2>
        <p>Diese Website enthält Links zu externen Angeboten, etwa zu Google Maps für die Routenplanung.
          Ein Aufruf dieser Seiten erfolgt erst, wenn Sie den Link aktiv anklicken. Für die
          Datenverarbeitung auf den verlinkten Seiten ist der jeweilige Anbieter verantwortlich.</p>

        <h2>11. Ihre Rechte</h2>
        <p>Sie haben im Rahmen der gesetzlichen Voraussetzungen das Recht auf:</p>
        <ul>
          <li>Auskunft über die zu Ihrer Person verarbeiteten Daten (Art. 15 DSGVO)</li>
          <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
          <li>Löschung (Art. 17 DSGVO) und Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
          <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
          <li>Widerspruch gegen eine Verarbeitung auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO (Art. 21 DSGVO)</li>
          <li>Widerruf einer erteilten Einwilligung mit Wirkung für die Zukunft (Art. 7 Abs. 3 DSGVO)</li>
        </ul>
        <p>Wenden Sie sich dazu an die oben genannten Kontaktdaten.</p>

        <h2>12. Beschwerderecht bei der Aufsichtsbehörde</h2>
        <p>Sie haben das Recht, sich bei einer Datenschutzaufsichtsbehörde zu beschweren. Für uns
          zuständig ist:</p>
        <address>
          Bayerisches Landesamt für Datenschutzaufsicht (BayLDA)<br>
          Promenade 18, 91522 Ansbach<br>
          <a href="https://www.lda.bayern.de" target="_blank" rel="noopener">www.lda.bayern.de</a>
        </address>

        <h2>13. Datensicherheit</h2>
        <p>Diese Website wird über eine verschlüsselte Verbindung (TLS/HTTPS) ausgeliefert. Sie erkennen
          dies am Schloss-Symbol in der Adresszeile Ihres Browsers. Darüber hinaus treffen wir geeignete
          technische und organisatorische Maßnahmen, um Ihre Daten gegen Verlust und unberechtigten
          Zugriff zu schützen.</p>

        <h2>14. Änderungen dieser Erklärung</h2>
        <p>Wir passen diese Datenschutzerklärung an, wenn sich die rechtlichen Anforderungen oder die
          auf dieser Website eingesetzten Dienste ändern. Es gilt jeweils die hier veröffentlichte
          Fassung.</p>
      </div>
    </section>
'''


# ═════════════════════════════════════════════════════════════════════════════
# ALLE SEITEN SCHREIBEN
# ═════════════════════════════════════════════════════════════════════════════
def main():
    written = []

    written.append(render(
        "index.html",
        "Kfz-Möckl GmbH | Kfz-Meisterbetrieb & Autowerkstatt in Augsburg",
        "Kfz-Möckl GmbH in Augsburg-Kriegshaber: HU/AU, Inspektion, Bremsen, Reifen, Fahrwerk und "
        "Reparatur für alle Marken. Klare Preise, keine Reparatur ohne Zustimmung. Termin: 0821 4444242.",
        INDEX_BODY, "start", preloader=True))

    written.append(render(
        "leistungen.html",
        "Leistungen | Kfz-Möckl GmbH Augsburg",
        "Unsere Werkstattleistungen in Augsburg: HU und AU, Inspektion und Ölwechsel, Bremsen, Reifen, "
        "Fahrwerk und Lenkung sowie Reparatur und Diagnose für alle Marken.",
        LEISTUNGEN_BODY, "leistungen"))

    services = {
        "hu-au": (HU_BODY,
                  "HU & AU (TÜV) in Augsburg | Kfz-Möckl GmbH",
                  "Hauptuntersuchung und Abgasuntersuchung bei Kfz-Möckl in Augsburg – mit Vorabcheck "
                  "und Mängelbeseitigung direkt im Haus. Termin: 0821 4444242."),
        "inspektion": (INSPEKTION_BODY,
                       "Inspektion & Ölwechsel in Augsburg | Kfz-Möckl GmbH",
                       "Inspektion nach Herstellervorgabe und Ölwechsel bei Kfz-Möckl in Augsburg – mit "
                       "Eintrag ins Serviceheft und nur dann, wenn es wirklich fällig ist."),
        "bremsen": (BREMSEN_BODY,
                    "Bremsen prüfen & wechseln in Augsburg | Kfz-Möckl GmbH",
                    "Bremsbeläge, Bremsscheiben und Bremsflüssigkeit bei Kfz-Möckl in Augsburg. Wir "
                    "messen nach und tauschen nur, was verschlissen ist."),
        "reifen": (REIFEN_BODY,
                   "Reifenservice & Reifenwechsel in Augsburg | Kfz-Möckl GmbH",
                   "Reifenwechsel, Neureifen, Auswuchten, RDKS und Reifeneinlagerung bei Kfz-Möckl in "
                   "Augsburg-Kriegshaber."),
        "fahrwerk": (FAHRWERK_BODY,
                     "Fahrwerk & Lenkung reparieren in Augsburg | Kfz-Möckl GmbH",
                     "Stoßdämpfer, Querlenker, Spurstangen und Radlager: Kfz-Möckl in Augsburg findet "
                     "die Ursache für Poltern, Ziehen und schwammige Lenkung."),
        "reparatur": (REPARATUR_BODY,
                      "Autoreparatur & Diagnose in Augsburg | Kfz-Möckl GmbH",
                      "Fehlerdiagnose, Kupplung, Motor, Elektrik und Marderschäden: Reparatur für alle "
                      "Marken bei Kfz-Möckl in Augsburg – mit Kostenvoranschlag vorab."),
    }
    for slug, (body, title, desc) in services.items():
        written.append(render(slug + ".html", title, desc, body, "leistungen", service_active=slug))

    written.append(render(
        "gebrauchtwagen.html",
        "Gebrauchtwagen in Augsburg | Kfz-Möckl GmbH",
        "Geprüfte Gebrauchtwagen aus eigener Werkstatt: solide Alltagsautos zu fairen Preisen, mit "
        "ehrlicher Zustandsbeschreibung. Kfz-Möckl GmbH, Augsburg-Kriegshaber.",
        GEBRAUCHT_BODY, "gebrauchtwagen"))

    written.append(render(
        "ueber-uns.html",
        "Über uns | Kfz-Möckl GmbH – Kfz-Meisterbetrieb Augsburg",
        "Kfz-Möckl GmbH in Augsburg-Kriegshaber: freier Kfz-Meisterbetrieb, Vater und Sohn, alle Marken. "
        "Wir reparieren nur, was wirklich nötig ist.",
        UEBER_BODY, "ueber-uns"))

    written.append(render(
        "bewertungen.html",
        "Bewertungen | Kfz-Möckl GmbH Augsburg",
        "19 Google-Rezensionen zur Kfz-Möckl GmbH in Augsburg im Original: Ehrlichkeit, faire Preise "
        "und keine Reparatur ohne Zustimmung.",
        BEWERTUNGEN_BODY, "bewertungen"))

    written.append(render(
        "kontakt.html",
        "Kontakt & Termin | Kfz-Möckl GmbH Augsburg",
        "Kfz-Möckl GmbH, Ulmer Str. 55, 86156 Augsburg-Kriegshaber. Telefon 0821 4444242. "
        "Öffnungszeiten, Anfahrt und Terminanfrage.",
        KONTAKT_BODY, "kontakt"))

    written.append(render(
        "impressum.html",
        "Impressum | Kfz-Möckl GmbH",
        "Impressum der Kfz-Möckl GmbH, Ulmer Str. 55, 86156 Augsburg-Kriegshaber.",
        IMPRESSUM_BODY, "impressum"))

    written.append(render(
        "datenschutz.html",
        "Datenschutzerklärung | Kfz-Möckl GmbH",
        "Datenschutzerklärung der Kfz-Möckl GmbH: kein Tracking, keine Werbe-Cookies, keine "
        "eingebetteten Karten oder Videos.",
        DATENSCHUTZ_BODY, "datenschutz"))

    print("%d Seiten geschrieben:" % len(written))
    for f in sorted(written):
        print("  ", f)


if __name__ == "__main__":
    main()
