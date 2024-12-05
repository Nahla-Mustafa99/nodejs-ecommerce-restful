const asyncHandler = require("express-async-handler");
const slugify = require("slugify");

const ApiError = require("../utils/apiError");
const SubCategory = require("../models/subCategoryModel");
const ApiFeatures = require("../utils/apiFeatures");

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
exports.createSubCategory = asyncHandler(async (req, res, next) => {
  const { name, category } = req.body;
  const subcategory = await SubCategory.create({
    name,
    slug: slugify(name),
    category,
  });
  return res.status(201).json({ data: subcategory });
});

// @desc get list of subcategories
// @route GET /api/v1/subcategories
// @access Public
exports.getSubCategories = asyncHandler(async (req, res, next) => {
  const documentsCount = await SubCategory.countDocuments();

  const categoryId = req.params?.categoryId;
  let filterObj = categoryId ? { category: categoryId } : {};

  const apiFeatures = new ApiFeatures(SubCategory.find(filterObj), req.query)
    .paginate(documentsCount)
    .filter()
    .sort()
    .fieldLimit()
    .search("SubCategory");

  // Execute query
  const { mongooseQuery, paginationResult } = apiFeatures;
  const subcategories = await mongooseQuery;

  return res.status(200).json({
    results: subcategories.length,
    paginationResult,
    data: subcategories,
  });
});

// @desc get a specific subcategory
// @route GET /api/v1/subcategories/:id
// @access Public
exports.getSubCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const subcategory = await SubCategory.findById(id);
  if (!subcategory) {
    return next(new ApiError("No subcategory found for this id: " + id, 404));
  }
  res.status(200).json({ data: subcategory });
});

// @desc update a specific subcategory
// @route PUT /api/v1/subcategories/:id
// @access Private
exports.updateSubCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (req.body.name) {
    req.body.slug = slugify(req.body.name);
  }
  const subcategory = await SubCategory.findByIdAndUpdate(
    { _id: id },
    req.body,
    { new: true }
  );

  if (!subcategory) {
    return next(new ApiError("No subcategory found for this id: " + id, 404));
  }

  res.status(200).json({ data: subcategory });
});

// @desc delete a specific subcategory
// @route DELETE /api/v1/subcategories/:id
// @access Private
exports.deleteSubCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const subcategory = await SubCategory.findByIdAndDelete(id);
  if (!subcategory) {
    return next(new ApiError("No subcategory found for this id: " + id, 404));
  }
  res.status(204).send();
});
