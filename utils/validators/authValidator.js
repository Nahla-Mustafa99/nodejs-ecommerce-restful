const { check, body } = require("express-validator");
const slugify = require("slugify");

const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const User = require("../../models/userModel");

//@desc Validator for the handler that handles this route:
//@route PUT /auth/signup
exports.signupValidator = [
  check("name")
    .notEmpty()
    .withMessage("User name is required")
    .isLength({ min: 3 })
    .withMessage("Too short user name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email.")
    .custom((value, { req }) => {
      return User.findOne({ email: value }).then((userDoc) => {
        if (userDoc) {
          return Promise.reject(
            new Error("E-Mail exists already, please pick a different one.")
          );
        }
        return true;
      });
    })
    .normalizeEmail(),
  body(
    "password",
    "Please enter a password with only letters and numbers and at least 6 characters."
  )
    .notEmpty()
    .isAlphanumeric()
    .isLength({ min: 6 }),
  body("passwordConfirm").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords have to match!");
    }
    return true;
  }),
  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage(
      "Invalid phone number, only accepted Egy and SA Phone numbers"
    ),
  validatorMiddleware,
];

//@desc Validator for the handler that handles this route:
//@route POST /auth/login
exports.loginValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email.")
    .normalizeEmail(),
  body("password", "Password is required").notEmpty(),
  validatorMiddleware,
];

//@desc Validator for the handler that handles this route:
//@route POST /auth/forgotPassword
exports.forgotPasswordValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email.")
    .normalizeEmail(),
  validatorMiddleware,
];

//@route POST /auth/verifyResetPassword: validated in the handler itself

//@desc Validator for the handler that handles this route:
//@route POST /auth/resetPassword
exports.resetPasswordValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email.")
    .normalizeEmail(),
  body(
    "newPassword",
    "Please enter a password with only letters and numbers and at least 6 characters."
  )
    .notEmpty()
    .isAlphanumeric()
    .isLength({ min: 6 }),
  body("passwordConfirm").custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error("Passwords have to match!");
    }
    return true;
  }),
  validatorMiddleware,
];
