'use client';
import GoogleSignInButton from '../GoogleSignInButton';

export default function Navbar() {
  return (
    <header className="relative flex items-center justify-between w-full max-w-6xl mx-auto py-6 px-4 md:px-0 z-10">
      <div className="relative flex items-center">
        <div className="absolute -top-10 -left-9 w-50 h-50 bg-[#dae6dd] opacity-70 blur-[150px] rounded-full pointer-events-none" />

        <img
          src="/logo.png"
          alt="Feedbyx Logo"
          width={80}
          height={80}
          className="relative z-10 object-contain"
        />
      </div>
      <div className="flex items-center gap-4">
        <GoogleSignInButton />
      </div>
    </header>
  );
}
