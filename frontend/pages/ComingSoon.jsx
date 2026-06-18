// Platzhalterseite für Bereiche, die in einem späteren Sprint umgesetzt werden.
// Verhindert "Dead-Ends" in der Navigation, bis die echte Seite existiert.
function ComingSoon({ title }) {
  return (
    <main className="container py-5">
      <h1 className="display-6 fw-bold text-dark mb-2">{title}</h1>
      <p className="text-muted">Dieser Bereich wird gerade entwickelt.</p>
    </main>
  );
}

export default ComingSoon;
