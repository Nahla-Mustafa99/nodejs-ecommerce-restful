const express = require("express");

const subCategoryRoute = require("./subCategoryRoute");

const {
  getCategoryValidator,
  createCategoryValidator,
  updateCategoryValidator,
  deleteCategoryValidator,
} = require("../utils/validators/categoryValidator");

const {
  getCategories,
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
} = require("../services/categoryService");

const { isAuth, isAllowedTo } = require("../services/authService");

const router = express.Router();

router
  .route("/")
  .get(getCategories)
  .post(
    isAuth,
    isAllowedTo("admin", "manager"),
    createCategoryValidator,
    createCategory
  );

router
  .route("/:id")
  .get(getCategoryValidator, getCategory)
  .put(
    isAuth,
    isAllowedTo("admin", "manager"),
    updateCategoryValidator,
    updateCategory
  )
  .delete(
    isAuth,
    isAllowedTo("admin"),
    deleteCategoryValidator,
    deleteCategory
  );

// Nested route
router.use("/:categoryId/subcategories", subCategoryRoute);

module.exports = router;
