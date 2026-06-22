import { useEffect, useState } from "react";
import {
  getCustomers,
  getCustomerOrders,
  getAdminOrder,
  setCustomerActive,
  removeOrderItem,
} from "../services/adminService";

// Kundenverwaltung für Admins (US80–US82):
// Kunden auflisten, aktivieren/deaktivieren, Bestellungen + Positionen einsehen
// und einzelne Positionen aus einer Bestellung entfernen.
function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState("");

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null); // { order, items }

  async function loadCustomers() {
    try {
      const data = await getCustomers();
      setCustomers(data.customers || []);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    async function init() {
      try {
        const data = await getCustomers();
        setCustomers(data.customers || []);
      } catch (err) {
        setError(err.message);
      }
    }
    init();
  }, []);

  // Kunde aktiv/inaktiv schalten (US81).
  async function toggleActive(customer) {
    try {
      await setCustomerActive(customer.id, !customer.is_active);
      loadCustomers();
    } catch (err) {
      setError(err.message);
    }
  }

  // Bestellungen eines Kunden anzeigen (US80).
  async function showOrders(customer) {
    setSelectedCustomer(customer);
    setSelectedOrder(null);
    try {
      const data = await getCustomerOrders(customer.id);
      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message);
    }
  }

  // Detail einer Bestellung mit Positionen laden (US80/US82).
  async function showOrderDetail(orderId) {
    try {
      setSelectedOrder(await getAdminOrder(orderId));
    } catch (err) {
      setError(err.message);
    }
  }

  // Einzelne Position aus einer Bestellung entfernen (US82).
  async function handleRemoveItem(orderId, itemId) {
    if (!window.confirm("Diese Position wirklich aus der Bestellung entfernen?")) return;
    try {
      await removeOrderItem(orderId, itemId);
      await showOrderDetail(orderId); // Detail neu laden (Summe aktualisiert sich)
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="container py-5">
      <h1 className="fw-bold mb-4">Kunden bearbeiten</h1>
      {error && <div className="alert alert-danger">{error}</div>}

      {/* --- Kundenliste --- */}
      <table className="table align-middle">
        <thead>
          <tr>
            <th>Name</th>
            <th>E-Mail</th>
            <th className="text-center">Bestellungen</th>
            <th className="text-center">Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id}>
              <td>{c.vorname} {c.nachname}</td>
              <td>{c.email}</td>
              <td className="text-center">{c.order_count}</td>
              <td className="text-center">
                {c.is_active
                  ? <span className="badge bg-success">aktiv</span>
                  : <span className="badge bg-secondary">inaktiv</span>}
              </td>
              <td className="text-end">
                <button className="btn btn-sm btn-outline-dark me-2" onClick={() => showOrders(c)}>
                  Bestellungen
                </button>
                <button
                  className={`btn btn-sm ${c.is_active ? "btn-outline-danger" : "btn-outline-success"}`}
                  onClick={() => toggleActive(c)}
                >
                  {c.is_active ? "Deaktivieren" : "Aktivieren"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* --- Bestellungen des gewählten Kunden --- */}
      {selectedCustomer && (
        <section className="mt-5">
          <h2 className="h5 fw-bold mb-3">
            Bestellungen von {selectedCustomer.vorname} {selectedCustomer.nachname}
          </h2>
          {orders.length === 0 ? (
            <p className="text-muted">Keine Bestellungen vorhanden.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Rechnungsnr.</th>
                  <th>Datum</th>
                  <th className="text-end">Summe</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>{o.invoice_number}</td>
                    <td>{new Date(o.created_at).toLocaleDateString("de-AT")}</td>
                    <td className="text-end">{Number(o.total).toFixed(2)} €</td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-dark" onClick={() => showOrderDetail(o.id)}>
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      {/* --- Positionen einer Bestellung (mit Entfernen, US82) --- */}
      {selectedOrder && (
        <section className="mt-4 card shadow-sm border-0">
          <div className="card-body">
            <h3 className="h6 fw-bold mb-3">
              Positionen – {selectedOrder.order.invoice_number}
            </h3>
            <table className="table mb-0">
              <thead>
                <tr>
                  <th>Produkt</th>
                  <th className="text-end">Einzelpreis</th>
                  <th className="text-center">Menge</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.product_name}</td>
                    <td className="text-end">{Number(item.unit_price).toFixed(2)} €</td>
                    <td className="text-center">{item.quantity}</td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleRemoveItem(selectedOrder.order.id, item.id)}
                      >
                        Entfernen
                      </button>
                    </td>
                  </tr>
                ))}
                {selectedOrder.items.length === 0 && (
                  <tr><td colSpan={4} className="text-muted">Keine Positionen mehr in dieser Bestellung.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}

export default AdminCustomers;
