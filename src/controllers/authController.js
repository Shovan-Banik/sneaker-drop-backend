const authService = require('../services/authService');
const { success, failure } = require('../utils/response');

async function register(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return failure(res, 'username and password required', 400);
    }
    if (password.length < 6) {
      return failure(res, 'Password must be at least 6 characters', 400);
    }

    const result = await authService.register(username, password);
    return success(res, result, 201);
  } catch (err) {
    if (err.code === 'DUPLICATE_USER') {
      return failure(res, err.message, 409);
    }
    console.error('Register error:', err);
    return failure(res, 'Registration failed');
  }
}

async function login(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return failure(res, 'username and password required', 400);
    }

    const result = await authService.login(username, password);
    return success(res, result);
  } catch (err) {
    if (err.code === 'INVALID_CREDENTIALS') {
      return failure(res, err.message, 401);
    }
    console.error('Login error:', err);
    return failure(res, 'Login failed');
  }
}

module.exports = { register, login };
