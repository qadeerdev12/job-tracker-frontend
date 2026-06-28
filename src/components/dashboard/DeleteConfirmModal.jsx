export default function DeleteConfirmModal({ deleteTarget, setDeleteTarget, deleteJob }) {
  if (!deleteTarget) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4" onClick={() => setDeleteTarget(null)}>
      <div className="bg-card rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center border border-line-strong" onClick={(e) => e.stopPropagation()}>
        <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-heading mb-1">Delete Application?</h3>
        <p className="text-sm text-body mb-6">
          <span className="font-medium text-heading">{deleteTarget.company} — {deleteTarget.role}</span> will be permanently removed.
        </p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteTarget(null)} className="flex-1 px-4 py-2.5 border border-line-strong text-body rounded-lg text-sm font-medium hover:bg-page transition-colors">
            Cancel
          </button>
          <button onClick={() => deleteJob(deleteTarget._id)} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
