'use client';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUserStore } from '../../utils/userstore';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import ShareAnywhere from './ShareAnywhere';
import HowItWorks from './HowItWorks';
import Footer from './Footer';
import PricingSection from './PricingSection';
import FAQSection from './Faq';
import Loader from '../Loading';

export default function LandingPage() {
  const navigate = useNavigate();
  const { setUser } = useUserStore();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const checkAuth = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BASE_URL}api/auth/me`, {
          withCredentials: true,
        });

        if (cancelled) return;

        if (res.data?.user) {
          setUser(res.data.user);
          navigate('/dashboard');
          return;
        } else {
          setUser(null);
        }
      } catch (err) {
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) setVerifying(false);
      }
    };

    checkAuth();
    return () => {
      cancelled = true;
    };
  }, [setUser, navigate]);

  if (verifying) {
    return <Loader fullScreen size="w-20 h-20" />;
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-center bg-gradient-to-b from-[#151a21] to-black text-white px-4">
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #e7e5e4b7 1px, transparent 1px),
            linear-gradient(to bottom, #e7e5e4a4 1px, transparent 1px)
          `,
          backgroundSize: '200px 200px',
          backgroundPosition: '0 0, 0 0',
          maskImage: `
            repeating-linear-gradient(
              to right,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            repeating-linear-gradient(
              to bottom,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            radial-gradient(ellipse 70% 70% at 50% 55%, #000 45%, transparent 90%)
          `,
          WebkitMaskImage: `
            repeating-linear-gradient(
              to right,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            repeating-linear-gradient(
              to bottom,
              black 0px,
              black 5px,
              transparent 3px,
              transparent 8px
            ),
            radial-gradient(ellipse 70% 70% at 50% 55%, #000 41%, transparent 80%)
          `,
          maskComposite: 'intersect',
          WebkitMaskComposite: 'source-in',
          opacity: 0.25,
        }}
      />

      <Navbar />
      <HeroSection />
{/*<ShareAnywhere />*/}
      <HowItWorks />
      <PricingSection />
      <FAQSection />
      <Footer />
    </div>
  );
}
