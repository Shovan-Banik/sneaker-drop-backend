const express = require('express');
const dropsController = require('./controllers/dropsController');
const reservationsController = require('./controllers/reservationsController');
const purchasesController = require('./controllers/purchasesController');
const authController = require('./controllers/authController');
const { authenticate } = require('./middleware/auth');

const router = express.Router();

// Auth (public)
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

// Drops (public read, protected create)
router.post('/drops', dropsController.createDrop);
router.get('/drops', dropsController.listDrops);

// Protected — userId comes from JWT
router.post('/reserve', authenticate, reservationsController.reserve);
router.post('/purchase', authenticate, purchasesController.purchase);

module.exports = router;
