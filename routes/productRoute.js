const express = require("express");

const {
  getProductValidator,
  createProductValidator,
  updateProductValidator,
  deleteProductValidator,
} = require("../utils/validators/productValidator");

const {
  getProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  setProductImages,
} = require("../services/productService");

const reviewsRoute = require("../routes/reviewRoute");

const { isAuth, isAllowedTo } = require("../services/authService");

const router = express.Router();

router
  .route("/")
  .get(getProducts)
  .post(
    isAuth,
    isAllowedTo("admin", "manager"),
    uploadProductImages,
    setProductImages,
    createProductValidator,
    createProduct
  );

// Nested route:
// GET    /products/:productId/reviews
// POST   /products/:productId/reviews
router.use("/:productId/reviews", reviewsRoute);

router
  .route("/:id")
  .get(getProductValidator, getProduct)
  .put(
    isAuth,
    isAllowedTo("admin", "manager"),
    uploadProductImages,
    setProductImages,
    updateProductValidator,
    updateProduct
  )
  .delete(isAuth, isAllowedTo("admin"), deleteProductValidator, deleteProduct);

module.exports = router;
