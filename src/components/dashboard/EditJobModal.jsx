import { inputClass } from "../../utils/constants";
import TagInput from "../TagInput";

export default function EditJobModal({ editJob, setEditJob, updateJob, allTags }) {
  if (!editJob) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4" onClick={() => setEditJob(null)}>
      <div className="bg-card rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-md p-5 sm:p-6 border border-line-strong max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-heading">Edit Application</h3>
          <button onClick={() => setEditJob(null)} className="p-1 text-muted hover:text-body rounded-lg hover:bg-page">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-body mb-1.5">Company</label>
            <input type="text" value={editJob.company} onChange={(e) => setEditJob({ ...editJob, company: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-body mb-1.5">Role</label>
            <input type="text" value={editJob.role} onChange={(e) => setEditJob({ ...editJob, role: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-body mb-1.5">Job URL</label>
            <input type="url" value={editJob.link || ""} onChange={(e) => setEditJob({ ...editJob, link: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-body mb-1.5">Notes</label>
            <textarea value={editJob.notes || ""} onChange={(e) => setEditJob({ ...editJob, notes: e.target.value })} rows={3} className={`${inputClass} resize-none`} />
          </div>
          <div>
            <label className="block text-xs font-medium text-body mb-1.5">Tags</label>
            <TagInput tags={editJob.tags || []} setTags={(tags) => setEditJob({ ...editJob, tags })} allTags={allTags} />
          </div>
          <div>
            <label className="block text-xs font-medium text-body mb-1.5">Follow-Up Date</label>
            <input type="date" value={editJob.followUpDate ? new Date(editJob.followUpDate).toISOString().split("T")[0] : ""} onChange={(e) => setEditJob({ ...editJob, followUpDate: e.target.value || null })} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-body mb-1.5">Status</label>
            <select value={editJob.status} onChange={(e) => setEditJob({ ...editJob, status: e.target.value })} className={inputClass}>
              <option value="Applied">Applied</option>
              <option value="Interview">Interview</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-body">Contacts</label>
              <button type="button" onClick={() => setEditJob({ ...editJob, _showContactForm: !editJob._showContactForm, _contactInput: editJob._contactInput || { name: "", role: "", email: "", phone: "", linkedin: "", notes: "" } })} className="text-xs text-brand-500 hover:text-brand-400 font-medium">
                {editJob._showContactForm ? "Cancel" : "+ Add Contact"}
              </button>
            </div>

            {editJob._showContactForm && (
              <div className="border border-line rounded-lg p-3 mb-2 space-y-2 bg-page/50">
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="Name *" value={editJob._contactInput?.name || ""} onChange={(e) => setEditJob({ ...editJob, _contactInput: { ...editJob._contactInput, name: e.target.value } })} className={`${inputClass} !py-2 !text-xs`} />
                  <input type="text" placeholder="Role (e.g. Recruiter)" value={editJob._contactInput?.role || ""} onChange={(e) => setEditJob({ ...editJob, _contactInput: { ...editJob._contactInput, role: e.target.value } })} className={`${inputClass} !py-2 !text-xs`} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="email" placeholder="Email" value={editJob._contactInput?.email || ""} onChange={(e) => setEditJob({ ...editJob, _contactInput: { ...editJob._contactInput, email: e.target.value } })} className={`${inputClass} !py-2 !text-xs`} />
                  <input type="text" placeholder="Phone" value={editJob._contactInput?.phone || ""} onChange={(e) => setEditJob({ ...editJob, _contactInput: { ...editJob._contactInput, phone: e.target.value } })} className={`${inputClass} !py-2 !text-xs`} />
                </div>
                <input type="url" placeholder="LinkedIn URL" value={editJob._contactInput?.linkedin || ""} onChange={(e) => setEditJob({ ...editJob, _contactInput: { ...editJob._contactInput, linkedin: e.target.value } })} className={`${inputClass} !py-2 !text-xs`} />
                <input type="text" placeholder="Notes about this contact" value={editJob._contactInput?.notes || ""} onChange={(e) => setEditJob({ ...editJob, _contactInput: { ...editJob._contactInput, notes: e.target.value } })} className={`${inputClass} !py-2 !text-xs`} />
                <button
                  type="button"
                  onClick={() => {
                    if (!editJob._contactInput?.name?.trim()) return;
                    const { name, role: r, email, phone, linkedin, notes: n } = editJob._contactInput;
                    setEditJob({ ...editJob, contacts: [...(editJob.contacts || []), { name, role: r, email, phone, linkedin, notes: n }], _showContactForm: false, _contactInput: { name: "", role: "", email: "", phone: "", linkedin: "", notes: "" } });
                  }}
                  className="w-full py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  Add Contact
                </button>
              </div>
            )}

            {editJob.contacts?.length > 0 && (
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {editJob.contacts.map((c, i) => (
                  <div key={`${c.name}-${c.email || i}`} className="flex items-center justify-between px-3 py-2 bg-page/50 border border-line rounded-lg">
                    <div className="min-w-0">
                      <span className="text-xs font-medium text-heading">{c.name}</span>
                      {c.role && <span className="text-xs text-muted ml-1.5">· {c.role}</span>}
                      {c.email && <span className="text-[10px] text-muted block truncate">{c.email}</span>}
                    </div>
                    <button type="button" onClick={() => setEditJob({ ...editJob, contacts: editJob.contacts.filter((_, j) => j !== i) })} className="text-muted hover:text-red-500 ml-2 shrink-0">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => updateJob(editJob._id, { company: editJob.company, role: editJob.role, status: editJob.status, link: editJob.link, notes: editJob.notes, tags: editJob.tags || [], followUpDate: editJob.followUpDate || null, interviews: editJob.interviews || [], contacts: editJob.contacts || [] })}
            className="flex-1 bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-lg text-sm font-medium shadow-sm transition-colors"
          >
            Save Changes
          </button>
          <button onClick={() => setEditJob(null)} className="px-5 py-2.5 border border-line-strong text-body rounded-lg text-sm font-medium hover:bg-page transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
