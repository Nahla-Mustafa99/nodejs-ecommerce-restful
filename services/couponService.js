const Coupon = require("../models/couponModel");
const {
  deleteOne,
  getAll,
  getOne,
  updateOne,
  createOne,
} = require("./hanldersFactory");

// @desc    Get list of coupons
// @route   GET /api/v1/coupons
// @access  Private/Admin-Manager
exports.getCoupons = getAll(Coupon);

// @desc    Create a new coupon
// @route   POST /api/v1/coupons
// @access  Private/Admin-Manager
exports.createCoupon = createOne(Coupon);

// @desc    Get a specific coupon
// @route   GET /api/v1/coupons/:id
// @access  Private/Admin-Manager
exports.getCoupon = getOne(Coupon);

// @desc    Update a specific coupon
// @route   PUT /api/v1/coupons/:id
// @access  Private/Admin-Manager
exports.updateCoupon = updateOne(Coupon);

// @desc    Delete a specific coupon
// @route   DELETE /api/v1/coupons/:id
// @access  Private/Admin-Manager
exports.deleteCoupon = deleteOne(Coupon);
