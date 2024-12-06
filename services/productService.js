const Product = require("../models/productModel");
const {
  deleteOne,
  getAll,
  getOne,
  updateOne,
  createOne,
} = require("./hanldersFactory");

// @desc create product
// @route POST /api/v1/products
// @access Private
exports.createProduct = createOne(Product);

// @desc get list of products
// @route GET /api/v1/products
// @access Public
exports.getProducts = getAll(Product, "Product");

// @desc get a specific product
// @route GET /api/v1/products/:id
// @access Public
exports.getProduct = getOne(Product);

// @desc update a specific product
// @route PUT /api/v1/products/:id
// @access Private
exports.updateProduct = updateOne(Product);

// @desc delete a specific product
// @route DELETE /api/v1/products/:id
// @access Private
exports.deleteProduct = deleteOne(Product);
