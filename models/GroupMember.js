// models/GroupMember.js
module.exports = (sequelize, DataTypes) => {
    const GroupMember = sequelize.define('GroupMember', {
      // No primary key needed if using composite primary key.
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      groupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      role: {
        type: DataTypes.ENUM('admin', 'member'),
        defaultValue: 'member'
      },
      joinedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    }, {
      timestamps: false,
    });
    return GroupMember;
  };
  