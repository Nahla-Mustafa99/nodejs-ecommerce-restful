const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// 1- Create a category shcema
const categorySchema = new Schema(
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

const setFullImageURL = (doc) => {
  if (doc.image) {
    const imageUrl = `${process.env.BASE_URL}/categories/${doc.image}`;
    doc.image = imageUrl;
  }
};
// findOne, findAll and update
categorySchema.post("init", (doc) => {
  setFullImageURL(doc);
});

// create
categorySchema.post("save", (doc) => {
  setFullImageURL(doc);
});

// 2- export the model that build upon that schema
module.exports = mongoose.model("Category", categorySchema);
