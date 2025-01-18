const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// 1- Create a product shcema
const productSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Product title is required!"],
      trim: true,
      unique: [true, "Product title must be unique"],
      minlength: [3, "Too short product title"],
      maxlength: [100, "Too long product title"],
    },
    slug: { type: String, lowercase: true, required: [true, "slug required!"] },
    description: {
      type: String,
      required: [true, "Product description is required!"],
      // trim: true,
      minlength: [20, "Too short product description"],
    },
    quantity: {
      type: Number,
      required: [true, "product quantity is required"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required!"],
      trim: true,
      max: [2000000, "product price must not be above 2000000"],
    },
    priceAfterDiscount: { type: Number },
    sold: { type: Number, default: 0 },
    images: [String],
    imageCover: {
      type: String,
      required: [true, "Product must have at least one image cover"],
    },
    colors: [String],
    ratingsQuantity: { type: Number, default: 0 },
    ratingsAverage: {
      type: Number,
      minimum: 1,
      maximum: 5,
      // min: [1, "Rating must be above or equal 1.0"],
      // max: [5, "Rating must not be above 5.0"],
    },
    category: {
      type: mongoose.Types.ObjectId,
      ref: "Category",
      required: [true, "Product must belong to a parent category"],
    },
    subcategories: [{ type: mongoose.Types.ObjectId, ref: "SubCategory" }],
    brand: {
      type: mongoose.Types.ObjectId,
      ref: "Brand",
    },
  },

  { timestamps: true, strict: "throw" }
);

productSchema.pre(/^find/, function (next) {
  this.populate({ path: "category", select: "name" });
  next();
});

const setFullImageURL = (doc) => {
  if (doc.imageCover) {
    const imageUrl = `${process.env.BASE_URL}/products/${doc.imageCover}`;
    doc.imageCover = imageUrl;
  }
  if (doc.images) {
    const imagesList = [];
    doc.images.forEach((image) => {
      const imageUrl = `${process.env.BASE_URL}/products/${image}`;
      imagesList.push(imageUrl);
    });
    doc.images = imagesList;
  }
};

// findOne, findAll and update
productSchema.post("init", (doc) => {
  setFullImageURL(doc);
});

// create
productSchema.post("save", (doc) => {
  setFullImageURL(doc);
});

// 2- export the model that build upon that shcema
module.exports = mongoose.model("Product", productSchema);
