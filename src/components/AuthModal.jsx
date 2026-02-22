import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";
import { useUserStore } from "../utils/userstore";
import { useNavigate } from "react-router-dom";
import {
  signupUser,
  loginUser,
  googleLogin,
} from "../utils/api/auth";

export default function AuthModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const setUser = useUserStore((s) => s.setUser);

  const [mode, setMode] = useState("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const user =
        mode === "signup"
          ? await signupUser({ name, email, password })
          : await loginUser({ email, password });

      if (user) {
        setUser(user);
        onClose();
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Auth error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async (credentialResponse) => {
    try {
      const token = credentialResponse?.credential;
      if (!token) return;

      const user = await googleLogin(token);

      if (user) {
        setUser(user);
        onClose();
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Google login failed:", err);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ y: 40, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 40, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="relative w-full max-w-lg mx-6"
        >
          <div className="rounded-3xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white/30 dark:border-gray-700 shadow-2xl px-10 py-10">

           
            <button
              onClick={onClose}
              className="absolute top-5 right-6 text-gray-500 hover:text-gray-800 dark:hover:text-white text-xl"
            >
              ×
            </button>

            <h2 className="text-3xl font-bold text-center mb-2">
              {mode === "signup" ? "Create Account" : "Welcome Back"}
            </h2>

            <p className="text-center text-gray-500 dark:text-gray-400 mb-8 text-sm">
              {mode === "signup"
                ? "Start building AI-powered forms today."
                : "Login to continue to your dashboard."}
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === "signup" && (
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-5 py-3 rounded-xl bg-white/60 dark:bg-gray-800/60 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--blue)] transition"
                />
              )}

              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-5 py-3 rounded-xl bg-white/60 dark:bg-gray-800/60 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--blue)] transition"
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-5 py-3 rounded-xl bg-white/60 dark:bg-gray-800/60 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--blue)] transition"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-semibold text-white bg-[var(--blue)] hover:opacity-90 transition shadow-lg"
              >
                {loading
                  ? "Processing..."
                  : mode === "signup"
                  ? "Sign Up"
                  : "Login"}
              </button>
            </form>

            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
              <span className="text-sm text-gray-400">OR</span>
              <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
            </div>

            <div className="w-full">
              <GoogleLogin
                onSuccess={handleGoogle}
                onError={() => console.log("Google login failed")}
                width="100%"
              />
            </div>

            <p className="text-sm text-center mt-8 text-gray-600 dark:text-gray-400">
              {mode === "signup"
                ? "Already have an account?"
                : "Don't have an account?"}{" "}
              <button
                onClick={() =>
                  setMode(mode === "signup" ? "login" : "signup")
                }
                className="text-[var(--blue)] font-semibold hover:underline"
              >
                {mode === "signup" ? "Login" : "Sign up"}
              </button>
            </p>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}