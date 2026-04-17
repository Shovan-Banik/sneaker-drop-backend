const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models');
const { User } = db;

const JWT_SECRET = process.env.JWT_SECRET || 'changeme_sneaker_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const SALT_ROUNDS = 10;

async function register(username, password) {
  const existing = await User.findOne({ where: { username } });
  if (existing) {
    const err = new Error('Username already taken');
    err.code = 'DUPLICATE_USER';
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ username, password: hashedPassword });

  const token = jwt.sign(
    { userId: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return {
    user: { id: user.id, username: user.username },
    token,
  };
}

async function login(username, password) {
  const user = await User.findOne({ where: { username } });
  if (!user) {
    const err = new Error('Invalid username or password');
    err.code = 'INVALID_CREDENTIALS';
    throw err;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    const err = new Error('Invalid username or password');
    err.code = 'INVALID_CREDENTIALS';
    throw err;
  }

  const token = jwt.sign(
    { userId: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return {
    user: { id: user.id, username: user.username },
    token,
  };
}

module.exports = { register, login };
