"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  Cell,
} from "recharts";

type CompetitorAnalytics = {
  competitor_id: number;
  domain: string;
  authority_score: number;
  backlink_count: number;
  sentiment_score: number;
  extracted_keywords: string[] | string;
};

type ReportData = {
  report_id: number;
  report_title: string;
  report_content: string;
  brand_authority_score: number;
  estimated_backlinks: number;
  extracted_keywords: string[];
  sentiment_score: number;
  generated_at: string;
  brand_website: string;
  competitor_analytics: CompetitorAnalytics[];
};

const api = process.env.NEXT_PUBLIC_API_URL;
const BRAND_COLOR = "#22d3ee";
const COMPETITOR_COLOR = "#52525b";

export default function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string; reportId: string }>;
}) {
  // The critical Next.js v14+ pattern for Client Components with async params:
  const { id, reportId } = React.use(params);

  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [animatedAuthority, setAnimatedAuthority] = useState(0);

  useEffect(() => {
    if (!reportId) return;
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId]);

  useEffect(() => {
    if (!report) return;

    let start = 0;
    const interval = setInterval(() => {
      start += 1;
      if (start >= report.brand_authority_score) {
        start = report.brand_authority_score;
        clearInterval(interval);
      }
      setAnimatedAuthority(start);
    }, 20);

    return () => clearInterval(interval);
  }, [report]);

  async function fetchReport() {
    try {
      const token = localStorage.getItem("krato_token");
      const res = await fetch(`${api}/api/reports/${reportId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      setReport(data.report);
    } catch (err) {
      console.error("Failed to fetch report:", err);
    } finally {
      setLoading(false);
    }
  }

  const authorityChartData = useMemo(() => {
    if (!report) return [];
    return [
      {
        domain: "Your Brand",
        authority: report.brand_authority_score,
        isBrand: true,
      },
      ...report.competitor_analytics.map((c) => ({
        domain: c.domain.replace("www.", "").slice(0, 15),
        authority: c.authority_score,
        isBrand: false,
      })),
    ];
  }, [report]);

  const sentimentData = useMemo(() => {
    if (!report) return [];
    return [
      {
        domain: "Your Brand",
        sentiment: Number((report.sentiment_score * 100).toFixed(1)),
        isBrand: true,
      },
      ...report.competitor_analytics.map((c) => ({
        domain: c.domain.replace("www.", "").slice(0, 15),
        sentiment: Number((c.sentiment_score * 100).toFixed(1)),
        isBrand: false,
      })),
    ];
  }, [report]);

  const backlinkData = useMemo(() => {
    if (!report) return [];
    return [
      {
        domain: "Your Brand",
        backlinks: report.estimated_backlinks,
      },
      ...report.competitor_analytics.map((c) => ({
        domain: c.domain.replace("www.", "").slice(0, 15),
        backlinks: c.backlink_count,
      })),
    ];
  }, [report]);

  const radarData = useMemo(() => {
    if (!report) return [];
    return [
      {
        metric: "Authority",
        value: report.brand_authority_score,
      },
      {
        metric: "Sentiment",
        value: report.sentiment_score * 100,
      },
      {
        metric: "Backlinks",
        value: Math.min(100, (report.estimated_backlinks / 10000) * 100),
      },
      {
        metric: "Keywords",
        value: Math.min(100, (report.extracted_keywords?.length || 0) * 2),
      },
    ];
  }, [report]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-zinc-400">Loading report...</div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-zinc-400">Failed to load report.</div>
      </div>
    );
  }

  const radius = 115;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (animatedAuthority / 100) * circumference;

  return (
    <div className="min-h-screen bg-black text-white px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-950 to-zinc-900 p-8 shadow-2xl"
      >
        <div className="flex flex-col lg:flex-row justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-bold mb-2">{report.report_title}</h1>
            <p className="text-zinc-400 text-lg">Digital Marketing Intelligence</p>
            <p className="text-[#408CF1] mt-3 text-sm font-medium">
              {report.brand_website}
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 min-w-[240px]">
            <p className="text-zinc-500 text-sm mb-1">Competitors Analyzed</p>
            <h2 className="text-5xl font-bold text-white">
              {report.competitor_analytics.length}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-4 bg-zinc-900 rounded-3xl border border-zinc-800 p-6 flex flex-col items-center justify-center">
            <h2 className="text-xl font-semibold mb-8">Authority Score</h2>
            <div className="relative w-[280px] h-[280px]">
              <svg className="w-full h-full rotate-[-90deg]">
                <circle
                  cx="140"
                  cy="140"
                  r={radius}
                  stroke="#27272a"
                  strokeWidth="18"
                  fill="transparent"
                />
                <motion.circle
                  cx="140"
                  cy="140"
                  r={radius}
                  stroke={BRAND_COLOR}
                  strokeWidth="18"
                  fill="transparent"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  animate={{ strokeDashoffset: progress }}
                  transition={{ duration: 1.2 }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-6xl font-bold" style={{ color: BRAND_COLOR }}>
                  {animatedAuthority}
                </span>
                <span className="text-zinc-500 mt-2">/ 100</span>
              </div>
            </div>
            <p className="mt-8 text-center text-zinc-400 text-sm">
              Your brand authority based on backlinks, keywords, and sentiment analysis
            </p>
          </div>

          <div className="xl:col-span-5 bg-zinc-900 rounded-3xl border border-zinc-800 p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-semibold">Authority Comparison</h2>
              <span className="text-sm text-zinc-500">Brand vs Competitors</span>
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={authorityChartData}>
                  <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                  <XAxis dataKey="domain" stroke="#71717a" tick={{ fill: "#a1a1aa" }} />
                  <YAxis stroke="#71717a" tick={{ fill: "#a1a1aa" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      border: "1px solid #27272a",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="authority" radius={[8, 8, 0, 0]}>
                    {authorityChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.isBrand ? BRAND_COLOR : COMPETITOR_COLOR}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="xl:col-span-3 bg-zinc-900 rounded-3xl border border-zinc-800 p-6">
            <h2 className="text-xl font-semibold mb-5">Sentiment</h2>
            <div className="space-y-4">
              {sentimentData.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 25 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className={`flex items-center justify-between bg-zinc-950 rounded-xl px-4 py-4 border ${
                    item.isBrand ? "border-cyan-500/30" : "border-zinc-800"
                  }`}
                >
                  <div>
                    <p className="font-medium text-white">{item.domain}</p>
                    <p className="text-xs text-zinc-500">Score</p>
                  </div>
                  <div className="text-2xl font-bold" style={{ color: item.isBrand ? BRAND_COLOR : "#4ade80" }}>
                    {item.sentiment}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
          <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-semibold">Backlink Strength</h2>
            </div>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={backlinkData}>
                  <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                  <XAxis dataKey="domain" stroke="#71717a" tick={{ fill: "#a1a1aa" }} />
                  <YAxis stroke="#71717a" tick={{ fill: "#a1a1aa" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      border: "1px solid #27272a",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="backlinks"
                    stroke={BRAND_COLOR}
                    strokeWidth={3}
                    dot={{ r: 5, fill: BRAND_COLOR }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-semibold">Performance Radar</h2>
            </div>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#3f3f46" />
                  <PolarAngleAxis dataKey="metric" stroke="#d4d4d8" />
                  <PolarRadiusAxis stroke="#71717a" />
                  <Radar
                    dataKey="value"
                    stroke={BRAND_COLOR}
                    fill={BRAND_COLOR}
                    strokeWidth={2}
                    fillOpacity={0.25}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-8"
      >
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-zinc-800">
          <div>
            <h2 className="text-3xl font-bold mb-2 text-white">AI Strategy Report</h2>
            <p className="text-zinc-500">Generated competitive intelligence</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-zinc-600">Generated</p>
            <p className="text-zinc-400 text-sm">
              {new Date(report.generated_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="prose prose-invert max-w-none 
          prose-headings:text-white prose-headings:font-bold
          prose-h1:text-3xl prose-h1:mb-6 prose-h1:mt-8 prose-h1:text-[#408CF1]
          prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-6 prose-h2:text-cyan-400
          prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-4 prose-h3:text-cyan-300
          prose-p:text-zinc-300 prose-p:leading-7 prose-p:mb-4
          prose-li:text-zinc-300 prose-li:my-1
          prose-strong:text-white prose-strong:font-semibold
          prose-ul:my-4 prose-ol:my-4
          prose-code:text-cyan-400 prose-code:bg-zinc-900 prose-code:px-1 prose-code:rounded">
          <ReactMarkdown>{report.report_content}</ReactMarkdown>
        </div>
      </motion.div>
    </div>
  );
}