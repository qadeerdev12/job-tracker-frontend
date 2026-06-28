import axios from "axios";
import { API, inputClass } from "../../utils/constants";

export default function InterviewModal({
  interviewModal, setInterviewModal, jobs, intDate, setIntDate,
  intTime, setIntTime, intType, setIntType, intLocation, setIntLocation,
  intNotes, setIntNotes, authHeader, fetchJobs, fetchStats, fetchInterviews, fetchActivities,
}) {
  if (!interviewModal) return null;

  return (
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
  );
}
