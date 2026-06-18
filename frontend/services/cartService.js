const API_URL = "http://localhost:5000/api";

// Warenkorb-Service: kommuniziert via AJAX mit dem Backend, ohne Seiten-Reload (US31, US32).
// credentials: "include" sorgt dafür, dass das Session-Cookie mitgeschickt wird,
// damit der Warenkorb in der Session zugeordnet werden kann.

// Aktuellen Warenkorb laden (Items, Gesamtpreis, Anzahl).
export async function fetchCart() {
  const response = await fetch(`${API_URL}/cart`, { credentials: "include" });
  if (!response.ok) throw new Error("Warenkorb konnte nicht geladen werden");
  return response.json();
}

// Produkt hinzufügen (US31).
export async function addToCart(productId, quantity = 1) {
  const response = await fetch(`${API_URL}/cart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ productId, quantity }),
  });
  if (!response.ok) throw new Error("Produkt konnte nicht hinzugefügt werden");
  return response.json();
}

// Stückzahl absolut setzen (US35).
export async function updateCartItem(productId, quantity) {
  const response = await fetch(`${API_URL}/cart/${productId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ quantity }),
  });
  if (!response.ok) throw new Error("Menge konnte nicht aktualisiert werden");
  return response.json();
}

// Produkt komplett entfernen (US35).
export async function removeCartItem(productId) {
  const response = await fetch(`${API_URL}/cart/${productId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Produkt konnte nicht entfernt werden");
  return response.json();
}
