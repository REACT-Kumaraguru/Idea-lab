import React, { useState, useEffect } from "react";
import { pdf } from "@react-pdf/renderer";
import {
  FileText,
  Download,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Check,
  X,
  RefreshCw,
} from "lucide-react";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-hot-toast";
import ProblemStatementPDF from "../ProblemCom/ProblemStatementPDF";
import AmbientBackground from "../AmbientBackground";

const statusConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    bg: "bg-amber-500/10",
    text: "text-amber-300",
    border: "border-amber-500/30",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle,
    bg: "bg-emerald-500/10",
    text: "text-emerald-300",
    border: "border-emerald-500/30",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    bg: "bg-rose-500/10",
    text: "text-rose-300",
    border: "border-rose-500/30",
  },
  draft: {
    label: "Draft",
    icon: FileText,
    bg: "bg-stone-900",
    text: "text-stone-400",
    border: "border-amber-500/20",
  },
};

export default function ProblemStatements() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [downloadingId, setDownloadingId] = useState(null);
  const [actionModal, setActionModal] = useState(null); // { id, action: 'approved'|'rejected', adminNotes: '', confirmationText: '' }

  useEffect(() => {
    fetchList();
  }, [statusFilter]);

  const fetchList = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== "all" ? { status: statusFilter } : {};
      const res = await axiosInstance.get("/problems/admin/all", { params });
      if (res.data?.success && Array.isArray(res.data.data)) {
        setList(res.data.data);
      } else {
        setList([]);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load problem statements");
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!actionModal) return;
    const required = actionModal.action === "approved" ? "APPROVE" : "REJECT";
    if (actionModal.confirmationText?.trim().toUpperCase() !== required) return;
    try {
      await axiosInstance.put(`/problems/admin/${actionModal.id}/status`, {
        status: actionModal.action,
        adminNotes: actionModal.adminNotes || undefined,
      });
      toast.success(`Submission ${actionModal.action === "approved" ? "approved" : "rejected"}`);
      setActionModal(null);
      fetchList();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const confirmationRequired = actionModal?.action === "approved" ? "APPROVE" : "REJECT";
  const isConfirmationValid =
    actionModal?.confirmationText?.trim().toUpperCase() === confirmationRequired;

  const handleDownloadPDF = async (row) => {
    setDownloadingId(row.id);
    try {
      const blob = await pdf(<ProblemStatementPDF data={row} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Problem-Statement-${(row.problemTitle || row.id).toString().replace(/\s+/g, "-").slice(0, 40)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate PDF");
    } finally {
      setDownloadingId(null);
    }
  };

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const filteredList = list.filter((item) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (item.problemTitle || "").toLowerCase().includes(term) ||
      (item.organisationName || "").toLowerCase().includes(term) ||
      (item.primaryContactName || "").toLowerCase().includes(term) ||
      (item.contactEmail || "").toLowerCase().includes(term)
    );
  });

  const stats = {
    total: list.length,
    pending: list.filter((r) => r.status === "pending").length,
    approved: list.filter((r) => r.status === "approved").length,
    rejected: list.filter((r) => r.status === "rejected").length,
  };

  return (
    <div className="min-h-screen bg-[#0a0809] text-stone-100 font-sans relative overflow-x-hidden p-6 md:p-8">
      <AmbientBackground height="fixed inset-0" />

      <div className="relative z-10 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl text-stone-100 uppercase tracking-widest font-normal">Submitted Problem Statements</h1>
            <p className="text-xs font-dancing text-amber-200/90 mt-1">Review industrial challenge proposals, verify details, and export PDF specifications</p>
          </div>
          <button
            type="button"
            onClick={fetchList}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-900/80 border border-amber-500/30 rounded-xl text-xs font-sans uppercase font-bold tracking-wider text-amber-300 hover:bg-amber-400/10 transition disabled:opacity-60 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-amber-400 ${loading ? "animate-spin" : ""}`} />
            Refresh List
          </button>
        </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-sans text-xs">
        <div
          onClick={() => setStatusFilter("all")}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === "all"
              ? "border-amber-400 bg-amber-400/10 text-amber-300 shadow-lg"
              : "border-amber-500/20 bg-stone-900/80 text-stone-300 hover:border-amber-500/40"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-400/10 border border-amber-400/20">
              <FileText className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-stone-100">{stats.total}</p>
              <p className="text-[11px] uppercase tracking-wider font-bold text-stone-400">Total</p>
            </div>
          </div>
        </div>
        <div
          onClick={() => setStatusFilter("pending")}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === "pending"
              ? "border-amber-400 bg-amber-400/10 text-amber-300 shadow-lg"
              : "border-amber-500/20 bg-stone-900/80 text-stone-300 hover:border-amber-500/40"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-400/10 border border-amber-400/20">
              <Clock className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-amber-300">{stats.pending}</p>
              <p className="text-[11px] uppercase tracking-wider font-bold text-stone-400">Pending</p>
            </div>
          </div>
        </div>
        <div
          onClick={() => setStatusFilter("approved")}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === "approved"
              ? "border-emerald-400 bg-emerald-400/10 text-emerald-300 shadow-lg"
              : "border-amber-500/20 bg-stone-900/80 text-stone-300 hover:border-amber-500/40"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-emerald-300">{stats.approved}</p>
              <p className="text-[11px] uppercase tracking-wider font-bold text-stone-400">Approved</p>
            </div>
          </div>
        </div>
        <div
          onClick={() => setStatusFilter("rejected")}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === "rejected"
              ? "border-rose-400 bg-rose-400/10 text-rose-300 shadow-lg"
              : "border-amber-500/20 bg-stone-900/80 text-stone-300 hover:border-amber-500/40"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <XCircle className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-rose-300">{stats.rejected}</p>
              <p className="text-[11px] uppercase tracking-wider font-bold text-stone-400">Rejected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="serene-glass-card p-4 rounded-2xl border border-amber-500/20 shadow-xl">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/70" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, organisation, contact..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-amber-500/30 bg-stone-900/80 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400 font-sans"
          />
        </div>
      </div>

      {/* Table */}
      <div className="serene-glass-card border border-amber-500/25 rounded-3xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-10 h-10 text-amber-400 animate-spin mb-4" />
            <p className="text-stone-400 text-xs font-sans uppercase tracking-widest font-bold">Loading Proposals...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="py-16 text-center text-stone-400">
            <FileText className="w-12 h-12 mx-auto mb-3 text-amber-400/40" />
            <p className="text-xs uppercase tracking-wider font-bold">No problem statements found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs">
              <thead>
                <tr className="border-b border-amber-500/20 text-stone-400 uppercase tracking-wider font-bold">
                  <th className="py-4 px-6">#</th>
                  <th className="py-4 px-6">Title</th>
                  <th className="py-4 px-6">Organisation</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Submitted</th>
                  <th className="py-4 px-6">Reviewed</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-500/10">
                {filteredList.map((row, index) => {
                  const config = statusConfig[row.status] || statusConfig.pending;
                  const Icon = config.icon;
                  return (
                    <tr
                      key={row.id}
                      className="hover:bg-amber-400/5 transition"
                    >
                      <td className="py-4 px-6 font-mono text-stone-400">{index + 1}</td>
                      <td className="py-4 px-6 font-serif text-sm text-stone-100 uppercase tracking-wide max-w-[200px] truncate">
                        {row.problemTitle || "—"}
                      </td>
                      <td className="py-4 px-6 text-stone-300 max-w-[160px] truncate">
                        {row.organisationName || "—"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${config.bg} ${config.text} ${config.border}`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {config.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{formatDate(row.createdAt)}</td>
                      <td className="py-3 px-4 text-gray-600">{formatDate(row.reviewedAt)}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {row.status === "pending" && (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  setActionModal({
                                    id: row.id,
                                    action: "approved",
                                    adminNotes: "",
                                    confirmationText: "",
                                  })
                                }
                                className="p-2 rounded-lg text-green-600 hover:bg-green-50"
                                title="Approve"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setActionModal({
                                    id: row.id,
                                    action: "rejected",
                                    adminNotes: "",
                                    confirmationText: "",
                                  })
                                }
                                className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                                title="Reject"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDownloadPDF(row)}
                            disabled={downloadingId === row.id}
                            className="p-2 rounded-lg text-teal-600 hover:bg-teal-50 disabled:opacity-60"
                            title="Download PDF"
                          >
                            {downloadingId === row.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Approve/Reject modal - admin must type APPROVE or REJECT to confirm */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {actionModal.action === "approved" ? "Approve" : "Reject"} submission
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Type <strong className="font-mono">{confirmationRequired}</strong> below to confirm, then update.
            </p>
            <input
              type="text"
              value={actionModal.confirmationText}
              onChange={(e) =>
                setActionModal((prev) => ({ ...prev, confirmationText: e.target.value }))
              }
              placeholder={`Type ${confirmationRequired} here`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 placeholder-gray-400"
            />
            <p className="text-sm text-gray-600 mt-4 mb-2">
              Optional: Add notes for the submitter (e.g. reason for rejection or next steps).
            </p>
            <textarea
              value={actionModal.adminNotes}
              onChange={(e) =>
                setActionModal((prev) => ({ ...prev, adminNotes: e.target.value }))
              }
              placeholder="Admin notes..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => setActionModal(null)}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateStatus}
                disabled={!isConfirmationValid}
                className={`flex-1 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed ${
                  actionModal.action === "approved"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {actionModal.action === "approved" ? "Approve" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
