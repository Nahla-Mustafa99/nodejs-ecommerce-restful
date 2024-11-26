const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// 1- Create a brand shcema
const brand = new Schema(
  {
    name: {
      type: String,
      unique: [true, "brand name must be unique"],
      required: [true, "brand name is required!"],
      minlength: [3, "Too short brand name"],
      maxlength: [32, "Too long brand name"],
    },
    slug: { type: String, lowercase: true, required: [true, "slug required!"] },
    image: { type: String },
  },
  { timestamps: true }
);

// 2- export the model that build upon that shcema
module.exports = mongoose.model("Brand", brand);
