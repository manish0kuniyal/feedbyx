"use client";
import { motion } from "framer-motion";

const plans = [
  { name: "Basic", price: "$9/mo", features: ["Feature A", "Feature B"] },
  { name: "Pro", price: "$29/mo", features: ["Feature A", "Feature B", "Feature C"] },
  { name: "Enterprise", price: "$99/mo", features: ["All Features", "Priority Support"] },
];

export default function PricingSection() {
  return (
  <section className="py-16 px-4 sm:px-8 bg-transparent">
  <h2 className="text-3xl font-bold text-center mb-12">Pricing Plans</h2>
  
  <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
    {plans.map((plan, idx) => (
      <motion.div
        key={idx}
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: idx * 0.2 }}
        className="flex flex-col justify-between p-6 rounded-2xl 
                   bg-gradient-to-b from-gray-950 via-gray-900 to-gray-800
                   bg-opacity-80 backdrop-blur-lg 
                   hover:shadow-lg transition"
      >
        <h3 className="text-xl font-semibold mb-4">{plan.name}</h3>
        <p className="text-2xl font-bold mb-6">{plan.price}</p>
        <ul className="flex-1 mb-6 text-gray-300 space-y-2">
          {plan.features.map((f, i) => (
            <li key={i}>✔ {f}</li>
          ))}
        </ul>
        <button className="bg-[var(--blue)] text-white px-6 py-3 rounded-lg hover:opacity-90 w-full">
          Choose Plan
        </button>
      </motion.div>
    ))}
  </div>
</section>


  );
}
