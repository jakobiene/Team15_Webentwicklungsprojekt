import { Navigate } from "react-router-dom";

// Route-Guard gegen Dead-Ends/unerlaubten Zugriff (US23).
// - kein User  -> weiter zum Login
// - adminOnly  -> nur role === 2 darf rein, sonst zurück zur Startseite
function RequireRole({ user, adminOnly = false, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (adminOnly && user.role !== 2) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default RequireRole;
