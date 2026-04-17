module.exports = (sequelize) => {
  const { DataTypes } = require('sequelize');
  const Purchase = sequelize.define('Purchase', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    drop_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    }
  }, {
    tableName: 'purchases',
    timestamps: false,
    indexes: [
      { fields: ['created_at'] },
    ],
  });
  return Purchase;
};
