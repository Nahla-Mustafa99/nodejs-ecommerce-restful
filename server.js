const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");

dotenv.config({ path: "config.env" });
const db_connection = require("./config/database");
const categoryRoutes = require("./routes/categoryRoute");

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
// Unhandled Routes
app.all("*", (req, res, next) => {
  // Create an error and send it to the error handling middleware...
  const error = new Error(`Can not find this route: ${req.originalUrl} `);
  next(error.message);
});

// -Global express error handling Middleware
app.use((err, req, res, next) => {
  res.status(400).json({ err });
});

// Server is Listening on port...
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log("Listenning on port " + PORT);
});
