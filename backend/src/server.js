import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt"; //PW Hashing 
import validator from "validator"; //E-Mail-Validierung
import { pool } from "../database/db.js" // Importieren des Verbindungs-Pools aus der db.js, um später in den API-Endpunkten auf die Datenbank zugreifen zu können

dotenv.config(); // lädt die Umgebungsvariablen aus der .env-Datei, damit wir z.B. den PORT flexibel konfigurieren können

const app = express(); // Erstellt eine neue Express-Anwendung
const PORT = process.env.PORT || 5000; //

app.use(cors()); // erlaubt Frontend, auf die API zuzugreifen
app.use(express.json()); // ermöglicht das Parsen von JSON-Daten im Request-Body -> req.body nutzt diesen Middleware, um die Daten zu verarbeiten, die vom Frontend gesendet werden (z.B. bei der Registrierung eines Benutzers)


app.listen(PORT, () => {
  console.log(`Backend läuft auf http://localhost:${PORT}`);
});

 
function validateRegisterData(data) {
  const { anrede, vorname,nachname, adresse,plz, ort, email,username,password } = data;
  if (!anrede || !vorname || !nachname || !adresse || !plz || !ort || !email || !username || !password) {
    throw new Error("Alle Felder müssen ausgefüllt werden");
  }
  const validatedEmail = validateEmail(email); // mail wird validiert und wenn false dann -> true und geht in if.
  if (!validatedEmail) {
    throw new Error("Ungültige E-Mail-Adresse");
  }

  if (password.length < 8) {
    throw new Error("Passwort muss mindestens 8 Zeichen lang sein");
  }
  if (!/\d/.test(password) && !/[!@#$%^&*]/.test(password) && !/[A-Z]/.test(password) ) {
    throw new Error("Passwort muss mindestens eine Zahl, ein Sonderzeichen und einen Großbuchstaben enthalten");
  }  
  if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
    return "Ungültiger Benutzername";
  }
return null;

}

function validateEmail(email) {
if (typeof email !== "string") return false;
email = email.trim();
if (email === "") return false;
return validator.isEmail(email);
}


app.post("/api/register", async (req, res) => {
  try {
  const {anrede,vorname,nachname,adresse,plz,ort,email,username,password,} = req.body;  //Destrukturierung der empfangenen Daten aus req.body, um die einzelnen Felder leichter verwenden zu können
   const validationError = validateRegisterData(req.body)
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }
    const passwordHash = await bcrypt.hash(password, 10); //hashing mit bcrypt 
    await pool.query(
      `INSERT INTO users 
      (anrede, vorname, nachname, adresse, plz, ort, email, username, password_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,  
      [anrede, vorname, nachname, adresse, plz, ort, email, username, passwordHash]
    ); 

    return res.status(201).json({ message: "Registrierung erfolgreich" });

  } catch (error) {
    if(error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "E-Mail oder Benutzername bereits vergeben" });
    }
    console.error(error);
    res.status(500).json({ message: "Fehler bei der Registrierung" });
  }
});

// REQ = REQUEST
// RES = RESPONSE
const fakeHash = await bcrypt.hash("fakepassword", 10); //fake-hash für timing attack prevention (außerhalb vom Endpoint)
app.post("/api/login", async (req, res) => {  
  try
    {const { email, password } = req.body;
    const validationError = validateEmail(req.body.email);
    if (!validationError) {
      return res.status(400).json({ message: "Ungültige E-Mail" });
    }
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);  

 
    const user = rows[0];
    const hashToCompare = user ? user.password_hash : fakeHash;
    const passwordMatch = await bcrypt.compare(password, hashToCompare); 

      if (!user || !passwordMatch) {
      return res.status(401).json({
        message: "Ungültige E-Mail oder Passwort"
      });
    }
      const { password_hash, ...safeUser } = user;

    res.json({message: "Login erfolgreich", user: safeUser});
    } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Fehler beim Login" });}

});