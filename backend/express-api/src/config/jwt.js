// src/config/jwt.js
// JWT sign / verify helpers — mirrors Spring's JwtConfig (HS256, 7-day expiry, issuer "civicpulse")
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'civicpulse-dev-secret-civicpulse-dev-secret';
const ISSUER  = 'civicpulse';
const EXPIRES_IN = '7d';

/**
 * Sign a JWT token.
 * @param {{ id: string, email: string, role: string }} payload
 * @returns {string} signed JWT
 */
function signToken(payload) {
  return jwt.sign(
    {
      sub:   payload.id,
      email: payload.email,
      role:  payload.role,
    },
    SECRET,
    {
      algorithm: 'HS256',
      issuer:    ISSUER,
      expiresIn: EXPIRES_IN,
    }
  );
}

/**
 * Verify and decode a JWT token.
 * @param {string} token
 * @returns {{ sub: string, email: string, role: string, iat: number, exp: number }}
 * @throws {Error} if invalid or expired
 */
function verifyToken(token) {
  return jwt.verify(token, SECRET, { algorithms: ['HS256'], issuer: ISSUER });
}

module.exports = { signToken, verifyToken };
