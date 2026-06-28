import axios from "axios";
import { API, inputClass } from "../../utils/constants";

export default function ProfileTab({
  session, userName, initials, totalApps, archivedJobs,
  weeklyGoal, setWeeklyGoal, editingGoal, setEditingGoal, goalInput, setGoalInput,
  emailNotifications, setEmailNotifications, sendingTestEmail, setSendingTestEmail,
  testEmailMsg, setTestEmailMsg, setDeleteAccountModal, authHeader,
}) {
  const saveGoal = (val) => {
    const v = Math.max(1, Math.min(100, parseInt(val) || 10));
    setWeeklyGoal(v);
    setGoalInput(String(v));
    setEditingGoal(false);
    axios.put(`${API}/api/jobs/settings`, { weeklyGoal: v }, authHeader()).catch(() => {});
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-xl font-bold text-heading">Profile</h2>

      <div className="bg-card rounded-2xl border border-line p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
            {initials}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-heading">{userName}</h3>
            <p className="text-sm text-muted">{session?.user?.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-t border-line">
            <span className="text-sm text-muted">Auth Provider</span>
            <span className="text-sm font-medium text-body capitalize">{session?.user?.app_metadata?.provider || "email"}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-t border-line">
            <span className="text-sm text-muted">Account Created</span>
            <span className="text-sm font-medium text-body">{session?.user?.created_at ? new Date(session.user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—"}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-t border-line">
            <span className="text-sm text-muted">Last Sign In</span>
            <span className="text-sm font-medium text-body">{session?.user?.last_sign_in_at ? new Date(session.user.last_sign_in_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-t border-line">
            <span className="text-sm text-muted">Total Applications</span>
            <span className="text-sm font-medium text-body">{totalApps}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-t border-line">
            <span className="text-sm text-muted">Archived Applications</span>
            <span className="text-sm font-medium text-body">{archivedJobs.length}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-t border-line">
            <span className="text-sm text-muted">Weekly Goal</span>
            {editingGoal ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  className="w-16 px-2 py-1 text-sm text-center border border-line-strong bg-input-bg rounded-lg text-heading outline-none focus:ring-1 focus:ring-brand-400"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveGoal(goalInput);
                    if (e.key === "Escape") setEditingGoal(false);
                  }}
                />
                <button
                  onClick={() => saveGoal(goalInput)}
                  className="px-2.5 py-1 text-xs bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium"
                >
                  Save
                </button>
                <button
                  onClick={() => { setEditingGoal(false); setGoalInput(String(weeklyGoal)); }}
                  className="px-2.5 py-1 text-xs text-muted hover:text-body border border-line-strong rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setGoalInput(String(weeklyGoal)); setEditingGoal(true); }}
                className="flex items-center gap-1.5 text-sm font-medium text-body hover:text-brand-400 transition-colors group"
              >
                {weeklyGoal} apps/week
                <svg className="w-3.5 h-3.5 text-muted group-hover:text-brand-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" /></svg>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-line p-6">
        <h3 className="text-lg font-semibold text-heading mb-1">Email Notifications</h3>
        <p className="text-xs text-muted mb-4">Receive a weekly summary email every Monday with your stats, upcoming interviews, and follow-up reminders.</p>
        <div className="flex items-center justify-between py-3 border-t border-line">
          <span className="text-sm text-muted">Weekly Summary Email</span>
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
          <div className="mt-3 pt-3 border-t border-line">
            <div className="flex items-center gap-3">
              <button
                onClick={async () => {
                  setSendingTestEmail(true);
                  setTestEmailMsg("");
                  try {
                    const res = await axios.post(`${API}/api/jobs/send-test-email`, {}, authHeader());
                    setTestEmailMsg(res.data.message);
                  } catch (err) {
                    setTestEmailMsg(err.response?.data?.message || "Failed to send test email");
                  } finally {
                    setSendingTestEmail(false);
                  }
                }}
                disabled={sendingTestEmail}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-brand-600 dark:text-brand-400 border border-brand-300 dark:border-brand-600 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors disabled:opacity-50"
              >
                {sendingTestEmail ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                    Send Test Email
                  </>
                )}
              </button>
              {testEmailMsg && (
                <span className={`text-xs ${testEmailMsg.includes("Failed") ? "text-red-500" : "text-emerald-500"}`}>{testEmailMsg}</span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-card rounded-2xl border border-red-500/20 p-6">
        <h3 className="text-lg font-semibold text-red-400 mb-2">Delete Account Permenantely</h3>
        <p className="text-sm text-muted mb-4">
          Permanently delete your account and all associated data. This includes all job applications, interview records, activity history, and settings. This action cannot be undone.
        </p>
        <button
          onClick={() => setDeleteAccountModal(true)}
          className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}
