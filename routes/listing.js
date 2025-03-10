const express = require("express");
const router = express.Router();
const asyncWrap = require("../utils/wrapAsync.js");
const { IsloggedIn, isOwner, validateListing } = require("../middleware.js");
const Listing = require("../models/listing.js");
const {
  index,
  renderNewForm,
  showListing,
  AddListing,
  editListing,
  deleteListing,
} = require("../Controllers/listing.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

//home router route
router.route("/").get(asyncWrap(index)).post(
  IsloggedIn,
  upload.single("listing[image]"),
  validateListing,

  asyncWrap(AddListing)
);

//new router route
router.route("/new").get(IsloggedIn, renderNewForm);

//router route :id
router
  .route("/:id")
  .get(asyncWrap(showListing))
  .put(
    IsloggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    asyncWrap(editListing)
  )
  .delete(IsloggedIn, isOwner, asyncWrap(deleteListing));

// Edit listing form route
router.get(
  "/:id/edit",
  IsloggedIn,
  isOwner,
  asyncWrap(async (req, res) => {
    let { id } = req.params;
    const list = await Listing.findById(id);
    if (!list) {
      req.flash("error", "Listing you have requested doesn't exist");
      res.redirect("/listings");
    }
    let originalUrl = list.image.url;
    originalUrl = originalUrl.replace("/upload", "/upload/h_300,w_250");

    res.render("listings/edit.ejs", { list, originalUrl });
  })
);

module.exports = router;
