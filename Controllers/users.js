const user = require("../models/user");
module.exports.getSignUp = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.addUsers = async (req, res) => {
  try {
    let { username, email, password } = req.body;
    const newuser = new user({ email, username });
    const registerUser = await user.register(newuser, password);
    console.log(registerUser);
    req.flash("success", "Account Successfully Created");
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
  req.flash("success", "Welcome to Wonderlust!.");
  let redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      next(err);
    }
    req.flash("success", "You are logged out!");
    res.redirect("/");
  });
};
