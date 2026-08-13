import React, { useEffect, useMemo, useState } from "react";
import { axiosInstance } from "../../lib/axios.js";
import { handleDownloadPDF } from "../../lib/hackathonDownloadStudentsPdf.js";

import { useLocation } from "react-router-dom";

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
  const [selectedTeamModal, setSelectedTeamModal] = useState(null);
  const [themeFilter, setThemeFilter] = useState("all");
  const [reviewerFilter, setReviewerFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  const [problems, setProblems] = useState([]);

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
      const set = new Set();
      teams.forEach((t) => { if (t.theme) set.add(t.theme); });
      [
        "Disaster Resilience",
        "Waste Management",
        "Energy Solutions",
        "Smart Agriculture",
        "Pollution Control",
        "Smart Mobility & Parking",
        "Smart Healthcare",
      ].forEach((t) => set.add(t));
      return Array.from(set);
    } else {
      const set = new Set();
      problems.forEach((p) => { if (p.title) set.add(p.title); });
      teams.forEach((t) => { if (t.topic) set.add(t.topic); });
      return Array.from(set);
    }
  }, [hackathonId, isCustomMode, teams, problems]);

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
  }, [teams, hackathonId, themeFilter, reviewerFilter, isCustomMode, sortBy]);

  const activeTeamsCount = filteredAndSortedTeams.filter((t) => {
    const members = t.members?.length || 0;
    return t.status === "approved" || members >= 1;
  }).length;
  const submittedTeamsCount = new Set(
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
            onClick={() => handleDownloadPDF(selectedHackathonStudents, currentHackathonName)}
            className="shrink-0 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 px-4 py-2.5 text-xs font-sans uppercase font-bold tracking-wider text-stone-950 shadow-lg hover:brightness-110 transition cursor-pointer"
          >
            Download PDF
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

      {/* Filter & Sorting Controls (Shown ONLY when a specific hackathon is selected) */}
      {hackathonId ? (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-900/80 p-4 rounded-2xl border border-amber-500/20 shadow-lg">
          <div className="flex items-center gap-3 flex-wrap">
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
          </div>

          <div className="text-xs text-stone-400">
            Showing <span className="font-bold text-amber-300">{filteredAndSortedTeams.length}</span> of {teams.length} teams
          </div>
        </div>
      ) : null}

      <div className="mt-6 w-full serene-glass-card rounded-3xl border border-amber-500/25 p-4 sm:p-6 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-stone-900/90 text-amber-300 font-serif uppercase tracking-wider border-b border-amber-500/20 text-[11px]">
              <tr>
                <th className="px-4 py-3.5 whitespace-nowrap">Team</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Invite Code</th>
                <th className="px-4 py-3.5">{isCustomMode ? "Problem Statement" : "Problem Statement"}</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Leader</th>
                <th className="px-4 py-3.5 text-center whitespace-nowrap">Members</th>
                <th className="px-4 py-3.5 text-center whitespace-nowrap">Status</th>
                <th className="px-4 py-3.5 text-center whitespace-nowrap">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-500/10 text-stone-300">
              {filteredAndSortedTeams.map((t) => (
                <tr key={t.id} className="hover:bg-amber-400/5 transition">
                  <td className="px-4 py-3.5 font-serif uppercase text-stone-100 font-medium whitespace-nowrap">{t.teamName}</td>
                  <td className="px-4 py-3.5 font-mono text-amber-300 whitespace-nowrap select-all">{t.inviteCode}</td>
                  <td className="px-4 py-3.5">
                    {isCustomMode ? (
                      <div className="flex flex-col gap-1 items-start">
                        <span className="inline-flex px-2.5 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30 text-[11px] font-bold">
                          {t.theme || "—"}
                        </span>
                        {t.abstractionStatus === "approved" ? (
                          <span className="text-[10px] font-bold text-emerald-400">
                            Approved ✓ {t.reviewerName ? `(${t.reviewerName})` : ""}
                          </span>
                        ) : t.abstractionStatus === "submitted" ? (
                          <span className="text-[10px] font-bold text-amber-400 animate-pulse">
                            Pending Review ⏳
                          </span>
                        ) : t.abstractionStatus === "rejected" || t.abstractionStatus === "needs_revision" ? (
                          <span className="text-[10px] font-bold text-rose-400">
                            Rejected ❌
                          </span>
                        ) : (
                          <span className="text-[10px] text-stone-500 font-sans">
                            Draft / Not Submitted
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="font-medium text-amber-300 line-clamp-2 max-w-xs">
                        {t.topic || "—"}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-semibold text-stone-100">{t.leader?.fullName || "—"}</span>
                    <div className="text-[11px] text-stone-400 font-mono">{t.leader?.email}</div>
                  </td>
                  <td className="px-4 py-3.5 font-bold text-amber-300 text-center whitespace-nowrap">{t.members?.length || 0} / 4</td>
                  <td className="px-4 py-3.5 text-center whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase">
                      {t.status === "approved" ? "active" : t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setSelectedTeamModal(t)}
                      className="px-3.5 py-1.5 rounded-full bg-stone-900 hover:bg-amber-400/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition cursor-pointer inline-flex items-center gap-1.5 shadow-sm hover:scale-105 active:scale-95"
                    >
                      <span>👁️ View Details</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredAndSortedTeams.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-stone-500">
                    No teams match the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Full Team Details Modal */}
      {selectedTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="serene-glass-card rounded-3xl p-6 md:p-8 w-full max-w-xl shadow-2xl border border-amber-500/30 text-stone-100 font-sans my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between gap-2 border-b border-amber-500/20 pb-3 mb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold uppercase">
                  Invite Code: <span className="font-mono">{selectedTeamModal.inviteCode}</span>
                </span>
                <h3 className="font-serif text-xl uppercase tracking-widest text-stone-100 font-bold mt-1">{selectedTeamModal.teamName}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTeamModal(null)}
                className="text-stone-400 hover:text-stone-100 text-lg font-bold px-2 py-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-stone-200">
              <div className="grid grid-cols-2 gap-3 bg-stone-900/60 p-4 rounded-2xl border border-amber-500/10">
                <div>
                  <span className="text-amber-300 font-bold uppercase text-[10px] block">Event Name</span>
                  <span className="font-semibold text-stone-100">{selectedTeamModal.hackathonName || currentHackathonName}</span>
                </div>
                <div>
                  <span className="text-amber-300 font-bold uppercase text-[10px] block">Selected Theme</span>
                  <span className="font-semibold text-amber-200">{selectedTeamModal.theme || "—"}</span>
                </div>
                <div>
                  <span className="text-amber-300 font-bold uppercase text-[10px] block">Team Status</span>
                  <span className="uppercase font-bold text-emerald-400">{selectedTeamModal.status}</span>
                </div>
                <div>
                  <span className="text-amber-300 font-bold uppercase text-[10px] block">Reviewer Status</span>
                  <span className="uppercase font-bold text-amber-300">{selectedTeamModal.abstractionStatus || "Draft"}</span>
                </div>
              </div>

              {selectedTeamModal.topic && (
                <div className="bg-stone-900/60 p-4 rounded-2xl border border-amber-500/10">
                  <span className="text-amber-300 font-bold uppercase text-[10px] block mb-1">Problem Topic / Title</span>
                  <span className="font-semibold text-stone-100">{selectedTeamModal.topic}</span>
                </div>
              )}

              {selectedTeamModal.description && selectedTeamModal.description !== "—" && (
                <div className="bg-stone-900/60 p-4 rounded-2xl border border-amber-500/10">
                  <span className="text-amber-300 font-bold uppercase text-[10px] block mb-1">Problem Description / Abstraction</span>
                  <p className="text-stone-300 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">{selectedTeamModal.description}</p>
                </div>
              )}

              <div className="bg-stone-900/60 p-4 rounded-2xl border border-amber-500/10 space-y-3">
                <span className="text-amber-300 font-serif uppercase font-bold text-sm block border-b border-amber-500/20 pb-2">
                  Team Members Roster ({selectedTeamModal.members?.length || 0} / 4)
                </span>
                <ul className="space-y-2.5">
                  {(selectedTeamModal.members || []).map((m) => (
                    <li key={m.id || m.userId} className="flex items-center justify-between border-b border-amber-500/10 pb-2 last:border-0">
                      <div>
                        <div className="font-semibold text-stone-100 flex items-center gap-2">
                          <span>{m.fullName || "—"}</span>
                          {m.isLeader && (
                            <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[9px] font-bold uppercase">
                              Leader
                            </span>
                          )}
                        </div>
                        <div className="text-stone-400 font-mono text-[11px]">{m.email || "—"}</div>
                      </div>
                      {m.phoneNumber && <div className="text-stone-400 text-xs font-mono">{m.phoneNumber}</div>}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-stone-900/60 p-4 rounded-2xl border border-amber-500/10 space-y-2">
                <span className="text-amber-300 font-serif uppercase font-bold text-sm block">Assign Faculty Mentor</span>
                <select
                  value={selectedTeamModal.assignedMentor?.userId || ""}
                  onChange={(e) => {
                    handleAssignMentor(selectedTeamModal.id, e.target.value);
                    setSelectedTeamModal((prev) =>
                      prev
                        ? {
                            ...prev,
                            assignedMentor: e.target.value
                              ? { userId: e.target.value }
                              : null,
                          }
                        : null
                    );
                  }}
                  disabled={assigningTeamId === selectedTeamModal.id}
                  className="w-full text-xs rounded-xl border border-amber-500/30 bg-stone-950 px-3 py-2 font-medium text-stone-100 focus:outline-none focus:border-amber-400 transition cursor-pointer"
                >
                  <option value="" className="bg-stone-950 text-stone-400">-- Select Faculty Mentor --</option>
                  {mentorsList.map((m) => (
                    <option key={m.id} value={m.userId} className="bg-stone-950 text-stone-100">
                      {m.user?.fullName || "Mentor"} ({m.user?.email})
                    </option>
                  ))}
                </select>
                {assigningTeamId === selectedTeamModal.id && (
                  <div className="text-[10px] text-amber-300 font-bold animate-pulse">Saving mentor assignment...</div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedTeamModal(null)}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 text-xs font-sans uppercase font-bold tracking-wider hover:brightness-110 transition cursor-pointer shadow-lg"
              >
                Close
              </button>
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
