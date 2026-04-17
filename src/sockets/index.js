let io = null;

function init(server) {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Engine-level error logging for debugging connection issues
  io.engine.on('connection_error', (err) => {
    console.error('Socket engine connection_error:', {
      code: err.code,
      message: err.message,
      context: err.context,
    });
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);
    socket.on('disconnect', (reason) =>
      console.log('Socket disconnected:', socket.id, 'reason:', reason)
    );
  });
}

function getIo() {
  return io;
}

/**
 * Emit a stock_update event with full drop details so the frontend can
 * update the UI without making another API call.
 *
 * @param {object} payload
 * @param {string|number} payload.dropId
 * @param {number}        payload.availableStock
 * @param {string}        payload.action   - 'reserved' | 'purchased' | 'expired'
 * @param {string[]}      [payload.recentPurchasers] - latest 3 buyer usernames
 */
function emitStockUpdate({ dropId, availableStock, action, recentPurchasers }) {
  if (!io) return;
  const event = {
    dropId,
    availableStock,
    action,
    recentPurchasers: recentPurchasers || [],
    timestamp: new Date().toISOString(),
  };
  console.log('Emitting stock_update:', event);
  io.emit('stock_update', event);
}

module.exports = { init, getIo, emitStockUpdate };
