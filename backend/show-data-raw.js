const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Error opening database " + err.message);
    } else {
        console.log("Database connected.");
        showData();
    }
});

function showData() {
    db.all(`SELECT id, name, email, role, hostelRoom FROM Users`, [], (err, rows) => {
        if (err) {
            console.log("Error querying Users (maybe table doesn't exist yet):", err.message);
        } else {
            console.log("\n=== USERS ===");
            console.table(rows.map(r => ({
                id: r.id.substring(0, 8) + '...',
                name: r.name,
                email: r.email,
                role: r.role,
                room: r.hostelRoom || 'N/A'
            })));
        }

        db.all(`SELECT Attendance.date, Attendance.status, Users.name 
                FROM Attendance 
                LEFT JOIN Users ON Attendance.userId = Users.id 
                ORDER BY date DESC LIMIT 10`, [], (err, rows) => {
            if (err) {
                console.log("\nError querying Attendance (maybe table doesn't exist yet):", err.message);
            } else {
                console.log("\n=== RECENT ATTENDANCE ===");
                console.table(rows);
            }
            db.close();
        });
    });
}
