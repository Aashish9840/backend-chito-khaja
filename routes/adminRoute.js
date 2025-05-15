const express = require("express");
const adminRoute = express.Router();
const userController = require("../controllers/userController");
const { userValidate, isAdmin } = require("../middleware/userValidate");

adminRoute.post("/login", userController.adminLogin);
adminRoute.get(
  "/admin/users",
  userValidate,
  isAdmin,
  userController.getAllUsers
);

module.exports = adminRoute;
