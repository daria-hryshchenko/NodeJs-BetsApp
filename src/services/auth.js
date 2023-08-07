const jwt = require("jsonwebtoken");

function getTokenPayload(req) {
  let token = req.headers['authorization'];
  if (!token) {
    return null;
  }
  token = token.replace('Bearer ', '');
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
}

function authenticateUser(req, res, next) {
  const tokenPayload = getTokenPayload(req);
  if (!tokenPayload) {
    return res.status(401).send({ error: 'Not Authorized' });
  }
  next();
}

function authenticateAdmin(req, res, next) {
  const tokenPayload = getTokenPayload(req);
  if (!tokenPayload || tokenPayload.type !== 'admin') {
    return res.status(401).send({ error: 'Not Authorized' });
  }
  next();
}

module.exports = {
  authenticateUser,
  authenticateAdmin,
  getTokenPayload,
};