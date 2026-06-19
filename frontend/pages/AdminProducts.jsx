import { useEffect, useState } from "react";
import { getCategories } from "../services/productService";
import {
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/adminService";

// Produktverwaltung für Admins: anlegen, bearbeiten, löschen (US70–US73).
// Produktfoto (US71) wahlweise als Datei-Upload ODER als Bild-URL.

const EMPTY_FORM = {
  categoryId: "",
  name: "",
  description: "",
  imageUrl: "",
  price: "",
  rating: "",
};

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null); // optional hochgeladene Bilddatei (US71)
  const [editingId, setEditingId] = useState(null); // null = Neuanlage
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadProducts() {
    try {
      const data = await getAdminProducts();
      setProducts(data.products || []);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    async function init() {
      try {
        const data = await getAdminProducts();
        setProducts(data.products || []);
        const cats = await getCategories();
        setCategories(cats.categories || []);
      } catch (err) {
        setError(err.message);
      }
    }
    init();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setImageFile(null);
    setEditingId(null);
  }

  function startEdit(product) {
    setForm({
      categoryId: String(product.category_id),
      name: product.name,
      description: product.description ?? "",
      imageUrl: product.image_url ?? "",
      price: String(product.price),
      rating: String(product.rating),
    });
    setImageFile(null);
    setEditingId(product.id);
    setMessage("");
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      categoryId: Number(form.categoryId),
      name: form.name,
      description: form.description,
      imageUrl: form.imageUrl,
      price: Number(form.price),
      rating: form.rating === "" ? 0 : Number(form.rating),
    };
    try {
      if (editingId) {
        await updateProduct(editingId, payload, imageFile);
        setMessage("Produkt aktualisiert.");
      } else {
        await createProduct(payload, imageFile);
        setMessage("Produkt angelegt.");
      }
      resetForm();
      setError("");
      loadProducts();
    } catch (err) {
      setError(err.message);
    }
  }

  // Ausgewählte Bilddatei übernehmen (US71).
  function handleFileChange(e) {
    setImageFile(e.target.files?.[0] ?? null);
  }

  async function handleDelete(product) {
    // Löschen mit Bestätigung (US73).
    if (!window.confirm(`Produkt "${product.name}" wirklich löschen?`)) return;
    try {
      await deleteProduct(product.id);
      setMessage("Produkt gelöscht.");
      loadProducts();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="container py-5">
      <h1 className="fw-bold mb-4">Produkte bearbeiten</h1>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* --- Formular zum Anlegen/Bearbeiten --- */}
      <section className="card shadow-sm border-0 mb-5">
        <div className="card-body">
          <h2 className="h5 fw-bold mb-3">
            {editingId ? "Produkt bearbeiten" : "Neues Produkt anlegen"}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Name</label>
                <input className="form-control" name="name" value={form.name} onChange={handleChange} required />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Kategorie</label>
                <select className="form-select" name="categoryId" value={form.categoryId} onChange={handleChange} required>
                  <option value="">Bitte wählen</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-12 mb-3">
                <label className="form-label">Beschreibung</label>
                <textarea className="form-control" name="description" rows={2} value={form.description} onChange={handleChange} />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Produktfoto hochladen</label>
                <input className="form-control" type="file" accept="image/*" onChange={handleFileChange} />
                <div className="form-text">Optional. Alternativ unten eine Bild-URL angeben.</div>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Bild-URL (Alternative zum Upload)</label>
                <input className="form-control" name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="https://…" disabled={!!imageFile} />
              </div>
              <div className="col-md-3 mb-3">
                <label className="form-label">Preis (€)</label>
                <input className="form-control" type="number" step="0.01" min="0" name="price" value={form.price} onChange={handleChange} required />
              </div>
              <div className="col-md-3 mb-3">
                <label className="form-label">Bewertung (0–5)</label>
                <input className="form-control" type="number" step="0.1" min="0" max="5" name="rating" value={form.rating} onChange={handleChange} />
              </div>
            </div>
            {/* Vorschau des Produktfotos (US71): hochgeladene Datei hat Vorrang vor der URL */}
            {(imageFile || form.imageUrl) && (
              <img
                src={imageFile ? URL.createObjectURL(imageFile) : form.imageUrl}
                alt="Vorschau"
                style={{ height: 80, objectFit: "cover" }}
                className="mb-3 rounded"
              />
            )}
            <div>
              <button className="btn btn-dark" type="submit">
                {editingId ? "Speichern" : "Anlegen"}
              </button>
              {editingId && (
                <button className="btn btn-outline-secondary ms-2" type="button" onClick={resetForm}>
                  Abbrechen
                </button>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* --- Produktliste --- */}
      <table className="table align-middle">
        <thead>
          <tr>
            <th>Bild</th>
            <th>Name</th>
            <th>Kategorie</th>
            <th className="text-end">Preis</th>
            <th className="text-center">Bewertung</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.image_url && <img src={p.image_url} alt={p.name} style={{ width: 48, height: 48, objectFit: "cover" }} />}</td>
              <td>{p.name}{!p.is_active && <span className="badge bg-secondary ms-2">inaktiv</span>}</td>
              <td>{categories.find((c) => c.id === p.category_id)?.name ?? p.category_id}</td>
              <td className="text-end">{Number(p.price).toFixed(2)} €</td>
              <td className="text-center">{Number(p.rating).toFixed(1)}</td>
              <td className="text-end">
                <button className="btn btn-sm btn-outline-dark me-2" onClick={() => startEdit(p)}>Bearbeiten</button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(p)}>Löschen</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

export default AdminProducts;
