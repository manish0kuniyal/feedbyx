import React, { useState, useEffect } from "react";

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
  const [plan, setPlan] = useState(null);

  const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;
  const BACKEND_BASE = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    fetch(`${BACKEND_BASE}api/payment/debug`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.plans.length > 0) {
          setPlan(data.plans[0]);
        }
      });
  }, []);

  const createOrder = async () => {
    const res = await fetch(`${BACKEND_BASE}api/payment/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        planId: plan._id,
        billingCycle: "monthly",
        userId: "test-user-123",
      }),
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
      alert("SDK failed to load");
      return;
    }

    const order = await createOrder();

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
          alert("Payment Failed ❌");
          setStatus("failed");
        }
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  if (!plan) return <p>Loading plan...</p>;

  return (
    <div style={{ padding: 40 }}>
      <h2>{plan.name} Plan</h2>
      <button onClick={handlePayment}>Pay ₹{plan.monthlyPrice}</button>
      <p>Status: {status}</p>
    </div>
  );
}
