"use client";
import { motion } from "framer-motion";
const plans = [
  {
    name: "Free",
    price: "₹0/mo",
    features: [
      "Create up to 2 forms",
      "30 responses per form",
      "Basic analytics dashboard",
      "Feedbyx branding",
    ],
    color: "from-blue-400/3 to-blue-500/1",
    glow: "bg-blue-400/10",
  },
  {
    name: "Pro",
    price: "₹49/mo",
    features: [
      "Create up to 4 forms",
      "100 responses per form",
      "Advanced analytics & insights",
      "Remove branding",
      "Priority support",
    ],
    color: "from-purple-400/3 to-purple-500/1",
    glow: "bg-purple-400/10",
    popular: true,
  },
];

export default function PricingSection() {
  return (
    <section className="relative py-14 overflow-hidden text-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.h2
          className="text-5xl md:text-6xl font-bold mb-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          Pricing Plans
        </motion.h2>

        <motion.p
          className="text-base text-gray-400 mb-16 font-medium max-w-lg mx-auto text-center leading-relaxed"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          Start free and scale as your needs grow with{" "}
          <span className="text-[var(--blue)] font-semibold">feedbyx</span>.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: idx * 0.15, duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
              className={`relative border border-white/10 rounded-3xl backdrop-blur-2xl bg-gradient-to-b ₹{plan.color} p-10 flex flex-col items-center justify-between text-center overflow-hidden min-h-[420px] hover:bg-white/10 transition duration-300`}
            >
              <div
                className={`absolute -top-16 -right-16 w-72 h-72 ₹{plan.glow} blur-[130px] rounded-full pointer-events-none`}
              ></div>

              {plan.popular && (
                <div className="absolute top-5 right-5 bg-[var(--blue)] text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}

              <div className="relative z-10">
                <h3 className="text-2xl font-semibold mb-2">{plan.name}</h3>
                <p className="text-4xl font-bold mb-8 text-white">{plan.price}</p>
                <ul className="text-gray-300 space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center justify-center gap-2">
                      <span className="text-[var(--blue)]">✔</span> {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="relative z-10 w-full py-3 rounded-xl bg-[var(--blue)] text-white font-semibold hover:opacity-90 transition"
              >
                {plan.name === "Enterprise" ? "Contact Sales" : "Choose Plan"}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
