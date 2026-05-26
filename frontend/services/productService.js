const API_URL = "http://localhost:5000/api";


//getCategories
export async function getCategories() {
  const response = await fetch(`${API_URL}/categories`);

  if (!response.ok) {
    throw new Error("Kategorien konnten nicht geladen werden");
  }

  return response.json();
}


//getProductsbyCategory
export async function getProductsByCategory(categoryId) {
  const response = await fetch(
    `${API_URL}/products?categoryId=${categoryId}`
  );  //Backticks benutzt du, wenn du Variablen easy in Strings einfügen willst.

  if (!response.ok) {
    throw new Error("Produkte konnten nicht geladen werden");
  }

  return response.json();
}


//getProductById
 

//getProducts
export async function getProducts(){
    const response = await fetch(`${API_URL}/products`);
       if (!response.ok) {
    throw new Error("Produkte konnten nicht geladen werden");
  }
  return response.json();
}

//SearchProducts
export async function searchProducts(searchTerm, categoryId ){
    const params = new URLSearchParams();
    if(searchTerm){
        params.append("search", searchTerm);
    }
    if(categoryId){
        params.append("categoryId", categoryId);
    }
    const response = await fetch(`${API_URL}/products?${params.toString()}`);
    return response.json();
}