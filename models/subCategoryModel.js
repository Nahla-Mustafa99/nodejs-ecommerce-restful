const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// 1- Create a subcategory shcema
const subCategorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Subcategory name is required!"],
      trim: true,
      unique: [true, "Subcategory name must be unique"],
      minlength: [2, "Too short Subcategory name"],
      maxlength: [32, "Too long Subcategory name"],
    },
    slug: { type: String, lowercase: true, required: [true, "slug required!"] },
    category: {
      type: mongoose.Types.ObjectId,
      ref: "Category",
      required: [true, "Subcategory must belong to a parent category"],
    },
  },
  { timestamps: true }
);

// 2- export the model that build upon that shcema
module.exports = mongoose.model("SubCategory", subCategorySchema);
