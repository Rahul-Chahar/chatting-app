// models/index.js
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config(); // Load .env variables

// Initialize Sequelize with MySQL credentials from .env
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false, // Disable logging; set to console.log to debug
  }
);

const db = {};

// Attach Sequelize and the instance to the db object
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import the User model and attach it to the db object
db.User = require('./User')(sequelize, DataTypes);

module.exports = db;
