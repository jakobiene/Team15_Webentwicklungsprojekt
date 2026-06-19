import { useEffect, useState } from "react";
import { getCategories, getProducts } from "../services/productService";
import { addToCart } from "../services/cartService";
import ProductCard from "../components/ProductCard";

function Products({ onCartChange }) {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(undefined);
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
      } catch {
        setError("Kategorien konnten nicht geladen werden.");
      }
    }

    loadCategories();
  }, []);

  useEffect(() => {
    // Vor dem Laden der Kategorien ist noch keine Kategorie gewählt -> nichts tun.
    if (selectedCategoryId === undefined) {
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
      } catch {
        setError("Produkte konnten nicht geladen werden.");
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
  }, [selectedCategoryId, searchTerm]);

  // Produkt via AJAX in den Warenkorb legen, ohne die Seite zu verlassen (US31).
  // Die zurückgelieferte Anzahl aktualisiert das Warenkorb-Badge in der Navbar (US32).
  async function handleAddToCart(productId) {
    try {
      const cart = await addToCart(productId, 1);
      onCartChange?.(cart.count);
      setError("");
    } catch {
      setError("Produkt konnte nicht in den Warenkorb gelegt werden.");
    }
  }

  return (
    <main className="bg-light min-vh-100">
      <div className="container py-5">
        <header className="mb-4">
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
          <button
            className={`btn ${
              selectedCategoryId === null ? "btn-dark" : "btn-outline-dark"
            }`}
            onClick={() => setSelectedCategoryId(null)}
          >
            Alle
          </button>
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
              <ProductCard product={product} onAdd={handleAddToCart} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default Products;
 
