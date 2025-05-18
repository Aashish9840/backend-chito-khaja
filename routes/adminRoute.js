const express = require("express");
const adminRoute = express.Router();
const userController = require("../controllers/userController");
const { userValidate, isAdmin } = require("../middleware/userValidate");

adminRoute.post("/login", userController.adminLogin);
adminRoute.get("/users", userValidate, isAdmin, userController.getAllUsers);
adminRoute.get("/isAuth", userValidate, userController.isAuth);
adminRoute.delete(
  "/delete-user",
  userValidate,
  isAdmin,
  userController.deleteUser
);

module.exports = adminRoute;
