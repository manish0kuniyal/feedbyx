'use client';

import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../utils/userstore';
import { FaGoogle } from 'react-icons/fa';
import { MdArrowForwardIos } from 'react-icons/md';
import { motion } from 'framer-motion';

export default function GoogleSignInButton() {
  const navigate = useNavigate();
  const setUser = useUserStore((s) => s.setUser);
  const user = useUserStore((s) => s.user);

  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true); 
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BASE_URL}api/auth/me`, {
          withCredentials: true,
        });
        if (!cancelled) {
          if (!res.data?.user) setUser(null);
        }
      } catch (err) {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setVerifying(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogin = async (credentialResponse) => {
    try {
      setLoading(true);
      const token = credentialResponse?.credential;
      if (!token) throw new Error('No credential token received');

      await axios.post(
        `${import.meta.env.VITE_BASE_URL}api/auth/google/token`,
        { token },
        { withCredentials: true }
      );

      const meRes = await axios.get(`${import.meta.env.VITE_BASE_URL}api/auth/me`, {
        withCredentials: true,
      });

      if (meRes.data?.user) {
        setUser(meRes.data.user);
        navigate('/dashboard');
      } else {
        console.warn('Authentication succeeded but /api/auth/me returned no user');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <button disabled className="flex items-center gap-2 px-4 py-2 rounded bg-gray-200 text-gray-600">
        Checking session...
      </button>
    );
  }

  if (user) {
    return (
      <motion.button
        whileHover={{ scale: 1.03, x: 2 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 px-4 py-2 rounded bg-[var(--blue)] text-white font-semibold transition-all"
      >
        <span>Dashboard</span>
        <MdArrowForwardIos className="text-lg" />
      </motion.button>
    );
  }

  return (
    <div>
      {loading ? (
        <button
          disabled
          className="flex items-center gap-2 px-4 py-2 rounded bg-gray-300 text-gray-700"
        >
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
