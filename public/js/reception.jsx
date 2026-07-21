/* reception.jsx — Reception panel: room booking, floors/rooms, POS billing,
   income & expense, orders, credit */

function ReceptionPanel() {
  const [tab, setTab] = useState("book");
  const tabs = [
    { id: "book", icon: "🛏️", label: "Book a Room" },
    { id: "bookings", icon: "📒", label: "Bookings" },
    { id: "rooms", icon: "🏛", label: "Floors & Rooms" },
    { id: "pos", icon: "🧾", label: "POS Billing" },
    { id: "store", icon: "🏪", label: "POS Store" },
    { id: "tables", icon: "🍽️", label: "Dine-In Tables" },
    { id: "orders", icon: "🍽️", label: "Orders" },
    { id: "verify", icon: "✅", label: "Verify & Bill" },
    { id: "reservations", icon: "🪑", label: "Reservations" },
    { id: "money", icon: "💰", label: "Income / Expense" },
    { id: "credit", icon: "💳", label: "Credit" },
    { id: "printer", icon: "🖨️", label: "Printer" }
  ];
  return (
    <PanelShell area="reception" tabs={tabs} tab={tab} setTab={setTab}>
      {tab === "book" && <ReceptionBook />}
      {tab === "bookings" && <BookingsTable />}
      {tab === "rooms" && <FloorsRooms />}
      {tab === "pos" && <POS />}
      {tab === "store" && <PosPanel embedded />}
      {tab === "tables" && <TableService />}
      {tab === "orders" && <OrdersTable canBill />}
      {tab === "verify" && <PaymentVerify />}
      {tab === "reservations" && <ReservationsTable />}
      {tab === "money" && <MoneyTab />}
      {tab === "credit" && <CreditTab />}
      {tab === "printer" && <PrinterModule area="reception" />}
    </PanelShell>
  );
}

/* ---------- reception room booking ---------- */
function ReceptionBook() {
  const [data] = useLive(() => api("/public/rooms"), ["rooms", "floors", "bookings", "booking"]);
  const [pick, setPick] = useState(null);
  if (!data) return <div className="empty">Loading…</div>;
  return (
    <div>
      <PageHead t="Book a Room (Reception)" s="Green = available. Click a room to book for a walk-in guest." />
      {data.rooms.length === 0 && <div className="empty">No rooms yet — create floors & rooms in the "Floors & Rooms" tab.</div>}
      <div className="grid c4">
        {data.rooms.map(r => (
          <div className="card room-card" key={r.id} style={{ padding: 14, cursor: r.booked ? "default" : "pointer" }}
            onClick={() => !r.booked && setPick(r)}>
            <div className="room-head">
              <div><div className="rnum" style={{ fontSize: 22 }}>{r.number}</div><div className="rtype">{r.type} · {r.floor}</div></div>
              <span className={"status-chip " + (r.booked ? "booked" : "free")}>{r.booked ? "Booked" : "Free"}</span>
            </div>
            <div className="price" style={{ fontSize: 16 }}>{NPR(r.price)} <span>/ night</span></div>
          </div>
        ))}
      </div>
      {pick && <ReceptionBookModal room={pick} onClose={() => setPick(null)} />}
    </div>
  );
}

function ReceptionBookModal({ room, onClose }) {
  const [f, setF] = useState({
    name: "", phone: "", address: "", persons: 1, idPhoto: "",
    checkIn: new Date().toISOString().slice(0, 10), checkOut: "",
    paymentMethod: "cash", paidAmount: "", discount: ""
  });
  const [err, setErr] = useState("");
  const [done, setDone] = useState(null);
  const [qr, setQr] = useState(null);
  const nights = nightsCalc(f.checkIn, f.checkOut);
  const gross = nights * (Number(room.price) || 0);
  const discount = Math.max(0, Math.min(gross, Number(f.discount) || 0));
  const total = gross - discount;
  const paidAmt = Math.max(0, Math.min(total, Number(f.paidAmount) || 0));
  const pending = total - paidAmt;
  useEffect(() => {
    if (["esewa", "qr"].includes(f.paymentMethod) && total > 0)
      api("/public/qr?amount=" + total).then(setQr).catch(() => setQr(null));
  }, [f.paymentMethod, total]);
  const save = async () => {
    setErr("");
    try {
      const b = await api("/bookings", { method: "POST", body: { ...f, paidAmount: paidAmt, roomId: room.id } });
      setDone(b);
    } catch (e) { setErr(e.message); }
  };
  if (done) return (
    <Modal title={"✅ Room " + room.number + " Booked!"} onClose={onClose}>
      <p>Booking #{done.no} — {done.name} ({done.phone})</p>
      <div className="total-plate mt">
        <span className="lab">{done.nights} night(s) · Paid {NPR(done.paidAmount)}</span>
        <span className="amt" style={done.pendingAmount > 0 ? { color: "var(--red)" } : {}}>
          {done.pendingAmount > 0 ? "Due " + NPR(done.pendingAmount) : "PAID ✓"}
        </span>
      </div>
      <div className="modal-actions">
        <button className="btn ghost" onClick={onClose}>Close</button>
        <button className="btn" onClick={() => printHTML(roomBillHTML(done))}>🖨 Print Receipt</button>
      </div>
    </Modal>
  );
  return (
    <Modal title={"Book Room " + room.number + " — " + room.type} onClose={onClose}>
      <p className="muted">{NPR(room.price)} / night</p>
      <div className="row">
        <div><label>Guest name *</label><input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} autoFocus /></div>
        <div><label>Contact number *</label><input value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} /></div>
      </div>
      <div className="row">
        <div><label>Address</label><input value={f.address} onChange={e => setF({ ...f, address: e.target.value })} placeholder="Village / City" /></div>
        <div><label>Persons</label><input type="number" min="1" value={f.persons} onChange={e => setF({ ...f, persons: e.target.value })} /></div>
      </div>
      <div className="mt">
        <PhotoInput camera value={f.idPhoto} onChange={p => setF({ ...f, idPhoto: p })}
          label="ID proof photo — 📷 camera or device" />
      </div>
      <div className="row">
        <div><label>Check-in</label><input type="date" value={f.checkIn} onChange={e => setF({ ...f, checkIn: e.target.value })} /></div>
        <div><label>Check-out</label><input type="date" value={f.checkOut} min={f.checkIn} onChange={e => setF({ ...f, checkOut: e.target.value })} /></div>
      </div>
      <div className="row">
        <div><label>Discount (रू)</label><input type="number" min="0" value={f.discount} onChange={e => setF({ ...f, discount: e.target.value })} placeholder="0" /></div>
        <div><label>&nbsp;</label>
          <div className="total-plate" style={{ marginTop: 0, padding: "10px 14px" }}>
            <span className="lab" style={{ fontSize: 12 }}>{nights}n × {NPR(room.price)}{discount > 0 ? " − " + NPR(discount) : ""}</span>
            <span className="amt" style={{ fontSize: 18 }}>{NPR(total)}</span>
          </div>
        </div>
      </div>
      <label>Payment method</label>
      <div className="flex" style={{ flexWrap: "wrap" }}>
        {[["cash", "💵 Cash"], ["esewa", "🟢 eSewa"], ["qr", "📱 QR"], ["credit", "💳 Credit"], ["other", "🏦 Other"]].map(([m, l]) => (
          <button key={m} className={"btn sm " + (f.paymentMethod === m ? "" : "ghost")} onClick={() => setF({ ...f, paymentMethod: m })}>{l}</button>
        ))}
      </div>
      {["esewa", "qr"].includes(f.paymentMethod) && (qr
        ? <div className="qr-box"><PayQR payload={qr.payload} size={150} /><p>{qr.accountName}{qr.bankName ? " · " + qr.bankName : ""}</p><p style={{ color: "#555" }}>Guest scans to pay {NPR(total)} — then set the paid amount below & Verify.</p></div>
        : <p className="muted mt">⚠ Set up the payment QR in Admin → Payment / Bank to show a scan code here.</p>)}
      <div className="row">
        <div>
          <label>Paid amount now (रू)</label>
          <input type="number" min="0" max={total} value={f.paidAmount}
            onChange={e => setF({ ...f, paidAmount: e.target.value })} placeholder="0" />
          <div className="flex mt" style={{ gap: 6 }}>
            <button className="btn sm ghost" onClick={() => setF({ ...f, paidAmount: total })}>Full {NPR(total)}</button>
            <button className="btn sm ghost" onClick={() => setF({ ...f, paidAmount: Math.round(total / 2) })}>Half</button>
          </div>
        </div>
        <div>
          <label>Pending amount (auto)</label>
          <div className="total-plate" style={{ marginTop: 0, padding: "12px 14px" }}>
            <span className="amt" style={{ fontSize: 20, color: pending > 0 ? "var(--red)" : "var(--green)" }}>
              {pending > 0 ? NPR(pending) : "PAID ✓"}
            </span>
          </div>
        </div>
      </div>
      {err && <p className="red mt">⚠ {err}</p>}
      <div className="modal-actions">
        <button className="btn ghost" onClick={onClose}>Cancel</button>
        <button className="btn" onClick={save} disabled={!f.name || !f.phone}>Book Room — {NPR(total)}</button>
      </div>
    </Modal>
  );
}

/* ---------- POS billing ---------- */
function POS() {
  const [menu] = useLive(() => api("/menu"), ["menu"]);
  const [roomData] = useLive(() => api("/public/rooms"), ["rooms", "bookings", "booking"]);
  const [cart, setCart] = useState([]);
  const [room, setRoom] = useState(null); // room added to this bill
  const [pickRoom, setPickRoom] = useState(false);
  const [f, setF] = useState({ name: "", phone: "", table: "", paymentMethod: "cash" });
  const [qr, setQr] = useState(null);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(null);
  const total = cart.reduce((s, i) => s + i.qty * i.price, 0) + (room ? Number(room.price) : 0);

  useEffect(() => {
    if (["esewa", "qr", "online"].includes(f.paymentMethod) && total > 0)
      api("/public/qr?amount=" + total).then(setQr).catch(() => setQr(null));
  }, [f.paymentMethod, total]);

  if (!menu) return <div className="empty">Loading…</div>;
  const avail = menu.filter(m => m.available !== false);
  const qtyOf = id => (cart.find(i => i.id === id) || {}).qty || 0;
  const add = (m, d) => {
    const q = qtyOf(m.id) + d;
    setCart(c => {
      const rest = c.filter(i => i.id !== m.id);
      return q > 0 ? [...rest, { id: m.id, foodName: m.foodName, price: m.price, qty: q }] : rest;
    });
  };
  const charge = async () => {
    setErr("");
    if (room && (!f.name.trim() || !f.phone.trim())) { setErr("Guest name and phone are required when booking a room."); return; }
    try {
      const result = {};
      if (room)
        result.booking = await api("/bookings", { method: "POST", body: { roomId: room.id, name: f.name, phone: f.phone, paymentMethod: f.paymentMethod, paid: f.paymentMethod !== "credit" } });
      if (cart.length)
        result.order = await api("/orders", { method: "POST", body: { items: cart, ...f } });
      setDone(result); setCart([]); setRoom(null);
    } catch (e) { setErr(e.message); }
  };

  if (done) return (
    <div>
      <PageHead
        t={"✅ Billed" + (done.order ? " — Order #" + done.order.no : "") + (done.booking ? (done.order ? " + " : " — ") + "Room " + done.booking.roomNumber : "")}
        s={"Total " + NPR((done.order ? done.order.total : 0) + (done.booking ? Number(done.booking.price) : 0))} />
      <div className="card" style={{ maxWidth: 560 }}>
        <p className="green mb">Payment recorded. Print the slips:</p>
        {done.order && (
          <button className="btn lg mb" style={{ width: "100%" }} onClick={() => {
            let all = [billHTML(done.order, "kitchen"), billHTML(done.order, "customer"), billHTML(done.order, "reception")];
            if (done.booking) all.push(roomBillHTML(done.booking));
            printHTML(all.join(PAGE_BREAK));
          }}>🖨 PRINT ALL BILLS AT ONCE (KOT + Customer + Reception{done.booking ? " + Room" : ""})</button>
        )}
        <div className="flex">
          {done.order && <>
            <button className="btn" onClick={() => printHTML(billHTML(done.order, "kitchen"))}>🍳 KOT Token</button>
            <button className="btn blue" onClick={() => printHTML(billHTML(done.order, "customer"))}>🧾 Customer Bill</button>
            <button className="btn ghost" onClick={() => printHTML(billHTML(done.order, "reception"))}>🛎 Reception Bill</button>
          </>}
          {done.booking && <button className="btn green" onClick={() => printHTML(roomBillHTML(done.booking))}>🛏 Room Receipt</button>}
        </div>
        <button className="btn ghost mt" onClick={() => setDone(null)}>+ New Order</button>
      </div>
    </div>
  );

  return (
    <div>
      <PageHead t="POS Billing" s="Offline counter orders — sent to kitchen instantly" />
      <div className="pos">
        <div className="grid c4">
          {avail.map(m => (
            <div className="card menu-card" key={m.id} style={{ cursor: "pointer" }} onClick={() => add(m, 1)}>
              <div className="ph" style={{ height: 90 }}>{m.photo ? <img src={m.photo} /> : <span className="noimg">🍛</span>}</div>
              <div className="body" style={{ padding: 10 }}>
                <div className="fname" style={{ fontSize: 14 }}><span className={"veg-dot " + m.foodType}></span>{m.foodName}</div>
                <div className="flex spread">
                  <span className="fprice" style={{ fontSize: 15 }}>{NPR(m.price)}</span>
                  {qtyOf(m.id) > 0 && <span className="pill p-ready">× {qtyOf(m.id)}</span>}
                </div>
              </div>
            </div>
          ))}
          {avail.length === 0 && <div className="empty">Add menu items first (Admin → Restaurant).</div>}
        </div>
        <div className="card pos-cart">
          <h4 className="gold mb">🧾 Current Bill</h4>
          {room ? (
            <div className="line" style={{ borderLeft: "3px solid var(--gold)", paddingLeft: 8 }}>
              <span>🛏 Room {room.number} ({room.type})</span>
              <b>{NPR(room.price)}</b>
              <button className="btn sm ghost" onClick={() => setRoom(null)}>✕</button>
            </div>
          ) : (
            <button className="btn sm ghost mb" style={{ width: "100%" }} onClick={() => setPickRoom(true)}>🛏 + Add Room to Bill</button>
          )}
          {cart.length === 0 && !room && <p className="muted">Tap dishes to add them.</p>}
          {cart.map(i => (
            <div className="line" key={i.id}>
              <span>{i.foodName}</span>
              <span className="flex" style={{ gap: 6 }}>
                <button className="btn sm ghost" onClick={() => add({ id: i.id, foodName: i.foodName, price: i.price }, -1)}>−</button>
                <b>{i.qty}</b>
                <button className="btn sm ghost" onClick={() => add({ id: i.id, foodName: i.foodName, price: i.price }, 1)}>+</button>
              </span>
              <b>{NPR(i.qty * i.price)}</b>
            </div>
          ))}
          <div className="total"><span>Total</span><span>{NPR(total)}</span></div>
          <label>Customer name</label><input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} placeholder="Walk-in" />
          <div className="row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 10px" }}>
            <div><label>Phone</label><input value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} /></div>
            <div><label>Table</label><input value={f.table} onChange={e => setF({ ...f, table: e.target.value })} /></div>
          </div>
          <label>Payment method</label>
          <div className="flex" style={{ flexWrap: "wrap" }}>
            {[["cash", "💵 Cash"], ["esewa", "🟢 eSewa"], ["qr", "📱 QR"], ["credit", "💳 Credit"]].map(([m, l]) => (
              <button key={m} className={"btn sm " + (f.paymentMethod === m ? "" : "ghost")} onClick={() => setF({ ...f, paymentMethod: m })}>{l}</button>
            ))}
          </div>
          {["esewa", "qr"].includes(f.paymentMethod) && qr && (
            <div className="qr-box"><PayQR payload={qr.payload} size={140} /><p>Scan to pay {NPR(total)}</p></div>
          )}
          {err && <p className="red mt">⚠ {err}</p>}
          <button className="btn mt" style={{ width: "100%" }} disabled={!cart.length && !room} onClick={charge}>
            💰 Take Payment & Bill — {NPR(total)}
          </button>
        </div>
      </div>
      {pickRoom && roomData && (
        <Modal title="Add Room to Bill" onClose={() => setPickRoom(false)}>
          {roomData.rooms.filter(r => !r.booked).length === 0 && <p className="muted">No free rooms right now.</p>}
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {roomData.rooms.filter(r => !r.booked).map(r => (
              <button key={r.id} className="card" style={{ textAlign: "left", cursor: "pointer", border: "1px solid var(--gold-dim)" }}
                onClick={() => { setRoom(r); setPickRoom(false); }}>
                <b className="gold">Room {r.number}</b>
                <div className="muted">{r.type} · {r.floor}</div>
                <div>{NPR(r.price)} / night</div>
              </button>
            ))}
          </div>
          <div className="modal-actions">
            <button className="btn ghost" onClick={() => setPickRoom(false)}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ---------- income / expense ---------- */
function MoneyTab() {
  const [txs] = useLive(() => api("/transactions"), ["transactions", "order", "booking", "orders", "bookings", "credits"]);
  const [modal, setModal] = useState(false);
  const [f, setF] = useState({ kind: "expense", category: "", amount: "", note: "" });
  if (!txs) return <div className="empty">Loading…</div>;
  const income = txs.filter(t => t.kind === "income").reduce((s, t) => s + t.amount, 0);
  const expense = txs.filter(t => t.kind === "expense").reduce((s, t) => s + t.amount, 0);
  const save = async () => {
    await api("/transactions", { method: "POST", body: f });
    setF({ kind: "expense", category: "", amount: "", note: "" }); setModal(false);
  };
  return (
    <div>
      <PageHead t="Income & Expense" s="Bookings and restaurant income are recorded automatically"
        right={<button className="btn" onClick={() => setModal(true)}>+ Record Entry</button>} />
      <div className="stats">
        <div className="stat"><div className="v green">{NPR(income)}</div><div className="l">Total Income</div></div>
        <div className="stat"><div className="v red">{NPR(expense)}</div><div className="l">Total Expense</div></div>
        <div className="stat"><div className="v">{NPR(income - expense)}</div><div className="l">Net Profit</div></div>
      </div>
      <div className="tbl-wrap">
        <table>
          <thead><tr><th>Type</th><th>Category</th><th>Amount</th><th>Note</th><th>Date</th></tr></thead>
          <tbody>
            {txs.map(t => (
              <tr key={t.id}>
                <td>{t.kind === "income" ? <span className="pill p-ready">income</span> : <span className="pill p-cancelled">expense</span>}</td>
                <td>{t.category}</td>
                <td><b className={t.kind === "income" ? "green" : "red"}>{t.kind === "income" ? "+" : "−"}{NPR(t.amount)}</b></td>
                <td className="muted">{t.note} {t.paid === false ? "(due)" : ""}</td>
                <td className="muted">{fmtDT(t.date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {txs.length === 0 && <div className="empty">No records yet.</div>}
      </div>
      {modal && (
        <Modal title="Record Income / Expense" onClose={() => setModal(false)}>
          <label>Type</label>
          <div className="flex">
            <button className={"btn sm " + (f.kind === "income" ? "green" : "ghost")} onClick={() => setF({ ...f, kind: "income" })}>+ Income</button>
            <button className={"btn sm " + (f.kind === "expense" ? "danger" : "ghost")} onClick={() => setF({ ...f, kind: "expense" })}>− Expense</button>
          </div>
          <div className="row">
            <div><label>Category</label><input value={f.category} onChange={e => setF({ ...f, category: e.target.value })} placeholder="Vegetables / Salary / Gas…" /></div>
            <div><label>Amount (रू)</label><input type="number" value={f.amount} onChange={e => setF({ ...f, amount: e.target.value })} /></div>
          </div>
          <label>Note</label><input value={f.note} onChange={e => setF({ ...f, note: e.target.value })} />
          <div className="modal-actions">
            <button className="btn ghost" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn" onClick={save}>Save Entry</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
