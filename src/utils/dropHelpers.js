const db = require('../models');
const { sequelize } = db;

/**
 * Fetch the latest 3 purchaser usernames for a given drop.
 */
async function getRecentPurchasers(dropId) {
  const rows = await sequelize.query(
    `SELECT u.username
     FROM purchases p
     JOIN users u ON p.user_id = u.id
     WHERE p.drop_id = $1
     ORDER BY p.created_at DESC
     LIMIT 3`,
    { bind: [dropId], type: sequelize.QueryTypes.SELECT }
  );
  return rows.map((r) => r.username);
}

module.exports = { getRecentPurchasers };
