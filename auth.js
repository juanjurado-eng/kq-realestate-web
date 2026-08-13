const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const COOKIE = 'kqv_session';
const SECRET = process.env.SESSION_SECRET || 'CHANGE_ME_INSECURE_DEFAULT';
if (SECRET === 'CHANGE_ME_INSECURE_DEFAULT') {
  console.warn('[auth] SESSION_SECRET no definido: usando valor inseguro por defecto.');
}

function hash(pw) { return bcrypt.hash(String(pw), 10); }
function compare(pw, h) { return bcrypt.compare(String(pw), h || ''); }

function sign(user) {
  return jwt.sign({ id: user.id, rol: user.rol, nombre: user.nombre }, SECRET, { expiresIn: '30d' });
}
function setCookie(res, token) {
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 3600 * 1000,
    path: '/',
  });
}
function clearCookie(res) { res.clearCookie(COOKIE, { path: '/' }); }
function getSession(req) {
  const t = req.cookies && req.cookies[COOKIE];
  if (!t) return null;
  try { return jwt.verify(t, SECRET); } catch (e) { return null; }
}

module.exports = { hash, compare, sign, setCookie, clearCookie, getSession, COOKIE };
