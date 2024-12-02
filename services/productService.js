const asyncHandler = require("express-async-handler");
const slugify = require("slugify");

const ApiError = require("../utils/apiError");
const Product = require("../models/productModel");

// @desc create product
// @route POST /api/v1/products
// @access Private
exports.createProduct = asyncHandler(async (req, res, next) => {
  req.body.slug = slugify(req.body.title);

  const product = await Product.create(req.body);

  return res.status(201).json({ data: product });
});

// @desc get list of products
// @route GET /api/v1/products
// @access Public
exports.getProducts = asyncHandler(async (req, res, next) => {
  const page = +req.query.page || 1;
  const resultsPerPage = +req.query.limit || 5;
  const skip = (page - 1) * resultsPerPage;

  const products = await Product.find().skip(skip).limit(resultsPerPage);

  return res
    .status(200)
    .json({ results: products.length, page: page, data: products });
});

// @desc get a specific product
// @route GET /api/v1/products/:id
// @access Public
exports.getProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) {
    return next(new ApiError("No product found for this id: " + id, 404));
  }
  res.status(200).json({ data: product });
});

// @desc update a specific product
// @route PUT /api/v1/products/:id
// @access Private
exports.updateProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  req.body.slug = slugify(req.body.title);

  const product = await Product.findByIdAndUpdate({ _id: id }, req.body, {
    new: true,
  });
  if (!product) {
    return next(new ApiError("No product found for this id: " + id, 404));
  }

  res.status(200).json({ data: product });
});

// @desc delete a specific product
// @route DELETE /api/v1/products/:id
// @access Private
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    return next(new ApiError("No product found for this id: " + id, 404));
  }
  res.status(204).send();
});
