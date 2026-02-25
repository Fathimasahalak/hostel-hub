const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MessPreference = sequelize.define('MessPreference', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    day: {
        type: DataTypes.ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
        allowNull: false
    },
    dinnerChoice: {
        type: DataTypes.ENUM('Veg', 'Non-Veg'),
        allowNull: false,
        defaultValue: 'Non-Veg'
    },
    snacksChoice: { // Specifically for Tue/Thu
        type: DataTypes.ENUM('Veg', 'Non-Veg'),
        allowNull: true
    }
});

module.exports = MessPreference;
