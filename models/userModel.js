const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cardData: { type: Object, default: {} },
  },
  { minimize: false }
);

const userModel = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = userModel;
