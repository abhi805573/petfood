const { User } = require('../Models/userSchema');
const { Product, productValidationSchema } = require('../Models/productSchema');
const Order = require('../Models/orderSchema');
const jwt = require('jsonwebtoken');

module.exports = {

  // =============================
  // 🔐 ADMIN LOGIN
  // =============================
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (
        email !== process.env.ADMIN_EMAIL ||
        password !== process.env.ADMIN_PASSWORD
      ) {
        return res.status(401).json({
          message: 'Access denied. Incorrect email or password.',
        });
      }

      const payload = { email, role: "admin" };

      const accessToken = jwt.sign(
        payload,
        process.env.ADMIN_ACCESS_TOKEN_SECRET,
        { expiresIn: '1d' } // Increased expiry
      );

      return res.status(200).json({
        status: 'success',
        message: 'Admin logged in successfully.',
        data: {
          jwt_token: accessToken,
          name: process.env.ADMIN_NAME,
          role: "admin",
        },
      });

    } catch (error) {
      return res.status(500).json({
        message: 'Admin login failed',
      });
    }
  },

  // =============================
  // 📊 DASHBOARD (🔥 NEW - NO HARDCODE)
  // =============================
  dashboard: async (req, res) => {
    try {
      if (req.user?.role !== "admin")
        return res.status(403).json({ message: "Forbidden" });

      const totalOrders = await Order.countDocuments();

      const orders = await Order.find();

      const totalRevenue = orders.reduce(
        (acc, order) => acc + Number(order.total_amount || 0),
        0
      );

      const totalProductsSold = orders.reduce(
        (acc, order) => acc + (order.products?.length || 0),
        0
      );

      const recentUsers = await User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name email");

      const recentProducts = await Product.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("category title price");

      return res.status(200).json({
        status: 'success',
        data: {
          totalOrders,
          totalRevenue,
          totalProductsSold,
          recentUsers,
          recentProducts,
        },
      });

    } catch (error) {
      return res.status(500).json({ message: 'Failed to load dashboard' });
    }
  },

  // =============================
  // 👥 GET ALL USERS
  // =============================
  getAllUsers: async (req, res) => {
    try {
      if (req.user?.role !== "admin")
        return res.status(403).json({ message: "Forbidden" });

      const users = await User.find();

      return res.status(200).json({
        status: 'success',
        data: users,
      });
    } catch (error) {
      return res.status(500).json({ message: 'Failed to fetch users' });
    }
  },

  // =============================
  // 📦 GET ALL PRODUCTS
  // =============================
  getAllProducts: async (req, res) => {
    try {
      const products = await Product.find();

      return res.status(200).json({
        status: 'success',
        data: products,
      });
    } catch (error) {
      return res.status(500).json({ message: 'Failed to fetch products' });
    }
  },

  // =============================
  // ➕ CREATE PRODUCT
  // =============================
  createProduct: async (req, res) => {
    try {
      if (req.user?.role !== "admin")
        return res.status(403).json({ message: "Forbidden" });

      const { error, value } = productValidationSchema.validate(req.body);

      if (error)
        return res.status(400).json({ message: error.details[0].message });

      const newProduct = await Product.create(value);

      return res.status(201).json({
        status: 'success',
        message: 'Product created successfully.',
        data: newProduct,
      });

    } catch (error) {
      return res.status(500).json({ message: 'Failed to create product' });
    }
  },

  // =============================
  // ✏ UPDATE PRODUCT
  // =============================
  updateProduct: async (req, res) => {
    try {
      if (req.user?.role !== "admin")
        return res.status(403).json({ message: "Forbidden" });

      const { error, value } = productValidationSchema.validate(req.body);

      if (error)
        return res.status(400).json({ message: error.details[0].message });

      const updatedProduct = await Product.findByIdAndUpdate(
        value.id,
        value,
        { new: true }
      );

      if (!updatedProduct)
        return res.status(404).json({ message: 'Product not found' });

      return res.status(200).json({
        status: 'success',
        message: 'Product updated successfully.',
        data: updatedProduct,
      });

    } catch (error) {
      return res.status(500).json({ message: 'Failed to update product' });
    }
  },

  // =============================
  // ❌ DELETE PRODUCT
  // =============================
  deleteProduct: async (req, res) => {
    try {
      if (req.user?.role !== "admin")
        return res.status(403).json({ message: "Forbidden" });

      const deleted = await Product.findByIdAndDelete(req.params.id);

      if (!deleted)
        return res.status(404).json({ message: 'Product not found' });

      return res.status(200).json({
        status: 'success',
        message: 'Product deleted successfully.',
      });

    } catch (error) {
      return res.status(500).json({ message: 'Failed to delete product' });
    }
  },

  // =============================
  // 📦 GET ORDERS
  // =============================
  getOrders: async (req, res) => {
    try {
      if (req.user?.role !== "admin")
        return res.status(403).json({ message: "Forbidden" });

      const orders = await Order.find();

      return res.status(200).json({
        status: 'success',
        data: orders,
      });

    } catch (error) {
      return res.status(500).json({ message: 'Failed to fetch orders' });
    }
  },

};