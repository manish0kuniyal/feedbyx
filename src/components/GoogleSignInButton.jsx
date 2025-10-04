'use client';

import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../utils/userstore'; // adjust path
import { FaGoogle } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function GoogleSignInButton() {
  const navigate = useNavigate();
  const setUser = useUserStore((s) => s.setUser);
  const user = useUserStore((s) => s.user);

  const [loading, setLoading] = useState(false);

  const handleLogin = async (credentialResponse) => {
    try {
      setLoading(true);
      const token = credentialResponse?.credential;
      if (!token) throw new Error('No credential token received');

      // send token to backend, server should set auth cookie
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}api/auth/google/token`,
        { token },
        { withCredentials: true }
      );

      // fetch user and update store
      const meRes = await axios.get(`${import.meta.env.VITE_BASE_URL}api/auth/me`, {
        withCredentials: true,
      });

      if (meRes.data?.user) {
        setUser(meRes.data.user);
        navigate('/dashboard');
      } else {
        // Edge case: backend didn't return user — still navigate or show error
        console.warn('Authentication succeeded but /api/auth/me returned no user');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login failed:', err);
      // Optionally show toast / UI feedback
    } finally {
      setLoading(false);
    }
  };

  // If user is already signed in, show "Go to Dashboard" button
  if (user) {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 px-4 py-2 rounded bg-[var(--blue)] text-white font-semibold"
      >
        Go to Dashboard
      </motion.button>
    );
  }

  // Otherwise render the GoogleLogin button
  return (
    <div>
      {/* Wrap to show a loading state if needed */}
      {loading ? (
        <button disabled className="flex items-center gap-2 px-4 py-2 rounded bg-gray-300 text-gray-700">
          Signing in...
        </button>
      ) : (
        <GoogleLogin
          onSuccess={handleLogin}
          onError={() => console.log('Google login failed')}
          useOneTap={false}
          prompt="select_account"
        />
      )}
    </div>
  );
}
