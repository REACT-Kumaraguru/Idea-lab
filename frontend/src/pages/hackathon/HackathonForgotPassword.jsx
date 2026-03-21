import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";
import { toast } from "react-hot-toast";
import { axiosInstance } from "../../lib/axios.js";
import IdeaLabLogo from "../../assets/idea-lab.png";
import KctLogo from "../../assets/kctlogo.png";
import CampusLoginImg from "../../assets/Campus-login.jpg";

const OTP_LEN = 6;
const API = "/hackathon";

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
      navigate("/hackathon/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not reset password");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-full md:w-[42%] bg-[#F4F5F8] flex flex-col justify-center items-start px-12 py-16">
        <div className="flex items-center gap-3 mb-12">
          <img src={KctLogo} alt="KCT" className="h-9 w-auto" />
          <img src={IdeaLabLogo} alt="IDEA Lab" className="h-9 w-auto" />
        </div>

        <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-9">
          <h2
            className="text-2xl font-bold text-gray-900 mb-1"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Forgot password
          </h2>
          <p className="text-sm text-gray-400 mb-7">
            <Link to="/hackathon/login" className="text-blue-600 hover:underline">
              Back to login
            </Link>
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!otpSent && !otpVerified) void handleSendOtp();
            }}
            className="space-y-5"
          >
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2 tracking-wide">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                disabled={otpVerified}
                placeholder="you@kct.ac.in"
                className="w-full rounded-xl border border-[#E2E4EA] bg-[#FAFAFA] px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition disabled:bg-gray-100"
              />
            </div>

            {!otpSent && (
              <button
                type="submit"
                disabled={busy}
                className="w-full py-3 rounded-xl bg-[#2B2D42] text-white text-sm font-medium hover:bg-[#1a1c2e] disabled:opacity-60 transition flex justify-center items-center gap-2"
              >
                {sendingOtp ? (
                  <>
                    <Loader className="size-4 animate-spin" />
                    Sending…
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
                  className="w-full min-w-0 text-center text-base font-semibold rounded-xl border border-[#E2E4EA] py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                />
              ))}
            </div>
            {otpError && <p className="text-xs text-red-600 font-medium">{otpError}</p>}
            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={busy || otpDigits.join("").length !== OTP_LEN}
              className="w-full py-3 rounded-xl bg-[#2B2D42] text-white text-sm font-medium hover:bg-[#1a1c2e] disabled:opacity-60 transition flex justify-center items-center gap-2"
            >
              {verifyingOtp ? (
                <>
                  <Loader className="size-4 animate-spin" />
                  Verifying…
                </>
              ) : (
                "Verify"
              )}
            </button>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendSeconds > 0 || sendingOtp}
              className="w-full py-2.5 rounded-xl border border-[#E2E4EA] text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition"
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
              <label className="block text-xs font-medium text-gray-500 mb-2 tracking-wide">New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-xl border border-[#E2E4EA] bg-[#FAFAFA] px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                placeholder="••••••••••••"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2 tracking-wide">Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-xl border border-[#E2E4EA] bg-[#FAFAFA] px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                placeholder="••••••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={resetting}
              className="w-full py-3 rounded-xl bg-[#2B2D42] text-white text-sm font-medium hover:bg-[#1a1c2e] disabled:opacity-60 transition flex justify-center items-center gap-2"
            >
              {resetting ? (
                <>
                  <Loader className="size-4 animate-spin" />
                  Updating…
                </>
              ) : (
                "Update password"
              )}
            </button>
          </form>
        </div>
      </div>

      <div className="hidden md:block flex-1 relative overflow-hidden">
        <img src={CampusLoginImg} alt="Campus" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-slate-900/10" />
      </div>
    </div>
  );
};

export default HackathonForgotPassword;
