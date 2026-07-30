# webseiten-verkaufen

Monorepo mit mehreren eigenständigen Webseiten. Jede Webseite liegt in `sites/<name>/` und wird als eigenes Vercel-Projekt deployed.

## Struktur

```
sites/
├── davids/        Davids im Landhaus – Restaurant Neuss (statisches HTML + CSS + JS)
└── boostwerk/     Boostwerk Köln – Kfz-Werkstatt Köln-Ostheim (statisches HTML + CSS + JS)

assets/
└── fotos/         Gemeinsame Foto-Bibliothek für alle Seiten (Originale)
    ├── BILDNACHWEIS.md      Lizenzregister – für jedes Bild Herkunft und Status
    └── kfz-werkstatt/       Werkstattmotive
```

## Bilder

`assets/fotos/` ist die zentrale Bibliothek für Fotos, die auf mehreren Seiten
verwendet werden können. Dort liegen die **Originale**; für den Einsatz wandert
jeweils eine verkleinerte Kopie in `sites/<name>/img/`.

Der Ordner liegt absichtlich **außerhalb** der Vercel-Root-Directories und wird
daher nicht mit ausgeliefert.

> **Wichtig:** Jedes Bild braucht vor der Veröffentlichung eine geklärte
> Rechtelage – in Deutschland ist die Nutzung fremder Fotos ein häufiger
> Abmahngrund, und es haftet der Website-Betreiber. Deshalb ist zu jedem Bild in
> `assets/fotos/BILDNACHWEIS.md` festgehalten, woher es kommt. Bilder mit dem
> Status `UNGEKLÄRT` tragen auf der Seite ein sichtbares gelbes Platzhalter-Label
> und dürfen nicht live gehen.

## Vercel-Setup

Für jede Seite ein eigenes Vercel-Projekt:

1. In Vercel **Add New Project** → dieses Repo auswählen
2. **Root Directory** auf den jeweiligen Ordner setzen:
   - Projekt „davids" → Root Directory `sites/davids`
   - Projekt „boostwerk" → Root Directory `sites/boostwerk`
3. **Framework Preset**: `Other` (statisches HTML, kein Build nötig)
4. Production Branch: `claude/vercel-deployment-branch-VgNvi` (oder den, den du als Default setzt)

Danach deployed jeder Push auf den Branch alle Projekte parallel. Wenn du mit
**Ignored Build Step** arbeiten willst (damit nur die geänderte Seite neu
gebaut wird), trage pro Projekt in den Vercel-Settings ein:

```bash
git diff HEAD^ HEAD --quiet ./
```

## Lokal testen

```bash
cd sites/davids
python3 -m http.server 8000
# http://localhost:8000 öffnen
```
