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
| `img/` | Fotos der Werkstatt (Herkunft siehe unten) |

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
- **Fotos:** echtes Werkstattfoto hinter dem Hero (abgedunkelt, Ken-Burns-Zoom),
  Bildflächen auf Start-, Werkstatt- und Kontaktseite, Galerie auf `werkstatt.html`,
  auf der Leistungsseite Fotos als Textur hinter den Icon-Plaketten.
- `prefers-reduced-motion` wird respektiert – Inhalte sind dann sofort sichtbar.

## Mobil

- Feste **Aktionsleiste am unteren Rand** („Anrufen“ / „Termin anfragen“). Sie
  erscheint erst, wenn die Hero-Buttons weggescrollt sind, und blendet sich am
  Seitenende wieder aus, damit sie den Footer nicht verdeckt. Berücksichtigt
  `env(safe-area-inset-bottom)` für iPhones mit Home-Indicator.
- Navigation ab 980 px als Vollbild-Overlay (vorher wurde es zwischen 861 und
  980 px zu eng).
- Buttons über die volle Breite, Tap-Targets ≥ 32 px, kein blauer Antipp-Blitz.
- Kennzahlen im Hero untereinander, Galerie einspaltig, Wasserfall einspaltig.
- Geprüft auf 1440 / 1200 / 1024 / 900 / 768 / 430 / 390 / 360 / 320 px –
  auf keiner Breite horizontales Scrollen.

## Technik

- Reines HTML + CSS + Vanilla-JS, **kein Build-Schritt**.
- Keine JS-Fehler, keine toten internen Links, alle Bilder laden.
- Bilder mit `width`/`height` und `loading="lazy"` (Hero mit `fetchpriority="high"`),
  Gesamtgröße der Fotos rund 690 kB.
- Öffnungszeiten heben den heutigen Tag hervor; „Jetzt geöffnet / Öffnet um …“
  wird live aus der Uhrzeit berechnet.
- Das Terminformular sendet **nichts an einen Server**, sondern öffnet eine
  vorausgefüllte E-Mail (`mailto:`).

## Datenquellen

Adresse, Telefonnummer, Öffnungszeiten, die 14 Leistungen, Bewertung (4,9 bei 142
Rezensionen), Barrierefreiheit und Zahlungsarten stammen aus dem
Google-Unternehmensprofil (vom Inhaber per Screenshot bereitgestellt).

### Fotos

Die Bilder in `img/` wurden aus den Screenshots des Google-Unternehmensprofils
freigestellt (Uploads des Inhabers, „Dariusz Filius“). Zwei Hinweise dazu:

- **Ein Pin-up-Poster an der Werkstattwand wurde weggeschnitten.** Es war auf
  zwei Aufnahmen zu sehen und ist auf einer Firmenwebsite fehl am Platz.
  Betroffen ist `rampe.jpg` (linke Bildhälfte entfernt); die zweite Aufnahme
  mit dem Poster wird gar nicht verwendet.
- **Das Street-View-Bild des Eingangs wurde bewusst nicht übernommen** – das ist
  Bildmaterial von Google, nicht des Betriebs.

Weil die Bilder aus Screenshots stammen, ist ihre Auflösung begrenzt
(`hero.jpg` 1179 px breit, die übrigen 370–1000 px). Originaldateien vom Inhaber
würden die Seite sichtbar schärfer machen – siehe Punkt 5 unten.

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
5. **Fotos in Originalauflösung nachliefern** – die aktuellen Bilder sind aus
   Screenshots freigestellt und entsprechend begrenzt aufgelöst. Die Originale
   (und zusätzliche Aufnahmen von Team und Arbeitsplätzen) einfach in `img/`
   unter den gleichen Dateinamen ablegen, dann greift alles automatisch.
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
