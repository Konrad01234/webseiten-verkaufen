# Frommelt & Partner – Frommelt Capital Partners

Statische Website für **Frommelt & Partner**, Finanzierungs- und Versicherungsmakler in Leipzig.
Modernisierte Neufassung des Auftritts von frommeltundpartner.de – reines HTML, CSS und Vanilla-JS,
kein Build-Schritt, keine Abhängigkeiten.

## Seiten

| Datei | Inhalt |
|---|---|
| `index.html` | Startseite: Hero, Leistungsüberblick, Ablauf, Referenzen, FAQ |
| `leistungen.html` | Leistungen: Privatpersonen, Vorsorge, Finanzierung, Unternehmen |
| `ueber-uns.html` | Über uns, Grundsätze, Ansprechpartner, Zulassung |
| `referenzen.html` | Feedback und Referenzen |
| `kontakt.html` | Kontaktdaten, Anfrageformular, Anfahrtskarte |
| `impressum.html` | Impressum inkl. berufsrechtlicher Angaben |
| `datenschutz.html` | Datenschutzhinweise nach Art. 13 DSGVO |

`styles.css` und `app.js` werden von allen Seiten geteilt.

## Technik

- Statisches HTML, ein Stylesheet, ein Skript – kein Framework, kein Build.
- Schriften: Google Fonts (Fraunces, Inter) per `@import` in `styles.css`.
- Karte: OpenStreetMap-iFrame auf der Kontaktseite.
- Animationen respektieren `prefers-reduced-motion`.
- Das Kontaktformular hat **kein Backend**: Beim Absenden wird ein `mailto:`-Link mit den
  eingegebenen Daten geöffnet. Es werden keine Daten gespeichert oder übertragen.

## Vor dem Livegang zu prüfen

Die Inhalte wurden aus öffentlich verfügbaren Angaben zusammengetragen. Der Betreiber sollte
vor der Veröffentlichung prüfen bzw. ergänzen (im Quelltext als `TODO Betreiber` markiert):

- Umsatzsteuer-Identifikationsnummer im Impressum (falls vorhanden)
- Angabe zu Beteiligungen an/von Versicherungsunternehmen
- Datenschutzbeauftragter (falls benannt)
- Consent-Lösung bzw. lokales Ausliefern der Google Fonts, falls gewünscht
- Referenzzitate: sinngemäß wiedergegeben – Freigabe und genauer Wortlaut prüfen
- Formular-Backend, falls Anfragen serverseitig entgegengenommen werden sollen

## Lokal testen

```bash
cd sites/frommelt
python3 -m http.server 8000
# http://localhost:8000 öffnen
```

## Deployment

Eigenes Vercel-Projekt mit **Root Directory** `sites/frommelt`, Framework-Preset `Other`.
