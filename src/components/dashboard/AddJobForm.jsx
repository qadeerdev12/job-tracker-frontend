import { inputClass } from "../../utils/constants";
import TagInput from "../TagInput";

export default function AddJobForm({
  company, setCompany, role, setRole, status, setStatus, link, setLink,
  notes, setNotes, followUpDate, setFollowUpDate, formTags, setFormTags,
  allTags, formContacts, setFormContacts, showContactForm, setShowContactForm,
  contactInput, setContactInput, createJob,
}) {
  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-card rounded-2xl border border-line p-8">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-heading">Track New Application</h2>
          <p className="text-sm text-muted mt-1">Fill in the details below to add a job to your tracker.</p>
        </div>

        <form onSubmit={createJob} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-body mb-1.5">Company *</label>
              <input type="text" placeholder="e.g. Google" value={company} onChange={(e) => setCompany(e.target.value)} required className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-body mb-1.5">Role *</label>
              <input type="text" placeholder="e.g. Frontend Engineer" value={role} onChange={(e) => setRole(e.target.value)} required className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-body mb-1.5">Job Posting URL</label>
            <input type="url" placeholder="https://..." value={link} onChange={(e) => setLink(e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className="block text-xs font-medium text-body mb-1.5">Notes</label>
            <textarea placeholder="Anything to remember about this application..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={`${inputClass} resize-none`} />
          </div>

          <div>
            <label className="block text-xs font-medium text-body mb-1.5">Tags</label>
            <TagInput tags={formTags} setTags={setFormTags} allTags={allTags} />
          </div>

          <div>
            <label className="block text-xs font-medium text-body mb-1.5">Follow-Up Date</label>
            <input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} className={inputClass} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-body">Contacts</label>
              <button type="button" onClick={() => setShowContactForm(!showContactForm)} className="text-xs text-brand-500 hover:text-brand-400 font-medium">
                {showContactForm ? "Cancel" : "+ Add Contact"}
              </button>
            </div>

            {showContactForm && (
              <div className="border border-line rounded-lg p-3 mb-2 space-y-2 bg-page/50">
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="Name *" value={contactInput.name} onChange={(e) => setContactInput({ ...contactInput, name: e.target.value })} className={`${inputClass} !py-2 !text-xs`} />
                  <input type="text" placeholder="Role (e.g. Recruiter)" value={contactInput.role} onChange={(e) => setContactInput({ ...contactInput, role: e.target.value })} className={`${inputClass} !py-2 !text-xs`} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="email" placeholder="Email" value={contactInput.email} onChange={(e) => setContactInput({ ...contactInput, email: e.target.value })} className={`${inputClass} !py-2 !text-xs`} />
                  <input type="text" placeholder="Phone" value={contactInput.phone} onChange={(e) => setContactInput({ ...contactInput, phone: e.target.value })} className={`${inputClass} !py-2 !text-xs`} />
                </div>
                <input type="url" placeholder="LinkedIn URL" value={contactInput.linkedin} onChange={(e) => setContactInput({ ...contactInput, linkedin: e.target.value })} className={`${inputClass} !py-2 !text-xs`} />
                <input type="text" placeholder="Notes about this contact" value={contactInput.notes} onChange={(e) => setContactInput({ ...contactInput, notes: e.target.value })} className={`${inputClass} !py-2 !text-xs`} />
                <button
                  type="button"
                  onClick={() => {
                    if (!contactInput.name.trim()) return;
                    setFormContacts([...formContacts, { ...contactInput }]);
                    setContactInput({ name: "", role: "", email: "", phone: "", linkedin: "", notes: "" });
                    setShowContactForm(false);
                  }}
                  className="w-full py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  Add Contact
                </button>
              </div>
            )}

            {formContacts.length > 0 && (
              <div className="space-y-1.5">
                {formContacts.map((c, i) => (
                  <div key={`${c.name}-${c.email || i}`} className="flex items-center justify-between px-3 py-2 bg-page/50 border border-line rounded-lg">
                    <div className="min-w-0">
                      <span className="text-xs font-medium text-heading">{c.name}</span>
                      {c.role && <span className="text-xs text-muted ml-1.5">· {c.role}</span>}
                      {c.email && <span className="text-[10px] text-muted block truncate">{c.email}</span>}
                    </div>
                    <button type="button" onClick={() => setFormContacts(formContacts.filter((_, j) => j !== i))} className="text-muted hover:text-red-500 ml-2 shrink-0">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-body mb-1.5">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
              <option value="Applied">Applied</option>
              <option value="Interview">Interview</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <button className="w-full bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-lg text-sm font-medium shadow-sm shadow-brand-600/20 transition-colors mt-2">
            Add Application
          </button>
        </form>
      </div>
    </div>
  );
}
