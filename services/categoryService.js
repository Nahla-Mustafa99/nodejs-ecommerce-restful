const Category = require("../models/categoryModel");
const {
  deleteOne,
  getAll,
  getOne,
  updateOne,
  createOne,
} = require("./hanldersFactory");

// @desc get list of categories
// @route GET /api/v1/categories
// @access public
exports.getCategories = getAll(Category);
// @desc create a new category
// @route POST /api/v1/categories
// @access private
exports.createCategory = createOne(Category);

// @desc get a specific category
// @route GET /api/v1/categories/:id
// @access public
exports.getCategory = getOne(Category);

// @desc update a specific category
// @route PUT /api/v1/categories/:id
// @access private
exports.updateCategory = updateOne(Category);

// @desc delete a specific category
// @route DELETE /api/v1/categories/:id
// @access private
exports.deleteCategory = deleteOne(Category);
