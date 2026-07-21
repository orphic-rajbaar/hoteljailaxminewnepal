# Deploy Hotel Jai Laxmi on Google Compute Engine
### VM + pm2 + Nginx + free SSL + GoDaddy DNS → https://hoteljailaxmi.com

This replaces GoDaddy hosting (and its firewall that was blocking you) with your
own small server on Google Cloud. Your GoDaddy **domain** stays — only the DNS
records change. Total time: ~30–45 minutes.

**Cost note:** an `e2-micro` VM is in Google's Always Free tier (US regions) or
roughly $5–7/month otherwise. `e2-small` (~$13/mo) is more comfortable.

---

## Part 1 — Create the VM

1. Open https://console.cloud.google.com/compute (your project) →
   **Create Instance**.
2. Settings:
   - **Name:** `hoteljailaxmi`
   - **Region:** `asia-south1` (Mumbai — closest to Nepal). For the free tier
     use `us-west1` / `us-central1` / `us-east1` instead.
   - **Machine type:** `e2-small` (or `e2-micro` for free tier)
   - **Boot disk:** click *Change* → **Ubuntu 22.04 LTS**, 20 GB
   - **Firewall:** ✅ Allow HTTP traffic, ✅ Allow HTTPS traffic
3. Click **Create**. Note the **External IP** (e.g. `34.93.xx.xx`).

**Make the IP permanent** (so DNS never breaks):
VPC network → **IP addresses** → find the VM's external IP → ⋮ → **Promote to
static address**.

---

## Part 2 — Install Node and get the code

Click **SSH** next to the VM (browser terminal opens). Then run, one block at a
time:

```bash
# Node.js 20 LTS + git
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git nginx
node -v    # should print v20.x

# get the code
cd ~
git clone https://github.com/orphic-rajbaar/hoteljailaxminewnepal.git app
cd app
npm install
```

---

## Part 3 — Environment variables (secrets)

```bash
nano .env
```

Paste (edit the values!), then save with `Ctrl+O`, `Enter`, `Ctrl+X`:

```
PORT=3000
PUBLIC_BASE_URL=https://hoteljailaxmi.com
ADMIN_EMAIL=info.dipendraupadhayay.2005@gmail.com
ADMIN_PASSWORD=put-a-strong-password-here
# eSewa (switchable later in the admin panel)
ESEWA_MODE=test
# Razorpay (or set the keys in the admin panel instead)
RAZORPAY_KEY_ID=rzp_test_TDpcymBpAN4fxf
RAZORPAY_KEY_SECRET=your-razorpay-secret
```

`PUBLIC_BASE_URL` **must** be the https domain — eSewa uses it for return URLs.

---

## Part 4 — Keep it running with pm2

```bash
sudo npm install -g pm2
pm2 start server.js --name hotel
pm2 save
pm2 startup    # prints one 'sudo env ...' command — copy/paste and run it
```

Now the app auto-restarts on crashes **and** on VM reboots.
Check it: `curl http://localhost:3000` should print HTML.

Useful later: `pm2 logs hotel` (live logs) · `pm2 restart hotel`.

---

## Part 5 — Nginx in front (port 80 → the app)

```bash
sudo nano /etc/nginx/sites-available/hotel
```

Paste:

```nginx
server {
    listen 80;
    server_name hoteljailaxmi.com www.hoteljailaxmi.com;
    client_max_body_size 20M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;      # needed for Socket.IO
        proxy_set_header Connection "upgrade";       # needed for Socket.IO
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable it:

```bash
sudo ln -s /etc/nginx/sites-available/hotel /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t          # must say "syntax is ok"
sudo systemctl reload nginx
```

Test: open `http://YOUR_EXTERNAL_IP` in a browser — the site should load
(no SSL yet).

---

## Part 6 — Point GoDaddy DNS at the VM

GoDaddy → **My Products → hoteljailaxmi.com → DNS → Manage DNS**:

| Type  | Name | Value              | TTL |
|-------|------|--------------------|-----|
| A     | @    | YOUR_EXTERNAL_IP   | 600 |
| CNAME | www  | hoteljailaxmi.com  | 600 |

Delete/disable any old **A records**, **Forwarding**, or **Website Security /
CDN** entries pointing at GoDaddy hosting (that's what was serving the
firewall block page). DNS takes ~15 min–2 h.

Check: `nslookup hoteljailaxmi.com` should return your VM IP.

---

## Part 7 — Free SSL (Let's Encrypt)

After DNS resolves to the VM:

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d hoteljailaxmi.com -d www.hoteljailaxmi.com
```

Answer the prompts (email, agree, and choose **redirect** so all traffic is
HTTPS). Certbot edits Nginx and auto-renews every ~60 days. Done —
https://hoteljailaxmi.com is live with the padlock.

---

## Part 8 — Updating the site later

Push changes to GitHub from your PC, then on the VM:

```bash
cd ~/app
git pull
npm install     # only needed if package.json changed
pm2 restart hotel
```

---

## Part 9 — Protect your data (db.json)

Your database is the file `~/app/db.json` on the VM disk — it persists across
restarts. Back it up occasionally:

```bash
cp ~/app/db.json ~/db-backup-$(date +%F).json
```

(You can also download it from the SSH window's ⚙ menu → Download file.)
⚠ Note: `git pull` never touches `db.json` (it's git-ignored) — your live
data is safe during updates.

---

## Go-live checklist
- [ ] `https://hoteljailaxmi.com` loads with a padlock, no firewall block.
- [ ] Admin login works; you changed the admin password.
- [ ] Test eSewa payment completes → success page + invoice.
- [ ] Razorpay test card works (4111 1111 1111 1111).
- [ ] Google Login button appears (after adding the domain to the OAuth
      client's Authorized JavaScript origins and saving the Client ID in
      Admin → Payment/Bank).
- [ ] Phone + tablet views look right.
- [ ] `pm2 status` shows `hotel` online; reboot the VM once and confirm the
      site comes back by itself.

Crafted for Hotel Jai Laxmi and Lodge — Dipendra Upadhayay (Rajbaar).
