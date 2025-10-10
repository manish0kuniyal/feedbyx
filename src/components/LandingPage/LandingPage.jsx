'use client';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import ShareAnywhere from './ShareAnywhere';
import HowItWorks from './HowItWorks';
import Footer from './Footer';
import PricingSection from './PricingSection';
import FAQSection from './Faq';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-center bg-gradient-to-b from-[#151a21] to-black text-white px-4">
      {/* Softer grid with stronger top fade and smooth horizontal fade */}
      <div className="absolute top-0 left-0 w-full h-full bg-line-pattern opacity-40 pointer-events-none z-0" />

      <Navbar />
      <HeroSection />
      <ShareAnywhere />
      <HowItWorks />
      <PricingSection />
      <FAQSection />
      <Footer />

      <style jsx global>{`
        .bg-line-pattern {
          background-image:
            linear-gradient(to right, rgba(255, 255, 255, 0.18) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.18) 1px, transparent 1px);
          background-size: 200px 200px;

          mask-image:
            linear-gradient(
              to right,
              rgba(255,255,255,0) 0%,
              rgba(255,255,255,0.1) 10%,
              rgba(255,255,255,0.8) 40%,
              rgba(255,255,255,1) 50%,
              rgba(255,255,255,0.8) 60%,
              rgba(255,255,255,0.1) 90%,
              rgba(255,255,255,0) 100%
            ),
            linear-gradient(
              to bottom,
              rgba(255,255,255,0) 0%,        
              rgba(255,255,255,0.2) 10%,    
              rgba(255,255,255,1) 25%,      
              rgba(255,255,255,1) 100%
            );

          -webkit-mask-image:
            linear-gradient(
              to right,
              rgba(255,255,255,0) 0%,
              rgba(255,255,255,0.1) 10%,
              rgba(255,255,255,0.8) 40%,
              rgba(255, 255, 255, 1) 50%,
              rgba(255, 255, 255, 1) 60%,
              rgba(255,255,255,0.1) 90%,
              rgba(255,255,255,0) 100%
            ),
            linear-gradient(
              to bottom,
              rgba(255,255,255,0) 0%,
              rgba(255, 255, 255, 0.2) 10%,
              rgba(255,255,255,1) 25%,
              rgba(255,255,255,1) 100%
            );

          mask-composite: intersect;
          -webkit-mask-composite: destination-in;
        }
      `}</style>
    </div>
  );
}
