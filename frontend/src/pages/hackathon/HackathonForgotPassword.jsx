import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader, ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import { axiosInstance } from "../../lib/axios.js";
import IdeaLabLogo from "../../assets/idea-lab.png";
import KctLogo from "../../assets/kctlogo.png";
import CampusLoginImg from "../../assets/Campus-login.jpg";
import AmbientBackground from "../../components/AmbientBackground";

const OTP_LEN = 6;
const API = "/ich2026";

const HackathonForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpDigits, setOtpDigits] = useState(() => Array(OTP_LEN).fill(""));
  const [otpError, setOtpError] = useState(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetting, setResetting] = useState(false);

  const otpRefs = useRef([]);

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

  const busy = sendingOtp || verifyingOtp || resetting;

  const handleSendOtp = async () => {
    if (otpSent) return;
    const trimmed = email.trim();
    if (!trimmed) {
      toast.error("Enter your email");
      return;
    }
    setSendingOtp(true);
    setOtpError(null);
    try {
      const res = await axiosInstance.post(`${API}/send-reset-otp`, { email: trimmed });
      setOtpSent(true);
      setOtpDigits(Array(OTP_LEN).fill(""));
      setResendSeconds(30);
      toast.success(res.data?.message || "OTP sent to your email");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not send OTP");
    } finally {
      setSendingOtp(false);
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

  const handleVerifyOtp = async () => {
    const otp = otpDigits.join("");
    if (otp.length !== OTP_LEN) {
      setOtpError("Enter the 6-digit code");
      return;
    }
    setVerifyingOtp(true);
    setOtpError(null);
    try {
      await axiosInstance.post(`${API}/verify-reset-otp`, {
        email: email.trim(),
        otp,
      });
      setOtpVerified(true);
      toast.success("Code verified. Enter your new password.");
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid or expired code";
      setOtpError(msg);
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendSeconds > 0 || sendingOtp) return;
    setSendingOtp(true);
    setOtpError(null);
    try {
      const res = await axiosInstance.post(`${API}/send-reset-otp`, { email: email.trim() });
      setOtpDigits(Array(OTP_LEN).fill(""));
      setResendSeconds(30);
      toast.success(res.data?.message || "OTP sent to your email");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not resend OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setResetting(true);
    try {
      const res = await axiosInstance.post(`${API}/reset-password`, {
        email: email.trim(),
        password: newPassword,
      });
      toast.success(res.data?.message || "Password updated successfully");
      navigate("/Hackathon/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not reset password");
    } finally {
      setResetting(false);
    }
  };

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-amber-500/30 px-3.5 py-3 text-sm text-stone-100 bg-stone-900/80 placeholder-stone-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition disabled:opacity-50";
  const labelClass = "block text-xs font-sans uppercase tracking-widest text-stone-300 mb-0.5 font-semibold";

  return (
    <div className="min-h-screen relative bg-[#0a0809] text-stone-100 font-sans selection:bg-amber-400 selection:text-stone-950 flex flex-col justify-center overflow-hidden">
      <AmbientBackground height="h-full" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-8 w-full">
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

        <div className="max-w-xl mx-auto serene-glass-card rounded-3xl border border-amber-500/30 p-8 sm:p-10 shadow-2xl">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-amber-500/20">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl text-stone-100 uppercase tracking-wider font-normal">Forgot Password</h1>
              <p className="text-xs font-dancing text-amber-200/90 mt-1">
                Enter your registered email address to receive verification OTP
              </p>
            </div>
            <Link to="/Hackathon/login" className="text-xs font-sans text-amber-300 font-bold uppercase tracking-wider hover:text-amber-200">
              Back to Login
            </Link>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!otpSent && !otpVerified) void handleSendOtp();
            }}
            className="space-y-5"
          >
            <div>
              <label className={labelClass}>Email Address *</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                disabled={otpVerified}
                placeholder="you@kct.ac.in"
                className={inputClass}
              />
            </div>

            {!otpSent && (
              <button
                type="submit"
                disabled={busy}
                className="w-full py-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-sm transition shadow-sm disabled:opacity-60 flex justify-center items-center gap-2"
              >
                {sendingOtp ? (
                  <>
                    <Loader className="size-4 animate-spin" />
                    Sending OTP…
                  </>
                ) : (
                  "Send OTP"
                )}
              </button>
            )}
          </form>

          <div className={`mt-6 space-y-4 ${otpSent && !otpVerified ? "" : "hidden"}`} aria-hidden={!(otpSent && !otpVerified)}>
            <p className="text-xs text-gray-500">Enter the 6-digit code sent to your email.</p>
            <div className="flex gap-2 justify-between" onPaste={handleOtpPaste}>
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
                  className="w-full min-w-0 text-center text-base font-semibold rounded-xl border border-gray-300 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                />
              ))}
            </div>
            {otpError && <p className="text-xs text-red-600 font-medium">{otpError}</p>}
            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={busy || otpDigits.join("").length !== OTP_LEN}
              className="w-full py-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-sm transition shadow-sm disabled:opacity-60 flex justify-center items-center gap-2"
            >
              {verifyingOtp ? (
                <>
                  <Loader className="size-4 animate-spin" />
                  Verifying…
                </>
              ) : (
                "Verify OTP"
              )}
            </button>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendSeconds > 0 || sendingOtp}
              className="w-full py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition"
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

          <form
            onSubmit={handleResetPassword}
            className={`mt-6 space-y-4 ${otpVerified ? "" : "hidden"}`}
            aria-hidden={!otpVerified}
          >
            <div>
              <label className={labelClass}>New Password *</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className={inputClass}
                placeholder="••••••••••••"
              />
            </div>
            <div>
              <label className={labelClass}>Confirm Password *</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className={inputClass}
                placeholder="••••••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={resetting}
              className="w-full py-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-sm transition shadow-sm disabled:opacity-60 flex justify-center items-center gap-2"
            >
              {resetting ? (
                <>
                  <Loader className="size-4 animate-spin" />
                  Updating Password…
                </>
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HackathonForgotPassword;
