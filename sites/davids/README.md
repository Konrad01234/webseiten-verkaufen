# Davids im Landhaus – Website

Mehrseitige statische Website für das Restaurant **Davids im Landhaus** in Neuss
(gehobene Landhausküche von David Esser).

## Seiten

| Datei | Inhalt |
|-------|--------|
| `index.html` | Startseite – Foto-Hero, Konzept, Highlights, Auszeichnung, Galerie-Teaser |
| `ueber-uns.html` | Über David Esser, Philosophie, Werte, Ambiente & Biergarten |
| `speisekarte.html` | Aktuelle Karte: Vorspeisen, Hauptgänge, Spargelkarte, Klassiker, Dessert, Chef's Menü + PDF-Link |
| `impressionen.html` | Galerie mit allen Fotos |
| `kontakt.html` | Kontakt, Öffnungszeiten, Anfahrt & Reservierungsanfrage |
| `impressum.html` | Impressum (1:1) |
| `datenschutz.html` | Datenschutzerklärung (1:1) |
| `styles.css` | Gemeinsames Stylesheet (Design-System) |
| `app.js` | Navigation, Animationen, Reservierungsformular, Cookie-Banner |
| `img/` | Logo + Fotos |

## Design

- **Stil:** dunkel, dramatisch, „Fine Dining" – Schwarz/Oliv mit Gold-Akzenten, edel & modern.
- **Typografie:** Playfair Display (Überschriften) + Karla (Text).
- **Logo:** echtes „Davids im Landhaus"-Logo, freigestellt (`img/logo-light.png` für dunkle Flächen).
- **Fotos:** echte Fotos des Restaurants (Gerichte, Ambiente, Catering, Koch, Auszeichnung),
  aus bereitgestelltem Bildmaterial ausgeschnitten und optimiert.
- **Animationen (cineastisch):** Foto-Hero mit Ken-Burns-Zoom + dunklem Verlauf, Parallax,
  Scroll-Fortschrittsbalken, mitschrumpfende Navbar, gestaffelte Reveals, Count-up-Zähler,
  Button-Sheen, Karten- & Galerie-Hover. Respektiert `prefers-reduced-motion`.
- **Cookies:** Consent-Banner (merkt die Auswahl); Footer-Link „Cookies" öffnet es erneut.

## Technik

- Reines HTML + CSS + Vanilla-JS, **kein Build-Schritt**.
- Responsiv (375 / 768 / 1024 / 1440 px), Fokus-Zustände, semantisches Markup, ausreichende Kontraste.
- Das Reservierungsformular erzeugt ohne Backend eine vorausgefüllte E-Mail (`mailto:`).

## Lokal testen

```bash
cd sites/davids
python3 -m http.server 8000
# http://localhost:8000 öffnen
```

## Vercel

Eigenes Projekt mit **Root Directory** `sites/davids`, Framework-Preset `Other`
(statisch, kein Build).

## Inhalte / Quellen

Texte, Speisekarte, Fotos sowie **Impressum und Datenschutzerklärung** wurden 1:1
aus dem vom Inhaber bereitgestellten Material bzw. von davids.nrw übernommen.

> **Wichtig:** Die übernommene Datenschutzerklärung nennt Dienste der Live-Seite
> (z. B. Google Analytics, Google Maps, YouTube, Borlabs Cookie, Cloudflare Turnstile,
> Hoster TJ Web GmbH). Diese statische Version nutzt diese Dienste nicht – die
> Datenschutzerklärung ist daher vor einer Veröffentlichung an die tatsächlich
> eingesetzten Dienste anzupassen.
