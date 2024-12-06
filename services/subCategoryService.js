const asyncHandler = require("express-async-handler");
const slugify = require("slugify");

const SubCategory = require("../models/subCategoryModel");
const ApiFeatures = require("../utils/apiFeatures");
const {
  deleteOne,
  getAll,
  getOne,
  updateOne,
  createOne,
} = require("./hanldersFactory");

// @desc Helper function: insure validatation of categoryId that comes from params(if any)...
// @route For nested route: GET /api/v1/categories/categoryId/subcategories
exports.createFilterObj = (req, res, next) => {
  const categoryId = req.params?.categoryId;
  if (categoryId) {
    req.filterObj = { category: categoryId };
  }
  return next();
};

// @desc Helper function: insure validatation of categoryId that comes from params(if any)...
// @route For nested route: POST /api/v1/categories/categoryId/subcategories
exports.insertCatIdfromParamsIntoBody = (req, res, next) => {
  const { categoryId } = req.params;
  if (categoryId) {
    req.body.category = categoryId;
  }
  return next();
};

// @desc create subcategory
// @route POST /api/v1/subcategories
// @access Private
exports.createSubCategory = createOne(SubCategory);

// @desc get list of subcategories
// @route GET /api/v1/subcategories
// @access Public
exports.getSubCategories = getAll(SubCategory, "Subcategory");

// @desc get a specific subcategory
// @route GET /api/v1/subcategories/:id
// @access Public
exports.getSubCategory = getOne(SubCategory);

// @desc update a specific subcategory
// @route PUT /api/v1/subcategories/:id
// @access Private
exports.updateSubCategory = updateOne(SubCategory);

// @desc delete a specific subcategory
// @route DELETE /api/v1/subcategories/:id
// @access Private
exports.deleteSubCategory = deleteOne(SubCategory);
