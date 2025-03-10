const Joi = require("joi");

const listingSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  location: Joi.string().required(),
  country: Joi.string().required(),
  price: Joi.number().min(100).required(),
  image: Joi.object({
    url: Joi.string().uri().required(), // Ensure the URL is a valid URI
    filename: Joi.string().required(), // Validate that the filename is provided
  }).required(), // Ensure the image object is required
});

const reviewSchema = Joi.object({
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().required(),
});

module.exports = { listingSchema, reviewSchema };
