# होटल जय लक्ष्मी & लज — Hotel Jai Laxmi and Lodge

Full management system + public website for Hotel Jai Laxmi AC Restaurant & Lodge,
Dhangadi Chauraha, Sudurpaschim, Nepal.

Built with **Node.js + Express**, **Socket.IO** (real-time), **JWT auth**, a
**JSON file database** (`db.json`), and a **React 18 (CDN) + Framer Motion**
front end served as static files. Online payments via the **eSewa ePay v2** gateway.

## Features
- Public site: rooms with live booking, restaurant menu & ordering, gallery,
  reviews, table reservation, self check-in, customer accounts with booking &
  order history.
- Online payments with **eSewa** (real HMAC signatures + server-side
  verification), plus cash and bank QR. Automatic invoices with print & download.
- Admin panel: dashboard, floors/rooms, restaurant menu, Home & Restaurant page
  content managers, offers, orders, bookings, reservations, gallery, reviews,
  inventory, employees, credit, a **Payments dashboard with revenue charts**, an
  **eSewa banking integration** panel, branding, and an AI report.
- Reception & Kitchen panels with real-time notifications and bill/KOT printing.

## Run locally (Windows)
```
cd "C:\A HOTEL JAILAXMI REAL BY CLAUDE\hotel-jai-laxmi"
npm install
npm start
```
Then open **http://localhost:3000**. To use it on phones on the same Wi-Fi,
open `http://<your-pc-ip>:3000`.

## Logins
The Admin account is created on first run from the `ADMIN_EMAIL` / `ADMIN_PASSWORD`
environment variables (see `.env.example`). **Set a strong password and never
commit it.** Kitchen and Reception staff logins are created inside the Admin panel
under *Employees → Add Employee → Panel access*.

## Configuration & deployment
Copy `.env.example` to `.env` and fill in your values. Full production, domain
and eSewa go-live steps are in **DEPLOYMENT.md**.

## License
© Hotel Jai Laxmi and Lodge. Crafted by Dipendra Upadhayay (Rajbaar).
