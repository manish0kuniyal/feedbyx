
import { motion } from "framer-motion";
import { useState } from "react";
import AuthModal from "../AuthModal";
import { HiSparkles } from "react-icons/hi2";
export default function HeroSection() {
  const [open, setOpen] = useState(false);
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
  Turn simple forms into{" "}
  <span
  className="bg-gradient-to-r from-[var(--blue)] to-white bg-[length:300%_100%] bg-clip-text text-transparent"
>
  powerful insights.
</span>

</h2>



      <p className="text-gray-600  my-4 dark:text-gray-400 max-w-xl text-lg">
        Create custom forms in minutes. Embed them anywhere, share with
        anyone, and track responses with powerful analytics.
      </p>

    <div className="flex flex-col sm:flex-row gap-4 mt-6"><button
  onClick={() => setOpen(true)}
  className="flex items-center justify-center gap-2 px-8 py-4 rounded-lg border border-[var(--blue)] text-white font-semibold hover:bg-[var(--blue)] hover:text-white transition shadow-sm text-lg"
>
  <HiSparkles className="text-xl" />
  <span>Start Building</span>
</button>

  
 <a
  href="https://calendly.com/manishkuniyal24/30min"
  target="_blank"
  rel="noopener noreferrer"
  className="flex items-center justify-center px-6 py-3 rounded-lg bg-[var(--blue)] hover:bg-gray-800 hover:text-[var(--blue)] text-bold text-white font-semibold transition hover:opacity-90"
>
  Request Demo
</a>
</div>
<AuthModal isOpen={open} onClose={() => setOpen(false)} />
    </motion.main>
  );
}
