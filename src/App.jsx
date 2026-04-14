// Dashboard Component - Handles job tracking UI, API calls, and state management
import { useState, useEffect } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Main Dashboard component
function Dashboard() {
  // Job data state
  const [jobs, setJobs] = useState([]);
  // Statistics state (counts by job status)
  const [stats, setStats] = useState({
    Applied: 0,
    Interview: 0,
    Offer: 0,
    Rejected: 0,
  });

  // Form input state
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("Applied");
  // Search and filter state
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // Fetch all jobs from backend API
  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("https://job-tracker-backend-s1fc.onrender.com/api/jobs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setJobs(res.data);
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  // Fetch job statistics from backend API
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("https://job-tracker-backend-s1fc.onrender.com/api/jobs/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setStats(res.data);
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  // Load jobs and stats on component mount
  useEffect(() => {
    fetchJobs();
    fetchStats();
  }, []);

  // Create a new job entry
  const createJob = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "https://job-tracker-backend-s1fc.onrender.com/api/jobs",
        { company, role, status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchJobs();
      fetchStats();
      setCompany("");
      setRole("");
      setStatus("Applied");
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  // Delete a job by ID
  const deleteJob = async (jobId) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(`https://job-tracker-backend-s1fc.onrender.com/apijobs/${jobId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchJobs();
      fetchStats();
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  // Update job status (Interview, Offer, Rejected)
  const updateStatus = async (jobId, status) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `https://job-tracker-backend-s1fc.onrender.com/api/jobs/${jobId}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchJobs();
      fetchStats();
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  // Logout user and clear token
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  // Filter jobs based on search input and selected status
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.company.toLowerCase().includes(search.toLowerCase()) ||
      job.role.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      filterStatus === "All" || job.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Chart data for visualization
  const chartData = [
    { name: "Applied", value: stats.Applied },
    { name: "Interview", value: stats.Interview },
    { name: "Offer", value: stats.Offer },
    { name: "Rejected", value: stats.Rejected },
  ];

  const COLORS = ["#3B82F6", "#FACC15", "#22C55E", "#6B7280"];

  // Render Dashboard UI
  return (
    <div className="min-h-screen bg-gray-300 p-6">
      <div className="flex justify-between items-center mb-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold">
          Job Tracker Dashboard
        </h2>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 max-w-3xl mx-auto">
        <div className="bg-blue-500 text-white p-4 rounded text-center">
          <h3 className="text-lg font-bold">Applied</h3>
          <p className="text-2xl">{stats.Applied}</p>
        </div>

        <div className="bg-yellow-500 text-white p-4 rounded text-center">
          <h3 className="text-lg font-bold">Interview</h3>
          <p className="text-2xl">{stats.Interview}</p>
        </div>

        <div className="bg-green-500 text-white p-4 rounded text-center">
          <h3 className="text-lg font-bold">Offer</h3>
          <p className="text-2xl">{stats.Offer}</p>
        </div>

        <div className="bg-gray-500 text-white p-4 rounded text-center">
          <h3 className="text-lg font-bold">Rejected</h3>
          <p className="text-2xl">{stats.Rejected}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="flex justify-center mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-bold mb-2 text-center">
            Job Status Chart
          </h3>

          <PieChart width={250} height={250}>
            <Pie
              data={chartData}
              dataKey="value"
              cx="50%"
              cy="50%"
              outerRadius={80}
            >
              {chartData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
      </div>

      {/* Add Job Form */}
      <form
        onSubmit={createJob}
        className="bg-white p-6 rounded-lg shadow-md mb-6 max-w-md mx-auto"
      >
        <h3 className="text-xl font-semibold mb-4">Add Job</h3>

        <input
          type="text"
          placeholder="Company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="w-full border p-2 rounded mb-3"
        />

        <input
          type="text"
          placeholder="Role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full border p-2 rounded mb-3"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border p-2 rounded mb-3"
        >
          <option value="Applied">Applied</option>
          <option value="Interview">Interview</option>
          <option value="Offer">Offer</option>
          <option value="Rejected">Rejected</option>
        </select>

        <button className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
          Add Job
        </button>
      </form>

      {/* Search + Filter */}
      <div className="max-w-2xl mx-auto mb-4 flex gap-3 bg-white p-3 rounded shadow">
        <input
          type="text"
          placeholder="Search jobs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-400 p-2 rounded"
        />

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-400 p-2 rounded"
        >
          <option value="All">All</option>
          <option value="Applied">Applied</option>
          <option value="Interview">Interview</option>
          <option value="Offer">Offer</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Job List */}
      <div className="max-w-2xl mx-auto">
        {filteredJobs.length === 0 ? (
          <p className="text-center text-gray-500">No jobs found</p>
        ) : (
          filteredJobs.map((job) => (
            <div
              key={job._id}
              className="bg-white p-4 rounded-lg shadow-md mb-4"
            >
              <h3 className="text-lg font-bold">{job.company}</h3>
              <p className="text-gray-600">{job.role}</p>
              <p className="mb-3">Status: {job.status}</p>

              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => deleteJob(job._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>

                <button
                  onClick={() => updateStatus(job._id, "Interview")}
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  Interview
                </button>

                <button
                  onClick={() => updateStatus(job._id, "Offer")}
                  className="bg-green-500 text-white px-3 py-1 rounded"
                >
                  Offer
                </button>

                <button
                  onClick={() => updateStatus(job._id, "Rejected")}
                  className="bg-gray-500 text-white px-3 py-1 rounded"
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// App component to handle authentication routing
function App() {
  const token = localStorage.getItem("token");
  const [page, setPage] = useState("login");

  if (token) return <Dashboard />;

  if (page === "register") return <Register setPage={setPage} />;

  return <Login setPage={setPage} />;
}

export default App;