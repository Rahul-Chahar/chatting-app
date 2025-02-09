// models/GroupMessage.js
module.exports = (sequelize, DataTypes) => {
    const GroupMessage = sequelize.define('GroupMessage', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      senderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      groupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    }, {
      timestamps: true, // adds createdAt and updatedAt automatically
    });
    return GroupMessage;
  };
  