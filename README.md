# webseiten-verkaufen

Monorepo mit **allen** Webseiten. Bisher lag jede Seite in einem eigenen Branch –
jetzt liegen alle zusammen in diesem einen Branch unter `sites/`.
Ein Ordner = eine Webseite = ein Deployment.

## Alle Seiten auf einen Blick

| Ordner | Seite | Branche / Ort | Technik | Start |
| --- | --- | --- | --- | --- |
| `sites/davids` | Davids im Landhaus | Restaurant, Neuss | HTML/CSS/JS | `index.html` |
| `sites/cafe-elisa` | Café Elisa | Café & Eventlocation, Erfurt | HTML/CSS/JS | `index.html` |
| `sites/fay` | Fay Café | Café & Brunch, Düsseldorf | HTML/CSS/JS | `index.html` |
| `sites/gelateria-lorenzo-corno` | Gelateria Lorenzo Corno | Eisdiele, München-Schwabing | HTML/CSS/JS | `index.html` |
| `sites/af-automobile` | A&F Automobile | Kfz-Meisterbetrieb, München | HTML + GSAP/Lenis, Promo-Videos | `index.html` |
| `sites/a-plus-s-autoservice` | A + S Autoservice GmbH | Kfz-Meisterbetrieb, Bonn | HTML/CSS/JS | `index.html` |
| `sites/kfz-moeckl` | Kfz-Möckl GmbH | Autowerkstatt, Augsburg | HTML/CSS/JS | `index.html` |
| `sites/mamand-motors` | Mamand Motors | Kfz-Meisterwerkstatt, Köln | HTML/CSS/JS | `index.html` |
| `sites/ramona-daurelio` | Karosserie + Lack D'Aurelio | Unfall & Lack, Potsdam | HTML/CSS/JS | `index.html` |
| `sites/geissler` | Geißler Heizungstechnik | Heizung & Service, Bochum | HTML/CSS/JS | `index.html` |
| `sites/handwerker` | Meisterbetrieb Schmidt | Handwerksbetrieb | HTML/CSS/JS | `index.html` |
| `sites/orthosmile` | OrthoSmile | Kieferorthopädie, München | eine HTML-Datei (CSS/JS inline) | `index.html` |
| `sites/lela` | Schneider Atelier LE&LA | Demo-Website | eine HTML-Datei (komplett) | `index.html` |
| `sites/av8` | AV8 | Produktseite Kokoswasser | HTML/CSS/JS + GSAP | `index.html` |
| `sites/zero-titanium` | ZERO° Titanium | Produkt-Landingpage Thermosflasche | eine HTML-Datei + Bilder | `index.html` |

Gemeinsam genutzt: `assets/stock/` (Stockfotos inkl. `CREDITS.md`).

Hinweise:

- Alle Seiten sind statisches HTML – kein Build-Schritt nötig.
- `sites/orthosmile` und `sites/av8` kamen aus dem Repo `updates`, wo sie in
  eigenen Branches lagen.

## Vercel-Setup

Für jede Seite ein eigenes Vercel-Projekt:

1. In Vercel **Add New Project** → dieses Repo auswählen
2. **Root Directory** auf den jeweiligen Ordner setzen, z. B.
   Projekt „davids" → Root Directory `sites/davids`
3. **Framework Preset**: `Other` (statisches HTML, kein Build nötig)
4. Production Branch: den Branch setzen, auf dem die Seiten liegen

Damit nur die geänderte Seite neu gebaut wird, pro Projekt unter
**Ignored Build Step** eintragen:

```bash
git diff HEAD^ HEAD --quiet ./
```

## GitHub Pages

Unter `.github/workflows/` liegt je ein manuell startbarer Workflow
(Actions → Workflow wählen → „Run workflow"):

| Workflow | deployt |
| --- | --- |
| `pages.yml` | `sites/davids` |
| `pages-af-automobile.yml` | `sites/af-automobile` |
| `pages-daurelio.yml` | `sites/ramona-daurelio` |

GitHub Pages kann pro Repo nur **eine** Seite gleichzeitig hosten – der zuletzt
gelaufene Workflow gewinnt. Für mehrere Seiten parallel Vercel nutzen.

## Lokal testen

```bash
cd sites/davids          # oder jeden anderen Ordner aus der Tabelle
python3 -m http.server 8000
# http://localhost:8000 öffnen
```
