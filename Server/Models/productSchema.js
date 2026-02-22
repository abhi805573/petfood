const mongoose = require('mongoose');
const Joi = require('joi');

// =============================
// 🔥 MONGOOSE PRODUCT SCHEMA
// =============================
const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },

    description: {
      type: String,
      required: true,
      minlength: 10,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 1,
    },

    image: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      enum: ['Cat', 'Dog'],
    },
  },
  {
    timestamps: true,
  }
);

// =============================
// 🔥 JOI VALIDATION SCHEMA
// =============================
const productValidationSchema = Joi.object({
  id: Joi.string().optional(),

  title: Joi.string().min(3).required(),

  description: Joi.string().min(10).required(),

  price: Joi.number().min(1).required(),

  // 🔥 Removed strict URI validation to avoid 500 errors
  image: Joi.string().required(),

  category: Joi.string().valid('Cat', 'Dog').required(),
});

// =============================
// ✅ CREATE MODEL
// =============================
const Product = mongoose.model('Product', productSchema);

// =============================
// ✅ EXPORT PROPERLY (IMPORTANT)
// =============================
module.exports = {
  Product,
  productValidationSchema,
};