import { useState } from "react";
import { registerUser } from "../services/authService"; //Import der Funktion zum Registrieren eines Benutzers aus dem authService

//UI ändern / State updaten = kein AJAX
//Daten laden / speichern / löschen = AJAX

function Register() {
    const [formData, setFormData] = useState({
         //State für die Formulardaten (formData -> aktuelle Werte, setFormData -> Funktion zum Aktualisieren der Werte)
        
        anrede: "",
        vorname: "",
        nachname: "",
        adresse: "",
        plz: "",
        ort: "",
        email: "",
        username: "",
        password: "",
        confirmPassword: "",

        /*  <--- Zu Advanced, da handleChange das nicht updaten könnte.. --->
        zahlungsinformationen: {
            kreditkartennummer: "",
            ablaufdatum: "",
            cvv: ""
        }   */

    });



        // name ist key im State, value ist der aktuelle Wert des Eingabefelds (Wert, den der Benutzer eingibt)
        //beim Aufruf von setFormData wird der vorherige Zustand (prevData) beibehalten und nur das Feld aktualisiert,
        // das geändert wurde (durch die Verwendung von [name]: value). 
        // Dadurch wird sichergestellt, dass alle anderen Felder im State unverändert bleiben, während nur das spezifische Feld aktualisiert wird.
        //es ist nur ein Handler für alle Eingabefelder, da der name-Attribut in den Eingabefeldern mit den Schlüsseln im formData-State übereinstimmt. 
        // name -> ist dann im HTML-Formular definiert und ermöglicht es, die entsprechenden Werte im State zu aktualisieren, ohne dass für jedes Feld ein separater Handler erforderlich ist.
        // [name] ist eine sogenannte "computed property",
        // wodurch der Key dynamisch zur Laufzeit gesetzt wird.
    function handleChange(event) {
        const { name, value } = event.target; 
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    }  

   async function handleSubmit(event) {
        event.preventDefault();   // Verhindert das Standardverhalten des Formulars (z.B. Neuladen der Seite)  
        if (formData.password !== formData.confirmPassword) {
            alert("Passwörter stimmen nicht überein!");
            return; // Wenn die Passwörter nicht übereinstimmen, wird eine Fehlermeldung angezeigt und die Funktion wird beendet, um die Registrierung zu verhindern.
        }           
        // Hier kannst du die formData an deinen Backend-Server senden oder weiterverarbeiten
        console.log(formData);
        try {
            const data = await registerUser(formData); //Aufruf der Funktion zum Registrieren eines Benutzers, die die formData an den Backend-Server sendet
            console.log("Backend Antwort:", data);// Ausgabe der Antwort des Backend-Servers in der Konsole
        } catch (error) {
            console.error("Fehler bei der Registrierung:", error);  // Ausgabe von Fehlern in der Konsole, falls die Registrierung fehlschlägt
        }
    }   


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

return (
  <div className="min-vh-100 d-flex align-items-center bg-light">
    <div className="container">
      <div className="row shadow-lg rounded-4 overflow-hidden bg-white">
        
        <div className="col-md-5 d-none d-md-flex flex-column justify-content-center p-5 bg-dark text-white">
          <h1 className="fw-bold">Nil</h1>
          <p className="mt-3 text-white-50">
            Erstelle deinen Account und starte mit deinem Einkauf. </p></div>

        <div className="col-md-7 p-5">
          <h2 className="fw-bold mb-1 text-primary">Registrieren</h2>
          <p className="text-muted mb-4">Bitte gib deine Daten ein.</p>

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
                  <input
                    type={field.type}
                    className="form-control"
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    required
                  />
                </div>
              ))}
            </div>

            <button className="btn btn-dark w-100 py-2 mt-2">
              Account erstellen
            </button>
          </form>
        </div>

      </div>
    </div>
  </div>
);
}
export default Register


