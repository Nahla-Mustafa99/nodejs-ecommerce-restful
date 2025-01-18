const Category = require("../models/categoryModel");
const {
  deleteOne,
  getAll,
  getOne,
  updateOne,
  createOne,
} = require("./hanldersFactory");

const uploadwithMulterMiddleware = require("../middlewares/uploadImageMiddleware");

// Upload single image
exports.uploadCategoryImage = uploadwithMulterMiddleware({
  destFolderName: "categories",
  fileNamePrefix: "category",
}).single("image");

// Set image path into body
exports.setCategoryImage = (req, res, next) => {
  // Accept only files or empty input.
  if (req.body.image) {
    delete req.body.image;
  }

  if (req.file) {
    req.body.image = req.file.filename;
  }
  next();
};

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
