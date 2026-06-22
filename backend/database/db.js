import mysql from "mysql2/promise"; // mysql2 mit Promise-Unterstützung importieren
import dotenv from "dotenv";

dotenv.config(); // lädt die Umgebungsvariablen aus der .env-Datei, damit wir z.B. die DB-Zugangsdaten flexibel konfigurieren können

// Glue Code to connect to MySQL database using the mysql2 library with connection pooling

export const pool = mysql.createPool({ // Erstellen eines Verbindungs-Pools zur MySQL-Datenbank mit den Zugangsdaten aus den Umgebungsvariablen 
    //Pool hilft bei Performance, da Verbindungen wiederverwendet werden können, anstatt für jede Anfrage eine neue Verbindung zu erstellen
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  charset: "utf8mb4", // Umlaute/Sonderzeichen korrekt übertragen
});