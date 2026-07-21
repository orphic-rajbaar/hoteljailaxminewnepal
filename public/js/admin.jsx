/* admin.jsx — Admin panel: dashboard, floors/rooms, restaurant, orders, inventory,
   employees (+ access control), credit, payment/bank + QR, factory reset */

/* ---------- shared panel shell ---------- */
function PanelShell({ area, title, tabs, tab, setTab, children }) {
  const u = Auth.user;
  useEffect(() => { if (!u || !Auth.can(area)) go("/login"); }, []);
  useEffect(() => { /* enable desktop notifications for staff */
    if ("Notification" in window && Notification.permission === "default")
      Notification.requestPermission().catch(() => {});
  }, []);
  if (!u || !Auth.can(area)) return null;
  /* translate="no": Google-Translate rewrites DOM text and breaks React panels */
  return (
    <div className="panel notranslate" translate="no">
      <div className="side no-print">
        {tabs.map(t => (
          <button key={t.id} className={tab === t.id ? "active" : ""} onClick={() => setTab(t.id)}>
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
        <div className="sep" />
        {(u.role === "admin" || Auth.can("admin")) && area !== "admin" && <button onClick={() => go("/admin")}>👑 Admin Panel</button>}
        {Auth.can("reception") && area !== "reception" && <button onClick={() => go("/reception")}>🛎 Reception</button>}
        {Auth.can("kitchen") && area !== "kitchen" && <button onClick={() => go("/kitchen")}>👨‍🍳 Kitchen</button>}
        {(u.role === "admin" || Auth.can("reception") || Auth.can("waiter")) && area !== "waiter" && <button onClick={() => go("/waiter")}>🛎️ Waiter</button>}
        {(u.role === "admin" || Auth.can("reception") || Auth.can("pos")) && <button onClick={() => go("/pos")}>🏪 POS Billing</button>}
        <button onClick={() => go("/")}>🌐 Public Site</button>
        <button onClick={() => { Auth.clear(); window.dispatchEvent(new Event("auth-changed")); go("/login"); }}>🚪 Logout ({u.name.split(" ")[0]})</button>
      </div>
      <div className="main">{children}</div>
    </div>
  );
}

function PageHead({ t, s, right }) {
  return (
    <div className="flex spread mb">
      <div><h2 className="pg">{t}</h2><div className="pg-sub">{s}</div></div>
      <div>{right}</div>
    </div>
  );
}

/* ============ ADMIN PANEL ============ */
function AdminPanel() {
  const [tab, setTab] = useState("dash");
  const tabs = [
    { id: "dash", icon: "📊", label: "Dashboard" },
    { id: "home", icon: "🏠", label: "Home Page" },
    { id: "rooms", icon: "🛏️", label: "Floors & Rooms" },
    { id: "restaurant", icon: "🍽️", label: "Restaurant Menu" },
    { id: "restpage", icon: "🎬", label: "Restaurant Page" },
    { id: "tables", icon: "🍽️", label: "Tables" },
    { id: "offers", icon: "🎁", label: "Offers & Packages" },
    { id: "orders", icon: "🧾", label: "Orders" },
    { id: "bookings", icon: "📒", label: "Bookings" },
    { id: "reservations", icon: "🪑", label: "Reservations" },
    { id: "gallery", icon: "🖼️", label: "Gallery" },
    { id: "reviews", icon: "⭐", label: "Reviews" },
    { id: "posstore", icon: "🏪", label: "POS Store" },
    { id: "inventory", icon: "📦", label: "Inventory" },
    { id: "employees", icon: "👥", label: "Employees" },
    { id: "credit", icon: "💳", label: "Credit" },
    { id: "verify", icon: "✅", label: "Verify Pay" },
    { id: "payments", icon: "💰", label: "Payments" },
    { id: "payment", icon: "🏦", label: "Payment / Bank" },
    { id: "branding", icon: "🎨", label: "Logo & Branding" },
    { id: "backup", icon: "💾", label: "Backup" },
    { id: "gcloud", icon: "☁️", label: "Google Cloud" },
    { id: "reset", icon: "⚠️", label: "Factory Reset" }
  ];
  return (
    <PanelShell area="admin" tabs={tabs} tab={tab} setTab={setTab}>
      {tab === "dash" && <AdminDash />}
      {tab === "home" && <HomeContentTab />}
      {tab === "rooms" && <FloorsRooms />}
      {tab === "restaurant" && <AdminMenu />}
      {tab === "restpage" && <RestaurantContentTab />}
      {tab === "tables" && <TablesAdmin />}
      {tab === "offers" && <ContentList section="offers" title="Offer / Package" heading="🎁 Offers & Packages" sub="Offers & packages shown on the public homepage — add, edit or delete anytime"
        cardTitle="heading" fields={[{ key: "heading", label: "Heading *", ph: "e.g. Weekend Family Package" }, { key: "desc", label: "Description", type: "textarea", ph: "What's included…" }, { key: "photo", label: "Photo", type: "photo" }]} />}
      {tab === "orders" && <OrdersTable canBill />}
      {tab === "bookings" && <BookingsTable />}
      {tab === "reservations" && <ReservationsTable />}
      {tab === "gallery" && <GalleryTab />}
      {tab === "reviews" && <ReviewsTab />}
      {tab === "posstore" && <PosStoreAdmin />}
      {tab === "inventory" && <InventoryTab />}
      {tab === "employees" && <EmployeesTab />}
      {tab === "credit" && <CreditTab />}
      {tab === "verify" && <PaymentVerify />}
      {tab === "payments" && <PaymentsTab />}
      {tab === "payment" && <PaymentTab />}
      {tab === "branding" && <BrandingTab />}
      {tab === "backup" && <BackupTab />}
      {tab === "gcloud" && <GoogleCloudTab />}
      {tab === "reset" && <ResetTab />}
    </PanelShell>
  );
}

/* ---------- dashboard ---------- */
function AdminDash() {
  const [s] = useLive(() => api("/stats"), null);
  if (!s) return <div className="empty">Loading…</div>;
  const items = [
    ["Total Rooms", s.rooms], ["Booked Rooms", s.booked], ["Menu Items", s.menu],
    ["Active Orders", s.pendingOrders], ["Total Orders", s.orders], ["Employees", s.employees],
    ["Inventory Items", s.inventory], ["Credit Due", NPR(s.credits)],
    ["Income", NPR(s.income)], ["Expense", NPR(s.expense)], ["Profit", NPR(s.profit)]
  ];
  return (
    <div>
      <PageHead t="Dashboard" s="Live overview — updates in real time" />
      <div className="stats">
        {items.map(([l, v]) => <div className="stat" key={l}><div className="v">{v}</div><div className="l">{l}</div></div>)}
      </div>
      <OrdersTable compact />
    </div>
  );
}

/* ---------- floors & rooms ---------- */
function FloorsRooms() {
  const [floors] = useLive(() => api("/floors"), ["floors"]);
  const [rooms] = useLive(() => api("/rooms"), ["rooms", "bookings", "booking"]);
  const [newFloor, setNewFloor] = useState("");
  const [modal, setModal] = useState(null); // {room?, floorId}
  const [fErr, setFErr] = useState("");
  if (!floors || !rooms) return <div className="empty">Loading…</div>;
  const addFloor = async () => {
    setFErr("");
    if (!newFloor.trim()) { setFErr("Type a floor name first (e.g. Ground Floor), then press + Add Floor."); return; }
    try {
      await api("/floors", { method: "POST", body: { name: newFloor.trim() } });
      setNewFloor("");
    } catch (e) { setFErr(e.message); }
  };
  return (
    <div>
      <PageHead t="Floors & Rooms" s="Add floors, then add rooms inside each floor" />
      <div className="card mb">
        <div className="flex">
          <input placeholder="New floor name e.g. Ground Floor / पहिलो तला" value={newFloor}
            onChange={e => setNewFloor(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addFloor()}
            style={{ maxWidth: 340 }} />
          <button className="btn" onClick={addFloor}>+ Add Floor</button>
        </div>
        {fErr && <p className="red mt">⚠ {fErr}</p>}
      </div>
      {floors.length === 0 && <div className="empty">No floors yet — add your first floor above.</div>}
      {floors.map(f => (
        <div className="card mb" key={f.id}>
          <div className="flex spread mb">
            <h3 className="gold" style={{ fontFamily: "var(--font-display)", fontSize: 22 }}>🏛 {f.name}</h3>
            <div className="flex">
              <button className="btn sm" onClick={() => setModal({ floorId: f.id })}>+ Add Room</button>
              <button className="btn sm danger" onClick={async () => { if (confirm("Delete floor and all its rooms?")) await api("/floors/" + f.id, { method: "DELETE" }); }}>Delete Floor</button>
            </div>
          </div>
          <div className="grid c4">
            {rooms.filter(r => r.floorId === f.id).map(r => (
              <div className="card room-card" key={r.id} style={{ padding: 14 }}>
                <div className="room-head">
                  <div><div className="rnum" style={{ fontSize: 22 }}>Room {r.number}</div><div className="rtype">{r.type}</div></div>
                  <span className={"status-chip " + (r.booked ? "booked" : "free")}>{r.booked ? "Booked" : "Free"}</span>
                </div>
                <div className="price" style={{ fontSize: 17 }}>{NPR(r.price)} <span>/ night</span></div>
                {r.special ? <div className="special">✨ {r.special}</div> : null}
                <div className="flex mt">
                  <button className="btn sm ghost" onClick={() => setModal({ room: r, floorId: f.id })}>Edit</button>
                  <button className="btn sm ghost" onClick={() => api("/rooms/" + r.id, { method: "PUT", body: { booked: !r.booked } })}>{r.booked ? "Mark Free" : "Mark Booked"}</button>
                  <button className="btn sm danger" onClick={async () => { if (confirm("Delete room " + r.number + "?")) await api("/rooms/" + r.id, { method: "DELETE" }); }}>✕</button>
                </div>
              </div>
            ))}
            {rooms.filter(r => r.floorId === f.id).length === 0 && <p className="muted">No rooms on this floor yet.</p>}
          </div>
        </div>
      ))}
      {modal && <RoomModal floors={floors} init={modal} onClose={() => setModal(null)} />}
    </div>
  );
}

function RoomModal({ floors, init, onClose }) {
  const r = init.room || {};
  const [f, setF] = useState({ floorId: r.floorId || init.floorId, number: r.number || "", type: r.type || "", price: r.price || "", special: r.special || "", photos: r.photos || [] });
  const [err, setErr] = useState("");
  const save = async () => {
    setErr("");
    if (!String(f.number).trim() || !String(f.type).trim()) { setErr("Room number and room type are required."); return; }
    try {
      if (init.room) await api("/rooms/" + init.room.id, { method: "PUT", body: f });
      else await api("/rooms", { method: "POST", body: f });
      onClose();
    } catch (e) { setErr(e.message); }
  };
  return (
    <Modal title={init.room ? "Edit Room " + r.number : "Add Room"} onClose={onClose}>
      <label>Floor</label>
      <select value={f.floorId} onChange={e => setF({ ...f, floorId: e.target.value })}>
        {floors.map(fl => <option key={fl.id} value={fl.id}>{fl.name}</option>)}
      </select>
      <div className="row">
        <div><label>Room number *</label><input value={f.number} onChange={e => setF({ ...f, number: e.target.value })} placeholder="101" /></div>
        <div><label>Room type *</label><input value={f.type} onChange={e => setF({ ...f, type: e.target.value })} placeholder="Deluxe / Double / Single" /></div>
      </div>
      <div className="row">
        <div><label>Price per night (रू)</label><input type="number" value={f.price} onChange={e => setF({ ...f, price: e.target.value })} /></div>
        <div><label>Room special</label><input value={f.special} onChange={e => setF({ ...f, special: e.target.value })} placeholder="AC, TV, Attached bath…" /></div>
      </div>
      <div className="mt">
        <MultiPhoto photos={f.photos} onChange={p => setF({ ...f, photos: p })}
          label="Room photos — add many; first is the cover shown on the website" />
      </div>
      {err && <p className="red mt">⚠ {err}</p>}
      <div className="modal-actions">
        <button className="btn ghost" onClick={onClose}>Cancel</button>
        <button className="btn" onClick={save}>Save Room</button>
      </div>
    </Modal>
  );
}

/* ---------- restaurant menu (admin) ---------- */
function AdminMenu() {
  const [menu] = useLive(() => api("/menu"), ["menu"]);
  const [modal, setModal] = useState(null);
  const [qrOpen, setQrOpen] = useState(false);
  if (!menu) return <div className="empty">Loading…</div>;
  return (
    <div>
      <PageHead t="Restaurant Menu" s="Items added here appear instantly on the public site"
        right={<div className="flex">
          <button className="btn ghost" onClick={() => setQrOpen(true)}>📲 QR Menu</button>
          <button className="btn" onClick={() => setModal({})}>+ Add Menu Item</button>
        </div>} />
      {qrOpen && <QrMenuModal onClose={() => setQrOpen(false)} />}
      <div className="grid c4">
        {menu.map(m => (
          <div className="card menu-card" key={m.id}>
            <div className="ph">{m.photo ? <img src={m.photo} /> : <span className="noimg">🍛</span>}</div>
            <div className="body">
              <div className="fname"><span className={"veg-dot " + m.foodType}></span>{m.foodName}</div>
              <div className="fprice">{NPR(m.price)}</div>
              <div className="flex">
                <button className="btn sm ghost" onClick={() => setModal({ item: m })}>Edit</button>
                <button className="btn sm ghost" onClick={() => api("/menu/" + m.id, { method: "PUT", body: { available: m.available === false } })}>{m.available === false ? "Show" : "Hide"}</button>
                <button className="btn sm danger" onClick={async () => { if (confirm("Delete " + m.foodName + "?")) await api("/menu/" + m.id, { method: "DELETE" }); }}>✕</button>
              </div>
              {m.available === false && <span className="pill p-cancelled">Hidden from public</span>}
            </div>
          </div>
        ))}
      </div>
      {menu.length === 0 && <div className="empty">No menu items yet — add your first dish.</div>}
      {modal && <MenuModal init={modal} onClose={() => setModal(null)} />}
    </div>
  );
}

function MenuModal({ init, onClose }) {
  const m = init.item || {};
  const [f, setF] = useState({
    foodName: m.foodName || "", price: m.price || "", foodType: m.foodType || "veg", photo: m.photo || "",
    category: m.category || "", desc: m.desc || "", prepTime: m.prepTime || 15,
    spice: m.spice ?? 1, chefSpecial: !!m.chefSpecial
  });
  const [err, setErr] = useState("");
  const save = async () => {
    try {
      if (init.item) await api("/menu/" + init.item.id, { method: "PUT", body: f });
      else await api("/menu", { method: "POST", body: f });
      onClose();
    } catch (e) { setErr(e.message); }
  };
  return (
    <Modal title={init.item ? "Edit " + m.foodName : "Add Menu Item"} onClose={onClose}>
      <PhotoInput camera value={f.photo} onChange={p => setF({ ...f, photo: p })} label="Food photo (camera or gallery)" />
      <label>Food name *</label>
      <input value={f.foodName} onChange={e => setF({ ...f, foodName: e.target.value })} placeholder="Dal Bhat / Chicken Curry…" />
      <div className="row">
        <div><label>Food price (रू)</label><input type="number" value={f.price} onChange={e => setF({ ...f, price: e.target.value })} /></div>
        <div><label>Food type</label>
          <select value={f.foodType} onChange={e => setF({ ...f, foodType: e.target.value })}>
            <option value="veg">🟢 Veg</option><option value="nonveg">🔴 Non-Veg</option>
          </select>
        </div>
      </div>
      <div className="row">
        <div><label>Category</label>
          <input value={f.category} onChange={e => setF({ ...f, category: e.target.value })}
            placeholder="Nepali / Indian / Chinese / Fast Food / Dessert / Beverage" list="cat-list" />
          <datalist id="cat-list">
            {["Nepali", "Indian", "Chinese", "Fast Food", "Breakfast", "Dessert", "Beverage"].map(c => <option key={c} value={c} />)}
          </datalist>
        </div>
        <div><label>Prep time (minutes)</label><input type="number" min="1" value={f.prepTime} onChange={e => setF({ ...f, prepTime: e.target.value })} /></div>
      </div>
      <label>Short description</label>
      <input value={f.desc} onChange={e => setF({ ...f, desc: e.target.value })} placeholder="Fresh, homely and served hot…" />
      <div className="row">
        <div><label>Spice level</label>
          <select value={f.spice} onChange={e => setF({ ...f, spice: e.target.value })}>
            <option value="0">Not spicy</option><option value="1">🌶 Mild</option>
            <option value="2">🌶🌶 Medium</option><option value="3">🌶🌶🌶 Hot</option>
          </select>
        </div>
        <div><label>Chef's Special</label>
          <button type="button" className={"btn sm " + (f.chefSpecial ? "" : "ghost")} style={{ width: "100%" }}
            onClick={() => setF({ ...f, chefSpecial: !f.chefSpecial })}>
            {f.chefSpecial ? "👨‍🍳 Chef's Special ✓" : "Mark as Chef's Special"}
          </button>
        </div>
      </div>
      {err && <p className="red mt">⚠ {err}</p>}
      <div className="modal-actions">
        <button className="btn ghost" onClick={onClose}>Cancel</button>
        <button className="btn" onClick={save}>Save Item</button>
      </div>
    </Modal>
  );
}

/* ---------- orders table (admin record + reception) ---------- */
function OrdersTable({ compact, canBill }) {
  const [orders] = useLive(() => api("/orders"), ["orders", "order", "order-status"]);
  if (!orders) return <div className="empty">Loading…</div>;
  const list = compact ? orders.slice(0, 8) : orders;
  return (
    <div>
      {!compact && <PageHead t="Restaurant Orders" s="Every order — online and POS — is recorded here" />}
      {compact && <h3 className="gold mb" style={{ fontFamily: "var(--font-display)", fontSize: 20 }}>Recent Orders</h3>}
      <div className="tbl-wrap">
        <table>
          <thead><tr><th>#</th><th>Items</th><th>Customer</th><th>Total</th><th>Payment</th><th>Status</th><th>Source</th><th>Time</th>{canBill && <th>Print</th>}</tr></thead>
          <tbody>
            {list.map(o => (
              <tr key={o.id}>
                <td><b className="gold">#{o.no}</b></td>
                <td>{o.items.map(i => i.foodName + "×" + i.qty).join(", ")}</td>
                <td>{o.name}{o.table ? <span className="muted"> · T{o.table}</span> : ""}</td>
                <td><b>{NPR(o.total)}</b></td>
                <td>{o.paymentMethod} {o.paid ? <span className="green">✓</span> : <span className="red">due</span>}</td>
                <td><span className={"pill p-" + o.status}>{o.status}</span></td>
                <td>{o.source}</td>
                <td className="muted">{fmtDT(o.createdAt)}</td>
                {canBill && (
                  <td className="flex">
                    <button className="btn sm" title="Print ALL bills at once" onClick={() => printAllBills(o)}>🖨 All</button>
                    <button className="btn sm ghost" title="Customer bill" onClick={() => printHTML(billHTML(o, "customer"))}>🧾</button>
                    <button className="btn sm ghost" title="Kitchen token" onClick={() => printHTML(billHTML(o, "kitchen"))}>🍳</button>
                    <button className="btn sm ghost" title="Reception token" onClick={() => printHTML(billHTML(o, "reception"))}>🛎</button>
                    {!o.paid && <button className="btn sm green" onClick={() => api("/orders/" + o.id, { method: "PATCH", body: { paid: true } })}>Paid</button>}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <div className="empty">No orders yet.</div>}
      </div>
    </div>
  );
}

/* ---------- bookings table ---------- */
function BookingsTable() {
  const [bookings] = useLive(() => api("/bookings"), ["bookings", "booking", "rooms"]);
  if (!bookings) return <div className="empty">Loading…</div>;
  return (
    <div>
      <PageHead t="Room Bookings" s="Online and reception bookings, live" />
      <div className="tbl-wrap">
        <table>
          <thead><tr><th>#</th><th>Guest</th><th>ID</th><th>Room</th><th>Stay</th><th>Total</th><th>Paid</th><th>Pending</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {bookings.map(b => {
              const total = b.total !== undefined ? b.total : (b.nights || 1) * (Number(b.price) || 0);
              const paidA = b.paidAmount !== undefined ? b.paidAmount : (b.paid ? total : 0);
              const pend = b.pendingAmount !== undefined ? b.pendingAmount : total - paidA;
              return (
                <tr key={b.id}>
                  <td><b className="gold">#{b.no}</b></td>
                  <td><b>{b.name}</b><div className="muted" style={{ fontSize: 12 }}>{b.phone}{b.address ? " · " + b.address : ""}{b.persons ? " · " + b.persons + "p" : ""}</div></td>
                  <td>{b.idPhoto
                    ? <img className="thumb" src={b.idPhoto} style={{ cursor: "pointer" }} title="Click to view ID"
                        onClick={() => { const w = window.open(""); w.document.write('<body style="margin:0;background:#111"><img src="' + b.idPhoto + '" style="max-width:100%"/></body>'); }} />
                    : <span className="muted">—</span>}</td>
                  <td><b>{b.roomNumber}</b> <span className="muted">{b.roomType}</span></td>
                  <td>{b.checkIn}{b.checkOut ? " → " + b.checkOut : ""}<div className="muted" style={{ fontSize: 12 }}>{b.nights || 1} night(s) × {NPR(b.price)}</div></td>
                  <td><b>{NPR(total)}</b></td>
                  <td className="green">{NPR(paidA)}<div className="muted" style={{ fontSize: 11 }}>{b.paymentMethod}</div></td>
                  <td>{pend > 0 ? <b className="red">{NPR(pend)}</b> : <span className="green">✓ paid</span>}</td>
                  <td>
                    <span className={"pill " + (b.status === "booked" ? "p-ready" : "p-completed")}>{b.status}</span>
                    {b.selfCheckedIn && <span className="pill p-making" style={{ marginLeft: 4 }}>self ✓</span>}
                  </td>
                  <td className="flex">
                    <button className="btn sm ghost" onClick={() => printHTML(roomBillHTML(b))}>🖨</button>
                    {pend > 0 && <button className="btn sm green" onClick={() => {
                      const amt = prompt("Payment received (रू)? Pending: " + pend, pend);
                      if (amt !== null) api("/bookings/" + b.id, { method: "PATCH", body: { addPayment: Number(amt) } }).catch(e => alert(e.message));
                    }}>+ Payment</button>}
                    {b.status === "booked" && <>
                      <button className="btn sm blue" onClick={() => api("/bookings/" + b.id, { method: "PATCH", body: { status: "checked-out" } })}>Check-out</button>
                      <button className="btn sm danger" onClick={() => api("/bookings/" + b.id, { method: "PATCH", body: { status: "cancelled" } })}>Cancel</button>
                    </>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {bookings.length === 0 && <div className="empty">No bookings yet.</div>}
      </div>
    </div>
  );
}

/* ---------- gallery management ---------- */
function GalleryTab() {
  const [items] = useLive(() => api("/gallery"), ["gallery"]);
  const [modal, setModal] = useState(null);
  if (!items) return <div className="empty">Loading…</div>;
  return (
    <div>
      <PageHead t="🖼️ Gallery" s="Photos added here appear instantly in the public galleries"
        right={<button className="btn" onClick={() => setModal({})}>+ Add Photo</button>} />
      {items.length === 0 && <div className="empty">No gallery photos yet — add your first one.</div>}
      <div className="grid c4">
        {items.map(g => (
          <div className="card" key={g.id} style={{ padding: 10 }}>
            <img src={g.photo} style={{ width: "100%", height: 130, objectFit: "cover", borderRadius: 10, opacity: g.hidden ? .35 : 1 }} />
            <div className="flex spread mt" style={{ gap: 6 }}>
              <div style={{ minWidth: 0 }}>
                <b style={{ fontSize: 13.5, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.caption || "—"}</b>
                <span className="pill p-pending" style={{ fontSize: 11 }}>{g.category}</span>
                {g.hidden && <span className="pill p-cancelled" style={{ fontSize: 11, marginLeft: 4 }}>hidden</span>}
              </div>
            </div>
            <div className="flex mt" style={{ gap: 6 }}>
              <button className="btn sm ghost" onClick={() => setModal({ item: g })}>Edit</button>
              <button className="btn sm ghost" onClick={() => api("/gallery/" + g.id, { method: "PUT", body: { hidden: !g.hidden } })}>{g.hidden ? "Show" : "Hide"}</button>
              <button className="btn sm danger" onClick={async () => { if (confirm("Delete this photo?")) await api("/gallery/" + g.id, { method: "DELETE" }); }}>✕</button>
            </div>
          </div>
        ))}
      </div>
      {modal && <GalleryModal init={modal} onClose={() => setModal(null)} />}
    </div>
  );
}

function GalleryModal({ init, onClose }) {
  const g = init.item || {};
  const [f, setF] = useState({ photo: g.photo || "", caption: g.caption || "", category: g.category || "hotel" });
  const [err, setErr] = useState("");
  const save = async () => {
    setErr("");
    if (!f.photo) { setErr("Please add a photo first."); return; }
    try {
      if (init.item) await api("/gallery/" + init.item.id, { method: "PUT", body: f });
      else await api("/gallery", { method: "POST", body: f });
      onClose();
    } catch (e) { setErr(e.message); }
  };
  return (
    <Modal title={init.item ? "Edit Photo" : "Add Gallery Photo"} onClose={onClose}>
      <PhotoInput camera value={f.photo} onChange={p => setF({ ...f, photo: p })} label="Photo (camera or device)" />
      <label>Caption</label>
      <input value={f.caption} onChange={e => setF({ ...f, caption: e.target.value })} placeholder="e.g. Deluxe room balcony / Dinner service" />
      <label>Category</label>
      <select value={f.category} onChange={e => setF({ ...f, category: e.target.value })}>
        <option value="hotel">🏨 Hotel</option><option value="rooms">🛏 Rooms</option>
        <option value="restaurant">🍽 Restaurant</option><option value="events">🎉 Events</option>
      </select>
      {err && <p className="red mt">⚠ {err}</p>}
      <div className="modal-actions">
        <button className="btn ghost" onClick={onClose}>Cancel</button>
        <button className="btn" onClick={save}>Save Photo</button>
      </div>
    </Modal>
  );
}

/* ---------- reviews moderation ---------- */
function ReviewsTab() {
  const [list] = useLive(() => api("/reviews"), ["reviews", "review"]);
  const [edit, setEdit] = useState(null);
  if (!list) return <div className="empty">Loading…</div>;
  return (
    <div>
      <PageHead t="⭐ Reviews" s="Approve guest reviews to show them on the public website — instantly" />
      <div className="tbl-wrap">
        <table>
          <thead><tr><th>Guest</th><th>Rating</th><th>Review</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {list.map(r => (
              <tr key={r.id}>
                <td><b>{r.name}</b><div className="muted" style={{ fontSize: 12 }}>{r.country}</div></td>
                <td style={{ color: "var(--gold)", whiteSpace: "nowrap" }}>{"★".repeat(r.rating)}</td>
                <td style={{ maxWidth: 340 }}>{r.text}</td>
                <td className="muted">{fmtDT(r.createdAt)}</td>
                <td>{r.status === "approved" ? <span className="pill p-ready">approved ✓</span> : <span className="pill p-pending">pending</span>}</td>
                <td className="flex">
                  {r.status !== "approved"
                    ? <button className="btn sm green" onClick={() => api("/reviews/" + r.id, { method: "PATCH", body: { status: "approved" } })}>✓ Approve</button>
                    : <button className="btn sm ghost" onClick={() => api("/reviews/" + r.id, { method: "PATCH", body: { status: "pending" } })}>Unpublish</button>}
                  <button className="btn sm ghost" onClick={() => setEdit(r)}>Edit</button>
                  <button className="btn sm danger" onClick={async () => { if (confirm("Delete this review?")) await api("/reviews/" + r.id, { method: "DELETE" }); }}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <div className="empty">No reviews yet — guests can write them on the Rooms and Restaurant pages.</div>}
      </div>
      {edit && (
        <Modal title="Edit Review" onClose={() => setEdit(null)}>
          <div className="row">
            <div><label>Guest name</label><input defaultValue={edit.name} id="rv_n" /></div>
            <div><label>Country</label><input defaultValue={edit.country} id="rv_c" /></div>
          </div>
          <label>Rating</label>
          <select defaultValue={edit.rating} id="rv_r">{[5, 4, 3, 2, 1].map(x => <option key={x} value={x}>{"★".repeat(x)}</option>)}</select>
          <label>Review text</label>
          <textarea rows="3" defaultValue={edit.text} id="rv_t" />
          <div className="modal-actions">
            <button className="btn ghost" onClick={() => setEdit(null)}>Cancel</button>
            <button className="btn" onClick={async () => {
              await api("/reviews/" + edit.id, { method: "PATCH", body: {
                name: document.getElementById("rv_n").value, country: document.getElementById("rv_c").value,
                rating: document.getElementById("rv_r").value, text: document.getElementById("rv_t").value
              } });
              setEdit(null);
            }}>Save</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ---------- multi-photo picker (rooms & dishes) ---------- */
function MultiPhoto({ photos, onChange, label: lbl }) {
  const add = p => p && onChange([...(photos || []), p]);
  return (
    <div>
      <label>{lbl || "Photos (first = cover — click a photo to make it the cover)"}</label>
      {(photos || []).length > 0 && (
        <div className="flex" style={{ gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
          {photos.map((p, i) => (
            <div key={i} style={{ position: "relative" }}>
              <img src={p} title={i === 0 ? "Cover photo" : "Click to set as cover"}
                onClick={() => onChange([p, ...photos.filter((_, k) => k !== i)])}
                style={{ width: 66, height: 66, objectFit: "cover", borderRadius: 10, cursor: "pointer",
                  border: i === 0 ? "2.5px solid var(--gold)" : "1px solid #2c2c36" }} />
              {i === 0 && <span style={{ position: "absolute", bottom: -6, left: 4, fontSize: 9, background: "var(--gold)", color: "#14100a", borderRadius: 6, padding: "1px 6px", fontWeight: 700 }}>COVER</span>}
              <button onClick={() => onChange(photos.filter((_, k) => k !== i))}
                style={{ position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: "50%", border: "none", background: "var(--red)", color: "#fff", fontSize: 11, cursor: "pointer" }}>✕</button>
            </div>
          ))}
        </div>
      )}
      <PhotoInput camera value="" onChange={add} label="" />
    </div>
  );
}

/* ---------- inventory ---------- */
function InventoryTab() {
  const [inv] = useLive(() => api("/inventory"), ["inventory"]);
  const [modal, setModal] = useState(null);
  if (!inv) return <div className="empty">Loading…</div>;
  return (
    <div>
      <PageHead t="Inventory" s="Store & record hotel stock items"
        right={<button className="btn" onClick={() => setModal({})}>+ Add Item</button>} />
      <div className="tbl-wrap">
        <table>
          <thead><tr><th>Item</th><th>Quantity</th><th>Unit</th><th>Note</th><th>Updated</th><th>Actions</th></tr></thead>
          <tbody>
            {inv.map(it => (
              <tr key={it.id}>
                <td><b>{it.name}</b></td>
                <td>{it.qty}</td><td>{it.unit}</td><td className="muted">{it.note}</td>
                <td className="muted">{fmtDT(it.updatedAt)}</td>
                <td className="flex">
                  <button className="btn sm ghost" onClick={() => api("/inventory/" + it.id, { method: "PUT", body: { qty: it.qty + 1 } })}>+1</button>
                  <button className="btn sm ghost" onClick={() => api("/inventory/" + it.id, { method: "PUT", body: { qty: Math.max(0, it.qty - 1) } })}>−1</button>
                  <button className="btn sm ghost" onClick={() => setModal({ item: it })}>Edit</button>
                  <button className="btn sm danger" onClick={async () => { if (confirm("Delete " + it.name + "?")) await api("/inventory/" + it.id, { method: "DELETE" }); }}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {inv.length === 0 && <div className="empty">Inventory is empty.</div>}
      </div>
      {modal && <InvModal init={modal} onClose={() => setModal(null)} />}
    </div>
  );
}

function InvModal({ init, onClose }) {
  const it = init.item || {};
  const [f, setF] = useState({ name: it.name || "", qty: it.qty ?? "", unit: it.unit || "pcs", note: it.note || "" });
  const save = async () => {
    if (init.item) await api("/inventory/" + init.item.id, { method: "PUT", body: f });
    else await api("/inventory", { method: "POST", body: f });
    onClose();
  };
  return (
    <Modal title={init.item ? "Edit Item" : "Add Inventory Item"} onClose={onClose}>
      <label>Item name *</label><input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} placeholder="Rice / Gas cylinder / Bedsheet…" />
      <div className="row">
        <div><label>Quantity</label><input type="number" value={f.qty} onChange={e => setF({ ...f, qty: e.target.value })} /></div>
        <div><label>Unit</label><input value={f.unit} onChange={e => setF({ ...f, unit: e.target.value })} placeholder="kg / pcs / litre" /></div>
      </div>
      <label>Note</label><input value={f.note} onChange={e => setF({ ...f, note: e.target.value })} />
      <div className="modal-actions">
        <button className="btn ghost" onClick={onClose}>Cancel</button>
        <button className="btn" onClick={save}>Save</button>
      </div>
    </Modal>
  );
}

/* ---------- employees + access ---------- */
function monthPaid(e) {
  const now = new Date();
  return (e.salaryLog || []).filter(r => {
    const d = new Date(r.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((s, r) => s + r.amount, 0);
}

function EmployeesTab() {
  const [emps] = useLive(() => api("/employees"), ["employees"]);
  const [modal, setModal] = useState(null);
  const [salModal, setSalModal] = useState(null);
  if (!emps) return <div className="empty">Loading…</div>;
  return (
    <div>
      <PageHead t="Employees" s="Records, salary & panel access (kitchen / reception login)"
        right={<button className="btn" onClick={() => setModal({})}>+ Add Employee</button>} />
      <div className="tbl-wrap">
        <table>
          <thead><tr><th>Photo</th><th>Name</th><th>ID</th><th>Phone</th><th>Salary / month</th><th>This Month</th><th>Panel Access</th><th>Actions</th></tr></thead>
          <tbody>
            {emps.map(e => {
              const paid = monthPaid(e);
              const pending = Math.max(0, (e.salary || 0) - paid);
              return (
                <tr key={e.id}>
                  <td>{e.photo ? <img className="avatar" src={e.photo} /> : <span style={{ fontSize: 26 }}>👤</span>}</td>
                  <td><b>{e.name}</b><div className="muted" style={{ fontSize: 12 }}>{e.email || ""}</div></td>
                  <td>{e.empId}</td><td>{e.phone}</td>
                  <td>{e.salary ? <b>{NPR(e.salary)}</b> : <span className="muted">—</span>}</td>
                  <td>
                    <span className="green">{NPR(paid)} paid</span>
                    {e.salary ? <div className={pending > 0 ? "red" : "green"} style={{ fontSize: 12.5 }}>{pending > 0 ? NPR(pending) + " pending" : "✓ settled"}</div> : null}
                  </td>
                  <td>{(e.access || []).length ? e.access.map(a => <span key={a} className="pill p-ready" style={{ marginRight: 4 }}>{a}</span>) : <span className="muted">none</span>}</td>
                  <td className="flex">
                    <button className="btn sm green" onClick={() => setSalModal(e)}>💰 Salary</button>
                    <button className="btn sm ghost" onClick={() => setModal({ emp: e })}>Edit</button>
                    <button className="btn sm danger" onClick={async () => { if (confirm("Remove " + e.name + "?")) await api("/employees/" + e.id, { method: "DELETE" }); }}>✕</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {emps.length === 0 && <div className="empty">No employees recorded yet.</div>}
      </div>
      {modal && <EmpModal init={modal} onClose={() => setModal(null)} />}
      {salModal && <SalaryModal emp={emps.find(x => x.id === salModal.id) || salModal} onClose={() => setSalModal(null)} />}
    </div>
  );
}

/* ---------- salary ledger ---------- */
function SalaryModal({ emp, onClose }) {
  const [f, setF] = useState({ type: "salary", amount: "", note: "" });
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [salEdit, setSalEdit] = useState(emp.salary || "");
  const paid = monthPaid(emp);
  const pending = Math.max(0, (emp.salary || 0) - paid);
  const advances = (emp.salaryLog || []).filter(r => r.type === "advance").reduce((s, r) => s + r.amount, 0);
  const pay = async () => {
    setErr(""); setOk("");
    try {
      await api("/employees/" + emp.id + "/salary", { method: "POST", body: f });
      setOk("✓ " + (f.type === "advance" ? "Advance" : "Salary") + " of " + NPR(f.amount) + " recorded (also added to expenses).");
      setF({ type: "salary", amount: "", note: "" });
    } catch (e) { setErr(e.message + (e.message.includes("404") ? " — restart the server with START-HOTEL.bat" : "")); }
  };
  const setSalary = async () => {
    setErr(""); setOk("");
    try {
      await api("/employees/" + emp.id, { method: "PUT", body: { salary: Number(salEdit) || 0 } });
      setOk("✓ Monthly salary set to " + NPR(salEdit) + ".");
    } catch (e) { setErr(e.message); }
  };
  return (
    <Modal title={"💰 Salary — " + emp.name} onClose={onClose} wide>
      {(emp.salary || 0) === 0 && (
        <div className="card mb" style={{ borderColor: "var(--gold)" }}>
          <label>⚠ No monthly salary set yet — set it first:</label>
          <div className="flex">
            <input type="number" min="0" placeholder="Monthly salary रू" value={salEdit}
              onChange={e => setSalEdit(e.target.value)} style={{ maxWidth: 180 }} />
            <button className="btn sm" onClick={setSalary}>Set Salary</button>
          </div>
        </div>
      )}
      <div className="stats" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))" }}>
        <div className="stat"><div className="v" style={{ fontSize: 20 }}>{NPR(emp.salary || 0)}</div><div className="l">Salary / month</div></div>
        <div className="stat"><div className="v green" style={{ fontSize: 20 }}>{NPR(paid)}</div><div className="l">Paid this month</div></div>
        <div className="stat"><div className={"v " + (pending > 0 ? "red" : "green")} style={{ fontSize: 20 }}>{pending > 0 ? NPR(pending) : "✓"}</div><div className="l">Pending this month</div></div>
        <div className="stat"><div className="v" style={{ fontSize: 20 }}>{NPR(advances)}</div><div className="l">Total advances</div></div>
      </div>
      <label>Record a payment</label>
      <div className="flex">
        <button className={"btn sm " + (f.type === "salary" ? "" : "ghost")} onClick={() => setF({ ...f, type: "salary" })}>💵 Salary Payment</button>
        <button className={"btn sm " + (f.type === "advance" ? "blue" : "ghost")} onClick={() => setF({ ...f, type: "advance" })}>⏩ Advance</button>
        <input type="number" min="1" placeholder="Amount रू" value={f.amount}
          onChange={e => setF({ ...f, amount: e.target.value })} style={{ maxWidth: 140 }} />
        <input placeholder="note (e.g. Shrawan salary)" value={f.note}
          onChange={e => setF({ ...f, note: e.target.value })} style={{ maxWidth: 220 }} />
        <button className="btn sm green" disabled={!Number(f.amount)} onClick={pay}>Save</button>
      </div>
      {pending > 0 && <button className="btn sm ghost mt" onClick={() => setF({ ...f, type: "salary", amount: pending })}>Pay full pending {NPR(pending)}</button>}
      {err && <p className="red mt">⚠ {err}</p>}
      {ok && <p className="green mt">{ok}</p>}
      <label style={{ marginTop: 18 }}>Payment history</label>
      <div className="tbl-wrap">
        <table>
          <thead><tr><th>Date</th><th>Type</th><th>Amount</th><th>Note</th><th>By</th></tr></thead>
          <tbody>
            {(emp.salaryLog || []).slice().reverse().map(r => (
              <tr key={r.id}>
                <td className="muted">{fmtDT(r.date)}</td>
                <td>{r.type === "advance" ? <span className="pill p-making">advance</span> : <span className="pill p-ready">salary</span>}</td>
                <td><b>{NPR(r.amount)}</b></td>
                <td className="muted">{r.note}</td>
                <td className="muted">{r.by}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!(emp.salaryLog || []).length && <div className="empty" style={{ padding: 20 }}>No payments recorded yet.</div>}
      </div>
      <div className="modal-actions">
        <button className="btn ghost" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

function EmpModal({ init, onClose }) {
  const e0 = init.emp || {};
  const [f, setF] = useState({ name: e0.name || "", phone: e0.phone || "", empId: e0.empId || "", photo: e0.photo || "", email: e0.email || "", password: "", access: e0.access || [], salary: e0.salary || "" });
  const [err, setErr] = useState("");
  const toggle = a => setF({ ...f, access: f.access.includes(a) ? f.access.filter(x => x !== a) : [...f.access, a] });
  const save = async () => {
    try {
      if (init.emp) await api("/employees/" + init.emp.id, { method: "PUT", body: f });
      else await api("/employees", { method: "POST", body: f });
      onClose();
    } catch (e) { setErr(e.message); }
  };
  return (
    <Modal title={init.emp ? "Edit Employee" : "Add Employee"} onClose={onClose}>
      <PhotoInput value={f.photo} onChange={p => setF({ ...f, photo: p })} label="Employee photo" />
      <div className="row">
        <div><label>Name *</label><input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></div>
        <div><label>Employee ID</label><input value={f.empId} onChange={e => setF({ ...f, empId: e.target.value })} placeholder="EMP-001" /></div>
      </div>
      <div className="row">
        <div><label>Phone number</label><input value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} /></div>
        <div><label>Salary per month (रू)</label><input type="number" min="0" value={f.salary} onChange={e => setF({ ...f, salary: e.target.value })} placeholder="e.g. 15000" /></div>
      </div>
      <label style={{ marginTop: 16, color: "var(--gold)" }}>Panel access (login rights)</label>
      <div className="flex">
        <button className={"btn sm " + (f.access.includes("kitchen") ? "" : "ghost")} onClick={() => toggle("kitchen")}>👨‍🍳 Kitchen Panel</button>
        <button className={"btn sm " + (f.access.includes("reception") ? "" : "ghost")} onClick={() => toggle("reception")}>🛎 Reception Panel</button>
        <button className={"btn sm " + (f.access.includes("waiter") ? "" : "ghost")} onClick={() => toggle("waiter")}>🛎️ Waiter Panel</button>
        <button className={"btn sm " + (f.access.includes("pos") ? "" : "ghost")} onClick={() => toggle("pos")}>🏪 POS / Cashier</button>
        <button className={"btn sm " + (f.access.includes("admin") ? "gold" : "ghost")} onClick={() => toggle("admin")}>👑 Sub-Admin (full access)</button>
      </div>
      {f.access.includes("admin") && <p className="muted" style={{ fontSize: 12 }}>⚠ Sub-Admin can access every panel and do everything an admin can (except this is still logged separately).</p>}
      {f.access.length > 0 && (
        <div className="row">
          <div><label>Login email</label><input value={f.email} onChange={e => setF({ ...f, email: e.target.value })} /></div>
          <div><label>{init.emp ? "New password (blank = keep)" : "Login password"}</label><input type="password" value={f.password} onChange={e => setF({ ...f, password: e.target.value })} /></div>
        </div>
      )}
      {err && <p className="red mt">⚠ {err}</p>}
      <div className="modal-actions">
        <button className="btn ghost" onClick={onClose}>Cancel</button>
        <button className="btn" onClick={save}>Save Employee</button>
      </div>
    </Modal>
  );
}

/* ---------- credit ---------- */
function CreditTab() {
  const [credits] = useLive(() => api("/credits"), ["credits"]);
  const [modal, setModal] = useState(false);
  const [f, setF] = useState({ name: "", phone: "", amount: "", note: "" });
  if (!credits) return <div className="empty">Loading…</div>;
  const due = credits.filter(c => !c.settled).reduce((s, c) => s + c.amount, 0);
  const save = async () => {
    await api("/credits", { method: "POST", body: f });
    setF({ name: "", phone: "", amount: "", note: "" }); setModal(false);
  };
  return (
    <div>
      <PageHead t="Credit (उधारो)" s={"Total due: " + NPR(due)}
        right={<button className="btn" onClick={() => setModal(true)}>+ Add Credit</button>} />
      <div className="tbl-wrap">
        <table>
          <thead><tr><th>Customer</th><th>Phone</th><th>Amount</th><th>Note</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {credits.map(c => (
              <tr key={c.id}>
                <td><b>{c.name}</b></td><td>{c.phone}</td>
                <td><b className={c.settled ? "green" : "red"}>{NPR(c.amount)}</b></td>
                <td className="muted">{c.note}</td><td className="muted">{fmtDT(c.date)}</td>
                <td>{c.settled ? <span className="pill p-ready">settled ✓</span> : <span className="pill p-cancelled">due</span>}</td>
                <td className="flex">
                  {!c.settled && <button className="btn sm green" onClick={() => api("/credits/" + c.id, { method: "PATCH", body: { settled: true } })}>Mark Settled</button>}
                  <button className="btn sm danger" onClick={async () => { if (confirm("Delete credit record?")) await api("/credits/" + c.id, { method: "DELETE" }); }}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {credits.length === 0 && <div className="empty">No credit records.</div>}
      </div>
      {modal && (
        <Modal title="Add Credit Record" onClose={() => setModal(false)}>
          <div className="row">
            <div><label>Customer name *</label><input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></div>
            <div><label>Phone</label><input value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} /></div>
          </div>
          <div className="row">
            <div><label>Amount (रू)</label><input type="number" value={f.amount} onChange={e => setF({ ...f, amount: e.target.value })} /></div>
            <div><label>Note</label><input value={f.note} onChange={e => setF({ ...f, note: e.target.value })} placeholder="Room / food / other" /></div>
          </div>
          <div className="modal-actions">
            <button className="btn ghost" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn" onClick={save}>Save Credit</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ---------- payment / bank + QR ---------- */
function PaymentTab() {
  const [p, setP] = useState(null);
  const [saved, setSaved] = useState(false);
  const [testAmt, setTestAmt] = useState(100);
  const [etest, setEtest] = useState(null);
  const [etesting, setEtesting] = useState(false);
  const testEsewa = async () => {
    setEtesting(true);
    try { setEtest(await api("/esewa/status")); } catch (e) { setEtest({ error: e.message }); }
    setEtesting(false);
  };
  useEffect(() => { api("/payment").then(setP).catch(() => {}); }, []);
  if (!p) return <div className="empty">Loading…</div>;
  const save = async () => {
    await api("/payment", { method: "PUT", body: p });
    setSaved(true); setTimeout(() => setSaved(false), 2500);
  };
  const ready = p.accountName && p.accountNumber;
  const payload = ready
    ? `upi://pay?pa=${encodeURIComponent(p.apiKey || p.accountNumber)}&pn=${encodeURIComponent(p.accountName)}&am=${Number(testAmt || 0).toFixed(2)}&cu=NPR&tn=${encodeURIComponent("Hotel Jai Laxmi and Lodge")}`
    : "";
  return (
    <div>
      <PageHead t="Payment / Bank Details" s="Connected to Restaurant & Room Booking checkout — customers scan this QR" />
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 18, alignItems: "start" }}>
        <div className="card">
          <label>Account name</label>
          <input value={p.accountName} onChange={e => setP({ ...p, accountName: e.target.value })} placeholder="Hotel Jai Laxmi and Lodge" />
          <label>Account number</label>
          <input value={p.accountNumber} onChange={e => setP({ ...p, accountNumber: e.target.value })} />
          <label>Bank name</label>
          <input value={p.bankName || ""} onChange={e => setP({ ...p, bankName: e.target.value })} placeholder="e.g. NIC Asia / Nabil" />
          <label>Payment API key / merchant ID</label>
          <input value={p.apiKey} onChange={e => setP({ ...p, apiKey: e.target.value })} placeholder="merchant@bank or API key" />
          <button className="btn mt" onClick={save}>{saved ? "✓ Saved!" : "Save Bank Details"}</button>
          <p className="muted mt">Once saved, the checkout page generates a live QR with the exact bill amount for every order and booking.</p>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <h4 className="gold mb">Live QR Preview</h4>
          {ready ? (
            <>
              <div className="qr-box">
                <PayQR payload={payload} />
                <p>{p.accountName}{p.bankName ? " · " + p.bankName : ""}</p>
                <p>A/C: {p.accountNumber}</p>
              </div>
              <label>Test amount (रू)</label>
              <input type="number" value={testAmt} onChange={e => setTestAmt(e.target.value)} style={{ maxWidth: 160, margin: "0 auto" }} />
            </>
          ) : <div className="empty">Fill account name & number to generate the QR.</div>}
        </div>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <div className="flex spread mb" style={{ flexWrap: "wrap", gap: 8 }}>
          <h4 className="gold" style={{ margin: 0 }}>🟢 eSewa Banking Integration</h4>
          <div className="flex" style={{ gap: 6 }}>
            <span className={"pill " + ((p.esewaMode || "test") === "live" ? "p-cancelled" : "p-pending")}>{(p.esewaMode || "test") === "live" ? "LIVE" : "TEST"}</span>
            <span className={"pill " + (p.esewaEnabled === false ? "p-cancelled" : "p-ready")}>{p.esewaEnabled === false ? "Disabled" : "Enabled"}</span>
          </div>
        </div>
        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 18, alignItems: "start" }}>
          <div>
            <div className="row">
              <div><label>Mode</label>
                <select value={p.esewaMode || "test"} onChange={e => setP({ ...p, esewaMode: e.target.value })}>
                  <option value="test">Test / Sandbox</option>
                  <option value="live">Live (real money)</option>
                </select>
              </div>
              <div><label>Show at checkout</label>
                <select value={p.esewaEnabled === false ? "no" : "yes"} onChange={e => setP({ ...p, esewaEnabled: e.target.value === "yes" })}>
                  <option value="yes">Yes — enabled</option>
                  <option value="no">No — hidden</option>
                </select>
              </div>
            </div>
            <label>Merchant Product Code</label>
            <input value={p.esewaProductCode || ""} onChange={e => setP({ ...p, esewaProductCode: e.target.value })} placeholder="EPAYTEST (test) or your live code" />
            <label>Merchant Secret Key</label>
            <input value={p.esewaSecret || ""} onChange={e => setP({ ...p, esewaSecret: e.target.value })} placeholder="8gBm/:&EnhH.1/q( (test) or your live secret" />
            <div className="flex mt">
              <button className="btn" onClick={save}>{saved ? "✓ Saved!" : "Save Integration"}</button>
              <button className="btn ghost" onClick={testEsewa} disabled={etesting}>{etesting ? "Testing…" : "🔌 Test Connection"}</button>
            </div>
          </div>
          <div className="card" style={{ background: "rgba(212,175,55,.05)" }}>
            <h4 className="gold mb" style={{ fontSize: 14 }}>Active Endpoints</h4>
            <p style={{ fontSize: 11.5, lineHeight: 1.8, wordBreak: "break-all" }}>
              <b>Pay form:</b> {(p.esewaMode || "test") === "live" ? "epay.esewa.com.np/api/epay/main/v2/form" : "rc-epay.esewa.com.np/api/epay/main/v2/form"}<br />
              <b>Status API:</b> {(p.esewaMode || "test") === "live" ? "esewa.com.np/api/epay/transaction/status/" : "rc.esewa.com.np/api/epay/transaction/status/"}
            </p>
            {etest && (etest.error
              ? <p className="red" style={{ fontSize: 12 }}>⚠ {etest.error}</p>
              : <div style={{ fontSize: 12, lineHeight: 1.9 }}>
                  <div>Connectivity: {etest.reachable ? <span className="green">● Reachable</span> : <span className="red">● Not reachable</span>}</div>
                  <div>Product code: <b>{etest.productCode}</b></div>
                  <div>Secret: <b>{etest.secretMasked}</b></div>
                  <div>Sample signature:<br /><span className="muted" style={{ wordBreak: "break-all" }}>{etest.sampleSignature}</span></div>
                  <div className="mt">Payments: <b>{etest.payments}</b> · Revenue: <b>रू {Number(etest.revenue || 0).toLocaleString("en-IN")}</b></div>
                </div>)}
          </div>
        </div>
        <p className="muted mt" style={{ fontSize: 12 }}>
          {(p.esewaMode || "test") === "live"
            ? "⚠ LIVE mode — real payments are charged and settled to the bank account linked to your eSewa merchant account."
            : "🧪 TEST mode — at eSewa's page use the test eSewa ID and token 123456. No real money moves."}
        </p>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <div className="flex spread mb" style={{ flexWrap: "wrap", gap: 8 }}>
          <h4 className="gold" style={{ margin: 0 }}>💳 Razorpay — Card / UPI / Netbanking</h4>
          <span className={"pill " + (p.razorpayEnabled ? "p-ready" : "p-cancelled")}>{p.razorpayEnabled ? "Enabled" : "Disabled"}</span>
        </div>
        <p className="muted" style={{ marginTop: -4 }}>Accept cards, UPI & netbanking via Razorpay. Get your Key ID and Key Secret from the Razorpay Dashboard → Settings → API Keys. The secret is stored on the server and never sent to customers.</p>
        <div className="row mt">
          <div><label>Show at checkout</label>
            <select value={p.razorpayEnabled ? "yes" : "no"} onChange={e => setP({ ...p, razorpayEnabled: e.target.value === "yes" })}>
              <option value="no">No — hidden</option>
              <option value="yes">Yes — enabled</option>
            </select>
          </div>
          <div><label>Currency</label>
            <input value={p.razorpayCurrency || "INR"} onChange={e => setP({ ...p, razorpayCurrency: (e.target.value || "").toUpperCase() })} placeholder="INR" />
          </div>
        </div>
        <label>Razorpay Key ID</label>
        <input value={p.razorpayKeyId || ""} onChange={e => setP({ ...p, razorpayKeyId: e.target.value })} placeholder="rzp_test_xxxxx or rzp_live_xxxxx" />
        <label>Razorpay Key Secret</label>
        <input type="password" value={p.razorpayKeySecret || ""} onChange={e => setP({ ...p, razorpayKeySecret: e.target.value })} placeholder="Your Razorpay key secret" />
        <p className="muted mt" style={{ fontSize: 12 }}>
          {String(p.razorpayKeyId || "").startsWith("rzp_live") ? "⚠ LIVE keys — real money will be charged." : "🧪 Use rzp_test_ keys to test safely; rzp_live_ keys charge real money."}
        </p>
        <button className="btn mt" onClick={save}>{saved ? "✓ Saved!" : "Save Razorpay"}</button>
      </div>

      <GoogleAuthCard />
      <SmtpCard />
    </div>
  );
}

/* Email (SMTP) — powers "email me a login code" and notifications */
function SmtpCard() {
  const [s, setS] = useState(null);
  const [pass, setPass] = useState("");
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");
  useEffect(() => { api("/smtp").then(setS).catch(() => setS({})); }, []);
  if (!s) return null;
  const ready = s.host && s.user && s.hasPass;
  const save = async () => {
    setErr("");
    try { await api("/smtp", { method: "PUT", body: { host: s.host, port: s.port, user: s.user, from: s.from, pass } }); setSaved(true); setPass(""); setTimeout(() => setSaved(false), 2500); }
    catch (e) { setErr(e.message); }
  };
  return (
    <div className="card" style={{ marginTop: 18 }}>
      <div className="flex spread mb" style={{ flexWrap: "wrap", gap: 8 }}>
        <h4 className="gold" style={{ margin: 0 }}>📧 Email — login codes &amp; notifications</h4>
        <span className={"pill " + (ready ? "p-ready" : "p-cancelled")}>{ready ? "Configured" : "Not set"}</span>
      </div>
      <p className="muted" style={{ marginTop: -4 }}>Enables “Email me a login code” for customers. For Gmail: host <b>smtp.gmail.com</b>, port <b>587</b>, your Gmail as the username, and a Google <b>App Password</b> (Google account → Security → App passwords — not your normal password). Run <b>npm install nodemailer</b> on the server once.</p>
      <div className="row">
        <div><label>SMTP host</label><input value={s.host || ""} onChange={e => setS({ ...s, host: e.target.value })} placeholder="smtp.gmail.com" /></div>
        <div><label>Port</label><input type="number" value={s.port || 587} onChange={e => setS({ ...s, port: e.target.value })} /></div>
      </div>
      <label>Username (email)</label>
      <input value={s.user || ""} onChange={e => setS({ ...s, user: e.target.value })} placeholder="you@gmail.com" />
      <label>App password {s.hasPass ? "(leave blank to keep the saved one)" : ""}</label>
      <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder={s.hasPass ? "•••••• saved" : "16-char app password"} />
      <label>From (optional)</label>
      <input value={s.from || ""} onChange={e => setS({ ...s, from: e.target.value })} placeholder="Hotel Jai Laxmi <you@gmail.com>" />
      {err && <p className="red mt">⚠ {err}</p>}
      <button className="btn mt" onClick={save}>{saved ? "✓ Saved!" : "Save Email Settings"}</button>
    </div>
  );
}

/* Google Sign-In configuration (customers log in with their Google account) */
function GoogleAuthCard() {
  const [g, setG] = useState(null);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");
  useEffect(() => { api("/public/google").then(setG).catch(() => setG({ clientId: "" })); }, []);
  if (!g) return null;
  const save = async () => {
    setErr("");
    try { await api("/google", { method: "PUT", body: { clientId: g.clientId } }); setSaved(true); setTimeout(() => setSaved(false), 2500); }
    catch (e) { setErr(e.message); }
  };
  return (
    <div className="card" style={{ marginTop: 18 }}>
      <div className="flex spread mb" style={{ flexWrap: "wrap", gap: 8 }}>
        <h4 className="gold" style={{ margin: 0 }}>🔐 Google Login (Sign in with Google)</h4>
        <span className={"pill " + (g.clientId ? "p-ready" : "p-cancelled")}>{g.clientId ? "Configured" : "Not set"}</span>
      </div>
      <p className="muted" style={{ marginTop: -4 }}>
        Lets customers sign in with one tap using their Google account. In your Google Cloud project
        open <b>APIs &amp; Services → Credentials → Create credentials → OAuth client ID → Web application</b>,
        add your site (e.g. https://hoteljailaxmi.com and http://localhost:3000) to <b>Authorized JavaScript origins</b>,
        then paste the Client ID here. It looks like <i>467733758072-xxxxxxxx.apps.googleusercontent.com</i>.
      </p>
      <label>OAuth Client ID</label>
      <input value={g.clientId || ""} onChange={e => setG({ ...g, clientId: e.target.value })} placeholder="467733758072-xxxxxxxx.apps.googleusercontent.com" />
      {err && <p className="red mt">⚠ {err}</p>}
      <button className="btn mt" onClick={save}>{saved ? "✓ Saved & live!" : "Save Google Login"}</button>
    </div>
  );
}

/* ============ BACKUP & RESTORE (zero-data-loss deploys) ============ */
function BackupTab() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const fileRef = useRef(null);
  const download = async () => {
    setErr(""); setMsg(""); setBusy(true);
    try {
      const data = await api("/admin/backup");
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
      a.download = "hoteljailaxmi-backup-" + new Date().toISOString().slice(0, 10) + ".json"; a.click();
      setMsg("✓ Backup downloaded. Keep it somewhere safe.");
    } catch (e) { setErr(e.message); }
    setBusy(false);
  };
  const restore = e => {
    setErr(""); setMsg("");
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = async () => {
      let parsed;
      try { parsed = JSON.parse(r.result); } catch (x) { setErr("That file is not valid JSON."); return; }
      if (!confirm("Restore this backup? It REPLACES the current data with the backup's data.\nA safety snapshot of the current data is taken first.")) { if (fileRef.current) fileRef.current.value = ""; return; }
      setBusy(true);
      try { const res = await api("/admin/restore", { method: "POST", body: { data: parsed } }); setMsg("✓ Restored — " + res.users + " accounts, " + res.bookings + " bookings, " + res.orders + " orders. You may need to log in again."); }
      catch (x) { setErr(x.message); }
      setBusy(false); if (fileRef.current) fileRef.current.value = "";
    };
    r.readAsText(f);
  };
  return (
    <div>
      <PageHead t="💾 Backup & Restore" s="Download a full copy of all your data, or restore from a backup — the server also auto-backs-up on every restart." />
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 18, alignItems: "start" }}>
        <div className="card">
          <h4 className="gold mb">⬇ Download full backup</h4>
          <p className="muted">One file with everything — hotel info, rooms &amp; images, bookings, customers, staff, payments, invoices, menu, orders, POS, reviews, settings, audit logs. Do this before every deploy.</p>
          <button className="btn mt" onClick={download} disabled={busy}>{busy ? "Working…" : "⬇ Download Backup (.json)"}</button>
          {msg && <p className="green mt">{msg}</p>}
        </div>
        <div className="card">
          <h4 className="gold mb">♻ Restore from backup</h4>
          <p className="muted">Upload a backup file to replace the current data (a safety snapshot is taken first). Use this only to recover after data loss.</p>
          <input ref={fileRef} type="file" accept="application/json,.json" onChange={restore} className="mt" />
          {err && <p className="red mt">⚠ {err}</p>}
        </div>
      </div>
      <div className="card mt">
        <h4 className="gold mb">How safe updates work</h4>
        <p className="muted" style={{ lineHeight: 1.9 }}>
          Your entire database (all records <b>and images</b>) is the file <b>db.json</b>. It is <b>git-ignored</b>, so pulling code from GitHub never changes it.
          On every server start the app copies it into a <b>backups/</b> folder (keeps the last 40). New code only <b>adds</b> new fields/tables to your existing data — it never deletes records or changes your booking / invoice / payment / room IDs.
          Safe update: Download a backup here → deploy the code only (never overwrite db.json) → restart. Full steps are in <b>DEPLOY-UPDATE.md</b>.
        </p>
      </div>
    </div>
  );
}

/* ============ GOOGLE CLOUD CONSOLE (launch + configure) ============
   Honest hub: deep-links straight into your real Google Cloud Console for each
   service (no fake dashboards), plus editable storage for the config THIS app
   actually uses — Project ID/Number, Maps API key, OAuth Client ID. */
const GCP_SECTIONS = [
  ["dashboard", "📊", "Dashboard", "", "Your Google Cloud setup at a glance — keys, status and quick links."],
  ["projects", "📁", "Projects", "cloud-resource-manager", "Create, view and manage Google Cloud projects."],
  ["billing", "💰", "Billing", "billing", "Billing accounts, budgets, invoices and cost reports."],
  ["iam", "🔑", "IAM & Admin", "iam-admin/iam", "Users, roles, permissions and service accounts."],
  ["apis", "🧩", "APIs & Services", "apis/dashboard", "Enable & monitor Google APIs (Maps, BigQuery…)."],
  ["oauth", "🪪", "OAuth Consent", "apis/credentials/consent", "App name, logo, scopes and authorized domains."],
  ["credentials", "🗝️", "Credentials", "apis/credentials", "API keys, OAuth client IDs and service accounts."],
  ["secrets", "🔒", "Secret Manager", "security/secret-manager", "Store API keys, passwords and secrets securely."],
  ["compute", "🖥️", "Compute Engine", "compute/instances", "Virtual machines, disks, snapshots, SSH."],
  ["gke", "☸️", "Kubernetes (GKE)", "kubernetes/list", "Clusters, nodes and containerized workloads."],
  ["run", "🏃", "Cloud Run", "run", "Serverless containers and services."],
  ["functions", "⚡", "Cloud Functions", "functions/list", "Event-driven serverless functions."],
  ["bigquery", "📈", "BigQuery", "bigquery", "Data warehouse, datasets and SQL analytics."],
  ["sql", "🗄️", "Cloud SQL", "sql/instances", "Managed MySQL / PostgreSQL / SQL Server."],
  ["firestore", "🔥", "Firestore", "firestore", "NoSQL document database."],
  ["storage", "📦", "Cloud Storage", "storage/browser", "Buckets for photos, IDs, invoices and media."],
  ["networking", "🌐", "Networking", "networking", "VPC, firewall, load balancers, Cloud NAT."],
  ["dns", "🧭", "Cloud DNS", "net-services/dns/zones", "Manage DNS zones and records."],
  ["pubsub", "📨", "Pub/Sub", "cloudpubsub", "Messaging between services."],
  ["scheduler", "⏰", "Cloud Scheduler", "cloudscheduler", "Cron jobs and scheduled tasks."],
  ["logging", "📜", "Logging", "logs", "Application, API, auth and audit logs."],
  ["monitoring", "💓", "Monitoring", "monitoring", "CPU, memory, uptime, alerts and dashboards."],
  ["security", "🛡️", "Security Center", "security/command-center", "Threats, vulnerabilities and security score."],
  ["build", "🏗️", "Cloud Build", "cloud-build", "CI/CD build pipelines."],
  ["artifacts", "📚", "Artifact Registry", "artifacts", "Container images and packages."],
  ["vertex", "🤖", "Vertex AI", "vertex-ai", "AI / ML models and pipelines."],
  ["marketplace", "🛒", "Marketplace", "marketplace", "Install Google Cloud apps and tools."],
  ["audit", "🕵️", "Audit Logs", "logs/query", "Track every administrative action."],
  ["settings", "⚙️", "Settings", "", "Configure the Project ID, Maps key and OAuth used by this app."]
];
function GoogleCloudTab() {
  const [g, setG] = useState(null);
  const [sel, setSel] = useState("dashboard");
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");
  useEffect(() => { api("/public/google").then(setG).catch(() => setG({})); }, []);
  if (!g) return <div className="empty">Loading…</div>;
  const proj = g.projectId || "";
  const link = path => "https://console.cloud.google.com/" + path + (proj ? "?project=" + encodeURIComponent(proj) : "");
  const open = path => window.open(link(path), "_blank", "noopener");
  const save = async () => {
    setErr("");
    try { await api("/google", { method: "PUT", body: { clientId: g.clientId || "", projectId: g.projectId || "", projectNumber: g.projectNumber || "", mapsApiKey: g.mapsApiKey || "" } }); setSaved(true); setTimeout(() => setSaved(false), 2500); }
    catch (e) { setErr(e.message); }
  };
  const cur = GCP_SECTIONS.find(s => s[0] === sel) || GCP_SECTIONS[0];
  const configForm = (
    <div>
      <div className="row">
        <div><label>Project ID</label><input value={g.projectId || ""} onChange={e => setG({ ...g, projectId: e.target.value })} placeholder="project-61b2ad00-343f-4a5e-b63" /></div>
        <div><label>Project Number</label><input value={g.projectNumber || ""} onChange={e => setG({ ...g, projectNumber: e.target.value })} placeholder="467733758072" /></div>
      </div>
      <label>OAuth Client ID (Sign in with Google)</label>
      <input value={g.clientId || ""} onChange={e => setG({ ...g, clientId: e.target.value })} placeholder="…apps.googleusercontent.com" />
      <label>Google Maps API key (for guest directions & map)</label>
      <input value={g.mapsApiKey || ""} onChange={e => setG({ ...g, mapsApiKey: e.target.value })} placeholder="AIza…" />
      <p className="muted mt" style={{ fontSize: 12 }}>The Maps key is a browser key — restrict it by HTTP referrer (your domain) in the console. The OAuth secret is never stored here.</p>
      {err && <p className="red mt">⚠ {err}</p>}
      <button className="btn mt" onClick={save}>{saved ? "✓ Saved!" : "Save Google Cloud config"}</button>
    </div>
  );
  return (
    <div>
      <PageHead t="Google Cloud Console" s="Launch every Google Cloud service for your project, and manage the keys this app uses — no fake data, real console links." />
      <div className="grid" style={{ gridTemplateColumns: "230px 1fr", gap: 16, alignItems: "start" }}>
        <div className="card" style={{ padding: 8, maxHeight: "70vh", overflowY: "auto" }}>
          {GCP_SECTIONS.map(s => (
            <button key={s[0]} className={"btn sm " + (sel === s[0] ? "" : "ghost")} style={{ width: "100%", justifyContent: "flex-start", marginBottom: 4, textAlign: "left" }} onClick={() => setSel(s[0])}>{s[1]} {s[2]}</button>
          ))}
        </div>
        <div className="card">
          <div className="flex spread mb" style={{ flexWrap: "wrap", gap: 8 }}>
            <h3 className="gold" style={{ margin: 0 }}>{cur[1]} {cur[2]}</h3>
            {cur[3] ? <button className="btn sm" onClick={() => open(cur[3])}>Open in Google Cloud Console ↗</button> : null}
          </div>
          <p className="muted">{cur[4]}</p>

          {sel === "dashboard" && <div>
            <div className="grid c4 mt">
              <div className="card" style={{ padding: 14 }}><div className="muted" style={{ fontSize: 12 }}>Project ID</div><b>{g.projectId || "— not set —"}</b></div>
              <div className="card" style={{ padding: 14 }}><div className="muted" style={{ fontSize: 12 }}>Project Number</div><b>{g.projectNumber || "—"}</b></div>
              <div className="card" style={{ padding: 14 }}><div className="muted" style={{ fontSize: 12 }}>Google Sign-In</div><b className={g.clientId ? "green" : "red"}>{g.clientId ? "Configured ✓" : "Not set"}</b></div>
              <div className="card" style={{ padding: 14 }}><div className="muted" style={{ fontSize: 12 }}>Maps API key</div><b className={g.mapsApiKey ? "green" : "red"}>{g.mapsApiKey ? "Configured ✓" : "Not set"}</b></div>
            </div>
            <h4 className="gold mb mt">Quick launch</h4>
            <div className="grid c4">
              {GCP_SECTIONS.filter(s => s[3]).map(s => (
                <button key={s[0]} className="card" style={{ cursor: "pointer", textAlign: "center", padding: 14 }} onClick={() => open(s[3])}>
                  <div style={{ fontSize: 26 }}>{s[1]}</div><div style={{ fontSize: 12.5 }}>{s[2]}</div>
                </button>
              ))}
            </div>
            <p className="muted mt" style={{ fontSize: 12 }}>Live infrastructure (VMs, billing amounts, logs) opens directly in your real Google Cloud Console — this panel never shows made-up numbers.</p>
          </div>}

          {sel === "settings" && <div className="mt">{configForm}</div>}

          {sel !== "dashboard" && sel !== "settings" && <div className="mt">
            <button className="btn" onClick={() => open(cur[3])}>Open {cur[2]} in Google Cloud Console ↗</button>
            {(sel === "credentials" || sel === "apis" || sel === "oauth") ? <div className="mt">{configForm}</div> : null}
          </div>}
        </div>
      </div>
    </div>
  );
}

/* ---------- AI report analysis ---------- */
function AiReportTab() {
  const [rep, setRep] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const load = async () => {
    setBusy(true); setErr("");
    try { setRep(await api("/ai-report")); }
    catch (e) { setErr(e.message); }
    setBusy(false);
  };
  useEffect(() => { load(); }, []);
  const kindColor = k => k === "good" ? "var(--green)" : k === "warn" ? "var(--red)" : "var(--gold)";
  return (
    <div>
      <PageHead t="🤖 AI Report Analysis" s="AI आधारित रिपोर्ट विश्लेषण — generated live from your real data"
        right={<button className="btn" disabled={busy} onClick={load}>{busy ? "Analysing…" : "↻ Regenerate"}</button>} />
      {err && (
        <div className="card mb" style={{ borderColor: "var(--red)" }}>
          <p className="red">⚠ {err}</p>
          <p className="muted mt">If this says "Request failed (404)", the server is running old code — close the black server window and double-click <b>START-HOTEL.bat</b> again, then press Ctrl+Shift+R here.</p>
        </div>
      )}
      {!rep ? (!err && <div className="empty">🤖 Analysing your hotel data…</div>) : (
        <div>
          <div className="glow mb"><div className="glow-in">
            <div className="flex" style={{ alignItems: "flex-start" }}>
              <div className="icon3d" style={{ width: 54, height: 54, fontSize: 26, flex: "none" }}>🤖</div>
              <p style={{ fontSize: 16, lineHeight: 1.7, flex: 1 }}>{rep.summary}</p>
            </div>
            <p className="muted mt" style={{ fontSize: 12 }}>Generated {new Date(rep.generatedAt).toLocaleString()}</p>
          </div></div>
          <div className="grid c3">
            {rep.insights.map((ins, i) => (
              <div className="card" key={i} style={{ borderLeft: "3px solid " + kindColor(ins.kind) }}>
                <div className="flex"><span style={{ fontSize: 24 }}>{ins.icon}</span><b className="gold">{ins.title}</b></div>
                <p className="muted mt" style={{ fontSize: 14, lineHeight: 1.65 }}>{ins.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- reservations (admin + reception) ---------- */
function ReservationsTable() {
  const [list] = useLive(() => api("/reservations"), ["reservations", "reservation"]);
  if (!list) return <div className="empty">Loading…</div>;
  const setSt = (r, status) => api("/reservations/" + r.id, { method: "PATCH", body: { status } });
  return (
    <div>
      <PageHead t="Table Reservations" s="Online reservations appear here instantly with a sound" />
      <div className="tbl-wrap">
        <table>
          <thead><tr><th>Guest</th><th>Phone</th><th>Date</th><th>Time</th><th>Guests</th><th>Note</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {list.map(r => (
              <tr key={r.id}>
                <td><b>{r.name}</b></td><td>{r.phone}</td>
                <td>{r.date}</td><td>{r.time}</td><td>{r.guests}</td>
                <td className="muted">{r.note}</td>
                <td><span className={"pill p-" + (r.status === "pending" ? "pending" : r.status === "confirmed" ? "making" : r.status === "cancelled" ? "cancelled" : "ready")}>{r.status}</span></td>
                <td className="flex">
                  {r.status === "pending" && <button className="btn sm green" onClick={() => setSt(r, "confirmed")}>✓ Confirm</button>}
                  {r.status === "confirmed" && <button className="btn sm blue" onClick={() => setSt(r, "seated")}>🪑 Seated</button>}
                  {r.status === "seated" && <button className="btn sm" onClick={() => setSt(r, "completed")}>Done</button>}
                  {!["cancelled", "completed"].includes(r.status) && <button className="btn sm danger" onClick={() => setSt(r, "cancelled")}>✕</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <div className="empty">No reservations yet — they arrive here in real time.</div>}
      </div>
    </div>
  );
}

/* ---------- QR Menu ---------- */
function QrMenuModal({ onClose }) {
  const url = location.origin + "/#/restaurant";
  const boxRef = useRef(null);
  const print = () => {
    const img = boxRef.current && boxRef.current.querySelector("img, canvas");
    const src = img ? (img.tagName === "IMG" ? img.src : img.toDataURL()) : "";
    printHTML(`${HOTEL_HEAD()}<h4>📲 SCAN FOR MENU</h4>
      <div style="text-align:center;margin:12px 0"><img src="${src}" style="width:220px;height:220px"/></div>
      <div class="c">Scan with your phone camera</div>
      <div class="c">to see the menu & order</div><hr/>
      <div class="c">${url}</div>`);
  };
  return (
    <Modal title="📲 QR Menu — for tables" onClose={onClose}>
      <p className="muted">Print this and place it on every table. Guests scan it with their phone camera to open the live menu and order.</p>
      <div className="qr-box" ref={boxRef}><PayQR payload={url} size={220} /><p>{url}</p></div>
      <p className="muted" style={{ fontSize: 12.5 }}>Tip: phones must be on the same Wi-Fi as this computer (or use your public address if hosted online).</p>
      <div className="modal-actions">
        <button className="btn ghost" onClick={onClose}>Close</button>
        <button className="btn" onClick={print}>🖨 Print QR</button>
      </div>
    </Modal>
  );
}

/* ---------- branding: logo & favicon ---------- */
function BrandingTab() {
  const b = useBranding();
  const [logo, setLogo] = useState(b.logo || "");
  const [favicon, setFavicon] = useState(b.favicon || "");
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");
  const save = async () => {
    setErr("");
    try {
      await api("/branding", { method: "PUT", body: { logo, favicon } });
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } catch (e) { setErr(e.message); }
  };
  return (
    <div>
      <PageHead t="🎨 Logo & Branding" s="Change the website logo and browser favicon — updates everywhere instantly" />
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 18, alignItems: "start" }}>
        <div className="card">
          <h4 className="gold mb">Website Logo</h4>
          <PhotoInput camera value={logo} onChange={setLogo} label="Logo photo (shown in navbar, hero, login)" />
          <h4 className="gold mb" style={{ marginTop: 22 }}>Favicon (browser tab icon)</h4>
          <PhotoInput value={favicon} onChange={setFavicon} label="Small square image (or leave empty to use the logo)" />
          {err && <p className="red mt">⚠ {err}</p>}
          <button className="btn mt" onClick={save}>{saved ? "✓ Saved & applied!" : "Save Branding"}</button>
          <button className="btn ghost mt" style={{ marginLeft: 8 }} onClick={() => { setLogo(""); setFavicon(""); }}>Reset to default</button>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <h4 className="gold mb">Live Preview</h4>
          <img src={logo || "/img/logo-small.jpg"} style={{ width: 130, borderRadius: 20, border: "2px solid var(--gold-dim)" }} />
          <p className="muted mt">Navbar / hero logo</p>
          <img src={favicon || logo || "/img/logo-small.jpg"} style={{ width: 32, height: 32, borderRadius: 6, marginTop: 14, objectFit: "cover" }} />
          <p className="muted">Browser tab icon</p>
        </div>
      </div>
    </div>
  );
}

/* ---------- factory reset ---------- */
function ResetTab() {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);
  const doReset = async () => {
    if (!confirm("⚠ This will DELETE ALL DATA — rooms, bookings, orders, menu, employees, inventory, everything. Continue?")) return;
    setBusy(true); setErr("");
    try {
      await api("/admin/factory-reset", { method: "POST", body: { password: pw } });
      setOk(true); setPw("");
    } catch (e) { setErr(e.message); }
    setBusy(false);
  };
  return (
    <div>
      <PageHead t="Factory Reset" s="Danger zone — erases the entire database" />
      <div className="card" style={{ maxWidth: 520, borderColor: "var(--red)" }}>
        <p className="red" style={{ fontWeight: 600 }}>⚠ This permanently deletes ALL floors, rooms, bookings, menu items, orders, inventory, employees, credits, transactions and bank details. Only the admin account survives.</p>
        <label>Enter admin password to confirm</label>
        <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Admin password" />
        {err && <p className="red mt">⚠ {err}</p>}
        {ok && <p className="green mt">✓ Factory reset complete. Everything is fresh.</p>}
        <button className="btn danger mt" disabled={busy || !pw} onClick={doReset}>
          {busy ? "Erasing…" : "🗑 Delete All Data"}
        </button>
      </div>
    </div>
  );
}

/* ============ WEBSITE CONTENT MANAGERS (Home & Restaurant pages) ============ */

/* pick an existing gallery photo */
function GalleryPick({ onPick, onClose }) {
  const [gal] = useLive(() => api("/public/gallery"), ["gallery"]);
  return (
    <Modal title="Pick a photo from your Gallery" onClose={onClose} wide>
      {!gal ? <div className="empty">Loading…</div>
        : gal.length === 0 ? <div className="empty">No gallery photos yet — add some in the Gallery tab first.</div>
          : <div className="grid c4">
            {gal.map(g => (
              <img key={g.id} src={g.photo} title={g.caption}
                style={{ width: "100%", height: 110, objectFit: "cover", borderRadius: 10, cursor: "pointer", border: "2px solid var(--gold-dim)" }}
                onClick={() => { onPick(g.photo); onClose(); }} />
            ))}
          </div>}
    </Modal>
  );
}

/* photo field: upload from device/camera OR choose from the gallery */
function ContentPhoto({ value, onChange, label }) {
  const [pick, setPick] = useState(false);
  return (
    <div>
      <PhotoInput camera value={value} onChange={onChange} label={label} />
      <button type="button" className="btn sm ghost mt" onClick={() => setPick(true)}>🖼 Pick from Gallery</button>
      {pick && <GalleryPick onPick={onChange} onClose={() => setPick(false)} />}
    </div>
  );
}

/* generic add/edit/delete list manager for any content section */
function ContentList({ section, title, heading, sub, cardTitle, fields }) {
  const [content] = useLive(() => api("/content"), ["content"]);
  const [modal, setModal] = useState(null);
  if (!content) return <div className="empty">Loading…</div>;
  const items = content[section] || [];
  return (
    <div>
      <PageHead t={heading || title} s={sub}
        right={<button className="btn" onClick={() => setModal({})}>+ Add {title}</button>} />
      {items.length === 0 && <div className="empty">Nothing here yet — click “+ Add {title}”.</div>}
      <div className="grid c4">
        {items.map(it => (
          <div className="card" key={it.id} style={{ padding: 10 }}>
            {it.photo ? <img src={it.photo} style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 10 }} />
              : <div style={{ height: 120, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(212,175,55,.08)", fontSize: 34 }}>{it.icon || "🏨"}</div>}
            <b style={{ display: "block", marginTop: 8 }}>{it[cardTitle] || "—"}</b>
            {it.role && <span className="pill p-pending" style={{ fontSize: 11 }}>{it.role}</span>}
            {it.desc && <p className="muted" style={{ fontSize: 12, margin: "4px 0 0" }}>{it.desc}</p>}
            <div className="flex mt" style={{ gap: 6 }}>
              <button className="btn sm ghost" onClick={() => setModal({ item: it })}>Edit</button>
              <button className="btn sm danger" onClick={async () => { if (confirm("Delete this item?")) await api("/content/" + section + "/" + it.id, { method: "DELETE" }); }}>✕</button>
            </div>
          </div>
        ))}
      </div>
      {modal && <ContentModal section={section} title={title} fields={fields} init={modal} onClose={() => setModal(null)} />}
    </div>
  );
}

function ContentModal({ section, title, fields, init, onClose }) {
  const it = init.item || {};
  const [f, setF] = useState(() => { const s = {}; fields.forEach(fl => s[fl.key] = it[fl.key] || ""); return s; });
  const [err, setErr] = useState("");
  const save = async () => {
    setErr("");
    const missing = fields.find(fl => (fl.label || "").includes("*") && !String(f[fl.key] || "").trim());
    if (missing) { setErr(missing.label.replace(/\*/g, "").trim() + " is required."); return; }
    try {
      if (init.item) await api("/content/" + section + "/" + init.item.id, { method: "PUT", body: f });
      else await api("/content/" + section, { method: "POST", body: f });
      onClose();
    } catch (e) { setErr(e.message); }
  };
  return (
    <Modal title={(init.item ? "Edit " : "Add ") + title} onClose={onClose}>
      {fields.map(fl => (
        <div key={fl.key} className="mt">
          {fl.type === "photo"
            ? <ContentPhoto value={f[fl.key]} onChange={p => setF({ ...f, [fl.key]: p })} label={fl.label} />
            : fl.type === "textarea"
              ? <React.Fragment><label>{fl.label}</label><textarea value={f[fl.key]} onChange={e => setF({ ...f, [fl.key]: e.target.value })} placeholder={fl.ph || ""} /></React.Fragment>
              : <React.Fragment><label>{fl.label}</label><input value={f[fl.key]} onChange={e => setF({ ...f, [fl.key]: e.target.value })} placeholder={fl.ph || ""} /></React.Fragment>}
        </div>
      ))}
      {err && <p className="red mt">⚠ {err}</p>}
      <div className="modal-actions">
        <button className="btn ghost" onClick={onClose}>Cancel</button>
        <button className="btn" onClick={save}>Save {title}</button>
      </div>
    </Modal>
  );
}

/* ---- HOME PAGE content ---- */
function HomeContentTab() {
  return (
    <div>
      <PageHead t="🏠 Home Page" s="Everything here updates the public homepage instantly" />
      <HomeHeroEditor />
      <div style={{ height: 22 }} />
      <ContentList section="benefits" title="Benefit" heading="✨ Benefits" cardTitle="name"
        sub="Short highlights, each with a photo (upload or pick from your Gallery)"
        fields={[{ key: "name", label: "Benefit name *", ph: "e.g. Free Breakfast" }, { key: "photo", label: "Photo (upload or pick from gallery)", type: "photo" }]} />
      <div style={{ height: 22 }} />
      <ContentList section="amenities" title="Premium Amenity" heading="💎 Premium Amenities" cardTitle="heading"
        sub="Photo + heading + description cards shown on the homepage"
        fields={[{ key: "heading", label: "Heading *", ph: "e.g. Rooftop Lounge" }, { key: "desc", label: "Description", type: "textarea", ph: "Short description" }, { key: "photo", label: "Photo", type: "photo" }]} />
    </div>
  );
}

function HomeHeroEditor() {
  const [content] = useLive(() => api("/content"), ["content"]);
  const [v, setV] = useState(null);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");
  useEffect(() => { if (content && v === null) setV({ heroVideo: content.home.heroVideo || "", heroPoster: content.home.heroPoster || "" }); }, [content]);
  if (!content || !v) return <div className="empty">Loading…</div>;
  const save = async () => {
    setErr("");
    try { await api("/content", { method: "PUT", body: { home: v } }); setSaved(true); setTimeout(() => setSaved(false), 2500); }
    catch (e) { setErr(e.message); }
  };
  return (
    <div className="card">
      <h4 className="gold mb">🎬 Hero Background Video</h4>
      <label>Video URL — paste a direct MP4 link or hosted video URL (leave empty to use the photo)</label>
      <input value={v.heroVideo} onChange={e => setV({ ...v, heroVideo: e.target.value })} placeholder="https://…/hotel.mp4" />
      <div className="mt"><ContentPhoto value={v.heroPoster} onChange={p => setV({ ...v, heroPoster: p })} label="Poster image (shown before the video loads, or if no video)" /></div>
      {err && <p className="red mt">⚠ {err}</p>}
      <div className="flex mt">
        <button className="btn" onClick={save}>{saved ? "✓ Saved & live!" : "Save Hero"}</button>
        {v.heroVideo && <button className="btn ghost" onClick={() => setV({ ...v, heroVideo: "" })}>Remove video</button>}
      </div>
    </div>
  );
}

/* ---- RESTAURANT PAGE content ---- */
function RestaurantContentTab() {
  return (
    <div>
      <PageHead t="🎬 Restaurant Page" s="Manage the restaurant hero, facilities, chef and events — live on the public site" />
      <RestaurantHeroEditor />
      <div style={{ height: 22 }} />
      <ContentList section="facilities" title="Facility" heading="🍽 Dining Facilities" cardTitle="name"
        sub="Dining facilities shown as icon chips (e.g. AC Dining, Parking)"
        fields={[{ key: "name", label: "Facility name *", ph: "e.g. AC Dining" }, { key: "icon", label: "Emoji / icon", ph: "❄" }]} />
      <div style={{ height: 22 }} />
      <ContentList section="chefs" title="Chef" heading="👨‍🍳 Meet Our Kitchen Chef" cardTitle="name"
        sub="Chef photo, name, role and a short note"
        fields={[{ key: "name", label: "Chef name *", ph: "e.g. Ram Chef" }, { key: "role", label: "Role", ph: "Head Chef" }, { key: "desc", label: "About", type: "textarea" }, { key: "photo", label: "Photo", type: "photo" }]} />
      <div style={{ height: 22 }} />
      <ContentList section="celebrate" title="Celebration" heading="🎉 Celebrate With Us" cardTitle="name"
        sub="Event cards — photo, name and description"
        fields={[{ key: "name", label: "Event name *", ph: "e.g. Birthday Party" }, { key: "desc", label: "Description", type: "textarea", ph: "Cake, decoration & music" }, { key: "photo", label: "Photo", type: "photo" }]} />
    </div>
  );
}

function RestaurantHeroEditor() {
  const [content] = useLive(() => api("/content"), ["content"]);
  const [v, setV] = useState(null);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");
  useEffect(() => { if (content && v === null) setV({ heroPhoto: content.restaurant.heroPhoto || "", heroVideo: content.restaurant.heroVideo || "", heroTitle: content.restaurant.heroTitle || "", heroSubtitle: content.restaurant.heroSubtitle || "" }); }, [content]);
  if (!content || !v) return <div className="empty">Loading…</div>;
  const save = async () => {
    setErr("");
    try { await api("/content", { method: "PUT", body: { restaurant: v } }); setSaved(true); setTimeout(() => setSaved(false), 2500); }
    catch (e) { setErr(e.message); }
  };
  return (
    <div className="card">
      <h4 className="gold mb">🎬 Restaurant Hero / Background</h4>
      <div className="row">
        <div><label>Hero title</label><input value={v.heroTitle} onChange={e => setV({ ...v, heroTitle: e.target.value })} placeholder="Experience Fine Dining…" /></div>
        <div><label>Hero subtitle</label><input value={v.heroSubtitle} onChange={e => setV({ ...v, heroSubtitle: e.target.value })} placeholder="Traditional hospitality…" /></div>
      </div>
      <label className="mt">Background video URL (optional MP4 link)</label>
      <input value={v.heroVideo} onChange={e => setV({ ...v, heroVideo: e.target.value })} placeholder="https://…/restaurant.mp4" />
      <div className="mt"><ContentPhoto value={v.heroPhoto} onChange={p => setV({ ...v, heroPhoto: p })} label="Hero background photo (upload or pick from gallery)" /></div>
      {err && <p className="red mt">⚠ {err}</p>}
      <button className="btn mt" onClick={save}>{saved ? "✓ Saved & live!" : "Save Hero"}</button>
    </div>
  );
}

/* ============ PAYMENT MANAGEMENT DASHBOARD ============ */
function PaymentsTab() {
  const [rows] = useLive(() => api("/payments"), ["payments", "booking", "order"]);
  const [q, setQ] = useState("");
  const [fStatus, setFStatus] = useState("all");
  const [fMethod, setFMethod] = useState("all");
  const [sort, setSort] = useState("new");
  const [view, setView] = useState(null);
  if (!rows) return <div className="empty">Loading…</div>;

  const today = new Date().toDateString();
  const sum = arr => arr.reduce((s, p) => s + (Number(p.totalAmount) || 0), 0);
  const ok = rows.filter(p => p.status === "success");
  const stats = {
    revenue: sum(ok),
    today: sum(ok.filter(p => new Date(p.paidAt || p.createdAt).toDateString() === today)),
    pending: rows.filter(p => p.status === "pending" || p.status === "processing").length,
    success: ok.length,
    failed: rows.filter(p => p.status === "failed").length,
    cancelled: rows.filter(p => p.status === "cancelled").length,
    total: rows.length
  };

  let list = rows.filter(p => {
    if (fStatus !== "all" && p.status !== fStatus) return false;
    if (fMethod !== "all" && p.method !== fMethod) return false;
    if (q) {
      const hay = [p.invoiceNumber, p.transactionUuid, p.customerName, p.phone, p.email, p.esewaRef].join(" ").toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });
  if (sort === "old") list = [...list].reverse();
  if (sort === "hi") list = [...list].sort((a, b) => b.totalAmount - a.totalAmount);
  if (sort === "lo") list = [...list].sort((a, b) => a.totalAmount - b.totalAmount);

  const badgeCls = { success: "p-ready", pending: "p-pending", processing: "p-pending", failed: "p-cancelled", cancelled: "p-cancelled", refunded: "p-pending" };
  const setStatus = (p, status) => api("/payments/" + p.id, { method: "PATCH", body: { status } });
  const del = p => { if (confirm("Delete payment " + p.invoiceNumber + "?\nThis is permanent and recorded in the audit log.")) api("/payments/" + p.id, { method: "DELETE" }); };
  const invoice = async (p, mode) => {
    try {
      const full = await api("/public/payment/" + p.id);
      const html = paymentInvoiceHTML(full);
      if (mode === "print") printHTML(html); else downloadHTML(html, "invoice-" + p.invoiceNumber + ".html");
    } catch (e) { alert(e.message); }
  };
  const exportCSV = () => {
    const head = ["Invoice", "TransactionID", "eSewaRef", "Customer", "Phone", "Email", "Method", "Type", "Amount", "Status", "Date"];
    const esc = x => `"${String(x == null ? "" : x).replace(/"/g, '""')}"`;
    const csv = [head.join(",")].concat(list.map(p => [p.invoiceNumber, p.transactionUuid, p.esewaRef, p.customerName, p.phone, p.email, p.method, p.kind, p.totalAmount, p.status, new Date(p.createdAt).toISOString()].map(esc).join(","))).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "payments-" + new Date().toISOString().slice(0, 10) + ".csv"; a.click();
  };

  const Card = ({ icon, label, value, cls }) => (
    <div className="card" style={{ padding: 16 }}>
      <div className="muted" style={{ fontSize: 12.5 }}>{icon} {label}</div>
      <div className={cls || "gold"} style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>{value}</div>
    </div>
  );

  return (
    <div>
      <PageHead t="💰 Payments" s="All eSewa & online transactions — verify, manage, print, export" right={<button className="btn ghost" onClick={exportCSV}>⬇ Export CSV</button>} />
      <div className="grid c4" style={{ marginBottom: 16 }}>
        <Card icon="💵" label="Total Revenue (paid)" value={NPR(stats.revenue)} />
        <Card icon="📅" label="Today's Revenue" value={NPR(stats.today)} />
        <Card icon="✅" label="Successful" value={stats.success} cls="green" />
        <Card icon="⏳" label="Pending" value={stats.pending} cls="gold" />
        <Card icon="❌" label="Failed" value={stats.failed} cls="red" />
        <Card icon="🚫" label="Cancelled" value={stats.cancelled} cls="red" />
        <Card icon="🧾" label="Total Transactions" value={stats.total} />
      </div>

      <PayCharts rows={rows} />

      <div className="card mb">
        <div className="flex" style={{ flexWrap: "wrap", gap: 10 }}>
          <input placeholder="🔍 Search invoice, txn, name, phone, eSewa ref…" value={q} onChange={e => setQ(e.target.value)} style={{ flex: "1 1 260px" }} />
          <select value={fStatus} onChange={e => setFStatus(e.target.value)} style={{ width: "auto" }}>
            <option value="all">All statuses</option><option value="success">Success</option><option value="pending">Pending</option>
            <option value="failed">Failed</option><option value="cancelled">Cancelled</option><option value="refunded">Refunded</option>
          </select>
          <select value={fMethod} onChange={e => setFMethod(e.target.value)} style={{ width: "auto" }}>
            <option value="all">All methods</option><option value="esewa">eSewa</option><option value="cash">Cash</option><option value="online">QR/Online</option>
          </select>
          <select value={sort} onChange={e => setSort(e.target.value)} style={{ width: "auto" }}>
            <option value="new">Latest first</option><option value="old">Oldest first</option>
            <option value="hi">Highest amount</option><option value="lo">Lowest amount</option>
          </select>
        </div>
      </div>

      <div className="tbl-wrap">
        <table>
          <thead><tr>
            <th>Invoice</th><th>Txn ID</th><th>Customer</th><th>Phone</th><th>Method</th><th>Type</th><th>Amount</th><th>Status</th><th>Date</th><th>Actions</th>
          </tr></thead>
          <tbody>
            {list.map(p => (
              <tr key={p.id}>
                <td><b>{p.invoiceNumber}</b></td>
                <td className="muted" style={{ fontSize: 11.5, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.transactionUuid}</td>
                <td><b>{p.customerName}</b></td>
                <td className="muted">{p.phone}</td>
                <td><span className="pill p-pending" style={{ fontSize: 11 }}>{p.method}</span></td>
                <td className="muted">{p.kind}</td>
                <td><b>{NPR(p.totalAmount)}</b></td>
                <td><span className={"pill " + (badgeCls[p.status] || "p-pending")}>{p.status}</span></td>
                <td className="muted" style={{ fontSize: 11.5 }}>{fmtDT(p.createdAt)}</td>
                <td className="flex" style={{ gap: 5, flexWrap: "wrap" }}>
                  <button className="btn sm ghost" onClick={() => setView(p)}>View</button>
                  {p.status !== "success" && <button className="btn sm green" onClick={() => setStatus(p, "success")}>Verify ✓</button>}
                  {(p.status === "pending" || p.status === "processing") && <button className="btn sm ghost" onClick={() => setStatus(p, "cancelled")}>Cancel</button>}
                  <button className="btn sm ghost" onClick={() => invoice(p, "print")}>🖨</button>
                  <button className="btn sm ghost" onClick={() => invoice(p, "dl")}>⬇</button>
                  <button className="btn sm danger" onClick={() => del(p)}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <div className="empty">No payments match your filters.</div>}
      </div>

      {view && <PaymentView p={view} onClose={() => setView(null)} onStatus={setStatus} onInvoice={invoice} />}
    </div>
  );
}

function PaymentView({ p, onClose, onStatus, onInvoice }) {
  const [notes, setNotes] = useState(p.notes || "");
  const [remarks, setRemarks] = useState(p.remarks || "");
  const [saved, setSaved] = useState(false);
  const saveNotes = async () => { await api("/payments/" + p.id, { method: "PATCH", body: { notes, remarks } }); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  return (
    <Modal title={"Payment " + p.invoiceNumber} onClose={onClose} wide>
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <h4 className="gold mb">Customer</h4>
          <p><b>{p.customerName}</b><br />{p.phone}{p.email ? " · " + p.email : ""}</p>
          <h4 className="gold mb" style={{ marginTop: 14 }}>Transaction</h4>
          <p style={{ fontSize: 13, lineHeight: 1.9 }}>
            Method: <b>{p.method}</b> · Type: <b>{p.kind}</b><br />
            Txn UUID: {p.transactionUuid}<br />
            {p.esewaRef ? <>eSewa Ref: {p.esewaRef}<br /></> : null}
            Product code: {p.productCode}<br />
            Status: <span className={"pill " + ({ success: "p-ready", failed: "p-cancelled", cancelled: "p-cancelled" }[p.status] || "p-pending")}>{p.status}</span><br />
            Created: {fmtDT(p.createdAt)}{p.paidAt ? " · Paid: " + fmtDT(p.paidAt) : ""}
          </p>
        </div>
        <div>
          <h4 className="gold mb">Amount</h4>
          <div className="total-plate"><span className="lab">Total Paid</span><span className="amt">{NPR(p.totalAmount)}</span></div>
          <h4 className="gold mb" style={{ marginTop: 14 }}>Gateway response</h4>
          <pre style={{ fontSize: 11, maxHeight: 120, overflow: "auto", background: "rgba(0,0,0,.15)", padding: 8, borderRadius: 8, whiteSpace: "pre-wrap" }}>{p.verifyResponse ? JSON.stringify(p.verifyResponse, null, 1) : "—"}</pre>
        </div>
      </div>
      <h4 className="gold mb" style={{ marginTop: 14 }}>Audit timeline</h4>
      <div style={{ fontSize: 12.5, lineHeight: 1.8 }}>
        {(p.audit || []).map((a, i) => <div key={i}>• {fmtDT(a.at)} — {a.action} <span className="muted">({a.by})</span></div>)}
      </div>
      <div className="row mt">
        <div><label>Internal notes</label><input value={notes} onChange={e => setNotes(e.target.value)} /></div>
        <div><label>Remarks</label><input value={remarks} onChange={e => setRemarks(e.target.value)} /></div>
      </div>
      <div className="modal-actions" style={{ flexWrap: "wrap" }}>
        <button className="btn ghost" onClick={() => onInvoice(p, "print")}>🖨 Print</button>
        <button className="btn ghost" onClick={() => onInvoice(p, "dl")}>⬇ Download</button>
        {p.status !== "success" && <button className="btn green" onClick={() => { onStatus(p, "success"); onClose(); }}>Mark Successful</button>}
        {p.status !== "failed" && <button className="btn ghost" onClick={() => { onStatus(p, "failed"); onClose(); }}>Mark Failed</button>}
        <button className="btn" onClick={saveNotes}>{saved ? "✓ Saved" : "Save Notes"}</button>
      </div>
    </Modal>
  );
}

/* revenue analytics (Chart.js) for the payments dashboard */
function PayCharts({ rows }) {
  const [range, setRange] = useState("day");
  const barRef = useRef(null), methodRef = useRef(null), typeRef = useRef(null);
  const store = useRef({});
  useEffect(() => {
    const Chart = window.Chart;
    if (!Chart || !barRef.current) return;
    const ok = rows.filter(p => p.status === "success");
    const amt = n => Number(n || 0);
    const now = new Date();
    let labels = [], data = [];
    if (range === "day") {
      for (let i = 13; i >= 0; i--) {
        const d = new Date(now); d.setDate(d.getDate() - i);
        labels.push(d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }));
        const key = d.toDateString();
        data.push(ok.filter(p => new Date(p.paidAt || p.createdAt).toDateString() === key).reduce((s, p) => s + amt(p.totalAmount), 0));
      }
    } else if (range === "week") {
      for (let i = 7; i >= 0; i--) {
        const end = new Date(now); end.setDate(end.getDate() - i * 7); end.setHours(23, 59, 59, 999);
        const start = new Date(end); start.setDate(start.getDate() - 6); start.setHours(0, 0, 0, 0);
        labels.push(start.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }));
        data.push(ok.filter(p => { const x = new Date(p.paidAt || p.createdAt); return x >= start && x <= end; }).reduce((s, p) => s + amt(p.totalAmount), 0));
      }
    } else {
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        labels.push(d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" }));
        data.push(ok.filter(p => { const x = new Date(p.paidAt || p.createdAt); return x.getMonth() === d.getMonth() && x.getFullYear() === d.getFullYear(); }).reduce((s, p) => s + amt(p.totalAmount), 0));
      }
    }
    const methods = {}, types = {};
    ok.forEach(p => { methods[p.method || "other"] = (methods[p.method || "other"] || 0) + amt(p.totalAmount); types[p.kind || "other"] = (types[p.kind || "other"] || 0) + amt(p.totalAmount); });
    const gold = "#d4af37", txt = "#cdb98a", grid = "rgba(212,175,55,.12)";
    const pal = ["#22c55e", "#d4af37", "#3b82f6", "#ef4444", "#a855f7", "#f59e0b"];
    Object.values(store.current).forEach(c => { try { c.destroy(); } catch (e) {} });
    store.current = {};
    Chart.defaults.color = txt;
    store.current.bar = new Chart(barRef.current, {
      type: "bar",
      data: { labels, datasets: [{ label: "Revenue", data, backgroundColor: gold, borderRadius: 6, maxBarThickness: 38 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { color: grid } }, y: { grid: { color: grid }, ticks: { callback: v => "रू " + v } } } }
    });
    const dough = (ref, obj) => new Chart(ref, {
      type: "doughnut",
      data: { labels: Object.keys(obj), datasets: [{ data: Object.values(obj), backgroundColor: pal, borderWidth: 0 }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: "62%", plugins: { legend: { position: "bottom" } } }
    });
    if (Object.keys(methods).length) store.current.method = dough(methodRef.current, methods);
    if (Object.keys(types).length) store.current.type = dough(typeRef.current, types);
    return () => { Object.values(store.current).forEach(c => { try { c.destroy(); } catch (e) {} }); };
  }, [rows, range]);

  if (!window.Chart) return null;
  return (
    <div className="card mb">
      <div className="flex spread mb" style={{ flexWrap: "wrap", gap: 8 }}>
        <h4 className="gold" style={{ margin: 0 }}>📊 Payment Analytics</h4>
        <div className="flex" style={{ gap: 6 }}>
          {[["day", "Daily"], ["week", "Weekly"], ["month", "Monthly"]].map(([k, l]) => (
            <button key={k} className={"btn sm " + (range === k ? "" : "ghost")} onClick={() => setRange(k)}>{l}</button>
          ))}
        </div>
      </div>
      <div style={{ height: 240 }}><canvas ref={barRef} /></div>
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
        <div>
          <div className="muted mb" style={{ fontSize: 12.5, textAlign: "center" }}>Payment Method (by amount)</div>
          <div style={{ height: 210 }}><canvas ref={methodRef} /></div>
        </div>
        <div>
          <div className="muted mb" style={{ fontSize: 12.5, textAlign: "center" }}>Room vs Restaurant (by amount)</div>
          <div style={{ height: 210 }}><canvas ref={typeRef} /></div>
        </div>
      </div>
    </div>
  );
}

/* ============ PAYMENT VERIFICATION (admin + reception) ============
   One place to verify online payments (eSewa / QR / cash) for both room
   bookings and restaurant orders, then print the bill. */
function PaymentVerify() {
  const [bookings] = useLive(() => api("/bookings"), ["bookings", "booking"]);
  const [orders] = useLive(() => api("/orders"), ["orders", "order"]);
  const [tab, setTab] = useState("pending");
  if (!bookings || !orders) return <div className="empty">Loading…</div>;
  const rows = [];
  bookings.forEach(b => {
    const total = b.total !== undefined ? b.total : (b.nights || 1) * (Number(b.price) || 0);
    const paid = b.paidAmount !== undefined ? b.paidAmount : (b.paid ? total : 0);
    rows.push({ kind: "room", id: b.id, ref: "Booking #" + b.no, name: b.name, phone: b.phone, method: b.paymentMethod || "cash", total, pending: total - paid, isPaid: total - paid <= 0, when: b.createdAt, obj: b });
  });
  orders.forEach(o => {
    rows.push({ kind: "food", id: o.id, ref: "Order #" + o.no, name: o.name, phone: o.phone, method: o.paymentMethod || "cash", total: o.total, pending: o.paid ? 0 : o.total, isPaid: !!o.paid, when: o.createdAt, obj: o });
  });
  rows.sort((a, b) => new Date(b.when) - new Date(a.when));
  const online = m => ["online", "esewa", "qr"].includes(m);
  const list = rows.filter(r => tab === "all" ? true : tab === "online" ? online(r.method) : !r.isPaid);
  const methodLabel = m => ({ cash: "💵 Cash", online: "📱 QR/Online", esewa: "🟢 eSewa", qr: "📱 QR", credit: "💳 Credit", other: "🏦 Other" }[m] || m);
  const verify = async r => {
    if (r.isPaid) return;
    const isOnline = ["online", "esewa", "qr"].includes(r.method);
    let txnId = "";
    if (isOnline) {
      txnId = prompt("Enter the " + r.method.toUpperCase() + " transaction ID for " + r.ref + " (" + NPR(r.total) + "):", "");
      if (txnId === null) return; // cancelled
    } else if (!confirm("Confirm cash received for " + r.ref + " (" + NPR(r.total) + ") and mark PAID?")) return;
    const body = { paid: true, verifiedBy: (Auth.user || {}).name || "staff" };
    if (txnId) body.txnId = txnId;
    if (r.kind === "room") await api("/bookings/" + r.id, { method: "PATCH", body });
    else await api("/orders/" + r.id, { method: "PATCH", body });
  };
  const printBill = r => r.kind === "room" ? printHTML(roomBillHTML(r.obj)) : printHTML(billHTML(r.obj, "customer"));
  const pendingCount = rows.filter(r => !r.isPaid).length;
  return (
    <div>
      <PageHead t="✅ Payment Verification" s={"Verify online payments for rooms & restaurant, then print the bill · " + pendingCount + " pending"} />
      <div className="flex mb" style={{ gap: 8, flexWrap: "wrap" }}>
        {[["pending", "Pending"], ["online", "Online (eSewa / QR)"], ["all", "All"]].map(([k, l]) => (
          <button key={k} className={"btn sm " + (tab === k ? "" : "ghost")} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>
      <div className="tbl-wrap">
        <table>
          <thead><tr><th>Ref</th><th>Type</th><th>Customer</th><th>Method</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            {list.map(r => (
              <tr key={r.kind + r.id}>
                <td><b>{r.ref}</b></td>
                <td>{r.kind === "room" ? "🛏 Room" : "🍽 Food"}</td>
                <td>{r.name}{r.phone ? <span className="muted"> · {r.phone}</span> : null}</td>
                <td>{methodLabel(r.method)}{r.obj.txnId ? <div className="muted" style={{ fontSize: 11 }}>Txn: {r.obj.txnId}</div> : null}</td>
                <td><b>{NPR(r.total)}</b></td>
                <td>{r.isPaid ? <span className="pill p-ready">paid ✓</span> : <span className="pill p-cancelled">due {NPR(r.pending)}</span>}</td>
                <td className="muted" style={{ fontSize: 11.5 }}>{fmtDT(r.when)}</td>
                <td className="flex" style={{ gap: 5 }}>
                  {!r.isPaid && <button className="btn sm green" onClick={() => verify(r)}>Verify ✓</button>}
                  <button className="btn sm ghost" onClick={() => printBill(r)}>🖨 Bill</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <div className="empty">Nothing to show for this filter.</div>}
      </div>
    </div>
  );
}
