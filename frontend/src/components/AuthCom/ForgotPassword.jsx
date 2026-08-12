import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import { axiosInstance } from "../../lib/axios.js";
import Arduino from "../../assets/arduino mega.webp";
import AmbientBackground from "../AmbientBackground";

const OTP_LEN = 6;
const API = "/auth";

export const ForgotPassword = () => {
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
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not reset password");
    } finally {
      setResetting(false);
    }
  };

  const handleGoBack = (e) => {
    if (e) e.preventDefault();
    if (window.history.state && typeof window.history.state.idx === "number" && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0809] text-stone-100 flex items-center justify-center p-6 relative font-sans selection:bg-amber-400 selection:text-stone-950 overflow-hidden">
      <AmbientBackground height="h-full inset-0" />

      {/* Top Left Navigation - Go Back Button */}
      <div className="absolute top-6 left-6 z-30">
        <Link
          to="/login"
          onClick={(e) => {
            if (window.history.state && typeof window.history.state.idx === "number" && window.history.state.idx > 0) {
              e.preventDefault();
              navigate(-1);
            }
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/30 bg-stone-900/80 text-xs font-sans uppercase font-bold tracking-widest text-stone-300 hover:text-amber-300 hover:border-amber-400/60 hover:bg-stone-900 transition-all shadow-xl backdrop-blur-md cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" />
          <span>Go Back</span>
        </Link>
      </div>

      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10 py-8">
        <Link to="/" className="flex flex-col items-center justify-center text-center p-4 group cursor-pointer">
          <img
            src={Arduino}
            alt="Arduino Mega"
            className="w-72 sm:w-96 md:w-[400px] lg:w-[440px] max-w-full h-auto mb-6 filter drop-shadow-[0_20px_50px_rgba(245,158,11,0.35)] group-hover:scale-105 transition-transform duration-500"
          />
          <h2 className="font-serif text-3xl lg:text-4xl text-stone-100 uppercase tracking-widest mb-1 font-normal group-hover:text-amber-300 transition-colors">AICTE IDEA LAB</h2>
          <p className="font-dancing text-amber-200 text-xl">Sanctuary of Innovation</p>
        </Link>

        <div className="serene-glass-card rounded-3xl border border-amber-500/30 p-8 md:p-10 shadow-2xl">
          <div className="mb-6 text-center">
            <h1 className="font-serif text-4xl text-stone-100 uppercase tracking-wider mb-2 font-normal">Password Recovery</h1>
            <p className="text-xs font-sans text-stone-400">
              Remembered your credentials?{" "}
              <Link to="/login" className="text-amber-300 font-bold uppercase tracking-wider hover:text-amber-200">
                Back to Login
              </Link>
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!otpSent && !otpVerified) void handleSendOtp();
            }}
            className="space-y-6"
          >
            <div>
              <label htmlFor="forgot-email" className="block text-sm font-semibold text-gray-900 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="forgot-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={otpVerified}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition border-gray-300 disabled:bg-gray-50"
                placeholder="Enter your email"
              />
            </div>

            {!otpSent && (
              <button
                type="submit"
                disabled={busy}
                className="w-full bg-blue-500 text-white py-3.5 rounded-lg font-semibold hover:bg-blue-600 transition duration-200 shadow-md flex justify-center items-center text-base disabled:opacity-60"
              >
                {sendingOtp ? (
                  <>
                    <Loader2 className="size-5 animate-spin mr-2" />
                    Sending…
                  </>
                ) : (
                  "Send OTP"
                )}
              </button>
            )}
          </form>

          <div className={`mt-6 space-y-4 ${otpSent && !otpVerified ? "" : "hidden"}`} aria-hidden={!(otpSent && !otpVerified)}>
            <p className="text-sm text-gray-600">Enter the 6-digit code sent to your email.</p>
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
                  className="w-full min-w-0 text-center text-lg font-semibold rounded-lg border border-gray-300 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60"
                />
              ))}
            </div>
            {otpError && <p className="text-sm text-red-500 font-medium">{otpError}</p>}
            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={busy || otpDigits.join("").length !== OTP_LEN}
              className="w-full bg-blue-500 text-white py-3.5 rounded-lg font-semibold hover:bg-blue-600 transition disabled:opacity-60 flex justify-center items-center gap-2"
            >
              {verifyingOtp ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
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
              className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 transition"
            >
              {sendingOtp ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
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
              <label htmlFor="new-password" className="block text-sm font-semibold text-gray-900 mb-2">
                New password
              </label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="New password"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-semibold text-gray-900 mb-2">
                Confirm password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Confirm password"
              />
            </div>
            <button
              type="submit"
              disabled={resetting}
              className="w-full bg-blue-500 text-white py-3.5 rounded-lg font-semibold hover:bg-blue-600 transition disabled:opacity-60 flex justify-center items-center gap-2"
            >
              {resetting ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Updating…
                </>
              ) : (
                "Update password"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
