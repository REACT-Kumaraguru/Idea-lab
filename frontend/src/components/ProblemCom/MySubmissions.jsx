import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { pdf } from "@react-pdf/renderer";
import { FileText, Download, Loader2, AlertCircle, CheckCircle, XCircle, Clock } from "lucide-react";
import Navbar from "../Navbar";
import ProblemStatementPDF from "./ProblemStatementPDF";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-hot-toast";

const statusConfig = {
  pending: {
    label: "Pending Review",
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

export default function MySubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axiosInstance.get("/problems/my-submissions");
      if (res.data?.success && Array.isArray(res.data.data)) {
        setSubmissions(res.data.data);
      } else {
        setSubmissions([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load submissions");
      setSubmissions([]);
      toast.error("Could not load your submissions");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (submission) => {
    setDownloadingId(submission.id);
    try {
      const blob = await pdf(
        <ProblemStatementPDF data={submission} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Problem-Statement-${submission.problemTitle?.replace(/\s+/g, "-").slice(0, 40) || submission.id}.pdf`;
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Submissions</h1>
          <p className="text-gray-600 mt-1">
            View your problem statements and download them as PDF.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600">Loading your submissions...</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <FileText className="w-14 h-14 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-800 mb-2">No submissions yet</h2>
            <p className="text-gray-600 mb-6 max-w-sm mx-auto">
              Submit a problem statement from the Upload Problem page to see it here.
            </p>
            <Link
              to="/upload-problem"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700"
            >
              Upload Problem
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {submissions.map((sub) => {
              const config = statusConfig[sub.status] || statusConfig.pending;
              const Icon = config.icon;
              return (
                <li
                  key={sub.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-semibold text-gray-900 truncate pr-2">
                          {sub.problemTitle || "Untitled Problem Statement"}
                        </h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {sub.organisationName} · {sub.organisationType}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Submitted {formatDate(sub.createdAt)}
                          {sub.reviewedAt && (
                            <> · Reviewed {formatDate(sub.reviewedAt)}</>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border ${config.bg} ${config.text} ${config.border}`}
                        >
                          <Icon className="w-4 h-4" />
                          {config.label}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDownloadPDF(sub)}
                          disabled={downloadingId === sub.id}
                          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {downloadingId === sub.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                          Download PDF
                        </button>
                      </div>
                    </div>
                    {sub.adminNotes && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                          Admin notes
                        </p>
                        <p className="text-sm text-gray-700">{sub.adminNotes}</p>
                      </div>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
                      <span>{sub.sectorCategory && `Sector: ${sub.sectorCategory}`}</span>
                      <span>{sub.geographicContext && `· ${sub.geographicContext}`}</span>
                      {Array.isArray(sub.relevantSDGs) && sub.relevantSDGs.length > 0 && (
                        <span>· SDGs: {sub.relevantSDGs.slice(0, 3).join(", ")}{sub.relevantSDGs.length > 3 ? "…" : ""}</span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
