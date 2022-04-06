const { Router } = require("express");
const authController = require("../RouterController/authController");
const { checkUser } = require("../Middlewares/AuthMiddleware/checkUser");
const router = Router();
router.post("/signup", authController.signup_post);
router.post("/login", authController.login_post);
router.get("/login", [checkUser], authController.login_get);
router.get("/logout", authController.logout_get);
module.exports = { router };
