"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Competitor = {
  competitor_id?: number;
  website_url: string;
};

export default function AnalyzeProjectPage() {
  const params = useParams();
  const router = useRouter();

  const projectId = params.id;

  const api = process.env.NEXT_PUBLIC_API_URL;

  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [projectName, setProjectName] = useState("");
  const [brandWebsite, setBrandWebsite] = useState("");
  const [niche, setNiche] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [marketingGoals, setMarketingGoals] = useState("");
  const [budget, setBudget] = useState("");

  const [reportTitle, setReportTitle] = useState("");

  const [competitors, setCompetitors] = useState<Competitor[]>([
    { website_url: "" },
  ]);

  useEffect(() => {
    fetchProject();
  }, []);

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

      if (!res.ok) {
        throw new Error(data.error || "Failed to load project");
      }

      const project = data.project;

      setProjectName(project.project_name || "");
      setBrandWebsite(project.brand_website || "");
      setNiche(project.niche || "");
      setTargetAudience(project.target_audience || "");
      setMarketingGoals(project.marketing_goals || "");
      setBudget(project.budget?.toString() || "");
      setReportTitle(`Analysis for ${project.project_name}`);

      if (
        Array.isArray(project.competitors) &&
        project.competitors.length > 0
      ) {
        setCompetitors(project.competitors);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load project");
    } finally {
      setLoading(false);
    }
  }

  async function handleRunAnalysis(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setError("");
    setRunning(true);

    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("krato_token")
          : null;

      const res = await fetch(`${api}/api/analysis`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({
          project_id: Number(projectId),
          project_name: projectName,
          brand_website: brandWebsite,
          niche,
          target_audience: targetAudience,
          marketing_goals: marketingGoals,
          budget,
          competitors: competitors
            .map((c) => ({
              website_url: c.website_url.trim(),
            }))
            .filter((c) => c.website_url),
          report_title: reportTitle,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Failed to start analysis"
        );
      }

      router.push(`/dashboard/${projectId}`);
    } catch (err: any) {
      setError(
        err.message || "Something went wrong"
      );
    } finally {
      setRunning(false);
    }
  }

  function addCompetitor() {
    if (competitors.length >= 5) return;

    setCompetitors((prev) => [
      ...prev,
      { website_url: "" },
    ]);
  }

  function removeCompetitor(index: number) {
    setCompetitors((prev) =>
      prev.filter((_, i) => i !== index)
    );
  }

  function updateCompetitor(
    index: number,
    value: string
  ) {
    setCompetitors((prev) =>
      prev.map((c, i) =>
        i === index
          ? { ...c, website_url: value }
          : c
      )
    );
  }

  if (loading) {
    return (
      <div className="text-gray-400 text-lg">
        Loading analysis setup...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-4xl font-display font-bold text-krato mb-2">
          Run Analysis
        </h1>

        <p className="text-gray-500">
          Configure your project analysis and
          competitor intelligence report.
        </p>
      </div>

      <form
        onSubmit={handleRunAnalysis}
        className="space-y-8"
      >
        {/* PROJECT INFO */}
        <section className="bg-neu-surface shadow-neu rounded-neu p-8">
          <h2 className="text-2xl font-display font-bold text-krato mb-6">
            Project Information
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <InputField
              label="Project Name"
              value={projectName}
              onChange={setProjectName}
              required
            />

            <InputField
              label="Brand Website"
              value={brandWebsite}
              onChange={setBrandWebsite}
              type="url"
              required
            />

            <InputField
              label="Niche"
              value={niche}
              onChange={setNiche}
            />

            <InputField
              label="Target Audience"
              value={targetAudience}
              onChange={setTargetAudience}
            />

            <InputField
              label="Marketing Goals"
              value={marketingGoals}
              onChange={setMarketingGoals}
            />

            <InputField
              label="Budget (USD)"
              value={budget}
              onChange={setBudget}
              type="number"
            />
          </div>
        </section>

        {/* REPORT CONFIG */}
        <section className="bg-neu-surface shadow-neu rounded-neu p-8">
          <h2 className="text-2xl font-display font-bold text-krato mb-6">
            Report Configuration
          </h2>

          <InputField
            label="Report Title"
            value={reportTitle}
            onChange={setReportTitle}
            required
          />
        </section>

        {/* COMPETITORS */}
        <section className="bg-neu-surface shadow-neu rounded-neu p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-display font-bold text-krato">
                Competitors
              </h2>

              <p className="text-gray-500 mt-1">
                Add up to 5 competitors for
                comparative analysis.
              </p>
            </div>

            <button
              type="button"
              onClick={addCompetitor}
              disabled={competitors.length >= 5}
              className="px-5 py-2 rounded-full border-2 border-krato text-krato font-semibold hover:bg-krato-light transition disabled:opacity-50"
            >
              + Add
            </button>
          </div>

          <div className="space-y-4">
            {competitors.map((comp, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-neu p-5 flex gap-4 items-center"
              >
                <input
                  type="url"
                  value={comp.website_url}
                  onChange={(e) =>
                    updateCompetitor(
                      index,
                      e.target.value
                    )
                  }
                  placeholder={`Competitor Website #${
                    index + 1
                  }`}
                  className="flex-1 bg-neu-surface border border-neu-edge rounded-xl px-4 py-3 focus:ring-2 focus:ring-krato"
                />

                {competitors.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      removeCompetitor(index)
                    }
                    className="w-10 h-10 rounded-full bg-red-100 text-red-500 font-bold hover:opacity-80 transition"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ERROR */}
        {error && (
          <div className="bg-red-100 border border-red-200 text-red-600 rounded-2xl px-5 py-4">
            {error}
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex items-center justify-end gap-4 pb-10">
          <button
            type="button"
            onClick={() =>
              router.push(`/dashboard/${projectId}`)
            }
            className="px-6 py-3 rounded-full bg-white shadow-neu font-semibold text-neu-text hover:opacity-90 transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={running}
            className="px-8 py-3 rounded-full bg-krato text-white font-semibold shadow-neu hover:opacity-90 transition min-w-[180px]"
          >
            {running
              ? "Starting Analysis..."
              : "Run Analysis"}
          </button>
        </div>
      </form>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-neu-text">
        {label}
      </span>

      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="mt-2 w-full bg-white border border-neu-edge rounded-2xl px-4 py-3 focus:ring-2 focus:ring-krato"
      />
    </label>
  );
}