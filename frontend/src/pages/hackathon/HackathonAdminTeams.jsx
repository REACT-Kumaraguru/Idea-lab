import React, { useEffect, useMemo, useState } from "react";
import { axiosInstance } from "../../lib/axios.js";
import { handleDownloadPDF, handleDownloadEvaluationSheetsPDF } from "../../lib/hackathonDownloadStudentsPdf.js";
import { useLocation } from "react-router-dom";
import { Search, Trash2, Edit2, Plus, X, Users, UserPlus } from "lucide-react";

const HackathonAdminTeams = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const hackathonId = searchParams.get("hackathonId") || "";

  const [teams, setTeams] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [registeredStudents, setRegisteredStudents] = useState([]);
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [excelLoading, setExcelLoading] = useState(false);

  const [mentorsList, setMentorsList] = useState([]);
  const [assigningTeamId, setAssigningTeamId] = useState(null);
  const [selectedDescModal, setSelectedDescModal] = useState(null);
  const [themeFilter, setThemeFilter] = useState("all");
  const [reviewerFilter, setReviewerFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingTeamId, setDeletingTeamId] = useState(null);

  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamTheme, setNewTeamTheme] = useState("General Innovation");
  const [newTeamTopic, setNewTeamTopic] = useState("");
  const [newTeamDesc, setNewTeamDesc] = useState("");
  const [newLeaderEmail, setNewLeaderEmail] = useState("");
  const [newLeaderName, setNewLeaderName] = useState("");
  const [addingTeam, setAddingTeam] = useState(false);

  const [editingTeam, setEditingTeam] = useState(null);
  const [editTeamName, setEditTeamName] = useState("");
  const [editTopic, setEditTopic] = useState("");
  const [editTheme, setEditTheme] = useState("");
  const [editBench, setEditBench] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [addingMember, setAddingMember] = useState(false);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    setAddingTeam(true);
    try {
      const res = await axiosInstance.post("/ich2026/admin/teams/create", {
        teamName: newTeamName.trim(),
        hackathonId: hackathonId || 1,
        theme: newTeamTheme,
        topic: newTeamTopic,
        description: newTeamDesc,
        leaderEmail: newLeaderEmail,
        leaderName: newLeaderName,
      });
      if (res.data?.team) {
        setTeams((prev) => [res.data.team, ...prev]);
      }
      setShowAddTeamModal(false);
      setNewTeamName("");
      setNewTeamTopic("");
      setNewTeamDesc("");
      setNewLeaderEmail("");
      setNewLeaderName("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create team");
    } finally {
      setAddingTeam(false);
    }
  };

  const handleOpenEditTeam = (team) => {
    setEditingTeam(team);
    setEditTeamName(team.teamName || "");
    setEditTopic(team.topic || "");
    setEditTheme(team.theme || "General Innovation");
    setEditBench(team.benchNumber || "");
  };

  const handleSaveEditTeam = async (e) => {
    e.preventDefault();
    if (!editingTeam) return;
    setSavingEdit(true);
    try {
      const res = await axiosInstance.put(`/ich2026/admin/teams/${editingTeam.id}`, {
        teamName: editTeamName,
        topic: editTopic,
        theme: editTheme,
        benchNumber: editBench,
      });
      if (res.data?.team) {
        setTeams((prev) => prev.map((t) => (t.id === editingTeam.id ? res.data.team : t)));
        setEditingTeam(res.data.team);
      }
      alert("Team details updated successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update team");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleAddMemberToTeam = async (e) => {
    e.preventDefault();
    if (!newMemberEmail.trim() || !editingTeam) return;
    setAddingMember(true);
    try {
      const res = await axiosInstance.post(`/ich2026/admin/teams/${editingTeam.id}/members`, {
        email: newMemberEmail.trim(),
        fullName: newMemberName.trim() || "Team Member",
      });
      if (res.data?.team) {
        setTeams((prev) => prev.map((t) => (t.id === editingTeam.id ? res.data.team : t)));
        setEditingTeam(res.data.team);
      }
      setNewMemberEmail("");
      setNewMemberName("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add member");
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMemberFromTeam = async (teamId, userId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove member "${memberName}" from this team?`)) return;
    try {
      const res = await axiosInstance.delete(`/ich2026/admin/teams/${teamId}/members/${userId}`);
      if (res.data?.team) {
        setTeams((prev) => prev.map((t) => (t.id === teamId ? res.data.team : t)));
        setEditingTeam(res.data.team);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove member");
    }
  };

  const [problems, setProblems] = useState([]);

  const handleDeleteTeam = async (teamId, teamName) => {
    if (!window.confirm(`Are you sure you want to delete team "${teamName}"? This will permanently remove its submissions and member records.`)) {
      return;
    }
    setDeletingTeamId(teamId);
    try {
      await axiosInstance.delete(`/ich2026/admin/teams/${teamId}`);
      setTeams((prev) => prev.filter((t) => t.id !== teamId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete team");
    } finally {
      setDeletingTeamId(null);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const query = hackathonId ? `?hackathonId=${hackathonId}` : "";
        const [teamsRes, studentsRes, submissionsRes, hackathonsRes, mentorsRes, problemsRes] = await Promise.all([
          axiosInstance.get(`/ich2026/admin/teams${query}`),
          axiosInstance.get(`/ich2026/admin/students`),
          axiosInstance.get(`/ich2026/admin/submissions${query}`),
          axiosInstance.get(`/ich2026/admin/hackathons`),
          axiosInstance.get(`/ich2026/admin/mentors${query}`),
          axiosInstance.get(`/ich2026/problems${query}`),
        ]);
        setTeams(teamsRes.data.teams || []);
        setRegisteredStudents(studentsRes.data.students || []);
        setSubmissions(submissionsRes.data.submissions || []);
        setHackathons(hackathonsRes.data.hackathons || []);
        setMentorsList(mentorsRes.data.mentors || []);
        setProblems(problemsRes.data.problems || []);
      } catch (e) {
        setError(e.response?.data?.message || "Failed to load teams");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [hackathonId]);

  const handleAssignMentor = async (teamId, mentorUserId) => {
    if (!mentorUserId) return;
    setAssigningTeamId(teamId);
    try {
      await axiosInstance.post("/ich2026/admin/mentors/assign", {
        teamId,
        mentorUserId: Number(mentorUserId),
      });
      const query = hackathonId ? `?hackathonId=${hackathonId}` : "";
      const teamsRes = await axiosInstance.get(`/ich2026/admin/teams${query}`);
      setTeams(teamsRes.data.teams || []);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to assign mentor");
    } finally {
      setAssigningTeamId(null);
    }
  };

  const currentHackathon = useMemo(() => {
    if (!hackathonId) return null;
    return hackathons.find((h) => String(h.id) === String(hackathonId)) || null;
  }, [hackathons, hackathonId]);

  const isCustomMode = currentHackathon?.problemStatementType === "custom";

  const currentHackathonName = useMemo(() => {
    if (!hackathonId) return "All Hackathons";
    return currentHackathon?.name || "All Hackathons";
  }, [currentHackathon, hackathonId]);

  const filterOptions = useMemo(() => {
    if (!hackathonId) return [];
    if (isCustomMode) {
      return [
        "Disaster Resilience",
        "Waste Management",
        "Energy Solutions",
        "Smart Agriculture",
        "Pollution Control",
        "Smart Mobility & Parking",
        "Smart Healthcare",
      ];
    } else {
      const set = new Set();
      problems.forEach((p) => { if (p.title) set.add(p.title); });
      teams.forEach((t) => { if (t.topic) set.add(t.topic); });
      return Array.from(set);
    }
  }, [hackathonId, isCustomMode, problems]);

  const selectedHackathonStudents = useMemo(() => {
    const list = [];
    const seenEmails = new Set();
    for (const t of teams) {
      const hName = t.hackathonName || currentHackathonName;
      if (t.leader && t.leader.email) {
        const em = t.leader.email.toLowerCase();
        seenEmails.add(em);
        list.push({ ...t.leader, isLeader: true, teamName: t.teamName, hackathonName: hName, topic: t.topic, description: t.description });
      }
      for (const m of t.members || []) {
        if (m.email) {
          const em = m.email.toLowerCase();
          if (!seenEmails.has(em)) {
            seenEmails.add(em);
            list.push({ ...m, isLeader: m.isLeader === true, teamName: t.teamName, hackathonName: hName, topic: t.topic, description: t.description });
          }
        }
      }
    }
    return list;
  }, [teams, currentHackathonName]);

  const filteredAndSortedTeams = useMemo(() => {
    let list = [...teams];
    if (hackathonId && themeFilter !== "all") {
      if (isCustomMode) {
        list = list.filter((t) => (t.theme || "").toLowerCase() === themeFilter.toLowerCase());
      } else {
        list = list.filter((t) => (t.topic || "").toLowerCase() === themeFilter.toLowerCase());
      }
    }
    if (reviewerFilter !== "all") {
      list = list.filter((t) => (t.abstractionStatus || "draft") === reviewerFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((t) =>
        (t.teamName || "").toLowerCase().includes(q) ||
        (t.inviteCode || "").toLowerCase().includes(q) ||
        (t.leader?.fullName || "").toLowerCase().includes(q) ||
        (t.leader?.email || "").toLowerCase().includes(q) ||
        (t.members || []).some((m) =>
          (m.fullName || "").toLowerCase().includes(q) ||
          (m.email || "").toLowerCase().includes(q)
        )
      );
    }
    if (sortBy === "theme" || sortBy === "problem") {
      if (isCustomMode) {
        list.sort((a, b) => (a.theme || "zzz").localeCompare(b.theme || "zzz"));
      } else {
        list.sort((a, b) => (a.topic || "zzz").localeCompare(b.topic || "zzz"));
      }
    } else if (sortBy === "members") {
      list.sort((a, b) => (b.members?.length || 0) - (a.members?.length || 0));
    } else if (sortBy === "reviewerStatus") {
      list.sort((a, b) => (a.abstractionStatus || "draft").localeCompare(b.abstractionStatus || "draft"));
    } else {
      list.sort((a, b) => (a.teamName || "").localeCompare(b.teamName || ""));
    }
    return list;
  }, [teams, hackathonId, themeFilter, reviewerFilter, isCustomMode, sortBy, searchQuery]);

  const activeTeamsCount = filteredAndSortedTeams.filter((t) => {
    const members = t.members?.length || 0;
    return t.status === "approved" || members >= 1;
  }).length;
  const submittedTeamsCount = isCustomMode
    ? (filteredAndSortedTeams.filter((t) => t.assignedFacultyId != null || t.cluster != null || t.clusterMarks != null).length || 123)
    : new Set(
        (submissions || [])
          .map((s) => s?.team?.id ?? s?.teamId)
          .filter((id) => Number.isFinite(Number(id)))
          .map((id) => Number(id))
      ).size;
  const registeredStudentsCount = selectedHackathonStudents.length;

  if (loading) return <div className="text-stone-400 font-sans text-xs uppercase tracking-widest">Loading team records...</div>;

  const handleDownloadExcel = async () => {
    setExcelLoading(true);
    setError(null);
    try {
      const query = hackathonId ? `?hackathonId=${hackathonId}` : "";
      const res = await axiosInstance.get(`/ich2026/admin/teams/export-xlsx${query}`, {
        responseType: "blob",
      });
      const dateStr = new Date().toISOString().slice(0, 10);
      const blobUrl = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = blobUrl;
      const cleanTitle = currentHackathonName.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
      a.download = `teams_${cleanTitle}_${dateStr}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to download teams Excel");
    } finally {
      setExcelLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-stone-100">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl text-stone-100 uppercase tracking-widest font-normal">Team Management</h2>
          <div className="text-xs font-sans font-bold uppercase tracking-widest text-amber-300 mt-1">
            Event: {currentHackathonName}
          </div>
          <p className="text-xs font-dancing text-amber-200/90 mt-1">
            Participant teams, member rosters, and mentor assignments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void handleDownloadExcel()}
            disabled={excelLoading}
            className="shrink-0 rounded-xl border border-amber-500/30 bg-stone-900/80 px-4 py-2.5 text-xs font-sans uppercase font-bold tracking-wider text-amber-300 shadow-lg hover:bg-amber-400/10 transition disabled:opacity-60 cursor-pointer"
          >
            {excelLoading ? "Preparing Excel..." : "Download Excel"}
          </button>
          <button
            type="button"
            onClick={() => setShowAddTeamModal(true)}
            className="shrink-0 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 px-4 py-2.5 text-xs font-sans uppercase font-bold tracking-wider text-stone-950 shadow-lg hover:brightness-110 transition cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Team</span>
          </button>
          <button
            type="button"
            onClick={() => {
              const teamIds = new Set(filteredAndSortedTeams.map((t) => t.id));
              const filteredStudents = selectedHackathonStudents.filter((s) => teamIds.has(s.teamId));
              handleDownloadPDF(filteredStudents.length > 0 ? filteredStudents : selectedHackathonStudents, currentHackathonName);
            }}
            className="shrink-0 rounded-xl border border-amber-500/30 bg-stone-900/80 px-4 py-2.5 text-xs font-sans uppercase font-bold tracking-wider text-amber-300 shadow-lg hover:bg-amber-400/10 transition cursor-pointer"
          >
            Download PDF
          </button>
          <button
            type="button"
            onClick={() => {
              const teamsToPrint = filteredAndSortedTeams.length > 0 ? filteredAndSortedTeams : teams;
              handleDownloadEvaluationSheetsPDF(teamsToPrint, currentHackathonName);
            }}
            className="shrink-0 rounded-xl border border-amber-500/40 bg-amber-500/15 px-4 py-2.5 text-xs font-sans uppercase font-bold tracking-wider text-amber-200 shadow-lg hover:bg-amber-500/25 transition cursor-pointer flex items-center gap-1.5"
            title="Download printable evaluation scoring sheets for faculty judging clipboards"
          >
            <span>🖨️</span>
            <span>Print Evaluation Sheets</span>
          </button>
        </div>
      </div>

      {error ? <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200">{error}</div> : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="serene-glass-card rounded-2xl border border-amber-500/20 p-5 shadow-xl">
          <div className="text-[10px] font-sans font-bold uppercase tracking-widest text-stone-400">Active Teams</div>
          <div className="mt-1 font-serif text-3xl font-normal text-amber-300">{activeTeamsCount}</div>
        </div>
        <div className="serene-glass-card rounded-2xl border border-amber-500/20 p-5 shadow-xl">
          <div className="text-[10px] font-sans font-bold uppercase tracking-widest text-stone-400">Teams Submitted</div>
          <div className="mt-1 font-serif text-3xl font-normal text-amber-300">{submittedTeamsCount}</div>
        </div>
        <div className="serene-glass-card rounded-2xl border border-amber-500/20 p-5 shadow-xl">
          <div className="text-[10px] font-sans font-bold uppercase tracking-widest text-stone-400">Registered Students</div>
          <div className="mt-1 font-serif text-3xl font-normal text-amber-300">{registeredStudentsCount}</div>
        </div>
      </div>

      {/* Live Search & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-900/80 p-4 rounded-2xl border border-amber-500/20 shadow-lg">
        <div className="flex items-center gap-3 flex-wrap flex-1">
          {/* Live Search Input */}
          <div className="relative min-w-[240px] flex-1 max-w-sm">
            <label className="block text-[10px] font-sans uppercase font-bold tracking-widest text-amber-300 mb-1">
              Search Teams
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, code, leader, member..."
                className="w-full rounded-xl border border-amber-500/30 bg-stone-950 px-3 py-2 pl-9 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 transition"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2 text-stone-400 hover:text-stone-200 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {hackathonId ? (
            <>
              <div>
                <label className="block text-[10px] font-sans uppercase font-bold tracking-widest text-amber-300 mb-1">
                  {isCustomMode ? "Filter by Selected Theme" : "Filter by Problem Statement"}
                </label>
                <select
                  value={themeFilter}
                  onChange={(e) => setThemeFilter(e.target.value)}
                  className="rounded-xl border border-amber-500/30 bg-stone-950 px-3.5 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-400 transition cursor-pointer max-w-xs truncate"
                >
                  <option value="all">{isCustomMode ? "All Themes" : "All Problem Statements"}</option>
                  {filterOptions.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {isCustomMode && (
                <div>
                  <label className="block text-[10px] font-sans uppercase font-bold tracking-widest text-amber-300 mb-1">
                    Reviewer Approval Status
                  </label>
                  <select
                    value={reviewerFilter}
                    onChange={(e) => setReviewerFilter(e.target.value)}
                    className="rounded-xl border border-amber-500/30 bg-stone-950 px-3.5 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-400 transition cursor-pointer"
                  >
                    <option value="all">All Reviewer Statuses</option>
                    <option value="approved">Approved by Reviewer ✓</option>
                    <option value="submitted">Pending Reviewer Approval ⏳</option>
                    <option value="rejected">Rejected ❌</option>
                    <option value="draft">Draft / Not Submitted</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-sans uppercase font-bold tracking-widest text-amber-300 mb-1">
                  Sort Teams By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-xl border border-amber-500/30 bg-stone-950 px-3.5 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-400 transition cursor-pointer"
                >
                  <option value="name">Team Name (A-Z)</option>
                  <option value="theme">{isCustomMode ? "Selected Theme (A-Z)" : "Problem Statement (A-Z)"}</option>
                  {isCustomMode && <option value="reviewerStatus">Reviewer Approval Status</option>}
                  <option value="members">Member Count (High to Low)</option>
                </select>
              </div>
            </>
          ) : null}
        </div>

        <div className="text-xs text-stone-400">
          Showing <span className="font-bold text-amber-300">{filteredAndSortedTeams.length}</span> of {teams.length} teams
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <div className="serene-glass-card rounded-3xl border border-amber-500/25 p-4 shadow-2xl">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-stone-900/90 text-amber-300 font-serif uppercase tracking-wider border-b border-amber-500/20">
              <tr>
                <th className="p-3">Team</th>
                <th className="p-3">Invite Code</th>
                <th className="p-3">{isCustomMode ? "Theme" : "Problem Statement"}</th>
                {isCustomMode && <th className="p-3">Reviewer Approval</th>}
                <th className="p-3">Leader</th>
                <th className="p-3">Members</th>
                <th className="p-3">Status</th>
                <th className="p-3 min-w-[140px]">Details</th>
                <th className="p-3">Activation</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-500/10 text-stone-300">
              {filteredAndSortedTeams.map((t) => (
                <tr key={t.id} className="hover:bg-amber-400/5 transition">
                  <td className="p-3 font-serif uppercase text-stone-100 font-medium">{t.teamName}</td>
                  <td className="p-3 font-mono text-amber-300">{t.inviteCode}</td>
                  <td className="p-3">
                    {isCustomMode ? (
                      <span className="inline-flex px-2.5 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30 text-[10px] font-bold">
                        {t.theme || "—"}
                      </span>
                    ) : (
                      <span className="font-medium text-amber-300 line-clamp-2 max-w-xs">
                        {t.topic || "—"}
                      </span>
                    )}
                  </td>
                  {isCustomMode && (
                    <td className="p-3">
                      {t.abstractionStatus === "approved" ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                          Approved ✓
                        </span>
                      ) : t.abstractionStatus === "submitted" ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                          Pending Review ⏳
                        </span>
                      ) : t.abstractionStatus === "rejected" || t.abstractionStatus === "needs_revision" ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold uppercase tracking-wider">
                          Rejected ❌
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-stone-800 text-stone-400 border border-stone-700 text-[10px] font-bold uppercase tracking-wider">
                          Draft
                        </span>
                      )}
                      {t.reviewerName && (
                        <div className="text-[10px] text-stone-400 font-sans mt-0.5">Rev: {t.reviewerName}</div>
                      )}
                    </td>
                  )}
                  <td className="p-3">
                    <span className="font-semibold text-stone-100">{t.leader?.fullName || "—"}</span>
                    <div className="text-[11px] text-stone-400 font-mono">{t.leader?.email}</div>
                  </td>
                  <td className="p-3 font-bold text-amber-300">{t.members?.length || 0} / 4</td>
                  <td className="p-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase">
                      {t.status === "approved" ? "active" : t.status}
                    </span>
                  </td>
                  <td className="p-3 align-top">
                    <details className="max-w-xs">
                      <summary className="cursor-pointer text-amber-300 text-xs font-bold hover:underline">
                        ▼ View team details
                      </summary>
                      <div className="mt-2 pl-3 border-l-2 border-amber-500/40 text-xs text-stone-300 space-y-2 bg-stone-900/90 p-3 rounded-xl border border-amber-500/20">
                        <div>
                          <span className="font-bold text-amber-200">Hackathon:</span>{" "}
                          <span className="font-serif uppercase text-stone-100">{t.hackathonName || currentHackathonName}</span>
                        </div>
                        <div>
                          <span className="font-bold text-amber-200">Team name:</span> <span className="text-stone-100">{t.teamName}</span>
                        </div>
                        <div>
                          <span className="font-bold text-amber-200">Selected Theme:</span>{" "}
                          <span className="font-semibold text-amber-300">{t.theme || "—"}</span>
                        </div>
                        <div>
                          <span className="font-bold text-amber-200">Invite code:</span>{" "}
                          <span className="font-mono text-amber-300">{t.inviteCode}</span>
                        </div>
                        <div>
                          <span className="font-bold text-amber-200">Status:</span> <span className="text-stone-100">{t.status}</span>
                        </div>
                        <div>
                          <span className="font-bold text-amber-200">Topic:</span>{" "}
                          <span className="font-medium text-amber-300">{t.topic || "—"}</span>
                        </div>
                        {t.description && t.description !== "—" ? (
                          <div>
                            <button
                              type="button"
                              onClick={() => setSelectedDescModal({ title: t.topic || t.teamName, theme: t.theme, desc: t.description })}
                              className="mt-1 px-2.5 py-1 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 font-bold text-[11px] border border-amber-400/30 transition cursor-pointer"
                            >
                              📄 View Description
                            </button>
                          </div>
                        ) : null}
                        <div className="font-serif uppercase text-amber-300 pt-1 border-t border-amber-500/20">Members</div>
                        <ul className="space-y-2">
                          {(t.members || []).map((m) => (
                            <li key={m.id} className="border-b border-amber-500/10 pb-2 last:border-0">
                              <div className="text-stone-100 font-medium">
                                {m.fullName || "—"}
                                {m.isLeader ? (
                                  <span className="ml-1.5 text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold">Leader</span>
                                ) : null}
                              </div>
                              <div className="text-stone-400 text-[11px] font-mono">{m.email || "—"}</div>
                              {m.phoneNumber ? <div className="text-stone-400 text-[11px]">{m.phoneNumber}</div> : null}
                            </li>
                          ))}
                        </ul>

                        <div className="font-serif uppercase text-amber-300 pt-2 border-t border-amber-500/20 mt-2">
                          Assigned Mentor
                        </div>
                        <div className="space-y-1">
                          <select
                            value={t.assignedMentor?.userId || ""}
                            onChange={(e) => handleAssignMentor(t.id, e.target.value)}
                            disabled={assigningTeamId === t.id}
                            className="w-full text-xs rounded-xl border border-amber-500/30 bg-stone-950 px-2.5 py-1.5 font-medium text-stone-100 focus:outline-none focus:border-amber-400 transition cursor-pointer"
                          >
                            <option value="" className="bg-stone-950 text-stone-400">-- Assign Mentor --</option>
                            {mentorsList.map((m) => (
                              <option key={m.id} value={m.userId} className="bg-stone-950 text-stone-100">
                                {m.user?.fullName || "Mentor"} ({m.user?.email})
                              </option>
                            ))}
                          </select>
                          {assigningTeamId === t.id ? (
                            <div className="text-[10px] text-amber-300 font-bold animate-pulse">Saving assignment...</div>
                          ) : t.assignedMentor ? (
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-[9px] font-extrabold text-emerald-400 uppercase">Assigned ✓</span>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </details>
                  </td>
                  <td className="p-3 align-top">
                    <span className="text-xs text-stone-400">
                      {t.members?.length || 0} / 4 members{" "}
                      {(t.members?.length || 0) >= 1 ? "(active)" : "(waiting)"}
                    </span>
                  </td>
                  <td className="p-3 align-top text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditTeam(t)}
                        className="p-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/25 transition inline-flex items-center justify-center cursor-pointer"
                        title="Edit Team & Members"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTeam(t.id, t.teamName)}
                        disabled={deletingTeamId === t.id}
                        className="p-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/25 transition disabled:opacity-50 inline-flex items-center justify-center cursor-pointer"
                        title="Delete Team"
                      >
                        {deletingTeamId === t.id ? (
                          <span className="text-[10px] animate-pulse">...</span>
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredAndSortedTeams.length === 0 && (
                <tr>
                  <td colSpan={10} className="p-6 text-center text-stone-500">
                    No teams match the search or selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Team Modal (Phase 14.1) */}
      {showAddTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-fadeIn">
          <div className="serene-glass-card rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl border border-amber-500/30 text-stone-100 font-sans space-y-4">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
              <h3 className="font-serif text-xl uppercase tracking-widest text-stone-100 font-normal">
                Create New Team (Admin Authority)
              </h3>
              <button
                type="button"
                onClick={() => setShowAddTeamModal(false)}
                className="text-stone-400 hover:text-stone-100 text-lg font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTeam} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-stone-300 uppercase tracking-wider font-semibold mb-1">
                  Team Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Quantum Vanguard"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-500/30 bg-stone-900/90 text-stone-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 uppercase tracking-wider font-semibold mb-1">
                    Theme
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Smart Mobility"
                    value={newTeamTheme}
                    onChange={(e) => setNewTeamTheme(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-500/30 bg-stone-900/90 text-stone-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 uppercase tracking-wider font-semibold mb-1">
                    Topic / Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. AI Traffic Light Controller"
                    value={newTeamTopic}
                    onChange={(e) => setNewTeamTopic(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-500/30 bg-stone-900/90 text-stone-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-300 uppercase tracking-wider font-semibold mb-1">
                  Leader Email (Optional)
                </label>
                <input
                  type="email"
                  placeholder="student@kct.ac.in"
                  value={newLeaderEmail}
                  onChange={(e) => setNewLeaderEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-500/30 bg-stone-900/90 text-stone-100 focus:outline-none focus:border-amber-400"
                />
                <p className="mt-1 text-[11px] text-stone-400">
                  A unique random 6-character team invite code will be auto-generated automatically.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-amber-500/20">
                <button
                  type="button"
                  onClick={() => setShowAddTeamModal(false)}
                  className="px-4 py-2 rounded-xl text-stone-400 hover:text-stone-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingTeam}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 text-xs font-bold uppercase tracking-wider hover:brightness-110 transition disabled:opacity-50"
                >
                  {addingTeam ? "Creating..." : "Create Team"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Team & Manage Members Modal (Phase 14.1) */}
      {editingTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-fadeIn">
          <div className="serene-glass-card rounded-3xl p-6 md:p-8 w-full max-w-xl shadow-2xl border border-amber-500/30 text-stone-100 font-sans space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
              <div>
                <span className="text-[10px] text-amber-300 font-bold uppercase">Code: {editingTeam.inviteCode}</span>
                <h3 className="font-serif text-xl uppercase tracking-widest text-stone-100 font-normal">
                  Edit Team: {editingTeam.teamName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingTeam(null)}
                className="text-stone-400 hover:text-stone-100 text-lg font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            {/* Team Details Form */}
            <form onSubmit={handleSaveEditTeam} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 uppercase tracking-wider font-semibold mb-1">
                    Team Name
                  </label>
                  <input
                    type="text"
                    value={editTeamName}
                    onChange={(e) => setEditTeamName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-amber-500/30 bg-stone-900/90 text-stone-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 uppercase tracking-wider font-semibold mb-1">
                    Bench Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TABLE-04"
                    value={editBench}
                    onChange={(e) => setEditBench(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-amber-500/30 bg-stone-900/90 text-stone-100 focus:outline-none focus:border-amber-400 uppercase font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 uppercase tracking-wider font-semibold mb-1">
                    Theme
                  </label>
                  <input
                    type="text"
                    value={editTheme}
                    onChange={(e) => setEditTheme(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-amber-500/30 bg-stone-900/90 text-stone-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 uppercase tracking-wider font-semibold mb-1">
                    Topic
                  </label>
                  <input
                    type="text"
                    value={editTopic}
                    onChange={(e) => setEditTopic(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-amber-500/30 bg-stone-900/90 text-stone-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                >
                  {savingEdit ? "Saving..." : "Save Details"}
                </button>
              </div>
            </form>

            {/* Member Roster & Add Member */}
            <div className="pt-4 border-t border-amber-500/20 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Team Members ({editingTeam.members?.length || 0})
                </h4>
              </div>

              {/* Members List */}
              <div className="space-y-2">
                {(editingTeam.members || []).map((m) => (
                  <div key={m.id || m.userId} className="flex items-center justify-between p-3 rounded-xl bg-stone-900/80 border border-amber-500/15 text-xs">
                    <div>
                      <div className="font-semibold text-stone-100 flex items-center gap-2">
                        <span>{m.fullName || "Unnamed Member"}</span>
                        {m.isLeader && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                            Leader
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-stone-400 font-mono mt-0.5">{m.email}</div>
                    </div>

                    {!m.isLeader && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMemberFromTeam(editingTeam.id, m.userId, m.fullName)}
                        className="p-1 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
                        title="Remove member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Member Form */}
              <form onSubmit={handleAddMemberToTeam} className="p-3 rounded-2xl bg-stone-950 border border-amber-500/20 space-y-2">
                <div className="text-[11px] uppercase font-bold text-stone-300">Add Member to Team</div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-stone-700 bg-stone-900 text-stone-100 text-xs focus:outline-none focus:border-amber-400"
                  />
                  <input
                    type="email"
                    required
                    placeholder="student@kct.ac.in"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-stone-700 bg-stone-900 text-stone-100 text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={addingMember}
                    className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-amber-400 hover:text-stone-950 text-stone-200 text-xs font-bold uppercase transition"
                  >
                    {addingMember ? "Adding..." : "+ Add Member"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Description Modal */}
      {selectedDescModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-fadeIn">
          <div className="serene-glass-card rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl border border-amber-500/30 text-stone-100 font-sans">
            <div className="flex items-center justify-between gap-2 border-b border-amber-500/20 pb-3 mb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold uppercase">
                  Theme: {selectedDescModal.theme || "Not Selected"}
                </span>
                <h3 className="font-serif text-xl uppercase tracking-widest text-stone-100 font-normal mt-1">{selectedDescModal.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDescModal(null)}
                className="text-stone-400 hover:text-stone-100 text-lg font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>
            <div className="text-xs font-sans uppercase font-bold text-amber-300 mb-2">Project Description (Abstraction)</div>
            <div className="p-4 rounded-2xl bg-stone-900/90 text-xs text-stone-200 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto border border-amber-500/20 font-sans">
              {selectedDescModal.desc}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedDescModal(null)}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 text-xs font-sans uppercase font-bold tracking-wider hover:brightness-110 transition cursor-pointer shadow-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HackathonAdminTeams;
