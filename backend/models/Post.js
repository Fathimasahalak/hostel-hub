const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Post = sequelize.define('Post', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    category: {
        type: DataTypes.ENUM('general', 'event', 'notice', 'help', 'lost_found'),
        defaultValue: 'general'
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    circleId: {
        type: DataTypes.UUID,
        allowNull: true // If null, it's a general post
    }
});

module.exports = Post;
