const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const couponSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Coupon name required"],
      unique: true,
    },
    discount: {
      type: Number,
      required: [true, "Coupon discount percentage value required"],
    },
    expire: {
      type: Date,
      required: [true, "Coupon expiration date is required"],
    },
  },

  { timestamps: true }
);

module.exports = mongoose.model("Coupon", couponSchema);
