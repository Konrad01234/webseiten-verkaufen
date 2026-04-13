# Production-Setup TODOs

Alle Code-Änderungen sind im Repo. Diese Schritte musst du selbst
im Supabase- / hCaptcha- / Vercel-Dashboard erledigen.

## 1. Supabase-Migrations einspielen (idempotent)

Supabase → SQL Editor → Datei einfügen → Run. Reihenfolge egal,
alle sind sicher mehrfach ausführbar:

- `supabase-schema.sql` — Basis-Schema (Tabellen, RLS, Realtime)
- `supabase-add-approval.sql` — Arbeitgeber-Freischaltung
- `supabase-add-worker-fields.sql` — Worker-Profil (Skills, CV, Active Job)
- `supabase-add-storage.sql` — Storage-Policies (Schritt 4 unten)

## 2. Email-Confirmation einschalten

Supabase → Authentication → Providers → Email →
**"Confirm email"** auf ON.

## 3. hCaptcha aktivieren (Bot-Schutz, ~5 Minuten)

a) https://hcaptcha.com → Sign up (kostenlos) → New site →
   Domain eintragen (z.B. deine `*.vercel.app` URL) →
   **Site Key** und **Secret Key** notieren.

b) Supabase → Authentication → Settings (oder "Bot Protection"):
   - Provider: **hCaptcha**
   - Site Key + Secret Key eintragen
   - **Enable** speichern.

c) `config.js` öffnen, `window.HCAPTCHA_SITE_KEY = 'DEIN_SITE_KEY';`
   eintragen → committen → Vercel deployt.

Danach erscheint das CAPTCHA-Widget bei der Registrierung. Ohne
gelöstes CAPTCHA wird signUp serverseitig abgelehnt.

## 4. Storage-Bucket für Bilder (~3 Minuten)

a) Supabase → Storage → **New bucket**:
   - Name: **`images`**
   - **Public bucket: ON**
   - File size limit: 5 MB
   - Allowed MIME types: `image/jpeg, image/png, image/webp`

b) `supabase-add-storage.sql` im SQL Editor ausführen
   (legt die Insert/Update/Delete-Policies an).

c) `config.js` öffnen, `window.IMAGE_BUCKET = 'images';` eintragen.

Ab jetzt landen Logos, Firmen-Bilder und CV-Fotos im Storage statt
als Base64 in der DB. Bei Storage-Fehler (z.B. Bucket nicht da)
fällt der Code automatisch auf Base64 zurück — funktioniert weiter,
nur halt langsamer.

## 5. Impressum + Datenschutz

Schick mir Name, Anschrift, E-Mail, Telefon — ich trage sie ein.

## 6. Cron-Job für veraltete Jobs (optional)

Supabase → Database → Cron Jobs → "New cron job":
```sql
UPDATE public.jobs SET active = false
 WHERE expires < now() AND active = true;
```
Schedule: `0 3 * * *` (täglich 3 Uhr).

## 7. Eigene Domain (optional, 10-15 €/Jahr)

Domain bei Hoster kaufen → Vercel → Settings → Domains →
Add Domain → DNS-Records bei deinem Hoster setzen.

## 8. Admin-Konto

Auf der Live-Seite mit `kwg.range@web.de` oder
`jojo102009@icloud.com` registrieren. Footer → "Admin" zeigt dann
das Dashboard.
