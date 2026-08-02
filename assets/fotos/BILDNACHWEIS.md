# Bildnachweis / Lizenzregister

Zentrale Foto-Bibliothek für alle Seiten in diesem Repo. Die Dateien hier sind die
**Originale in bester verfügbarer Auflösung**. Für den Einsatz auf einer Seite wird
eine verkleinerte Kopie nach `sites/<name>/img/` gelegt – nie das Original direkt
verlinken, damit die Seiten schnell bleiben.

## Warum dieses Register existiert

Jedes Foto auf einer veröffentlichten Website braucht eine geklärte Rechtelage.
In Deutschland ist die unerlaubte Nutzung eines fremden Fotos ein häufiger
Abmahngrund – Streitwerte von einigen Hundert bis über tausend Euro pro Bild sind
normal, und es haftet der Betreiber der Website, nicht der Ersteller. Deshalb wird
hier zu **jedem** Bild festgehalten, woher es kommt und was damit erlaubt ist.

Status-Werte:

| Status | Bedeutung |
|--------|-----------|
| `EIGEN` | Vom Betrieb selbst aufgenommen oder bereitgestellt. Nutzung frei. |
| `LIZENZIERT` | Lizenz gekauft oder freie Lizenz (z. B. Unsplash, Pexels). Beleg im Ordner `belege/`. |
| `UNGEKLÄRT` | Herkunft/Lizenz unklar. **Nicht veröffentlichen.** Nur zur Layout-Vorschau. |

---

## kfz-werkstatt/

Acht Werkstattfotos, aus Screenshots einer Google-Bildersuche extrahiert
(schwarze Ränder und Bedienelemente entfernt, leicht in Kontrast/Sättigung
angepasst).

> ### ⚠️ Status aller acht Dateien: `UNGEKLÄRT`
>
> Es handelt sich erkennbar um **fremde Stock- und Pressefotos**, nicht um Bilder
> der Werkstatt Boostwerk Köln. In den Screenshots waren teilweise noch die
> Quellenangaben sichtbar:
>
> | Datei | Hinweis aus dem Screenshot |
> |-------|----------------------------|
> | `hebebuehnen-halle.jpg` | Quelle `kerridgecs.com` |
> | `diagnose-tablet.jpg` | Quelle `smogtechinstitute.com` |
> | `motorraum.jpg` | Quelle `nzherald.co.nz` |
> | `werkzeugwand.jpg` | Stock-Bildtitel „View of a Set of Tools in a Car Repair Shop.“ |
> | `werkzeugwand-detail.jpg` | Stock-Bildtitel „View Inside the Auto Service Shop.“ |
> | `motor-arbeit.jpg` | Stock-Bildtitel „A male car mechanic working hard to repair the car engine…“ |
> | `diagnose-laptop.jpg` | Stock-Bildtitel „Car diagnostics in a repair shop!“ |
> | `diagnose-station.jpg` | Stock-Bildtitel „car mechanic maintains a vehicle with the help of a diagn…“ |
>
> Verwendet in: `sites/boostwerk` (alle acht) und `sites/ac-caspari` (alle acht).
>
> Diese Bilder sind auf der Boostwerk-Seite eingebaut, damit das Layout beurteilt
> werden kann. Sie tragen dort ein sichtbares gelbes Label **„Platzhalter ·
> Lizenz klären“**. Vor dem Livegang gilt: entweder ersetzen oder eine Lizenz
> erwerben – siehe unten.
>
> **Seit dem Aufbau der Seite `sites/ac-caspari` gilt dasselbe dort ein zweites
> Mal.** Verkleinerte Kopien aller acht Dateien liegen unter
> `sites/ac-caspari/img/fotos/`, dazu ein 16:9-Kopfbild
> (`sites/ac-caspari/img/hero.jpg`, aus `hebebuehnen-halle.jpg`) und ein
> 21:9-Foto-Band (`sites/ac-caspari/img/band-werkstatt.jpg`, aus
> `werkzeugwand-detail.jpg`). Auch dort sind sie gelb als Platzhalter markiert.
> Der Status bleibt `UNGEKLÄRT`: **zwei** Seiten müssen bereinigt werden, nicht
> nur eine.

### Wege zu rechtssicheren Fotos

1. **Selbst fotografieren** (beste Option, kostenlos)
   Zehn Handyaufnahmen aus der eigenen Halle wirken glaubwürdiger als jedes
   Stockfoto, weil Kunden die Werkstatt wiedererkennen. Sinnvolle Motive:
   Hebebühne mit Fahrzeug, Werkzeugwand, Diagnosegerät im Einsatz, Reifenlager,
   Annahme/Theke, Team, Halle von außen bei Tageslicht.
   Tipp: quer fotografieren, Tore auf für Licht, keine Kundenkennzeichen und
   keine fremden Personen ohne Einwilligung im Bild.

2. **Kostenlose Stockportale** – Unsplash, Pexels, Pixabay.
   Nutzung auch kommerziell erlaubt, keine Namensnennung nötig (Unsplash- und
   Pexels-Lizenz). Suchbegriffe: „car repair shop“, „mechanic“, „car lift“,
   „auto workshop tools“. Beim Download bitte Bild-URL und Fotografennamen hier
   im Register eintragen.

3. **Bezahlte Lizenz** – Adobe Stock, iStock, Shutterstock.
   Einzelbilder ab ca. 10 €. Falls eines der oben gelisteten Fotos genau passt:
   mit der Rückwärts-Bildersuche die Agentur finden und dort regulär kaufen.
   Rechnung/Lizenzbeleg unter `belege/` ablegen.

### Vorlage für neue Einträge

```
| Datei | Status | Quelle / Urheber | Lizenz | Verwendet in |
|-------|--------|------------------|--------|--------------|
| halle-aussen.jpg | EIGEN | Boostwerk Köln, eigenes Foto | frei | sites/boostwerk |
```

---

## boostwerk/ (im Seitenordner, nicht hier)

Die Fotos der echten Werkstatt liegen direkt unter `sites/boostwerk/img/`
(`hero.jpg`, `halle.jpg`, `logo.jpg`, `schild.jpg`, `banner.jpg`). Sie stammen
aus dem Google-Unternehmensprofil von Boostwerk Köln bzw. wurden vom Betreiber
bereitgestellt – Status `EIGEN`. Sie sind aus einem einzigen Screenshot
zugeschnitten, deshalb begrenzt in der Auflösung.
