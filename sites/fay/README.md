# Fay Café – Website

Mehrseitige, statische und stark animierte („cineastische") Website für das
**Fay Café** in Düsseldorf – Specialty Coffee, Matcha, hausgemachte Kuchen & Brunch,
Wagnerstraße 9 (direkt am Schadow-Karree).

## Seiten

| Datei | Inhalt |
|-------|--------|
| `index.html` | Startseite – animierter Hero, Marquee, Konzept, Highlights, Zahlen, Karten-Teaser, Galerie, Reviews, Öffnungszeiten + Karte, CTA |
| `speisekarte.html` | Vollständige Karte: Kaffee, Matcha & Specials, Iced, Kuchen, Brunch |
| `ueber-uns.html` | Geschichte, Werte, Ambiente, Lage |
| `kontakt.html` | Kontaktdaten, Öffnungszeiten, Anfahrt, Anfrageformular (mailto) |
| `impressum.html` | Impressum (Platzhalter – Betreiberdaten ergänzen) |
| `datenschutz.html` | Datenschutzerklärung (an tatsächliche Dienste anpassen) |
| `styles.css` | Design-System |
| `app.js` | Preloader, Navigation, Reveals, Parallax, Count-ups, Formular, Cookie-Banner |
| `img/` | Platz für echte Fotos |

## Design

- **Stil:** warm, editorial, cineastisch – Espresso-Braun + Blush-Rosé + Creme, Matcha-Grün als Akzent.
- **Typografie:** Fraunces (Display), Cormorant Garamond (Kursiv-Akzente), Jost (Text) – via Google Fonts.
- **Claim:** „Kaffee, Brunch, Matcha, Kuchen und Liebe." (eigener Slogan des Cafés).
- **Animationen:** Preloader mit Tassen-Dampf, Hero mit Gradient-Pan + schwebenden Blobs + Latte-Steam,
  Text-Zeilen-Reveal, Laufband (Marquee), gestaffelte Scroll-Reveals, Parallax, mitschrumpfende Navbar,
  Scroll-Fortschritt, Count-up-Zähler, Karten-Tilt, Hover-Sheen, heute-hervorgehobene Öffnungszeiten,
  pulsierender Karten-Pin. Respektiert `prefers-reduced-motion`.
- **Bilder:** Aktuell reine CSS/SVG-Kunst als Platzhalter (Tassen, Gradient-Kacheln), damit die Seite
  ohne externe Assets funktioniert. Die Platzhalter sind so aufgebaut, dass echte Fotos 1:1 eingesetzt
  werden können.

## Verifizierte Daten (Quelle: öffentliche Web-/Google-Maps-Angaben)

- **Name:** Fay Café
- **Adresse:** Wagnerstraße 9, 40212 Düsseldorf (am Schadow-Karree / Kö-Bogen)
- **Telefon:** +49 1573 8282017
- **Instagram:** @faycafetime · **Web:** faycafe.de
- **Öffnungszeiten:** Mo 08:00–16:30 · Di–Fr 08:00–20:00 · Sa 08:00–16:30 · So 08:30–15:00
- **Angebot:** Espresso/Cappuccino/Flat White/Cortado/Latte, Matcha, Iced Coffee (2-für-1),
  hausgemachte & vegane Kuchen (Carrot Cake, Chai-Cheesecake, Oreo/Blueberry), Brunch.

> **Vor Livegang bitte final abgleichen:** Preise auf der Karte, exakte Öffnungszeiten,
> Impressums- und Datenschutzangaben. Diese wurden aus öffentlich verfügbaren Quellen
> zusammengetragen und sollten mit dem Café bestätigt werden.

## Echte Fotos einsetzen

Die Session-Firewall blockt Google-Maps-/Instagram-Bildhosts – Fotos konnten nicht automatisch
geladen werden. So werden sie ergänzt:

1. Fotos (für die eine Nutzungserlaubnis vorliegt) in `sites/fay/img/` ablegen.
2. Im HTML den jeweiligen `art-panel`/`tile`/Hero-Block gegen ein `<img>` bzw. eine
   `background-image` tauschen (die Slots sind kommentierbar markiert bzw. eindeutig benannt).

## Lokal testen

```bash
cd sites/fay
python3 -m http.server 8000
# http://localhost:8000
```

## Vercel

Eigenes Projekt mit **Root Directory** `sites/fay`, Framework-Preset `Other` (statisch, kein Build).
