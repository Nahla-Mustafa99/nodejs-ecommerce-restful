const express = require("express");

const {
  getWishlist,
  addProdToWishlist,
  removeProdFromWishlist,
} = require("../services/wishlistService");

const { isAuth, isAllowedTo } = require("../services/authService");

const router = express.Router();

router.use(isAuth, isAllowedTo("user"));

router.route("/").get(getWishlist).post(addProdToWishlist);

router.route("/:productId").delete(removeProdFromWishlist);

module.exports = router;
