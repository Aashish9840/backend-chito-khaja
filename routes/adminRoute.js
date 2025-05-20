const express = require("express");
const adminRoute = express.Router();
const userController = require("../controllers/userController");
const { userValidate, isAdmin } = require("../middleware/userValidate");
// all methods and route
adminRoute.post("/login", userController.adminLogin);
adminRoute.get("/users", userValidate, isAdmin, userController.getAllUsers);
adminRoute.get("/isAuth", userValidate, userController.isAuth);
adminRoute.delete(
  "/delete-user",
  userValidate,
  isAdmin,
  userController.deleteUser
);

adminRoute.put("/update-role", userController.roleUpdate);
adminRoute.get("/logout", userValidate, userController.logout);
adminRoute.get(
  "/userInformation",
  userValidate,
  userController.userInformation
);

adminRoute.put("/update-info", userValidate, userController.updateUserDetails);

module.exports = adminRoute;
