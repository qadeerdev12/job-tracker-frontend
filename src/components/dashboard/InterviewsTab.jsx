import axios from "axios";
import { API } from "../../utils/constants";

export default function InterviewsTab({
  upcomingInterviews, jobs, setInterviewModal, setIntDate, setIntTime,
  setIntType, setIntLocation, setIntNotes, authHeader, fetchJobs, fetchInterviews,
}) {
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

  return (
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
          {Object.entries(grouped).map(([dateLabel, interviews]) => (
            <div key={dateLabel}>
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">{dateLabel}</h3>
              <div className="space-y-2">
                {interviews.map((int) => (
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
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
