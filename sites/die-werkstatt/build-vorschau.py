# -*- coding: utf-8 -*-
"""Baut sites/die-werkstatt/vorschau.html – die komplette Website in einer Datei.

Alle Unterseiten, Schriften und Bilder stecken eingebettet drin; die Navigation
läuft clientseitig. Dadurch lässt sich die Seite ohne Server und ohne Deployment
anzeigen, auch über einen HTML-Proxy wie htmlpreview.github.io – es kann nichts
fehlen, weil nichts nachgeladen wird.
"""
import base64, io, os, re
from PIL import Image

SITE = "/home/user/webseiten-verkaufen/sites/die-werkstatt"
os.chdir(SITE)

PAGES = [("index", "Start"), ("leistungen", "Leistungen"), ("ueber-uns", "Über uns"),
         ("bewertungen", "Bewertungen"), ("kontakt", "Kontakt"),
         ("impressum", "Impressum"), ("datenschutz", "Datenschutz")]
NAMES = [p for p, _ in PAGES]


def b64(path):
    return base64.b64encode(open(path, "rb").read()).decode()


# ── Schriften: nur latin-Teilmenge (deckt Deutsch vollständig ab) ──────────
css = open("styles.css").read()
fonts = open("fonts.css").read()
blocks = re.findall(r"@font-face\s*\{[^}]*\}", fonts)
keep = [b for b in blocks if "-latin.woff2" in b]
inline_fonts = []
for b in keep:
    f = re.search(r"url\((fonts/[^)]+)\)", b).group(1)
    inline_fonts.append(b.replace(f, "data:font/woff2;base64," + b64(f)))
css = css.replace('@import url("fonts.css");   /* selbst gehostet – keine Verbindung zu Google */',
                  "\n".join(inline_fonts))

# ── Bilder ────────────────────────────────────────────────────────────────
def jpg_data(path, maxw):
    im = Image.open(path).convert("RGB")
    if im.width > maxw:
        im = im.resize((maxw, round(im.height * maxw / im.width)), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=80, optimize=True, progressive=True)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()

IMG = {
    "img/halle.jpg":        jpg_data("img/halle.jpg", 1000),
    "img/schild.jpg":       jpg_data("img/schild.jpg", 700),
    "img/batterietest.jpg": jpg_data("img/batterietest.jpg", 385),
}
FAVICON = "data:image/svg+xml;base64," + b64("img/favicon.svg")


def rewrite(html):
    """Interne Verweise auf die clientseitige Navigation umbiegen, Bilder einbetten."""
    for src, data in IMG.items():
        html = html.replace('src="%s"' % src, 'src="%s"' % data)
    html = html.replace('href="kontakt.html#termin"', 'href="#kontakt/termin"')
    for n in NAMES:
        html = html.replace('href="%s.html"' % n, 'href="#%s"' % n)
    return html


def part(html, start, end):
    a = html.index(start)
    b = html.index(end, a)
    return html[a:b + len(end)]


home = open("index.html").read()
topbar = rewrite(part(home, '<div class="topbar">', "</div>\n  </div>"))
nav_html = rewrite(part(home, '<header class="nav">', "</header>"))
footer = rewrite(part(home, '<footer class="footer">', "</footer>"))

# aktiv-Markierung entfernen – die setzt der Router
nav_html = nav_html.replace(' class="active" aria-current="page"', "")

mains = {}
for n in NAMES:
    h = open(n + ".html").read()
    m = part(h, '<main id="main">', "</main>")
    m = m[len('<main id="main">'):-len("</main>")]
    mains[n] = rewrite(m)

app = open("app.js").read()
marker = '  if (document.readyState === "loading") {'
assert marker in app
app = app.replace(marker,
    "  // Für die Einzeldatei-Vorschau: nach einem Seitenwechsel erneut aufbauen\n"
    "  // (ohne nav() und ohne den Statusintervall – die laufen nur einmal).\n"
    '  window.dwInit = function () { paintStatus(); markToday(); reveals(); counters(); wall(); form(); year(); };\n\n'
    + marker)

parts = []
for n, label in PAGES:
    parts.append('<script type="text/html" id="pv-%s">%s</script>' % (n, mains[n]))

titles = {"index": "Start", "leistungen": "Leistungen", "ueber-uns": "Über uns",
          "bewertungen": "Bewertungen", "kontakt": "Kontakt",
          "impressum": "Impressum", "datenschutz": "Datenschutz"}

router = """
(function () {
  var NAMES = %s;
  var TITLES = %s;
  var main = document.getElementById('main');

  function show(name, anchor) {
    if (NAMES.indexOf(name) < 0) name = 'index';
    var tpl = document.getElementById('pv-' + name);
    main.innerHTML = tpl.innerHTML;
    document.title = (name === 'index' ? 'Die Werkstatt Hagen' : TITLES[name] + ' | Die Werkstatt Hagen');

    var links = document.querySelectorAll('.nav-links > a[href^="#"]');
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      var on = a.getAttribute('href').slice(1).split('/')[0] === name;
      a.classList.toggle('active', on);
      if (on) { a.setAttribute('aria-current', 'page'); } else { a.removeAttribute('aria-current'); }
    }

    if (window.dwInit) window.dwInit();

    if (anchor) {
      var el = document.getElementById(anchor);
      if (el) { el.scrollIntoView(); return; }
    }
    window.scrollTo(0, 0);
  }

  function fromHash() {
    var h = (location.hash || '#index').slice(1).split('/');
    show(h[0] || 'index', h[1]);
  }

  window.addEventListener('hashchange', fromHash);
  fromHash();
})();
""" % (repr(NAMES).replace("'", '"'), repr(titles).replace("'", '"'))

html = """<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Die Werkstatt Hagen – Vorschau</title>
<meta name="robots" content="noindex, nofollow" />
<meta name="description" content="Vorschau der Website für Die Werkstatt, KFZ-Meisterbetrieb Dominik Benfer, Hagen." />
<meta name="theme-color" content="#15181c" />
<link rel="icon" href="%(fav)s" type="image/svg+xml" />
<script>document.documentElement.classList.add('js');</script>
<style>
%(css)s
/* Nur in der Vorschau: Hinweisband über der Seite */
.pv-bar {
  background: #b33f0c; color: #fff; font-family: var(--sans); font-size: .82rem;
  padding: .55rem 1.25rem; text-align: center; line-height: 1.5;
}
.pv-bar b { font-weight: 700; }
</style>
</head>
<body>
<a class="skip" href="#main">Zum Inhalt springen</a>

<p class="pv-bar"><b>Vorschau</b> – eine einzelne Datei mit allen Unterseiten.
Impressum und Datenschutz enthalten noch markierte Platzhalter.</p>
%(topbar)s
%(nav)s
<main id="main"></main>
%(footer)s

%(parts)s

<script>
%(app)s
</script>
<script>
%(router)s
</script>
</body>
</html>
""" % dict(fav=FAVICON, css=css, topbar=topbar, nav=nav_html, footer=footer,
           parts="\n".join(parts), app=app, router=router)

open("vorschau.html", "w").write(html)
print("vorschau.html: %.0f KB" % (os.path.getsize("vorschau.html") / 1024))
