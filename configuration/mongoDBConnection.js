const mongoose = require("mongoose");
require("dotenv").config();
console.log(process.env.MONGODB_STRING)
const connectMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_STRING);
    console.log("mongodb is connected");
  } catch (error) {
    console.log("error in mongo connection:", error);
  }
};
module.exports = connectMongo;
