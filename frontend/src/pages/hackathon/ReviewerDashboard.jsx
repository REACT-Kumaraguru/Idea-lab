import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../lib/axios.js";
import { CheckCircle2, AlertCircle, RefreshCw, Users, BookOpen, Shield, MessageSquare, Clock } from "lucide-react";

export default function ReviewerDashboard() {
  const [theme, setTheme] = useState("");
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [submittingId, setSubmittingId] = useState(null);
  const [feedbackModalTeam, setFeedbackModalTeam] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [msg, setMsg] = useState(null);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/ich2026/reviewer/teams");
      setTheme(res.data?.theme || "Assigned Theme");
      setTeams(res.data?.teams || []);
    } catch (err) {
      console.error("Failed to load reviewer teams:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleReview = async (teamId, action, customFeedback = null) => {
    setSubmittingId(teamId);
    setMsg(null);
    try {
      const res = await axiosInstance.post("/ich2026/reviewer/review-abstraction", {
        teamId,
        action,
        feedback: customFeedback !== null ? customFeedback : feedbackText,
      });
      setMsg({ type: "success", text: res.data?.message || "Review action recorded!" });
      setFeedbackModalTeam(null);
      setFeedbackText("");
      await fetchTeams();
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Failed to record review." });
    } finally {
      setSubmittingId(null);
    }
  };

  const filteredTeams = teams.filter((t) => {
    if (filterStatus === "pending") return t.abstractionStatus === "submitted";
    if (filterStatus === "approved") return t.abstractionStatus === "approved";
    if (filterStatus === "needs_revision") return t.abstractionStatus === "needs_revision";
    return true;
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 font-sans text-stone-100 pb-12">
      {/* Header Banner */}
      <div className="serene-glass-card rounded-3xl border border-amber-500/25 p-6 sm:p-8 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-amber-400" />
            <h2 className="font-serif text-3xl uppercase tracking-wider text-stone-100 font-normal">
              Reviewer Evaluation Workspace
            </h2>
          </div>
          <p className="text-xs text-stone-400 mt-1 font-sans">
            Review student problem abstractions (~300 words), approve entries, or request revisions.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <span>Assigned Theme:</span>
            <span className="text-amber-200 font-extrabold">{theme}</span>
          </div>
        </div>

        <button
          onClick={fetchTeams}
          className="px-4 py-2 rounded-xl bg-stone-900 border border-amber-500/30 text-stone-300 hover:text-amber-300 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold border ${
            msg.type === "success"
              ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/40"
              : "bg-rose-950/40 text-rose-200 border-rose-500/40"
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap bg-stone-900/80 p-2 rounded-2xl border border-amber-500/20">
        {[
          { key: "all", label: `All Teams (${teams.length})` },
          { key: "pending", label: `Pending Review (${teams.filter((t) => t.abstractionStatus === "submitted").length})` },
          { key: "approved", label: `Approved (${teams.filter((t) => t.abstractionStatus === "approved").length})` },
          { key: "needs_revision", label: `Needs Revision (${teams.filter((t) => t.abstractionStatus === "needs_revision").length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
              filterStatus === tab.key
                ? "bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 shadow"
                : "text-stone-300 hover:bg-stone-800 hover:text-amber-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Teams Grid */}
      {loading ? (
        <div className="text-center py-12 text-stone-400 font-sans text-xs uppercase tracking-widest">
          Loading reviewer assignments...
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="serene-glass-card rounded-3xl border border-amber-500/20 p-12 text-center text-stone-400 font-sans">
          <BookOpen className="w-10 h-10 text-amber-400/40 mx-auto mb-3" />
          <div className="font-serif text-lg text-stone-200 uppercase tracking-wide">No Teams Found</div>
          <p className="text-xs mt-1">There are no teams matching the selected review filter for theme: {theme}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredTeams.map((t) => {
            const isApproved = t.abstractionStatus === "approved";
            const isPending = t.abstractionStatus === "submitted";
            const isNeedsRevision = t.abstractionStatus === "needs_revision";

            return (
              <div
                key={t.id}
                className="serene-glass-card rounded-3xl border border-amber-500/25 p-6 shadow-xl space-y-5 transition-all hover:border-amber-400/50"
              >
                {/* Team Top Header */}
                <div className="flex items-start justify-between gap-4 flex-wrap pb-4 border-b border-amber-500/15">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-serif text-2xl uppercase tracking-wider text-stone-100 font-normal">
                        {t.teamName}
                      </h3>
                      <span className="text-xs font-mono px-3 py-1 rounded-full bg-stone-900 border border-amber-500/30 text-amber-300 font-bold">
                        Code: {t.inviteCode}
                      </span>
                    </div>
                    <div className="text-xs text-stone-400 mt-1 flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-amber-400" />
                      <span>{t.members?.length || 0} Members</span>
                      <span>•</span>
                      <span>Theme: <strong className="text-amber-200">{t.theme || "Not selected"}</strong></span>
                    </div>
                  </div>

                  {/* Status Pill */}
                  <div>
                    {isApproved ? (
                      <span className="px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Approved ✓
                      </span>
                    ) : isPending ? (
                      <span className="px-4 py-1.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                        <Clock className="w-4 h-4" /> Pending Review ⏳
                      </span>
                    ) : isNeedsRevision ? (
                      <span className="px-4 py-1.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" /> Needs Revision ⚠️
                      </span>
                    ) : (
                      <span className="px-4 py-1.5 rounded-full bg-stone-800 text-stone-400 border border-stone-700 text-xs font-bold uppercase tracking-wider">
                        Draft
                      </span>
                    )}
                  </div>
                </div>

                {/* Problem Abstraction Content */}
                <div className="space-y-3 bg-stone-950/60 p-5 rounded-2xl border border-amber-500/15">
                  <div>
                    <span className="text-[10px] font-serif uppercase tracking-widest text-amber-300 font-bold block mb-1">
                      Problem Statement Title / Topic:
                    </span>
                    <div className="text-stone-100 font-semibold text-sm">
                      {t.topic || "No topic title entered yet."}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-serif uppercase tracking-widest text-amber-300 font-bold block mb-1">
                      Project Description (Abstraction ~300 words):
                    </span>
                    <p className="text-xs text-stone-300 leading-relaxed whitespace-pre-wrap font-sans">
                      {t.description || "No abstraction details entered yet."}
                    </p>
                  </div>

                  {t.reviewerFeedback && (
                    <div className="mt-3 pt-3 border-t border-rose-500/20 text-xs text-rose-300">
                      <strong className="block font-bold uppercase tracking-wider text-[10px]">Previous Feedback:</strong>
                      <p className="italic mt-0.5">"{t.reviewerFeedback}"</p>
                    </div>
                  )}
                </div>

                {/* Team Members List */}
                <div className="text-xs space-y-1.5">
                  <div className="font-serif uppercase tracking-wider text-amber-300 text-[11px]">Team Members</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                    {(t.members || []).map((m) => (
                      <div key={m.userId} className="bg-stone-900/80 p-2.5 rounded-xl border border-stone-800 text-xs">
                        <div className="font-semibold text-stone-200">{m.user?.fullName || "Member"} {m.isLeader ? "👑" : ""}</div>
                        <div className="text-[10px] text-stone-400 font-mono">{m.user?.email}</div>
                        <div className="text-[10px] text-amber-400 font-mono mt-0.5">{m.user?.phoneNumber || m.user?.phone}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons: 2 Options (Approve, Reject) */}
                <div className="pt-3 border-t border-amber-500/15 flex items-center justify-end gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setFeedbackModalTeam(t);
                      setFeedbackText(t.reviewerFeedback || "");
                    }}
                    disabled={submittingId === t.id}
                    className="px-5 py-2.5 rounded-xl border border-rose-500/40 bg-rose-950/30 hover:bg-rose-900/50 text-rose-300 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer shadow-md"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleReview(t.id, "approve", "")}
                    disabled={submittingId === t.id}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-stone-950 font-extrabold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{submittingId === t.id ? "Approving..." : "Approve"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Revision Feedback Modal */}
      {feedbackModalTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="serene-glass-card rounded-3xl border border-amber-500/30 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="font-serif text-xl uppercase tracking-wider text-rose-300 font-normal">
              Request Revision for {feedbackModalTeam.teamName}
            </h3>
            <p className="text-xs text-stone-400">
              Provide feedback detailing what the team needs to refine in their problem statement abstraction before approval.
            </p>

            <textarea
              rows={4}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="e.g. Please clarify your proposed technology stack and elaborate on expected outcomes..."
              className="w-full p-3.5 rounded-xl border border-amber-500/30 bg-stone-900 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400 font-sans"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setFeedbackModalTeam(null)}
                className="px-4 py-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-400 text-xs uppercase font-bold tracking-wider hover:text-stone-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleReview(feedbackModalTeam.id, "needs_revision", feedbackText)}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-stone-100 text-xs font-bold uppercase tracking-wider transition shadow-lg cursor-pointer"
              >
                Submit Revision Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
