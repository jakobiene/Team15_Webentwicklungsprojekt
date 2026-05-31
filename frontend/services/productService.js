const API_URL = "http://localhost:5000/api";


//getCategories
export async function getCategories() {
  const response = await fetch(`${API_URL}/categories`);

  if (!response.ok) {
    throw new Error("Kategorien konnten nicht geladen werden");
  }

  return response.json();
}

/*
//getProductsbyCategory
export async function getProductsByCategory(categoryId) {
  const response = await fetch(
    `${API_URL}/products?categoryId=${categoryId}`
  );  //Backticks benutzt du, wenn du Variablen easy in Strings einfügen willst.

  if (!response.ok) {
    throw new Error("Produkte konnten nicht geladen werden");
  }

  return response.json();
} */

//getProducts old
/*
export async function getProducts(){
    const response = await fetch(`${API_URL}/products`);
       if (!response.ok) {
    throw new Error("Produkte konnten nicht geladen werden");
  }
  return response.json();
}*/

//SearchProducts (inside getProducts...)



export async function getProducts({ categoryId, search } = {}) {
  const params = new URLSearchParams();

  if (categoryId) params.append("categoryId", categoryId);
  if (search) params.append("search", search);

  const query = params.toString();
  const url = query
    ? `http://localhost:5000/api/products?${query}`
    : "http://localhost:5000/api/products";

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Produkte konnten nicht geladen werden");
  }

  return response.json();
}
