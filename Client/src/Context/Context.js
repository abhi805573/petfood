import React, { createContext, useState, useEffect } from "react";
import { axios } from "../Utils/Axios";
import toast from "react-hot-toast";

const PetContext = createContext();

const PetProvider = ({ children }) => {

  const [loginStatus, setLoginStatus] = useState(
    !!localStorage.getItem("jwt_token")
  );

  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  // =============================
  // Fetch Products
  // =============================

  const fetchProducts = async () => {
    try {
      const response = await axios.get("/api/users/products");
      setProducts(response.data.data || []);
    } catch (error) {
      toast.error("Failed to fetch products");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // =============================
  // Fetch Single Product
  // =============================

  const fetchProductDetails = async (id) => {
    try {
      const response = await axios.get(`/api/users/products/${id}`);
      return response.data.data;
    } catch (error) {
      toast.error("Failed to fetch product");
    }
  };

  // =============================
  // CART
  // =============================

  const fetchCart = async () => {
    try {
      const response = await axios.get(`/api/users/cart`);

      // ✅ Remove invalid products (VERY IMPORTANT)
      const cleanCart = (response.data.cart || []).filter(
        (item) => item?.product
      );

      setCart(cleanCart);

    } catch (error) {
      console.log("Cart skipped (admin or route not available)");
      setCart([]);
    }
  };

  useEffect(() => {
    const role = localStorage.getItem("role");

    if (loginStatus && role === "user") {
      fetchCart();
    } else {
      setCart([]);
    }
  }, [loginStatus]);

  // =============================
  // Add To Cart
  // =============================

  const addToCart = async (productID) => {
    const role = localStorage.getItem("role");

    if (!loginStatus || role !== "user")
      return toast.error("Please login as user");

    try {
      await axios.post(`/api/users/cart`, {
        productId: productID,
        quantity: 1,
      });

      await fetchCart();
      toast.success("Added to cart");
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  // =============================
  // Update Quantity
  // =============================

  const handleQuantity = async (productID, change) => {
    const role = localStorage.getItem("role");
    if (role !== "user") return;

    const item = cart.find(
      (item) => item?.product?._id === productID
    );

    if (!item) return;

    const newQuantity = item.quantity + change;

    if (newQuantity <= 0) {
      return removeFromCart(productID);
    }

    try {
      await axios.put(`/api/users/cart`, {
        productId: productID,
        quantity: newQuantity,
      });

      await fetchCart();
    } catch (error) {
      toast.error("Failed to update quantity");
    }
  };

  // =============================
  // Remove Item
  // =============================

  const removeFromCart = async (productID) => {
    const role = localStorage.getItem("role");
    if (role !== "user") return;

    try {
      await axios.delete(`/api/users/cart/${productID}`);
      await fetchCart();
      toast.success("Removed from cart");
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  // =============================
  // ✅ FIXED TOTAL CALCULATION
  // =============================

  const totalPrice = cart.reduce((acc, item) => {
    const price = item?.product?.price || 0;
    return acc + price * item.quantity;
  }, 0);

  // =============================
  // Razorpay Checkout
  // =============================

  const handleCheckout = async () => {
    const role = localStorage.getItem("role");

    if (!loginStatus || role !== "user")
      return toast.error("Only users can checkout");

    if (!cart.length)
      return toast.error("Cart is empty");

    try {
      const { data } = await axios.post(`/api/users/payment`, {
        amount: totalPrice,
      });

      const { order, key } = data;

      const options = {
        key,
        amount: order.amount,
        currency: "INR",
        name: "Pet Food Store",
        description: "Cart Payment",
        order_id: order.id,

        handler: async function (response) {
          try {
            const products = cart.map((item) => ({
              product: item.product._id,
              quantity: item.quantity,
            }));

            await axios.post(`/api/users/verify-payment`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              products,
              total_amount: totalPrice,
            });

            toast.success("Payment Successful 🎉");
            await fetchCart();
            window.location.href = "/orders";

          } catch (error) {
            toast.error("Payment verification failed");
          }
        },

        theme: { color: "#ed6335" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      toast.error("Payment failed");
    }
  };

  const handlePrice = (price) =>
    `₹${Number(price || 0).toLocaleString("en-IN")}`;

  return (
    <PetContext.Provider
      value={{
        products,
        fetchProducts,
        fetchProductDetails,
        fetchCart,
        addToCart,
        handleQuantity,
        removeFromCart,
        handleCheckout,
        cart,
        loginStatus,
        setLoginStatus,
        handlePrice,
        totalPrice,
      }}
    >
      {children}
    </PetContext.Provider>
  );
};

export { PetContext, PetProvider };