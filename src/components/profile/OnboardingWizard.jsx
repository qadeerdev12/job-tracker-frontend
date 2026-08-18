import { useRef, useState } from "react";
import axios from "axios";
import { API, inputClass } from "../../utils/constants";
import Logo from "../Logo";

const WORK_TYPES = ["Remote", "Hybrid", "On-site"];

// First-run setup shown when profile.onboardedAt is null. Deliberately light:
// it collects the handful of fields that make the AI features and match
// scoring useful, and points at the Profile page for everything else.
// Every exit path (finish or skip) calls complete-onboarding, so it never
// shows twice — the flag lives server-side, surviving new devices.
export default function OnboardingWizard({ userName, authHeader, setProfile, setActiveTab }) {
  const [step, setStep] = useState("choice"); // choice | form | saving
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const [imported, setImported] = useState(null); // full parse result, saved on finish
  const resumeRef = useRef(null);

  const [form, setForm] = useState({
    fullName: "",
    headline: "",
    location: "",
    yearsExperience: "",
    skills: "",
    workTypes: [],
  });

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const importResume = async (file) => {
    if (!file) return;
    setImporting(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("resume", file);
      const headers = authHeader();
      headers.headers["Content-Type"] = "multipart/form-data";
      const res = await axios.post(`${API}/api/ai/parse-resume`, formData, headers);
      const p = res.data.profile || {};
      setImported(p);
      setForm({
        fullName: p.fullName || "",
        headline: p.headline || "",
        location: p.location || "",
        yearsExperience: p.yearsExperience ?? "",
        skills: (p.skills || []).join(", "),
        workTypes: [],
      });
      setStep("form");
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't read that resume — you can fill things in manually instead.");
    } finally {
      setImporting(false);
      if (resumeRef.current) resumeRef.current.value = "";
    }
  };

  const finish = async (save) => {
    setStep("saving");
    setError("");
    try {
      if (save) {
        // The quick form wins over the raw import for the fields it covers;
        // the import contributes the sections the form doesn't show.
        const payload = {
          ...(imported ? {
            summary: imported.summary || "",
            links: imported.links || undefined,
            experience: imported.experience || [],
            projects: imported.projects || [],
            education: imported.education || [],
            certifications: imported.certifications || [],
          } : {}),
          fullName: form.fullName,
          headline: form.headline,
          location: form.location,
          yearsExperience: form.yearsExperience === "" ? null : Number(form.yearsExperience),
          skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
          preferences: { workTypes: form.workTypes },
        };
        await axios.put(`${API}/api/profile`, payload, authHeader());
      }
      const res = await axios.post(`${API}/api/profile/complete-onboarding`, {}, authHeader());
      setProfile(res.data);
      if (save) setActiveTab("profile");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
      setStep("form");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-page overflow-y-auto">
      <div className="min-h-full flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg">

          <div className="flex items-center gap-2.5 justify-center mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-600/20">
              <Logo className="w-7 h-7 text-white" />
            </div>
            <span className="text-xl font-extrabold text-brand-500 tracking-tight">TailorTrac</span>
          </div>

          <div className="bg-card rounded-2xl border border-line p-6 sm:p-8">
            {step === "choice" && (
              <>
                <h1 className="text-xl font-bold text-heading text-center">Welcome, {userName.split(" ")[0]}!</h1>
                <p className="text-sm text-muted text-center mt-2 mb-6">
                  Set up your profile so TailorTrac can score how well jobs fit you and sharpen every AI suggestion. Takes about a minute.
                </p>

                <button
                  type="button"
                  onClick={() => resumeRef.current?.click()}
                  disabled={importing}
                  className="w-full flex items-center gap-3 p-4 rounded-xl border border-brand-300 dark:border-brand-700 bg-brand-50/50 dark:bg-brand-900/15 hover:bg-brand-50 dark:hover:bg-brand-900/25 transition-colors text-left disabled:opacity-60"
                >
                  <span className="w-10 h-10 shrink-0 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                    {importing ? (
                      <svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    ) : (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" /></svg>
                    )}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-heading">{importing ? "Reading your resume…" : "Import from my resume"}</span>
                    <span className="block text-xs text-muted mt-0.5">PDF, DOCX or TXT — we'll fill your profile in for you</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="w-full flex items-center gap-3 p-4 mt-3 rounded-xl border border-line hover:border-brand-400 transition-colors text-left"
                >
                  <span className="w-10 h-10 shrink-0 rounded-lg bg-page border border-line flex items-center justify-center">
                    <svg className="w-5 h-5 text-body" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897l12.682-12.68z" /></svg>
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-heading">Fill it in myself</span>
                    <span className="block text-xs text-muted mt-0.5">Just the essentials — a minute, tops</span>
                  </span>
                </button>

                {error && <p className="text-xs text-red-500 mt-3">{error}</p>}

                <button type="button" onClick={() => finish(false)} className="w-full text-center text-xs text-muted hover:text-heading mt-5 transition-colors">
                  Skip for now — I'll do this later from my profile
                </button>

                <input ref={resumeRef} type="file" accept=".pdf,.docx,.txt" onChange={(e) => importResume(e.target.files?.[0])} className="hidden" />
              </>
            )}

            {(step === "form" || step === "saving") && (
              <>
                <h1 className="text-lg font-bold text-heading">
                  {imported ? "Here's what we found — look right?" : "The essentials"}
                </h1>
                <p className="text-xs text-muted mt-1 mb-5">
                  {imported
                    ? "Fix anything that's off. Your full work history was imported too — you can review it on your profile."
                    : "You can add experience, projects and more from your profile later."}
                </p>

                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-body mb-1">Full name</label>
                      <input type="text" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder={userName} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-body mb-1">Headline</label>
                      <input type="text" value={form.headline} onChange={(e) => set("headline", e.target.value)} placeholder="Frontend Engineer" className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-body mb-1">Location</label>
                      <input type="text" value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Sydney, Australia" className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-body mb-1">Years of experience</label>
                      <input type="number" min="0" max="80" value={form.yearsExperience} onChange={(e) => set("yearsExperience", e.target.value)} placeholder="3" className={inputClass} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-body mb-1">Your top skills <span className="text-muted font-normal">(comma separated)</span></label>
                    <input type="text" value={form.skills} onChange={(e) => set("skills", e.target.value)} placeholder="React, TypeScript, Node.js" className={inputClass} />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-body mb-1.5">How do you want to work?</label>
                    <div className="flex flex-wrap gap-2">
                      {WORK_TYPES.map((t) => {
                        const on = form.workTypes.includes(t);
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => set("workTypes", on ? form.workTypes.filter((x) => x !== t) : [...form.workTypes, t])}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${on ? "bg-brand-600 text-white border-brand-600" : "border-line text-body hover:border-brand-400"}`}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {error && <p className="text-xs text-red-500 mt-3">{error}</p>}

                <div className="flex items-center justify-between mt-6">
                  <button type="button" onClick={() => finish(false)} disabled={step === "saving"} className="text-xs text-muted hover:text-heading transition-colors disabled:opacity-50">
                    Skip for now
                  </button>
                  <button
                    type="button"
                    onClick={() => finish(true)}
                    disabled={step === "saving"}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-b from-brand-500 to-brand-600 rounded-xl shadow-lg shadow-brand-600/25 active:translate-y-px transition-all disabled:opacity-60"
                  >
                    {step === "saving" && <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
                    {step === "saving" ? "Saving…" : "Finish setup"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
