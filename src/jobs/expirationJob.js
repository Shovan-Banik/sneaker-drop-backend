const db = require('../models');
const sockets = require('../sockets');
const { Reservation, Drop, sequelize } = db;

let timer = null;

async function expireReservations() {
  console.log('Running expiration sweep...');
  // find expired ACTIVE reservations
  let expired = [];
  try {
    expired = await Reservation.findAll({
      where: {
        status: 'ACTIVE',
        expires_at: { [require('sequelize').Op.lt]: new Date() }
      }
    });
  } catch (err) {
    // If the reservations table doesn't exist yet (during init), skip silently
    if (err && err.parent && err.parent.code === '42P01') {
      console.warn('Expiration job: reservations table not found yet, skipping sweep');
      return;
    }
    console.error('Expiration job: unexpected error while querying reservations', err);
    return;
  }

  for (const res of expired) {
    try {
      await sequelize.transaction(async (t) => {
        // lock reservation
        const reservation = await Reservation.findByPk(res.id, { transaction: t, lock: t.LOCK.UPDATE });
        if (!reservation) return;
        if (reservation.status !== 'ACTIVE') return;
        // mark expired
        reservation.status = 'EXPIRED';
        await reservation.save({ transaction: t });

        // restore stock
        const drop = await Drop.findByPk(reservation.drop_id, { transaction: t, lock: t.LOCK.UPDATE });
        if (!drop) return;
        drop.available_stock = drop.available_stock + 1;
        await drop.save({ transaction: t });

        // emit socket update
        sockets.emitStockUpdate({ dropId: drop.id, availableStock: drop.available_stock, action: 'expired' });
      });
    } catch (err) {
      console.error('Failed to expire reservation', res.id, err);
    }
  }
}

function start(intervalMs = 5000) {
  if (timer) return;
  timer = setInterval(() => expireReservations().catch(err => console.error(err)), intervalMs);
  console.log('Started expiration job every', intervalMs, 'ms');
}

function stop() {
  if (!timer) return;
  clearInterval(timer);
  timer = null;
}

module.exports = { start, stop };
