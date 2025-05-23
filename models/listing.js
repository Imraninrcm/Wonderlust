const mongoose = require("mongoose");
const Reviews = require("./reviews");
const User = require("./user");
const Schema = mongoose.Schema;

const listingSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true, // Removed `allow`
    },
    image: {
      url: String,
      filename: String,
    },
    price: {
      type: Number,
      min: [100, "At least 100 Rs/night"],
    },
    location: String,
    country: String,
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Reviews",
      },
    ],
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Reviews.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema); // Ensure the model name matches `Listing`
module.exports = Listing;
