const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    // 🔹 User who placed order
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🔹 Products with quantity
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
      },
    ],

    // 🔹 Total amount (Number, not String)
    total_amount: {
      type: Number,
      required: true,
    },

    // 🔹 Razorpay Details
    razorpay_order_id: {
      type: String,
      required: true,
    },

    razorpay_payment_id: {
      type: String,
      required: true,
    },

    razorpay_signature: {
      type: String,
      required: true,
    },

    // 🔹 Payment status
    payment_status: {
      type: String,
      default: "Paid",
    },
  },
  {
    timestamps: true, // automatically adds createdAt & updatedAt
  }
);

module.exports = mongoose.model("Order", orderSchema);