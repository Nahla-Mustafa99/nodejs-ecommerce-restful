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
  // 1- Pagination
  const page = +req.query.page || 1;
  // limit = results per page
  const limit = +req.query.limit || 5;
  const skip = (page - 1) * limit;

  // 2- Filteration
  const queryStringObj = { ...req.query };
  // not excluded things make faulty results
  const excludedFields = ["page", "limit", "fields", "sort", "keyword"];
  excludedFields.forEach((field) => delete queryStringObj[field]);
  const queryStr = JSON.stringify(queryStringObj).replace(
    /\b(gte|gt|lte|lt)\b/g,
    (match) => `$${match}`
  );
  const queryObj = JSON.parse(queryStr);

  // Build query
  const mongooseQuery = Product.find(queryObj).skip(skip).limit(limit);

  // 3- Sorting
  if (req.query.sort) {
    // -price, sold -> "price sold"
    // req.quey.sort is string not like filter object
    const sortBy = req.query.sort.split(",").join(" ");
    mongooseQuery.sort(sortBy);
  } else {
    mongooseQuery.sort("-createdAt");
  }

  // 4- Field Limiting
  if (req.query.fields) {
    const fields = req.query.fields.split(",").join(" ");
    mongooseQuery.select(fields);
  } else {
    mongooseQuery.select("-__v");
  }

  // 5- Search
  if (req.query.keyword) {
    const keword = req.query.keyword;
    const searchQuery = {};
    searchQuery.$or = [
      { title: { $regex: keword, $options: "i" } },
      { description: { $regex: keword, $options: "i" } },
    ];
    mongooseQuery.find(searchQuery);
  }

  // Execute query
  const products = await mongooseQuery;

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
  const title = req.body?.title;
  if (title) req.body.slug = slugify(title);

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
