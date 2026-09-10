# Bankshop Broderstorf – Website

Mehrseitige statische Website für den **Bankshop in Broderstorf bei Rostock**
(Am Handelspark 4, 18184 Broderstorf) – unabhängige Bau- und Immobilienfinanzierung.

## Seiten

| Datei | Inhalt |
|-------|--------|
| `index.html` | Startseite – Hero, Kennzahlen, Leistungen, Finanzierungsrechner, Ablauf, Bewertungen, FAQ |
| `leistungen.html` | Baufinanzierung, Anschlussfinanzierung, Forwarddarlehen, Kapitalanlage, Modernisierung, Bankdienstleistungen, Umschuldung |
| `rechner.html` | Finanzierungsrechner mit Erklärungen, Kaufnebenkosten-Übersicht M-V, Begriffsglossar |
| `ueber-uns.html` | Haltung, Kennzahlen, Ansprechpartner, Netzwerk, Bewertungen |
| `kontakt.html` | Anfrageformular, Telefon/E-Mail, Öffnungszeiten, Anfahrt |
| `impressum.html` | Impressum (**Entwurf – vor Livegang prüfen**) |
| `datenschutz.html` | Datenschutzerklärung (**Entwurf – vor Livegang prüfen**) |
| `styles.css` | Gemeinsames Stylesheet (Design-System) |
| `app.js` | Navigation, Reveal-Animationen, Zähler, Finanzierungsrechner, Formular, Cookie-Hinweis |
| `robots.txt` | Indexierung erlaubt |

## Design

- **Stil:** dunkles Marineblau (`#07182a`) mit Gold-Akzent (`#e3b465`), warmes Creme als Fläche –
  seriös wie eine Bank, aber wärmer und moderner.
- **Typografie:** Fraunces (Überschriften, Serif) + Inter (Fließtext).
- **Logo:** eigens gezeichnetes SVG-Hausmotiv, kein Bitmap nötig, skaliert verlustfrei.
- **Bilder:** bewusst keine Stockfotos. Alle Grafiken sind Inline-SVG (Hausumriss,
  Anfahrtsskizze, Icons). `img/` liegt leer bereit – sobald echte Fotos vom Büro, vom Team
  oder von Referenzobjekten vorliegen, können sie im Hero und auf „Über uns“ ergänzt werden.
- **Animationen:** Gradient-Drift im Hero, Linienzeichnung des Hausmotivs, Reveal beim Scrollen,
  Count-up der Kennzahlen, Lesefortschrittsbalken, Button-Sheen. Respektiert `prefers-reduced-motion`.
- **Mobil:** fixierte Call-Leiste (Anrufen / Termin), Fullscreen-Navigation, alles ab 375 px getestet.

## Finanzierungsrechner

Annuitätenrechner in Vanilla-JS (`app.js`, Abschnitt „Baufinanzierungs-Rechner“):

- Eingaben: Kaufpreis, Kaufnebenkosten (%), Eigenkapital, Sollzins, anfängliche Tilgung, Zinsbindung
- Ausgaben: Monatsrate, Darlehenssumme, Gesamtkosten, Beleihungsquote, Restschuld nach
  Zinsbindung, Zinssumme bis zur Volltilgung, Gesamtlaufzeit, SVG-Restschuldkurve
- Rechenweg: `Rate = Darlehen × (Sollzins + Tilgung) / 12`, danach monatsweise Tilgungsrechnung
- Plausibilitätshinweise, z. B. wenn die Rate die Zinsen nicht deckt oder die Nebenkosten
  nicht durch Eigenkapital gedeckt sind
- Button „Angebot anfordern“ erzeugt eine vorausgefüllte E-Mail mit allen Werten

Der Rechner ist ausdrücklich als unverbindliche Beispielrechnung gekennzeichnet
(kein Angebot i. S. d. § 491 BGB).

## Technik

- Reines HTML + CSS + Vanilla-JS, **kein Build-Schritt**, keine Abhängigkeiten.
- Responsiv (375 / 768 / 1024 / 1440 px), semantisches Markup, sichtbare Fokus-Zustände,
  `aria`-Attribute für Navigation, Dialoge und Statusmeldungen.
- Formulare arbeiten ohne Backend: sie öffnen das E-Mail-Programm mit vorausgefüllter Nachricht.
  Es werden keine Daten übertragen oder gespeichert.
- Keine eingebettete Karte – die Anfahrt ist als SVG-Skizze plus Link zu Google Maps gelöst,
  damit ohne Klick keine Daten an Dritte gehen.
- `index.html` enthält strukturierte Daten (`schema.org/FinancialService`) für die lokale Suche.

## Vor dem Livegang zu klären

1. **Impressum und Datenschutz sind Entwürfe.** Beide Seiten enthalten oben einen gelb
   hinterlegten Hinweisblock mit den offenen Punkten (Rechtsform, vollständiger Firmenname,
   USt-IdNr., Erlaubnisbehörde, Berufshaftpflicht, Hoster). Der Hinweisblock ist zu entfernen,
   die Angaben sind zu ergänzen und juristisch zu prüfen.
2. **Firmierung.** Am Standort Am Handelspark 4 sind mehrere Einträge zu finden
   („Bankshop Nord“ / Surab Krieg sowie „Andreas Kaatz Bankshop Rostock“). Die Seite tritt
   neutral als „Bankshop Broderstorf“ auf und nennt beide Ansprechpartner. Wie die Seite
   tatsächlich firmieren soll, entscheidet der Betreiber.
3. **Google Fonts** werden derzeit von Google geladen (in `styles.css`, Zeile 6). Für die
   datenschutzfreundlichste Variante sollten die beiden Schriften lokal in `fonts/` abgelegt
   und per `@font-face` eingebunden werden; dann entfällt der Abschnitt „Google Fonts“ in der
   Datenschutzerklärung.
4. **Kontaktformular.** Der `mailto:`-Weg funktioniert überall, ist aber unelegant. Alternativ
   ein Formular-Backend (z. B. Vercel Function oder Formspree) einbinden – dann muss die
   Datenschutzerklärung entsprechend ergänzt werden.
5. **Zahlen prüfen:** „über 750 Banken“, „über 15 Jahre Erfahrung“, „5,00 bei ProvenExpert
   (17 Bewertungen)“ und „Angebot in 48 Stunden“ stammen aus den unten genannten Quellen.
   Bewertungszahlen ändern sich – vor Veröffentlichung aktualisieren.
6. **Fotos.** Ein echtes Teamfoto und ein Foto des Büros würden die Seite deutlich aufwerten;
   die Platzhalter sind so gebaut, dass Fotos ohne Layout-Umbau eingesetzt werden können.

## Inhalte / Quellen

Alle Fakten wurden aus öffentlich zugänglichen Quellen recherchiert:

- Öffnungszeiten, Telefon, E-Mail: Branchenverzeichnisse (Das Örtliche, golocal, Stadtbranchenbuch)
- Leistungsspektrum, „über 750 Banken“, „über 15 Jahre Erfahrung“, bundesweite Beratung: bankshop-nord.de
- Bewertungen (5,00 / 5, 17 Bewertungen, 100 % Weiterempfehlung, Top-Kompetenzen): ProvenExpert
- Vermittlerregister-Nummer D-W-184-TCD9-13, § 34i GewO: Creditreform-Firmenauskunft
- Netzwerk CEB Bankshop AG (Leipzig): bankshop.de

Die Werbetexte sind neu geschrieben und nicht von anderen Seiten übernommen. **Es wurden keine
Kundenzitate erfunden** – dargestellt sind nur die aggregierten Bewertungswerte.

## Lokal testen

```bash
cd sites/bankshop
python3 -m http.server 8000
# http://localhost:8000 öffnen
```

## Vercel

Eigenes Projekt mit **Root Directory** `sites/bankshop`, Framework-Preset `Other`
(statisch, kein Build).
