

import { useState } from "react";
import AuthModal from "../AuthModal";
import { HiSparkles } from "react-icons/hi2";
export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="relative flex items-center justify-between w-full max-w-6xl mx-auto py-6 px-4 md:px-0 z-10">
        
        {/* Left Side (Logo + Blur Background) */}
        <div className="relative flex items-center">
          <div className="absolute -top-10 -left-9 w-50 h-50 bg-[#dae6dd] opacity-70 blur-[150px] rounded-full pointer-events-none" />

          <img
            src="/logo.png"
            alt="Feedbyx Logo"
            width={60}
            height={60}
            className="relative z-10 object-contain"
          />
        </div>

        <div className="flex items-center gap-4">
   <button
  onClick={() => setOpen(true)}
  className="flex items-center gap-2 px-6 py-3 rounded-md border border-[var(--blue)] text-white font-semibold hover:bg-[var(--blue)] hover:text-white transition shadow-sm"
>
  <HiSparkles className="text-lg" />
  <span>Start Building</span>
</button>
        </div>

      </header>

      <AuthModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}