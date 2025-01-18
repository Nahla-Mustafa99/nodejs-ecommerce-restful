const { param, checkExact, body } = require("express-validator");
const slugify = require("slugify");

const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const Category = require("../../models/categoryModel");
const SubCategory = require("../../models/subCategoryModel");
const Product = require("../../models/productModel");
const Brand = require("../../models/brandModel");

// @desc  custom validator validates that the given category exists..
const checkCategoryExists = (val, { req }) => {
  const category = val;
  return Category.findById(category).then((cat) => {
    if (!cat) {
      return Promise.reject(new Error(`No category for this id: ${val}`));
    }
  });
};

// @desc  custom validator validates that the given subcategories exist..
const checkSubCategoriesExist = (subcategoriesGivenList, { req }) => {
  return SubCategory.find({ _id: { $in: subcategoriesGivenList } }).then(
    (subcategories) => {
      if (subcategoriesGivenList.length !== subcategories.length) {
        return Promise.reject(
          new Error(`One of the given subcategories doesn't exist`)
        );
      }
    }
  );
};

// @desc custom validator validates that the given subcategories belong to the given category...
const checkSubcatBelongToCat = (subcategoriesList, { req }) => {
  return SubCategory.find({ _id: { $in: subcategoriesList } }).then(
    (subcategories) => {
      const isBelong = subcategories.every(
        (subCat) => subCat.category.toString() === req.body.category
      );
      if (!isBelong) {
        return Promise.reject(
          new Error(`Subcategories list must belong to the given category`)
        );
      }
    }
  );
};

// @desc Remove duplicates in the given subcategories list
const removeDuplicatSubcategory = (subcategories, { req }) => {
  return (req.body.subcategories = Array.from(new Set(subcategories)));
};

// @desc  custom validator validates that the given brand exists..
const checkBrandExists = (val, { req }) => {
  return Brand.findById(val).then((brand) => {
    if (!brand) {
      return Promise.reject(new Error(`No brand for this id: ${val}`));
    }
  });
};

// Get Product Validators
exports.getProductValidator = [
  param("id").isMongoId().withMessage("Invalid product id format"),
  validatorMiddleware,
];

// Create Product Validators
exports.createProductValidator = [
  checkExact(
    [
      body("slug"),
      body("title")
        .notEmpty()
        .withMessage("Product title is required")
        .isLength({ min: 3 })
        .withMessage("Product title must be at least 3 chars")
        .isLength({ max: 100 })
        .withMessage("Too long Product title")
        .custom((val, { req }) => {
          return Product.findOne({ title: val }).then((productDoc) => {
            if (productDoc) {
              return Promise.reject(
                new Error(
                  `There is a product with this title '${val}' already, please pick a different one.`
                )
              );
            }
            req.body.slug = slugify(val);
            return true;
          });
        }),
      body("description")
        .notEmpty()
        .withMessage("Product description is required")
        .isLength({ min: 20 })
        .withMessage("Too short Product description"),
      body("quantity")
        .notEmpty()
        .withMessage("Product quantity is required")
        .isInt({ min: 0 })
        .withMessage("Product quantity must be an integer number above 0"),
      body("price")
        .notEmpty()
        .withMessage("Product price is required")
        .isFloat({ min: 0, max: 200000 })
        .withMessage("Product price must be a number between [0 -> 200,000]"),
      body("priceAfterDiscount")
        .optional()
        .isFloat({ min: 0, max: 200000 })
        .withMessage(
          "Product priceAfterDiscount must be a number between [0 -> 200,000]"
        )
        .toFloat()
        .custom((val, { req }) => {
          if (req.body.price < val) {
            return false;
          }
          return true;
        })
        .withMessage(
          "Price after discount must be below than the default price"
        ),
      body("sold")
        .optional()
        .isInt({ min: 0 })
        .withMessage(
          "Product sold times number must be an integer number above 0"
        ),
      body("images")
        .optional()
        .isArray()
        .withMessage("Product images should be an array of string"),
      body("imageCover")
        .notEmpty()
        .withMessage("Product imageCover is required"),
      body("colors")
        .optional()
        .isArray()
        .withMessage("Product colors should be an array of string"),
      body("ratingsQuantity")
        .optional()
        .isInt({ min: 0 })
        .withMessage(
          "Product ratingsQuantity must be an integer number above 0"
        ),
      body("ratingsAverage")
        .optional()
        .isFloat({ min: 1, max: 5 })
        .withMessage(
          "Product ratingsAverage must be a number betwwen 1.0 and 5.0"
        ),
      body("category")
        .notEmpty()
        .withMessage("Product must belong to a parent category")
        .isMongoId()
        .withMessage("invalid category id format")
        .custom(checkCategoryExists),
      body("subcategories")
        .optional()
        .isArray()
        .withMessage(
          "Product subcategories should be an array of subcategories ids"
        )
        .isMongoId()
        .withMessage("invalid subcategory id format")
        .customSanitizer(removeDuplicatSubcategory)
        .custom(checkSubCategoriesExist)
        .custom(checkSubcatBelongToCat),
      body("brand")
        .optional()
        .isMongoId()
        .withMessage("invalid brand id format")
        .custom(checkBrandExists),
    ],
    {
      message:
        "Too many fields specified, only (title - description - quantity - price - priceAfterDiscount - sold - imageCover - colors - ratingsQuantity - ratingsQuantity - images - category - subcategories - brand) fields are allowed",
    }
  ),
  validatorMiddleware,
];

// Update Product Validators
exports.updateProductValidator = [
  checkExact(
    [
      param("id").isMongoId().withMessage("Invalid Product id format"),
      body("slug"),
      body("title")
        .optional()
        .isLength({ min: 3 })
        .withMessage("Too short Product title")
        .isLength({ max: 100 })
        .withMessage("Too long Product title")
        .custom((val, { req }) => {
          return Product.findOne({ title: val }).then((productDoc) => {
            if (
              productDoc &&
              productDoc._id.toString() !== req.params.id.toString()
            ) {
              return Promise.reject(
                new Error(
                  `There is a product with this title '${val}' already, please pick a different one.`
                )
              );
            }
            req.body.slug = slugify(val);
            return true;
          });
        }),
      body("description")
        .optional()
        .isLength({ min: 20 })
        .withMessage("Too short Product description"),
      body("quantity")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Product quantity must be an integer number above 0"),
      body("price")
        .optional()
        .isFloat({ min: 0, max: 200000 })
        .withMessage("Product price must be a number between [0 -> 200,000]"),
      body("priceAfterDiscount")
        .optional()
        .isFloat({ min: 0, max: 200000 })
        .withMessage(
          "Product priceAfterDiscount must be a number between [0 -> 200,000]"
        )
        .custom((val, { req }) => {
          if (req.body.price < val) {
            return false;
          }
          return true;
        })
        .withMessage(
          "Price after discount must be below than the default price"
        ),
      body("sold")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Product 'sold' times must be an integer number above 0"),
      body("images")
        .optional()
        .isArray()
        .withMessage("Product images should be an array of string"),
      body("imageCover")
        .optional()
        .notEmpty()
        .withMessage("Product imageCover is required"),
      body("colors")
        .optional()
        .isArray()
        .withMessage("Product colors should be an array of string"),
      body("ratingsQuantity")
        .optional()
        .isInt({ min: 0 })
        .withMessage(
          "Product ratingsQuantity must be an integer number above 0"
        ),
      body("ratingsAverage")
        .optional()
        .isFloat({ min: 1, max: 5 })
        .withMessage(
          "Product ratingsAverage must be a number betwwen 1.0 and 5.0"
        ),
      body("category")
        .optional()
        .isMongoId()
        .withMessage("invalid category id format")
        .custom(checkCategoryExists),
      body("subcategories")
        .optional()
        .isArray()
        .withMessage(
          "Product subcategories should be an array of subcategories ids"
        )
        .isMongoId()
        .withMessage("invalid subcategory id format")
        .customSanitizer(removeDuplicatSubcategory)
        .custom(checkSubCategoriesExist)
        .custom(checkSubcatBelongToCat),
      body("brand")
        .optional()
        .isMongoId()
        .withMessage("invalid brand id format")
        .custom(checkBrandExists),
    ],
    {
      message:
        "Too many fields specified, only (title - description - quantity - price - priceAfterDiscount - sold - imageCover - colors - ratingsQuantity - ratingsQuantity - images - category - subcategories - brand) fields are allowed",
    }
  ),
  validatorMiddleware,
];

// Delete Product Validators
exports.deleteProductValidator = [
  param("id").isMongoId().withMessage("Invalid product id format"),
  validatorMiddleware,
];
