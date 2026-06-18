import { findProductsByIds } from "./productService.js";

// Der Warenkorb liegt in der Express-Session (req.session.cart) als Map { productId: quantity }.
// Funktioniert für Gäste und eingeloggte User, da die Session unabhängig vom Login lebt –
// dadurch bleibt der Warenkorb auch nach dem Login erhalten (US50).

function getCart(session) {
  if (!session.cart) session.cart = {};
  return session.cart;
}

// Liefert den Warenkorb mit aktuellen Produktdaten + Gesamtsumme + Anzahl (US32, US33, US34).
export async function getCartView(session) {
  const cart = getCart(session);
  const ids = Object.keys(cart).map(Number);
  const products = await findProductsByIds(ids);

  const items = products.map((product) => {
    const quantity = cart[product.id];
    const subtotal = Number(product.price) * quantity;
    return { product, quantity, subtotal };
  });

  const total = items.reduce((sum, item) => sum + item.subtotal, 0);
  const count = Object.values(cart).reduce((sum, q) => sum + q, 0);

  return { items, total, count };
}

// Legt ein Produkt in den Warenkorb (US31). Default-Menge 1.
export function addToCart(session, productId, quantity = 1) {
  const cart = getCart(session);
  cart[productId] = (cart[productId] ?? 0) + quantity;
}

// Setzt die Stückzahl absolut (US35: +/- Steuerung). quantity <= 0 entfernt das Produkt.
export function setCartQuantity(session, productId, quantity) {
  const cart = getCart(session);
  if (quantity <= 0) {
    delete cart[productId];
  } else {
    cart[productId] = quantity;
  }
}

export function removeFromCart(session, productId) {
  const cart = getCart(session);
  delete cart[productId];
}

export function clearCart(session) {
  session.cart = {};
}
