const { check, checkExact } = require("express-validator");

const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const Product = require("../../models/productModel");

// Validation for nested route GET /api/v1/products/:productId/reviews
exports.getReviewsOfProductValidator = [
  check("productId")
    .optional()
    .isMongoId()
    .withMessage("Invalid product id format")
    .custom((val, { req }) => {
      return Product.findById(val).then((product) => {
        if (!product) {
          return Promise.reject(
            new Error(
              `Product with this id${val ? `: ${val}` : ""} is not found`
            )
          );
        }
      });
    }),
  validatorMiddleware,
];

exports.createReviewValidator = [
  checkExact(
    [
      check("productId"),
      check("title")
        .optional()
        .isLength({ min: 2 })
        .withMessage("Too short review name")
        .isLength({ max: 32 })
        .withMessage("Too long review name"),
      check("ratings")
        .notEmpty()
        .withMessage("Review ratings required")
        .isFloat({ min: 1, max: 5 })
        .withMessage("Review ratings must be a number betwwen 1 and 5"),
      check("product")
        .notEmpty()
        .withMessage("review must belong to a product")
        .isMongoId()
        .withMessage("Invalid product id format")
        .custom((val, { req }) => {
          return Product.findById(val).then((product) => {
            if (!product) {
              return Promise.reject(
                new Error(
                  `Product with this id${val ? `: ${val}` : ""} is not found`
                )
              );
            }
          });
        }),
      check("user").isMongoId().withMessage("Invalid user id format"),
    ],
    {
      message:
        "Too many fields specified, only (title - ratings - product - user) fields are allowed",
    }
  ),
  validatorMiddleware,
];

exports.reviewIdValidator = [
  check("id").isMongoId().withMessage("Invalid review id format"),
  validatorMiddleware,
];

exports.updateReviewValidator = [
  checkExact(
    [
      check("id").isMongoId().withMessage("Invalid review id format"),
      check("title")
        .optional()
        .isLength({ min: 3 })
        .withMessage("Too short review name")
        .isLength({ max: 32 })
        .withMessage("Too long review name"),
      check("ratings")
        .optional()
        .notEmpty()
        .isFloat({ min: 1, max: 5 })
        .withMessage("Product ratings must be a number betwwen 1.0 and 5.0"),
    ],
    {
      message:
        "Too many fields specified, only (title - ratings) fields are allowed",
    }
  ),
  validatorMiddleware,
];
