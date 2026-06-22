// Produktkarte mit Name, Bild, Preis und Bewertung (US30) sowie
// "In den Warenkorb"-Button (US31). Das eigentliche Hinzufügen erfolgt
// im onAdd-Callback der Elternkomponente (AJAX, ohne Reload).
function ProductCard({ product, onAdd }) {
  const price = Number(product.price).toFixed(2);
  const rating = Number(product.rating).toFixed(1);

  return (
    <div className="card h-100 shadow-sm border-0">
      {product.image_url && (
        <img
          src={product.image_url}
          className="card-img-top"
          alt={product.name}
          style={{ objectFit: "cover", height: 200 }}
        />
      )}
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{product.name}</h5>
        {product.description && (
          <p className="card-text text-muted small">{product.description}</p>
        )}
        <p className="text-secondary small mb-2">Bewertung: {rating} / 5</p>
        <div className="mt-auto d-flex justify-content-between align-items-center">
          <span className="fw-bold">{price} €</span>
          <button className="btn btn-dark btn-sm" onClick={() => onAdd(product.id)}>
            In den Warenkorb
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
