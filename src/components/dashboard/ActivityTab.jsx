import { timeAgo } from "../../utils/helpers";

export default function ActivityTab({ activities }) {
  const icons = {
    created: { bg: "bg-emerald-500/10", color: "text-emerald-400", icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg> },
    status_change: { bg: "bg-blue-500/10", color: "text-blue-400", icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg> },
    archived: { bg: "bg-orange-500/10", color: "text-orange-400", icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg> },
    restored: { bg: "bg-brand-500/10", color: "text-brand-400", icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg> },
    deleted: { bg: "bg-red-500/10", color: "text-red-400", icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg> },
    edited: { bg: "bg-gray-500/10", color: "text-body", icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg> },
  };
  const labels = { created: "Added", status_change: "Status changed", archived: "Archived", restored: "Restored", deleted: "Deleted", edited: "Edited" };

  if (activities.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-line p-12 text-center">
        <svg className="w-12 h-12 text-faint mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <p className="text-body font-medium">No activity yet</p>
        <p className="text-sm text-muted mt-1">Actions like adding, updating, and archiving jobs will appear here.</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-line p-6">
      <div className="divide-y divide-line">
        {activities.map((act) => {
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
  );
}
