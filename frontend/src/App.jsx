import { Routes, Route, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Register from "../pages/Register";
import RegisterSuccess from "../components/RegisterSuccess";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Home from "../pages/Home";
import Products from "../pages/Products";
import Cart from "../pages/Cart";
import ComingSoon from "../pages/ComingSoon";
import Navbar from "../components/Navbar";
import RequireRole from "../components/RequireRole";
import { getCurrentUser, logoutUser } from "../services/authService";
import { fetchCart } from "../services/cartService";

function App() {
  const [user, setUser] = useState(null); // aktuell angemeldeter Benutzer
  const [cartCount, setCartCount] = useState(0); // Anzahl Produkte im Warenkorb (US32)
  const [logoutError, setLogoutError] = useState("");
  const navigate = useNavigate();

  // Beim Start: Login-Status (US21) und Warenkorb aus der Session wiederherstellen.
  useEffect(() => {
    async function init() {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
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
      <Navbar role={navRole} onLogout={handleLogout} cartCount={cartCount} />
      {logoutError && <div className="alert alert-danger mb-0">{logoutError}</div>}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register/success" element={<RegisterSuccess />} />
        <Route path="/login" element={<Login onLogin={setUser} />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<Products onCartChange={setCartCount} />} />
        <Route path="/cart" element={<Cart onCartChange={setCartCount} />} />

        {/* Bereiche aus Sprint 3 – Platzhalter, bis die echten Seiten existieren */}
        <Route
          path="/account"
          element={
            <RequireRole user={user}>
              <ComingSoon title="Mein Konto" />
            </RequireRole>
          }
        />
        <Route
          path="/orders"
          element={
            <RequireRole user={user}>
              <ComingSoon title="Meine Bestellungen" />
            </RequireRole>
          }
        />

        {/* Admin-Bereiche aus Sprint 4 – Platzhalter */}
        <Route
          path="/admin/products"
          element={
            <RequireRole user={user} adminOnly>
              <ComingSoon title="Produkte bearbeiten" />
            </RequireRole>
          }
        />
        <Route
          path="/admin/customers"
          element={
            <RequireRole user={user} adminOnly>
              <ComingSoon title="Kunden bearbeiten" />
            </RequireRole>
          }
        />
      </Routes>
    </>
  );
}

export default App;
