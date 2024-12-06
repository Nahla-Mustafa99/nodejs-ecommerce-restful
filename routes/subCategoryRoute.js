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

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(getSubCategoriesOfCategoryValidator, createFilterObj, getSubCategories)
  .post(
    insertCatIdfromParamsIntoBody,
    createSubCategoryValidator,
    createSubCategory
  );

router
  .route("/:id")
  .get(getSubCategoryValidator, getSubCategory)
  .put(updateSubCategoryValidator, updateSubCategory)
  .delete(deleteSubCategoryValidator, deleteSubCategory);

module.exports = router;
