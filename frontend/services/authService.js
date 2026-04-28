
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




//LOGOUT




//Current User

