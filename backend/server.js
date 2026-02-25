const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
// Models will be imported here to ensure they are synchronized

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// JSON error handling middleware
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.error('Bad JSON:', err.message);
        return res.status(400).send({ error: 'Malformed JSON' });
    }
    next();
});

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/fees', require('./routes/feeRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/messmenu', require('./routes/messRoutes'));
app.use('/api/community', require('./routes/communityRoutes'));

// Routes will be imported here

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'Hostel Management System API is running' });
});

// Sync database and start server
sequelize.sync() // Set alter: true or force: true to sync schema changes (dev only)
    .then(() => {
        console.log('Database synced successfully');
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server is running on http://0.0.0.0:${PORT}`);
        });

        // Keep process alive
        setInterval(() => { }, 1000 * 60 * 60);
    })
    .catch(err => {
        console.error('Failed to sync database:', err);
    });
