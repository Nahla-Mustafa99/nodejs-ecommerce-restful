const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

const ApiError = require("../utils/apiError");
const User = require("../models/userModel");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");

// @desc Signup create new user
// @route POST /api/v1/auth/signup
// @access Public
exports.signup = asyncHandler(async (req, res, next) => {
  const { email, password, name, phone } = req.body;

  const hashedPass = await bcrypt.hash(password, 12);

  // 1- Create user
  const user = await User.create({
    email,
    name,
    password: hashedPass,
    phone,
  });

  // 2) generate token
  const token = generateToken({
    email: user.email,
    userId: user._id.toString(),
  });

  // Delete password from response
  delete user._doc.password;

  return res.status(201).json({ data: user, token });
});

// @desc Login and generate a token
// @route POST /api/v1/auth/login
// @access Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) check if user exists
  const loadedUser = await User.findOne({ email: email });
  if (!loadedUser) {
    const error = new ApiError("Invalid email or password", 401);
    return next(error);
  }
  // 2) check if password is correct
  const isMatch = await bcrypt.compare(password, loadedUser.password);
  if (!isMatch) {
    const error = new ApiError("Invalid email or password", 401);
    return next(error);
  }

  // 3) generate token
  const token = generateToken({
    email: loadedUser.email,
    userId: loadedUser._id.toString(),
  });

  // Delete password from response
  delete loadedUser._doc.password;

  return res.status(200).json({
    token: token,
    data: loadedUser,
    userId: loadedUser._id.toString(),
  });
});

// @desc Make sure the user is logged in (verify that the jwt token exists and valid)
exports.isAuth = asyncHandler(async (req, res, next) => {
  // 1) Check if token exists in the authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    const error = new ApiError("Not authenticated, Login first", 401);
    return next(error);
  }
  // 2) Get token
  const token = authHeader.split(" ")[1]; // Bearer <token>

  // 3) Verify token (not changed, not expired)
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
  } catch (err) {
    // Undefined dedcoded token
    const error = new ApiError(
      "Not authenticated, Invalid or expired token",
      401
    );
    return next(error);
  }

  // 4) Check if user exists
  const loggedInUser = await User.findById(decodedToken.userId);
  if (!loggedInUser) {
    const error = new ApiError(
      "The user that belong to this token does no longer exist",
      401
    );
    return next(error);
  }

  // 5) Check if user change his password after token created
  if (loggedInUser.passwordChangedAt) {
    const passChangedTimestamp = parseInt(
      loggedInUser.passwordChangedAt.getTime() / 1000,
      10
    );
    // Password changed after token created (Error)
    if (passChangedTimestamp > decodedToken.iat) {
      return next(
        new ApiError(
          "User recently changed his password. please login again..",
          401
        )
      );
    }
  }

  req.user = loggedInUser;
  return next();
});

// @desc Authorization (User Permissions) - access control list: ["admin", "manager"]
exports.isAllowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    const currentUserRole = req.user.role;
    console.log(req.user);
    // if (user.role !== "admin" && user.role !== "manager") {
    if (!roles.includes(currentUserRole)) {
      const error = new ApiError("Not authorized", 403);
      return next(error);
    }

    return next();
  });

// @desc Forgot-password request handler: send email with only the token. (or send a url that take the user to another middleware to verify that token /reset-password/:token)
// @route POST /api/v1/auth/forgotPassword
// @access Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  // Check if the email exists in your user database
  const user = await User.findOne({ email });
  if (!user) {
    const error = new ApiError(
      `There is a problem try to enter your email again`,
      500
    );
    return next(error);
  }
  // Generate a reset token
  const resetToken = crypto.randomBytes(3).toString("hex");

  // Store the token with in the db and its expiration timestamp (expires after 15m from now)
  user.passwordResetCode = resetToken;
  user.passwordResetExpires = Date.now() + 15 * 60 * 1000;
  user.passwordResetVerified = false;
  await user.save();

  // Send the reset token to the user's email
  const subject = "Password Reset";
  const message = `Hi ${user.name},\n
   We received a request to reset the password on your account.\n
   ${resetToken} \n
    Enter this code to complete the reset.\n
    Thanks for helping us keep your account secure.\n
    The E-shop Team.`;

  try {
    await sendEmail(email, subject, message);
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;
    await user.save();
    return next(new ApiError("Error sending the email..", 500));
  }

  return res.status(200).json({
    status: "Success",
    message: "Check your email for instructions on resetting your password",
  });
});

// @desc Handle and verify the password reset code
// @route POST /api/v1/auth/verifyResetPassword
// @access Public
exports.verifyResetPassword = asyncHandler(async (req, res, next) => {
  const token = req.body.resetCode;

  // Check if the token exists and is still valid
  const user = await User.findOne({
    passwordResetCode: token,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    const error = new ApiError("Invalid or expired token", 400);
    return next(error);
  }

  // set that the reset token is valid
  user.passwordResetVerified = true;
  await user.save();
  return res.status(200).json({
    status: "Success",
    message: "Success!, Now you can reset your password",
  });
});

// @desc Reset password (update the password)
// @route PUT /api/v1/auth/resetPassword
// @access Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { email, newPassword } = req.body;
  // 1) Get user based on email
  const user = await User.findOne({ email });
  if (!user) {
    return next(new ApiError(`There is no user with email ${email}`, 404));
  }
  if (!user.passwordResetVerified) {
    const error = new ApiError("Reset code not verified", 400);
    return next(error);
  }

  // Remove the reset token & update the password
  const hashedPass = await bcrypt.hash(newPassword, 12);
  user.password = hashedPass;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;
  await user.save();

  // 3) Generate token
  const token = generateToken({
    email: user.email,
    userId: user._id.toString(),
  });

  res.status(200).json({ message: "Password updated sucessfully", token });
});
