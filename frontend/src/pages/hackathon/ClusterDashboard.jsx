import React, { useEffect, useState, useMemo } from "react";
import { axiosInstance } from "../../lib/axios.js";
import {
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Users,
  BookOpen,
  Award,
  MessageSquare,
  Clock,
  Search,
  Star,
  ChevronDown,
  ChevronUp,
  Layers,
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function ClusterDashboard() {
  const [cluster, setCluster] = useState("");
  const [facultyName, setFacultyName] = useState("");
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedTeamId, setExpandedTeamId] = useState(null);

  // Local editing state for marks and feedback per team
  const [gradingState, setGradingState] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [msg, setMsg] = useState(null);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/ich2026/cluster/teams");
      setCluster(res.data?.cluster || "Assigned Cluster");
      setFacultyName(res.data?.facultyName || "Faculty Evaluator");
      const fetchedTeams = res.data?.teams || [];
      setTeams(fetchedTeams);

      // Initialize grading state
      const initialGrades = {};
      fetchedTeams.forEach((t) => {
        initialGrades[t.id] = {
          marks: t.clusterMarks !== null && t.clusterMarks !== undefined ? String(t.clusterMarks) : "",
          feedback: t.clusterFeedback || "",
        };
      });
      setGradingState(initialGrades);
    } catch (err) {
      console.error("Failed to load cluster teams:", err);
      toast.error(err.response?.data?.message || "Failed to load cluster teams.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleGradeChange = (teamId, field, val) => {
    setGradingState((prev) => ({
      ...prev,
      [teamId]: {
        ...(prev[teamId] || {}),
        [field]: val,
      },
    }));
  };

  const handleSaveGrade = async (teamId) => {
    const data = gradingState[teamId];
    if (!data || data.marks === "" || isNaN(Number(data.marks))) {
      toast.error("Please enter a valid mark between 0 and 10.");
      return;
    }

    const numMarks = Number(data.marks);
    if (numMarks < 0 || numMarks > 10) {
      toast.error("Marks must be between 0 and 10.");
      return;
    }

    setSavingId(teamId);
    setMsg(null);
    try {
      const res = await axiosInstance.post("/ich2026/cluster/grade", {
        teamId,
        marks: numMarks,
        feedback: data.feedback,
      });

      toast.success(res.data?.message || "Grade saved successfully! ✓");
      setMsg({ type: "success", text: res.data?.message || "Grade recorded successfully!" });
      await fetchTeams();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save grade.");
      setMsg({ type: "error", text: err.response?.data?.message || "Failed to save grade." });
    } finally {
      setSavingId(null);
    }
  };

  const gradedCount = useMemo(() => {
    return teams.filter((t) => t.clusterMarks !== null && t.clusterMarks !== undefined).length;
  }, [teams]);

  const pendingCount = useMemo(() => {
    return teams.length - gradedCount;
  }, [teams, gradedCount]);

  const filteredTeams = useMemo(() => {
    return teams.filter((t) => {
      const isGraded = t.clusterMarks !== null && t.clusterMarks !== undefined;
      if (filterStatus === "graded" && !isGraded) return false;
      if (filterStatus === "pending" && isGraded) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (t.teamName || "").toLowerCase().includes(q);
        const matchesCode = (t.inviteCode || "").toLowerCase().includes(q);
        const matchesTopic = (t.topic || "").toLowerCase().includes(q);
        const matchesLeader = (t.members || []).some(
          (m) => m.isLeader && (m.user?.fullName || "").toLowerCase().includes(q)
        );
        if (!matchesName && !matchesCode && !matchesTopic && !matchesLeader) return false;
      }

      return true;
    });
  }, [teams, filterStatus, searchQuery]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 font-sans text-stone-100 pb-16">
      {/* Header Banner */}
      <div className="serene-glass-card rounded-3xl border border-amber-500/25 p-6 sm:p-8 shadow-2xl flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400/20 border border-amber-400/30 text-amber-300">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif text-3xl uppercase tracking-wider text-stone-100 font-normal">
                Cluster Evaluation Workspace
              </h2>
              <div className="text-xs font-sans text-amber-300 font-bold uppercase tracking-widest mt-0.5">
                Faculty: {facultyName}
              </div>
            </div>
          </div>
          <p className="text-xs text-stone-400 mt-2 font-sans max-w-2xl leading-relaxed">
            Evaluate problem abstractions (~300 words) submitted by student teams in your assigned cluster. Assign marks out of 10 with optional feedback remarks.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <span>Cluster:</span>
              <span className="text-amber-200 font-extrabold">{cluster}</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <span>Graded:</span>
              <span className="text-emerald-200 font-extrabold">{gradedCount} / {teams.length}</span>
            </div>
            {pendingCount > 0 && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider animate-pulse">
                <span>Pending:</span>
                <span className="text-amber-200 font-extrabold">{pendingCount} Teams</span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={fetchTeams}
          className="px-4 py-2.5 rounded-xl bg-stone-900 border border-amber-500/30 text-stone-300 hover:text-amber-300 hover:border-amber-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition cursor-pointer shadow-lg"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Workspace</span>
        </button>
      </div>

      {/* Progress Bar */}
      {teams.length > 0 && (
        <div className="bg-stone-900/80 border border-amber-500/20 rounded-2xl p-4 shadow-lg flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-sans">
            <span className="text-stone-400 uppercase tracking-wider font-bold text-[10px]">
              Cluster Grading Progress
            </span>
            <span className="text-amber-300 font-bold">
              {Math.round((gradedCount / teams.length) * 100)}% Completed ({gradedCount}/{teams.length})
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-stone-950 overflow-hidden border border-amber-500/10">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 transition-all duration-500"
              style={{ width: `${(gradedCount / teams.length) * 100}%` }}
            />
          </div>
        </div>
      )}

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

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-stone-900/80 p-4 rounded-2xl border border-amber-500/20 shadow-lg">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
              filterStatus === "all"
                ? "bg-amber-400 text-stone-950 shadow-md font-extrabold"
                : "bg-stone-950 text-stone-300 border border-amber-500/20 hover:border-amber-400/40"
            }`}
          >
            All Teams ({teams.length})
          </button>
          <button
            onClick={() => setFilterStatus("pending")}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
              filterStatus === "pending"
                ? "bg-amber-400 text-stone-950 shadow-md font-extrabold"
                : "bg-stone-950 text-stone-300 border border-amber-500/20 hover:border-amber-400/40"
            }`}
          >
            Pending Grading ({pendingCount})
          </button>
          <button
            onClick={() => setFilterStatus("graded")}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
              filterStatus === "graded"
                ? "bg-amber-400 text-stone-950 shadow-md font-extrabold"
                : "bg-stone-950 text-stone-300 border border-amber-500/20 hover:border-amber-400/40"
            }`}
          >
            Graded ({gradedCount})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by team, code or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-amber-500/30 bg-stone-950 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 font-sans"
          />
        </div>
      </div>

      {/* Teams List */}
      {loading ? (
        <div className="p-12 text-center text-stone-400 font-sans text-xs uppercase tracking-widest flex items-center justify-center gap-3">
          <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
          <span>Loading cluster teams...</span>
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="serene-glass-card rounded-3xl border border-amber-500/20 p-12 text-center text-stone-400 text-xs font-sans">
          No teams found matching your filter criteria.
        </div>
      ) : (
        <div className="space-y-6">
          {filteredTeams.map((t, idx) => {
            const isGraded = t.clusterMarks !== null && t.clusterMarks !== undefined;
            const currentGrade = gradingState[t.id] || { marks: "", feedback: "" };
            const isExpanded = expandedTeamId === t.id;

            return (
              <div
                key={t.id}
                className="serene-glass-card rounded-3xl border border-amber-500/25 p-6 sm:p-8 shadow-2xl space-y-6 transition-all hover:border-amber-400/50"
              >
                {/* Team Card Header */}
                <div className="flex items-start justify-between gap-4 flex-wrap pb-4 border-b border-amber-500/20">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-stone-400 font-mono text-xs font-bold">#{idx + 1}</span>
                      <h3 className="font-serif text-2xl uppercase tracking-wider text-stone-100 font-normal">
                        {t.teamName}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-stone-900 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold">
                        {t.inviteCode}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-2 flex-wrap text-xs">
                      <span className="px-3 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 font-bold uppercase text-[10px]">
                        Theme: {t.theme || "Smart City"}
                      </span>
                      <span className="px-3 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 font-bold uppercase text-[10px]">
                        Cluster: {t.cluster}
                      </span>
                      {t.abstractionStatus === "approved" ? (
                        <span className="px-3 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold uppercase text-[10px] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Admin Approved ✓</span>
                        </span>
                      ) : t.abstractionStatus === "rejected" ? (
                        <span className="px-3 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold uppercase text-[10px]">
                          Rejected ❌
                        </span>
                      ) : (
                        <span className="px-3 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 font-bold uppercase text-[10px]">
                          Pending Approval ⏳
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Awarded Score Badge */}
                  <div>
                    {isGraded ? (
                      <div className="flex flex-col items-end">
                        <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-400/20 to-emerald-400/20 border border-amber-400/40 text-amber-300 font-serif text-lg font-bold shadow-lg">
                          <Award className="w-5 h-5 text-amber-400" />
                          <span>{t.clusterMarks} / 10</span>
                        </div>
                        {t.clusterEvaluatedBy && (
                          <span className="text-[10px] text-stone-400 mt-1 font-sans">
                            Evaluated by {t.clusterEvaluatedBy}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="px-3 py-1.5 rounded-xl bg-stone-900 border border-amber-500/20 text-stone-400 text-xs font-bold uppercase tracking-wider">
                        Not Graded Yet
                      </span>
                    )}
                  </div>
                </div>

                {/* Problem Statement & Abstraction */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-serif uppercase tracking-wider text-amber-300 mb-1 font-normal">
                      Problem Statement Title / Topic
                    </label>
                    <div className="p-3.5 rounded-2xl border border-amber-500/20 bg-stone-900/90 text-stone-100 text-xs font-sans font-semibold">
                      {t.topic || "No topic provided"}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <label className="block text-[11px] font-serif uppercase tracking-wider text-amber-300 font-normal">
                        Project Description (Abstraction ~300 words)
                      </label>
                      <button
                        type="button"
                        onClick={() => setExpandedTeamId(isExpanded ? null : t.id)}
                        className="text-amber-300 hover:text-amber-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <span>{isExpanded ? "Collapse" : "Expand Full Text"}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div
                      className={`p-4 rounded-2xl border border-amber-500/20 bg-stone-900/90 text-stone-200 text-xs font-sans whitespace-pre-wrap leading-relaxed transition-all ${
                        isExpanded ? "max-h-none" : "max-h-36 overflow-hidden relative"
                      }`}
                    >
                      {t.description || "No project description provided."}
                      {!isExpanded && t.description && t.description.length > 200 && (
                        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-stone-900 to-transparent pointer-events-none" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Team Members Roster */}
                <div>
                  <label className="block text-[11px] font-serif uppercase tracking-wider text-amber-300 mb-2 font-normal">
                    Team Members ({t.members?.length || 0})
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                    {(t.members || []).map((m, mIdx) => (
                      <div
                        key={m.userId || mIdx}
                        className="p-3 rounded-xl bg-stone-900/70 border border-amber-500/15 text-xs font-sans flex flex-col justify-between"
                      >
                        <div>
                          <div className="font-semibold text-stone-100 truncate">
                            {m.user?.fullName || "Student"}
                          </div>
                          <div className="text-[11px] text-stone-400 font-mono truncate">
                            {m.user?.email || "—"}
                          </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${
                              m.isLeader
                                ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                                : "bg-stone-950 text-stone-400 border border-amber-500/10"
                            }`}
                          >
                            {m.isLeader ? "Leader 👑" : "Member"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Faculty Grading Form Box */}
                <div className="bg-stone-950/80 border border-amber-500/30 rounded-2xl p-5 shadow-xl space-y-4">
                  <div className="flex items-center gap-2 border-b border-amber-500/15 pb-2.5">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400/30" />
                    <span className="font-serif text-sm uppercase tracking-wider text-amber-300 font-normal">
                      Faculty Evaluation & Grading (Score out of 10)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-start">
                    {/* Marks Input */}
                    <div className="sm:col-span-1">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-300 mb-1 font-sans">
                        Marks (0 - 10) *
                      </label>
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="e.g. 8.5"
                        value={currentGrade.marks}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "" || /^[0-9]*\.?[0-9]*$/.test(val)) {
                            if (val === "" || Number(val) <= 10) {
                              handleGradeChange(t.id, "marks", val);
                            }
                          }
                        }}
                        className="w-full px-4 py-2.5 rounded-xl border border-amber-500/30 bg-stone-900 text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400 font-sans text-sm font-bold"
                      />
                      <span className="text-[10px] text-stone-400 mt-1 block">
                        Type score directly (0 to 10)
                      </span>
                    </div>

                    {/* Feedback Remarks */}
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-300 mb-1 font-sans">
                        Faculty Feedback / Evaluation Notes
                      </label>
                      <textarea
                        rows={2}
                        placeholder="e.g., Innovative approach, clear methodology, strong feasibility..."
                        value={currentGrade.feedback}
                        onChange={(e) => handleGradeChange(t.id, "feedback", e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-amber-500/30 bg-stone-900 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400 font-sans"
                      />
                    </div>

                    {/* Save Button */}
                    <div className="sm:col-span-1 sm:pt-6">
                      <button
                        type="button"
                        disabled={savingId === t.id}
                        onClick={() => handleSaveGrade(t.id)}
                        className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 font-extrabold text-xs uppercase tracking-wider transition shadow-lg hover:brightness-110 disabled:opacity-60 cursor-pointer border border-amber-300 flex items-center justify-center gap-2"
                      >
                        <span>{savingId === t.id ? "Saving..." : isGraded ? "Update Grade" : "Save Grade"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
