const express = require("express");

const {
  createAddress,
  getUserAddresses,
  getAddress,
  deleteAddress,
  updateAddress,
} = require("../services/addressService");

const { isAuth, isAllowedTo } = require("../services/authService");

const {
  createAddressValidator,
  updateAddressValidator,
  addressIdValidator,
} = require("../utils/validators/addressValidator");

const router = express.Router();

router.use(isAuth, isAllowedTo("user"));

router
  .route("/")
  .get(getUserAddresses)
  .post(createAddressValidator, createAddress);

router
  .route("/:addressId")
  .get(addressIdValidator, getAddress)
  .put(updateAddressValidator, updateAddress)
  .delete(addressIdValidator, deleteAddress);

module.exports = router;
