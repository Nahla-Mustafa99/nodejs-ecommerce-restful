const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const path = require("path");

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
