const { User, userRegisterSchema, userLoginSchema } = require("../Models/userSchema");
const { Product } = require("../Models/productSchema");
const Order = require("../Models/orderSchema");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports = {

  // ================= PRODUCTS =================

  getAllProducts: async (req, res) => {
    try {
      const products = await Product.find();
      return res.status(200).json({ status: "success", data: products });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to fetch products" });
    }
  },

  getProductById: async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product)
        return res.status(404).json({ message: "Product not found" });

      return res.status(200).json({ status: "success", data: product });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to fetch product" });
    }
  },

  // ================= LOGIN =================

  login: async (req, res) => {
    try {
      const { error, value } = userLoginSchema.validate(req.body);
      if (error)
        return res.status(400).json({ message: error.details[0].message });

      const { email, password } = value;

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user)
        return res.status(401).json({ message: "Email not found." });

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch)
        return res.status(401).json({ message: "Incorrect password." });

      const accessToken = jwt.sign(
        { userID: user._id, role: "user" },
        process.env.USER_ACCESS_TOKEN_SECRET,
        { expiresIn: "1d" }
      );

      return res.status(200).json({
        status: "success",
        message: "User logged in successfully",
        data: {
          jwt_token: accessToken,
          name: user.name,
          role: "user",
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Login failed" });
    }
  },

  // ================= CART =================

  showCart: async (req, res) => {
    try {
      const user = await User.findById(req.user.userID)
        .populate("cart.product");

      if (!user)
        return res.status(404).json({ message: "User not found" });

      return res.status(200).json({
        status: "success",
        cart: user.cart,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to fetch cart" });
    }
  },

  addToCart: async (req, res) => {
    try {
      const { productId, quantity } = req.body;

      const user = await User.findById(req.user.userID);
      if (!user)
        return res.status(404).json({ message: "User not found" });

      const existingItem = user.cart.find(
        (item) => item.product.toString() === productId
      );

      const qty = quantity && quantity > 0 ? quantity : 1;

      if (existingItem) {
        existingItem.quantity += qty;
      } else {
        user.cart.push({ product: productId, quantity: qty });
      }

      await user.save();

      return res.status(200).json({
        status: "success",
        message: "Added to cart",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Add to cart failed" });
    }
  },

  updateCartItemQuantity: async (req, res) => {
    try {
      const { productId, quantity } = req.body;

      const user = await User.findById(req.user.userID);
      if (!user)
        return res.status(404).json({ message: "User not found" });

      const item = user.cart.find(
        (item) => item.product.toString() === productId
      );

      if (!item)
        return res.status(404).json({ message: "Item not found" });

      if (quantity <= 0) {
        user.cart = user.cart.filter(
          (item) => item.product.toString() !== productId
        );
      } else {
        item.quantity = quantity;
      }

      await user.save();

      return res.status(200).json({
        status: "success",
        message: "Cart updated successfully",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to update cart" });
    }
  },

  removeFromCart: async (req, res) => {
    try {
      const user = await User.findById(req.user.userID);
      if (!user)
        return res.status(404).json({ message: "User not found" });

      user.cart = user.cart.filter(
        (item) => item.product.toString() !== req.params.product
      );

      await user.save();

      return res.status(200).json({
        status: "success",
        message: "Item removed from cart",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Remove failed" });
    }
  },

  // ================= PAYMENT =================

  payment: async (req, res) => {
    try {
      console.log("Incoming payment body:", req.body);

      const { amount } = req.body;

      if (!amount || isNaN(amount)) {
        return res.status(400).json({
          message: "Invalid amount received",
        });
      }

      const options = {
        amount: Number(amount) * 100,
        currency: "INR",
        receipt: "receipt_" + Date.now(),
      };

      const order = await razorpay.orders.create(options);

      return res.status(200).json({
        status: "success",
        order,
        key: process.env.RAZORPAY_KEY_ID,
      });

    } catch (error) {
      console.error("RAZORPAY ERROR:", error);
      return res.status(500).json({
        message: "Failed to create Razorpay order",
        error: error.message,
      });
    }
  },

  // ================= VERIFY PAYMENT =================

  verifyPayment: async (req, res) => {
    try {
      const userID = req.user.userID;

      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        products,
        total_amount,
      } = req.body;

      const generated_signature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest("hex");

      if (generated_signature !== razorpay_signature) {
        return res.status(400).json({
          message: "Payment verification failed",
        });
      }

      const newOrder = await Order.create({
        user: userID,
        products,
        total_amount,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        payment_status: "Paid",
      });

      await User.findByIdAndUpdate(userID, { cart: [] });

      return res.status(200).json({
        status: "success",
        message: "Payment successful & order saved",
        data: newOrder,
      });

    } catch (error) {
      console.error("VERIFY ERROR:", error);
      return res.status(500).json({
        message: "Payment verification failed",
      });
    }
  },

  // ================= SHOW ORDERS =================

  showOrders: async (req, res) => {
    try {
      const orders = await Order.find({ user: req.user.userID })
        .populate("products.product")
        .sort({ createdAt: -1 });

      return res.status(200).json({
        status: "success",
        data: orders,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to fetch orders" });
    }
  },
};