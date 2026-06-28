import axios from "axios";
import { API, STATUS_STYLES, inputClass } from "../../utils/constants";
import { getTagColor } from "../../utils/helpers";
import { JobListSkeleton } from "../Skeletons";

export default function ApplicationsTab({
  loading, filteredJobs, jobs, search, setSearch, filterStatus, setFilterStatus,
  filterTag, setFilterTag, sortBy, setSortBy, allTags, setActiveTab,
  setEditJob, archiveJob, setDeleteTarget, updateJob, authHeader, toast,
}) {
  return (
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
  );
}
