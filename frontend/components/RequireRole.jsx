import { Navigate } from "react-router-dom";

// Route-Guard gegen Dead-Ends/unerlaubten Zugriff (US23).
// - ready=false -> Auth-Prüfung läuft noch, kurz warten (verhindert falschen Redirect bei Reload)
// - kein User   -> weiter zum Login
// - adminOnly   -> nur role === 2 darf rein, sonst zurück zur Startseite
function RequireRole({ user, ready = true, adminOnly = false, children }) {
  if (!ready) {
    return <div className="container py-5"><p className="text-muted">Wird geladen…</p></div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (adminOnly && user.role !== 2) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default RequireRole;
