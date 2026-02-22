const express = require('express');
const router = express.Router();
const controller = require('../Controllers/adminController');
const tryCatch = require('../Middleware/tryCatch');
const checkAuth = require('../Middleware/checkAuth');

// =============================
// 🔐 ADMIN LOGIN (Public)
// =============================
router.post('/login', tryCatch(controller.login));


// =============================
// 🔒 PROTECTED ROUTES (Admin Only)
// =============================
router.use(checkAuth(process.env.ADMIN_ACCESS_TOKEN_SECRET));


// =============================
// 📊 DASHBOARD (NEW - Dynamic)
// =============================
router.get('/dashboard', tryCatch(controller.dashboard));


// =============================
// 👥 USERS
// =============================
router.get('/users', tryCatch(controller.getAllUsers));
router.get('/users/:id', tryCatch(controller.getUserById));


// =============================
// 📦 PRODUCTS
// =============================
router.get('/products/category', tryCatch(controller.getProductsByCategory));
router.get('/products', tryCatch(controller.getAllProducts));
router.get('/products/:id', tryCatch(controller.getProductById));
router.post('/products', tryCatch(controller.createProduct));
router.put('/products', tryCatch(controller.updateProduct));
router.delete('/products/:id', tryCatch(controller.deleteProduct));


// =============================
// 📦 ORDERS
// =============================
router.get('/orders', tryCatch(controller.getOrders));


// =============================
// 📊 STATS (Optional if needed separately)
// =============================
router.get('/stats', tryCatch(controller.getStats));


module.exports = router;