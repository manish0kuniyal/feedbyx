import React, { useState } from "react";

function loadScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Payment() {
  const [status, setStatus] = useState("idle");

  const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;
  const BACKEND_BASE = import.meta.env.VITE_BASE_URL;

  const createOrder = async (amount) => {
    const res = await fetch(`${BACKEND_BASE}api/payment/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });
    return res.json();
  };

  const verifyPayment = async (data) => {
    const res = await fetch(`${BACKEND_BASE}api/payment/verify-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  };

  const handlePayment = async () => {
    setStatus("loading");

    const sdkLoaded = await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );

    if (!sdkLoaded) {
      alert("Razorpay SDK failed to load");
      return;
    }

    const amount = 5; // ₹5000

    const order = await createOrder(amount);

    const options = {
      key: RAZORPAY_KEY,
      amount: order.amount,
      currency: "INR",
      name: "My App",
      description: "Payment",
      order_id: order.id,

      handler: async function (response) {
        const result = await verifyPayment(response);
        if (result.success) {
          alert("Payment Successful ✅");
          setStatus("success");
        } else {
          alert("Payment Verification Failed ❌");
          setStatus("failed");
        }
      },

      modal: {
        ondismiss: () => {
          setStatus("cancelled");
        },
      },

      prefill: {
        name: "Test User",
        email: "test@test.com",
        contact: "9999999999",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Razorpay Payment</h2>
      <button className=" font-bold   text-white rounded m-4 bg-green-600" onClick={handlePayment} style={{ padding: 12, fontSize: 16 }}>
        Pay ₹5
      </button>
      <p>Status: {status}</p>
    </div>
  );
}
