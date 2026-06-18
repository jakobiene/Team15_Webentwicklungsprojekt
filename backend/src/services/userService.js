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

// Aktualisiert die Stammdaten eines Users (US61). Gibt den aktualisierten
// öffentlichen Datensatz (ohne Hash) zurück.
export async function updateStammdaten(id, data) {
  const { anrede, vorname, nachname, adresse, plz, ort, email } = data;
  await pool.query(
    `UPDATE users
     SET anrede = ?, vorname = ?, nachname = ?, adresse = ?, plz = ?, ort = ?, email = ?
     WHERE id = ?`,
    [anrede, vorname, nachname, adresse, plz, ort, email, id]
  );
  return findPublicUserById(id);
}

// --- Admin-Operationen (US80/US81) ---

// Listet alle Kunden (role = 0) inkl. Anzahl ihrer Bestellungen auf (US80).
export async function findAllCustomers() {
  const [rows] = await pool.query(
    `SELECT u.id, u.anrede, u.vorname, u.nachname, u.email, u.username,
            u.is_active, u.created_at,
            COUNT(o.id) AS order_count
     FROM users u
     LEFT JOIN orders o ON o.user_id = u.id
     WHERE u.role = 0
     GROUP BY u.id
     ORDER BY u.nachname, u.vorname`
  );
  return rows;
}

// Setzt einen Kunden aktiv/inaktiv (US81). Admins (role = 2) bleiben unangetastet.
export async function setCustomerActive(id, isActive) {
  const [result] = await pool.query(
    "UPDATE users SET is_active = ? WHERE id = ? AND role = 0",
    [isActive ? 1 : 0, id]
  );
  return result.affectedRows > 0;
}

// Entfernt den Hash aus einem vollständigen User-Objekt (für die Session).
export function toPublicUser(user) {
  if (!user) return null;
  const { password_hash, ...safe } = user;
  return safe;
}
