const foodModel = require("../models/food_model");

exports.addFoodItem = async (req, res) => {
  let image_filename = `${req.file.filename}`;
  const { name, description, image, category, prize } = req.body;
  console.log(name, description, category, prize);
  if (!req.file) {
    return res.status(400).json({ message: "Image file is required" });
  }
  if (!name || !description || !category || !prize) {
    res.status(400).json({ message: "All food information is required" });
  }

  try {
    const food = new foodModel({
      name,
      description,
      image: image_filename,
      category,
      prize,
    });
    await food.save();
    return res.json({
      success: true,
      message: "New food item is successfully created",
    });
  } catch (error) {
    res.json({ message: error.message });
  }
};
