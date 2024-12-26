const express = require("express");

const {
  createSubCategoryValidator,
  getSubCategoryValidator,
  updateSubCategoryValidator,
  deleteSubCategoryValidator,
  getSubCategoriesOfCategoryValidator,
} = require("../utils/validators/subCategoryValidator");

const {
  getSubCategories,
  createSubCategory,
  getSubCategory,
  updateSubCategory,
  deleteSubCategory,
  insertCatIdfromParamsIntoBody,
  createFilterObj,
} = require("../services/subCategoryService");

const { isAuth, isAllowedTo } = require("../services/authService");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(getSubCategoriesOfCategoryValidator, createFilterObj, getSubCategories)
  .post(
    isAuth,
    isAllowedTo("admin", "manager"),
    insertCatIdfromParamsIntoBody,
    createSubCategoryValidator,
    createSubCategory
  );

router
  .route("/:id")
  .get(getSubCategoryValidator, getSubCategory)
  .put(
    isAuth,
    isAllowedTo("admin", "manager"),
    updateSubCategoryValidator,
    updateSubCategory
  )
  .delete(
    isAuth,
    isAllowedTo("admin"),
    deleteSubCategoryValidator,
    deleteSubCategory
  );

module.exports = router;
