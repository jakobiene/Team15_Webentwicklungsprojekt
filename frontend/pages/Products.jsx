import { useEffect, useState } from "react";
import { getCategories, getProducts } from "../services/productService";

function Products() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories();
        const loadedCategories = data.categories || [];

        setCategories(loadedCategories);
        setSelectedCategoryId(loadedCategories[0]?.id ?? null);
        setError("");
      } catch (err) {
        setError("Kategorien konnten nicht geladen werden.");
      }
    }

    loadCategories();
  }, []);

  useEffect(() => {
    if (!selectedCategoryId) {
      setProducts([]);
      setIsLoading(false);
      return;
    }

    async function loadProducts() {
      try {
        setIsLoading(true);
        const data = await getProducts({
          categoryId: selectedCategoryId,
          search: searchTerm,
        });

        setProducts(data.products || []);
        setError("");
      } catch (err) {
        setError("Produkte konnten nicht geladen werden.");
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
  }, [selectedCategoryId, searchTerm]);

  return (
    <main className="bg-light min-vh-100">
      <div className="container py-5">
        <header className="mb-4">
          <p className="text-uppercase text-primary fw-semibold mb-2">
            Sortiment
          </p>
          <h1 className="display-6 fw-bold text-dark mb-2">Produkte</h1>
          <p className="text-secondary fs-5 mb-0">
            Wähle eine Kategorie und entdecke passende Produkte.
          </p>
        </header>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="mb-4">
          <label className="form-label fw-semibold" htmlFor="productSearch">
            Produkte suchen
          </label>
          <input
            className="form-control"
            id="productSearch"
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Produktname eingeben..."
            type="search"
            value={searchTerm}
          />
        </div>

        <div className="d-flex flex-wrap gap-2 mb-4">
          {categories.map((category) => (
            <button
              className={`btn ${
                selectedCategoryId === category.id
                  ? "btn-dark"
                  : "btn-outline-dark"
              }`}
              key={category.id}
              onClick={() => setSelectedCategoryId(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>

        {isLoading && <p className="text-secondary">Produkte werden geladen...</p>}

        {!isLoading && products.length === 0 && (
          <p className="text-secondary">
            Keine Produkte für diese Auswahl gefunden.
          </p>
        )}

        <div className="row g-4">
          {products.map((product) => (
            <div className="col-sm-6 col-lg-4" key={product.id}>
              <article className="card h-100 border-0 shadow-sm">
                <img
                  src={product.image_url}
                  className="card-img-top"
                  alt={product.name}
                />
                <div className="card-body">
                  <h2 className="h5 fw-bold text-dark mb-2">
                    {product.name}
                  </h2>
                  <p className="text-secondary mb-2">
                    Bewertung: {Number(product.rating).toFixed(1)} / 5
                  </p>
                  <p className="fs-5 fw-semibold text-dark mb-0">
                    {Number(product.price).toFixed(2)} EUR
                  </p>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default Products;
 
