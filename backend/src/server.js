import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt"; // PW-Hashing
import validator from "validator"; // E-Mail-Validierung
import session from "express-session"; // Session-Management

// Zentrale DB-Service-Klassen – die Endpoints enthalten selbst kein SQL (US01/US03).
import * as userService from "./services/userService.js";
import * as productService from "./services/productService.js";
import * as cartService from "./services/cartService.js";

dotenv.config(); // lädt Umgebungsvariablen aus .env (z. B. PORT, DB-Zugang)

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true, // erlaubt das Mitsenden des Session-Cookies
  })
);

app.use(express.json()); // JSON-Body parsen -> req.body

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    },
  })
);

// ============================================================
// Hilfsfunktionen: Validierung
// ============================================================

function validateEmail(email) {
  if (typeof email !== "string") return false;
  return validator.isEmail(email.trim());
}

// Prüft die Registrierungsdaten serverseitig (US10).
// Gibt eine Fehlermeldung (String) zurück oder null, wenn alles gültig ist.
function validateRegisterData(data) {
  const { anrede, vorname, nachname, adresse, plz, ort, email, username, password } = data;

  if (!anrede || !vorname || !nachname || !adresse || !plz || !ort || !email || !username || !password) {
    return "Alle Felder müssen ausgefüllt werden";
  }
  if (!validateEmail(email)) {
    return "Ungültige E-Mail-Adresse";
  }
  if (password.length < 8) {
    return "Passwort muss mindestens 8 Zeichen lang sein";
  }
  // mindestens ein Großbuchstabe, eine Zahl und ein Sonderzeichen
  if (!/[A-Z]/.test(password) || !/\d/.test(password) || !/[!@#$%^&*]/.test(password)) {
    return "Passwort muss einen Großbuchstaben, eine Zahl und ein Sonderzeichen enthalten";
  }
  if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
    return "Ungültiger Benutzername (3–30 Zeichen, nur Buchstaben/Zahlen/_)";
  }
  return null;
}

// ============================================================
// Auth: Registrierung / Login / Logout / aktueller User
// ============================================================

app.post("/api/register", async (req, res) => {
  try {
    const validationError = validateRegisterData(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const passwordHash = await bcrypt.hash(req.body.password, 10); // Hashing (US11)
    await userService.createUser({ ...req.body, passwordHash });

    return res.status(201).json({ message: "Registrierung erfolgreich" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "E-Mail oder Benutzername bereits vergeben" });
    }
    console.error(error);
    res.status(500).json({ message: "Fehler bei der Registrierung" });
  }
});

// Fake-Hash gegen Timing-Angriffe (vergleicht auch bei unbekannter E-Mail).
const fakeHash = await bcrypt.hash("fakepassword", 10);

app.post("/api/login", async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Ungültige E-Mail" });
    }

    const user = await userService.findUserByEmailWithHash(email);
    const hashToCompare = user ? user.password_hash : fakeHash;
    const passwordMatch = await bcrypt.compare(password ?? "", hashToCompare);

    if (!user || !passwordMatch) {
      return res.status(401).json({ message: "Ungültige E-Mail oder Passwort" });
    }

    // Deaktivierte Kunden können sich nicht einloggen (US81).
    if (!user.is_active) {
      return res.status(403).json({ message: "Dieses Konto wurde deaktiviert" });
    }

    const safeUser = userService.toPublicUser(user);
    req.session.user = safeUser;

    // "Login merken": persistentes Cookie (30 Tage), sonst Session-Cookie (US24).
    req.session.cookie.maxAge = rememberMe ? 1000 * 60 * 60 * 24 * 30 : null;

    return res.status(200).json({ message: "Login erfolgreich", user: safeUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Fehler beim Login" });
  }
});

app.post("/api/logout", (req, res) => {
  if (!req.session.user) {
    return res.status(200).json({ message: "Bereits ausgeloggt" });
  }
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Fehler beim Logout" });
    }
    res.clearCookie("connect.sid");
    return res.status(200).json({ message: "Logout erfolgreich" });
  });
});

app.get("/api/me", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ user: null });
  }
  return res.json({ user: req.session.user });
});

// ============================================================
// Produkte & Kategorien
// ============================================================

app.get("/api/categories", async (req, res) => {
  try {
    const categories = await productService.findAllCategories();
    return res.status(200).json({ categories });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Fehler beim Laden der Kategorien" });
  }
});

app.get("/api/products", async (req, res) => {
  try {
    const { categoryId, search } = req.query;
    const products = await productService.findProducts({ categoryId, search });
    return res.status(200).json({ products });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Fehler beim Laden der Produkte" });
  }
});

// ============================================================
// Warenkorb (Session-basiert, US31–US35)
// ============================================================

app.get("/api/cart", async (req, res) => {
  try {
    return res.json(await cartService.getCartView(req.session));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Fehler beim Laden des Warenkorbs" });
  }
});

app.post("/api/cart", async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const product = await productService.findProductById(Number(productId));
    if (!product || !product.is_active) {
      return res.status(404).json({ message: "Produkt nicht gefunden" });
    }
    cartService.addToCart(req.session, Number(productId), Number(quantity) || 1);
    return res.json(await cartService.getCartView(req.session));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Fehler beim Hinzufügen zum Warenkorb" });
  }
});

app.put("/api/cart/:productId", async (req, res) => {
  try {
    cartService.setCartQuantity(req.session, Number(req.params.productId), Number(req.body.quantity));
    return res.json(await cartService.getCartView(req.session));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Fehler beim Aktualisieren des Warenkorbs" });
  }
});

app.delete("/api/cart/:productId", async (req, res) => {
  try {
    cartService.removeFromCart(req.session, Number(req.params.productId));
    return res.json(await cartService.getCartView(req.session));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Fehler beim Entfernen aus dem Warenkorb" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend läuft auf http://localhost:${PORT}`);
});
