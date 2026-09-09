# B2B Hypo Service GmbH – Website

Statische, mehrseitige Website für die **B2B Hypo Service GmbH** – einen B2B-Dienstleister
rund um die Immobilienfinanzierung (Backoffice, Unterlagenprüfung, Bankenplatzierung,
Prolongation) für Vermittler, Makler, Bauträger und Institute.

## Seiten

| Datei | Inhalt |
|-------|--------|
| `index.html` | **Startseite** – Hero mit animiertem Farbverlauf, Leistungs-Teaser, Kennzahlen, Diagramm, Ablauf-Teaser, Stimmen, FAQ, CTA |
| `leistungen.html` | **Unterseite 1** – sechs Leistungsbereiche im Detail, drei Kooperationsmodelle, Balkendiagramm der Aktenarten, Zielgruppen |
| `ablauf.html` | **Unterseite 2** – Prozess in sechs Schritten (Scroll-Timeline), Reaktionszeiten, benötigte Unterlagen, Datenschutz, FAQ |
| `ueber-uns.html` | **Unterseite 3** – Entstehung, vier Grundsätze, Team (Platzhalter), Arbeitsweise, Zitat |
| `partner.html` | **Unterseite 4** – Zielgruppen, Vergleich eigenes Personal vs. Auslagerung, Onboarding-Timeline, Partner-FAQ |
| `kontakt.html` | **Unterseite 5** – Anfrageformular (ohne Backend), Kontaktkacheln, Erreichbarkeit |
| `impressum.html` | Impressum – **Entwurf mit Platzhaltern** |
| `datenschutz.html` | Datenschutzerklärung – **Entwurf mit Platzhaltern** |
| `styles.css` | Gemeinsames Stylesheet (Design-System) |
| `app.js` | Navigation, Scroll-Animationen, Zähler, Timeline, Akkordeon, Formular, Cookie-Hinweis |
| `favicon.svg` | Logo-Signet als Favicon |

## Design

- **Stil:** dunkles Navy als Grundton, Elektroblau → Teal als Verlauf, Bernstein als Akzent.
  Sachlich und technisch – passend zu Finanzdienstleistung, aber nicht bieder.
- **Typografie:** Sora (Überschriften) + Inter (Text), via Google Fonts.
- **Ohne Fotos:** Es wurde bewusst komplett auf Bildmaterial verzichtet. Alle Grafiken sind
  CSS-Verläufe oder Inline-SVG (Logo, Icons, Diagramme, Dashboard-Karte). Dadurch lädt die
  Seite sehr schnell und bleibt bei jeder Auflösung scharf.

## Animationen

- Preloader mit sich zeichnendem Logo und Ladebalken
- Hero: drei driftende Farb-Blobs (Aurora-Effekt), Raster mit Parallax, Wort-Rotator
  („Backoffice / Netzwerk / Tempo"), schwebende Dashboard-Karte mit gestaffelt einlaufenden
  Zeilen und wachsendem Fortschrittsbalken
- Scroll-Fortschrittsbalken oben, mitschrumpfende Navigation
- Gestaffelte Reveal-Animationen (`data-reveal` + `data-delay`) per IntersectionObserver
- Count-up-Zähler für alle Kennzahlen
- SVG-Diagramme, die sich beim Scrollen zeichnen (Linien) bzw. aufbauen (Balken)
- Prozess-Timeline, deren Linie sich mit dem Scrollfortschritt füllt und Schritte aktiviert
- Karten mit Maus-folgendem Glow und rotierendem Icon beim Hover
- Endlos-Laufband der Leistungen (pausiert beim Hover)
- Button-Sheen, animiertes CTA-Band, Akkordeon, Fullscreen-Menü mit gestaffelten Links
- **`prefers-reduced-motion` wird respektiert** – alle Animationen werden dann abgeschaltet
  und Endzustände direkt gesetzt.

## Technik

- Reines HTML + CSS + Vanilla-JS, **kein Build-Schritt**, keine Abhängigkeiten.
- Responsiv (390 / 768 / 1024 / 1440 px), kein horizontaler Überlauf.
- Semantisches Markup, Skip-Link, Fokus-Zustände, `aria`-Attribute an Menü, Akkordeon und Dialog.
- Ohne JavaScript bleibt die Seite vollständig lesbar und bedienbar.
- Das Kontaktformular arbeitet ohne Server: Beim Absenden wird eine vorausgefüllte
  E-Mail (`mailto:`) geöffnet. Für ein echtes Formular wäre ein Backend oder ein
  Formulardienst nötig.

## Vor der Veröffentlichung ausfüllen

Alle noch offenen Angaben sind im Markup mit der CSS-Klasse `ph` ausgezeichnet und
erscheinen im Browser gelb hinterlegt. So findet man sie sofort:

```bash
grep -rn 'class="ph"' *.html
```

Konkret zu ersetzen:

- **Kontaktdaten:** Telefonnummer, Straße, PLZ/Ort (Footer, `kontakt.html`)
- **Impressum:** Geschäftsführung, Registergericht, Registernummer, USt-IdNr.,
  ggf. Erlaubnis nach § 34c/§ 34i GewO, Aufsichtsbehörde, inhaltlich Verantwortliche:r
- **Datenschutz:** Hoster, ggf. Datenschutzbeauftragte:r, zuständige Aufsichtsbehörde;
  Abschnitt zu Google Fonts streichen, falls die Schriften lokal ausgeliefert werden
- **Kennzahlen:** Die Zahlen auf Startseite, Ablauf- und Partnerseite sind plausible
  Richtwerte, aber **nicht belegt** – vor der Veröffentlichung durch echte Werte ersetzen
  oder entfernen
- **Team & Zitate:** Namen, Funktionen und Partnerstimmen auf `ueber-uns.html` und `index.html`
- **E-Mail-Adresse:** Überall ist `info@b2b-hypo-service.de` hinterlegt – ggf. anpassen
  (`app.js`, Attribut `data-mailto` in `kontakt.html`)

> **Wichtig:** Impressum und Datenschutzerklärung sind Entwürfe und ersetzen keine
> Rechtsberatung. Beide Texte vor dem Livegang juristisch prüfen lassen – besonders,
> falls erlaubnispflichtige Tätigkeiten nach GewO ausgeübt werden.

## Screenshots

Aufnahmen aller Seiten sowie drei fertige Präsentationsbilder liegen unter
`screenshots/b2b-hypo-service/` (außerhalb von `sites/`, damit Vercel sie nicht
mit ausliefert). Details siehe `screenshots/b2b-hypo-service/README.md`.

## Lokal testen

```bash
cd sites/b2b-hypo-service
python3 -m http.server 8000
# http://localhost:8000 öffnen
```

## Vercel

Eigenes Vercel-Projekt mit **Root Directory** `sites/b2b-hypo-service`,
Framework-Preset `Other` (statisch, kein Build).
