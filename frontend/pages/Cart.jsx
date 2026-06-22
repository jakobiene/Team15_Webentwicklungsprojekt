import { useEffect, useState } from "react";
import { fetchCart, updateCartItem, removeCartItem } from "../services/cartService";

function Cart({ onCartChange }) {
  const [cart, setCart] = useState({ items: [], total: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchCart();
        setCart(data);
      } catch {
        setError("Warenkorb konnte nicht geladen werden");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function applyCart(data) {
    setCart(data);
    onCartChange?.(data.count);
  }

  async function handleQuantity(productId, quantity) {
    try {
      applyCart(await updateCartItem(productId, quantity));
    } catch {
      setError("Menge konnte nicht aktualisiert werden");
    }
  }

  async function handleRemove(productId) {
    try {
      applyCart(await removeCartItem(productId));
    } catch {
      setError("Produkt konnte nicht entfernt werden");
    }
  }

  if (loading) return <div className="container py-4"><p className="text-muted">Wird geladen…</p></div>;

  return (
    <div className="container py-4">
      <h1 className="mb-4">Warenkorb</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      {cart.items.length === 0 ? (
        <p className="text-muted">Dein Warenkorb ist leer.</p>
      ) : (
        <>
          <ul className="list-group mb-4">
            {cart.items.map(({ product, quantity, subtotal }) => (
              <li className="list-group-item d-flex align-items-center gap-3" key={product.id}>
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    style={{ width: 60, height: 60, objectFit: "cover" }}
                  />
                )}
                <div className="flex-grow-1">
                  <div className="fw-bold">{product.name}</div>
                  <div className="text-muted small">{Number(product.price).toFixed(2)} € / Stück</div>
                </div>
                <div className="btn-group" role="group">
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => handleQuantity(product.id, quantity - 1)}
                  >−</button>
                  <span className="btn btn-outline-secondary btn-sm disabled">{quantity}</span>
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => handleQuantity(product.id, quantity + 1)}
                  >+</button>
                </div>
                <div className="fw-bold" style={{ minWidth: 80, textAlign: "right" }}>
                  {Number(subtotal).toFixed(2)} €
                </div>
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => handleRemove(product.id)}
                >Entfernen</button>
              </li>
            ))}
          </ul>

          <div className="d-flex justify-content-end">
            <h4>Gesamt: {Number(cart.total).toFixed(2)} €</h4>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;
