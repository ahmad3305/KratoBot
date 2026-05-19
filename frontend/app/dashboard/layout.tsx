"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const menu = [
  { name: "Projects", href: "/dashboard" },
  { name: "New Project", href: "/dashboard/new" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Top bar show/hide on scroll
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      if (typeof window === "undefined") return;
      const currentY = window.scrollY;

      if (currentY <= 0) {
        setShowHeader(true);
        lastScrollY.current = 0;
        return;
      }

      if (currentY > lastScrollY.current) {
        // scrolling down
        setShowHeader(false);
      } else {
        // scrolling up
        setShowHeader(true);
      }
      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen flex bg-zinc-100">
      {/* Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed w-72 bg-white border-r border-zinc-200 h-screen z-50 flex flex-col"
          >
            {/* Logo */}
            <div className="p-6 border-b border-zinc-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#408CF1] to-blue-600 flex items-center justify-center font-bold text-white">
                  K
                </div>
                <div>
                  <h2 className="text-xl font-bold text-zinc-900">Kratobot</h2>
                  <p className="text-xs text-zinc-500">AI Marketing</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
              {menu.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`block px-4 py-3 rounded-xl font-medium transition mb-2 ${
                      isActive
                        ? "bg-[#408CF1] text-white"
                        : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                    }`}
                  >
                    {item.name}
                  </a>
                );
              })}
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <AnimatePresence>
          {showHeader && (
            <motion.header
              key="dashboard-header"
              initial={{ y: -90, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -90, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className="bg-white/80 backdrop-blur-xl border-b border-zinc-200 sticky top-0 z-30"
            >
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4">
                  {/* Menu Button */}
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900 transition"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  {/* Logo and Brand name here */}
                  <div className="flex items-center gap-2">
                    <img
                      src="/images/logo.svg"
                      alt="KratoBot"
                      className="w-8 h-8"
                      draggable={false}
                    />
                    <span className="text-xl font-display font-bold tracking-tight text-[#408CF1] select-none">
                      KratoBot
                    </span>
                  </div>
                </div>
                {/* Profile */}
                <ProfileMenu />
              </div>
            </motion.header>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("krato_token");
      router.push("/login");
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#408CF1] to-blue-600 flex items-center justify-center text-white font-bold shadow-lg"
      >
        U
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-48 bg-white border border-zinc-200 rounded-xl shadow-2xl overflow-hidden"
          >
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 text-left hover:bg-zinc-100 text-red-500 transition"
            >
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
