const asyncHandler = require("express-async-handler");
const slugify = require("slugify");

const ApiError = require("../utils/apiError");
const SubCategory = require("../models/subCategoryModel");

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
  const page = +req.query.page || 1;
  const resultsPerPage = +req.query.limit || 5;
  const skip = (page - 1) * resultsPerPage;

  const categoryId = req.params?.categoryId;
  let filterObj = categoryId ? { category: categoryId } : {};
  const subcategories = await SubCategory.find(filterObj)
    .skip(skip)
    .limit(resultsPerPage);

  return res
    .status(200)
    .json({ results: subcategories.length, page: page, data: subcategories });
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
  const { name, category } = req.body;

  const subcategory = await SubCategory.findById(id);
  if (!subcategory) {
    return next(new ApiError("No subcategory found for this id: " + id, 404));
  }
  const newSubCatName = name || subcategory.name;
  const newSubCatParent = category || subcategory.category;
  const updatedSubCat = await SubCategory.updateOne(
    { _id: id },
    {
      name: newSubCatName,
      slug: slugify(newSubCatName),
      category: newSubCatParent,
    },
    { new: true }
  );
  res.status(200).json({ data: updatedSubCat });
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
