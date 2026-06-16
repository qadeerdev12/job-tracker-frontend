import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import Login from "./pages/Login";
import Register from "./pages/Register";
import LandingPage from "./pages/LandingPage";
import { supabase } from "./lib/supabase";

const API = "https://job-tracker-backend-s1fc.onrender.com";

const STATUS_STYLES = {
  Applied: { badge: "bg-brand-100 text-brand-700", btn: "bg-brand-50 text-brand-600 hover:bg-brand-100", dot: "bg-brand-500" },
  Interview: { badge: "bg-amber-100 text-amber-700", btn: "bg-amber-50 text-amber-600 hover:bg-amber-100", dot: "bg-amber-500" },
  Offer: { badge: "bg-emerald-100 text-emerald-700", btn: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100", dot: "bg-emerald-500" },
  Rejected: { badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400", btn: "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50", dot: "bg-red-500" },
};

const CHART_COLORS_LIGHT = ["#4f46e5", "#f59e0b", "#10b981", "#6b7280"];
const CHART_COLORS_DARK = ["#3b82f6", "#f59e0b", "#10b981", "#64748b"];

const inputClass = "w-full border border-input-border bg-input-bg px-4 py-2.5 rounded-lg text-sm text-heading focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 focus:bg-card outline-none transition-all";

const PRESET_TAGS = ["Remote", "On-site", "Hybrid", "Frontend", "Backend", "Full Stack", "Graduate", "Contract", "Full-time", "Part-time", "Visa Sponsorship", "Internship"];

const TAG_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-pink-100 text-pink-700",
  "bg-teal-100 text-teal-700",
  "bg-orange-100 text-orange-700",
  "bg-cyan-100 text-cyan-700",
  "bg-rose-100 text-rose-700",
  "bg-indigo-100 text-indigo-700",
  "bg-lime-100 text-lime-700",
  "bg-fuchsia-100 text-fuchsia-700",
];

function getTagColor(tag) {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}

function TagInput({ tags, setTags, allTags }) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = [...new Set([...PRESET_TAGS, ...allTags])]
    .filter((t) => !tags.includes(t) && t.toLowerCase().includes(input.toLowerCase()))
    .slice(0, 8);

  const addTag = (tag) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setInput("");
    setShowSuggestions(false);
  };

  const removeTag = (tag) => setTags(tags.filter((t) => t !== tag));

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === "Backspace" && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className="relative">
      <div className={`${inputClass} flex flex-wrap gap-1.5 min-h-[42px] py-1.5 px-2.5 cursor-text`} onClick={() => document.getElementById("tag-input-field")?.focus()}>
        {tags.map((tag) => (
          <span key={tag} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${getTagColor(tag)}`}>
            {tag}
            <button type="button" onClick={(e) => { e.stopPropagation(); removeTag(tag); }} className="hover:opacity-70">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </span>
        ))}
        <input
          id="tag-input-field"
          type="text"
          value={input}
          onChange={(e) => { setInput(e.target.value); setShowSuggestions(true); }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? "Type or select tags..." : ""}
          className="flex-1 min-w-[100px] outline-none bg-transparent text-sm py-1"
        />
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-card border border-line-strong rounded-lg shadow-lg max-h-40 overflow-y-auto">
          {suggestions.map((tag) => (
            <button
              key={tag}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => addTag(tag)}
              className="w-full text-left px-3 py-2 text-sm text-body hover:bg-brand-50 hover:text-brand-700 transition-colors"
            >
              <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium mr-2 ${getTagColor(tag)}`}>{tag}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function getWeeklyData(jobs) {
  const weeks = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (i * 7 + now.getDay()));
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const count = jobs.filter((job) => {
      const created = new Date(job.createdAt);
      return created >= weekStart && created < weekEnd;
    }).length;

    const label = weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    weeks.push({ week: label, count });
  }

  return weeks;
}

function Sidebar({ activeTab, setActiveTab, handleLogout, initials, userName }) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
    { id: "applications", label: "Applications", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg> },
    { id: "archived", label: "Archived", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg> },
    { id: "activity", label: "Activity", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { id: "add", label: "Add New", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg> },
    { id: "ai", label: "AI Tailor", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" /></svg> },
  ];

  return (
    <aside className="h-full w-full bg-sidebar flex flex-col">
      <div className="p-6 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-400 to-brand-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><rect x="3" y="7" width="18" height="13" rx="2" strokeLinecap="round" strokeLinejoin="round" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V5.5A1.5 1.5 0 019.5 4h5A1.5 1.5 0 0116 5.5V7" /><polyline points="9,13.5 11,15.5 15,11.5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <span className="text-xl font-bold text-brand-400 tracking-tight">ApplyFlow</span>
        </div>
      </div>

      <nav className="flex-1 px-3 mt-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium mb-1 transition-all ${
              activeTab === item.id
                ? "bg-brand-600 text-white shadow-lg shadow-brand-600/25"
                : "text-muted hover:text-white hover:bg-white/5"
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-9 h-9 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-brand-400 truncate">{userName}</p>
            <p className="text-xs text-body">Free Plan</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2.5 text-muted hover:text-red-400 hover:bg-red-500/10 rounded-xl text-sm transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          Sign Out
        </button>
      </div>
    </aside>
  );
}

function ThemeToggle() {
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="p-2 rounded-lg text-muted hover:text-heading hover:bg-card transition-colors"
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {dark ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>
      )}
    </button>
  );
}

function AITailorTab({ authHeader }) {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [remaining, setRemaining] = useState(null);

  const canAnalyze = resumeText.trim().length >= 20 && jobDescription.trim().length >= 20;

  const handleAnalyze = async () => {
    if (resumeText.trim().length < 20) {
      setError("Please paste your resume (at least 20 characters)");
      return;
    }
    if (jobDescription.trim().length < 20) {
      setError("Please paste a job description (at least 20 characters)");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const res = await axios.post(`${API}/api/ai/tailor`, { jobDescription, resumeText }, authHeader());
      setResult(res.data.result);
      setRemaining(res.data.remaining);
    } catch (err) {
      setError(err.response?.data?.message || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (score) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-amber-500";
    return "text-red-500";
  };

  const scoreBg = (score) => {
    if (score >= 80) return "from-emerald-500 to-emerald-400";
    if (score >= 60) return "from-amber-500 to-amber-400";
    return "from-red-500 to-red-400";
  };

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <div className="bg-card rounded-xl border border-line p-6 mb-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-brand-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-heading">AI Resume Tailor</h3>
              <p className="text-xs text-muted">Paste your resume and a job description to get a personalized gap analysis</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-heading mb-1.5">Your Resume</label>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume text here..."
                rows={10}
                className={`${inputClass} resize-none`}
              />
              <p className="text-xs text-muted mt-1">{resumeText.length}/8000</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-heading mb-1.5">Job Description</label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                rows={10}
                className={`${inputClass} resize-none`}
              />
              <p className="text-xs text-muted mt-1">{jobDescription.length}/5000</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 p-2 rounded-lg mb-4 text-sm">{error}</div>
          )}

          <div className="flex items-center justify-between">
            <button
              onClick={handleAnalyze}
              disabled={loading || !canAnalyze}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-brand-600 hover:from-purple-600 hover:to-brand-700 text-white text-sm font-medium rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Analyzing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
                  Analyze & Tailor
                </>
              )}
            </button>
            {remaining !== null && (
              <span className="text-xs text-muted">{remaining} requests remaining today</span>
            )}
          </div>
        </div>

        {result && !result.raw && (
          <div className="space-y-5">
            {/* Match Score */}
            {result.match_score != null && (
              <div className="bg-card rounded-xl border border-line p-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-heading flex items-center gap-2">
                    <svg className="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
                    Match Score
                  </h4>
                  <span className={`text-3xl font-bold ${scoreColor(result.match_score)}`}>{result.match_score}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div className={`h-2.5 rounded-full bg-gradient-to-r ${scoreBg(result.match_score)}`} style={{ width: `${result.match_score}%` }} />
                </div>
              </div>
            )}

            {/* Role Summary */}
            {result.role_summary && (
              <div className="bg-card rounded-xl border border-line p-5">
                <h4 className="text-sm font-semibold text-heading mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Role Summary
                </h4>
                <p className="text-sm text-body">{result.role_summary}</p>
              </div>
            )}

            {/* Strengths & Gaps side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {result.strengths && (
                <div className="bg-card rounded-xl border border-line p-5">
                  <h4 className="text-sm font-semibold text-heading mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Your Strengths
                  </h4>
                  <ul className="space-y-2">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-body">
                        <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.gaps && (
                <div className="bg-card rounded-xl border border-line p-5">
                  <h4 className="text-sm font-semibold text-heading mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
                    Gaps to Address
                  </h4>
                  <ul className="space-y-2">
                    {result.gaps.map((g, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-body">
                        <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                        {g}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Keywords */}
            {result.keywords && (
              <div className="bg-card rounded-xl border border-line p-5">
                <h4 className="text-sm font-semibold text-heading mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                  Keywords to Include
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.keywords.map((kw, i) => (
                    <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs font-medium">{kw}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Resume Tips */}
            {result.resume_tips && (
              <div className="bg-card rounded-xl border border-line p-5">
                <h4 className="text-sm font-semibold text-heading mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" /></svg>
                  Resume Tips
                </h4>
                <ul className="space-y-3">
                  {result.resume_tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-body">
                      <span className="w-5 h-5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Bullet Rewrites */}
            {result.bullet_rewrites && (
              <div className="bg-card rounded-xl border border-line p-5">
                <h4 className="text-sm font-semibold text-heading mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
                  Rewritten Bullet Points
                </h4>
                <p className="text-xs text-muted mb-3">Your experience reframed for this specific role</p>
                <ul className="space-y-3">
                  {result.bullet_rewrites.map((bullet, i) => (
                    <li key={i} className="text-sm text-body bg-brand-50/50 dark:bg-brand-900/20 rounded-lg p-3 border-l-3 border-brand-500">
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Cover Letter Hook */}
            {result.cover_letter_hook && (
              <div className="bg-gradient-to-r from-purple-50 to-brand-50 dark:from-purple-900/20 dark:to-brand-900/20 rounded-xl border border-line p-5">
                <h4 className="text-sm font-semibold text-heading mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                  Cover Letter Opening
                </h4>
                <p className="text-sm text-body italic">"{result.cover_letter_hook}"</p>
              </div>
            )}
          </div>
        )}

        {result && result.raw && (
          <div className="bg-card rounded-xl border border-line p-5">
            <h4 className="text-sm font-semibold text-heading mb-2">AI Analysis</h4>
            <p className="text-sm text-body whitespace-pre-wrap">{result.raw}</p>
          </div>
        )}
      </div>
    </>
  );
}

function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({ Applied: 0, Interview: 0, Offer: 0, Rejected: 0 });
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("Applied");
  const [link, setLink] = useState("");
  const [notes, setNotes] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [formTags, setFormTags] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterTag, setFilterTag] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [allTags, setAllTags] = useState([]);

  const [archivedJobs, setArchivedJobs] = useState([]);
  const [activities, setActivities] = useState([]);
  const [editJob, setEditJob] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [expandedTimeline, setExpandedTimeline] = useState(null);
  const [reminders, setReminders] = useState([]);

  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => setSession(s));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  const userName = session?.user?.user_metadata?.name || session?.user?.user_metadata?.full_name || session?.user?.email?.split("@")[0] || "User";
  const firstName = userName.split(" ")[0];
  const initials = userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const authHeader = () => ({
    headers: { Authorization: `Bearer ${session?.access_token}` },
  });

  const fetchJobs = async () => {
    try {
      const res = await axios.get(`${API}/api/jobs`, authHeader());
      setJobs(res.data);
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API}/api/jobs/stats`, authHeader());
      setStats(res.data);
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  const fetchTags = async () => {
    try {
      const res = await axios.get(`${API}/api/jobs/tags`, authHeader());
      setAllTags(res.data);
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  const fetchActivities = async () => {
    try {
      const res = await axios.get(`${API}/api/jobs/activities`, authHeader());
      setActivities(res.data);
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  const fetchReminders = async () => {
    try {
      const res = await axios.get(`${API}/api/jobs/reminders`, authHeader());
      setReminders(res.data);
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  const fetchArchivedJobs = async () => {
    try {
      const res = await axios.get(`${API}/api/jobs?archived=true`, authHeader());
      setArchivedJobs(res.data);
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  useEffect(() => {
    if (!session) return;
    fetchJobs();
    fetchStats();
    fetchTags();
    fetchArchivedJobs();
    fetchActivities();
    fetchReminders();
  }, [session]);

  const createJob = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/api/jobs`, { company, role, status, link, notes, tags: formTags, followUpDate: followUpDate || null }, authHeader());
      fetchJobs();
      fetchStats();
      fetchTags();
      fetchActivities();
      fetchReminders();
      setCompany("");
      setRole("");
      setStatus("Applied");
      setLink("");
      setNotes("");
      setFollowUpDate("");
      setFormTags([]);
      setActiveTab("applications");
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  const deleteJob = async (jobId) => {
    try {
      await axios.delete(`${API}/api/jobs/${jobId}`, authHeader());
      fetchJobs();
      fetchStats();
      fetchTags();
      fetchArchivedJobs();
      fetchActivities();
      fetchReminders();
      setDeleteTarget(null);
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  const updateJob = async (jobId, data) => {
    try {
      await axios.put(`${API}/api/jobs/${jobId}`, data, authHeader());
      fetchJobs();
      fetchStats();
      fetchTags();
      fetchActivities();
      fetchReminders();
      setEditJob(null);
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  const archiveJob = async (jobId, archive) => {
    try {
      await axios.put(`${API}/api/jobs/${jobId}`, { archived: archive }, authHeader());
      fetchJobs();
      fetchStats();
      fetchArchivedJobs();
      fetchActivities();
      fetchReminders();
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const filteredJobs = jobs
    .filter((job) => {
      const matchesSearch =
        job.company.toLowerCase().includes(search.toLowerCase()) ||
        job.role.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = filterStatus === "All" || job.status === filterStatus;
      const matchesTag = filterTag === "All" || (job.tags && job.tags.includes(filterTag));
      return matchesSearch && matchesStatus && matchesTag;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "company") return a.company.localeCompare(b.company);
      if (sortBy === "status") {
        const order = { Applied: 0, Interview: 1, Offer: 2, Rejected: 3 };
        return order[a.status] - order[b.status];
      }
      return 0;
    });

  const recentActivity = [...jobs]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
    .slice(0, 5);

  const weeklyData = useMemo(() => getWeeklyData(jobs), [jobs]);

  const isDark = document.documentElement.classList.contains("dark");
  const chartColors = isDark ? CHART_COLORS_DARK : CHART_COLORS_LIGHT;

  const chartData = [
    { name: "Applied", value: stats.Applied },
    { name: "Interview", value: stats.Interview },
    { name: "Offer", value: stats.Offer },
    { name: "Rejected", value: stats.Rejected },
  ];

  const totalApps = stats.Applied + stats.Interview + stats.Offer + stats.Rejected;

  const responseRate = totalApps > 0 ? Math.round(((stats.Interview + stats.Offer) / totalApps) * 100) : 0;
  const successRate = totalApps > 0 ? Math.round((stats.Offer / totalApps) * 100) : 0;
  const avgDaysToInterview = useMemo(() => {
    const interviewJobs = jobs.filter((j) => j.timeline && j.timeline.some((t) => t.status === "Interview"));
    if (interviewJobs.length === 0) return null;
    const totalDays = interviewJobs.reduce((sum, j) => {
      const applied = new Date(j.createdAt);
      const interview = j.timeline.find((t) => t.status === "Interview");
      return sum + Math.max(0, Math.ceil((new Date(interview.date) - applied) / 86400000));
    }, 0);
    return Math.round(totalDays / interviewJobs.length);
  }, [jobs]);

  const monthlyData = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      const count = jobs.filter((j) => {
        const c = new Date(j.createdAt);
        return c >= d && c <= end;
      }).length;
      months.push({ month: d.toLocaleDateString("en-US", { month: "short" }), count });
    }
    return months;
  }, [jobs]);

  const funnelData = useMemo(() => {
    const applied = totalApps;
    const interviewed = stats.Interview + stats.Offer;
    const offered = stats.Offer;
    return [
      { stage: "Applied", count: applied, pct: 100 },
      { stage: "Interview", count: interviewed, pct: applied > 0 ? Math.round((interviewed / applied) * 100) : 0 },
      { stage: "Offer", count: offered, pct: applied > 0 ? Math.round((offered / applied) * 100) : 0 },
    ];
  }, [totalApps, stats]);

  const statCards = [
    { label: "Total", count: totalApps, color: "brand", icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" /></svg> },
    { label: "Applied", count: stats.Applied, color: "brand", icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg> },
    { label: "Interview", count: stats.Interview, color: "amber", icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" /></svg> },
    { label: "Offer", count: stats.Offer, color: "emerald", icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" /></svg> },
    { label: "Rejected", count: stats.Rejected, color: "gray", icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg> },
  ];

  const colorMap = {
    brand: { bg: "bg-brand-50", icon: "bg-brand-100 text-brand-600", text: "text-brand-600" },
    amber: { bg: "bg-amber-50", icon: "bg-amber-100 text-amber-600", text: "text-amber-600" },
    emerald: { bg: "bg-emerald-50", icon: "bg-emerald-100 text-emerald-600", text: "text-emerald-600" },
    gray: { bg: "bg-gray-50", icon: "bg-gray-100 text-body", text: "text-body" },
  };

  return (
    <div className="min-h-screen bg-page">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-64 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 transition-transform duration-200 z-40`}>
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => { setActiveTab(tab); setSidebarOpen(false); }}
          handleLogout={handleLogout}
          initials={initials}
          userName={userName}
        />
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-topbar backdrop-blur-md border-b border-line">
          <div className="flex items-center justify-between px-6 lg:px-8 h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-body hover:text-heading hover:bg-brand-50 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
              </button>
              <div>
                <h1 className="text-lg font-semibold text-heading">
                  {activeTab === "dashboard" && "Dashboard"}
                  {activeTab === "applications" && "Applications"}
                  {activeTab === "archived" && "Archived"}
                  {activeTab === "activity" && "Activity Log"}
                  {activeTab === "add" && "New Application"}
                  {activeTab === "ai" && "AI Resume Tailor"}
                </h1>
                <p className="text-xs text-muted">
                  {activeTab === "dashboard" && `Welcome back, ${firstName}`}
                  {activeTab === "applications" && `${filteredJobs.length} of ${jobs.length} shown`}
                  {activeTab === "archived" && `${archivedJobs.length} archived application${archivedJobs.length !== 1 ? "s" : ""}`}
                  {activeTab === "activity" && `${activities.length} recent action${activities.length !== 1 ? "s" : ""}`}
                  {activeTab === "add" && "Track a new job application"}
                  {activeTab === "ai" && "Tailor your resume to any job description"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={() => setActiveTab("add")}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg shadow-sm shadow-brand-600/20 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                <span className="hidden sm:inline">Add New</span>
              </button>
            </div>
          </div>
        </header>

        <main className="p-6 lg:p-8">

          {/* ===== DASHBOARD TAB ===== */}
          {activeTab === "dashboard" && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                {statCards.map((card) => {
                  const c = colorMap[card.color];
                  return (
                    <div key={card.label} className="bg-card rounded-xl border border-line p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-body uppercase tracking-wider">{card.label}</span>
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${c.icon}`}>
                          {card.icon}
                        </div>
                      </div>
                      <p className={`text-3xl font-bold ${c.text}`}>{card.count}</p>
                    </div>
                  );
                })}
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Pie Chart */}
                <div className="bg-card rounded-xl border border-line p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-heading">Status Breakdown</h3>
                    <span className="text-xs text-muted">{totalApps} total</span>
                  </div>
                  <div className="flex justify-center">
                    <PieChart width={280} height={240}>
                      <Pie data={chartData} dataKey="value" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}>
                        {chartData.map((entry, index) => (
                          <Cell key={index} fill={chartColors[index]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid var(--color-line-strong)", fontSize: "13px", backgroundColor: "var(--color-card)", color: "var(--color-heading)" }} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "13px" }} />
                    </PieChart>
                  </div>
                </div>

                {/* Weekly Bar Chart */}
                <div className="bg-card rounded-xl border border-line p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-heading">Weekly Activity</h3>
                    <span className="text-xs text-muted">Last 6 weeks</span>
                  </div>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={weeklyData} barSize={32}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line-strong)" vertical={false} />
                      <XAxis dataKey="week" tick={{ fontSize: 12, fill: "var(--color-muted)" }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "var(--color-muted)" }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid var(--color-line-strong)", fontSize: "13px", backgroundColor: "var(--color-card)", color: "var(--color-heading)" }} />
                      <Bar dataKey="count" fill={isDark ? "#3b82f6" : "#4f46e5"} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Analytics Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-card rounded-xl border border-line p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
                    </div>
                    <div>
                      <p className="text-xs text-muted">Response Rate</p>
                      <p className="text-2xl font-bold text-heading">{responseRate}%</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                    <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${responseRate}%` }} />
                  </div>
                  <p className="text-xs text-muted mt-2">Applications that got a response</p>
                </div>

                <div className="bg-card rounded-xl border border-line p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 01-2.27.308 6.023 6.023 0 01-2.27-.308" /></svg>
                    </div>
                    <div>
                      <p className="text-xs text-muted">Success Rate</p>
                      <p className="text-2xl font-bold text-heading">{successRate}%</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                    <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${successRate}%` }} />
                  </div>
                  <p className="text-xs text-muted mt-2">Applications that reached Offer</p>
                </div>

                <div className="bg-card rounded-xl border border-line p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                      <p className="text-xs text-muted">Avg. Time to Interview</p>
                      <p className="text-2xl font-bold text-heading">{avgDaysToInterview !== null ? `${avgDaysToInterview}d` : "—"}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted mt-4">Average days from application to interview</p>
                </div>
              </div>

              {/* Monthly Trend & Funnel Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Monthly Trend */}
                <div className="bg-card rounded-xl border border-line p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-heading">Monthly Trend</h3>
                    <span className="text-xs text-muted">Last 6 months</span>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={monthlyData} barSize={28}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line-strong)" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--color-muted)" }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "var(--color-muted)" }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid var(--color-line-strong)", fontSize: "13px", backgroundColor: "var(--color-card)", color: "var(--color-heading)" }} />
                      <Bar dataKey="count" fill={isDark ? "#60a5fa" : "#6366f1"} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Status Funnel */}
                <div className="bg-card rounded-xl border border-line p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-heading">Application Funnel</h3>
                    <span className="text-xs text-muted">Conversion rates</span>
                  </div>
                  <div className="space-y-4 mt-6">
                    {funnelData.map((item, i) => {
                      const colors = ["bg-brand-500", "bg-amber-500", "bg-emerald-500"];
                      const bgColors = ["bg-brand-100 dark:bg-brand-900/30", "bg-amber-100 dark:bg-amber-900/30", "bg-emerald-100 dark:bg-emerald-900/30"];
                      return (
                        <div key={item.stage}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-medium text-heading">{item.stage}</span>
                            <span className="text-sm text-muted">{item.count} <span className="text-xs">({item.pct}%)</span></span>
                          </div>
                          <div className={`w-full rounded-full h-3 ${bgColors[i]}`}>
                            <div className={`${colors[i]} h-3 rounded-full transition-all duration-500`} style={{ width: `${item.pct}%`, minWidth: item.count > 0 ? "8px" : "0" }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {totalApps > 0 && (
                    <p className="text-xs text-muted mt-5 text-center">
                      {responseRate > 30 ? "Great response rate! Keep it up." : responseRate > 15 ? "Solid progress — keep applying!" : "Tip: Tailor each application to boost response rates."}
                    </p>
                  )}
                </div>
              </div>

              {/* Follow-Up Reminders */}
              {reminders.length > 0 && (
                <div className="bg-card rounded-xl border border-line p-6 mb-8">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-sm font-semibold text-heading flex items-center gap-2">
                      <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
                      Follow-Up Reminders
                    </h3>
                    <span className="text-xs text-muted">{reminders.length} pending</span>
                  </div>
                  <div className="divide-y divide-line">
                    {reminders.slice(0, 5).map((job) => {
                      const today = new Date(); today.setHours(0,0,0,0);
                      const fDate = new Date(job.followUpDate); fDate.setHours(0,0,0,0);
                      const diffDays = Math.ceil((fDate - today) / 86400000);
                      const isOverdue = diffDays < 0;
                      const isToday = diffDays === 0;
                      return (
                        <div key={job._id} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                            isOverdue ? "bg-red-100 text-red-600" : isToday ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"
                          }`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-heading truncate">{job.company}</p>
                            <p className="text-xs text-muted truncate">{job.role}</p>
                          </div>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            isOverdue ? "bg-red-100 text-red-700" : isToday ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                          }`}>
                            {isOverdue ? `Overdue ${Math.abs(diffDays)}d` : isToday ? "Due today" : `In ${diffDays}d`}
                          </span>
                          <span className="text-xs text-muted shrink-0">
                            {new Date(job.followUpDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recent Activity */}
              <div className="bg-card rounded-xl border border-line p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-semibold text-heading">Recent Activity</h3>
                  <button onClick={() => setActiveTab("applications")} className="text-xs text-brand-600 hover:text-brand-700 font-medium">View all</button>
                </div>
                {recentActivity.length === 0 ? (
                  <p className="text-muted text-sm text-center py-8">No applications yet — add your first one!</p>
                ) : (
                  <div className="divide-y divide-line">
                    {recentActivity.map((job) => (
                      <div key={job._id} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${STATUS_STYLES[job.status]?.dot || "bg-gray-400"}`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-heading truncate">{job.company}</p>
                          <p className="text-xs text-muted truncate">{job.role}</p>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLES[job.status]?.badge || "bg-gray-100 text-body"}`}>
                          {job.status}
                        </span>
                        <span className="text-xs text-muted shrink-0 w-20 text-right">
                          {timeAgo(job.updatedAt || job.createdAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </>
          )}

          {/* ===== ACTIVITY TAB ===== */}
          {activeTab === "activity" && (
            <>
              {activities.length === 0 ? (
                <div className="bg-card rounded-xl border border-line p-12 text-center">
                  <svg className="w-12 h-12 text-faint mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <p className="text-body font-medium">No activity yet</p>
                  <p className="text-sm text-muted mt-1">Actions like adding, updating, and archiving jobs will appear here.</p>
                </div>
              ) : (
                <div className="bg-card rounded-xl border border-line p-6">
                  <div className="divide-y divide-line">
                    {activities.map((act) => {
                      const icons = {
                        created: { bg: "bg-emerald-100", color: "text-emerald-600", icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg> },
                        status_change: { bg: "bg-blue-100", color: "text-blue-600", icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg> },
                        archived: { bg: "bg-orange-100", color: "text-orange-600", icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg> },
                        restored: { bg: "bg-brand-100", color: "text-brand-600", icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg> },
                        deleted: { bg: "bg-red-100", color: "text-red-600", icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg> },
                        edited: { bg: "bg-gray-100", color: "text-body", icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg> },
                      };
                      const labels = {
                        created: "Added",
                        status_change: "Status changed",
                        archived: "Archived",
                        restored: "Restored",
                        deleted: "Deleted",
                        edited: "Edited",
                      };
                      const style = icons[act.action] || icons.edited;
                      return (
                        <div key={act._id} className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${style.bg} ${style.color}`}>
                            {style.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-heading">
                              <span className="font-medium">{labels[act.action]}</span>
                              {" "}
                              <span className="text-body">{act.company} — {act.role}</span>
                            </p>
                            {act.details && <p className="text-xs text-muted">{act.details}</p>}
                          </div>
                          <span className="text-xs text-muted shrink-0">{timeAgo(act.createdAt)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ===== ADD TAB ===== */}
          {activeTab === "add" && (
            <div className="max-w-xl mx-auto">
              <div className="bg-card rounded-xl border border-line p-8">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-heading">Track New Application</h2>
                  <p className="text-sm text-muted mt-1">Fill in the details below to add a job to your tracker.</p>
                </div>

                <form onSubmit={createJob} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-body mb-1.5">Company *</label>
                      <input type="text" placeholder="e.g. Google" value={company} onChange={(e) => setCompany(e.target.value)} required className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-body mb-1.5">Role *</label>
                      <input type="text" placeholder="e.g. Frontend Engineer" value={role} onChange={(e) => setRole(e.target.value)} required className={inputClass} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-body mb-1.5">Job Posting URL</label>
                    <input type="url" placeholder="https://..." value={link} onChange={(e) => setLink(e.target.value)} className={inputClass} />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-body mb-1.5">Notes</label>
                    <textarea placeholder="Anything to remember about this application..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={`${inputClass} resize-none`} />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-body mb-1.5">Tags</label>
                    <TagInput tags={formTags} setTags={setFormTags} allTags={allTags} />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-body mb-1.5">Follow-Up Date</label>
                    <input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} className={inputClass} />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-body mb-1.5">Status</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
                      <option value="Applied">Applied</option>
                      <option value="Interview">Interview</option>
                      <option value="Offer">Offer</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  <button className="w-full bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-lg text-sm font-medium shadow-sm shadow-brand-600/20 transition-colors mt-2">
                    Add Application
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ===== APPLICATIONS TAB ===== */}
          {activeTab === "applications" && (
            <>
              {/* Search + Filter Bar */}
              <div className="bg-card rounded-xl border border-line p-4 mb-6">
                <div className="flex flex-wrap gap-3">
                  <div className="relative flex-1 min-w-[200px]">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input
                      type="text"
                      placeholder="Search by company or role..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-line-strong bg-input-bg rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 focus:bg-card outline-none transition-all"
                    />
                  </div>
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={`${inputClass} w-auto min-w-[140px]`}>
                    <option value="All">All Statuses</option>
                    <option value="Applied">Applied</option>
                    <option value="Interview">Interview</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                  {allTags.length > 0 && (
                    <select value={filterTag} onChange={(e) => setFilterTag(e.target.value)} className={`${inputClass} w-auto min-w-[130px]`}>
                      <option value="All">All Tags</option>
                      {allTags.map((tag) => (
                        <option key={tag} value={tag}>{tag}</option>
                      ))}
                    </select>
                  )}
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={`${inputClass} w-auto min-w-[140px]`}>
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="company">Company A-Z</option>
                    <option value="status">By Status</option>
                  </select>
                  <button
                    onClick={async () => {
                      try {
                        const res = await axios.get(`${API}/api/jobs/export`, { ...authHeader(), responseType: "blob" });
                        const url = window.URL.createObjectURL(new Blob([res.data]));
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = "applyflow-export.csv";
                        a.click();
                        window.URL.revokeObjectURL(url);
                      } catch (error) {
                        console.log(error.response?.data || error.message);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-2.5 border border-line-strong bg-input-bg rounded-lg text-sm text-body hover:bg-brand-50 hover:text-heading transition-all shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                    Export
                  </button>
                </div>
              </div>

              {/* Job Table */}
              {filteredJobs.length === 0 ? (
                <div className="bg-card rounded-xl border border-line p-12 text-center">
                  <svg className="w-12 h-12 text-faint mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                  <p className="text-body font-medium">No applications found</p>
                  <p className="text-sm text-muted mt-1">Try adjusting your filters or add a new application.</p>
                  <button onClick={() => setActiveTab("add")} className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    Add Application
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredJobs.map((job) => (
                    <div
                      key={job._id}
                      className="bg-card rounded-xl border border-line p-5 hover:border-brand-200 hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                          job.status === "Applied" ? "bg-brand-100 text-brand-700" :
                          job.status === "Interview" ? "bg-amber-100 text-amber-700" :
                          job.status === "Offer" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-body"
                        }`}>
                          {job.company.charAt(0).toUpperCase()}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="text-sm font-semibold text-heading">{job.company}</h3>
                              <p className="text-sm text-body">{job.role}</p>
                            </div>
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${STATUS_STYLES[job.status]?.badge || "bg-gray-100 text-heading"}`}>
                              {job.status}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 mt-2 text-xs text-muted">
                            {job.link && (
                              <a href={job.link} target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:text-brand-700 inline-flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" /><path strokeLinecap="round" strokeLinejoin="round" d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101" /></svg>
                                Link
                              </a>
                            )}
                            {job.notes && (
                              <span className="inline-flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                                {job.notes.length > 40 ? job.notes.slice(0, 40) + "..." : job.notes}
                              </span>
                            )}
                            {job.createdAt && (
                              <span>{timeAgo(job.createdAt)}</span>
                            )}
                            {job.followUpDate && (() => {
                              const today = new Date(); today.setHours(0,0,0,0);
                              const fDate = new Date(job.followUpDate); fDate.setHours(0,0,0,0);
                              const diffDays = Math.ceil((fDate - today) / 86400000);
                              const isOverdue = diffDays < 0;
                              const isToday = diffDays === 0;
                              const isSoon = diffDays > 0 && diffDays <= 3;
                              return (
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                  isOverdue ? "bg-red-100 text-red-700" : isToday ? "bg-amber-100 text-amber-700" : isSoon ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"
                                }`}>
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
                                  {isOverdue ? `Overdue ${Math.abs(diffDays)}d` : isToday ? "Due today" : `Due in ${diffDays}d`}
                                </span>
                              );
                            })()}
                          </div>

                          {job.tags && job.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {job.tags.map((tag) => (
                                <span key={tag} className={`px-2 py-0.5 rounded-md text-xs font-medium ${getTagColor(tag)}`}>{tag}</span>
                              ))}
                            </div>
                          )}

                          {/* Timeline */}
                          {job.timeline && job.timeline.length > 0 && (
                            <div className="mt-2">
                              <button
                                onClick={() => setExpandedTimeline(expandedTimeline === job._id ? null : job._id)}
                                className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-brand-600 transition-colors"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {job.timeline.length} {job.timeline.length === 1 ? "event" : "events"}
                                <svg className={`w-3 h-3 transition-transform ${expandedTimeline === job._id ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                              </button>
                              {expandedTimeline === job._id && (
                                <div className="mt-2 ml-1 border-l-2 border-line-strong pl-4 space-y-2.5 py-1">
                                  {[...job.timeline].reverse().map((entry, i) => (
                                    <div key={i} className="relative flex items-start gap-3">
                                      <div className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white ${STATUS_STYLES[entry.status]?.dot || "bg-gray-400"}`} />
                                      <div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[entry.status]?.badge || "bg-gray-100 text-body"}`}>
                                          {entry.status}
                                        </span>
                                        <p className="text-xs text-muted mt-0.5">
                                          {new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                          {" · "}
                                          {new Date(entry.date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2 mt-3 flex-wrap lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setEditJob({ ...job })}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-brand-50 text-body hover:bg-brand-100 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => archiveJob(job._id, true)}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
                            >
                              Archive
                            </button>
                            <button
                              onClick={() => setDeleteTarget(job)}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                            >
                              Delete
                            </button>
                            <div className="h-6 w-px bg-line-strong mx-1" />
                            {["Applied", "Interview", "Offer", "Rejected"]
                              .filter((s) => s !== job.status)
                              .map((s) => (
                                <button
                                  key={s}
                                  onClick={() => updateJob(job._id, { status: s })}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${STATUS_STYLES[s].btn}`}
                                >
                                  {s}
                                </button>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ===== ARCHIVED TAB ===== */}
          {activeTab === "archived" && (
            <>
              {archivedJobs.length === 0 ? (
                <div className="bg-card rounded-xl border border-line p-12 text-center">
                  <svg className="w-12 h-12 text-faint mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
                  <p className="text-body font-medium">No archived applications</p>
                  <p className="text-sm text-muted mt-1">Applications you archive will appear here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {archivedJobs.map((job) => (
                    <div key={job._id} className="bg-card rounded-xl border border-line p-5 opacity-75 hover:opacity-100 transition-all group">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 bg-brand-50 text-body`}>
                          {job.company.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="text-sm font-semibold text-heading">{job.company}</h3>
                              <p className="text-sm text-body">{job.role}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-brand-50 text-muted">Archived</span>
                              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLES[job.status]?.badge || "bg-gray-100 text-heading"}`}>
                                {job.status}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted">
                            {job.createdAt && <span>{timeAgo(job.createdAt)}</span>}
                          </div>
                          {job.tags && job.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {job.tags.map((tag) => (
                                <span key={tag} className={`px-2 py-0.5 rounded-md text-xs font-medium ${getTagColor(tag)}`}>{tag}</span>
                              ))}
                            </div>
                          )}
                          <div className="flex gap-2 mt-3 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => archiveJob(job._id, false)}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-brand-50 text-brand-600 hover:bg-brand-100 transition-colors"
                            >
                              Restore
                            </button>
                            <button
                              onClick={() => setDeleteTarget(job)}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          {/* ===== AI TAILOR TAB ===== */}
          {activeTab === "ai" && <AITailorTab authHeader={authHeader} />}
        </main>
      </div>

      {/* Edit Modal */}
      {editJob && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setEditJob(null)}>
          <div className="bg-card rounded-xl shadow-2xl w-full max-w-md p-6 border border-line-strong" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-heading">Edit Application</h3>
              <button onClick={() => setEditJob(null)} className="p-1 text-muted hover:text-body rounded-lg hover:bg-brand-50">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-body mb-1.5">Company</label>
                <input type="text" value={editJob.company} onChange={(e) => setEditJob({ ...editJob, company: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-body mb-1.5">Role</label>
                <input type="text" value={editJob.role} onChange={(e) => setEditJob({ ...editJob, role: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-body mb-1.5">Job URL</label>
                <input type="url" value={editJob.link || ""} onChange={(e) => setEditJob({ ...editJob, link: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-body mb-1.5">Notes</label>
                <textarea value={editJob.notes || ""} onChange={(e) => setEditJob({ ...editJob, notes: e.target.value })} rows={3} className={`${inputClass} resize-none`} />
              </div>
              <div>
                <label className="block text-xs font-medium text-body mb-1.5">Tags</label>
                <TagInput tags={editJob.tags || []} setTags={(tags) => setEditJob({ ...editJob, tags })} allTags={allTags} />
              </div>
              <div>
                <label className="block text-xs font-medium text-body mb-1.5">Follow-Up Date</label>
                <input type="date" value={editJob.followUpDate ? new Date(editJob.followUpDate).toISOString().split("T")[0] : ""} onChange={(e) => setEditJob({ ...editJob, followUpDate: e.target.value || null })} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-body mb-1.5">Status</label>
                <select value={editJob.status} onChange={(e) => setEditJob({ ...editJob, status: e.target.value })} className={inputClass}>
                  <option value="Applied">Applied</option>
                  <option value="Interview">Interview</option>
                  <option value="Offer">Offer</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => updateJob(editJob._id, { company: editJob.company, role: editJob.role, status: editJob.status, link: editJob.link, notes: editJob.notes, tags: editJob.tags || [], followUpDate: editJob.followUpDate || null })}
                className="flex-1 bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-lg text-sm font-medium shadow-sm transition-colors"
              >
                Save Changes
              </button>
              <button onClick={() => setEditJob(null)} className="px-5 py-2.5 border border-line-strongtext-body rounded-lg text-sm font-medium hover:bg-brand-50/50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setDeleteTarget(null)}>
          <div className="bg-card rounded-xl shadow-2xl w-full max-w-sm p-6 text-center border border-line-strong" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-heading mb-1">Delete Application?</h3>
            <p className="text-sm text-body mb-6">
              <span className="font-medium text-heading">{deleteTarget.company} — {deleteTarget.role}</span> will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 px-4 py-2.5 border border-line-strongtext-body rounded-lg text-sm font-medium hover:bg-brand-50/50 transition-colors">
                Cancel
              </button>
              <button onClick={() => deleteJob(deleteTarget._id)} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState("landing");

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") document.documentElement.classList.add("dark");

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-page flex items-center justify-center">
      <div className="text-brand-600 text-lg font-semibold">Loading...</div>
    </div>
  );

  if (session) return <Dashboard />;

  if (page === "landing") return <LandingPage setPage={setPage} />;
  if (page === "register") return <Register setPage={setPage} />;
  return <Login setPage={setPage} />;
}

export default App;
