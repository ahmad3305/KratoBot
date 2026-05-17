// frontend/app/dashboard/page.tsx
"use client";
import React, { useEffect, useState } from "react";

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

  return (
    <div>
      <h1 className="text-3xl font-display font-bold text-krato mb-8">
        Your Projects
      </h1>
      {loading ? (
        <div className="text-gray-400">Loading...</div>
      ) : projects.length === 0 ? (
        <div className="text-gray-400">No projects found. Start by creating one!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.project_id}
              className="bg-neu-surface rounded-neu shadow-neu p-6 flex flex-col gap-2"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl font-semibold text-krato">{project.project_name}</span>
                <span className="status-pill status-ready">Active</span>
              </div>
              <p className="text-gray-600 flex-1 break-all">
                {project.brand_website || "No website provided."}
              </p>
              <div className="mt-2 text-xs text-gray-400">
                Created: {project.created_at
                  ? new Date(project.created_at).toLocaleDateString()
                  : "N/A"}
              </div>
              <a
                href={`/dashboard/${project.project_id}`}
                className="mt-4 inline-block px-4 py-2 rounded-full bg-krato text-white font-semibold transition hover:opacity-90 text-center"
              >
                Open
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}