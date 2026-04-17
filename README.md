# Sneaker Drop Backend

A production-oriented backend for a real-time high-traffic inventory system (limited sneaker drop).

Stack:
- Node.js + Express
- PostgreSQL
- Sequelize ORM
- Socket.io for real-time updates

Features:
- Reservation flow with row-level locking and transactions to prevent oversell
- Background expiration job to recover stock
- Purchase flow using a reservation
- Socket.io `stock_update` events on reserve/expire/purchase
- Simple migration script to create necessary tables and indexes

Getting started

1. Copy `.env.example` to `.env` and set DB connection values.

You can either set a single `DATABASE_URL` or individual variables: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`.

If your app DB user does not have permission to create tables, provide a superuser connection only for initialization using `SUPERUSER_DATABASE_URL` and run the init script (see below).

2. Install dependencies:

```bash
npm install
```

3. Initialize DB (creates tables if they do not exist):

If your app DB user can create objects in the `public` schema you can run:

```bash
npm run init-db
```

If the app user lacks CREATE privileges, set `SUPERUSER_DATABASE_URL` in your `.env` temporarily and run the same command. The init script prefers `SUPERUSER_DATABASE_URL` for DDL and will create the tables.

4. Start server in dev:

```bash
npm run dev
```

APIs

- POST /api/drops
  Body: { name, price, total_stock, start_time }

- GET /api/drops
  Returns: list of drops with `available_stock` and `recentPurchasers` (latest 3 usernames)

- POST /api/reserve
  Body: { userId, dropId }
  Creates a reservation (60s TTL by default) with atomic decrement of `available_stock`.

- POST /api/purchase
  Body: { reservationId, userId }
  Completes a reservation and creates a purchase record.

Concurrency strategy

- Reservations use a DB transaction and `SELECT ... FOR UPDATE` via Sequelize's row locking to safely decrement `available_stock`.
- This ensures that concurrent reserve attempts serialize on the drop row and prevent overselling.

Expiration strategy

- A background worker (in `src/jobs/expirationJob.js`) runs every 5 seconds, finds expired ACTIVE reservations, marks them EXPIRED, increments `available_stock`, and emits a `stock_update` socket event.
- For higher scale you can replace the worker with a queue (e.g., Redis + Bull) and distributed workers.


