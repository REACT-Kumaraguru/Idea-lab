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

const statusConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle,
    bg: "bg-green-50",
    text: "text-green-800",
    border: "border-green-200",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    bg: "bg-red-50",
    text: "text-red-800",
    border: "border-red-200",
  },
  draft: {
    label: "Draft",
    icon: FileText,
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-200",
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Problem Statements</h1>
          <p className="text-gray-600 text-sm mt-0.5">
            Review submissions and download as PDF
          </p>
        </div>
        <button
          type="button"
          onClick={fetchList}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          onClick={() => setStatusFilter("all")}
          className={`p-4 rounded-xl border-2 cursor-pointer transition-colors ${statusFilter === "all" ? "border-teal-600 bg-teal-50" : "border-gray-200 bg-white hover:border-gray-300"}`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-100">
              <FileText className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </div>
        </div>
        <div
          onClick={() => setStatusFilter("pending")}
          className={`p-4 rounded-xl border-2 cursor-pointer transition-colors ${statusFilter === "pending" ? "border-amber-500 bg-amber-50" : "border-gray-200 bg-white hover:border-gray-300"}`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100">
              <Clock className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-xs text-gray-500">Pending</p>
            </div>
          </div>
        </div>
        <div
          onClick={() => setStatusFilter("approved")}
          className={`p-4 rounded-xl border-2 cursor-pointer transition-colors ${statusFilter === "approved" ? "border-green-500 bg-green-50" : "border-gray-200 bg-white hover:border-gray-300"}`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <CheckCircle className="w-5 h-5 text-green-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              <p className="text-xs text-gray-500">Approved</p>
            </div>
          </div>
        </div>
        <div
          onClick={() => setStatusFilter("rejected")}
          className={`p-4 rounded-xl border-2 cursor-pointer transition-colors ${statusFilter === "rejected" ? "border-red-500 bg-red-50" : "border-gray-200 bg-white hover:border-gray-300"}`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100">
              <XCircle className="w-5 h-5 text-red-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              <p className="text-xs text-gray-500">Rejected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by title, organisation, contact..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-10 h-10 text-teal-600 animate-spin mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No problem statements found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">#</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Title</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Organisation</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Submitted</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Reviewed</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((row, index) => {
                  const config = statusConfig[row.status] || statusConfig.pending;
                  const Icon = config.icon;
                  return (
                    <tr
                      key={row.id}
                      className="border-b border-gray-100 hover:bg-gray-50/50"
                    >
                      <td className="py-3 px-4 text-gray-500">{index + 1}</td>
                      <td className="py-3 px-4 font-medium text-gray-900 max-w-[200px] truncate">
                        {row.problemTitle || "—"}
                      </td>
                      <td className="py-3 px-4 text-gray-700 max-w-[160px] truncate">
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
  );
}
