import { useState } from "react";
import axios from "axios";

function Login({ setPage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("https://job-tracker-backend-s1fc.onrender.com/api/auth/login", {
        email,
        password,
      });

      console.log("Login success:", res.data);

      // Save token
      localStorage.setItem("token", res.data.token);
      // Refresh app to trigger re-render and show Dashboard
      window.location.reload();

    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-300 flex items-center justify-center">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-2 text-center">
          Job Tracker Login
        </h2>

        <p className="text-center text-gray-500 mb-6">
          Track your job applications easily
        </p>

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
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Login
        </button>

        <p className="text-center text-gray-500 mt-4">
          Don’t have an account?
        </p>

        <button
          type="button"
          onClick={() => setPage("register")}
          className="w-full mt-2 bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
        >
          Register
        </button>
      </form>
    </div>
  );
}

export default Login;