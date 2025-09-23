"use client";

import { useState } from "react";
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
      question: "Can I host the feedback form?",
      answer:
        "Currently there is no feature to get a shareable link for your form. It will be added soon."
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 px-4 sm:px-8 max-w-4xl mx-auto">
      <h2 className="text-4xl font-bold text-center mb-12">
        Frequently Asked Questions
      </h2>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-black border border-white rounded-xl overflow-hidden"
          >
            {/* Question Row */}
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full flex justify-between items-center p-6 text-left"
            >
              <span className="text-lg font-medium text-white">{faq.question}</span>
              {openIndex === index ? (
                <FaMinus className="text-white" />
              ) : (
                <FaPlus className="text-white" />
              )}
            </button>

            {/* Answer Row */}
            {openIndex === index && (
              <div className="px-6 pb-6 text-gray-300 text-left">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
