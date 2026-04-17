const db = require('../models');
const { Reservation, Drop, sequelize } = db;

async function reserve(userId, dropId, ttlSeconds = parseInt(process.env.RESERVATION_TTL || '60')) {
  return await sequelize.transaction(async (t) => {
    // lock drop row
    const drop = await Drop.findByPk(dropId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!drop) throw new Error('Drop not found');
    if (drop.available_stock <= 0) {
      const err = new Error('Out of stock');
      err.code = 'OUT_OF_STOCK';
      throw err;
    }
    drop.available_stock = drop.available_stock - 1;
    await drop.save({ transaction: t });

    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    const reservation = await Reservation.create({
      user_id: userId,
      drop_id: dropId,
      expires_at: expiresAt,
      status: 'ACTIVE'
    }, { transaction: t });

    return { reservation, available_stock: drop.available_stock };
  });
}

module.exports = { reserve };
