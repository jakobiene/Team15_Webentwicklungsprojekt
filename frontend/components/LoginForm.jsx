import { useState } from "react";
import { loginUser } from "../services/authService";

function LoginForm({ onSuccess }) {
  const [formData, setFormData] = useState({email: "",password: "", rememberMe: false,});
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const data = await loginUser(formData);
      setError("");
      onSuccess(data);
    } catch {
      setError("Login fehlgeschlagen");
    }
  }

  return (
    <>
      <h2 className="fw-bold mb-1 text-dark">Anmelden</h2>
      <p className="text-muted mb-4">Bitte gib deine Zugangsdaten ein.</p>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">E-Mail</label>
          <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange}required/></div>

         <div className="mb-3">
          <label className="form-label">Passwort</label>
          <input type="password" className="form-control" name="password"value={formData.password} onChange={handleChange} required/></div>

        <div className="form-check mb-3">
          <input type="checkbox" className="form-check-input" id="rememberMe" name="rememberMe" checked={formData.rememberMe} onChange={handleChange}/>
          <label className="form-check-label" htmlFor="rememberMe">Login merken</label>
        </div>
        <button className="btn btn-dark w-100 py-2 mt-2"> Anmelden</button>
      </form>
    </>
  );
}

export default LoginForm;
