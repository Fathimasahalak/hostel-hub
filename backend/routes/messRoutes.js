const express = require('express');
const router = express.Router();
const { MessMenu, MessPreference, User, sequelize } = require('../models');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const { Op } = require('sequelize');

// GET /api/messmenu - Get the weekly mess menu
router.get('/', authenticateToken, async (req, res) => {
    try {
        const menu = await MessMenu.findAll();
        const dayOrder = { 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6, 'Sunday': 7 };
        const sortedMenu = menu.sort((a, b) => dayOrder[a.day] - dayOrder[b.day]);
        res.json(sortedMenu);
    } catch (error) {
        console.error('Error fetching mess menu:', error);
        res.status(500).json({ error: 'Failed to fetch mess menu' });
    }
});

// POST /api/messmenu - Create or Update the weekly mess menu (Admin Only)
router.post('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const menuItems = req.body;
        if (!Array.isArray(menuItems)) {
            return res.status(400).json({ error: 'Input must be an array of menu items' });
        }

        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

        for (const item of menuItems) {
            if (!days.includes(item.day)) continue;

            // We use upsert, conflict targeted on 'day' unique constraint in SQLite
            await MessMenu.upsert({
                day: item.day,
                breakfast: item.breakfast || '',
                lunch: item.lunch || '',
                snacks: item.snacks || '',
                snacksNonVeg: item.snacksNonVeg || '',
                dinnerVeg: item.dinnerVeg || '',
                dinnerNonVeg: item.dinnerNonVeg || ''
            });
        }

        res.json({ message: 'Menu updated successfully' });
    } catch (error) {
        console.error('Error updating mess menu:', error);
        res.status(500).json({ error: 'Failed to update mess menu', details: error.message });
    }
});

// GET /api/messmenu/preferences - Get student's own preferences
router.get('/preferences', authenticateToken, async (req, res) => {
    try {
        const preferences = await MessPreference.findAll({
            where: { userId: req.user.id }
        });
        res.json(preferences);
    } catch (error) {
        console.error('Error fetching preferences:', error);
        res.status(500).json({ error: 'Failed to fetch preferences' });
    }
});

// POST /api/messmenu/preferences - Save student's preferences (Array of days)
router.post('/preferences', authenticateToken, authorizeRole(['student']), async (req, res) => {
    try {
        const preferences = req.body;
        if (!Array.isArray(preferences)) {
            return res.status(400).json({ error: 'Input must be an array of preferences' });
        }

        for (const pref of preferences) {
            const { day, dinnerChoice, snacksChoice } = pref;
            if (!day) continue;

            const [record, created] = await MessPreference.findOrCreate({
                where: { userId: req.user.id, day },
                defaults: { dinnerChoice: dinnerChoice || 'Non-Veg', snacksChoice: snacksChoice || 'Veg' }
            });

            if (!created) {
                await record.update({ dinnerChoice: dinnerChoice || 'Non-Veg', snacksChoice: snacksChoice || 'Veg' });
            }
        }

        res.json({ message: 'Preferences saved successfully' });
    } catch (error) {
        console.error('Error saving preferences:', error);
        res.status(500).json({ error: 'Failed to save preferences' });
    }
});

// GET /api/messmenu/stats - Get aggregate counts for Choices
router.get('/stats', authenticateToken, async (req, res) => {
    try {
        const dinnerStats = await MessPreference.findAll({
            attributes: [
                'day',
                'dinnerChoice',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['day', 'dinnerChoice'],
            raw: true
        });

        const snacksStats = await MessPreference.findAll({
            where: {
                day: ['Tuesday', 'Thursday'],
                snacksChoice: { [Op.not]: null }
            },
            attributes: [
                'day',
                'snacksChoice',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['day', 'snacksChoice'],
            raw: true
        });

        const formattedStats = {};
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        days.forEach(d => {
            formattedStats[d] = {
                dinnerVeg: 0,
                dinnerNonVeg: 0,
                snacksVeg: 0,
                snacksNonVeg: 0
            };
        });

        dinnerStats.forEach(s => {
            if (formattedStats[s.day]) {
                const key = s.dinnerChoice === 'Veg' ? 'dinnerVeg' : 'dinnerNonVeg';
                formattedStats[s.day][key] = parseInt(s.count);
            }
        });

        snacksStats.forEach(s => {
            if (formattedStats[s.day]) {
                const key = s.snacksChoice === 'Veg' ? 'snacksVeg' : 'snacksNonVeg';
                formattedStats[s.day][key] = parseInt(s.count);
            }
        });

        res.json(formattedStats);
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch mess stats' });
    }
});

module.exports = router;
