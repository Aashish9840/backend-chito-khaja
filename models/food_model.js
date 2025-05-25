const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  prize: { type: Number, required: true },
  image: { type: String, required: true },
  rating: { type: Number, default: 5 },
  category: { type: String, required: true },
});
const foodModel = mongoose.models.food || mongoose.model("food", foodSchema);

module.exports = foodModel;
