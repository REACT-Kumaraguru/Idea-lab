import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../../lib/axios.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\d{10}$/;

const HackathonPaymentDetails = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState(null);
  const [existing, setExisting] = useState(null);
  const [error, setError] = useState("");
  const [accessDeniedMessage, setAccessDeniedMessage] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [paymentEmail, setPaymentEmail] = useState("");
  const [paidPersonName, setPaidPersonName] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentId, setPaymentId] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await axiosInstance.get("/ich2026/payment-details");
        if (!active) return;
        const teamData = res.data?.team || null;
        const paymentData = res.data?.paymentDetail || null;
        setTeam(teamData);
        setExisting(paymentData);

      } catch (e) {
        if (!active) return;
        const msg = e.response?.data?.message || "Failed to load payment details";
        setError(msg);
        if (e.response?.status === 403) setAccessDeniedMessage(msg);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!paymentEmail || !paidPersonName || !phone || !paymentId) {
      setError("All fields are required");
      return;
    }
    if (!emailRegex.test(paymentEmail.trim())) {
      setError("Please enter a valid payment email");
      return;
    }
    if (!phoneRegex.test(phone.trim())) {
      setError("Phone number must be 10 digits");
      return;
    }

    setSubmitting(true);
    try {
      const res = await axiosInstance.post("/ich2026/payment-details", {
        paymentEmail: paymentEmail.trim(),
        paidPersonName: paidPersonName.trim(),
        phone: phone.trim(),
        paymentId: paymentId.trim(),
      });
      setExisting(res.data?.paymentDetail || {});
      setSuccess("Payment details submitted successfully");
    } catch (e) {
      setError(e.response?.data?.message || "Failed to submit payment details");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-stone-400 font-sans text-xs uppercase tracking-widest">Loading payment details...</div>;

  if (accessDeniedMessage) {
    return (
      <div className="max-w-2xl font-sans text-stone-100 space-y-4">
        <h2 className="font-serif text-3xl text-stone-100 uppercase tracking-widest font-normal">Payment Details</h2>
        <div className="rounded-3xl border border-amber-500/30 bg-amber-400/10 p-6 text-xs text-amber-200 space-y-3">
          <div className="font-bold text-amber-300 font-serif text-base uppercase tracking-wider">
            🔒 Payment Locked — Action Required
          </div>
          <p className="text-stone-300 font-sans leading-relaxed">
            {accessDeniedMessage}
          </p>
          <div className="pt-2 border-t border-amber-500/20 space-y-2">
            <div className="font-bold text-stone-100 uppercase tracking-wider text-[11px]">To unlock payment details:</div>
            <div className="flex items-center gap-2 text-stone-300">
              <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center font-mono font-bold text-[10px]">1</span>
              <span>Submit your project / PoC under the <strong className="text-amber-300 uppercase">SUBMIT</strong> tab on your dashboard.</span>
            </div>
            <div className="flex items-center gap-2 text-stone-300">
              <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center font-mono font-bold text-[10px]">2</span>
              <span>Wait for your Faculty Mentor to review and click <strong className="text-emerald-400 uppercase">MENTOR APPROVE ✓</strong> on your submission.</span>
            </div>
          </div>
        </div>
        <button
          type="button"
          className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs uppercase font-extrabold tracking-wider transition shadow-lg border border-amber-300 cursor-pointer"
          onClick={() => navigate("/Hackathon/dashboard")}
        >
          ← Go to Dashboard & Submit Project
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl font-sans text-stone-100 space-y-6">
      <div>
        <h2 className="font-serif text-3xl text-stone-100 uppercase tracking-widest font-normal">Payment Details</h2>
        <p className="text-xs font-dancing text-amber-200/90 mt-1">Submit your team payment details (one submission per team).</p>
      </div>

      {existing?.id ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-xs text-emerald-300 space-y-1">
          Payment details already submitted for team <strong className="text-stone-100">{team?.teamName}</strong>. Status:{" "}
          <strong className="text-emerald-400 uppercase tracking-wider">{existing.status}</strong>
        </div>
      ) : (
        <form onSubmit={submit} className="serene-glass-card rounded-3xl border border-amber-500/25 p-6 md:p-8 shadow-2xl space-y-5 text-stone-100">
          <div>
            <label className="block text-xs font-serif uppercase tracking-wider text-amber-300 mb-1.5 font-normal">Team Name</label>
            <input
              value={team?.teamName || ""}
              readOnly
              className="w-full rounded-xl border border-amber-500/20 bg-stone-950/80 px-3.5 py-2.5 text-xs text-stone-300 font-serif uppercase tracking-wide focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-serif uppercase tracking-wider text-amber-300 mb-1.5 font-normal">Payment Email ID *</label>
            <input
              type="email"
              required
              placeholder="e.g. team.lead@example.com"
              value={paymentEmail}
              onChange={(e) => setPaymentEmail(e.target.value)}
              className="w-full rounded-xl border border-amber-500/30 bg-stone-900/90 px-3.5 py-2.5 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400 font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-serif uppercase tracking-wider text-amber-300 mb-1.5 font-normal">Paid Person Name *</label>
            <input
              required
              placeholder="Full name of person who completed payment"
              value={paidPersonName}
              onChange={(e) => setPaidPersonName(e.target.value)}
              className="w-full rounded-xl border border-amber-500/30 bg-stone-900/90 px-3.5 py-2.5 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400 font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-serif uppercase tracking-wider text-amber-300 mb-1.5 font-normal">Phone Number *</label>
            <input
              required
              maxLength={10}
              placeholder="10-digit mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              className="w-full rounded-xl border border-amber-500/30 bg-stone-900/90 px-3.5 py-2.5 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-serif uppercase tracking-wider text-amber-300 mb-1.5 font-normal">Payment ID / Transaction ID *</label>
            <input
              required
              placeholder="e.g. PAY-98213840921"
              value={paymentId}
              onChange={(e) => setPaymentId(e.target.value)}
              className="w-full rounded-xl border border-amber-500/30 bg-stone-900/90 px-3.5 py-2.5 text-xs text-amber-300 placeholder-stone-600 focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>

          {error ? <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200">{error}</div> : null}
          {success ? <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300">{success}</div> : null}

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold uppercase text-xs tracking-wider disabled:opacity-60 transition shadow-lg cursor-pointer border border-amber-300"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </form>
      )}
    </div>
  );
};

export default HackathonPaymentDetails;
