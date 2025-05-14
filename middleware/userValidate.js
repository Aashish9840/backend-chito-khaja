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
module.exports = userValidate;
