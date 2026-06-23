import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { axiosInstance } from "../../lib/axios.js";
import Arduino from "../../assets/arduino mega.webp";

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
        <div className="flex items-center justify-center">
          <img src={Arduino} alt="Arduino" className="max-w-full h-auto" />
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 text-center mb-3">Forgot password</h1>
            <p className="text-center text-gray-600">
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                Back to login
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
