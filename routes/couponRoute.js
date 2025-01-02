const express = require("express");

const {
  couponIdValidator,
  createCouponValidator,
  updateCouponValidator,
} = require("../utils/validators/couponValidator");

const {
  getCoupons,
  createCoupon,
  getCoupon,
  updateCoupon,
  deleteCoupon,
} = require("../services/couponService");

const { isAuth, isAllowedTo } = require("../services/authService");

const router = express.Router();

router.use(isAuth, isAllowedTo("admin", "manager"));

router.route("/").get(getCoupons).post(createCouponValidator, createCoupon);

router
  .route("/:id")
  .get(couponIdValidator, getCoupon)
  .put(updateCouponValidator, updateCoupon)
  .delete(couponIdValidator, deleteCoupon);

module.exports = router;
