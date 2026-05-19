// frontend/app/dashboard/new/page.tsx
"use client";
import React, { useState, useRef, useEffect } from "react";

// List of suggested niches (add/remove as desired)
const SUGGESTED_NICHES = [
  "E-Commerce",
  "SaaS",
  "Personal Brand",
  "Education",
  "Non-Profit",
  "Healthcare",
  "Finance",
  "Fitness",
  "Real Estate",
  "Food & Beverage",
];

const STEPS = [
  "Project Info",
  "Niche",
  "Target Audience",
  "Marketing Goals & Budget",
  "Competitors",
];

export default function NewProjectOnboarding() {
  const [step, setStep] = useState(0);
  const [anim, setAnim] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  // Form state
  const [projectName, setProjectName] = useState("");
  const [brandWebsite, setBrandWebsite] = useState("");

  const [niche, setNiche] = useState("");
  const [customNiche, setCustomNiche] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [marketingGoals, setMarketingGoals] = useState("");
  const [budget, setBudget] = useState("");

  const [competitors, setCompetitors] = useState<{ website_url: string }[]>([
    { website_url: "" },
  ]);

  // Transition animation
  const nextStep = () => {
    setAnim("animate-fade-out-left");
    setTimeout(() => {
      setStep((s) => s + 1);
      setAnim("animate-fade-in-right");
      setTimeout(() => setAnim(""), 400);
    }, 250);
  };
  const prevStep = () => {
    setAnim("animate-fade-out-right");
    setTimeout(() => {
      setStep((s) => s - 1);
      setAnim("animate-fade-in-left");
      setTimeout(() => setAnim(""), 400);
    }, 250);
  };

  // Reset animation on step change
  useEffect(() => {
    setAnim("");
  }, [step]);

  // Backend submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const token = typeof window !== "undefined" ? localStorage.getItem("krato_token") : undefined;
      const res = await fetch(`${api}/api/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          project_name: projectName,
          brand_website: brandWebsite,
          niche: niche || customNiche,
          target_audience: targetAudience,
          marketing_goals: marketingGoals,
          budget,
          competitors: competitors
            .map((c) => c.website_url.trim())
            .filter(Boolean)
            .map((website_url) => ({ website_url }))
            .slice(0, 5),
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      setDone(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // ADD transitions in your globals.css:
  // .animate-fade-out-left { animation: fadeOutLeft .25s both; }
  // .animate-fade-in-right { animation: fadeInRight .4s both; }
  // .animate-fade-out-right { animation: fadeOutRight .25s both; }
  // .animate-fade-in-left { animation: fadeInLeft .4s both; }
  // (add simple keyframes: you can use framer-motion or tailwind-animate if you want, otherwise add keyframes in css)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neu-bg px-4 py-10">
      <div className="max-w-xl w-full bg-white shadow-neu rounded-neu px-12 py-12 animate-in fade-in duration-500">
        {!done ? (
          <form onSubmit={handleSubmit}>
            {/* Step Indicator */}
            <div className="flex items-center mb-8">
              {STEPS.map((label, i) => (
                <div key={i} className="flex items-center">
                  <div
                    className={`w-6 h-6 flex items-center justify-center rounded-full font-bold text-sm ${
                      i <= step
                        ? "bg-krato text-white"
                        : "bg-neu-edge text-neu-text"
                    }`}
                  >
                    {i + 1}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="h-1 w-7 bg-neu-edge mx-1 rounded" />
                  )}
                </div>
              ))}
            </div>

            <h1 className="text-2xl font-display font-bold text-krato mb-3 text-center">
              {STEPS[step]}
            </h1>

            {/* Step 1: Project Info */}
            <div className={step === 0 ? `${anim}` : "hidden"}>
              <label className="block mb-4">
                <span className="text-neu-text font-semibold">Project Name</span>
                <input
                  className="mt-1 w-full rounded-neu px-4 py-2 bg-neu-surface border border-neu-edge focus:outline-none focus:ring-2 focus:ring-krato"
                  placeholder="e.g. Growthify"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  required
                  maxLength={40}
                />
              </label>
              <label className="block mb-6">
                <span className="text-neu-text font-semibold">Brand Website URL</span>
                <input
                  className="mt-1 w-full rounded-neu px-4 py-2 bg-neu-surface border border-neu-edge focus:outline-none focus:ring-2 focus:ring-krato"
                  placeholder="e.g. https://growthify.com"
                  type="url"
                  value={brandWebsite}
                  onChange={(e) => setBrandWebsite(e.target.value)}
                  required
                />
              </label>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="rounded-full bg-krato text-white font-semibold px-8 py-2 shadow transition hover:opacity-90"
                  onClick={nextStep}
                  disabled={!projectName || !brandWebsite}
                >
                  Next
                </button>
              </div>
            </div>

            {/* Step 2: Niche */}
            <div className={step === 1 ? `${anim}` : "hidden"}>
              <div className="mb-4">
                <div className="font-semibold text-neu-text mb-2">Select a Niche</div>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_NICHES.map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={`px-4 py-2 rounded-full border ${
                        niche === n
                          ? "bg-krato text-white border-krato"
                          : "bg-neu-surface text-neu-text border-neu-edge"
                      } transition`}
                      onClick={() => {
                        setNiche(n);
                        setCustomNiche("");
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <div className="mt-4">
                  <input
                    className="rounded-neu px-4 py-2 w-full bg-neu-surface border border-neu-edge focus:outline-none focus:ring-2 focus:ring-krato"
                    value={customNiche}
                    onChange={(e) => {
                      setCustomNiche(e.target.value);
                      setNiche("");
                    }}
                    placeholder="Or add your own niche"
                  />
                </div>
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  className="rounded-full text-krato px-8 py-2 transition hover:bg-neu-surface"
                  onClick={prevStep}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="rounded-full bg-krato text-white font-semibold px-8 py-2 shadow transition hover:opacity-90"
                  onClick={nextStep}
                  disabled={!(niche || customNiche)}
                >
                  Next
                </button>
              </div>
            </div>

            {/* Step 3: Target Audience */}
            <div className={step === 2 ? `${anim}` : "hidden"}>
              <label className="block mb-6">
                <span className="text-neu-text font-semibold">
                  Who is your target audience?
                </span>
                <input
                  className="mt-1 w-full rounded-neu px-4 py-2 bg-neu-surface border border-neu-edge focus:outline-none focus:ring-2 focus:ring-krato"
                  placeholder="Describe your ideal customers or users"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  maxLength={80}
                  required
                />
              </label>
              <div className="flex justify-between">
                <button
                  type="button"
                  className="rounded-full text-krato px-8 py-2 transition hover:bg-neu-surface"
                  onClick={prevStep}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="rounded-full bg-krato text-white font-semibold px-8 py-2 shadow transition hover:opacity-90"
                  onClick={nextStep}
                  disabled={!targetAudience}
                >
                  Next
                </button>
              </div>
            </div>

            {/* Step 4: Marketing Goals & Budget */}
            <div className={step === 3 ? `${anim}` : "hidden"}>
              <label className="block mb-4">
                <span className="text-neu-text font-semibold">
                  What are your main marketing goals?
                </span>
                <input
                  className="mt-1 w-full rounded-neu px-4 py-2 bg-neu-surface border border-neu-edge focus:outline-none focus:ring-2 focus:ring-krato"
                  placeholder="e.g. Acquire leads, Brand awareness"
                  value={marketingGoals}
                  onChange={(e) => setMarketingGoals(e.target.value)}
                  maxLength={80}
                  required
                />
              </label>
              <label className="block mb-6">
                <span className="text-neu-text font-semibold">Monthly Budget (USD)</span>
                <input
                  type="number"
                  className="mt-1 w-full rounded-neu px-4 py-2 bg-neu-surface border border-neu-edge focus:outline-none focus:ring-2 focus:ring-krato"
                  placeholder="e.g. 1000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  min={0}
                />
              </label>
              <div className="flex justify-between">
                <button
                  type="button"
                  className="rounded-full text-krato px-8 py-2 transition hover:bg-neu-surface"
                  onClick={prevStep}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="rounded-full bg-krato text-white font-semibold px-8 py-2 shadow transition hover:opacity-90"
                  onClick={nextStep}
                  disabled={!marketingGoals}
                >
                  Next
                </button>
              </div>
            </div>

            {/* Step 5: Competitors */}
            <div className={step === 4 ? `${anim}` : "hidden"}>
              <div className="mb-6">
                <div className="font-semibold text-neu-text mb-1">Add up to 5 competitors</div>
                <div className="flex flex-col gap-3">
                  {competitors.map((c, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="url"
                        className="flex-1 rounded-neu px-4 py-2 bg-neu-surface border border-neu-edge focus:outline-none focus:ring-2 focus:ring-krato"
                        placeholder={`Competitor website #${idx + 1}`}
                        value={c.website_url}
                        onChange={(e) =>
                          setCompetitors((prev) =>
                            prev.map((v, i) =>
                              i === idx ? { ...v, website_url: e.target.value } : v
                            )
                          )
                        }
                        maxLength={80}
                      />
                      {competitors.length > 1 && (
                        <button
                          type="button"
                          className="rounded-full bg-red-100 text-red-600 font-bold px-3 py-1"
                          onClick={() =>
                            setCompetitors((prev) =>
                              prev.filter((_, i) => i !== idx)
                            )
                          }
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="mt-4 mb-1 rounded-full border-2 border-krato text-krato px-4 py-1 font-semibold hover:bg-krato-light transition"
                  disabled={competitors.length >= 5}
                  onClick={() =>
                    setCompetitors((prev) => [...prev, { website_url: "" }])
                  }
                >
                  + Add Competitor
                </button>
              </div>
              {error && (
                <div className="mb-2 text-red-500">{error}</div>
              )}
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  className="rounded-full text-krato px-8 py-2 transition hover:bg-neu-surface"
                  onClick={prevStep}
                >
                  Back
                </button>
                <button
                  className="rounded-full bg-krato text-white font-semibold px-8 py-2 shadow transition hover:opacity-90 flex items-center gap-2"
                  disabled={loading}
                  type="submit"
                >
                  {loading ? (
                    <span className="animate-spin w-4 h-4 border-2 border-t-transparent border-white rounded-full" />
                  ) : (
                    "Create Project"
                  )}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="flex flex-col items-center py-12">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-2xl font-bold font-display text-krato mb-2">Project Created!</h2>
            <p className="text-gray-600 mb-6 text-center">
              Your project has been onboarded successfully. You can now view it in your dashboard.
            </p>
            <a
              href="/dashboard"
              className="rounded-full bg-krato text-white font-semibold px-8 py-2 shadow transition hover:opacity-90"
            >
              Go to Dashboard
            </a>
          </div>
        )}
      </div>
      {/* Add minimal CSS for transitions (add these to your globals.css): */}
      <style>
        {`
        @keyframes fadeOutLeft { to { opacity:0; transform: translateX(-40px);} }
        @keyframes fadeInRight { from {opacity:0; transform: translateX(40px);} to {opacity:1; transform:translateX(0);} }
        @keyframes fadeOutRight { to { opacity:0; transform: translateX(40px);} }
        @keyframes fadeInLeft { from {opacity:0; transform: translateX(-40px);} to {opacity:1; transform:translateX(0);} }
        .animate-fade-out-left { animation: fadeOutLeft .25s both; }
        .animate-fade-in-right { animation: fadeInRight .4s both; }
        .animate-fade-out-right { animation: fadeOutRight .25s both; }
        .animate-fade-in-left { animation: fadeInLeft .4s both; }
        `}
      </style>
    </div>
  );
}