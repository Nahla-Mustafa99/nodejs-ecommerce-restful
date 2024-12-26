const express = require("express");

const {
  getBrandValidator,
  createBrandValidator,
  updateBrandValidator,
  deleteBrandValidator,
} = require("../utils/validators/brandValidator");

const {
  getBrands,
  createBrand,
  getBrand,
  updateBrand,
  deleteBrand,
} = require("../services/brandService");

const { isAuth, isAllowedTo } = require("../services/authService");

const router = express.Router();

router
  .route("/")
  .get(getBrands)
  .post(
    isAuth,
    isAllowedTo("admin", "manager"),
    createBrandValidator,
    createBrand
  );

router
  .route("/:id")
  .get(getBrandValidator, getBrand)
  .put(
    isAuth,
    isAllowedTo("admin", "manager"),
    updateBrandValidator,
    updateBrand
  )
  .delete(isAuth, isAllowedTo("admin"), deleteBrandValidator, deleteBrand);

module.exports = router;
