import { useState } from "react";
import { supabase } from "../lib/supabase";

const inputClass = "w-full border border-input-border bg-input-bg text-heading p-3 rounded-xl focus:ring-2 focus:ring-brand-400 focus:border-brand-400 outline-none transition-shadow placeholder:text-muted";

function Register({ setPage }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name || !email || !password) {
      setErrorMsg("All fields are required");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error) {
      setErrorMsg(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) setErrorMsg(error.message);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center px-4">
        <div className="bg-card p-8 rounded-2xl shadow-xl border border-line w-full max-w-md text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-xl font-bold text-heading mb-2">Check your email</h2>
          <p className="text-body mb-6">We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.</p>
          <button onClick={() => setPage("login")} className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-xl font-semibold transition-colors">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page flex items-center justify-center px-4">
      <form
        onSubmit={handleRegister}
        className="bg-card p-8 rounded-2xl shadow-xl border border-line w-full max-w-md"
      >
        <button
          type="button"
          onClick={() => setPage("landing")}
          className="block mx-auto text-3xl font-extrabold text-brand-600 mb-2 hover:text-brand-700 transition-colors"
        >
          TailorTrack
        </button>

        <h2 className="text-xl font-bold mb-1 text-center text-heading">
          Join TailorTrack
        </h2>

        <p className="text-center text-muted mb-6 text-sm">
          Start organizing your job search today
        </p>

        {errorMsg && (
          <div className="bg-red-100 text-red-700 p-2 rounded-lg mb-4 text-sm">
            {errorMsg}
          </div>
        )}

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`${inputClass} mb-4`}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`${inputClass} mb-4`}
        />

        <input
          type="password"
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`${inputClass} mb-6`}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white py-3 rounded-xl font-semibold shadow-md transition-all disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-line" />
          <span className="text-muted text-xs">or</span>
          <div className="flex-1 h-px bg-line" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 border border-line-strong py-3 rounded-xl font-semibold text-heading hover:bg-brand-50/50 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <p className="text-center text-muted mt-5 text-sm">
          Already have an account?
        </p>

        <button
          type="button"
          onClick={() => setPage("login")}
          className="w-full mt-2 bg-accent-500 hover:bg-accent-600 text-white py-3 rounded-xl font-semibold transition-colors"
        >
          Sign In
        </button>

        <button
          type="button"
          onClick={() => setPage("landing")}
          className="w-full mt-3 text-muted hover:text-brand-500 text-sm transition-colors"
        >
          Back to home
        </button>
      </form>
    </div>
  );
}

export default Register;
