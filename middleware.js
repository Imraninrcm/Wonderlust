if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const Listing = require("./models/listing");
const Review = require("./models/reviews.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");

let IsloggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be signed in before proceeding!");
    return res.redirect("/login");
  }
  next();
};

let saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

let isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing.owner.equals(res.locals.currUser._id)) {
    req.flash(
      "error",
      "You don't have permision to edit/delete other's listings"
    );
    return res.redirect(`/listings/${id}`);
  }
  next();
};

//listing schema validate function
const validateListing = (req, res, next) => {
  console.log(req.body); // Log the request body
  if (!req.body.listing) {
    req.body.listing = req.body; // Wrap the body in a `listing` key if it's not already wrapped
  }

  // If the file is uploaded, create an image object with url and filename
  if (req.file) {
    req.body.listing.image = {
      url: req.file.path, // Cloudinary URL or file path
      filename: req.file.filename, // Uploaded file name
    };
  } else {
    req.body.listing.image = { url: "", filename: "" }; // Empty object if no file is uploaded
  }

  const { error } = listingSchema.validate(req.body.listing);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

//review schema validate function
const validateReview = (req, res, next) => {
  console.log(req.body); // Log the request body
  const { error } = reviewSchema.validate(req.body.review); // Use `req.body.review`
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

let isReviewAuthor = async (req, res, next) => {
  let { id, reviewId } = req.params;
  let review = await Review.findById(reviewId);
  if (!review.author.equals(res.locals.currUser._id)) {
    req.flash("error", "You don't have permision to delete other's Reviews");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

const formatDate = (date, formatStyle = "MM DD YYYY") => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  if (formatStyle === "DD MMM YYYY") {
    return `${day} ${month}, ${year}`;
  } else {
    return `${month} ${day}, ${year}`;
  }
};

const OtpGenerator = () => {
  return otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function sendOTPEmail(toEmail, otp) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: "OTP from Wanderlust",
    text: `Your OTP for Wanderlust is: ${otp}. Do not share it with anyone.`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error sending OTP email:", error);
    } else {
      console.log("OTP email sent:", info.response);
    }
  });
}

module.exports = {
  IsloggedIn,
  saveRedirectUrl,
  isOwner,
  validateListing,
  validateReview,
  isReviewAuthor,
  formatDate,
  OtpGenerator,
  sendOTPEmail,
};
