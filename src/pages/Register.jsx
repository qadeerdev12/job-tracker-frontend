import { useState } from "react";
import axios from "axios";

const inputClass = "w-full border border-input-border bg-input-bg text-heading p-3 rounded-xl focus:ring-2 focus:ring-brand-400 focus:border-brand-400 outline-none transition-shadow placeholder:text-muted";

function Register({ setPage }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name || !email || !password) {
      setErrorMsg("All fields are required");
      return;
    }

    try {
      setLoading(true);
      await axios.post("https://job-tracker-backend-s1fc.onrender.com/api/auth/register", {
        name,
        email,
        password,
      });

      setPage("login");
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        "Registration failed";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

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
          ApplyFlow
        </button>

        <h2 className="text-xl font-bold mb-1 text-center text-heading">
          Join ApplyFlow
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
          placeholder="Name"
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
          {loading ? "Creating account..." : "Create Account"}
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
