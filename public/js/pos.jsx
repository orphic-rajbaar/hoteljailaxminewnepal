/* pos.jsx — Private POS Store (cigarettes, alcohol, beverages) + billing screen.
   Staff-only (admin / reception / pos-access). Never shown on the public site. */

const POS_META = {
  cigarette: { baseUnit: "pack", label: "Cigarette", icon: "🚬" },
  alcohol: { baseUnit: "bottle", label: "Alcohol", icon: "🍾" },
  beverage: { baseUnit: "piece", label: "Juice & Beverage", icon: "🧃" }
};

/* ---- automated pricing: build the sellable units[] from category inputs ---- */
function buildCigaretteUnits(m) {
  const pcs = Number(m.piecesPerPack) || 20, box = Number(m.packsPerBox) || 10;
  const piece = Number(m.piecePrice) || 0;
  const full = Number(m.fullPackPrice) || piece * pcs;
  const half = Number(m.halfPackPrice) || Math.round(full / 2);
  const boxP = Number(m.boxPrice) || full * box;
  return [
    { key: "piece", label: "1 Piece", price: piece, consumes: 1 / pcs },
    { key: "half", label: "Half Pack", price: half, consumes: 0.5 },
    { key: "full", label: "Full Pack", price: full, consumes: 1 },
    { key: "box", label: "Box (" + box + " packs)", price: boxP, consumes: box }
  ];
}
function buildAlcoholUnits(m) {
  const size = Number(m.bottleSize) || 750, full = Number(m.fullPrice) || 0, pegMl = Number(m.pegMl) || 30;
  const half = Number(m.halfPrice) || Math.round(full / 2);
  const quarter = Number(m.quarterPrice) || Math.round(full / 4);
  const peg = Number(m.pegPrice) || Math.round(full / size * pegMl);
  return [
    { key: "full", label: "Full Bottle", price: full, consumes: 1 },
    { key: "half", label: "Half Bottle", price: half, consumes: 0.5 },
    { key: "quarter", label: "Quarter", price: quarter, consumes: 0.25 },
    { key: "peg", label: "Peg (" + pegMl + "ml)", price: peg, consumes: pegMl / size }
  ];
}
function buildBeverageUnits(m) {
  const carton = Number(m.bottlesPerCarton) || 24, piece = Number(m.piecePrice) || 0;
  const cartonP = Number(m.cartonPrice) || piece * carton;
  return [
    { key: "piece", label: "1 Bottle", price: piece, consumes: 1 },
    { key: "carton", label: "Carton (" + carton + ")", price: cartonP, consumes: carton }
  ];
}

/* ---- POS bill (cashier or customer copy) with logo ---- */
function posBillHTML(sale, kind) {
  const rows = sale.items.map(i => `<tr><td>${i.name}${i.unitLabel ? " (" + i.unitLabel + ")" : ""}</td><td class="r">${i.qty}</td><td class="r">${i.price}</td><td class="r">${i.amount}</td></tr>`).join("");
  const cashier = kind === "cashier";
  return `${HOTEL_HEAD()}<h4>${cashier ? "CASHIER COPY" : "CUSTOMER BILL"}</h4>
    <div>Bill #: <b>${sale.invoiceNumber}</b></div>
    <div>Date: ${new Date(sale.createdAt).toLocaleString()}</div>
    <div>Customer: ${sale.customerName || "Walk-in"}${sale.phone ? " (" + sale.phone + ")" : ""}</div>
    ${sale.roomNumber ? `<div>Room: ${sale.roomNumber}</div>` : ""}
    ${cashier ? `<div>Cashier: ${sale.cashier}</div>` : ""}<hr/>
    <table><tr><th>Item</th><th class="r">Qty</th><th class="r">Rate</th><th class="r">Amt</th></tr>${rows}</table><hr/>
    <table>
    <tr><td>Subtotal</td><td class="r">रू ${sale.subtotal}</td></tr>
    ${sale.discount ? `<tr><td>Discount</td><td class="r">- रू ${sale.discount}</td></tr>` : ""}
    ${sale.tax ? `<tr><td>Tax (${sale.taxRate}%)</td><td class="r">रू ${sale.tax}</td></tr>` : ""}
    ${sale.service ? `<tr><td>Service (${sale.serviceRate}%)</td><td class="r">रू ${sale.service}</td></tr>` : ""}
    <tr><td class="tot">GRAND TOTAL</td><td class="r tot">रू ${sale.total}</td></tr>
    <tr><td>Payment</td><td class="r">${(sale.paymentMethod || "cash").toUpperCase()}${sale.roomBill ? " · ROOM BILL" : ""}</td></tr>
    </table><hr/>
    <div class="c">धन्यवाद! Thank you 🙏</div>
    <div class="c">Crafted by Dipendra Upadhayay (Rajbaar)</div>`;
}
function printPosAll(sale) {
  printHTML([posBillHTML(sale, "cashier"), posBillHTML(sale, "customer")].join('<div style="page-break-after:always"></div>'));
}

/* =================== ADMIN: POS inventory =================== */
function PosStoreAdmin() {
  const [products] = useLive(() => api("/pos/products"), ["pos"]);
  const [cat, setCat] = useState("cigarette");
  const [modal, setModal] = useState(null);
  if (!products) return <div className="empty">Loading…</div>;
  const list = products.filter(p => p.type === cat);
  return (
    <div>
      <PageHead t="🏪 POS Store Inventory" s="Private stock — cigarettes, alcohol & beverages (staff only, never public)"
        right={<button className="btn" onClick={() => setModal({ type: cat })}>+ Add {POS_META[cat].label}</button>} />
      <div className="flex mb" style={{ gap: 8, flexWrap: "wrap" }}>
        {Object.entries(POS_META).map(([k, m]) => (
          <button key={k} className={"btn sm " + (cat === k ? "" : "ghost")} onClick={() => setCat(k)}>{m.icon} {m.label}</button>
        ))}
      </div>
      {list.length === 0 && <div className="empty">No {POS_META[cat].label} products yet — click “+ Add {POS_META[cat].label}”.</div>}
      <div className="grid c4">
        {list.map(p => {
          const low = p.stockAlert > 0 && p.stock <= p.stockAlert;
          return (
            <div className="card" key={p.id} style={{ padding: 10 }}>
              {p.photo ? <img src={p.photo} style={{ width: "100%", height: 110, objectFit: "cover", borderRadius: 10 }} />
                : <div style={{ height: 110, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(212,175,55,.08)", fontSize: 34 }}>{POS_META[p.type].icon}</div>}
              <b style={{ display: "block", marginTop: 6 }}>{p.name}</b>
              {p.category && <div className="muted" style={{ fontSize: 12 }}>{p.category}</div>}
              <div style={{ fontSize: 11.5, marginTop: 4 }}>{(p.units || []).map(u => u.label + " रू" + u.price).join(" · ")}</div>
              <div className="mt" style={{ fontSize: 13 }}>Stock: <b className={p.stock <= 0 ? "red" : low ? "red" : "green"}>{Math.round(p.stock * 100) / 100} {p.baseUnit}</b>{p.stock <= 0 ? " · OUT" : low ? " · LOW" : ""}</div>
              <div className="flex mt" style={{ gap: 6 }}>
                <button className="btn sm ghost" onClick={() => setModal({ product: p, type: p.type })}>Edit</button>
                <button className="btn sm ghost" onClick={async () => { const a = prompt("Add stock (" + p.baseUnit + "):", "10"); if (a) await api("/pos/products/" + p.id + "/stock", { method: "PATCH", body: { add: Number(a) } }); }}>+ Stock</button>
                <button className="btn sm danger" onClick={async () => { if (confirm("Delete " + p.name + "?")) await api("/pos/products/" + p.id, { method: "DELETE" }); }}>✕</button>
              </div>
            </div>
          );
        })}
      </div>
      {modal && <PosProductModal init={modal} onClose={() => setModal(null)} />}
    </div>
  );
}

function PosProductModal({ init, onClose }) {
  const type = init.type;
  const p = init.product || {}, m0 = p.meta || {};
  const [f, setF] = useState({
    name: p.name || "", category: p.category || "", photo: p.photo || "",
    barcode: p.barcode || "", sku: p.sku || "", status: p.status || "active",
    stock: p.stock || 0, stockAlert: p.stockAlert || 0,
    piecePrice: m0.piecePrice || "", piecesPerPack: m0.piecesPerPack || 20, packsPerBox: m0.packsPerBox || 10, halfPackPrice: m0.halfPackPrice || "", fullPackPrice: m0.fullPackPrice || "", boxPrice: m0.boxPrice || "",
    bottleSize: m0.bottleSize || 750, fullPrice: m0.fullPrice || "", halfPrice: m0.halfPrice || "", quarterPrice: m0.quarterPrice || "", pegMl: m0.pegMl || 30, pegPrice: m0.pegPrice || "",
    piecePriceB: m0.piecePriceB || "", bottlesPerCarton: m0.bottlesPerCarton || 24, cartonPrice: m0.cartonPrice || ""
  });
  const [err, setErr] = useState("");
  const units = type === "cigarette" ? buildCigaretteUnits(f)
    : type === "alcohol" ? buildAlcoholUnits(f)
      : buildBeverageUnits({ piecePrice: f.piecePriceB, bottlesPerCarton: f.bottlesPerCarton, cartonPrice: f.cartonPrice });
  const save = async () => {
    setErr("");
    if (!f.name.trim()) { setErr("Brand / product name is required."); return; }
    const meta = type === "cigarette"
      ? { piecePrice: Number(f.piecePrice) || 0, piecesPerPack: Number(f.piecesPerPack) || 20, packsPerBox: Number(f.packsPerBox) || 10, halfPackPrice: f.halfPackPrice, fullPackPrice: f.fullPackPrice, boxPrice: f.boxPrice }
      : type === "alcohol"
        ? { bottleSize: Number(f.bottleSize) || 750, fullPrice: Number(f.fullPrice) || 0, halfPrice: f.halfPrice, quarterPrice: f.quarterPrice, pegMl: Number(f.pegMl) || 30, pegPrice: f.pegPrice, perMl: Math.round((Number(f.fullPrice) || 0) / (Number(f.bottleSize) || 750) * 100) / 100 }
        : { piecePriceB: Number(f.piecePriceB) || 0, bottlesPerCarton: Number(f.bottlesPerCarton) || 24, cartonPrice: f.cartonPrice };
    const body = { type, name: f.name, category: f.category, photo: f.photo, barcode: f.barcode, sku: f.sku, status: f.status, stock: Number(f.stock) || 0, stockAlert: Number(f.stockAlert) || 0, baseUnit: POS_META[type].baseUnit, meta, units };
    try {
      if (init.product) await api("/pos/products/" + init.product.id, { method: "PUT", body });
      else await api("/pos/products", { method: "POST", body });
      onClose();
    } catch (e) { setErr(e.message); }
  };
  return (
    <Modal title={(init.product ? "Edit " : "Add ") + POS_META[type].label} onClose={onClose} wide>
      <PhotoInput camera value={f.photo} onChange={v => setF({ ...f, photo: v })} label="Product photo" />
      <div className="row">
        <div><label>Brand / product name *</label><input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} placeholder={type === "cigarette" ? "Gold Flake" : type === "alcohol" ? "Jack Daniel's" : "Real Juice"} /></div>
        <div><label>Category</label><input value={f.category} onChange={e => setF({ ...f, category: e.target.value })} placeholder={type === "alcohol" ? "Whisky / Beer / Vodka" : "Category"} /></div>
      </div>
      {type === "cigarette" && <React.Fragment>
        <div className="row">
          <div><label>1 Piece price (रू)</label><input type="number" value={f.piecePrice} onChange={e => setF({ ...f, piecePrice: e.target.value })} /></div>
          <div><label>Pieces per pack</label><input type="number" value={f.piecesPerPack} onChange={e => setF({ ...f, piecesPerPack: e.target.value })} /></div>
        </div>
        <div className="row">
          <div><label>Half pack price</label><input type="number" value={f.halfPackPrice} onChange={e => setF({ ...f, halfPackPrice: e.target.value })} placeholder="auto" /></div>
          <div><label>Full pack price</label><input type="number" value={f.fullPackPrice} onChange={e => setF({ ...f, fullPackPrice: e.target.value })} placeholder="auto" /></div>
        </div>
        <div className="row">
          <div><label>Packs per box</label><input type="number" value={f.packsPerBox} onChange={e => setF({ ...f, packsPerBox: e.target.value })} /></div>
          <div><label>Box price</label><input type="number" value={f.boxPrice} onChange={e => setF({ ...f, boxPrice: e.target.value })} placeholder="auto" /></div>
        </div>
      </React.Fragment>}
      {type === "alcohol" && <React.Fragment>
        <div className="row">
          <div><label>Bottle size (ml)</label><input type="number" value={f.bottleSize} onChange={e => setF({ ...f, bottleSize: e.target.value })} /></div>
          <div><label>Full bottle price (रू)</label><input type="number" value={f.fullPrice} onChange={e => setF({ ...f, fullPrice: e.target.value })} /></div>
        </div>
        <div className="row">
          <div><label>Half price</label><input type="number" value={f.halfPrice} onChange={e => setF({ ...f, halfPrice: e.target.value })} placeholder="auto" /></div>
          <div><label>Quarter price</label><input type="number" value={f.quarterPrice} onChange={e => setF({ ...f, quarterPrice: e.target.value })} placeholder="auto" /></div>
        </div>
        <div className="row">
          <div><label>Peg size (ml)</label><input type="number" value={f.pegMl} onChange={e => setF({ ...f, pegMl: e.target.value })} /></div>
          <div><label>Peg price</label><input type="number" value={f.pegPrice} onChange={e => setF({ ...f, pegPrice: e.target.value })} placeholder="auto" /></div>
        </div>
      </React.Fragment>}
      {type === "beverage" && <div className="row">
        <div><label>1 Bottle price (रू)</label><input type="number" value={f.piecePriceB} onChange={e => setF({ ...f, piecePriceB: e.target.value })} /></div>
        <div><label>Bottles per carton</label><input type="number" value={f.bottlesPerCarton} onChange={e => setF({ ...f, bottlesPerCarton: e.target.value })} /></div>
      </div>}
      {type === "beverage" && <div className="row">
        <div><label>Carton price</label><input type="number" value={f.cartonPrice} onChange={e => setF({ ...f, cartonPrice: e.target.value })} placeholder="auto" /></div>
        <div />
      </div>}
      <div className="total-plate mt"><span className="lab">Auto pricing</span><span style={{ fontSize: 12, textAlign: "right" }}>{units.map(u => u.label + " = रू" + u.price).join(" · ")}</span></div>
      <div className="row mt">
        <div><label>Stock ({POS_META[type].baseUnit})</label><input type="number" value={f.stock} onChange={e => setF({ ...f, stock: e.target.value })} /></div>
        <div><label>Low-stock alert</label><input type="number" value={f.stockAlert} onChange={e => setF({ ...f, stockAlert: e.target.value })} /></div>
      </div>
      <div className="row">
        <div><label>Barcode</label><input value={f.barcode} onChange={e => setF({ ...f, barcode: e.target.value })} placeholder="scan or type" /></div>
        <div><label>SKU</label><input value={f.sku} onChange={e => setF({ ...f, sku: e.target.value })} /></div>
      </div>
      <label>Status</label>
      <select value={f.status} onChange={e => setF({ ...f, status: e.target.value })}><option value="active">Active</option><option value="inactive">Inactive</option></select>
      {err && <p className="red mt">⚠ {err}</p>}
      <div className="modal-actions"><button className="btn ghost" onClick={onClose}>Cancel</button><button className="btn" onClick={save}>Save Product</button></div>
    </Modal>
  );
}

/* =================== PRIVATE POS BILLING SCREEN (#/pos) =================== */
function PosPanel() {
  const u = Auth.user;
  const allowed = !!u && (u.role === "admin" || Auth.can("reception") || Auth.can("pos"));
  useEffect(() => { if (!allowed) go("/login"); }, []);
  const [products] = useLive(() => api("/pos/products"), ["pos"]);
  const [menu] = useLive(() => api("/menu"), ["menu"]);
  const [rooms] = useLive(() => api("/pos/rooms"), ["bookings", "pos", "booking"]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [cart, setCart] = useState([]);
  const [pick, setPick] = useState(null);
  const [pay, setPay] = useState("cash");
  const [disc, setDisc] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [svcRate, setSvcRate] = useState(0);
  const [roomId, setRoomId] = useState("");
  const [toRoom, setToRoom] = useState(false);
  const [cust, setCust] = useState({ name: "", phone: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(null);
  if (!allowed) return null;

  const money = n => "रू " + Number(n || 0).toLocaleString("en-IN");
  const posList = (products || []).filter(p => p.status === "active" && (cat === "all" || p.type === cat) &&
    (!q || (p.name + " " + (p.category || "") + " " + (p.barcode || "") + " " + (p.sku || "")).toLowerCase().includes(q.toLowerCase())));
  const foodList = (cat === "all" || cat === "food") ? (menu || []).filter(m => m.available !== false && (!q || m.foodName.toLowerCase().includes(q.toLowerCase()))) : [];

  const addLine = line => setCart(c => {
    const i = c.findIndex(x => x.key === line.key);
    if (i >= 0) { const cp = [...c]; cp[i] = { ...cp[i], qty: cp[i].qty + 1 }; return cp; }
    return [...c, { ...line, qty: 1 }];
  });
  const addPos = (p, un) => addLine({ key: p.id + ":" + un.key, kind: "pos", productId: p.id, name: p.name, unitKey: un.key, unitLabel: un.label, price: un.price });
  const addFood = m => addLine({ key: "food:" + m.id, kind: "food", foodId: m.id, name: m.foodName, unitLabel: "plate", price: m.price });
  const setQty = (key, d) => setCart(c => c.map(x => x.key === key ? { ...x, qty: Math.max(1, x.qty + d) } : x));
  const removeLine = key => setCart(c => c.filter(x => x.key !== key));

  const subtotal = cart.reduce((s, x) => s + x.price * x.qty, 0);
  const taxed = Math.max(0, subtotal - (Number(disc) || 0));
  const tax = Math.round(taxed * (Number(taxRate) || 0)) / 100;
  const svc = Math.round(taxed * (Number(svcRate) || 0)) / 100;
  const total = Math.round((taxed + tax + svc) * 100) / 100;

  const sell = async () => {
    if (!cart.length) { setErr("Cart is empty."); return; }
    setBusy(true); setErr("");
    try {
      const items = cart.map(c => c.kind === "food" ? { foodId: c.foodId, qty: c.qty } : { productId: c.productId, unitKey: c.unitKey, qty: c.qty });
      const sale = await api("/pos/sales", { method: "POST", body: { items, paymentMethod: pay, discount: Number(disc) || 0, taxRate: Number(taxRate) || 0, serviceRate: Number(svcRate) || 0, roomId: toRoom ? roomId : "", addToRoomBill: toRoom && !!roomId, customerName: cust.name, phone: cust.phone } });
      setDone(sale); setCart([]); setDisc(0); setToRoom(false); setRoomId(""); setCust({ name: "", phone: "" });
    } catch (e) { setErr(e.message); }
    setBusy(false);
  };

  const cats = [["all", "All"], ["cigarette", "🚬 Cigarettes"], ["alcohol", "🍾 Alcohol"], ["beverage", "🧃 Beverages"], ["food", "🍛 Restaurant"]];
  const panelLink = u && u.role === "admin" ? "/admin" : Auth.can("reception") ? "/reception" : "/";

  return (
    <div className="panel notranslate" translate="no" style={{ minHeight: "100vh" }}>
      <div className="main" style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 18, alignItems: "start" }}>
        {/* ---- products ---- */}
        <div>
          <div className="flex spread mb" style={{ flexWrap: "wrap", gap: 8 }}>
            <h2 className="pg" style={{ margin: 0 }}>🏪 POS Store Billing</h2>
            <div className="flex" style={{ gap: 6 }}>
              <button className="btn sm ghost" onClick={() => go(panelLink)}>← Back</button>
              <button className="btn sm ghost" onClick={() => { Auth.clear(); window.dispatchEvent(new Event("auth-changed")); go("/login"); }}>Logout</button>
            </div>
          </div>
          <input placeholder="🔍 Scan barcode or search product / food…" value={q} onChange={e => setQ(e.target.value)} autoFocus />
          <div className="flex mt mb" style={{ gap: 6, flexWrap: "wrap" }}>
            {cats.map(([k, l]) => <button key={k} className={"btn sm " + (cat === k ? "" : "ghost")} onClick={() => setCat(k)}>{l}</button>)}
          </div>
          <div className="grid c4">
            {posList.map(p => (
              <div className="card" key={p.id} style={{ padding: 10, cursor: "pointer" }} onClick={() => setPick(p)}>
                {p.photo ? <img src={p.photo} style={{ width: "100%", height: 90, objectFit: "cover", borderRadius: 8 }} />
                  : <div style={{ height: 90, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(212,175,55,.08)", fontSize: 30 }}>{POS_META[p.type].icon}</div>}
                <b style={{ display: "block", marginTop: 6, fontSize: 13.5 }}>{p.name}</b>
                <div className="muted" style={{ fontSize: 11.5 }}>from {money(Math.min(...(p.units || [{ price: 0 }]).map(x => x.price)))} · {Math.round(p.stock * 100) / 100} {p.baseUnit}</div>
              </div>
            ))}
            {foodList.map(m => (
              <div className="card" key={"f" + m.id} style={{ padding: 10, cursor: "pointer" }} onClick={() => addFood(m)}>
                {m.photo ? <img src={m.photo} style={{ width: "100%", height: 90, objectFit: "cover", borderRadius: 8 }} />
                  : <div style={{ height: 90, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(212,175,55,.08)", fontSize: 30 }}>🍛</div>}
                <b style={{ display: "block", marginTop: 6, fontSize: 13.5 }}>{m.foodName}</b>
                <div className="muted" style={{ fontSize: 11.5 }}>{money(m.price)} · restaurant</div>
              </div>
            ))}
            {posList.length === 0 && foodList.length === 0 && <div className="empty">No products found. Add stock in Admin → POS Store.</div>}
          </div>
        </div>

        {/* ---- cart / checkout ---- */}
        <div className="card" style={{ position: "sticky", top: 14 }}>
          <h4 className="gold mb">🧾 Current Bill</h4>
          {cart.length === 0 && !done && <div className="empty" style={{ padding: 20 }}>Tap products to add them.</div>}
          {done ? (
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 34 }}>✅</p>
              <p><b className="gold">{done.invoiceNumber}</b> — {money(done.total)} {done.roomBill ? "· charged to room" : "· " + (done.paymentMethod || "").toUpperCase()}</p>
              <div className="flex mt" style={{ justifyContent: "center", flexWrap: "wrap", gap: 6 }}>
                <button className="btn sm" onClick={() => printHTML(posBillHTML(done, "cashier"))}>🖨 Cashier Bill</button>
                <button className="btn sm" onClick={() => printHTML(posBillHTML(done, "customer"))}>🖨 Customer Bill</button>
                <button className="btn sm" onClick={() => printPosAll(done)}>🖨 Print All</button>
              </div>
              <div className="flex mt" style={{ justifyContent: "center", gap: 6 }}>
                <button className="btn sm ghost" onClick={() => downloadHTML(posBillHTML(done, "customer"), "bill-" + done.invoiceNumber + ".html")}>⬇ PDF/HTML</button>
                <button className="btn" onClick={() => setDone(null)}>+ New Sale</button>
              </div>
            </div>
          ) : (
            <React.Fragment>
              {cart.map(x => (
                <div className="citem" key={x.key} style={{ borderLeftColor: "var(--gold-dim)" }}>
                  <div className="cname" style={{ minWidth: 0 }}><b style={{ fontSize: 13 }}>{x.name}</b><span>{x.unitLabel} · {money(x.price)}</span></div>
                  <span className="cnt" style={{ padding: "2px 5px" }}>
                    <button onClick={() => setQty(x.key, -1)}>−</button><b>{x.qty}</b><button onClick={() => setQty(x.key, 1)}>+</button>
                  </span>
                  <span className="camt">{money(x.price * x.qty)}</span>
                  <button className="x" onClick={() => removeLine(x.key)}>✕</button>
                </div>
              ))}
              {cart.length > 0 && <React.Fragment>
                <div className="row mt">
                  <div><label>Discount (रू)</label><input type="number" value={disc} onChange={e => setDisc(e.target.value)} /></div>
                  <div><label>Tax %</label><input type="number" value={taxRate} onChange={e => setTaxRate(e.target.value)} /></div>
                </div>
                <div className="row">
                  <div><label>Service %</label><input type="number" value={svcRate} onChange={e => setSvcRate(e.target.value)} /></div>
                  <div><label>Customer</label><input value={cust.name} onChange={e => setCust({ ...cust, name: e.target.value })} placeholder="Walk-in" /></div>
                </div>
                <div className="mt" style={{ fontSize: 13.5, lineHeight: 1.9 }}>
                  <div className="flex spread"><span>Subtotal</span><b>{money(subtotal)}</b></div>
                  {Number(disc) > 0 && <div className="flex spread"><span>Discount</span><b>- {money(disc)}</b></div>}
                  {tax > 0 && <div className="flex spread"><span>Tax</span><b>{money(tax)}</b></div>}
                  {svc > 0 && <div className="flex spread"><span>Service</span><b>{money(svc)}</b></div>}
                  <div className="flex spread" style={{ fontSize: 17 }}><b>Grand Total</b><b className="gold">{money(total)}</b></div>
                </div>
                <label className="mt">Payment method</label>
                <div className="flex" style={{ gap: 5, flexWrap: "wrap" }}>
                  {["cash", "card", "upi", "qr", "wallet", "credit"].map(mth => (
                    <button key={mth} className={"btn sm " + (pay === mth ? "" : "ghost")} onClick={() => setPay(mth)}>{mth.toUpperCase()}</button>
                  ))}
                </div>
                {rooms && rooms.length > 0 && <React.Fragment>
                  <label className="mt"><input type="checkbox" checked={toRoom} onChange={e => setToRoom(e.target.checked)} /> Assign to room bill (pay at checkout)</label>
                  {toRoom && <select value={roomId} onChange={e => setRoomId(e.target.value)}>
                    <option value="">Select room…</option>
                    {rooms.map(r => <option key={r.roomId} value={r.roomId}>Room {r.roomNumber} — {r.guest} (#{r.bookingNo})</option>)}
                  </select>}
                </React.Fragment>}
                {err && <p className="red mt">⚠ {err}</p>}
                <button className="btn lg mt" style={{ width: "100%" }} disabled={busy || (toRoom && !roomId)} onClick={sell}>
                  {busy ? "Saving…" : toRoom ? "Charge to Room — " + money(total) : "Complete Sale — " + money(total)}
                </button>
              </React.Fragment>}
            </React.Fragment>
          )}
        </div>
      </div>

      {/* unit picker for a POS product */}
      {pick && (
        <Modal title={pick.name} onClose={() => setPick(null)}>
          <p className="muted">{pick.category} · Stock: {Math.round(pick.stock * 100) / 100} {pick.baseUnit}</p>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {(pick.units || []).map(un => (
              <button key={un.key} className="btn" onClick={() => { addPos(pick, un); setPick(null); }}>{un.label} — {money(un.price)}</button>
            ))}
          </div>
          <div className="modal-actions"><button className="btn ghost" onClick={() => setPick(null)}>Cancel</button></div>
        </Modal>
      )}
    </div>
  );
}
