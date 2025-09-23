// import { signIn } from 'next-auth/react';
import { FaGoogle } from 'react-icons/fa';
import GoogleSignInButton from '../GoogleSignInButton';
export default function Navbar() {
  return (
    <header className="flex items-center justify-between w-full max-w-6xl mx-auto py-6 z-10 relative">
      {/* Logo instead of text */}
      <div className="flex items-center">
        <img
          src="/logo.png" 
          alt="Feedbyx Logo" 
          width={120}
          height={100}
        />
      </div>

      <div className="flex items-center gap-4">
        <GoogleSignInButton />
      </div>
    </header>
  );
}
