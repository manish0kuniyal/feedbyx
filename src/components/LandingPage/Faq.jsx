"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FaPlus, FaMinus } from "react-icons/fa";

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How does your service work?",
      answer:
        "We provide an all-in-one platform for collecting feedback, analyzing data, and turning insights into actionable improvements."
    },
    {
      question: "Can I use it for free?",
      answer:
        "Yes! We offer a free plan that includes core features so you can start right away without paying."
    },
    {
      question: "Is my data secure?",
      answer:
        "Absolutely. We use industry-standard encryption and never share your information with third parties."
    },
    {
      question: "Can I share my form with others?",
      answer: "Yes, you can easily create and share your forms using a link."
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative py-28 overflow-hidden text-white">
      <div className="max-w-4xl mx-auto px-6">
        <motion.h2
          className="text-4xl md:text-5xl font-bold mb-3 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          Frequently Asked Questions
        </motion.h2>

        <motion.p
          className="text-base text-gray-400 mb-16 font-medium max-w-lg mx-auto text-center leading-relaxed"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          viewport={{ once: true }}
        >
          Everything you need to know about{" "}
          <span className="text-white font-semibold">FEEDBYX</span>.
        </motion.p>

        <div className="space-y-8">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
              viewport={{ once: true }}
              className={`relative border border-white/10 rounded-3xl backdrop-blur-2xl bg-white/5 p-6 overflow-hidden transition-all duration-300 ${
                openIndex === index
                  ? "bg-white/10 shadow-lg shadow-blue-500/10"
                  : "hover:bg-white/7"
              }`}
            >
              <div
                className={`absolute ${
                  index % 2 === 0
                    ? "-top-10 -left-10 bg-white/2"
                    : "-bottom-10 -right-10 bg-blue-300/10"
                } w-60 h-60 blur-[100px] rounded-full pointer-events-none`}
              ></div>

              <div className="relative z-10">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex justify-between items-center text-left"
                >
                  <span className="text-lg font-semibold">{faq.question}</span>
                  {openIndex === index ? (
                    <FaMinus className="text-blue-300" />
                  ) : (
                    <FaPlus className="text-gray-400" />
                  )}
                </button>

                {openIndex === index && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 text-gray-300 text-left text-sm leading-relaxed"
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
