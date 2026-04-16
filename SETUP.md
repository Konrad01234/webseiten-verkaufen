# WorkPilot — Supabase Setup

Diese Anleitung führt dich durch die einmalige Einrichtung deines Supabase-Backends, damit User A und User B sich gegenseitig sehen.

> Wenn du irgendwo hängst, kopier mir den Fehler und ich helf dir.

---

## 1. SQL-Schema in Supabase einspielen (5 Minuten)

Diesen Schritt musst du **einmalig** machen, danach läuft alles automatisch.

1. Geh auf https://supabase.com/dashboard/project/qowrnfdjwikkjlpluali
2. Links in der Sidebar auf **"SQL Editor"** klicken
3. Oben rechts auf **"+ New query"** klicken
4. Öffne die Datei **`supabase-schema.sql`** (in diesem Repo) und kopiere den **kompletten Inhalt**
5. Paste alles in den SQL-Editor
6. Unten rechts auf **"Run"** (oder `Strg + Enter`)
7. Du solltest "Success. No rows returned" sehen — das ist gut

Was passiert dabei? Die Datei legt diese Tabellen an:
- `profiles` (User-Profile)
- `jobs` (Stellenanzeigen)
- `applications` (Bewerbungen)
- `chats` + `messages` (Nachrichten)
- `reviews` (Bewertungen)
- `saved_jobs` (gespeicherte Jobs)
- `support_tickets` (Support-Anfragen)

Dazu werden **Row Level Security**-Regeln aktiviert. Das bedeutet: Selbst wenn jemand die JS im Browser manipuliert, kann er nur seine eigenen Daten ändern. Die Regeln werden von Postgres selbst durchgesetzt — nicht zu umgehen.

## 2. E-Mail-Bestätigung deaktivieren (für Entwicklung)

Standardmäßig schickt Supabase eine Bestätigungs-Mail bei jeder Registrierung. Während du testest ist das nervig. So schaltest du es vorübergehend aus:

1. Im Supabase-Dashboard: **Authentication → Sign In / Providers → Email**
2. Bei **"Confirm email"** den Schalter **ausschalten**
3. **Save** klicken

> ⚠️ Wenn du wirklich live gehst: **Wieder einschalten!** Sonst registriert jeder mit fremden Mail-Adressen.

## 3. Storage einrichten (optional, für Datei-Uploads)

Aktuell werden Bilder als Base64 in der DB gespeichert (funktioniert, aber nicht ideal). Wenn du echte Datei-Uploads willst, kann ich das im nächsten Schritt einrichten — sag einfach Bescheid.

---

## 4. Testen — funktioniert die Migration?

Öffne die Seite **`index.html`** in zwei verschiedenen Browsern (oder einem normalen Fenster + Inkognito-Fenster). Du musst die Seite über einen lokalen Webserver öffnen — direkt per Datei-Doppelklick funktioniert Supabase **nicht**, weil der Browser CORS blockiert.

### Schnell-Webserver starten

In einem Terminal im Projektordner:

```bash
# Variante 1: Python (auf den meisten Systemen schon installiert)
python3 -m http.server 8000

# Variante 2: Node.js
npx http-server -p 8000
```

Dann im Browser: http://localhost:8000

### Test-Plan

#### A) Registrierung & Login
1. **Browser 1 (normal):** Auf "Registrieren" klicken
   - Vorname: `Anna`, Nachname: `Test`, Rolle: `Arbeitnehmer`
   - Email: `anna@test.de`, Passwort: `geheim123`
   - **Erwartung:** Du landest auf dem Worker-Dashboard
2. **Browser 2 (Inkognito):** Auf "Registrieren" klicken
   - Vorname: `Bob`, Nachname: `Firma`, Rolle: `Arbeitgeber`
   - Firmenname: `Bobs Bäckerei`
   - Email: `bob@test.de`, Passwort: `geheim123`
   - **Erwartung:** Du landest auf dem Employer-Dashboard

#### B) Job posten und sehen (User A → User B)
3. **Browser 2 (Bob):** Auf "Anzeige schalten" → Job ausfüllen → Veröffentlichen
4. **Browser 1 (Anna):** Auf "Jobs finden" → Bobs Job sollte erscheinen
   - **Erwartung:** Anna sieht Bobs Job, obwohl sie in einem komplett anderen Browser eingeloggt ist ✅

#### C) Bewerbung (User A → User B)
5. **Browser 1 (Anna):** Auf Bobs Job klicken → "Jetzt bewerben"
6. **Browser 2 (Bob):** "Bewerbungen" oder "Dashboard" aufrufen
   - **Erwartung:** Bob sieht Annas Bewerbung ✅

#### D) Chat (Echtzeit!)
7. **Browser 2 (Bob):** Bei Annas Bewerbung auf "Chat" klicken → "Hallo Anna, kannst du morgen?"
8. **Browser 1 (Anna):** "Nachrichten" öffnen
   - **Erwartung:** Bobs Nachricht ist da. Antworte → Bob sieht die Antwort **innerhalb von 1-2 Sekunden** ohne Reload ✅

#### E) Logout / Login
9. **Browser 1:** Abmelden → erneut mit anna@test.de einloggen
   - **Erwartung:** Du siehst dein Profil und alle Bewerbungen wieder

---

## 5. Häufige Fehler

### "Failed to load supabase client" / Console-Fehler
→ Prüfe ob `config.js` die richtige URL und Key enthält. Schau in `supabase-schema.sql` ob du es erfolgreich ausgeführt hast.

### "row-level security policy violated"
→ Das Schema wurde nicht (oder unvollständig) ausgeführt. Geh nochmal in den SQL-Editor und führe `supabase-schema.sql` erneut aus. (Es ist idempotent — du kannst es mehrmals ausführen ohne dass etwas kaputt geht.)

### "Email not confirmed" beim Login
→ Schritt 2 oben befolgen (Confirm email ausschalten), oder die Mail im Posteingang bestätigen.

### "duplicate key value violates unique constraint"
→ Die Email ist schon registriert. Anderes Passwort oder eine andere Email nehmen.

### Jobs erscheinen nicht
→ Browser-Konsole öffnen (F12) und nach Fehlern suchen. Oft ist es ein RLS-Problem.

### Realtime-Updates kommen nicht an
→ In Supabase: **Database → Replication → supabase_realtime** und prüfe ob `messages`, `chats`, `applications`, `jobs` als "Source" markiert sind. Das `ALTER PUBLICATION`-Statement im Schema sollte das automatisch machen.

---

## 6. Was funktioniert, was nicht

### ✅ Funktioniert mit echtem Backend
- Registrierung + Login (echte Passwort-Hashes via Supabase Auth)
- Jobs posten, suchen, ansehen — geteilt zwischen allen Usern
- Bewerbungen — Arbeitgeber sehen echte Bewerber
- Chat zwischen Worker und Employer mit Realtime-Updates
- Profile bearbeiten (Name, Firma, Beschreibung, Logo, Bilder)
- Gespeicherte Jobs (pro User in der DB)
- Support-Tickets

### ⚠️ Noch lokal (kein DB-Sync)
- CV-Builder-Entwurf (wird erst beim "Speichern" als CV-flag in DB markiert)
- "Aktiver Job"-Status (lokale Caches)
- Reviews (das Lese-API ist da, aber das Schreib-Formular muss noch verdrahtet werden)
- Admin-Panel (Analytics noch lokal)
- Boost-Käufe (Stripe-Integration nötig — kann ich später machen)

### ❌ Bewusst NICHT umgesetzt (rechtlich/inhaltlich)
- Impressum, Datenschutz, AGB — musst du selbst schreiben (siehe vorherige Antwort)
- E-Mail-Versand bei neuen Bewerbungen — Supabase unterstützt das, kostet aber extra Setup
- Stripe / echte Bezahlung
