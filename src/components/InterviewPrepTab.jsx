import { useState } from "react";
import axios from "axios";
import { API, inputClass } from "../utils/constants";

export default function InterviewPrepTab({ authHeader, jobs }) {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [showOptional, setShowOptional] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [remaining, setRemaining] = useState(null);
  const [expandedQ, setExpandedQ] = useState(null);

  const canGenerate = company.trim().length >= 2 && role.trim().length >= 2;

  const prefillFromJob = (jobId) => {
    const job = jobs.find((j) => j._id === jobId);
    if (!job) return;
    setCompany(job.company);
    setRole(job.role);
  };

  const handleGenerate = async () => {
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const payload = { company, role };
      if (jobDescription.trim()) payload.jobDescription = jobDescription;
      if (resumeText.trim()) payload.resumeText = resumeText;
      const res = await axios.post(`${API}/api/ai/interview-prep`, payload, authHeader());
      setResult(res.data.result);
      setRemaining(res.data.remaining);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate prep. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const activeJobs = jobs.filter((j) => j.status === "Interview" || j.status === "Applied");

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-card rounded-xl border border-line p-6 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-heading">AI Interview Prep</h3>
            <p className="text-xs text-muted">Get tailored interview questions, tips, and a preparation checklist for any role</p>
          </div>
        </div>

        {activeJobs.length > 0 && (
          <div className="mb-4">
            <label className="block text-xs font-medium text-heading mb-1.5">Quick Fill from Application</label>
            <select
              onChange={(e) => { if (e.target.value) prefillFromJob(e.target.value); }}
              className={`${inputClass} w-full sm:w-auto sm:min-w-[280px]`}
              defaultValue=""
            >
              <option value="">Select an application...</option>
              {activeJobs.map((j) => (
                <option key={j._id} value={j._id}>{j.company} — {j.role}</option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-heading mb-1.5">Company *</label>
            <input
              type="text"
              placeholder="e.g. Google"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-heading mb-1.5">Role *</label>
            <input
              type="text"
              placeholder="e.g. Frontend Engineer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <button
          onClick={() => setShowOptional(!showOptional)}
          className="text-xs text-brand-400 hover:text-brand-300 font-medium mb-4 flex items-center gap-1"
        >
          <svg className={`w-3 h-3 transition-transform ${showOptional ? "rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
          {showOptional ? "Hide" : "Add"} optional context for better results
        </button>

        {showOptional && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-heading mb-1.5">Job Description (optional)</label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description for more targeted questions..."
                rows={5}
                className={`${inputClass} resize-none`}
              />
              <p className="text-xs text-muted mt-1">{jobDescription.length}/5000</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-heading mb-1.5">Your Resume (optional)</label>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume to get personalized answers..."
                rows={5}
                className={`${inputClass} resize-none`}
              />
              <p className="text-xs text-muted mt-1">{resumeText.length}/8000</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 p-2 rounded-lg mb-4 text-sm">{error}</div>
        )}

        <div className="flex items-center justify-between">
          <button
            onClick={handleGenerate}
            disabled={loading || !canGenerate}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                Preparing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg>
                Generate Interview Prep
              </>
            )}
          </button>
          {remaining !== null && (
            <span className="text-xs text-muted">{remaining} requests remaining today</span>
          )}
        </div>
      </div>

      {result && !result.raw && (
        <div className="space-y-5">
          {/* Elevator Pitch */}
          {result.elevator_pitch && (
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl border border-line p-5">
              <h4 className="text-sm font-semibold text-heading mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" /></svg>
                Your 30-Second Pitch
              </h4>
              <p className="text-sm text-body italic">"{result.elevator_pitch}"</p>
            </div>
          )}

          {/* Company Insights + Role Focus */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {result.company_insights && (
              <div className="bg-card rounded-xl border border-line p-5">
                <h4 className="text-sm font-semibold text-heading mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 0-.75 3.75m0 0-.75 3.75M17.25 7.5l-1.5 7.5" /></svg>
                  Company Insights
                </h4>
                <ul className="space-y-2">
                  {result.company_insights.map((insight, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-body">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.role_focus_areas && (
              <div className="bg-card rounded-xl border border-line p-5">
                <h4 className="text-sm font-semibold text-heading mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
                  Key Focus Areas
                </h4>
                <ul className="space-y-2">
                  {result.role_focus_areas.map((area, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-body">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0" />
                      {area}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Behavioral Questions */}
          {result.behavioral_questions && (
            <div className="bg-card rounded-xl border border-line p-5">
              <h4 className="text-sm font-semibold text-heading mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" /></svg>
                Behavioral Questions
              </h4>
              <div className="space-y-2">
                {result.behavioral_questions.map((q, i) => (
                  <div key={i} className="border border-line rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedQ(expandedQ === `b${i}` ? null : `b${i}`)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-page/50 transition-colors"
                    >
                      <span className="text-sm font-medium text-heading flex items-center gap-2">
                        <span className="w-5 h-5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                        {q.question}
                      </span>
                      <svg className={`w-4 h-4 text-muted transition-transform shrink-0 ml-2 ${expandedQ === `b${i}` ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                    </button>
                    {expandedQ === `b${i}` && (
                      <div className="px-4 pb-3 border-t border-line pt-3 space-y-2">
                        <div>
                          <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">Why they ask this</span>
                          <p className="text-sm text-body mt-0.5">{q.why}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">How to answer</span>
                          <p className="text-sm text-body mt-0.5">{q.tip}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Technical Questions */}
          {result.technical_questions && (
            <div className="bg-card rounded-xl border border-line p-5">
              <h4 className="text-sm font-semibold text-heading mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" /></svg>
                Technical Questions
              </h4>
              <div className="space-y-2">
                {result.technical_questions.map((q, i) => (
                  <div key={i} className="border border-line rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedQ(expandedQ === `t${i}` ? null : `t${i}`)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-page/50 transition-colors"
                    >
                      <span className="text-sm font-medium text-heading flex items-center gap-2">
                        <span className="w-5 h-5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                        {q.question}
                      </span>
                      <svg className={`w-4 h-4 text-muted transition-transform shrink-0 ml-2 ${expandedQ === `t${i}` ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                    </button>
                    {expandedQ === `t${i}` && (
                      <div className="px-4 pb-3 border-t border-line pt-3">
                        <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">Hint</span>
                        <p className="text-sm text-body mt-0.5">{q.hint}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Questions to Ask */}
          {result.questions_to_ask && (
            <div className="bg-card rounded-xl border border-line p-5">
              <h4 className="text-sm font-semibold text-heading mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></svg>
                Questions to Ask the Interviewer
              </h4>
              <ul className="space-y-2">
                {result.questions_to_ask.map((q, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-body">
                    <svg className="w-4 h-4 text-brand-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Preparation Checklist */}
          {result.preparation_checklist && (
            <div className="bg-card rounded-xl border border-line p-5">
              <h4 className="text-sm font-semibold text-heading mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Preparation Checklist
              </h4>
              <ul className="space-y-2">
                {result.preparation_checklist.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-body">
                    <input type="checkbox" className="mt-1 rounded border-line-strong text-brand-600 focus:ring-brand-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {result && result.raw && (
        <div className="bg-card rounded-xl border border-line p-5">
          <h4 className="text-sm font-semibold text-heading mb-2">Interview Prep</h4>
          <p className="text-sm text-body whitespace-pre-wrap">{result.raw}</p>
        </div>
      )}
    </div>
  );
}
