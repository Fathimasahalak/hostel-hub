const express = require('express');
const { Fee, User, FeeStructure, Attendance } = require('../models');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Get Fees (Student: Own, Admin: All)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const whereClause = {};
        if (req.user.role === 'student') whereClause.userId = req.user.id;

        const fees = await Fee.findAll({
            where: whereClause,
            include: [{ model: User, attributes: ['name', 'studentId', 'hostelRoom'] }]
        });

        res.json(fees);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch fees' });
    }
});

// Get Fee Structure (Admin/Student)
router.get('/structure', authenticateToken, async (req, res) => {
    try {
        const { month } = req.query;
        if (!month) return res.status(400).json({ error: 'Month is required' });

        const structure = await FeeStructure.findOne({ where: { month } });
        res.json(structure || { messRatePerDay: 0, establishmentFee: 0, wifiFee: 0, waterBill: 0 });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch fee structure' });
    }
});

// Set Fee Structure (Admin)
router.post('/structure', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const { month, messRatePerDay, establishmentFee, wifiFee, waterBill } = req.body;

        const [structure, created] = await FeeStructure.findOrCreate({
            where: { month },
            defaults: { messRatePerDay, establishmentFee, wifiFee, waterBill }
        });

        if (!created) {
            await structure.update({ messRatePerDay, establishmentFee, wifiFee, waterBill });
        }
        res.json({ message: 'Fee structure saved' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save fee structure' });
    }
});

// Generate Bills (Admin)
router.post('/generate', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const { month } = req.body; // YYYY-MM

        // 1. Get Fee Structure
        const structure = await FeeStructure.findOne({ where: { month } });
        if (!structure) return res.status(400).json({ error: 'Fee structure not set for this month' });

        // 2. Get All Students
        const students = await User.findAll({ where: { role: 'student' } });

        const { Op } = require('sequelize');
        const startDate = new Date(`${month}-01`);
        const endDate = new Date(new Date(startDate).setMonth(startDate.getMonth() + 1));

        // 3. Process Each Student
        for (const student of students) {
            // Count Present Days
            const presentDays = await Attendance.count({
                where: {
                    userId: student.id,
                    status: 'present',
                    date: {
                        [Op.gte]: startDate,
                        [Op.lt]: endDate
                    }
                }
            });

            const messCharge = presentDays * structure.messRatePerDay;
            const totalAmount = messCharge + structure.establishmentFee + structure.wifiFee + structure.waterBill;

            // Create/Update Fee Record
            const [fee, created] = await Fee.findOrCreate({
                where: { userId: student.id, month },
                defaults: {
                    messCharge,
                    establishmentFee: structure.establishmentFee, // Save snapshot
                    wifiFee: structure.wifiFee,
                    waterBill: structure.waterBill,
                    totalAmount,
                    isPaid: false
                }
            });

            if (!created) {
                // If bill exists, we update it (unless paid? but admin asks to generate, so we force update mostly)
                // Assuming we can update unpaid bills.
                if (!fee.isPaid) {
                    await fee.update({
                        messCharge,
                        establishmentFee: structure.establishmentFee,
                        wifiFee: structure.wifiFee,
                        waterBill: structure.waterBill,
                        totalAmount
                    });
                }
            }
        }

        res.json({ message: 'Bills generated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate bills' });
    }
});


// Add/Update Fee (Admin only) - Legacy/Manual Override
router.post('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const { userId, month, messCharge, establishmentFee, wifiFee, waterBill, isPaid } = req.body;

        // Calculate total
        const totalAmount = parseFloat(messCharge || 0) + parseFloat(establishmentFee || 0) + parseFloat(wifiFee || 0) + parseFloat(waterBill || 0);

        const [fee, created] = await Fee.findOrCreate({
            where: { userId, month },
            defaults: { messCharge, establishmentFee, wifiFee, waterBill, totalAmount, isPaid }
        });

        if (!created) {
            await fee.update({ messCharge, establishmentFee, wifiFee, waterBill, totalAmount, isPaid });
        }

        res.json({ message: 'Fee record updated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update fee record' });
    }
});

// Mark Fee as Paid (Admin only)
router.patch('/:id/pay', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const fee = await Fee.findByPk(req.params.id);
        if (!fee) return res.status(404).json({ error: 'Fee record not found' });

        const { isPaid } = req.body;
        
        await fee.update({ isPaid: isPaid !== undefined ? isPaid : true });
        res.json({ message: 'Fee status updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update fee status' });
    }
});

module.exports = router;
