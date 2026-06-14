import { useState } from "react";
import axios from "axios";

const inputClass = "w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-brand-400 focus:border-brand-400 outline-none transition-shadow";

function Login({ setPage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const res = await axios.post("http://localhost:5001/api/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      window.location.reload();
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Login failed";
      setErrorMsg(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center px-4">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-2xl shadow-xl border border-brand-100 w-full max-w-md"
      >
        <button
          type="button"
          onClick={() => setPage("landing")}
          className="block mx-auto text-3xl font-extrabold text-brand-600 mb-2 hover:text-brand-700 transition-colors"
        >
          ApplyFlow
        </button>

        <h2 className="text-xl font-bold mb-1 text-center text-gray-800">
          Welcome back
        </h2>

        <p className="text-center text-gray-400 mb-6 text-sm">
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
          className="w-full bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white py-3 rounded-xl font-semibold shadow-md transition-all"
        >
          Sign In
        </button>

        <p className="text-center text-gray-400 mt-5 text-sm">
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
          className="w-full mt-3 text-gray-400 hover:text-brand-500 text-sm transition-colors"
        >
          Back to home
        </button>
      </form>
    </div>
  );
}

export default Login;
