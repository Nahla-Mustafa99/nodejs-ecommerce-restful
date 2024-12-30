const { checkExact, check, body, param } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

const User = require("../../models/userModel");

exports.createAddressValidator = [
  checkExact(
    [
      body("phone")
        .notEmpty()
        .withMessage("phone of the address is required")
        .isMobilePhone(["ar-EG", "ar-SA"])
        .withMessage(
          "Invalid phone number, only accepted Egy and SA Phone numbers"
        ),
      body("details")
        .notEmpty()
        .withMessage("address details is required")
        .trim(),
      body("alias")
        .notEmpty()
        .withMessage("address alias is required")
        .custom((val, { req }) => {
          return User.findById(req.user._id).then((user) => {
            if (user.addresses.find((add) => add.alias === val)) {
              return Promise.reject(
                new Error(
                  `This address alias: '${val}' exists already, please pick a different one.`
                )
              );
            }
            return true;
          });
        })
        .trim(),
      body("city")
        .optional()
        .notEmpty()
        .isString()
        .withMessage("Please enter avalid city name")
        .trim(),
      body("postalCode")
        .optional()
        .notEmpty()
        .isPostalCode("any")
        .withMessage("Please enter a valid postal code")
        .trim(),
    ],
    {
      message:
        "Too many fields specified, only (alias - details - phone- city -postalCode) fields are allowed",
    }
  ),
  validatorMiddleware,
];

exports.updateAddressValidator = [
  checkExact(
    [
      check("addressId").isMongoId().withMessage("Invalid addrress id format"),
      body("phone")
        .optional()
        .notEmpty()
        .isMobilePhone(["ar-EG", "ar-SA"])
        .withMessage(
          "Invalid phone number, only accepted Egy and SA Phone numbers"
        ),
      body("details").optional().notEmpty().trim(),
      body("alias")
        .optional()
        .notEmpty()
        .custom((val, { req }) => {
          return User.findById(req.user._id).then((user) => {
            if (user.addresses.find((add) => add.alias === val)) {
              return Promise.reject(
                new Error(
                  `This address alias '${val}' exists already, please pick a different one.`
                )
              );
            }
            return true;
          });
        })
        .trim(),
      body("city")
        .optional()
        .isString()
        .withMessage("Please enter avalid city name")
        .trim(),
      body("postalCode")
        .optional()
        .isPostalCode("any")
        .withMessage("Please enter a valid postal code")
        .trim(),
    ],
    {
      message:
        "Too many fields specified, only (alias - details - phone- city -postalCode) fields are allowed",
    }
  ),
  validatorMiddleware,
];

exports.addressIdValidator = [
  param("addressId").isMongoId().withMessage("Invalid address id format"),
  validatorMiddleware,
];
