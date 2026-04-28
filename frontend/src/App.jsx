 
import { Routes, Route } from "react-router-dom";
import Register from "../pages/Register";
import RegisterSuccess from "../components/RegisterSuccess";
import Login from "../pages/Login";
import LoginSuccess from "../components/LoginSuccess";

function App() {
  return(
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/register/success" element={<RegisterSuccess />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );

  }
 

export default App;