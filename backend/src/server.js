import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt"; // PW-Hashing
import validator from "validator"; // E-Mail-Validierung
import session from "express-session"; // Session-Management
import multer from "multer"; // Datei-Upload (Produktfotos, US71)
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Zentrale DB-Service-Klassen – die Endpoints enthalten selbst kein SQL (US01/US03).
import * as userService from "./services/userService.js";
import * as productService from "./services/productService.js";
import * as cartService from "./services/cartService.js";
import * as orderService from "./services/orderService.js";
import { requireAuth, requireAdmin } from "./middleware/auth.js";

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

// ----------------------------------------------------------------
// Datei-Upload für Produktfotos (US71)
// Bilder werden auf der Platte unter backend/uploads/ gespeichert und
// statisch unter /uploads ausgeliefert.
// ----------------------------------------------------------------
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, "..", "uploads");
fs.mkdirSync(uploadDir, { recursive: true }); // Ordner sicherstellen

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  // eindeutiger Dateiname, Original-Endung beibehalten
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // max. 2 MB
  fileFilter: (req, file, cb) => cb(null, file.mimetype.startsWith("image/")), // nur Bilder
});

// Hochgeladene Bilder öffentlich abrufbar machen
app.use("/uploads", express.static(uploadDir));

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
  // Immer 200: Gäste erhalten user=null. So entsteht beim Seitenstart kein
  // (harmloser, aber verwirrender) 401-Eintrag in der Browser-Konsole.
  return res.status(200).json({ user: req.session.user ?? null });
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

// ============================================================
// Bestellungen (US50/US51, US64/US65) – nur für eingeloggte User
// ============================================================

// Bestellung aus dem aktuellen Warenkorb anlegen (US50).
app.post("/api/orders", requireAuth, async (req, res) => {
  try {
    // Konto-Status erneut prüfen: deaktivierte Kunden dürfen nicht bestellen (US81).
    const dbUser = await userService.findUserByIdWithHash(req.session.user.id);
    if (!dbUser || !dbUser.is_active) {
      return res.status(403).json({ message: "Dieses Konto kann keine Bestellungen aufgeben" });
    }

    const cartView = await cartService.getCartView(req.session);
    if (cartView.items.length === 0) {
      return res.status(400).json({ message: "Der Warenkorb ist leer" });
    }

    const orderId = await orderService.createOrder(req.session.user.id, cartView);
    cartService.clearCart(req.session); // Warenkorb nach erfolgreicher Bestellung leeren
    const order = await orderService.findOrderById(orderId, req.session.user.id);
    return res.status(201).json({ message: "Bestellung erfolgreich", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Fehler bei der Bestellung" });
  }
});

// Eigene Bestellungen auflisten (US64).
app.get("/api/orders", requireAuth, async (req, res) => {
  try {
    const orders = await orderService.findOrdersByUser(req.session.user.id);
    return res.json({ orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Fehler beim Laden der Bestellungen" });
  }
});

// Details einer eigenen Bestellung (US64).
app.get("/api/orders/:id", requireAuth, async (req, res) => {
  try {
    const data = await orderService.findOrderById(Number(req.params.id), req.session.user.id);
    if (!data) return res.status(404).json({ message: "Bestellung nicht gefunden" });
    return res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Fehler beim Laden der Bestellung" });
  }
});

// Rechnungsdaten zu einer Bestellung: Positionen, Datum, Rechnungsnummer + Anschrift (US65).
app.get("/api/orders/:id/invoice", requireAuth, async (req, res) => {
  try {
    const data = await orderService.findOrderById(Number(req.params.id), req.session.user.id);
    if (!data) return res.status(404).json({ message: "Bestellung nicht gefunden" });
    const customer = await userService.findPublicUserById(req.session.user.id);
    return res.json({ ...data, customer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Fehler beim Laden der Rechnung" });
  }
});

// ============================================================
// Konto: Stammdaten bearbeiten (US61–US63)
// ============================================================

app.put("/api/account", requireAuth, async (req, res) => {
  try {
    const { currentPassword, anrede, vorname, nachname, adresse, plz, ort, email } = req.body;

    // Pflichtfelder prüfen
    if (!anrede || !vorname || !nachname || !adresse || !plz || !ort || !email) {
      return res.status(400).json({ message: "Alle Felder müssen ausgefüllt werden" });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Ungültige E-Mail-Adresse" });
    }

    // Änderungen sensibler Daten erfordern das aktuelle Passwort (US63).
    const dbUser = await userService.findUserByIdWithHash(req.session.user.id);
    const passwordMatch = await bcrypt.compare(currentPassword ?? "", dbUser.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Aktuelles Passwort ist falsch" });
    }

    const updated = await userService.updateStammdaten(req.session.user.id, {
      anrede, vorname, nachname, adresse, plz, ort, email,
    });
    req.session.user = updated; // Session mit neuen Daten aktualisieren
    return res.json({ message: "Daten aktualisiert", user: updated });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "E-Mail-Adresse bereits vergeben" });
    }
    console.error(error);
    res.status(500).json({ message: "Fehler beim Aktualisieren der Daten" });
  }
});

// ============================================================
// Admin: Produktverwaltung (US70–US73) – nur für Administratoren
// ============================================================

// Alle Produkte inkl. inaktiver für die Verwaltung (US72).
app.get("/api/admin/products", requireAdmin, async (req, res) => {
  try {
    const products = await productService.findProducts({ includeInactive: true });
    return res.json({ products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Fehler beim Laden der Produkte" });
  }
});

// Pflichtfelder eines Produkts prüfen (US70).
function validateProduct(body) {
  const { categoryId, name, price } = body;
  if (!categoryId) return "Kategorie ist erforderlich";
  if (!name || !name.trim()) return "Name ist erforderlich";
  if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0) {
    return "Gültiger Preis ist erforderlich";
  }
  return null;
}

// URL der hochgeladenen Datei, oder null wenn keine Datei dabei war (US71).
function uploadedImageUrl(req) {
  return req.file ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}` : null;
}

// Produkt anlegen (US70/US71). Das Foto wird als Datei hochgeladen.
app.post("/api/admin/products", requireAdmin, upload.single("image"), async (req, res) => {
  try {
    const validationError = validateProduct(req.body);
    if (validationError) return res.status(400).json({ message: validationError });

    const { categoryId, name, description, price, rating } = req.body;
    const product = await productService.createProduct({
      categoryId, name, description, imageUrl: uploadedImageUrl(req), price, rating,
    });
    return res.status(201).json({ product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Fehler beim Anlegen des Produkts" });
  }
});

// Produkt bearbeiten (US72). Ohne neu hochgeladenes Foto bleibt das bestehende Bild erhalten.
app.put("/api/admin/products/:id", requireAdmin, upload.single("image"), async (req, res) => {
  try {
    const validationError = validateProduct(req.body);
    if (validationError) return res.status(400).json({ message: validationError });

    const id = Number(req.params.id);
    let imageUrl = uploadedImageUrl(req);
    if (!imageUrl) {
      // Kein neues Foto -> vorhandenes Bild beibehalten
      const existing = await productService.findProductById(id);
      imageUrl = existing?.image_url ?? null;
    }

    const { categoryId, name, description, price, rating } = req.body;
    const product = await productService.updateProduct(id, {
      categoryId, name, description, imageUrl, price, rating,
    });
    if (!product) return res.status(404).json({ message: "Produkt nicht gefunden" });
    return res.json({ product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Fehler beim Bearbeiten des Produkts" });
  }
});

// Produkt löschen (US73).
app.delete("/api/admin/products/:id", requireAdmin, async (req, res) => {
  try {
    const deleted = await productService.deleteProduct(Number(req.params.id));
    if (!deleted) return res.status(404).json({ message: "Produkt nicht gefunden" });
    return res.json({ message: "Produkt gelöscht" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Fehler beim Löschen des Produkts" });
  }
});

// ============================================================
// Admin: Kundenverwaltung (US80–US82)
// ============================================================

// Alle Kunden auflisten (US80).
app.get("/api/admin/customers", requireAdmin, async (req, res) => {
  try {
    const customers = await userService.findAllCustomers();
    return res.json({ customers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Fehler beim Laden der Kunden" });
  }
});

// Bestellungen eines Kunden inkl. Detail-Einsicht (US80).
app.get("/api/admin/customers/:id/orders", requireAdmin, async (req, res) => {
  try {
    const orders = await orderService.findOrdersByUser(Number(req.params.id));
    return res.json({ orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Fehler beim Laden der Bestellungen" });
  }
});

// Detail einer Bestellung inkl. Positionen (US80/US82, Admin – ohne User-Beschränkung).
app.get("/api/admin/orders/:id", requireAdmin, async (req, res) => {
  try {
    const data = await orderService.findOrderById(Number(req.params.id));
    if (!data) return res.status(404).json({ message: "Bestellung nicht gefunden" });
    return res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Fehler beim Laden der Bestellung" });
  }
});

// Kunde aktiv/inaktiv setzen (US81).
app.put("/api/admin/customers/:id/active", requireAdmin, async (req, res) => {
  try {
    const ok = await userService.setCustomerActive(Number(req.params.id), Boolean(req.body.isActive));
    if (!ok) return res.status(404).json({ message: "Kunde nicht gefunden" });
    return res.json({ message: "Status aktualisiert" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Fehler beim Aktualisieren des Status" });
  }
});

// Einzelne Bestellposition entfernen (US82).
app.delete("/api/admin/orders/:orderId/items/:itemId", requireAdmin, async (req, res) => {
  try {
    const removed = await orderService.removeOrderItem(
      Number(req.params.orderId),
      Number(req.params.itemId)
    );
    if (!removed) return res.status(404).json({ message: "Position nicht gefunden" });
    return res.json({ message: "Position entfernt" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Fehler beim Entfernen der Position" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend läuft auf http://localhost:${PORT}`);
});
