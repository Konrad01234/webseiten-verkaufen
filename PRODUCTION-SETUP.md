# Production-Setup TODOs

Alle Code-Änderungen sind im Repo. Diese Schritte musst du selbst
im Supabase-/Vercel-Dashboard erledigen, damit das Backend voll
produktionsbereit ist.

## 1. Supabase-Migrations einspielen (falls noch nicht)

In Supabase → SQL Editor → Inhalt der jeweiligen Datei einfügen → Run.
Alle SQLs sind idempotent (mehrfach ausführbar):

- `supabase-schema.sql` — Basis-Schema (Tabellen, RLS, Realtime)
- `supabase-add-approval.sql` — Arbeitgeber-Freischaltung
- `supabase-add-worker-fields.sql` — Worker-Profil (Skills, Refs, CV, Active Job)

## 2. Email-Confirmation einschalten

Supabase → Authentication → Providers → Email →
**"Confirm email"** auf ON.

Damit bekommt jeder neue Nutzer eine Bestätigungs-E-Mail. Verhindert
dass jemand mit fremden E-Mail-Adressen Konten anlegt.

## 3. hCaptcha aktivieren (Bot-Schutz)

Supabase → Authentication → Bot Protection.
- Provider: hCaptcha (kostenlos)
- Site + Secret Key bei https://hcaptcha.com registrieren
- Keys in Supabase eintragen
- Modus "Required"

## 4. Supabase Storage Bucket für Bilder (optional)

Aktuell werden Logos/Bilder als Base64 in der DB gespeichert.
Für bessere Performance + weniger DB-Load:

- Supabase → Storage → Create bucket
- Name: `images`
- Public bucket: ON
- File size limit: 5 MB
- Allowed MIME types: `image/jpeg, image/png, image/webp`

Code-Anbindung (`DB.uploadImage`) kommt bei Bedarf — aktuell reicht Base64.

## 5. Impressum + Datenschutz

Schick mir deine echten Daten (Name, Anschrift, E-Mail, Telefon),
dann trage ich sie in `index.html` ein (Impressum-Seite).

## 6. Cron-Job für veraltete Jobs (optional)

Jobs mit `expires < now()` automatisch deaktivieren:

Supabase → Database → Cron Jobs → "New cron job":
```sql
UPDATE public.jobs
   SET active = false
 WHERE expires < now()
   AND active = true;
```
Schedule: `0 3 * * *` (täglich 3 Uhr).

## 7. Eigene Domain (optional, 10-15 €/Jahr)

- Domain bei Hoster kaufen (Strato, IONOS)
- Vercel → Settings → Domains → Add Domain
- DNS bei deinem Hoster auf Vercel zeigen lassen
- HTTPS macht Vercel automatisch

## 8. Admin-Account anlegen

Registriere dich auf der Live-Seite mit einer der Admin-E-Mails:
- `kwg.range@web.de`
- `jojo102009@icloud.com`

Nach dem Login zeigt der Footer-Link "Admin" das Dashboard.
