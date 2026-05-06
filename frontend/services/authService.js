
/*

*/

//REGISTER
export async function registerUser(formData) { // funktion wie Repository in Kotlin 
  const response = await fetch("http://localhost:5000/api/register", { //backend-URL API-Endpunkt
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    throw new Error("Registrierung fehlgeschlagen");
  }

  return response.json();
}


//LOGIN
export async function loginUser(credentials) {
    const response = await fetch("http://localhost:5000/api/login", { 
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include", //cookies
        body: JSON.stringify(credentials),
    });        
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Login fehlgeschlagen");
    }   
    return data; 
}       



//LOGOUT

export async function logoutUser() {
    const response = await fetch
    ("http://localhost:5000/api/logout", {method: "POST", credentials: "include",}); 
    if(!response.ok){
        throw new Error("Logout fehlgeschalgen"); 
    }
    return response.json();

}



//Current User
export async function getCurrentUser() {
    const response = await fetch("http://localhost:5000/api/me",{ 
        method: "GET",
        credentials: "include",
    });
    if(!response.ok) {return null;}
    const data = await response.json();
    return data.user;

}

