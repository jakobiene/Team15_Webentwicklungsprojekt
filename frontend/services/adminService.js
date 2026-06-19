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

// Produkt speichern (US70/US72). Wenn eine Bilddatei übergeben wird, senden wir
// multipart/form-data (Fileupload, US71); sonst JSON mit optionaler Bild-URL.
async function saveProduct(path, method, payload, file) {
  let options;
  if (file) {
    const form = new FormData();
    Object.entries(payload).forEach(([key, value]) => form.append(key, value ?? ""));
    form.append("image", file);
    // Kein Content-Type setzen – der Browser ergänzt die multipart-Boundary selbst.
    options = { method, credentials: "include", body: form };
  } else {
    options = {
      method,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    };
  }
  const response = await fetch(`${API_URL}${path}`, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Anfrage fehlgeschlagen");
  return data;
}

export const createProduct = (payload, file) => saveProduct("/products", "POST", payload, file);
export const updateProduct = (id, payload, file) => saveProduct(`/products/${id}`, "PUT", payload, file);
export const deleteProduct = (id) => request(`/products/${id}`, { method: "DELETE" });

// --- Kunden (US80–US82) ---
export const getCustomers = () => request("/customers");
export const getCustomerOrders = (id) => request(`/customers/${id}/orders`);
export const getAdminOrder = (id) => request(`/orders/${id}`);
export const setCustomerActive = (id, isActive) =>
  request(`/customers/${id}/active`, { method: "PUT", body: JSON.stringify({ isActive }) });
export const removeOrderItem = (orderId, itemId) =>
  request(`/orders/${orderId}/items/${itemId}`, { method: "DELETE" });
