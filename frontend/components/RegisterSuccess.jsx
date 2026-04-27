import { useNavigate } from "react-router-dom";

function RegisterSuccess() {
  const navigate = useNavigate();

  return (
    <div className="text-center py-5">
      <h2 className="fw-bold text-success">
        Registrierung erfolgreich 
      </h2>

      <p className="text-muted mt-3">
        Vielen Dank für deine Registrierung!
      </p>

      <button
        className="btn btn-dark mt-4"
        onClick={() => navigate("/login")}
      >
        Zum Login
      </button>
    </div>
  );
}

export default RegisterSuccess;