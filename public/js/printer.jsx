/* printer.jsx — Enterprise Printer Management Module (Admin + Reception).
   Supports Browser Print, Web Bluetooth ESC/POS (58mm/80mm), Network ESC/POS (IP:9100),
   Queue Management, Settings, Real-Time Dashboard, and Toast Notifications. */

/* ---------- Toast Notification System ---------- */
let _toastListeners = [];
function ptoast(title, message) {
  const t = { id: "p_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6), title, message: message || "" };
  _toastListeners.forEach(fn => fn(t));
}
if (typeof window !== "undefined") window.ptoast = ptoast;

function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  useEffect(() => {
    const handler = (t) => {
      setToasts(prev => [...prev.slice(-4), t]);
      setTimeout(() => {
        setToasts(prev => prev.filter(x => x.id !== t.id));
      }, 4000);
    };
    _toastListeners.push(handler);
    return () => { _toastListeners = _toastListeners.filter(fn => fn !== handler); };
  }, []);

  if (!toasts.length) return null;
  return (
    <div className="pm-toast-container">
      {toasts.map(t => (
        <div key={t.id} className="pm-toast-card glass">
          <div className="pm-toast-title">{t.title}</div>
          {t.message && <div className="pm-toast-msg">{t.message}</div>}
        </div>
      ))}
    </div>
  );
}

/* ---------- FAST & Mobile-Safe Print Engine ---------- */
let _fpFrame = null;
function _getFrame() {
  if (_fpFrame && document.body.contains(_fpFrame)) return _fpFrame;
  const f = document.createElement("iframe");
  f.id = "hjl-fastprint";
  f.setAttribute("aria-hidden", "true");
  f.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;";
  document.body.appendChild(f);
  _fpFrame = f;
  return f;
}

function _isMobile() {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

function fastPrint(html) {
  return new Promise((resolve, reject) => {
    try {
      const t0 = performance.now();
      const fullDoc = `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Print</title><style>
@page{margin:4mm}
*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{font-family:'Segoe UI',Roboto,Arial,sans-serif;font-size:12px;color:#000;padding:4px;margin:0 auto}
.c{text-align:center}.b{font-weight:700}.r{text-align:right}.sm{font-size:10.5px;color:#222}
.hr{border-top:1px dashed #000;margin:5px 0}
table{width:100%;border-collapse:collapse}td{padding:2px 0;vertical-align:top}
img{max-width:100%}
</style></head><body>${html}
<script>
function go(){
  var imgs=document.images,n=imgs.length,done=0;
  if(!n){window.print();return;}
  function tick(){if(++done>=n)window.print();}
  for(var i=0;i<n;i++){if(imgs[i].complete)tick();else{imgs[i].onload=tick;imgs[i].onerror=tick;}}
  setTimeout(window.print,600);
}
if(document.readyState==='complete')go();else window.addEventListener('load',go);
<\/script></body></html>`;

      if (_isMobile()) {
        try {
          const blob = new Blob([fullDoc], { type: "text/html" });
          const url = URL.createObjectURL(blob);
          const tab = window.open(url, "_blank");
          if (tab) setTimeout(() => URL.revokeObjectURL(url), 60000);
          resolve(Math.round(performance.now() - t0));
          return;
        } catch (e) {}
      }

      const f = _getFrame();
      const doc = f.contentWindow.document;
      doc.open(); doc.write(fullDoc); doc.close();

      const trigger = () => {
        try {
          f.contentWindow.focus();
          const after = () => {
            try { f.contentWindow.removeEventListener("afterprint", after); } catch (e) {}
            resolve(Math.round(performance.now() - t0));
          };
          try { f.contentWindow.addEventListener("afterprint", after); } catch (e) {}
          f.contentWindow.print();
          setTimeout(() => resolve(Math.round(performance.now() - t0)), 800);
        } catch (e) { reject(e); }
      };

      const imgs = doc.images ? Array.from(doc.images) : [];
      if (imgs.length) {
        let n = imgs.length;
        const tick = () => { if (--n <= 0) trigger(); };
        imgs.forEach(im => { if (im.complete) tick(); else { im.onload = tick; im.onerror = tick; } });
        setTimeout(trigger, 500);
      } else {
        setTimeout(trigger, 50);
      }
    } catch (e) { reject(e); }
  });
}

/* ---------- Receipt HTML Builders ---------- */
function paperWidth(size) { return size === "58mm" ? "52mm" : size === "80mm" ? "76mm" : size === "A5" ? "148mm" : size === "A4" ? "210mm" : "76mm"; }
function receiptShellHTML(s, inner, opts) {
  opts = opts || {};
  const logo = (typeof Branding !== "undefined" && Branding.logo) ? Branding.logo : (location.origin + "/img/logo-small.jpg");
  const w = paperWidth(s.paperSize || "80mm");
  const thermal = /mm$/.test(w);
  const fs = s.fontSize === "large" ? 14 : s.fontSize === "small" ? 11 : 12.5;
  const dark = s.darkPrint ? "filter:contrast(1.35);" : "";
  return `<!doctype html><html><head><meta charset="utf-8"><title>${opts.title || "Receipt"}</title>
<style>
@page{size:${thermal ? w + " auto" : "A4"};margin:${thermal ? "2mm" : "12mm"};}
*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
body{font-family:'Segoe UI',Roboto,sans-serif;font-size:${fs}px;color:#000;margin:0 auto;width:${w};${dark}}
.c{text-align:center}.b{font-weight:700}.r{text-align:right}.sm{font-size:${fs - 2}px;color:#333}
.hr{border-top:1px dashed #000;margin:6px 0}
table{width:100%;border-collapse:collapse}td{padding:2px 0;vertical-align:top}
.logo{max-width:${thermal ? "44mm" : "110px"};margin:0 auto 4px;display:block}
h1{font-size:${fs + 4}px;margin:2px 0}
.wm{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;font-size:42px;color:#00000010;transform:rotate(-25deg);pointer-events:none}
</style></head><body>
${s.watermark ? `<div class="wm">${s.watermark}</div>` : ""}
<div class="c">
  <img class="logo" src="${logo}" onerror="this.style.display='none'"/>
  <h1 class="b">होटल जय लक्ष्मी & लज</h1>
  <div class="sm">HOTEL JAI LAXMI AND LODGE</div>
  ${s.header ? `<div class="sm">${s.header}</div>` : ""}
</div>
<div class="hr"></div>
${inner}
<div class="hr"></div>
<div class="c sm">${(s.footer || "Thank you! Please visit again 🙏")}</div>
</body></html>`;
}

function sampleReceipt(s, kind) {
  const now = new Date().toLocaleString("en-GB");
  const inv = "INV-" + Math.floor(10000 + Math.random() * 90000);
  if (kind === "kot") {
    return receiptShellHTML(Object.assign({}, s, { footer: "*** KITCHEN COPY (KOT) ***" }), `
      <div class="c b">KITCHEN ORDER TICKET</div>
      <div class="sm">Table: 04 &nbsp; · &nbsp; ${now}</div><div class="hr"></div>
      <table><tr><td class="b">Item</td><td class="r b">Qty</td></tr>
      <tr><td>Chicken Momo (Steam)</td><td class="r">2</td></tr>
      <tr><td>Veg Chowmein</td><td class="r">1</td></tr>
      <tr><td>Special Milk Tea</td><td class="r">3</td></tr></table>`, { title: "KOT Test" });
  }
  if (kind === "qr") {
    return receiptShellHTML(s, `<div class="c"><div class="b">SCAN & PAY QR</div>
      <img style="width:140px;height:140px;margin:6px auto" src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(location.origin)}"/>
      <div class="sm">${location.host}</div></div>`, { title: "QR Test" });
  }
  if (kind === "logo") {
    return receiptShellHTML(s, `<div class="c b">PRINTER ALIGNMENT TEST</div>
      <div class="sm c" style="margin-top:6px">If text & logo are crisp and centered, paper width is set correctly.</div>`, { title: "Logo Test" });
  }
  const items = [["Deluxe Room (1 Night)", 3500], ["Restaurant — Dinner", 1250], ["Cold Drinks & Water", 180]];
  const sub = items.reduce((a, b) => a + b[1], 0), vat = Math.round(sub * 0.13), tot = sub + vat;
  return receiptShellHTML(s, `
    <div class="sm">Invoice: <span class="b">${inv}</span> &nbsp;·&nbsp; ${now}</div>
    <div class="sm">Guest: Ram Bahadur &nbsp;·&nbsp; Room 102</div>
    <div class="sm">Payment: Cash / eSewa</div><div class="hr"></div>
    <table>${items.map(i => `<tr><td>${i[0]}</td><td class="r">Rs ${i[1]}</td></tr>`).join("")}
      <tr><td class="hr" colspan="2"></td></tr>
      <tr><td>Subtotal</td><td class="r">Rs ${sub}</td></tr>
      <tr><td>VAT 13%</td><td class="r">Rs ${vat}</td></tr>
      <tr><td class="b">TOTAL PAID</td><td class="r b">Rs ${tot}</td></tr></table>`, { title: kind === "invoice" ? "Sample Invoice" : "Test Receipt" });
}

/* ---------- Web Bluetooth ESC/POS Engine ----------
   Reliable pairing for cheap 58mm/80mm BLE thermal printers. It tries the
   known service→write-characteristic pairs used by ~all common modules first,
   then falls back to scanning every service for any writable characteristic,
   and finally VERIFIES the link by writing the ESC @ init byte — so we only
   report "connected" when the printer actually accepts data. */
const BT = { device: null, characteristic: null, name: "", connected: false };

/* every BLE service UUID seen on common thermal printers — must be listed in
   optionalServices or getPrimaryServices() can't see them. */
const BT_SERVICES = [
  0x18f0, 0xff00, 0xffe0, 0x1800, 0x1801, 0x180a,
  "000018f0-0000-1000-8000-00805f9b34fb",
  "0000ff00-0000-1000-8000-00805f9b34fb",
  "0000ffe0-0000-1000-8000-00805f9b34fb",
  "0000ffb0-0000-1000-8000-00805f9b34fb",
  "49535343-fe7d-4ae5-8fa9-9fafd205e455", /* ISSC / Microchip — very common */
  "e7810a71-73ae-499d-8c15-faa9aef0c3f2", /* Nordic-style */
  "0000fee7-0000-1000-8000-00805f9b34fb",
  "0000fff0-0000-1000-8000-00805f9b34fb"
];
/* preferred write characteristics per service (checked first, fastest path) */
const BT_WRITE_CHARS = [
  "00002af1-0000-1000-8000-00805f9b34fb",
  "0000ff02-0000-1000-8000-00805f9b34fb",
  "0000ffe1-0000-1000-8000-00805f9b34fb",
  "0000ffb2-0000-1000-8000-00805f9b34fb",
  "49535343-8841-43f4-a8d4-ecbe34729bb3", /* ISSC write */
  "bef8d6c9-9c21-4c9e-b632-bd58c1009f9f",
  "0000fee8-0000-1000-8000-00805f9b34fb",
  "0000fff2-0000-1000-8000-00805f9b34fb"
];

function btSupported() {
  return !!(typeof navigator !== "undefined" && navigator.bluetooth && navigator.bluetooth.requestDevice);
}

async function _findWritable(server) {
  const services = await server.getPrimaryServices();
  /* 1) fast path: known service → known write characteristic */
  for (const svc of services) {
    let chars = [];
    try { chars = await svc.getCharacteristics(); } catch (e) { continue; }
    for (const pref of BT_WRITE_CHARS) {
      const hit = chars.find(c => c.uuid === pref && (c.properties.write || c.properties.writeWithoutResponse));
      if (hit) return hit;
    }
  }
  /* 2) fallback: ANY writable characteristic on ANY service */
  for (const svc of services) {
    let chars = [];
    try { chars = await svc.getCharacteristics(); } catch (e) { continue; }
    const w = chars.find(c => c.properties.write || c.properties.writeWithoutResponse);
    if (w) return w;
  }
  return null;
}

async function _writeChunks(ch, bytes) {
  for (let i = 0; i < bytes.length; i += 96) {
    const chunk = bytes.slice(i, i + 96);
    if (ch.writeValueWithoutResponse) { try { await ch.writeValueWithoutResponse(chunk); continue; } catch (e) {} }
    await ch.writeValue(chunk);
    await new Promise(r => setTimeout(r, 12)); /* let cheap BLE chips drain the buffer */
  }
}

async function btConnect() {
  if (!btSupported())
    throw new Error("Web Bluetooth needs Google Chrome (Android or desktop) on an HTTPS site. Safari/Firefox and http:// pages can't use it.");
  if (typeof window !== "undefined" && window.isSecureContext === false)
    throw new Error("Bluetooth is blocked because this page isn't secure (HTTPS). Open the site with https:// and try again.");

  const dev = await navigator.bluetooth.requestDevice({
    acceptAllDevices: true,
    optionalServices: BT_SERVICES
  });
  if (!dev || !dev.gatt) throw new Error("No device selected.");

  ptoast("Connecting…", "Pairing with " + (dev.name || "Bluetooth printer") + "…");

  /* auto-reconnect if the printer drops */
  try {
    dev.removeEventListener && dev.removeEventListener("gattserverdisconnected", _onBtDrop);
    dev.addEventListener("gattserverdisconnected", _onBtDrop);
  } catch (e) {}

  const server = await dev.gatt.connect();
  const ch = await _findWritable(server);
  if (!ch) { try { dev.gatt.disconnect(); } catch (e) {} throw new Error("Paired, but this device has no writable ESC/POS channel. Make sure it's a Bluetooth thermal printer (not just BT audio)."); }

  /* VERIFY the link: send ESC @ (printer init). If this write throws, the
     characteristic isn't really usable and we don't claim success. */
  try { await _writeChunks(ch, new TextEncoder().encode("\x1b@")); }
  catch (e) { try { dev.gatt.disconnect(); } catch (_) {} throw new Error("Connected but the printer refused data. Turn it off/on, keep it close, and try again."); }

  BT.device = dev;
  BT.characteristic = ch;
  BT.name = dev.name || "Bluetooth Thermal Printer";
  BT.connected = true;

  /* register in the printer list ONCE (no duplicates on re-pair) */
  try {
    const existing = await api("/printers");
    const dupe = Array.isArray(existing) && existing.find(p => p.connection === "bluetooth" && p.name === BT.name);
    if (!dupe) await api("/printers", { method: "POST", body: { name: BT.name, type: "thermal", connection: "bluetooth", paperSize: "80mm", location: "Bluetooth counter" } });
    if (dupe) await api("/printers/" + dupe.id + "/probe").catch(() => {});
  } catch (e) {}

  ptoast("🟢 Bluetooth Connected", BT.name + " · verified");
  return BT.name;
}

function _onBtDrop() {
  BT.connected = false;
  ptoast("🔌 Bluetooth disconnected", "The printer link dropped — tap Connect to re-pair.");
}
/* try to silently re-open the GATT link to the last device (used before printing) */
async function btEnsure() {
  if (BT.characteristic && BT.device && BT.device.gatt && BT.device.gatt.connected) return true;
  if (BT.device && BT.device.gatt) {
    try {
      const server = await BT.device.gatt.connect();
      const ch = await _findWritable(server);
      if (ch) { BT.characteristic = ch; BT.connected = true; return true; }
    } catch (e) {}
  }
  return false;
}

function htmlToEscPosText(html) {
  // Convert basic HTML into clean formatted text for 58mm/80mm ESC/POS printers
  let txt = html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/tr>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n")
    .replace(/<td[^>]*>(.*?)<\/td>/gi, "$1  ")
    .replace(/<[^>]+>/g, "")
    .replace(/\n\s*\n/g, "\n")
    .trim();
  return txt;
}

async function btPrintText(text) {
  if (!BT.characteristic) throw new Error("Bluetooth printer isn't connected. Tap 'Connect Bluetooth' first.");
  const ok = await btEnsure();
  if (!ok) throw new Error("Bluetooth link dropped — tap 'Connect Bluetooth' to re-pair.");

  const ESC = "\x1b", GS = "\x1d";
  // ESC @ = init, ESC a 1 = center, GS V 0 = full cut
  const cleanText = typeof text === "string" && text.includes("<") ? htmlToEscPosText(text) : text;
  const raw = ESC + "@" + ESC + "a\x01" + cleanText + "\n\n\n\n" + GS + "V\x00";
  await _writeChunks(BT.characteristic, new TextEncoder().encode(raw));
}

/* ---------- Print Execution Controller ---------- */
async function runPrint(doc, html, printer) {
  let job = null;
  try {
    job = await api("/print-jobs", {
      method: "POST",
      body: { doc, printerId: printer ? printer.id : "", printerName: printer ? printer.name : "Default (browser)" }
    });
  } catch (e) {}

  try {
    let ms;
    if (printer && printer.connection === "bluetooth") {
      const t0 = performance.now();
      await btPrintText(html);
      ms = Math.round(performance.now() - t0);
    } else if (printer && printer.connection === "lan" && printer.ip) {
      const t0 = performance.now();
      await api("/printers/" + printer.id + "/escpos", { method: "POST", body: { text: htmlToEscPosText(html) } });
      ms = Math.round(performance.now() - t0);
    } else {
      ms = await fastPrint(html);
    }

    if (job) await api("/print-jobs/" + job.id + "/done", { method: "POST", body: { ok: true, ms } });
    ptoast("✅ Printed Successfully", doc + " · " + ms + " ms");
    return ms;
  } catch (e) {
    if (job) await api("/print-jobs/" + job.id + "/done", { method: "POST", body: { ok: false, error: e.message } });
    ptoast("⚠️ Print Failed", e.message);
    throw e;
  }
}

/* ==================== MAIN PRINTER MODULE UI ==================== */
const PRINTER_TABS = [
  ["dash", "📊 Dashboard"],
  ["printers", "🖨️ Connected Printers"],
  ["add", "➕ Add Printer"],
  ["queue", "📥 Print Queue"],
  ["history", "🕘 History"],
  ["settings", "⚙️ Settings"],
  ["test", "🧪 Test Print"],
  ["trouble", "🛟 Troubleshooting"]
];

const CONN_ICON = { wifi: "📶", lan: "🌐", bluetooth: "🔵", usb: "🔌", pdf: "📄" };
const STATUS_COLOR = { online: "#16a34a", offline: "#dc2626", error: "#dc2626", unknown: "#9ca3af" };

function StatusDot({ status }) {
  return <span className="pm-status-dot" style={{ background: STATUS_COLOR[status] || "#9ca3af" }} />;
}

function PrinterModule({ area }) {
  const [tab, setTab] = useState("dash");
  const [btDeviceName, setBtDeviceName] = useState(BT.name || "");

  const handleBTConnect = async () => {
    /* Always give feedback — never leave the user with "nothing happened". */
    if (!btSupported()) {
      const why = (typeof window !== "undefined" && window.isSecureContext === false)
        ? "This page isn't HTTPS. Open the site with https:// (e.g. https://hoteljailaxmi.com) and use Chrome."
        : "Your browser can't use Bluetooth. Use Google Chrome on Android or desktop (not Safari/Firefox).";
      ptoast("⚠️ Bluetooth unavailable", why);
      return;
    }
    try {
      const name = await btConnect();
      setBtDeviceName(name);
    } catch (e) {
      /* user cancelling the chooser isn't an error */
      if (/cancel|user gesture|chooser/i.test(e.message)) return;
      ptoast("⚠️ Bluetooth error", e.message);
    }
  };

  return (
    <div className="printer-mod">
      <ToastContainer />
      
      {/* Module Header Bar */}
      <div className="pm-head-bar glass">
        <div>
          <h2 className="pm-head-title">🖨️ Printer Management & POS Direct Print</h2>
          <div className="pm-head-sub">Multi-connection printer routing · Bluetooth ESC/POS · Sub-second receipt printing</div>
        </div>
        <div className="pm-head-actions">
          <button className={"btn sm " + (btDeviceName ? "green" : "")} onClick={handleBTConnect}>
            🔵 {btDeviceName ? "Bluetooth: " + btDeviceName : "Connect Bluetooth"}
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="pm-subnav-wrap">
        <div className="pm-subnav">
          {PRINTER_TABS.map(([id, label]) => (
            <button
              key={id}
              className={"pm-nav-btn " + (tab === id ? "active" : "")}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="pm-content">
        {tab === "dash" && <PrinterDash onConnectBT={handleBTConnect} btName={btDeviceName} />}
        {tab === "printers" && <PrinterList canDelete={area === "admin"} onConnectBT={handleBTConnect} btName={btDeviceName} />}
        {tab === "add" && <PrinterAdd onDone={() => setTab("printers")} onConnectBT={handleBTConnect} />}
        {tab === "queue" && <PrintQueue />}
        {tab === "history" && <PrintHistory canClear={area === "admin"} />}
        {tab === "settings" && <PrinterSettings />}
        {tab === "test" && <TestPrint onConnectBT={handleBTConnect} btName={btDeviceName} />}
        {tab === "trouble" && <Troubleshooting />}
      </div>
    </div>
  );
}

function PrinterDash({ onConnectBT, btName }) {
  const [statsData] = useLive(() => api("/printer-stats"), ["printers", "printJobs"]);
  const stats = statsData || {
    totalPrinters: 0, online: 0, offline: 0, printsToday: 0, printsMonth: 0, failed: 0, queueLength: 0, avgMs: 0
  };

  const cards = [
    ["🖨️", "Total Printers", stats.totalPrinters],
    ["🟢", "Online", stats.online],
    ["🔴", "Offline", stats.offline],
    ["🧾", "Prints Today", stats.printsToday],
    ["📆", "This Month", stats.printsMonth],
    ["⚠️", "Failed", stats.failed],
    ["📥", "In Queue", stats.queueLength],
    ["⚡", "Avg Speed", stats.avgMs ? stats.avgMs + " ms" : "Sub-second"]
  ];

  return (
    <div>
      <div className="pm-grid">
        {cards.map((c, i) => (
          <div className="pm-card glass" key={i}>
            <div className="pm-ic">{c[0]}</div>
            <div className="pm-val">{c[2]}</div>
            <div className="pm-lbl">{c[1]}</div>
          </div>
        ))}
      </div>
      
      <div className="pm-banner glass mt">
        <div className="pm-banner-main">
          <h4>🔵 Direct Thermal Bluetooth & Network Printing</h4>
          <p>Connect your 58mm / 80mm Bluetooth receipt printer for one-tap instant billing. Browser print engine handles all USB & Wi-Fi printers seamlessly.</p>
        </div>
        {btSupported() && (
          <button className="btn" onClick={onConnectBT}>
            🔵 {btName ? "Connected: " + btName : "Pair Bluetooth Printer"}
          </button>
        )}
      </div>
    </div>
  );
}

function PrinterList({ canDelete, onConnectBT, btName }) {
  const [printersData] = useLive(() => api("/printers"), ["printers"]);
  const printers = Array.isArray(printersData) ? printersData : [];
  const [busy, setBusy] = useState("");

  const probe = async p => {
    setBusy(p.id);
    try {
      const r = await api("/printers/" + p.id + "/probe", { method: "POST" });
      ptoast(r.reachable ? "🟢 Reachable" : "🔴 Not Reachable", r.reachable ? p.name + " · " + r.ms + " ms" : (r.reason || "Offline"));
    } catch (e) {
      ptoast("⚠️ Probe Failed", e.message);
    }
    setBusy("");
  };

  const fav = async p => {
    await api("/printers/" + p.id, { method: "PUT", body: { favorite: !p.favorite } });
  };

  const del = async p => {
    if (confirm("Remove printer “" + p.name + "”?")) {
      await api("/printers/" + p.id, { method: "DELETE" });
    }
  };

  return (
    <div>
      <div className="flex spread mb align-center">
        <h4>Connected & Registered Printers ({printers.length})</h4>
        {btSupported() && (
          <button className="btn sm ghost" onClick={onConnectBT}>
            🔵 {btName ? "Re-pair: " + btName : "+ Connect Bluetooth Printer"}
          </button>
        )}
      </div>

      {!printers.length && (
        <div className="empty glass" style={{ padding: 24 }}>
          No registered network or custom printers yet. Your system automatically defaults to the <b>Browser Print Engine</b> (supports all USB, Wi-Fi, and system printers). You can also click <b>Connect Bluetooth Printer</b> above!
        </div>
      )}

      <div className="pm-list">
        {printers.map(p => (
          <div className="pm-row glass" key={p.id}>
            <div className="pm-row-ic">{CONN_ICON[p.connection] || "🖨️"}</div>
            <div className="pm-row-main">
              <div className="pm-row-name">
                <StatusDot status={p.status} />
                {p.favorite ? "⭐ " : ""}
                {p.name}
              </div>
              <div className="pm-row-sub">
                {p.type} · {p.connection.toUpperCase()}
                {p.ip ? " · " + p.ip + ":" + p.port : ""}
                {p.location ? " · " + p.location : ""} · {p.paperSize}
              </div>
            </div>
            <div className="pm-row-act">
              {(p.connection === "wifi" || p.connection === "lan") && p.ip && (
                <button className="btn sm ghost" disabled={busy === p.id} onClick={() => probe(p)}>
                  {busy === p.id ? "…" : "Test Link"}
                </button>
              )}
              {p.connection === "bluetooth" && (
                <button className="btn sm ghost" onClick={onConnectBT}>
                  {btName ? "Re-pair" : "Pair BT"}
                </button>
              )}
              <button className="btn sm ghost" onClick={() => fav(p)}>{p.favorite ? "Unstar" : "Star"}</button>
              {canDelete && <button className="btn sm danger" onClick={() => del(p)}>Remove</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PrinterAdd({ onDone, onConnectBT }) {
  const [f, setF] = useState({ name: "", type: "thermal", connection: "wifi", ip: "", port: 9100, location: "", paperSize: "80mm" });
  const [err, setErr] = useState("");
  const set = (k, v) => setF(o => ({ ...o, [k]: v }));

  const save = async () => {
    if (!f.name.trim()) { setErr("Please give the printer a name."); return; }
    if ((f.connection === "wifi" || f.connection === "lan") && !f.ip.trim()) {
      setErr("Network printers need an IP address (e.g. 192.168.1.50)."); return;
    }
    try {
      await api("/printers", { method: "POST", body: f });
      ptoast("✅ Printer Added", f.name);
      onDone();
    } catch (e) { setErr(e.message); }
  };

  const net = f.connection === "wifi" || f.connection === "lan";

  return (
    <div className="pm-form glass">
      <h3>➕ Add / Register a Printer</h3>
      {err && <div className="pm-err">{err}</div>}
      <div className="pm-form-grid">
        <label>Printer Name
          <input value={f.name} onChange={e => set("name", e.target.value)} placeholder="Reception Thermal / Kitchen Printer" />
        </label>
        <label>Printer Type
          <select value={f.type} onChange={e => set("type", e.target.value)}>
            {["thermal", "kitchen", "laser", "inkjet", "barcode", "label", "pdf"].map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
          </select>
        </label>
        <label>Connection Interface
          <select value={f.connection} onChange={e => set("connection", e.target.value)}>
            <option value="wifi">Wi-Fi (Network IP)</option>
            <option value="lan">Ethernet / LAN (IP)</option>
            <option value="bluetooth">Bluetooth (Direct Pair)</option>
            <option value="usb">USB (via System Default)</option>
            <option value="pdf">PDF (Virtual Printer)</option>
          </select>
        </label>
        <label>Paper Size
          <select value={f.paperSize} onChange={e => set("paperSize", e.target.value)}>
            {["58mm", "80mm", "A4", "A5", "Letter"].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        {net && <label>IP Address<input value={f.ip} onChange={e => set("ip", e.target.value)} placeholder="192.168.1.50" /></label>}
        {net && <label>Port<input type="number" value={f.port} onChange={e => set("port", e.target.value)} /></label>}
        <label>Location / Notes<input value={f.location} onChange={e => set("location", e.target.value)} placeholder="Reception Desk / Kitchen / Bar" /></label>
      </div>

      <div className="pm-hint mt">
        {f.connection === "bluetooth" && (
          <div>
            <b>Bluetooth Setup:</b> Click the button below to pair with your Bluetooth thermal printer.
            <div className="mt">
              <button type="button" className="btn sm" onClick={onConnectBT}>🔵 Scan & Pair Bluetooth Printer</button>
            </div>
          </div>
        )}
        {f.connection === "usb" && "USB printers route through your OS default printer. Make sure the USB driver is installed on your computer."}
        {net && "Ensure the server and the printer are on the same local subnet to use IP printing."}
      </div>

      <div className="modal-actions mt">
        <button className="btn" onClick={save}>Save Printer</button>
      </div>
    </div>
  );
}

function PrintQueue() {
  const [jobsData] = useLive(() => api("/print-jobs"), ["printJobs"]);
  const jobs = Array.isArray(jobsData) ? jobsData : [];
  const active = jobs.filter(j => ["pending", "printing"].includes(j.status));
  const failed = jobs.filter(j => j.status === "failed");

  const cancel = async j => { await api("/print-jobs/" + j.id + "/cancel", { method: "POST" }); };
  const retry = async j => { await api("/print-jobs/" + j.id + "/retry", { method: "POST" }); };

  return (
    <div>
      <h4 className="pm-h">Active Print Queue ({active.length})</h4>
      {!active.length && <div className="empty glass">Queue is empty — all print jobs completed.</div>}
      {active.map(j => (
        <div className="pm-job glass" key={j.id}>
          <span className={"pm-chip " + j.status}>{j.status}</span>
          <div className="pm-job-main">
            <b>{j.doc}</b>
            <span className="pm-row-sub">{j.printerName} · {fmtDT(j.createdAt)}{j.priority === "high" ? " · ⚡ priority" : ""}</span>
          </div>
          <button className="btn sm danger" onClick={() => cancel(j)}>Cancel</button>
        </div>
      ))}

      {!!failed.length && (
        <>
          <h4 className="pm-h mt">Failed Jobs ({failed.length})</h4>
          {failed.map(j => (
            <div className="pm-job glass" key={j.id}>
              <span className="pm-chip failed">failed</span>
              <div className="pm-job-main">
                <b>{j.doc}</b>
                <span className="pm-row-sub">{j.printerName} · {j.error}</span>
              </div>
              <button className="btn sm ghost" onClick={() => retry(j)}>Retry</button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function PrintHistory({ canClear }) {
  const [jobsData] = useLive(() => api("/print-jobs"), ["printJobs"]);
  const jobs = Array.isArray(jobsData) ? jobsData : [];
  const done = jobs.filter(j => ["completed", "failed", "cancelled"].includes(j.status));
  const clear = async () => {
    if (confirm("Clear completed print history?")) {
      await api("/print-jobs?keep=active", { method: "DELETE" });
    }
  };

  return (
    <div>
      <div className="pm-bar flex spread align-center mb">
        <h4 className="pm-h">Print Execution History</h4>
        {canClear && !!done.length && <button className="btn sm ghost" onClick={clear}>Clear History</button>}
      </div>

      {!done.length && <div className="empty glass">No past print records.</div>}

      <div className="pm-hist-wrap">
        {done.map(j => (
          <div className="pm-hist glass" key={j.id}>
            <span className={"pm-chip " + j.status}>{j.status}</span>
            <span className="pm-hist-doc"><b>{j.doc}</b></span>
            <span className="pm-row-sub">{j.printerName}</span>
            <span className="pm-row-sub">{j.user || "Staff"}</span>
            <span className="pm-row-sub">{fmtDT(j.finishedAt || j.createdAt)}</span>
            <span className="pm-row-sub">{j.durationMs ? j.durationMs + " ms" : (j.error || "—")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PrinterSettings() {
  const [s, setS] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => { api("/printer-settings").then(setS).catch(() => setS(defaultLocalSettings())); }, []);

  if (!s) return <div className="empty">Loading settings…</div>;

  const set = (k, v) => { setS(o => ({ ...o, [k]: v })); setSaved(false); };
  const save = async () => {
    const r = await api("/printer-settings", { method: "PUT", body: s });
    setS(r); setSaved(true); ptoast("✅ Settings Saved", "Global receipt & printer preferences updated.");
  };

  return (
    <div className="pm-form glass">
      <h3>⚙️ Printer & Receipt Settings</h3>
      <div className="pm-form-grid">
        <label>Default Engine
          <select value={s.engine} onChange={e => set("engine", e.target.value)}>
            <option value="browser">Browser Engine (Fastest / Any Printer)</option>
            <option value="bluetooth">Bluetooth Thermal Printer</option>
            <option value="network">Network ESC/POS (LAN IP)</option>
          </select>
        </label>
        <label>Paper Size
          <select value={s.paperSize} onChange={e => set("paperSize", e.target.value)}>
            {["58mm", "80mm", "A4", "A5", "Letter"].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <label>Orientation
          <select value={s.orientation} onChange={e => set("orientation", e.target.value)}>
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
          </select>
        </label>
        <label>Font Size
          <select value={s.fontSize} onChange={e => set("fontSize", e.target.value)}>
            <option value="small">Small</option>
            <option value="normal">Normal</option>
            <option value="large">Large</option>
          </select>
        </label>
        <label>Copies
          <input type="number" min="1" max="5" value={s.copies || 1} onChange={e => set("copies", Number(e.target.value) || 1)} />
        </label>
        <label>Logo Alignment
          <select value={s.logoPosition} onChange={e => set("logoPosition", e.target.value)}>
            <option value="center">Center</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </label>
      </div>

      <label className="pm-full mt">Receipt Header Sub-title
        <input value={s.header || ""} onChange={e => set("header", e.target.value)} placeholder="PAN / VAT No: 600000000 · Tel: +977 9806465366" />
      </label>
      <label className="pm-full mt">Receipt Footer Message
        <input value={s.footer || ""} onChange={e => set("footer", e.target.value)} placeholder="Thank you! Please visit again 🙏" />
      </label>
      <label className="pm-full mt">Watermark (Optional)
        <input value={s.watermark || ""} onChange={e => set("watermark", e.target.value)} placeholder="PAID / ORIGINAL COPY" />
      </label>

      <div className="pm-checks mt">
        <label className="pm-chk"><input type="checkbox" checked={!!s.autoCut} onChange={e => set("autoCut", e.target.checked)} /> Auto-cut Paper (ESC/POS)</label>
        <label className="pm-chk"><input type="checkbox" checked={!!s.cashDrawer} onChange={e => set("cashDrawer", e.target.checked)} /> Kick Cash Drawer on Print</label>
        <label className="pm-chk"><input type="checkbox" checked={!!s.darkPrint} onChange={e => set("darkPrint", e.target.checked)} /> Darker High-Contrast Print</label>
      </div>

      <div className="modal-actions mt">
        <button className="btn" onClick={save}>{saved ? "✓ Saved" : "Save Settings"}</button>
      </div>
    </div>
  );
}

function TestPrint({ onConnectBT, btName }) {
  const [s, setS] = useState(null);
  const [last, setLast] = useState(null);

  useEffect(() => { api("/printer-settings").then(setS).catch(() => setS(defaultLocalSettings())); }, []);
  const conf = s || defaultLocalSettings();

  const doTest = async (kind, label) => {
    try {
      const ms = await runPrint(label, sampleReceipt(conf, kind), null);
      setLast(label + " — " + ms + " ms");
    } catch (e) {}
  };

  const btTest = async () => {
    try {
      await btPrintText("HOTEL JAI LAXMI & LODGE\n*** BLUETOOTH TEST OK ***\n" + new Date().toLocaleString() + "\n\n");
      ptoast("✅ Bluetooth Test Sent", "Printed to " + BT.name);
    } catch (e) {
      ptoast("⚠️ Bluetooth Error", e.message);
    }
  };

  const buttons = [
    ["receipt", "🧾 Test Receipt"],
    ["invoice", "📋 Sample Invoice"],
    ["kot", "👨‍🍳 Kitchen Ticket"],
    ["qr", "🔲 QR Code"],
    ["logo", "🖼️ Logo / Alignment"]
  ];

  return (
    <div className="pm-form glass">
      <h3>🧪 Test Printing Engine</h3>
      <p className="pm-row-sub mb">Run instant real test prints to check paper alignment, logo rendering, and printing speed.</p>
      
      <div className="pm-test-grid">
        {buttons.map(([k, l]) => (
          <button key={k} className="btn ghost" onClick={() => doTest(k, l)}>{l}</button>
        ))}
      </div>

      {last && <div className="pm-note mt">✅ Last Execution: <b>{last}</b></div>}

      <div className="pm-bt-box glass mt">
        <h4>🔵 Bluetooth Thermal Direct Print Test</h4>
        {!btSupported() ? (
          <div className="pm-hint mt">Web Bluetooth is not supported in this browser. Please use Chrome on Android or Desktop.</div>
        ) : (
          <div className="flex gap align-center mt" style={{ flexWrap: "wrap" }}>
            <button className="btn" onClick={onConnectBT}>{btName ? "Re-pair: " + btName : "Connect Bluetooth Printer"}</button>
            <button className="btn ghost" disabled={!BT.characteristic} onClick={btTest}>Send Direct ESC/POS Test</button>
            {btName && <span className="pm-row-sub">Active Device: <b>{btName}</b></span>}
          </div>
        )}
      </div>
    </div>
  );
}

function defaultLocalSettings() {
  return { paperSize: "80mm", fontSize: "normal", footer: "Thank you! Please visit again 🙏", header: "", watermark: "", autoCut: true };
}

function Troubleshooting() {
  const items = [
    ["Nothing prints when clicking Print", "Check browser popup permissions. On mobile devices, the app automatically opens print in a full view tab to prevent Chrome's preview freeze."],
    ["How to pair Bluetooth printer?", "Click 'Connect Bluetooth' at top right or in Test Print. Turn on your thermal printer, make sure Bluetooth is enabled on your phone/PC, select your printer from Chrome's device list."],
    ["Print speed is slow", "Browser print relies on the OS print dialog. For instant 1-second background printing, connect a Bluetooth or LAN ESC/POS printer."],
    ["Wi-Fi / LAN printer shows Offline", "The server attempts TCP ping to IP:9100. If your server is hosted on Google Cloud/GoDaddy, it cannot access your local LAN IP directly — use Bluetooth or Browser engine instead."],
    ["Receipt width issue (58mm vs 80mm)", "Open Settings tab in Printer Management and switch Paper Size between 58mm and 80mm."]
  ];

  return (
    <div className="pm-trouble">
      <div className="pm-note glass mb">
        💡 <b>Pro Tip:</b> For POS counters, a 80mm Bluetooth thermal printer provides instant one-tap receipts without opening print dialogs.
      </div>
      {items.map((it, i) => (
        <details className="pm-tr glass" key={i}>
          <summary>{it[0]}</summary>
          <p>{it[1]}</p>
        </details>
      ))}
    </div>
  );
}
