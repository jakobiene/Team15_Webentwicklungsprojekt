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


### 4.1 ENV Setup /backend/.env   (Backend-DB Zugriffs Admin)
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