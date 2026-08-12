import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader, ArrowLeft } from "lucide-react";
import { useHackathonAuthStore } from "../../store/useHackathonAuthStore";
import IdeaLabLogo from "../../assets/idea-lab.png";
import KctLogo from "../../assets/kctlogo.png";
import CampusLoginImg from "../../assets/Campus-login.jpg";
import AmbientBackground from "../../components/AmbientBackground";

const HackathonLogin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || localStorage.getItem("loginRedirect") || null;
  const { login, isLoggingIn } = useHackathonAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const bgImg = typeof CampusLoginImg === "string" ? CampusLoginImg : CampusLoginImg?.default || "";

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!login) return;
    try {
      const user = await login({ email, password });
      if (user?.role === "admin") {
        navigate("/Hackathon/admin");
      } else if (redirectTarget) {
        localStorage.removeItem("loginRedirect");
        navigate(redirectTarget);
      } else {
        navigate("/Hackathon/dashboard");
      }
    } catch {
      // toast handled in store
    }
  };

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-amber-500/30 px-3.5 py-3 text-sm text-stone-100 bg-stone-900/80 placeholder-stone-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition";
  const labelClass = "block text-xs font-sans uppercase tracking-widest text-stone-300 mb-0.5 font-semibold";

  return (
    <div className="min-h-screen relative bg-[#0a0809] text-stone-100 font-sans selection:bg-amber-400 selection:text-stone-950 flex flex-col justify-center overflow-hidden">
      <AmbientBackground height="h-full" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-8 w-full">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Link
              to="/Hackathon"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-amber-500/30 bg-stone-900/80 text-xs font-sans uppercase font-bold tracking-widest text-stone-300 hover:text-amber-300 transition shadow-lg"
            >
              <ArrowLeft className="w-4 h-4 text-amber-400" />
              <span>Back to Hackathons</span>
            </Link>
            <div className="flex items-center gap-3">
              <img src={KctLogo} alt="KCT" className="h-8 w-auto filter brightness-110" />
              <img src={IdeaLabLogo} alt="IDEA Lab" className="h-8 w-auto" />
            </div>
          </div>

          {/* Login / Register Pill Switcher */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-stone-900/80 p-1 shadow-lg font-sans text-xs">
            <Link
              to="/Hackathon/login"
              className="px-4 py-2 rounded-full font-bold uppercase tracking-wider bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 shadow-md"
            >
              Login
            </Link>
            <Link
              to="/Hackathon/register"
              className="px-4 py-2 rounded-full font-bold uppercase tracking-wider text-amber-200 hover:bg-amber-400/10 transition"
            >
              Register
            </Link>
          </div>
        </div>

        {/* Centered Login Card */}
        <div className="max-w-xl mx-auto serene-glass-card rounded-3xl border border-amber-500/30 p-8 sm:p-10 shadow-2xl">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-amber-500/20">
            <div>
              <h1 className="font-serif text-4xl text-stone-100 uppercase tracking-wider font-normal">Hackathon Sign In</h1>
              <p className="text-xs font-dancing text-amber-200/90 mt-1">
                Enter your credentials to access your project dashboard
              </p>
            </div>
            <span className="text-xs font-sans text-stone-400">
              Need account?{" "}
              <Link
                to="/Hackathon/register"
                className="text-amber-300 font-bold uppercase tracking-wider hover:text-amber-200"
              >
                Register.
              </Link>
            </span>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className={labelClass}>Email Address *</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                placeholder="you@kct.ac.in"
                className={inputClass}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label className={labelClass}>Password *</label>
                <Link
                  to="/Hackathon/forgot-password"
                  className="text-xs text-amber-300 font-semibold hover:text-amber-200 uppercase tracking-wider"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                placeholder="••••••••••••"
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 font-sans text-xs uppercase font-bold tracking-[0.2em] hover:brightness-110 hover:shadow-xl hover:shadow-amber-500/20 hover:scale-[1.02] transition-all duration-300 cursor-pointer shadow-lg mt-2 disabled:opacity-60 flex items-center justify-center"
            >
              {isLoggingIn ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader className="size-4 animate-spin" />
                  Authenticating...
                </span>
              ) : (
                "Authenticate & Sign In"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HackathonLogin;