import React, { useEffect, useMemo, useState } from "react";
import { axiosInstance } from "../../lib/axios.js";

const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
};

const HackathonAdminPaymentDetails = () => {
  const [rows, setRows] = useState([]);
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
      if (search.trim()) params.q = search.trim();
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await axiosInstance.get("/ich2026/admin/payment-details", { params });
      setRows(res.data?.paymentDetails || []);
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
  }, []);

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
      const res = await axiosInstance.get("/ich2026/admin/payment-details/export-xlsx", {
        responseType: "blob",
      });
      const dateStr = new Date().toISOString().slice(0, 10);
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `payment_details_${dateStr}.xlsx`;
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
    <div>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payment Details</h2>
          <p className="text-gray-600 mt-1">Review payment submissions and mark verified records.</p>
        </div>
        <button
          type="button"
          onClick={() => void downloadExcel()}
          disabled={exporting}
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60"
        >
          {exporting ? "Exporting..." : "Export to Excel"}
        </button>
      </div>

      <div className="mt-4 grid sm:grid-cols-4 gap-3">
        <input
          placeholder="Search by team name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:col-span-2 rounded-xl border border-[#E2E8F0] px-3 py-2"
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="rounded-xl border border-[#E2E8F0] px-3 py-2"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="rounded-xl border border-[#E2E8F0] px-3 py-2"
        />
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => void fetchRows()}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
        >
          Apply Filters
        </button>
        <div className="px-3 py-2 text-sm text-gray-600">Total: {total}</div>
      </div>

      {error ? <div className="mt-3 text-sm font-medium text-red-600">{error}</div> : null}

      {loading ? (
        <div className="mt-4 text-gray-600">Loading...</div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full border border-[#E2E8F0] rounded-xl overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-700 px-3 py-2">Team Name</th>
                <th className="text-left text-xs font-semibold text-gray-700 px-3 py-2">Payment Email</th>
                <th className="text-left text-xs font-semibold text-gray-700 px-3 py-2">Paid Person Name</th>
                <th className="text-left text-xs font-semibold text-gray-700 px-3 py-2">Phone</th>
                <th className="text-left text-xs font-semibold text-gray-700 px-3 py-2">Payment ID</th>
                <th className="text-left text-xs font-semibold text-gray-700 px-3 py-2">Status</th>
                <th className="text-left text-xs font-semibold text-gray-700 px-3 py-2">Date</th>
                <th className="text-left text-xs font-semibold text-gray-700 px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-[#E2E8F0]">
                  <td className="px-3 py-2 text-sm">{r.team?.teamName || "—"}</td>
                  <td className="px-3 py-2 text-sm">{r.paymentEmail}</td>
                  <td className="px-3 py-2 text-sm">{r.paidPersonName}</td>
                  <td className="px-3 py-2 text-sm">{r.phone}</td>
                  <td className="px-3 py-2 text-sm">{r.paymentId}</td>
                  <td className="px-3 py-2 text-sm font-semibold">{r.status}</td>
                  <td className="px-3 py-2 text-sm">{formatDate(r.createdAt || r.created_at)}</td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      disabled={r.status === "verified"}
                      onClick={() => void verify(r.id)}
                      className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 disabled:opacity-60"
                    >
                      {r.status === "verified" ? "Verified" : "Mark Verified"}
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-5 text-sm text-gray-600 text-center">
                    No payment records found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HackathonAdminPaymentDetails;
