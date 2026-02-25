const express = require('express');
const { Complaint, User } = require('../models');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Get Complaints (Student: Own, Admin: All)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const whereClause = {};
        if (req.user.role === 'student') whereClause.userId = req.user.id;

        const complaints = await Complaint.findAll({
            where: whereClause,
            include: [{ model: User, attributes: ['name', 'studentId', 'hostelRoom'] }],
            order: [['createdAt', 'DESC']]
        });

        res.json(complaints);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch complaints' });
    }
});

// Create Complaint (Student)
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { title, description } = req.body;
        await Complaint.create({
            userId: req.user.id,
            title,
            description
        });
        res.status(201).json({ message: 'Complaint submitted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to submit complaint' });
    }
});

// Resolve/Update Complaint (Admin)
router.put('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const { status, adminResponse } = req.body;
        const complaint = await Complaint.findByPk(req.params.id);

        if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

        await complaint.update({ status, adminResponse });
        res.json({ message: 'Complaint updated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update complaint' });
    }
});

module.exports = router;
