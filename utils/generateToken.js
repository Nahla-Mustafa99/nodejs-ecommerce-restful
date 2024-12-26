const jwt = require("jsonwebtoken");

const generateToken = (payload) =>
  // payload = {email:.. , userId: ..}
  jwt.sign(payload, process.env.TOKEN_SECRET, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });

module.exports = generateToken;
