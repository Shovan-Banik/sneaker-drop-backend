const purchaseService = require('../services/purchaseService');
const sockets = require('../sockets');
const db = require('../models');
const { Drop } = db;
const { success, failure } = require('../utils/response');
const { getRecentPurchasers } = require('../utils/dropHelpers');

async function purchase(req, res) {
  try {
    const userId = req.user.id;
    const { reservationId } = req.body;
    if (!reservationId) return failure(res, 'reservationId required', 400);
    const { purchase } = await purchaseService.purchase(reservationId, userId);

    const drop = await Drop.findByPk(purchase.drop_id);
    const available_stock = drop ? drop.available_stock : null;
    const recentPurchasers = await getRecentPurchasers(purchase.drop_id);

    sockets.emitStockUpdate({ dropId: purchase.drop_id, availableStock: available_stock, action: 'purchased', recentPurchasers });
    return success(res, { purchase, available_stock, recentPurchasers }, 201);
  } catch (err) {
    console.error(err);
    return failure(res, err.message);
  }
}

module.exports = { purchase };
