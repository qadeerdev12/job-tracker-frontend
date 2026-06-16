import { useState } from "react";
import { supabase } from "../lib/supabase";

const inputClass = "w-full border border-input-border bg-input-bg text-heading p-3 rounded-xl focus:ring-2 focus:ring-brand-400 focus:border-brand-400 outline-none transition-shadow placeholder:text-muted";

function Login({ setPage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error) {
      setErrorMsg(error.message || "Login failed");
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

  return (
    <div className="min-h-screen bg-page flex items-center justify-center px-4">
      <form
        onSubmit={handleLogin}
        className="bg-card p-8 rounded-2xl shadow-xl border border-line w-full max-w-md"
      >
        <button
          type="button"
          onClick={() => setPage("landing")}
          className="block mx-auto text-3xl font-extrabold text-brand-600 mb-2 hover:text-brand-700 transition-colors"
        >
          ApplyFlow
        </button>

        <h2 className="text-xl font-bold mb-1 text-center text-heading">
          Welcome back
        </h2>

        <p className="text-center text-muted mb-6 text-sm">
          Sign in to your dashboard
        </p>

        {errorMsg && (
          <div className="bg-red-100 text-red-700 p-2 rounded-lg mb-4 text-sm">
            {errorMsg}
          </div>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`${inputClass} mb-4`}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`${inputClass} mb-6`}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white py-3 rounded-xl font-semibold shadow-md transition-all disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign In"}
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
          Don't have an account?
        </p>

        <button
          type="button"
          onClick={() => setPage("register")}
          className="w-full mt-2 bg-accent-500 hover:bg-accent-600 text-white py-3 rounded-xl font-semibold transition-colors"
        >
          Create Account
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

export default Login;
