// models/index.js
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Initialize Sequelize using credentials from .env
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

// Attach Sequelize and instance
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.User = require('./User')(sequelize, DataTypes);
db.Message = require('./Message')(sequelize, DataTypes);

// Define associations
// Each message belongs to one user and each user can have many messages.
db.Message.belongsTo(db.User, { foreignKey: 'userId' });
db.User.hasMany(db.Message, { foreignKey: 'userId' });

module.exports = db;
