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
  uploadBrandImage,
  setBrandImage,
} = require("../services/brandService");

const { isAuth, isAllowedTo } = require("../services/authService");

const router = express.Router();

router
  .route("/")
  .get(getBrands)
  .post(
    isAuth,
    isAllowedTo("admin", "manager"),
    uploadBrandImage,
    setBrandImage,
    createBrandValidator,
    createBrand
  );

router
  .route("/:id")
  .get(getBrandValidator, getBrand)
  .put(
    isAuth,
    isAllowedTo("admin", "manager"),
    uploadBrandImage,
    setBrandImage,
    updateBrandValidator,
    updateBrand
  )
  .delete(isAuth, isAllowedTo("admin"), deleteBrandValidator, deleteBrand);

module.exports = router;
