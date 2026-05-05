 import { Routes, Route } from "react-router-dom";
import Register from "../pages/Register";
import RegisterSuccess from "../components/RegisterSuccess";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Home from "../pages/Home";
import { useState } from "react";
import Navbar from "../components/Navbar";
import { getCurrentUser } from "../services/authService";
import { useEffect } from "react";

function App() {
  
  const [user, setUser] = useState(null); // State für den aktuell angemeldeten Benutzer
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

  return(
    <>
    <Navbar role={role} />
    <Routes> 
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/register/success" element={<RegisterSuccess />} />
      <Route path="/login" element={<Login onLogin={setUser} />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
    </>
  );

  }
 

export default App;
