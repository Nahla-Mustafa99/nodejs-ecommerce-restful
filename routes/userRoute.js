const express = require("express");

const {
  createUserValidator,
  getUserValidator,
  updateUserValidator,
  deleteUserValidator,
  changeUserPasswordValidator,
  updateLoggedUserValidator,
  updateLoggedUserPasswordValidator,
} = require("../utils/validators/userValidator");

const {
  getUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  changeUserPassword,
  getLoggedUserData,
  updateLoggedUserPassword,
  updateLoggedUserData,
  setUserImage,
  uploadUserImage,
} = require("../services/userService");

const { isAuth, isAllowedTo } = require("../services/authService");

const router = express.Router();

// Use this middlware first -> protect next routes (only for loggedIn(authenticated) users)
router.use(isAuth);

router.get("/getMe", getLoggedUserData, getUser);
router.put(
  "/updateMe",
  uploadUserImage,
  setUserImage,
  updateLoggedUserValidator,
  updateLoggedUserData
);
router.put(
  "/changeMyPassword",
  updateLoggedUserPasswordValidator,
  updateLoggedUserPassword
);

// Control access some routes: next routes (only for admin or manager accounts)
router.use(isAllowedTo("admin", "manager"));

router
  .route("/")
  .get(getUsers)
  .post(uploadUserImage, setUserImage, createUserValidator, createUser);

router.put(
  "/changePassword/:id",
  changeUserPasswordValidator,
  changeUserPassword
);

router
  .route("/:id")
  .get(getUserValidator, getUser)
  .put(uploadUserImage, setUserImage, updateUserValidator, updateUser)
  .delete(deleteUserValidator, deleteUser);

module.exports = router;
