"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Competitor = {
  competitor_id: number;
  website_url: string;
};

type Project = {
  project_id: number;
  project_name: string;
  brand_website: string;
  niche?: string;
  target_audience?: string;
  marketing_goals?: string;
  budget?: number;
  created_at?: string;
  competitors: Competitor[];
};

type Report = {
  report_id: number;
  project_id: number;
  report_title: string;
  status: "processing" | "ready" | "failed";
  generated_at?: string;

  brand_authority_score?: number;
  estimated_backlinks?: number;
  sentiment_score?: number;
};

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const projectId = params.id;

  const [project, setProject] = useState<Project | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const api = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    await Promise.all([fetchProject(), fetchReports()]);
    setLoading(false);
  }

  async function fetchProject() {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("krato_token")
          : null;

      const res = await fetch(`${api}/api/projects/${projectId}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        setProject(data.project);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchReports() {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("krato_token")
          : null;

      const res = await fetch(
        `${api}/api/reports?project_id=${projectId}`,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: "include",
        }
      );

      const data = await res.json();

      if (res.ok) {
        setReports(Array.isArray(data.reports) ? data.reports : []);
      }
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) {
    return (
      <div className="text-gray-400 text-lg">
        Loading project...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-red-500 text-lg">
        Project not found.
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* HERO PROJECT BLOCK */}
      <section className="bg-neu-surface shadow-neu rounded-neu p-8">
        <div className="flex flex-col xl:flex-row gap-8 justify-between">
          {/* LEFT */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-4xl font-display font-bold text-krato">
                {project.project_name}
              </h1>

              <span className="status-pill status-ready">
                Active
              </span>
            </div>

            <p className="text-gray-600 break-all mb-6">
              {project.brand_website}
            </p>

            <div className="grid sm:grid-cols-2 gap-5">
              <InfoCard
                title="Niche"
                value={project.niche || "Not specified"}
              />

              <InfoCard
                title="Target Audience"
                value={project.target_audience || "Not specified"}
              />

              <InfoCard
                title="Marketing Goals"
                value={project.marketing_goals || "Not specified"}
              />

              <InfoCard
                title="Budget"
                value={
                  project.budget
                    ? `$${project.budget}`
                    : "Not specified"
                }
              />
            </div>
          </div>

          {/* RIGHT */}
          <div className="xl:w-[320px] flex flex-col gap-5">
            <div className="bg-white rounded-neu shadow-neu p-6">
              <h2 className="font-semibold text-neu-text mb-4">
                Competitors
              </h2>

              <div className="flex flex-col gap-3">
                {project.competitors?.length > 0 ? (
                  project.competitors.map((comp) => (
                    <div
                      key={comp.competitor_id}
                      className="bg-neu-surface rounded-xl px-4 py-3 text-sm break-all"
                    >
                      {comp.website_url}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">
                    No competitors added.
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() =>
                router.push(`/dashboard/${projectId}/analyze`)
              }
              className="w-full bg-krato text-white rounded-full py-4 font-semibold shadow-neu hover:opacity-90 transition duration-fast"
            >
              Run Analysis
            </button>
          </div>
        </div>
      </section>

      {/* REPORTS */}
      <section className="bg-neu-surface shadow-neu rounded-neu p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-display font-bold text-krato">
              Reports
            </h2>

            <p className="text-gray-500 mt-1">
              Generated competitor intelligence reports
            </p>
          </div>
        </div>

        {reports.length === 0 ? (
          <div className="bg-white shadow-neu rounded-neu p-10 text-center">
            <p className="text-gray-500">
              No reports generated yet.
            </p>

            <p className="text-gray-400 text-sm mt-2">
              Run your first analysis to generate insights.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {reports.map((report) => (
              <div
                key={report.report_id}
                className="bg-white rounded-neu shadow-neu p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition hover:scale-[1.01]"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-neu-text">
                      {report.report_title}
                    </h3>

                    <span
                      className={`status-pill ${
                        report.status === "ready"
                          ? "status-ready"
                          : report.status === "processing"
                          ? "status-processing"
                          : "status-failed"
                      }`}
                    >
                      {report.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-6 text-sm text-gray-500">
                    <span>
                      Authority Score:{" "}
                      {report.brand_authority_score ?? 0}
                    </span>

                    <span>
                      Backlinks:{" "}
                      {report.estimated_backlinks ?? 0}
                    </span>

                    <span>
                      Sentiment:{" "}
                      {report.sentiment_score ?? 0}
                    </span>
                  </div>

                  {report.generated_at && (
                    <p className="text-xs text-gray-400 mt-3">
                      Generated{" "}
                      {new Date(
                        report.generated_at
                      ).toLocaleString()}
                    </p>
                  )}
                </div>

                <button
                  onClick={() =>
                    router.push(
                      `/dashboard/${projectId}/reports/${report.report_id}`
                    )
                  }
                  className="px-6 py-3 rounded-full bg-krato text-white font-semibold hover:opacity-90 transition"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function InfoCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-neu p-5">
      <p className="text-sm text-gray-500 mb-2">
        {title}
      </p>

      <p className="font-semibold text-neu-text break-words">
        {value}
      </p>
    </div>
  );
}