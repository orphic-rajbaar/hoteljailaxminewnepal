/* app.jsx — root router */

function App() {
  const route = useRoute();
  const [cart] = useCart();
  const [, force] = useState(0);
  useEffect(() => {
    const h = () => force(x => x + 1);
    window.addEventListener("auth-changed", h);
    return () => window.removeEventListener("auth-changed", h);
  }, []);

  const path = route.split("?")[0]; // strip query (e.g. /payment-success?pid=..)
  const isPanel = path.startsWith("/admin") || path.startsWith("/kitchen") || path.startsWith("/reception") || path.startsWith("/pos");
  const cartCount = cart.items.reduce((s, i) => s + i.qty, 0) + (cart.booking ? 1 : 0);

  /* heritage light theme on public pages, dark theme on staff panels */
  useEffect(() => {
    document.body.classList.toggle("theme-light", !isPanel && path !== "/login");
  }, [path, isPanel]);

  let page;
  if (path === "/" || path === "") page = <HomeLuxe />;
  else if (path === "/rooms") page = <RoomsLuxe />;
  else if (path === "/restaurant") page = <RestaurantLuxe />;
  else if (path === "/about") page = <AboutPage />;
  else if (path === "/contact") page = <ContactPage />;
  else if (path === "/checkout") page = <CheckoutPage />;
  else if (path === "/confirmation") page = <ConfirmationPage />;
  else if (path === "/payment-success") page = <PaymentSuccess />;
  else if (path === "/payment-failed") page = <PaymentFailed />;
  else if (path === "/account") page = <AccountPage />;
  else if (path === "/reserve") page = <ReservePage />;
  else if (path === "/checkin") page = <CheckinPage />;
  else if (path === "/login") page = <LoginPage />;
  else if (path.startsWith("/pos")) page = <PosPanel />;
  else if (path.startsWith("/admin")) page = <AdminPanel />;
  else if (path.startsWith("/kitchen")) page = <KitchenPanel />;
  else if (path.startsWith("/reception")) page = <ReceptionPanel />;
  else page = <Home />;

  return (
    <>
      <ScrollProgress />
      <PublicNav cartCount={cartCount} />
      {/* cinematic page transitions between routes */}
      <AnimatePresence mode="wait">
        <motion.div key={route}
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -18 }}
          transition={{ duration: 0.28, ease: [0.42, 0, 0.58, 1] }}>
          {page}
        </motion.div>
      </AnimatePresence>
      {!isPanel && <Footer />}
      {!isPanel && (
        <motion.a className="wa-float no-print" href="https://wa.me/9779806465366" target="_blank" rel="noopener"
          title="Chat on WhatsApp" animate={{ scale: [1, 1.09, 1] }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          whileHover={{ scale: 1.18 }}>
          💬
        </motion.a>
      )}
      {isPanel && (
        <footer className="no-print" style={{ marginTop: 0, padding: "16px" }}>
          <div className="credit" style={{ borderTop: "none", paddingTop: 0, marginTop: 0 }}>
            Crafted by <b>Dipendra Upadhayay (Rajbaar)</b> · All Copyright Reserved © {new Date().getFullYear()}
          </div>
        </footer>
      )}
      <Toasts />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
