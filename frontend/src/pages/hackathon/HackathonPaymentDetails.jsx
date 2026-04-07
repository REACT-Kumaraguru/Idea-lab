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

  if (loading) return <div className="text-gray-600">Loading...</div>;

  if (accessDeniedMessage) {
    return (
      <div className="max-w-2xl">
        <h2 className="text-2xl font-bold text-gray-900">Payment Details</h2>
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
          {accessDeniedMessage}
        </div>
        <button
          type="button"
          className="mt-4 px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-800 font-semibold hover:bg-gray-50"
          onClick={() => navigate("/ich2026/dashboard")}
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold text-gray-900">Payment Details</h2>
      <p className="mt-1 text-gray-600">Submit your team payment details (one submission per team).</p>

      {existing?.id ? (
        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 text-green-900">
          Payment details already submitted for team <strong>{team?.teamName}</strong>. Status:{" "}
          <strong>{existing.status}</strong>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-5 rounded-2xl border border-[#E2E8F0] bg-white p-5 space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-800">Team Name</label>
            <input
              value={team?.teamName || ""}
              readOnly
              className="mt-2 w-full rounded-xl border border-[#E2E8F0] bg-gray-50 px-3 py-2 text-gray-700"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-800">Payment Email ID</label>
            <input
              type="email"
              required
              value={paymentEmail}
              onChange={(e) => setPaymentEmail(e.target.value)}
              className="mt-2 w-full rounded-xl border border-[#E2E8F0] px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-800">Paid Person Name</label>
            <input
              required
              value={paidPersonName}
              onChange={(e) => setPaidPersonName(e.target.value)}
              className="mt-2 w-full rounded-xl border border-[#E2E8F0] px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-800">Phone Number</label>
            <input
              required
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              className="mt-2 w-full rounded-xl border border-[#E2E8F0] px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-800">Payment ID / Transaction ID</label>
            <input
              required
              value={paymentId}
              onChange={(e) => setPaymentId(e.target.value)}
              className="mt-2 w-full rounded-xl border border-[#E2E8F0] px-3 py-2"
            />
          </div>

          {error ? <div className="text-sm font-medium text-red-600">{error}</div> : null}
          {success ? <div className="text-sm font-medium text-green-700">{success}</div> : null}

          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </form>
      )}
    </div>
  );
};

export default HackathonPaymentDetails;
