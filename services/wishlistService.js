const asyncHandler = require("express-async-handler");

const ApiError = require("../utils/apiError");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const { default: mongoose } = require("mongoose");

// @desc    Get wishlist of the authenticated(loggedIn) user
// @route   GET /api/v1/wishlist
// @access  Private/Protect
exports.getWishlist = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const user = await User.findById(userId)
    .select("wishlist")
    .populate("wishlist");

  res.status(200).json({
    status: "success",
    results: user.wishlist.length,
    data: user.wishlist,
  });
});

// @desc   Add a product to a wishlist of the authenticated(loggedIn) user
// @route  POST /api/v1/wishlist
// @access Protected/User
exports.addProdToWishlist = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { productId } = req.body;

  // Check if product exists in db
  if (!mongoose.isObjectIdOrHexString(productId)) {
    next(new ApiError("Invalid productId format", 400));
  }
  const product = await Product.findById(productId);
  if (!product) {
    const error = new ApiError(
      `No product is found for this id: ${productId}`,
      404
    );
    return next(error);
  }

  // $addToSet => add productId to wishlist array if productId not exist
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $addToSet: { wishlist: productId },
    },
    { new: true }
  )
    .select("wishlist")
    .populate("wishlist");

  res.status(200).json({
    status: "success",
    message: "Product added successfully to your wishlist.",
    data: user.wishlist,
  });
});

// @desc   Remove a product from a wishlist of the authenticated(loggedIn) user
// @route  DELETE/api/v1/users/wishlist/:productId
// @access Protected/User
exports.removeProdFromWishlist = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { productId } = req.params;
  const user = await User.findById(userId)
    .select("wishlist")
    .populate("wishlist");

  user.wishlist.pull(productId);
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Product removed successfully from your wishlist.",
    data: user.wishlist,
  });
});
