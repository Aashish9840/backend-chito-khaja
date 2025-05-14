const userModel = require("../models/userModel");

exports.addCart = async (req, res) => {
  try {
    const { userId, foodId, name, quantity, prize } = req.body;

    if (!foodId || !name || !quantity || !prize) {
      return res.status(400).json({ message: "food details are required" });
    }
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const cart = user.cardData;
    console.log(cart, "cart items");
    const existItem = cart?.find((element) => element.id === foodId);

    if (existItem) {
      existItem.quantity += Number(quantity);
    } else {
      await cart.push({
        name: name,
        id: foodId,
        quantity: Number(quantity),
        prize: prize,
      });
    }
    await user.save();
    return res.status(200).json({ message: "items added to cart" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { foodId, userId, quantity } = req.body;
    if (!foodId || !quantity) {
      return res.status(400).json({ message: "Food details are required" });
    }
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const cart = user.cardData;

    const exist = cart.find((element) => element.id === foodId);

    if (!exist) {
      return res.status(400).json({ message: "Food item is not found" });
    }
    if (exist.quantity > 0) {
      exist.quantity -= Number(quantity);
      await user.save();
      return res
        .status(200)
        .json({ message: "Food is successfully removed from cart" });
    } else {
      return res
        .status(400)
        .json({ message: "there is no food to remove from card" });
    }
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.getCartData = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }

    const data = user.cardData;
    return res.status(200).json({ success: true, data: data });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
