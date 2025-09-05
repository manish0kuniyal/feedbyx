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
      <div className="absolute top-0 left-0 w-full h-full bg-line-pattern opacity-30 pointer-events-none z-0" />

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
            linear-gradient(to right, rgba(255, 255, 255, 0.2) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.2) 1px, transparent 1px);
          background-size: 200px 200px;

          /* much stronger fading at sides */
          mask-image: linear-gradient(
            to right,
            rgba(255,255,255,0) 0%,
            rgba(255,255,255,0.3) 15%,
            rgba(255,255,255,1) 40%,
            rgba(255,255,255,1) 60%,
            rgba(255,255,255,0.3) 85%,
            rgba(255,255,255,0) 100%
          );
          -webkit-mask-image: linear-gradient(
            to right,
            rgba(255,255,255,0) 0%,
            rgba(255,255,255,0.3) 15%,
            rgba(255,255,255,1) 40%,
            rgba(255,255,255,1) 60%,
            rgba(255,255,255,0.3) 85%,
            rgba(255,255,255,0) 100%
          );
        }
      `}</style>
    </div>
  );
}
