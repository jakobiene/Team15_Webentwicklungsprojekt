const API_URL = "http://localhost:5000/api/admin";

// Admin-Service (US70–US82). Alle Requests senden das Session-Cookie mit;
// der Zugriff wird serverseitig über requireAdmin geschützt.

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Anfrage fehlgeschlagen");
  return data;
}

// --- Produkte (US70–US73) ---
export const getAdminProducts = () => request("/products");
export const createProduct = (payload) =>
  request("/products", { method: "POST", body: JSON.stringify(payload) });
export const updateProduct = (id, payload) =>
  request(`/products/${id}`, { method: "PUT", body: JSON.stringify(payload) });
export const deleteProduct = (id) => request(`/products/${id}`, { method: "DELETE" });

// --- Kunden (US80–US82) ---
export const getCustomers = () => request("/customers");
export const getCustomerOrders = (id) => request(`/customers/${id}/orders`);
export const getAdminOrder = (id) => request(`/orders/${id}`);
export const setCustomerActive = (id, isActive) =>
  request(`/customers/${id}/active`, { method: "PUT", body: JSON.stringify({ isActive }) });
export const removeOrderItem = (orderId, itemId) =>
  request(`/orders/${orderId}/items/${itemId}`, { method: "DELETE" });
