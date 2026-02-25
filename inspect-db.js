const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'backend', 'database.sqlite'); // Correct path based on CWD
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Error opening database: " + err.message);
    } else {
        console.log("Database connected.");
        inspectDB();
    }
});

function inspectDB() {
    // 1. List all tables
    db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
        if (err) {
            console.error("Error listing tables:", err);
            return;
        }

        const tableNames = tables.map(t => t.name);
        console.log("\nTables found:", tableNames.join(", "));

        // 2. Query Users (try to guess name if needed, usually 'Users')
        const userTable = tableNames.find(n => n === 'Users' || n === 'User');
        if (userTable) {
            console.log(`\n=== DATA IN '${userTable}' ===`);
            db.all(`SELECT id, name, email, role, hostelRoom FROM ${userTable}`, [], (err, rows) => {
                if (err) console.error(err);
                else {
                    if (rows.length === 0) console.log("No users found.");
                    else console.table(rows.map(r => ({
                        name: r.name,
                        email: r.email,
                        role: r.role,
                        room: r.hostelRoom
                    })));
                }
            });
        }

        // 3. Query Attendance
        const attTable = tableNames.find(n => n === 'Attendances' || n === 'Attendance');
        if (attTable) {
            // giving a small delay to ensure output order
            setTimeout(() => {
                console.log(`\n=== DATA IN '${attTable}' ===`);
                db.all(`SELECT * FROM ${attTable} ORDER BY date DESC LIMIT 5`, [], (err, rows) => {
                    if (err) console.error(err);
                    else {
                        if (rows.length === 0) console.log("No attendance records found.");
                        else console.table(rows);
                    }
                });
            }, 500);
        }
    });
}
