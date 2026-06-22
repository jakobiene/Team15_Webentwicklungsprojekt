// Auth-/Rollen-Middleware für geschützte Endpoints.
// Der eingeloggte User liegt in req.session.user (gesetzt beim Login).

// Erfordert einen eingeloggten User (Customer oder Admin).
export function requireAuth(req, res, next) {
  if (!req.session?.user) {
    return res.status(401).json({ message: "Nicht angemeldet" });
  }

  next();
}

export function requireAdmin(req, res, next) {
  if (!req.session?.user) {
    return res.status(401).json({ message: "Nicht angemeldet" });
  }

  if (req.session.user.role !== 2) {
    return res.status(403).json({ message: "Keine Administratorrechte" });
  }

  next();
}
