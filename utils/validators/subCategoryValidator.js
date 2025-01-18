const { check } = require("express-validator");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");

const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const Category = require("../../models/categoryModel");
const SubCategory = require("../../models/subCategoryModel");

// Helper function: Validate that the parent category of the subcategory is already exists...
const validateParentCategoryExistance = asyncHandler(async (val, { req }) => {
  const parentCat = await Category.findById(val);
  if (!parentCat) {
    throw new Error(
      `Parent category with this id${val ? `: ${val}` : ""} is not found`
    );
  } else return true;
});

// Validation for nested route GET /api/v1/categories/673b1b021c90ca7c7df5d761/subcategories
exports.getSubCategoriesOfCategoryValidator = [
  check("categoryId")
    .optional()
    .isMongoId()
    .withMessage("Invalid category id format")
    .custom(validateParentCategoryExistance),
  validatorMiddleware,
];

exports.createSubCategoryValidator = [
  check("name")
    .notEmpty()
    .withMessage("subcategory name is required")
    .isLength({ min: 2 })
    .withMessage("Too short subcategory name")
    .isLength({ max: 32 })
    .withMessage("Too long subcategory name")
    .custom((val, { req }) => {
      return SubCategory.findOne({ name: val }).then((subCat) => {
        if (subCat) {
          return Promise.reject(
            new Error(
              `There is already a subcategory with this name '${val}' try another one`
            )
          );
        } else {
          req.body.slug = slugify(val);
          return true;
        }
      });
    }),
  check("category")
    .notEmpty()
    .withMessage("subcategory must belong to a parent category")
    .isMongoId()
    .withMessage("invalid category id format")
    .custom(validateParentCategoryExistance),

  validatorMiddleware,
];

exports.getSubCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid subcategory id format"),
  validatorMiddleware,
];

exports.updateSubCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid subcategory id format"),
  check("name")
    .optional()
    .isLength({ min: 2 })
    .withMessage("Too short subcategory name")
    .isLength({ max: 32 })
    .withMessage("Too long subcategory name")
    .custom((val, { req }) => {
      return SubCategory.findOne({ name: val }).then((subCat) => {
        if (subCat && subCat._id.toString() !== req.params.id.toString()) {
          return Promise.reject(
            new Error(
              `There is already a subcategory with this name '${val}' try another one`
            )
          );
        } else {
          req.body.slug = slugify(val);
          return true;
        }
      });
    }),
  check("category")
    .optional()
    .isMongoId()
    .withMessage("invalid category id format")
    .custom(validateParentCategoryExistance),
  validatorMiddleware,
];

exports.deleteSubCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid subcategory id format"),
  validatorMiddleware,
];
