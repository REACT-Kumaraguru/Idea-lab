import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { axiosInstance } from "../../lib/axios.js";
import { useHackathonAuthStore } from "../../store/useHackathonAuthStore";
import { AlertTriangle } from "lucide-react";

const HackathonDashboard = () => {
  const { hackathonUser } = useHackathonAuthStore();
  const [searchParams] = useSearchParams();

  const mapSubmissionStatus = (s) => {
    if (!s) return null;
    if (s === "submitted" || s === "under_review") return "pending";
    return s;
  };

  const role = hackathonUser?.role;

  const [activeTab, setActiveTab] = useState("team");
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
  const [phase, setPhase] = useState("poc");
  const [title, setTitle] = useState("");
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
      const res = await axiosInstance.get("/hackathon/team");
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
      const res = await axiosInstance.get("/hackathon/status");
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

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (!tab) return;
    if (role === "mentor") {
      if (["team", "status"].includes(tab)) setActiveTab(tab);
    } else {
      if (["team", "problems", "submit", "status"].includes(tab)) setActiveTab(tab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, role]);

  useEffect(() => {
    const sel = loadSelectedProblem();
    setSelectedProblem(sel || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionKey, team?.id]);

  useEffect(() => {
    if (role === "mentor") setActiveTab("team");
  }, [role]);

  const studentTabs = [
    { key: "team", label: "Team" },
    { key: "problems", label: "Problems" },
    { key: "submit", label: "Submit" },
    { key: "status", label: "Status" },
  ];

  const mentorTabs = [
    { key: "team", label: "Team" },
    { key: "status", label: "Status" },
  ];

  const tabs = role === "mentor" ? mentorTabs : studentTabs;

  const selectedProblemId = selectedProblem?.problemId || null;

  const canSubmit = team?.status === "approved";
  const submissionBlockedReason =
    !team
      ? "You are not part of any team yet."
      : team.status === "pending"
      ? "Your team is pending admin approval. Submission will be enabled after approval."
      : team.status === "rejected"
      ? "Your team was rejected. Submission is disabled."
      : null;

  const fetchProblems = async () => {
    if (problemsLoading) return;
    setProblemsLoading(true);
    try {
      const res = await axiosInstance.get("/hackathon/problems");
      setProblems(res.data.problems || []);
    } catch {
      setProblems([]);
    } finally {
      setProblemsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "problems" && role === "student") fetchProblems();
    if (activeTab === "status") refreshStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const onSelectProblem = (p) => {
    const payload = {
      problemId: p.id,
      title: p.title,
      sector: p.sector,
      prizeAmount: p.prizeAmount,
    };
    try {
      localStorage.setItem(selectionKey, JSON.stringify(payload));
    } catch {
      // ignore
    }
    setSelectedProblem(payload);
    setActiveTab("submit");
  };

  const submitAllowed = role === "student" && canSubmit && !!selectedProblemId;

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!team) return setSubmitError("You are not part of any team yet.");
    if (team.status !== "approved") return setSubmitError(submissionBlockedReason);
    if (!selectedProblemId) return setSubmitError("Please select a problem first.");

    if (!title?.trim()) return setSubmitError("Title is required.");
    if (!files || files.length === 0) return setSubmitError("Upload at least one file.");

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("problemId", String(selectedProblemId));
      fd.append("phase", phase);
      fd.append("title", title);
      fd.append("description", description || "");

      for (const f of files) {
        if (phase === "poc") fd.append("pocFiles", f);
        else fd.append("prototypeFiles", f);
      }

      await axiosInstance.post("/hackathon/submit", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await refreshStatus();
      setActiveTab("status");
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
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
              to="/hackathon/create-team"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white font-semibold hover:from-[#1D4ED8] hover:to-[#2563EB] transition shadow-sm hover:shadow-md"
            >
              Create Team
            </Link>
            <Link
              to="/hackathon/join-team"
              className="px-4 py-2 rounded-xl border border-[#E2E8F0] bg-white text-gray-800 font-semibold hover:bg-[#F5F7FB] transition shadow-sm hover:shadow-md"
            >
              Join Team
            </Link>
          </div>
        ) : null}
      </div>

      <div className="mt-5 flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
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
                Create or join a team to enable problem selection and submissions.
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
          {problemsLoading ? (
            <div className="text-gray-600">Loading problems...</div>
          ) : problems.length ? (
            <div className="grid md:grid-cols-2 gap-5">
              {problems.map((p) => (
                <div key={p.id} className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm p-5">
                  <div className="text-xs font-semibold text-[#2563EB]">{p.sector || "Category"}</div>
                  <div className="text-lg font-bold text-gray-900 mt-2">{p.title}</div>
                  <div className="text-gray-700 mt-3 text-sm whitespace-pre-line">
                    {p.description?.slice(0, 220)}
                    {p.description?.length > 220 ? "..." : ""}
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="text-xs text-gray-500">Prize: {p.prizeAmount ? `₹${p.prizeAmount}` : "TBD"}</div>
                    <button
                      onClick={() => onSelectProblem(p)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white font-semibold hover:from-[#1D4ED8] hover:to-[#2563EB] transition shadow-sm hover:shadow-md"
                    >
                      Select
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
            <AlertCard tone="warning">Your team is pending admin approval. Submission will be enabled after approval.</AlertCard>
          ) : team.status === "rejected" ? (
            <AlertCard tone="warning">Your team was rejected. Submission is disabled.</AlertCard>
          ) : null}

          <form
            onSubmit={onSubmit}
            className="mt-4 bg-white rounded-3xl border border-[#E2E8F0] p-6 shadow-sm"
            aria-disabled={!submitAllowed}
          >
            {!submitAllowed ? (
              <div className="mb-4">
                <AlertCard tone="warning">
                  {submissionBlockedReason || "Select a problem and ensure your team is approved."}
                </AlertCard>
              </div>
            ) : null}

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-800">Selected Problem</label>
                <div className="mt-2 text-base text-gray-800">
                  {selectedProblem ? selectedProblem.title : "Not selected yet"}
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-800">Phase</label>
                <select
                  value={phase}
                  onChange={(e) => {
                    setPhase(e.target.value);
                    setFiles([]);
                  }}
                  className="mt-2 w-full rounded-2xl border border-[#E2E8F0] px-4 py-3 text-base bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/25"
                  disabled={!submitAllowed}
                >
                  <option value="poc">PoC</option>
                  <option value="prototype">Prototype</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="text-sm font-semibold text-gray-800">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={!submitAllowed}
                className="mt-2 w-full rounded-2xl border border-[#E2E8F0] px-4 py-3 text-base bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/25"
                placeholder="e.g., AI-enabled predictive maintenance for motors"
              />
            </div>

            <div className="mt-4">
              <label className="text-sm font-semibold text-gray-800">Description (optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                disabled={!submitAllowed}
                className="mt-2 w-full rounded-2xl border border-[#E2E8F0] px-4 py-3 text-base bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/25"
                placeholder="Summarize your approach."
              />
            </div>

            <div className="mt-4">
              <label className="text-sm font-semibold text-gray-800">Upload {phase === "poc" ? "PoC" : "Prototype"} files</label>
              <input
                type="file"
                multiple
                disabled={!submitAllowed}
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
                className="mt-2 block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-2xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-[#2563EB] file:to-[#1D4ED8] file:text-white file:hover:shadow-md"
              />
            </div>

            {submitError ? (
              <div className="mt-4">
                <AlertCard tone="warning">{submitError}</AlertCard>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={submitting || !submitAllowed}
              className="mt-5 w-full px-6 py-3 rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white font-semibold hover:from-[#1D4ED8] hover:to-[#2563EB] disabled:opacity-60 transition shadow-sm hover:shadow-md"
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </form>
        </div>
      ) : null}

      {/* STATUS TAB */}
      {activeTab === "status" ? (
        <div className="mt-5">
          {statusLoading ? <div className="text-gray-600">Loading status...</div> : null}
          <div className="max-w-4xl mx-auto space-y-4">
          {!statusData?.team ? (
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
                  <li>Only approved teams can submit</li>
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
                  setActiveTab("problems");
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

