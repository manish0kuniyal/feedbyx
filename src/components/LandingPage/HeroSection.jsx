"use client";

import { motion } from "framer-motion";

// import { Outfit } from 'next/font/google';

export default function HeroSection() {
  return (
    <motion.main
      initial={{ opacity: 0, y: 50 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="mt-[5vh] flex flex-col items-center text-center space-y-6 z-10 relative"
    >
     <h2
  className={`text-5xl sm:text-5xl lg:text-7xl font-bold max-w-3xl leading-tight`}
>
  Gather feedback effortlessly{" "}
  <span className="text-[var(--blue)]">and gain insights</span>
</h2>


      <p className="text-gray-600 my-4 dark:text-gray-400 max-w-xl text-lg">
        Create custom feedback forms in minutes. Embed them anywhere, share with
        anyone, and track responses with powerful analytics.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mt-6">
        <button className="px-6 py-3 rounded-md bg-[var(--blue)] text-white font-medium hover:text-black ctransition">
          Try for free
        </button>
        <button className="px-6 py-3 rounded-md bg-gray-200 dark:bg-gray-800 font-medium hover:bg-gray-300 dark:hover:bg-gray-700 transition">
          Request Demo
        </button>
      </div>
    </motion.main>
  );
}
