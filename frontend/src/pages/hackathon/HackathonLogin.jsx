import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";
import { useHackathonAuthStore } from "../../store/useHackathonAuthStore";
import IdeaLabLogo from "../../assets/idea-lab.png";
import KctLogo from "../../assets/kctlogo.png";

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-10 h-full flex items-stretch">
        <div className="hidden md:flex w-1/2 rounded-3xl overflow-hidden relative border border-indigo-500/10 bg-gradient-to-br from-cyan-500/20 via-indigo-500/10 to-transparent">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.25),transparent_55%),radial-gradient(circle_at_bottom,rgba(99,102,241,0.25),transparent_60%)]" />
          <div className="relative p-10 flex flex-col justify-between w-full">
            <div>
              <div className="flex items-center gap-3">
                <img src={KctLogo} alt="KCT" className="h-10 w-auto" />
                <img src={IdeaLabLogo} alt="IDEA Lab" className="h-10 w-auto" />
              </div>
              <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-gray-900">Secure Sign In</h1>
              <p className="mt-3 text-gray-600">
                Access your hackathon dashboard with session-based login and role-aware navigation.
              </p>

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-cyan-500" />
                  <span className="text-gray-800">Create teams and invite members.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500" />
                  <span className="text-gray-800">Select a problem and submit your PoC/Prototype.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-cyan-500" />
                  <span className="text-gray-800">Track status updates in one place.</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Link
                to="/hackathon/register"
                className="inline-flex items-center justify-center rounded-2xl bg-gray-900 text-white px-5 py-3 font-semibold hover:bg-gray-800"
              >
                Create your account
              </Link>
              <p className="mt-3 text-xs text-gray-600">Students only. Admin and mentors can use their existing accounts.</p>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Hackathon Login</h2>
                <p className="text-gray-600 mt-2">Sign in to manage your hackathon journey.</p>
              </div>

              <form onSubmit={onSubmit}>
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

                <div className="mt-6 text-center">
                  <Link to="/hackathon/problems" className="text-blue-700 font-semibold hover:underline">
                    Browse problems
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HackathonLogin;

