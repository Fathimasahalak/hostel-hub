const { User, Attendance } = require('./models');
const sequelize = require('./config/database');

async function showData() {
    try {
        await sequelize.authenticate();
        console.log("Connected to database.");

        // Use raw queries for simplicity if model sync is an issue in this script context
        // But better to use Models.

        const users = await User.findAll({ raw: true });
        console.log("\n=== USERS ===");
        if (users.length > 0) {
            console.table(users.map(u => ({
                id: u.id.substring(0, 8) + '...',
                name: u.name,
                email: u.email,
                role: u.role,
                room: u.hostelRoom || 'N/A'
            })));
        } else {
            console.log("No users found.");
        }

        const attendance = await Attendance.findAll({
            limit: 10,
            order: [['date', 'DESC']],
            include: [{ model: User, attributes: ['name'] }]
        });

        console.log("\n=== RECENT ATTENDANCE (Last 10) ===");
        if (attendance.length > 0) {
            console.table(attendance.map(a => ({
                date: a.date,
                user: a.User ? a.User.name : 'Unknown',
                status: a.status
            })));
        } else {
            console.log("No attendance records found.");
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

showData();
