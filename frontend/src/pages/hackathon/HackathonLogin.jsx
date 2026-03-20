import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";
import { useHackathonAuthStore } from "../../store/useHackathonAuthStore";
import IdeaLabLogo from "../../assets/idea-lab.png";
import KctLogo from "../../assets/kctlogo.png";
import CampusLoginImg from "../../assets/Campus-login.jpg";

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
      else navigate("/hackathon/dashboard");
    } catch {
      // toast handled in store
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="w-full md:w-[42%] bg-[#F4F5F8] flex flex-col justify-center items-start px-12 py-16">
        {/* Logos */}
        <div className="flex items-center gap-3 mb-12">
          <img src={KctLogo} alt="KCT" className="h-9 w-auto" />
          <img src={IdeaLabLogo} alt="IDEA Lab" className="h-9 w-auto" />
        </div>

        {/* Card */}
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-9">
          <h2
            className="text-2xl font-bold text-gray-900 mb-1"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Hackathon Login
          </h2>
          <p className="text-sm text-gray-400 mb-7">Please enter your details</p>

          <form onSubmit={onSubmit}>
            <div className="mb-5">
              <label className="block text-xs font-medium text-gray-500 mb-2 tracking-wide">
                Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                placeholder="you@kct.ac.in"
                className="w-full rounded-xl border border-[#E2E4EA] bg-[#FAFAFA] px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>

            <div className="mb-1">
              <label className="block text-xs font-medium text-gray-500 mb-2 tracking-wide">
                Password
              </label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-[#E2E4EA] bg-[#FAFAFA] px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>

            <div className="flex justify-end mb-6">
              <Link
                to="/hackathon/forgot-password"
                className="text-xs text-blue-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 rounded-xl bg-[#2B2D42] text-white text-sm font-medium hover:bg-[#1a1c2e] disabled:opacity-60 transition"
            >
              {isLoggingIn ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader className="size-4 animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>

            <p className="mt-5 text-center text-sm text-gray-400">
              Are you new?{" "}
              <Link
                to="/hackathon/register"
                className="text-gray-900 font-semibold hover:underline"
              >
                Create an Account
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right Panel — full-bleed background image */}
      <div className="hidden md:block flex-1 relative overflow-hidden">
        <img
          src={CampusLoginImg}
          alt="Campus"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-slate-900/10" />
      </div>
    </div>
  );
};

export default HackathonLogin;