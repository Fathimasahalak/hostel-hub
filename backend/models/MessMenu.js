const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MessMenu = sequelize.define('MessMenu', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    day: {
        type: DataTypes.ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
        allowNull: false,
        unique: true
    },
    breakfast: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ''
    },
    lunch: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ''
    },
    snacks: { // Default snack (always shown, or Veg if choice)
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ''
    },
    snacksNonVeg: { // Only for Tue/Thu
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ''
    },
    dinnerVeg: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ''
    },
    dinnerNonVeg: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ''
    }
});

module.exports = MessMenu;
