const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error(err);
    else checkTable();
});

function checkTable() {
    db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='FeeStructures'", [], (err, rows) => {
        if (err) console.error(err);
        else {
            if (rows.length > 0) console.log("FeeStructures table EXISTS.");
            else console.log("FeeStructures table MISSING.");
        }
        db.close();
    });
}
