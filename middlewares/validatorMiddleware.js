const { validationResult } = require("express-validator");

// @desc  Finds the validation errors in this request and wraps them in an object {errors:[]}
const validationMiddleware = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return next();
};
module.exports = validationMiddleware;
