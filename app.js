const myObject = {};
if (myObject.NODE_ENV != "production") {
  require("dotenv").config({
    path: ".env",
    override: true,
    quiet: true,
    processEnv: myObject,
  });
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const user = require("./models/user.js");

const listingsRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const mongoUrl = myObject.ATLUSURL;
const secret = myObject.SECRET;
const port = myObject.PORT;
// MongoDB connection
async function main() {
  await mongoose.connect(mongoUrl);
  console.log("MongoDB connected successfully");
}
main().catch((err) => console.error("MongoDB connection error:", err));

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

const store = MongoStore.create({
  mongoUrl: mongoUrl,
  crypto: {
    secret: secret,
  },
  touchAfter: 24 * 3600,
});

store.on("error", function (e) {
  console.log("Session store error", e);
});
const sessionOption = {
  store,
  secret: secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 1000 * 3600 * 24 * 7,
    maxAge: 1000 * 3600 * 24 * 7,
    httpOnly: true,
  },
};

app.use(session(sessionOption));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(user.authenticate()));

passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// Home route
app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.all(/.*/, (req, res, next) => {
  console.log("Catch-all triggered for:", req.path);
  next(new ExpressError(404, "Page not found"));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error for debugging
  const { status = 500, message = "Something went wrong" } = err;
  res.status(status).render("error.ejs", { err });
});

// Server port
app.listen(port, () => {
  console.log(`Server is listening on port${port}`);
});
