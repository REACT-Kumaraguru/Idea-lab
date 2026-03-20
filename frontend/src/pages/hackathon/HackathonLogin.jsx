import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";
import { useHackathonAuthStore } from "../../store/useHackathonAuthStore";

const HackathonLogin = () => {
  const navigate = useNavigate();
  const { login, isLoggingIn } = useHackathonAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login({ email, password });
      if (user.role === "admin") navigate("/hackathon/admin");
      else if (user.role === "mentor") navigate("/hackathon/dashboard");
      else navigate("/hackathon/dashboard");
    } catch {
      // toast handled in store
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-900">Hackathon Login</h2>
      <p className="text-gray-600 mt-2">Sign in to manage your hackathon journey.</p>

      <form onSubmit={onSubmit} className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-800">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-800">Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={isLoggingIn}
          className="w-full mt-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
        >
          {isLoggingIn ? (
            <span className="flex items-center justify-center gap-2">
              <Loader className="size-4 animate-spin" />
              Signing in...
            </span>
          ) : (
            "Login"
          )}
        </button>

        <div className="mt-4 text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link to="/hackathon/register" className="text-blue-700 font-semibold hover:underline">
            Register
          </Link>
        </div>
      </form>

      <div className="mt-6 text-center">
        <Link to="/hackathon/problems" className="text-blue-700 font-semibold hover:underline">
          Browse problems
        </Link>
      </div>
    </div>
  );
};

export default HackathonLogin;

