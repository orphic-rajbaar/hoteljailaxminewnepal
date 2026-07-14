# Deployment Guide — Hotel Jai Laxmi (www.hoteljailaxmi.com)

This guide takes you from your computer → GitHub → a live website on your domain,
including eSewa payments. Read **Part 2** carefully first: this app stores its data
in a file (`db.json`), so the *type* of hosting you pick matters.

---

## ⚠️ Read this first: what kind of hosting you need

This is a **Node.js application** (it runs `server.js`), not a plain HTML site.
GoDaddy's basic/"Economy" shared hosting **cannot run it**. You need one of:

- **A host that runs Node.js with a permanent disk** — a **VPS** (GoDaddy VPS,
  DigitalOcean, Hetzner…) or a cPanel plan with **"Setup Node.js App"** (GoDaddy
  Deluxe/Ultimate/Business cPanel). This is the **recommended** option because the
  database lives in a file and must survive restarts.
- **Render.com / Railway.app** (easy, connect GitHub and go) — but their free tiers
  use a *temporary* disk, so `db.json` is wiped on every restart/redeploy. Only use
  these if you add a **persistent disk** (a paid add-on) mounted where `db.json` lives.

Your GoDaddy domain (`www.hoteljailaxmi.com`) is just the **address** — you point it
at whichever host actually runs the app (Part 4).

---

## Part 1 — Push the code to GitHub

Do this **on your own computer** (I can't push for you — it needs your GitHub login).

1. Install **Git**: https://git-scm.com/download/win and a GitHub account.
2. Open Command Prompt in the app folder:
   ```
   cd "C:\A HOTEL JAILAXMI REAL BY CLAUDE\hotel-jai-laxmi"
   ```
3. First time only — set your identity:
   ```
   git config --global user.name "Dipendra Upadhayay"
   git config --global user.email "info.dipendraupadhayay.2005@gmail.com"
   ```
4. Create the repo and push:
   ```
   git init
   git add .
   git commit -m "Hotel Jai Laxmi — full system with eSewa payments"
   git branch -M main
   git remote add origin https://github.com/orphic-rajbaar/HOTELJAILAXMI.git
   git push -u origin main
   ```
   When it asks to sign in, use the browser pop-up or a **Personal Access Token**
   (GitHub → Settings → Developer settings → Tokens) as the password.

> `.gitignore` already keeps `node_modules`, your `.env`, and **`db.json`** out of
> the repo. That's on purpose — `db.json` holds your secret keys and password
> hashes and must never be public. The server makes a fresh one on first run.

**To push later updates**, just:
```
git add .
git commit -m "what changed"
git push
```

---

## Part 2 — Deploy the app

### Option A — GoDaddy cPanel, directly from GitHub (recommended if your plan has cPanel + Node)

> ❗ **Do NOT just drop these files into `public_html` via File Manager.** That
> only works for plain HTML sites. This app must be *run* by Node.js. Uploading
> the files without the two steps below will show a blank page or the raw code.

**A1. Pull the repo into cPanel (GitHub → GoDaddy directly):**
1. cPanel → **Git™ Version Control** → **Create**.
2. Clone URL: `https://github.com/orphic-rajbaar/HOTELJAILAXMI.git`
   Repository Path: e.g. `hoteljailaxmi`. Click **Create** — cPanel clones your
   repo straight from GitHub. (To pull later updates: open the repo here → **Pull**.)

**A2. Run it as a Node app:**
3. cPanel → **Setup Node.js App** → **Create Application**.
4. Node version 18+; **Application root** = the folder you just cloned;
   **Application startup file** = **`server.js`**.
5. Click **Run NPM Install**, add the **Environment Variables** (Part 3),
   then **Start/Restart** the app.
6. Set the application URL to your domain (Part 4).

If your cPanel has no "Setup Node.js App", your plan can't run Node — use Option B
(VPS) or Option C (Render) below, and point the domain there.

### Option B — A VPS (GoDaddy VPS, DigitalOcean, etc. — most reliable)
```
# on the server (Ubuntu example)
sudo apt update && sudo apt install -y nodejs npm git
git clone https://github.com/orphic-rajbaar/HOTELJAILAXMI.git
cd HOTELJAILAXMI
npm install
# create your .env (see Part 3)
sudo npm install -g pm2
pm2 start server.js --name hoteljailaxmi
pm2 save && pm2 startup      # keeps it running after reboot
```
Then put **Nginx** in front for HTTPS (free SSL via Let's Encrypt / Certbot) and
proxy port 3000 → 443.

### Option C — Render.com (easiest, but add a persistent disk)
1. Render → **New → Web Service** → connect the GitHub repo.
2. Build command `npm install`, Start command `node server.js`.
3. Add environment variables (Part 3).
4. **Important:** add a **Persistent Disk** and mount it at the app folder so
   `db.json` survives restarts — otherwise your rooms/bookings reset on each deploy.

---

## Part 3 — Environment variables (set these on the host)

| Variable | Value |
|---|---|
| `PUBLIC_BASE_URL` | `https://www.hoteljailaxmi.com` |
| `ADMIN_EMAIL` | your admin email |
| `ADMIN_PASSWORD` | a strong password (change from the default!) |
| `ESEWA_MODE` | `test` for now, `live` when ready |
| `ESEWA_PRODUCT_CODE` | `EPAYTEST` (test) or your live merchant code |
| `ESEWA_SECRET` | test secret or your live secret |
| `PORT` | often set automatically by the host |

`PUBLIC_BASE_URL` **must** match your real domain — eSewa uses it to send the
customer back after payment.

---

## Part 4 — Point www.hoteljailaxmi.com at the host (GoDaddy DNS)

1. GoDaddy → **My Products → Domain → DNS → Manage DNS**.
2. Add/edit records to point at your host:
   - **cPanel/VPS (has an IP):** an **A record** — Host `@` → your server IP, and a
     **CNAME** — Host `www` → `hoteljailaxmi.com`.
   - **Render/Railway (gives a hostname):** a **CNAME** — Host `www` → the host's
     address (e.g. `hoteljailaxmi.onrender.com`), and forward the root domain to
     `www`.
3. In your host's dashboard, add `www.hoteljailaxmi.com` as a **custom domain** and
   enable **HTTPS/SSL** (free, automatic on Render/cPanel; Certbot on a VPS).
4. DNS can take 15 minutes to a few hours to take effect.

---

## Part 5 — Turn eSewa live (when your merchant account is ready)

1. Complete **eSewa merchant onboarding** and get your live **Product Code** +
   **Secret Key**. Give eSewa your live domain for the return URLs.
2. In the **Admin panel → Payment / Bank → eSewa Banking Integration**: switch
   **Mode = Live**, paste your Product Code + Secret Key, click **Save**, then
   **Test Connection**.
3. Make one small real booking to confirm money reaches your merchant account.
   Funds settle to the bank account linked to your eSewa merchant account through
   eSewa's normal process — there is no way to bypass the gateway.

Until then it runs in **test mode**: at eSewa's page use the test login and token
**123456**; no real money moves.

---

## Part 6 — Go-live checklist
- [ ] Changed the admin password (env var), logged in successfully.
- [ ] `PUBLIC_BASE_URL` = your https domain.
- [ ] HTTPS padlock shows on the site.
- [ ] A test eSewa payment completes → lands on the success page with an invoice.
- [ ] Booking/order appears in the Admin **Payments** and **Bookings/Orders**.
- [ ] Site looks right on a phone (nav menu, forms, checkout).
- [ ] `db.json` is on a **persistent** disk (data survives a restart).
- [ ] Re-enter your rooms, menu and content on the live admin (local `db.json`
      is not pushed to GitHub for security).

Crafted by **Dipendra Upadhayay (Rajbaar)**.
