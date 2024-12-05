const slugify = require("slugify");
const asyncHandler = require("express-async-handler");

const Brand = require("../models/brandModel");
const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");

// @desc create a new brand
// @route POST /api/v1/brands
// @access private
exports.createBrand = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  const brand = await Brand.create({ name: name, slug: slugify(name) });
  res.status(201).json({ data: brand });
});

// @desc get list of brands
// @route GET /api/v1/brands
// @access public
exports.getBrands = asyncHandler(async (req, res, next) => {
  const documentsCount = await Brand.countDocuments();
  const apiFeatures = new ApiFeatures(Brand.find(), req.query)
    .paginate(documentsCount)
    .filter()
    .sort()
    .fieldLimit()
    .search("Brand");

  // Execute query
  const { mongooseQuery, paginationResult } = apiFeatures;
  const brands = await mongooseQuery;

  res
    .status(200)
    .json({ results: brands.length, paginationResult, data: brands });
});

// @desc get a specific brand
// @route GET /api/v1/brands/:id
// @access public
exports.getBrand = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const brand = await Brand.findById(id);
  if (!brand) {
    const error = new ApiError(`No brand is found for this id: ${id}`, 404);
    return next(error);
  }
  res.status(200).json({ data: brand });
});

// @desc update a specific brand
// @route PUT /api/v1/brands/:id
// @access private
exports.updateBrand = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;
  if (name) {
    req.body.slug = slugify(name);
  }
  const brand = await Brand.findByIdAndUpdate({ _id: id }, req.body, {
    new: true,
  });
  if (!brand) {
    const error = new ApiError(`No brand is found for this id: ${id}`, 404);
    return next(error);
  }
  res.status(200).json({ data: brand });
});

// @desc delete a specific brand
// @route DELETE /api/v1/brands/:id
// @access private
exports.deleteBrand = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const brand = await Brand.findByIdAndDelete(id);
  if (!brand) {
    const error = new ApiError(`No brand is found for this id: ${id}`, 404);
    return next(error);
  }
  res.status(204).send();
});
