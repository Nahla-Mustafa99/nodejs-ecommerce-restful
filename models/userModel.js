const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "email required"],
      unique: true,
      lowercase: true,
    },
    name: {
      type: String,
      trim: true,
      required: [true, "name required"],
      minlength: [3, "Too short user name"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    phone: String,
    profileImg: String,

    password: {
      type: String,
      required: [true, "password required"],
      minlength: [6, "Too short password"],
    },
    passwordChangedAt: Date,
    // resetToken
    passwordResetCode: String,
    // resetTokenExpiration
    passwordResetExpires: Date,
    passwordResetVerified: Boolean,

    active: {
      type: Boolean,
      default: true,
    },

    role: {
      type: String,
      enum: ["user", "manager", "admin"],
      default: "user",
    },

    addresses: [
      {
        id: { type: mongoose.Schema.Types.ObjectId },
        // name
        alias: { type: String, unique: [true, "alias of address is unique"] },
        details: String,
        phone: String,
        city: String,
        postalCode: String,
      },
    ],

    wishlist: [
      {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Product",
      },
    ],
  },

  { timestamps: true }
);

const setFullImageURL = (doc) => {
  if (doc.profileImg) {
    const imageUrl = `${process.env.BASE_URL}/users/${doc.profileImg}`;
    doc.profileImg = imageUrl;
  }
};
// findOne, findAll and update
userSchema.post("init", (doc) => {
  setFullImageURL(doc);
});

// create
userSchema.post("save", (doc) => {
  setFullImageURL(doc);
});

module.exports = mongoose.model("User", userSchema);
