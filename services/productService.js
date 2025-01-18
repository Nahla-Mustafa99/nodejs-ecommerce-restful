const Product = require("../models/productModel");
const {
  deleteOne,
  getAll,
  getOne,
  updateOne,
  createOne,
} = require("./hanldersFactory");

const uploadwithMulterMiddleware = require("../middlewares/uploadImageMiddleware");

exports.uploadProductImages = uploadwithMulterMiddleware({
  destFolderName: "products",
  fileNamePrefix: "product",
}).fields([
  {
    name: "imageCover",
    maxCount: 1,
  },
  {
    name: "images",
    maxCount: 5,
  },
]);

// Set images paths into body
exports.setProductImages = (req, res, next) => {
  // Accept only files or empty inputs
  if (req.body.images) {
    delete req.body.images;
  }
  if (req.body.imageCover) {
    delete req.body.imagecover;
  }

  if (req.files?.imageCover) {
    req.body.imageCover = req.files.imageCover[0].filename;
  }
  if (req.files?.images) {
    req.body.images = req.files.images.map((img) => img.filename);
  } else if (
    (!req.files?.images && req.method !== "PUT") ||
    req.body.images === ""
  ) {
    req.body.images = [];
  }
  next();
};

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
