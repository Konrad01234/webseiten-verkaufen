# FAIR konzept – Website

Mehrseitige statische Website für die **FAIR konzept unabhängige Finanzberatung GmbH**
in Aachen (unabhängige Finanz- und Versicherungsberatung, Schwerpunkt u. a. nachhaltige
Geldanlage).

## Seiten

| Datei | Inhalt |
|-------|--------|
| `index.html` | Startseite – Hero mit Chart, Leistungsübersicht, Unabhängigkeit, Ablauf, Nachhaltigkeits-Teaser, FAQ |
| `leistungen.html` | Sechs Leistungsblöcke: Altersvorsorge, Geldanlage, Baufinanzierung, Arbeitskraft, Versicherungen, Bausparen |
| `nachhaltigkeit.html` | Ausschluss- & Positivkriterien, Einordnung von ESG/Siegeln, FAQ |
| `ueber-uns.html` | Geschichte seit 1995, Grundsätze, Arbeitsweise, Region |
| `kontakt.html` | Kontaktdaten, Bürozeiten, Anfahrt, Terminanfrage-Formular |
| `impressum.html` | Impressum inkl. berufsrechtlicher Pflichtangaben (mit Platzhaltern) |
| `datenschutz.html` | Datenschutzerklärung, passend zur tatsächlich eingesetzten Technik |
| `styles.css` | Gemeinsames Stylesheet (Design-System) |
| `app.js` | Navigation, Reveals, Zähler, Akkordeon, Formular, Cookie-Hinweis |

## Design

- **Stil:** hell, klar, seriös – Tiefgrün (`#0e2b25` / `#1f6b57`) mit Salbei-Flächen und
  Sand-Akzent. Bewusst das Gegenteil des üblichen Finanzdienstleister-Blaus.
- **Typografie:** Fraunces (Überschriften) + Inter (Fließtext), via Google Fonts.
- **Bilder:** Es lag **kein Bildmaterial** vor. Alle Grafiken sind daher eigene Inline-SVGs
  (Chart, Piktogramme, Illustrationen) – dadurch keine Lizenzfragen, keine Ladezeiten und
  beliebig einfärbbar. Logo ist derzeit eine gesetzte Wortmarke mit Blatt-Signet.
- **Animationen:** gestaffelte Scroll-Reveals, Count-up-Zähler, gezeichnete Chart-Linie,
  mitschrumpfende Navigation, Scroll-Fortschrittsbalken, Button-Sheen, Karten-Hover.
  Respektiert `prefers-reduced-motion`.

## Technik

- Reines HTML + CSS + Vanilla-JS, **kein Build-Schritt**.
- Responsiv geprüft bei 390 / 620 / 900 / 1024 / 1440 px, kein horizontaler Überlauf.
- Semantisches Markup, Skip-Link, `aria-current`, Fokus-Zustände, Tastaturbedienung.
- Das Anfrageformular sendet **nichts an einen Server**: Es baut im Browser eine
  vorausgefüllte E-Mail (`mailto:`), die der Nutzer selbst absendet.
- Cookie-Hinweis speichert die Auswahl nur im `localStorage` – kein Tracking.

## Lokal testen

```bash
cd sites/fair-konzept
python3 -m http.server 8000
# http://localhost:8000 öffnen
```

## Vercel

Eigenes Projekt mit **Root Directory** `sites/fair-konzept`, Framework-Preset `Other`
(statisch, kein Build).

## Inhalte / Quellen

Die Firmendaten wurden aus öffentlich zugänglichen Quellen recherchiert
(Handelsregister/Northdata, Branchenverzeichnisse):

- FAIR konzept unabhängige Finanzberatung GmbH, Wilhelmstraße 60, 52070 Aachen
- Telefon 0241 9494 20 · Amtsgericht Aachen, HRB 6322 · gegründet 1995
- Bürozeiten Mo–Fr 9:00–17:00 Uhr
- Geschäftszweck: Vermittlung von Versicherungen aller Art, Bausparverträgen,
  Immobilien und Kapitalanlagen

Die **Fließtexte sind neu geschrieben** und nicht von der bestehenden Seite übernommen.

> ### ⚠️ Vor der Veröffentlichung zu klären
>
> 1. **E-Mail-Adresse** `info@fairkonzept.de` ist angenommen, nicht bestätigt – prüfen.
> 2. **Geschäftsführer** (Handelsregister-Auszug nennt Martin Schwoll) bestätigen lassen.
> 3. **Impressum:** USt-IdNr., Erlaubnis nach § 34d bzw. § 34f GewO, Registrierungsnummer
>    im Vermittlerregister, zuständige IHK und die Angaben zu Beteiligungen ergänzen.
>    Alle offenen Stellen sind im Dokument mit *[bitte prüfen]* / *[bitte ergänzen]*
>    markiert und im Seitenkopf als Hinweisbox sichtbar.
> 4. **Datenschutz:** Hoster und Speicherdauer der Logfiles eintragen; falls ein echtes
>    Serverformular, Google Maps oder Web-Analyse ergänzt wird, den Text erweitern.
> 5. **Google Fonts** werden aktuell von Google-Servern geladen (IP-Übermittlung, im
>    Datenschutztext offengelegt). Sauberer: Schriften lokal ablegen und den
>    `@import` in `styles.css` durch `@font-face` ersetzen – dann entfällt Ziffer 5
>    der Datenschutzerklärung.
> 6. **Zahlen im Hero-Chart** sind bewusst schematisch und als solche beschriftet – das
>    sollte so bleiben, um keine Wertentwicklungsprognose zu suggerieren.
> 7. **Logo:** Sobald ein echtes Logo vorliegt, Wortmarke in Navigation und Footer ersetzen.
