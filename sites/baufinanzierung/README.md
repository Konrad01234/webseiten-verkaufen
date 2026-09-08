# baufinanzierung.biz – Neuentwurf

Moderner Neuentwurf für **baufinanzierung.biz**, mit Schwerpunkt auf der Anfrageseite
(Ersatz für `Anfrage.php`). Statisches HTML + CSS + Vanilla-JS, kein Build-Schritt.

## Seiten

| Datei | Inhalt |
|-------|--------|
| `index.html` | Startseite – Hero mit Schnelleinstieg, Leistungen, Ablauf, Finanzierungsrechner, Kennzahlen, FAQ |
| `anfrage.html` | **Anfrageformular** als 5-Schritte-Assistent mit Fortschrittsanzeige, Live-Rate und Zusammenfassung |
| `impressum.html` | Impressum – **Vorlage**, Platzhalter in eckigen Klammern ausfüllen |
| `datenschutz.html` | Datenschutzerklärung – **Vorlage**, passend zum technischen Stand dieser Seite |
| `styles.css` | Design-System und alle Layouts |
| `app.js` | Navigation, Rechner, Formular-Assistent, Entwurfsspeicherung |
| `favicon.svg` | Icon |

## Die Anfrageseite im Detail

Statt eines langen Formulars führt ein Assistent durch fünf Schritte:

1. **Vorhaben** – Kauf, Neubau, Anschlussfinanzierung, Modernisierung, Kapitalanlage, Umschuldung
2. **Objekt** – Objektart, PLZ/Ort, Bundesland, Nutzung, Wohnfläche, Baujahr
3. **Finanzierung** – Kaufpreis, Eigenkapital, Nebenkosten, Zinsbindung, Tilgung, Zeitpunkt
4. **Zur Person** – Berufsgruppe, Kreditnehmer, Haushaltsnetto, Geburtsjahr, laufende Raten
5. **Kontakt** – Anrede bis Rückrufwunsch, Zusammenfassung aller Angaben, DSGVO-Einwilligung

Zusätzlich:

- **Live-Beispielrate** in der Seitenspalte, die sich mit den Eingaben aus Schritt 3 aktualisiert
  (Annuität aus Darlehensbedarf, Beispielzins und Tilgung).
- **Kaufnebenkosten** je Bundesland: Grunderwerbsteuer + 2,0 % Notar/Grundbuch + gewählte Maklerprovision.
- **Validierung pro Schritt** mit Fehlermeldung direkt am Feld; Enter springt zum nächsten Schritt.
- **Entwurf** wird im `localStorage` gesichert – eine begonnene Anfrage geht beim Schließen des
  Browsers nicht verloren. Die Datenschutz-Einwilligung wird bewusst *nicht* gespeichert.
- **Vorbelegung über die URL**: `anfrage.html?vorhaben=neubau&kaufpreis=550000&bundesland=Bayern`.
  Die Kacheln auf der Startseite und der Rechner nutzen das.
- Ohne JavaScript bleiben alle Felder sichtbar und ausfüllbar (alle Schritte untereinander).

## Vor der Veröffentlichung erledigen

Die Live-Seite war aus dieser Entwicklungsumgebung nicht erreichbar (Netzwerksperre), Inhalte
wurden daher anhand der Suchmaschinen-Beschreibung der Seite und branchenüblicher Standards
formuliert. Vor dem Livegang bitte prüfen bzw. ergänzen:

1. **Kontaktdaten** – Telefonnummer und Anschrift fehlen. Die betroffenen Stellen sind in den
   HTML-Dateien mit `TODO vor Veröffentlichung` kommentiert (Topbar, Footer, Seitenspalte der
   Anfrage). Die E-Mail-Adresse `info@baufinanzierung.biz` ist eine Annahme.
2. **Impressum und Datenschutzerklärung** – alle `[…]`-Felder ausfüllen; beim Impressum zusätzlich
   die Pflichtangaben zur Vermittlererlaubnis (§ 34i GewO, Register-Nr., Aufsicht, Schlichtungsstelle).
3. **Aussagen prüfen** – „seit über 40 Jahren", „ohne Vermittlungszins für 1 Jahr", „Antwort in
   24 Stunden", „0 € für Anfrage & Beratung" stammen aus der Außendarstellung der bestehenden Seite
   bzw. sind Vorschläge. Was nicht zutrifft, bitte anpassen.
4. **Beispielzins** – `ZINS_BEISPIEL` in `app.js` (aktuell 3,6 %) regelmäßig ans Zinsniveau anpassen.
   Er wird für die Live-Rate auf der Anfrageseite verwendet; im Rechner der Startseite ist der Zins
   frei einstellbar.
5. **Grunderwerbsteuersätze** – als `data-gr` an den `<option>`-Elementen hinterlegt (Stand 2026),
   bei Änderungen dort pflegen (`index.html` und `anfrage.html`).
6. **Formularversand** – ohne Backend öffnet das Formular eine vorbereitete E-Mail (`mailto:`).
   Für den Live-Betrieb an der markierten Stelle in `app.js` (`form.addEventListener("submit", …)`)
   den eigenen Endpunkt ansprechen, z. B. das bestehende PHP-Skript oder einen Formulardienst.
   Danach den entsprechenden Absatz in der Datenschutzerklärung anpassen.
7. **Schriften** – Google Fonts werden per `@import` geladen. Wer das vermeiden will, lädt
   „Plus Jakarta Sans" und „Inter" lokal in den Ordner; dann kann Ziffer 5 der
   Datenschutzerklärung entfallen.

## Technik

- Reines HTML/CSS/JS, keine Abhängigkeiten, kein Build.
- Responsiv geprüft bei 390 / 768 / 1024 / 1280 px, kein horizontaler Überlauf.
- Semantisches Markup, sichtbare Fokuszustände, `aria`-Attribute an Navigation, Fortschritt und
  Auswahlkacheln, `prefers-reduced-motion` wird respektiert.
- Keine Cookies, kein Tracking, keine externen Karten- oder Videodienste.

## Lokal testen

```bash
cd sites/baufinanzierung
python3 -m http.server 8000
# http://localhost:8000 öffnen
```

## Vercel

Eigenes Projekt mit **Root Directory** `sites/baufinanzierung`, Framework-Preset `Other`
(statisch, kein Build).
