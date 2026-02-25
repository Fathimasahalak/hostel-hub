const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Fee = sequelize.define('Fee', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    month: {
        type: DataTypes.STRING, // Format: "YYYY-MM"
        allowNull: false
    },
    messCharge: {
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
    },
    totalAmount: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    isPaid: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
    // Will add UserId foreign key in index.js association
});

module.exports = Fee;
