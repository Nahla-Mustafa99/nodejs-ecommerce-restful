const express = require("express");

const {
  getCart,
  addProdToCart,
  removeSpecificCartItem,
  updateCartItemQuantity,
  clearCart,
} = require("../services/cartService");

const { isAuth, isAllowedTo } = require("../services/authService");

const router = express.Router();

router.use(isAuth, isAllowedTo("user"));

router.route("/").get(getCart).post(addProdToCart).delete(clearCart);

router
  .route("/:itemId")
  .put(updateCartItemQuantity)
  .delete(removeSpecificCartItem);

module.exports = router;
