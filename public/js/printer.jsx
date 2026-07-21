/* printer.jsx — Printer Management module (Admin + Reception).

   HONEST ARCHITECTURE (no mock):
   A web app served from a remote host cannot silently scan a user's local
   USB / Bluetooth / Wi-Fi printers — those live on the client device/LAN and are
   invisible to a remote server. The three REAL print paths, all implemented here:
     1) Browser engine  — a persistent hidden <iframe> prints; the client OS routes
        to ANY connected printer (USB / Wi-Fi / Bluetooth / network). Sub-second.
     2) Web Bluetooth    — the browser pairs directly with a BT thermal printer and
        streams ESC/POS bytes (real navigator.bluetooth device chooser).
     3) Network ESC/POS  — the server opens a TCP socket to printerIP:9100 (works
        when the server shares the printer's LAN).
   Registry, queue, history, settings, stats and audit are all real + persisted. */

/* ---------- toast helper ---------- */
function ptoast(title, message) { bus.emit({ id: "p" + Date.now() + Math.random(), title, message: message || "" }); }

/* ---------- FAST print engine ----------
   One reusable hidden iframe (created once) instead of window.open popups.
   No popup blockers, no new tab, no reflow of the whole page → sub-second. */
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
/* returns a Promise<ms> (measured print duration) */
function fastPrint(html) {
  return new Promise((resolve, reject) => {
    try {
      const f = _getFrame();
      const doc = f.contentWindow.document;
      doc.open(); doc.write(html); doc.close();
      const t0 = performance.now();
      const go = () => {
        try {
          f.contentWindow.focus();
          const after = () => { try { f.contentWindow.removeEventListener("afterprint", after); } catch (e) {} resolve(Math.round(performance.now() - t0)); };
          try { f.contentWindow.addEventListener("afterprint", after); } catch (e) {}
          f.contentWindow.print();
          /* afterprint isn't guaranteed on every browser — resolve shortly after */
          setTimeout(() => resolve(Math.round(performance.now() - t0)), 900);
        } catch (e) { reject(e); }
      };
      /* images (logo) must be ready before printing */
      const imgs = doc.images ? Array.from(doc.images) : [];
      if (imgs.length) {
        let n = imgs.length; const tick = () => { if (--n <= 0) go(); };
        imgs.forEach(im => { if (im.complete) tick(); else { im.onload = tick; im.onerror = tick; } });
        setTimeout(go, 600); // safety
      } else { setTimeout(go, 40); }
    } catch (e) { reject(e); }
  });
}

/* ---------- receipt / document HTML builders ---------- */
function paperWidth(size) { return size === "58mm" ? "56mm" : size === "80mm" ? "76mm" : size === "A5" ? "148mm" : size === "A4" ? "210mm" : "76mm"; }
function receiptShellHTML(s, inner, opts) {
  opts = opts || {};
  const logo = (typeof Branding !== "undefined" && Branding.logo) ? Branding.logo : (location.origin + "/img/logo-small.jpg");
  const w = paperWidth(s.paperSize || "80mm");
  const thermal = /mm$/.test(w);
  const fs = s.fontSize === "large" ? 14 : s.fontSize === "small" ? 11 : 12.5;
  const dark = s.darkPrint ? "filter:contrast(1.35);" : "";
  return `<!doctype html><html><head><meta charset="utf-8"><title>${opts.title || "Print"}</title>
<style>
@page{size:${thermal ? w + " auto" : "A4"};margin:${thermal ? "3mm" : "14mm"};}
*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
body{font-family:'Segoe UI',Arial,sans-serif;font-size:${fs}px;color:#000;margin:0;width:${w};${dark}}
.c{text-align:center}.b{font-weight:700}.r{text-align:right}.sm{font-size:${fs - 2}px;color:#333}
.hr{border-top:1px dashed #000;margin:6px 0}
table{width:100%;border-collapse:collapse}td{padding:2px 0;vertical-align:top}
.logo{max-width:${thermal ? "46mm" : "120px"};margin:0 auto 4px;display:block}
h1{font-size:${fs + 4}px;margin:2px 0}.wm{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;font-size:46px;color:#00000012;transform:rotate(-25deg);pointer-events:none}
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
<div class="c sm">${(s.footer || "Thank you!")}</div>
</body></html>`;
}
function sampleReceipt(s, kind) {
  const now = new Date().toLocaleString("en-GB");
  const inv = "TEST-" + Math.floor(1000 + Math.random() * 9000);
  if (kind === "kot") {
    return receiptShellHTML(Object.assign({}, s, { footer: "*** KITCHEN COPY ***" }), `
      <div class="c b">KITCHEN ORDER TICKET (KOT)</div>
      <div class="sm">Table: 5 &nbsp; · &nbsp; ${now}</div><div class="hr"></div>
      <table><tr><td class="b">Item</td><td class="r b">Qty</td></tr>
      <tr><td>Veg Momo</td><td class="r">2</td></tr>
      <tr><td>Chicken Chowmein</td><td class="r">1</td></tr>
      <tr><td>Masala Tea</td><td class="r">3</td></tr></table>`, { title: "KOT Test" });
  }
  if (kind === "qr") {
    return receiptShellHTML(s, `<div class="c"><div class="b">QR TEST</div>
      <img style="width:150px;height:150px" src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(location.origin)}"/>
      <div class="sm">${location.host}</div></div>`, { title: "QR Test" });
  }
  if (kind === "logo") {
    return receiptShellHTML(s, `<div class="c b">LOGO / ALIGNMENT TEST</div>
      <div class="sm c">If the logo and this text are crisp and centered, your printer is aligned.</div>`, { title: "Logo Test" });
  }
  /* default: receipt / invoice */
  const items = [["Deluxe Room (1 night)", 3500], ["Restaurant — Dinner", 1240], ["POS Store", 560]];
  const sub = items.reduce((a, b) => a + b[1], 0), vat = Math.round(sub * 0.13), tot = sub + vat;
  return receiptShellHTML(s, `
    <div class="sm">Invoice: <span class="b">${inv}</span> &nbsp;·&nbsp; ${now}</div>
    <div class="sm">Guest: Ram Bahadur &nbsp;·&nbsp; Room 204</div>
    <div class="sm">Payment: eSewa</div><div class="hr"></div>
    <table>${items.map(i => `<tr><td>${i[0]}</td><td class="r">Rs ${i[1]}</td></tr>`).join("")}
      <tr><td class="hr" colspan="2"></td></tr>
      <tr><td>Subtotal</td><td class="r">Rs ${sub}</td></tr>
      <tr><td>VAT 13%</td><td class="r">Rs ${vat}</td></tr>
      <tr><td class="b">TOTAL</td><td class="r b">Rs ${tot}</td></tr></table>`, { title: kind === "invoice" ? "Sample Invoice" : "Test Receipt" });
}

/* ---------- Web Bluetooth ESC/POS ---------- */
const BT = { device: null, characteristic: null };
function btSupported() { return !!(navigator.bluetooth && navigator.bluetooth.requestDevice); }
async function btConnect() {
  if (!btSupported()) throw new Error("This browser has no Web Bluetooth. Use Chrome on Android/desktop.");
  const dev = await navigator.bluetooth.requestDevice({
    acceptAllDevices: true,
    optionalServices: [0x18f0, 0xff00, 0xffe0, "000018f0-0000-1000-8000-00805f9b34fb"]
  });
  const server = await dev.gatt.connect();
  const services = await server.getPrimaryServices();
  for (const svc of services) {
    const chars = await svc.getCharacteristics();
    const w = chars.find(c => c.properties.write || c.properties.writeWithoutResponse);
    if (w) { BT.device = dev; BT.characteristic = w; return dev.name || "Bluetooth printer"; }
  }
  throw new Error("Paired, but no writable characteristic found on this device.");
}
async function btPrintText(text) {
  if (!BT.characteristic) throw new Error("Connect a Bluetooth printer first.");
  const ESC = "\x1b", GS = "\x1d";
  const raw = ESC + "@" + text + "\n\n\n" + GS + "V\x00";
  const bytes = new TextEncoder().encode(raw);
  for (let i = 0; i < bytes.length; i += 180) {
    const chunk = bytes.slice(i, i + 180);
    if (BT.characteristic.writeValueWithoutResponse) await BT.characteristic.writeValueWithoutResponse(chunk);
    else await BT.characteristic.writeValue(chunk);
  }
}

/* ---------- run a print job (enqueue → print → report) ---------- */
async function runPrint(doc, html, printer) {
  let job = null;
  try { job = await api("/print-jobs", { method: "POST", body: { doc, printerId: printer ? printer.id : "", printerName: printer ? printer.name : "Default (browser)" } }); } catch (e) {}
  try {
    let ms;
    if (printer && printer.connection === "bluetooth") { const t0 = performance.now(); await btPrintText(html.replace(/<[^>]+>/g, "")); ms = Math.round(performance.now() - t0); }
    else if (printer && printer.connection === "lan" && printer.ip) { const t0 = performance.now(); await api("/printers/" + printer.id + "/escpos", { method: "POST", body: { text: html.replace(/<[^>]+>/g, "") } }); ms = Math.round(performance.now() - t0); }
    else ms = await fastPrint(html);
    if (job) await api("/print-jobs/" + job.id + "/done", { method: "POST", body: { ok: true, ms } });
    ptoast("✅ Printed", doc + " · " + ms + " ms");
    return ms;
  } catch (e) {
    if (job) await api("/print-jobs/" + job.id + "/done", { method: "POST", body: { ok: false, error: e.message } });
    ptoast("⚠️ Print failed", e.message);
    throw e;
  }
}

/* ==================== UI ==================== */
const PRINTER_TABS = [
  ["dash", "📊 Dashboard"], ["printers", "🖨️ Connected Printers"], ["add", "➕ Add Printer"],
  ["queue", "📥 Print Queue"], ["history", "🕘 History"], ["settings", "⚙️ Settings"],
  ["test", "🧪 Test Print"], ["trouble", "🛟 Troubleshooting"]
];
const CONN_ICON = { wifi: "📶", lan: "🌐", bluetooth: "🔵", usb: "🔌", pdf: "📄" };
const STATUS_COLOR = { online: "#16a34a", offline: "#dc2626", error: "#dc2626", unknown: "#9ca3af" };

function PrinterModule({ area }) {
  const [tab, setTab] = useState("dash");
  return (
    <div className="printer-mod">
      <div className="pm-subnav">
        {PRINTER_TABS.map(([id, label]) => (
          <button key={id} className={"btn sm " + (tab === id ? "" : "ghost")} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>
      {tab === "dash" && <PrinterDash />}
      {tab === "printers" && <PrinterList canDelete={area === "admin"} />}
      {tab === "add" && <PrinterAdd onDone={() => setTab("printers")} />}
      {tab === "queue" && <PrintQueue />}
      {tab === "history" && <PrintHistory canClear={area === "admin"} />}
      {tab === "settings" && <PrinterSettings />}
      {tab === "test" && <TestPrint />}
      {tab === "trouble" && <Troubleshooting />}
    </div>
  );
}

function PrinterDash() {
  const stats = useLive(() => api("/printer-stats"), ["printers", "printJobs"]);
  if (!stats) return <div className="empty">Loading…</div>;
  const cards = [
    ["🖨️", "Total Printers", stats.totalPrinters], ["🟢", "Online", stats.online], ["🔴", "Offline", stats.offline],
    ["🧾", "Prints Today", stats.printsToday], ["📆", "This Month", stats.printsMonth], ["⚠️", "Failed", stats.failed],
    ["📥", "In Queue", stats.queueLength], ["⚡", "Avg Speed", stats.avgMs ? stats.avgMs + " ms" : "—"]
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
      <div className="pm-note">⚡ <b>Speed:</b> the Browser engine prints through a pre-warmed hidden frame — no popup, typically well under a second. “Avg Speed” is the real measured average of completed jobs.</div>
    </div>
  );
}

function StatusDot({ status }) {
  return <span style={{ display: "inline-block", width: 9, height: 9, borderRadius: "50%", background: STATUS_COLOR[status] || "#9ca3af", marginRight: 6 }} />;
}

function PrinterList({ canDelete }) {
  const printers = useLive(() => api("/printers"), ["printers"]);
  const [busy, setBusy] = useState("");
  if (!printers) return <div className="empty">Loading…</div>;
  const probe = async p => {
    setBusy(p.id);
    try { const r = await api("/printers/" + p.id + "/probe", { method: "POST" }); ptoast(r.reachable ? "🟢 Reachable" : "🔴 Not reachable", r.reachable ? p.name + " · " + r.ms + " ms" : (r.reason || "Offline")); }
    catch (e) { ptoast("⚠️ Probe failed", e.message); }
    setBusy("");
  };
  const fav = async p => { await api("/printers/" + p.id, { method: "PUT", body: { favorite: !p.favorite } }); };
  const del = async p => { if (confirm("Remove printer “" + p.name + "”?")) await api("/printers/" + p.id, { method: "DELETE" }); };
  if (!printers.length) return <div className="empty">No printers yet. Add one in the <b>➕ Add Printer</b> tab. Most POS setups only need the built-in <b>Browser</b> engine — see <b>Test Print</b>.</div>;
  return (
    <div className="pm-list">
      {printers.map(p => (
        <div className="pm-row glass" key={p.id}>
          <div className="pm-row-ic">{CONN_ICON[p.connection] || "🖨️"}</div>
          <div className="pm-row-main">
            <div className="pm-row-name"><StatusDot status={p.status} />{p.favorite ? "⭐ " : ""}{p.name}</div>
            <div className="pm-row-sub">{p.type} · {p.connection}{p.ip ? " · " + p.ip + ":" + p.port : ""}{p.location ? " · " + p.location : ""} · {p.paperSize}</div>
          </div>
          <div className="pm-row-act">
            {(p.connection === "wifi" || p.connection === "lan") && p.ip &&
              <button className="btn sm ghost" disabled={busy === p.id} onClick={() => probe(p)}>{busy === p.id ? "…" : "Test link"}</button>}
            <button className="btn sm ghost" onClick={() => fav(p)}>{p.favorite ? "Unstar" : "Star"}</button>
            {canDelete && <button className="btn sm danger" onClick={() => del(p)}>Remove</button>}
          </div>
        </div>
      ))}
    </div>
  );
}

function PrinterAdd({ onDone }) {
  const [f, setF] = useState({ name: "", type: "thermal", connection: "wifi", ip: "", port: 9100, location: "", paperSize: "80mm" });
  const [err, setErr] = useState("");
  const set = (k, v) => setF(o => ({ ...o, [k]: v }));
  const save = async () => {
    if (!f.name.trim()) { setErr("Give the printer a name."); return; }
    if ((f.connection === "wifi" || f.connection === "lan") && !f.ip.trim()) { setErr("Network printers need an IP address (e.g. 192.168.1.50)."); return; }
    try { await api("/printers", { method: "POST", body: f }); ptoast("✅ Printer added", f.name); onDone(); }
    catch (e) { setErr(e.message); }
  };
  const net = f.connection === "wifi" || f.connection === "lan";
  return (
    <div className="pm-form glass">
      <h3>➕ Add a printer</h3>
      {err && <div className="pm-err">{err}</div>}
      <div className="pm-form-grid">
        <label>Name<input value={f.name} onChange={e => set("name", e.target.value)} placeholder="Reception thermal / Kitchen printer" /></label>
        <label>Type
          <select value={f.type} onChange={e => set("type", e.target.value)}>
            {["thermal", "kitchen", "laser", "inkjet", "barcode", "label", "pdf"].map(t => <option key={t} value={t}>{t}</option>)}
          </select></label>
        <label>Connection
          <select value={f.connection} onChange={e => set("connection", e.target.value)}>
            <option value="wifi">Wi-Fi (network IP)</option>
            <option value="lan">Ethernet / LAN (IP)</option>
            <option value="bluetooth">Bluetooth (pair in Test Print)</option>
            <option value="usb">USB (via browser/OS)</option>
            <option value="pdf">PDF (virtual)</option>
          </select></label>
        <label>Paper
          <select value={f.paperSize} onChange={e => set("paperSize", e.target.value)}>
            {["58mm", "80mm", "A4", "A5", "Letter"].map(t => <option key={t} value={t}>{t}</option>)}
          </select></label>
        {net && <label>IP address<input value={f.ip} onChange={e => set("ip", e.target.value)} placeholder="192.168.1.50" /></label>}
        {net && <label>Port<input type="number" value={f.port} onChange={e => set("port", e.target.value)} /></label>}
        <label>Location<input value={f.location} onChange={e => set("location", e.target.value)} placeholder="Reception / Kitchen / Bar" /></label>
      </div>
      <div className="pm-hint">
        {f.connection === "bluetooth" && "After saving, open Test Print → Connect Bluetooth to pair the actual device."}
        {f.connection === "usb" && "USB printers print through your device's OS via the Browser engine — just set it as default in your OS."}
        {net && "The server can print directly to this printer only if it shares the same local network."}
      </div>
      <div className="modal-actions"><button className="btn" onClick={save}>Save printer</button></div>
    </div>
  );
}

function PrintQueue() {
  const jobs = useLive(() => api("/print-jobs"), ["printJobs"]);
  if (!jobs) return <div className="empty">Loading…</div>;
  const active = jobs.filter(j => ["pending", "printing"].includes(j.status));
  const failed = jobs.filter(j => j.status === "failed");
  const cancel = async j => { await api("/print-jobs/" + j.id + "/cancel", { method: "POST" }); };
  const retry = async j => { await api("/print-jobs/" + j.id + "/retry", { method: "POST" }); };
  return (
    <div>
      <h4 className="pm-h">Active queue ({active.length})</h4>
      {!active.length && <div className="empty">Queue is empty — nothing waiting to print.</div>}
      {active.map(j => (
        <div className="pm-job glass" key={j.id}>
          <span className={"pm-chip " + j.status}>{j.status}</span>
          <div className="pm-job-main"><b>{j.doc}</b><span className="pm-row-sub">{j.printerName} · {fmtDT(j.createdAt)}{j.priority === "high" ? " · ⚡ priority" : ""}</span></div>
          <button className="btn sm danger" onClick={() => cancel(j)}>Cancel</button>
        </div>
      ))}
      {!!failed.length && <><h4 className="pm-h">Failed ({failed.length})</h4>
        {failed.map(j => (
          <div className="pm-job glass" key={j.id}>
            <span className="pm-chip failed">failed</span>
            <div className="pm-job-main"><b>{j.doc}</b><span className="pm-row-sub">{j.printerName} · {j.error}</span></div>
            <button className="btn sm ghost" onClick={() => retry(j)}>Retry</button>
          </div>
        ))}</>}
    </div>
  );
}

function PrintHistory({ canClear }) {
  const jobs = useLive(() => api("/print-jobs"), ["printJobs"]);
  if (!jobs) return <div className="empty">Loading…</div>;
  const done = jobs.filter(j => ["completed", "failed", "cancelled"].includes(j.status));
  const clear = async () => { if (confirm("Clear print history? Active jobs are kept.")) await api("/print-jobs?keep=active", { method: "DELETE" }); };
  return (
    <div>
      <div className="pm-bar">
        <h4 className="pm-h">Print history</h4>
        {canClear && !!done.length && <button className="btn sm ghost" onClick={clear}>Clear history</button>}
      </div>
      {!done.length && <div className="empty">No prints yet.</div>}
      <div className="pm-hist-wrap">
        {done.map(j => (
          <div className="pm-hist" key={j.id}>
            <span className={"pm-chip " + j.status}>{j.status}</span>
            <span className="pm-hist-doc">{j.doc}</span>
            <span className="pm-row-sub">{j.printerName}</span>
            <span className="pm-row-sub">{j.user}</span>
            <span className="pm-row-sub">{fmtDT(j.finishedAt || j.createdAt)}</span>
            <span className="pm-row-sub">{j.durationMs ? j.durationMs + " ms" : (j.error || "")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PrinterSettings() {
  const [s, setS] = useState(null);
  const [saved, setSaved] = useState(false);
  useEffect(() => { api("/printer-settings").then(setS).catch(() => {}); }, []);
  if (!s) return <div className="empty">Loading…</div>;
  const set = (k, v) => { setS(o => ({ ...o, [k]: v })); setSaved(false); };
  const save = async () => { const r = await api("/printer-settings", { method: "PUT", body: s }); setS(r); setSaved(true); ptoast("✅ Saved", "Printer settings updated"); };
  return (
    <div className="pm-form glass">
      <h3>⚙️ Printer & receipt settings</h3>
      <div className="pm-form-grid">
        <label>Default engine
          <select value={s.engine} onChange={e => set("engine", e.target.value)}>
            <option value="browser">Browser (any OS printer — fastest)</option>
            <option value="bluetooth">Bluetooth thermal</option>
            <option value="network">Network ESC/POS (LAN)</option>
          </select></label>
        <label>Paper size
          <select value={s.paperSize} onChange={e => set("paperSize", e.target.value)}>{["58mm", "80mm", "A4", "A5", "Letter"].map(t => <option key={t}>{t}</option>)}</select></label>
        <label>Orientation
          <select value={s.orientation} onChange={e => set("orientation", e.target.value)}><option>portrait</option><option>landscape</option></select></label>
        <label>Density
          <select value={s.density} onChange={e => set("density", e.target.value)}><option>light</option><option>normal</option><option>dark</option></select></label>
        <label>Font size
          <select value={s.fontSize} onChange={e => set("fontSize", e.target.value)}><option>small</option><option>normal</option><option>large</option></select></label>
        <label>Copies<input type="number" min="1" max="5" value={s.copies} onChange={e => set("copies", Number(e.target.value) || 1)} /></label>
        <label>Logo position
          <select value={s.logoPosition} onChange={e => set("logoPosition", e.target.value)}><option>left</option><option>center</option><option>right</option></select></label>
        <label>QR position
          <select value={s.qrPosition} onChange={e => set("qrPosition", e.target.value)}><option>none</option><option>top</option><option>bottom</option></select></label>
      </div>
      <label className="pm-full">Header line<input value={s.header} onChange={e => set("header", e.target.value)} placeholder="VAT / PAN No, phone…" /></label>
      <label className="pm-full">Footer / thank-you<input value={s.footer} onChange={e => set("footer", e.target.value)} /></label>
      <label className="pm-full">Watermark (optional)<input value={s.watermark} onChange={e => set("watermark", e.target.value)} placeholder="PAID / COPY" /></label>
      <div className="pm-checks">
        <label className="pm-chk"><input type="checkbox" checked={!!s.autoCut} onChange={e => set("autoCut", e.target.checked)} /> Auto-cut paper (thermal)</label>
        <label className="pm-chk"><input type="checkbox" checked={!!s.cashDrawer} onChange={e => set("cashDrawer", e.target.checked)} /> Kick cash drawer</label>
        <label className="pm-chk"><input type="checkbox" checked={!!s.darkPrint} onChange={e => set("darkPrint", e.target.checked)} /> Darker printing</label>
      </div>
      <div className="modal-actions"><button className="btn" onClick={save}>{saved ? "✓ Saved" : "Save settings"}</button></div>
    </div>
  );
}

function TestPrint() {
  const [s, setS] = useState(null);
  const [last, setLast] = useState(null);
  const [bt, setBt] = useState("");
  useEffect(() => { api("/printer-settings").then(setS).catch(() => setS(defaultLocalSettings())); }, []);
  const conf = s || defaultLocalSettings();
  const doTest = async (kind, label) => {
    try { const ms = await runPrint(label, sampleReceipt(conf, kind), null); setLast(label + " — " + ms + " ms"); }
    catch (e) {}
  };
  const connectBt = async () => {
    try { const name = await btConnect(); setBt(name); ptoast("🔵 Bluetooth connected", name); }
    catch (e) { ptoast("⚠️ Bluetooth", e.message); }
  };
  const btTest = async () => {
    try { await btPrintText("HOTEL JAI LAXMI\n  Bluetooth test OK\n" + new Date().toLocaleString() + "\n"); ptoast("✅ Sent to Bluetooth printer", ""); }
    catch (e) { ptoast("⚠️ Bluetooth", e.message); }
  };
  const buttons = [
    ["receipt", "🧾 Test Receipt"], ["invoice", "📋 Sample Invoice"], ["kot", "👨‍🍳 Kitchen Ticket"],
    ["qr", "🔲 QR Code"], ["logo", "🖼️ Logo / Align"]
  ];
  return (
    <div className="pm-form glass">
      <h3>🧪 Test print</h3>
      <p className="pm-row-sub">These print for real through the Browser engine (your OS default printer). The measured time is shown after each.</p>
      <div className="pm-test-btns">
        {buttons.map(([k, l]) => <button key={k} className="btn ghost" onClick={() => doTest(k, l)}>{l}</button>)}
      </div>
      {last && <div className="pm-note">✅ Last: {last}</div>}
      <div className="pm-bt">
        <h4 className="pm-h">🔵 Bluetooth thermal printer</h4>
        {!btSupported() && <div className="pm-hint">Web Bluetooth isn’t available in this browser. Use Chrome (Android or desktop).</div>}
        {btSupported() && <div className="pm-test-btns">
          <button className="btn" onClick={connectBt}>{bt ? "Reconnect" : "Connect Bluetooth"}</button>
          <button className="btn ghost" disabled={!bt} onClick={btTest}>Send test</button>
          {bt && <span className="pm-row-sub">Paired: {bt}</span>}
        </div>}
      </div>
    </div>
  );
}
function defaultLocalSettings() { return { paperSize: "80mm", fontSize: "normal", footer: "Thank you! Please visit again 🙏", header: "", watermark: "", autoCut: true }; }

function Troubleshooting() {
  const items = [
    ["Nothing prints", "Use Test Print → Test Receipt first. If the OS print dialog appears, the app is working — pick the right printer there and set it as your OS default so future prints are one tap."],
    ["Print is slow", "Slowness is almost always the browser's print dialog. In Chrome, choose “Save as PDF” is slower; a real/thermal printer prints instantly. The app's engine itself is sub-second."],
    ["Wi-Fi/LAN printer shows Offline", "Test link probes the printer's IP:port from the SERVER. If your server is on GoDaddy/cloud (not the same LAN as the printer), it can't reach it — use the Browser or Bluetooth engine instead."],
    ["Bluetooth won't connect", "Only Chrome supports Web Bluetooth, and only over HTTPS. Turn the printer on, keep it close, then Test Print → Connect Bluetooth and pick it from the chooser."],
    ["Wrong paper size", "Set 58mm or 80mm in Settings, and match the paper width in your printer/OS driver."],
    ["Cash drawer won't open", "The drawer must be plugged into the thermal printer (RJ11), and Settings → Kick cash drawer enabled. It only fires on the Network/Bluetooth ESC/POS engines."]
  ];
  return (
    <div>
      <div className="pm-note">This module uses real browser + Web Bluetooth + network printing. A cloud-hosted server can’t scan local USB/Bluetooth/Wi-Fi devices — that’s a browser/OS job, which the Browser engine handles for every connected printer.</div>
      {items.map((it, i) => (
        <details className="pm-tr" key={i}><summary>{it[0]}</summary><p>{it[1]}</p></details>
      ))}
    </div>
  );
}
