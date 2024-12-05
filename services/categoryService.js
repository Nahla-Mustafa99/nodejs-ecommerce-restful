const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const Category = require("../models/categoryModel");
const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");

// @desc get list of categories
// @route GET /api/v1/categories
// @access public
exports.getCategories = asyncHandler(async (req, res, next) => {
  const documentsCount = await Category.countDocuments();
  const apiFeatures = new ApiFeatures(Category.find(), req.query)
    .paginate(documentsCount)
    .filter()
    .sort()
    .fieldLimit()
    .search("Category");

  // Execute query
  const { mongooseQuery, paginationResult } = apiFeatures;
  const categories = await mongooseQuery;
  if (!categories) {
    const error = new ApiError("No categories found", 404);
    return next(error);
  }

  res
    .status(200)
    .json({ results: categories.length, paginationResult, data: categories });
});

// @desc create a new category
// @route POST /api/v1/categories
// @access private
exports.createCategory = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  const category = await Category.create({ name: name, slug: slugify(name) });
  res.status(201).json({ data: category });
});

// @desc get a specific category
// @route GET /api/v1/categories/:id
// @access public
exports.getCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const category = await Category.findById(id);
  if (!category) {
    const error = new ApiError(`No category is found for this id: ${id}`, 404);
    return next(error);
  }
  res.status(200).json({ data: category });
});

// @desc update a specific category
// @route PUT /api/v1/categories/:id
// @access private
exports.updateCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;

  const category = await Category.findOneAndUpdate(
    { _id: id },
    { name, slug: slugify(name) },
    { new: true }
  );
  if (!category) {
    const error = new ApiError(`No category is found for this id: ${id}`, 404);
    return next(error);
  }
  res.status(200).json({ data: category });
});

// @desc delete a specific category
// @route DELETE /api/v1/categories/:id
// @access private
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const category = await Category.findByIdAndDelete(id);
  if (!category) {
    const error = new ApiError(`No category is found for this id: ${id}`, 404);
    return next(error);
  }
  res.status(204).send();
});
