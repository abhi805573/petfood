import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PetContext } from "../Context/Context";
import Button from "../Components/Button";
import toast from "react-hot-toast";
import { axios } from "../Utils/Axios";
import "../Styles/Details.css";
import "../Styles/Home.css";

export default function Details() {
  const { id } = useParams();
  const {
    fetchProductDetails,
    loginStatus,
    cart,
    addToCart,
  } = useContext(PetContext);

  const [item, setItem] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const product = await fetchProductDetails(id);
      setItem(product);
    };
    fetchData();
  }, [id, fetchProductDetails]);

  // 🔥 Load Razorpay Script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // 🔥 Buy Now (Corrected)
  const handleBuyNow = async () => {
    if (!loginStatus) {
      toast.error("Please login first");
      return;
    }

    if (!item) return;

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      toast.error("Razorpay SDK failed to load");
      return;
    }

    try {
      // ✅ Correct backend route (NO userID in URL)
      const { data } = await axios.post(`/api/users/payment`, {
        amount: item.price,
      });

      const { order, key } = data;

      const options = {
        key: key,
        amount: order.amount,
        currency: "INR",
        name: "PetFood Store",
        description: item.title,
        order_id: order.id,

        handler: async function (response) {
          try {
            await axios.post(`/api/users/verify-payment`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              products: [
                {
                  product: item._id,
                  quantity: 1,
                },
              ],
              total_amount: item.price,
            });

            toast.success("Payment Successful!");
            navigate("/orders");

          } catch (error) {
            toast.error("Payment verification failed");
          }
        },

        theme: {
          color: "#ed6335",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error) {
      toast.error("Payment failed");
    }
  };

  // 🛑 Loading protection
  if (!item) return <p className="text-center mt-5">Loading...</p>;

  // ✅ SAFE cart check
  const isInCart = cart?.some(
    (value) => value?.product?._id === id
  );

  return (
    <div className="details d-flex flex-column flex-md-row align-items-center pb-3">
      <div className="w-100 w-md-50 d-flex justify-content-center align-items-center">
        <img src={item.image} alt={item.title} />
      </div>

      <div className="d-flex flex-column w-100 w-md-50 text-black me-5 ms-5">
        <h1 className="fw-bold mb-3">{item.title}</h1>
        <h4 className="fw-bold mb-3">₹{item.price}</h4>

        <hr />

        <p className="mt-3 text-muted mb-4">{item.description}</p>

        <div className="d-flex align-items-center gap-3">

          {/* ADD TO CART */}
          <div>
            {isInCart ? (
              <Button
                rounded
                color="dark"
                className="det-button"
                onClick={() => navigate("/cart")}
              >
                Go to Cart
              </Button>
            ) : (
              <Button
                rounded
                color="dark"
                className="det-button"
                onClick={() =>
                  loginStatus
                    ? addToCart(item._id)
                    : toast.error("Sign in to your account")
                }
              >
                Add to Cart
              </Button>
            )}
          </div>

          {/* BUY NOW */}
          <div>
            <Button
              rounded
              className="det-button"
              style={{ backgroundColor: "#ed6335" }}
              onClick={handleBuyNow}
            >
              Buy Now
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}