import React, { useEffect, useMemo, useState } from "react";
import { axiosInstance } from "../../lib/axios.js";
import { handleDownloadPaymentsPDF } from "../../lib/hackathonDownloadStudentsPdf.js";
import { useLocation } from "react-router-dom";

const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
};

const HackathonAdminPaymentDetails = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const hackathonId = searchParams.get("hackathonId") || "";

  const [rows, setRows] = useState([]);
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [exporting, setExporting] = useState(false);

  const fetchRows = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (hackathonId) params.hackathonId = hackathonId;
      if (search.trim()) params.q = search.trim();
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const [res, hRes] = await Promise.all([
        axiosInstance.get("/ich2026/admin/payment-details", { params }),
        axiosInstance.get("/ich2026/admin/hackathons"),
      ]);
      setRows(res.data?.paymentDetails || []);
      setHackathons(hRes.data?.hackathons || []);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load payment details");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hackathonId]);

  const currentHackathonName = useMemo(() => {
    if (!hackathonId) return "All Hackathons";
    const found = hackathons.find((h) => Number(h.id) === Number(hackathonId));
    return found?.name || "All Hackathons";
  }, [hackathons, hackathonId]);

  const verify = async (id) => {
    try {
      await axiosInstance.post(`/ich2026/admin/payment-details/${id}/verify`);
      setRows((prev) =>
        prev.map((r) =>
          Number(r.id) === Number(id)
            ? { ...r, status: "verified", verifiedAt: new Date().toISOString() }
            : r
        )
      );
    } catch (e) {
      setError(e.response?.data?.message || "Failed to verify payment");
    }
  };

  const downloadExcel = async () => {
    setExporting(true);
    try {
      const query = hackathonId ? `?hackathonId=${hackathonId}` : "";
      const res = await axiosInstance.get(`/ich2026/admin/payment-details/export-xlsx${query}`, {
        responseType: "blob",
      });
      const dateStr = new Date().toISOString().slice(0, 10);
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      const cleanTitle = currentHackathonName.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
      a.download = `payment_details_${cleanTitle}_${dateStr}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to export Excel");
    } finally {
      setExporting(false);
    }
  };

  const total = useMemo(() => rows.length, [rows]);

  return (
    <div className="space-y-6 font-sans text-stone-100">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-serif text-3xl text-stone-100 uppercase tracking-widest font-normal">Payment Records</h2>
          <div className="text-xs font-sans font-bold uppercase tracking-widest text-amber-300 mt-1">
            Event: {currentHackathonName}
          </div>
          <p className="text-xs font-dancing text-amber-200/90 mt-1">Review team registration fee payments and transaction verification</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void downloadExcel()}
            disabled={exporting}
            className="shrink-0 rounded-xl border border-amber-500/30 bg-stone-900/80 px-4 py-2.5 text-xs font-sans uppercase font-bold tracking-wider text-amber-300 shadow-lg hover:bg-amber-400/10 transition disabled:opacity-60 cursor-pointer"
          >
            {exporting ? "Exporting..." : "Download Excel"}
          </button>
          <button
            type="button"
            onClick={() => handleDownloadPaymentsPDF(rows, currentHackathonName)}
            className="shrink-0 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 px-4 py-2.5 text-xs font-sans uppercase font-bold tracking-wider text-stone-950 shadow-lg hover:brightness-110 transition cursor-pointer"
          >
            Download PDF
          </button>
        </div>
      </div>

      <div className="serene-glass-card rounded-2xl border border-amber-500/20 p-4 grid sm:grid-cols-4 gap-3">
        <input
          placeholder="Search by team name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:col-span-2 rounded-xl border border-amber-500/30 bg-stone-900/80 px-3.5 py-2 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400 font-sans"
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="rounded-xl border border-amber-500/30 bg-stone-900/80 px-3.5 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-400 font-sans"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="rounded-xl border border-amber-500/30 bg-stone-900/80 px-3.5 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-400 font-sans"
        />
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => void fetchRows()}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 text-xs font-sans uppercase font-bold tracking-wider hover:brightness-110 shadow-lg cursor-pointer transition"
        >
          Apply Filters
        </button>
        <div className="px-3 py-1.5 text-xs font-sans uppercase font-bold text-amber-300 bg-amber-400/10 border border-amber-400/30 rounded-full">
          Total: {total} records
        </div>
      </div>

      {error ? <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200">{error}</div> : null}

      {loading ? (
        <div className="text-stone-400 font-sans text-xs uppercase tracking-widest">Loading payment records...</div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <div className="serene-glass-card rounded-3xl border border-amber-500/25 p-4 shadow-2xl">
            <table className="min-w-full text-xs font-sans">
              <thead className="bg-stone-900/90 text-amber-300 font-serif uppercase tracking-wider border-b border-amber-500/20">
                <tr>
                  <th className="text-left px-3.5 py-3">Team Name</th>
                  <th className="text-left px-3.5 py-3">Payment Email</th>
                  <th className="text-left px-3.5 py-3">Paid Person Name</th>
                  <th className="text-left px-3.5 py-3">Phone</th>
                  <th className="text-left px-3.5 py-3">Payment ID</th>
                  <th className="text-left px-3.5 py-3">Status</th>
                  <th className="text-left px-3.5 py-3">Date</th>
                  <th className="text-left px-3.5 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-500/10 text-stone-300">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-amber-400/5 transition">
                    <td className="px-3.5 py-3 font-serif uppercase text-stone-100 font-medium">{r.team?.teamName || "—"}</td>
                    <td className="px-3.5 py-3 font-mono text-stone-300">{r.paymentEmail}</td>
                    <td className="px-3.5 py-3 font-medium text-stone-100">{r.paidPersonName}</td>
                    <td className="px-3.5 py-3 font-mono text-stone-400">{r.phone}</td>
                    <td className="px-3.5 py-3 font-mono text-amber-300">{r.paymentId}</td>
                    <td className="px-3.5 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        r.status === "verified"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : "bg-amber-400/20 text-amber-300 border-amber-400/30"
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-3.5 py-3 text-stone-400 text-[11px]">{formatDate(r.createdAt || r.created_at)}</td>
                    <td className="px-3.5 py-3">
                      <button
                        type="button"
                        disabled={r.status === "verified"}
                        onClick={() => void verify(r.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase hover:bg-emerald-500/30 disabled:opacity-50 transition cursor-pointer"
                      >
                        {r.status === "verified" ? "Verified ✓" : "Mark Verified"}
                      </button>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-stone-500">
                      No payment records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default HackathonAdminPaymentDetails;
