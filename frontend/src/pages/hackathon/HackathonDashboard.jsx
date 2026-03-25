import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { axiosInstance } from "../../lib/axios.js";
import { getHackathonTemplatePdfHref } from "../../lib/config.js";
import { useHackathonAuthStore } from "../../store/useHackathonAuthStore";
import { AlertTriangle } from "lucide-react";

const HackathonDashboard = () => {
  const { hackathonUser } = useHackathonAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const templatePdfHref = getHackathonTemplatePdfHref();

  const mapSubmissionStatus = (s) => {
    if (!s) return null;
    if (s === "submitted" || s === "under_review") return "pending";
    return s;
  };

  const role = hackathonUser?.role;

  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window === "undefined") return "team";
    const t = new URLSearchParams(window.location.search).get("tab");
    if (t && ["team", "problems", "submit", "status"].includes(t)) return t;
    return "team";
  });

  const changeTab = (key) => {
    setActiveTab(key);
    setSearchParams({ tab: key });
  };
  const [guidelinesOpen, setGuidelinesOpen] = useState(false);

  const [team, setTeam] = useState(null);
  const [teamLoading, setTeamLoading] = useState(true);

  const [problems, setProblems] = useState([]);
  const [problemsLoading, setProblemsLoading] = useState(false);

  const [statusData, setStatusData] = useState({ team: null, submissions: [] });
  const [statusLoading, setStatusLoading] = useState(false);

  const [selectedProblem, setSelectedProblem] = useState(null);

  const selectionKey = useMemo(() => {
    const keyId = team?.id || hackathonUser?.id;
    return `hackathon_selected_problem_${keyId || "unknown"}`;
  }, [team?.id, hackathonUser?.id]);

  // Submit form state
  const [submissionStep, setSubmissionStep] = useState(1);
  const [whyParticipate, setWhyParticipate] = useState("");
  const [problemToSolve, setProblemToSolve] = useState("");
  const [plannedTech, setPlannedTech] = useState("");
  const [workedBefore, setWorkedBefore] = useState("no");
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [phase, setPhase] = useState("poc");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const loadSelectedProblem = () => {
    try {
      const raw = localStorage.getItem(selectionKey);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const refreshTeam = async () => {
    setTeamLoading(true);
    try {
      const res = await axiosInstance.get("/ich2026/team");
      setTeam(res.data.team || null);
    } catch {
      setTeam(null);
    } finally {
      setTeamLoading(false);
    }
  };

  const refreshStatus = async () => {
    setStatusLoading(true);
    try {
      const res = await axiosInstance.get("/ich2026/status");
      setStatusData(res.data || { team: null, submissions: [] });
    } catch {
      setStatusData({ team: null, submissions: [] });
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    // Load team + status when the dashboard mounts.
    refreshTeam();
    refreshStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hackathonUser?.id]);

  const teamHasSubmitted = (statusData?.submissions || []).length > 0;

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (role === "mentor") {
      if (tab && !["team", "status"].includes(tab)) {
        setActiveTab("team");
        setSearchParams({ tab: "team" });
        return;
      }
      if (tab && ["team", "status"].includes(tab)) setActiveTab(tab);
      return;
    }
    if (role === "student" && teamHasSubmitted && tab === "submit") {
      setActiveTab("status");
      setSearchParams({ tab: "status" });
      return;
    }
    if (!tab) return;
    if (["team", "problems", "submit", "status"].includes(tab)) setActiveTab(tab);
  }, [searchParams, role, setSearchParams, teamHasSubmitted]);

  useEffect(() => {
    const sel = loadSelectedProblem();
    setSelectedProblem(sel || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionKey, team?.id]);

  const studentTabs = useMemo(() => {
    if (teamHasSubmitted) {
      return [
        { key: "team", label: "Team" },
        { key: "problems", label: "Problems" },
        { key: "status", label: "Status" },
      ];
    }
    return [
      { key: "team", label: "Team" },
      { key: "problems", label: "Problems" },
      { key: "submit", label: "Submit" },
      { key: "status", label: "Status" },
    ];
  }, [teamHasSubmitted]);

  const mentorTabs = [
    { key: "team", label: "Team" },
    { key: "status", label: "Status" },
  ];

  const tabs = role === "mentor" ? mentorTabs : studentTabs;

  const selectedProblemId = selectedProblem?.problemId || null;

  // Backend auto-activates team status on submission when needed.
  const canSubmit = Boolean(team);
  const submissionBlockedReason = !team
    ? "You are not part of any team yet."
    : teamHasSubmitted
      ? "Your team has already submitted. Only one submission is allowed per team."
      : null;

  const fetchProblems = async () => {
    if (problemsLoading) return;
    setProblemsLoading(true);
    try {
      const res = await axiosInstance.get("/ich2026/problems");
      setProblems(res.data.problems || []);
    } catch {
      setProblems([]);
    } finally {
      setProblemsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "problems" && role === "student") {
      fetchProblems();
      refreshStatus();
    }
    if (activeTab === "status") refreshStatus();
    if (activeTab === "submit" && role === "student") refreshStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const teamHasSubmissionForProblem = (pid) =>
    (statusData?.submissions || []).some((s) => Number(s.problemId) === Number(pid));

  const problemIsFull = (p) => {
    const limit = p.teamRegistrationLimit;
    const reg = p.registeredTeams ?? 0;
    if (limit == null || limit <= 0) return false;
    if (reg < limit) return false;
    return !teamHasSubmissionForProblem(p.id);
  };

  const onSelectProblem = (p) => {
    if (teamHasSubmitted) return;
    const payload = {
      problemId: p.id,
      title: p.title,
      sector: p.sector,
      mentor: p.mentor || null,
      teamRegistrationLimit: p.teamRegistrationLimit,
      registeredTeams: p.registeredTeams,
    };
    try {
      localStorage.setItem(selectionKey, JSON.stringify(payload));
    } catch {
      // ignore
    }
    setSelectedProblem(payload);
    resetSubmissionSteps();
    setSubmitError(null);
    changeTab("submit");
  };

  const submitAllowed = role === "student" && canSubmit && !!selectedProblemId && !teamHasSubmitted;

  const resetSubmissionSteps = () => {
    setSubmissionStep(1);
    setWhyParticipate("");
    setProblemToSolve("");
    setPlannedTech("");
    setWorkedBefore("no");
    setAgreedTerms(false);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!team) return setSubmitError("You are not part of any team yet.");
    if (!selectedProblemId) return setSubmitError("Please select a problem first.");

    if (!files || files.length === 0) return setSubmitError("Upload at least one file.");

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("problemId", String(selectedProblemId));
      fd.append("phase", phase);
      fd.append("description", description || "");
      fd.append("whyParticipate", whyParticipate || "");
      fd.append("problemToSolve", problemToSolve || "");
      fd.append("plannedTech", plannedTech || "");
      fd.append("workedBefore", workedBefore || "");
      fd.append("agreedTerms", String(Boolean(agreedTerms)));

      for (const f of files) {
        if (phase === "poc") fd.append("pocFiles", f);
        else fd.append("prototypeFiles", f);
      }

      await axiosInstance.post("/ich2026/submit", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await refreshStatus();
      changeTab("status");
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const goToSubmitStep2 = () => {
    setSubmitError(null);
    if (!whyParticipate.trim()) return setSubmitError("Please answer why your team wants to participate.");
    if (!problemToSolve.trim()) return setSubmitError("Please describe the problem your team is trying to solve.");
    if (!plannedTech.trim()) return setSubmitError("Please enter technologies your team plans to use.");
    if (!agreedTerms) return setSubmitError("You must agree to the terms and conditions to continue.");
    setSubmissionStep(2);
  };

  const latestSubmission = (statusData?.submissions || [])[0] || null;
  const displayedSubmissionStatus = mapSubmissionStatus(latestSubmission?.status) || latestSubmission?.status || null;
  const getTeamStatusBadge = (status) => {
    const key = String(status || "").toLowerCase();
    if (key === "approved") return "bg-[#ECFDF3] text-[#15803D] border border-[#22C55E]/30";
    if (key === "pending") return "bg-[#FFFBEB] text-[#92400E] border border-[#F59E0B]/30";
    if (key === "rejected") return "bg-[#FEF2F2] text-[#B91C1C] border border-[#EF4444]/30";
    return "bg-[#F5F7FB] text-gray-700 border border-[#E2E8F0]";
  };

  const AlertCard = ({ tone = "warning", children }) => {
    const isSuccess = tone === "success";
    return (
      <div
        className={[
          "flex items-start gap-3 rounded-2xl border p-4 shadow-sm",
          isSuccess
            ? "bg-[#ECFDF3] border-[#22C55E]/20"
            : "bg-[#FFFBEB] border-[#F59E0B]/20",
        ].join(" ")}
      >
        <AlertTriangle className={`mt-0.5 w-5 h-5 ${isSuccess ? "text-[#22C55E]" : "text-[#F59E0B]"}`} />
        <div className="text-sm font-medium text-gray-800">{children}</div>
      </div>
    );
  };

  const getSubmissionFiles = (s) => {
    if (!s) return [];
    if (s.submissionPhase === "poc") return Array.isArray(s.pocFilePaths) ? s.pocFilePaths : [];
    return Array.isArray(s.prototypeFilePaths) ? s.prototypeFilePaths : [];
  };

  const fileNameFromUrl = (u) => {
    try {
      const last = String(u || "").split("/").pop();
      return decodeURIComponent(last || "");
    } catch {
      return String(u || "");
    }
  };

  const mentorApproveSubmission = async (submissionId) => {
    try {
      const res = await axiosInstance.post(`/ich2026/mentor/submissions/${submissionId}/approval`, {
        approved: true,
      });
      const updated = res.data?.submission;
      if (!updated?.id) return;
      setStatusData((prev) => ({
        ...(prev || {}),
        submissions: (prev?.submissions || []).map((s) => (Number(s.id) === Number(updated.id) ? { ...s, ...updated } : s)),
      }));
    } catch (e) {
      setSubmitError(e.response?.data?.message || "Failed to approve submission");
    }
  };

  return (
    <div className="text-gray-700">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600 mt-1">Track your team, select problems, and submit PoC / Prototype.</p>
        </div>

        {!team && role === "student" ? (
          <div className="flex gap-3">
            <Link
              to="/ich2026/create-team"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white font-semibold hover:from-[#1D4ED8] hover:to-[#2563EB] transition shadow-sm hover:shadow-md"
            >
              Create Team
            </Link>
            <Link
              to="/ich2026/join-team"
              className="px-4 py-2 rounded-xl border border-[#E2E8F0] bg-white text-gray-800 font-semibold hover:bg-[#F5F7FB] transition shadow-sm hover:shadow-md"
            >
              Join Team
            </Link>
          </div>
        ) : null}
      </div>

      <div className="mt-5 hidden md:flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => changeTab(t.key)}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition border focus:outline-none focus:ring-2 focus:ring-[#2563EB]/25 ${
              activeTab === t.key
                ? "bg-[#2563EB] text-white border-[#2563EB]"
                : "bg-white border-[#E2E8F0] text-gray-800 hover:bg-[#F5F7FB]"
            }`}
          >
            {t.label}
          </button>
        ))}
        {role === "student" ? (
          <button
            onClick={() => setGuidelinesOpen(true)}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition border focus:outline-none focus:ring-2 focus:ring-[#2563EB]/25 bg-white border-[#E2E8F0] text-gray-800 hover:bg-[#F5F7FB]`}
          >
            Guidelines
          </button>
        ) : null}
      </div>

      {/* TEAM TAB */}
      {activeTab === "team" ? (
        <div className="mt-5">
          {teamLoading ? (
            <div className="text-gray-600">Loading team...</div>
          ) : !team ? (
            <AlertCard>
              <div className="font-semibold text-gray-900">You are not part of any team yet.</div>
              <div className="mt-1 text-sm text-gray-600">
                Participants form teams themselves. Any participant can create a team, and the creator automatically becomes Team Leader.
                Once you join a team, you can submit immediately (team approval is automatic).
              </div>
            </AlertCard>
          ) : (
            <div className="mt-3 bg-white rounded-3xl border border-[#E2E8F0] p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getTeamStatusBadge(team.status)}`}>
                    {team.status}
                  </div>
                  <div className="text-2xl font-extrabold text-gray-900 mt-1">{team.teamName}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Invite Code: <span className="font-mono">{team.inviteCode}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Submission Status</div>
                  <div className="mt-1 px-3 py-1 rounded-full bg-[#F5F7FB] border border-[#E2E8F0] text-gray-800 text-xs font-semibold">
                    {displayedSubmissionStatus || "Not submitted yet"}
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <div className="font-bold text-gray-900">Team Members</div>
                <div className="mt-3 space-y-2">
                  {(team.members || []).map((m) => (
                    <div
                      key={m.userId}
                      className="flex items-start justify-between gap-3 bg-[#F5F7FB] border border-[#E2E8F0] rounded-2xl p-4"
                    >
                      <div>
                        <div className="font-semibold text-gray-900">{m.member?.fullName || "Member"}</div>
                        <div className="text-xs text-gray-600">{m.member?.email}</div>
                      </div>
                      {m.isLeader ? (
                        <div className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold whitespace-nowrap">
                          Leader
                        </div>
                      ) : (
                        <div className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold whitespace-nowrap">
                          Member
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <div className="font-bold text-gray-900">Selected Problem</div>
                <div className="mt-2 text-gray-700">
                  {selectedProblem ? selectedProblem.title : "Not selected yet"}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* PROBLEMS TAB */}
      {activeTab === "problems" && role === "student" ? (
        <div className="mt-5">
          {teamHasSubmitted ? (
            <div className="mb-4 rounded-2xl border border-[#22C55E]/25 bg-[#ECFDF3] px-4 py-3 text-sm text-gray-800">
              Your team has already submitted. You can review your entry under the <strong>Status</strong> tab.
            </div>
          ) : null}
          {problemsLoading ? (
            <div className="text-gray-600">Loading problems...</div>
          ) : problems.length ? (
            <div className="grid md:grid-cols-2 gap-5">
              {problems.map((p) => (
                <div key={p.id} className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm p-5">
                  <div className="text-xs font-semibold text-[#2563EB]">{p.sector || "Category"}</div>
                  <div className="text-lg font-bold text-gray-900 mt-2">{p.title}</div>
                  <div className="mt-1 text-xs text-gray-600">Mentor: {p.mentor?.user?.fullName || "Not assigned"}</div>
                  <div className="text-gray-700 mt-3 text-sm whitespace-pre-line">
                    {p.description?.slice(0, 220)}
                    {p.description?.length > 220 ? "..." : ""}
                  </div>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                    <div className="text-xs text-gray-500">
                      {p.teamRegistrationLimit != null && p.teamRegistrationLimit > 0 ? (
                        <>
                          Teams: {p.registeredTeams ?? 0} / {p.teamRegistrationLimit}
                        </>
                      ) : (
                        <>Teams registered: {p.registeredTeams ?? 0}</>
                      )}
                      {problemIsFull(p) ? (
                        <span className="block text-amber-700 font-semibold mt-1">Registration full</span>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      disabled={problemIsFull(p) || teamHasSubmitted}
                      onClick={() => onSelectProblem(p)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white font-semibold hover:from-[#1D4ED8] hover:to-[#2563EB] transition shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {teamHasSubmitted ? "Submitted" : problemIsFull(p) ? "Full" : "Select"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 shadow-sm text-gray-700">
              No problems available yet.
            </div>
          )}
        </div>
      ) : null}

      {/* SUBMIT TAB */}
      {activeTab === "submit" && role === "student" ? (
        <div className="mt-5">
          {teamLoading || problemsLoading ? <div className="text-gray-600">Loading...</div> : null}
          {!team ? (
            <AlertCard tone="warning">You are not part of any team yet. Create or join a team first.</AlertCard>
          ) : team.status === "pending" ? (
            <AlertCard tone="warning">Team approval is automatic. You can submit now.</AlertCard>
          ) : null}

          <div className="mt-4 bg-white rounded-3xl border border-[#E2E8F0] p-4 sm:p-6 shadow-sm" aria-disabled={!submitAllowed}>
            {!submitAllowed ? (
              <div className="mb-4">
                <AlertCard tone="warning">
                  {submissionBlockedReason || "Select a problem and ensure your team is active."}
                </AlertCard>
              </div>
            ) : null}

            <div className="mb-5 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFF] p-3 sm:p-4">
              <div className="grid grid-cols-2 gap-3">
                <div
                  className={`rounded-xl border px-3 py-3 text-center transition ${
                    submissionStep === 1
                      ? "bg-[#2563EB] text-white border-[#2563EB]"
                      : "bg-white text-gray-700 border-[#E2E8F0]"
                  }`}
                >
                  <div className="text-xs font-semibold uppercase tracking-wide">Step 1</div>
                  <div className="text-sm font-bold mt-0.5">Questions</div>
                </div>
                <div
                  className={`rounded-xl border px-3 py-3 text-center transition ${
                    submissionStep === 2
                      ? "bg-[#2563EB] text-white border-[#2563EB]"
                      : "bg-white text-gray-700 border-[#E2E8F0]"
                  }`}
                >
                  <div className="text-xs font-semibold uppercase tracking-wide">Step 2</div>
                  <div className="text-sm font-bold mt-0.5">Submit</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {submissionStep === 1 ? (
                <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 sm:p-5 transition-all duration-300">
                  <h3 className="text-lg font-bold text-gray-900">Participation Details</h3>

                  <div className="mt-4">
                    <label className="text-sm font-semibold text-gray-800">
                      1. Why does your team want to participate in this hackathon?
                    </label>
                    <textarea
                      value={whyParticipate}
                      onChange={(e) => setWhyParticipate(e.target.value)}
                      rows={3}
                      required
                      disabled={!submitAllowed}
                      className="mt-2 w-full rounded-2xl border border-[#E2E8F0] px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/25"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="text-sm font-semibold text-gray-800">
                      2. What problem are you trying to solve?
                    </label>
                    <textarea
                      value={problemToSolve}
                      onChange={(e) => setProblemToSolve(e.target.value)}
                      rows={3}
                      required
                      disabled={!submitAllowed}
                      className="mt-2 w-full rounded-2xl border border-[#E2E8F0] px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/25"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="text-sm font-semibold text-gray-800">3. What technologies are you planning to use?</label>
                    <input
                      value={plannedTech}
                      onChange={(e) => setPlannedTech(e.target.value)}
                      required
                      disabled={!submitAllowed}
                      className="mt-2 w-full rounded-2xl border border-[#E2E8F0] px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/25"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="text-sm font-semibold text-gray-800">4. Have you worked on this idea before?</label>
                    <select
                      value={workedBefore}
                      onChange={(e) => setWorkedBefore(e.target.value)}
                      disabled={!submitAllowed}
                      className="mt-2 w-full rounded-2xl border border-[#E2E8F0] px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/25"
                    >
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>

                  <label className="mt-4 inline-flex items-start gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={agreedTerms}
                      onChange={(e) => setAgreedTerms(e.target.checked)}
                      disabled={!submitAllowed}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#2563EB] focus:ring-[#2563EB]/30"
                    />
                    <span>I agree to the terms and conditions of the hackathon</span>
                  </label>

                  <button
                    type="button"
                    disabled={!submitAllowed}
                    onClick={goToSubmitStep2}
                    className="mt-5 w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white font-semibold hover:from-[#1D4ED8] hover:to-[#2563EB] disabled:opacity-60 transition shadow-sm hover:shadow-md"
                  >
                    Next
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={onSubmit}
                  className="rounded-2xl border border-[#E2E8F0] bg-white p-4 sm:p-5 transition-all duration-300"
                >
                  <h3 className="text-lg font-bold text-gray-900">Submission Form</h3>
                  <div className="mt-4 grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-800">Selected Problem</label>
                      <input
                        readOnly
                        value={selectedProblem ? selectedProblem.title : "Not selected yet"}
                        className="mt-2 w-full rounded-2xl border border-[#E2E8F0] px-4 py-3 text-sm bg-gray-50 text-gray-700"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-800">Phase</label>
                      <select
                        value={phase}
                        onChange={(e) => {
                          setPhase(e.target.value);
                          setFiles([]);
                        }}
                        className="mt-2 w-full rounded-2xl border border-[#E2E8F0] px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/25"
                        disabled={!submitAllowed}
                      >
                        <option value="poc">PoC</option>
                        <option value="prototype">Prototype</option>
                        <option value="final">Final</option>
                      </select>
                    </div>
                  </div>

                  {phase === "poc" ? (
                    <div className="mt-4 rounded-2xl border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3 text-sm text-gray-800">
                      <div className="font-semibold text-gray-900">PoC submission template</div>
                      <p className="mt-1 text-gray-700">
                        Follow the official PDF structure for your PoC upload.{" "}
                        <a
                          href={templatePdfHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-[#2563EB] underline underline-offset-2"
                        >
                          Download Templatehackthon.pdf
                        </a>
                      </p>
                    </div>
                  ) : null}

                  <div className="mt-4">
                    <label className="text-sm font-semibold text-gray-800">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      disabled={!submitAllowed}
                      className="mt-2 w-full rounded-2xl border border-[#E2E8F0] px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/25"
                      placeholder="Summarize your approach."
                    />
                  </div>

                  <div className="mt-4">
                    <label className="text-sm font-semibold text-gray-800">
                      Upload {phase === "poc" ? "PoC" : phase === "prototype" ? "Prototype" : "Final"} files
                    </label>
                    <input
                      type="file"
                      multiple
                      disabled={!submitAllowed}
                      onChange={(e) => setFiles(Array.from(e.target.files || []))}
                      className="mt-2 block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-2xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-[#2563EB] file:to-[#1D4ED8] file:text-white file:hover:shadow-md"
                    />
                  </div>

                  <div className="mt-5 flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => setSubmissionStep(1)}
                      className="w-full sm:w-auto px-6 py-3 rounded-2xl border border-[#E2E8F0] bg-white text-gray-700 font-semibold hover:bg-[#F5F7FB] transition"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || !submitAllowed}
                      className="w-full sm:flex-1 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white font-semibold hover:from-[#1D4ED8] hover:to-[#2563EB] disabled:opacity-60 transition shadow-sm hover:shadow-md"
                    >
                      {submitting ? "Submitting..." : "Submit"}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {submitError ? (
              <div className="mt-4">
                <AlertCard tone="warning">{submitError}</AlertCard>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* STATUS TAB */}
      {activeTab === "status" ? (
        <div className="mt-5">
          {statusLoading ? <div className="text-gray-600">Loading status...</div> : null}
          <div className="max-w-4xl mx-auto space-y-4">
          {role === "mentor" ? (
            <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 shadow-sm">
              <div className="text-lg font-bold text-gray-900">Assigned Submissions</div>
              <p className="text-sm text-gray-600 mt-1">
                Submissions for the problems assigned to you.
              </p>

              {statusData.submissions?.length ? (
                <div className="mt-4 space-y-4">
                  {statusData.submissions.map((s) => (
                    <div key={s.id} className="p-5 rounded-2xl border border-[#E2E8F0] bg-white">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {s.problem?.title || "Problem"} ({s.submissionPhase})
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            Team: <span className="font-semibold text-gray-900">{s.team?.teamName || "—"}</span>
                          </div>
                        </div>
                        <div>
                          {(() => {
                            const statusLabel = mapSubmissionStatus(s.status) || s.status;
                            const tone =
                              statusLabel === "pending"
                                ? "bg-[#FFFBEB] border border-[#F59E0B]/20 text-[#92400E]"
                                : statusLabel === "winner"
                                  ? "bg-[#ECFDF3] border border-[#22C55E]/20 text-[#15803D]"
                                  : "bg-[#F5F7FB] border border-[#E2E8F0] text-gray-800";
                            return (
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tone}`}>
                                {statusLabel}
                              </span>
                            );
                          })()}
                        </div>
                      </div>

                      <div className="mt-4 space-y-4">
                        <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                          <div className="text-sm font-bold text-gray-900">Team members</div>
                          <div className="text-sm text-gray-700 mt-1">
                            {(s.team?.members || [])
                              .map((m) => (m?.user?.fullName ? `${m.user.fullName}${m.isLeader ? " (Leader)" : ""}` : null))
                              .filter(Boolean)
                              .join(", ") || "—"}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4">
                          <div className="text-sm font-bold text-gray-900">Participation details</div>
                          <div className="mt-3 space-y-3 text-sm text-gray-800">
                            <div>
                              <div className="font-semibold text-gray-900">
                                1. Why does your team want to participate in this hackathon?
                              </div>
                              <div className="text-gray-700 whitespace-pre-wrap">{s.whyParticipate || "—"}</div>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">2. What problem are you trying to solve?</div>
                              <div className="text-gray-700 whitespace-pre-wrap">{s.problemToSolve || "—"}</div>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">3. What technologies are you planning to use?</div>
                              <div className="text-gray-700 whitespace-pre-wrap">{s.plannedTech || "—"}</div>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">4. Have you worked on this idea before?</div>
                              <div className="text-gray-700">{s.workedBefore ? String(s.workedBefore) : "—"}</div>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4">
                          <div className="text-sm font-bold text-gray-900">Description</div>
                          <div className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{s.description || "—"}</div>
                        </div>

                        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4">
                          <div className="text-sm font-bold text-gray-900">Uploaded files</div>
                          {getSubmissionFiles(s).length ? (
                            <div className="mt-2 space-y-2">
                              {getSubmissionFiles(s).map((u, idx) => (
                                <a
                                  key={`${u}-${idx}`}
                                  href={u}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="block text-sm text-[#2563EB] hover:underline break-all"
                                >
                                  {fileNameFromUrl(u)}
                                </a>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-600 mt-2">—</div>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <div className="text-sm text-gray-700">
                            Mentor approval:{" "}
                            <span className={`font-semibold ${s.mentorApproved ? "text-[#15803D]" : "text-gray-800"}`}>
                              {s.mentorApproved ? "Approved" : "Not approved"}
                            </span>
                          </div>
                          <button
                            type="button"
                            disabled={Boolean(s.mentorApproved)}
                            onClick={() => mentorApproveSubmission(s.id)}
                            className="px-5 py-2 rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white font-semibold hover:from-[#1D4ED8] hover:to-[#2563EB] disabled:opacity-60 transition shadow-sm hover:shadow-md"
                          >
                            {s.mentorApproved ? "Mentor Approved" : "Mentor Approve"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-3 text-gray-700">No submissions found for your assigned problems yet.</div>
              )}
            </div>
          ) : !statusData?.team ? (
            <AlertCard tone="warning">No team found. Create/join a team to track submissions.</AlertCard>
          ) : (
            <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 shadow-sm">
              <div className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getTeamStatusBadge(statusData.team.status)}`}>
                {statusData.team.status}
              </div>
              <div className="text-2xl font-extrabold text-gray-900 mt-2">{statusData.team.teamName}</div>
              <div className="text-sm text-gray-600 mt-1">
                Invite Code: <span className="font-mono">{statusData.team.inviteCode}</span>
              </div>

              <div className="mt-5">
                <div className="font-bold text-gray-900">Submissions</div>
                {statusData.submissions?.length ? (
                  <div className="mt-4 space-y-4">
                    {statusData.submissions.map((s) => (
                      <div key={s.id} className="p-5 rounded-2xl border border-[#E2E8F0] bg-white">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div>
                            <div className="font-semibold text-gray-900">
                              {s.problem?.title || "Problem"} ({s.submissionPhase})
                            </div>
                            <div className="text-sm text-gray-600">{s.title}</div>
                          </div>
                          <div>
                            {(() => {
                              const statusLabel = mapSubmissionStatus(s.status) || s.status;
                              const tone =
                                statusLabel === "pending"
                                  ? "bg-[#FFFBEB] border border-[#F59E0B]/20 text-[#92400E]"
                                  : statusLabel === "winner"
                                    ? "bg-[#ECFDF3] border border-[#22C55E]/20 text-[#15803D]"
                                    : "bg-[#F5F7FB] border border-[#E2E8F0] text-gray-800";
                              return (
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tone}`}>
                                  {statusLabel}
                                </span>
                              );
                            })()}
                            {s.winnerAmount ? (
                              <div className="text-xs text-[#15803D] font-semibold mt-2">
                                Winner Prize: ₹{s.winnerAmount}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3 text-gray-700">No submissions found yet.</div>
                )}
              </div>
            </div>
          )}
          </div>
        </div>
      ) : null}

      {guidelinesOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-sm border border-[#E2E8F0] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Hackathon Guidelines</h3>
                <p className="text-gray-600 mt-1">Quick rules for participation.</p>
              </div>
              <button
                onClick={() => setGuidelinesOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#E2E8F0] hover:bg-[#F5F7FB] text-gray-700 font-semibold transition"
              >
                Close
              </button>
            </div>

            <div className="mt-4 space-y-3 text-gray-700">
              <div className="bg-[#2563EB]/5 border border-[#2563EB]/20 rounded-2xl p-4">
                <div className="font-semibold text-gray-900">Team Rules</div>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>Max 4 members per team</li>
                  <li>Team approval is automatic for submissions</li>
                  <li>Submit PoC / Prototype only once</li>
                </ul>
              </div>
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4">
                <div className="font-semibold text-gray-900">Prizes & Support</div>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>Prize up to ₹60,000</li>
                  <li>Internship possible for selected teams</li>
                </ul>
              </div>
            </div>

            <div className="mt-5 flex gap-3 flex-wrap">
              <button
                onClick={() => {
                  setGuidelinesOpen(false);
                  changeTab("problems");
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white font-semibold hover:from-[#1D4ED8] hover:to-[#2563EB] transition shadow-sm hover:shadow-md"
              >
                Select Problems
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default HackathonDashboard;

