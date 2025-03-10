const Reviews = require("../models/reviews.js");
const Listing = require("../models/listing.js");

module.exports.addReview = async (req, res) => {
  let { id } = req.params;
  const list = await Listing.findById(id);
  if (!list) {
    req.flash("error", "Listing does not exist");
    res.redirect(`/listings/${id}`);
  }

  const newReview = new Reviews(req.body.review); // Use `req.body.review` directly
  newReview.author = req.user._id;
  console.log(newReview);
  list.reviews.push(newReview); // Push the new review into the listing's reviews array

  await newReview.save(); // Save the review to the database
  await list.save(); // Save the updated listing to the database
  req.flash("success", "Review Added!");
  res.redirect(`/listings/${id}`);
};

module.exports.deleteReview = async (req, res) => {
  let { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Reviews.findByIdAndDelete(reviewId);
  req.flash("success", "Review is deleted!");
  res.redirect(`/listings/${id}`);
};
