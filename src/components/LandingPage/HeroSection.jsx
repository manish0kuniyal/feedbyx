
import { motion } from "framer-motion";
import GoogleSignInButton from "../GoogleSignInButton";
export default function HeroSection() {
  return (
    <motion.main
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="mt-[7vh] flex flex-col items-center text-center space-y-6 z-10 relative"
    >
     <h2
  className="font-bold leading-[1.15] max-w-4xl text-[clamp(2.5rem,6vw,4.5rem)] sm:text-[clamp(2.8rem,5vw,5rem)] lg:text-[clamp(3rem,4vw,5.5rem)]"
>
  The modern way to build{" "}
  <span className="text-[var(--blue)]">AI-powered forms.</span>
</h2>


      <p className="text-gray-600 my-4 dark:text-gray-400 max-w-xl text-lg">
        Create custom forms in minutes. Embed them anywhere, share with
        anyone, and track responses with powerful analytics and AI.
      </p>

    <div className="flex flex-col sm:flex-row gap-4 mt-6">
  <GoogleSignInButton label="Try for free" variant="primary" />

  
  <a
    href="https://calendly.com/manishkuniyal24/30min"
    target="_blank"
    rel="noopener noreferrer"
    className="px-6 py-3 rounded-md bg-gray-200 dark:bg-gray-800 font-medium hover:bg-gray-300 dark:hover:bg-gray-700 transition"
  >
    Request Demo
  </a>
</div>
    </motion.main>
  );
}
