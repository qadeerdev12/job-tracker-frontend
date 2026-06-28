import axios from "axios";
import { supabase } from "../../lib/supabase";
import { API, inputClass } from "../../utils/constants";

export default function DeleteAccountModal({
  deleteAccountModal, setDeleteAccountModal, totalApps, archivedJobs,
  deleteConfirmText, setDeleteConfirmText, deletingAccount, setDeletingAccount, authHeader,
}) {
  if (!deleteAccountModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4" onClick={() => { setDeleteAccountModal(false); setDeleteConfirmText(""); }}>
      <div className="bg-card rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-sm p-5 sm:p-6 border border-red-500/30" onClick={(e) => e.stopPropagation()}>
        <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-heading text-center mb-1">Delete Your Account?</h3>
        <p className="text-sm text-body text-center mb-4">
          This will permanently delete all your data including <span className="font-medium text-heading">{totalApps + archivedJobs.length} applications</span>, interviews, and activity history.
        </p>
        <div className="mb-4">
          <label className="block text-xs font-medium text-body mb-1.5">Type <span className="font-bold text-red-400">DELETE</span> to confirm</label>
          <input
            type="text"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="DELETE"
            className={`${inputClass} border-red-500/30 focus:border-red-500 focus:ring-red-500/20`}
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { setDeleteAccountModal(false); setDeleteConfirmText(""); }}
            className="flex-1 px-4 py-2.5 border border-line-strong text-body rounded-lg text-sm font-medium hover:bg-page transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={deleteConfirmText !== "DELETE" || deletingAccount}
            onClick={async () => {
              setDeletingAccount(true);
              try {
                await axios.delete(`${API}/api/jobs/account`, authHeader());
                await supabase.auth.signOut();
              } catch (error) {
                console.log(error.response?.data || error.message);
                setDeletingAccount(false);
              }
            }}
            className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
          >
            {deletingAccount ? "Deleting..." : "Delete Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
