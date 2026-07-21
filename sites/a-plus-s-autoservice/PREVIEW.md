# 🔍 Live-Vorschau – A + S Autoservice GmbH

Da GitHub HTML-Seiten nicht direkt anzeigt, kannst du die Website über den kostenlosen
Renderer **htmlpreview.github.io** live aus diesem Repository ansehen.
**Einfach auf einen Link unten klicken** – die Seite öffnet sich fertig gestylt im Browser.

> Hinweis: Die Links zeigen den Stand des Branches `claude/session-5zxhau`.
> Beim Klick werden HTML, CSS und JS live aus GitHub geladen und gerendert.

## Seiten

| Seite | Live-Vorschau |
|-------|---------------|
| 🏠 **Startseite** | [Öffnen](https://htmlpreview.github.io/?https://github.com/Konrad01234/webseiten-verkaufen/blob/claude/session-5zxhau/sites/a-plus-s-autoservice/index.html) |
| 🔧 **Leistungen** | [Öffnen](https://htmlpreview.github.io/?https://github.com/Konrad01234/webseiten-verkaufen/blob/claude/session-5zxhau/sites/a-plus-s-autoservice/leistungen.html) |
| 👥 **Über uns** | [Öffnen](https://htmlpreview.github.io/?https://github.com/Konrad01234/webseiten-verkaufen/blob/claude/session-5zxhau/sites/a-plus-s-autoservice/ueber-uns.html) |
| ⭐ **Bewertungen** | [Öffnen](https://htmlpreview.github.io/?https://github.com/Konrad01234/webseiten-verkaufen/blob/claude/session-5zxhau/sites/a-plus-s-autoservice/bewertungen.html) |
| 📞 **Kontakt** | [Öffnen](https://htmlpreview.github.io/?https://github.com/Konrad01234/webseiten-verkaufen/blob/claude/session-5zxhau/sites/a-plus-s-autoservice/kontakt.html) |
| 📄 **Impressum** | [Öffnen](https://htmlpreview.github.io/?https://github.com/Konrad01234/webseiten-verkaufen/blob/claude/session-5zxhau/sites/a-plus-s-autoservice/impressum.html) |
| 🔒 **Datenschutz** | [Öffnen](https://htmlpreview.github.io/?https://github.com/Konrad01234/webseiten-verkaufen/blob/claude/session-5zxhau/sites/a-plus-s-autoservice/datenschutz.html) |

---

## Noch besser: echte Vorschau per GitHub Pages

`htmlpreview` rendert jede Seite einzeln – die **Navigation zwischen den Seiten** funktioniert
dort aber nicht immer sauber. Für eine vollständige, klickbare Vorschau mit funktionierendem
Menü gibt es zwei saubere Wege:

### Variante A – lokal ansehen (sofort, offline)
```bash
cd sites/a-plus-s-autoservice
python3 -m http.server 8000
# im Browser öffnen: http://localhost:8000
```

### Variante B – GitHub Pages (öffentliche URL, dauerhaft)
1. Diesen Branch nach `main` mergen (oder Pages für diesen Branch aktivieren).
2. Auf GitHub: **Settings → Pages → Build and deployment → Source: „Deploy from a branch"**.
3. Branch wählen, Ordner `/ (root)` → Speichern.
4. Nach ~1 Minute ist die Seite unter
   `https://konrad01234.github.io/webseiten-verkaufen/sites/a-plus-s-autoservice/`
   erreichbar – mit voll funktionierender Navigation.

### Variante C – Vercel (empfohlen für „echt live")
Neues Vercel-Projekt, **Root Directory** = `sites/a-plus-s-autoservice`,
Framework Preset **Other**. Jeder Push deployt automatisch.
