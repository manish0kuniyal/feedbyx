"use client";
import { motion } from "framer-motion";
import { FaChartBar, FaCode, FaWpforms } from "react-icons/fa";
import { MdPriceCheck } from "react-icons/md";

export default function HowItWorks() {
  const getDirection = (direction) => {
    switch (direction) {
      case "left":
        return { hidden: { opacity: 0, x: -100 }, visible: { opacity: 1, x: 0 } };
      case "right":
        return { hidden: { opacity: 0, x: 100 }, visible: { opacity: 1, x: 0 } };
      case "top":
        return { hidden: { opacity: 0, y: -100 }, visible: { opacity: 1, y: 0 } };
      default:
        return { hidden: { opacity: 0 }, visible: { opacity: 1 } };
    }
  };

  return (
    <section className="relative py-28 overflow-hidden text-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.h2
          className="text-5xl md:text-6xl font-bold mb-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          How It Works
        </motion.h2>

        <motion.p
          className="text-base text-gray-400 mb-16 font-medium max-w-lg mx-auto text-center leading-relaxed"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          Supercharge your workflow with{" "}
          <span className="text-[var(--blue)] font-bold">feedbyx</span> — the modern AI form builder.
        </motion.p>

        <div className="grid gap-8">
   <motion.div
  variants={getDirection("top")}
  initial="hidden"
  whileInView="visible"
  transition={{ duration: 0.8, ease: "easeOut" }}
  viewport={{ once: true }}
  className="relative p-10 md:p-12 border border-white/5 rounded-3xl backdrop-blur-xl bg-white/1 
             flex flex-col lg:flex-row items-center lg:items-center justify-center lg:justify-between 
             text-center lg:text-left min-h-[260px]"
>
  <div className="absolute -top-10 -left-10 w-60 h-60 bg-blue-400/20 blur-[120px] rounded-full pointer-events-none"></div>

  <div className="relative z-10 mb-6 lg:mb-0 lg:order-2">
    <div className="w-20 h-20 flex items-center justify-center rounded-2xl bg-white/5 backdrop-blur-xl shadow-inner">
      <FaWpforms className="w-10 h-10 text-blue-300" />
    </div>
  </div>

  <div className="relative z-10 max-w-xl lg:max-w-md">
    <h3 className="font-semibold text-2xl mb-2">Create a Custom Form</h3>
    <p className="text-sm text-gray-300 leading-relaxed">
      Build beautiful forms in minutes with our drag-and-drop editor and AI-powered customization.
    </p>
  </div>
</motion.div>


         <div className="grid gap-8 md:grid-cols-[1fr_2fr] md:items-stretch">
  <div className="grid grid-rows-2 gap-6">
    <motion.div
      variants={getDirection("left")}
      initial="hidden"
      whileInView="visible"
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true }}
      className="relative p-8 border border-white/5 rounded-3xl backdrop-blur-xl bg-white/1  flex flex-col items-center justify-center text-center"
    >
      <div className="relative z-10 mb-4">
        <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-white/3 shadow-inner">
          <FaCode className="w-8 h-8 text-pink-300" />
        </div>
      </div>
      <div className="relative z-10">
        <h3 className="font-semibold text-lg mb-2">Embed into Your Code</h3>
        <p className="text-sm text-gray-300 leading-relaxed max-w-sm mx-auto">
          Integrate effortlessly into your site or app using a lightweight embed snippet.
        </p>
      </div>
    </motion.div>

    <motion.div
      variants={getDirection("left")}
      initial="hidden"
      whileInView="visible"
      transition={{ delay: 0.1, duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true }}
      className="relative p-8 border border-white/5 rounded-3xl backdrop-blur-xl bg-white/1  flex flex-col items-center justify-center text-center"
    >
      <div className="relative z-10 mb-4">
        <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-white/4 shadow-inner">
          <MdPriceCheck  className="w-8 h-8 text-purple-300" />
        </div>
      </div>
      <div className="relative z-10">
       <h3 className="font-semibold text-lg mb-2">Simple Monthly Pricing</h3>
<p className="text-sm text-gray-300 leading-relaxed max-w-sm mx-auto">
  No contracts. No hidden fees. Just pay for the month you use and cancel anytime.
</p>
      </div>
    </motion.div>
  </div>

  <motion.div
    variants={getDirection("right")}
    initial="hidden"
    whileInView="visible"
    transition={{ duration: 0.8, ease: "easeOut" }}
    viewport={{ once: true }}
    className="relative p-10 border border-white/5 rounded-3xl backdrop-blur-xl bg-white/1 flex flex-col items-center justify-center text-center"
  >
    <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-green-400/10 blur-[120px] rounded-full pointer-events-none"></div>
    <div className="relative z-10 mb-6">
      <div className="w-20 h-20 flex items-center justify-center rounded-2xl bg-white/4 shadow-inner">
        <FaChartBar className="w-10 h-10 text-green-300" />
      </div>
    </div>
    <div className="relative z-10">
      <h3 className="font-semibold text-xl mb-2">Share & Track Analytics</h3>
      <p className="text-sm text-gray-300 leading-relaxed max-w-sm mx-auto">
        Monitor engagement, analyze trends, and get insights from your collected responses in real time.
      </p>
    </div>
  </motion.div>
</div>

        </div>
      </div>
    </section>
  );
}
