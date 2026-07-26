# A + S Autoservice GmbH – Bonn

Statische Mehrseiten-Website für die **A + S Autoservice GmbH**, KFZ-Meisterbetrieb an der
Bornheimer Str. 139, 53119 Bonn. Reines HTML + CSS + Vanilla-JS, kein Build nötig.

## Seiten

| Datei              | Inhalt                                                             |
|--------------------|-------------------------------------------------------------------|
| `index.html`       | Startseite – Hero, Kennzahlen, Leistungs-Überblick, Ablauf, Bewertungen, CTA |
| `leistungen.html`  | Alle Leistungen im Detail (Inspektion, Reifen, Klima, Bremsen, Diagnose, …) |
| `ueber-uns.html`   | Über den Betrieb, Werte, Kennzahlen                               |
| `bewertungen.html` | Echte Google-Kundenstimmen                                        |
| `kontakt.html`     | Kontaktdaten, Öffnungszeiten, Karte, Terminanfrage-Formular       |
| `impressum.html`   | **Platzhalter** – rechtlich zu prüfen/ergänzen                    |
| `datenschutz.html` | **Platzhalter** – rechtlich zu prüfen/ergänzen                    |

## Design

- **Look:** industriell/technisch – Graphit-Dunkel + Signal-Orange, kühle Stahltöne
- **Typo:** Archivo (Headlines), Barlow (Fließtext)
- **Features:** Sticky-Nav, Fullscreen-Mobile-Menü, Scroll-Reveals, Zähl-Animationen,
  Cookie-Hinweis, Parallax-Hero, Öffnungszeiten-Heute-Hervorhebung, responsives Layout,
  `prefers-reduced-motion`-Support.
- Keine externen Foto-Assets nötig (Grafiken als Inline-SVG). Logo als SVG-Wappen im Header.

## Noch anzupassen (vor Live-Gang)

- **Impressum & Datenschutz:** mit `[…]` markierte Angaben durch geprüfte Daten ersetzen
  (Handelsregister, USt-IdNr., verantwortliche Person, Hoster).
- **E-Mail-Adresse:** `info@a-s-autoservice.de` ist eine Annahme – in `app.js`
  (`CONTACT_MAIL`) und allen `mailto:`-Links die reale Adresse eintragen.
- **Telefon/Adresse/Öffnungszeiten** stammen aus öffentlichen Verzeichnissen – bitte final prüfen.
- Optional: echte Werkstatt-/Team-Fotos in den `.frame`-Blöcken ergänzen
  (`<div class="frame has-photo"><img src="…"></div>`).

## Lokal testen

```bash
cd sites/a-plus-s-autoservice
python3 -m http.server 8000
# http://localhost:8000 öffnen
```

## Vercel

Neues Vercel-Projekt, **Root Directory** = `sites/a-plus-s-autoservice`,
Framework Preset **Other** (statisch, kein Build).
