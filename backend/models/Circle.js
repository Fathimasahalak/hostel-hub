const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Circle = sequelize.define('Circle', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    icon: {
        type: DataTypes.STRING, // Store icon name or emoji
        allowNull: true
    },
    color: {
        type: DataTypes.STRING, // Store Tailwind color classes or hex
        allowNull: true
    },
    createdBy: {
        type: DataTypes.UUID,
        allowNull: true // Could be null for system circles
    }
});

module.exports = Circle;
