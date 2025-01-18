const Brand = require("../models/brandModel");
const {
  deleteOne,
  getAll,
  getOne,
  updateOne,
  createOne,
} = require("./hanldersFactory");

const uploadwithMulterMiddleware = require("../middlewares/uploadImageMiddleware");

// Upload single image
exports.uploadBrandImage = uploadwithMulterMiddleware({
  destFolderName: "brands",
  fileNamePrefix: "brand",
}).single("image");

// Set image path into body
exports.setBrandImage = (req, res, next) => {
  // Accept only files or empty input.
  if (req.body.image) {
    delete req.body.image;
  }

  if (req.file) {
    req.body.image = req.file.filename;
  }
  next();
};

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
