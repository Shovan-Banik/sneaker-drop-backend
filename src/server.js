require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');

const db = require('./models');
const sockets = require('./sockets');
const expirationJob = require('./jobs/expirationJob');
const routes = require('./routes');

const PORT = process.env.PORT || 3000;

async function start() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use('/api', routes);

  const server = http.createServer(app);
  sockets.init(server);

  // Ensure DB connection
  try {
    await db.sequelize.authenticate();
    console.log('DB connected');
    // Do NOT auto-sync in production. Table creation should be done with the
    // provided init script or a migration tool (see README).
    // If you want to auto-create tables during development, run scripts/initDb.js
    // or set up a migration step.
  } catch (err) {
    console.error('DB connection failed', err);
    process.exit(1);
  }

  // Start expiration worker
  expirationJob.start(5000);

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Run: lsof -ti :${PORT} | xargs kill -9`);
    } else {
      console.error('Server error:', err);
    }
    process.exit(1);
  });

  server.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
  });
}

start();
