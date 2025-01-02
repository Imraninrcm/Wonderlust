const express = require("express");
const router = express.Router();
const asyncWrap = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware");
const {
  addUsers,
  getSignUp,
  getLogin,
  login,
  logout,
} = require("../Controllers/users.js");

//sign up router route
router.route("/signup").get(getSignUp).post(asyncWrap(addUsers));

//login router route
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

router.get("/logout", logout);

module.exports = router;
