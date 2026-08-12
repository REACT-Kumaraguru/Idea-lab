import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useHackathonAuthStore } from "../../store/useHackathonAuthStore";
import { axiosInstance } from "../../lib/axios.js";
import CampusLoginImg from "../../assets/Campus-login.jpg";
import IdeaLabLogo from "../../assets/idea-lab.png";
import KctLogo from "../../assets/kctlogo.png";
import AmbientBackground from "../../components/AmbientBackground";

const OTP_LEN = 6;

const HackathonRegister = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hackathonId = searchParams.get("hackathonId");
  const [targetHackathonName, setTargetHackathonName] = useState("");
  const { hackathonUser, logout } = useHackathonAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [degree, setDegree] = useState("UG");
  const [college, setCollege] = useState("");
  const [branch, setBranch] = useState("");
  const [graduationYear, setGraduationYear] = useState("2026");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState(null);

  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState(() => Array(OTP_LEN).fill(""));
  const [otpError, setOtpError] = useState(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);

  const [registrationClosed, setRegistrationClosed] = useState(false);
  const [registrationClosedMessage, setRegistrationClosedMessage] = useState("");

  const otpRefs = useRef([]);

  const passwordStrength = () => {
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    return score;
  };

  const strengthColors = ["#e5e7eb", "#fbbf24", "#34d399", "#22c55e"];
  const strength = passwordStrength();

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const id = window.setTimeout(() => setResendSeconds((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [resendSeconds]);

  useEffect(() => {
    if (otpSent && otpRefs.current[0]) {
      otpRefs.current[0].focus();
    }
  }, [otpSent]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await axiosInstance.get("/ich2026/registration-status");
        if (!active) return;
        setRegistrationClosed(Boolean(res.data?.registrationClosed));
        setRegistrationClosedMessage(res.data?.message || "");
      } catch {
        if (active) {
          setRegistrationClosed(false);
          setRegistrationClosedMessage("");
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hackathonId) return;
    let active = true;
    axiosInstance
      .get("/ich2026/hackathons")
      .then((res) => {
        if (!active) return;
        const list = res.data?.hackathons || [];
        const targetLower = String(hackathonId).toLowerCase();
        const match = list.find(
          (h) =>
            String(h.id).toLowerCase() === targetLower ||
            String(h.slug || "").toLowerCase() === targetLower ||
            (targetLower === "ai" && (String(h.id) === "5" || h.name?.toLowerCase().includes("ai")))
        );
        if (match?.name) {
          setTargetHackathonName(match.name);
        } else if (hackathonId === "5" || hackathonId.toLowerCase() === "ai") {
          setTargetHackathonName("AI & Robotics Challenge 2026");
        } else if (hackathonId === "1" || hackathonId.toLowerCase() === "ich2026") {
          setTargetHackathonName("IDEA LAB Hackathon 2026");
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [hackathonId]);

  const validateForm = useCallback(() => {
    if (!college.trim()) {
      setError("College is required");
      return false;
    }
    if (!branch.trim()) {
      setError("Branch is required");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Password and confirm password must match");
      return false;
    }
    if (!/^\d+$/.test(phone.trim())) {
      setError("Phone must contain numbers only");
      return false;
    }
    setError(null);
    return true;
  }, [college, branch, password, confirmPassword, phone]);

  const sendRegisterOtp = async () => {
    if (!validateForm()) return;
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Email is required");
      return;
    }

    setSendingOtp(true);
    setOtpError(null);
    try {
      await axiosInstance.post("/auth/send-register-otp", { email: trimmedEmail });
      setOtpSent(true);
      setOtpDigits(Array(OTP_LEN).fill(""));
      setResendSeconds(30);
      toast.success("OTP sent to email");
    } catch (err) {
      const msg = err.response?.data?.message || "Could not send OTP";
      toast.error(msg);
      setError(msg);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!otpSent) {
      void sendRegisterOtp();
    }
  };

  const setDigit = (index, raw) => {
    const d = raw.replace(/\D/g, "").slice(-1);
    setOtpDigits((prev) => {
      const next = [...prev];
      next[index] = d;
      return next;
    });
    if (d && index < OTP_LEN - 1) {
      otpRefs.current[index + 1]?.focus();
    }
    setOtpError(null);
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LEN);
    if (text.length === OTP_LEN) {
      e.preventDefault();
      setOtpDigits(text.split(""));
      setOtpError(null);
      otpRefs.current[OTP_LEN - 1]?.focus();
    }
  };

  const handleVerifyAndRegister = async () => {
    const otp = otpDigits.join("");
    if (otp.length !== OTP_LEN) {
      setOtpError("Enter the 6-digit code");
      return;
    }

    setVerifyingOtp(true);
    setOtpError(null);
    try {
      await axiosInstance.post("/auth/verify-register-otp", {
        email: email.trim(),
        otp,
      });

      await axiosInstance.post("/ich2026/register", {
        name,
        email: email.trim(),
        phone: phone.trim(),
        degree,
        college: college.trim(),
        branch,
        graduation_year: graduationYear,
        password,
      });

      await logout();
      toast.success("Registration successful. Please sign in.");
      navigate("/Hackathon/login");
    } catch (err) {
      const msg = err.response?.data?.message || "Verification failed";
      setOtpError(msg);
      if (err.response?.status !== 400 && err.response?.status !== 403) {
        toast.error(msg);
      }
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendSeconds > 0 || sendingOtp) return;
    setSendingOtp(true);
    setOtpError(null);
    try {
      await axiosInstance.post("/auth/send-register-otp", { email: email.trim() });
      setOtpDigits(Array(OTP_LEN).fill(""));
      setResendSeconds(30);
      toast.success("OTP sent to email");
    } catch (err) {
      const msg = err.response?.data?.message || "Could not resend OTP";
      toast.error(msg);
      setOtpError(msg);
    } finally {
      setSendingOtp(false);
    }
  };

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-amber-500/30 px-3.5 py-3 text-sm text-stone-100 bg-stone-900/80 placeholder-stone-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition";
  const labelClass = "block text-xs font-sans uppercase tracking-widest text-stone-300 mb-0.5 font-semibold";

  const busy = sendingOtp || verifyingOtp;

  return (
    <div className="min-h-screen relative bg-[#0a0809] text-stone-100 font-sans selection:bg-amber-400 selection:text-stone-950 overflow-hidden">
      <AmbientBackground height="h-full" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-8">
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
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-stone-900/80 p-1 shadow-lg font-sans text-xs">
            <Link
              to="/Hackathon/login"
              className="px-4 py-2 rounded-full font-bold uppercase tracking-wider text-amber-200 hover:bg-amber-400/10 transition"
            >
              Login
            </Link>
            <Link
              to="/Hackathon/register"
              className="px-4 py-2 rounded-full font-bold uppercase tracking-wider bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 shadow-md"
            >
              Register
            </Link>
          </div>
        </div>

        <div className="max-w-xl mx-auto serene-glass-card rounded-3xl border border-amber-500/30 p-8 shadow-2xl">
          {/* Top bar */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="font-serif text-4xl text-stone-100 uppercase tracking-wider font-normal">Registration</h1>
              {targetHackathonName ? (
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-sans font-bold uppercase tracking-wider">
                  <span>✨</span>
                  <span>Registering for: {targetHackathonName}</span>
                </div>
              ) : (
                <p className="text-xs font-dancing text-amber-200/90 mt-1">Hackathon Participant Portal</p>
              )}
            </div>
            <p className="text-xs font-sans text-stone-400">
              Already registered?{" "}
              <Link to="/Hackathon/login" className="text-amber-300 hover:text-amber-200 font-bold uppercase tracking-wider">
                Login.
              </Link>
            </p>
          </div>

          {hackathonUser ? (
            <div className="text-center py-6 space-y-5 font-sans text-stone-100">
              <div className="w-14 h-14 rounded-2xl bg-amber-400/15 border border-amber-400/40 flex items-center justify-center text-amber-300 mx-auto">
                <CheckCircle2 className="w-7 h-7 text-amber-300" />
              </div>
              <div>
                <h2 className="font-serif text-2xl uppercase tracking-wider text-stone-100 font-normal">Already Registered & Signed In</h2>
                <p className="text-xs text-stone-300 mt-2 max-w-md mx-auto leading-relaxed font-sans">
                  You are signed in as <span className="font-bold text-amber-300">{hackathonUser.name || hackathonUser.email}</span>. You already have an active participant account and cannot create a duplicate registration.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-3 font-sans text-xs">
                <Link
                  to="/Hackathon/dashboard"
                  className="px-6 py-3 rounded-full bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold uppercase tracking-wider transition shadow-lg border border-amber-300"
                >
                  Go to Dashboard
                </Link>
                <Link
                  to="/Hackathon/dashboard/team"
                  className="px-6 py-3 rounded-full border border-amber-500/30 bg-stone-900/80 text-stone-200 font-bold uppercase tracking-wider hover:bg-amber-400/10 transition"
                >
                  View My Team
                </Link>
              </div>
            </div>
          ) : registrationClosed ? (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-400/10 p-6 text-center text-stone-100 space-y-3 font-sans">
              <h2 className="font-serif text-xl font-normal text-amber-300 uppercase tracking-wider">Registration closed</h2>
              <p className="text-xs text-stone-300">
                {registrationClosedMessage ||
                  "Hackathon registration is closed. New sign-ups are no longer accepted."}
              </p>
              <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center text-xs">
                <Link
                  to="/Hackathon/login"
                  className="inline-flex justify-center rounded-xl bg-amber-400 px-5 py-2.5 font-extrabold text-stone-950 uppercase tracking-wider hover:bg-amber-300 border border-amber-300"
                >
                  Go to Login
                </Link>
                <Link
                  to="/hackathon"
                  className="inline-flex justify-center rounded-xl border border-amber-500/30 bg-stone-900/80 px-5 py-2.5 font-semibold text-stone-200 hover:bg-amber-400/10"
                >
                  Back to All Events
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit}>
              {/* Section 1 — Basic Info */}
              <div className="mb-8">
                <h2 className="font-serif text-sm uppercase tracking-wider text-amber-300 border-b border-amber-500/20 pb-2 mb-5 font-normal">
                  Your Basic Information
                </h2>

                <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                  <div>
                    <label className={labelClass}>Name *</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Full name"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Email *</label>
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
                    <label className={labelClass}>Phone Number *</label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      type="tel"
                      placeholder="9876543210"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Degree *</label>
                    <select
                      value={degree}
                      onChange={(e) => setDegree(e.target.value)}
                      required
                      className={inputClass}
                    >
                      <option value="UG" className="bg-stone-900 text-stone-100">UG</option>
                      <option value="PG" className="bg-stone-900 text-stone-100">PG</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Graduation Year *</label>
                    <select
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(e.target.value)}
                      required
                      className={inputClass}
                    >
                      <option value="2026" className="bg-stone-900 text-stone-100">2026</option>
                      <option value="2027" className="bg-stone-900 text-stone-100">2027</option>
                      <option value="2028" className="bg-stone-900 text-stone-100">2028</option>
                      <option value="2029" className="bg-stone-900 text-stone-100">2029</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className={labelClass}>College *</label>
                    <input
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      required
                      placeholder="Your college name"
                      className={inputClass}
                    />
                  </div>

                  <div className="col-span-2">
                    <label className={labelClass}>Branch *</label>
                    <input
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      required
                      placeholder="e.g., Computer Science / Mechanical / Electronics"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Section 2 — Password */}
              <div className="mb-6">
                <h2 className="font-serif text-sm uppercase tracking-wider text-amber-300 border-b border-amber-500/20 pb-2 mb-5 font-normal">
                  Choose Your Password
                </h2>

                <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                  <div>
                    <label className={labelClass}>Password *</label>
                    <div className="relative mt-1">
                      <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type={showPassword ? "text" : "password"}
                        required
                        className="w-full rounded-xl border border-amber-500/30 px-3.5 py-3 pr-14 text-xs text-stone-100 bg-stone-900/90 focus:outline-none focus:border-amber-400 transition font-sans"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold tracking-wider text-amber-400 hover:text-amber-300 cursor-pointer"
                      >
                        {showPassword ? "HIDE" : "SHOW"}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Confirm Password *</label>
                    <div className="relative mt-1">
                      <input
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        type={showConfirm ? "text" : "password"}
                        required
                        className="w-full rounded-xl border border-amber-500/30 px-3.5 py-3 pr-14 text-xs text-stone-100 bg-stone-900/90 focus:outline-none focus:border-amber-400 transition font-sans"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold tracking-wider text-amber-400 hover:text-amber-300 cursor-pointer"
                      >
                        {showConfirm ? "HIDE" : "SHOW"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Strength bar */}
                {password.length > 0 && (
                  <div className="mt-3">
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="flex-1 h-[3px] rounded-full transition-all"
                          style={{ background: i < strength ? strengthColors[strength - 1] : "#334155" }}
                        />
                      ))}
                    </div>
                    <div className="mt-2 flex flex-col gap-1 font-sans">
                      <p className={`text-xs flex items-center gap-1.5 ${password.length >= 6 ? "text-emerald-400" : "text-stone-500"}`}>
                        <span>{password.length >= 6 ? "✓" : "○"}</span> 6 character minimum
                      </p>
                      <p className={`text-xs flex items-center gap-1.5 ${/\d/.test(password) ? "text-emerald-400" : "text-stone-500"}`}>
                        <span>{/\d/.test(password) ? "✓" : "○"}</span> Must contain one number
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="mb-5 p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200 flex items-center justify-between gap-3 font-sans">
                  <span>{error}</span>
                  {error.toLowerCase().includes("already") || error.toLowerCase().includes("exists") ? (
                    <Link
                      to="/Hackathon/login"
                      className="px-3 py-1 rounded-lg bg-amber-400 text-stone-950 font-bold uppercase tracking-wider text-[10px] shrink-0"
                    >
                      Login Now
                    </Link>
                  ) : null}
                </div>
              )}

              {/* OTP section — hidden until code is sent */}
              <div className={`mb-6 ${otpSent ? "" : "hidden"}`} aria-hidden={!otpSent}>
                <h2 className="font-serif text-sm uppercase tracking-wider text-amber-300 border-b border-amber-500/20 pb-2 mb-3 font-normal">
                  Email Verification
                </h2>
                <p className="text-xs text-stone-400 mb-4 font-sans">Enter the 6-digit code sent to your email address.</p>
                <div className="flex gap-2 justify-between mb-4" onPaste={handleOtpPaste}>
                  {otpDigits.map((d, i) => (
                    <input
                      key={i}
                      ref={(el) => {
                        otpRefs.current[i] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={1}
                      value={d}
                      onChange={(e) => setDigit(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      disabled={busy}
                      className="w-full min-w-0 text-center text-lg font-bold rounded-xl border border-amber-500/30 py-2.5 text-amber-300 bg-stone-900/90 focus:outline-none focus:border-amber-400 disabled:opacity-60 font-mono"
                    />
                  ))}
                </div>
                {otpError && <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200 font-sans">{otpError}</div>}
                <div className="flex flex-col gap-3 font-sans">
                  <button
                    type="button"
                    onClick={handleVerifyAndRegister}
                    disabled={busy || otpDigits.join("").length !== OTP_LEN}
                    className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold uppercase text-xs tracking-wider disabled:opacity-60 transition shadow-lg cursor-pointer border border-amber-300"
                  >
                    {verifyingOtp ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader className="w-4 h-4 animate-spin" />
                        Verifying…
                      </span>
                    ) : (
                      "Verify & Complete Registration"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendSeconds > 0 || sendingOtp}
                    className="w-full py-2.5 rounded-xl border border-amber-500/30 bg-stone-900/80 text-xs font-bold text-stone-300 uppercase tracking-wider hover:bg-amber-400/10 disabled:opacity-50 transition cursor-pointer"
                  >
                    {sendingOtp ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader className="w-4 h-4 animate-spin" />
                        Sending…
                      </span>
                    ) : resendSeconds > 0 ? (
                      `Resend OTP (${resendSeconds}s)`
                    ) : (
                      "Resend OTP"
                    )}
                  </button>
                </div>
              </div>

              {!otpSent && (
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold uppercase text-xs tracking-wider disabled:opacity-60 transition shadow-lg cursor-pointer border border-amber-300 font-sans"
                >
                  {sendingOtp ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader className="w-4 h-4 animate-spin" />
                      Sending OTP…
                    </span>
                  ) : (
                    "Register for Hackathon"
                  )}
                </button>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default HackathonRegister;
