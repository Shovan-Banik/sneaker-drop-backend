module.exports = (sequelize) => {
  const { DataTypes } = require('sequelize');
  const Drop = sequelize.define('Drop', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
    },
    total_stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    available_stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    }
  }, {
    tableName: 'drops',
    timestamps: false,
    indexes: [
      { fields: ['start_time'] },
    ],
  });
  return Drop;
};
