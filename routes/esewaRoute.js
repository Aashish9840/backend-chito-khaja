const express = require("express");
const esewaRouter = express.Router();
const esewaController = require("../controllers/esewaController");

esewaRouter.get("/get-payment", esewaController.getPayment);

module.exports = esewaRouter;
