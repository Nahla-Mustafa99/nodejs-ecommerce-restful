const mongoose = require("mongoose");

const db_connection = () => {
  mongoose.connect(process.env.DB_URI).then((connectionClient) => {
    console.log(
      "Successfully connected to the database, host: ",
      connectionClient.connection.host
    );
  });
  // .catch((err) => {
  //   console.log("There'is an error on connection to the database: ", err);
  //   process.exit(1);
  // });
};

module.exports = db_connection;
