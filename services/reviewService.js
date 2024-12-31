const asyncHandler = require("express-async-handler");

const Review = require("../models/reviewModel");
const factory = require("./hanldersFactory");
const ApiError = require("../utils/apiError");

// @desc Helper function: insure validation of productId that comes from params(if any)...
// @route For nested route: GET /api/v1/products/:productId/reviews
exports.createFilterObj = (req, res, next) => {
  const productId = req.params?.productId;
  if (productId) {
    req.filterObj = { product: productId };
  } else {
    filterObj = {};
  }
  return next();
};

// @desc Helper function: set user in body, set product For nested route: POST /api/v1/products/:productId/reviews
exports.insertFieldsIntoBody = (req, res, next) => {
  const { productId } = req.params;
  if (productId) {
    req.body.product = productId;
  }
  if (!req.body.user) req.body.user = req.user._id;
  return next();
};

// @desc    Create review: Add a review to a product
// @route   POST /api/v1/reviews
// @access  Private/Protect/User
exports.createReview = asyncHandler(async (req, res, next) => {
  const { user, product } = req.body;
  const userMadeReviewBefore = await Review.findOne({ user, product });
  if (userMadeReviewBefore) {
    const error = new ApiError(
      "You already created a review before on this product!",
      400
    );
    return next(error);
  }

  const review = await Review.create(req.body);

  return res.status(201).json({ data: review });
});

// @desc    Get list reviews of a specific product
// @route   GET /api/v1/reviews
// @access  Public
exports.getReviews = factory.getAll(Review, "Review");

// @desc    Get a specific review by id
// @route   GET /api/v1/reviews/:id
// @access  Public
exports.getReview = factory.getOne(Review);

// @desc    Update a specific review
// @route   PUT /api/v1/reviews/:id
// @access  Private/Protect/User
exports.updateReview = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const review = await Review.findById(id);

  if (!review) {
    const error = new ApiError(`No review is found for this id: ${id}`, 404);
    return next(error);
  }

  // Check authorizity
  if (review.user._id.toString() !== req.user._id.toString()) {
    const error = new ApiError(`You are not authorized to do this action`, 403);
    return next(error);
  }

  const reviewUpdated = await Review.findByIdAndUpdate({ _id: id }, req.body, {
    new: true,
  });

  // Trigger "save" event when update document
  reviewUpdated.save();

  res.status(200).json({ data: reviewUpdated });
});

// @desc    Delete a specific review
// @route   DELETE /api/v1/reviews/:id
// @access  Private/Protect/User-Admin-Manager
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { user } = req;
  let review = await Review.findById(id);

  if (!review) {
    return next(new ApiError("No review found for this id: " + id, 404));
  }
  // Check authorizity
  if (
    review.user._id.toString() !== user._id.toString() &&
    user.role !== "admin" &&
    user.role !== "manager"
  ) {
    const error = new ApiError(`You are not authorized to do this action`, 403);
    return next(error);
  }

  await review.deleteOne();

  res.status(204).send();
});
