const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// 1- Create a brand shcema
const brandSchema = new Schema(
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

const setFullImageURL = (doc) => {
  if (doc.image) {
    const imageUrl = `${process.env.BASE_URL}/brands/${doc.image}`;
    doc.image = imageUrl;
  }
};
// findOne, findAll and update
brandSchema.post("init", (doc) => {
  setFullImageURL(doc);
});

// create
brandSchema.post("save", (doc) => {
  setFullImageURL(doc);
});

// 2- export the model that build upon that schema
module.exports = mongoose.model("Brand", brandSchema);
