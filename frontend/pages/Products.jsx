import { useState } from "react";

const categories = [
  { id: 1, name: "Elektronik" },
  { id: 2, name: "Haushalt" },
  { id: 3, name: "Freizeit" },
];

const products = [
  {
    id: 1,
    categoryId: 1,
    name: "Wireless Kopfhörer",
    imageUrl: "https://placehold.co/600x400?text=Kopfhoerer",
    price: 79.99,
    rating: 4.6,
  },
  {
    id: 2,
    categoryId: 1,
    name: "Smartwatch",
    imageUrl: "https://placehold.co/600x400?text=Smartwatch",
    price: 129.99,
    rating: 4.4,
  },
  {
    id: 3,
    categoryId: 2,
    name: "Kaffeemaschine",
    imageUrl: "https://placehold.co/600x400?text=Kaffee",
    price: 89.99,
    rating: 4.7,
  },
  {
    id: 4,
    categoryId: 2,
    name: "LED Schreibtischlampe",
    imageUrl: "https://placehold.co/600x400?text=Lampe",
    price: 34.99,
    rating: 4.2,
  },
  {
    id: 5,
    categoryId: 3,
    name: "Fitnessmatte",
    imageUrl: "https://placehold.co/600x400?text=Fitness",
    price: 24.99,
    rating: 4.5,
  },
];

function Products() {
  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0].id);
  const filteredProducts = products.filter(
    (product) => product.categoryId === selectedCategoryId
  );

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

        <div className="row g-4">
          {filteredProducts.map((product) => (
            <div className="col-sm-6 col-lg-4" key={product.id}>
              <article className="card h-100 border-0 shadow-sm">
                <img
                  src={product.imageUrl}
                  className="card-img-top"
                  alt={product.name}
                />
                <div className="card-body">
                  <h2 className="h5 fw-bold text-dark mb-2">
                    {product.name}
                  </h2>
                  <p className="text-secondary mb-2">
                    Bewertung: {product.rating.toFixed(1)} / 5
                  </p>
                  <p className="fs-5 fw-semibold text-dark mb-0">
                    {product.price.toFixed(2)} EUR
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
 
