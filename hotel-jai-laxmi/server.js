/*  होटल जय लक्ष्मी & लज — Hotel Jai Laxmi and Lodge
    Backend: Express + Socket.IO + JSON database + JWT auth
    Crafted by Dipendra Upadhayay (Rajbaar) */

const express = require("express");
const http = require("http");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.json({ limit: "15mb" }));
/* never let the browser serve a stale copy of the app code — always revalidate
   .jsx / .css / .html so bug fixes reach every device immediately */
app.use((req, res, next) => {
  if (/\.(jsx|css|html)$/i.test(req.path)) res.set("Cache-Control", "no-cache, must-revalidate");
  next();
});
app.use(express.static(path.join(__dirname, "public")));

/* ---------------- Database (JSON file) ---------------- */
const DB_FILE = path.join(__dirname, "db.json");

function freshDB() {
  return {
    secret: crypto.randomBytes(32).toString("hex"),
    users: [],
    floors: [],
    rooms: [],
    bookings: [],
    menu: [],
    orders: [],
    inventory: [],
    employees: [],
    reservations: [],
    gallery: [],
    reviews: [],
    transactions: [], // income & expense records
    credits: [],
    payment: { accountName: "", accountNumber: "", apiKey: "", bankName: "",
      esewaMode: "test", esewaProductCode: "EPAYTEST", esewaSecret: "8gBm/:&EnhH.1/q(", esewaEnabled: true },
    branding: { logo: "", favicon: "" },
    content: defaultContent(),
    payments: [],   // eSewa & other payment transactions
    auditLog: [],   // deletions & sensitive admin actions
    counters: { order: 0, booking: 0, bill: 0, invoice: 0 }
  };
}

/* editable website content managed from the admin panel (Home + Restaurant) */
function defaultContent() {
  return {
    home: { heroVideo: "", heroPoster: "" },
    restaurant: { heroPhoto: "", heroVideo: "", heroTitle: "", heroSubtitle: "" },
    benefits: [],   // { id, name, photo }               — homepage benefits
    amenities: [],  // { id, heading, desc, photo }       — homepage premium amenities
    offers: [],     // { id, heading, desc, photo }       — homepage offers & packages
    facilities: [], // { id, name, icon }                 — restaurant dining facilities
    chefs: [],      // { id, name, role, desc, photo }    — meet our kitchen chef
    celebrate: []   // { id, name, desc, photo }          — celebrate with us
  };
}
function ensureContentShape() {
  const d = defaultContent();
  db.content = db.content || d;
  db.content.home = Object.assign({}, d.home, db.content.home);
  db.content.restaurant = Object.assign({}, d.restaurant, db.content.restaurant);
  for (const k of ["benefits", "amenities", "offers", "facilities", "chefs", "celebrate"])
    if (!Array.isArray(db.content[k])) db.content[k] = [];
}

let db;
if (fs.existsSync(DB_FILE)) {
  db = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  db.reservations = db.reservations || []; // migration for older db files
  db.branding = db.branding || { logo: "", favicon: "" };
  db.gallery = db.gallery || [];
  db.reviews = db.reviews || [];
  db.payments = db.payments || [];
  db.auditLog = db.auditLog || [];
  db.counters.invoice = db.counters.invoice || 0;
  db.payment = db.payment || {};
  if (db.payment.esewaMode === undefined) db.payment.esewaMode = "test";
  if (db.payment.esewaProductCode === undefined) db.payment.esewaProductCode = "EPAYTEST";
  if (db.payment.esewaSecret === undefined) db.payment.esewaSecret = "8gBm/:&EnhH.1/q(";
  if (db.payment.esewaEnabled === undefined) db.payment.esewaEnabled = true;
  ensureContentShape();
} else {
  db = freshDB();
}

/* Admin credentials come from environment variables in production so they are
   never committed to a public repo. On a fresh server, set ADMIN_EMAIL and
   ADMIN_PASSWORD env vars; otherwise these safe defaults are used. Your existing
   local db.json already has your admin account, so local login is unaffected. */
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "info.dipendraupadhayay.2005@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

function ensureAdmin() {
  if (!db.users.find(u => u.email === ADMIN_EMAIL)) {
    db.users.push({
      id: uid(),
      name: "Dipendra Upadhayay",
      email: ADMIN_EMAIL,
      passwordHash: bcrypt.hashSync(ADMIN_PASSWORD, 10),
      role: "admin",
      access: ["admin", "reception", "kitchen"]
    });
  }
}

let saveTimer = null;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  }, 150);
}

function uid() {
  return crypto.randomBytes(8).toString("hex");
}

ensureAdmin();
save();

/* ---------------- Auth ---------------- */
function sign(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, access: user.access, name: user.name },
    db.secret,
    { expiresIn: "12h" }
  );
}

function auth(...allowed) {
  return (req, res, next) => {
    const h = req.headers.authorization || "";
    const token = h.startsWith("Bearer ") ? h.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Not logged in" });
    try {
      const payload = jwt.verify(token, db.secret);
      const user = db.users.find(u => u.id === payload.id);
      if (!user) return res.status(401).json({ error: "User no longer exists" });
      req.user = user;
      if (allowed.length && !allowed.some(a => user.role === a || (user.access || []).includes(a)))
        return res.status(403).json({ error: "Access denied" });
      next();
    } catch (e) {
      return res.status(401).json({ error: "Session expired, login again" });
    }
  };
}

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  const user = db.users.find(u => (u.email || "").toLowerCase() === String(email || "").toLowerCase());
  if (!user || !bcrypt.compareSync(password || "", user.passwordHash))
    return res.status(401).json({ error: "Invalid email or password" });
  res.json({ token: sign(user), user: publicUser(user) });
});

app.get("/api/auth/me", auth(), (req, res) => res.json(publicUser(req.user)));

function publicUser(u) {
  return { id: u.id, name: u.name, email: u.email, role: u.role, access: u.access || [], phone: u.phone || "", age: u.age || null, photo: u.photo || "" };
}

/* ---------------- Customer accounts (public login / signup) ---------------- */
app.post("/api/public/signup", (req, res) => {
  const { name, email, phone, age, password, photo } = req.body || {};
  if (!name || !email || !password)
    return res.status(400).json({ error: "Name, email and password are required" });
  if (String(password).length < 4)
    return res.status(400).json({ error: "Password must be at least 4 characters" });
  if (db.users.find(u => (u.email || "").toLowerCase() === String(email).toLowerCase()))
    return res.status(409).json({ error: "An account with this email already exists — please log in" });
  const user = {
    id: uid(), name, email, phone: phone || "", age: Number(age) || null, photo: photo || "",
    passwordHash: bcrypt.hashSync(password, 10), role: "customer", access: [],
    createdAt: new Date().toISOString()
  };
  db.users.push(user); save();
  res.json({ token: sign(user), user: publicUser(user) });
});
app.post("/api/public/signin", (req, res) => {
  const { email, password } = req.body || {};
  const user = db.users.find(u => (u.email || "").toLowerCase() === String(email || "").toLowerCase());
  if (!user || !bcrypt.compareSync(password || "", user.passwordHash))
    return res.status(401).json({ error: "Invalid email or password" });
  res.json({ token: sign(user), user: publicUser(user) });
});
/* a logged-in customer's own booking + order history (matched by phone) */
app.get("/api/public/my-history", auth(), (req, res) => {
  const u = req.user;
  const norm = p => String(p || "").replace(/\D/g, "").slice(-9);
  const myPhone = norm(u.phone);
  const mine = s => myPhone && norm(s.phone) === myPhone;
  const bookings = db.bookings.filter(mine).slice().reverse();
  const orders = db.orders.filter(mine).slice().reverse();
  res.json({ bookings, orders });
});

/* ---------------- Website content (public read, admin write) ---------------- */
const CONTENT_LISTS = ["benefits", "amenities", "offers", "facilities", "chefs", "celebrate"];
app.get("/api/public/content", (req, res) => res.json(db.content));
app.get("/api/content", auth("admin"), (req, res) => res.json(db.content));
app.put("/api/content", auth("admin"), (req, res) => {
  if (req.body.home) Object.assign(db.content.home, req.body.home);
  if (req.body.restaurant) Object.assign(db.content.restaurant, req.body.restaurant);
  save(); changed("content"); res.json(db.content);
});
app.post("/api/content/:section", auth("admin"), (req, res) => {
  const s = req.params.section;
  if (!CONTENT_LISTS.includes(s)) return res.status(400).json({ error: "Unknown content section" });
  const { id, createdAt, ...rest } = req.body || {};
  const item = { id: uid(), ...rest, order: db.content[s].length, createdAt: new Date().toISOString() };
  db.content[s].push(item); save(); changed("content"); res.json(item);
});
app.put("/api/content/:section/:id", auth("admin"), (req, res) => {
  const s = req.params.section;
  if (!CONTENT_LISTS.includes(s)) return res.status(400).json({ error: "Unknown content section" });
  const it = db.content[s].find(x => x.id === req.params.id);
  if (!it) return res.status(404).json({ error: "Item not found" });
  const { id, ...rest } = req.body || {};
  Object.assign(it, rest); save(); changed("content"); res.json(it);
});
app.delete("/api/content/:section/:id", auth("admin"), (req, res) => {
  const s = req.params.section;
  if (!CONTENT_LISTS.includes(s)) return res.status(400).json({ error: "Unknown content section" });
  db.content[s] = db.content[s].filter(x => x.id !== req.params.id);
  save(); changed("content"); res.json({ ok: true });
});

/* ================= eSewa ePay v2 Payment Gateway =================
   Official flow: sign (HMAC-SHA256, base64) the initiation, redirect the
   customer to eSewa, then verify the signed response + status API server-side
   before creating the booking/order. Amounts are ALWAYS computed here from the
   database — the client's number is never trusted. Test mode uses eSewa's public
   sandbox (product_code EPAYTEST). To go live, set the env vars ESEWA_MODE=live,
   ESEWA_PRODUCT_CODE and ESEWA_SECRET from your eSewa merchant account. */
/* eSewa config is stored in db.payment and editable from the admin panel.
   Env vars still work as a fallback for server-level overrides. */
function esewaCfg() {
  const p = db.payment || {};
  const mode = String(p.esewaMode || process.env.ESEWA_MODE || "test").toLowerCase();
  return {
    mode,
    enabled: p.esewaEnabled !== false,
    productCode: p.esewaProductCode || process.env.ESEWA_PRODUCT_CODE || "EPAYTEST",
    secret: p.esewaSecret || process.env.ESEWA_SECRET || "8gBm/:&EnhH.1/q(",
    formUrl: mode === "live" ? "https://epay.esewa.com.np/api/epay/main/v2/form" : "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
    statusUrl: mode === "live" ? "https://esewa.com.np/api/epay/transaction/status/" : "https://rc.esewa.com.np/api/epay/transaction/status/"
  };
}
function esewaSign(str, secret) { return crypto.createHmac("sha256", secret).update(str).digest("base64"); }
function baseUrl(req) { return process.env.PUBLIC_BASE_URL || (req.protocol + "://" + req.headers.host); }
function nextInvoice() { db.counters.invoice = (db.counters.invoice || 0) + 1; return "INV-" + String(db.counters.invoice).padStart(5, "0"); }

/* authoritative amount from the DB — never trust the client's number */
function computeAmount(payload) {
  let roomTotal = 0, foodTotal = 0;
  if (payload.booking && payload.booking.roomId) {
    const room = db.rooms.find(r => r.id === payload.booking.roomId);
    if (!room) return { error: "Room not found" };
    if (room.booked) return { error: "Room is already booked" };
    const nights = nightsBetween(payload.booking.checkIn, payload.booking.checkOut);
    roomTotal = nights * (Number(room.price) || 0);
  }
  if (Array.isArray(payload.items)) {
    for (const it of payload.items) {
      const m = db.menu.find(x => x.id === it.id);
      if (!m) continue;
      foodTotal += Math.max(1, Number(it.qty) || 1) * m.price;
    }
  }
  const subtotal = roomTotal + foodTotal;
  const tax = 0, service = 0, discount = 0;
  return { roomTotal, foodTotal, subtotal, tax, service, discount, total: subtotal + tax + service - discount };
}

app.post("/api/public/esewa/initiate", (req, res) => {
  const { booking, items, name, phone, email } = req.body || {};
  if (!name || !phone) return res.status(400).json({ error: "Name and phone are required" });
  const calc = computeAmount({ booking, items });
  if (calc.error) return res.status(400).json(calc);
  if (calc.total <= 0) return res.status(400).json({ error: "There is nothing to pay for" });
  const cfg = esewaCfg();
  if (!cfg.enabled) return res.status(400).json({ error: "eSewa online payment is currently disabled" });
  const uuid = "HJL-" + Date.now() + "-" + uid().slice(0, 6);
  const payment = {
    id: uid(), invoiceNumber: nextInvoice(), transactionUuid: uuid,
    kind: booking ? (items && items.length ? "mixed" : "room") : "restaurant",
    method: "esewa", status: "pending",
    customerName: name, email: email || "", phone,
    amount: calc.subtotal, tax: calc.tax, serviceCharge: calc.service, discount: calc.discount, totalAmount: calc.total,
    productCode: cfg.productCode, esewaRef: "", signature: "", verifyResponse: null,
    bookingId: "", orderId: "", notes: "", remarks: "",
    pending: { booking: booking || null, items: items || [], name, phone, email: email || "" },
    audit: [{ at: new Date().toISOString(), by: "system", action: "payment initiated" }],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  };
  const signature = esewaSign(`total_amount=${calc.total},transaction_uuid=${uuid},product_code=${cfg.productCode}`, cfg.secret);
  payment.signature = signature;
  db.payments.push(payment); save(); changed("payments");
  const b = baseUrl(req);
  res.json({
    url: cfg.formUrl, paymentId: payment.id, total: calc.total,
    fields: {
      amount: String(calc.total), tax_amount: "0", total_amount: String(calc.total),
      transaction_uuid: uuid, product_code: cfg.productCode,
      product_service_charge: "0", product_delivery_charge: "0",
      success_url: b + "/api/public/esewa/callback",
      failure_url: b + "/api/public/esewa/failure?uuid=" + encodeURIComponent(uuid),
      signed_field_names: "total_amount,transaction_uuid,product_code",
      signature
    }
  });
});

function finalizePayment(payment, data) {
  const pend = payment.pending || {};
  if (pend.booking && pend.booking.roomId) {
    const room = db.rooms.find(r => r.id === pend.booking.roomId);
    if (room && !room.booked) {
      const bk = buildBooking(room, { ...pend.booking, name: pend.name, phone: pend.phone, paymentMethod: "esewa" }, "online");
      payment.bookingId = bk.id;
      notify("booking", "🛏️ New Room Booking (eSewa PAID)", `Room ${room.number} — ${bk.name} · रू ${bk.total} · PAID via eSewa`, bk);
    }
  }
  if (Array.isArray(pend.items) && pend.items.length) {
    const od = createOrder({ items: pend.items, name: pend.name, phone: pend.phone, paymentMethod: "esewa", source: "online" });
    if (!od.error) payment.orderId = od.id;
  }
  payment.status = "success";
  payment.esewaRef = data.transaction_code || data.refId || "";
  payment.paidAt = new Date().toISOString();
  payment.updatedAt = new Date().toISOString();
  payment.audit.push({ at: new Date().toISOString(), by: "esewa", action: "payment verified & completed" });
}

app.get("/api/public/esewa/callback", async (req, res) => {
  try {
    if (!req.query.data) return res.redirect("/#/payment-failed");
    const data = JSON.parse(Buffer.from(String(req.query.data), "base64").toString("utf8"));
    const payment = db.payments.find(p => p.transactionUuid === data.transaction_uuid);
    if (!payment) return res.redirect("/#/payment-failed");
    const cfg = esewaCfg();
    /* 1) verify the response signature (same HMAC process, response field order) */
    const signStr = String(data.signed_field_names || "").split(",").map(f => `${f}=${data[f]}`).join(",");
    const sigOk = esewaSign(signStr, cfg.secret) === data.signature;
    let statusOk = String(data.status || "").toUpperCase() === "COMPLETE";
    /* 2) re-check server-side with the status API (best effort) */
    try {
      const u = `${cfg.statusUrl}?product_code=${cfg.productCode}&total_amount=${payment.totalAmount}&transaction_uuid=${payment.transactionUuid}`;
      const j = await (await fetch(u)).json();
      payment.verifyResponse = j;
      if (j && String(j.status).toUpperCase() === "COMPLETE") statusOk = true;
    } catch (e) { /* offline / sandbox unreachable — fall back to the signed response */ }
    if (!(sigOk && statusOk)) {
      if (payment.status === "pending") { payment.status = "failed"; payment.updatedAt = new Date().toISOString(); payment.audit.push({ at: new Date().toISOString(), by: "system", action: "verification failed" }); }
      save(); changed("payments");
      return res.redirect("/#/payment-failed?pid=" + payment.id);
    }
    if (payment.status !== "success") finalizePayment(payment, data);
    save(); changed("payments");
    return res.redirect("/#/payment-success?pid=" + payment.id);
  } catch (e) {
    return res.redirect("/#/payment-failed");
  }
});

app.get("/api/public/esewa/failure", (req, res) => {
  const p = db.payments.find(x => x.transactionUuid === req.query.uuid);
  if (p && p.status === "pending") {
    p.status = "cancelled"; p.updatedAt = new Date().toISOString();
    p.audit.push({ at: new Date().toISOString(), by: "esewa", action: "cancelled / failed at gateway" });
    save(); changed("payments");
  }
  res.redirect("/#/payment-failed" + (p ? "?pid=" + p.id : ""));
});

/* public: minimal payment record for the success page (no secrets) */
app.get("/api/public/payment/:id", (req, res) => {
  const p = db.payments.find(x => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: "Payment not found" });
  res.json({
    id: p.id, invoiceNumber: p.invoiceNumber, transactionUuid: p.transactionUuid, esewaRef: p.esewaRef,
    status: p.status, method: p.method, kind: p.kind, totalAmount: p.totalAmount,
    customerName: p.customerName, phone: p.phone, email: p.email, createdAt: p.createdAt, paidAt: p.paidAt,
    booking: p.bookingId ? db.bookings.find(b => b.id === p.bookingId) : null,
    order: p.orderId ? db.orders.find(o => o.id === p.orderId) : null
  });
});

/* ---------------- Admin: Payment management ---------------- */
app.get("/api/payments", auth("admin", "reception"), (req, res) => {
  res.json(db.payments.map(p => ({ ...p, pending: undefined })).slice().reverse());
});
app.patch("/api/payments/:id", auth("admin"), (req, res) => {
  const p = db.payments.find(x => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: "Payment not found" });
  const before = p.status;
  const allowed = ["pending", "processing", "success", "failed", "cancelled", "refunded"];
  if (req.body.status && allowed.includes(req.body.status)) p.status = req.body.status;
  if (req.body.notes !== undefined) p.notes = req.body.notes;
  if (req.body.remarks !== undefined) p.remarks = req.body.remarks;
  /* cancelling a room payment frees the room again */
  if (p.status === "cancelled" && p.bookingId) {
    const bk = db.bookings.find(b => b.id === p.bookingId);
    if (bk) { const room = db.rooms.find(r => r.id === bk.roomId); if (room) room.booked = false; bk.status = "cancelled"; changed("rooms"); changed("bookings"); }
  }
  p.updatedAt = new Date().toISOString();
  p.audit.push({ at: new Date().toISOString(), by: req.user.name, action: "admin edit" + (p.status !== before ? ` · status ${before} → ${p.status}` : "") + (req.body.notes !== undefined || req.body.remarks !== undefined ? " · notes updated" : "") });
  save(); changed("payments"); res.json({ ...p, pending: undefined });
});
app.delete("/api/payments/:id", auth("admin"), (req, res) => {
  const p = db.payments.find(x => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: "Payment not found" });
  db.auditLog.push({ at: new Date().toISOString(), by: req.user.name, action: "DELETED payment", invoiceNumber: p.invoiceNumber, amount: p.totalAmount, customer: p.customerName, txn: p.transactionUuid });
  db.payments = db.payments.filter(x => x.id !== req.params.id);
  save(); changed("payments"); res.json({ ok: true });
});
app.get("/api/audit-log", auth("admin"), (req, res) => res.json(db.auditLog.slice().reverse()));

/* eSewa integration status + connectivity test (admin) */
app.get("/api/esewa/status", auth("admin"), async (req, res) => {
  const cfg = esewaCfg();
  const sampleSignature = esewaSign("total_amount=100,transaction_uuid=test-123,product_code=" + cfg.productCode, cfg.secret);
  let reachable = false;
  try {
    const u = `${cfg.statusUrl}?product_code=${cfg.productCode}&total_amount=100&transaction_uuid=hjl-ping-${Date.now()}`;
    const r = await fetch(u, { method: "GET" });
    reachable = !!r; // any HTTP response (even NOT_FOUND) means eSewa is reachable
  } catch (e) { reachable = false; }
  res.json({
    mode: cfg.mode, enabled: cfg.enabled, productCode: cfg.productCode,
    secretMasked: cfg.secret ? cfg.secret.slice(0, 3) + "••••" + cfg.secret.slice(-2) : "",
    formUrl: cfg.formUrl, statusUrl: cfg.statusUrl, sampleSignature, reachable,
    payments: db.payments.length, revenue: db.payments.filter(p => p.status === "success").reduce((s, p) => s + (Number(p.totalAmount) || 0), 0)
  });
});

/* ---------------- Notifications ---------------- */
function notify(type, title, message, data) {
  const n = { id: uid(), type, title, message, data, time: new Date().toISOString() };
  io.emit("notify", n);
  io.emit("data-changed", { collection: type });
}
function changed(collection) {
  io.emit("data-changed", { collection });
}

/* ---------------- Public API ---------------- */
app.get("/api/public/info", (req, res) => {
  res.json({
    nameNe: "होटल जय लक्ष्मी & लज",
    nameEn: "HOTEL JAI LAXMI AND LODGE",
    payment: {
      accountName: db.payment.accountName,
      accountNumber: db.payment.accountNumber,
      bankName: db.payment.bankName,
      qrReady: !!(db.payment.accountName && db.payment.accountNumber && db.payment.apiKey)
    }
  });
});

app.get("/api/public/rooms", (req, res) => {
  const rooms = db.rooms.map(r => ({
    id: r.id, number: r.number, type: r.type, price: r.price,
    special: r.special, floorId: r.floorId,
    floor: (db.floors.find(f => f.id === r.floorId) || {}).name || "",
    photos: r.photos || [], booked: r.booked
  }));
  res.json({ floors: db.floors, rooms });
});

app.get("/api/public/menu", (req, res) => {
  res.json(db.menu.filter(m => m.available !== false));
});

/* shared booking builder: auto night calculation + paid/pending */
function nightsBetween(ci, co) {
  if (!ci || !co) return 1;
  const n = Math.round((new Date(co) - new Date(ci)) / 86400000);
  return Math.max(1, n || 1);
}

function buildBooking(room, body, source) {
  const checkIn = body.checkIn || new Date().toISOString().slice(0, 10);
  const checkOut = body.checkOut || "";
  const nights = nightsBetween(checkIn, checkOut);
  const total = nights * (Number(room.price) || 0);
  let paidAmount = Math.max(0, Math.min(total, Number(body.paidAmount) || 0));
  if ((body.paymentMethod === "online" || body.paymentMethod === "esewa") && source === "online") paidAmount = total;
  if (body.paid === true) paidAmount = total;
  db.counters.booking++;
  const booking = {
    id: uid(), no: db.counters.booking, roomId: room.id, roomNumber: room.number,
    roomType: room.type, price: room.price, nights, total,
    paidAmount, pendingAmount: total - paidAmount, paid: total - paidAmount <= 0,
    name: body.name, phone: body.phone,
    address: body.address || "", persons: Number(body.persons) || 1,
    idPhoto: body.idPhoto || "", note: body.note || "",
    checkIn, checkOut, paymentMethod: body.paymentMethod || "cash",
    status: "booked", source, createdAt: new Date().toISOString()
  };
  room.booked = true;
  db.bookings.push(booking);
  db.transactions.push({ id: uid(), kind: "income", category: "Room Booking",
    amount: total, note: `Room ${room.number} — ${booking.name} · ${nights} night(s) (${booking.paymentMethod})`,
    paid: booking.paid, refId: booking.id, date: new Date().toISOString() });
  return booking;
}

/* Public room booking */
app.post("/api/public/bookings", (req, res) => {
  const { roomId, name, phone } = req.body || {};
  const room = db.rooms.find(r => r.id === roomId);
  if (!room) return res.status(404).json({ error: "Room not found" });
  if (room.booked) return res.status(409).json({ error: "Room is already booked" });
  if (!name || !phone) return res.status(400).json({ error: "Name and phone are required" });
  const booking = buildBooking(room, req.body, "online");
  save();
  notify("booking", "🛏️ New Room Booking!",
    `Room ${room.number} (${room.type}) — ${booking.nights} night(s), रू ${booking.total} — ${name} (${phone}) · ${booking.paymentMethod.toUpperCase()}${booking.pendingAmount > 0 ? " · रू " + booking.pendingAmount + " PENDING" : " · PAID ✓"}`, booking);
  res.json(booking);
});

/* Public restaurant order */
app.post("/api/public/orders", (req, res) => {
  const { items, name, phone, table, paymentMethod } = req.body || {};
  if (!Array.isArray(items) || !items.length) return res.status(400).json({ error: "Cart is empty" });
  if (!name || !phone) return res.status(400).json({ error: "Name and phone are required" });
  const order = createOrder({ items, name, phone, table, paymentMethod, source: "online" });
  if (order.error) return res.status(400).json(order);
  res.json(order);
});

function createOrder({ items, name, phone, table, paymentMethod, source, byUser }) {
  const lines = [];
  let total = 0;
  for (const it of items) {
    const m = db.menu.find(x => x.id === it.id);
    if (!m) continue;
    const qty = Math.max(1, Number(it.qty) || 1);
    lines.push({ id: m.id, foodName: m.foodName, price: m.price, foodType: m.foodType, qty, amount: qty * m.price });
    total += qty * m.price;
  }
  if (!lines.length) return { error: "No valid items in order" };
  db.counters.order++;
  db.counters.bill++;
  const order = {
    id: uid(), no: db.counters.order, billNo: db.counters.bill,
    items: lines, total, name: name || "Walk-in", phone: phone || "",
    table: table || "", paymentMethod: paymentMethod || "cash",
    paid: paymentMethod === "online" || paymentMethod === "esewa" || source === "pos",
    status: "pending", // pending -> received -> making -> ready -> completed
    source: source || "pos", byUser: byUser || "",
    createdAt: new Date().toISOString()
  };
  db.orders.push(order);
  db.transactions.push({ id: uid(), kind: "income", category: "Restaurant",
    amount: total, note: `Order #${order.no} — ${order.name} (${order.paymentMethod})`,
    paid: order.paid, refId: order.id, date: new Date().toISOString() });
  save();
  notify("order", "🍽️ New Restaurant Order!",
    `Order #${order.no} — ${lines.length} item(s), रू ${total} — ${order.name}${order.table ? " · Table " + order.table : ""}`, order);
  return order;
}

/* ---------------- Floors & Rooms (admin + reception) ---------------- */
app.get("/api/floors", auth("admin", "reception"), (req, res) => res.json(db.floors));
app.post("/api/floors", auth("admin", "reception"), (req, res) => {
  const f = { id: uid(), name: req.body.name || "New Floor" };
  db.floors.push(f); save(); changed("floors"); res.json(f);
});
app.delete("/api/floors/:id", auth("admin", "reception"), (req, res) => {
  db.floors = db.floors.filter(f => f.id !== req.params.id);
  db.rooms = db.rooms.filter(r => r.floorId !== req.params.id);
  save(); changed("floors"); res.json({ ok: true });
});

app.get("/api/rooms", auth("admin", "reception"), (req, res) => res.json(db.rooms));
app.post("/api/rooms", auth("admin", "reception"), (req, res) => {
  const { floorId, number, type, price, special } = req.body || {};
  if (!number || !type) return res.status(400).json({ error: "Room number and type required" });
  if (db.rooms.find(r => String(r.number) === String(number)))
    return res.status(409).json({ error: "Room number already exists" });
  const r = { id: uid(), floorId, number, type, price: Number(price) || 0, special: special || "",
    photos: Array.isArray(req.body.photos) ? req.body.photos : [], booked: false };
  db.rooms.push(r); save(); changed("rooms"); res.json(r);
});
app.put("/api/rooms/:id", auth("admin", "reception"), (req, res) => {
  const r = db.rooms.find(x => x.id === req.params.id);
  if (!r) return res.status(404).json({ error: "Room not found" });
  Object.assign(r, {
    floorId: req.body.floorId ?? r.floorId, number: req.body.number ?? r.number,
    type: req.body.type ?? r.type, price: req.body.price !== undefined ? Number(req.body.price) : r.price,
    special: req.body.special ?? r.special,
    photos: Array.isArray(req.body.photos) ? req.body.photos : r.photos,
    booked: req.body.booked !== undefined ? !!req.body.booked : r.booked
  });
  save(); changed("rooms"); res.json(r);
});
app.delete("/api/rooms/:id", auth("admin", "reception"), (req, res) => {
  db.rooms = db.rooms.filter(r => r.id !== req.params.id);
  save(); changed("rooms"); res.json({ ok: true });
});

/* ---------------- Bookings (admin + reception) ---------------- */
app.get("/api/bookings", auth("admin", "reception"), (req, res) => res.json(db.bookings.slice().reverse()));
app.post("/api/bookings", auth("admin", "reception"), (req, res) => {
  const room = db.rooms.find(r => r.id === req.body.roomId);
  if (!room) return res.status(404).json({ error: "Room not found" });
  if (room.booked) return res.status(409).json({ error: "Room is already booked" });
  req.body.name = req.body.name || "Guest";
  const booking = buildBooking(room, req.body, "reception");
  save();
  notify("booking", "🛏️ Room Booked (Reception)",
    `Room ${room.number} — ${booking.nights} night(s), रू ${booking.total} for ${booking.name}${booking.pendingAmount > 0 ? " · रू " + booking.pendingAmount + " pending" : ""}`, booking);
  res.json(booking);
});
app.patch("/api/bookings/:id", auth("admin", "reception"), (req, res) => {
  const b = db.bookings.find(x => x.id === req.params.id);
  if (!b) return res.status(404).json({ error: "Booking not found" });
  // migration defaults for old bookings
  if (b.total === undefined) { b.nights = nightsBetween(b.checkIn, b.checkOut); b.total = b.nights * (Number(b.price) || 0); b.paidAmount = b.paid ? b.total : 0; b.pendingAmount = b.total - b.paidAmount; }
  if (req.body.status) {
    b.status = req.body.status;
    if (["checked-out", "cancelled"].includes(b.status)) {
      const room = db.rooms.find(r => r.id === b.roomId);
      if (room) room.booked = false;
    }
  }
  /* record a payment towards the booking */
  if (req.body.addPayment !== undefined) {
    const amt = Math.max(0, Number(req.body.addPayment) || 0);
    b.paidAmount = Math.min(b.total, (b.paidAmount || 0) + amt);
    b.pendingAmount = b.total - b.paidAmount;
    b.paid = b.pendingAmount <= 0;
  }
  if (req.body.paid !== undefined) {
    b.paid = !!req.body.paid;
    if (b.paid) { b.paidAmount = b.total; b.pendingAmount = 0; }
  }
  const t = db.transactions.find(t => t.refId === b.id);
  if (t) t.paid = b.paid;
  save(); changed("bookings"); changed("rooms");
  res.json(b);
});

/* ---------------- Restaurant Menu ---------------- */
app.get("/api/menu", auth("admin", "reception", "kitchen"), (req, res) => res.json(db.menu));
app.post("/api/menu", auth("admin"), (req, res) => {
  const { foodName, price, foodType, photo, category, desc, prepTime, spice, chefSpecial } = req.body || {};
  if (!foodName) return res.status(400).json({ error: "Food name required" });
  const m = { id: uid(), foodName, price: Number(price) || 0,
    foodType: foodType === "nonveg" ? "nonveg" : "veg", photo: photo || "", available: true,
    category: category || "", desc: desc || "", prepTime: Number(prepTime) || 15,
    spice: Math.min(3, Math.max(0, Number(spice) || 0)), chefSpecial: !!chefSpecial };
  db.menu.push(m); save(); changed("menu"); res.json(m);
});
app.put("/api/menu/:id", auth("admin"), (req, res) => {
  const m = db.menu.find(x => x.id === req.params.id);
  if (!m) return res.status(404).json({ error: "Menu item not found" });
  Object.assign(m, {
    foodName: req.body.foodName ?? m.foodName,
    price: req.body.price !== undefined ? Number(req.body.price) : m.price,
    foodType: req.body.foodType ?? m.foodType,
    photo: req.body.photo ?? m.photo,
    category: req.body.category ?? m.category,
    desc: req.body.desc ?? m.desc,
    prepTime: req.body.prepTime !== undefined ? Number(req.body.prepTime) || 15 : m.prepTime,
    spice: req.body.spice !== undefined ? Math.min(3, Math.max(0, Number(req.body.spice) || 0)) : m.spice,
    chefSpecial: req.body.chefSpecial !== undefined ? !!req.body.chefSpecial : m.chefSpecial,
    available: req.body.available !== undefined ? !!req.body.available : m.available
  });
  save(); changed("menu"); res.json(m);
});
app.delete("/api/menu/:id", auth("admin"), (req, res) => {
  db.menu = db.menu.filter(m => m.id !== req.params.id);
  save(); changed("menu"); res.json({ ok: true });
});

/* ---------------- Orders (kitchen + reception + admin) ---------------- */
app.get("/api/orders", auth("admin", "reception", "kitchen"), (req, res) => res.json(db.orders.slice().reverse()));
app.post("/api/orders", auth("admin", "reception"), (req, res) => {
  const order = createOrder({ ...req.body, source: "pos", byUser: req.user.name });
  if (order.error) return res.status(400).json(order);
  res.json(order);
});
app.patch("/api/orders/:id", auth("admin", "reception", "kitchen"), (req, res) => {
  const o = db.orders.find(x => x.id === req.params.id);
  if (!o) return res.status(404).json({ error: "Order not found" });
  const allowed = ["pending", "received", "making", "ready", "completed", "cancelled"];
  if (req.body.status && allowed.includes(req.body.status)) {
    o.status = req.body.status;
    const msgs = {
      received: `👨‍🍳 Kitchen received order #${o.no}`,
      making: `🔥 Order #${o.no} is being prepared`,
      ready: `✅ Order #${o.no} is READY!`,
      completed: `Order #${o.no} completed`,
      cancelled: `Order #${o.no} cancelled`
    };
    if (msgs[o.status]) notify("order-status", "Order Update", msgs[o.status], o);
  }
  if (req.body.paid !== undefined) {
    o.paid = !!req.body.paid;
    const t = db.transactions.find(t => t.refId === o.id);
    if (t) t.paid = o.paid;
  }
  save(); changed("orders"); res.json(o);
});

/* ---------------- Inventory ---------------- */
app.get("/api/inventory", auth("admin", "reception"), (req, res) => res.json(db.inventory));
app.post("/api/inventory", auth("admin"), (req, res) => {
  const { name, qty, unit, note } = req.body || {};
  if (!name) return res.status(400).json({ error: "Item name required" });
  const it = { id: uid(), name, qty: Number(qty) || 0, unit: unit || "pcs", note: note || "",
    updatedAt: new Date().toISOString() };
  db.inventory.push(it); save(); changed("inventory"); res.json(it);
});
app.put("/api/inventory/:id", auth("admin"), (req, res) => {
  const it = db.inventory.find(x => x.id === req.params.id);
  if (!it) return res.status(404).json({ error: "Item not found" });
  Object.assign(it, { name: req.body.name ?? it.name,
    qty: req.body.qty !== undefined ? Number(req.body.qty) : it.qty,
    unit: req.body.unit ?? it.unit, note: req.body.note ?? it.note,
    updatedAt: new Date().toISOString() });
  save(); changed("inventory"); res.json(it);
});
app.delete("/api/inventory/:id", auth("admin"), (req, res) => {
  db.inventory = db.inventory.filter(i => i.id !== req.params.id);
  save(); changed("inventory"); res.json({ ok: true });
});

/* ---------------- Employees & access control ---------------- */
app.get("/api/employees", auth("admin"), (req, res) => {
  res.json(db.employees.map(e => ({ ...e, password: undefined })));
});
app.post("/api/employees", auth("admin"), (req, res) => {
  const { name, phone, empId, photo, email, password, access, salary } = req.body || {};
  if (!name) return res.status(400).json({ error: "Employee name required" });
  const emp = { id: uid(), name, phone: phone || "", empId: empId || "", photo: photo || "",
    email: email || "", access: Array.isArray(access) ? access : [],
    salary: Number(salary) || 0, salaryLog: [], createdAt: new Date().toISOString() };
  db.employees.push(emp);
  if (email && password) {
    if (db.users.find(u => u.email.toLowerCase() === email.toLowerCase()))
      return res.status(409).json({ error: "A login with this email already exists" });
    db.users.push({ id: emp.id, name, email, passwordHash: bcrypt.hashSync(password, 10),
      role: "employee", access: emp.access });
  }
  save(); changed("employees"); res.json(emp);
});
app.put("/api/employees/:id", auth("admin"), (req, res) => {
  const emp = db.employees.find(e => e.id === req.params.id);
  if (!emp) return res.status(404).json({ error: "Employee not found" });
  Object.assign(emp, { name: req.body.name ?? emp.name, phone: req.body.phone ?? emp.phone,
    empId: req.body.empId ?? emp.empId, photo: req.body.photo ?? emp.photo,
    email: req.body.email ?? emp.email,
    salary: req.body.salary !== undefined ? Number(req.body.salary) || 0 : emp.salary,
    access: Array.isArray(req.body.access) ? req.body.access : emp.access });
  const user = db.users.find(u => u.id === emp.id);
  if (user) {
    user.name = emp.name; user.access = emp.access;
    if (req.body.email) user.email = req.body.email;
    if (req.body.password) user.passwordHash = bcrypt.hashSync(req.body.password, 10);
  } else if (req.body.email && req.body.password) {
    db.users.push({ id: emp.id, name: emp.name, email: req.body.email,
      passwordHash: bcrypt.hashSync(req.body.password, 10), role: "employee", access: emp.access });
  }
  save(); changed("employees"); res.json(emp);
});
/* salary payment / advance record */
app.post("/api/employees/:id/salary", auth("admin"), (req, res) => {
  const emp = db.employees.find(e => e.id === req.params.id);
  if (!emp) return res.status(404).json({ error: "Employee not found" });
  const { type, amount, note } = req.body || {};
  const amt = Number(amount) || 0;
  if (amt <= 0) return res.status(400).json({ error: "Enter a valid amount" });
  emp.salaryLog = emp.salaryLog || [];
  const rec = { id: uid(), type: type === "advance" ? "advance" : "salary", amount: amt,
    note: note || "", date: new Date().toISOString(), by: req.user.name };
  emp.salaryLog.push(rec);
  db.transactions.push({ id: uid(), kind: "expense", category: type === "advance" ? "Salary Advance" : "Salary",
    amount: amt, note: `${emp.name}${note ? " — " + note : ""}`, paid: true, refId: emp.id, date: rec.date });
  save(); changed("employees"); changed("transactions");
  res.json(rec);
});

app.delete("/api/employees/:id", auth("admin"), (req, res) => {
  db.employees = db.employees.filter(e => e.id !== req.params.id);
  db.users = db.users.filter(u => u.id !== req.params.id || u.role === "admin");
  save(); changed("employees"); res.json({ ok: true });
});

/* ---------------- Income / Expense ---------------- */
app.get("/api/transactions", auth("admin", "reception"), (req, res) => res.json(db.transactions.slice().reverse()));
app.post("/api/transactions", auth("admin", "reception"), (req, res) => {
  const { kind, category, amount, note } = req.body || {};
  const t = { id: uid(), kind: kind === "expense" ? "expense" : "income",
    category: category || "General", amount: Number(amount) || 0, note: note || "",
    paid: true, date: new Date().toISOString() };
  db.transactions.push(t); save(); changed("transactions"); res.json(t);
});
app.delete("/api/transactions/:id", auth("admin"), (req, res) => {
  db.transactions = db.transactions.filter(t => t.id !== req.params.id);
  save(); changed("transactions"); res.json({ ok: true });
});

/* ---------------- Credit ---------------- */
app.get("/api/credits", auth("admin", "reception"), (req, res) => res.json(db.credits.slice().reverse()));
app.post("/api/credits", auth("admin", "reception"), (req, res) => {
  const { name, phone, amount, note } = req.body || {};
  if (!name) return res.status(400).json({ error: "Customer name required" });
  const c = { id: uid(), name, phone: phone || "", amount: Number(amount) || 0,
    note: note || "", settled: false, date: new Date().toISOString() };
  db.credits.push(c); save(); changed("credits"); res.json(c);
});
app.patch("/api/credits/:id", auth("admin", "reception"), (req, res) => {
  const c = db.credits.find(x => x.id === req.params.id);
  if (!c) return res.status(404).json({ error: "Credit not found" });
  if (req.body.settled !== undefined) {
    c.settled = !!req.body.settled;
    if (c.settled) db.transactions.push({ id: uid(), kind: "income", category: "Credit Settled",
      amount: c.amount, note: `Credit settled — ${c.name}`, paid: true, date: new Date().toISOString() });
  }
  Object.assign(c, { amount: req.body.amount !== undefined ? Number(req.body.amount) : c.amount,
    note: req.body.note ?? c.note });
  save(); changed("credits"); res.json(c);
});
app.delete("/api/credits/:id", auth("admin"), (req, res) => {
  db.credits = db.credits.filter(c => c.id !== req.params.id);
  save(); changed("credits"); res.json({ ok: true });
});

/* ---------------- Payment / Bank details ---------------- */
app.get("/api/payment", auth("admin", "reception"), (req, res) => res.json(db.payment));
app.put("/api/payment", auth("admin"), (req, res) => {
  const b = req.body || {};
  ["accountName", "accountNumber", "apiKey", "bankName",
    "esewaMode", "esewaProductCode", "esewaSecret", "esewaEnabled"].forEach(k => {
    if (b[k] !== undefined) db.payment[k] = b[k];
  });
  save(); changed("payment"); res.json(db.payment);
});

/* QR payload for a payment (public — used at checkout) */
app.get("/api/public/qr", (req, res) => {
  const amount = Number(req.query.amount) || 0;
  const p = db.payment;
  if (!p.accountName || !p.accountNumber)
    return res.status(400).json({ error: "Payment account not configured yet" });
  // Generic UPI/bank style QR payload
  const payload =
    `upi://pay?pa=${encodeURIComponent(p.apiKey || p.accountNumber)}` +
    `&pn=${encodeURIComponent(p.accountName)}` +
    (amount ? `&am=${amount.toFixed(2)}` : "") +
    `&cu=NPR&tn=${encodeURIComponent("Hotel Jai Laxmi and Lodge")}`;
  res.json({ payload, accountName: p.accountName, accountNumber: p.accountNumber, bankName: p.bankName });
});

/* ---------------- Gallery (admin-managed, public display) ---------------- */
app.get("/api/public/gallery", (req, res) => res.json(db.gallery.filter(g => !g.hidden)));
app.get("/api/gallery", auth("admin"), (req, res) => res.json(db.gallery));
app.post("/api/gallery", auth("admin"), (req, res) => {
  const { photo, caption, category } = req.body || {};
  if (!photo) return res.status(400).json({ error: "Photo required" });
  const g = { id: uid(), photo, caption: caption || "", category: category || "hotel",
    hidden: false, createdAt: new Date().toISOString() };
  db.gallery.push(g); save(); changed("gallery"); res.json(g);
});
app.put("/api/gallery/:id", auth("admin"), (req, res) => {
  const g = db.gallery.find(x => x.id === req.params.id);
  if (!g) return res.status(404).json({ error: "Photo not found" });
  Object.assign(g, {
    photo: req.body.photo ?? g.photo, caption: req.body.caption ?? g.caption,
    category: req.body.category ?? g.category,
    hidden: req.body.hidden !== undefined ? !!req.body.hidden : g.hidden
  });
  save(); changed("gallery"); res.json(g);
});
app.delete("/api/gallery/:id", auth("admin"), (req, res) => {
  db.gallery = db.gallery.filter(g => g.id !== req.params.id);
  save(); changed("gallery"); res.json({ ok: true });
});

/* ---------------- Reviews (public submit → admin approve) ---------------- */
app.get("/api/public/reviews", (req, res) => res.json(db.reviews.filter(r => r.status === "approved").slice().reverse()));
app.post("/api/public/reviews", (req, res) => {
  const { name, country, rating, text } = req.body || {};
  if (!name || !text) return res.status(400).json({ error: "Name and review text are required" });
  const r = { id: uid(), name, country: country || "🇳🇵 Nepal",
    rating: Math.min(5, Math.max(1, Number(rating) || 5)), text,
    status: "pending", createdAt: new Date().toISOString() };
  db.reviews.push(r); save();
  notify("review", "⭐ New Review Submitted", `${r.rating}★ from ${name} — waiting for approval`, r);
  res.json({ ok: true, message: "Thank you! Your review will appear after approval." });
});
app.get("/api/reviews", auth("admin"), (req, res) => res.json(db.reviews.slice().reverse()));
app.patch("/api/reviews/:id", auth("admin"), (req, res) => {
  const r = db.reviews.find(x => x.id === req.params.id);
  if (!r) return res.status(404).json({ error: "Review not found" });
  Object.assign(r, {
    status: req.body.status ?? r.status, name: req.body.name ?? r.name,
    country: req.body.country ?? r.country, text: req.body.text ?? r.text,
    rating: req.body.rating !== undefined ? Math.min(5, Math.max(1, Number(req.body.rating) || 5)) : r.rating
  });
  save(); changed("reviews"); res.json(r);
});
app.delete("/api/reviews/:id", auth("admin"), (req, res) => {
  db.reviews = db.reviews.filter(r => r.id !== req.params.id);
  save(); changed("reviews"); res.json({ ok: true });
});

/* ---------------- Branding (logo / favicon) ---------------- */
app.get("/api/public/branding", (req, res) => res.json(db.branding || { logo: "", favicon: "" }));
app.put("/api/branding", auth("admin"), (req, res) => {
  db.branding = db.branding || { logo: "", favicon: "" };
  if (req.body.logo !== undefined) db.branding.logo = req.body.logo;
  if (req.body.favicon !== undefined) db.branding.favicon = req.body.favicon;
  save(); changed("branding");
  res.json(db.branding);
});

/* ---------------- Online Table Reservation ---------------- */
app.post("/api/public/reservations", (req, res) => {
  const { name, phone, date, time, guests, note } = req.body || {};
  if (!name || !phone) return res.status(400).json({ error: "Name and phone are required" });
  const r = { id: uid(), name, phone, date: date || new Date().toISOString().slice(0, 10),
    time: time || "", guests: Number(guests) || 2, note: note || "",
    status: "pending", createdAt: new Date().toISOString() };
  db.reservations.push(r); save();
  notify("reservation", "🍽️ New Table Reservation!",
    `${name} (${phone}) — ${r.guests} guest(s) on ${r.date}${r.time ? " at " + r.time : ""}`, r);
  res.json(r);
});
app.get("/api/reservations", auth("admin", "reception"), (req, res) => res.json(db.reservations.slice().reverse()));
app.patch("/api/reservations/:id", auth("admin", "reception"), (req, res) => {
  const r = db.reservations.find(x => x.id === req.params.id);
  if (!r) return res.status(404).json({ error: "Reservation not found" });
  if (["pending", "confirmed", "seated", "completed", "cancelled"].includes(req.body.status)) r.status = req.body.status;
  save(); changed("reservations"); res.json(r);
});

/* ---------------- Self Check-in ---------------- */
app.post("/api/public/self-checkin", (req, res) => {
  const { bookingNo, phone } = req.body || {};
  const b = db.bookings.find(x => String(x.no) === String(bookingNo).trim() &&
    String(x.phone).replace(/\D/g, "").endsWith(String(phone || "").replace(/\D/g, "").slice(-9)));
  if (!b) return res.status(404).json({ error: "No booking found with that number and phone. Please check with reception." });
  if (b.status === "cancelled") return res.status(409).json({ error: "This booking was cancelled." });
  if (b.status === "checked-out") return res.status(409).json({ error: "This booking is already checked out." });
  if (b.selfCheckedIn) return res.json({ ...b, already: true });
  b.selfCheckedIn = true;
  b.checkedInAt = new Date().toISOString();
  save();
  notify("checkin", "🛎️ Self Check-in!", `${b.name} self checked-in to Room ${b.roomNumber}`, b);
  res.json(b);
});

/* ---------------- AI Report Analysis ---------------- */
app.get("/api/ai-report", auth("admin", "reception"), (req, res) => {
  const now = new Date();
  const today = now.toDateString();
  const dayMs = 86400000;
  const orders = db.orders.filter(o => o.status !== "cancelled");
  const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === today);
  const weekOrders = orders.filter(o => now - new Date(o.createdAt) < 7 * dayMs);
  const income = db.transactions.filter(t => t.kind === "income");
  const todayIncome = income.filter(t => new Date(t.date).toDateString() === today).reduce((s, t) => s + t.amount, 0);
  const weekIncome = income.filter(t => now - new Date(t.date) < 7 * dayMs).reduce((s, t) => s + t.amount, 0);
  const expense = db.transactions.filter(t => t.kind === "expense").reduce((s, t) => s + t.amount, 0);
  const totalIncome = income.reduce((s, t) => s + t.amount, 0);

  // top dishes
  const dishCount = {};
  weekOrders.forEach(o => o.items.forEach(i => { dishCount[i.foodName] = (dishCount[i.foodName] || 0) + i.qty; }));
  const topDishes = Object.entries(dishCount).sort((a, b) => b[1] - a[1]).slice(0, 3);

  // busiest hour
  const hours = {};
  weekOrders.forEach(o => { const h = new Date(o.createdAt).getHours(); hours[h] = (hours[h] || 0) + 1; });
  const busiest = Object.entries(hours).sort((a, b) => b[1] - a[1])[0];

  const occupancy = db.rooms.length ? Math.round(db.rooms.filter(r => r.booked).length / db.rooms.length * 100) : 0;
  const lowStock = db.inventory.filter(i => i.qty <= 5);
  const dues = db.transactions.filter(t => t.kind === "income" && t.paid === false).reduce((s, t) => s + t.amount, 0);
  const creditDue = db.credits.filter(c => !c.settled).reduce((s, c) => s + c.amount, 0);
  const vegQty = weekOrders.reduce((s, o) => s + o.items.filter(i => i.foodType === "veg").reduce((x, i) => x + i.qty, 0), 0);
  const nonvegQty = weekOrders.reduce((s, o) => s + o.items.filter(i => i.foodType === "nonveg").reduce((x, i) => x + i.qty, 0), 0);
  const pendingRes = db.reservations.filter(r => r.status === "pending").length;

  const ins = [];
  const push = (icon, title, text, kind) => ins.push({ icon, title, text, kind: kind || "info" });

  push("🏨", "Room Occupancy", `${occupancy}% of rooms are booked right now (${db.rooms.filter(r => r.booked).length}/${db.rooms.length}).` +
    (occupancy >= 80 ? " Excellent! Consider raising prices on peak days." : occupancy <= 30 && db.rooms.length ? " Low occupancy — promote rooms on social media or offer a discount." : ""), occupancy >= 80 ? "good" : occupancy <= 30 ? "warn" : "info");
  push("💰", "Today's Income", `रू ${todayIncome.toLocaleString("en-IN")} earned today from ${todayOrders.length} order(s). This week: रू ${weekIncome.toLocaleString("en-IN")}.`, todayIncome > 0 ? "good" : "info");
  if (topDishes.length)
    push("🥇", "Best Sellers (7 days)", topDishes.map(([n, q], i) => `${["🥇", "🥈", "🥉"][i]} ${n} — ${q} plates`).join("  ·  ") + ". Keep these in stock!", "good");
  if (busiest)
    push("⏰", "Busiest Hour", `Most orders come around ${busiest[0]}:00 (${busiest[1]} orders this week). Schedule extra kitchen staff at this time.`);
  if (vegQty + nonvegQty > 0)
    push("🥗", "Veg vs Non-Veg", `This week: ${vegQty} veg vs ${nonvegQty} non-veg plates (${Math.round(vegQty / (vegQty + nonvegQty) * 100)}% veg). Balance your shopping accordingly.`);
  if (lowStock.length)
    push("📦", "Low Stock Alert", `${lowStock.length} item(s) running low: ` + lowStock.map(i => `${i.name} (${i.qty} ${i.unit})`).join(", ") + ". Restock soon.", "warn");
  if (dues > 0)
    push("⚠️", "Unpaid Bills", `रू ${dues.toLocaleString("en-IN")} of bills are still unpaid. Follow up at checkout.`, "warn");
  if (creditDue > 0)
    push("💳", "Credit (उधारो) Due", `रू ${creditDue.toLocaleString("en-IN")} in customer credit is outstanding. Send reminders to settle.`, "warn");
  if (pendingRes)
    push("🍽️", "Reservations Waiting", `${pendingRes} table reservation(s) need confirmation.`, "warn");
  push("📈", "Overall Health", `Lifetime income रू ${totalIncome.toLocaleString("en-IN")} vs expenses रू ${expense.toLocaleString("en-IN")} — net रू ${(totalIncome - expense).toLocaleString("en-IN")}.`, totalIncome - expense >= 0 ? "good" : "warn");

  res.json({
    generatedAt: now.toISOString(),
    summary: `Namaste! Here is your AI analysis for ${now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}. ` +
      `Occupancy is ${occupancy}%, today's income is रू ${todayIncome.toLocaleString("en-IN")}` +
      (topDishes.length ? `, and your best seller is ${topDishes[0][0]}.` : "."),
    insights: ins
  });
});

/* ---------------- Factory reset ---------------- */
app.post("/api/admin/factory-reset", auth("admin"), (req, res) => {
  const { password } = req.body || {};
  const admin = db.users.find(u => u.email === ADMIN_EMAIL);
  if (!admin || !bcrypt.compareSync(password || "", admin.passwordHash))
    return res.status(401).json({ error: "Wrong admin password — reset cancelled" });
  const secret = db.secret;
  db = freshDB();
  db.secret = secret; // keep sessions of admin valid? safer: keep secret so admin stays logged in
  ensureAdmin();
  save();
  io.emit("data-changed", { collection: "all" });
  notify("system", "⚠️ Factory Reset", "All data has been erased by admin.", {});
  res.json({ ok: true });
});

/* ---------------- Dashboard stats ---------------- */
app.get("/api/stats", auth("admin", "reception"), (req, res) => {
  const income = db.transactions.filter(t => t.kind === "income").reduce((s, t) => s + t.amount, 0);
  const expense = db.transactions.filter(t => t.kind === "expense").reduce((s, t) => s + t.amount, 0);
  res.json({
    rooms: db.rooms.length,
    booked: db.rooms.filter(r => r.booked).length,
    orders: db.orders.length,
    pendingOrders: db.orders.filter(o => !["completed", "cancelled"].includes(o.status)).length,
    menu: db.menu.length, employees: db.employees.length, inventory: db.inventory.length,
    credits: db.credits.filter(c => !c.settled).reduce((s, c) => s + c.amount, 0),
    income, expense, profit: income - expense
  });
});

/* ---------------- SPA fallback ---------------- */
app.get(/^\/(?!api\/).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

io.on("connection", socket => {
  socket.emit("hello", { time: new Date().toISOString() });
});

/* ── Start server ── */
const PORT = process.env.PORT;
if (!PORT) {
  console.error("  ✖ process.env.PORT is not set. Exiting.");
  process.exit(1);
}

server.listen(PORT, () => {
  console.log("");
  console.log("  ✦ होटल जय लक्ष्मी & लज — Hotel Jai Laxmi and Lodge ✦");
  console.log("  Server running on port " + PORT);
  console.log("  Admin login    →  " + ADMIN_EMAIL);
  console.log("");
});

server.on("error", (err) => {
  if (err.code === "EACCES") {
    console.error("  ✖ Port " + PORT + " requires elevated privileges.");
    process.exit(1);
  } else if (err.code === "EADDRINUSE") {
    console.error("  ✖ Port " + PORT + " is already in use.");
    process.exit(1);
  } else {
    throw err;
  }
});

