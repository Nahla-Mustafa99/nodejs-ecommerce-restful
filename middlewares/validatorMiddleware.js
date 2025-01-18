const { validationResult } = require("express-validator");

const fileHelper = require("../utils/fileHelper");

// @desc  Finds the validation errors in this request and wraps them in an object {errors:[]}
const validationMiddleware = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Delete any related saved images embedded with the request for (create, update) requests only
    if (req.body) {
      fileHelper.deleteImagesInCaseOfValError({ ...req.body });
    }

    // Send error response
    return res.status(400).json({ errors: errors.array() });
  }
  return next();
};
module.exports = validationMiddleware;
