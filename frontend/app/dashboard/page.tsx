"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

type Project = {
  project_id: string;
  project_name: string;
  brand_website?: string;
  created_at?: string;
};

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const api = process.env.NEXT_PUBLIC_API_URL;
    const token = typeof window !== "undefined" ? localStorage.getItem("krato_token") : undefined;
    fetch(`${api}/api/projects`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setProjects(Array.isArray(data.projects) ? data.projects : []);
      })
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-zinc-900 mb-2">Your Projects</h1>
            <p className="text-zinc-500">Manage your marketing campaigns</p>
          </div>
          <a
            href="/dashboard/new"
            className="px-6 py-3 bg-[#408CF1] hover:bg-[#3579d8] text-white font-semibold rounded-xl transition shadow-lg"
          >
            + New Project
          </a>
        </div>
      </motion.div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <div className="w-20 h-20 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-zinc-900 mb-2">No projects yet</h3>
          <p className="text-zinc-500 mb-6">Create your first project to get started</p>
          <a
            href="/dashboard/new"
            className="px-6 py-3 bg-[#408CF1] hover:bg-[#3579d8] text-white font-semibold rounded-xl transition"
          >
            Create Project
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, idx) => (
            <motion.div
              key={project.project_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white border border-zinc-200 rounded-2xl p-6 hover:border-[#408CF1] transition group shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#408CF1] to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                  {project.project_name.charAt(0).toUpperCase()}
                </div>
                <span className="px-3 py-1 bg-green-500/10 text-green-600 text-xs font-medium rounded-full border border-green-500/20">
                  Active
                </span>
              </div>

              <h3 className="text-xl font-bold text-zinc-900 mb-2 group-hover:text-[#408CF1] transition">
                {project.project_name}
              </h3>

              <p className="text-zinc-500 text-sm mb-4 break-all">
                {project.brand_website || "No website provided"}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-zinc-200">
                <span className="text-xs text-zinc-400">
                  {project.created_at
                    ? new Date(project.created_at).toLocaleDateString()
                    : "N/A"}
                </span>
                <a
                  href={`/dashboard/${project.project_id}`}
                  className="px-4 py-2 bg-zinc-100 hover:bg-[#408CF1] hover:text-white text-zinc-600 text-sm font-medium rounded-lg transition"
                >
                  Open →
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}