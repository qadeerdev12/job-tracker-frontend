import { useRef, useState } from "react";
import { supabase } from "../../lib/supabase";

// Public bucket, unlike `documents`. An avatar is rendered in an <img> that must
// stay valid for the life of the page, so a short-lived signed URL is the wrong
// tool — a stable public URL is also browser-cacheable.
const BUCKET = "avatars";
const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export function avatarUrl(path) {
  if (!path) return "";
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

export default function AvatarUpload({ avatarPath, setAvatarPath, initials }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const url = avatarUrl(avatarPath);

  const handleFile = async (file) => {
    if (!file) return;
    setError("");

    if (!ALLOWED.includes(file.type)) {
      setError("Use a JPG, PNG or WebP image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Image must be under 2 MB.");
      return;
    }

    setUploading(true);
    try {
      const session = (await supabase.auth.getSession()).data.session;
      const userId = session.user.id;
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      // Timestamped so the browser doesn't serve a cached copy of the old avatar
      const path = `${userId}/avatar-${Date.now()}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { contentType: file.type, upsert: true });
      if (uploadErr) throw uploadErr;

      // Best-effort cleanup of the previous file; failure here is not worth
      // blocking the user over, they'd just have one orphaned image.
      if (avatarPath) {
        supabase.storage.from(BUCKET).remove([avatarPath]).catch(() => {});
      }

      setAvatarPath(path);
    } catch (err) {
      setError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removeAvatar = () => {
    if (avatarPath) supabase.storage.from(BUCKET).remove([avatarPath]).catch(() => {});
    setAvatarPath("");
    setError("");
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0">
        {url ? (
          <img
            src={url}
            alt=""
            className="w-20 h-20 rounded-2xl object-cover border border-line"
            onError={() => setError("Couldn't load that image. Try uploading it again.")}
          />
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xl font-bold">
            {initials}
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center">
            <svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          </div>
        )}
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="px-3 py-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 border border-brand-300 dark:border-brand-700 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors disabled:opacity-50"
          >
            {avatarPath ? "Change photo" : "Upload photo"}
          </button>
          {avatarPath && (
            <button
              type="button"
              onClick={removeAvatar}
              className="px-3 py-1.5 text-xs font-medium text-muted hover:text-red-500 transition-colors"
            >
              Remove
            </button>
          )}
        </div>
        <p className="text-[11px] text-muted mt-1.5">JPG, PNG or WebP · max 2 MB</p>
        {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => handleFile(e.target.files?.[0])}
        className="hidden"
      />
    </div>
  );
}
