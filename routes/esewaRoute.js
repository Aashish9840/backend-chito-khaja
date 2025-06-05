const express = require("express");
const esewaRouter = express.Router();
const esewaController = require("../controllers/esewaController");

esewaRouter.get(`/get-payment`, esewaController.getPayment);
esewaRouter.get("/success", esewaController.successEsewa);
esewaRouter.get("/failure", esewaController.failureEsewa);

module.exports = esewaRouter;
