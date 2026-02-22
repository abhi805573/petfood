const express = require("express");
const router = express.Router();
const controller = require("../Controllers/userController");
const tryCatch = require("../Middleware/tryCatch");
const checkAuth = require("../Middleware/checkAuth");

// =============================
// 🔐 PUBLIC ROUTES
// =============================

router.post("/register", tryCatch(controller.register));
router.post("/login", tryCatch(controller.login));

router.get("/products", tryCatch(controller.getAllProducts));
router.get("/products/:id", tryCatch(controller.getProductById));

// =============================
// 🔒 PROTECTED ROUTES (USER)
// =============================

router.use(checkAuth(process.env.USER_ACCESS_TOKEN_SECRET));

// 🛒 CART
router.get("/cart", tryCatch(controller.showCart));
router.post("/cart", tryCatch(controller.addToCart));
router.put("/cart", tryCatch(controller.updateCartItemQuantity));
router.delete("/cart/:product", tryCatch(controller.removeFromCart));

// 💳 RAZORPAY - CREATE ORDER
router.post("/payment", tryCatch(controller.payment));

// 💳 RAZORPAY - VERIFY PAYMENT
router.post("/verify-payment", tryCatch(controller.verifyPayment));

// 📦 ORDERS
router.get("/orders", tryCatch(controller.showOrders));

module.exports = router;