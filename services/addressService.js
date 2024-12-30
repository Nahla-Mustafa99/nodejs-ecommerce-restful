const User = require("../models/userModel");
const ApiError = require("../utils/apiError");
const asyncHandler = require("express-async-handler");

// @desc    Add a new address to the authenticated user addresses list
// @route   POST /api/v1/addresses
// @access  Protected/User
exports.createAddress = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  // $addToSet => add address object to user addresses  array if address not exist
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $addToSet: { addresses: req.body },
    },
    { new: true }
  );

  await user.save();
  res.status(200).json({
    status: "success",
    message: "Address added successfully.",
    data: user.addresses,
  });
});

// @desc    Get list of addresses of the authenticated(loggedIn) user
// @route   GET /api/v1/addresses
// @access  Protected/User
exports.getUserAddresses = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const user = await User.findById(userId);

  res.status(200).json({
    status: "success",
    results: user.addresses.length,
    data: user.addresses,
  });
});

// @desc    Get a specific address
// @route   GET /api/v1/addresses/:addressId
// @access  Protected/User
exports.getAddress = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { addressId } = req.params;
  const user = await User.findById(userId);

  const address = user.addresses.find(
    (address) => address._id.toString() === addressId
  );
  // Check address existance
  if (!address) {
    const error = new ApiError(
      `There is no address for this id : ${addressId}`,
      404
    );
    return next(error);
  }
  res.status(200).json({ data: address });
});

// @desc    Update a specific address of the authenticated(loggedIn) user addresses
// @route   PUT /api/v1/addresses/:addressId
// @access  Protected/User
exports.updateAddress = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { addressId } = req.params;

  const user = await User.findById(userId);

  const addressIndex = user.addresses.findIndex(
    (address) => address._id.toString() === addressId
  );
  // Check address existance
  if (addressIndex === -1) {
    const error = new ApiError(
      `There is no address for this id : ${addressId}`,
      404
    );
    return next(error);
  }

  const address = user.addresses[addressIndex];
  // Prepare editting object
  let editObj = {};
  for (i in req.body) {
    if (i) {
      editObj[i] = req.body[i];
    }
  }

  user.addresses[addressIndex] = { ...address._doc, ...editObj };
  await user.save();
  res.status(200).json({ data: user.addresses });
});

// @desc   Delete a specific address of user addresses
// @route  DELETE /api/v1/addresses/:addressId
// @access Protected/User
exports.deleteAddress = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { addressId } = req.params;

  // $pull => remove address object from user addresses array if addressId exist
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $pull: { addresses: { _id: addressId } },
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    message: "Address removed successfully.",
    data: user.addresses,
  });
});
