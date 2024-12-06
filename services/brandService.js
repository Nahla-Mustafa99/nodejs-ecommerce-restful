const Brand = require("../models/brandModel");
const {
  deleteOne,
  getAll,
  getOne,
  updateOne,
  createOne,
} = require("./hanldersFactory");

// @desc create a new brand
// @route POST /api/v1/brands
// @access private
exports.createBrand = createOne(Brand);

// @desc get list of brands
// @route GET /api/v1/brands
// @access public
exports.getBrands = getAll(Brand);

// @desc get a specific brand
// @route GET /api/v1/brands/:id
// @access public
exports.getBrand = getOne(Brand);

// @desc update a specific brand
// @route PUT /api/v1/brands/:id
// @access private
exports.updateBrand = updateOne(Brand);

// @desc delete a specific brand
// @route DELETE /api/v1/brands/:id
// @access private
exports.deleteBrand = deleteOne(Brand);
