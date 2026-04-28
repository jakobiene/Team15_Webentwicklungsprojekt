import { useState } from "react";
import LoginForm from "../components/LoginForm";
import LoginSuccess from "../components/LoginSuccess";

function Login() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  return (
    <div className="min-vh-100 d-flex align-items-center bg-light">
      <div className="container">
        <div className="row shadow-lg rounded-4 overflow-hidden bg-white">
          <div className="col-md-5 d-none d-md-flex flex-column justify-content-center p-5 bg-dark text-white">
            <h1 className="fw-bold">Nil</h1>
            <p className="mt-3 text-white-50">
              Melde dich an und starte mit deinem Einkauf. </p>
                 </div>    
            <div className="col-md-7 p-5">
                {loggedIn ? (
                    <LoginSuccess user={user} />
                ) : (
                    <LoginForm onSuccess={(userData) => {
                        setUser(userData);
                        setLoggedIn(true);
                    }
                    } />
                )}
            </div>              
        </div>
      </div>
    </div>
  );
}   