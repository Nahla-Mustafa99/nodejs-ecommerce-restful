const asyncHandler = require("express-async-handler");

const ApiError = require("../utils/apiError");
const factory = require("./hanldersFactory");
const Order = require("../models/orderModel");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");

const stripe = require("stripe")(process.env.STRIPE_SECRET);

// @desc    Create cash order
// @route   POST /api/v1/orders/:cartId
// @access  Protected/User
exports.createCashOrder = asyncHandler(async (req, res, next) => {
  const { user } = req;
  const { shippingAddress } = req.body;
  const { cartId } = req.params;

  // App settings
  const taxPrice = 0;
  const shippingPrice = 0;

  // 1) Get cart depend on cartId & check cart existance
  const cart = await Cart.findById(cartId);

  if (cart) {
    if (cart.cartItems.length === 0) {
      const error = new ApiError("You don't have any items in the cart!", 400);
      return next(error);
    }
    if (cart.user.toString() !== user._id.toString()) {
      const error = new ApiError("Not authorized!", 403);
      return next(error);
    }
  } else {
    const error = new ApiError(`There is no such cart with id ${cartId}`, 404);
    return next(error);
  }
  // 2) Get full address data && check existance
  const address = user.addresses.find((add) => add.alias === shippingAddress);
  if (!address) {
    const error = new ApiError(
      `There is no address called '${shippingAddress}' in your adresses list'`,
      404
    );
    return next(error);
  }
  // 3) Calculate order price depend on cart price "Check if coupon apply"
  let orderPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;
  orderPrice += taxPrice + shippingPrice;

  // 4) Create order with default paymentMethodType cash
  const orderObj = {
    user: user._id,
    shippingAddress: { ...address._doc },
    cartItems: cart.cartItems,
    totalOrderPrice: orderPrice,
    paymentMethodType: "cash",
  };
  const order = await Order.create(orderObj);

  // 5) After creating order, decrement product quantity, increment product sold
  if (order) {
    const productsIds = cart.cartItems.map((item) => item.product);
    const productsIndexesArr = cart.cartItems.map((item, index) => [
      item.product,
      index,
    ]);
    const productsIndexesObj = Object.fromEntries(productsIndexesArr);
    const cartItems = cart.cartItems;
    const products = await Product.find({
      _id: { $in: productsIds },
    });
    await products.map(async (p) => {
      p.quantity = p.quantity - cartItems[productsIndexesObj[p._id]].quantity;
      p.sold = p.sold + cartItems[productsIndexesObj[p._id]].quantity;
      await p.save();
    });

    // 6) Clear cart depend on cartId
    await Cart.findByIdAndDelete(cartId);
  }

  return res.status(201).json({ status: "success", data: order });
});

exports.filterOrderForLoggedUser = asyncHandler(async (req, res, next) => {
  const { user } = req;
  let filterObj = {};
  if (user.role === "user") {
    filterObj = { user: user._id };
  }
  req.filterObj = filterObj;
  next();
});

// @desc    Get list of orders
// @route   GET /api/v1/orders
// @access  Private/Protect/Admin-Manager-User
exports.getOrders = factory.getAll(Order, "Order");

// @desc    Get a specific order by id
// @route   GET /api/v1/orders/:id
// @access  Private/Protect/Admin-Manager-User
exports.getOrder = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { user } = req;

  const order = await Order.findById(id);
  if (!order) {
    const error = new ApiError("No order found for this id: " + id, 404);
    return next(error);
  }
  // Check user authorization
  if (
    order.user._id.toString() !== user._id.toString() &&
    user.role === "user"
  ) {
    const error = new ApiError("Not authorized", 403);
    return next(error);
  }
  res.status(200).json({ status: "success", data: order });
});

// @desc    Update a specific order to be paid (order paid status)
// @route   PUT /api/v1/orders/:id/pay
// @access  Protected/Admin-Manager
exports.updateOrderToPaid = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const order = await Order.findByIdAndUpdate(
    id,
    {
      isPaid: true,
      paidAt: Date.now(),
    },
    { new: true }
  );
  if (!order) {
    const error = new ApiError("No order found for this id: " + id, 404);
    return next(error);
  }

  res.status(200).json({ status: "success", data: order });
});

// @desc    Update a specific order to be delivered (order delivered status)
// @route   PUT /api/v1/orders/:id/deliver
// @access  Protected/Admin-Manager
exports.updateOrderToDelivered = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const order = await Order.findByIdAndUpdate(
    id,
    {
      isDelivered: true,
      deliveredAt: Date.now(),
    },
    { new: true }
  );
  if (!order) {
    const error = new ApiError("No order found for this id: " + id, 404);
    return next(error);
  }

  res.status(200).json({ status: "success", data: order });
});

// @desc    Create checkout session from stripe, send it as a response (as a step of the process of creating card order)
// @route   POST /api/v1/orders/checkout-session/:cartId
// @access  Protected/User
exports.createCheckoutSession = asyncHandler(async (req, res, next) => {
  const { shippingAddress } = req.body;
  const { cartId } = req.params;
  const { user } = req;

  // App settings
  const taxPrice = 0;
  const shippingPrice = 0;

  // 1) Get cart depend on cartId & check cart existance
  const cart = await Cart.findById(cartId).populate({
    path: "cartItems.product",
    select: "title description",
  });

  if (cart) {
    if (cart.cartItems.length === 0) {
      const error = new ApiError("You don't have any items in the cart!", 400);
      return next(error);
    }
  } else {
    const error = new ApiError(`There is no such cart with id ${cartId}`, 404);
    return next(error);
  }

  // 2) Get full address data && check existance
  const address = user.addresses.find((add) => add.alias === shippingAddress);
  if (!address) {
    const error = new ApiError(
      `There is no address called '${shippingAddress}' in your adresses list`,
      404
    );
    return next(error);
  }
  // 3) Get order price depend on cart price "Check if coupon apply"
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;
  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  // 4) Create stripe checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "egp",
          unit_amount: totalOrderPrice * 100,
          product_data: {
            name: req.user.name,
            // description: "",
          },
        },

        quantity: 1,
      },
    ],
    //  cart.cartItems.map((item) => {
    //   return {
    //     price_data: {
    //       currency: "egp",
    //       unit_amount: item.price * 100,
    //       product_data: {
    //         name: item.product.title,
    //         description: item.product.description,
    //         image: [item.product.imagecover],
    //       },
    //     },
    //     quantity: item.quantity,
    //   };
    // }),
    mode: "payment",
    success_url: `${req.protocol}://${req.get("host")}/orders`,
    cancel_url: `${req.protocol}://${req.get("host")}/cart`,
    customer_email: user.email,
    client_reference_id: cartId,
    metadata: { shippingAddress },
  });

  // 4) send session to response
  res.status(200).json({ status: "success", session });
});

// @desc Create Card order
const createCardOrder = async (session) => {
  const userEmail = session.customer_email;
  const { shippingAddress } = session.metadata;
  const cartId = session.client_reference_id;
  const orderPrice = session.amount_total / 100;

  // 1) Get cart and user
  const cart = await Cart.findById(cartId);
  const user = await User.findOne({ email: userEmail });

  // 2) Create order with paymentMethodType card
  const orderObj = {
    user: user._id,
    shippingAddress,
    cartItems: cart.cartItems,
    totalOrderPrice: orderPrice,
    paymentMethodType: "card",
    isPaid: true,
    paidAt: Date.now(),
  };
  const order = await Order.create(orderObj);

  // 3) After creating order, decrement product quantity, increment product sold
  if (order) {
    const productsIds = cart.cartItems.map((item) => item.product);
    const productsIndexesArr = cart.cartItems.map((item, index) => [
      item.product,
      index,
    ]);
    const productsIndexesObj = Object.fromEntries(productsIndexesArr);
    const cartItems = cart.cartItems;
    const products = await Product.find({
      _id: { $in: productsIds },
    });
    await products.map(async (p) => {
      p.quantity = p.quantity - cartItems[productsIndexesObj[p._id]].quantity;
      p.sold = p.sold + cartItems[productsIndexesObj[p._id]].quantity;
      await p.save();
    });

    // 4) Clear cart depend on cartId
    await Cart.findByIdAndDelete(cartId);
  }
};

// @desc    This webhook will run when stripe payment success paid
// @route   POST /webhook-checkout
// @access  Protected/User
exports.webhookCheckout = asyncHandler(async (req, res, next) => {
  // let event = request.body;
  const signature = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log("Webhook error...", err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === "checkout.session.completed") {
    //  Create order
    await createCardOrder(event.data.object);
  }

  return res.status(200).json({ received: true });
});
