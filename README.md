## Projekt
Webshop als Fullstack-Anwendung mit React (Frontend), Node.js/Express (Backend) und MySQL.

## Projekt
Webshop als Fullstack-Anwendung mit React (Frontend), Node.js/Express (Backend) und MySQL.


## Setup
### 1. Repository klonen
```
git clone <repo-url>
cd team15_webshop
```

### How to Install and start with React/Express:



### 2. Frontend starten
```
cd frontend
npm install
npm run dev
```

### 3. Backend starten
```
cd backend
npm install
npm run dev
```

### 4. DB-Setup (XAMPP,MAMP) MySQL 

-- Apache starten, und MySQL starten localhost/phpmyadmin aufrufen.

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  anrede VARCHAR(20),
  vorname VARCHAR(100),
  nachname VARCHAR(100),
  adresse VARCHAR(255),
  plz VARCHAR(20),
  ort VARCHAR(100),
  email VARCHAR(150) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  image_url VARCHAR(255),
  price DECIMAL(10, 2) NOT NULL,
  rating DECIMAL(2, 1) DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (category_id) REFERENCES categories(id)
);


### 4.1 DB-Kategorien (Insert)
- Kategorien

INSERT INTO categories (name, sort_order, is_active)
VALUES
  ('Bücher', 1, TRUE),
  ('Elektronik', 2, TRUE),
  ('Haushalt', 3, TRUE),
  ('Fitness', 4, TRUE);


### 4.2 DB-Produkte (Insert)
- Produkte
INSERT INTO products (category_id, name, image_url, price, rating, is_active)
VALUES
  -- Bücher
  (1, 'Designing Data-Intensive Applications', 'https://placehold.co/600x400?text=DDIA', 49.99, 4.9, TRUE),
  (1, 'Clean Architecture', 'https://placehold.co/600x400?text=Clean+Architecture', 39.99, 4.7, TRUE),
  (1, 'The Pragmatic Programmer', 'https://placehold.co/600x400?text=Pragmatic+Programmer', 34.99, 4.8, TRUE),
  (1, 'Refactoring UI', 'https://placehold.co/600x400?text=Refactoring+UI', 79.99, 4.6, TRUE),

  -- Elektronik
  (2, 'Apple iPhone 15', 'https://placehold.co/600x400?text=iPhone+15', 849.00, 4.7, TRUE),
  (2, 'Apple MacBook Air M3', 'https://placehold.co/600x400?text=MacBook+Air+M3', 1299.00, 4.8, TRUE),
  (2, 'Apple AirPods Pro', 'https://placehold.co/600x400?text=AirPods+Pro', 249.00, 4.6, TRUE),
  (2, 'Apple Watch Series 9', 'https://placehold.co/600x400?text=Apple+Watch', 449.00, 4.5, TRUE),

  -- Haushalt
  (3, 'Kaffeemaschine', 'https://placehold.co/600x400?text=Kaffeemaschine', 89.99, 4.4, TRUE),
  (3, 'LED Schreibtischlampe', 'https://placehold.co/600x400?text=Lampe', 34.99, 4.2, TRUE),
  (3, 'Kabelloser Staubsauger', 'https://placehold.co/600x400?text=Staubsauger', 179.99, 4.3, TRUE),
  (3, 'Wasserkocher Edelstahl', 'https://placehold.co/600x400?text=Wasserkocher', 29.99, 4.1, TRUE),

  -- Fitness
  (4, 'Whey Protein Vanille', 'https://placehold.co/600x400?text=Whey+Protein', 29.99, 4.5, TRUE),
  (4, 'Creatine Monohydrate', 'https://placehold.co/600x400?text=Creatine', 19.99, 4.7, TRUE),
  (4, 'Protein Pulver Schokolade', 'https://placehold.co/600x400?text=Protein+Schoko', 31.99, 4.4, TRUE),
  (4, 'Shaker 700ml', 'https://placehold.co/600x400?text=Shaker', 9.99, 4.2, TRUE);



### 4.3 ENV Setup /backend/.env   (Backend-DB Zugriffs Admin)
- PORT=5000
- DB_HOST=localhost
- DB_USER=webadmin
- DB_PASSWORD=M993headEyes$!
- DB_NAME=webshop


### 5. Auth Flow bei Registrierung

```md
## 🔄 Auth Flow

```txt
[User]
   ↓
[React Frontend]
   ↓  POST /api/register
[Express Backend]
   ↓
[Password Hashing (bcrypt)]
   ↓
[MySQL Database]
   ↓
[Response → Frontend]

```
## 6. Allgemeine Doku (dump)

Flow:
1. User öffnet Seite
2. Frontend fragt Backend: /api/me
3. Backend schaut: Gibt es gültige Session/Cookie?
4. Wenn ja: user zurückgeben
5. Wenn nein: user null / 401
6. App.jsx speichert user im State
7. Navbar entscheidet anhand user.role

Beim Login
LoginForm
-> POST /api/login mit email, password, rememberMe
-> Backend prüft Passwort
-> Backend setzt Session/Cookie
-> Backend gibt user zurück
-> App.jsx speichert user
-> Navbar ändert sich sofort

* Das ist der wichtigste Punkt: React-State überlebt keinen Seitenreload. Cookie schon. Deshalb brauchst du /api/me:

App.jsx hält den User-State, weil React irgendwo zentral wissen muss, wer gerade eingeloggt ist. Aber: Dieser State lebt nur im Browser-Speicher der laufenden React-App.


F5 / Reload passiert folgendes:
-> React-App startet komplett neu
-> useState(null) ist wieder null
-> Navbar würde wieder Gast anzeigen

Darum benötigt AppJSX checks:

App startet
-> getCurrentUser()
-> GET /api/me
-> Backend schaut in Cookie/Session
-> gibt User zurück
-> App setzt setUser(user)
-> Navbar zeigt passende Rolle

## Technischer Ablauf 
Klar, hier ist eine README-taugliche Version:

```md
## Login-State, Sessions und Navbar-Rollen

Die React-App verwaltet den aktuell eingeloggten Benutzer zentral in `App.jsx`.

Dafür wird ein `user`-State verwendet:

```jsx
const [user, setUser] = useState(null);
const role = user?.role ?? 0;
```

Wenn kein Benutzer eingeloggt ist, ist `user` gleich `null`. Dadurch wird automatisch die Rolle `0` verwendet. Diese Rolle steht für Gäste.

Die Rollen sind:

```txt
0 = Gast
1 = eingeloggter Benutzer
2 = Administrator
```

Die Rolle wird an die Navbar weitergegeben:

```jsx
<Navbar role={role} />
```

Die Navbar entscheidet anhand dieser Rolle, welche Links angezeigt werden.

Gäste sehen:

```txt
Home
Produkte
Warenkorb
```

Eingeloggte Benutzer sehen:

```txt
Home
Produkte
Mein Konto
Warenkorb
```

Administratoren sehen:

```txt
Home
Produkte bearbeiten
Kunden bearbeiten
Gutscheine verwalten
```

## Warum der User-State in App.jsx liegt

Der User-State wird in `App.jsx` gespeichert, weil mehrere Bereiche der App wissen müssen, welcher Benutzer aktuell angemeldet ist. Zum Beispiel:

- die Navbar
- geschützte Seiten
- der Login-Prozess
- später der Logout-Prozess

`App.jsx` ist dafür geeignet, weil es die zentrale Komponente ist, in der auch das Routing definiert wird.

Wenn sich der User ändert, rendert React die App neu. Dadurch bekommt auch die Navbar automatisch die neue Rolle und zeigt die passenden Navigationspunkte an.

## Warum getCurrentUser benötigt wird

React-State geht bei einem Seiten-Reload verloren. Wenn der Browser neu lädt, startet die React-App komplett neu und der State ist wieder leer:

```txt
user = null
role = 0
```

Dadurch würde die Navbar zunächst wieder die Gast-Ansicht anzeigen.

Damit ein bereits eingeloggter Benutzer nach einem Reload weiterhin erkannt wird, ruft die App beim Start das Backend auf:

```txt
GET /api/me
```

Das Backend prüft anhand der Session bzw. des Cookies, ob der Browser bereits eingeloggt ist. Wenn eine gültige Session existiert, gibt das Backend den aktuellen Benutzer zurück.

## useEffect in App.jsx

Der Aufruf von `/api/me` wird in `useEffect` ausgeführt:

```jsx
useEffect(() => {
  async function loadUser() {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
  }

  loadUser();
}, []);
```

`useEffect` wird verwendet, um Code nach dem ersten Rendern der Komponente auszuführen. In diesem Fall soll beim Start der App einmal geprüft werden, ob bereits ein Benutzer eingeloggt ist.

Die Funktion `loadUser` ist `async`, weil `getCurrentUser()` einen HTTP-Request an das Backend sendet.

```jsx
const currentUser = await getCurrentUser();
```

Wenn das Backend einen Benutzer zurückgibt, wird dieser im State gespeichert:

```jsx
setUser(currentUser);
```

Dadurch rendert React die App neu. Die Rolle wird neu berechnet und an die Navbar weitergegeben.

Das leere Array am Ende sorgt dafür, dass der Effekt nur einmal beim Start der App ausgeführt wird:

```jsx
}, []);
```

Ohne dieses Array würde der Effekt nach jedem Rendern erneut laufen.

## Login-Ablauf

Beim Login sendet `LoginForm` die eingegebenen Daten an das Backend:

```jsx
const data = await loginUser(formData);
onSuccess(data);
```

`formData` enthält:

```js
{
  email,
  password,
  rememberMe
}
```

Das Backend prüft die Login-Daten. Wenn der Login erfolgreich ist, gibt es den Benutzer zurück.

Danach wird der Benutzer in `App.jsx` gespeichert:

```jsx
<Login onLogin={setUser} />
```

In `Login.jsx` wird nach erfolgreichem Login `onLogin(data.user)` aufgerufen. Dadurch wird der User-State in `App.jsx` aktualisiert.

Anschließend wird der Benutzer weitergeleitet, zum Beispiel zur Startseite oder zum Dashboard.

## Cookie und Session

Die Checkbox „Login merken“ wird mit an das Backend gesendet. Das Backend entscheidet dann, ob ein normales Session-Cookie oder ein länger gültiges Cookie gesetzt wird.

Wichtig ist:

- Das Frontend speichert den Login nicht dauerhaft selbst.
- Das Backend verwaltet die Session.
- Das Frontend fragt über `/api/me`, ob eine gültige Session existiert.
- Cookies müssen bei Requests mitgeschickt werden.

Dafür muss im Frontend bei Fetch-Requests verwendet werden:

```js
credentials: "include"
```

Beispiel:

```js
export async function getCurrentUser() {
  const response = await fetch("http://localhost:5000/api/me", {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data.user;
}
```

## Zusammenfassung

Der Login-Zustand wird während der laufenden App in `App.jsx` gespeichert. Nach einem Reload wird dieser Zustand über `/api/me` aus der Backend-Session wiederhergestellt.

Die Navbar bekommt nur die aktuelle Rolle und entscheidet anhand dieser Rolle, welche Menüpunkte sichtbar sind.

```txt
Login erfolgreich
-> Backend gibt User zurück
-> App.jsx speichert User
-> Rolle wird berechnet
-> Navbar zeigt passende Links
```

Bei einem Reload:

```txt
App startet neu
-> user ist zunächst null
-> App ruft /api/me auf
-> Backend prüft Cookie/Session
-> User wird wieder gesetzt
-> Navbar zeigt passende Rolle
```
```