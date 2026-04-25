import { useEffect } from "react";

function App() {
  useEffect(() => {
    fetch("http://localhost:5000/api/test")
      .then(res => res.json())
      .then(data => console.log(data));
  }, []);

  return (
    <div className="container mt-5">
      <h1>Check Console 👀</h1>
    </div>
  );
}

export default App;