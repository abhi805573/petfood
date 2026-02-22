import React, { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { axios } from "../Utils/Axios";

export default function SuccessPayment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hasRun = useRef(false); // prevent double execution in strict mode

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const confirmPayment = async () => {
      try {
        const session_id = searchParams.get("session_id");

        if (!session_id) {
          navigate("/cart");
          return;
        }

        // Call backend success API
        await axios.get(
          `/api/users/payment/success?session_id=${session_id}`
        );

        // Redirect to Orders page
        navigate("/orders");

      } catch (error) {
        console.log("Payment verification error:", error);
        navigate("/cart");
      }
    };

    confirmPayment();
  }, [searchParams, navigate]);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column"
      }}
    >
      <h2>Processing Payment...</h2>
      <img
        src="https://media.giphy.com/media/5GoVLqeAOo6PK/giphy.gif"
        alt="Processing"
        width="150"
      />
    </div>
  );
}