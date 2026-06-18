import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getInvoice } from "../services/orderService";

// Druckbare Rechnung, die in einem eigenen Fenster geöffnet wird (US65).
// Zeigt Rechnungsnummer, Datum, Positionen und Anschrift und ruft window.print() auf.
function InvoicePrint() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const invoice = await getInvoice(id);
        setData(invoice);
      } catch {
        setError("Rechnung konnte nicht geladen werden.");
      }
    }
    load();
  }, [id]);

  // Nach dem Laden automatisch den Druckdialog öffnen.
  useEffect(() => {
    if (data) {
      const timer = setTimeout(() => window.print(), 300);
      return () => clearTimeout(timer);
    }
  }, [data]);

  if (error) return <div className="p-4 text-danger">{error}</div>;
  if (!data) return <div className="p-4">Wird geladen…</div>;

  const { order, items, customer } = data;

  return (
    <div className="container py-5" style={{ maxWidth: 800 }}>
      <div className="d-flex justify-content-between mb-5">
        <div>
          <h1 className="fw-bold mb-0">Nil</h1>
          <p className="text-muted mb-0">Webshop</p>
        </div>
        <div className="text-end">
          <h2 className="h4 mb-1">Rechnung</h2>
          <p className="mb-0"><strong>{order.invoice_number}</strong></p>
          <p className="mb-0">Datum: {new Date(order.created_at).toLocaleDateString("de-AT")}</p>
        </div>
      </div>

      {/* Rechnungsanschrift (US65) */}
      <div className="mb-5">
        <p className="text-muted mb-1">Rechnungsadresse</p>
        <p className="mb-0">{customer.anrede} {customer.vorname} {customer.nachname}</p>
        <p className="mb-0">{customer.adresse}</p>
        <p className="mb-0">{customer.plz} {customer.ort}</p>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Position</th>
            <th className="text-end">Einzelpreis</th>
            <th className="text-center">Menge</th>
            <th className="text-end">Summe</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.product_name}</td>
              <td className="text-end">{Number(item.unit_price).toFixed(2)} €</td>
              <td className="text-center">{item.quantity}</td>
              <td className="text-end">{(Number(item.unit_price) * item.quantity).toFixed(2)} €</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th colSpan={3} className="text-end">Gesamtbetrag</th>
            <th className="text-end">{Number(order.total).toFixed(2)} €</th>
          </tr>
        </tfoot>
      </table>

      <p className="text-muted small mt-5">Vielen Dank für deinen Einkauf bei Nil.</p>
    </div>
  );
}

export default InvoicePrint;
