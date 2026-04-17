module.exports = (sequelize) => {
  const { DataTypes } = require('sequelize');
  const Reservation = sequelize.define('Reservation', {
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
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('ACTIVE','EXPIRED','COMPLETED'),
      allowNull: false,
      defaultValue: 'ACTIVE',
    }
  }, {
    tableName: 'reservations',
    timestamps: false,
    indexes: [
      { fields: ['expires_at'] },
      { fields: ['status'] },
    ],
  });
  return Reservation;
};
