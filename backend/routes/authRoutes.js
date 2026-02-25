const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const router = express.Router();

// Signup (For students mostly, but logic supports admins if needed)
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, role, hostelRoom, studentId } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }

        if (role === 'student' && !hostelRoom) {
            return res.status(400).json({ error: 'Hostel Room is required for students' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'student',
            hostelRoom,
            studentId,
            phoneNumber: req.body.phoneNumber,
            address: req.body.address,
            guardianName: req.body.guardianName,
            guardianPhone: req.body.guardianPhone
        });

        res.status(201).json({ message: 'User created successfully', userId: user.id });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Optional: Enforce role check if you want strict login pages
        if (role && user.role !== role) {
            return res.status(403).json({ error: `Please login via the ${user.role} portal` });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, name: user.name },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                hostelRoom: user.hostelRoom,
                studentId: user.studentId
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
