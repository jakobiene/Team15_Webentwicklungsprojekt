
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
        credentials: "inlucde", //cookies
        body: JSON.stringify(credentials),
    });        
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Login fehlgeschlagen");
    }   
    return response.json();
}       



//LOGOUT




//Current User

