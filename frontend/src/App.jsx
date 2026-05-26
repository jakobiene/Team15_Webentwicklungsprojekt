 import { Routes, Route, useNavigate } from "react-router-dom";
import Register from "../pages/Register";
import RegisterSuccess from "../components/RegisterSuccess";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Home from "../pages/Home";
import Products from "../pages/Products";
import { useState } from "react";
import Navbar from "../components/Navbar";
import { getCurrentUser, logoutUser } from "../services/authService";
import { useEffect } from "react";

function App() {
  
  const [user, setUser] = useState(null); // State für den aktuell angemeldeten Benutzer
  const [logoutError, setLogoutError] = useState("");
  const navigate = useNavigate();
   // setUser ist Setter Funktion für Re-Rendering

  useEffect(() => { // React: „Führe diesen Effekt aus.“
    async function loadUser() {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    }
    loadUser();

  },[]); //"Führe diesen Effekt nur einmal aus, wenn App zum ersten Mal geladen wird."
  // Damit passiert kein "getCurrentUser->setUser->render->getCurrent...."

  const role = user?.role ?? 0; // Rolle des Benutzers, 0 = nicht angemeldet, 1 = normaler Benutzer, 2 = Admin

 async function handleLogout(){
  try {
    await logoutUser();
    setUser(null);
    setLogoutError("");
    navigate("/");
  } catch (error) {
    setLogoutError("Logout fehlgeschlagen. Bitte versuche es erneut.");
  }
}

  // Warum steht Navar vor Routes? -> Weil Nav auf alle Seiten sichtbar sein soll (Routes rendert nur UI)
  // und in <Navar wird die role übergeben und ein State für Logout?

  return(
    <>
    <Navbar role={role} onLogout={handleLogout} />  
    {logoutError && <div className="alert alert-danger mb-0">{logoutError}</div>}
    <Routes> 
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/register/success" element={<RegisterSuccess />} />
      <Route path="/login" element={<Login onLogin={setUser} />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/products" element={<Products />} />
   
    </Routes>
    </>
  );

  }
 

export default App;
