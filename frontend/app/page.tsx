import React from "react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      
      {/* Top spacer / subtle bar */}
      <div className="h-16 w-full flex items-center px-6 text-sm text-gray-400">
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 justify-center items-center relative px-4">
        
        {/* Logo & brand */}
        <div className="flex flex-col items-center mb-8">
          <img
            src="/images/logo.svg"
            alt="KratoBot Logo"
            className="w-24 h-24 mb-4 drop-shadow-2xl"
            draggable={false}
          />
          <h1 className="text-4xl font-display font-bold tracking-tight text-krato mb-2">
            KratoBot
          </h1>
          <p className="text-lg text-gray-600 max-w-xl text-center">
            The AI powered Digital Marketing Strategy bot for your brand.
          </p>
        </div>

        {/* CTA */}
        <div className="bg-neu-surface shadow-neu rounded-neu p-8 sm:p-12 flex flex-col items-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            Unlock next-level Marketing Intelligence
          </h2>
          <p className="text-gray-500 mb-8 text-center">
            Signup for a free account and start analyzing your brand, competitors, and market positioning with real-time, detailed visual reports.
          </p>
          <div className="flex gap-4">
            <Link
              href="/signup"
              className="px-6 py-3 rounded-full bg-krato text-white font-semibold shadow-neu transition hover:opacity-90"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 rounded-full border-2 border-krato bg-white text-krato font-semibold hover:bg-krato-light transition"
            >
              Login
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-gray-400 text-sm">
          © 2026 KratoBot. All rights reserved.
        </div>
      </div>
    </div>
  );
}
