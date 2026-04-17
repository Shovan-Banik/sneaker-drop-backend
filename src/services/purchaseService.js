const db = require('../models');
const { Reservation, Purchase, Drop, sequelize } = db;

async function purchase(reservationId, userId) {
  return await sequelize.transaction(async (t) => {
    const reservation = await Reservation.findByPk(reservationId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!reservation) throw new Error('Reservation not found');
    if (String(reservation.user_id) !== String(userId)) throw new Error('Reservation does not belong to user');
    if (reservation.status !== 'ACTIVE') throw new Error('Reservation not active');
    if (new Date(reservation.expires_at) <= new Date()) {
      // expire it
      reservation.status = 'EXPIRED';
      await reservation.save({ transaction: t });
      throw new Error('Reservation expired');
    }

    reservation.status = 'COMPLETED';
    await reservation.save({ transaction: t });

    const purchase = await Purchase.create({
      user_id: userId,
      drop_id: reservation.drop_id,
    }, { transaction: t });

    return { purchase };
  });
}

module.exports = { purchase };
