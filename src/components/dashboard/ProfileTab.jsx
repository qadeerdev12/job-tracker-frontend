import { useState, useRef, useMemo } from "react";
import axios from "axios";
import { API, inputClass } from "../../utils/constants";
import ProfileSection from "../profile/ProfileSection";
import RepeatableList from "../profile/RepeatableList";
import AvatarUpload from "../profile/AvatarUpload";

const WORK_TYPES = ["Remote", "Hybrid", "On-site"];
const SENIORITY = ["Internship", "Graduate", "Junior", "Mid-level", "Senior", "Lead", "Principal", "Manager"];

const commaList = (arr) => (arr || []).join(", ");
const parseCommaList = (v) => v.split(",").map((s) => s.trim()).filter(Boolean);

export default function ProfileTab({
  session, userName, initials, totalApps, archivedJobs,
  weeklyGoal, setWeeklyGoal, editingGoal, setEditingGoal, goalInput, setGoalInput,
  emailNotifications, setEmailNotifications, sendingTestEmail, setSendingTestEmail,
  testEmailMsg, setTestEmailMsg, setDeleteAccountModal, authHeader,
  profile, setProfile, toast,
}) {
  const [draft, setDraft] = useState(profile);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState("");
  const resumeRef = useRef(null);

  // Keep the draft in sync if the profile arrives after first render
  if (profile && !draft) setDraft(profile);

  const dirty = useMemo(
    () => Boolean(draft && profile) && JSON.stringify(draft) !== JSON.stringify(profile),
    [draft, profile]
  );

  const set = (key, value) => setDraft((d) => ({ ...d, [key]: value }));
  const setPref = (key, value) => setDraft((d) => ({ ...d, preferences: { ...d.preferences, [key]: value } }));
  const setLink = (key, value) => setDraft((d) => ({ ...d, links: { ...d.links, [key]: value } }));

  const saveGoal = (val) => {
    const v = Math.max(1, Math.min(100, parseInt(val) || 10));
    setWeeklyGoal(v);
    setGoalInput(String(v));
    setEditingGoal(false);
    axios.put(`${API}/api/jobs/settings`, { weeklyGoal: v }, authHeader()).catch(() => {});
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await axios.put(`${API}/api/profile`, draft, authHeader());
      setProfile(res.data);
      setDraft(res.data);
      toast("Profile saved");
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't save your profile");
    } finally {
      setSaving(false);
    }
  };

  // Fills the form from a parsed resume. Deliberately does not save — the user
  // reviews and corrects first, then hits Save.
  const importResume = async (file) => {
    if (!file) return;
    setImporting(true);
    setImportMsg("");
    try {
      const formData = new FormData();
      formData.append("resume", file);
      const headers = authHeader();
      headers.headers["Content-Type"] = "multipart/form-data";
      const res = await axios.post(`${API}/api/ai/parse-resume`, formData, headers);
      const p = res.data.profile || {};

      setDraft((d) => ({
        ...d,
        fullName: p.fullName || d.fullName,
        headline: p.headline || d.headline,
        summary: p.summary || d.summary,
        location: p.location || d.location,
        yearsExperience: p.yearsExperience ?? d.yearsExperience,
        links: { ...d.links, ...(p.links || {}) },
        skills: p.skills?.length ? p.skills : d.skills,
        experience: p.experience?.length ? p.experience : d.experience,
        projects: p.projects?.length ? p.projects : d.projects,
        education: p.education?.length ? p.education : d.education,
        certifications: p.certifications?.length ? p.certifications : d.certifications,
      }));
      setImportMsg("Imported — review everything below, then save.");
    } catch (err) {
      setImportMsg(err.response?.data?.message || "Couldn't read that resume.");
    } finally {
      setImporting(false);
      if (resumeRef.current) resumeRef.current.value = "";
    }
  };

  if (!draft) {
    return <div className="max-w-3xl mx-auto py-12 text-center text-muted text-sm">Loading your profile…</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-28">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-heading">Profile</h2>
          <p className="text-sm text-muted mt-0.5">Used to tailor AI suggestions and score how well jobs fit you.</p>
        </div>
        <div className="shrink-0">
          <button
            type="button"
            onClick={() => resumeRef.current?.click()}
            disabled={importing}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-gradient-to-b from-brand-500 to-brand-600 rounded-xl shadow-lg shadow-brand-600/20 hover:shadow-brand-600/35 active:translate-y-px transition-all disabled:opacity-60"
          >
            {importing ? (
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" /></svg>
            )}
            {importing ? "Reading…" : "Import from resume"}
          </button>
          <input ref={resumeRef} type="file" accept=".pdf,.docx,.txt" onChange={(e) => importResume(e.target.files?.[0])} className="hidden" />
        </div>
      </div>

      {importMsg && (
        <p className={`text-xs ${importMsg.startsWith("Imported") ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>{importMsg}</p>
      )}

      {/* Basics */}
      <ProfileSection title="Basics" description="How you introduce yourself.">
        <AvatarUpload avatarPath={draft.avatarPath} setAvatarPath={(p) => set("avatarPath", p)} initials={initials} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
          <div>
            <label className="block text-[11px] font-medium text-body mb-1">Full name</label>
            <input type="text" value={draft.fullName || ""} onChange={(e) => set("fullName", e.target.value)} placeholder={userName} className={inputClass} />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-body mb-1">Headline</label>
            <input type="text" value={draft.headline || ""} onChange={(e) => set("headline", e.target.value)} placeholder="Frontend Engineer" className={inputClass} />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-body mb-1">Location</label>
            <input type="text" value={draft.location || ""} onChange={(e) => set("location", e.target.value)} placeholder="Sydney, Australia" className={inputClass} />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-body mb-1">Years of experience</label>
            <input type="number" min="0" max="80" value={draft.yearsExperience ?? ""} onChange={(e) => set("yearsExperience", e.target.value === "" ? null : Number(e.target.value))} placeholder="3" className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-medium text-body mb-1">Summary</label>
            <textarea value={draft.summary || ""} onChange={(e) => set("summary", e.target.value)} rows={3} maxLength={4000} placeholder="A couple of sentences on what you do and what you're looking for." className={`${inputClass} resize-y`} />
          </div>
          {["linkedin", "github", "portfolio"].map((k) => (
            <div key={k} className={k === "portfolio" ? "sm:col-span-2" : ""}>
              <label className="block text-[11px] font-medium text-body mb-1 capitalize">{k}</label>
              <input type="url" value={draft.links?.[k] || ""} onChange={(e) => setLink(k, e.target.value)} placeholder={`https://…`} className={inputClass} />
            </div>
          ))}
        </div>
      </ProfileSection>

      {/* Skills */}
      <ProfileSection title="Skills" description="Comma separated. These are matched against job descriptions to score fit.">
        <input
          type="text"
          value={commaList(draft.skills)}
          onChange={(e) => set("skills", parseCommaList(e.target.value))}
          placeholder="React, TypeScript, Node.js, PostgreSQL"
          className={inputClass}
        />
        {draft.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {draft.skills.map((s, i) => (
              <span key={i} className="px-2.5 py-1 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-xs font-medium rounded-lg">{s}</span>
            ))}
          </div>
        )}
      </ProfileSection>

      {/* Job preferences */}
      <ProfileSection title="Job Preferences" description="What you're looking for, as opposed to what you've done.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-medium text-body mb-1">Target roles</label>
            <input type="text" value={commaList(draft.preferences?.targetRoles)} onChange={(e) => setPref("targetRoles", parseCommaList(e.target.value))} placeholder="Frontend Engineer, Full Stack Developer" className={inputClass} />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-body mb-1">Seniority</label>
            <select value={draft.preferences?.seniority || ""} onChange={(e) => setPref("seniority", e.target.value)} className={inputClass}>
              <option value="">Not specified</option>
              {SENIORITY.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-body mb-1">Availability</label>
            <input type="text" value={draft.preferences?.availability || ""} onChange={(e) => setPref("availability", e.target.value)} placeholder="Immediately / 4 weeks notice" className={inputClass} />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-medium text-body mb-1.5">Work type</label>
            <div className="flex flex-wrap gap-2">
              {WORK_TYPES.map((t) => {
                const on = (draft.preferences?.workTypes || []).includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setPref("workTypes", on
                      ? draft.preferences.workTypes.filter((x) => x !== t)
                      : [...(draft.preferences?.workTypes || []), t])}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                      on ? "bg-brand-600 text-white border-brand-600" : "border-line text-body hover:border-brand-400"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-medium text-body mb-1">Preferred locations</label>
            <input type="text" value={commaList(draft.preferences?.preferredLocations)} onChange={(e) => setPref("preferredLocations", parseCommaList(e.target.value))} placeholder="Sydney, Melbourne, Remote (AU)" className={inputClass} />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-body mb-1">Work authorization</label>
            <input type="text" value={draft.preferences?.workAuthorization || ""} onChange={(e) => setPref("workAuthorization", e.target.value)} placeholder="Australian citizen" className={inputClass} />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-body mb-1">Salary expectation</label>
            <div className="flex gap-2">
              <input type="number" min="0" value={draft.preferences?.salaryMin ?? ""} onChange={(e) => setPref("salaryMin", e.target.value === "" ? null : Number(e.target.value))} placeholder="Min" className={inputClass} />
              <input type="number" min="0" value={draft.preferences?.salaryMax ?? ""} onChange={(e) => setPref("salaryMax", e.target.value === "" ? null : Number(e.target.value))} placeholder="Max" className={inputClass} />
            </div>
          </div>

          <div className="sm:col-span-2 flex flex-wrap gap-5 pt-1">
            <label className="flex items-center gap-2 text-xs text-body cursor-pointer">
              <input type="checkbox" checked={Boolean(draft.preferences?.openToRelocation)} onChange={(e) => setPref("openToRelocation", e.target.checked)} className="rounded border-line-strong text-brand-600 focus:ring-brand-500" />
              Open to relocation
            </label>
            <label className="flex items-center gap-2 text-xs text-body cursor-pointer">
              <input type="checkbox" checked={Boolean(draft.preferences?.needsSponsorship)} onChange={(e) => setPref("needsSponsorship", e.target.checked)} className="rounded border-line-strong text-brand-600 focus:ring-brand-500" />
              Requires visa sponsorship
            </label>
          </div>
        </div>
      </ProfileSection>

      <RepeatableList
        title="Experience" description="Most recent first." addLabel="Add role"
        emptyHint="No roles yet. Add one, or import from your resume."
        items={draft.experience || []} setItems={(v) => set("experience", v)}
        blank={{ title: "", company: "", location: "", startDate: "", endDate: "", current: false, description: "", skills: [] }}
        fields={[
          { key: "title", label: "Job title", placeholder: "Frontend Engineer", half: true },
          { key: "company", label: "Company", placeholder: "Canva", half: true },
          { key: "startDate", label: "Start", placeholder: "Mar 2023", half: true },
          { key: "endDate", label: "End", placeholder: "Present", half: true },
          { key: "current", label: "I currently work here", type: "checkbox" },
          { key: "description", label: "What you did", type: "textarea", placeholder: "Responsibilities and achievements — numbers help." },
          { key: "skills", label: "Skills used (comma separated)", type: "tags", placeholder: "React, TypeScript" },
        ]}
      />

      <RepeatableList
        title="Projects" description="Side projects, open source, anything you've shipped." addLabel="Add project"
        emptyHint="No projects yet."
        items={draft.projects || []} setItems={(v) => set("projects", v)}
        blank={{ name: "", description: "", link: "", tech: [] }}
        fields={[
          { key: "name", label: "Name", placeholder: "TailorTrac", half: true },
          { key: "link", label: "Link", placeholder: "https://…", half: true },
          { key: "description", label: "Description", type: "textarea", placeholder: "What it does and what you built." },
          { key: "tech", label: "Tech used (comma separated)", type: "tags", placeholder: "React, Express, MongoDB" },
        ]}
      />

      <RepeatableList
        title="Education" addLabel="Add education" emptyHint="No education added yet."
        items={draft.education || []} setItems={(v) => set("education", v)}
        blank={{ institution: "", degree: "", field: "", startDate: "", endDate: "" }}
        fields={[
          { key: "institution", label: "Institution", placeholder: "University of Sydney", half: true },
          { key: "degree", label: "Degree", placeholder: "BSc", half: true },
          { key: "field", label: "Field of study", placeholder: "Computer Science", half: true },
          { key: "endDate", label: "Completed", placeholder: "2022", half: true },
        ]}
      />

      <RepeatableList
        title="Certifications" addLabel="Add certification" emptyHint="No certifications added yet."
        items={draft.certifications || []} setItems={(v) => set("certifications", v)}
        blank={{ name: "", issuer: "", year: "" }}
        fields={[
          { key: "name", label: "Name", placeholder: "AWS Solutions Architect", half: true },
          { key: "issuer", label: "Issuer", placeholder: "Amazon Web Services", half: true },
          { key: "year", label: "Year", placeholder: "2025", half: true },
        ]}
      />

      {/* Account — read-only facts plus the settings that already lived here */}
      <ProfileSection title="Account">
        <div className="text-sm">
          {[
            ["Email", session?.user?.email || "—"],
            ["Auth provider", session?.user?.app_metadata?.provider || "email"],
            ["Member since", session?.user?.created_at ? new Date(session.user.created_at).toLocaleDateString("en-AU", { year: "numeric", month: "long", day: "numeric" }) : "—"],
            ["Applications", `${totalApps} active · ${archivedJobs.length} archived`],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between py-2.5 border-b border-line last:border-0">
              <span className="text-muted">{k}</span>
              <span className="font-medium text-body capitalize">{v}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 mt-2 border-t border-line">
          <div>
            <p className="text-sm font-medium text-heading">Weekly goal</p>
            <p className="text-xs text-muted">Applications you aim to send each week.</p>
          </div>
          {editingGoal ? (
            <div className="flex items-center gap-1.5">
              <input type="number" min="1" max="100" value={goalInput} onChange={(e) => setGoalInput(e.target.value)} autoFocus
                onKeyDown={(e) => { if (e.key === "Enter") saveGoal(goalInput); if (e.key === "Escape") setEditingGoal(false); }}
                className="w-16 px-2 py-1 text-sm text-center border border-line-strong bg-input-bg rounded-lg text-heading outline-none focus:ring-1 focus:ring-brand-400" />
              <button onClick={() => saveGoal(goalInput)} className="px-2.5 py-1 text-xs bg-brand-600 text-white rounded-lg hover:bg-brand-700">Set</button>
            </div>
          ) : (
            <button onClick={() => setEditingGoal(true)} className="text-sm font-semibold text-brand-500 hover:text-brand-400">{weeklyGoal} / week</button>
          )}
        </div>
      </ProfileSection>

      <ProfileSection title="Email Notifications" description="A weekly summary every Monday with your stats, upcoming interviews and follow-ups.">
        <div className="flex items-center justify-between">
          <span className="text-sm text-body">Weekly summary email</span>
          <button
            onClick={() => {
              const val = !emailNotifications;
              setEmailNotifications(val);
              axios.put(`${API}/api/jobs/settings`, { emailNotifications: val }, authHeader()).catch(() => setEmailNotifications(!val));
            }}
            className={`relative w-11 h-6 rounded-full transition-colors ${emailNotifications ? "bg-brand-600" : "bg-gray-300 dark:bg-gray-600"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${emailNotifications ? "translate-x-5" : ""}`} />
          </button>
        </div>
        {emailNotifications && (
          <div className="mt-3 pt-3 border-t border-line flex items-center gap-3">
            <button
              onClick={async () => {
                setSendingTestEmail(true); setTestEmailMsg("");
                try {
                  const res = await axios.post(`${API}/api/jobs/send-test-email`, {}, authHeader());
                  setTestEmailMsg(res.data.message);
                } catch (err) {
                  setTestEmailMsg(err.response?.data?.message || "Couldn't send the preview. Please try again.");
                } finally { setSendingTestEmail(false); }
              }}
              disabled={sendingTestEmail}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-brand-600 dark:text-brand-400 border border-brand-300 dark:border-brand-600 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors disabled:opacity-50"
            >
              {sendingTestEmail ? "Sending..." : "Email Me a Preview"}
            </button>
            {testEmailMsg && <span className={`text-xs ${testEmailMsg.toLowerCase().includes("couldn't") ? "text-red-500" : "text-emerald-500"}`}>{testEmailMsg}</span>}
          </div>
        )}
      </ProfileSection>

      <section className="bg-card rounded-2xl border border-red-500/30 p-5 sm:p-6">
        <h3 className="text-base font-semibold text-red-500 mb-1">Delete account</h3>
        <p className="text-xs text-muted mb-4">Permanently removes your account, applications, documents and profile. This cannot be undone.</p>
        <button onClick={() => setDeleteAccountModal(true)} className="px-4 py-2 text-sm font-medium text-red-500 border border-red-500/40 rounded-lg hover:bg-red-500/10 transition-colors">
          Delete my account
        </button>
      </section>

      {/* Sticky save bar — only while there are unsaved changes */}
      {dirty && (
        <div className="fixed bottom-0 left-0 right-0 md:left-60 z-30 bg-topbar backdrop-blur-md border-t border-line px-4 sm:px-6 py-3">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
            <span className="text-xs text-muted">You have unsaved changes</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setDraft(profile)} className="px-3 py-2 text-xs font-medium text-muted hover:text-heading transition-colors">
                Discard
              </button>
              <button
                onClick={saveProfile}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-b from-brand-500 to-brand-600 rounded-xl shadow-lg shadow-brand-600/25 active:translate-y-px transition-all disabled:opacity-60"
              >
                {saving && <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
