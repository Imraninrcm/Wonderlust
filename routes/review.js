const express = require("express");
const router = express.Router({ mergeParams: true });
const asyncWrap = require("../utils/wrapAsync.js");

const {
  validateReview,
  IsloggedIn,
  isReviewAuthor,
} = require("../middleware.js");
const { addReview, deleteReview } = require("../Controllers/review.js");

//reviews of listings
router.post("/", IsloggedIn, validateReview, asyncWrap(addReview));

router.delete("/:reviewId", isReviewAuthor, asyncWrap(deleteReview));

module.exports = router;
