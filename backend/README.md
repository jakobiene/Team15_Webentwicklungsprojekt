#  Code Doku Backend

## Datei: `server.js`

### Endpunkt: `/api/login`
Dieser Endpunkt verarbeitet die Benutzer-Authentifizierung. Aus Sicherheitsgründen folgt die Funktion einem strikten Workflow, um sowohl die Datenintegrität als auch den Schutz vor Angriffen zu gewährleisten.

> **Security-Prinzip:** Der User erhält stets eine **generische Fehlermeldung**. Dadurch wird verschleiert, ob die E-Mail im System existiert oder lediglich das Passwort falsch war (Schutz vor *User Enumeration*).

---
 
## Authentication Flow & Security Logic

Der Prozess ist in mehrere Hauptschritte unterteilt:

### 1. Daten-Extraktion (Destructuring)

```javascript
const { email, password } = req.body;
```
---

### 2. Schutz vor SQL-Injections
```javascript
const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
```
- Verwendung von Prepared Statements
- Schutz vor SQL Injection
- rows enthält die gefundenen Datensätze

---

### 3. Schutz vor User Enumeration & Timing Attacks
```javascript
const user = rows[0];

const fakeHash = "$2b$10$C6UzMDM.H6dfI/f/IKcEeO8WQyZz8Wc58e1z1s1Yd2xG6bX9d5f6K";
const hashToCompare = user ? user.password_hash : fakeHash;

const passwordMatch = await bcrypt.compare(password, hashToCompare);
```

- **User Enumeration:** Durch identische Fehlermeldungen für "E-Mail falsch" und "Passwort falsch" verhindern wir, dass Angreifer durch systematisches Testen herausfinden können, welche E-Mail-Adressen im System existieren.
- **Timing Attacks:** Ein Angreifer könnte theoretisch messen, wie lange der Server für eine Antwort braucht. Da das Hashen mit Bcrypt Zeit benötigt, würde eine sofortige Fehlermeldung bei falscher E-Mail den User verraten. 
- **Lösung:** Im Code achten wir darauf, den Prozessfluss so zu gestalten, dass die Antwortzeiten für den Angreifer möglichst wenig Rückschlüsse auf die Existenz eines Kontos zulassen.

---

### 4. Zentrale Validierung
```javascript
if (!user || !passwordMatch) {
  return res.status(401).json({ message: "Ungültige E-Mail oder Passwort" });
}
```
---

### 5. Passwort-Verifizierung mit Bcrypt

Passwörter werden niemals im Klartext gespeichert.  
bcrypt.compare prüft den User-Input gegen den gespeicherten Hash.

---

### 6. Sichere Response
```javascript
const { password_hash, ...safeUser } = user;
```
---

## Implementierungs-Beispiel (Secure)
```javascript 
const fakeHash = await bcrypt.hash("fakepassword", 10); //fake-hash für timing attack prevention (außerhalb vom Endpoint)
app.post("/api/login", async (req, res) => {  
  try
    {const { email, password } = req.body;
    const validationError = validateEmail(req.body.email);
    if (!validationError) {
      return res.status(400).json({ message: "Ungültige E-Mail" });
    }
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);  

 
    const user = rows[0];
    const hashToCompare = user ? user.password_hash : fakeHash;
    const passwordMatch = await bcrypt.compare(password, hashToCompare); 

      if (!user || !passwordMatch) {
      return res.status(401).json({
        message: "Ungültige E-Mail oder Passwort"
      });
    }
      const { password_hash, ...safeUser } = user;

    res.json({message: "Login erfolgreich", user: safeUser});
    } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Fehler beim Login" });}

});
```

---

## Implementierungs-Beispiel (KI-Generiert einfach aber "not Secure")
```javascript
app.post("/api/login", async (req, res) => {   //req = HTTP Request,  res = HTTP Response
  try {
    // 1. Destrukturierung der Eingabewerte
    const { email, password } = req.body;  

    // 2. Sicherer DB-Abruf mit Destructuring Assignment & SQL Injection Schutz
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]); 
    // in [rows] wird das innere Objekt zurückgegeben mit allen Inhalten wenn matching zur email korrekt ist

    /*
     die Abfrage ist übrigens ist äquivalent zu:

    const result = await pool.query("...");
    const rows = result[0]; // Das erste Element herausholen
    */


    // 3. User-Verifizierung (Check ob Array leer) und erst Verfizierung ob überhaupt solch ein Objekt existiert zur Mail
    if (rows.length === 0) {
      return res.status(401).json({ message: "Ungültige E-Mail oder Passwort" });
    }   

    const user = rows[0];   // Hier wird die Variable user als ganzes Objekt (mit allen werten) übergeben

    // 4. Kryptographischer Passwort-Vergleich
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!passwordMatch) {
      return res.status(401).json({ message: "Ungültige E-Mail oder Passwort" });
    }     

    res.json({ message: "Login erfolgreich" });

  } catch (error) {
    // Zentrales Error-Handling
    console.error("Login Error:", error);
    res.status(500).json({ message: "Fehler beim Login" });
  }   
});
```


## Verwendete Konzepte

*   **Destructuring Assignment:** Sauberer Code durch direktes Entpacken von Objekten und Arrays.
*   **Bcrypt:** Sicherer Industriestandard für Passwort-Hashing.
*   **Async/Await:** Ermöglicht eine flache, lesbare Struktur bei asynchronen Operationen.
*   **Security by Design:** Diese Implementierung folgt dem Prinzip **"Security by Design"**. Durch die Kombination aus **Prepared Statements** (gegen SQL-Injection), **Bcrypt** (gegen Datenleaks von Passwörtern) und dem Schutz vor **User Enumeration** (gegen gezieltes Ausspähen von Nutzerdaten) wird eine robuste Barriere gegen gängige Web-Angriffe geschaffen. Die Verwendung von **Object Destructuring** sorgt dabei zusätzlich dafür, dass der Code wartbar und übersichtlich bleibt.

Diese Implementierung kombiniert mehrere Sicherheitsmechanismen, um typische Web-Angriffe wie SQL Injection, User Enumeration und Timing Attacks zu verhindern.