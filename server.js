const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const path = require("path");
const hpp = require("hpp");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const compression = require("compression");

dotenv.config({ path: "config.env" });
const db_connection = require("./config/database");
const ApiError = require("./utils/apiError");
const globalErrorHandler = require("./middlewares/errorMiddleware");

const { webhookCheckout } = require("./services/orderService");
const mountRoutes = require("./routes");

// Database connection...
db_connection();

// express app
const app = express();

// Help secure the app by setting HTTP response headers.
app.use(helmet());

// Enable cors
app.use(cors());
// Enable cors for "pre-flight" requests
app.use("*", cors());

// compress all responses
app.use(compression());

// Checkout webhook
app.post(
  "/webhook-checkout",
  express.raw({ type: "application/json" }),
  webhookCheckout
);

// Middlewares...
// - Pasrsing json encoded text body
app.use(express.json());
app.use(express.static(path.join(__dirname, "uploads")));

// - Development purpose middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`We're on the ${process.env.NODE_ENV} mode `);
}

// Middleware to protect against HTTP Parameter Pollution attacks
app.use(
  hpp({
    whitelist: [
      "price",
      "sold",
      "quantity",
      "ratingsAverage",
      "ratingsQuantity",
    ],
  })
);

// Apply the rate limiting middleware to all requests
app.use(
  "/api",
  rateLimit({
    // To limit repeated requests: limit each IP to 100 requests per `window` (per 15 minutes).
    windowMs: 15 * 60 * 1000, // 15m
    limit: 100, // 100 requests per 15m per window
    // response to return after limit is reached
    message:
      "Too many request created from this IP, please try again after an hour",
  })
);

// Mount Routes...
mountRoutes(app);

// Unhandled Routes
app.all("*", (req, res, next) => {
  // Create an error and send it to the error handling middleware...
  const error = new ApiError(
    `Can not find this route: ${req.originalUrl} `,
    400
  );
  next(error);
});

// - Global "express" error handling Middleware
app.use(globalErrorHandler);

// Server is Listening on port...
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
  console.log("Listenning on port " + PORT);
});

// Handling rejections/errors outside express..
process.on("unhandledRejection", (err) => {
  console.log(
    `unhandled Rejection Error=> Error name: ${err.name}, message: ${err.message}`
  );
  server.close(() => {
    console.log("Shutting down..");
    process.exit(1);
  });
});
