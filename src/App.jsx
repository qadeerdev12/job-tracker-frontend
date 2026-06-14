import { useState, useEffect } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import Login from "./pages/Login";
import Register from "./pages/Register";
import LandingPage from "./pages/LandingPage";

const API = "https://job-tracker-backend-s1fc.onrender.com";

const STATUS_STYLES = {
  Applied: { badge: "bg-brand-100 text-brand-700", btn: "bg-brand-50 text-brand-600 hover:bg-brand-100" },
  Interview: { badge: "bg-amber-100 text-amber-700", btn: "bg-amber-50 text-amber-600 hover:bg-amber-100" },
  Offer: { badge: "bg-emerald-100 text-emerald-700", btn: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" },
  Rejected: { badge: "bg-gray-100 text-gray-700", btn: "bg-gray-50 text-gray-600 hover:bg-gray-100" },
};

const CHART_COLORS = ["#6366f1", "#f59e0b", "#10b981", "#6b7280"];

function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({ Applied: 0, Interview: 0, Offer: 0, Rejected: 0 });
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("Applied");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const authHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
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
      await axios.post(`${API}/api/jobs`, { company, role, status }, authHeader());
      fetchJobs();
      fetchStats();
      setCompany("");
      setRole("");
      setStatus("Applied");
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  const deleteJob = async (jobId) => {
    try {
      await axios.delete(`${API}/api/jobs/${jobId}`, authHeader());
      fetchJobs();
      fetchStats();
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  const updateStatus = async (jobId, newStatus) => {
    try {
      await axios.put(`${API}/api/jobs/${jobId}`, { status: newStatus }, authHeader());
      fetchJobs();
      fetchStats();
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.company.toLowerCase().includes(search.toLowerCase()) ||
      job.role.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "All" || job.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const chartData = [
    { name: "Applied", value: stats.Applied },
    { name: "Interview", value: stats.Interview },
    { name: "Offer", value: stats.Offer },
    { name: "Rejected", value: stats.Rejected },
  ];

  const statCards = [
    { label: "Applied", count: stats.Applied, gradient: "from-brand-400 to-brand-600" },
    { label: "Interview", count: stats.Interview, gradient: "from-amber-400 to-amber-600" },
    { label: "Offer", count: stats.Offer, gradient: "from-emerald-400 to-emerald-600" },
    { label: "Rejected", count: stats.Rejected, gradient: "from-gray-400 to-gray-600" },
  ];

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-white border-b border-brand-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <span className="text-2xl font-extrabold text-brand-600">ApplyFlow</span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-gray-500 hover:text-red-500 border border-gray-200 hover:border-red-200 rounded-xl transition-colors text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats + Chart Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Stats Cards */}
          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
            {statCards.map((card) => (
              <div
                key={card.label}
                className={`bg-gradient-to-br ${card.gradient} text-white p-5 rounded-2xl shadow-lg hover:scale-105 transition-transform cursor-default`}
              >
                <h3 className="text-sm font-semibold opacity-90">{card.label}</h3>
                <p className="text-4xl font-extrabold mt-1">{card.count}</p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="bg-surface-card rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3 text-center">Status Overview</h3>
            <div className="flex justify-center">
              <PieChart width={220} height={220}>
                <Pie data={chartData} dataKey="value" cx="50%" cy="50%" outerRadius={75}>
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={CHART_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </div>
          </div>
        </div>

        {/* Add Job Form */}
        <form
          onSubmit={createJob}
          className="bg-surface-card rounded-2xl shadow-lg border border-gray-100 p-8 mb-8 max-w-lg mx-auto"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-5">Add New Application</h3>

          <input
            type="text"
            placeholder="Company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
            className="w-full border border-gray-200 p-3 rounded-xl mb-3 focus:ring-2 focus:ring-brand-400 focus:border-brand-400 outline-none transition-shadow"
          />

          <input
            type="text"
            placeholder="Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
            className="w-full border border-gray-200 p-3 rounded-xl mb-3 focus:ring-2 focus:ring-brand-400 focus:border-brand-400 outline-none transition-shadow"
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border border-gray-200 p-3 rounded-xl mb-4 focus:ring-2 focus:ring-brand-400 focus:border-brand-400 outline-none"
          >
            <option value="Applied">Applied</option>
            <option value="Interview">Interview</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
          </select>

          <button className="w-full bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white py-3 rounded-xl font-semibold shadow-md transition-all">
            Add Application
          </button>
        </form>

        {/* Search + Filter */}
        <div className="max-w-2xl mx-auto mb-6 flex gap-3 bg-surface-card rounded-2xl shadow-lg border border-gray-100 p-4">
          <input
            type="text"
            placeholder="Search by company or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-brand-400 focus:border-brand-400 outline-none"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-brand-400 focus:border-brand-400 outline-none"
          >
            <option value="All">All</option>
            <option value="Applied">Applied</option>
            <option value="Interview">Interview</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Job List */}
        <div className="max-w-2xl mx-auto space-y-4">
          {filteredJobs.length === 0 ? (
            <p className="text-center text-gray-400 py-12">No applications found</p>
          ) : (
            filteredJobs.map((job) => (
              <div
                key={job._id}
                className="bg-surface-card rounded-2xl shadow-md hover:shadow-lg transition-shadow border border-gray-100 p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{job.company}</h3>
                    <p className="text-gray-500 text-sm">{job.role}</p>
                  </div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[job.status]?.badge || "bg-gray-100 text-gray-700"}`}>
                    {job.status}
                  </span>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => deleteJob(job._id)}
                    className="px-4 py-1.5 rounded-full text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
                  {["Interview", "Offer", "Rejected"].map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(job._id, s)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${STATUS_STYLES[s].btn}`}
                    >
                      {s === "Rejected" ? "Reject" : s}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
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
