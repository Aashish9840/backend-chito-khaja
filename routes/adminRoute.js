const express = require("express");
const adminRoute = express.Router();
const userController = require("../controllers/userController");
const { isAdmin, adminValidate } = require("../middleware/userValidate");
// all methods and route
adminRoute.post("/login", userController.adminLogin);
adminRoute.get("/users", adminValidate, isAdmin, userController.getAllUsers);
adminRoute.get("/isAuth", adminValidate, userController.isAuth);
adminRoute.delete(
  "/delete-user",
  adminValidate,
  isAdmin,
  userController.deleteUser
);

adminRoute.put("/update-role", userController.roleUpdate);
adminRoute.get("/logout", adminValidate, userController.logout);
adminRoute.get(
  "/userInformation",
  adminValidate,
  userController.userInformation
);

adminRoute.put("/update-info", adminValidate, userController.updateUserDetails);
adminRoute.post(
  "/update-password",
  adminValidate,
  userController.changePassword
);

module.exports = adminRoute;
