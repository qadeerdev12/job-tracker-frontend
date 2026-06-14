import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import Login from "./pages/Login";
import Register from "./pages/Register";
import LandingPage from "./pages/LandingPage";

const API = "http://localhost:5001";

const STATUS_STYLES = {
  Applied: { badge: "bg-brand-100 text-brand-700", btn: "bg-brand-50 text-brand-600 hover:bg-brand-100", dot: "bg-brand-500" },
  Interview: { badge: "bg-amber-100 text-amber-700", btn: "bg-amber-50 text-amber-600 hover:bg-amber-100", dot: "bg-amber-500" },
  Offer: { badge: "bg-emerald-100 text-emerald-700", btn: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100", dot: "bg-emerald-500" },
  Rejected: { badge: "bg-gray-100 text-gray-700", btn: "bg-gray-50 text-gray-600 hover:bg-gray-100", dot: "bg-gray-400" },
};

const CHART_COLORS = ["#6366f1", "#f59e0b", "#10b981", "#6b7280"];

const inputClass = "w-full border border-gray-200 bg-gray-50/50 px-4 py-2.5 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 focus:bg-white outline-none transition-all";

function decodeToken(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload;
  } catch {
    return null;
  }
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
    { id: "add", label: "Add New", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg> },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-surface-dark flex flex-col z-40">
      <div className="p-6 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-400 to-brand-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.63 8.41m5.96 5.96a14.926 14.926 0 01-5.84 2.58m0 0a6 6 0 01-7.38-5.84h4.8m2.58-5.84a14.927 14.927 0 00-2.58 5.84m2.58-5.84L18 2.76M2 16.76l3-3" /></svg>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">ApplyFlow</span>
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
                : "text-gray-400 hover:text-white hover:bg-white/5"
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
            <p className="text-sm font-medium text-white truncate">{userName}</p>
            <p className="text-xs text-gray-500">Free Plan</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl text-sm transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          Sign Out
        </button>
      </div>
    </aside>
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
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [editJob, setEditJob] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const token = localStorage.getItem("token");
  const user = useMemo(() => decodeToken(token), [token]);
  const firstName = user?.name?.split(" ")[0] || "there";
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const authHeader = () => ({
    headers: { Authorization: `Bearer ${token}` },
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

  useEffect(() => {
    fetchJobs();
    fetchStats();
  }, []);

  const createJob = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/api/jobs`, { company, role, status, link, notes }, authHeader());
      fetchJobs();
      fetchStats();
      setCompany("");
      setRole("");
      setStatus("Applied");
      setLink("");
      setNotes("");
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
      setEditJob(null);
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  const filteredJobs = jobs
    .filter((job) => {
      const matchesSearch =
        job.company.toLowerCase().includes(search.toLowerCase()) ||
        job.role.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = filterStatus === "All" || job.status === filterStatus;
      return matchesSearch && matchesStatus;
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

  const chartData = [
    { name: "Applied", value: stats.Applied },
    { name: "Interview", value: stats.Interview },
    { name: "Offer", value: stats.Offer },
    { name: "Rejected", value: stats.Rejected },
  ];

  const totalApps = stats.Applied + stats.Interview + stats.Offer + stats.Rejected;

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
    gray: { bg: "bg-gray-50", icon: "bg-gray-100 text-gray-600", text: "text-gray-600" },
  };

  return (
    <div className="min-h-screen bg-gray-50/80">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 transition-transform duration-200 z-40`}>
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => { setActiveTab(tab); setSidebarOpen(false); }}
          handleLogout={handleLogout}
          initials={initials}
          userName={user?.name || "User"}
        />
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200/60">
          <div className="flex items-center justify-between px-6 lg:px-8 h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {activeTab === "dashboard" && "Dashboard"}
                  {activeTab === "applications" && "Applications"}
                  {activeTab === "add" && "New Application"}
                </h1>
                <p className="text-xs text-gray-400">
                  {activeTab === "dashboard" && `Welcome back, ${firstName}`}
                  {activeTab === "applications" && `${filteredJobs.length} of ${jobs.length} shown`}
                  {activeTab === "add" && "Track a new job application"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab("add")}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg shadow-sm shadow-brand-600/20 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                Add New
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
                    <div key={card.label} className="bg-white rounded-xl border border-gray-200/60 p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{card.label}</span>
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
                <div className="bg-white rounded-xl border border-gray-200/60 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-800">Status Breakdown</h3>
                    <span className="text-xs text-gray-400">{totalApps} total</span>
                  </div>
                  <div className="flex justify-center">
                    <PieChart width={280} height={240}>
                      <Pie data={chartData} dataKey="value" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}>
                        {chartData.map((entry, index) => (
                          <Cell key={index} fill={CHART_COLORS[index]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "13px" }} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "13px" }} />
                    </PieChart>
                  </div>
                </div>

                {/* Weekly Bar Chart */}
                <div className="bg-white rounded-xl border border-gray-200/60 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-800">Weekly Activity</h3>
                    <span className="text-xs text-gray-400">Last 6 weeks</span>
                  </div>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={weeklyData} barSize={32}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="week" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "13px" }} />
                      <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl border border-gray-200/60 p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-semibold text-gray-800">Recent Activity</h3>
                  <button onClick={() => setActiveTab("applications")} className="text-xs text-brand-600 hover:text-brand-700 font-medium">View all</button>
                </div>
                {recentActivity.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-8">No activity yet — add your first application!</p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {recentActivity.map((job) => (
                      <div key={job._id} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${STATUS_STYLES[job.status]?.dot || "bg-gray-400"}`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-800 truncate">{job.company}</p>
                          <p className="text-xs text-gray-400 truncate">{job.role}</p>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLES[job.status]?.badge || "bg-gray-100 text-gray-600"}`}>
                          {job.status}
                        </span>
                        <span className="text-xs text-gray-400 shrink-0 w-20 text-right">
                          {timeAgo(job.updatedAt || job.createdAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ===== ADD TAB ===== */}
          {activeTab === "add" && (
            <div className="max-w-xl mx-auto">
              <div className="bg-white rounded-xl border border-gray-200/60 p-8">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Track New Application</h2>
                  <p className="text-sm text-gray-400 mt-1">Fill in the details below to add a job to your tracker.</p>
                </div>

                <form onSubmit={createJob} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">Company *</label>
                      <input type="text" placeholder="e.g. Google" value={company} onChange={(e) => setCompany(e.target.value)} required className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">Role *</label>
                      <input type="text" placeholder="e.g. Frontend Engineer" value={role} onChange={(e) => setRole(e.target.value)} required className={inputClass} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Job Posting URL</label>
                    <input type="url" placeholder="https://..." value={link} onChange={(e) => setLink(e.target.value)} className={inputClass} />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Notes</label>
                    <textarea placeholder="Anything to remember about this application..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={`${inputClass} resize-none`} />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Status</label>
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
              <div className="bg-white rounded-xl border border-gray-200/60 p-4 mb-6">
                <div className="flex flex-wrap gap-3">
                  <div className="relative flex-1 min-w-[200px]">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input
                      type="text"
                      placeholder="Search by company or role..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 bg-gray-50/50 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 focus:bg-white outline-none transition-all"
                    />
                  </div>
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={`${inputClass} w-auto min-w-[140px]`}>
                    <option value="All">All Statuses</option>
                    <option value="Applied">Applied</option>
                    <option value="Interview">Interview</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={`${inputClass} w-auto min-w-[140px]`}>
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="company">Company A-Z</option>
                    <option value="status">By Status</option>
                  </select>
                </div>
              </div>

              {/* Job Table */}
              {filteredJobs.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200/60 p-12 text-center">
                  <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                  <p className="text-gray-500 font-medium">No applications found</p>
                  <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or add a new application.</p>
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
                      className="bg-white rounded-xl border border-gray-200/60 p-5 hover:border-brand-200 hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                          job.status === "Applied" ? "bg-brand-100 text-brand-700" :
                          job.status === "Interview" ? "bg-amber-100 text-amber-700" :
                          job.status === "Offer" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"
                        }`}>
                          {job.company.charAt(0).toUpperCase()}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="text-sm font-semibold text-gray-900">{job.company}</h3>
                              <p className="text-sm text-gray-500">{job.role}</p>
                            </div>
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${STATUS_STYLES[job.status]?.badge || "bg-gray-100 text-gray-700"}`}>
                              {job.status}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
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
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 mt-3 flex-wrap opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setEditJob({ ...job })}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteTarget(job)}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                            >
                              Delete
                            </button>
                            <div className="h-6 w-px bg-gray-200 mx-1" />
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
        </main>
      </div>

      {/* Edit Modal */}
      {editJob && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setEditJob(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 border border-gray-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-900">Edit Application</h3>
              <button onClick={() => setEditJob(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Company</label>
                <input type="text" value={editJob.company} onChange={(e) => setEditJob({ ...editJob, company: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Role</label>
                <input type="text" value={editJob.role} onChange={(e) => setEditJob({ ...editJob, role: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Job URL</label>
                <input type="url" value={editJob.link || ""} onChange={(e) => setEditJob({ ...editJob, link: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Notes</label>
                <textarea value={editJob.notes || ""} onChange={(e) => setEditJob({ ...editJob, notes: e.target.value })} rows={3} className={`${inputClass} resize-none`} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Status</label>
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
                onClick={() => updateJob(editJob._id, { company: editJob.company, role: editJob.role, status: editJob.status, link: editJob.link, notes: editJob.notes })}
                className="flex-1 bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-lg text-sm font-medium shadow-sm transition-colors"
              >
                Save Changes
              </button>
              <button onClick={() => setEditJob(null)} className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 text-center border border-gray-200" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Delete Application?</h3>
            <p className="text-sm text-gray-500 mb-6">
              <span className="font-medium text-gray-700">{deleteTarget.company} — {deleteTarget.role}</span> will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
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
  const token = localStorage.getItem("token");
  const [page, setPage] = useState("landing");

  if (token) return <Dashboard />;

  if (page === "landing") return <LandingPage setPage={setPage} />;
  if (page === "register") return <Register setPage={setPage} />;
  return <Login setPage={setPage} />;
}

export default App;
