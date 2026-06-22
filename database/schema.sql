-- ============================================================
-- Nil Webshop – MySQL Schema + Seed (Team 15)
-- ============================================================
-- Import (z. B. via phpMyAdmin oder CLI):
--   mysql -u root -p < database/schema.sql
-- Erstellt die Datenbank "webshop" neu inkl. Tabellen und Beispieldaten.
-- ============================================================

DROP DATABASE IF EXISTS webshop;
CREATE DATABASE webshop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE webshop;

-- ------------------------------------------------------------
-- Benutzer (Gäste registrieren sich hier; role/is_active steuern Rechte)
-- ------------------------------------------------------------
CREATE TABLE users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  anrede        VARCHAR(20),
  vorname       VARCHAR(100),
  nachname      VARCHAR(100),
  adresse       VARCHAR(255),
  plz           VARCHAR(20),
  ort           VARCHAR(100),
  email         VARCHAR(150) UNIQUE NOT NULL,
  username      VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          TINYINT      NOT NULL DEFAULT 0,   -- 0 = Customer, 2 = Admin
  is_active     BOOLEAN      NOT NULL DEFAULT TRUE, -- vom Admin deaktivierbar (US81)
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- Kategorien
-- ------------------------------------------------------------
CREATE TABLE categories (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  sort_order INT          NOT NULL DEFAULT 0,
  is_active  BOOLEAN      NOT NULL DEFAULT TRUE
);

-- ------------------------------------------------------------
-- Produkte
-- ------------------------------------------------------------
CREATE TABLE products (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  name        VARCHAR(100)  NOT NULL,
  description TEXT          NULL,
  image_url   VARCHAR(255),
  price       DECIMAL(10,2) NOT NULL,
  rating      DECIMAL(2,1)  DEFAULT 0,
  is_active   BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- ------------------------------------------------------------
-- Bestellungen (Kopf) – Rechnungsnummer wird bei Bestellung vergeben
-- ------------------------------------------------------------
CREATE TABLE orders (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  user_id        INT NOT NULL,
  invoice_number VARCHAR(40)   UNIQUE,        -- wird direkt nach dem Insert gesetzt (RE-<Jahr>-<id>)
  total          DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ------------------------------------------------------------
-- Bestellpositionen – Name/Preis werden als Snapshot gespeichert,
-- damit Rechnungen korrekt bleiben, wenn sich Produkte später ändern.
-- ------------------------------------------------------------
CREATE TABLE order_items (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  order_id     INT NOT NULL,
  product_id   INT NULL,
  product_name VARCHAR(100)  NOT NULL,
  unit_price   DECIMAL(10,2) NOT NULL,
  quantity     INT           NOT NULL,
  FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- ============================================================
-- Seed-Daten
-- ============================================================

-- Kategorien
INSERT INTO categories (name, sort_order, is_active) VALUES
  ('Bücher',     1, TRUE),
  ('Elektronik', 2, TRUE),
  ('Haushalt',   3, TRUE),
  ('Fitness',    4, TRUE);

-- Produkte
INSERT INTO products (category_id, name, description, image_url, price, rating, is_active) VALUES
  -- Bücher
  (1, 'Designing Data-Intensive Applications', 'Standardwerk über verteilte Systeme und Datenarchitektur.', 'https://placehold.co/600x400?text=DDIA', 49.99, 4.9, TRUE),
  (1, 'Clean Architecture', 'Prinzipien für wartbare Softwarearchitektur.', 'https://placehold.co/600x400?text=Clean+Architecture', 39.99, 4.7, TRUE),
  (1, 'The Pragmatic Programmer', 'Zeitlose Tipps für professionelle Entwickler.', 'https://placehold.co/600x400?text=Pragmatic+Programmer', 34.99, 4.8, TRUE),
  (1, 'Refactoring UI', 'Praktische Anleitung für besseres UI-Design.', 'https://placehold.co/600x400?text=Refactoring+UI', 79.99, 4.6, TRUE),
  -- Elektronik
  (2, 'Apple iPhone 15', 'Smartphone mit A16-Chip und 48-MP-Kamera.', 'https://placehold.co/600x400?text=iPhone+15', 849.00, 4.7, TRUE),
  (2, 'Apple MacBook Air M3', 'Leichtes Notebook mit M3-Chip.', 'https://placehold.co/600x400?text=MacBook+Air+M3', 1299.00, 4.8, TRUE),
  (2, 'Apple AirPods Pro', 'In-Ear-Kopfhörer mit aktiver Geräuschunterdrückung.', 'https://placehold.co/600x400?text=AirPods+Pro', 249.00, 4.6, TRUE),
  (2, 'Apple Watch Series 9', 'Smartwatch mit Fitness- und Gesundheitsfunktionen.', 'https://placehold.co/600x400?text=Apple+Watch', 449.00, 4.5, TRUE),
  -- Haushalt
  (3, 'Kaffeemaschine', 'Filterkaffeemaschine mit Timer.', 'https://placehold.co/600x400?text=Kaffeemaschine', 89.99, 4.4, TRUE),
  (3, 'LED Schreibtischlampe', 'Dimmbare LED-Lampe mit USB-Anschluss.', 'https://placehold.co/600x400?text=Lampe', 34.99, 4.2, TRUE),
  (3, 'Kabelloser Staubsauger', 'Akku-Staubsauger mit hoher Saugkraft.', 'https://placehold.co/600x400?text=Staubsauger', 179.99, 4.3, TRUE),
  (3, 'Wasserkocher Edelstahl', '1,7-Liter-Wasserkocher aus Edelstahl.', 'https://placehold.co/600x400?text=Wasserkocher', 29.99, 4.1, TRUE),
  -- Fitness
  (4, 'Whey Protein Vanille', 'Molkenprotein, Geschmack Vanille, 1 kg.', 'https://placehold.co/600x400?text=Whey+Protein', 29.99, 4.5, TRUE),
  (4, 'Creatine Monohydrate', 'Reines Kreatin-Monohydrat, 500 g.', 'https://placehold.co/600x400?text=Creatine', 19.99, 4.7, TRUE),
  (4, 'Protein Pulver Schokolade', 'Proteinpulver, Geschmack Schokolade, 1 kg.', 'https://placehold.co/600x400?text=Protein+Schoko', 31.99, 4.4, TRUE),
  (4, 'Shaker 700ml', 'Auslaufsicherer Shaker mit Sieb.', 'https://placehold.co/600x400?text=Shaker', 9.99, 4.2, TRUE);

-- Benutzer
-- Admin-Login:    admin@nil.shop   / Admin123!
-- Kunden-Login:   kunde@nil.shop   / Kunde123!
INSERT INTO users (anrede, vorname, nachname, adresse, plz, ort, email, username, password_hash, role, is_active) VALUES
  ('Herr', 'Adam', 'Admin', 'Adminweg 1', '1010', 'Wien', 'admin@nil.shop', 'admin',
   '$2b$10$kmx80LzZiYLnPYQ3VgNSG.BpI8iGmqwCMWxAuzS8cyb3ZXkGfzzvq', 2, TRUE),
  ('Frau', 'Karin', 'Kunde', 'Kundengasse 7', '1020', 'Wien', 'kunde@nil.shop', 'kunde',
   '$2b$10$h5uDSK2iRJfaW.iQk/sjxe7/NSmFU5klEFylq5W9s/U1rgMY/XLMS', 0, TRUE);
