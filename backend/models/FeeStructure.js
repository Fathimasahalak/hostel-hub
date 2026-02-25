const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FeeStructure = sequelize.define('FeeStructure', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    month: {
        type: DataTypes.STRING, // "YYYY-MM"
        allowNull: false,
        unique: true
    },
    messRatePerDay: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    establishmentFee: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    wifiFee: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    waterBill: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    }
});

module.exports = FeeStructure;
