import express from "express";
import cors from "cors";
import dotenv from "dotenv";

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
});