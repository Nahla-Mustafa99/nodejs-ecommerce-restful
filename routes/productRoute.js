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
} = require("../services/productService");

const { isAuth, isAllowedTo } = require("../services/authService");

const router = express.Router();

router
  .route("/")
  .get(getProducts)
  .post(
    isAuth,
    isAllowedTo("admin", "manager"),
    createProductValidator,
    createProduct
  );

router
  .route("/:id")
  .get(getProductValidator, getProduct)
  .put(
    isAuth,
    isAllowedTo("admin", "manager"),
    updateProductValidator,
    updateProduct
  )
  .delete(isAuth, isAllowedTo("admin"), deleteProductValidator, deleteProduct);

module.exports = router;
