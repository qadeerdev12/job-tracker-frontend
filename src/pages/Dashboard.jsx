import { useEffect, useState } from "react";
import axios from "axios";

function Dashboard() {
  console.log("Dashboard component rendering");
  const [jobs, setJobs] = useState([]);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("Applied");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

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

  const filteredJobs = jobs.filter((job) => {
  const matchesSearch =
    job.company.toLowerCase().includes(search.toLowerCase()) ||
    job.role.toLowerCase().includes(search.toLowerCase());

  const matchesStatus =
    filterStatus === "All" || job.status === filterStatus;

  return matchesSearch && matchesStatus;
});

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

    // Clear form
    setCompany("");
    setRole("");
    setStatus("Applied");

    // Refresh jobs
    fetchJobs();

  } catch (error) {
    console.log(error.response?.data || error.message);
  }
};

  const deleteJob = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(`https://job-tracker-backend-s1fc.onrender.com/api/jobs/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchJobs();
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `https://job-tracker-backend-s1fc.onrender.com/apijobs/${id}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchJobs();
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
  <div style={{ backgroundColor: "red" }} className="min-h-screen p-6">
    <h2 className="text-3xl font-bold mb-6 text-center">
      UPDATED DASHBOARD 🚨
    </h2>

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

export default Dashboard;