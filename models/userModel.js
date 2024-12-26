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
        alias: String,
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

module.exports = mongoose.model("User", userSchema);
