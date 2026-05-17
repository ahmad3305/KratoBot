"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL;


export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Login failed");
        setSubmitting(false);
        return;
      }

      localStorage.setItem("krato_token", data.token);

      router.push("/dashboard");
    } catch (err) {
      setErrorMsg("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-tr from-krato-light to-white items-center justify-center">
      <div className="bg-neu-surface shadow-neu rounded-neu p-8 sm:p-12 w-full max-w-md flex flex-col items-center">
        <img src="/images/logo.svg" alt="KratoBot" className="w-14 h-14 mb-4" draggable={false} />
        <h1 className="text-2xl font-display font-bold mb-4 text-krato">KratoBot Login</h1>
        <form className="w-full" onSubmit={handleLogin}>
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

          <button
            type="submit"
            className="w-full py-3 rounded-full bg-krato text-white font-bold shadow-neu transition hover:bg-krato-accent focus:ring-2 focus:ring-krato"
            disabled={submitting}
          >
            {submitting ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="mt-4 text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-krato font-semibold hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
