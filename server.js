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

// Server is Listening on port...
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log("Listenning on port " + PORT);
});
