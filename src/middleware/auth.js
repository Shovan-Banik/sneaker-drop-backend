const jwt = require('jsonwebtoken');
const { failure } = require('../utils/response');

const JWT_SECRET = process.env.JWT_SECRET || 'changeme_sneaker_secret';

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return failure(res, 'Authentication required', 401);
  }

  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.userId, username: payload.username };
    next();
  } catch (err) {
    return failure(res, 'Invalid or expired token', 401);
  }
}

module.exports = { authenticate };
