const express = require("express");
const authController = require("./auth.controller");

const router = express.Router();

module.exports = function authRoutes() {
  router.post("/registration", authController.registration);
  router.post("/login", authController.login);
  return router;
};
