/* public.jsx — Home, Rooms, Restaurant, About, Contact, Checkout, Login */

/* ---------------- animated gold illustrations ---------------- */
function ArtBed() {
  return (
    <svg className="art-svg" viewBox="0 0 320 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* moon + stars */}
      <circle cx="262" cy="46" r="20" stroke="#d4a94e" strokeWidth="2.5" />
      <path d="M254 32a20 20 0 0 0 2 28 16 16 0 1 1-2-28z" fill="#d4a94e" opacity=".85" />
      <path className="tw1" d="M52 34l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#f0d48a" />
      <path className="tw2" d="M108 22l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#f0d48a" />
      <path className="tw3" d="M196 60l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#f0d48a" />
      {/* bed */}
      <path d="M40 118V86c0-8 6-14 14-14h40c10 0 18 8 18 18v28" stroke="#d4a94e" strokeWidth="4" strokeLinecap="round" />
      <rect x="52" y="98" width="52" height="18" rx="9" stroke="#f0d48a" strokeWidth="3.5" fill="#1a1a20" />
      <path d="M28 160v-28c0-8 6-14 14-14h236c8 0 14 6 14 14v28" stroke="#d4a94e" strokeWidth="4" strokeLinecap="round" />
      <rect x="20" y="158" width="280" height="22" rx="11" stroke="#f0d48a" strokeWidth="4" fill="#17171d" />
      <path d="M36 180v24M284 180v24" stroke="#d4a94e" strokeWidth="4" strokeLinecap="round" />
      {/* zzz */}
      <g className="zzz" fill="#f0d48a" fontFamily="serif" fontWeight="700">
        <text x="150" y="66" fontSize="22">z</text>
        <text x="168" y="48" fontSize="17">z</text>
        <text x="183" y="34" fontSize="13">z</text>
      </g>
    </svg>
  );
}

function ArtKitchen() {
  return (
    <svg className="art-svg" viewBox="0 0 320 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* steam */}
      <path className="steam s1" d="M126 84c-6-10 6-14 0-24" stroke="#f0d48a" strokeWidth="3.5" strokeLinecap="round" />
      <path className="steam s2" d="M160 80c-6-12 6-16 0-28" stroke="#f0d48a" strokeWidth="3.5" strokeLinecap="round" />
      <path className="steam s3" d="M194 84c-6-10 6-14 0-24" stroke="#f0d48a" strokeWidth="3.5" strokeLinecap="round" />
      {/* cloche */}
      <path d="M74 156a86 86 0 0 1 172 0" stroke="#d4a94e" strokeWidth="5" strokeLinecap="round" fill="#17171d" />
      <circle cx="160" cy="64" r="7" fill="#f0d48a" />
      <path d="M160 71v-4" stroke="#d4a94e" strokeWidth="4" />
      {/* plate */}
      <path d="M46 162h228" stroke="#f0d48a" strokeWidth="5" strokeLinecap="round" />
      <path d="M84 176h152" stroke="#d4a94e" strokeWidth="4" strokeLinecap="round" opacity=".7" />
      {/* cutlery */}
      <g className="cutl">
        <path d="M30 96v56M24 96v18c0 5 12 5 12 0V96" stroke="#d4a94e" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M292 96c-8 4-8 26 0 30v26" stroke="#d4a94e" strokeWidth="3.5" strokeLinecap="round" />
      </g>
      {/* sparkles */}
      <path className="tw2" d="M64 58l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#f0d48a" />
      <path className="tw1" d="M256 48l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="#f0d48a" />
    </svg>
  );
}

/* ---------------- virtual tour ---------------- */
function VirtualTour({ hasPhoto }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="tour glass" onClick={() => setOpen(true)}>
        {hasPhoto ? <img src="/img/hotel.jpg" alt="Hotel Jai Laxmi tour" /> : <div className="bg-fallback" style={{ height: "clamp(300px,52vw,540px)" }} />}
        <div className="tshade" />
        <button className="play">▶</button>
        <div className="tlabel">
          <span>Virtual Tour Preview</span>
          <b>Walk through होटल जय लक्ष्मी & लज</b>
        </div>
      </div>
      {open && (
        <div className="tour-modal" onClick={e => e.target === e.currentTarget && setOpen(false)}>
          <div className="frame">
            {hasPhoto ? <img src="/img/hotel.jpg" alt="virtual tour" /> : <div className="bg-fallback" style={{ height: "min(70vh,620px)" }} />}
          </div>
          <div className="tbar">
            <span className="muted">📍 Dhangadi Chauraha · guided camera preview</span>
            <button className="btn sm" onClick={() => go("/rooms")}>Book This Stay →</button>
            <button className="btn sm ghost" onClick={() => setOpen(false)}>✕ Close</button>
          </div>
        </div>
      )}
    </>
  );
}

/* ================ CINEMATIC HOTEL FILM — "From Entrance to Luxury Stay" ================ */
const AMENITIES = [
  ["📶", "High-Speed Wi-Fi"], ["❄️", "Air Conditioning"], ["📺", "Smart LED TV"],
  ["🚿", "24×7 Hot Water"], ["🛏", "Luxury Beds"], ["🧹", "Daily Housekeeping"],
  ["🔒", "Secure Rooms"], ["📞", "Room Service"], ["🍽", "Restaurant"],
  ["🚗", "Parking"], ["🧺", "Laundry"], ["⚡", "Power Backup"],
  ["🧳", "Family Rooms"], ["💼", "Business Stay"], ["💳", "Digital Payment"]
];

/* ---------- shared cinematic components ---------- */
function LetterReveal({ text }) {
  return (
    <span aria-label={text}>
      {text.split("").map((ch, i) => (
        <motion.span key={i} style={{ display: "inline-block", whiteSpace: "pre" }}
          initial={{ opacity: 0, y: 22, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.25 + i * 0.028, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
          {ch}
        </motion.span>
      ))}
    </span>
  );
}

function Particles({ n = 14 }) {
  return (
    <div className="particles" aria-hidden="true">
      {Array.from({ length: n }).map((_, i) => (
        <span key={i} style={{
          left: ((i * 73 + 11) % 100) + "%",
          animationDelay: (i * 0.8) + "s",
          animationDuration: (6 + (i % 5) * 1.6) + "s",
          width: 3 + (i % 3) * 2, height: 3 + (i % 3) * 2
        }} />
      ))}
    </div>
  );
}

function Gallery({ imgs }) {
  const [lb, setLb] = useState(null);
  return (
    <>
      <div className="masonry">
        {imgs.map((s, i) => (
          <motion.div className="mas" key={i} onClick={() => setLb(s)}
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }} transition={{ delay: (i % 4) * 0.08, type: "spring", stiffness: 240, damping: 20 }}
            whileHover={{ scale: 1.02 }}>
            <img src={s.src} alt={s.cap || "gallery"} style={{ height: s.h || 180, objectPosition: s.pos || "center" }} loading="lazy" />
            <div className="mas-ov"><span>🔍</span>{s.cap && <p>{s.cap}</p>}</div>
          </motion.div>
        ))}
      </div>
      <AnimatePresence>
        {lb && (
          <motion.div className="lb" onClick={() => setLb(null)}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.img src={lb.src} style={{ objectPosition: lb.pos || "center" }}
              initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.85 }}
              transition={{ type: "spring", stiffness: 240, damping: 22 }} />
            {lb.cap && <p>{lb.cap}</p>}
            <button className="film-close" style={{ top: 20 }} onClick={() => setLb(null)}>✕</button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* photo slider with thumbnails (room/dish detail) */
function PhotoSlider({ photos, fallback, height = 220 }) {
  const list = photos && photos.length ? photos : [fallback];
  const [i, setI] = useState(0);
  return (
    <div>
      <div className="det-ph" style={{ height }}>
        <AnimatePresence mode="wait">
          <motion.img key={i} src={list[i]} alt="photo"
            initial={{ opacity: 0.2, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }} onError={e => e.target.style.display = "none"} />
        </AnimatePresence>
        {list.length > 1 && (
          <>
            <button className="sl-nav l" onClick={() => setI((i - 1 + list.length) % list.length)}>‹</button>
            <button className="sl-nav r" onClick={() => setI((i + 1) % list.length)}>›</button>
          </>
        )}
      </div>
      {list.length > 1 && (
        <div className="thumbs">
          {list.map((p, k) => <img key={k} src={p} className={k === i ? "on" : ""} onClick={() => setI(k)} />)}
        </div>
      )}
    </div>
  );
}

/* live guest reviews (approved by admin) with write-review form */
function ReviewsSection({ fallback, title = "What Our Guests Say" }) {
  const [revs] = useLive(() => api("/public/reviews"), ["reviews", "review"]);
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name: "", country: "", rating: 5, text: "" });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
  const rise = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 250, damping: 22 } } };
  const items = (revs && revs.length)
    ? revs.slice(0, 6).map(r => [r.name.trim()[0].toUpperCase(), r.name, r.country, r.text, r.rating])
    : fallback;
  const avg = (revs && revs.length)
    ? (revs.reduce((s, r) => s + r.rating, 0) / revs.length).toFixed(1)
    : "4.7";
  const send = async () => {
    setErr("");
    if (!f.name.trim() || !f.text.trim()) { setErr("Please write your name and review."); return; }
    try {
      const r = await api("/public/reviews", { method: "POST", body: f });
      setMsg(r.message); setF({ name: "", country: "", rating: 5, text: "" });
    } catch (e) { setErr(e.message); }
  };
  return (
    <section className="rh-sec">
      <Reveal><h2 className="rh-title">{title}</h2></Reveal>
      <Reveal delay={80}><p className="rh-sub">⭐ {avg} average from our guests
        <button className="chip" style={{ marginLeft: 12 }} onClick={() => { setOpen(true); setMsg(""); }}>✍ Write a Review</button>
      </p></Reveal>
      <motion.div className="rev-row" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }}>
        {items.map(([av, n, c, txt, st]) => (
          <motion.div className="rev" key={n + txt.slice(0, 8)} variants={rise} whileHover={{ y: -6 }}>
            <div className="flex"><span className="rav">{av}</span><div><b>{n}</b><div className="muted" style={{ fontSize: 12 }}>{c} · verified ✓</div></div></div>
            <Stars v={st} />
            <p>"{txt}"</p>
          </motion.div>
        ))}
      </motion.div>
      {open && (
        <Modal title="✍ Write a Review" onClose={() => setOpen(false)}>
          {msg ? <p className="green mt">🙏 {msg}</p> : (
            <>
              <div className="row">
                <div><label>Your name *</label><input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></div>
                <div><label>Country</label><input value={f.country} onChange={e => setF({ ...f, country: e.target.value })} placeholder="🇳🇵 Nepal" /></div>
              </div>
              <label>Your rating</label>
              <div className="flex" style={{ gap: 4 }}>
                {[1, 2, 3, 4, 5].map(n2 => (
                  <button key={n2} className="star-btn" style={{ color: n2 <= f.rating ? "#D4AF37" : "#d8d2c4" }}
                    onClick={() => setF({ ...f, rating: n2 })}>★</button>
                ))}
              </div>
              <label>Your review *</label>
              <textarea rows="3" value={f.text} onChange={e => setF({ ...f, text: e.target.value })} placeholder="How was your stay / meal?" />
              {err && <p className="red mt">⚠ {err}</p>}
            </>
          )}
          <div className="modal-actions">
            <button className="btn ghost" onClick={() => setOpen(false)}>Close</button>
            {!msg && <button className="btn em" onClick={send}>Submit Review</button>}
          </div>
        </Modal>
      )}
    </section>
  );
}

/* full amenity cards: icon · title · description */
const AMEN_FULL = [
  ["📶", "High-Speed Free Wi-Fi", "Stay connected with complimentary high-speed internet throughout the hotel."],
  ["❄️", "Fully Air-Conditioned Rooms", "Modern AC rooms designed for maximum comfort in every season."],
  ["🛏", "Deluxe & Family Rooms", "Spacious rooms with comfortable beds, clean interiors, and elegant décor."],
  ["🍽", "Multi-Cuisine Restaurant", "Delicious North Indian, South Indian, Nepali, Chinese, and Continental cuisine."],
  ["🚿", "24×7 Hot & Cold Water", "Continuous hot and cold water supply for a comfortable stay."],
  ["📺", "Smart LED TV", "Entertainment with HD channels and modern television facilities."],
  ["🚗", "Free Parking", "Safe and spacious parking area available for all guests."],
  ["🔒", "Safe & Secure Stay", "24-hour security with CCTV surveillance and secure access."],
  ["🧹", "Daily Housekeeping", "Professional housekeeping ensures spotless and hygienic rooms every day."],
  ["☕", "Tea & Coffee Facility", "Complimentary tea and coffee setup available in every room."],
  ["🧺", "Laundry Service", "Quick and affordable laundry service for all guests."],
  ["📞", "24×7 Reception", "Friendly staff available around the clock for bookings and guest services."],
  ["💳", "Digital Payments", "All major UPI, debit cards, credit cards, and mobile wallets accepted."],
  ["👨‍👩‍👧", "Family Friendly", "Comfortable accommodations for families, couples, and groups."],
  ["🎉", "Banquet & Event Space", "Spacious halls for meetings, celebrations, birthdays, and special occasions."],
  ["🚌", "Travel Assistance", "Local sightseeing, transportation, taxi booking, and travel guidance."]
];

function CinematicTour({ onClose }) {
  /* each scene: duration (ms), caption, camera move (img animate), night?, overlay */
  const scenes = [
    { d: 4200, cap: "HOTEL JAI LAXMI — Dhangadi Chauraha, Sudurpaschim", sub: "AC Restaurant & Lodge",
      from: { scale: 1.05, x: "0%", y: "0%" }, to: { scale: 1.18, x: "0%", y: "2%" } },
    { d: 4200, cap: "The doors open at golden hour", sub: "A clean, warm welcome",
      from: { scale: 1.5, x: "0%", y: "-28%" }, to: { scale: 1.85, x: "0%", y: "-38%" } },
    { d: 4200, cap: "Reception — नमस्ते, अतिथि देवो भवः", sub: "24×7 friendly front desk",
      from: { scale: 1.9, x: "-6%", y: "-34%" }, to: { scale: 1.9, x: "8%", y: "-34%" } },
    { d: 4200, cap: "Deluxe AC rooms & airy balconies", sub: "Fresh sheets · soft light · peace",
      from: { scale: 1.7, x: "6%", y: "22%" }, to: { scale: 1.85, x: "-6%", y: "30%" } },
    { d: 5600, cap: "Everything you need", sub: "Amenities included with every stay",
      from: { scale: 1.12, x: "0%", y: "0%" }, to: { scale: 1.2, x: "0%", y: "4%" }, amenities: true },
    { d: 4200, cap: "The Restaurant", sub: "Nepali · North & South Indian · Chinese · Tandoori",
      from: { scale: 1.8, x: "8%", y: "-6%" }, to: { scale: 1.9, x: "-8%", y: "-2%" } },
    { d: 4200, cap: "Evenings at Jai Laxmi", sub: "The lights come on, the city slows down",
      from: { scale: 1.08, x: "0%", y: "0%" }, to: { scale: 1.2, x: "0%", y: "-4%" }, night: true },
    { d: 6200, brand: true, night: true,
      from: { scale: 1.25, x: "0%", y: "0%" }, to: { scale: 1.08, x: "0%", y: "0%" } }
  ];
  const [i, setI] = useState(0);
  useEffect(() => {
    if (i >= scenes.length) return;
    const t = setTimeout(() => setI(x => x + 1), scenes[i].d);
    return () => clearTimeout(t);
  }, [i]);
  useEffect(() => { if (i >= scenes.length) onClose(); }, [i]);
  if (i >= scenes.length) return null;
  const s = scenes[i];
  return (
    <div className="film no-print" onClick={e => e.target === e.currentTarget && onClose()}>
      {/* film frame */}
      <div className="film-frame">
        <AnimatePresence mode="sync">
          <motion.img key={i + (s.night ? "n" : "d")}
            src={s.night ? "/img/hotel-night.jpg" : "/img/hotel.jpg"}
            initial={{ ...s.from, opacity: 0 }}
            animate={{ ...s.to, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ opacity: { duration: 0.8 }, default: { duration: s.d / 1000, ease: "linear" } }}
            alt="Hotel Jai Laxmi film" />
        </AnimatePresence>
        <div className="film-grade" />
        {/* captions */}
        <AnimatePresence mode="wait">
          {!s.brand ? (
            <motion.div className="film-cap" key={"c" + i}
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
              <h3>{s.cap}</h3>
              <p>{s.sub}</p>
            </motion.div>
          ) : (
            <motion.div className="film-brand" key="brand"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
              <motion.img src="/img/logo-small.jpg" alt="logo"
                initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 160, damping: 14, delay: 0.2 }} />
              <motion.h2 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="notranslate" translate="no">HOTEL JAI LAXMI</motion.h2>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
                AC Restaurant &amp; Lodge · Comfort • Luxury • Hospitality</motion.p>
              <motion.p className="film-tag" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}>
                "Your Comfort, Our Priority."</motion.p>
              <motion.div className="flex" style={{ justifyContent: "center", marginTop: 18 }}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.7 }}>
                <button className="btn lg" onClick={() => { onClose(); go("/rooms"); }}>Book Your Stay Today</button>
              </motion.div>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
                style={{ marginTop: 14, fontSize: 13, color: "#d8c9a8" }}>
                ☎ {HOTEL.phone} · 📍 {HOTEL.location}</motion.p>
            </motion.div>
          )}
        </AnimatePresence>
        {/* floating amenity icons scene */}
        {s.amenities && (
          <motion.div className="film-amenities"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
            initial="hidden" animate="show">
            {AMENITIES.slice(0, 9).map(([ic, t]) => (
              <motion.div className="fam" key={t}
                variants={{ hidden: { opacity: 0, scale: 0.4, y: 30 }, show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 14 } } }}>
                <span>{ic}</span>{t}
              </motion.div>
            ))}
          </motion.div>
        )}
        {/* progress + controls */}
        <div className="film-bar">
          {scenes.map((_, k) => (
            <div className={"seg" + (k < i ? " done" : "")} key={k}>
              {k === i && <motion.div className="fill" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                transition={{ duration: s.d / 1000, ease: "linear" }} />}
            </div>
          ))}
        </div>
        <button className="film-close" onClick={onClose}>✕</button>
        <button className="film-skip" onClick={() => setI(x => x + 1)}>Skip ›</button>
      </div>
    </div>
  );
}

/* ================ HOME — ultra luxury cinematic (Aman × Four Seasons) ================ */
function HomeLuxe() {
  const [data] = useLive(() => api("/public/rooms"), ["rooms", "bookings", "floors", "booking"]);
  const [menu] = useLive(() => api("/public/menu"), ["menu"]);
  const [gal] = useLive(() => api("/public/gallery"), ["gallery"]);
  const [content] = useLive(() => api("/public/content"), ["content"]);
  const C = content || {};
  const today = new Date().toISOString().slice(0, 10);
  const [q, setQ] = useState({ checkIn: today, checkOut: "", adults: 2, children: 0, infants: 0, type: "all", promo: "" });
  const [film, setFilm] = useState(false);
  const rooms = (data && data.rooms) || [];
  const specials = (menu || []).filter(m => m.chefSpecial).slice(0, 3);
  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
  const rise = { hidden: { opacity: 0, y: 34 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 240, damping: 22 } } };

  return (
    <div className="rh lux">
      {/* ================= HERO ================= */}
      <section className="lux-hero hl-hero">
        {C.home && C.home.heroVideo
          ? <video className="hero-video" autoPlay muted loop playsInline poster={C.home.heroPoster || "/img/hotel.jpg"}
              src={C.home.heroVideo} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          : <motion.img src={(C.home && C.home.heroPoster) || "/img/hotel.jpg"} alt="Hotel Jai Laxmi at golden hour"
              initial={{ scale: 1.18 }} animate={{ scale: 1 }} transition={{ duration: 2.4, ease: "easeOut" }}
              onError={e => e.target.style.display = "none"} />}
        <div className="lux-shade" />
        <div className="rays" aria-hidden="true" />
        <Particles n={18} />
        <motion.div className="lux-hero-txt"
          initial={{ opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <motion.span className="hero-badge" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 260, damping: 14 }}>
            ★★★★★ · Luxury Hospitality · Dhangadi Chauraha
          </motion.span>
          <h1><LetterReveal text="Experience Luxury Beyond Expectations" /></h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}>
            Luxury Stays • Fine Dining • Modern Comfort • Premium Hospitality</motion.p>
          <motion.div className="flex" style={{ justifyContent: "center", flexWrap: "wrap" }}
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.6 }}>
            <motion.button className="btn lg em" whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.93 }} onClick={() => go("/rooms")}>Book Your Stay</motion.button>
            <motion.button className="btn lg ghost-w" whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.93 }} onClick={() => go("/rooms")}>Explore Rooms</motion.button>
            <motion.button className="btn lg ghost-w" whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.93 }} onClick={() => go("/restaurant")}>Restaurant</motion.button>
            <motion.button className="btn lg ghost-w" whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.93 }} onClick={() => setFilm(true)}>▶ Watch Hotel Film</motion.button>
          </motion.div>
        </motion.div>
        <div className="hl-scroll" aria-hidden="true"><span /></div>
        {/* floating booking widget */}
        <BookingWidget q={q} setQ={setQ} data={data} onSearch={() => go("/rooms")} />
      </section>
      {film && <CinematicTour onClose={() => setFilm(false)} />}

      {/* ---- trust badges ---- */}
      <motion.div className="trust-mini"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09 } } }}
        initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }}>
        {["✔ Best Price Guaranteed", "✔ Free Cancellation", "✔ Instant Confirmation", "✔ Secure QR Payment", "✔ 24×7 Reception"].map(t => (
          <motion.span key={t} variants={{ hidden: { opacity: 0, y: 16, scale: 0.9 }, show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 18 } } }}>{t}</motion.span>
        ))}
      </motion.div>

      {/* ================= STORY ================= */}
      <section className="rh-sec">
        <div className="story">
          <Reveal variant="rv-left">
            <motion.div className="story-img" whileHover={{ scale: 1.015 }}>
              <img src="/img/hotel.jpg" alt="Hotel Jai Laxmi" onError={e => e.target.style.display = "none"} />
            </motion.div>
          </Reveal>
          <Reveal variant="rv-right">
            <div className="story-txt">
              <span className="story-kicker">Our Story</span>
              <h2>Experience Nepali Hospitality</h2>
              <p>
                At the heart of Dhangadi Chauraha stands a house built on one belief — <b>अतिथि देवो भवः</b>,
                the guest is God. What began as a family lodge has grown into a landmark of Sudurpaschim:
                AC rooms, a kitchen serving Nepali, Indian and Chinese favourites, a party hall for the town's
                celebrations, and a reception that never sleeps.
              </p>
              <p>
                Under the blessing of Goddess Laxmi, we welcome every traveller like family —
                whether you stay one night or one month.
              </p>
              <div className="sig">
                <span className="sig-name">Dipendra Upadhayay</span>
                <span className="sig-role">Founder &amp; Manager</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= STATS ================= */}
      <section className="rh-sec">
        <motion.div className="stat-band" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }}>
          {[[rooms.length || 25, "+", "Luxury Rooms"], [15, "+", "Years Experience"], [50, "K+", "Happy Guests"], [4.9, "★", "Guest Rating"]].map(([n, s, l]) => (
            <motion.div className="stat-cell" key={l} variants={rise}>
              <div className="num">{Number.isInteger(n) ? <Counter to={n} suffix={s} /> : <span>{n}{s}</span>}</div>
              <div className="lbl">{l}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ================= ROOM SHOWCASE ================= */}
      <section className="rh-sec">
        <Reveal><h2 className="rh-title">Rooms &amp; Suites</h2></Reveal>
        <Reveal delay={80}><p className="rh-sub">Live availability — booked and free in real time.</p></Reveal>
        {rooms.length === 0
          ? <div className="lux-grid">{[1, 2, 3].map(k => <div className="skel" key={k} />)}</div>
          : (
            <motion.div className="lux-grid" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.08 }}>
              {rooms.slice(0, 3).map((r, i) => {
                const m = roomMeta(r);
                return (
                  <motion.div className="lux-card" key={r.id} variants={rise}
                    whileHover={{ y: -10, rotateX: 3, rotateY: -3, boxShadow: "0 30px 60px rgba(60,50,30,.22), 0 0 0 1.5px rgba(212,175,55,.5)" }}
                    style={{ transformStyle: "preserve-3d" }}>
                    <div className="lph">
                      <img src={(r.photos && r.photos[0]) || "/img/hotel.jpg"} alt={"Room " + r.number}
                        style={(r.photos && r.photos[0]) ? null : { objectPosition: `${(i * 33) % 100}% ${25 + (i * 29) % 50}%` }} />
                      <span className={"rh-status " + (r.booked ? "b" : "f")}>{r.booked ? "Booked" : "Available"}</span>
                      <span className="price-badge">{NPR(r.price)} / night</span>
                    </div>
                    <div className="lbody">
                      <div className="flex spread"><h4>Room {r.number} · {r.type}</h4><span className="rate-chip"><Stars v={m.rating} /></span></div>
                      <p className="meta">{m.size} · up to {m.guests} guests · {m.feats.slice(0, 3).join(" · ")}</p>
                      <button className="btn sm em mt" style={{ width: "100%" }} disabled={r.booked} onClick={() => go("/rooms")}>
                        {r.booked ? "Fully Booked" : "Book Now →"}</button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        {rooms.length > 3 && (
          <Reveal className="flex mt" style={{ justifyContent: "center" }}>
            <button className="btn ghost" onClick={() => go("/rooms")}>View all {rooms.length} rooms →</button>
          </Reveal>
        )}
      </section>

      {/* ================= BENEFITS (admin-managed) ================= */}
      {C.benefits && C.benefits.length > 0 && (
        <section className="rh-sec">
          <Reveal><h2 className="rh-title">Why Guests Love Us</h2></Reveal>
          <motion.div className="amen-grid" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.08 }}>
            {C.benefits.map(b => (
              <motion.div className="amen-card" key={b.id} variants={rise} whileHover={{ y: -10, transition: { type: "spring", stiffness: 300, damping: 18 } }}>
                {b.photo ? <img src={b.photo} alt={b.name} style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 12, marginBottom: 10 }} /> : <span className="amen-ic">✨</span>}
                <h4>{b.name}</h4>
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      {/* ================= WHY CHOOSE US / PREMIUM AMENITIES ================= */}
      <section className="rh-sec">
        <Reveal><h2 className="rh-title">{C.amenities && C.amenities.length ? "Premium Amenities" : "Why Choose Jai Laxmi"}</h2></Reveal>
        <motion.div className="amen-grid" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.08 }}>
          {(C.amenities && C.amenities.length
            ? C.amenities.map(a => (
              <motion.div className="amen-card" key={a.id} variants={rise}
                whileHover={{ y: -10, transition: { type: "spring", stiffness: 300, damping: 18 } }}>
                {a.photo ? <img src={a.photo} alt={a.heading} style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 12, marginBottom: 10 }} /> : <span className="amen-ic">💎</span>}
                <h4>{a.heading}</h4><p>{a.desc}</p>
              </motion.div>
            ))
            : AMEN_FULL.slice(0, 8).map(([ic, t, d]) => (
              <motion.div className="amen-card" key={t} variants={rise}
                whileHover={{ y: -10, transition: { type: "spring", stiffness: 300, damping: 18 } }}>
                <span className="amen-ic">{ic}</span><h4>{t}</h4><p>{d}</p>
              </motion.div>
            )))}
        </motion.div>
      </section>

      {/* ================= OFFERS & PACKAGES (admin-managed) ================= */}
      {C.offers && C.offers.length > 0 && (
        <section className="rh-sec">
          <Reveal><h2 className="rh-title">Offers &amp; Packages</h2></Reveal>
          <motion.div className="offer-row" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
            {C.offers.map(o => (
              <motion.div className="offer shine" key={o.id} variants={rise} whileHover={{ y: -6 }}>
                {o.photo && <img src={o.photo} alt={o.heading} style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 10, marginBottom: 8 }} />}
                <b>{o.heading}</b><p>{o.desc}</p>
                <button className="btn sm em mt" onClick={() => go("/rooms")}>Book Now</button>
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      {/* ================= RESTAURANT ================= */}
      <section className="rh-sec">
        <div className="story rev-order">
          <Reveal variant="rv-left">
            <div className="story-txt">
              <span className="story-kicker">The Restaurant</span>
              <h2>From Our Kitchen, With Love</h2>
              <p>Nepali thali, sizzling Chinese, tandoori favourites — cooked fresh on order and served hot.
                Dine in our AC hall, reserve a family cabin, or order to your room.</p>
              {specials.length > 0 && (
                <div className="hl-specials">
                  {specials.map(m => (
                    <div className="spec-card" key={m.id} onClick={() => go("/restaurant")}>
                      {m.photo ? <img src={m.photo} alt={m.foodName} /> : <span className="noimg">🍛</span>}
                      <div><b>{m.foodName}</b><p>{NPR(m.price)}</p></div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex mt">
                <button className="btn em" onClick={() => go("/restaurant")}>Explore Menu</button>
                <button className="btn ghost" onClick={() => go("/reserve")}>Reserve Table</button>
              </div>
            </div>
          </Reveal>
          <Reveal variant="rv-right">
            <motion.div className="story-img res-img" whileHover={{ scale: 1.015 }}>
              <div className="res-hero-bg" style={{ position: "absolute", inset: 0 }} />
              <div className="res-plate-wrap" style={{ position: "relative", zIndex: 2 }}>
                <span className="steam s1" /><span className="steam s2" /><span className="steam s3" />
                <motion.span className="res-plate" animate={{ rotate: [0, 6, -6, 0], y: [0, -8, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>🍛</motion.span>
              </div>
            </motion.div>
          </Reveal>
        </div>
      </section>

      {/* ================= VIRTUAL TOUR ================= */}
      <section className="rh-sec">
        <Reveal variant="rv-zoom">
          <div className="tour glass" onClick={() => setFilm(true)} style={{ cursor: "pointer" }}>
            <img src="/img/hotel-night.jpg" alt="Hotel tour" onError={e => e.target.style.display = "none"}
              style={{ height: "clamp(260px,44vw,440px)" }} />
            <div className="tshade" />
            <button className="play">▶</button>
            <div className="tlabel"><span>Virtual Hotel Tour</span><b>From entrance to luxury stay — 40 seconds</b></div>
          </div>
        </Reveal>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <ReviewsSection title="Loved By Our Guests" fallback={[
        ["R", "Rajan T.", "🇳🇵 Nepal", "Clean AC rooms and the dal bhat was just like home. Reception helped us at midnight — great service.", 5],
        ["P", "Priya S.", "🇮🇳 India", "Stayed 3 nights for business. Fast Wi-Fi, quiet room, easy QR payment. Will return.", 5],
        ["D", "David M.", "🇬🇧 UK", "Best value in Dhangadhi. The balcony view at sunset is beautiful and staff are very friendly.", 4]]} />

      {/* ================= GALLERY ================= */}
      <section className="rh-sec">
        <Reveal><h2 className="rh-title">Hotel Gallery</h2></Reveal>
        <Gallery imgs={
          (gal && gal.length)
            ? gal.map((g, i) => ({ src: g.photo, cap: g.caption, h: 150 + (i % 4) * 35 }))
            : [
              { src: "/img/hotel.jpg", cap: "Golden hour", h: 230 },
              { src: "/img/hotel-night.jpg", cap: "Night lights", h: 180 },
              { src: "/img/hotel.jpg", cap: "Balconies", pos: "50% 20%", h: 170 },
              { src: "/img/logo-small.jpg", cap: "Blessed by Goddess Laxmi", h: 200 },
              { src: "/img/hotel.jpg", cap: "The restaurant", pos: "50% 75%", h: 175 },
              { src: "/img/hotel-night.jpg", cap: "Evening glow", pos: "30% 40%", h: 190 }
            ]
        } />
      </section>

      {/* ================= LOCATION ================= */}
      <section className="rh-sec" style={{ maxWidth: 1000, margin: "0 auto" }}>
        <Reveal><h2 className="rh-title">Nearby &amp; Getting Here</h2></Reveal>
        <Reveal delay={80}>
          <div className="dist-row">
            {[["✈️", "Dhangadhi Airport", "≈ 6 km · 15 min"], ["🚌", "Bus Park", "≈ 1 km · 5 min"], ["🛕", "Behedababa Temple", "≈ 4 km · 10 min"], ["🛒", "Main Bazaar", "at the door"]].map(([ic, t, d]) => (
              <div className="dist" key={t}><span>{ic}</span><b>{t}</b><p>{d}</p></div>
            ))}
          </div>
          <div className="map-wrap"><iframe src={HOTEL.mapEmbed} loading="lazy" title="map" allowFullScreen /></div>
          <div className="flex mt" style={{ justifyContent: "center" }}>
            <a className="btn em" href={HOTEL.mapLink} target="_blank" rel="noopener">🧭 Navigate to Hotel</a>
            <a className="btn ghost" href={HOTEL.phoneHref}>☎ {HOTEL.phone}</a>
          </div>
        </Reveal>
      </section>

      {/* ================= CTA ================= */}
      <section className="rh-sec" style={{ paddingBottom: 40 }}>
        <Reveal variant="rv-zoom">
          <div className="cta-banner">
            <img src="/img/hotel-night.jpg" alt="" onError={e => e.target.style.display = "none"} />
            <div className="cta-overlay" />
            <motion.div className="cta-inner" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }}>
              <motion.h2 variants={rise}>Book Your Luxury Stay Today</motion.h2>
              <motion.p variants={rise}>Premium rooms, delicious dining and hospitality that feels like home.</motion.p>
              <motion.div className="flex" style={{ justifyContent: "center" }} variants={rise}>
                <button className="btn lg" onClick={() => go("/rooms")}>Reserve Room</button>
                <a className="btn lg em" href={HOTEL.phoneHref}>☎ Call</a>
                <a className="btn lg em" style={{ background: "linear-gradient(135deg,#25D366,#128C7E)" }}
                  href="https://wa.me/9779806465366" target="_blank" rel="noopener">💬 WhatsApp</a>
              </motion.div>
            </motion.div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

/* ================ HOME — Royal Heritage style (light, photo-first) ================ */
function HomeRoyal() {
  const [roomData] = useLive(() => api("/public/rooms"), ["rooms", "booking", "bookings", "floors"]);
  const [hasPhoto, setHasPhoto] = useState(true);
  const [filter, setFilter] = useState("all");
  const [film, setFilm] = useState(false);
  const floors = (roomData && roomData.floors) || [];
  const rooms = (roomData && roomData.rooms) || [];
  const shown = rooms.filter(r => filter === "all" || r.floorId === filter).slice(0, 10);
  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
  const rise = { hidden: { opacity: 0, y: 34 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 240, damping: 22 } } };

  return (
    <div className="rh">
      {/* ---- hero photo + booking strip ---- */}
      <section className="rh-hero">
        <motion.div className="rh-photo"
          initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, ease: [0.42, 0, 0.58, 1] }}>
          {hasPhoto
            ? <motion.img src="/img/hotel.jpg" alt="HOTEL JAI LAXMI AND LODGE"
                onError={() => setHasPhoto(false)}
                initial={{ scale: 1.12 }} animate={{ scale: 1 }} transition={{ duration: 1.6, ease: "easeOut" }} />
            : <div className="rh-photo-fallback" />}
          <div className="rh-hero-cap notranslate" translate="no">
            <h1>होटल जय लक्ष्मी &amp; लज</h1>
            <p>HOTEL JAI LAXMI AND LODGE · Dhangadi Chauraha</p>
          </div>
          {/* play the cinematic film */}
          <motion.button className="rh-play" onClick={() => setFilm(true)}
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, type: "spring", stiffness: 220, damping: 14 }}>
            ▶
            <span className="rh-play-lbl">Watch the Film</span>
          </motion.button>
        </motion.div>
        {film && <CinematicTour onClose={() => setFilm(false)} />}
        <motion.div className="rh-book"
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, type: "spring", stiffness: 220, damping: 20 }}>
          <div><label>Check In</label><input type="date" defaultValue={new Date().toISOString().slice(0, 10)} /></div>
          <div><label>Check Out</label><input type="date" /></div>
          <div><label>Guests</label><input type="number" min="1" defaultValue="2" /></div>
          <div><label>Phone</label><input placeholder="98XXXXXXXX" /></div>
          <motion.button className="btn rh-book-btn" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.94 }} onClick={() => go("/rooms")}>Book Now</motion.button>
        </motion.div>
      </section>

      {/* ---- benefits ---- */}
      <section className="rh-sec">
        <Reveal><h2 className="rh-title">Benefits of Booking Directly Through Hotel Jai Laxmi</h2></Reveal>
        <motion.div className="rh-benefits" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }}>
          {[["✔", "Best Price"], ["🛏", "Free Room Upgrade"], ["🕐", "Free Late Check Out"], ["👑", "Jai Laxmi Privilege"]].map(([ic, t]) => (
            <motion.div className="rh-benefit" key={t} variants={rise} whileHover={{ y: -6 }}>
              <span className="bic">{ic}</span>
              <h5>{t}</h5>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ---- our rooms (filter chips + photo cards) ---- */}
      <section className="rh-sec">
        <Reveal><h2 className="rh-title">Our Rooms</h2></Reveal>
        <div className="rh-chips">
          <button className={"chip" + (filter === "all" ? " on" : "")} onClick={() => setFilter("all")}>All</button>
          {floors.map(f => (
            <button key={f.id} className={"chip" + (filter === f.id ? " on" : "")} onClick={() => setFilter(f.id)}>{f.name}</button>
          ))}
        </div>
        {shown.length === 0
          ? <div className="empty">Rooms appear here live once reception adds them.</div>
          : (
            <motion.div className="rh-row" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}>
              {shown.map((r, i) => (
                <motion.div className="rh-loc" key={r.id} variants={rise} whileHover={{ y: -8 }}>
                  <div className="ph">
                    {hasPhoto ? <img src="/img/hotel.jpg" alt={"Room " + r.number} style={{ objectPosition: `${(i * 31) % 100}% ${20 + (i * 27) % 60}%` }} /> : <div className="rh-photo-fallback" />}
                    <span className={"rh-status " + (r.booked ? "b" : "f")}>{r.booked ? "Booked" : "Available"}</span>
                  </div>
                  <h4>Room {r.number} · {r.type}</h4>
                  <p>{r.special || "Comfortable stay with warm Nepali hospitality in the heart of Dhangadi Chauraha."}</p>
                  <div className="rh-loc-foot">
                    <b>{NPR(r.price)} <span>/ night</span></b>
                    <a href="#/rooms">View Room →</a>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
      </section>

      {/* ---- premium amenities ---- */}
      <section className="rh-sec" id="amenities">
        <Reveal><h2 className="rh-title">Premium Amenities</h2></Reveal>
        <Reveal delay={80}>
          <p className="rh-sub">Experience modern comfort with thoughtfully designed facilities that make your stay relaxing, enjoyable, and memorable.</p>
        </Reveal>
        <motion.div className="amen-grid"
          variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.06 }}>
          {AMEN_FULL.map(([ic, t, d]) => (
            <motion.div className="amen-card" key={t} variants={rise}
              whileHover={{ y: -10, transition: { type: "spring", stiffness: 300, damping: 18 } }}>
              <span className="amen-ic">{ic}</span>
              <h4>{t}</h4>
              <p>{d}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ---- CTA banner ---- */}
      <section className="rh-sec" style={{ paddingBottom: 30 }}>
        <Reveal variant="rv-zoom">
          <div className="cta-banner">
            {hasPhoto ? <img src="/img/hotel-night.jpg" alt="Hotel Jai Laxmi at night" /> : null}
            <div className="cta-overlay" />
            <motion.div className="cta-inner"
              variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }}>
              <motion.h2 variants={rise}>Experience Comfort Like Never Before</motion.h2>
              <motion.p variants={rise}>
                Book your stay today and enjoy premium hospitality, modern amenities, delicious dining,
                and exceptional service at Hotel Jai Laxmi.
              </motion.p>
              <motion.div className="flex" style={{ justifyContent: "center" }} variants={rise}>
                <motion.button className="btn lg" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.93 }} onClick={() => go("/rooms")}>Book Your Room</motion.button>
                <motion.button className="btn lg em" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.93 }} onClick={() => go("/rooms")}>View Rooms</motion.button>
                <motion.button className="btn lg ghost-w" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.93 }} onClick={() => go("/contact")}>Contact Us</motion.button>
              </motion.div>
            </motion.div>
          </div>
        </Reveal>
      </section>

      {/* ---- privilege / loyalty ---- */}
      <section className="rh-sec">
        <Reveal><h2 className="rh-title">Jai Laxmi Privilege</h2></Reveal>
        <div className="rh-priv">
          <motion.div className="rh-priv-grid" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
            {[["0% 20%"], ["70% 60%"], ["30% 75%"], ["100% 35%"]].map(([pos], i) => (
              <motion.div className="cell" key={i} variants={rise}>
                {hasPhoto ? <img src="/img/hotel.jpg" alt="hotel detail" style={{ objectPosition: pos }} /> : <div className="rh-photo-fallback" />}
              </motion.div>
            ))}
          </motion.div>
          <Reveal variant="rv-right">
            <div className="rh-priv-txt">
              <p>
                <b>Jai Laxmi Privilege</b> is our personal thank-you to returning guests. Book directly with us and
                enjoy the best rate guaranteed, priority rooms during festivals, free late check-out and a warm
                plate from our kitchen on every visit — अतिथि देवो भवः.
              </p>
              <div className="flex mt">
                <motion.button className="btn" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.94 }} onClick={() => go("/rooms")}>Book Direct</motion.button>
                <motion.button className="btn ghost" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.94 }} onClick={() => go("/restaurant")}>Our Restaurant</motion.button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---- services strip ---- */}
      <section className="rh-sec">
        <Reveal><h2 className="rh-title">Everything Online</h2></Reveal>
        <motion.div className="rh-benefits" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }}>
          {[["🌐", "Online Booking", "/rooms"], ["🍽️", "Table Reservation", "/reserve"], ["🛎️", "Self Check-in", "/checkin"], ["📲", "Order Food", "/restaurant"]].map(([ic, t, to]) => (
            <motion.div className="rh-benefit" key={t} variants={rise} whileHover={{ y: -6 }} style={{ cursor: "pointer" }} onClick={() => go(to)}>
              <span className="bic">{ic}</span>
              <h5>{t}</h5>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ---- contact / map ---- */}
      <section className="rh-sec" style={{ maxWidth: 1000, margin: "0 auto" }}>
        <Reveal><h2 className="rh-title">Find Us</h2></Reveal>
        <Reveal delay={100}>
          <div className="map-wrap mt">
            <iframe src={HOTEL.mapEmbed} loading="lazy" title="Hotel Jai Laxmi location" allowFullScreen></iframe>
          </div>
          <div className="flex mt" style={{ justifyContent: "center" }}>
            <a className="btn" href={HOTEL.mapLink} target="_blank" rel="noopener">🧭 Open in Google Maps</a>
            <a className="btn ghost" href={HOTEL.phoneHref}>☎ {HOTEL.phone}</a>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

/* ---------------- HOME (cinematic landing) ---------------- */
function Home() {
  const bgRef = useRef(null);
  const [hasPhoto, setHasPhoto] = useState(true);
  const [roomData] = useLive(() => api("/public/rooms"), ["rooms", "booking", "bookings", "floors"]);
  const [msgSent, setMsgSent] = useState(false);

  /* parallax: hero photo drifts + zooms as you scroll */
  useEffect(() => {
    const onScroll = () => {
      if (!bgRef.current) return;
      const y = window.scrollY;
      bgRef.current.style.transform = `translateY(${y * 0.32}px) scale(${1 + Math.min(y / 2600, .18)})`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div>
      {/* ---- HERO ---- */}
      <section className="hero2">
        <div className="bgwrap" ref={bgRef}>
          {hasPhoto
            ? <img src="/img/hotel.jpg" alt="Hotel Jai Laxmi building" onError={() => setHasPhoto(false)} />
            : <div className="bg-fallback" />}
        </div>
        <div className="shade" />
        <div className="inner">
          <LogoImg className="crest" alt="Laxmi crest" />
          <div className="eyebrow">Dhangadi Chauraha · Sudurpaschim · Nepal</div>
          <h1 translate="no" className="notranslate">होटल <span className="gold-grad">जय लक्ष्मी</span> &amp; लज</h1>
          <p className="sub notranslate" translate="no">HOTEL JAI LAXMI AND LODGE — AC &amp; Non-AC Rooms · Restaurant, Bar &amp; Lodge</p>
          <div className="cta">
            {/* anticipation #2: dips down before springing up · squash & stretch #1 on tap */}
            <motion.button className="btn lg" onClick={() => go("/rooms")}
              whileHover={{ y: [0, 4, -4], scaleY: [1, 0.94, 1.03], transition: { duration: 0.35, times: [0, 0.3, 1] } }}
              whileTap={{ scale: 0.9, scaleY: 0.82, scaleX: 1.12 }}
              transition={TIMINGS.spring}>Reserve a Room</motion.button>
            <motion.button className="btn lg glass" onClick={() => go("/restaurant")}
              whileHover={{ y: [0, 4, -4], scaleY: [1, 0.94, 1.03], transition: { duration: 0.35, times: [0, 0.3, 1] } }}
              whileTap={{ scale: 0.9, scaleY: 0.82, scaleX: 1.12 }}
              transition={TIMINGS.spring}>Explore the Menu</motion.button>
          </div>
          {/* glass booking bar */}
          <div className="book-bar glass">
            <div><label>Check-in</label><input type="date" defaultValue={new Date().toISOString().slice(0, 10)} /></div>
            <div><label>Check-out</label><input type="date" /></div>
            <div><label>Guests</label><input type="number" min="1" defaultValue="2" /></div>
            <button className="btn" onClick={() => go("/rooms")}>🔍 Search Rooms</button>
          </div>
        </div>
        <div className="scroll-hint">Scroll</div>
      </section>

      {/* ---- marquee ---- */}
      <div className="marquee">
        <div className="track">
          {[0, 1].map(k => (
            <React.Fragment key={k}>
              <span>अतिथि देवो भवः</span><span>✦</span><span>AC &amp; Non-AC Rooms</span><span>✦</span>
              <span>Chinese · Nepali · North &amp; South Indian Food</span><span>✦</span><span>Party Hall</span><span>✦</span>
              <span>Free Wi-Fi</span><span>✦</span><span>Home Delivery</span><span>✦</span><span>Guest Tour &amp; Travel Service</span><span>✦</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ---- manifesto ---- */}
      <section className="section">
        <Reveal className="sec-head"><span className="no">01</span><h2>Blessed Comfort, Honest Service</h2></Reveal>
        <Reveal delay={120}><p className="sec-lead">
          At the heart of Dhangadi Chauraha stands a house built on one belief — the guest is God.
          Under the blessing of Goddess Laxmi we offer clean rooms, honest food and a warm Nepali welcome,
          whether you stay one night or one month.
        </p></Reveal>
      </section>

      {/* ---- stats band ---- */}
      <div className="band">
        {[["Rooms & Suites", 20, "+"], ["Dishes on the Menu", 50, "+"], ["Years of Service", 10, "+"], ["Guest Care", 24, "/7"]].map(([l, n, s], i) => (
          <Reveal className="cell" variant="rv-zoom" delay={i * 110} key={l}>
            <div className="num"><Counter to={n} suffix={s} /></div>
            <div className="lbl">{l}</div>
          </Reveal>
        ))}
      </div>

      {/* ---- featured listings (live rooms, glass property cards) ---- */}
      <section className="section">
        <Reveal className="sec-head"><span className="no">02</span><h2>Featured Rooms & Suites</h2></Reveal>
        <Reveal delay={100}><p className="sec-lead">Live from our reception desk — green means you can book it this second.</p></Reveal>
        {/* stagger children + follow-through #5, slow-out #6, appeal #12 */}
        <motion.div className="grid c3" style={{ marginTop: 26 }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
          initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }}>
          {(roomData && roomData.rooms.length ? roomData.rooms.slice(0, 6) : []).map((r, i) => (
            <motion.div key={r.id}
              variants={{ hidden: { opacity: 0, y: 50, scale: 0.9 }, show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 240, damping: 18 } } }}
              whileHover={{ y: -10, scale: 1.02, boxShadow: "0 26px 60px rgba(0,0,0,.55)", transition: TIMINGS.normal }}>
              <div className="glass listing">
                <div className="lph">
                  {hasPhoto ? <img src="/img/hotel.jpg" alt={"Room " + r.number} style={{ objectPosition: `${(i * 37) % 100}% ${25 + (i * 23) % 50}%` }} /> : <span>🛏️</span>}
                  <span className="price-badge">{NPR(r.price)} / night</span>
                  <span className={"status-chip avail-dot " + (r.booked ? "booked" : "free")}>{r.booked ? "Booked" : "Available"}</span>
                </div>
                <div className="lbody">
                  <h4>Room {r.number} · {r.type}</h4>
                  <div className="lmeta">
                    <span>🏛 {r.floor || "—"}</span>
                    {r.special ? <span>✨ {r.special}</span> : <span>🛏 Comfortable stay</span>}
                    <span>📶 Free Wi-Fi</span>
                  </div>
                  <button className="btn sm" style={{ width: "100%" }} disabled={r.booked} onClick={() => go("/rooms")}>
                    {r.booked ? "Not Available" : "Book This Room →"}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          {(!roomData || !roomData.rooms.length) && (
            <div className="empty" style={{ gridColumn: "1 / -1" }}>Rooms appear here live once reception adds them.</div>
          )}
        </motion.div>
        {roomData && roomData.rooms.length > 6 && (
          <Reveal className="flex mt" style={{ justifyContent: "center" }}>
            <button className="btn ghost" onClick={() => go("/rooms")}>View all {roomData.rooms.length} rooms →</button>
          </Reveal>
        )}
      </section>

      {/* ---- trust strip ---- */}
      <Reveal>
        <div className="trust section" style={{ paddingTop: 0, paddingBottom: 30 }}>
          <div className="glass tbadge">🏆 <span><b>10+ years</b> of hospitality</span></div>
          <div className="glass tbadge">⭐ <span><b>Trusted</b> by thousands of guests</span></div>
          <div className="glass tbadge">🔐 <span><b>Secure QR</b> payments</span></div>
          <div className="glass tbadge">🕐 <span><b>24/7</b> reception desk</span></div>
        </div>
      </Reveal>

      {/* ---- experience cards ---- */}
      <section className="section">
        <Reveal className="sec-head"><span className="no">03</span><h2>The Experience</h2></Reveal>
        <div className="grid c4" style={{ marginTop: 26 }}>
          {[
            ["🛏️", "Comfortable Rooms", "AC & Non-AC rooms for every budget, with live availability and instant online booking."],
            ["🍛", "Restaurant & Bar", "Nepali, Chinese, North & South Indian — cooked fresh, served hot, straight from our kitchen."],
            ["📱", "Scan & Pay", "Pay by QR from any banking app at checkout, or simply pay cash at reception."],
            ["🎉", "Party Hall", "Celebrations, meetings and family functions — with food and service handled by us."]
          ].map(([ic, t, d], i) => (
            <Reveal key={t} delay={i * 110}>
              <Tilt className="card feature" >
                <div className="icon3d pop">{ic}</div>
                <h4 className="pop">{t}</h4>
                <p>{d}</p>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---- virtual tour ---- */}
      <section className="section">
        <Reveal className="sec-head"><span className="no">04</span><h2>Virtual Tour</h2></Reveal>
        <Reveal delay={100}><p className="sec-lead">Tap play for a guided camera walk of our home — before you even arrive.</p></Reveal>
        <Reveal variant="rv-zoom" delay={150}><div className="mt"><VirtualTour hasPhoto={hasPhoto} /></div></Reveal>
      </section>

      {/* ---- split rows ---- */}
      <section className="section">
        <div className="split">
          <Reveal variant="rv-left" className="txt">
            <h3>Book in seconds, sleep in peace</h3>
            <p>See every floor and every room live — green means available right now. Choose your room,
              enter your name and number, pay by QR or cash, and your booking lands at our reception desk
              the same second, with your receipt ready to download.</p>
            <button className="btn mt" onClick={() => go("/rooms")}>See Available Rooms →</button>
          </Reveal>
          <Reveal variant="rv-right"><Tilt className="art"><ArtBed /></Tilt></Reveal>
        </div>
        <div className="split" style={{ marginTop: 60 }}>
          <Reveal variant="rv-left" className="art-first"><Tilt className="art"><ArtKitchen /></Tilt></Reveal>
          <Reveal variant="rv-right" className="txt">
            <h3>From our kitchen, straight to you</h3>
            <p>Order from the table or from home — the kitchen receives it instantly with a bell.
              Watch your order move from received to making to ready. Veg and non-veg marked clearly,
              always cooked fresh.</p>
            <button className="btn mt" onClick={() => go("/restaurant")}>Order Food →</button>
          </Reveal>
        </div>
      </section>

      {/* ---- team / hosts ---- */}
      <section className="section">
        <Reveal className="sec-head"><span className="no">05</span><h2>Meet Your Hosts</h2></Reveal>
        <Reveal delay={100}><p className="sec-lead">Real people, always reachable — the family behind your stay.</p></Reveal>
        <div className="grid c3" style={{ marginTop: 26 }}>
          {[
            ["🙏", "Dipendra Upadhayay", "Owner & Manager", HOTEL.phone, HOTEL.phoneHref],
            ["🛎️", "Reception Desk", "Bookings · 24/7", HOTEL.phone, HOTEL.phoneHref],
            ["👨‍🍳", "Kitchen Team", "Restaurant & Bar", "Order online anytime", "#/restaurant"]
          ].map(([ic, n, role, c, href], i) => (
            <Reveal key={n} delay={i * 100}>
              <div className="glass team-card">
                <div className="tavatar">{ic}</div>
                <h4>{n}</h4>
                <div className="role">{role}</div>
                <a href={href}>{c}</a>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---- location ---- */}
      <section className="section">
        <Reveal className="sec-head"><span className="no">06</span><h2>Find Us</h2></Reveal>
        <Reveal delay={100}>
          <div className="map-wrap mt">
            <iframe src={HOTEL.mapEmbed} loading="lazy" title="Hotel Jai Laxmi location" allowFullScreen></iframe>
          </div>
        </Reveal>
        <Reveal delay={200} className="flex mt" style={{ justifyContent: "center" }}>
          <a className="btn" href={HOTEL.mapLink} target="_blank" rel="noopener">🧭 Open in Google Maps</a>
          <a className="btn ghost" href={HOTEL.phoneHref}>☎ {HOTEL.phone}</a>
        </Reveal>
      </section>

      {/* ---- smart features (all live) ---- */}
      <section className="section">
        <Reveal className="sec-head"><span className="no">07</span><h2>Smart Features — Live Now</h2></Reveal>
        <Reveal delay={100}><p className="sec-lead">
          Every one of these works today at HOTEL JAI LAXMI AND LODGE. Tap a card to try it.
        </p></Reveal>
        <div className="grid c3" style={{ marginTop: 26 }}>
          {[
            ["🌐", "Online Booking Portal", "Book from anywhere with instant confirmation and live availability.", "/rooms", "Try it"],
            ["📲", "QR Menu", "Scan the table QR and the full menu opens on your phone instantly.", "/restaurant", "Open menu"],
            ["🛎️", "Self Check-in", "Have a booking? Check into your room from your phone — no queue.", "/checkin", "Check in"],
            ["🍽️", "Online Table Reservation", "Reserve your favourite table before you arrive.", "/reserve", "Reserve"]
          ].map(([ic, t, d, to, cta], i) => (
            <Reveal key={t} delay={i * 90}>
              <Tilt className="card feature" >
                <span className="pill p-ready" style={{ position: "absolute", top: 12, right: 12 }}>LIVE ✓</span>
                <div className="icon3d pop">{ic}</div>
                <h4 className="pop">{t}</h4>
                <p>{d}</p>
                <button className="btn sm mt" onClick={() => go(to)}>{cta} →</button>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---- contact form ---- */}
      <section className="section" style={{ maxWidth: 720 }}>
        <Reveal className="sec-head"><span className="no">08</span><h2>Talk To Us</h2></Reveal>
        <Reveal delay={100}>
          <div className="glass" style={{ padding: 26, marginTop: 20 }}>
            {msgSent ? (
              <p className="green" style={{ textAlign: "center", padding: 20 }}>🙏 Thank you! We will call you back very soon.</p>
            ) : (
              <>
                <div className="row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
                  <div className="f-input"><label>Your name</label><input placeholder="e.g. Ram Bahadur" /></div>
                  <div className="f-input"><label>Phone</label><input placeholder="98XXXXXXXX" /></div>
                </div>
                <div className="f-input"><label>Message</label><input placeholder="I want to book / ask about…" /></div>
                <div className="flex mt" style={{ justifyContent: "space-between" }}>
                  <a className="btn ghost" href={HOTEL.phoneHref}>☎ {HOTEL.phone}</a>
                  <button className="btn" onClick={() => setMsgSent(true)}>Send Message →</button>
                </div>
              </>
            )}
          </div>
        </Reveal>
      </section>

      {/* ---- final CTA ---- */}
      <section className="section" style={{ textAlign: "center", paddingBottom: 30 }}>
        <Reveal><h2 className="section-title">Ready for your stay?</h2><div className="divider" /></Reveal>
        <Reveal delay={140} className="cta flex" style={{ justifyContent: "center", marginTop: 20 }}>
          <button className="btn lg" onClick={() => go("/rooms")}>Book a Room</button>
          <button className="btn lg glass" onClick={() => go("/contact")}>Contact Us</button>
        </Reveal>
      </section>
    </div>
  );
}

/* ---------------- ROOMS (public booking) ---------------- */
function RoomsPage() {
  const [data] = useLive(() => api("/public/rooms"), ["rooms", "bookings", "floors", "booking"]);
  const [pick, setPick] = useState(null);
  if (!data) return <div className="empty">Loading rooms…</div>;
  const floors = data.floors.length ? data.floors : [{ id: "_", name: "Rooms" }];
  return (
    <div className="section">
      <h2 className="section-title">Room Booking</h2>
      <div className="divider" />
      <p className="section-sub">Live availability — green rooms can be booked right now</p>
      {data.rooms.length === 0 && <div className="empty">Rooms will appear here soon. Please check back or contact reception.</div>}
      {floors.map(f => {
        const rooms = data.rooms.filter(r => r.floorId === f.id || (f.id === "_" && !data.floors.find(x => x.id === r.floorId)));
        if (!rooms.length) return null;
        return (
          <div key={f.id} className="mb">
            <h3 style={{ fontFamily: "var(--font-display)", color: "var(--gold)", fontSize: 22, margin: "18px 0 12px" }}>🏛 {f.name}</h3>
            <div className="grid c3">
              {rooms.map((r, idx) => (
                <MCard className="card room-card" key={r.id} i={idx}>
                  <div className="room-head">
                    <div>
                      <div className="rnum">Room {r.number}</div>
                      <div className="rtype">{r.type}</div>
                    </div>
                    <span className={"status-chip " + (r.booked ? "booked" : "free")}>{r.booked ? "Booked" : "Available"}</span>
                  </div>
                  <div className="price">{NPR(r.price)} <span>/ night</span></div>
                  <div className="special">{r.special ? "✨ " + r.special : ""}</div>
                  <button className="btn mt" style={{ width: "100%" }} disabled={r.booked} onClick={() => setPick(r)}>
                    {r.booked ? "Not Available" : "Book This Room"}
                  </button>
                </MCard>
              ))}
            </div>
          </div>
        );
      })}
      {pick && <BookRoomModal room={pick} onClose={() => setPick(null)} />}
    </div>
  );
}

function nightsCalc(ci, co) {
  if (!ci || !co) return 1;
  const n = Math.round((new Date(co) - new Date(ci)) / 86400000);
  return Math.max(1, n || 1);
}

function BookRoomModal({ room, onClose, preset }) {
  const [f, setF] = useState({
    checkIn: (preset && preset.checkIn) || new Date().toISOString().slice(0, 10),
    checkOut: (preset && preset.checkOut) || "",
    address: "", persons: (preset && preset.persons) || 1, idPhoto: ""
  });
  const nights = nightsCalc(f.checkIn, f.checkOut);
  const total = nights * (Number(room.price) || 0);
  const proceed = () => {
    const cart = Cart.read();
    cart.booking = { roomId: room.id, roomNumber: room.number, roomType: room.type, price: room.price, nights, total, ...f };
    Cart.write(cart);
    onClose();
    go("/checkout");
  };
  return (
    <Modal title={`Book Room ${room.number} — ${room.type}`} onClose={onClose}>
      <p className="muted">{NPR(room.price)} / night {room.special ? " · ✨ " + room.special : ""}</p>
      <div className="row">
        <div><label>Check-in date</label><input type="date" value={f.checkIn} onChange={e => setF({ ...f, checkIn: e.target.value })} /></div>
        <div><label>Check-out date</label><input type="date" value={f.checkOut} min={f.checkIn} onChange={e => setF({ ...f, checkOut: e.target.value })} /></div>
      </div>
      <div className="row">
        <div><label>Number of persons</label><input type="number" min="1" value={f.persons} onChange={e => setF({ ...f, persons: e.target.value })} /></div>
        <div><label>Address</label><input value={f.address} onChange={e => setF({ ...f, address: e.target.value })} placeholder="Village / City" /></div>
      </div>
      <div className="mt">
        <PhotoInput camera value={f.idPhoto} onChange={p => setF({ ...f, idPhoto: p })}
          label="ID proof photo (citizenship / license) — camera or device" />
      </div>
      <div className="total-plate mt">
        <span className="lab">{nights} night{nights > 1 ? "s" : ""} × {NPR(room.price)}</span>
        <span className="amt">{NPR(total)}</span>
      </div>
      <div className="modal-actions">
        <button className="btn ghost" onClick={onClose}>Cancel</button>
        <button className="btn" onClick={proceed}>Continue to Checkout →</button>
      </div>
    </Modal>
  );
}

/* ---------------- VOICE ORDER (Web Speech API) ---------------- */
function VoiceOrder({ menu, onAdd }) {
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState("");
  const [result, setResult] = useState(null); // {added:[], missed:bool}
  const recRef = useRef(null);
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return (
    <div className="card mb" style={{ textAlign: "center" }}>
      <p className="muted">🎙️ Voice ordering needs <b>Google Chrome</b> or <b>Microsoft Edge</b>. Please open this site in Chrome to speak your order.</p>
    </div>
  );

  const numbers = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, एक: 1, दुई: 2, तीन: 3, चार: 4 };
  const start = () => {
    setResult(null); setHeard("");
    const rec = new SR();
    recRef.current = rec;
    rec.lang = "en-IN"; rec.interimResults = true; rec.maxAlternatives = 3;
    rec.onresult = ev => {
      const txt = Array.from(ev.results).map(r => r[0].transcript).join(" ");
      setHeard(txt);
      if (ev.results[ev.results.length - 1].isFinal) {
        const low = txt.toLowerCase();
        const added = [];
        menu.forEach(m => {
          const name = m.foodName.toLowerCase();
          if (low.includes(name) || name.split(" ").every(w => w.length > 2 && low.includes(w))) {
            let qty = 1;
            for (const [w, n] of Object.entries(numbers))
              if (low.includes(w + " " + name) || low.includes(name + " " + w)) qty = n;
            onAdd(m, qty);
            added.push(m.foodName + " × " + qty);
          }
        });
        setResult({ added, text: txt });
        setListening(false);
      }
    };
    rec.onerror = ev => {
      setListening(false);
      const msgs = {
        "not-allowed": "Microphone permission blocked — click the 🔒/🎙 icon in the address bar and ALLOW the microphone, then try again.",
        "service-not-allowed": "Microphone permission blocked — allow the mic in browser settings and try again.",
        "no-speech": "Didn't hear anything — tap the mic and speak clearly.",
        "audio-capture": "No microphone found on this device.",
        "network": "Voice recognition needs internet — check your connection."
      };
      setResult({ added: [], error: msgs[ev.error] || "Voice error (" + ev.error + ") — please try again." });
    };
    rec.onend = () => setListening(false);
    try { rec.start(); setListening(true); }
    catch (e) { setResult({ added: [], error: "Could not start the microphone — try again." }); }
  };
  const stop = () => { recRef.current && recRef.current.stop(); };

  return (
    <div className="card mb" style={{ textAlign: "center", border: "1px solid var(--gold-dim)" }}>
      <button className={"btn " + (listening ? "danger" : "")} onClick={listening ? stop : start}>
        {listening ? "⏹ Listening… tap to stop" : "🎙️ Voice Order — tap & speak"}
      </button>
      <p className="muted mt" style={{ fontSize: 13 }}>
        Say a dish name, e.g. <i>"two chicken momo and one dal bhat"</i>
      </p>
      {heard && listening && <p className="gold mt">"{heard}"</p>}
      {result && (
        result.added.length
          ? <p className="green mt">✓ Added to cart: {result.added.join(", ")}</p>
          : result.error
            ? <p className="red mt">⚠ {result.error}</p>
            : <p className="red mt">Heard "{result.text}" — no matching dish found. Try saying the exact dish name.</p>
      )}
    </div>
  );
}

/* ================ ROOMS — world-class luxury booking page ================ */
function roomMeta(r) {
  /* deterministic presentation details per room */
  const h = (String(r.number).split("").reduce((s, c) => s + c.charCodeAt(0), 0));
  const fam = /family|suite/i.test(r.type);
  const exec = /exec|premium|deluxe/i.test(r.type);
  return {
    rating: (4.5 + (h % 5) / 10).toFixed(1),
    reviews: 24 + (h % 90),
    size: fam ? "380 sq·ft" : exec ? "260 sq·ft" : "220 sq·ft",
    guests: fam ? 4 : 2,
    feats: fam
      ? ["🛏 Multiple Beds", "🛋 Living Area", "🍽 Dining Space", "📶 Fast Wi-Fi", "📺 Smart TV"]
      : exec
        ? ["🛏 King Bed", "❄ AC", "🧊 Mini Fridge", "💼 Work Desk", "🌅 Balcony View"]
        : ["🛏 King Bed", "❄ AC", "📶 Free Wi-Fi", "📺 Smart TV", "🚿 Hot Water"]
  };
}

function Stars({ v }) {
  return <span className="stars">{"★".repeat(Math.round(v))}<i>{"★".repeat(5 - Math.round(v))}</i></span>;
}

/* ---------- luxury booking widget ---------- */
const PROMOS = { JAILAXMI10: "10% OFF applied — direct booking reward!", WEEKEND20: "20% OFF weekend stay applied!", FAMILY: "Family package unlocked — free breakfast!" };

function BookingWidget({ q, setQ, data, onSearch }) {
  const today = new Date().toISOString().slice(0, 10);
  const [pop, setPop] = useState(null);        // "guests" | "type" | null
  const [promoState, setPromoState] = useState(null); // ok | bad | null
  const [busy, setBusy] = useState(false);
  const rooms = (data && data.rooms) || [];
  const types = [...new Set(rooms.map(r => r.type))];
  const guests = q.adults + q.children + (q.infants || 0);
  const nights = nightsCalc(q.checkIn, q.checkOut);
  const move = e => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100) + "%");
    e.currentTarget.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100) + "%");
  };
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); };
  const applyPromo = () => {
    if (!q.promo) { setPromoState(null); return; }
    setPromoState(PROMOS[q.promo.trim().toUpperCase()] ? "ok" : "bad");
  };
  const CntBtn = ({ k, d, min = 0, max = 12 }) => (
    <motion.button className="bw-cbtn" whileTap={{ scale: 0.8 }}
      onClick={() => setQ({ ...q, [k]: Math.min(max, Math.max(min, (q[k] || 0) + d)) })}>{d > 0 ? "+" : "−"}</motion.button>
  );
  const CntRow = ({ k, label: lb, sub, min = 0 }) => (
    <div className="bw-crow">
      <div><b>{lb}</b><span>{sub}</span></div>
      <div className="flex" style={{ gap: 10 }}>
        <CntBtn k={k} d={-1} min={min} />
        <AnimatePresence mode="popLayout">
          <motion.b key={q[k] || 0} className="bw-num"
            initial={{ y: -14, opacity: 0, scale: 1.3 }} animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 14, opacity: 0 }} transition={{ type: "spring", stiffness: 400, damping: 22 }}>
            {q[k] || 0}
          </motion.b>
        </AnimatePresence>
        <CntBtn k={k} d={1} min={min} />
      </div>
    </div>
  );
  const search = () => {
    setBusy(true); setPop(null);
    setTimeout(() => { setBusy(false); onSearch(); }, 700);
  };
  const typeInfo = t => {
    const rs = rooms.filter(r => r.type === t);
    return { from: Math.min(...rs.map(r => r.price)), free: rs.filter(r => !r.booked).length, photo: (rs.find(r => r.photos && r.photos[0]) || {}).photos };
  };

  return (
    <>
      <motion.div className="lux-search bw" onMouseMove={move}
        initial={{ opacity: 0, y: 48, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ delay: 0.4, type: "spring", stiffness: 170, damping: 20 }}>
        <span className="bw-reflect" aria-hidden="true" />

        {/* check-in */}
        <div className="bw-field">
          <label>🗓 Check-in</label>
          <input type="date" value={q.checkIn} min={today} onChange={e => setQ({ ...q, checkIn: e.target.value })} />
          <div className="bw-quick">
            <button onClick={() => setQ({ ...q, checkIn: today, checkOut: addDays(today, 1) })}>Tonight</button>
            <button onClick={() => setQ({ ...q, checkIn: today, checkOut: addDays(today, 2) })}>2 nights</button>
          </div>
        </div>

        {/* check-out */}
        <div className="bw-field">
          <label>🗓 Check-out</label>
          <input type="date" value={q.checkOut} min={addDays(q.checkIn, 1)} onChange={e => setQ({ ...q, checkOut: e.target.value })} />
          <div className="bw-quick"><span className="gold-tip">{nights} night{nights > 1 ? "s" : ""}</span></div>
        </div>

        {/* guests */}
        <div className="bw-field" style={{ position: "relative" }}>
          <label>👨‍👩‍👧 Guests</label>
          <button className="bw-select" onClick={() => setPop(pop === "guests" ? null : "guests")}>
            {guests} guest{guests > 1 ? "s" : ""} <span className="car">▾</span>
          </button>
          <AnimatePresence>
            {pop === "guests" && (
              <motion.div className="bw-pop" initial={{ opacity: 0, y: 10, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 320, damping: 24 }}>
                <CntRow k="adults" label="Adults" sub="13+ years" min={1} />
                <CntRow k="children" label="Children" sub="2–12 years" />
                <CntRow k="infants" label="Infants" sub="under 2 — stay free" />
                <button className="btn sm em" style={{ width: "100%", marginTop: 8 }} onClick={() => setPop(null)}>Done</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* room type */}
        <div className="bw-field" style={{ position: "relative" }}>
          <label>🛏 Room type</label>
          <button className="bw-select" onClick={() => setPop(pop === "type" ? null : "type")}>
            {q.type === "all" ? "All rooms" : q.type} <span className="car">▾</span>
          </button>
          <AnimatePresence>
            {pop === "type" && (
              <motion.div className="bw-pop wide" initial={{ opacity: 0, y: 10, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 320, damping: 24 }}>
                <button className={"bw-trow" + (q.type === "all" ? " on" : "")}
                  onClick={() => { setQ({ ...q, type: "all" }); setPop(null); }}>
                  <span className="bw-timg">🏨</span>
                  <span className="bw-tinfo"><b>All rooms</b><i>{rooms.length} rooms · {rooms.filter(r => !r.booked).length} available</i></span>
                </button>
                {types.map(t => {
                  const inf = typeInfo(t);
                  return (
                    <button key={t} className={"bw-trow" + (q.type === t ? " on" : "")}
                      onClick={() => { setQ({ ...q, type: t }); setPop(null); }}>
                      {inf.photo ? <img className="bw-timg" src={inf.photo[0]} /> : <span className="bw-timg">🛏</span>}
                      <span className="bw-tinfo">
                        <b>{t}</b>
                        <i>from {NPR(inf.from)} / night</i>
                      </span>
                      <span className={"pill " + (inf.free ? "p-ready" : "p-cancelled")}>{inf.free ? inf.free + " free" : "full"}</span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* promo */}
        <div className="bw-field">
          <label>🎁 Promo code</label>
          <motion.input placeholder="e.g. JAILAXMI10" value={q.promo}
            animate={promoState === "bad" ? { x: [0, -8, 8, -5, 5, 0] } : {}}
            transition={{ duration: 0.4 }}
            onChange={e => { setQ({ ...q, promo: e.target.value }); setPromoState(null); }}
            onBlur={applyPromo}
            className={promoState === "ok" ? "p-good" : promoState === "bad" ? "p-bad" : ""} />
          <div className="bw-quick">
            {promoState === "ok" && <motion.span className="promo-ok" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>✓ {PROMOS[q.promo.trim().toUpperCase()]}</motion.span>}
            {promoState === "bad" && <span className="promo-bad">✕ Invalid code — try JAILAXMI10</span>}
          </div>
        </div>

        {/* search */}
        <motion.button className="bw-go" onClick={search} disabled={busy}
          whileHover={{ y: -3, boxShadow: "0 18px 44px rgba(15,139,95,.45), 0 0 30px rgba(212,175,55,.35)" }}
          whileTap={{ scale: 0.95 }}>
          {busy
            ? <motion.span className="bw-spin" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}>◌</motion.span>
            : <>🔍 Check Availability <motion.span className="bw-arrow" animate={{ x: [0, 5, 0] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}>→</motion.span></>}
        </motion.button>
      </motion.div>
      {pop && <div className="bw-back" onClick={() => setPop(null)} />}
    </>
  );
}

function RoomsLuxe() {
  const [data] = useLive(() => api("/public/rooms"), ["rooms", "bookings", "floors", "booking"]);
  const [gal] = useLive(() => api("/public/gallery"), ["gallery"]);
  const today = new Date().toISOString().slice(0, 10);
  const [q, setQ] = useState({ checkIn: today, checkOut: "", adults: 2, children: 0, infants: 0, type: "all", promo: "" });
  const [onlyFree, setOnlyFree] = useState(false);
  const [pick, setPick] = useState(null);     // booking modal
  const [detail, setDetail] = useState(null); // details modal
  const [faqOpen, setFaqOpen] = useState(0);
  const [wish, setWish] = useState(() => { try { return JSON.parse(sessionStorage.getItem("hjl_wish")) || []; } catch { return []; } });
  const listRef = useRef(null);
  const toggleWish = id => {
    const w = wish.includes(id) ? wish.filter(x => x !== id) : [...wish, id];
    setWish(w); sessionStorage.setItem("hjl_wish", JSON.stringify(w));
  };
  const nights = nightsCalc(q.checkIn, q.checkOut);
  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
  const rise = { hidden: { opacity: 0, y: 34 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 240, damping: 22 } } };
  const Counter2 = ({ k, min = 0 }) => (
    <div className="cnt">
      <button onClick={() => setQ({ ...q, [k]: Math.max(min, q[k] - 1) })}>−</button>
      <b>{q[k]}</b>
      <button onClick={() => setQ({ ...q, [k]: q[k] + 1 })}>+</button>
    </div>
  );

  const rooms = data ? data.rooms.filter(r =>
    (q.type === "all" || r.type === q.type) && (!onlyFree || !r.booked)) : [];
  const types = data ? [...new Set(data.rooms.map(r => r.type))] : [];

  const faqs = [
    ["What are the check-in and check-out times?", "Check-in is from 12:00 PM and check-out is until 11:00 AM. Early check-in is free when the room is ready — use Self Check-in from our website to skip the queue."],
    ["What is the cancellation policy?", "Free cancellation until 24 hours before check-in. Call reception and we will release your room with a full refund of any online payment."],
    ["Is parking available?", "Yes — free, safe parking right at the hotel for cars, bikes and buses."],
    ["Do the rooms have Wi-Fi?", "Yes, high-speed Wi-Fi is free in every room and in the restaurant."],
    ["Which payment options do you accept?", "Cash, QR / mobile banking, and pay-at-hotel. Online guests can scan our bank QR at checkout."],
    ["Are pets allowed?", "Small well-behaved pets are welcome in ground-floor rooms — please mention it in special requests."]
  ];

  return (
    <div className="rh lux">
      {/* ---- hero ---- */}
      <section className="lux-hero">
        <motion.img src="/img/hotel.jpg" alt="Hotel Jai Laxmi rooms"
          initial={{ scale: 1.15 }} animate={{ scale: 1 }} transition={{ duration: 2, ease: "easeOut" }}
          onError={e => e.target.style.display = "none"} />
        <div className="lux-shade" />
        <div className="rays" aria-hidden="true" />
        <Particles n={16} />
        <motion.div className="lux-hero-txt"
          initial={{ opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <h1><LetterReveal text="Luxury Stay Starts Here" /></h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}>
            Experience premium comfort, delicious dining, and unforgettable hospitality.</motion.p>
          <div className="flex" style={{ justifyContent: "center" }}>
            <motion.button className="btn lg em" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.93 }}
              onClick={() => listRef.current && listRef.current.scrollIntoView({ behavior: "smooth" })}>Book Your Room</motion.button>
            <motion.button className="btn lg ghost-w" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.93 }}
              onClick={() => listRef.current && listRef.current.scrollIntoView({ behavior: "smooth" })}>Explore Rooms</motion.button>
          </div>
        </motion.div>
        {/* floating luxury booking widget */}
        <BookingWidget q={q} setQ={setQ} data={data}
          onSearch={() => { setOnlyFree(true); listRef.current && listRef.current.scrollIntoView({ behavior: "smooth" }); }} />
      </section>

      {/* ---- trust badges ---- */}
      <motion.div className="trust-mini"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09 } } }}
        initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }}>
        {["✔ Best Price Guaranteed", "✔ Free Cancellation", "✔ Instant Confirmation", "✔ Secure Payment", "✔ No Hidden Charges"].map(t => (
          <motion.span key={t} variants={{ hidden: { opacity: 0, y: 16, scale: 0.9 }, show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 18 } } }}>
            {t}
          </motion.span>
        ))}
      </motion.div>

      {/* ---- room listings ---- */}
      <section className="rh-sec" ref={listRef}>
        <Reveal><h2 className="rh-title">Rooms &amp; Suites</h2></Reveal>
        <Reveal delay={80}><p className="rh-sub">
          Live availability · {nights} night{nights > 1 ? "s" : ""} · {q.adults + q.children} guest{q.adults + q.children > 1 ? "s" : ""}
          {onlyFree && <button className="chip on" style={{ marginLeft: 10 }} onClick={() => setOnlyFree(false)}>showing available only ✕</button>}
        </p></Reveal>
        {!data ? (
          <div className="lux-grid">{[1, 2, 3, 4].map(k => <div className="skel" key={k} />)}</div>
        ) : rooms.length === 0 ? (
          <div className="empty">No rooms match — try another type or date, or contact reception at {HOTEL.phone}.</div>
        ) : (
          <motion.div className="lux-grid" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.05 }}>
            {rooms.map((r, i) => {
              const m = roomMeta(r);
              return (
                <motion.div className="lux-card" key={r.id} variants={rise} whileHover={{ y: -8 }}>
                  <div className="lph">
                    <img src={(r.photos && r.photos[0]) || "/img/hotel.jpg"} alt={"Room " + r.number}
                      style={(r.photos && r.photos[0]) ? null : { objectPosition: `${(i * 29) % 100}% ${20 + (i * 31) % 55}%` }}
                      onError={e => e.target.style.display = "none"} />
                    {r.photos && r.photos.length > 1 && <span className="ph-count">📷 {r.photos.length}</span>}
                    <button className={"heart" + (wish.includes(r.id) ? " on" : "")} onClick={() => toggleWish(r.id)}>♥</button>
                    <span className={"rh-status " + (r.booked ? "b" : "f")}>{r.booked ? "Booked" : "Available"}</span>
                    {r.special && <span className="deal">✨ {r.special}</span>}
                  </div>
                  <div className="lbody">
                    <div className="flex spread">
                      <h4>Room {r.number} · {r.type}</h4>
                      <span className="rate-chip"><Stars v={m.rating} /> {m.rating}</span>
                    </div>
                    <p className="meta">{m.size} · up to {m.guests} guests · {m.reviews} reviews</p>
                    <p className="desc">{m.feats.slice(0, 3).join("  ·  ")}</p>
                    <div className="flex spread mt">
                      <div className="price"><b>{NPR(r.price)}</b><span> / night</span>
                        {nights > 1 && <div className="tot">{NPR(r.price * nights)} for {nights} nights</div>}
                      </div>
                      <div className="flex" style={{ gap: 8 }}>
                        <button className="btn sm ghost" onClick={() => setDetail(r)}>👁 Details</button>
                        <motion.button className="btn sm em" disabled={r.booked} whileTap={{ scale: 0.9 }}
                          onClick={() => setPick(r)}>{r.booked ? "Full" : "Book Now"}</motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </section>

      {/* ---- statistics ---- */}
      <section className="rh-sec">
        <motion.div className="stat-band" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }}>
          {[[5000, "+", "Happy Guests"], [4.9, "★", "Guest Rating"], [data ? data.rooms.length : 20, "+", "Luxury Rooms"], [10, "+", "Years Experience"]].map(([n, s, l], i) => (
            <motion.div className="stat-cell" key={l} variants={rise}>
              <div className="num">{Number.isInteger(n) ? <Counter to={n} suffix={s} /> : <span>{n} {s}</span>}</div>
              <div className="lbl">{l}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ---- offers ---- */}
      <section className="rh-sec">
        <Reveal><h2 className="rh-title">Offers &amp; Packages</h2></Reveal>
        <motion.div className="offer-row" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
          {[["🔥", "20% OFF Weekend Stay", "Fri–Sun direct bookings", "HOT"], ["🍽", "Free Breakfast", "With every deluxe room", "FREE"],
            ["👨‍👩‍👧", "Family Package", "Suite + dinner for 4", "SAVE"], ["💼", "Business Stay", "Desk, Wi-Fi & early breakfast", "PRO"],
            ["❤️", "Honeymoon Offer", "Decorated room + candlelight dinner", "LOVE"]].map(([ic, t, d, rb]) => (
            <motion.div className="offer shine" key={t} variants={rise} whileHover={{ y: -6, rotate: -0.5 }}>
              <span className="ribbon">{rb}</span>
              <span>{ic}</span><b>{t}</b><p>{d}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ---- gallery (admin-managed, live) ---- */}
      <section className="rh-sec">
        <Reveal><h2 className="rh-title">Hotel Gallery</h2></Reveal>
        <Gallery imgs={
          (gal && gal.filter(g => g.category !== "restaurant").length)
            ? gal.filter(g => g.category !== "restaurant").map((g, i) => ({ src: g.photo, cap: g.caption, h: 150 + (i % 4) * 35 }))
            : [
              { src: "/img/hotel.jpg", cap: "Golden hour at Jai Laxmi", h: 240 },
              { src: "/img/hotel.jpg", cap: "Balcony floor", pos: "50% 20%", h: 170 },
              { src: "/img/hotel-night.jpg", cap: "Evenings at the hotel", h: 200 },
              { src: "/img/hotel.jpg", cap: "The restaurant front", pos: "50% 75%", h: 170 },
              { src: "/img/logo-small.jpg", cap: "Blessed by Goddess Laxmi", h: 210 },
              { src: "/img/hotel-night.jpg", cap: "Night lights", pos: "30% 40%", h: 170 }
            ]
        } />
      </section>

      {/* ---- reviews (live, admin-approved) ---- */}
      <ReviewsSection title="Guest Reviews" fallback={[
        ["R", "Rajan T.", "🇳🇵 Nepal", "Clean AC rooms and the dal bhat was just like home. Reception helped us at midnight — great service.", 5],
        ["P", "Priya S.", "🇮🇳 India", "Stayed 3 nights for business. Fast Wi-Fi, quiet room, easy QR payment. Will return.", 5],
        ["D", "David M.", "🇬🇧 UK", "Best value in Dhangadhi. The balcony view at sunset is beautiful and staff are very friendly.", 4]]} />

      {/* ---- FAQ ---- */}
      <section className="rh-sec" style={{ maxWidth: 800, margin: "0 auto" }}>
        <Reveal><h2 className="rh-title">Frequently Asked Questions</h2></Reveal>
        <div className="faq">
          {faqs.map(([question, a], k) => (
            <Reveal key={k} delay={k * 60}>
              <div className={"faq-item" + (faqOpen === k ? " open" : "")}>
                <button className="faq-q" onClick={() => setFaqOpen(faqOpen === k ? -1 : k)}>
                  {question}<span>{faqOpen === k ? "−" : "+"}</span>
                </button>
                <AnimatePresence>
                  {faqOpen === k && (
                    <motion.div className="faq-a" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                      {a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---- location ---- */}
      <section className="rh-sec" style={{ maxWidth: 1000, margin: "0 auto" }}>
        <Reveal><h2 className="rh-title">Location &amp; Getting Here</h2></Reveal>
        <Reveal delay={100}>
          <div className="map-wrap"><iframe src={HOTEL.mapEmbed} loading="lazy" title="map" allowFullScreen /></div>
          <div className="dist-row">
            {[["✈️", "Dhangadhi Airport", "≈ 6 km"], ["🚌", "Bus Park", "≈ 1 km"], ["🛕", "Behedababa Temple", "≈ 4 km"], ["🛒", "Main Bazaar", "at the door"]].map(([ic, t, d]) => (
              <div className="dist" key={t}><span>{ic}</span><b>{t}</b><p>{d}</p></div>
            ))}
          </div>
          <div className="flex" style={{ justifyContent: "center" }}>
            <a className="btn em" href={HOTEL.mapLink} target="_blank" rel="noopener">🧭 Navigate to Hotel</a>
          </div>
        </Reveal>
      </section>

      {/* ---- contact CTA ---- */}
      <section className="rh-sec" style={{ paddingBottom: 40 }}>
        <Reveal variant="rv-zoom">
          <div className="cta-banner" style={{ minHeight: 300 }}>
            <img src="/img/hotel-night.jpg" alt="" onError={e => e.target.style.display = "none"} />
            <div className="cta-overlay" />
            <div className="cta-inner">
              <h2>Ready for Your Perfect Stay?</h2>
              <div className="flex mt" style={{ justifyContent: "center" }}>
                <button className="btn lg" onClick={() => listRef.current.scrollIntoView({ behavior: "smooth" })}>Book Now</button>
                <a className="btn lg em" href={HOTEL.phoneHref}>☎ Call Reception</a>
                <a className="btn lg em" style={{ background: "linear-gradient(135deg,#25D366,#128C7E)" }}
                  href="https://wa.me/9779806465366" target="_blank" rel="noopener">💬 WhatsApp</a>
                <a className="btn lg ghost-w" href={HOTEL.mapLink} target="_blank" rel="noopener">🧭 Get Directions</a>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---- sticky mobile book bar ---- */}
      <div className="lux-sticky no-print">
        <div><b>{rooms.filter(r => !r.booked).length}</b> rooms available</div>
        <button className="btn em" onClick={() => listRef.current.scrollIntoView({ behavior: "smooth" })}>Book Now</button>
      </div>

      {/* ---- modals ---- */}
      {detail && (() => {
        const m = roomMeta(detail);
        return (
          <Modal title={`Room ${detail.number} — ${detail.type}`} onClose={() => setDetail(null)} wide>
            <PhotoSlider photos={detail.photos} fallback="/img/hotel.jpg" />
            <div className="flex spread mt">
              <span className="rate-chip"><Stars v={m.rating} /> {m.rating} · {m.reviews} reviews</span>
              <span className={"rh-status " + (detail.booked ? "b" : "f")} style={{ position: "static" }}>{detail.booked ? "Booked" : "Available"}</span>
            </div>
            <label>Room amenities</label>
            <div className="flex" style={{ gap: 8 }}>
              {m.feats.map(f2 => <span className="pill" key={f2}>{f2}</span>)}
            </div>
            <label>Price breakdown</label>
            <div className="brk">
              <div><span>{NPR(detail.price)} × {nights} night{nights > 1 ? "s" : ""}</span><b>{NPR(detail.price * nights)}</b></div>
              <div><span>Taxes &amp; fees</span><b className="green">Included ✓</b></div>
              <div className="gt"><span>Total</span><b>{NPR(detail.price * nights)}</b></div>
            </div>
            <p className="muted" style={{ fontSize: 13, marginTop: 10 }}>
              ✓ Free cancellation until 24h before check-in · ✓ Pay at hotel or QR · ✓ Instant confirmation with downloadable bill
            </p>
            <div className="modal-actions">
              <button className="btn ghost" onClick={() => setDetail(null)}>Close</button>
              <button className="btn em" disabled={detail.booked} onClick={() => { setPick(detail); setDetail(null); }}>Book Now →</button>
            </div>
          </Modal>
        );
      })()}
      {pick && <BookRoomModal room={pick} preset={{ checkIn: q.checkIn, checkOut: q.checkOut, persons: q.adults + q.children }} onClose={() => setPick(null)} />}
    </div>
  );
}

/* ---------------- RESTAURANT (public menu + cart) ---------------- */
function RestaurantPage() {
  const [menu] = useLive(() => api("/public/menu"), ["menu"]);
  const [cart, setCart] = useCart();
  const [filter, setFilter] = useState("all");
  if (!menu) return <div className="empty">Loading menu…</div>;
  const shown = menu.filter(m => filter === "all" || m.foodType === filter);
  const qtyOf = id => (cart.items.find(i => i.id === id) || {}).qty || 0;
  const setQty = (m, q) => {
    const items = cart.items.filter(i => i.id !== m.id);
    if (q > 0) items.push({ id: m.id, foodName: m.foodName, price: m.price, qty: q });
    setCart({ ...cart, items });
  };
  const count = cart.items.reduce((s, i) => s + i.qty, 0);
  return (
    <div className="section">
      <h2 className="section-title">Restaurant Menu</h2>
      <div className="divider" />
      <p className="section-sub">Open for everyone — dine in, or order online</p>
      <div className="flex" style={{ justifyContent: "center", marginBottom: 24 }}>
        {["all", "veg", "nonveg"].map(t => (
          <button key={t} className={"btn sm " + (filter === t ? "" : "ghost")} onClick={() => setFilter(t)}>
            {t === "all" ? "All" : t === "veg" ? "🟢 Veg" : "🔴 Non-Veg"}
          </button>
        ))}
      </div>
      {shown.length === 0 && <div className="empty">Menu is being prepared. Please check back soon!</div>}
      <div className="grid c4">
        {shown.map((m, idx) => (
          <MCard className="card menu-card" key={m.id} i={idx}>
            <div className="ph">{m.photo ? <img src={m.photo} alt={m.foodName} /> : <span className="noimg">🍛</span>}</div>
            <div className="body">
              <div className="fname"><span className={"veg-dot " + m.foodType}></span>{m.foodName}</div>
              <div className="fprice">{NPR(m.price)}</div>
              <div className="qty-row">
                {qtyOf(m.id) === 0
                  ? <button className="btn sm" style={{ width: "100%" }} onClick={() => setQty(m, 1)}>Add to Order</button>
                  : <>
                      <button onClick={() => setQty(m, qtyOf(m.id) - 1)}>−</button>
                      <span className="q">{qtyOf(m.id)}</span>
                      <button onClick={() => setQty(m, qtyOf(m.id) + 1)}>+</button>
                      <span className="muted" style={{ marginLeft: "auto" }}>{NPR(qtyOf(m.id) * m.price)}</span>
                    </>}
              </div>
            </div>
          </MCard>
        ))}
      </div>
      {count > 0 && (
        <div style={{ position: "sticky", bottom: 16, textAlign: "center", marginTop: 26 }}>
          <button className="btn" onClick={() => go("/checkout")}>🛒 Checkout {count} item{count > 1 ? "s" : ""} — {NPR(cart.items.reduce((s, i) => s + i.qty * i.price, 0))}</button>
        </div>
      )}
    </div>
  );
}

/* ================ RESTAURANT — luxury dining page ================ */
const CAT_ICONS = [["nepali", "🍛"], ["indian", "🍗"], ["chinese", "🍜"], ["fast", "🍕"], ["breakfast", "🥞"], ["dessert", "🍰"], ["beverage", "🍹"], ["drink", "🍹"], ["veg", "🥗"]];
const catIcon = c => (CAT_ICONS.find(([k]) => (c || "").toLowerCase().includes(k)) || [null, "🍽"])[1];
function dishMeta(m) {
  const h = m.foodName.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  return { rating: (4.3 + (h % 7) / 10).toFixed(1), orders: 40 + (h % 260) };
}

/* top-level so it is NOT re-created on every RestaurantLuxe render (that would
   remount every card and make the menu "refresh" on each search keystroke) */
function DishCard({ m, rise, setQuick, fav, toggleFav, qtyOf, setQty }) {
  const dm = dishMeta(m);
  return (
    <motion.div className="mfood" variants={rise} whileHover={{ y: -7 }}>
      <div className="mph" onClick={() => setQuick(m)}>
        {m.photo ? <img src={m.photo} alt={m.foodName} /> : <span className="noimg">{catIcon(m.category)}</span>}
        <button className={"heart" + (fav.includes(m.id) ? " on" : "")} onClick={e => { e.stopPropagation(); toggleFav(m.id); }}>♥</button>
        {m.chefSpecial && <span className="deal">👨‍🍳 Chef's Special</span>}
      </div>
      <div className="mbody">
        <div className="flex spread">
          <h4><span className={"veg-dot " + m.foodType}></span>{m.foodName}</h4>
          <span className="rate-chip">★ {dm.rating}</span>
        </div>
        <p className="meta">⏱ {m.prepTime || 15} min · {"🌶".repeat(m.spice || 0) || "not spicy"} · {dm.orders}+ orders</p>
        {m.desc && <p className="desc">{m.desc}</p>}
        <div className="flex spread mt">
          <b className="mprice">{NPR(m.price)}</b>
          {qtyOf(m.id) === 0
            ? <motion.button className="btn sm em" whileTap={{ scale: 0.9 }} onClick={() => setQty(m, 1)}>+ Add</motion.button>
            : <span className="cnt" style={{ padding: "3px 6px" }}>
                <button onClick={() => setQty(m, qtyOf(m.id) - 1)}>−</button>
                <b>{qtyOf(m.id)}</b>
                <button onClick={() => setQty(m, qtyOf(m.id) + 1)}>+</button>
              </span>}
        </div>
      </div>
    </motion.div>
  );
}

function RestaurantLuxe() {
  const [menu] = useLive(() => api("/public/menu"), ["menu"]);
  const [cart, setCart] = useCart();
  const [f, setF] = useState({ q: "", type: "all", cat: "all", sort: "pop" });
  const [quick, setQuick] = useState(null);
  const [tour, setTour] = useState(false);
  const [gal] = useLive(() => api("/public/gallery"), ["gallery"]);
  const [content] = useLive(() => api("/public/content"), ["content"]);
  const C = content || {};
  const R = C.restaurant || {};
  const [fav, setFav] = useState(() => { try { return JSON.parse(sessionStorage.getItem("hjl_fav")) || []; } catch { return []; } });
  const menuRef = useRef(null);
  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
  const rise = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 250, damping: 22 } } };

  const qtyOf = id => ((cart.items || []).find(i => i.id === id) || {}).qty || 0;
  const setQty = (m, qn) => {
    const items = cart.items.filter(i => i.id !== m.id);
    if (qn > 0) items.push({ id: m.id, foodName: m.foodName, price: m.price, qty: qn });
    setCart({ ...cart, items });
  };
  const toggleFav = id => {
    const w = fav.includes(id) ? fav.filter(x => x !== id) : [...fav, id];
    setFav(w); sessionStorage.setItem("hjl_fav", JSON.stringify(w));
  };
  const count = (cart.items || []).reduce((s, i) => s + i.qty, 0);

  if (!menu) return (
    <div className="rh lux"><section className="rh-sec" style={{ paddingTop: 90 }}>
      <div className="lux-grid">{[1, 2, 3, 4].map(k => <div className="skel" key={k} style={{ height: 260 }} />)}</div>
    </section></div>
  );

  const cats = [...new Set(menu.map(m => m.category || "House Favourites"))];
  let shown = menu.filter(m =>
    (f.type === "all" || m.foodType === f.type) &&
    (f.cat === "all" || (m.category || "House Favourites") === f.cat) &&
    (!f.q || m.foodName.toLowerCase().includes(f.q.toLowerCase())));
  if (f.sort === "lo") shown = [...shown].sort((a, b) => a.price - b.price);
  if (f.sort === "hi") shown = [...shown].sort((a, b) => b.price - a.price);
  if (f.sort === "pop") shown = [...shown].sort((a, b) => dishMeta(b).orders - dishMeta(a).orders);
  const specials = menu.filter(m => m.chefSpecial);
  const dishProps = { rise, setQuick, fav, toggleFav, qtyOf, setQty };

  return (
    <div className="rh lux">
      {/* ---- hero ---- */}
      <section className="res-hero">
        <div className="res-hero-bg" />
        {R.heroVideo
          ? <video className="hero-video" autoPlay muted loop playsInline poster={R.heroPhoto || ""} src={R.heroVideo}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }} />
          : R.heroPhoto
            ? <img src={R.heroPhoto} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }} />
            : null}
        <Particles n={12} />
        <motion.div className="lux-hero-txt" initial={{ opacity: 0, y: 34 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <motion.span className="hero-badge" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 260, damping: 14 }}>★★★★★ 5-Star Dining Experience</motion.span>
          <div className="res-plate-wrap">
            <span className="steam s1" /><span className="steam s2" /><span className="steam s3" />
            <motion.span className="res-plate" animate={{ rotate: [0, 6, -6, 0], y: [0, -8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>🍛</motion.span>
          </div>
          <h1><LetterReveal text={R.heroTitle || "Experience Fine Dining Like Never Before"} /></h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}>
            {R.heroSubtitle || "Traditional Nepali Hospitality blended with Modern Luxury Dining."}</motion.p>
          <div className="flex" style={{ justifyContent: "center" }}>
            <motion.button className="btn lg em" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.93 }} onClick={() => go("/reserve")}>Reserve Your Table</motion.button>
            <motion.button className="btn lg ghost-w" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.93 }}
              onClick={() => menuRef.current && menuRef.current.scrollIntoView({ behavior: "smooth" })}>Explore Menu</motion.button>
            <motion.button className="btn lg ghost-w" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.93 }}
              onClick={() => setTour(true)}>▶ Watch Restaurant Tour</motion.button>
          </div>
        </motion.div>
      </section>
      {tour && <CinematicTour onClose={() => setTour(false)} />}

      {/* ---- featured categories ---- */}
      <section className="rh-sec">
        <Reveal><h2 className="rh-title">Explore Our Kitchen</h2></Reveal>
        <motion.div className="cat-row" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
          <motion.button className={"cat-card" + (f.cat === "all" ? " on" : "")} variants={rise} whileHover={{ y: -6 }}
            onClick={() => setF({ ...f, cat: "all" })}>
            <span>🍽</span><b>All Dishes</b><p>{menu.length} items</p>
          </motion.button>
          {cats.map(c => (
            <motion.button className={"cat-card" + (f.cat === c ? " on" : "")} variants={rise} whileHover={{ y: -6 }} key={c}
              onClick={() => { setF({ ...f, cat: c }); menuRef.current && menuRef.current.scrollIntoView({ behavior: "smooth" }); }}>
              <span>{catIcon(c)}</span><b>{c}</b><p>{menu.filter(m => (m.category || "House Favourites") === c).length} dishes</p>
            </motion.button>
          ))}
        </motion.div>
      </section>

      {/* ---- today's special carousel ---- */}
      {specials.length > 0 && (
        <section className="rh-sec">
          <Reveal><h2 className="rh-title">👨‍🍳 Today's Special</h2></Reveal>
          <div className="spec-row">
            <motion.div className="spec-track" animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: Math.max(14, specials.length * 6), repeat: Infinity, ease: "linear" }}>
              {[...specials, ...specials].map((m, k) => (
                <div className="spec-card" key={k} onClick={() => setQuick(m)}>
                  {m.photo ? <img src={m.photo} alt={m.foodName} /> : <span className="noimg">{catIcon(m.category)}</span>}
                  <div><b>{m.foodName}</b><p>{NPR(m.price)}</p></div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ---- digital menu ---- */}
      <section className="rh-sec" ref={menuRef}>
        <Reveal><h2 className="rh-title">Digital Menu</h2></Reveal>
        <div className="menu-bar">
          <input className="msearch" placeholder="🔍 Search dishes…" value={f.q} onChange={e => setF({ ...f, q: e.target.value })} />
          {["all", "veg", "nonveg"].map(t => (
            <button key={t} className={"chip" + (f.type === t ? " on" : "")} onClick={() => setF({ ...f, type: t })}>
              {t === "all" ? "All" : t === "veg" ? "🟢 Veg" : "🔴 Non-Veg"}
            </button>
          ))}
          <select value={f.sort} onChange={e => setF({ ...f, sort: e.target.value })} style={{ width: "auto" }}>
            <option value="pop">Most popular</option>
            <option value="lo">Price: low → high</option>
            <option value="hi">Price: high → low</option>
          </select>
        </div>
        {shown.length === 0
          ? <div className="empty">No dishes match — try another search or category.</div>
          : <motion.div className="mfood-grid" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.03 }}>
              {shown.map(m => <DishCard key={m.id} m={m} {...dishProps} />)}
            </motion.div>}
      </section>

      {/* ---- facilities ---- */}
      <section className="rh-sec">
        <Reveal><h2 className="rh-title">Dining Facilities</h2></Reveal>
        <motion.div className="rh-benefits" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }}>
          {(C.facilities && C.facilities.length
            ? C.facilities.map(x => [x.icon || "✨", x.name, x.id])
            : [["📶", "Free Wi-Fi"], ["❄", "AC Dining"], ["👨‍👩‍👧", "Family Seating"], ["🚪", "Private Cabin"], ["🚗", "Parking"], ["💳", "Digital Payment"], ["🛵", "Home Delivery"], ["🥡", "Takeaway"]].map(([ic, t]) => [ic, t, t])
          ).map(([ic, t, k]) => (
            <motion.div className="rh-benefit" key={k} variants={rise} whileHover={{ y: -6 }}>
              <span className="bic">{ic}</span><h5>{t}</h5>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ---- meet our kitchen chef (admin-managed) ---- */}
      {C.chefs && C.chefs.length > 0 && (
        <section className="rh-sec">
          <Reveal><h2 className="rh-title">Meet Our Kitchen Chef</h2></Reveal>
          <motion.div className="offer-row" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
            {C.chefs.map(ch => (
              <motion.div className="offer" key={ch.id} variants={rise} whileHover={{ y: -6 }} style={{ textAlign: "center" }}>
                {ch.photo ? <img src={ch.photo} alt={ch.name} style={{ width: 100, height: 100, objectFit: "cover", borderRadius: "50%", margin: "0 auto 10px", display: "block" }} /> : <span style={{ fontSize: 46 }}>👨‍🍳</span>}
                <b>{ch.name}</b>
                {ch.role && <p className="gold" style={{ margin: "2px 0" }}>{ch.role}</p>}
                {ch.desc && <p className="muted" style={{ fontSize: 13 }}>{ch.desc}</p>}
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}
      {/* ---- meet our chef (default) ---- */}
      {!(C.chefs && C.chefs.length) && (
      <section className="rh-sec">
        <div className="chef-sec">
          <Reveal variant="rv-left">
            <div className="chef-art">
              <span className="chef-ic">👨‍🍳</span>
              <span className="steam s1" style={{ left: "42%" }} /><span className="steam s2" style={{ left: "52%" }} />
            </div>
          </Reveal>
          <Reveal variant="rv-right">
            <div className="chef-txt">
              <h2 className="rh-title" style={{ textAlign: "left", marginBottom: 12 }}>Meet Our Kitchen</h2>
              <p>Our head chef and kitchen family have been cooking for Dhangadhi for over a decade —
                from morning sel-roti and chiya to midnight thali for tired travellers. Every dish is made
                fresh, on order, with local vegetables from the bazaar at our doorstep.</p>
              <div className="chef-stats">
                <div><b><Counter to={15} suffix="+" /></b><span>Years Experience</span></div>
                <div><b><Counter to={menu.length} suffix="+" /></b><span>Dishes on Menu</span></div>
                <div><b><Counter to={200} suffix="+" /></b><span>Plates Every Day</span></div>
              </div>
              <button className="btn em mt" onClick={() => menuRef.current.scrollIntoView({ behavior: "smooth" })}>Taste the Signatures →</button>
            </div>
          </Reveal>
        </div>
      </section>
      )}

      {/* ---- celebrate with us (admin-managed with defaults) ---- */}
      <section className="rh-sec">
        <Reveal><h2 className="rh-title">Celebrate With Us</h2></Reveal>
        <motion.div className="offer-row" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
          {(C.celebrate && C.celebrate.length
            ? C.celebrate.map(e => [e.photo || "🎉", e.name, e.desc, e.id, !!e.photo])
            : [["🎂", "Birthday Party", "Cake, decoration & music"], ["💼", "Corporate Dinner", "Private cabin + projector"],
              ["💍", "Wedding Reception", "Party hall up to 200 guests"], ["🥂", "Anniversary", "Candlelight table for two"],
              ["🎉", "Private Party", "Custom menu & DJ friendly"]].map(([ic, t, d]) => [ic, t, d, t, false])
          ).map(([ic, t, d, k, isImg]) => (
            <motion.div className="offer shine" key={k} variants={rise} whileHover={{ y: -6 }}>
              {isImg ? <img src={ic} alt={t} style={{ width: "100%", height: 110, objectFit: "cover", borderRadius: 10, marginBottom: 8 }} /> : <span>{ic}</span>}
              <b>{t}</b><p>{d}</p>
              <button className="btn sm em mt" onClick={() => go("/reserve")}>Book Event</button>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ---- gallery: admin restaurant photos + real dish photos ---- */}
      {(((gal || []).filter(g => g.category === "restaurant").length) + menu.filter(m => m.photo).length) >= 3 && (
        <section className="rh-sec">
          <Reveal><h2 className="rh-title">From Our Kitchen</h2></Reveal>
          <Gallery imgs={[
            ...(gal || []).filter(g => g.category === "restaurant").map((g, i) => ({ src: g.photo, cap: g.caption, h: 170 + (i % 3) * 40 })),
            ...menu.filter(m => m.photo).slice(0, 10).map((m, i) => ({ src: m.photo, cap: m.foodName, h: 150 + (i % 3) * 45 }))
          ]} />
        </section>
      )}

      {/* ---- reviews (live, admin-approved) ---- */}
      <ReviewsSection fallback={[
        ["S", "Sunita K.", "🇳🇵 Nepal", "The thali here tastes like home. Big portions, fresh and hot every time.", 5],
        ["A", "Amit R.", "🇮🇳 India", "Ordered from the room by phone — food arrived in 15 minutes, still steaming. Chowmein is excellent.", 5],
        ["J", "James W.", "🇦🇺 Australia", "Great mix of Nepali and Chinese dishes. Clean AC dining hall, friendly waiters.", 4]]} />

      {/* ---- reserve CTA ---- */}
      <section className="rh-sec" style={{ paddingBottom: 40 }}>
        <Reveal variant="rv-zoom">
          <div className="cta-banner" style={{ minHeight: 280 }}>
            <img src="/img/hotel-night.jpg" alt="" onError={e => e.target.style.display = "none"} />
            <div className="cta-overlay" />
            <div className="cta-inner">
              <h2>A Table Is Waiting For You</h2>
              <p>Reserve now — indoor family dining, private cabins and party hall available.</p>
              <div className="flex" style={{ justifyContent: "center" }}>
                <button className="btn lg em" onClick={() => go("/reserve")}>🍽 Reserve Table</button>
                <a className="btn lg ghost-w" href={HOTEL.phoneHref}>☎ Call Now</a>
                <a className="btn lg em" style={{ background: "linear-gradient(135deg,#25D366,#128C7E)" }}
                  href="https://wa.me/9779806465366" target="_blank" rel="noopener">💬 WhatsApp</a>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---- floating cart ---- */}
      <AnimatePresence>
        {count > 0 && (
          <motion.div className="cart-float no-print" initial={{ y: 90, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 90, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}>
            <span><b>{count}</b> item{count > 1 ? "s" : ""} · {NPR((cart.items || []).reduce((s, i) => s + i.qty * i.price, 0))}</span>
            <button className="btn em" onClick={() => go("/checkout")}>Checkout →</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- quick view ---- */}
      {quick && (() => {
        const dm = dishMeta(quick);
        return (
          <Modal title={quick.foodName} onClose={() => setQuick(null)}>
            <div className="det-ph" style={{ height: 190 }}>
              {quick.photo ? <img src={quick.photo} alt={quick.foodName} /> : <div className="mph-big">{catIcon(quick.category)}</div>}
            </div>
            <div className="flex spread mt">
              <span className="rate-chip"><Stars v={dm.rating} /> {dm.rating} · {dm.orders}+ orders</span>
              <span className="pill">{quick.foodType === "veg" ? "🟢 Veg" : "🔴 Non-Veg"}</span>
            </div>
            <p className="muted mt">{quick.desc || "Cooked fresh in our kitchen with local ingredients."}</p>
            <div className="flex mt" style={{ gap: 8, flexWrap: "wrap" }}>
              <span className="pill">⏱ {quick.prepTime || 15} min</span>
              <span className="pill">{"🌶".repeat(quick.spice || 0) || "Not spicy"}</span>
              {quick.category && <span className="pill">{catIcon(quick.category)} {quick.category}</span>}
              {quick.chefSpecial && <span className="pill p-ready">👨‍🍳 Chef's Special</span>}
            </div>
            <div className="total-plate mt">
              <span className="lab">Price</span><span className="amt" style={{ fontSize: 24 }}>{NPR(quick.price)}</span>
            </div>
            <div className="modal-actions">
              <button className="btn ghost" onClick={() => setQuick(null)}>Close</button>
              <button className="btn em" onClick={() => { setQty(quick, qtyOf(quick.id) + 1); setQuick(null); }}>+ Add to Order</button>
            </div>
          </Modal>
        );
      })()}
    </div>
  );
}

/* ---------------- ABOUT ---------------- */
function AboutPage() {
  return (
    <div className="section" style={{ maxWidth: 860 }}>
      <h2 className="section-title">About Us</h2>
      <div className="divider" />
      <Reveal variant="rv-zoom">
        <div className="showcase mb">
          <img src="/img/hotel.jpg" alt="Hotel Jai Laxmi building" onError={e => e.target.parentNode.remove()} />
          <div className="cap"><h3>Dhangadi Chauraha, Sudurpaschim</h3><p>Restaurant · Bar · Lodge · Party Hall</p></div>
        </div>
      </Reveal>
      <div className="card" style={{ padding: 34, textAlign: "center" }}>
        <LogoImg style={{ width: 130, borderRadius: 20, marginBottom: 18 }} />
        <p style={{ fontSize: 16.5, lineHeight: 1.8, color: "var(--text)" }}>
          होटल जय लक्ष्मी &amp; लज (HOTEL JAI LAXMI AND LODGE) is a family-run hotel and restaurant
          named in honour of <b className="gold">Goddess Laxmi</b>, the deity of prosperity and well-being.
          We offer clean, comfortable rooms and a kitchen that serves fresh veg and non-veg dishes all day.
        </p>
        <p style={{ fontSize: 16.5, lineHeight: 1.8, color: "var(--muted)", marginTop: 16 }}>
          Whether you are a traveller looking for a peaceful night's stay or a local guest joining us for a meal,
          our doors are open. <b className="gold">अतिथि देवो भवः</b> — the guest is God.
        </p>
        <div className="flex mt" style={{ justifyContent: "center" }}>
          <button className="btn" onClick={() => go("/rooms")}>Book a Room</button>
          <button className="btn ghost" onClick={() => go("/restaurant")}>See the Menu</button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- CONTACT ---------------- */
function ContactPage() {
  const [sent, setSent] = useState(false);
  return (
    <div className="section" style={{ maxWidth: 900 }}>
      <h2 className="section-title">Contact Us</h2>
      <div className="divider" />
      <div className="contact-tiles mb">
        {[
          ["☎", "Call Us", <a href={HOTEL.phoneHref} key="p">{HOTEL.phone}</a>],
          ["📍", "Visit Us", <a href={HOTEL.mapLink} target="_blank" rel="noopener" key="l">{HOTEL.location}</a>],
          ["✉", "Email Us", <a href={"mailto:" + HOTEL.email} key="e" style={{ wordBreak: "break-all" }}>{HOTEL.email}</a>]
        ].map(([ic, t, body], i) => (
          <Reveal delay={i * 100} key={t}>
            <Tilt className="card ctile"><div className="icon3d pop" style={{ width: 60, height: 60, fontSize: 28 }}>{ic}</div><h5 className="pop">{t}</h5><p>{body}</p></Tilt>
          </Reveal>
        ))}
      </div>
      <Reveal>
        <div className="map-wrap mb">
          <iframe src={HOTEL.mapEmbed} loading="lazy" title="Hotel Jai Laxmi map" allowFullScreen></iframe>
        </div>
        <div className="flex mb" style={{ justifyContent: "center" }}>
          <a className="btn" href={HOTEL.mapLink} target="_blank" rel="noopener">🧭 Open in Google Maps</a>
        </div>
      </Reveal>
      <Reveal>
        <div className="card" style={{ maxWidth: 560, margin: "0 auto" }}>
          <h4 className="gold" style={{ marginBottom: 4 }}>💬 Send a Message</h4>
          {sent ? <p className="green mt">🙏 Thank you! We will contact you soon.</p> : (
            <>
              <label>Your name</label><input id="c_n" />
              <label>Phone</label><input id="c_p" />
              <label>Message</label><textarea rows="3" id="c_m" />
              <button className="btn mt" style={{ width: "100%" }} onClick={() => setSent(true)}>Send</button>
            </>
          )}
        </div>
      </Reveal>
    </div>
  );
}

/* load Razorpay Checkout only when needed */
function loadRazorpay() {
  return new Promise(resolve => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

/* ---------------- CHECKOUT ---------------- */
function CheckoutPage() {
  const [cart, setCart] = useCart();
  const [f, setF] = useState(() => { const u = Auth.user; const cust = u && u.role === "customer"; return { name: (cust && u.name) || "", phone: (cust && u.phone) || "", table: "", tableId: "", paymentMethod: "cash" }; });
  const [tables] = useLive(() => api("/public/tables"), ["tables"]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(null); // {booking, order}
  const [qr, setQr] = useState(null);

  const foodTotal = cart.items.reduce((s, i) => s + i.qty * i.price, 0);
  const roomTotal = cart.booking ? Number(cart.booking.total !== undefined ? cart.booking.total : cart.booking.price) : 0;
  const total = foodTotal + roomTotal;

  useEffect(() => {
    if (f.paymentMethod === "online" && total > 0)
      api("/public/qr?amount=" + total).then(setQr).catch(() => setQr(null));
  }, [f.paymentMethod, total]);

  const pay = async () => {
    setErr("");
    if (!f.name.trim() || !f.phone.trim()) { setErr("Please enter your name and phone number."); return; }
    setBusy(true);
    try {
      const result = {};
      if (cart.booking)
        result.booking = await api("/public/bookings", { method: "POST", body: { ...cart.booking, name: f.name, phone: f.phone, paymentMethod: f.paymentMethod } });
      if (cart.items.length)
        result.order = await api("/public/orders", { method: "POST", body: { items: cart.items, name: f.name, phone: f.phone, table: f.table, tableId: f.tableId, paymentMethod: f.paymentMethod } });
      setCart({ items: [], booking: null });
      sessionStorage.setItem("hjl_last_order", JSON.stringify(result));
      go("/confirmation"); // auto-redirect to the confirmation / bill page after payment
      return;
    } catch (e) { setErr(e.message); }
    setBusy(false);
  };

  /* eSewa: backend computes the amount, signs it, and we POST-redirect to eSewa.
     The booking/order is created only AFTER eSewa verifies the payment. */
  const payEsewa = async () => {
    setErr("");
    if (!f.name.trim() || !f.phone.trim()) { setErr("Please enter your name and phone number."); return; }
    setBusy(true);
    try {
      const r = await api("/public/esewa/initiate", { method: "POST", body: { booking: cart.booking, items: cart.items, name: f.name, phone: f.phone } });
      const form = document.createElement("form");
      form.method = "POST"; form.action = r.url; form.style.display = "none";
      Object.entries(r.fields).forEach(([k, v]) => {
        const i = document.createElement("input"); i.type = "hidden"; i.name = k; i.value = v; form.appendChild(i);
      });
      document.body.appendChild(form);
      form.submit(); // browser leaves for eSewa; cart is cleared on the success page
    } catch (e) { setErr(e.message); setBusy(false); }
  };

  /* Razorpay: backend creates the order + computes the amount, we open Checkout,
     then the backend verifies the signature before confirming the booking. */
  const payRazorpay = async () => {
    setErr("");
    if (!f.name.trim() || !f.phone.trim()) { setErr("Please enter your name and phone number."); return; }
    setBusy(true);
    try {
      const ready = await loadRazorpay();
      if (!ready || !window.Razorpay) { setErr("Could not load the payment gateway — check your connection."); setBusy(false); return; }
      const r = await api("/public/razorpay/order", { method: "POST", body: { booking: cart.booking, items: cart.items, name: f.name, phone: f.phone, email: (Auth.user || {}).email || "" } });
      const rzp = new window.Razorpay({
        key: r.keyId, amount: r.amount, currency: r.currency, order_id: r.orderId,
        name: "Hotel Jai Laxmi and Lodge", description: "Room / restaurant payment",
        image: Branding.logo || (location.origin + "/img/logo-small.jpg"),
        prefill: { name: r.name, email: r.email, contact: r.phone },
        theme: { color: "#d4af37" },
        handler: async function (resp) {
          try {
            await api("/public/razorpay/verify", { method: "POST", body: { razorpay_order_id: resp.razorpay_order_id, razorpay_payment_id: resp.razorpay_payment_id, razorpay_signature: resp.razorpay_signature, paymentId: r.paymentId } });
            Cart.write({ items: [], booking: null });
            go("/payment-success?pid=" + r.paymentId);
          } catch (e2) { go("/payment-failed?pid=" + r.paymentId); }
        },
        modal: { ondismiss: function () { setBusy(false); } }
      });
      rzp.on("payment.failed", function () { setErr("Payment failed — please try again."); setBusy(false); });
      rzp.open();
    } catch (e) { setErr(e.message); setBusy(false); }
  };

  if (!cart.items.length && !cart.booking)
    return (
      <div className="section" style={{ maxWidth: 600 }}>
        <h2 className="section-title">Checkout</h2>
        <div className="divider" />
        <div className="empty">Your cart is empty.<br /><br />
          <button className="btn" onClick={() => go("/rooms")}>Book a Room</button>{" "}
          <button className="btn ghost" onClick={() => go("/restaurant")}>Order Food</button>
        </div>
      </div>
    );

  const detailsOK = f.name.trim() && f.phone.trim();
  return (
    <div className="section float-stage" style={{ maxWidth: 760 }}>
      {/* floating 3D decorations */}
      <span className="float-ic" style={{ top: 30, left: "2%", animationDelay: "0s" }}>🪔</span>
      <span className="float-ic" style={{ top: 110, right: "3%", animationDelay: "1.2s" }}>🌸</span>
      <span className="float-ic" style={{ top: 420, left: "-1%", animationDelay: "2.1s", fontSize: 24 }}>✨</span>
      <span className="float-ic" style={{ bottom: 160, right: "1%", animationDelay: ".7s", fontSize: 26 }}>🛎️</span>

      <h2 className="section-title">Checkout</h2>
      <div className="divider" />

      {/* stepper */}
      <div className="stepper">
        <div className="step on"><span className="dot">1</span><span className="slb">Cart</span></div>
        <div className="step-line" />
        <div className={"step" + (detailsOK ? " on" : "")}><span className="dot">2</span><span className="slb">Details</span></div>
        <div className="step-line" />
        <div className={"step" + (detailsOK && (f.paymentMethod !== "online" || qr) ? " on" : "")}><span className="dot">3</span><span className="slb">Pay</span></div>
      </div>

      {/* cart */}
      <Reveal>
        <div className="glow mb"><div className="glow-in">
          <h4 className="gold mb" style={{ fontFamily: "var(--font-display)", fontSize: 21 }}>🧾 Your Order</h4>
          {cart.booking && (
            <div className="citem" style={{ borderLeftColor: "var(--blue)" }}>
              <div className="cic">🛏️</div>
              <div className="cname">
                <b>Room {cart.booking.roomNumber} — {cart.booking.roomType}</b>
                <span>{cart.booking.checkIn}{cart.booking.checkOut ? " → " + cart.booking.checkOut : ""} · {cart.booking.nights || 1} night{(cart.booking.nights || 1) > 1 ? "s" : ""} × {NPR(cart.booking.price)}{cart.booking.persons ? " · " + cart.booking.persons + " person(s)" : ""}</span>
              </div>
              <span className="camt">{NPR(roomTotal)}</span>
              <button className="x" onClick={() => setCart({ ...cart, booking: null })}>✕</button>
            </div>
          )}
          {cart.items.map(i => (
            <div className="citem" key={i.id}>
              <div className="cic">🍛</div>
              <div className="cname"><b>{i.foodName}</b><span>{NPR(i.price)} × {i.qty}</span></div>
              <span className="camt">{NPR(i.qty * i.price)}</span>
              <button className="x" onClick={() => setCart({ ...cart, items: cart.items.filter(x => x.id !== i.id) })}>✕</button>
            </div>
          ))}
          <div className="total-plate">
            <span className="lab">Grand Total</span>
            <span className="amt">{NPR(total)}</span>
          </div>
        </div></div>
      </Reveal>

      {/* details + payment */}
      <Reveal delay={120}>
        <div className="glow"><div className="glow-in">
          <h4 className="gold" style={{ fontFamily: "var(--font-display)", fontSize: 21 }}>👤 Your Details</h4>
          <div className="f-input">
            <label>Full name *</label>
            <input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} placeholder="e.g. Ram Bahadur" />
          </div>
          <div className="f-input">
            <label>Phone number *</label>
            <input value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} placeholder="98XXXXXXXX" />
          </div>
          {cart.items.length > 0 && (tables && tables.length > 0 ? (
            <div className="f-input">
              <label>Dining in? Choose your table</label>
              <select value={f.tableId} onChange={e => { const t = tables.find(x => x.id === e.target.value); setF({ ...f, tableId: e.target.value, table: t ? t.number : "" }); }}>
                <option value="">Takeaway / room service</option>
                {tables.map(t => <option key={t.id} value={t.id} disabled={t.status !== "available"}>Table {t.number} · {t.capacity} seats{t.status !== "available" ? " — " + t.status.toUpperCase() : ""}</option>)}
              </select>
            </div>
          ) : (
            <div className="f-input">
              <label>Table number (optional)</label>
              <input value={f.table} onChange={e => setF({ ...f, table: e.target.value })} placeholder="if dining in" />
            </div>
          ))}
          <label style={{ marginTop: 20, color: "var(--gold)", letterSpacing: 1.5, textTransform: "uppercase", fontSize: 11.5 }}>Choose Payment Method</label>
          <div className="pay-cards">
            <div className={"pay-card" + (f.paymentMethod === "esewa" ? " on" : "")} onClick={() => setF({ ...f, paymentMethod: "esewa" })}>
              <span className="pic">🟢</span><b>eSewa</b><span>Secure online payment</span>
            </div>
            <div className={"pay-card" + (f.paymentMethod === "razorpay" ? " on" : "")} onClick={() => setF({ ...f, paymentMethod: "razorpay" })}>
              <span className="pic">💳</span><b>Card / UPI</b><span>Razorpay — cards, UPI, banking</span>
            </div>
            <div className={"pay-card" + (f.paymentMethod === "cash" ? " on" : "")} onClick={() => setF({ ...f, paymentMethod: "cash" })}>
              <span className="pic">💵</span><b>Cash at Counter</b><span>Pay when you arrive</span>
            </div>
            <div className={"pay-card" + (f.paymentMethod === "online" ? " on" : "")} onClick={() => setF({ ...f, paymentMethod: "online" })}>
              <span className="pic">📱</span><b>Scan QR</b><span>Any banking app</span>
            </div>
          </div>
          {f.paymentMethod === "esewa" && (
            <div className="qr-box" style={{ textAlign: "center" }}>
              <p style={{ fontWeight: 600 }}>🔒 You'll be redirected to the official eSewa page to pay <b className="gold">{NPR(total)}</b> securely.</p>
              <p style={{ color: "#555", fontSize: 13 }}>The amount is calculated and verified by our server. Test login token: 123456</p>
            </div>
          )}
          {f.paymentMethod === "razorpay" && (
            <div className="qr-box" style={{ textAlign: "center" }}>
              <p style={{ fontWeight: 600 }}>🔒 Pay <b className="gold">{NPR(total)}</b> securely by card, UPI or netbanking.</p>
              <p style={{ color: "#555", fontSize: 13 }}>The amount is computed and the payment verified on our server before your booking is confirmed.</p>
            </div>
          )}
          {f.paymentMethod === "online" && (
            qr ? (
              <div className="qr-box">
                <PayQR payload={qr.payload} />
                <p>{qr.accountName}{qr.bankName ? " · " + qr.bankName : ""}</p>
                <p>A/C: {qr.accountNumber}</p>
                <p style={{ color: "#555" }}>Scan with any banking app — {NPR(total)}</p>
              </div>
            ) : <p className="muted mt">⚠ QR payment is not configured yet — please choose eSewa or cash.</p>
          )}
          {err && <p className="red mt">⚠ {err}</p>}
          <button className="btn lg mt" style={{ width: "100%" }} disabled={busy}
            onClick={f.paymentMethod === "esewa" ? payEsewa : f.paymentMethod === "razorpay" ? payRazorpay : pay}>
            {busy ? "Processing…"
              : f.paymentMethod === "esewa" ? "🟢 Pay Securely with eSewa →"
                : f.paymentMethod === "razorpay" ? "💳 Pay with Card / UPI →"
                  : f.paymentMethod === "online" ? "🙏 I Have Paid — Confirm Order"
                    : "🙏 Confirm Order — Pay Cash"}
          </button>
        </div></div>
      </Reveal>
    </div>
  );
}

function CheckoutDone({ result }) {
  const { booking, order } = result;
  const dl = () => {
    let html = "";
    if (booking) html += roomBillHTML(booking);
    if (order) html += (booking ? "<hr/>" : "") + billHTML(order, "customer");
    const blob = new Blob([`<html><head><meta charset="utf-8"><style>body{font-family:'Courier New',monospace;font-size:13px;max-width:340px;margin:20px auto}h3,h4,.c{text-align:center}hr{border:none;border-top:1px dashed #555}table{width:100%}td,th{text-align:left;padding:3px}.r{text-align:right}.tot{font-weight:700}</style></head><body>${html}</body></html>`], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `bill-hotel-jai-laxmi-${(order && order.billNo) || (booking && booking.no)}.html`;
    a.click();
  };
  return (
    <div className="section" style={{ maxWidth: 620, textAlign: "center" }}>
      <h2 className="section-title">🙏 Order Confirmed!</h2>
      <div className="divider" />
      <div className="glow"><div className="glow-in" style={{ padding: 30 }}>
        {/* exaggeration #10: success mark spins in with spring overshoot */}
        <motion.p style={{ fontSize: 46 }}
          initial={{ scale: 0, rotate: -360 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.15 }}>
          <span className="burst">✅
            <i style={{ "--dx": "-46px", "--dy": "-38px" }}>✨</i>
            <i style={{ "--dx": "48px", "--dy": "-30px", animationDelay: ".3s" }}>🌸</i>
            <i style={{ "--dx": "-38px", "--dy": "34px", animationDelay: ".6s" }}>🪔</i>
            <i style={{ "--dx": "42px", "--dy": "40px", animationDelay: ".9s" }}>✨</i>
          </span>
        </motion.p>
        {booking && <p className="mt">🛏️ Room <b className="gold">{booking.roomNumber}</b> booked (Booking #{booking.no}). Reception has been notified.</p>}
        {order && <p className="mt">🍽️ Order <b className="gold">#{order.no}</b> sent to the kitchen. {order.table ? "We'll serve it to table " + order.table + "." : ""}</p>}
        <p className="muted mt">Reception has received a notification with all your details.</p>
        <div className="flex mt" style={{ justifyContent: "center" }}>
          <button className="btn" onClick={dl}>⬇ Download Bill</button>
          {order && <button className="btn ghost" onClick={() => printHTML(billHTML(order, "customer"))}>🖨 Print Bill</button>}
          {booking && <button className="btn ghost" onClick={() => printHTML(roomBillHTML(booking))}>🖨 Print Receipt</button>}
        </div>
        <button className="btn ghost mt" onClick={() => go("/")}>← Back to Home</button>
      </div></div>
    </div>
  );
}

/* ---------------- PAYMENT CONFIRMATION (redirect target after payment) ---------------- */
function ConfirmationPage() {
  const [result] = useState(() => { try { return JSON.parse(sessionStorage.getItem("hjl_last_order")); } catch { return null; } });
  useEffect(() => { window.scrollTo(0, 0); }, []);
  if (!result || (!result.booking && !result.order))
    return (
      <div className="section" style={{ maxWidth: 600, textAlign: "center" }}>
        <h2 className="section-title">Nothing to show</h2>
        <div className="divider" />
        <div className="empty">No recent order found.<br /><br />
          <button className="btn" onClick={() => go("/rooms")}>Book a Room</button>{" "}
          <button className="btn ghost" onClick={() => go("/restaurant")}>Order Food</button>
        </div>
      </div>
    );
  return <CheckoutDone result={result} />;
}

/* ---------------- eSewa PAYMENT SUCCESS ---------------- */
function PaymentSuccess() {
  const pid = hashQuery("pid");
  const [p, setP] = useState(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    window.scrollTo(0, 0);
    Cart.write({ items: [], booking: null });
    if (pid) api("/public/payment/" + pid).then(setP).catch(e => setErr(e.message));
    else setErr("No payment reference found.");
  }, []);
  if (err) return (
    <div className="section" style={{ maxWidth: 600, textAlign: "center" }}>
      <h2 className="section-title">Payment</h2><div className="divider" />
      <div className="empty">{err}<br /><br /><button className="btn" onClick={() => go("/")}>Back to Home</button></div>
    </div>
  );
  if (!p) return <div className="section" style={{ maxWidth: 600, textAlign: "center" }}><div className="empty">Verifying your payment…</div></div>;
  const dl = () => downloadHTML(paymentInvoiceHTML(p), `invoice-${p.invoiceNumber}.html`);
  return (
    <div className="section" style={{ maxWidth: 640, textAlign: "center" }}>
      <h2 className="section-title">✅ Payment Successful</h2>
      <div className="divider" />
      <div className="glow"><div className="glow-in" style={{ padding: 30 }}>
        <motion.p style={{ fontSize: 46 }} initial={{ scale: 0, rotate: -360 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.15 }}>
          <span className="burst">✅
            <i style={{ "--dx": "-46px", "--dy": "-38px" }}>✨</i>
            <i style={{ "--dx": "48px", "--dy": "-30px", animationDelay: ".3s" }}>🌸</i>
            <i style={{ "--dx": "-38px", "--dy": "34px", animationDelay: ".6s" }}>🪔</i>
            <i style={{ "--dx": "42px", "--dy": "40px", animationDelay: ".9s" }}>✨</i>
          </span>
        </motion.p>
        <p className="mt">Thank you, <b className="gold">{p.customerName}</b>! Your payment of <b className="gold">{NPR(p.totalAmount)}</b> is confirmed.</p>
        <div className="mt" style={{ fontSize: 14, lineHeight: 1.9 }}>
          <div>Invoice #: <b>{p.invoiceNumber}</b></div>
          <div>Transaction ID: <b>{p.transactionUuid}</b></div>
          {p.esewaRef && <div>eSewa Reference: <b>{p.esewaRef}</b></div>}
          {p.booking && <div>🛏️ Room <b className="gold">{p.booking.roomNumber}</b> booked — Booking #{p.booking.no}</div>}
          {p.order && <div>🍽️ Order <b className="gold">#{p.order.no}</b> sent to the kitchen</div>}
        </div>
        <div className="flex mt" style={{ justifyContent: "center" }}>
          <button className="btn" onClick={dl}>⬇ Download Invoice</button>
          <button className="btn ghost" onClick={() => printHTML(paymentInvoiceHTML(p))}>🖨 Print Invoice</button>
        </div>
        <div className="flex mt" style={{ justifyContent: "center" }}>
          <button className="btn ghost" onClick={() => go("/account")}>View My Bookings</button>
          <button className="btn ghost" onClick={() => go("/")}>← Home</button>
        </div>
      </div></div>
    </div>
  );
}

/* ---------------- eSewa PAYMENT FAILED / CANCELLED ---------------- */
function PaymentFailed() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div className="section" style={{ maxWidth: 600, textAlign: "center" }}>
      <h2 className="section-title">Payment Not Completed</h2>
      <div className="divider" />
      <div className="glow"><div className="glow-in" style={{ padding: 30 }}>
        <motion.p style={{ fontSize: 46 }} initial={{ x: 0 }} animate={{ x: [0, -10, 10, -6, 6, 0] }} transition={{ duration: 0.5 }}>⚠️</motion.p>
        <p className="mt">Your payment was cancelled or could not be verified. Nothing has been charged, and your cart is still saved.</p>
        <div className="flex mt" style={{ justifyContent: "center" }}>
          <button className="btn" onClick={() => go("/checkout")}>Try Again</button>
          <a className="btn ghost" href={HOTEL.phoneHref}>☎ Contact Support</a>
          <button className="btn ghost" onClick={() => go("/")}>← Home</button>
        </div>
      </div></div>
    </div>
  );
}

/* "Continue with Google" — renders only when the admin has configured a Client ID */
function GoogleLoginBtn({ onDone, setErr }) {
  const ref = useRef(null);
  const [cfg, setCfg] = useState(null);
  useEffect(() => { api("/public/google").then(setCfg).catch(() => setCfg({ clientId: "" })); }, []);
  useEffect(() => {
    if (!cfg || !cfg.clientId || !ref.current) return;
    const init = () => {
      if (!window.google || !window.google.accounts || !ref.current) return;
      window.google.accounts.id.initialize({
        client_id: cfg.clientId,
        ux_mode: "popup",
        use_fedcm_for_prompt: true, // works on mobile even with 3rd-party cookies blocked
        callback: async resp => {
          try {
            const r = await api("/public/google-login", { method: "POST", body: { credential: resp.credential } });
            Auth.set(r.token, r.user);
            window.dispatchEvent(new Event("auth-changed"));
            if (onDone) onDone();
          } catch (e) { if (setErr) setErr(e.message); }
        }
      });
      /* responsive width so the button renders on small phones (max 400) */
      const w = Math.max(200, Math.min(360, (ref.current && ref.current.offsetWidth) || 300));
      window.google.accounts.id.renderButton(ref.current, { theme: "outline", size: "large", shape: "pill", text: "continue_with", logo_alignment: "center", width: w });
    };
    if (window.google && window.google.accounts) init();
    else {
      const s = document.createElement("script");
      s.src = "https://accounts.google.com/gsi/client"; s.async = true; s.onload = init;
      document.body.appendChild(s);
    }
  }, [cfg]);
  if (!cfg || !cfg.clientId) return null;
  return (
    <div>
      <div ref={ref} style={{ display: "flex", justifyContent: "center", margin: "10px 0 4px" }} />
      <p className="muted" style={{ fontSize: 11.5, textAlign: "center" }}>— or use email below —</p>
    </div>
  );
}

/* passwordless login: email a 6-digit code (only shows if SMTP is configured) */
function OtpLogin({ onDone, setErr }) {
  const [avail, setAvail] = useState(false);
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { api("/public/otp-available").then(r => setAvail(!!r.email)).catch(() => { }); }, []);
  if (!avail) return null;
  const err = m => setErr && setErr(m);
  const send = async () => {
    err(""); if (!email.trim()) return; setBusy(true);
    try { await api("/public/otp/send", { method: "POST", body: { email } }); setStep(2); } catch (e) { err(e.message); }
    setBusy(false);
  };
  const verify = async () => {
    err(""); setBusy(true);
    try { const r = await api("/public/otp/verify", { method: "POST", body: { email, code } }); Auth.set(r.token, r.user); window.dispatchEvent(new Event("auth-changed")); if (onDone) onDone(); }
    catch (e) { err(e.message); }
    setBusy(false);
  };
  if (step === 0) return <button type="button" className="btn ghost" style={{ width: "100%", marginBottom: 8 }} onClick={() => setStep(1)}>📧 Email me a login code (no password)</button>;
  return (
    <div className="mb">
      {step === 1 && <React.Fragment>
        <label style={{ textAlign: "left" }}>Email for the login code</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" />
        <button type="button" className="btn mt" style={{ width: "100%" }} disabled={busy} onClick={send}>{busy ? "Sending…" : "Send code"}</button>
      </React.Fragment>}
      {step === 2 && <React.Fragment>
        <label style={{ textAlign: "left" }}>Enter the 6-digit code sent to {email}</label>
        <input value={code} onChange={e => setCode(e.target.value)} placeholder="123456" inputMode="numeric" maxLength={6} />
        <div className="flex mt">
          <button type="button" className="btn" style={{ flex: 1 }} disabled={busy} onClick={verify}>{busy ? "Verifying…" : "Verify & Log In"}</button>
          <button type="button" className="btn ghost" onClick={() => { setStep(1); setCode(""); }}>← Back</button>
        </div>
      </React.Fragment>}
    </div>
  );
}

/* ---------------- CUSTOMER ACCOUNT (public login / signup) ---------------- */
function AccountPage() {
  const [tab, setTab] = useState("signin");
  const [f, setF] = useState({ name: "", email: "", phone: "", age: "", password: "", photo: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [, force] = useState(0);
  const u = Auth.user;
  const isStaff = u && (u.role === "admin" || (u.access || []).length);
  const logout = () => { Auth.clear(); window.dispatchEvent(new Event("auth-changed")); force(x => x + 1); };
  if (u) return (
    <div className="section" style={{ maxWidth: 820 }}>
      <div className="card" style={{ textAlign: "center" }}>
        {u.photo
          ? <img src={u.photo} alt={u.name} style={{ width: 92, height: 92, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--gold-dim)" }} />
          : <LogoImg />}
        <h3 style={{ fontFamily: "var(--font-display)", color: "var(--gold2)", fontSize: 26, marginTop: 8 }}>Namaste, {u.name.split(" ")[0]} 🙏</h3>
        <p className="muted">{u.email}{u.phone ? " · " + u.phone : ""}{u.age ? " · Age " + u.age : ""}</p>
        {isStaff
          ? <p className="muted mt">Staff account · <a href={u.role === "admin" ? "#/admin" : Auth.can("reception") ? "#/reception" : "#/kitchen"}>Open your panel →</a></p>
          : <p className="muted mt">Your name & phone auto-fill at checkout.</p>}
        <div className="flex mt" style={{ justifyContent: "center" }}>
          <button className="btn" onClick={() => go("/rooms")}>Book a Room</button>
          <button className="btn ghost" onClick={() => go("/restaurant")}>Order Food</button>
          <button className="btn ghost" onClick={logout}>Log Out</button>
        </div>
      </div>
      {!isStaff && <MyHistory />}
    </div>
  );
  const submit = async e => {
    e.preventDefault();
    if (!f.email.trim() || !f.password) { setErr("Please enter your email and password."); return; }
    if (tab === "signup" && !f.name.trim()) { setErr("Please enter your name."); return; }
    setBusy(true); setErr("");
    try {
      const r = tab === "signup"
        ? await api("/public/signup", { method: "POST", body: { name: f.name, email: f.email, phone: f.phone, age: f.age, password: f.password, photo: f.photo } })
        : await api("/public/signin", { method: "POST", body: { email: f.email, password: f.password } });
      Auth.set(r.token, r.user);
      window.dispatchEvent(new Event("auth-changed"));
      go("/account");
    } catch (e2) { setErr(e2.message); }
    setBusy(false);
  };
  return (
    <div className="login-wrap">
      <form className="card login-card" onSubmit={submit}>
        <LogoImg />
        <h3 style={{ fontFamily: "var(--font-display)", color: "var(--gold2)", fontSize: 24 }}>{tab === "signup" ? "Create Your Account" : "Welcome Back"}</h3>
        <p className="muted">Guest account · Book & order faster · see your history</p>
        <div className="flex" style={{ justifyContent: "center", gap: 8, margin: "8px 0 12px" }}>
          <button type="button" className={"chip" + (tab === "signin" ? " on" : "")} onClick={() => { setTab("signin"); setErr(""); }}>Log In</button>
          <button type="button" className={"chip" + (tab === "signup" ? " on" : "")} onClick={() => { setTab("signup"); setErr(""); }}>Sign Up</button>
        </div>
        <GoogleLoginBtn onDone={() => go("/account")} setErr={setErr} />
        <OtpLogin onDone={() => go("/account")} setErr={setErr} />
        {tab === "signup" && <>
          <div className="flex" style={{ justifyContent: "center", alignItems: "center", gap: 12, margin: "4px 0 8px" }}>
            {f.photo && <img src={f.photo} alt="profile" style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--gold-dim)" }} />}
            <PhotoInput camera value={f.photo} onChange={p => setF({ ...f, photo: p })} label="Profile photo (optional)" />
          </div>
          <label style={{ textAlign: "left" }}>Full name</label>
          <input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} placeholder="Your name" />
        </>}
        <label style={{ textAlign: "left" }}>Email</label>
        <input type="email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} placeholder="you@email.com" />
        {tab === "signup" && <div className="row">
          <div><label>Phone number</label><input value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} placeholder="98XXXXXXXX" /></div>
          <div><label>Age</label><input type="number" value={f.age} onChange={e => setF({ ...f, age: e.target.value })} placeholder="Age" /></div>
        </div>}
        <label style={{ textAlign: "left" }}>Password</label>
        <PasswordInput value={f.password} onChange={e => setF({ ...f, password: e.target.value })} placeholder="Choose a password" autoComplete="new-password" />
        {err && <p className="red mt">⚠ {err}</p>}
        <button className="btn mt" style={{ width: "100%" }} disabled={busy}>{busy ? "Please wait…" : tab === "signup" ? "Create Account" : "Log In"}</button>
        <p className="muted mt" style={{ fontSize: 12 }}>Staff member? <a href="#/login">Staff login →</a></p>
      </form>
    </div>
  );
}

/* a logged-in guest's own room bookings + food orders (live) */
function MyHistory() {
  const [data] = useLive(() => api("/public/my-history"), ["bookings", "orders", "booking", "order"]);
  if (!data) return <div className="empty">Loading your history…</div>;
  const { bookings = [], orders = [] } = data;
  return (
    <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 18 }}>
      <div className="card">
        <h4 className="gold mb">🛏️ My Room Bookings</h4>
        {bookings.length === 0 ? <p className="muted">No bookings yet.</p>
          : bookings.map(b => (
            <div key={b.id} className="citem" style={{ borderLeftColor: "var(--blue)" }}>
              <div className="cname">
                <b>Room {b.roomNumber} — {b.roomType}</b>
                <span>{b.checkIn}{b.checkOut ? " → " + b.checkOut : ""} · {b.nights || 1} night(s) · {(b.status || "booked")}</span>
              </div>
              <span className="camt">{NPR(b.total !== undefined ? b.total : b.price)}</span>
              <button className="btn sm ghost" onClick={() => printHTML(roomBillHTML(b))}>🖨 Bill</button>
            </div>
          ))}
      </div>
      <div className="card">
        <h4 className="gold mb">🍽️ My Food Orders</h4>
        {orders.length === 0 ? <p className="muted">No orders yet.</p>
          : orders.map(o => (
            <div key={o.id} className="citem">
              <div className="cname">
                <b>Order #{o.no} · {o.items.length} item(s)</b>
                <span>{fmtDT(o.createdAt)} · {o.status}{o.paid ? " · paid" : ""}</span>
              </div>
              <span className="camt">{NPR(o.total)}</span>
              <button className="btn sm ghost" onClick={() => printHTML(billHTML(o, "customer"))}>🖨 Bill</button>
            </div>
          ))}
      </div>
    </div>
  );
}

/* ---------------- ONLINE TABLE RESERVATION ---------------- */
function ReservePage() {
  const [f, setF] = useState({ name: "", phone: "", date: new Date().toISOString().slice(0, 10), time: "19:00", guests: 2, note: "" });
  const [done, setDone] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const send = async () => {
    setErr("");
    if (!f.name.trim() || !f.phone.trim()) { setErr("Please enter your name and phone number."); return; }
    setBusy(true);
    try { setDone(await api("/public/reservations", { method: "POST", body: f })); }
    catch (e) { setErr(e.message); }
    setBusy(false);
  };
  if (done) return (
    <div className="section" style={{ maxWidth: 560, textAlign: "center" }}>
      <h2 className="section-title">🙏 Table Reserved!</h2>
      <div className="divider" />
      <div className="glow"><div className="glow-in" style={{ padding: 28 }}>
        <p style={{ fontSize: 42 }}>🍽️</p>
        <p className="mt">Thank you <b className="gold">{done.name}</b>! Your table for <b className="gold">{done.guests}</b> on <b className="gold">{done.date}{done.time ? " at " + done.time : ""}</b> is requested.</p>
        <p className="muted mt">Reception has been notified instantly and will confirm on {done.phone}.</p>
        <button className="btn mt" onClick={() => go("/")}>← Back to Home</button>
      </div></div>
    </div>
  );
  return (
    <div className="section float-stage" style={{ maxWidth: 560 }}>
      <span className="float-ic" style={{ top: 40, right: "4%" }}>🍽️</span>
      <span className="float-ic" style={{ bottom: 80, left: "2%", animationDelay: "1s" }}>🌸</span>
      <h2 className="section-title">Online Table Reservation</h2>
      <div className="divider" />
      <p className="section-sub">Reserve your table — reception gets it instantly</p>
      <div className="glow"><div className="glow-in">
        <div className="f-input"><label>Your name *</label>
          <input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} placeholder="e.g. Sita Sharma" /></div>
        <div className="f-input"><label>Phone number *</label>
          <input value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} placeholder="98XXXXXXXX" /></div>
        <div className="row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
          <div className="f-input"><label>Date</label>
            <input type="date" value={f.date} onChange={e => setF({ ...f, date: e.target.value })} /></div>
          <div className="f-input"><label>Time</label>
            <input type="time" value={f.time} onChange={e => setF({ ...f, time: e.target.value })} /></div>
        </div>
        <div className="f-input"><label>Number of guests</label>
          <input type="number" min="1" value={f.guests} onChange={e => setF({ ...f, guests: e.target.value })} /></div>
        <div className="f-input"><label>Special request (optional)</label>
          <input value={f.note} onChange={e => setF({ ...f, note: e.target.value })} placeholder="birthday, window seat…" /></div>
        {err && <p className="red mt">⚠ {err}</p>}
        <button className="btn lg mt" style={{ width: "100%" }} disabled={busy} onClick={send}>
          {busy ? "Sending…" : "🍽️ Reserve My Table"}
        </button>
      </div></div>
    </div>
  );
}

/* ---------------- SELF CHECK-IN ---------------- */
function CheckinPage() {
  const [f, setF] = useState({ bookingNo: "", phone: "" });
  const [done, setDone] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const send = async () => {
    setErr(""); setBusy(true);
    try { setDone(await api("/public/self-checkin", { method: "POST", body: f })); }
    catch (e) { setErr(e.message); }
    setBusy(false);
  };
  if (done) return (
    <div className="section" style={{ maxWidth: 560, textAlign: "center" }}>
      <h2 className="section-title">🙏 Welcome{done.already ? " back" : ""}, {done.name}!</h2>
      <div className="divider" />
      <div className="glow"><div className="glow-in" style={{ padding: 28 }}>
        <p style={{ fontSize: 42 }}>🛎️</p>
        <p className="mt">You are checked in to <b className="gold" style={{ fontSize: 22 }}>Room {done.roomNumber}</b> ({done.roomType}).</p>
        <p className="muted mt">Reception has been notified — collect your key at the desk. {done.paid ? "Your payment is complete. ✓" : "Please settle payment at the desk."}</p>
        <button className="btn mt" onClick={() => go("/")}>← Back to Home</button>
      </div></div>
    </div>
  );
  return (
    <div className="section float-stage" style={{ maxWidth: 520 }}>
      <span className="float-ic" style={{ top: 40, right: "4%" }}>🛎️</span>
      <span className="float-ic" style={{ bottom: 80, left: "2%", animationDelay: "1.2s" }}>🪔</span>
      <h2 className="section-title">Self Check-in</h2>
      <div className="divider" />
      <p className="section-sub">Already booked? Check in from your phone — skip the queue</p>
      <div className="glow"><div className="glow-in">
        <div className="f-input"><label>Booking number *</label>
          <input value={f.bookingNo} onChange={e => setF({ ...f, bookingNo: e.target.value })} placeholder="e.g. 12 (on your receipt)" /></div>
        <div className="f-input"><label>Phone number used for booking *</label>
          <input value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} placeholder="98XXXXXXXX" /></div>
        {err && <p className="red mt">⚠ {err}</p>}
        <button className="btn lg mt" style={{ width: "100%" }} disabled={busy || !f.bookingNo || !f.phone} onClick={send}>
          {busy ? "Checking…" : "🛎️ Check Me In"}
        </button>
        <p className="muted mt" style={{ fontSize: 13 }}>Don't have a booking yet? <a href="#/rooms">Book a room →</a></p>
      </div></div>
    </div>
  );
}

/* ---------------- LOGIN ---------------- */
function LoginPage() {
  const [f, setF] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const login = async e => {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      const r = await api("/auth/login", { method: "POST", body: f });
      Auth.set(r.token, r.user);
      const u = r.user;
      { const acc = u.access || []; go(u.role === "admin" || acc.includes("admin") ? "/admin" : acc.includes("reception") ? "/reception" : acc.includes("kitchen") ? "/kitchen" : acc.includes("waiter") ? "/waiter" : acc.includes("pos") ? "/pos" : "/"); }
      window.dispatchEvent(new Event("auth-changed"));
    } catch (e2) { setErr(e2.message); }
    setBusy(false);
  };
  return (
    <div className="login-wrap">
      <form className="card login-card" onSubmit={login}>
        <LogoImg />
        <h3 style={{ fontFamily: "var(--font-display)", color: "var(--gold2)", fontSize: 24 }}>Staff Login</h3>
        <p className="muted">Admin · Reception · Kitchen · Waiter</p>
        <GoogleLoginBtn onDone={() => { const u = Auth.user || {}; const acc = u.access || []; go(u.role === "admin" || acc.includes("admin") ? "/admin" : acc.includes("reception") ? "/reception" : acc.includes("kitchen") ? "/kitchen" : acc.includes("waiter") ? "/waiter" : acc.includes("pos") ? "/pos" : "/"); }} setErr={setErr} />
        <label style={{ textAlign: "left" }}>Email</label>
        <input type="email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} autoFocus />
        <label style={{ textAlign: "left" }}>Password</label>
        <PasswordInput value={f.password} onChange={e => setF({ ...f, password: e.target.value })} placeholder="Staff password" />
        {err && <p className="red mt">⚠ {err}</p>}
        <button className="btn mt" style={{ width: "100%" }} disabled={busy}>{busy ? "Signing in…" : "Sign In"}</button>
      </form>
    </div>
  );
}
