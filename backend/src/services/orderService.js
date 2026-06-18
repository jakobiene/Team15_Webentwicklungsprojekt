import { pool } from "../../database/db.js";

// Zentrale DB-Service-Klasse für Bestellungen (US50/US51, US64/US65).
// Produktname und Einzelpreis werden je Position als Snapshot gespeichert,
// damit Bestellungen/Rechnungen korrekt bleiben, wenn sich Produkte später ändern.

// Legt eine Bestellung aus der aktuellen Warenkorb-Ansicht an (transaktional).
// cartView = { items: [{ product, quantity, subtotal }], total }
export async function createOrder(userId, cartView) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      "INSERT INTO orders (user_id, total) VALUES (?, ?)",
      [userId, cartView.total]
    );
    const orderId = result.insertId;

    // Rechnungsnummer deterministisch aus der Order-ID ableiten.
    const invoiceNumber = `RE-${new Date().getFullYear()}-${String(orderId).padStart(4, "0")}`;
    await conn.query("UPDATE orders SET invoice_number = ? WHERE id = ?", [invoiceNumber, orderId]);

    for (const item of cartView.items) {
      await conn.query(
        `INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.product.id, item.product.name, item.product.price, item.quantity]
      );
    }

    await conn.commit();
    return orderId;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

// Alle Bestellungen eines Users, nach Datum aufsteigend (US64 / Spezifikation 6c).
export async function findOrdersByUser(userId) {
  const [rows] = await pool.query(
    `SELECT id, invoice_number, total, created_at
     FROM orders
     WHERE user_id = ?
     ORDER BY created_at ASC, id ASC`,
    [userId]
  );
  return rows;
}

// Eine Bestellung inkl. Positionen. Wenn userId gesetzt ist, wird geprüft,
// dass die Bestellung diesem User gehört (Kundensicht). Admins rufen ohne userId auf.
export async function findOrderById(orderId, userId = null) {
  let sql = "SELECT id, user_id, invoice_number, total, created_at FROM orders WHERE id = ?";
  const params = [orderId];
  if (userId !== null) {
    sql += " AND user_id = ?";
    params.push(userId);
  }
  const [orders] = await pool.query(sql, params);
  const order = orders[0];
  if (!order) return null;

  const [items] = await pool.query(
    `SELECT id, product_id, product_name, unit_price, quantity
     FROM order_items
     WHERE order_id = ?
     ORDER BY id`,
    [orderId]
  );
  return { order, items };
}

// Entfernt eine einzelne Position aus einer Bestellung und korrigiert die Summe (US82, Admin).
export async function removeOrderItem(orderId, itemId) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query(
      "DELETE FROM order_items WHERE id = ? AND order_id = ?",
      [itemId, orderId]
    );
    // Summe neu berechnen
    const [[sum]] = await conn.query(
      "SELECT COALESCE(SUM(unit_price * quantity), 0) AS total FROM order_items WHERE order_id = ?",
      [orderId]
    );
    await conn.query("UPDATE orders SET total = ? WHERE id = ?", [sum.total, orderId]);
    await conn.commit();
    return result.affectedRows > 0;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}
