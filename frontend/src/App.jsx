import { useEffect } from "react";
import Register from "../pages/Register";

function App() {
  return <Register />;

  useEffect(() => {
    console.log("App component mounted");
  }, []);}
 

export default App;