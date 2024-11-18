const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// 1- Create a category shcema
const categoryShcema = new Schema(
  {
    name: {
      type: String,
      unique: [true, "category must be unique"],
      required: [true, "category required!"],
      minlength: [3, "Too short category name"],
      maxlength: [32, "Too long category name"],
    },
    slug: { type: String, lowercase: true, required: [true, "slug required!"] },
    image: { type: String },
  },
  { timestamps: true }
);

// 2- export the model that build upon that shcema
module.exports = mongoose.model("Category", categoryShcema);
