import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { supabase } from "../../lib/supabase";
import { API } from "../../utils/constants";
import { getWeeklyData } from "../../utils/helpers";
import { useToast } from "../Toast";

export default function useDashboardData() {
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

  return {
    // State
    jobs, stats, company, setCompany, role, setRole, status, setStatus,
    link, setLink, notes, setNotes, followUpDate, setFollowUpDate,
    formTags, setFormTags, search, setSearch, filterStatus, setFilterStatus,
    filterTag, setFilterTag, sortBy, setSortBy, activeTab, setActiveTab,
    allTags, mobileMenuOpen, setMobileMenuOpen, loading, toasts, toast,
    archivedJobs, activities, editJob, setEditJob, deleteTarget, setDeleteTarget,
    expandedTimeline, setExpandedTimeline, reminders, upcomingInterviews,
    interviewModal, setInterviewModal, intDate, setIntDate, intTime, setIntTime,
    intType, setIntType, intLocation, setIntLocation, intNotes, setIntNotes,
    weeklyGoal, setWeeklyGoal, editingGoal, setEditingGoal, goalInput, setGoalInput,
    deleteAccountModal, setDeleteAccountModal, deletingAccount, setDeletingAccount,
    deleteConfirmText, setDeleteConfirmText, emailNotifications, setEmailNotifications,
    sendingTestEmail, setSendingTestEmail, testEmailMsg, setTestEmailMsg,
    formContacts, setFormContacts, showContactForm, setShowContactForm,
    contactInput, setContactInput, session,

    // Derived
    userName, firstName, initials, filteredJobs, recentActivity, weeklyData,
    totalApps, responseRate, successRate, avgDaysToInterview, monthlyData,
    stageMetrics, funnelData, weeklyApps, goalPct, navItems,

    // Actions
    authHeader, createJob, deleteJob, updateJob, archiveJob, handleLogout,
    fetchJobs, fetchStats, fetchInterviews, fetchActivities,
  };
}
