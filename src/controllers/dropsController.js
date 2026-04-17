const db = require('../models');
const { Drop, sequelize } = db;
const { success, failure } = require('../utils/response');

async function createDrop(req, res) {
  try {
    const { name, price, total_stock, start_time } = req.body;
    if (!name || price == null || total_stock == null || !start_time) {
      return failure(res, 'Missing fields', 400);
    }
    const created = await Drop.create({
      name,
      price,
      total_stock,
      available_stock: total_stock,
      start_time,
      created_at: new Date()
    });
    return success(res, { drop: created }, 201);
  } catch (err) {
    console.error(err);
    return failure(res, err.message);
  }
}

async function listDrops(req, res) {
  try {
    const sql = `
      SELECT d.id, d.name, d.price, d.available_stock,
             COALESCE(json_agg(json_build_object('username', u.username)) FILTER (WHERE u.username IS NOT NULL), '[]') AS recent_purchasers
      FROM drops d
      LEFT JOIN LATERAL (
        SELECT u.username
        FROM purchases p
        JOIN users u ON p.user_id = u.id
        WHERE p.drop_id = d.id
        ORDER BY p.created_at DESC
        LIMIT 3
      ) u ON true
      GROUP BY d.id
      ORDER BY d.id;
    `;
    const rows = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT });
    const drops = rows.map(r => ({
      id: r.id,
      name: r.name,
      price: r.price,
      available_stock: parseInt(r.available_stock, 10),
      recentPurchasers: r.recent_purchasers
    }));
    return success(res, { drops });
  } catch (err) {
    console.error(err);
    return failure(res, err.message);
  }
}

module.exports = { createDrop, listDrops };
