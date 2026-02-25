const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Error opening database " + err.message);
    } else {
        dumpStudents();
    }
});

function dumpStudents() {
    db.all(`SELECT * FROM Users WHERE role = 'student'`, [], (err, rows) => {
        if (err) {
            console.log("Error:", err.message);
        } else {
            console.log(`Found ${rows.length} students:`);
            console.log(JSON.stringify(rows, null, 2));
        }
        db.close();
    });
}
