# Nil – Webshop (Team 15)

Fullstack-Webshop (Branche: **Sport & Fitness**) mit **React** (Frontend),
**Node.js/Express** (Backend) und **MySQL**.

## Tech-Stack
- **Frontend:** React + Vite, Bootstrap — läuft auf Port **5173**
- **Backend:** Node.js + Express (REST-API) — läuft auf Port **5000**
- **Datenbank:** MySQL/MariaDB (z. B. via XAMPP) — Port **3306**
- **Datenaustausch:** JSON über HTTP

## Voraussetzungen
- Node.js (inkl. npm)
- MySQL/MariaDB (z. B. über XAMPP)

---

## Setup

### 1. Repository klonen
```
git clone <repo-url>
cd Team15_Webentwicklungsprojekt
```

### 2. Datenbank einrichten
MySQL starten (z. B. in XAMPP → **MySQL Start**). Dann den fertigen Dump importieren –
er legt die Datenbank `webshop` inkl. aller Tabellen und Beispieldaten neu an:
```
mysql -u root < database/schema.sql
```
> Der Dump enthält **alles**: Tabellen (`users`, `categories`, `products`, `orders`,
> `order_items`) sowie Seed-Daten (Kategorien, Produkte, Admin- und Test-Kunde).
> Ein manuelles Anlegen ist nicht nötig.

**Vorkonfigurierte Logins:**
- Admin: `admin@nil.shop` / `Admin123!`
- Kunde: `kunde@nil.shop` / `Kunde123!`

### 3. Backend konfigurieren & starten
Datei `backend/.env` anlegen:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=webshop
SESSION_SECRET=dev-secret
```
> Standard bei XAMPP ist der MySQL-User `root` mit **leerem** Passwort. Falls euer
> MySQL anders konfiguriert ist, Werte entsprechend anpassen.

Dann:
```
cd backend
npm install
npm run dev        # http://localhost:5000
```

### 4. Frontend starten
```
cd frontend
npm install
npm run dev        # http://localhost:5173
```
Anschließend **http://localhost:5173** im Browser öffnen.

### Hinweis zu Produktbildern
Produktfotos werden im Backend unter `backend/uploads/` gespeichert und unter
`http://localhost:5000/uploads/...` ausgeliefert. Die Seed-Bilder liegen bereits im Repo.
Das **Backend muss laufen**, damit die Bilder angezeigt werden.

---

## Projektstruktur (Kurzüberblick)
```
frontend/                React-App
  pages/                 Seiten (eine je Route)
  components/            wiederverwendbare UI-Bausteine
  services/              API-Aufrufe (fetch) ans Backend
  src/App.jsx            Routing + globaler State (user, Warenkorb-Anzahl)
backend/
  src/server.js          alle API-Endpoints (Routing, enthält kein SQL)
  src/services/          zentrale DB-Service-Schicht (gesamtes SQL)
  src/middleware/auth.js Zugriffsschutz: requireAuth / requireAdmin
  database/db.js         MySQL-Verbindungspool
  uploads/               hochgeladene Produktbilder
database/schema.sql      MySQL-Dump (Tabellen + Seed-Daten)
```

---

## Architektur & Auth (Kurzüberblick)

### Trennung Frontend / Backend
Frontend (:5173) und Backend (:5000) sind getrennt und tauschen nur **JSON** über HTTP aus.
Das Backend ist der **einzige** Zugang zur Datenbank: das gesamte SQL liegt in der
Service-Schicht (`backend/src/services/`); die Endpoints in `server.js` enthalten kein SQL.

### Login, Sessions & Cookies
- Passwörter werden mit **bcrypt** gehasht gespeichert (nie im Klartext).
- Beim Login legt das Backend den User in der **Session** ab (`req.session.user`) und setzt
  ein **Cookie** (`connect.sid`). Das Cookie enthält nur die Session-ID; die Daten liegen
  serverseitig im Session-Store.
- **„Login merken":** Häkchen gesetzt → persistentes Cookie (30 Tage), sonst Session-Cookie
  (wird beim Schließen des Browsers gelöscht).
- Frontend-Requests senden `credentials: "include"`, damit das Cookie mitgeschickt wird.

### Login-Status nach Reload
React-State geht beim Reload verloren. Beim App-Start ruft `App.jsx` (in `useEffect`)
`GET /api/me` auf; das Backend liest die Session über das Cookie und gibt den User zurück →
der Login-Status wird wiederhergestellt.

### Rollenbasierte Navigation
- DB-Rolle (`users.role`): **0 = Kunde**, **2 = Admin**.
- `App.jsx` bildet daraus die Navbar-Rolle ab: nicht eingeloggt → Gast, `role === 2` → Admin,
  sonst → Kunde.
- Je Rolle zeigt die Navbar ein anderes Menü:
  - **Gast:** Home, Produkte, Warenkorb, Anmelden, Registrieren
  - **Kunde:** Home, Produkte, Mein Konto, Warenkorb
  - **Admin:** Home, Produkte bearbeiten, Kunden bearbeiten
- Die echte Absicherung erfolgt im Backend über `requireAuth` / `requireAdmin` — das
  Ausblenden von Menüpunkten ist nur UX.

> Detaillierte Code-Doku zum Login (Security: SQL-Injection, User Enumeration, Timing Attacks)
> siehe `backend/README.md`.
