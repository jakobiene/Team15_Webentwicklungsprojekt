import { pool } from "../../database/db.js";

// Zentrale DB-Service-Klasse für alle Produkt- und Kategorie-Queries (US01/US03).
// Die Endpoints in server.js enthalten dadurch selbst keine SQL-Statements.
// Schema: categories(id, name, sort_order, is_active),
//         products(id, category_id, name, description, image_url, price, rating, is_active)

// Liefert alle aktiven Kategorien in Sortierreihenfolge (US30).
export async function findAllCategories() {
  const [rows] = await pool.query(
    `SELECT id, name
     FROM categories
     WHERE is_active = 1
     ORDER BY sort_order, name`
  );
  return rows;
}

// Liefert Produkte, optional nach Kategorie gefiltert und/oder per Suchbegriff (US30, US40).
// includeInactive = true wird nur im Admin-Bereich verwendet (US72).
export async function findProducts({ categoryId, search, includeInactive = false } = {}) {
  let sql = `
    SELECT id, category_id, name, description, image_url, price, rating, is_active
    FROM products
    WHERE 1 = 1
  `;
  const params = [];

  if (!includeInactive) {
    sql += " AND is_active = 1";
  }
  if (categoryId) {
    sql += " AND category_id = ?";
    params.push(categoryId);
  }
  if (search) {
    sql += " AND name LIKE ?";
    params.push(`%${search}%`);
  }
  sql += " ORDER BY name";

  const [rows] = await pool.query(sql, params);
  return rows;
}

// Einzelnes Produkt (für Warenkorb/Bestellung).
export async function findProductById(id) {
  const [rows] = await pool.query(
    `SELECT id, category_id, name, description, image_url, price, rating, is_active
     FROM products WHERE id = ?`,
    [id]
  );
  return rows[0] ?? null;
}

// Mehrere Produkte anhand ihrer IDs (für Warenkorb-Ansicht, US33).
export async function findProductsByIds(ids) {
  if (!ids.length) return [];
  const placeholders = ids.map(() => "?").join(",");
  const [rows] = await pool.query(
    `SELECT id, category_id, name, description, image_url, price, rating, is_active
     FROM products WHERE id IN (${placeholders})`,
    ids
  );
  return rows;
}

// --- Admin-Operationen (US70/US72/US73) ---

export async function createProduct({ categoryId, name, description, imageUrl, price, rating }) {
  const [result] = await pool.query(
    `INSERT INTO products (category_id, name, description, image_url, price, rating)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [categoryId, name, description ?? null, imageUrl ?? null, price, rating ?? 0]
  );
  return findProductById(result.insertId);
}

export async function updateProduct(id, { categoryId, name, description, imageUrl, price, rating }) {
  await pool.query(
    `UPDATE products
     SET category_id = ?, name = ?, description = ?, image_url = ?, price = ?, rating = ?
     WHERE id = ?`,
    [categoryId, name, description ?? null, imageUrl ?? null, price, rating ?? 0, id]
  );
  return findProductById(id);
}

export async function deleteProduct(id) {
  const [result] = await pool.query("DELETE FROM products WHERE id = ?", [id]);
  return result.affectedRows > 0;
}
