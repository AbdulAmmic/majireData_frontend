"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 1500); // simulate login
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white p-4">
      {/* Animated Glow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "mirror" }}
        className="absolute inset-0 bg-gradient-to-tr from-blue-500/40 via-cyan-400/30 to-transparent blur-3xl"
      />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-8"
      >
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 text-transparent bg-clip-text"
          >
            ⚡ Majire Sub
          </motion.h1>
          <p className="text-sm text-gray-300 mt-2">
            Login to manage your data & VTU services
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Email or Phone Number
            </label>
            <input
              type="text"
              required
              placeholder="Enter email or phone"
              className="w-full px-4 py-2 bg-white/10 border border-gray-500/40 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-2 bg-white/10 border border-gray-500/40 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          <div className="flex justify-between text-sm text-gray-400">
            <Link href="/forgot-password" className="hover:text-cyan-400">
              Forgot password?
            </Link>
            <Link href="/signup" className="hover:text-cyan-400">
              Create account
            </Link>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white py-2.5 rounded-xl font-semibold mt-4 shadow-lg transition-all"
          >
            {loading ? "Authenticating..." : "Login"}
          </motion.button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-400">
          Powered by{" "}
          <span className="text-cyan-400 font-semibold">Majire Data Application</span>
        </div>
      </motion.div>
    </div>
  );
}
