# Updating the site with ZERO data loss

**Read this first — the one thing that matters:**
Your entire database — hotel info, rooms, room images, bookings, reservations,
customer accounts & profiles, reviews, staff & admin accounts, payment history,
invoices, restaurant menu, orders, POS billing, room-service, check-in/out,
pending balances, settings, SEO, gallery, offers, notifications, reports, and
audit logs — is stored in **ONE file: `db.json`** (images are saved inside it).

`db.json` is **git-ignored**, so it is **never** part of the code you pull from
GitHub. You only lose data if a deploy *overwrites or deletes* `db.json`.
**So: update the CODE, and never touch `db.json`.**

The app also auto-protects you: on **every server start** it copies the current
`db.json` into a `backups/` folder and keeps the last 40 snapshots.

---

## Before you deploy — make a backup (2 ways, do at least one)

1. **In the app:** Admin → **💾 Backup** → **Download Full Backup**. Save the
   `.json` file on your computer. (This is your restore point.)
2. **On the server (SSH/cPanel terminal):**
   ```bash
   cp db.json ~/db-backup-$(date +%F-%H%M).json
   ```
Verify the backup opens and is not empty before continuing.

---

## The safe update — pick your hosting method

### A) Git-based host (VPS / cPanel Git / Compute Engine) — recommended
```bash
cd ~/app            # your app folder
git pull            # pulls ONLY code — db.json is git-ignored, untouched
npm install         # only if package.json changed
pm2 restart hotel   # or: restart the Node app in cPanel
```
`git pull` **cannot** touch `db.json` — it's not tracked. Your data stays.

### B) Manual upload (File Manager / FTP)
Upload **only the code files/folders** that changed:
`server.js`, `public/`, `package.json`.
**Do NOT upload `db.json`, and do NOT delete it on the server.** If your tool
asks to overwrite `db.json` → **choose No / Skip**. If it deleted the whole
folder first, restore `db.json` from your backup before starting the app.

> ⚠️ The mistake that wipes data: uploading the *entire* project folder (or
> re-cloning fresh) so a blank/old `db.json` lands on top of the live one.
> Never include `db.json` in the upload.

---

## About "database migrations" — they're automatic and safe
This app has no separate migration step to run. When new code needs a new field
or table, the server adds it on startup with a pattern like
`db.newThing = db.newThing || []` — it **only adds what's missing** and never
deletes or rewrites existing records. Your booking IDs, invoice IDs, payment
IDs and room IDs never change.

---

## After you deploy — verify (5-minute checklist)
- [ ] Site loads with HTTPS, no errors.
- [ ] **Admin login** works; dashboard shows your real numbers.
- [ ] **Customer login** works (email + Google).
- [ ] **Bookings** list shows all past bookings; IDs unchanged.
- [ ] **Rooms** show correct availability and images.
- [ ] **Restaurant** menu + past orders present.
- [ ] **Payments / invoices** history intact (Admin → Payments).
- [ ] **POS** products/sales, **reviews**, **gallery** images all present.
- [ ] Payment gateways still configured (Admin → Payment/Bank: eSewa / Razorpay).

If anything looks wrong, **do not delete anything** — you have backups:

---

## If something broke — roll back (no data loss)
1. Code problem → `git checkout <previous-commit>` (or re-upload the previous
   code), then restart.
2. Data problem → Admin → **💾 Backup → Restore from backup**, upload the file
   you downloaded before deploying. (Or on the server:
   `cp ~/db-backup-YYYY-MM-DD-HHMM.json db.json` then restart.)
3. Server-side snapshots live in `~/app/backups/` (last 40) — copy the newest
   good one over `db.json` and restart.

---

## One-time hardening (recommended)
- Keep **daily** copies of `db.json` off the server (download the backup weekly,
  or a cron: `cp db.json backups/db-$(date +\%F).json`).
- Make sure your host uses a **persistent disk** (VPS / Compute Engine / cPanel)
  — on ephemeral hosts (e.g. Render free tier) `db.json` resets on redeploy.

Crafted for Hotel Jai Laxmi and Lodge — Dipendra Upadhayay (Rajbaar).
