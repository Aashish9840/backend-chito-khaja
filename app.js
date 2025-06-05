const express = require("express");
require("dotenv").config();
const cors = require("cors");
const cookie_parser = require("cookie-parser");
const connectMongo = require("./configuration/mongoDBConnection");
const foodRouter = require("./routes/foodRoutes");
const userRouter = require("./routes/userRoute");
const cartRouter = require("./routes/cartRouter");
const orderRouter = require("./routes/orderRoute");
const adminRoute = require("./routes/adminRoute");
const esewaRouter = require("./routes/esewaRoute");

const app = express();

// mongoDB funtion call

connectMongo();
//middleware
app.use(cookie_parser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cors());

//api-end-point for food Model
app.use("/api/food", foodRouter);

// end point for user Model
app.use("/api/user", userRouter);

// end point for admin model

app.use("/api/admin", adminRoute);
// cart details api

app.use("/api/cart", cartRouter);

// order Router api

app.use("/api/order", orderRouter);
// access image
app.use("/images", express.static("uploads"));

// payment api
app.use("/api/payement/e-sewa", esewaRouter);

const Port = process.env.APP_PORT || 4000;
app.listen(Port, () => {
  console.log(`Server is running in localhost:${Port}`);
});
