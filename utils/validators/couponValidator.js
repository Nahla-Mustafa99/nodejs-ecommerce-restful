const { checkExact, check, body, param } = require("express-validator");

const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const Coupon = require("../../models/couponModel");

exports.couponIdValidator = [
  param("id").isMongoId().withMessage("Invalid coupon id format"),
  validatorMiddleware,
];

exports.createCouponValidator = [
  checkExact(
    [
      check("name")
        .notEmpty()
        .withMessage("Coupon name is required")
        .isString()
        .withMessage("Coupon name must be a string")
        .custom((val, { req }) => {
          return Coupon.findOne({ name: val }).then((coupon) => {
            if (coupon)
              return Promise.reject(
                new Error(
                  "There is a coupon with that name '" +
                    val +
                    "', try to pick another name!"
                )
              );
          });
        })
        .trim(),
      body("discount")
        .notEmpty()
        .withMessage("Coupon discount percentage value required")
        .isFloat({ min: 0, max: 100 })
        .withMessage(
          "Coupon discount percentage value is a number between 0 and 100"
        ),
      body("expire")
        .notEmpty()
        .withMessage("Coupon expire date is required")
        .toDate()
        .isISO8601()
        .withMessage("please enter a valid date"),
    ],
    {
      message:
        "Too many fields specified, only (name - discount - expire) fields are allowed",
    }
  ),
  validatorMiddleware,
];

exports.updateCouponValidator = [
  checkExact(
    [
      check("id").isMongoId().withMessage("Invalid Coupon id format"),
      check("name")
        .optional()
        .notEmpty()
        .withMessage("Coupon name is required")
        .isString()
        .withMessage("Coupon name must be a string")
        .custom((val, { req }) => {
          return Coupon.findOne({ name: val }).then((coupon) => {
            if (coupon && coupon._id.toString() !== req.params.id)
              return Promise.reject(
                new Error(
                  "There is a coupon with that name '" +
                    val +
                    "', try to pick another name!"
                )
              );
          });
        })
        .trim(),
      body("discount")
        .optional()
        .notEmpty()
        .withMessage("Coupon discount percentage value required")
        .isFloat({ min: 0, max: 100 })
        .withMessage(
          "Coupon discount percentage value is a number between 0 and 100"
        ),
      body("expire")
        .optional()
        .notEmpty()
        .withMessage("Coupon expire date is required")
        .toDate()
        .isISO8601()
        .withMessage("please enter a valid date"),
    ],
    {
      message:
        "Too many fields specified, only (name - discount - expire) fields are allowed",
    }
  ),
  validatorMiddleware,
];
