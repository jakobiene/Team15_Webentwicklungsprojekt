const API_URL = "http://localhost:5000/api";

// Bestell-Service (US50/US51, US64/US65). Alle Requests senden das Session-Cookie mit.

// Aktuellen Warenkorb als Bestellung abschicken (US50).
export async function placeOrder() {
  const response = await fetch(`${API_URL}/orders`, {
    method: "POST",
    credentials: "include",
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Bestellung fehlgeschlagen");
  return data;
}

// Eigene Bestellungen laden (US64).
export async function getOrders() {
  const response = await fetch(`${API_URL}/orders`, { credentials: "include" });
  if (!response.ok) throw new Error("Bestellungen konnten nicht geladen werden");
  return response.json();
}

// Details einer Bestellung (US64).
export async function getOrder(id) {
  const response = await fetch(`${API_URL}/orders/${id}`, { credentials: "include" });
  if (!response.ok) throw new Error("Bestellung konnte nicht geladen werden");
  return response.json();
}

// Rechnungsdaten einer Bestellung (US65).
export async function getInvoice(id) {
  const response = await fetch(`${API_URL}/orders/${id}/invoice`, { credentials: "include" });
  if (!response.ok) throw new Error("Rechnung konnte nicht geladen werden");
  return response.json();
}

// Stammdaten im Konto aktualisieren (US61–US63). Erfordert das aktuelle Passwort.
export async function updateAccount(payload) {
  const response = await fetch(`${API_URL}/account`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Aktualisierung fehlgeschlagen");
  return data;
}
