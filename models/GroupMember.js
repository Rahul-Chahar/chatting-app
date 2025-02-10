// models/GroupMember.js
module.exports = (sequelize, DataTypes) => {
    const GroupMember = sequelize.define('GroupMember', {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      groupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      // Role of the user in the group. Default is 'member'.
      role: {
        type: DataTypes.ENUM('admin', 'member'),
        allowNull: false,
        defaultValue: 'member'
      },
      joinedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      }
    }, {
      timestamps: false,
    });
    return GroupMember;
  };
  