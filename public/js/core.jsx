/* core.jsx — shared state, API, socket, notifications, common components */
const { useState, useEffect, useRef, useCallback } = React;

/* ---------- hotel constants ---------- */
const HOTEL = {
  phone: "+977 9806465366",
  phoneHref: "tel:+9779806465366",
  location: "Dhangadi Chauraha, Sudurpaschim, Nepal",
  mapLink: "https://maps.app.goo.gl/x6vtnX7YYrHYnUGU8",
  mapEmbed: "https://www.google.com/maps?q=Dhangadhi%20Chauraha%2C%20Sudurpashchim%2C%20Nepal&output=embed",
  email: "info.dipendraupadhayay.2005@gmail.com"
};

/* ---------- Framer Motion (with graceful fallback) ---------- */
const FM = window.Motion || window.FramerMotion || null;
const MOTION_PROPS = ["initial", "animate", "exit", "variants", "transition", "whileHover", "whileTap", "whileInView", "viewport", "layout", "layoutId", "drag", "dragConstraints", "onAnimationComplete"];
const motion = FM ? FM.motion : new Proxy({}, {
  get: (_, tag) => ({ children, ...props }) => {
    MOTION_PROPS.forEach(k => delete props[k]);
    return React.createElement(tag, props, children);
  }
});
const AnimatePresence = FM ? FM.AnimatePresence : ({ children }) => <>{children}</>;

/* Disney principle #9 — TIMING presets shared across the site */
const TIMINGS = {
  fast: { duration: 0.15 },
  normal: { duration: 0.3 },
  slow: { duration: 0.6, ease: [0.42, 0, 0.58, 1] },      // #6 slow in / slow out
  spring: { type: "spring", stiffness: 300, damping: 20 },
  pop: { type: "spring", stiffness: 200, damping: 10 }      // #10 exaggeration (overshoot)
};

/* ---------- premium motion helpers ---------- */
/* gold scroll-progress bar across the top of every page */
function ScrollProgress() {
  if (!FM || !FM.useScroll || !FM.useSpring) return null;
  const { scrollYProgress } = FM.useScroll();
  const scaleX = FM.useSpring(scrollYProgress, { stiffness: 120, damping: 24, restDelta: 0.001 });
  return <motion.div className="scroll-progress no-print" style={{ scaleX }} />;
}

/* card that fades/springs in when scrolled into view + lifts on hover */
function MCard({ children, className, i = 0, ...rest }) {
  return (
    <motion.div className={className}
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      whileHover={{ y: -7, transition: TIMINGS.normal }}
      transition={{ type: "spring", stiffness: 250, damping: 20, delay: (i % 6) * 0.07 }}
      {...rest}>
      {children}
    </motion.div>
  );
}

/* ---------- tiny helpers ---------- */
const NPR = n => "रू " + Number(n || 0).toLocaleString("en-IN");
const fmtDT = s => s ? new Date(s).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "";

/* ---------- auth store ---------- */
const Auth = {
  get token() { return sessionStorage.getItem("hjl_token"); },
  get user() { try { return JSON.parse(sessionStorage.getItem("hjl_user")); } catch { return null; } },
  set(token, user) { sessionStorage.setItem("hjl_token", token); sessionStorage.setItem("hjl_user", JSON.stringify(user)); },
  clear() { sessionStorage.removeItem("hjl_token"); sessionStorage.removeItem("hjl_user"); },
  can(area) { const u = Auth.user; return !!u && (u.role === "admin" || (u.access || []).includes(area)); }
};

/* ---------- API ---------- */
async function api(path, opts = {}) {
  const res = await fetch("/api" + path, {
    method: opts.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(Auth.token ? { Authorization: "Bearer " + Auth.token } : {})
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    /* session expired → clean logout, back to login (smooth real-time auth) */
    if (res.status === 401 && Auth.token && !path.startsWith("/auth/")) {
      Auth.clear();
      window.dispatchEvent(new Event("auth-changed"));
      go("/login");
    }
    throw new Error(data.error || "Request failed (" + res.status + ")");
  }
  /* after any successful change, refresh all live views locally too
     (works even if the socket connection is blocked) */
  if (opts.method && opts.method !== "GET")
    setTimeout(() => window.dispatchEvent(new Event("local-refresh")), 60);
  return data;
}

/* ---------- socket + sound ---------- */
const socket = io();
function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [[880, 0], [1174.66, .18], [1567.98, .36]].forEach(([f, t]) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine"; o.frequency.value = f;
      g.gain.setValueAtTime(.001, ctx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(.22, ctx.currentTime + t + .03);
      g.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + t + .5);
      o.connect(g); g.connect(ctx.destination);
      o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + .55);
    });
  } catch (e) {}
}

/* LOUD alarm for staff when money-making events arrive */
function playAlarm() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    for (let k = 0; k < 4; k++) {
      const t0 = ctx.currentTime + k * 0.55;
      [[988, 0], [1319, .14], [988, .28]].forEach(([f, t]) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = "square"; o.frequency.value = f;
        g.gain.setValueAtTime(.001, t0 + t);
        g.gain.exponentialRampToValueAtTime(.5, t0 + t + .02);
        g.gain.exponentialRampToValueAtTime(.001, t0 + t + .22);
        o.connect(g); g.connect(ctx.destination);
        o.start(t0 + t); o.stop(t0 + t + .3);
      });
    }
  } catch (e) {}
}

/* desktop notification (staff panels ask permission on login) */
function desktopNotify(n) {
  try {
    if ("Notification" in window && Notification.permission === "granted")
      new Notification(n.title, { body: n.message, icon: "/img/logo-small.jpg", tag: n.id });
  } catch (e) {}
}

/* global event bus for toasts */
const bus = { fns: [], on(f) { this.fns.push(f); return () => { this.fns = this.fns.filter(x => x !== f); }; }, emit(n) { this.fns.forEach(f => f(n)); } };
const ALARM_TYPES = ["order", "booking", "reservation", "checkin"];
socket.on("notify", n => {
  bus.emit(n);
  if (Auth.token && ALARM_TYPES.includes(n.type)) { playAlarm(); desktopNotify(n); }
  else playChime();
});

/* ---------- typing guard ----------
   Background refreshes (15s poll, socket data-changed/notify, local-refresh)
   must NOT re-render a form while the user is actively typing — on real
   browsers, and especially with a Devanagari/Nepali IME, a mid-keystroke
   re-render interrupts composition and the field "stops accepting" input
   until it is clicked again. We pause refreshes while a field is focused
   or an IME composition is in progress, then flush once typing ends. */
let COMPOSING = false;
function isTyping() {
  const el = document.activeElement;
  const inField = !!el && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable);
  return COMPOSING || inField;
}
document.addEventListener("compositionstart", () => { COMPOSING = true; }, true);
document.addEventListener("compositionend", () => {
  COMPOSING = false;
  window.dispatchEvent(new Event("typing-ended"));
}, true);
document.addEventListener("focusout", e => {
  if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName))
    setTimeout(() => window.dispatchEvent(new Event("typing-ended")), 0);
}, true);

/* re-fetch hook: reloads when server says data changed */
function useLive(loader, collections) {
  const [data, setData] = useState(null);
  const pending = useRef(false);
  const load = useCallback(() => { loader().then(setData).catch(() => {}); }, []);
  /* guarded: defer the refresh if the user is mid-typing, run it on blur */
  const safeLoad = useCallback(() => {
    if (isTyping()) { pending.current = true; return; }
    load();
  }, [load]);
  useEffect(() => {
    load(); // initial load always runs (nobody is typing yet)
    const h = ev => { if (ev.collection === "all" || !collections || collections.includes(ev.collection)) safeLoad(); };
    const flush = () => { if (pending.current && !isTyping()) { pending.current = false; load(); } };
    socket.on("data-changed", h);
    socket.on("notify", h);
    window.addEventListener("local-refresh", safeLoad);
    window.addEventListener("typing-ended", flush);
    const iv = setInterval(safeLoad, 15000); // safety polling fallback
    return () => {
      socket.off("data-changed", h); socket.off("notify", h);
      window.removeEventListener("local-refresh", safeLoad);
      window.removeEventListener("typing-ended", flush);
      clearInterval(iv);
    };
  }, [load, safeLoad]);
  return [data, load];
}

/* ---------- hash router ---------- */
function useRoute() {
  const [route, setRoute] = useState(location.hash.slice(1) || "/");
  useEffect(() => {
    const h = () => setRoute(location.hash.slice(1) || "/");
    window.addEventListener("hashchange", h);
    return () => window.removeEventListener("hashchange", h);
  }, []);
  return route;
}
const go = r => { location.hash = r; };
/* read a query param from the hash route, e.g. #/payment-success?pid=abc */
function hashQuery(name) {
  return new URLSearchParams(location.hash.split("?")[1] || "").get(name);
}

/* ---------- Toasts ---------- */
function Toasts() {
  const [list, setList] = useState([]);
  useEffect(() => bus.on(n => {
    setList(l => [...l, n].slice(-4));
    setTimeout(() => setList(l => l.filter(x => x.id !== n.id)), 6500);
  }), []);
  return (
    <div className="toasts no-print">
      <AnimatePresence>
        {list.map(n => (
          /* follow-through #5: card lands with spring, text follows a beat later */
          <motion.div className="toast" key={n.id} layout
            initial={{ opacity: 0, x: 90, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 110, transition: TIMINGS.fast }}
            transition={{ type: "spring", stiffness: 320, damping: 18 }}>
            <motion.b initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ ...TIMINGS.normal, delay: 0.08 }}>{n.title}</motion.b>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ ...TIMINGS.normal, delay: 0.16 }}>{n.message}</motion.p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Modal ----------
   IMPORTANT: this is a plain DOM + CSS modal (NOT framer-motion). Framer-motion
   re-renders its animated nodes on every parent render; when a form field inside
   the modal updates state on each keystroke, that made the whole modal re-render
   and visually "refresh" the form. A CSS entrance animation runs once when the
   modal opens and never replays on re-render, so typing stays perfectly smooth. */
function Modal({ title, children, onClose, wide }) {
  return (
    <div className="modal-back no-print modal-anim"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={"modal modal-pop" + (wide ? " modal-wide" : "")}>
        <h3>{title}</h3>
        {children}
      </div>
    </div>
  );
}

/* ---------- QR ---------- */
function PayQR({ payload, size = 180 }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && payload) {
      ref.current.innerHTML = "";
      new QRCode(ref.current, { text: payload, width: size, height: size, correctLevel: QRCode.CorrectLevel.M });
    }
  }, [payload]);
  return <div ref={ref} />;
}

/* ---------- photo file → base64 ---------- */
function PhotoInput({ value, onChange, label: lbl, camera }) {
  const fileRef = useRef(null);
  const camRef = useRef(null);
  const pick = e => {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement("canvas");
        const s = Math.min(1, 900 / img.width);
        c.width = img.width * s; c.height = img.height * s;
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        onChange(c.toDataURL("image/jpeg", .82));
      };
      img.src = r.result;
    };
    r.readAsDataURL(f);
    e.target.value = "";
  };
  return (
    <div>
      <label>{lbl || "Photo (from gallery)"}</label>
      <div className="flex">
        {value ? <img src={value} className="thumb" style={{ width: 54, height: 54, borderRadius: 8, objectFit: "cover" }} /> : null}
        <input ref={fileRef} type="file" accept="image/*" onChange={pick} style={{ display: "none" }} />
        <input ref={camRef} type="file" accept="image/*" capture="environment" onChange={pick} style={{ display: "none" }} />
        <button type="button" className="btn sm ghost" onClick={() => fileRef.current.click()}>🖼 From Device</button>
        {camera && <button type="button" className="btn sm ghost" onClick={() => camRef.current.click()}>📷 Camera</button>}
        {value ? <button type="button" className="btn sm danger" onClick={() => onChange("")}>✕ Remove</button> : null}
      </div>
    </div>
  );
}

/* ---------- PasswordInput — show / hide toggle ---------- */
function PasswordInput({ value, onChange, placeholder, id, autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <div className="pw-wrap">
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder || "Password"}
        autoComplete={autoComplete || "current-password"}
      />
      <button
        type="button"
        className="pw-eye"
        onClick={() => setShow(s => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        tabIndex={-1}
      >
        {show ? "🙈" : "👁"}
      </button>
    </div>
  );
}

/* ---------- printing — mobile-safe engine ----------
   Android Chrome hangs on "Generating preview" when printing from a small
   popup (the OS Chrome renderer refuses to show the dialog for tiny windows).
   Fix: on mobile we write a full Blob URL and open it — Chrome then prints
   it normally. On desktop the fast hidden-iframe path is used instead.      */
function _isMobile() {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

function printHTML(html, opts) {
  opts = opts || {};
  const mobile = _isMobile();
  /* Paper width: default 80mm receipt. Pass {paper:"58mm"|"A4"} to override. */
  const paper = opts.paper || "80mm";
  const width = paper === "58mm" ? "54mm" : paper === "A4" ? "190mm" : paper === "A5" ? "138mm" : "74mm";
  const pageSize = /mm$/.test(paper) && paper !== "A5" ? (paper === "A4" ? "A4" : width + " auto") : (paper === "A5" ? "A5" : width + " auto");
  /* wrap bare snippet in a full print-ready document.
     KEY MOBILE FIX: print() is called EXACTLY ONCE (guarded), so the
     safety-timeout can never fire a second print mid-render — that double
     call is what makes Android Chrome hang on "Generating preview". A visible
     Print button is shown as a manual fallback (hidden during actual print). */
  const fullDoc = `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Print</title><style>
@page{size:${pageSize};margin:${/mm$/.test(paper) && paper !== "A4" && paper !== "A5" ? "2mm" : "8mm"}}
*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
html,body{margin:0}
body{font-family:'Courier New',monospace;font-size:12.5px;color:#000;
     padding:6px;width:${width};margin:0 auto}
h3,h4,.c{text-align:center;margin:2px 0}
hr{border:none;border-top:1px dashed #555;margin:6px 0}
table{width:100%;border-collapse:collapse}
td,th{padding:3px 4px;text-align:left;font-size:12px}
.r{text-align:right}.tot{font-weight:700;font-size:14px}
img{max-width:100%}
#pbar{position:sticky;top:0;display:flex;gap:8px;justify-content:center;padding:8px;background:#111;margin:-6px -6px 8px}
#pbar button{flex:1;max-width:180px;padding:11px;border:0;border-radius:8px;font-size:15px;font-weight:700}
#pbar .p{background:#16a34a;color:#fff}#pbar .x{background:#333;color:#fff}
@media print{#pbar{display:none!important}}
</style></head><body>
<div id="pbar" class="no-print"><button class="p" onclick="doPrint()">🖨 Print / Save PDF</button><button class="x" onclick="window.close()">Close</button></div>
${html}
<script>
var _printed=false;
function doPrint(){ if(_printed)return; _printed=true; try{window.focus();}catch(e){} window.print(); }
function whenReady(){
  var imgs=document.images,n=imgs.length,done=0;
  if(!n){doPrint();return;}
  function tick(){if(++done>=n)doPrint();}
  for(var i=0;i<n;i++){ if(imgs[i].complete)tick(); else{imgs[i].onload=tick;imgs[i].onerror=tick;} }
  setTimeout(doPrint,1200); /* single guarded fallback — cannot double-fire */
}
if(document.readyState==='complete')whenReady(); else window.addEventListener('load',whenReady);
<\/script></body></html>`;

  if (mobile) {
    /* Mobile / Android Chrome: open as a blob URL in a full tab. The guarded
       single print() + manual button eliminates the "Generating preview" hang. */
    try {
      const blob = new Blob([fullDoc], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const tab = window.open(url, "_blank");
      if (tab) setTimeout(() => URL.revokeObjectURL(url), 60000);
      else { alert("Please allow pop-ups for this site, then tap Print again."); }
      return;
    } catch (e) { /* fall through to popup on any error */ }
  }

  /* Desktop: classic fast popup (sub-second) */
  const w = window.open("", "_blank", "width=480,height=680");
  if (!w) { alert("Please allow popups for this site to enable printing."); return; }
  w.document.write(fullDoc);
  w.document.close();
}

/* bill header with logo — logo works in the print window, in the downloaded
   HTML file (absolute origin URL), and uses the admin-set branding logo when
   available (a data URL, so it renders even offline). */
function billLogoSrc() {
  return Branding.logo || (location.origin + "/img/logo-small.jpg");
}
function HOTEL_HEAD() {
  return `<div class="c"><img src="${billLogoSrc()}" alt="logo" style="width:76px;height:76px;object-fit:contain;border-radius:10px;margin:0 auto 4px" /></div>`
    + `<h3>होटल जय लक्ष्मी &amp; लज</h3><div class="c">HOTEL JAI LAXMI AND LODGE</div><div class="c">Dhangadi Chauraha, Sudurpaschim</div><div class="c">Tel: +977 9806465366</div><hr/>`;
}

function billHTML(order, kind) {
  // kind: customer | kitchen | reception
  const rows = order.items.map(i => `<tr><td>${i.foodName}</td><td class="r">${i.qty}</td>${kind === "kitchen" ? "" : `<td class="r">${i.price}</td><td class="r">${i.amount}</td>`}</tr>`).join("");
  if (kind === "kitchen")
    return `${HOTEL_HEAD()}<h4>🍳 KITCHEN TOKEN (KOT)</h4>
      <div>Order #: <b>${order.no}</b> &nbsp; ${order.table ? "Table: <b>" + order.table + "</b>" : ""}</div>
      <div>Time: ${new Date(order.createdAt).toLocaleTimeString()}</div><hr/>
      <table><tr><th>Item</th><th class="r">Qty</th></tr>${rows}</table><hr/>
      <div class="c">${order.name || ""}</div>`;
  const title = kind === "reception" ? "RECEPTION TOKEN" : "CUSTOMER BILL";
  return `${HOTEL_HEAD()}<h4>${title}</h4>
    <div>Bill #: <b>${order.billNo}</b> · Order #: <b>${order.no}</b></div>
    <div>Customer: ${order.name || "Walk-in"} ${order.phone ? "(" + order.phone + ")" : ""}</div>
    ${order.table ? `<div>Table: ${order.table}</div>` : ""}
    <div>Date: ${new Date(order.createdAt).toLocaleString()}</div><hr/>
    <table><tr><th>Item</th><th class="r">Qty</th><th class="r">Rate</th><th class="r">Amt</th></tr>${rows}</table><hr/>
    <table><tr><td class="tot">TOTAL</td><td class="r tot">रू ${order.total}</td></tr>
    <tr><td>Payment</td><td class="r">${(order.paymentMethod || "cash").toUpperCase()} ${order.paid ? "✓ PAID" : "(DUE)"}</td></tr></table><hr/>
    <div class="c">धन्यवाद! Thank you, visit again 🙏</div>
    <div class="c">Crafted by Dipendra Upadhayay (Rajbaar)</div>`;
}

function roomBillHTML(b) {
  const nights = b.nights || 1;
  const total = b.total !== undefined ? b.total : nights * (Number(b.price) || 0);
  const paidAmt = b.paidAmount !== undefined ? b.paidAmount : (b.paid ? total : 0);
  const pending = b.pendingAmount !== undefined ? b.pendingAmount : total - paidAmt;
  return `${HOTEL_HEAD()}<h4>ROOM BOOKING RECEIPT</h4>
    <div>Booking #: <b>${b.no}</b></div>
    <div>Guest: ${b.name} (${b.phone})</div>
    ${b.address ? `<div>Address: ${b.address}</div>` : ""}
    ${b.persons ? `<div>Persons: ${b.persons}</div>` : ""}
    <div>Room: <b>${b.roomNumber}</b> — ${b.roomType}</div>
    <div>Check-in: ${b.checkIn} ${b.checkOut ? " · Check-out: " + b.checkOut : ""}</div><hr/>
    <table>
    <tr><td>Rate / night</td><td class="r">रू ${b.price}</td></tr>
    <tr><td>Nights</td><td class="r">× ${nights}</td></tr>
    ${b.discount ? `<tr><td>Subtotal</td><td class="r">रू ${b.gross !== undefined ? b.gross : nights * (Number(b.price) || 0)}</td></tr><tr><td>Discount</td><td class="r">- रू ${b.discount}</td></tr>` : ""}
    <tr><td class="tot">TOTAL</td><td class="r tot">रू ${total}</td></tr>
    <tr><td>Paid (${(b.paymentMethod || "cash").toUpperCase()})</td><td class="r">रू ${paidAmt}</td></tr>
    <tr><td class="tot">${pending > 0 ? "PENDING DUE" : "BALANCE"}</td><td class="r tot">रू ${pending}</td></tr>
    </table><hr/>
    <div class="c">${pending > 0 ? "Please settle pending at the desk." : "✓ FULLY PAID — धन्यवाद!"}</div>
    <div class="c">धन्यवाद! Thank you 🙏</div>
    <div class="c">Crafted by Dipendra Upadhayay (Rajbaar)</div>`;
}

/* professional payment invoice (used by the success page + admin payments) */
function paymentInvoiceHTML(p) {
  const b = p.booking, o = p.order;
  let rows = "";
  if (b) rows += `<tr><td>Room ${b.roomNumber} — ${b.roomType} × ${b.nights || 1} night</td><td class="r">रू ${b.total !== undefined ? b.total : b.price}</td></tr>`;
  if (o && o.items) o.items.forEach(i => rows += `<tr><td>${i.foodName} × ${i.qty}</td><td class="r">रू ${i.amount}</td></tr>`);
  if (!rows) rows = `<tr><td>Payment</td><td class="r">रू ${p.totalAmount}</td></tr>`;
  return `${HOTEL_HEAD()}<h4>TAX INVOICE</h4>
    <div>Invoice #: <b>${p.invoiceNumber || "-"}</b></div>
    <div>Txn ID: ${p.transactionUuid || "-"}</div>
    ${p.esewaRef ? `<div>eSewa Ref: ${p.esewaRef}</div>` : ""}
    <div>Customer: ${p.customerName || "-"} ${p.phone ? "(" + p.phone + ")" : ""}</div>
    <div>Date: ${new Date(p.paidAt || p.createdAt).toLocaleString()}</div>
    <div>Method: ${(p.method || "").toUpperCase()} · <b>${(p.status || "").toUpperCase()}</b></div><hr/>
    <table>${rows}</table><hr/>
    <table><tr><td class="tot">TOTAL PAID</td><td class="r tot">रू ${p.totalAmount}</td></tr></table><hr/>
    <div class="c">धन्यवाद! Thank you 🙏</div>
    <div class="c">Crafted by Dipendra Upadhayay (Rajbaar)</div>`;
}
function downloadHTML(html, filename) {
  const blob = new Blob([`<html><head><meta charset="utf-8"><style>body{font-family:'Courier New',monospace;font-size:13px;max-width:360px;margin:20px auto;color:#000}h3,h4,.c{text-align:center}img{display:block;margin:0 auto}hr{border:none;border-top:1px dashed #555}table{width:100%;border-collapse:collapse}td,th{text-align:left;padding:3px}.r{text-align:right}.tot{font-weight:700}</style></head><body>${html}</body></html>`], { type: "text/html" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = filename; a.click();
}

/* ---------- scroll reveal ---------- */
function Reveal({ children, as, className = "", variant = "", delay = 0, style }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add("in"); io.disconnect(); }
    }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const Tag = as || "div";
  return (
    <Tag ref={ref} className={`reveal ${variant} ${className}`}
      style={{ transitionDelay: delay + "ms", ...style }}>
      {children}
    </Tag>
  );
}

/* ---------- 3D tilt ---------- */
function Tilt({ children, className = "", max = 9 }) {
  const ref = useRef(null);
  const move = e => {
    const el = ref.current, r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    el.style.transform = `perspective(900px) rotateY(${x * max}deg) rotateX(${-y * max}deg) translateY(-3px)`;
  };
  const leave = () => { ref.current.style.transform = ""; };
  return (
    <div ref={ref} className={"tilt " + className} onMouseMove={move} onMouseLeave={leave}>
      {children}
    </div>
  );
}

/* ---------- counter (animates when visible) ---------- */
function Counter({ to, suffix = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now(), dur = 1600;
      const tick = t => {
        const p = Math.min(1, (t - t0) / dur), ease = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(to * ease).toLocaleString("en-IN") + (p === 1 ? suffix : "");
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: .4 });
    io.observe(el);
    return () => io.disconnect();
  }, [to]);
  return <span ref={ref}>0</span>;
}

/* ---------- print ALL bills at once ---------- */
const PAGE_BREAK = '<div style="page-break-after:always"></div>';
function printAllBills(order) {
  printHTML([billHTML(order, "kitchen"), billHTML(order, "customer"), billHTML(order, "reception")].join(PAGE_BREAK));
}

/* ---------- branding (logo / favicon set by admin) ---------- */
const Branding = { logo: "", favicon: "" };
function applyBranding(b) {
  Object.assign(Branding, b || {});
  if (Branding.favicon || Branding.logo) {
    let link = document.querySelector("link[rel='icon']");
    if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
    link.href = Branding.favicon || Branding.logo;
  }
  window.dispatchEvent(new Event("branding-changed"));
}
fetch("/api/public/branding").then(r => r.json()).then(applyBranding).catch(() => {});
socket.on("data-changed", ev => {
  if (ev.collection === "branding")
    fetch("/api/public/branding").then(r => r.json()).then(applyBranding).catch(() => {});
});
function useBranding() {
  const [, force] = useState(0);
  useEffect(() => {
    const h = () => force(x => x + 1);
    window.addEventListener("branding-changed", h);
    return () => window.removeEventListener("branding-changed", h);
  }, []);
  return Branding;
}
function LogoImg(props) {
  const b = useBranding();
  return <img alt="logo" {...props} src={b.logo || "/img/logo-small.jpg"} />;
}

/* ---------- Footer ---------- */
function Footer() {
  return (
    <footer className="no-print">
      <div className="fbrand notranslate" translate="no">होटल जय लक्ष्मी & लज</div>
      <div className="muted notranslate" translate="no">HOTEL JAI LAXMI AND LODGE — Luxury Stay · Fine Dining · Divine Hospitality</div>
      <div className="muted" style={{ marginTop: 8 }}>
        📍 <a href={HOTEL.mapLink} target="_blank" rel="noopener">{HOTEL.location}</a> · ☎ <a href={HOTEL.phoneHref}>{HOTEL.phone}</a>
      </div>
      <div className="fnav">
        <a href="#/">Home</a>
        <a href="#/rooms">Room Booking</a>
        <a href="#/restaurant">Restaurant</a>
        <a href="#/reserve">Table Reservation</a>
        <a href="#/checkin">Self Check-in</a>
        <a href="#/about">About Us</a>
        <a href="#/contact">Contact</a>
        <a href="#/login">Staff Login</a>
      </div>
      <div className="credit">Crafted by <b>Dipendra Upadhayay (Rajbaar)</b> · All Copyright Reserved © {new Date().getFullYear()}</div>
    </footer>
  );
}

/* ---------- public Nav ---------- */
function PublicNav({ cartCount }) {
  const route = useRoute();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  const L = ({ to, children }) => (
    <a href={"#" + to} className={route === to ? "active" : ""} onClick={() => setOpen(false)} style={{ position: "relative" }}>
      {children}
      {route === to && <motion.span className="nav-underline" layoutId="nav-underline"
        transition={{ type: "spring", stiffness: 380, damping: 30 }} />}
    </a>
  );
  const u = Auth.user;
  return (
    <nav className={"nav no-print" + (scrolled ? " scrolled" : "")}>
      <a href="#/" className="brand">
        <LogoImg />
        <div translate="no" className="notranslate">
          <div className="t1">होटल जय लक्ष्मी & लज</div>
          <div className="t2">HOTEL JAI LAXMI AND LODGE</div>
        </div>
      </a>
      <button className="hamburger" onClick={() => setOpen(o => !o)}>☰</button>
      <div className={"links" + (open ? " open" : "")}>
        <L to="/">Home</L>
        <L to="/rooms">Room Booking</L>
        <L to="/restaurant">Restaurant</L>
        <L to="/reserve">Reservation</L>
        <L to="/checkin">Check-in</L>
        <L to="/about">About Us</L>
        <L to="/contact">Contact</L>
        <a href="#/checkout" className={"cart-pill" + (route === "/checkout" ? " active" : "")} onClick={() => setOpen(false)}>
          🛒 Cart{cartCount ? (
            /* secondary action #8 + squash & stretch #1: badge pops on every change */
            <motion.span className="badge" key={cartCount}
              initial={{ scale: 0.4 }}
              animate={{ scale: [0.4, 1.45, 0.85, 1.1, 1], rotate: [0, 12, -10, 5, 0] }}
              transition={{ duration: 0.5, times: [0, 0.3, 0.55, 0.8, 1] }}>
              {cartCount}
            </motion.span>
          ) : null}
        </a>
        {u
          ? (u.role === "admin" || Auth.can("reception") || Auth.can("kitchen"))
            ? <a href={u.role === "admin" ? "#/admin" : Auth.can("reception") ? "#/reception" : "#/kitchen"}>⚙ {u.name.split(" ")[0]}</a>
            : <L to="/account">👤 {u.name.split(" ")[0]}</L>
          : <L to="/account">Log In</L>}
        <a className="btn sm nav-book" href="#/rooms" onClick={() => setOpen(false)}>Book Now</a>
      </div>
    </nav>
  );
}

/* ---------- cart store (in-memory + session) ---------- */
const Cart = {
  read() { try { return JSON.parse(sessionStorage.getItem("hjl_cart")) || { items: [], booking: null }; } catch { return { items: [], booking: null }; } },
  write(c) { sessionStorage.setItem("hjl_cart", JSON.stringify(c)); window.dispatchEvent(new Event("cart-changed")); }
};
function useCart() {
  const [cart, setCart] = useState(Cart.read());
  useEffect(() => {
    const h = () => setCart(Cart.read());
    window.addEventListener("cart-changed", h);
    return () => window.removeEventListener("cart-changed", h);
  }, []);
  return [cart, c => Cart.write(c)];
}
