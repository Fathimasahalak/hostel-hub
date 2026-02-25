const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Error opening database " + err.message);
    } else {
        inspectUsers();
    }
});

function inspectUsers() {
    db.all(`SELECT * FROM Users`, [], (err, rows) => {
        if (err) {
            console.log("Error:", err.message);
        } else {
            console.log(`COUNT: ${rows.length}`);
            rows.forEach(u => {
                console.log(`[USER] ${u.name} | Role: ${u.role} | Email: ${u.email} | Room: ${u.hostelRoom}`);
            });
        }
        db.close();
    });
}
