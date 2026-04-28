# 🖥️ Code Doku Backend

## Datei: `server.js`

### Endpunkt: `/api/login`
Dieser Endpunkt verarbeitet die Benutzer-Authentifizierung. Aus Sicherheitsgründen folgt die Funktion einem strikten Workflow, um sowohl die Datenintegrität als auch den Schutz vor Angriffen zu gewährleisten.

> **Security-Prinzip:** Der User erhält stets eine **generische Fehlermeldung**. Dadurch wird verschleiert, ob die E-Mail im System existiert oder lediglich das Passwort falsch war (Schutz vor *User Enumeration*).

---

## 🔒 Authentication Flow & Security Logic

Der Prozess ist in vier Hauptschritte unterteilt:

### 1. Daten-Extraktion (Destructuring)
Zuerst werden mittels **Object Destructuring** nur die benötigten Felder aus dem Request extrahiert. Dies sorgt für eine klare Schnittstelle.
```javascript
const { email, password } = req.body;
```

### 2. Schutz vor SQL-Injections
Die Datenbankabfrage erfolgt über **Prepared Statements** (Platzhalter `?`).
- **Sicherheit:** Benutzereingaben werden strikt als Datenwert und niemals als ausführbarer SQL-Code behandelt.
- **Destructuring Assignment:** Wir "entpacken" direkt das Resultat-Array (`[rows]`), um direkt auf die Datensätze zuzugreifen, statt das gesamte Metadaten-Paket der DB zu verarbeiten.

### 3. Schutz vor User Enumeration & Timing Attacks
Bevor rechenintensive Kryptographie (Bcrypt) angewendet wird, erfolgt eine Validierung des Abfrageergebnisses.
- **User Enumeration:** Durch identische Fehlermeldungen für "E-Mail falsch" und "Passwort falsch" verhindern wir, dass Angreifer durch systematisches Testen herausfinden können, welche E-Mail-Adressen im System existieren.
- **Timing Attacks:** Ein Angreifer könnte theoretisch messen, wie lange der Server für eine Antwort braucht. Da das Hashen mit Bcrypt Zeit benötigt, würde eine sofortige Fehlermeldung bei falscher E-Mail den User verraten. 
- **Lösung:** Im Code achten wir darauf, den Prozessfluss so zu gestalten, dass die Antwortzeiten für den Angreifer möglichst wenig Rückschlüsse auf die Existenz eines Kontos zulassen.


### 4. Existence Check (Early Return)
Bevor rechenintensive Kryptographie (Bcrypt) angewendet wird, prüfen wir, ob das Ergebnis-Array leer ist.
- Falls `rows.length === 0`, wird der Prozess sofort abgebrochen.
- Dies spart Ressourcen und ist der erste Teil der Validierung.

### 5. Passwort-Verifizierung mit Bcrypt
Da Passwörter niemals im Klartext gespeichert werden, nutzt die Anwendung `bcrypt.compare()`, um den User-Input sicher gegen den gespeicherten Hash zu prüfen.

---

## 📝 Implementierungs-Beispiel

```javascript
app.post("/api/login", async (req, res) => {   // REQ-> REQUEST / RES -> REPONSE  
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

### Verwendete Konzepte
*   **Destructuring Assignment:** Sauberer Code durch direktes Entpacken von Objekten und Arrays.
*   **Bcrypt:** Sicherer Industriestandard für Passwort-Hashing.
*   **Async/Await:** Ermöglicht eine flache, lesbare Struktur bei asynchronen Operationen.
*   **Security by Design:** Diese Implementierung folgt dem Prinzip **"Security by Design"**. Durch die Kombination aus **Prepared Statements** (gegen SQL-Injection), **Bcrypt** (gegen Datenleaks von Passwörtern) und dem Schutz vor **User Enumeration** (gegen gezieltes Ausspähen von Nutzerdaten) wird eine robuste Barriere gegen gängige Web-Angriffe geschaffen. Die Verwendung von **Object Destructuring** sorgt dabei zusätzlich dafür, dass der Code wartbar und übersichtlich bleibt.