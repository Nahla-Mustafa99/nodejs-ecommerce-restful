const { param, check, body } = require("express-validator");
const slugify = require("slugify");
const bcrypt = require("bcrypt");

const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const expressAsyncHandler = require("express-async-handler");
const User = require("../../models/userModel");

// @desc create user validator
exports.createUserValidator = [
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
      throw new Error(new Error("Passwords have to match!"));
    }
    return true;
  }),
  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage(
      "Invalid phone number, only accepted Egy and SA Phone numbers"
    ),
  check("profileImg").optional(),
  check("role").optional().isIn(["admin", "manager", "user"]),
  validatorMiddleware,
];

// @desc  get a specific user validator
exports.getUserValidator = [
  param("id").isMongoId().withMessage("Invalid user id format"),
  validatorMiddleware,
];

// @desc update user validator
exports.updateUserValidator = [
  check("id").isMongoId().withMessage("Invalid user id format"),
  check("name")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Too short user name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("email")
    .optional()
    .isEmail()
    .withMessage("Please enter a valid email.")
    .custom((value, { req }) => {
      return User.findOne({ email: value }).then((user) => {
        //  if (user) {
        if (user && user._id.toString() !== req.params.id.toString()) {
          return Promise.reject(
            new Error("E-Mail exists already, please pick a different one.")
          );
        }
        return true;
      });
    })
    .normalizeEmail(),
  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Invalid phone number only accepted Egy and SA Phone numbers"),
  check("profileImg").optional(),
  check("role").optional().isIn(["admin", "manager", "user"]),
  validatorMiddleware,
];

// @desc delete user validtor
exports.deleteUserValidator = [
  check("id").isMongoId().withMessage("Invalid user id format"),
  validatorMiddleware,
];

//@desc helper function for validators of password change
const newPasswordValidator = [
  body("currentPassword")
    .notEmpty()
    .withMessage("current password is required"),
  body("password")
    .notEmpty()
    .withMessage("password is required")
    .isAlphanumeric()
    .isLength({ min: 6 })
    .withMessage(
      "The new password must be only letters or numbers and at least 6 characters."
    ),
  body("passwordConfirm").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error(new Error("Passwords have to match!"));
    }
    return true;
  }),
];

// @desc
exports.changeUserPasswordValidator = [
  check("id").isMongoId().withMessage("Invalid user id format"),
  ...newPasswordValidator,
  body("currentPassword").custom(
    expressAsyncHandler(async (val, { req }) => {
      // 1) check if user is found
      const user = await User.findOne({ _id: req.params.id });
      if (!user) {
        return Promise.reject(new Error("No user found with this id"));
      }
      // 2) check if password is correct
      const isMatch = await bcrypt.compare(val, user.password);
      if (!isMatch) {
        const error = new Error("Invalid current password");
        return Promise.reject(error);
      }
      return true;
    })
  ),
  validatorMiddleware,
];

// @desc
exports.updateLoggedUserValidator = [
  body("name")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Too short user name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email address")
    .custom((val, { req }) =>
      User.findOne({ email: val }).then((user) => {
        // if (user) {
        if (user && user._id.toString() !== req.user._id.toString()) {
          return Promise.reject(
            new Error("E-Mail exists already, please pick a different one.")
          );
        }
        return true;
      })
    ),
  check("phone")
    .optional()
    // .if(body("phone").not().equals(""))
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage(
      "Invalid phone number, only accepted Egy and SA Phone numbers"
    ),

  validatorMiddleware,
];

//@desc Validator for the handler that handles this route:
// @route PUT /api/v1/users/updateMyPassword (Private)
exports.updateLoggedUserPasswordValidator = [
  ...newPasswordValidator,
  body("currentPassword").custom(
    expressAsyncHandler(async (val, { req }) => {
      // check if password is correct
      const user = await User.findOne({ _id: req.user._id });

      const isMatch = await bcrypt.compare(val, user.password);
      if (!isMatch) {
        const error = new Error("Invalid current password");
        return Promise.reject(error);
      }
      return true;
    })
  ),
  validatorMiddleware,
];
