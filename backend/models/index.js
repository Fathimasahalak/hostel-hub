const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const User = require('./User');
const Attendance = require('./Attendance');
const Fee = require('./Fee');
const Complaint = require('./Complaint');
const FeeStructure = require('./FeeStructure');
const MessMenu = require('./MessMenu');
const MessPreference = require('./MessPreference');
const Circle = require('./Circle');
const Post = require('./Post');
const Comment = require('./Comment');
const Like = require('./Like');

// Associations
User.hasMany(Attendance, { foreignKey: 'userId', onDelete: 'CASCADE' });
Attendance.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Fee, { foreignKey: 'userId', onDelete: 'CASCADE' });
Fee.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Complaint, { foreignKey: 'userId', onDelete: 'CASCADE' });
Complaint.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(MessPreference, { foreignKey: 'userId', onDelete: 'CASCADE' });
MessPreference.belongsTo(User, { foreignKey: 'userId' });

// Community Associations
User.hasMany(Post, { foreignKey: 'userId', onDelete: 'CASCADE' });
Post.belongsTo(User, { foreignKey: 'userId' });

Circle.hasMany(Post, { foreignKey: 'circleId', onDelete: 'SET NULL' });
Post.belongsTo(Circle, { foreignKey: 'circleId' });

User.hasMany(Comment, { foreignKey: 'userId', onDelete: 'CASCADE' });
Comment.belongsTo(User, { foreignKey: 'userId' });

Post.hasMany(Comment, { foreignKey: 'postId', onDelete: 'CASCADE' });
Comment.belongsTo(Post, { foreignKey: 'postId' });

User.hasMany(Like, { foreignKey: 'userId', onDelete: 'CASCADE' });
Like.belongsTo(User, { foreignKey: 'userId' });

Post.hasMany(Like, { foreignKey: 'postId', onDelete: 'CASCADE' });
Like.belongsTo(Post, { foreignKey: 'postId' });

// Circle members (Many-to-Many)
User.belongsToMany(Circle, { through: 'CircleMember', as: 'JoinedCircles' });
Circle.belongsToMany(User, { through: 'CircleMember', as: 'Members' });

module.exports = {
    sequelize,
    User,
    Attendance,
    Fee,
    Complaint,
    FeeStructure,
    MessMenu,
    MessPreference,
    Circle,
    Post,
    Comment,
    Like
};
