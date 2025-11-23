
import React, { useState } from "react";

function loadScript(src) {
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export default function Payment() {
  const [status, setStatus] = useState("idle");
  const [log, setLog] = useState([]);

  const append = (tag, obj) => {
    console.log(tag, obj);
    setLog((l) => [...l, { tag, obj: typeof obj === "object" ? JSON.stringify(obj) : String(obj) }]);
  };

  const RAZORPAY_KEY = "rzp_test_xxxxxxxxxxxxxx";
  const BACKEND_BASE = "http://localhost:5000";

  const createOrder = async (amount) => {
    append("[frontend] createOrder request", { amount });
    const res = await fetch(`${BACKEND_BASE}/api/payment/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });
    append("[frontend] createOrder httpStatus", res.status);
    const text = await res.text();
    append("[frontend] createOrder rawResponse", text);
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error("Invalid JSON from create-order: " + text);
    }
  };

  const verifyPayment = async (payload) => {
    append("[frontend] verifyPayment payload", payload);
    const res = await fetch(`${BACKEND_BASE}/api/payment/verify-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    append("[frontend] verifyPayment httpStatus", res.status);
    const json = await res.json().catch(async () => {
      const txt = await res.text();
      append("[frontend] verifyPayment non-json response", txt);
      throw new Error("Non-JSON response");
    });
    append("[frontend] verifyPayment response", json);
    return json;
  };

  const handlePayment = async () => {
    setStatus("starting");
    try {
      if (!RAZORPAY_KEY || RAZORPAY_KEY.includes("REPLACE_ME")) {
        setStatus("error");
        append("[error]", "Please set RAZORPAY_KEY in the component (replace placeholder).");
        return;
      }

      setStatus("loading-sdk");
      const ok = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      if (!ok) {
        setStatus("error");
        append("[error]", "Failed to load Razorpay SDK.");
        return;
      }

      setStatus("creating-order");
      const amount = 500; 
      const order = await createOrder(amount);

      if (!order || !order.id) {
        setStatus("error");
        append("[error]", "Order creation returned no order id.");
        return;
      }

      setStatus("opening-checkout");
      const options = {
        key: RAZORPAY_KEY,
        amount: order.amount,
        currency: order.currency,
        name: "Demo",
        description: "Demo Payment",
        order_id: order.id,
        handler: async (response) => {
          append("[handler] razorpay response", response);
          setStatus("verifying");
          try {
            const v = await verifyPayment(response);
            append("[handler] verify result", v);
            if (v.success) {
              setStatus("success");
            } else {
              setStatus("failed-verify");
            }
          } catch (err) {
            append("[handler] verify error", err.message || err);
            setStatus("error");
          }
        },
        modal: {
          ondismiss: function () {
            append("[handler] checkout dismissed", "user closed checkout");
            setStatus("dismissed");
          },
        },
        prefill: { name: "Test", email: "t@t.com", contact: "9999999999" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      append("[exception]", err.message || err);
      setStatus("error");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h3>Payment (hardcoded test)</h3>
      <p>Backend: <b>http://localhost:500</b> &nbsp; | &nbsp; Key: <b>{RAZORPAY_KEY}</b></p>
      <button onClick={handlePayment} style={{ padding: "8px 14px", fontSize: 16 }}>
        Pay ₹5000
      </button>

      <div style={{ marginTop: 12 }}>
        <b>Status:</b> {status}
        <div style={{ marginTop: 10 }}>
          <b>Log (latest first):</b>
          <div style={{ maxHeight: 300, overflow: "auto", background: "#111", color: "#ddd", padding: 8 }}>
            {log.slice().reverse().map((it, i) => (
              <div key={i} style={{ marginBottom: 6, fontFamily: "monospace", fontSize: 12 }}>
                <div style={{ color: "#6cf" }}>{it.tag}</div>
                <div>{it.obj}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
