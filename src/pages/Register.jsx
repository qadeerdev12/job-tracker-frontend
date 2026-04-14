

import { useState } from "react";
import axios from "axios";

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

      // After successful registration, go back to login page
      setPage("login");
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        "Registration failed";
      setErrorMsg(msg);
      console.log(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-300 flex items-center justify-center">
      <form
        onSubmit={handleRegister}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-2 text-center">
          Create an Account
        </h2>

        <p className="text-center text-gray-500 mb-6">
          Start tracking your job applications
        </p>

        {errorMsg && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">
            {errorMsg}
          </div>
        )}

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-400 p-2 rounded mb-4"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-400 p-2 rounded mb-4"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-400 p-2 rounded mb-6"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Register"}
        </button>

        <p className="text-center text-gray-500 mt-4">
          Already have an account?
        </p>

        <button
          type="button"
          onClick={() => setPage("login")}
          className="w-full mt-2 bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
        >
          Back to Login
        </button>
      </form>
    </div>
  );
}

export default Register;