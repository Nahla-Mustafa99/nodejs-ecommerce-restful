const asyncHandler = require("express-async-handler");
const { default: mongoose } = require("mongoose");

const ApiError = require("../utils/apiError");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");

// @desc    Get cart of the authenticated(loggedIn) user
// @route   GET /api/v1/cart
// @access  Private/Protect
exports.getCart = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  let cart = await Cart.findOne({ user: userId });
  // Check cart existance
  if (!cart) {
    const error = new ApiError(
      `There is no cart for this user id ${userId}`,
      404
    );
    return next(error);
  }

  res.status(200).json({
    status: "success",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc   Add a product to the cart of the authenticated(loggedIn) user
// @route  POST /api/v1/cart
// @access Protected/User
exports.addProdToCart = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { productId, color } = req.body;

  // Check if this product exists in db
  if (!mongoose.isObjectIdOrHexString(productId)) {
    return next(new ApiError("Invalid productId format", 400));
  }
  const product = await Product.findById(productId);
  if (!product) {
    const error = new ApiError(
      `No product is found for this id: ${productId}`,
      404
    );
    return next(error);
  }

  // Get Cart for loggedIn user
  let cart = await Cart.findOne({ user: userId });
  // Check cart existance
  if (!cart) {
    // create cart for loggedIn user with this product
    cart = await Cart.create({
      cartItems: [
        { product: productId, price: product.price, color, quantity: 1 },
      ],
      totalCartPrice: product.price,
      user: userId,
    });
  } else {
    // There is a cart already

    // Check if this product not exist in the cart
    const productIndex = cart.cartItems.findIndex(
      (item) => item.product.toString() === productId && item.color === color
    );
    if (productIndex === -1) {
      // product not exist in cart, push product to cartItems array
      cart.cartItems.push({
        product: productId,
        color,
        price: product.price,
        quantity: 1,
      });
    } else {
      // product exists in the cart, increase its quantity
      cart.cartItems[productIndex].quantity += 1;
    }

    cart.totalCartPrice += product.price;
  }
  cart.totalCartPrice = cart.totalCartPrice.toFixed(2);
  await cart.save();
  res.status(200).json({
    status: "success",
    message: "Product added to cart successfully",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc    Delete a specific cart item
// @route   DELETE /api/v1/cart/:itemId
// @access  Protected/User
exports.removeSpecificCartItem = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { itemId } = req.params;
  const cart = await Cart.findOne({ user: userId });

  // Check cart existance
  if (!cart) {
    const error = new ApiError(
      `There is no cart for this user id : ${userId}`,
      404
    );
    return next(error);
  }
  const itemIndex = cart.cartItems.findIndex(
    (item) => item._id.toString() === itemId
  );
  // Check item existance
  if (itemIndex === -1) {
    const error = new ApiError("This item isn't found in the cart", 404);
    return next(error);
  }
  // Calculate cart item price before pulling it
  const cartItem = cart.cartItems[itemIndex];
  const cartItemPrice = cartItem.price * cartItem.quantity;
  // Update cartItems
  cart.cartItems.pull({ _id: itemId });
  // Update cart total price
  cart.totalCartPrice -= cartItemPrice;
  cart.totalCartPrice = cart.totalCartPrice.toFixed(2);
  await cart.save();
  res.status(200).json({
    status: "success",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc   Update specific cart item quantity
// @route  PUT api/v1/cart/:itemId
// @access Protected/User
exports.updateCartItemQuantity = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { itemId } = req.params;
  let { quantity } = req.body;

  const cart = await Cart.findOne({ user: userId });
  // Check cart existance
  if (!cart) {
    const error = new ApiError(
      `There is no cart for this user id ${userId}`,
      404
    );
    return next(error);
  }
  const itemIndex = cart.cartItems.findIndex(
    (item) => item._id.toString() === itemId
  );
  // Check item existance
  if (itemIndex === -1) {
    const error = new ApiError(
      `There is no cart item for this id ${itemId}`,
      404
    );
    return next(error);
  }
  if (!quantity || quantity <= 0) {
    // Remove cartItem
    cart.cartItems = cart.cartItems.filter(
      (item) => item._id.toString() !== itemId
    );
  } else {
    // Update cartItem quantity
    cart.cartItems = cart.cartItems.map((item) => {
      if (item._id.toString() === itemId) return { ...item, quantity };
      return item;
    });
  }
  // Update cart total price
  cart.totalCartPrice = cart.cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  cart.totalCartPrice = cart.totalCartPrice.toFixed(2);
  await cart.save();
  res.status(200).json({
    status: "success",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc   Clear cart of the authenticated(loggedIn) user
// @route  DELETE /api/v1/cart
// @access Protected/User
exports.clearCart = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  const cart = await Cart.findOneAndDelete({ user: userId });

  if (!cart) {
    const error = new ApiError(
      `There is no cart for this user id ${userId}`,
      404
    );
    return next(error);
  }

  res.status(204).send();
});
