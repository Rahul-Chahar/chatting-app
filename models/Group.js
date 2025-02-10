// models/Group.js
module.exports = (sequelize, DataTypes) => {
    const Group = sequelize.define('Group', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      // Who created the group.
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
      }
    });
    return Group;
  };
  