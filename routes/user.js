const express = require("express");
const router = express.Router();
const passport = require("passport");

const {
  getSignUp,
  getLogin,
  login,
  logout,
} = require("../Controllers/users.js");

const {
  saveRedirectUrl,
  OtpGenerator,
  sendOTPEmail,
} = require("../middleware");

// === SIGNUP (SEND OTP) ===
router
  .route("/signup")
  .get(getSignUp)
  .post((req, res) => {
    const { username, email, password } = req.body;

    // Generate OTP
    const otp = OtpGenerator();

    // Save temp user data & OTP in session
    req.session.tempUser = { username, email, password };
    req.session.otp = otp;
    req.session.otpExpires = Date.now() + 3 * 60 * 1000; // OTP valid for 5 minutes

    // Send OTP to user
    sendOTPEmail(email, otp);

    req.flash("success", `An OTP has been sent to your email: ${email}`);
    res.render("users/otpVerify.ejs", { email });
  });

// === VERIFY OTP & REGISTER USER ===
const user = require("../models/user");

router.post("/verify-otp", async (req, res) => {
  const { otp: userOtp } = req.body;

  if (
    !req.session.tempUser ||
    !req.session.otp ||
    !req.session.otpExpires ||
    Date.now() > req.session.otpExpires
  ) {
    req.flash("error", "OTP expired or session invalid. Please sign up again.");
    return res.redirect("/signup");
  }

  if (req.session.otp !== userOtp) {
    req.flash("error", "Invalid OTP. Try again.");
    return res.redirect("/signup");
  }

  try {
    const { username, email, password } = req.session.tempUser;
    const newUser = new user({ username, email });
    const registeredUser = await user.register(newUser, password);

    // Clear session data
    delete req.session.tempUser;
    delete req.session.otp;
    delete req.session.otpExpires;

    req.flash("success", "Account successfully created!");
    res.redirect("/login");
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
});

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
