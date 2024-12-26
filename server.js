const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");

dotenv.config({ path: "config.env" });
const db_connection = require("./config/database");
const categoryRoutes = require("./routes/categoryRoute");
const ApiError = require("./utils/apiError");
const globalErrorHandler = require("./middlewares/errorMiddleware");
const subCategoryRoute = require("./routes/subCategoryRoute");
const brandRoute = require("./routes/brandRoute");
const productRoute = require("./routes/productRoute");
const userRoute = require("./routes/userRoute");
const authRoute = require("./routes/authRoute");

// Database connection...
db_connection();

// express app
const app = express();

// Middlewares...
// - Pasrsing json encoded text body
app.use(express.json());

// - Development purpose middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`We're on the ${process.env.NODE_ENV} mode `);
}

// Mount Routes...
app.use("/api/v1/categories", categoryRoutes);

app.use("/api/v1/subcategories", subCategoryRoute);

app.use("/api/v1/brands", brandRoute);

app.use("/api/v1/products", productRoute);

app.use("/api/v1/users", userRoute);

app.use("/api/v1/auth", authRoute);

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
