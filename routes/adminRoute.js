const express = require("express");
const adminRoute = express.Router();
const userController = require("../controllers/userController");
const { isAdmin, adminValidate } = require("../middleware/userValidate");
// all methods and route
adminRoute.post("/login", userController.adminLogin);
adminRoute.get("/users", adminValidate, userController.getAllUsers);
adminRoute.get("/isAuth", adminValidate, userController.isAuth);
adminRoute.delete("/delete-user", adminValidate, userController.deleteUser);

adminRoute.put("/update-role", userController.roleUpdate);
adminRoute.get("/adminLogOut", adminValidate, userController.adminLogOut);
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
