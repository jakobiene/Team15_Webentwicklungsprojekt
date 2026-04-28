import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt"; //PW Hashing 
import { pool } from "../database/db.js" // Importieren des Verbindungs-Pools aus der db.js, um später in den API-Endpunkten auf die Datenbank zugreifen zu können

dotenv.config(); // lädt die Umgebungsvariablen aus der .env-Datei, damit wir z.B. den PORT flexibel konfigurieren können

const app = express(); // Erstellt eine neue Express-Anwendung
const PORT = process.env.PORT || 5000; //

app.use(cors()); // erlaubt Frontend, auf die API zuzugreifen
app.use(express.json()); // ermöglicht das Parsen von JSON-Daten im Request-Body -> req.body nutzt diesen Middleware, um die Daten zu verarbeiten, die vom Frontend gesendet werden (z.B. bei der Registrierung eines Benutzers)

app.get("/api/test", (req, res) => {
  res.json({ message: "Backend läuft" });
});

app.listen(PORT, () => {
  console.log(`Backend läuft auf http://localhost:${PORT}`);
});

/* <--- Einfacher Test-Endpoint, um zu überprüfen, ob das Backend korrekt läuft und Anfragen empfängt.---->

app.post("/api/register", (req, res) => { //REGISTER-Endpoint, der die Registrierungsdaten vom Frontend empfängt
  const userData = req.body; // Zugriff auf die gesendeten Daten über req.body, da wir express.json() Middleware verwenden

  console.log("Register data received:", userData); //

  // einfache Validierung
  if (!userData.email || !userData.password) {
    return res.status(400).json({
      message: "E-Mail und Passwort sind erforderlich",
    });
  }

  res.status(201).json({
    message: "Registrierung erfolgreich",
  });
});  */

app.post("/api/register", async (req, res) => {
  try {
    const {anrede,vorname,nachname,adresse,plz,ort,email,username,password,} = req.body;  //Destrukturierung der empfangenen Daten aus req.body, um die einzelnen Felder leichter verwenden zu können
    //ist wie const anrede = req.body.anrede; const vorname = req.body.vorname; ...
    const passwordHash = await bcrypt.hash(password, 10); //hashing mit bcrypt 
    await pool.query(
      `INSERT INTO users 
      (anrede, vorname, nachname, adresse, plz, ort, email, username, password_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,  //anti SQL Injection, da die Werte als Parameter übergeben werden und nicht direkt in die SQL-Abfrage eingebettet werden
      [anrede, vorname, nachname, adresse, plz, ort, email, username, passwordHash]
    );

    res.status(201).json({ message: "Registrierung erfolgreich" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Fehler bei der Registrierung" });
  }
});

// REQ = REQUEST
// RES = RESPONSE
app.post("/api/login", async (req, res) => {  
  try
    {const { email, password } = req.body;  //Destrukturierung bedeutet das die richtigen Werte aus req.body extrahiert werden.
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]); //Destructuring Assignment + SQL Injection Schutz + suche User mit Mail
  

    if (rows.length === 0) {
      return res.status(401).json({ message: "Ungültige E-Mail oder Passwort" });
    }   
    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Ungültige E-Mail oder Passwort" });
    }     
    res.json({ message: "Login erfolgreich" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Fehler beim Login" });
  }   

});