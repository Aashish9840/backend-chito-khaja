const express = require("express");
const foodRouter = express.Router();
const multer = require("multer");
const foodController = require("../controllers/foodController");

// file storage
const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    return cb(null, `${Date.now()}${file.originalname}`);
  },
});
const upload = multer({ storage: storage });
foodRouter.post("/add", upload.single("image"), foodController.addFoodItem);

module.exports = foodRouter;
