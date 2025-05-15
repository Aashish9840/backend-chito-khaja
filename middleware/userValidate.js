const jwt = require("jsonwebtoken");
require("dotenv").config();
const userModel = require("../models/userModel");
const userValidate = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(400).json({ message: "Cookies not found" });
    }
    const decodeToken = jwt.verify(token, process.env.SECRET_KEY);

    const users = await userModel.findById(decodeToken?.id);
    if (decodeToken.id && users) {
      req.user = users;
      req.body = req.body || {};
      req.body.userId = decodeToken.id;
      next();
    } else {
      return res.status(400).json({ message: "Not authorized. Login Again" });
    }
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Access denied: Admins only" });
  }
  next();
};

module.exports = {
  userValidate,
  isAdmin,
};
