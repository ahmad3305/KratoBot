"use client";
import React from "react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
const menu = [
  { name: "Projects", href: "/dashboard" },
  { name: "New Project", href: "/dashboard/new" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-neu-bg text-neu-text">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-neu rounded-neu m-6 mt-8 flex-shrink-0 hidden md:flex flex-col">
        <nav className="mt-12 flex flex-col gap-2">
          {menu.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="block px-6 py-3 rounded-neu text-neu-text font-medium hover:bg-neu-surface transition"
            >
              {item.name}
            </a>
          ))}
        </nav>
      </aside>
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar with profile dropdown */}
        <header className="bg-white/90 shadow-neu flex items-center px-6 py-4 justify-between relative">
          <div className="text-lg font-bold text-krato">Dashboard</div>
          <ProfileMenu />
        </header>
        {/* Main content */}
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}

// ProfileMenu client component, inline for simplicity


function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Simple "logout": clear token & redirect to /login
  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
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
        className="rounded-full bg-krato-light flex items-center p-1 focus:outline-none shadow-neu"
        onClick={() => setOpen((v) => !v)}
      >
        <img src="/images/logo.svg" alt="User" className="w-9 h-9 rounded-full" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white rounded-neu shadow z-50 border border-neu-edge py-2">
          <a
            href="/profile"
            className="block px-4 py-2 hover:bg-neu-surface text-neu-text"
            onClick={() => setOpen(false)}
          >
            Profile
          </a>
          <button
            className="w-full text-left px-4 py-2 hover:bg-neu-surface text-red-500 border-t border-neu-edge"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}