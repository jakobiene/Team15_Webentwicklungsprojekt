import { NavLink } from "react-router-dom";

const navItemsByRole = {
  0: [
    { label: "Home", path: "/" },
    { label: "Produkte", path: "/products" },
    { label: "Warenkorb", path: "/cart" },
    { label:  "Login", path : "/login" },
    { label:  "Sign Up", path: "/register" }
  ],
  1: [
    { label: "Home", path: "/" },
    { label: "Produkte", path: "/products" },
    { label: "Mein Konto", path: "/account" },
    { label: "Warenkorb", path: "/cart" }
  ],
  2: [
    { label: "Home", path: "/" },
    { label: "Produkte bearbeiten", path: "/admin/products" },
    { label: "Kunden bearbeiten", path: "/admin/customers" },
    { label: "Gutscheine verwalten", path: "/admin/coupons" },
  ],
};

function Navbar({ role, onLogout }) {
  const navItems = navItemsByRole[role] ?? navItemsByRole[0];

  return (
    <nav className="navbar navbar-expand-lg bg-dark navbar-dark">
      <div className="container"><NavLink className="navbar-brand fw-bold" to="/">Nil</NavLink>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar"
          aria-controls="mainNavbar" aria-expanded="false" aria-label="Navigation umschalten">
          <span className="navbar-toggler-icon"></span> </button>

        <div className="collapse navbar-collapse" id="mainNavbar">
          <ul className="navbar-nav ms-auto">
            {navItems.map((item) => (
              <li className="nav-item" key={item.path}>
                <NavLink
                  className={({ isActive }) =>
                    `nav-link${isActive ? " active" : ""}`
                  }
                  to={item.path}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
            {role !== 0 && (<button className="btn btn-outline-light ms-lg-3 mt-3 mt-lg-0" onClick={onLogout}>Logout</button>)}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
