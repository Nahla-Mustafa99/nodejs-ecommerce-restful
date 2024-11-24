const express = require("express");
const router = express.Router();
const { check, param, validationResult } = require("express-validator");

const {
  getCategories,
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
} = require("../services/categoryService");
const ApiError = require("../utils/apiError");

router
  .route("/")
  .get(getCategories)
  .post(
    check("name")
      .notEmpty()
      .withMessage("Category name is required")
      .isLength({ min: 3 })
      .withMessage("Too short category name")
      .isLength({ max: 32 })
      .withMessage("Too long category name"),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      return next();
    },
    createCategory
  );

router
  .route("/:id")
  .get(
    param("id").isMongoId().withMessage("Invalid category id format"),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      return next();
    },
    getCategory
  )
  .put(
    check("id").isMongoId().withMessage("Invalid category id format"),
    check("name")
      .notEmpty()
      .withMessage("Category name is required")
      .isLength({ min: 3 })
      .withMessage("Too short category name")
      .isLength({ max: 32 })
      .withMessage("Too long category name"),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      return next();
    },
    updateCategory
  )
  .delete(
    check("id").isMongoId().withMessage("Invalid category id format"),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      return next();
    },
    deleteCategory
  );

module.exports = router;
