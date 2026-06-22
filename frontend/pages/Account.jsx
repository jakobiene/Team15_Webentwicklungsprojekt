import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getOrders, updateAccount } from "../services/orderService";

// "Mein Konto": Stammdaten einsehen/bearbeiten (US60–US63) und Bestellhistorie (US64).

// Maskiert sensible Daten, sodass sie nicht vollständig angezeigt werden (US62).
function maskEmail(email) {
  if (!email || !email.includes("@")) return "•••";
  const [local, domain] = email.split("@");
  const visible = local.slice(0, 1);
  return `${visible}${"*".repeat(Math.max(local.length - 1, 1))}@${domain}`;
}

const EDITABLE_FIELDS = [
  { name: "vorname", label: "Vorname" },
  { name: "nachname", label: "Nachname" },
  { name: "adresse", label: "Adresse" },
  { name: "plz", label: "PLZ" },
  { name: "ort", label: "Ort" },
  { name: "email", label: "E-Mail", type: "email" },
];

function Account({ user, onUserUpdate }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [currentPassword, setCurrentPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [orders, setOrders] = useState([]);
  const [ordersError, setOrdersError] = useState("");

  // Bestellungen laden (US64).
  useEffect(() => {
    async function load() {
      try {
        const data = await getOrders();
        setOrders(data.orders || []);
      } catch {
        setOrdersError("Bestellungen konnten nicht geladen werden.");
      }
    }
    load();
  }, []);

  function startEdit() {
    setForm({
      anrede: user.anrede ?? "",
      vorname: user.vorname ?? "",
      nachname: user.nachname ?? "",
      adresse: user.adresse ?? "",
      plz: user.plz ?? "",
      ort: user.ort ?? "",
      email: user.email ?? "",
    });
    setCurrentPassword("");
    setMessage("");
    setError("");
    setEditing(true);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const data = await updateAccount({ ...form, currentPassword });
      onUserUpdate?.(data.user); // App-State + Navbar aktualisieren
      setMessage("Daten erfolgreich aktualisiert.");
      setError("");
      setEditing(false);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="container py-5">
      <h1 className="fw-bold mb-4">Mein Konto</h1>

      {message && <div className="alert alert-success">{message}</div>}

      {/* --- Stammdaten --- */}
      <section className="card shadow-sm border-0 mb-5">
        <div className="card-body">
          <h2 className="h5 fw-bold mb-3">Meine Daten</h2>

          {!editing ? (
            <>
              <dl className="row mb-0">
                <dt className="col-sm-3">Anrede</dt><dd className="col-sm-9">{user.anrede}</dd>
                <dt className="col-sm-3">Name</dt><dd className="col-sm-9">{user.vorname} {user.nachname}</dd>
                <dt className="col-sm-3">Adresse</dt><dd className="col-sm-9">{user.adresse}, {user.plz} {user.ort}</dd>
                <dt className="col-sm-3">Benutzername</dt><dd className="col-sm-9">{user.username}</dd>
                <dt className="col-sm-3">E-Mail</dt><dd className="col-sm-9">{maskEmail(user.email)}</dd>
                <dt className="col-sm-3">Passwort</dt><dd className="col-sm-9">••••••••</dd>
              </dl>
              <button className="btn btn-dark mt-3" onClick={startEdit}>Daten bearbeiten</button>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="mb-3">
                <label className="form-label">Anrede</label>
                <select className="form-select" name="anrede" value={form.anrede} onChange={handleChange} required>
                  <option value="">Bitte wählen</option>
                  <option value="Herr">Herr</option>
                  <option value="Frau">Frau</option>
                  <option value="Divers">Divers</option>
                </select>
              </div>
              <div className="row">
                {EDITABLE_FIELDS.map((field) => (
                  <div className="col-md-6 mb-3" key={field.name}>
                    <label className="form-label">{field.label}</label>
                    <input
                      className="form-control"
                      type={field.type ?? "text"}
                      name={field.name}
                      value={form[field.name]}
                      onChange={handleChange}
                      required
                    />
                  </div>
                ))}
              </div>
              {/* Passwortabfrage für Änderungen (US63) */}
              <div className="mb-3">
                <label className="form-label">Aktuelles Passwort (zur Bestätigung)</label>
                <input
                  className="form-control"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <button className="btn btn-dark" type="submit">Speichern</button>
              <button className="btn btn-outline-secondary ms-2" type="button" onClick={() => setEditing(false)}>
                Abbrechen
              </button>
            </form>
          )}
        </div>
      </section>

      {/* --- Bestellhistorie (US64) --- */}
      <section>
        <h2 className="h5 fw-bold mb-3">Meine Bestellungen</h2>
        {ordersError && <div className="alert alert-danger">{ordersError}</div>}
        {orders.length === 0 ? (
          <p className="text-muted">Du hast noch keine Bestellungen aufgegeben.</p>
        ) : (
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Rechnungsnr.</th>
                <th>Datum</th>
                <th className="text-end">Summe</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.invoice_number}</td>
                  <td>{new Date(order.created_at).toLocaleDateString("de-AT")}</td>
                  <td className="text-end">{Number(order.total).toFixed(2)} €</td>
                  <td className="text-end">
                    <Link className="btn btn-sm btn-outline-dark" to={`/orders/${order.id}`}>
                      Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}

export default Account;
