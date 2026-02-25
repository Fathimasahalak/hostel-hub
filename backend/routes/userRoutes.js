const express = require('express');
const { User } = require('../models');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Get all users (for Admin to view list of students)
router.get('/', authenticateToken, authorizeRole('admin'), async (req, res) => {
    try {
        const users = await User.findAll({
            where: { role: 'student' },
            attributes: ['id', 'name', 'email', 'hostelRoom', 'studentId']
        });
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
