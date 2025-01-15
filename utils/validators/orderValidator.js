const { param, body } = require("express-validator");

const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.orderIdValidator = [
  param("id").isMongoId().withMessage("Invalid order id format"),
  validatorMiddleware,
];

exports.createOrderValidator = [
  param("cartId").isMongoId().withMessage("Invalid cart id format"),
  body("shippingAddress")
    .notEmpty()
    .withMessage("Order shippingAddress is required"),
  validatorMiddleware,
];
