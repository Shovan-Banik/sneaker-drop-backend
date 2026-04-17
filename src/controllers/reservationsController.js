const reservationService = require('../services/reservationService');
const sockets = require('../sockets');
const { success, failure } = require('../utils/response');
const { getRecentPurchasers } = require('../utils/dropHelpers');

async function reserve(req, res) {
  try {
    const userId = req.user.id;
    const { dropId } = req.body;
    if (!dropId) return failure(res, 'dropId required', 400);
    const { reservation, available_stock } = await reservationService.reserve(userId, dropId);
    const recentPurchasers = await getRecentPurchasers(dropId);
    sockets.emitStockUpdate({ dropId, availableStock: available_stock, action: 'reserved', recentPurchasers });
    return success(res, { reservation, available_stock }, 201);
  } catch (err) {
    console.error(err);
    if (err.code === 'OUT_OF_STOCK') return failure(res, 'Out of stock', 409);
    return failure(res, err.message);
  }
}

module.exports = { reserve };
