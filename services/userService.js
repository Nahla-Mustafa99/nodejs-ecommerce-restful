const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

const ApiError = require("../utils/apiError");
const factory = require("./hanldersFactory");
const User = require("../models/userModel");
const generateToken = require("../utils/generateToken");

// @desc    Get list of users
// @route   GET /api/v1/users
// @access  Private/Admin
exports.getUsers = factory.getAll(User, "User");

// @desc Create user
// @route  POST /api/v1/users
// @access Private(Admin)
exports.createUser = asyncHandler(async (req, res) => {
  const salt = 12;
  const { password } = req.body;
  const hashed = await bcrypt.hash(password, salt);
  const user = await User.create({ ...req.body, password: hashed });

  // Delete password from response
  delete user._doc.password;
  res.status(201).json({ data: user });
});

// @desc    Get specific user by id
// @route   GET /api/v1/users/:id
// @access  Private(Admin)
exports.getUser = factory.getOne(User);

// @desc Update specific user by id
// @route PUT /api/v1/users/:id
// @access Private(Admin)
exports.updateUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, slug, email, phone, profileImg, role, active } = req.body;
  const editObj = { name, slug, phone, email, profileImg, role, active };

  const user = await User.findByIdAndUpdate({ _id: id }, editObj, {
    new: true,
  });

  if (!user) {
    const error = new ApiError(`No user is found for this id: ${id}`, 404);
    return next(error);
  }

  // Delete password from response
  delete user._doc.password;
  res.status(200).json({ data: user });
});

// @desc Delete a specific user
// @route DELETE /api/v1/users/:id
// @access  Private(Admin)
exports.deleteUser = factory.deleteOne(User);

// @desc change password of a specific user who makes reset password request
// @route PUT /api/v1/users/changePassword/:id??
// @access Private/Admin
exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  const userId = req.params.id;
  const { password: newPass } = req.body;
  const salt = 12;
  const hashed = await bcrypt.hash(newPass, salt);

  const user = await User.findByIdAndUpdate(
    userId,
    {
      password: hashed,
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );

  if (!user) {
    return next(new ApiError(`No user found for this id ${userId}`, 404));
  }

  // Delete password from response
  delete user._doc.password;
  res.status(200).json({ data: user });
});

// @desc Get LoggedIn user data (insert user id into params to be able to go through getUser handler)
// @route GET /api/v1/users/getMe
// @access Private/Protect
exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  return next();
});

// @desc Update loggedIn user password only
// @route PUT /api/v1/users/updateMyPassword
// @access Private/Protect
exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { password: newPass } = req.body;
  const salt = 12;
  const hashed = await bcrypt.hash(newPass, salt);

  // 1) Update user password based user payload (req.user._id)
  const user = await User.findByIdAndUpdate(
    { _id: userId },
    { password: hashed, passwordChangedAt: Date.now() },
    { new: true }
  );

  // 2) Generate token
  const token = generateToken({
    email: user.email,
    userId: user._id.toString(),
  });

  // Delete password from response
  delete user._doc.password;
  return res.status(200).json({ data: user, token });
});

// @desc Update loggedIn user data (name/email/phone without password, role)
// @route PUT /api/v1/users/updateMe
// @access Private/Protect
exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { name, slug, email, phone } = req.body;
  const editObj = { name, slug, email, phone };

  const user = await User.findByIdAndUpdate({ _id: userId }, editObj, {
    new: true,
  });

  delete user._doc.password;
  return res.status(200).json({ data: user });
});
