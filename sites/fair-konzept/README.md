# FAIR konzept – Website

Mehrseitige statische Website für die **FAIR konzept unabhängige Finanzberatung GmbH**
in Aachen (mit zweitem Standort in Krefeld). **Schwerpunkt der Seite: Baufinanzierung.**

## Seiten

| Datei | Inhalt |
|-------|--------|
| `index.html` | Startseite – Hero zur Baufinanzierung, Leistungsübersicht, Unabhängigkeit, Ablauf, Nachhaltigkeits-Teaser, FAQ |
| `baufinanzierung.html` | **Kernseite:** Beratungsansatz, „Das Objekt" (Lage, Beleihungswert, Wiederverkauf), Flexibilität/Sondertilgung, Anschlussfinanzierung, Modernisierung, Ablauf, Absicherung, FAQ |
| `leistungen.html` | Altersvorsorge, Geldanlage, Baufinanzierung (Verweis), Arbeitskraft, Versicherungen, Bausparen |
| `nachhaltigkeit.html` | Ausschluss- & Positivkriterien, Einordnung von ESG/Siegeln, FAQ |
| `ueber-uns.html` | Geschichte seit 1995, Grundsätze, Arbeitsweise, beide Standorte |
| `kontakt.html` | Beide Standorte, Bürozeiten, Anfahrt, Terminanfrage mit Standortwahl |
| `impressum.html` | Impressum inkl. berufsrechtlicher Pflichtangaben (mit Platzhaltern) |
| `datenschutz.html` | Datenschutzerklärung, passend zur tatsächlich eingesetzten Technik |
| `styles.css` | Gemeinsames Stylesheet (Design-System) |
| `app.js` | Navigation, Reveals, Zähler, Akkordeon, Formular, Cookie-Hinweis |
| `vorschau.html` | **Eigenständige Vorschau:** alle 8 Seiten, CSS und JS in einer einzigen Datei, Navigation clientseitig. Zum Teilen ohne Deployment. |

## Design

- **Stil:** hell, klar, seriös – Tiefgrün (`#0e2b25` / `#1f6b57`) mit Salbei-Flächen und
  Sand-Akzent. Bewusst das Gegenteil des üblichen Finanzdienstleister-Blaus.
- **Typografie:** Fraunces (Überschriften) + Inter (Fließtext), via Google Fonts.
- **Bilder:** Es lag **kein Bildmaterial** vor. Alle Grafiken sind eigene Inline-SVGs
  (Restschuld-Chart, Piktogramme, Illustrationen) – keine Lizenzfragen, keine Ladezeiten,
  beliebig einfärbbar. Logo ist derzeit eine gesetzte Wortmarke mit Blatt-Signet.
- **Animationen:** gestaffelte Scroll-Reveals, Count-up-Zähler, gezeichnete Chart-Linie,
  mitschrumpfende Navigation, Scroll-Fortschrittsbalken, Button-Sheen, Karten-Hover.
  Respektiert `prefers-reduced-motion`.

## Technik

- Reines HTML + CSS + Vanilla-JS, **kein Build-Schritt**.
- Responsiv geprüft bei 375 / 620 / 900 / 1024 / 1280 / 1440 px: kein horizontaler
  Überlauf, keine Kollision in der (sechsteiligen) Navigation, keine JS-Fehler.
- Semantisches Markup, Skip-Link, `aria-current`, Fokus-Zustände, Tastaturbedienung.
- Das Anfrageformular sendet **nichts an einen Server**: Es baut im Browser eine
  vorausgefüllte E-Mail (`mailto:`), die der Nutzer selbst absendet.
- Cookie-Hinweis speichert die Auswahl nur im `localStorage` – kein Tracking.

## Vorschau ohne Deployment

`vorschau.html` enthält die komplette Website in einer Datei – nichts wird nachgeladen
(einzige Ausnahme: Google Fonts, siehe unten). Damit lässt sie sich über einen
HTML-Proxy direkt aus GitHub anzeigen:

```
https://htmlpreview.github.io/?https://github.com/Konrad01234/webseiten-verkaufen/blob/claude/fair-konzept-website-5dlek8/sites/fair-konzept/vorschau.html
```

Neu erzeugen lässt sie sich aus den Einzelseiten; sie ist eine generierte Datei und
sollte nach inhaltlichen Änderungen an den Seiten neu gebaut werden.

> **Warum nicht GitHub Pages?** Pages ist in diesem Repo nicht aktiviert; alle bisherigen
> Pages-Workflow-Läufe sind mit „Resource not accessible by integration" gescheitert, weil
> das Actions-Token keine Pages-Site anlegen darf. Das lässt sich nur einmalig manuell
> lösen: Repo → Settings → Pages → Source auf „GitHub Actions" stellen.

## Lokal testen

```bash
cd sites/fair-konzept
python3 -m http.server 8000
# http://localhost:8000 öffnen
```

## Vercel

Eigenes Projekt mit **Root Directory** `sites/fair-konzept`, Framework-Preset `Other`
(statisch, kein Build).

## Recherche: Quellenlage

> **Wichtig:** `fairkonzept.de` selbst ist über das Netzwerk dieser Arbeitsumgebung
> **nicht abrufbar** (Egress-Policy blockiert die Domain). Alle Angaben stammen daher aus
> Handelsregister-Auswertungen, Branchenverzeichnissen und Suchmaschinen-Snippets der
> Originalseite. Vor der Veröffentlichung sollte jemand mit Zugriff die Seite gegenlesen.

### Gesicherte Unternehmensdaten

| Feld | Wert | Quelle |
|------|------|--------|
| Firma | FAIR konzept unabhängige Finanzberatung GmbH | Handelsregister |
| Register | HRB 6322, Amtsgericht Aachen | Handelsregister |
| Gegründet | 1995 | Handelsregister |
| Geschäftsführer | Martin Schwoll | Handelsregister / Northdata |
| **Anschrift Aachen** | **Wilhelmstraße 107, 52070 Aachen** | HR-Änderung vom 19.01.2026 |
| Telefon Aachen | 0241 9494 20 | Branchenverzeichnisse |
| Standort Krefeld | Von-Beckerath-Platz 7, 47799 Krefeld | Branchenverzeichnisse |
| Telefon Krefeld | 02151 97 88 44 | Branchenverzeichnisse |
| Bürozeiten | Mo–Fr 9:00–17:00 Uhr | Branchenverzeichnisse |
| Geschäftszweck | Vermittlung von Versicherungen aller Art, Bausparverträgen, Immobilien und Kapitalanlagen | Handelsregister |

⚠️ **Adressänderung beachten:** Viele Verzeichnisse (Gelbe Seiten, 11880, golocal, WhoFinance)
führen noch die alte Anschrift **Wilhelmstraße 60**. Maßgeblich ist die Handelsregister-Änderung
vom 19.01.2026 auf **Wilhelmstraße 107**. Die Seite verwendet 107; im Impressum steht ein
entsprechender Hinweis.

### Inhaltliche Positionierung (aus Snippets der Originalseite)

Diese Aussagen stammen erkennbar von `fairkonzept.de` und sind in die Texte eingeflossen:

- Baufinanzierung erfordert „große Offenheit und Vertraulichkeit in der Beratung" sowie
  „flexible und individuell zugeschnittene Modelle".
- Finanzieren, ohne sich „für Jahrzehnte in ein starres Korsett zu zwängen".
- Konsequenzen werden ausführlich erklärt, **bevor** Verträge unterschrieben werden.
- Flexibilität über Fondseinsatz, Sondertilgungsmöglichkeiten und Fördermöglichkeiten.
- Unterseite „Baufinanzierung – Das Objekt": Lage als Qualitätskriterium, Wertverlust bei
  Wohnungsüberschuss, schlechter Wiederverkaufswert bei sehr bauherrenspezifischen Objekten,
  Beleihungswert (Neubau ≈ 100 % des Kaufpreises, Bestand mit Abschlag ca. 10–15 %).
- Als unabhängiger Makler Beratung privater **und gewerblicher** Kunden.

### Gefunden, aber bewusst nicht verwendet

- **Team:** Es gibt Hinweise auf eine Mitarbeiterin „Sabrina" (Ausbildung zur
  Versicherungskauffrau im Haus, seit 2009 festangestellt, Schwerpunkt private
  Versicherungen und Verwaltung) sowie auf einen Berater, der den Krefelder Standort
  selbst aufgebaut hat und führt. Da nur Vornamen bzw. unklare Zuordnungen vorliegen,
  enthält die Seite **keine Team-Profile** – die sollten vom Unternehmen kommen.
- **Bewertungen:** Auf WhoFinance, 11880 und ähnlichen Portalen liegen keine
  Kundenbewertungen vor. Es gibt also keine Referenzen, die man zitieren könnte.
- **Maklerpool:** WhoFinance führt das Büro unter BCA – nicht verifiziert, daher nicht erwähnt.

> ### ⚠️ Vor der Veröffentlichung zu klären
>
> 1. **E-Mail-Adresse** `info@fairkonzept.de` ist angenommen, nicht bestätigt – prüfen.
> 2. **Anschrift Aachen** (107 statt 60) und die **Telefonnummer Krefeld** bestätigen lassen.
> 3. **Impressum:** USt-IdNr., Erlaubnis nach § 34d bzw. § 34f GewO, Registrierungsnummer
>    im Vermittlerregister, zuständige IHK und Angaben zu Beteiligungen ergänzen.
>    Alle offenen Stellen sind mit *[bitte prüfen]* / *[bitte ergänzen]* markiert und im
>    Seitenkopf als Hinweisbox sichtbar.
> 4. **Datenschutz:** Hoster und Speicherdauer der Logfiles eintragen; falls ein echtes
>    Serverformular, Google Maps oder Web-Analyse ergänzt wird, den Text erweitern.
> 5. **Google Fonts** werden aktuell von Google-Servern geladen (IP-Übermittlung, im
>    Datenschutztext offengelegt). Sauberer: Schriften lokal ablegen und den `@import`
>    in `styles.css` durch `@font-face` ersetzen – dann entfällt Ziffer 5 der
>    Datenschutzerklärung.
> 6. **Chart im Hero** ist schematisch und als „kein konkretes Finanzierungsangebot"
>    beschriftet – das sollte so bleiben.
> 7. **Zahlenangaben** in den FAQ (Beleihungsabschlag 10–15 %, Kaufnebenkosten aus
>    Eigenkapital) stammen von der Originalseite bzw. sind Marktstandard – vor dem
>    Livegang fachlich freigeben lassen.
> 8. **Logo und Teamfotos** ersetzen, sobald Material vorliegt.
