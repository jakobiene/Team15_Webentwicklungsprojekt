import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrder } from "../services/orderService";

// Detailansicht einer Bestellung mit Positionen (US64) und Rechnungsdruck (US65).
function OrderDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setData(await getOrder(id));
      } catch {
        setError("Bestellung konnte nicht geladen werden.");
      }
    }
    load();
  }, [id]);

  // Öffnet die druckbare Rechnung in einem neuen Fenster (US65).
  function printInvoice() {
    window.open(`/invoice/${id}`, "_blank", "noopener,noreferrer");
  }

  if (error) return <main className="container py-5"><div className="alert alert-danger">{error}</div></main>;
  if (!data) return <main className="container py-5"><p className="text-muted">Wird geladen…</p></main>;

  const { order, items } = data;

  return (
    <main className="container py-5">
      <Link to="/account" className="btn btn-link text-dark px-0 mb-3">← Zurück zu Mein Konto</Link>
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-4">
        <div>
          <h1 className="fw-bold mb-1">Bestellung {order.invoice_number}</h1>
          <p className="text-muted mb-0">
            Datum: {new Date(order.created_at).toLocaleDateString("de-AT")}
          </p>
        </div>
        <button className="btn btn-dark" onClick={printInvoice}>Rechnung drucken</button>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Produkt</th>
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
            <th colSpan={3} className="text-end">Gesamt</th>
            <th className="text-end">{Number(order.total).toFixed(2)} €</th>
          </tr>
        </tfoot>
      </table>
    </main>
  );
}

export default OrderDetail;
