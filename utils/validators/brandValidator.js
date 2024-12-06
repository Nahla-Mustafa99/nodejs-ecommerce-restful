const { param, check } = require("express-validator");
const slugify = require("slugify");

const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.getBrandValidator = [
  param("id").isMongoId().withMessage("Invalid brand id format"),
  validatorMiddleware,
];

exports.createBrandValidator = [
  check("name")
    .notEmpty()
    .withMessage("Brand name is required")
    .isLength({ min: 2 })
    .withMessage("Too short brand name")
    .isLength({ max: 32 })
    .withMessage("Too long brand name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware,
];

exports.updateBrandValidator = [
  check("id").isMongoId().withMessage("Invalid brand id format"),
  check("name")
    .optional()
    .isLength({ min: 2 })
    .withMessage("Too short brand name")
    .isLength({ max: 32 })
    .withMessage("Too long brand name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware,
];

exports.deleteBrandValidator = [
  check("id").isMongoId().withMessage("Invalid brand id format"),
  validatorMiddleware,
];
