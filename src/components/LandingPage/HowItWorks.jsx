"use client";
import { motion } from "framer-motion";
import { FaClipboardList, FaCode, FaChartBar} from "react-icons/fa";

export default function HowItWorks() {
  const cards = [
  {
    icon: <FaClipboardList className="w-6 h-6 text-white" />,
    title: "Create a Custom Form",
    description: "Build a form tailored to your needs with our easy-to-use editor and customization options.",
    bgColor: "bg-blue-600",
  },
  {
    icon: <FaCode className="w-6 h-6 text-white" />,
    title: "Embed into Your Code",
    description: "Easily integrate the form into your HTML or application with a simple embed code snippet.",
    bgColor: "bg-pink-600",
  },
  {
    icon: <FaChartBar className="w-6 h-6 text-white" />,
    title: "Share & Track Analytics",
    description: "Distribute your form and monitor performance with detailed real-time analytics.",
    bgColor: "bg-green-600",
  },
];


  return (
    <section className="py-20 mt-14">
      <div className="max-w-6xl mx-auto px-6 text-center bg-transparent">
        
        {/* Heading */}
        <motion.h2
          className="text-4xl md:text-4xl font-bold mb-2 text-white"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          How It Works
        </motion.h2>

        <motion.p
          className="text-sm text-[var(--blue)] mb-12 mt-4 font-semibold max-w-md mx-auto"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
        >
         Supercharge your feedback collection process with APPNAME


        </motion.p>

        {/* Cards with smooth scale + fade, left → right */}
        <div className="grid gap-10 md:grid-cols-3">
          {cards.map((card, idx) => (
          <motion.div
  key={idx}
  initial={{ opacity: 0, scale: 0.95 }}
  whileInView={{ opacity: 1, scale: 1 }}
  transition={{
    delay: 0.5 + idx * 0.4,
    duration: 0.8,
    ease: [0.25, 0.1, 0.25, 1]
  }}
  viewport={{ once: true }}
  className="bg-white/0 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition relative backdrop-blur-3xl border border-white/20
             before:absolute before:inset-0 before:rounded-3xl before:border-[1px] before:border-white/40 
             before:shadow-[0_0_2px_rgba(255,255,255,0.5)] before:pointer-events-none
             after:absolute after:inset-0 after:rounded-3xl after:shadow-[0_0_25px_rgba(255,255,255,0.2)] after:pointer-events-none"
>
  <div className="flex justify-center">
    <div className={`${card.bgColor} w-12 h-12 rounded-xl flex items-center justify-center shadow-md mb-6`}>
      {card.icon}
    </div>
  </div>
  <h3 className="font-semibold text-lg mb-2 text-white text-center">{card.title}</h3>
  <p className="text-sm text-gray-300 text-center">{card.description}</p>
</motion.div>


          ))}
        </div>
      </div>
    </section>
  );
}
