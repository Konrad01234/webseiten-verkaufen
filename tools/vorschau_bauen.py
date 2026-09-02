# -*- coding: utf-8 -*-
"""
Baut sites/boostwerk/vorschau.html: die komplette Website in EINER Datei.

Alle Unterseiten, Schriften und Bilder stecken eingebettet drin, die Navigation
läuft im Browser. Dadurch lässt sich die Seite ohne Server und ohne Deployment
anzeigen – auch über einen HTML-Proxy wie htmlpreview.github.io. Es kann nichts
fehlen, weil nichts nachgeladen wird.

Aufruf aus der Repo-Wurzel:
    python3 tools/vorschau_bauen.py
"""

import base64
import io
import os
import re

SITE = "sites/boostwerk"
SEITEN = [
    ("index",       "Start"),
    ("leistungen",  "Leistungen"),
    ("werkstatt",   "Werkstatt"),
    ("rezensionen", "Rezensionen"),
    ("kontakt",     "Kontakt"),
    ("impressum",   "Impressum"),
    ("datenschutz", "Datenschutz"),
]

MIME = {".woff2": "font/woff2", ".webp": "image/webp", ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml"}


def lies(p):
    return io.open(os.path.join(SITE, p), encoding="utf-8").read()


def datauri(pfad):
    voll = os.path.join(SITE, pfad)
    if not os.path.exists(voll):
        print("   fehlt:", pfad)
        return None
    typ = MIME.get(os.path.splitext(pfad)[1].lower(), "application/octet-stream")
    roh = open(voll, "rb").read()
    return "data:%s;base64,%s" % (typ, base64.b64encode(roh).decode("ascii")), len(roh)


def block(text, start, ende):
    i = text.index(start)
    j = text.index(ende, i) + len(ende)
    return text[i:j]


# ---------------------------------------------------------------- CSS + Fonts
print("Schriften einbetten …")
css = lies("styles.css")
gesamt = 0
for treffer in sorted(set(re.findall(r'url\("(fonts/[^"]+)"\)', css))):
    d = datauri(treffer)
    if d:
        uri, groesse = d
        gesamt += groesse
        css = css.replace('url("%s")' % treffer, 'url(%s)' % uri)
        print("   %-34s %4d KB" % (treffer, groesse // 1024))
print("   Schriften gesamt: %d KB" % (gesamt // 1024))

# ---------------------------------------------------------------- Grundgerüst
index = lies("index")  if False else lies("index.html")

sprite   = block(index, "<!-- ============ SVG-Symbole ============ -->", "</svg>\n")
overlay  = block(index, '<div id="nav-overlay"', "</div>\n")
topbar   = block(index, '<div class="topbar">', "</div>\n</div>\n")
nav      = block(index, '<header class="nav"', "</header>")
footer   = block(index, '<footer class="footer">', "</footer>")
cookie   = block(index, '<button id="totop"', "</div>\n")

# Seitenlinks auf die interne Navigation umstellen
def interne_links(html):
    html = re.sub(r'href="(index|leistungen|werkstatt|rezensionen|kontakt|impressum|datenschutz)\.html"',
                  r'href="#\1" data-seite="\1"', html)
    return re.sub(r'href="(datenschutz)\.html#([a-z]+)"',
                  r'href="#\1" data-seite="\1"', html)

sprite  = interne_links(sprite)
overlay = interne_links(overlay)
topbar  = interne_links(topbar)
nav     = interne_links(nav)
footer  = interne_links(footer)

# ---------------------------------------------------------------- Bilder
# Jedes Bild wird GENAU EINMAL als Data-URI abgelegt und im Markup nur über
# einen kurzen Schlüssel referenziert. Sonst steckt z. B. das Hero-Foto fünfmal
# in der Datei, weil es auf jedem Seitenkopf sitzt.
print("\nBilder einbetten …")
bilder = {}          # Schlüssel -> Data-URI
schluessel = {}      # Pfad      -> Schlüssel
bild_gesamt = 0

# Große JPEGs für die Vorschau nach WebP wandeln, das spart deutlich
NACH_WEBP = {"img/hero.jpg": 1600, "img/halle.jpg": 1000}
try:
    from PIL import Image
    _pil = True
except ImportError:
    _pil = False


def bild_uri(pfad):
    """Gibt den Schlüssel zurück, unter dem das Bild im Skript liegt."""
    global bild_gesamt
    if pfad in schluessel:
        return schluessel[pfad]

    voll = os.path.join(SITE, pfad)
    if not os.path.exists(voll):
        print("   fehlt:", pfad)
        schluessel[pfad] = None
        return None

    if _pil and pfad in NACH_WEBP:
        im = Image.open(voll).convert("RGB")
        b = NACH_WEBP[pfad]
        if im.size[0] > b:
            im = im.resize((b, round(b * im.size[1] / im.size[0])), Image.LANCZOS)
        puffer = io.BytesIO()
        im.save(puffer, "WEBP", quality=78, method=6)
        roh, typ = puffer.getvalue(), "image/webp"
    else:
        roh = open(voll, "rb").read()
        typ = MIME.get(os.path.splitext(pfad)[1].lower(), "application/octet-stream")

    k = "b%d" % len(bilder)
    bilder[k] = "data:%s;base64,%s" % (typ, base64.b64encode(roh).decode("ascii"))
    schluessel[pfad] = k
    bild_gesamt += len(roh)
    print("   %-38s %4d KB   -> %s" % (pfad, len(roh) // 1024, k))
    return k


def bilder_einbetten(html):
    # <picture> auflösen: nur das WebP behalten
    def pic(m):
        k = bild_uri(m.group(1))
        return m.group(0) if not k else '<img data-bild="%s"%s/>' % (k, m.group(3))

    html = re.sub(
        r'<picture>\s*<source srcset="([^"]+)" type="image/webp" />\s*'
        r'<img src="([^"]+)"([^>]*?)/>\s*</picture>', pic, html, flags=re.S)

    # verbliebene normale Bilder
    def img(m):
        k = bild_uri(m.group(1))
        return m.group(0) if not k else 'data-bild="%s"' % k

    return re.sub(r'src="(img/[^"]+)"', img, html)


# ---------------------------------------------------------------- Seiteninhalte
print("\nSeiten zusammenstellen …")
inhalte = []
for datei, titel in SEITEN:
    roh = lies(datei + ".html")
    m = re.search(r"<main[^>]*>(.*?)</main>", roh, re.S)
    if not m:
        print("   KEIN <main>:", datei)
        continue
    inneres = interne_links(m.group(1))
    inneres = bilder_einbetten(inneres)
    klasse = "legal" if datei in ("impressum", "datenschutz") else ""
    inhalte.append(
        '<div class="vp-seite %s" data-seite="%s" hidden>\n%s\n</div>' % (klasse, datei, inneres))
    print("   %-14s %6d Zeichen" % (datei, len(inneres)))

sprite = bilder_einbetten(sprite)
footer = bilder_einbetten(footer)

rezensionen_js = lies("reviews.js")   # muss VOR app.js stehen, sonst ist REVIEWS leer
app = lies("app.js")

# ---------------------------------------------------------------- Ausgabe
seite = u"""<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Vorschau · Boostwerk Köln</title>
<meta name="robots" content="noindex,nofollow" />
<meta name="theme-color" content="#06070a" />
<script>document.documentElement.classList.add('js');</script>
<style>
%s

/* ---- nur für die Vorschau ---- */
.vp-seite[hidden] { display: none !important; }
.vp-hinweis {
  position: fixed; left: 50%%; bottom: 1rem; transform: translateX(-50%%);
  z-index: 200; display: flex; align-items: center; gap: .6rem;
  padding: .5rem .95rem; border-radius: 999px;
  background: rgba(255,186,10,.94); color: #241a00;
  font: 600 .78rem/1.3 Inter, system-ui, sans-serif;
  box-shadow: 0 8px 30px rgba(0,0,0,.5); cursor: pointer;
}
.vp-hinweis b { font-weight: 800; }
.vp-hinweis.weg { display: none; }
</style>
</head>
<body>

<div id="preloader" aria-hidden="true">
  <p class="pl-mark">BOOST<span>WERK</span></p>
  <span class="pl-sub">Köln · Ostheim</span>
  <div class="pl-track"><div class="pl-fill"></div></div>
</div>

%s

<div class="scroll-progress" id="scroll-progress" aria-hidden="true"></div>

%s

%s

%s

<main>
%s
</main>

%s

%s

<div class="vp-hinweis" id="vp-hinweis" title="Ausblenden">
  <b>Vorschau</b> · alles in einer Datei, kein Produktivstand
</div>

<script>
/* Bilder: jedes genau einmal, im Markup nur über data-bild referenziert */
var BILDER = %s;
(function () {
  var offen = document.querySelectorAll("img[data-bild]");
  for (var i = 0; i < offen.length; i++) {
    var q = BILDER[offen[i].getAttribute("data-bild")];
    if (q) offen[i].src = q;
  }
})();
</script>

<script>
/* Rezensionsdaten */
%s
</script>

<script>
%s
</script>

<script>
/* -------------------------------------------------------------------------
   Navigation innerhalb der einen Datei
   ------------------------------------------------------------------------- */
(function () {
  var seiten = Array.prototype.slice.call(document.querySelectorAll(".vp-seite"));
  var titel = {
    index: "Boostwerk Köln | Kfz-Meisterwerkstatt in Köln-Ostheim",
    leistungen: "Leistungen | Boostwerk Köln",
    werkstatt: "Werkstatt & Anfahrt | Boostwerk Köln",
    rezensionen: "Rezensionen | Boostwerk Köln",
    kontakt: "Kontakt & Termin | Boostwerk Köln",
    impressum: "Impressum | Boostwerk Köln",
    datenschutz: "Datenschutzerklärung | Boostwerk Köln"
  };

  function zeige(name, scrollen) {
    if (!titel[name]) name = "index";
    seiten.forEach(function (s) { s.hidden = s.getAttribute("data-seite") !== name; });

    // aktiven Menüpunkt setzen
    document.querySelectorAll('[data-seite]').forEach(function (a) {
      if (a.tagName === "A") a.classList.toggle("active", a.getAttribute("data-seite") === name);
    });

    // Reveal-Animationen der neuen Seite auslösen
    var aktiv = document.querySelector('.vp-seite[data-seite="' + name + '"]');
    if (aktiv) {
      aktiv.querySelectorAll("[data-reveal]").forEach(function (el) { el.classList.add("in"); });
      var st = aktiv.querySelector("#steps"); if (st) st.classList.add("in");
      var li = aktiv.querySelector("#lift");  if (li) li.classList.add("in");
    }
    document.title = titel[name];
    if (scrollen) window.scrollTo(0, 0);
  }

  document.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest("a[data-seite]") : null;
    if (!a) return;
    e.preventDefault();
    var name = a.getAttribute("data-seite");
    history.replaceState(null, "", "#" + name);
    zeige(name, true);
    var ov = document.getElementById("nav-overlay");
    if (ov && ov.classList.contains("open")) {
      ov.classList.remove("open");
      var bg = document.getElementById("burger");
      if (bg) bg.classList.remove("open");
      document.body.style.overflow = "";
    }
  });

  window.addEventListener("hashchange", function () {
    zeige((location.hash || "#index").slice(1), true);
  });

  zeige((location.hash || "#index").slice(1), false);

  var h = document.getElementById("vp-hinweis");
  if (h) h.addEventListener("click", function () { h.classList.add("weg"); });
})();
</script>
</body>
</html>
""" % (css, sprite, overlay, topbar, nav, "\n\n".join(inhalte), footer, cookie,
       "{\n" + ",\n".join('"%s":"%s"' % (k, v) for k, v in bilder.items()) + "\n}",
       rezensionen_js, app)

ziel = os.path.join(SITE, "vorschau.html")
io.open(ziel, "w", encoding="utf-8").write(seite)
kb = os.path.getsize(ziel) // 1024
print("\nGeschrieben: %s" % ziel)
print("Größe: %d KB  (Bilder %d KB, Schriften %d KB, jeweils vor der Base64-Kodierung)"
      % (kb, bild_gesamt // 1024, gesamt // 1024))
