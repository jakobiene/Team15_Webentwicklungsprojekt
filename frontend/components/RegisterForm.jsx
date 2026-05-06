import { useState } from "react";
import { registerUser } from "../services/authService"; 

function RegisterForm({ onSuccess }) {
    const [formData, setFormData] = useState
    ({ anrede: "",vorname: "",nachname: "",adresse: "",plz: "",port: "",email: "", username: "", password: "", confirmPassword: "",});

    
    const [error, setError] = useState("");

    const fields = [
  { name: "vorname", label: "Vorname", type: "text" },
  { name: "nachname", label: "Nachname", type: "text" },
  { name: "adresse", label: "Adresse", type: "text" },
  { name: "plz", label: "PLZ", type: "text" },
  { name: "ort", label: "Ort", type: "text" },
  { name: "email", label: "E-Mail", type: "email" },
  { name: "username", label: "Benutzername", type: "text" },
  { name: "password", label: "Passwort", type: "password" },
  { name: "confirmPassword", label: "Passwort bestätigen", type: "password" },
];

   

  function handleChange(e) { // Funktion zum Aktualisieren des formData-States, wenn der Benutzer Eingaben in die Formularfelder macht
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e){
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwörter stimmen nicht überein!");
      return;
    }   
    try {
      await registerUser(formData); 
      setError(""); 
        onSuccess(); // Aufruf der onSuccess-Funktion, die als Prop übergeben wird, um anzuzeigen, dass die Registrierung erfolgreich war
    } catch (err) {
      setError("Registrierung fehlgeschlagen");
    }   
  }

  return (
    <>
      <h2 className="fw-bold mb-1 text-primary">Registrieren</h2>
      <p className="text-muted mb-4">Bitte gib deine Daten ein.</p>

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Anrede</label>
          <select
            className="form-select"
            name="anrede"
            value={formData.anrede}
            onChange={handleChange}
          >
            <option value="">Bitte wählen</option>
            <option value="Herr">Herr</option>
            <option value="Frau">Frau</option>
            <option value="Divers">Divers</option>
          </select>
        </div>

        <div className="row">
          {fields.map((field) => (
            <div className="col-md-6 mb-3" key={field.name}>
              <label className="form-label">{field.label}</label>
              <input type={field.type} className="form-control" 
              name={field.name} value={formData[field.name]} onChange={handleChange} required/>
            </div>
          ))}
        </div>

        <button className="btn btn-dark w-100 py-2 mt-2">
          Account erstellen
        </button>
      </form>
    </>
  );
}

export default RegisterForm;




