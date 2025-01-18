const { param, check, checkExact } = require("express-validator");
const slugify = require("slugify");

const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const Brand = require("../../models/brandModel");

exports.getBrandValidator = [
  param("id").isMongoId().withMessage("Invalid brand id format"),
  validatorMiddleware,
];

exports.createBrandValidator = [
  checkExact(
    [
      check("name")
        .notEmpty()
        .withMessage("Brand name is required")
        .isLength({ min: 2 })
        .withMessage("Too short brand name")
        .isLength({ max: 32 })
        .withMessage("Too long brand name")
        .custom((val, { req }) => {
          return Brand.findOne({ name: val }).then((brandDoc) => {
            if (brandDoc) {
              return Promise.reject(
                new Error(
                  `There is a brand with this name '${val}' already, please pick a different one.`
                )
              );
            }
            req.body.slug = slugify(val);
            return true;
          });
        }),
      check("slug"),
      check("image").optional(),
    ],
    {
      message:
        "Too many fields specified, only ( name - image ) fields are allowed",
    }
  ),
  validatorMiddleware,
];

exports.updateBrandValidator = [
  checkExact(
    [
      check("id").isMongoId().withMessage("Invalid brand id format"),
      check("name")
        .optional()
        .isLength({ min: 2 })
        .withMessage("Too short brand name")
        .isLength({ max: 32 })
        .withMessage("Too long brand name")
        .custom((val, { req }) => {
          return Brand.findOne({ name: val }).then((brandDoc) => {
            if (
              brandDoc &&
              brandDoc._id.toString() !== req.params.id.toString()
            ) {
              return Promise.reject(
                new Error(
                  `There is a brand with this name '${val}' already, please pick a different one.`
                )
              );
            }
            req.body.slug = slugify(val);
            return true;
          });
        }),
      check("slug"),
      check("image").optional(),
    ],
    {
      message:
        "Too many fields specified, only ( name - image ) fields are allowed",
    }
  ),
  validatorMiddleware,
];

exports.deleteBrandValidator = [
  check("id").isMongoId().withMessage("Invalid brand id format"),
  validatorMiddleware,
];
