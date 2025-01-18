const { param, check, checkExact } = require("express-validator");
const slugify = require("slugify");

const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const Category = require("../../models/categoryModel");

exports.getCategoryValidator = [
  param("id").isMongoId().withMessage("Invalid category id format"),
  validatorMiddleware,
];

exports.createCategoryValidator = [
  checkExact(
    [
      check("name")
        .notEmpty()
        .withMessage("Category name is required")
        .isLength({ min: 3 })
        .withMessage("Too short category name")
        .isLength({ max: 32 })
        .withMessage("Too long category name")
        .custom((val, { req }) => {
          return Category.findOne({ name: val }).then((categoryDoc) => {
            if (categoryDoc) {
              return Promise.reject(
                new Error(
                  `There is a category with this name '${val}' already, please pick a different one.`
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

exports.updateCategoryValidator = [
  checkExact(
    [
      check("id").isMongoId().withMessage("Invalid category id format"),
      check("name")
        .optional()
        .isLength({ min: 3 })
        .withMessage("Too short category name")
        .isLength({ max: 32 })
        .withMessage("Too long category name")
        .custom((val, { req }) => {
          return Category.findOne({ name: val }).then((categoryDoc) => {
            if (
              categoryDoc &&
              categoryDoc._id.toString() !== req.params.id.toString()
            ) {
              return Promise.reject(
                new Error(
                  `There is a category with this name '${val}' already, please pick a different one.`
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

exports.deleteCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid category id format"),
  validatorMiddleware,
];
