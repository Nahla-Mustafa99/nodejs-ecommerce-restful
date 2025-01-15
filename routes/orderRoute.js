const express = require("express");

const {
  createCashOrder,
  createCheckoutSession,
  filterOrderForLoggedUser,
  getOrders,
  getOrder,
  updateOrderToPaid,
  updateOrderToDelivered,
} = require("../services/orderService");

const { isAuth, isAllowedTo } = require("../services/authService");

const {
  createOrderValidator,
  orderIdValidator,
} = require("../utils/validators/orderValidator");

const router = express.Router();

router.use(isAuth);

router
  .route("/")
  .get(
    isAllowedTo("admin", "manager", "user"),
    filterOrderForLoggedUser,
    getOrders
  );

router.get(
  "/checkout-session/:cartId",
  isAllowedTo("user"),
  createOrderValidator,
  createCheckoutSession
);

router.post(
  "/:cartId",
  isAllowedTo("user"),
  createOrderValidator,
  createCashOrder
);

router
  .route("/:id")
  .get(isAllowedTo("user", "admin", "mamager"), orderIdValidator, getOrder);

router.put(
  "/:id/pay",
  isAllowedTo("admin", "manager"),
  orderIdValidator,
  updateOrderToPaid
);

router.put(
  "/:id/deliver",
  isAllowedTo("admin", "manager"),
  orderIdValidator,
  updateOrderToDelivered
);

module.exports = router;
