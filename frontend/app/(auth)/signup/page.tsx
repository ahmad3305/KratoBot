"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);
    setSuccess(false);

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Signup failed");
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 1400);
    } catch (err) {
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-tr from-krato-light to-white items-center justify-center">
      <div className="bg-neu-surface shadow-neu rounded-neu p-8 sm:p-12 w-full max-w-md flex flex-col items-center">
        <img src="/images/logo.svg" alt="KratoBot" className="w-14 h-14 mb-4" draggable={false} />
        <h1 className="text-2xl font-display font-bold mb-4 text-krato">Sign Up for KratoBot</h1>
        <form className="w-full" onSubmit={handleSignup}>
          <label className="block mb-2 font-semibold text-sm">Full Name</label>
          <input
            type="text"
            value={fullName}
            required
            onChange={e => setFullName(e.target.value)}
            className="w-full px-4 py-3 mb-4 rounded-neu bg-white border border-gray-200 shadow-sm focus:ring-krato outline-none"
            placeholder="Your full name"
            disabled={submitting}
          />

          <label className="block mb-2 font-semibold text-sm">Email</label>
          <input
            type="email"
            value={email}
            required
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 mb-4 rounded-neu bg-white border border-gray-200 shadow-sm focus:ring-krato outline-none"
            placeholder="your@email.com"
            disabled={submitting}
          />

          <label className="block mb-2 font-semibold text-sm">Password</label>
          <input
            type="password"
            value={password}
            required
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 mb-4 rounded-neu bg-white border border-gray-200 shadow-sm focus:ring-krato outline-none"
            placeholder="••••••••"
            disabled={submitting}
          />

          {errorMsg && (
            <div className="text-red-500 mb-3">{errorMsg}</div>
          )}
          {success && (
            <div className="text-green-600 mb-3">Registered! Redirecting…</div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-full bg-krato text-white font-bold shadow-neu transition hover:bg-krato-accent focus:ring-2 focus:ring-krato"
            disabled={submitting}
          >
            {submitting ? "Creating account..." : "Sign Up"}
          </button>
        </form>
        <p className="mt-4 text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="text-krato font-semibold hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}