import { STATUS_STYLES } from "../../utils/constants";
import { getTagColor, timeAgo } from "../../utils/helpers";

export default function ArchivedTab({ archivedJobs, archiveJob, setDeleteTarget }) {
  if (archivedJobs.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-line p-12 text-center">
        <svg className="w-12 h-12 text-faint mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
        <p className="text-body font-medium">No archived applications</p>
        <p className="text-sm text-muted mt-1">Applications you archive will appear here.</p>
      </div>
    );
  }

  return (
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
  );
}
