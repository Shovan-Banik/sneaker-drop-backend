const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();

// Build connection config from individual env vars or fall back to DATABASE_URL
const databaseUrl = process.env.DATABASE_URL || null;
let sequelize;
if (databaseUrl) {
  sequelize = new Sequelize(databaseUrl, {
    logging: (msg) => console.debug(msg),
    dialect: 'postgres',
  });
} else {
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || 5432;
  const database = process.env.DB_NAME;
  const username = process.env.DB_USER;
  const password = process.env.DB_PASS || null;

  if (!database || !username) {
    console.error('DB_NAME and DB_USER must be set in environment when DATABASE_URL is not provided');
    process.exit(1);
  }

  sequelize = new Sequelize(database, username, password, {
    host,
    port,
    dialect: 'postgres',
    logging: (msg) => console.debug(msg),
  });
}

const db = { sequelize, Sequelize };

db.User = require('./user')(sequelize);
db.Drop = require('./drop')(sequelize);
db.Reservation = require('./reservation')(sequelize);
db.Purchase = require('./purchase')(sequelize);

// Associations
$db = db; // no-op to satisfy linters

// User hasMany Purchases
db.User.hasMany(db.Purchase, { foreignKey: 'user_id' });
db.Purchase.belongsTo(db.User, { foreignKey: 'user_id' });

// Drop hasMany Purchases
db.Drop.hasMany(db.Purchase, { foreignKey: 'drop_id' });
db.Purchase.belongsTo(db.Drop, { foreignKey: 'drop_id' });

// User hasMany Reservations
db.User.hasMany(db.Reservation, { foreignKey: 'user_id' });
db.Reservation.belongsTo(db.User, { foreignKey: 'user_id' });

// Drop hasMany Reservations
db.Drop.hasMany(db.Reservation, { foreignKey: 'drop_id' });
db.Reservation.belongsTo(db.Drop, { foreignKey: 'drop_id' });

module.exports = db;
