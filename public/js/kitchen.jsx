/* kitchen.jsx — Kitchen panel: live order board (receive → making → ready) */

function KitchenPanel() {
  const [tab, setTab] = useState("board");
  const tabs = [
    { id: "board", icon: "🔥", label: "Live Orders" },
    { id: "done", icon: "✅", label: "Finished Today" }
  ];
  return (
    <PanelShell area="kitchen" tabs={tabs} tab={tab} setTab={setTab}>
      {tab === "board" && <KitchenBoard />}
      {tab === "done" && <KitchenDone />}
    </PanelShell>
  );
}

function KitchenBoard() {
  const [orders] = useLive(() => api("/orders"), ["orders", "order", "order-status"]);
  if (!orders) return <div className="empty">Loading…</div>;
  const active = orders.filter(o => ["pending", "received", "making", "ready"].includes(o.status));
  const setStatus = (o, status) => api("/orders/" + o.id, { method: "PATCH", body: { status } });
  return (
    <div>
      <PageHead t="Kitchen — Live Orders" s="New orders appear instantly with a sound 🔔" />
      {active.length === 0 && <div className="empty">🧘 No pending orders. Kitchen is calm.</div>}
      <motion.div className="kboard" layout>
        <AnimatePresence>
        {active.map(o => (
          <motion.div className={"card korder " + o.status} key={o.id} layout
            initial={{ opacity: 0, scale: 0.82, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 80 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}>
            <div className="khead">
              <span className="kno">#{o.no}</span>
              <span className={"pill p-" + o.status}>{o.status === "pending" ? "NEW 🔔" : o.status}</span>
            </div>
            <div className="muted">{fmtDT(o.createdAt)} · {o.name}{o.table ? " · Table " + o.table : ""} · {o.source}</div>
            <ul>
              {o.items.map((i, k) => (
                <li key={k}><span><span className={"veg-dot " + (i.foodType || "veg")} style={{ marginRight: 6 }}></span>{i.foodName}</span><b>× {i.qty}</b></li>
              ))}
            </ul>
            <div className="kfoot">
              {o.status === "pending" && <button className="btn sm" onClick={() => setStatus(o, "received")}>✋ Receive Order</button>}
              {o.status === "received" && <button className="btn sm blue" onClick={() => setStatus(o, "making")}>🔥 Start Making</button>}
              {o.status === "making" && <button className="btn sm green" onClick={() => setStatus(o, "ready")}>✅ Order Ready</button>}
              {o.status === "ready" && <button className="btn sm ghost" onClick={() => setStatus(o, "completed")}>Served / Finish</button>}
              <button className="btn sm ghost" onClick={() => printHTML(billHTML(o, "kitchen"))}>🖨 KOT</button>
            </div>
          </motion.div>
        ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function KitchenDone() {
  const [orders] = useLive(() => api("/orders"), ["orders", "order", "order-status"]);
  if (!orders) return <div className="empty">Loading…</div>;
  const today = new Date().toDateString();
  const done = orders.filter(o => o.status === "completed" && new Date(o.createdAt).toDateString() === today);
  return (
    <div>
      <PageHead t="Finished Orders (Today)" s={done.length + " order(s) completed"} />
      <div className="tbl-wrap">
        <table>
          <thead><tr><th>#</th><th>Items</th><th>Customer</th><th>Time</th></tr></thead>
          <tbody>
            {done.map(o => (
              <tr key={o.id}>
                <td><b className="gold">#{o.no}</b></td>
                <td>{o.items.map(i => i.foodName + "×" + i.qty).join(", ")}</td>
                <td>{o.name}{o.table ? " · T" + o.table : ""}</td>
                <td className="muted">{fmtDT(o.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {done.length === 0 && <div className="empty">Nothing finished yet today.</div>}
      </div>
    </div>
  );
}
