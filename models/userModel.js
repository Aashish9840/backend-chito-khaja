const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin", "staff"], default: "user" },
    phone: { type: Number, default: "" },
    address: { type: String, default: "" },
    date: { type: Date, default: "" },
    country: { type: String, default: "" },
    education: { type: String, default: "" },
    gener: { type: String, default: "" },
    married: { type: String, default: "" },
    cardData: {
      type: [
        {
          id: String,
          name: String,
          prize: Number,
          quantity: Number,
        },
      ],
      default: [],
    },
  },
  { minimize: false }
);

const userModel = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = userModel;
