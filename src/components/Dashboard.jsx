import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area } from "recharts";
import { supabase } from "../lib/supabase";
import { API, STATUS_STYLES, CHART_COLORS_LIGHT, CHART_COLORS_DARK, inputClass } from "../utils/constants";
import { getTagColor, timeAgo, getWeeklyData } from "../utils/helpers";
import ThemeToggle from "./ThemeToggle";
import TagInput from "./TagInput";

const AITailorTab = lazy(() => import("./AITailorTab"));
const DocumentsTab = lazy(() => import("./DocumentsTab"));
import { SummaryCardsSkeleton, GoalRingSkeleton, ChartsSkeleton, AnalyticsSkeleton, JobListSkeleton, ActivitySkeleton } from "./Skeletons";
import { useToast, ToastContainer } from "./Toast";
import OnboardingTour from "./OnboardingTour";

export default function Dashboard() {
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
  const [allTags, setAllTags] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toasts, toast } = useToast();

  const [archivedJobs, setArchivedJobs] = useState([]);
  const [activities, setActivities] = useState([]);
  const [editJob, setEditJob] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [expandedTimeline, setExpandedTimeline] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);
  const [interviewModal, setInterviewModal] = useState(null);
  const [intDate, setIntDate] = useState("");
  const [intTime, setIntTime] = useState("");
  const [intType, setIntType] = useState("Other");
  const [intLocation, setIntLocation] = useState("");
  const [intNotes, setIntNotes] = useState("");
  const [weeklyGoal, setWeeklyGoal] = useState(10);
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState("10");
  const [deleteAccountModal, setDeleteAccountModal] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [testEmailMsg, setTestEmailMsg] = useState("");
  const [formContacts, setFormContacts] = useState([]);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactInput, setContactInput] = useState({ name: "", role: "", email: "", phone: "", linkedin: "", notes: "" });

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

  const fetchJobs = async (signal) => {
    try {
      const res = await axios.get(`${API}/api/jobs`, { ...authHeader(), signal });
      setJobs(res.data);
    } catch (error) {
      if (!axios.isCancel(error)) console.log(error.response?.data || error.message);
    }
  };

  const fetchStats = async (signal) => {
    try {
      const res = await axios.get(`${API}/api/jobs/stats`, { ...authHeader(), signal });
      setStats(res.data);
    } catch (error) {
      if (!axios.isCancel(error)) console.log(error.response?.data || error.message);
    }
  };

  const fetchTags = async (signal) => {
    try {
      const res = await axios.get(`${API}/api/jobs/tags`, { ...authHeader(), signal });
      setAllTags(res.data);
    } catch (error) {
      if (!axios.isCancel(error)) console.log(error.response?.data || error.message);
    }
  };

  const fetchActivities = async (signal) => {
    try {
      const res = await axios.get(`${API}/api/jobs/activities`, { ...authHeader(), signal });
      setActivities(res.data);
    } catch (error) {
      if (!axios.isCancel(error)) console.log(error.response?.data || error.message);
    }
  };

  const fetchReminders = async (signal) => {
    try {
      const res = await axios.get(`${API}/api/jobs/reminders`, { ...authHeader(), signal });
      setReminders(res.data);
    } catch (error) {
      if (!axios.isCancel(error)) console.log(error.response?.data || error.message);
    }
  };

  const fetchArchivedJobs = async (signal) => {
    try {
      const res = await axios.get(`${API}/api/jobs?archived=true`, { ...authHeader(), signal });
      setArchivedJobs(res.data);
    } catch (error) {
      if (!axios.isCancel(error)) console.log(error.response?.data || error.message);
    }
  };

  const fetchInterviews = async (signal) => {
    try {
      const res = await axios.get(`${API}/api/jobs/interviews`, { ...authHeader(), signal });
      setUpcomingInterviews(res.data);
    } catch (error) {
      if (!axios.isCancel(error)) console.log(error.response?.data || error.message);
    }
  };

  const fetchSettings = async (signal) => {
    try {
      const res = await axios.get(`${API}/api/jobs/settings`, { ...authHeader(), signal });
      setWeeklyGoal(res.data.weeklyGoal);
      setGoalInput(String(res.data.weeklyGoal));
      if (res.data.emailNotifications !== undefined) setEmailNotifications(res.data.emailNotifications);
    } catch (error) {
      if (!axios.isCancel(error)) console.log(error.response?.data || error.message);
    }
  };

  useEffect(() => {
    if (!session) return;
    const controller = new AbortController();
    setLoading(true);
    Promise.all([
      fetchJobs(controller.signal),
      fetchStats(controller.signal),
      fetchTags(controller.signal),
      fetchArchivedJobs(controller.signal),
      fetchActivities(controller.signal),
      fetchReminders(controller.signal),
      fetchInterviews(controller.signal),
      fetchSettings(controller.signal),
    ]).finally(() => setLoading(false));
    return () => controller.abort();
  }, [session]);

  const refreshStats = () => {
    fetchStats();
    fetchActivities();
  };

  const createJob = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/api/jobs`, { company, role, status, link, notes, tags: formTags, followUpDate: followUpDate || null, contacts: formContacts }, authHeader());
      setJobs((prev) => [res.data, ...prev]);
      const newTags = formTags.filter((t) => !allTags.includes(t));
      if (newTags.length) setAllTags((prev) => [...prev, ...newTags]);
      refreshStats();
      setCompany("");
      setRole("");
      setStatus("Applied");
      setLink("");
      setNotes("");
      setFollowUpDate("");
      setFormTags([]);
      setFormContacts([]);
      setShowContactForm(false);
      setContactInput({ name: "", role: "", email: "", phone: "", linkedin: "", notes: "" });
      setActiveTab("applications");
      toast("Application added successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add application");
    }
  };

  const deleteJob = async (jobId) => {
    try {
      await axios.delete(`${API}/api/jobs/${jobId}`, authHeader());
      setJobs((prev) => prev.filter((j) => j._id !== jobId));
      setArchivedJobs((prev) => prev.filter((j) => j._id !== jobId));
      refreshStats();
      setDeleteTarget(null);
      toast("Application deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete application");
    }
  };

  const updateJob = async (jobId, data) => {
    try {
      const res = await axios.put(`${API}/api/jobs/${jobId}`, data, authHeader());
      setJobs((prev) => prev.map((j) => j._id === jobId ? res.data : j));
      refreshStats();
      setEditJob(null);
      toast(data.status ? `Status updated to ${data.status}` : "Application updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update application");
    }
  };

  const archiveJob = async (jobId, archive) => {
    try {
      const res = await axios.put(`${API}/api/jobs/${jobId}`, { archived: archive }, authHeader());
      if (archive) {
        setJobs((prev) => prev.filter((j) => j._id !== jobId));
        setArchivedJobs((prev) => [res.data, ...prev]);
      } else {
        setArchivedJobs((prev) => prev.filter((j) => j._id !== jobId));
        setJobs((prev) => [res.data, ...prev]);
      }
      refreshStats();
      toast(archive ? "Application archived" : "Application restored");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to archive application");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const filteredJobs = useMemo(() => jobs
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
    }), [jobs, search, filterStatus, filterTag, sortBy]);

  const recentActivity = useMemo(() => [...jobs]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
    .slice(0, 5), [jobs]);

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
      const inMonth = jobs.filter((j) => {
        const c = new Date(j.createdAt);
        return c >= d && c <= end;
      });
      months.push({
        month: d.toLocaleDateString("en-US", { month: "short" }),
        count: inMonth.length,
        Applied: inMonth.filter((j) => j.status === "Applied").length,
        Interview: inMonth.filter((j) => j.status === "Interview").length,
        Offer: inMonth.filter((j) => j.status === "Offer").length,
        Rejected: inMonth.filter((j) => j.status === "Rejected").length,
      });
    }
    return months;
  }, [jobs]);

  const stageMetrics = useMemo(() => {
    const daysBetween = (a, b) => Math.max(0, Math.ceil((new Date(b) - new Date(a)) / 86400000));
    const results = { toInterview: [], toOffer: [], toRejected: [], pipeline: [] };
    jobs.forEach((j) => {
      if (!j.timeline || j.timeline.length < 2) return;
      const sorted = [...j.timeline].sort((a, b) => new Date(a.date) - new Date(b.date));
      const appliedEntry = sorted.find((t) => t.status === "Applied");
      const interviewEntry = sorted.find((t) => t.status === "Interview");
      const offerEntry = sorted.find((t) => t.status === "Offer");
      const rejectedEntry = sorted.find((t) => t.status === "Rejected");
      if (appliedEntry && interviewEntry) results.toInterview.push(daysBetween(appliedEntry.date, interviewEntry.date));
      if (interviewEntry && offerEntry) results.toOffer.push(daysBetween(interviewEntry.date, offerEntry.date));
      if (appliedEntry && rejectedEntry) results.toRejected.push(daysBetween(appliedEntry.date, rejectedEntry.date));
      if (appliedEntry && offerEntry) results.pipeline.push(daysBetween(appliedEntry.date, offerEntry.date));
    });
    const avg = (arr) => arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null;
    return {
      toInterview: avg(results.toInterview),
      toOffer: avg(results.toOffer),
      toRejected: avg(results.toRejected),
      pipeline: avg(results.pipeline),
      counts: { toInterview: results.toInterview.length, toOffer: results.toOffer.length, toRejected: results.toRejected.length, pipeline: results.pipeline.length },
    };
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

  const weeklyApps = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    return jobs.filter((j) => new Date(j.createdAt) >= monday).length;
  }, [jobs]);

  const goalPct = weeklyGoal > 0 ? Math.min(100, Math.round((weeklyApps / weeklyGoal) * 100)) : 0;

  const navItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "applications", label: "Applications" },
    { id: "interviews", label: "Interviews" },
    { id: "documents", label: "Documents" },
    { id: "archived", label: "Archived" },
    { id: "activity", label: "Activity" },
    { id: "ai", label: "AI Tailor" },
  ];

  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" });

  const summaryStats = [
    { label: "APPLIED", count: stats.Applied, color: "text-brand-400" },
    { label: "INTERVIEW", count: stats.Interview, color: "text-amber-400" },
    { label: "OFFER", count: stats.Offer, color: "text-emerald-400" },
    { label: "REJECTED", count: stats.Rejected, color: "text-red-400" },
    { label: "TOTAL", count: totalApps, color: "text-heading" },
  ];

  return (
    <div className="min-h-screen bg-page">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 bg-topbar backdrop-blur-md border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2" data-tour="welcome">
                <div className="w-7 h-7 bg-gradient-to-br from-brand-400 to-brand-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20L17.5 6.5" stroke="currentColor" strokeWidth={2.5} /><path d="M17.5 6.5l2.5-2.5" stroke="currentColor" strokeWidth={1.5} /><circle cx="20" cy="4" r="1.5" fill="currentColor" /><path d="M4 20c0 0-1 -5 3-9" stroke="currentColor" strokeWidth={1.8} /><path d="M4 20c0 0 5 1 9-3" stroke="currentColor" strokeWidth={1.8} /></svg>
                </div>
                <span className="text-lg font-bold text-brand-400 tracking-tight">TailorTrack</span>
              </div>

              <div className="hidden md:flex items-center gap-1" data-tour="nav-tabs">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === item.id
                        ? "bg-brand-600/10 text-brand-400"
                        : "text-muted hover:text-heading hover:bg-card"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("add")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors"
                data-tour="add-job-btn"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                <span className="hidden sm:inline">Add</span>
              </button>
              <span data-tour="theme-toggle"><ThemeToggle /></span>
              <div className="flex items-center gap-2 ml-1">
                <button
                  onClick={() => setActiveTab("profile")}
                  className="w-8 h-8 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center text-white text-xs font-bold hover:ring-2 hover:ring-brand-400/50 transition-all"
                  title="Profile"
                >
                  {initials}
                </button>
                <button
                  onClick={handleLogout}
                  className="text-xs text-muted hover:text-red-400 transition-colors hidden sm:block"
                >
                  Sign Out
                </button>
              </div>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1.5 text-muted hover:text-heading rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden pb-3 border-t border-line mt-1 pt-2 flex flex-wrap gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === item.id
                      ? "bg-brand-600/10 text-brand-400"
                      : "text-muted hover:text-heading"
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={handleLogout}
                className="sm:hidden px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Summary Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-2">
        <div className="bg-card rounded-2xl border border-line p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <p className="text-sm text-muted mb-1">{dateStr}</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-heading mb-6">{firstName}'s Summary</h1>

              {loading ? <SummaryCardsSkeleton /> : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4" data-tour="summary-cards">
                  {summaryStats.map((stat) => (
                    <div key={stat.label} className="bg-page rounded-xl p-4 border border-line">
                      <p className="text-[11px] font-semibold text-muted tracking-wider mb-1">{stat.label}</p>
                      <p className={`text-2xl sm:text-3xl font-bold ${stat.color}`}>{stat.count}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Weekly Goal Ring */}
            {loading ? <GoalRingSkeleton /> : <div className="flex flex-col items-center shrink-0" data-tour="weekly-goal">
              <p className="text-[11px] font-semibold text-muted tracking-wider mb-3">WEEKLY GOAL</p>
              <div className="relative w-28 h-28">
                <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="var(--color-line-strong)" strokeWidth="8" />
                  <circle
                    cx="60" cy="60" r="50" fill="none"
                    stroke={goalPct >= 100 ? "#10b981" : goalPct >= 50 ? "#3b82f6" : "var(--color-brand-400)"}
                    strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - goalPct / 100)}`}
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-2xl font-bold ${goalPct >= 100 ? "text-emerald-400" : "text-heading"}`}>{weeklyApps}</span>
                  <span className="text-[10px] text-muted">/ {weeklyGoal}</span>
                </div>
              </div>
              {goalPct >= 100 && (
                <p className="text-xs text-emerald-400 font-medium mt-2">Goal reached!</p>
              )}
              {editingGoal ? (
                <div className="flex items-center gap-1.5 mt-2">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={goalInput}
                    onChange={(e) => setGoalInput(e.target.value)}
                    className="w-14 px-2 py-1 text-xs text-center border border-line-strong bg-input-bg rounded-lg text-heading outline-none focus:ring-1 focus:ring-brand-400"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const val = Math.max(1, Math.min(100, parseInt(goalInput) || 10));
                        setWeeklyGoal(val);
                        setGoalInput(String(val));
                        setEditingGoal(false);
                        axios.put(`${API}/api/jobs/settings`, { weeklyGoal: val }, authHeader()).catch(() => {});
                      }
                      if (e.key === "Escape") setEditingGoal(false);
                    }}
                  />
                  <button
                    onClick={() => {
                      const val = Math.max(1, Math.min(100, parseInt(goalInput) || 10));
                      setWeeklyGoal(val);
                      setGoalInput(String(val));
                      setEditingGoal(false);
                      axios.put(`${API}/api/jobs/settings`, { weeklyGoal: val }, authHeader()).catch(() => {});
                    }}
                    className="px-2 py-1 text-xs bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
                  >
                    Set
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditingGoal(true)}
                  className="text-[10px] text-muted hover:text-brand-400 mt-2 transition-colors"
                >
                  Edit goal
                </button>
              )}
            </div>}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Charts Row */}
            {loading ? <ChartsSkeleton /> : <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-tour="charts">
              <div className="bg-card rounded-2xl border border-line p-6">
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
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid var(--color-line-strong)", fontSize: "13px", backgroundColor: "var(--color-card)", color: "var(--color-heading)" }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "13px" }} />
                  </PieChart>
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-line p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-heading">Weekly Activity</h3>
                  <span className="text-xs text-muted">Last 6 weeks</span>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={weeklyData} barSize={32}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line-strong)" vertical={false} />
                    <XAxis dataKey="week" tick={{ fontSize: 12, fill: "var(--color-muted)" }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "var(--color-muted)" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid var(--color-line-strong)", fontSize: "13px", backgroundColor: "var(--color-card)", color: "var(--color-heading)" }} />
                    <Bar dataKey="count" fill={isDark ? "#3b82f6" : "#4f46e5"} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>}

            {/* Conversion Metrics */}
            {loading ? <AnalyticsSkeleton /> : <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-card rounded-2xl border border-line p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Response Rate</p>
                    <p className="text-2xl font-bold text-heading">{responseRate}%</p>
                  </div>
                </div>
                <div className="w-full bg-line-strong rounded-full h-1.5 mt-2">
                  <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${responseRate}%` }} />
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-line p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 01-2.27.308 6.023 6.023 0 01-2.27-.308" /></svg>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Success Rate</p>
                    <p className="text-2xl font-bold text-heading">{successRate}%</p>
                  </div>
                </div>
                <div className="w-full bg-line-strong rounded-full h-1.5 mt-2">
                  <div className="bg-emerald-500 h-1.5 rounded-full transition-all" style={{ width: `${successRate}%` }} />
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-line p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Avg. Time to Interview</p>
                    <p className="text-2xl font-bold text-heading">{avgDaysToInterview !== null ? `${avgDaysToInterview}d` : "—"}</p>
                  </div>
                </div>
              </div>
            </div>}

            {/* Time-in-Stage Metrics */}
            <div className="bg-card rounded-2xl border border-line p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold text-heading flex items-center gap-2">
                  <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Time in Pipeline
                </h3>
                <span className="text-xs text-muted">Based on timeline data</span>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Applied → Interview", value: stageMetrics.toInterview, count: stageMetrics.counts.toInterview, color: "bg-indigo-500", bgColor: "bg-indigo-500/10", textColor: "text-indigo-400" },
                  { label: "Interview → Offer", value: stageMetrics.toOffer, count: stageMetrics.counts.toOffer, color: "bg-emerald-500", bgColor: "bg-emerald-500/10", textColor: "text-emerald-400" },
                  { label: "Applied → Rejected", value: stageMetrics.toRejected, count: stageMetrics.counts.toRejected, color: "bg-red-500", bgColor: "bg-red-500/10", textColor: "text-red-400" },
                  { label: "Full Pipeline", value: stageMetrics.pipeline, count: stageMetrics.counts.pipeline, color: "bg-violet-500", bgColor: "bg-violet-500/10", textColor: "text-violet-400" },
                ].map((m) => (
                  <div key={m.label} className="bg-page rounded-xl p-4 border border-line">
                    <p className="text-[11px] font-medium text-muted mb-1 truncate">{m.label}</p>
                    <div className="flex items-baseline gap-1.5">
                      <span className={`text-2xl font-bold ${m.textColor}`}>{m.value !== null ? m.value : "—"}</span>
                      {m.value !== null && <span className="text-xs text-muted">days</span>}
                    </div>
                    <p className="text-[10px] text-muted mt-1">{m.count} application{m.count !== 1 ? "s" : ""}</p>
                    {m.value !== null && (
                      <div className={`w-full ${m.bgColor} rounded-full h-1 mt-2`}>
                        <div className={`${m.color} h-1 rounded-full transition-all duration-500`} style={{ width: `${Math.min(100, (m.value / 60) * 100)}%` }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Trends + Funnel Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card rounded-2xl border border-line p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-heading">Monthly Trends</h3>
                  <div className="flex items-center gap-3">
                    {[
                      { label: "Applied", color: isDark ? "#818cf8" : "#6366f1" },
                      { label: "Interview", color: isDark ? "#fbbf24" : "#f59e0b" },
                      { label: "Offer", color: isDark ? "#34d399" : "#10b981" },
                      { label: "Rejected", color: isDark ? "#94a3b8" : "#64748b" },
                    ].map((s) => (
                      <span key={s.label} className="flex items-center gap-1 text-[10px] text-muted">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                        <span className="hidden sm:inline">{s.label}</span>
                      </span>
                    ))}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="gApplied" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isDark ? "#818cf8" : "#6366f1"} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={isDark ? "#818cf8" : "#6366f1"} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gInterview" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isDark ? "#fbbf24" : "#f59e0b"} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={isDark ? "#fbbf24" : "#f59e0b"} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gOffer" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isDark ? "#34d399" : "#10b981"} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={isDark ? "#34d399" : "#10b981"} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line-strong)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--color-muted)" }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "var(--color-muted)" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid var(--color-line-strong)", fontSize: "13px", backgroundColor: "var(--color-card)", color: "var(--color-heading)" }} />
                    <Area type="monotone" dataKey="Applied" stroke={isDark ? "#818cf8" : "#6366f1"} fill="url(#gApplied)" strokeWidth={2} />
                    <Area type="monotone" dataKey="Interview" stroke={isDark ? "#fbbf24" : "#f59e0b"} fill="url(#gInterview)" strokeWidth={2} />
                    <Area type="monotone" dataKey="Offer" stroke={isDark ? "#34d399" : "#10b981"} fill="url(#gOffer)" strokeWidth={2} />
                    <Area type="monotone" dataKey="Rejected" stroke={isDark ? "#94a3b8" : "#64748b"} fill="none" strokeWidth={2} strokeDasharray="4 4" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-card rounded-2xl border border-line p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-semibold text-heading">Application Funnel</h3>
                  <span className="text-xs text-muted">Conversion rates</span>
                </div>
                <div className="space-y-3">
                  {funnelData.map((item, i) => {
                    const colors = [isDark ? "#818cf8" : "#6366f1", isDark ? "#fbbf24" : "#f59e0b", isDark ? "#34d399" : "#10b981"];
                    const widths = [100, 70, 45];
                    const isLast = i === funnelData.length - 1;
                    const conversionFromPrev = i > 0 && funnelData[i - 1].count > 0
                      ? Math.round((item.count / funnelData[i - 1].count) * 100)
                      : null;
                    return (
                      <div key={item.stage}>
                        {i > 0 && (
                          <div className="flex items-center justify-center gap-2 py-1">
                            <svg className="w-3 h-3 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" /></svg>
                            <span className="text-[11px] font-medium text-muted">{conversionFromPrev}% conversion</span>
                          </div>
                        )}
                        <div className="flex items-center justify-center">
                          <div
                            className="relative rounded-lg py-3 px-4 flex items-center justify-between transition-all duration-500"
                            style={{
                              width: `${widths[i]}%`,
                              backgroundColor: `${colors[i]}15`,
                              borderLeft: `3px solid ${colors[i]}`,
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[i] }} />
                              <span className="text-sm font-medium text-heading">{item.stage}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-lg font-bold text-heading">{item.count}</span>
                              {!isLast && <span className="text-xs text-muted ml-1">({item.pct}%)</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {totalApps > 0 && stats.Rejected > 0 && (
                  <div className="mt-4 pt-3 border-t border-line flex items-center justify-between px-2">
                    <span className="text-xs text-muted flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-400" />
                      Rejected
                    </span>
                    <span className="text-xs font-medium text-red-400">{stats.Rejected} ({Math.round((stats.Rejected / totalApps) * 100)}%)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Reminders */}
            {reminders.length > 0 && (
              <div className="bg-card rounded-2xl border border-line p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-semibold text-heading flex items-center gap-2">
                    <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
                    Follow-Up Reminders
                  </h3>
                  <span className="text-xs text-muted">{reminders.length} pending</span>
                </div>
                <div className="divide-y divide-line">
                  {reminders.slice(0, 5).map((job) => {
                    const td = new Date(); td.setHours(0,0,0,0);
                    const fDate = new Date(job.followUpDate); fDate.setHours(0,0,0,0);
                    const diffDays = Math.ceil((fDate - td) / 86400000);
                    const isOverdue = diffDays < 0;
                    const isToday = diffDays === 0;
                    return (
                      <div key={job._id} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                          isOverdue ? "bg-red-500/10 text-red-400" : isToday ? "bg-amber-500/10 text-amber-400" : "bg-blue-500/10 text-blue-400"
                        }`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-heading truncate">{job.company}</p>
                          <p className="text-xs text-muted truncate">{job.role}</p>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          isOverdue ? "bg-red-500/10 text-red-400" : isToday ? "bg-amber-500/10 text-amber-400" : "bg-blue-500/10 text-blue-400"
                        }`}>
                          {isOverdue ? `Overdue ${Math.abs(diffDays)}d` : isToday ? "Due today" : `In ${diffDays}d`}
                        </span>
                        <span className="text-xs text-muted shrink-0 hidden sm:block">
                          {new Date(job.followUpDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div className="bg-card rounded-2xl border border-line p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold text-heading">Recent Activity</h3>
                <button onClick={() => setActiveTab("applications")} className="text-xs text-brand-400 hover:text-brand-300 font-medium">View all</button>
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
                      <span className="text-xs text-muted shrink-0 w-20 text-right hidden sm:block">
                        {timeAgo(job.updatedAt || job.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "activity" && (
          <>
            {activities.length === 0 ? (
              <div className="bg-card rounded-2xl border border-line p-12 text-center">
                <svg className="w-12 h-12 text-faint mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-body font-medium">No activity yet</p>
                <p className="text-sm text-muted mt-1">Actions like adding, updating, and archiving jobs will appear here.</p>
              </div>
            ) : (
              <div className="bg-card rounded-2xl border border-line p-6">
                <div className="divide-y divide-line">
                  {activities.map((act) => {
                    const icons = {
                      created: { bg: "bg-emerald-500/10", color: "text-emerald-400", icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg> },
                      status_change: { bg: "bg-blue-500/10", color: "text-blue-400", icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg> },
                      archived: { bg: "bg-orange-500/10", color: "text-orange-400", icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg> },
                      restored: { bg: "bg-brand-500/10", color: "text-brand-400", icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg> },
                      deleted: { bg: "bg-red-500/10", color: "text-red-400", icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg> },
                      edited: { bg: "bg-gray-500/10", color: "text-body", icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg> },
                    };
                    const labels = { created: "Added", status_change: "Status changed", archived: "Archived", restored: "Restored", deleted: "Deleted", edited: "Edited" };
                    const style = icons[act.action] || icons.edited;
                    return (
                      <div key={act._id} className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${style.bg} ${style.color}`}>
                          {style.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-heading">
                            <span className="font-medium">{labels[act.action]}</span>{" "}
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

        {activeTab === "add" && (
          <div className="max-w-xl mx-auto">
            <div className="bg-card rounded-2xl border border-line p-8">
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
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-body">Contacts</label>
                    <button type="button" onClick={() => setShowContactForm(!showContactForm)} className="text-xs text-brand-500 hover:text-brand-400 font-medium">
                      {showContactForm ? "Cancel" : "+ Add Contact"}
                    </button>
                  </div>

                  {showContactForm && (
                    <div className="border border-line rounded-lg p-3 mb-2 space-y-2 bg-page/50">
                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" placeholder="Name *" value={contactInput.name} onChange={(e) => setContactInput({ ...contactInput, name: e.target.value })} className={`${inputClass} !py-2 !text-xs`} />
                        <input type="text" placeholder="Role (e.g. Recruiter)" value={contactInput.role} onChange={(e) => setContactInput({ ...contactInput, role: e.target.value })} className={`${inputClass} !py-2 !text-xs`} />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input type="email" placeholder="Email" value={contactInput.email} onChange={(e) => setContactInput({ ...contactInput, email: e.target.value })} className={`${inputClass} !py-2 !text-xs`} />
                        <input type="text" placeholder="Phone" value={contactInput.phone} onChange={(e) => setContactInput({ ...contactInput, phone: e.target.value })} className={`${inputClass} !py-2 !text-xs`} />
                      </div>
                      <input type="url" placeholder="LinkedIn URL" value={contactInput.linkedin} onChange={(e) => setContactInput({ ...contactInput, linkedin: e.target.value })} className={`${inputClass} !py-2 !text-xs`} />
                      <input type="text" placeholder="Notes about this contact" value={contactInput.notes} onChange={(e) => setContactInput({ ...contactInput, notes: e.target.value })} className={`${inputClass} !py-2 !text-xs`} />
                      <button
                        type="button"
                        onClick={() => {
                          if (!contactInput.name.trim()) return;
                          setFormContacts([...formContacts, { ...contactInput }]);
                          setContactInput({ name: "", role: "", email: "", phone: "", linkedin: "", notes: "" });
                          setShowContactForm(false);
                        }}
                        className="w-full py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-medium transition-colors"
                      >
                        Add Contact
                      </button>
                    </div>
                  )}

                  {formContacts.length > 0 && (
                    <div className="space-y-1.5">
                      {formContacts.map((c, i) => (
                        <div key={`${c.name}-${c.email || i}`} className="flex items-center justify-between px-3 py-2 bg-page/50 border border-line rounded-lg">
                          <div className="min-w-0">
                            <span className="text-xs font-medium text-heading">{c.name}</span>
                            {c.role && <span className="text-xs text-muted ml-1.5">· {c.role}</span>}
                            {c.email && <span className="text-[10px] text-muted block truncate">{c.email}</span>}
                          </div>
                          <button type="button" onClick={() => setFormContacts(formContacts.filter((_, j) => j !== i))} className="text-muted hover:text-red-500 ml-2 shrink-0">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
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

        {activeTab === "applications" && (
          <>
            <div className="bg-card rounded-2xl border border-line p-3 sm:p-4 mb-6">
              <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
                <div className="relative flex-1 min-w-0 sm:min-w-[200px]">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <input
                    type="text"
                    placeholder="Search company, role..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-line-strong bg-input-bg rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 focus:bg-card outline-none transition-all"
                  />
                </div>
                <div className="flex gap-2 sm:contents overflow-x-auto">
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={`${inputClass} w-full sm:w-auto min-w-0 sm:min-w-[130px]`}>
                  <option value="All">All Statuses</option>
                  <option value="Applied">Applied</option>
                  <option value="Interview">Interview</option>
                  <option value="Offer">Offer</option>
                  <option value="Rejected">Rejected</option>
                </select>
                {allTags.length > 0 && (
                  <select value={filterTag} onChange={(e) => setFilterTag(e.target.value)} className={`${inputClass} w-full sm:w-auto min-w-0 sm:min-w-[120px]`}>
                    <option value="All">All Tags</option>
                    {allTags.map((tag) => (
                      <option key={tag} value={tag}>{tag}</option>
                    ))}
                  </select>
                )}
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={`${inputClass} w-full sm:w-auto min-w-0 sm:min-w-[130px]`}>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="company">Company A-Z</option>
                  <option value="status">By Status</option>
                </select>
                </div>
                <button
                  onClick={async () => {
                    try {
                      const res = await axios.get(`${API}/api/jobs/export`, { ...authHeader(), responseType: "blob" });
                      const url = window.URL.createObjectURL(new Blob([res.data]));
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "tailortrack-export.csv";
                      a.click();
                      window.URL.revokeObjectURL(url);
                      toast("CSV exported successfully");
                    } catch (error) {
                      toast.error("Failed to export CSV");
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-2.5 border border-line-strong bg-input-bg rounded-lg text-sm text-body hover:text-heading transition-all shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                  Export
                </button>
              </div>
            </div>

            {loading ? <JobListSkeleton /> : filteredJobs.length === 0 ? (
              <div className="bg-card rounded-2xl border border-line p-12 text-center">
                <svg className="w-12 h-12 text-faint mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                <p className="text-body font-medium">No applications found</p>
                <p className="text-sm text-muted mt-1">Try adjusting your filters or add a new application.</p>
                <button onClick={() => setActiveTab("add")} className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                  Add Application
                </button>
              </div>
            ) : (
              <div className="bg-card rounded-2xl border border-line overflow-hidden">
                <div className="grid grid-cols-[1fr_auto_auto_auto] sm:grid-cols-[1fr_120px_100px_80px] gap-4 px-5 py-3 border-b border-line text-[11px] font-semibold text-muted uppercase tracking-wider">
                  <span>Role</span>
                  <span className="hidden sm:block">Status</span>
                  <span className="hidden sm:block">Applied</span>
                  <span className="text-right">Action</span>
                </div>
                <div className="divide-y divide-line">
                  {filteredJobs.map((job) => (
                    <div key={job._id} className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_120px_100px_80px] gap-4 px-5 py-4 items-center hover:bg-page/50 transition-colors group">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-heading truncate">
                          {job.company} <span className="font-normal text-muted">·</span> <span className="font-normal text-body">{job.role}</span>
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {job.tags && job.tags.map((tag) => (
                            <span key={tag} className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${getTagColor(tag)}`}>{tag}</span>
                          ))}
                          {job.notes && (
                            <span className="text-[11px] text-muted truncate max-w-[200px]">{job.notes.length > 30 ? job.notes.slice(0, 30) + "..." : job.notes}</span>
                          )}
                          {job.contacts?.length > 0 && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" /></svg>
                              {job.contacts.length} {job.contacts.length === 1 ? "contact" : "contacts"}
                            </span>
                          )}
                          <span className="sm:hidden">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[job.status]?.badge || "bg-gray-100 text-body"}`}>{job.status}</span>
                          </span>
                        </div>
                        {/* Mobile action buttons */}
                        <div className="flex gap-1.5 mt-2 sm:hidden flex-wrap">
                          <button onClick={() => setEditJob({ ...job })} className="px-2 py-1 rounded text-[10px] font-medium bg-brand-50 text-body hover:bg-brand-100 dark:bg-brand-900/20 dark:hover:bg-brand-900/40 transition-colors">Edit</button>
                          <button onClick={() => archiveJob(job._id, true)} className="px-2 py-1 rounded text-[10px] font-medium bg-orange-50 text-orange-600 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 transition-colors">Archive</button>
                          <button onClick={() => setDeleteTarget(job)} className="px-2 py-1 rounded text-[10px] font-medium bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 transition-colors">Delete</button>
                          {["Applied", "Interview", "Offer", "Rejected"]
                            .filter((s) => s !== job.status)
                            .map((s) => (
                              <button key={s} onClick={() => updateJob(job._id, { status: s })} className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${STATUS_STYLES[s].btn}`}>{s}</button>
                            ))}
                        </div>
                      </div>
                      <span className={`hidden sm:inline-block text-xs px-2.5 py-1 rounded-full font-medium w-fit ${STATUS_STYLES[job.status]?.badge || "bg-gray-100 text-body"}`}>
                        {job.status}
                      </span>
                      <span className="hidden sm:block text-xs text-muted">
                        {job.createdAt ? new Date(job.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short" }) : "—"}
                      </span>
                      <div className="hidden sm:flex gap-1 justify-end">
                        <button onClick={() => setEditJob({ ...job })} className="p-1.5 rounded-lg text-muted hover:text-brand-400 hover:bg-brand-500/10 opacity-0 group-hover:opacity-100 transition-all" title="Edit">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
                        </button>
                        <button onClick={() => archiveJob(job._id, true)} className="p-1.5 rounded-lg text-muted hover:text-orange-400 hover:bg-orange-500/10 opacity-0 group-hover:opacity-100 transition-all" title="Archive">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
                        </button>
                        <button onClick={() => setDeleteTarget(job)} className="p-1.5 rounded-lg text-muted hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all" title="Delete">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-3 border-t border-line flex items-center justify-between">
                  <span className="text-xs text-muted">{filteredJobs.length} of {jobs.length} applications</span>
                  <div className="flex gap-1">
                    {["Applied", "Interview", "Offer", "Rejected"].map((s) => (
                      <button
                        key={s}
                        onClick={() => setFilterStatus(filterStatus === s ? "All" : s)}
                        className={`text-[10px] px-2 py-1 rounded-full font-medium transition-colors ${
                          filterStatus === s ? STATUS_STYLES[s]?.badge : "text-muted hover:text-heading"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "interviews" && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-heading">Upcoming Interviews</h2>
                <p className="text-sm text-muted mt-0.5">{upcomingInterviews.length} scheduled</p>
              </div>
              <button
                onClick={() => {
                  setInterviewModal({ mode: "add", jobId: null });
                  setIntDate("");
                  setIntTime("");
                  setIntType("Other");
                  setIntLocation("");
                  setIntNotes("");
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                Schedule Interview
              </button>
            </div>

            {upcomingInterviews.length === 0 ? (
              <div className="bg-card rounded-2xl border border-line p-12 text-center">
                <svg className="w-12 h-12 text-faint mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                <p className="text-body font-medium">No upcoming interviews</p>
                <p className="text-sm text-muted mt-1">Schedule an interview for one of your applications to see it here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {(() => {
                  const grouped = {};
                  upcomingInterviews.forEach((int) => {
                    const d = new Date(int.date);
                    const today = new Date(); today.setHours(0,0,0,0);
                    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
                    const intDay = new Date(d); intDay.setHours(0,0,0,0);
                    let label;
                    if (intDay.getTime() === today.getTime()) label = "Today";
                    else if (intDay.getTime() === tomorrow.getTime()) label = "Tomorrow";
                    else label = d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
                    if (!grouped[label]) grouped[label] = [];
                    grouped[label].push(int);
                  });
                  return Object.entries(grouped).map(([dateLabel, interviews]) => (
                    <div key={dateLabel}>
                      <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">{dateLabel}</h3>
                      <div className="space-y-2">
                        {interviews.map((int) => {
                          const typeColors = {
                            "Phone Screen": "bg-blue-500/10 text-blue-400 border-blue-500/20",
                            "Technical": "bg-purple-500/10 text-purple-400 border-purple-500/20",
                            "Behavioral": "bg-amber-500/10 text-amber-400 border-amber-500/20",
                            "System Design": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
                            "Take-Home": "bg-orange-500/10 text-orange-400 border-orange-500/20",
                            "Final Round": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                            "HR": "bg-pink-500/10 text-pink-400 border-pink-500/20",
                            "Other": "bg-gray-500/10 text-body border-gray-500/20",
                          };
                          return (
                            <div key={int._id} className="bg-card rounded-xl border border-line p-4 flex items-center gap-4 hover:border-brand-400/30 transition-colors group">
                              <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex flex-col items-center justify-center shrink-0">
                                <span className="text-[10px] font-semibold text-brand-400 uppercase leading-none">
                                  {new Date(int.date).toLocaleDateString("en-US", { month: "short" })}
                                </span>
                                <span className="text-lg font-bold text-heading leading-tight">
                                  {new Date(int.date).getDate()}
                                </span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-heading truncate">
                                  {int.company} <span className="font-normal text-muted">·</span> <span className="font-normal text-body">{int.role}</span>
                                </p>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  {int.time && (
                                    <span className="flex items-center gap-1 text-xs text-muted">
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                      {int.time}
                                    </span>
                                  )}
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${typeColors[int.type] || typeColors["Other"]}`}>
                                    {int.type}
                                  </span>
                                  {int.location && (
                                    <span className="flex items-center gap-1 text-xs text-muted truncate max-w-[200px]">
                                      <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.31a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.343 8.05" /></svg>
                                      {int.location}
                                    </span>
                                  )}
                                </div>
                                {int.notes && <p className="text-xs text-muted mt-1 truncate">{int.notes}</p>}
                              </div>
                              <button
                                onClick={async () => {
                                  try {
                                    const job = jobs.find((j) => j._id === int.jobId);
                                    if (!job) return;
                                    const updated = (job.interviews || []).filter((i) => i._id !== int._id);
                                    await axios.put(`${API}/api/jobs/${int.jobId}`, { interviews: updated }, authHeader());
                                    fetchJobs();
                                    fetchInterviews();
                                  } catch (error) {
                                    console.log(error.response?.data || error.message);
                                  }
                                }}
                                className="p-1.5 rounded-lg text-muted hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                                title="Remove interview"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            )}
          </>
        )}

        {activeTab === "archived" && (
          <>
            {archivedJobs.length === 0 ? (
              <div className="bg-card rounded-2xl border border-line p-12 text-center">
                <svg className="w-12 h-12 text-faint mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
                <p className="text-body font-medium">No archived applications</p>
                <p className="text-sm text-muted mt-1">Applications you archive will appear here.</p>
              </div>
            ) : (
              <div className="bg-card rounded-2xl border border-line overflow-hidden">
                <div className="divide-y divide-line">
                  {archivedJobs.map((job) => (
                    <div key={job._id} className="flex items-center gap-4 px-5 py-4 hover:bg-page/50 transition-colors group opacity-70 hover:opacity-100">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-heading truncate">
                          {job.company} <span className="font-normal text-muted">·</span> <span className="font-normal text-body">{job.role}</span>
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted">{job.createdAt && timeAgo(job.createdAt)}</span>
                          {job.tags && job.tags.map((tag) => (
                            <span key={tag} className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${getTagColor(tag)}`}>{tag}</span>
                          ))}
                        </div>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLES[job.status]?.badge || "bg-gray-100 text-body"}`}>{job.status}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => archiveJob(job._id, false)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-brand-400 hover:bg-brand-500/10 transition-colors">Restore</button>
                        <button onClick={() => setDeleteTarget(job)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "ai" && <Suspense fallback={<div className="text-center py-12 text-muted">Loading AI Tailor...</div>}><AITailorTab authHeader={authHeader} /></Suspense>}

        {activeTab === "documents" && <Suspense fallback={<div className="text-center py-12 text-muted">Loading Documents...</div>}><DocumentsTab authHeader={authHeader} jobs={jobs} /></Suspense>}

        {activeTab === "profile" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-xl font-bold text-heading">Profile</h2>

            <div className="bg-card rounded-2xl border border-line p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {initials}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-heading">{userName}</h3>
                  <p className="text-sm text-muted">{session?.user?.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-t border-line">
                  <span className="text-sm text-muted">Auth Provider</span>
                  <span className="text-sm font-medium text-body capitalize">{session?.user?.app_metadata?.provider || "email"}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-t border-line">
                  <span className="text-sm text-muted">Account Created</span>
                  <span className="text-sm font-medium text-body">{session?.user?.created_at ? new Date(session.user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—"}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-t border-line">
                  <span className="text-sm text-muted">Last Sign In</span>
                  <span className="text-sm font-medium text-body">{session?.user?.last_sign_in_at ? new Date(session.user.last_sign_in_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-t border-line">
                  <span className="text-sm text-muted">Total Applications</span>
                  <span className="text-sm font-medium text-body">{totalApps}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-t border-line">
                  <span className="text-sm text-muted">Archived Applications</span>
                  <span className="text-sm font-medium text-body">{archivedJobs.length}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-t border-line">
                  <span className="text-sm text-muted">Weekly Goal</span>
                  {editingGoal ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={goalInput}
                        onChange={(e) => setGoalInput(e.target.value)}
                        className="w-16 px-2 py-1 text-sm text-center border border-line-strong bg-input-bg rounded-lg text-heading outline-none focus:ring-1 focus:ring-brand-400"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const val = Math.max(1, Math.min(100, parseInt(goalInput) || 10));
                            setWeeklyGoal(val);
                            setGoalInput(String(val));
                            setEditingGoal(false);
                            axios.put(`${API}/api/jobs/settings`, { weeklyGoal: val }, authHeader()).catch(() => {});
                          }
                          if (e.key === "Escape") setEditingGoal(false);
                        }}
                      />
                      <button
                        onClick={() => {
                          const val = Math.max(1, Math.min(100, parseInt(goalInput) || 10));
                          setWeeklyGoal(val);
                          setGoalInput(String(val));
                          setEditingGoal(false);
                          axios.put(`${API}/api/jobs/settings`, { weeklyGoal: val }, authHeader()).catch(() => {});
                        }}
                        className="px-2.5 py-1 text-xs bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => { setEditingGoal(false); setGoalInput(String(weeklyGoal)); }}
                        className="px-2.5 py-1 text-xs text-muted hover:text-body border border-line-strong rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setGoalInput(String(weeklyGoal)); setEditingGoal(true); }}
                      className="flex items-center gap-1.5 text-sm font-medium text-body hover:text-brand-400 transition-colors group"
                    >
                      {weeklyGoal} apps/week
                      <svg className="w-3.5 h-3.5 text-muted group-hover:text-brand-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" /></svg>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-line p-6">
              <h3 className="text-lg font-semibold text-heading mb-1">Email Notifications</h3>
              <p className="text-xs text-muted mb-4">Receive a weekly summary email every Monday with your stats, upcoming interviews, and follow-up reminders.</p>
              <div className="flex items-center justify-between py-3 border-t border-line">
                <span className="text-sm text-muted">Weekly Summary Email</span>
                <button
                  onClick={() => {
                    const val = !emailNotifications;
                    setEmailNotifications(val);
                    axios.put(`${API}/api/jobs/settings`, { emailNotifications: val }, authHeader()).catch(() => setEmailNotifications(!val));
                  }}
                  className={`relative w-11 h-6 rounded-full transition-colors ${emailNotifications ? "bg-brand-600" : "bg-gray-300 dark:bg-gray-600"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${emailNotifications ? "translate-x-5" : ""}`} />
                </button>
              </div>
              {emailNotifications && (
                <div className="mt-3 pt-3 border-t border-line">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={async () => {
                        setSendingTestEmail(true);
                        setTestEmailMsg("");
                        try {
                          const res = await axios.post(`${API}/api/jobs/send-test-email`, {}, authHeader());
                          setTestEmailMsg(res.data.message);
                        } catch (err) {
                          setTestEmailMsg(err.response?.data?.message || "Failed to send test email");
                        } finally {
                          setSendingTestEmail(false);
                        }
                      }}
                      disabled={sendingTestEmail}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-brand-600 dark:text-brand-400 border border-brand-300 dark:border-brand-600 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors disabled:opacity-50"
                    >
                      {sendingTestEmail ? (
                        <>
                          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                          Send Test Email
                        </>
                      )}
                    </button>
                    {testEmailMsg && (
                      <span className={`text-xs ${testEmailMsg.includes("Failed") ? "text-red-500" : "text-emerald-500"}`}>{testEmailMsg}</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-card rounded-2xl border border-red-500/20 p-6">
              <h3 className="text-lg font-semibold text-red-400 mb-2">Delete Account Permenantely</h3>
              <p className="text-sm text-muted mb-4">
                Permanently delete your account and all associated data. This includes all job applications, interview records, activity history, and settings. This action cannot be undone.
              </p>
              <button
                onClick={() => setDeleteAccountModal(true)}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Edit Modal */}
      {editJob && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4" onClick={() => setEditJob(null)}>
          <div className="bg-card rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-md p-5 sm:p-6 border border-line-strong max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-heading">Edit Application</h3>
              <button onClick={() => setEditJob(null)} className="p-1 text-muted hover:text-body rounded-lg hover:bg-page">
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

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-body">Contacts</label>
                  <button type="button" onClick={() => setEditJob({ ...editJob, _showContactForm: !editJob._showContactForm, _contactInput: editJob._contactInput || { name: "", role: "", email: "", phone: "", linkedin: "", notes: "" } })} className="text-xs text-brand-500 hover:text-brand-400 font-medium">
                    {editJob._showContactForm ? "Cancel" : "+ Add Contact"}
                  </button>
                </div>

                {editJob._showContactForm && (
                  <div className="border border-line rounded-lg p-3 mb-2 space-y-2 bg-page/50">
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" placeholder="Name *" value={editJob._contactInput?.name || ""} onChange={(e) => setEditJob({ ...editJob, _contactInput: { ...editJob._contactInput, name: e.target.value } })} className={`${inputClass} !py-2 !text-xs`} />
                      <input type="text" placeholder="Role (e.g. Recruiter)" value={editJob._contactInput?.role || ""} onChange={(e) => setEditJob({ ...editJob, _contactInput: { ...editJob._contactInput, role: e.target.value } })} className={`${inputClass} !py-2 !text-xs`} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="email" placeholder="Email" value={editJob._contactInput?.email || ""} onChange={(e) => setEditJob({ ...editJob, _contactInput: { ...editJob._contactInput, email: e.target.value } })} className={`${inputClass} !py-2 !text-xs`} />
                      <input type="text" placeholder="Phone" value={editJob._contactInput?.phone || ""} onChange={(e) => setEditJob({ ...editJob, _contactInput: { ...editJob._contactInput, phone: e.target.value } })} className={`${inputClass} !py-2 !text-xs`} />
                    </div>
                    <input type="url" placeholder="LinkedIn URL" value={editJob._contactInput?.linkedin || ""} onChange={(e) => setEditJob({ ...editJob, _contactInput: { ...editJob._contactInput, linkedin: e.target.value } })} className={`${inputClass} !py-2 !text-xs`} />
                    <input type="text" placeholder="Notes about this contact" value={editJob._contactInput?.notes || ""} onChange={(e) => setEditJob({ ...editJob, _contactInput: { ...editJob._contactInput, notes: e.target.value } })} className={`${inputClass} !py-2 !text-xs`} />
                    <button
                      type="button"
                      onClick={() => {
                        if (!editJob._contactInput?.name?.trim()) return;
                        const { name, role: r, email, phone, linkedin, notes: n } = editJob._contactInput;
                        setEditJob({ ...editJob, contacts: [...(editJob.contacts || []), { name, role: r, email, phone, linkedin, notes: n }], _showContactForm: false, _contactInput: { name: "", role: "", email: "", phone: "", linkedin: "", notes: "" } });
                      }}
                      className="w-full py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-medium transition-colors"
                    >
                      Add Contact
                    </button>
                  </div>
                )}

                {editJob.contacts?.length > 0 && (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {editJob.contacts.map((c, i) => (
                      <div key={`${c.name}-${c.email || i}`} className="flex items-center justify-between px-3 py-2 bg-page/50 border border-line rounded-lg">
                        <div className="min-w-0">
                          <span className="text-xs font-medium text-heading">{c.name}</span>
                          {c.role && <span className="text-xs text-muted ml-1.5">· {c.role}</span>}
                          {c.email && <span className="text-[10px] text-muted block truncate">{c.email}</span>}
                        </div>
                        <button type="button" onClick={() => setEditJob({ ...editJob, contacts: editJob.contacts.filter((_, j) => j !== i) })} className="text-muted hover:text-red-500 ml-2 shrink-0">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => updateJob(editJob._id, { company: editJob.company, role: editJob.role, status: editJob.status, link: editJob.link, notes: editJob.notes, tags: editJob.tags || [], followUpDate: editJob.followUpDate || null, interviews: editJob.interviews || [], contacts: editJob.contacts || [] })}
                className="flex-1 bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-lg text-sm font-medium shadow-sm transition-colors"
              >
                Save Changes
              </button>
              <button onClick={() => setEditJob(null)} className="px-5 py-2.5 border border-line-strong text-body rounded-lg text-sm font-medium hover:bg-page transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4" onClick={() => setDeleteTarget(null)}>
          <div className="bg-card rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center border border-line-strong" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-heading mb-1">Delete Application?</h3>
            <p className="text-sm text-body mb-6">
              <span className="font-medium text-heading">{deleteTarget.company} — {deleteTarget.role}</span> will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 px-4 py-2.5 border border-line-strong text-body rounded-lg text-sm font-medium hover:bg-page transition-colors">
                Cancel
              </button>
              <button onClick={() => deleteJob(deleteTarget._id)} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Interview Schedule Modal */}
      {interviewModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4" onClick={() => setInterviewModal(null)}>
          <div className="bg-card rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-md p-5 sm:p-6 border border-line-strong max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-heading">Schedule Interview</h3>
              <button onClick={() => setInterviewModal(null)} className="p-1 text-muted hover:text-body rounded-lg hover:bg-page">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-body mb-1.5">Application *</label>
                <select
                  value={interviewModal.jobId || ""}
                  onChange={(e) => setInterviewModal({ ...interviewModal, jobId: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Select an application...</option>
                  {jobs.filter((j) => j.status !== "Rejected").map((j) => (
                    <option key={j._id} value={j._id}>{j.company} — {j.role}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-body mb-1.5">Date *</label>
                  <input type="date" value={intDate} onChange={(e) => setIntDate(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-body mb-1.5">Time</label>
                  <input type="time" value={intTime} onChange={(e) => setIntTime(e.target.value)} className={inputClass} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-body mb-1.5">Interview Type</label>
                <select value={intType} onChange={(e) => setIntType(e.target.value)} className={inputClass}>
                  <option value="Phone Screen">Phone Screen</option>
                  <option value="Technical">Technical</option>
                  <option value="Behavioral">Behavioral</option>
                  <option value="System Design">System Design</option>
                  <option value="Take-Home">Take-Home</option>
                  <option value="Final Round">Final Round</option>
                  <option value="HR">HR</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-body mb-1.5">Location / Meeting Link</label>
                <input type="text" placeholder="e.g. Zoom link, office address..." value={intLocation} onChange={(e) => setIntLocation(e.target.value)} className={inputClass} />
              </div>

              <div>
                <label className="block text-xs font-medium text-body mb-1.5">Notes</label>
                <textarea placeholder="Prep notes, interviewer name..." value={intNotes} onChange={(e) => setIntNotes(e.target.value)} rows={2} className={`${inputClass} resize-none`} />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                disabled={!interviewModal.jobId || !intDate}
                onClick={async () => {
                  try {
                    const job = jobs.find((j) => j._id === interviewModal.jobId);
                    if (!job) return;
                    const newInterview = {
                      date: intDate,
                      time: intTime || null,
                      type: intType,
                      location: intLocation || null,
                      notes: intNotes || null,
                    };
                    const updatedInterviews = [...(job.interviews || []), newInterview];
                    await axios.put(`${API}/api/jobs/${interviewModal.jobId}`, {
                      interviews: updatedInterviews,
                      status: job.status === "Applied" ? "Interview" : job.status,
                    }, authHeader());
                    fetchJobs();
                    fetchStats();
                    fetchInterviews();
                    fetchActivities();
                    setInterviewModal(null);
                  } catch (error) {
                    console.log(error.response?.data || error.message);
                  }
                }}
                className="flex-1 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-lg text-sm font-medium shadow-sm transition-colors"
              >
                Schedule Interview
              </button>
              <button onClick={() => setInterviewModal(null)} className="px-5 py-2.5 border border-line-strong text-body rounded-lg text-sm font-medium hover:bg-page transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {deleteAccountModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4" onClick={() => { setDeleteAccountModal(false); setDeleteConfirmText(""); }}>
          <div className="bg-card rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-sm p-5 sm:p-6 border border-red-500/30" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-heading text-center mb-1">Delete Your Account?</h3>
            <p className="text-sm text-body text-center mb-4">
              This will permanently delete all your data including <span className="font-medium text-heading">{totalApps + archivedJobs.length} applications</span>, interviews, and activity history.
            </p>
            <div className="mb-4">
              <label className="block text-xs font-medium text-body mb-1.5">Type <span className="font-bold text-red-400">DELETE</span> to confirm</label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className={`${inputClass} border-red-500/30 focus:border-red-500 focus:ring-red-500/20`}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setDeleteAccountModal(false); setDeleteConfirmText(""); }}
                className="flex-1 px-4 py-2.5 border border-line-strong text-body rounded-lg text-sm font-medium hover:bg-page transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={deleteConfirmText !== "DELETE" || deletingAccount}
                onClick={async () => {
                  setDeletingAccount(true);
                  try {
                    await axios.delete(`${API}/api/jobs/account`, authHeader());
                    await supabase.auth.signOut();
                  } catch (error) {
                    console.log(error.response?.data || error.message);
                    setDeletingAccount(false);
                  }
                }}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
              >
                {deletingAccount ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} />
      <OnboardingTour loading={loading} />

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-line md:hidden z-40 safe-bottom">
        <div className="flex justify-around items-center h-14">
          {[
            { id: "dashboard", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>, label: "Home" },
            { id: "applications", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>, label: "Jobs" },
            { id: "add", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>, label: "Add" },
            { id: "ai", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" /></svg>, label: "AI" },
            { id: "profile", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>, label: "Profile" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
                activeTab === item.id ? "text-brand-400" : "text-muted"
              }`}
            >
              {item.icon}
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Bottom nav spacer for mobile */}
      <div className="h-14 md:hidden" />
    </div>
  );
}
