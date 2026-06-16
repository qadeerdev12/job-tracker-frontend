import { useState } from "react";
import axios from "axios";
import { API, inputClass } from "../utils/constants";

export default function AITailorTab({ authHeader }) {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [remaining, setRemaining] = useState(null);

  const canAnalyze = resumeText.trim().length >= 20 && jobDescription.trim().length >= 20;

  const handleAnalyze = async () => {
    if (resumeText.trim().length < 20) {
      setError("Please paste your resume (at least 20 characters)");
      return;
    }
    if (jobDescription.trim().length < 20) {
      setError("Please paste a job description (at least 20 characters)");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const res = await axios.post(`${API}/api/ai/tailor`, { jobDescription, resumeText }, authHeader());
      setResult(res.data.result);
      setRemaining(res.data.remaining);
    } catch (err) {
      setError(err.response?.data?.message || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (score) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-amber-500";
    return "text-red-500";
  };

  const scoreBg = (score) => {
    if (score >= 80) return "from-emerald-500 to-emerald-400";
    if (score >= 60) return "from-amber-500 to-amber-400";
    return "from-red-500 to-red-400";
  };

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <div className="bg-card rounded-xl border border-line p-6 mb-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-brand-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-heading">AI Resume Tailor</h3>
              <p className="text-xs text-muted">Paste your resume and a job description to get a personalized gap analysis</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-heading mb-1.5">Your Resume</label>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume text here..."
                rows={10}
                className={`${inputClass} resize-none`}
              />
              <p className="text-xs text-muted mt-1">{resumeText.length}/8000</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-heading mb-1.5">Job Description</label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                rows={10}
                className={`${inputClass} resize-none`}
              />
              <p className="text-xs text-muted mt-1">{jobDescription.length}/5000</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 p-2 rounded-lg mb-4 text-sm">{error}</div>
          )}

          <div className="flex items-center justify-between">
            <button
              onClick={handleAnalyze}
              disabled={loading || !canAnalyze}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-brand-600 hover:from-purple-600 hover:to-brand-700 text-white text-sm font-medium rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Analyzing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
                  Analyze & Tailor
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
            {result.match_score != null && (
              <div className="bg-card rounded-xl border border-line p-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-heading flex items-center gap-2">
                    <svg className="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
                    Match Score
                  </h4>
                  <span className={`text-3xl font-bold ${scoreColor(result.match_score)}`}>{result.match_score}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div className={`h-2.5 rounded-full bg-gradient-to-r ${scoreBg(result.match_score)}`} style={{ width: `${result.match_score}%` }} />
                </div>
              </div>
            )}

            {result.role_summary && (
              <div className="bg-card rounded-xl border border-line p-5">
                <h4 className="text-sm font-semibold text-heading mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Role Summary
                </h4>
                <p className="text-sm text-body">{result.role_summary}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {result.strengths && (
                <div className="bg-card rounded-xl border border-line p-5">
                  <h4 className="text-sm font-semibold text-heading mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Your Strengths
                  </h4>
                  <ul className="space-y-2">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-body">
                        <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.gaps && (
                <div className="bg-card rounded-xl border border-line p-5">
                  <h4 className="text-sm font-semibold text-heading mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
                    Gaps to Address
                  </h4>
                  <ul className="space-y-2">
                    {result.gaps.map((g, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-body">
                        <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                        {g}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {result.keywords && (
              <div className="bg-card rounded-xl border border-line p-5">
                <h4 className="text-sm font-semibold text-heading mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                  Keywords to Include
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.keywords.map((kw, i) => (
                    <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs font-medium">{kw}</span>
                  ))}
                </div>
              </div>
            )}

            {result.resume_tips && (
              <div className="bg-card rounded-xl border border-line p-5">
                <h4 className="text-sm font-semibold text-heading mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" /></svg>
                  Resume Tips
                </h4>
                <ul className="space-y-3">
                  {result.resume_tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-body">
                      <span className="w-5 h-5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.bullet_rewrites && (
              <div className="bg-card rounded-xl border border-line p-5">
                <h4 className="text-sm font-semibold text-heading mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
                  Rewritten Bullet Points
                </h4>
                <p className="text-xs text-muted mb-3">Your experience reframed for this specific role</p>
                <ul className="space-y-3">
                  {result.bullet_rewrites.map((bullet, i) => (
                    <li key={i} className="text-sm text-body bg-brand-50/50 dark:bg-brand-900/20 rounded-lg p-3 border-l-3 border-brand-500">
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.cover_letter_hook && (
              <div className="bg-gradient-to-r from-purple-50 to-brand-50 dark:from-purple-900/20 dark:to-brand-900/20 rounded-xl border border-line p-5">
                <h4 className="text-sm font-semibold text-heading mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                  Cover Letter Opening
                </h4>
                <p className="text-sm text-body italic">"{result.cover_letter_hook}"</p>
              </div>
            )}
          </div>
        )}

        {result && result.raw && (
          <div className="bg-card rounded-xl border border-line p-5">
            <h4 className="text-sm font-semibold text-heading mb-2">AI Analysis</h4>
            <p className="text-sm text-body whitespace-pre-wrap">{result.raw}</p>
          </div>
        )}
      </div>
    </>
  );
}
