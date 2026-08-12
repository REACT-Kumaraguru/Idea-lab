import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { pdf } from "@react-pdf/renderer";
import { FileText, Download, Loader2, AlertCircle, CheckCircle, XCircle, Clock } from "lucide-react";
import Navbar from "../Navbar";
import ProblemStatementPDF from "./ProblemStatementPDF";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-hot-toast";
import AmbientBackground from "../AmbientBackground";

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
    <div className="min-h-screen bg-[#0a0809] text-stone-100 font-sans selection:bg-amber-400 selection:text-stone-950 relative overflow-x-hidden">
      <AmbientBackground height="fixed inset-0" />
      <Navbar />
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="font-serif text-3xl sm:text-4xl text-stone-100 uppercase tracking-widest mb-1 font-normal">
            My Problem Submissions
          </h1>
          <p className="text-xs font-dancing text-amber-200/90">
            Industrial Challenge Verification & PDF Specifications
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-950/40 border border-rose-500/40 rounded-xl flex items-center gap-3 text-rose-200 text-xs font-sans">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-amber-400 animate-spin mb-4" />
            <p className="text-stone-400 font-sans text-xs uppercase tracking-widest font-semibold">Retrieving your problem specifications...</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="serene-glass-card rounded-3xl border border-amber-500/20 p-12 text-center max-w-lg mx-auto shadow-2xl">
            <FileText className="w-14 h-14 text-amber-400/40 mx-auto mb-4" />
            <h2 className="font-serif text-2xl text-stone-100 uppercase tracking-wide mb-2">No Submissions Recorded</h2>
            <p className="text-stone-400 font-sans text-xs font-light leading-relaxed mb-6">
              Submit an industrial problem statement from the specification portal to view and export it here.
            </p>
            <Link
              to="/upload-problem"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 px-6 py-3 rounded-full text-xs font-sans font-bold uppercase tracking-[0.15em] hover:brightness-110 shadow-lg"
            >
              Submit Problem Statement
            </Link>
          </div>
        ) : (
          <ul className="space-y-5">
            {submissions.map((sub) => {
              const config = statusConfig[sub.status] || statusConfig.pending;
              const Icon = config.icon;
              return (
                <li
                  key={sub.id}
                  className="serene-glass-card rounded-3xl border border-amber-500/20 overflow-hidden shadow-xl hover:border-amber-500/40 transition-all"
                >
                  <div className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h2 className="font-serif text-2xl text-stone-100 uppercase tracking-wide truncate pr-2 font-normal">
                          {sub.problemTitle || "Untitled Problem Statement"}
                        </h2>
                        <p className="text-xs font-dancing text-amber-200/90 mt-1">
                          {sub.organisationName} · {sub.organisationType}
                        </p>
                        <p className="text-[11px] font-sans text-stone-400 mt-2 font-light">
                          Submitted {formatDate(sub.createdAt)}
                          {sub.reviewedAt && (
                            <> · Reviewed {formatDate(sub.reviewedAt)}</>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0 font-sans text-xs">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                            sub.status === "approved"
                              ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/40"
                              : sub.status === "rejected"
                              ? "bg-rose-950/60 text-rose-300 border-rose-500/40"
                              : "bg-amber-950/60 text-amber-300 border-amber-500/40"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {config.label}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDownloadPDF(sub)}
                          disabled={downloadingId === sub.id}
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider hover:brightness-110 shadow-md disabled:opacity-60 cursor-pointer"
                        >
                          {downloadingId === sub.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                          Export PDF
                        </button>
                      </div>
                    </div>
                    {sub.adminNotes && (
                      <div className="mt-4 p-4 bg-stone-900/80 rounded-2xl border border-amber-500/15">
                        <p className="text-[10px] font-sans font-bold text-amber-300 uppercase tracking-widest mb-1">
                          Admin Review Feedback
                        </p>
                        <p className="text-xs font-sans text-stone-300 font-light">{sub.adminNotes}</p>
                      </div>
                    )}
                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-sans text-stone-400 font-light">
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
