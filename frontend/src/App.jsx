import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Register from "../pages/Register";
import RegisterSuccess from "../components/RegisterSuccess";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Home from "../pages/Home";
import Products from "../pages/Products";
import Cart from "../pages/Cart";
import Account from "../pages/Account";
import OrderDetail from "../pages/OrderDetail";
import InvoicePrint from "../pages/InvoicePrint";
import ComingSoon from "../pages/ComingSoon";
import Navbar from "../components/Navbar";
import RequireRole from "../components/RequireRole";
import { getCurrentUser, logoutUser } from "../services/authService";
import { fetchCart } from "../services/cartService";

function App() {
  const [user, setUser] = useState(null); // aktuell angemeldeter Benutzer
  const [authReady, setAuthReady] = useState(false); // true, sobald /api/me geprüft wurde
  const [cartCount, setCartCount] = useState(0); // Anzahl Produkte im Warenkorb (US32)
  const [logoutError, setLogoutError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Auf der Druck-Rechnung wird keine Navbar angezeigt (eigenes Fenster, US65).
  const hideNavbar = location.pathname.startsWith("/invoice/");

  // Beim Start: Login-Status (US21) und Warenkorb aus der Session wiederherstellen.
  useEffect(() => {
    async function init() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } finally {
        setAuthReady(true); // Auth-Prüfung abgeschlossen (auch bei Fehler)
      }
      try {
        const cart = await fetchCart();
        setCartCount(cart.count);
      } catch {
        setCartCount(0);
      }
    }
    init();
  }, []);

  // DB-Rolle (0 = Customer, 2 = Admin) auf die Navbar-Rolle abbilden
  // (0 = Gast, 1 = eingeloggter Customer, 2 = Admin).
  const navRole = !user ? 0 : user.role === 2 ? 2 : 1;

  async function handleLogout() {
    try {
      await logoutUser();
      setUser(null);
      setCartCount(0);
      setLogoutError("");
      navigate("/");
    } catch {
      setLogoutError("Logout fehlgeschlagen. Bitte versuche es erneut.");
    }
  }

  return (
    <>
      {!hideNavbar && <Navbar role={navRole} onLogout={handleLogout} cartCount={cartCount} />}
      {logoutError && <div className="alert alert-danger mb-0">{logoutError}</div>}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register/success" element={<RegisterSuccess />} />
        <Route path="/login" element={<Login onLogin={setUser} />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<Products onCartChange={setCartCount} />} />
        <Route path="/cart" element={<Cart user={user} onCartChange={setCartCount} />} />

        {/* Konto & Bestellungen (Sprint 3) */}
        <Route
          path="/account"
          element={
            <RequireRole user={user} ready={authReady}>
              <Account user={user} onUserUpdate={setUser} />
            </RequireRole>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <RequireRole user={user} ready={authReady}>
              <OrderDetail />
            </RequireRole>
          }
        />
        <Route
          path="/invoice/:id"
          element={
            <RequireRole user={user} ready={authReady}>
              <InvoicePrint />
            </RequireRole>
          }
        />

        {/* Admin-Bereiche aus Sprint 4 – Platzhalter */}
        <Route
          path="/admin/products"
          element={
            <RequireRole user={user} ready={authReady} adminOnly>
              <ComingSoon title="Produkte bearbeiten" />
            </RequireRole>
          }
        />
        <Route
          path="/admin/customers"
          element={
            <RequireRole user={user} ready={authReady} adminOnly>
              <ComingSoon title="Kunden bearbeiten" />
            </RequireRole>
          }
        />
      </Routes>
    </>
  );
}

export default App;
