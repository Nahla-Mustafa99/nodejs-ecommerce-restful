const express = require("express");

const {
  createFilterObj,
  insertFieldsIntoBody,
  createReview,
  getReviews,
  getReview,
  updateReview,
  deleteReview,
} = require("../services/reviewService");

const { isAuth, isAllowedTo } = require("../services/authService");

const {
  reviewIdValidator,
  updateReviewValidator,
  createReviewValidator,
  getReviewsOfProductValidator,
} = require("../utils/validators/reviewValidator");

// mergeParams: Allow us to access parameters on other routers such as productId from product router
const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(getReviewsOfProductValidator, createFilterObj, getReviews)
  .post(
    isAuth,
    isAllowedTo("user"),
    insertFieldsIntoBody,
    createReviewValidator,
    createReview
  );

router
  .route("/:id")
  .get(reviewIdValidator, getReview)
  .put(isAuth, isAllowedTo("user"), updateReviewValidator, updateReview)
  .delete(
    isAuth,
    isAllowedTo("user", "admin", "manager"),
    reviewIdValidator,
    deleteReview
  );

module.exports = router;
