const user = require("../models/user");
const { OtpGenerator, sendOTPEmail } = require("../middleware");

module.exports.getSignUp = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.addUser = (req, res) => {
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
};

module.exports.verifyOtp = async (req, res) => {
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
    console.log(registeredUser);
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
};

module.exports.getLogin = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
  try {
    req.flash("success", `Welcome to Wonderlust! @${req.body.username}`);
    let redirectUrl = res.locals.redirectUrl || "/";
    res.redirect(redirectUrl);
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/login");
  }
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      next(err);
    }
    req.flash("success", "You are logged out! ");
    res.redirect("/");
  });
};
