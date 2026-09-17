# ACF – Aachener Finanzmakler – Website

Mehrseitige statische Website für **ACF – Aachener Finanzmakler**, Krefelder Straße 109,
52070 Aachen (unabhängiger Versicherungs- und Finanzmakler). Neuentwurf als Ablösung der
bestehenden Seite `aachen-f.de`.

## Seiten

| Datei | Inhalt |
|-------|--------|
| `index.html` | Startseite – Hero mit Claim, Kennzahlen, Makler-vs.-Vertreter-Vergleich, Leistungen, Ablauf, Über-uns-Teaser, Kundenstimmen, FAQ, CTA |
| `privatkunden.html` | Absicherungs-Reihenfolge, 9 Leistungsbereiche, typische Lebenssituationen, Bestandscheck |
| `firmenkunden.html` | Risikoprofil-Vorgehen in 4 Schritten, 9 gewerbliche Deckungsbereiche, Branchen |
| `ueber-uns.html` | Haltung/Maklerstatus, Grundsätze, Ansprechpartner, Bürozeiten |
| `kontakt.html` | Kontaktformular, Kontaktdaten, Sprechzeiten, Anfahrt, Schadenmeldung |
| `impressum.html` | Impressum + Erstinformation nach § 15 VersVermV (**Entwurf**) |
| `datenschutz.html` | Datenschutzerklärung nach DSGVO (**Entwurf**) |
| `styles.css` | Gemeinsames Stylesheet (Design-System) |
| `app.js` | Navigation, Scroll-Reveals, Zähler, FAQ-Akkordeon, Formularvalidierung |
| `img/` | Platz für Logo und Fotos (derzeit leer) |

## Design

- **Stil:** „Trust & Authority" – seriös, ruhig, konversionsorientiert (Standard für Finanz-
  und Versicherungsdienstleister).
- **Farben:** Navy `#0F2940` als Basis, Gold `#B08333` als Akzent, Blau `#0B6BA8` für
  Aktionen, warmes Off-White `#F7F5F1` für ruhige Abschnitte.
- **Typografie:** Source Serif 4 (Überschriften) + IBM Plex Sans (Fließtext) über Google Fonts.
- **Bilder:** bewusst keine Stockfotos. Hero und Flächen arbeiten mit Verlauf und Raster.
  Sobald echte Fotos (Büro, Team) vorliegen, gehören sie nach `img/`.
- **Animation:** Scroll-Fortschritt, gestaffelte Reveals, Count-up-Zähler, Hover-Zustände.
  `prefers-reduced-motion` wird respektiert.

## Technik

- Reines HTML + CSS + Vanilla-JS, **kein Build-Schritt**.
- Responsiv geprüft bei 390 / 768 / 1024 / 1440 px, kein horizontales Scrollen.
- Semantisches Markup, sichtbare Fokus-Zustände, Kontraste ≥ 4.5:1, Skip-Link,
  Mobilmenü mit `aria-expanded` / `aria-hidden`.
- `LocalBusiness`-Schema (JSON-LD) auf der Startseite.
- Das Kontaktformular hat keine Serveranbindung: Es validiert clientseitig und erzeugt eine
  vorausgefüllte E-Mail (`mailto:`). Für echten Versand einen Endpoint in `app.js` eintragen
  (z. B. Vercel Serverless Function oder Formanbieter).
- Kartendienste werden nicht automatisch geladen („Route planen" öffnet Google Maps extern) –
  datenschutzfreundlich und ohne Consent-Banner-Pflicht.

## Inhalte / Quellen – bitte vor dem Livegang prüfen

Die bestehende Seite `aachen-f.de` war aus dieser Entwicklungsumgebung **nicht abrufbar**
(Netzwerk-Allowlist). Die Inhalte wurden daher aus öffentlich zugänglichen Quellen
(Branchenverzeichnisse, Suchergebnis-Snippets der alten Seite) rekonstruiert und
redaktionell neu geschrieben.

**Gesichert übernommen:**

- Firmierung „ACF – Aachener Finanzmakler", Inhaber Marco Kühn
- Anschrift Krefelder Straße 109, 52070 Aachen
- Claim „Wir arbeiten für Sie, nicht für eine Gesellschaft."
- Leistungsschwerpunkte: Finanzierung, Geldanlage, Altersvorsorge, Versicherungen
  (privat und gewerblich); gewerblich erst nach individuellem Risikoprofil vor Ort
- Struktur der alten Seite (Willkommen, Marco Kühn, Versicherung gewerblich, Kontakt,
  Vermittler-Erstinformation)

**Noch zu bestätigen bzw. zu ersetzen:**

| Stelle | Offen |
|--------|-------|
| Telefonnummer | Verzeichnisse nennen 0241 99009920, 0241 997899 und 0241 99008821 – verwendet wird aktuell **0241 99 00 99 20** |
| E-Mail | `info@aachen-f.de` ist angenommen, nicht belegt |
| Öffnungszeiten | Aktuell Mo/Di/Do/Fr 8–20, Mi 8–17 Uhr (eine Quelle nennt 9–18 Uhr) |
| Kennzahlen | „25+ Jahre", „100+ Gesellschaften", „1.500+ Verträge" sind Platzhalter |
| Kundenstimmen | **Platzhalter.** Erfundene Bewertungen sind wettbewerbsrechtlich unzulässig – vor Livegang durch echte, freigegebene Zitate ersetzen oder Abschnitt entfernen |
| Impressum | Registernummer, zuständige IHK, USt-IdNr., Rechtsform, Beteiligungsangaben |
| Datenschutz | An tatsächliches Hosting, Formularversand und Schriftarten anpassen, juristisch prüfen |
| Team | Nur Marco Kühn genannt; weitere Mitarbeitende und Fotos ergänzen |
| Google Fonts | Für maximale DSGVO-Sicherheit lokal einbinden (dann Abschnitt 5 der Datenschutzerklärung streichen) |

## Lokal testen

```bash
cd sites/aachener-finanzmakler
python3 -m http.server 8000
# http://localhost:8000 öffnen
```

## Vercel

Eigenes Projekt mit **Root Directory** `sites/aachener-finanzmakler`,
Framework-Preset `Other` (statisch, kein Build).
