const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const Category = require("../models/categoryModel");

// @desc get list of categories
// @route POST /api/v1/categories
// @access public
exports.getCategories = asyncHandler(async (req, res, next) => {
  const curPage = +req.query.page || 1;
  const resultsPerPage = +req.query.limit || 5;
  const skip = (curPage - 1) * resultsPerPage;

  const categories = await Category.find({}).skip(skip).limit(resultsPerPage);
  if (!categories) {
    return res.status(404).json({ msg: "No categories found" });
  }
  res.status(200).json({ results: categories.length, data: categories });
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
    return res
      .status(404)
      .json({ msg: `No category is found for this id: ${id}` });
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
    return res
      .status(404)
      .json({ msg: `No category is found for this id: ${id}` });
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
    return res
      .status(404)
      .json({ msg: `No category is found for this id: ${id}` });
  }
  res.status(204).send();
});
