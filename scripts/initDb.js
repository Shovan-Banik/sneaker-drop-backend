// Simple migration-like script to create tables with necessary constraints and indexes.
// For production use a proper migration system (umzug/sequelize-cli).

require('dotenv').config();
const { Sequelize } = require('sequelize');

// To create tables you might need a privileged connection. The script prefers
// SUPERUSER_DATABASE_URL if provided, otherwise it will try DATABASE_URL or
// build from parts (DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASS).
function buildSequelizeFromEnv(preferSuper = false) {
  const superUrl = process.env.SUPERUSER_DATABASE_URL;
  const dbUrl = process.env.DATABASE_URL || null;

  if (preferSuper && superUrl) return new Sequelize(superUrl, { dialect: 'postgres' });
  if (dbUrl) return new Sequelize(dbUrl, { dialect: 'postgres' });

  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || 5432;
  const database = process.env.DB_NAME;
  const username = process.env.DB_USER;
  const password = process.env.DB_PASS || null;

  if (!database || !username) {
    console.error('DB_NAME and DB_USER must be set in environment when DATABASE_URL is not provided');
    process.exit(1);
  }

  return new Sequelize(database, username, password, {
    host,
    port,
    dialect: 'postgres',
  });
}

async function run() {
  // prefer superuser connection for DDL if provided
  const sequelize = buildSequelizeFromEnv(true);

  try {
    await sequelize.authenticate();
    console.log('Connected (init)');

    const sql = `
    CREATE TABLE IF NOT EXISTS users (
      id BIGSERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS drops (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      price NUMERIC(10,2) NOT NULL,
      total_stock INTEGER NOT NULL,
      available_stock INTEGER NOT NULL,
      start_time TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_drops_start_time ON drops(start_time);

    CREATE TABLE IF NOT EXISTS reservations (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      drop_id BIGINT NOT NULL REFERENCES drops(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('ACTIVE','EXPIRED','COMPLETED'))
    );

    CREATE INDEX IF NOT EXISTS idx_reservations_expires_at ON reservations(expires_at);
    CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);

    CREATE TABLE IF NOT EXISTS purchases (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      drop_id BIGINT NOT NULL REFERENCES drops(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON purchases(created_at);
    `;

    await sequelize.query(sql);
    console.log('Tables created/verified');
    process.exit(0);
  } catch (err) {
    console.error('Init DB failed', err);
    process.exit(1);
  }
}

run();
