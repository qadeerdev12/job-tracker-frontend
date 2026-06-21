import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { supabase } from "../lib/supabase";
import { API, inputClass } from "../utils/constants";

const BUCKET = "documents";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];

const TYPE_BADGES = {
  Resume: "bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400",
  "Cover Letter": "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  Other: "bg-gray-100 text-gray-700 dark:bg-gray-500/15 dark:text-gray-400",
};

function formatSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function DocumentsTab({ authHeader, jobs }) {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadType, setUploadType] = useState("Resume");
  const [uploadJobId, setUploadJobId] = useState("");
  const [error, setError] = useState("");
  const [editingDoc, setEditingDoc] = useState(null);
  const fileRef = useRef(null);

  const fetchDocuments = async () => {
    try {
      const res = await axios.get(`${API}/api/documents`, authHeader());
      setDocuments(res.data);
    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const uploadFile = async (file) => {
    if (!file) return;
    setError("");

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only PDF, DOC, DOCX, and TXT files are allowed.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("File size must be under 5 MB.");
      return;
    }

    setUploading(true);
    try {
      const session = (await supabase.auth.getSession()).data.session;
      const userId = session.user.id;
      const ext = file.name.split(".").pop();
      const storagePath = `${userId}/${Date.now()}-${file.name}`;

      const { error: uploadErr } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, file, { contentType: file.type });

      if (uploadErr) throw uploadErr;

      await axios.post(`${API}/api/documents`, {
        fileName: file.name,
        storagePath,
        fileSize: file.size,
        type: uploadType,
        jobId: uploadJobId || null,
      }, authHeader());

      await fetchDocuments();
      setUploadJobId("");
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  const handleDownload = async (doc) => {
    try {
      const res = await axios.get(`${API}/api/documents/${doc._id}/url`, authHeader());
      window.open(res.data.url, "_blank");
    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  };

  const handleDelete = async (doc) => {
    try {
      await axios.delete(`${API}/api/documents/${doc._id}`, authHeader());
      fetchDocuments();
    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  };

  const handleUpdate = async (docId, data) => {
    try {
      await axios.put(`${API}/api/documents/${docId}`, data, authHeader());
      fetchDocuments();
      setEditingDoc(null);
    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  };

  const getJobLabel = (jobId) => {
    const job = jobs.find((j) => j._id === jobId);
    return job ? `${job.company} — ${job.role}` : null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-heading">Documents</h2>
        <span className="text-sm text-muted">{documents.length} file{documents.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Upload Area */}
      <div className="bg-card rounded-2xl border border-line p-6">
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-body mb-1.5">Document Type</label>
            <select value={uploadType} onChange={(e) => setUploadType(e.target.value)} className={inputClass}>
              <option value="Resume">Resume</option>
              <option value="Cover Letter">Cover Letter</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-body mb-1.5">Link to Application (optional)</label>
            <select value={uploadJobId} onChange={(e) => setUploadJobId(e.target.value)} className={inputClass}>
              <option value="">None</option>
              {jobs.map((j) => (
                <option key={j._id} value={j._id}>{j.company} — {j.role}</option>
              ))}
            </select>
          </div>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            dragOver
              ? "border-brand-400 bg-brand-500/5"
              : "border-line-strong hover:border-brand-400/50 hover:bg-brand-500/5"
          }`}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            className="hidden"
            onChange={(e) => uploadFile(e.target.files[0])}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <svg className="w-8 h-8 text-brand-400 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              <p className="text-sm text-muted">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <svg className="w-10 h-10 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <p className="text-sm text-heading font-medium">Drop a file here or click to browse</p>
              <p className="text-xs text-muted">PDF, DOC, DOCX, TXT — max 5 MB</p>
            </div>
          )}
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-400 flex items-center gap-1.5">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
            {error}
          </p>
        )}
      </div>

      {/* Document List */}
      {documents.length === 0 ? (
        <div className="bg-card rounded-2xl border border-line p-12 text-center">
          <svg className="w-12 h-12 text-muted mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <p className="text-sm text-muted">No documents uploaded yet</p>
          <p className="text-xs text-muted mt-1">Upload your resumes and cover letters to keep them organized</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div key={doc._id} className="bg-card rounded-xl border border-line p-4 flex items-center gap-4 group hover:border-line-strong transition-colors">
              <div className="w-10 h-10 bg-brand-500/10 rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-medium text-heading truncate">{doc.fileName}</p>
                  <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold ${TYPE_BADGES[doc.type]}`}>
                    {doc.type}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted">
                  <span>{formatSize(doc.fileSize)}</span>
                  <span>{new Date(doc.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  {doc.jobId && getJobLabel(doc.jobId) && (
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.632a4.5 4.5 0 00-1.242-7.244l4.5-4.5a4.5 4.5 0 016.364 6.364L16.06 8.688" /></svg>
                      {getJobLabel(doc.jobId)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setEditingDoc(doc)}
                  className="p-1.5 text-muted hover:text-brand-400 rounded-lg hover:bg-page transition-colors"
                  title="Edit"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" /></svg>
                </button>
                <button
                  onClick={() => handleDownload(doc)}
                  className="p-1.5 text-muted hover:text-brand-400 rounded-lg hover:bg-page transition-colors"
                  title="Download"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                </button>
                <button
                  onClick={() => handleDelete(doc)}
                  className="p-1.5 text-muted hover:text-red-400 rounded-lg hover:bg-page transition-colors"
                  title="Delete"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Document Modal */}
      {editingDoc && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setEditingDoc(null)}>
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-line-strong" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-heading">Edit Document</h3>
              <button onClick={() => setEditingDoc(null)} className="p-1 text-muted hover:text-body rounded-lg hover:bg-page">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <p className="text-sm text-body mb-4 truncate">{editingDoc.fileName}</p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-body mb-1.5">Document Type</label>
                <select
                  value={editingDoc.type}
                  onChange={(e) => setEditingDoc({ ...editingDoc, type: e.target.value })}
                  className={inputClass}
                >
                  <option value="Resume">Resume</option>
                  <option value="Cover Letter">Cover Letter</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-body mb-1.5">Linked Application</label>
                <select
                  value={editingDoc.jobId || ""}
                  onChange={(e) => setEditingDoc({ ...editingDoc, jobId: e.target.value || null })}
                  className={inputClass}
                >
                  <option value="">None</option>
                  {jobs.map((j) => (
                    <option key={j._id} value={j._id}>{j.company} — {j.role}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => handleUpdate(editingDoc._id, { type: editingDoc.type, jobId: editingDoc.jobId })}
                className="flex-1 bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-lg text-sm font-medium shadow-sm transition-colors"
              >
                Save Changes
              </button>
              <button onClick={() => setEditingDoc(null)} className="px-5 py-2.5 border border-line-strong text-body rounded-lg text-sm font-medium hover:bg-page transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
