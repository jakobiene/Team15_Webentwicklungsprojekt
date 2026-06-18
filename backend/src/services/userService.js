import { pool } from "../../database/db.js";

// Zentrale DB-Service-Klasse für alle Benutzer-Queries (US01/US03).
// password_hash wird nie an die Endpoints zurückgegeben, außer wenn für den
// Passwortvergleich (Login / Änderungen) ausdrücklich benötigt.

const PUBLIC_FIELDS =
  "id, anrede, vorname, nachname, adresse, plz, ort, email, username, role, is_active, created_at";

// Legt einen neuen Benutzer an (US10/US11). password_hash kommt bereits gehasht herein.
export async function createUser(data) {
  const { anrede, vorname, nachname, adresse, plz, ort, email, username, passwordHash } = data;
  const [result] = await pool.query(
    `INSERT INTO users
      (anrede, vorname, nachname, adresse, plz, ort, email, username, password_hash)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [anrede, vorname, nachname, adresse, plz, ort, email, username, passwordHash]
  );
  return result.insertId;
}

// Voller Datensatz inkl. password_hash – nur für Login/Passwortprüfung verwenden.
export async function findUserByEmailWithHash(email) {
  const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
  return rows[0] ?? null;
}

export async function findUserByIdWithHash(id) {
  const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
  return rows[0] ?? null;
}

// Öffentlicher Datensatz (ohne Hash) für Session/Anzeige.
export async function findPublicUserById(id) {
  const [rows] = await pool.query(`SELECT ${PUBLIC_FIELDS} FROM users WHERE id = ?`, [id]);
  return rows[0] ?? null;
}

// Entfernt den Hash aus einem vollständigen User-Objekt (für die Session).
export function toPublicUser(user) {
  if (!user) return null;
  const { password_hash, ...safe } = user;
  return safe;
}
