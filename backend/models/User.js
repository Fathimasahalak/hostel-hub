const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: { // Used as Username
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    avatar: {
        type: DataTypes.STRING,
        allowNull: true
    },
    role: {
        type: DataTypes.ENUM('student', 'admin'),
        defaultValue: 'student'
    },
    hostelRoom: {
        type: DataTypes.INTEGER,
        allowNull: true // Only for students
    },
    studentId: { // Dedicated Student ID separate from UUID
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true
    },
    address: {
        type: DataTypes.STRING,
        allowNull: true
    },
    guardianName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    guardianPhone: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = User;
