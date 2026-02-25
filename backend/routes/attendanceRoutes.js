const express = require('express');
const { Attendance, User } = require('../models');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Get Attendance (Student: Own, Admin: All)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { date } = req.query;
        const whereClause = {};
        if (date) whereClause.date = date;
        if (req.user.role === 'student') whereClause.userId = req.user.id;

        const attendance = await Attendance.findAll({
            where: whereClause,
            include: [{ model: User, attributes: ['name', 'studentId', 'hostelRoom'] }]
        });

        res.json(attendance);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch attendance' });
    }
});

// Mark Attendance (Admin only)
router.post('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const { date, records } = req.body; // records: [{ userId, status }]

        // Bulk create or update
        const promises = records.map(record => {
            return Attendance.findOne({ where: { userId: record.userId, date } })
                .then(found => {
                    if (found) {
                        return found.update({ status: record.status });
                    }
                    return Attendance.create({ userId: record.userId, date, status: record.status });
                });
        });

        await Promise.all(promises);
        res.json({ message: 'Attendance marked successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to mark attendance' });
    }
});

module.exports = router;
