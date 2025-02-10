// models/index.js
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
  }
);

const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Load models.
db.User = require('./User')(sequelize, DataTypes);
db.Group = require('./Group')(sequelize, DataTypes);
db.GroupMember = require('./GroupMember')(sequelize, DataTypes);
db.GroupMessage = require('./GroupMessage')(sequelize, DataTypes);

// Associations.
// Users <-> Groups (through GroupMember)
db.User.belongsToMany(db.Group, { through: db.GroupMember, foreignKey: 'userId' });
db.Group.belongsToMany(db.User, { through: db.GroupMember, foreignKey: 'groupId' });

// **IMPORTANT:** Associate GroupMember with User
db.GroupMember.belongsTo(db.User, { foreignKey: 'userId' });

// Group has many messages.
db.Group.hasMany(db.GroupMessage, { foreignKey: 'groupId' });
db.GroupMessage.belongsTo(db.Group, { foreignKey: 'groupId' });

// User sends many messages.
db.User.hasMany(db.GroupMessage, { foreignKey: 'senderId' });
db.GroupMessage.belongsTo(db.User, { foreignKey: 'senderId' });

module.exports = db;
