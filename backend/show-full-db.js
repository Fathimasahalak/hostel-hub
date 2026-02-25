const { User, Attendance, Fee, Complaint, FeeStructure, MessMenu, MessPreference } = require('./models');
const sequelize = require('./config/database');

async function showFullData() {
    try {
        await sequelize.authenticate();
        console.log("Connected to database.\n");

        const tables = [
            { name: 'USERS', model: User, fields: u => ({ id: u.id.substring(0, 8), name: u.name, email: u.email, role: u.role, room: u.hostelRoom || 'N/A' }) },
            { name: 'ATTENDANCE', model: Attendance, fields: a => ({ date: a.date, userId: a.userId.substring(0, 8), status: a.status }) },
            { name: 'FEES', model: Fee, fields: f => ({ month: f.month, userId: f.userId.substring(0, 8), total: f.totalAmount, paid: f.isPaid }) },
            { name: 'COMPLAINTS', model: Complaint, fields: c => ({ title: c.title, userId: c.userId.substring(0, 8), status: c.status }) },
            { name: 'FEE STRUCTURES', model: FeeStructure, fields: fs => ({ month: fs.month, messRate: fs.messRatePerDay, establishment: fs.establishmentFee }) },
            { name: 'MESS MENU', model: MessMenu, fields: m => ({ day: m.day, breakfast: m.breakfast, lunch: m.lunch, dinner: m.dinnerDescription }) },
            { name: 'MESS PREFERENCES', model: MessPreference, fields: mp => ({ day: mp.day, userId: mp.userId.substring(0, 8), dinner: mp.dinnerChoice }) }
        ];

        for (const table of tables) {
            console.log(`=== ${table.name} ===`);
            const data = await table.model.findAll({ limit: 10, raw: true });
            if (data.length > 0) {
                console.table(data.map(table.fields));
            } else {
                console.log(`No records in ${table.name}.\n`);
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

showFullData();
