const express = require("express");
const router = express.Router();
const passport = require("passport");

const {
  getSignUp,
  getLogin,
  login,
  logout,
  addUser,
  verifyOtp,
} = require("../Controllers/users.js");

const { saveRedirectUrl } = require("../middleware");

// === SIGNUP ===
router.route("/signup").get(getSignUp).post(addUser);
router.route("/verify-otp").post(verifyOtp);

// === LOGIN ===
router
  .route("/login")
  .get(getLogin)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    login
  );

// === LOGOUT ===
router.get("/logout", logout);

module.exports = router;
