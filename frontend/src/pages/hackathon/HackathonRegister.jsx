import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";
import { toast } from "react-hot-toast";
import { useHackathonAuthStore } from "../../store/useHackathonAuthStore";
import { axiosInstance } from "../../lib/axios.js";
import CampusLoginImg from "../../assets/Campus-login.jpg";
import IdeaLabLogo from "../../assets/idea-lab.png";
import KctLogo from "../../assets/kctlogo.png";

const OTP_LEN = 6;

const HackathonRegister = () => {
  const navigate = useNavigate();
  const { logout } = useHackathonAuthStore();

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

      await axiosInstance.post("/hackathon/register", {
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
      navigate("/hackathon/login");
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
    "mt-1 w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition";
  const labelClass = "block text-xs font-medium text-gray-500 mb-0.5";

  const busy = sendingOtp || verifyingOtp;

  return (
    <div className="min-h-screen relative bg-[#F5F7FB]">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${CampusLoginImg})` }} />
      <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/80 to-[#F5F7FB]" />

      <div className="relative max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <img src={KctLogo} alt="KCT" className="h-8 w-auto" />
            <img src={IdeaLabLogo} alt="IDEA Lab" className="h-8 w-auto" />
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl border border-[#E2E8F0] bg-white/90 p-1 shadow-sm">
            <Link
              to="/hackathon/login"
              className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:bg-[#F5F7FB] transition"
            >
              Login
            </Link>
            <Link
              to="/hackathon/register"
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#2563EB] text-white"
            >
              Register
            </Link>
          </div>
        </div>

        <div className="max-w-xl mx-auto rounded-2xl border border-[#E2E8F0] bg-white/95 backdrop-blur p-6 shadow-sm">
          {/* Top bar */}
          <div className="flex items-start justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Register</h1>
            <p className="text-sm text-gray-500 mt-1.5">
              Already have an account?{" "}
              <Link to="/hackathon/login" className="text-blue-600 font-medium hover:underline">
                Login.
              </Link>
            </p>
          </div>

          <form onSubmit={handleFormSubmit}>
            {/* Section 1 — Basic Info */}
            <div className="mb-8">
              <h2 className="text-base font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-5">
                Your Basic Information
              </h2>

              <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                <div>
                  <label className={labelClass}>Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Full name"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Email</label>
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
                  <label className={labelClass}>Phone Number</label>
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
                  <label className={labelClass}>Degree</label>
                  <select
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    required
                    className={inputClass}
                  >
                    <option value="UG">UG</option>
                    <option value="PG">PG</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Graduation Year</label>
                  <select
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    required
                    className={inputClass}
                  >
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                    <option value="2028">2028</option>
                    <option value="2029">2029</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className={labelClass}>College</label>
                  <input
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    required
                    placeholder="Your college name"
                    className={inputClass}
                  />
                </div>

                <div className="col-span-2">
                  <label className={labelClass}>Branch</label>
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
              <h2 className="text-base font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-5">
                Choose Your Password
              </h2>

              <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                <div>
                  <label className={labelClass}>Password</label>
                  <div className="relative mt-1">
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type={showPassword ? "text" : "password"}
                      required
                      className="w-full rounded-md border border-gray-300 px-3 py-2.5 pr-14 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold tracking-wider text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? "HIDE" : "SHOW"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Confirm Password</label>
                  <div className="relative mt-1">
                    <input
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      type={showConfirm ? "text" : "password"}
                      required
                      className="w-full rounded-md border border-gray-300 px-3 py-2.5 pr-14 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold tracking-wider text-gray-400 hover:text-gray-600"
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
                        style={{ background: i < strength ? strengthColors[strength - 1] : "#e5e7eb" }}
                      />
                    ))}
                  </div>
                  <div className="mt-2 flex flex-col gap-1">
                    <p className={`text-xs flex items-center gap-1.5 ${password.length >= 6 ? "text-green-500" : "text-gray-400"}`}>
                      <span>{password.length >= 6 ? "✓" : "○"}</span> 6 character minimum
                    </p>
                    <p className={`text-xs flex items-center gap-1.5 ${/\d/.test(password) ? "text-green-500" : "text-gray-400"}`}>
                      <span>{/\d/.test(password) ? "✓" : "○"}</span> Must contain one number
                    </p>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <p className="mb-4 text-sm text-red-600 font-medium">{error}</p>
            )}

            {/* OTP section — hidden until code is sent */}
            <div className={`mb-6 ${otpSent ? "" : "hidden"}`} aria-hidden={!otpSent}>
              <h2 className="text-base font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-3">
                Email verification
              </h2>
              <p className="text-sm text-gray-500 mb-4">Enter the 6-digit code sent to your email.</p>
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
                    className="w-full min-w-0 text-center text-lg font-semibold rounded-md border border-gray-300 py-2.5 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-60"
                  />
                ))}
              </div>
              {otpError && <p className="mb-3 text-sm text-red-600 font-medium">{otpError}</p>}
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleVerifyAndRegister}
                  disabled={busy || otpDigits.join("").length !== OTP_LEN}
                  className="w-full py-3 rounded-lg bg-[#2B2D42] text-white text-sm font-medium hover:bg-[#1a1c2e] disabled:opacity-60 transition"
                >
                  {verifyingOtp ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader className="size-4 animate-spin" />
                      Verifying…
                    </span>
                  ) : (
                    "Verify & register"
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendSeconds > 0 || sendingOtp}
                  className="w-full py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition"
                >
                  {sendingOtp ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader className="size-4 animate-spin" />
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
                className="w-full py-3 rounded-lg bg-[#2B2D42] text-white text-sm font-medium hover:bg-[#1a1c2e] disabled:opacity-60 transition"
              >
                {sendingOtp ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader className="size-4 animate-spin" />
                    Sending OTP…
                  </span>
                ) : (
                  "Register"
                )}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default HackathonRegister;
