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

-- Wichtig: Datei ist UTF-8. Ohne SET NAMES interpretiert der MySQL-Client unter
-- Windows die Bytes als Konsolen-Codepage (cp850) -> Umlaute würden zerstört.
SET NAMES utf8mb4;

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

-- Kategorien (Branche: Sport & Fitness)
INSERT INTO categories (name, sort_order, is_active) VALUES
  ('Krafttraining',        1, TRUE),
  ('Cardio',               2, TRUE),
  ('Supplements',          3, TRUE),
  ('Bekleidung & Zubehör', 4, TRUE);

-- Produkte (Sport & Fitness)
INSERT INTO products (category_id, name, description, image_url, price, rating, is_active) VALUES
  -- Krafttraining
  (1, 'Verstellbares Hantelset 20 kg', 'Kurzhantel-Set mit Gewichtsscheiben, stufenlos verstellbar bis 20 kg.', 'http://localhost:5000/uploads/hantelset.jpg', 89.99, 4.6, TRUE),
  (1, 'Kettlebell 16 kg', 'Gusseisen-Kettlebell mit ergonomischem Griff für Schwungübungen.', 'http://localhost:5000/uploads/kettlebell.jpg', 39.99, 4.7, TRUE),
  (1, 'Klimmzugstange für Türrahmen', 'Montagefreie Klimmzugstange, belastbar bis 130 kg.', 'http://localhost:5000/uploads/klimmzugstange.jpg', 27.99, 4.3, TRUE),
  (1, 'Olympia-Langhantel 20 kg', '220 cm Langhantelstange aus gehärtetem Stahl, 50 mm Aufnahme.', 'http://localhost:5000/uploads/langhantel.jpg', 149.00, 4.8, TRUE),
  (1, 'Widerstandsbänder Set (5-teilig)', 'Fitnessbänder in 5 Stärken inkl. Türanker und Tasche.', 'http://localhost:5000/uploads/widerstandsbaender.jpg', 24.99, 4.5, TRUE),
  -- Cardio
  (2, 'Faltbares Laufband', 'Elektrisches Laufband bis 12 km/h, platzsparend klappbar.', 'http://localhost:5000/uploads/laufband.jpg', 499.00, 4.4, TRUE),
  (2, 'Ergometer Heimtrainer', 'Fahrradergometer mit 8 Widerstandsstufen und Pulsmessung.', 'http://localhost:5000/uploads/ergometer.jpg', 229.00, 4.3, TRUE),
  (2, 'Speed Rope Springseil', 'Kugelgelagertes Springseil mit Aluminiumgriffen, längenverstellbar.', 'http://localhost:5000/uploads/springseil.jpg', 14.99, 4.6, TRUE),
  (2, 'Magnetisches Rudergerät', 'Rudergerät mit leisem Magnetbremssystem und LCD-Display.', 'http://localhost:5000/uploads/rudergeraet.jpg', 379.00, 4.5, TRUE),
  (2, 'Crosstrainer Ellipsentrainer', 'Crosstrainer mit Schwungmasse 9 kg für gelenkschonendes Training.', 'http://localhost:5000/uploads/crosstrainer.jpg', 549.00, 4.2, TRUE),
  -- Supplements
  (3, 'Whey Protein Vanille 1 kg', 'Molkenprotein-Konzentrat, 24 g Eiweiß pro Portion, Geschmack Vanille.', 'http://localhost:5000/uploads/whey-protein.jpg', 29.99, 4.6, TRUE),
  (3, 'Creatin Monohydrat 500 g', 'Reines Kreatin-Monohydrat (Creapure), unterstützt Kraft & Leistung.', 'http://localhost:5000/uploads/creatin.jpg', 19.99, 4.8, TRUE),
  (3, 'BCAA Pulver Beere 400 g', 'Aminosäuren im Verhältnis 2:1:1, Geschmack Waldbeere.', 'http://localhost:5000/uploads/bcaa.jpg', 22.99, 4.3, TRUE),
  (3, 'Pre-Workout Booster', 'Trainingsbooster mit Koffein, Beta-Alanin und Citrullin.', 'http://localhost:5000/uploads/pre-workout.jpg', 27.99, 4.4, TRUE),
  (3, 'Magnesium Kapseln (120 Stk.)', 'Hochdosiertes Magnesium zur Unterstützung der Muskelfunktion.', 'http://localhost:5000/uploads/magnesium.jpg', 12.99, 4.5, TRUE),
  -- Bekleidung & Zubehör
  (4, 'Trainingshandschuhe', 'Atmungsaktive Fitnesshandschuhe mit Handgelenkstütze.', 'http://localhost:5000/uploads/handschuhe.jpg', 16.99, 4.2, TRUE),
  (4, 'Protein-Shaker 700 ml', 'Auslaufsicherer Shaker mit Sieb und Skala, BPA-frei.', 'http://localhost:5000/uploads/shaker.jpg', 9.99, 4.5, TRUE),
  (4, 'Sport-Leggings', 'Blickdichte Leggings mit hohem Bund, dehnbar und schnelltrocknend.', 'http://localhost:5000/uploads/leggings.jpg', 34.99, 4.4, TRUE),
  (4, 'Sporttasche 40 L', 'Robuste Gym-Bag mit Nassfach und Schuhfach.', 'http://localhost:5000/uploads/sporttasche.jpg', 29.99, 4.6, TRUE),
  (4, 'Yogamatte rutschfest', 'Rutschfeste Trainingsmatte 183 x 61 cm, 6 mm, inkl. Tragegurt.', 'http://localhost:5000/uploads/yogamatte.jpg', 24.99, 4.7, TRUE);

-- Benutzer
-- Admin-Login:    admin@nil.shop   / Admin123!
-- Kunden-Login:   kunde@nil.shop   / Kunde123!
INSERT INTO users (anrede, vorname, nachname, adresse, plz, ort, email, username, password_hash, role, is_active) VALUES
  ('Herr', 'Adam', 'Admin', 'Adminweg 1', '1010', 'Wien', 'admin@nil.shop', 'admin',
   '$2b$10$kmx80LzZiYLnPYQ3VgNSG.BpI8iGmqwCMWxAuzS8cyb3ZXkGfzzvq', 2, TRUE),
  ('Frau', 'Karin', 'Kunde', 'Kundengasse 7', '1020', 'Wien', 'kunde@nil.shop', 'kunde',
   '$2b$10$h5uDSK2iRJfaW.iQk/sjxe7/NSmFU5klEFylq5W9s/U1rgMY/XLMS', 0, TRUE);
