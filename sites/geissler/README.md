# Geißler Heizungstechnik – Bochum

Demo-/Verkaufswebseite im modernen SaaS-Look für die Firma **Wolfgang Geißler**
(Heizungstechnik, Markstraße 413, 44795 Bochum · ☎ 0234 460852).

Statisches HTML + CSS + JS, kein Build-Schritt nötig.

## Inhalt

| Datei              | Zweck                                        |
| ------------------ | -------------------------------------------- |
| `index.html`       | One-Pager (Hero, Leistungen, Über uns, Stats, Ablauf, Bewertungen, FAQ, Kontakt) |
| `impressum.html`   | Impressum (Platzhalter)                      |
| `datenschutz.html` | Datenschutzerklärung (Entwurf/Platzhalter)   |
| `styles.css`       | Design (Navy + Orange, SaaS-Style)           |
| `app.js`           | Mobile-Nav, Scroll-Reveal, Demo-Formular     |

## Echte Daten (aus Google Maps übernommen)

- Adresse: Markstraße 413, 44795 Bochum
- Telefon: 0234 460852
- Google-Bewertung: 5,0 ★ (10 Rezensionen) – zwei echte Rezensionen als Kundenstimmen eingebaut
- Leistungen laut Google: Installation/Reparatur von Heizsystemen und Thermostaten

## Vor dem Livegang ersetzen (alle mit `[Platzhalter…]` markiert)

- [ ] E-Mail-Adresse (Kontakt, Footer, Impressum, Datenschutz)
- [ ] Öffnungszeiten (Topbar + Kontakt)
- [ ] Jahre Erfahrung / Projektanzahl (Hero + Stats)
- [ ] Firmengeschichte im Abschnitt „Über uns"
- [ ] Impressum vollständig ausfüllen (Firmierung, Inhaber, USt-ID, Kammer)
- [ ] Datenschutzerklärung rechtlich prüfen lassen
- [ ] Kontaktformular an Versand anbinden (z. B. Formspree oder Vercel Function)
- [ ] Illustrationen (`img/*.svg`) bei Bedarf durch echte Fotos des Betriebs ersetzen

## Bilder & Karte

Alle Grafiken liegen lokal: das animierte Hero-Thermostat (dreht beim Laden
auf 21,5° hoch) direkt als Inline-SVG in `index.html`, weitere Illustrationen
(Heizkörper-Szene, Gastherme, Lageplan) in `img/`. Die Seite lädt dadurch
**keinerlei Inhalte von Drittservern** – sie funktioniert offline, in jeder
Vorschau und ohne Datenschutz-Fallstricke. Die Karte verlinkt per Klick auf
Google Maps (Routenplanung).

## Vorschau

`preview.html` ist eine generierte Ein-Datei-Vorschau (CSS/JS/Grafiken
eingebettet, Impressum/Datenschutz integriert). Einfach im Browser öffnen –
funktioniert komplett offline.

## Lokal testen

```bash
cd sites/geissler
python3 -m http.server 8000
# http://localhost:8000 öffnen
```
