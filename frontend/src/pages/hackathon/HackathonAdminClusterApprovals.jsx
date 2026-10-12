import React, { useEffect, useState, useMemo } from "react";
import { axiosInstance } from "../../lib/axios.js";
import { handleDownloadEvaluationSheetsPDF } from "../../lib/hackathonDownloadStudentsPdf.js";
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  RefreshCw,
  Search,
  Award,
  Layers,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  Download,
  Users,
  Mail,
  Send,
  Check,
  AlertCircle,
  X,
  Sparkles,
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function HackathonAdminClusterApprovals() {
  const [teams, setTeams] = useState([]);
  const [clusterBreakdown, setClusterBreakdown] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCluster, setSelectedCluster] = useState("all");
  const [selectedTheme, setSelectedTheme] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [expandedTeamId, setExpandedTeamId] = useState(null);

  // Faculty Email Modal State
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [facultyList, setFacultyList] = useState([]);
  const [loadingFaculty, setLoadingFaculty] = useState(false);
  const [selectedFacultyRecipient, setSelectedFacultyRecipient] = useState("all");
  const [customEmailMessage, setCustomEmailMessage] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailResults, setEmailResults] = useState(null);

  const uniqueThemes = useMemo(() => {
    const set = new Set();
    teams.forEach((t) => {
      if (t.theme && String(t.theme).trim()) {
        set.add(String(t.theme).trim());
      }
    });
    return Array.from(set).sort();
  }, [teams]);

  const fetchAdminClusterTeams = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/ich2026/cluster/admin/teams");
      setTeams(res.data?.teams || []);
      setClusterBreakdown(res.data?.clusterBreakdown || {});
    } catch (err) {
      console.error("Failed to load admin cluster teams:", err);
      toast.error(err.response?.data?.message || "Failed to load cluster teams.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminClusterTeams();
  }, []);

  const handleAdminApproval = async (teamId, action, teamName) => {
    setActionLoadingId(teamId);
    try {
      const res = await axiosInstance.post("/ich2026/cluster/admin/approve", {
        teamId,
        action,
      });
      toast.success(res.data?.message || `Team ${action}d successfully!`);
      await fetchAdminClusterTeams();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action} team.`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredTeams = useMemo(() => {
    return teams.filter((t) => {
      if (selectedCluster !== "all" && t.cluster !== selectedCluster) return false;
      if (selectedTheme !== "all" && t.theme !== selectedTheme) return false;
      if (selectedStatus === "approved" && t.abstractionStatus !== "approved") return false;
      if (selectedStatus === "pending" && t.abstractionStatus !== "submitted") return false;
      if (selectedStatus === "rejected" && t.abstractionStatus !== "rejected" && t.abstractionStatus !== "needs_revision") return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (t.teamName || "").toLowerCase().includes(q);
        const matchesCode = (t.inviteCode || "").toLowerCase().includes(q);
        const matchesTopic = (t.topic || "").toLowerCase().includes(q);
        const matchesTheme = (t.theme || "").toLowerCase().includes(q);
        const matchesFaculty = (t.assignedFacultyName || "").toLowerCase().includes(q);
        const matchesLeader = (t.members || []).some(
          (m) => m.isLeader && (m.user?.fullName || "").toLowerCase().includes(q)
        );
        if (!matchesName && !matchesCode && !matchesTopic && !matchesTheme && !matchesFaculty && !matchesLeader) return false;
      }

      return true;
    });
  }, [teams, selectedCluster, selectedTheme, selectedStatus, searchQuery]);

  const stats = useMemo(() => {
    const total = teams.length;
    const graded = teams.filter((t) => t.clusterMarks !== null && t.clusterMarks !== undefined).length;
    const approved = teams.filter((t) => t.abstractionStatus === "approved").length;
    const rejected = teams.filter((t) => t.abstractionStatus === "rejected" || t.abstractionStatus === "needs_revision").length;
    const pendingApproval = teams.filter((t) => t.abstractionStatus === "submitted").length;
    return { total, graded, approved, rejected, pendingApproval };
  }, [teams]);

  const handleOpenEmailModal = async () => {
    setIsEmailModalOpen(true);
    setEmailResults(null);
    if (facultyList.length === 0) {
      setLoadingFaculty(true);
      try {
        const res = await axiosInstance.get("/ich2026/admin/cluster-faculty-list");
        setFacultyList(res.data?.faculty || []);
      } catch (err) {
        console.error("Failed to load faculty list:", err);
        toast.error("Failed to load faculty list.");
      } finally {
        setLoadingFaculty(false);
      }
    }
  };

  const handleSendFacultyEmails = async () => {
    setEmailSending(true);
    setEmailResults(null);
    try {
      const res = await axiosInstance.post("/ich2026/admin/send-cluster-faculty-emails", {
        facultyId: selectedFacultyRecipient,
        customMessage: customEmailMessage.trim() || undefined,
        loginUrl: `${window.location.origin}/Hackathon/login`,
      });
      setEmailResults(res.data);
      toast.success(res.data?.message || "Emails sent successfully! ✓");
    } catch (err) {
      console.error("Failed to send faculty emails:", err);
      toast.error(err.response?.data?.message || "Failed to send faculty emails.");
    } finally {
      setEmailSending(false);
    }
  };

  const handleExportApprovedTeams = () => {
    try {
      const approvedTeams = teams.filter((t) => t.abstractionStatus === "approved");
      if (approvedTeams.length === 0) {
        toast.error("No teams have been approved yet. Please click 'Approve Team' on shortlisted teams first.");
        return;
      }

      const headers = [
        "Rank",
        "Team Name",
        "Invite Code",
        "Cluster",
        "Assigned Faculty",
        "Assigned Faculty Email",
        "Smart City Theme",
        "Faculty Marks (out of 10)",
        "Evaluated By",
        "Faculty Remarks",
        "Approval Status",
        "Problem Statement Title",
        "Project Description (Abstraction)",
        "Leader Name",
        "Leader Email",
        "Leader Phone",
        "Team Members",
      ];

      const rows = approvedTeams.map((t, idx) => {
        const leader = (t.members || []).find((m) => m.isLeader);
        const membersList = (t.members || [])
          .map((m) => `${m.user?.fullName || "Student"} (${m.user?.email || "—"})`)
          .join("; ");

        return [
          idx + 1,
          `"${(t.teamName || "").replace(/"/g, '""')}"`,
          `"${(t.inviteCode || "").replace(/"/g, '""')}"`,
          `"${(t.cluster || "").replace(/"/g, '""')}"`,
          `"${(t.assignedFacultyName || "").replace(/"/g, '""')}"`,
          `"${(t.assignedFacultyEmail || "").replace(/"/g, '""')}"`,
          `"${(t.theme || "").replace(/"/g, '""')}"`,
          t.clusterMarks !== null && t.clusterMarks !== undefined ? t.clusterMarks : "Not Graded",
          `"${(t.clusterEvaluatedBy || "").replace(/"/g, '""')}"`,
          `"${(t.clusterFeedback || "").replace(/"/g, '""')}"`,
          "APPROVED",
          `"${(t.topic || "").replace(/"/g, '""')}"`,
          `"${(t.description || "").replace(/"/g, '""')}"`,
          `"${(leader?.user?.fullName || "").replace(/"/g, '""')}"`,
          `"${(leader?.user?.email || "").replace(/"/g, '""')}"`,
          `"${(leader?.user?.phoneNumber || "").replace(/"/g, '""')}"`,
          `"${membersList.replace(/"/g, '""')}"`,
        ].join(",");
      });

      const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const dateStr = new Date().toISOString().slice(0, 10);
      link.setAttribute("download", `SmartCity_Selected_Approved_Teams_${dateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`Exported ${approvedTeams.length} approved teams successfully! ✓`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to export approved teams report.");
    }
  };

  const handleExportCSV = () => {
    try {
      const headers = [
        "Rank",
        "Team Name",
        "Invite Code",
        "Cluster",
        "Assigned Faculty",
        "Assigned Faculty Email",
        "Smart City Theme",
        "Faculty Marks (out of 10)",
        "Evaluated By",
        "Faculty Feedback",
        "Approval Status",
        "Problem Statement Title",
        "Project Description (Abstraction)",
        "Leader Name",
        "Leader Email",
        "Leader Phone",
        "Team Members",
      ];

      const rows = filteredTeams.map((t, idx) => {
        const leader = (t.members || []).find((m) => m.isLeader);
        const membersList = (t.members || [])
          .map((m) => `${m.user?.fullName || "Student"} (${m.user?.email || "—"})`)
          .join("; ");

        return [
          idx + 1,
          `"${(t.teamName || "").replace(/"/g, '""')}"`,
          `"${(t.inviteCode || "").replace(/"/g, '""')}"`,
          `"${(t.cluster || "").replace(/"/g, '""')}"`,
          `"${(t.assignedFacultyName || "").replace(/"/g, '""')}"`,
          `"${(t.assignedFacultyEmail || "").replace(/"/g, '""')}"`,
          `"${(t.theme || "").replace(/"/g, '""')}"`,
          t.clusterMarks !== null && t.clusterMarks !== undefined ? t.clusterMarks : "Not Graded",
          `"${(t.clusterEvaluatedBy || "").replace(/"/g, '""')}"`,
          `"${(t.clusterFeedback || "").replace(/"/g, '""')}"`,
          t.abstractionStatus === "approved" ? "APPROVED" : t.abstractionStatus === "rejected" ? "REJECTED" : "PENDING",
          `"${(t.topic || "").replace(/"/g, '""')}"`,
          `"${(t.description || "").replace(/"/g, '""')}"`,
          `"${(leader?.user?.fullName || "").replace(/"/g, '""')}"`,
          `"${(leader?.user?.email || "").replace(/"/g, '""')}"`,
          `"${(leader?.user?.phoneNumber || "").replace(/"/g, '""')}"`,
          `"${membersList.replace(/"/g, '""')}"`,
        ].join(",");
      });

      const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const dateStr = new Date().toISOString().slice(0, 10);
      link.setAttribute("download", `SmartCity_Cluster_Approvals_${dateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Exported report successfully! ✓");
    } catch (e) {
      console.error(e);
      toast.error("Failed to export report.");
    }
  };

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
                Clusteral Team Approval Portal
              </h2>
              <div className="text-xs font-sans text-amber-300 font-bold uppercase tracking-widest mt-0.5">
                Admin Evaluation & Selection Console
              </div>
            </div>
          </div>
          <p className="text-xs text-stone-400 mt-2 font-sans max-w-2xl leading-relaxed">
            Teams ranked in descending order by cluster faculty marks out of 10. Review abstractions, evaluate faculty scores & notes, and approve shortlisted teams for the hackathon build phase.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleExportApprovedTeams}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 transition cursor-pointer shadow-xl border border-emerald-300"
          >
            <Download className="w-4 h-4" />
            <span>Export Approved Teams ({stats.approved})</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-stone-900 border border-amber-500/30 text-stone-300 hover:text-amber-300 hover:border-amber-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition cursor-pointer shadow-lg"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export All ({filteredTeams.length})</span>
          </button>
          <button
            onClick={() => {
              const teamsToPrint = filteredTeams.length > 0 ? filteredTeams : teams;
              handleDownloadEvaluationSheetsPDF(teamsToPrint, `${selectedCluster === 'all' ? 'All Clusters' : selectedCluster} - Evaluation`);
            }}
            className="px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-200 font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 transition cursor-pointer shadow-xl"
            title="Download printable evaluation score sheets for faculty judging clipboards"
          >
            <span>🖨️</span>
            <span>Print Evaluation Sheets ({filteredTeams.length})</span>
          </button>
          <button
            onClick={fetchAdminClusterTeams}
            className="px-3.5 py-2.5 rounded-xl bg-stone-900 border border-amber-500/30 text-stone-300 hover:text-amber-300 hover:border-amber-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer shadow-lg"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="serene-glass-card rounded-2xl border border-amber-500/20 p-4 shadow-xl">
          <div className="text-[10px] font-sans font-bold uppercase tracking-widest text-stone-400">Total Submissions</div>
          <div className="mt-1 font-serif text-2xl font-normal text-stone-100">{stats.total} Teams</div>
        </div>
        <div className="serene-glass-card rounded-2xl border border-blue-500/30 p-4 shadow-xl">
          <div className="text-[10px] font-sans font-bold uppercase tracking-widest text-blue-300">Graded by Faculty</div>
          <div className="mt-1 font-serif text-2xl font-normal text-blue-300">{stats.graded} / {stats.total}</div>
        </div>
        <div className="serene-glass-card rounded-2xl border border-emerald-500/30 p-4 shadow-xl">
          <div className="text-[10px] font-sans font-bold uppercase tracking-widest text-emerald-300">Admin Approved</div>
          <div className="mt-1 font-serif text-2xl font-normal text-emerald-300">{stats.approved} Teams</div>
        </div>
        <div className="serene-glass-card rounded-2xl border border-amber-500/30 p-4 shadow-xl">
          <div className="text-[10px] font-sans font-bold uppercase tracking-widest text-amber-300">Pending Approval</div>
          <div className="mt-1 font-serif text-2xl font-normal text-amber-300">{stats.pendingApproval} Teams</div>
        </div>
        <div className="serene-glass-card rounded-2xl border border-rose-500/30 p-4 shadow-xl col-span-2 sm:col-span-1">
          <div className="text-[10px] font-sans font-bold uppercase tracking-widest text-rose-300">Rejected / Needs Rev</div>
          <div className="mt-1 font-serif text-2xl font-normal text-rose-300">{stats.rejected} Teams</div>
        </div>
      </div>

      {/* Cluster & Theme Filter Controls */}
      <div className="bg-stone-900/80 p-4 rounded-2xl border border-amber-500/20 shadow-lg space-y-3.5">
        {/* Top Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCluster("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                selectedCluster === "all"
                  ? "bg-amber-400 text-stone-950 font-extrabold shadow-md"
                  : "bg-stone-950 text-stone-300 border border-amber-500/20 hover:border-amber-400/40"
              }`}
            >
              All Clusters ({teams.length})
            </button>
            {["Computer Science", "Electronics", "Civil", "Electrical", "Mechanical"].map((c) => {
              const b = clusterBreakdown[c] || { total: 0, graded: 0, approved: 0 };
              return (
                <button
                  key={c}
                  onClick={() => setSelectedCluster(c)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                    selectedCluster === c
                      ? "bg-amber-400 text-stone-950 font-extrabold shadow-md"
                      : "bg-stone-950 text-stone-300 border border-amber-500/20 hover:border-amber-400/40"
                  }`}
                >
                  {c} ({b.total})
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
            {/* Theme Dropdown */}
            <select
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value)}
              className="rounded-xl border border-amber-500/30 bg-stone-950 px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-400 transition cursor-pointer"
            >
              <option value="all">All Themes ({teams.length})</option>
              {uniqueThemes.map((th) => {
                const count = teams.filter(
                  (t) => (selectedCluster === "all" || t.cluster === selectedCluster) && t.theme === th
                ).length;
                return (
                  <option key={th} value={th}>
                    {th} ({count})
                  </option>
                );
              })}
            </select>

            {/* Status Dropdown */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-xl border border-amber-500/30 bg-stone-950 px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-400 transition cursor-pointer"
            >
              <option value="all">All Approval Statuses</option>
              <option value="approved">Approved ✓</option>
              <option value="pending">Pending Approval ⏳</option>
              <option value="rejected">Rejected ❌</option>
            </select>

            {/* Search Input */}
            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search team, code, topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-amber-500/30 bg-stone-950 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 font-sans"
              />
            </div>
          </div>
        </div>

        {/* Quick Theme Filter Chips Row */}
        <div className="flex items-center gap-1.5 flex-wrap pt-3 border-t border-amber-500/15">
          <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-amber-300/90 mr-1 flex items-center gap-1 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Theme Filter:</span>
          </span>
          <button
            type="button"
            onClick={() => setSelectedTheme("all")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              selectedTheme === "all"
                ? "bg-amber-400 text-stone-950 font-extrabold shadow-sm"
                : "bg-stone-950 text-stone-400 border border-stone-800 hover:text-stone-200 hover:border-amber-500/30"
            }`}
          >
            All Themes ({teams.length})
          </button>
          {uniqueThemes.map((th) => {
            const count = teams.filter(
              (t) => (selectedCluster === "all" || t.cluster === selectedCluster) && t.theme === th
            ).length;
            return (
              <button
                key={th}
                type="button"
                onClick={() => setSelectedTheme(th)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedTheme === th
                    ? "bg-amber-400 text-stone-950 font-extrabold shadow-sm"
                    : "bg-stone-950 text-stone-400 border border-stone-800 hover:text-stone-200 hover:border-amber-500/30"
                }`}
              >
                {th} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Leaderboard Table / Cards */}
      {loading ? (
        <div className="p-12 text-center text-stone-400 font-sans text-xs uppercase tracking-widest flex items-center justify-center gap-3">
          <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
          <span>Loading ranked team records...</span>
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="serene-glass-card rounded-3xl border border-amber-500/20 p-12 text-center text-stone-400 text-xs font-sans">
          No teams found matching your selected cluster and status filter.
        </div>
      ) : (
        <div className="space-y-5">
          {filteredTeams.map((t, idx) => {
            const isGraded = t.clusterMarks !== null && t.clusterMarks !== undefined;
            const isExpanded = expandedTeamId === t.id;
            const isActionLoading = actionLoadingId === t.id;

            return (
              <div
                key={t.id}
                className="serene-glass-card rounded-3xl border border-amber-500/25 p-6 sm:p-7 shadow-2xl space-y-5 transition-all hover:border-amber-400/50"
              >
                {/* Row Header */}
                <div className="flex items-start justify-between gap-4 flex-wrap pb-4 border-b border-amber-500/20">
                  <div className="flex items-start gap-3">
                    {/* Rank Badge */}
                    <div className="w-9 h-9 rounded-xl bg-stone-900 border border-amber-500/30 flex items-center justify-center font-mono font-extrabold text-amber-300 text-sm shrink-0">
                      #{idx + 1}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-serif text-2xl uppercase tracking-wider text-stone-100 font-normal">
                          {t.teamName}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-stone-900 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold">
                          {t.inviteCode}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-2 flex-wrap text-xs">
                        <span className="px-3 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 font-bold uppercase text-[10px]">
                          Cluster: {t.cluster}
                        </span>
                        <span className="px-3 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 font-bold uppercase text-[10px]">
                          Theme: {t.theme || "Smart City"}
                        </span>
                        {t.assignedFacultyName && (
                          <span className="px-3 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 font-bold text-[10px]">
                            Assigned Evaluator: {t.assignedFacultyName}
                          </span>
                        )}
                        {t.abstractionStatus === "approved" ? (
                          <span className="px-3 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold uppercase text-[10px] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Approved ✓</span>
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
                  </div>

                  {/* Marks Display & Actions */}
                  <div className="flex items-center gap-3 flex-wrap">
                    {isGraded ? (
                      <div className="flex flex-col items-end">
                        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-2xl bg-gradient-to-r from-amber-400/20 to-emerald-400/20 border border-amber-400/40 text-amber-300 font-serif text-lg font-bold shadow-lg">
                          <Award className="w-4 h-4 text-amber-400" />
                          <span>{t.clusterMarks} / 10</span>
                        </div>
                        {t.clusterEvaluatedBy && (
                          <span className="text-[10px] text-stone-400 mt-1 font-sans">
                            By {t.clusterEvaluatedBy}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="px-3 py-1.5 rounded-xl bg-stone-900 border border-amber-500/20 text-stone-400 text-xs font-bold uppercase tracking-wider">
                        Not Graded
                      </span>
                    )}

                    {/* Admin Action Buttons */}
                    <div className="flex items-center gap-2">
                      {t.abstractionStatus !== "approved" && (
                        <button
                          type="button"
                          disabled={isActionLoading}
                          onClick={() => handleAdminApproval(t.id, "approve", t.teamName)}
                          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-extrabold uppercase tracking-wider transition shadow-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve Team</span>
                        </button>
                      )}

                      {t.abstractionStatus !== "rejected" && (
                        <button
                          type="button"
                          disabled={isActionLoading}
                          onClick={() => handleAdminApproval(t.id, "reject", t.teamName)}
                          className="px-3 py-2 rounded-xl bg-stone-900 border border-rose-500/40 hover:bg-rose-500/20 text-rose-300 text-xs font-bold uppercase tracking-wider transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      )}

                      {t.abstractionStatus === "approved" && (
                        <button
                          type="button"
                          disabled={isActionLoading}
                          onClick={() => handleAdminApproval(t.id, "reset", t.teamName)}
                          className="px-3 py-2 rounded-xl bg-stone-900 border border-amber-500/30 hover:bg-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Revoke</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Faculty Feedback Quote */}
                {t.clusterFeedback && (
                  <div className="p-3.5 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-xs font-sans text-amber-200">
                    <span className="font-bold text-amber-300 uppercase tracking-wider text-[10px] block mb-1">
                      Faculty Remarks:
                    </span>
                    <p className="italic">"{t.clusterFeedback}"</p>
                  </div>
                )}

                {/* Topic & Collapsible Abstraction */}
                <div className="space-y-2.5">
                  <div className="text-xs font-sans">
                    <strong className="text-amber-300 uppercase tracking-wider font-bold text-[10px] block mb-0.5">
                      Problem Statement Title:
                    </strong>
                    <span className="text-stone-100 font-semibold">{t.topic || "No title provided"}</span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <strong className="text-amber-300 uppercase tracking-wider font-bold text-[10px]">
                        Project Description (Abstraction ~300 words):
                      </strong>
                      <button
                        type="button"
                        onClick={() => setExpandedTeamId(isExpanded ? null : t.id)}
                        className="text-amber-300 hover:text-amber-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <span>{isExpanded ? "Collapse" : "Expand Full Abstraction"}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div
                      className={`p-3.5 rounded-2xl border border-amber-500/15 bg-stone-900/80 text-stone-300 text-xs font-sans whitespace-pre-wrap leading-relaxed transition-all ${
                        isExpanded ? "max-h-none" : "max-h-24 overflow-hidden relative"
                      }`}
                    >
                      {t.description || "No project description provided."}
                      {!isExpanded && t.description && t.description.length > 150 && (
                        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-stone-900 to-transparent pointer-events-none" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Team Members List */}
                <div className="pt-2 border-t border-amber-500/10">
                  <div className="flex items-center gap-2 flex-wrap text-xs text-stone-400">
                    <span className="font-bold text-amber-300 uppercase text-[10px]">Team Roster:</span>
                    {(t.members || []).map((m, mIdx) => (
                      <span
                        key={m.userId || mIdx}
                        className="px-2.5 py-1 rounded-xl bg-stone-900/90 border border-amber-500/15 text-stone-200 text-[11px]"
                      >
                        {m.isLeader ? "👑 " : ""}{m.user?.fullName || "Member"} ({m.user?.email || "—"})
                      </span>
                    ))}
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
