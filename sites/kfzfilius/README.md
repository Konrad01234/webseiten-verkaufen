# KFZ-Service Filius – Website

Mehrseitige statische Website für die freie Kfz-Werkstatt **KFZ-Service Filius**
in Wuppertal-Elberfeld (Quellenstraße 36).

## Seiten

| Datei | Inhalt |
|-------|--------|
| `index.html` | Startseite – Hero mit Bewertungs-Widget, Leistungs-Laufband, 6 Leistungen, Rezensions-Wasserfall, Warum-wir, Ablauf, Zahlen, Öffnungszeiten, CTA |
| `leistungen.html` | Alle 14 Leistungen als Chips + 9 ausführliche Abschnitte + FAQ |
| `werkstatt.html` | Über den Betrieb, Zahlen, „Was Sie erwartet“, Wasserfall |
| `rezensionen.html` | Bewertungsverteilung, Wasserfall, alle Rezensionen als Raster |
| `kontakt.html` | Kontaktdaten, Öffnungszeiten, Terminanfrage-Formular, Anfahrt |
| `impressum.html` | Impressum – **Platzhalter, siehe unten** |
| `datenschutz.html` | Datenschutzerklärung – **Platzhalter, siehe unten** |
| `styles.css` | Gemeinsames Stylesheet (Design-System) |
| `app.js` | Navigation, Animationen, Wasserfall, Formular, Cookie-Hinweis |
| `reviews.js` | Rezensionsdaten – **enthält Platzhalter, siehe unten** |
| `favicon.svg` | Favicon |

## Design

- **Stil:** dunkel, cineastisch, SaaS-clean. Tiefes Petrol-Schwarz mit Teal-Verläufen,
  Glas-Karten, Leucht-Blobs, feines Raster im Hintergrund.
- **Farben:** aufgenommen aus dem Google-Unternehmensprofil (Petrol/Teal `#0f9d96`,
  `#19d3c6`, `#076c68`), Bewertungssterne in Amber.
- **Typografie:** Space Grotesk (Überschriften) + Inter (Text), via Google Fonts.
- **Animationen:** Preloader, zeilenweise einfahrende Headline, driftende Leucht-Blobs,
  Scroll-Fortschrittsbalken, mitschrumpfende Navbar, gestaffelte Scroll-Reveals,
  Count-up-Zähler, animierte Bewertungsbalken, Laufband, 3D-Tilt am Bewertungs-Widget,
  Karten-Spotlight unter dem Mauszeiger, FAQ-Accordion, Button-Sheen.
- **Rezensions-Wasserfall:** drei Spalten, abwechselnd auf-/abwärts, endlos, weich
  ein-/ausgeblendet. Hält beim Überfahren mit der Maus an. Auf Tablet zwei, auf
  Handy eine Spalte.
- `prefers-reduced-motion` wird respektiert – Inhalte sind dann sofort sichtbar.

## Technik

- Reines HTML + CSS + Vanilla-JS, **kein Build-Schritt**.
- Geprüft auf 1440 / 1024 / 900 / 768 / 390 px – kein horizontales Scrollen,
  keine JS-Fehler, keine toten internen Links.
- Öffnungszeiten heben den heutigen Tag hervor; „Jetzt geöffnet / Öffnet um …“
  wird live aus der Uhrzeit berechnet.
- Das Terminformular sendet **nichts an einen Server**, sondern öffnet eine
  vorausgefüllte E-Mail (`mailto:`).

## Datenquellen

Adresse, Telefonnummer, Öffnungszeiten, die 14 Leistungen, Bewertung (4,9 bei 142
Rezensionen), Barrierefreiheit und Zahlungsarten stammen aus dem
Google-Unternehmensprofil (vom Inhaber per Screenshot bereitgestellt).

## ⚠️ Vor dem Livegang zu erledigen

1. **Rezensionen ersetzen** – `reviews.js` enthält zwei echte Google-Rezensionen
   (`quelle: "google"`) und **18 Platzhalter-Texte** (`quelle: "platzhalter"`),
   damit der Wasserfall gefüllt wirkt. Diese Platzhalter sind **keine echten
   Kundenstimmen** und müssen durch echte Google-Rezensionen ersetzt oder
   gelöscht werden.
2. **Impressum vervollständigen** – Rechtsform, vertretungsberechtigte Person,
   USt-IdNr., zuständige Handwerkskammer, Berufsbezeichnung und E-Mail-Adresse
   fehlen (mit `[…]` markiert). Ein unvollständiges Impressum ist abmahnfähig.
3. **Datenschutzerklärung prüfen** – Verantwortlicher, E-Mail und Hosting-Anbieter
   ergänzen. Der Text beschreibt den aktuellen Stand (kein Tracking, keine
   eingebettete Karte) und muss angepasst werden, wenn sich das ändert.
4. **E-Mail-Adresse eintragen** – aktuell `info@kfz-service-filius.de` als
   Platzhalter im Attribut `data-mailto` des Formulars in `kontakt.html`.
5. **Fotos ergänzen** – es lag kein Bildmaterial der Werkstatt vor. Die
   Bildflächen (`.split-visual`) zeigen derzeit Icons. Echte Fotos von Halle,
   Team und Fahrzeugen würden die Seite deutlich aufwerten.
6. Optional: Google Fonts lokal einbinden, dann entfällt der externe Aufruf und
   der entsprechende Abschnitt der Datenschutzerklärung.

## Lokal testen

```bash
cd sites/kfzfilius
python3 -m http.server 8000
# http://localhost:8000 öffnen
```

## Vercel

Eigenes Projekt mit **Root Directory** `sites/kfzfilius`, Framework-Preset `Other`
(statisch, kein Build).
