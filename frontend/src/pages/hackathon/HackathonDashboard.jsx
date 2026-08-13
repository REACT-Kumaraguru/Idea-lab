import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams, useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { axiosInstance } from "../../lib/axios.js";
import { getHackathonTemplatePdfHref } from "../../lib/config.js";
import { isAllowedSubmissionFile, validateSubmissionFiles } from "../../lib/hackathonSubmissionFileTypes.js";
import { downloadHackathonSubmissionFile, fileHref } from "../../lib/hackathonSubmissionFiles.js";
import { useHackathonAuthStore } from "../../store/useHackathonAuthStore";
import { AlertTriangle, Check, Copy, LogOut, Trash2, Trophy } from "lucide-react";
import {
  HackathonProblemArticleCard,
  mentorNamesForProblem,
} from "../../components/hackathon/HackathonProblemArticleCard.jsx";
import AmbientBackground from "../../components/AmbientBackground";
import ReviewerDashboard from "./ReviewerDashboard";

const getHackathonSlugHelper = (h) => {
  if (!h) return "ich2026";
  if (h.slug) return h.slug;
  if (String(h.id) === "5" || h.name?.toLowerCase().includes("ai")) return "Ai";
  if (String(h.id) === "1" || h.name?.toLowerCase().includes("idea lab")) return "ich2026";
  return String(h.id || "ich2026");
};

const HackathonDashboard = () => {
  const { hackathonUser } = useHackathonAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const { hackathonSlug: paramSlug, tab: paramTab } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const templatePdfHref = getHackathonTemplatePdfHref();

  const mapSubmissionStatus = (s) => {
    if (!s) return null;
    if (s === "submitted" || s === "under_review") return "pending";
    return s;
  };

  const formatProblemStatementDisplay = (s) => {
    if (!s) return { title: "—", isPersonalized: false, theme: null };
    const teamTopic = s.team?.topic;
    const teamTheme = s.team?.theme;
    const subTitle = s.title;
    const isCustomHackathon = selectedStudentHackathon?.problemStatementType === "custom";

    const isPersonalized = isCustomHackathon || Boolean(teamTopic && teamTheme);

    if (isPersonalized) {
      return {
        title: teamTopic || subTitle || "Personalized Problem Statement",
        theme: teamTheme || null,
        isPersonalized: true,
      };
    }

    return {
      title: s.problem?.title || subTitle || "—",
      theme: s.team?.theme || null,
      isPersonalized: false,
    };
  };

  const role = hackathonUser?.role;

  // Extract active tab and slug from route params, path or search params
  const initialTab = useMemo(() => {
    let t = paramTab || new URLSearchParams(location.search).get("tab");
    const parts = location.pathname.split("/").filter(Boolean);
    if (!t && parts.length >= 3) {
      if (parts[1]?.toLowerCase() === "dashboard") t = parts[2];
      else if (parts[2]?.toLowerCase() === "dashboard") t = parts[3];
    }
    if (t === "problem") t = "problems";
    if (t && ["team", "problems", "submit", "status", "guidelines"].includes(t)) return t;
    return "team";
  }, [paramTab, location.pathname, location.search]);

  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const changeTab = (key) => {
    setActiveTab(key);
    const slug = selectedStudentHackathonId === "5" || paramSlug === "Ai" ? "Ai" : (paramSlug || selectedStudentHackathonId || "ich2026");
    navigate(`/Hackathon/${slug}/dashboard/${key}`);
  };
  const [guidelinesOpen, setGuidelinesOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (!copiedCode) return;
    const timer = setTimeout(() => {
      setCopiedCode(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [copiedCode]);

  const [team, setTeam] = useState(null);
  const [teamLoading, setTeamLoading] = useState(true);

  const [problems, setProblems] = useState([]);
  const [problemsLoading, setProblemsLoading] = useState(false);

  const [statusData, setStatusData] = useState({ team: null, submissions: [] });
  const [statusLoading, setStatusLoading] = useState(false);

  const teamHasSubmitted = (statusData?.submissions || []).length > 0;
  const isSubmissionApproved = (statusData?.submissions || []).some((s) => s.status === "approved");

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

  const [registrationClosed, setRegistrationClosed] = useState(false);
  const [registrationClosedMessage, setRegistrationClosedMessage] = useState("");

  const [studentHackathons, setStudentHackathons] = useState([]);
  const [hFilterTab, setHFilterTab] = useState("registered");

  const [selectedStudentHackathonId, setSelectedStudentHackathonId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const paramId = params.get("hackathonId");
    if (paramId) return String(paramId);
    if (paramSlug) {
      if (paramSlug === "Ai" || paramSlug === "5") return "5";
      if (paramSlug === "ich2026" || paramSlug === "1") return "1";
      if (paramSlug === "smart-city-2026" || paramSlug === "2" || paramSlug === "6") return "2";
      return paramSlug;
    }
    return localStorage.getItem("studentSelectedHackathonId") || "2";
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const paramId = params.get("hackathonId");
    if (paramId && String(paramId) !== String(selectedStudentHackathonId)) {
      setSelectedStudentHackathonId(String(paramId));
    } else if (paramSlug) {
      let resolvedId = null;
      if (paramSlug === "Ai" || paramSlug === "5") resolvedId = "5";
      else if (paramSlug === "ich2026" || paramSlug === "1") resolvedId = "1";
      else if (paramSlug === "smart-city-2026" || paramSlug === "2" || paramSlug === "6") resolvedId = "2";
      else {
        const found = studentHackathons.find((h) => String(h.slug).toLowerCase() === paramSlug.toLowerCase() || String(h.id) === paramSlug);
        if (found) resolvedId = String(found.id);
      }
      if (resolvedId && String(resolvedId) !== String(selectedStudentHackathonId)) {
        setSelectedStudentHackathonId(String(resolvedId));
      }
    }
  }, [paramSlug, location.search, studentHackathons]);

  const handleSelectStudentHackathon = (idOrObj) => {
    const targetId = String(typeof idOrObj === "object" ? idOrObj.id : idOrObj);
    setSelectedStudentHackathonId(targetId);
    localStorage.setItem("studentSelectedHackathonId", targetId);
    let targetSlug = "smart-city-2026";
    const found = studentHackathons.find((h) => String(h.id) === targetId);
    if (found) {
      targetSlug = getHackathonSlugHelper(found);
    } else if (targetId === "5") {
      targetSlug = "Ai";
    } else if (targetId === "1") {
      targetSlug = "ich2026";
    } else {
      targetSlug = targetId;
    }
    navigate(`/Hackathon/${targetSlug}/dashboard/${activeTab || "team"}?hackathonId=${targetId}`);
  };

  const selectedStudentHackathon = useMemo(() => {
    if (!selectedStudentHackathonId) return null;
    return studentHackathons.find((h) => String(h.id) === String(selectedStudentHackathonId)) || null;
  }, [studentHackathons, selectedStudentHackathonId]);

  const [customTheme, setCustomTheme] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [customDesc, setCustomDesc] = useState("");
  const [savingCustomProblem, setSavingCustomProblem] = useState(false);
  const [customProblemMsg, setCustomProblemMsg] = useState(null);
  const [customProblemSuccess, setCustomProblemSuccess] = useState(false);

  useEffect(() => {
    if (team) {
      if (team.theme) setCustomTheme(team.theme);
      if (team.topic) setCustomTopic(team.topic);
      if (team.description) setCustomDesc(team.description);
    }
  }, [team]);

  const handleSaveCustomProblem = async (e) => {
    e.preventDefault();
    if (!customTheme) {
      setCustomProblemSuccess(false);
      setCustomProblemMsg("Please select a Theme for your project.");
      return;
    }
    setCustomProblemMsg(null);
    setSavingCustomProblem(true);
    try {
      const res = await axiosInstance.put("/ich2026/team/custom-problem", {
        theme: customTheme,
        topic: customTopic,
        description: customDesc,
      });
      setCustomProblemSuccess(true);
      setCustomProblemMsg(res.data?.message || "Personalized problem statement saved successfully!");
      await refreshTeam();
    } catch (err) {
      setCustomProblemSuccess(false);
      setCustomProblemMsg(err.response?.data?.message || "Failed to save personalized problem statement.");
    } finally {
      setSavingCustomProblem(false);
    }
  };

  const [userRegisteredIds, setUserRegisteredIds] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [hRes, regRes] = await Promise.all([
          axiosInstance.get("/ich2026/hackathons"),
          axiosInstance.get("/ich2026/my-registrations").catch(() => ({ data: { registeredIds: [] } })),
        ]);
        const list = hRes.data?.hackathons || [];
        const regIds = (regRes.data?.registeredIds || []).map(String);
        setStudentHackathons(list);
        setUserRegisteredIds(regIds);

        if (regIds.length > 0 && !selectedStudentHackathonId) {
          setSelectedStudentHackathonId(regIds[0]);
        } else if (list.length > 0 && !selectedStudentHackathonId) {
          setSelectedStudentHackathonId(String(list[0].id));
        }
      } catch (e) {
        console.error("Failed to load hackathons list for dashboard:", e);
      }
    })();
  }, []);

  const now = useMemo(() => new Date(), []);

  const myRegisteredHackathonsList = useMemo(() => {
    const regSet = new Set(userRegisteredIds);
    return studentHackathons.filter((h) => regSet.has(String(h.id)));
  }, [studentHackathons, userRegisteredIds]);

  const registeredHackathons = useMemo(() => {
    return myRegisteredHackathonsList.filter((h) => {
      const isEnded = h.status === "ended" || h.status === "completed" || (h.endDate && new Date(h.endDate) < now);
      return !isEnded;
    });
  }, [myRegisteredHackathonsList, now]);

  const participatedHackathons = useMemo(() => {
    return myRegisteredHackathonsList.filter((h) => {
      const isEnded = h.status === "ended" || h.status === "completed" || (h.endDate && new Date(h.endDate) < now);
      return isEnded;
    });
  }, [myRegisteredHackathonsList, now]);

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
    if (!hackathonUser) return;
    setTeamLoading(true);
    try {
      const hackId = selectedStudentHackathonId ? `?hackathonId=${selectedStudentHackathonId}` : "";
      const res = await axiosInstance.get(`/ich2026/team${hackId}`);
      setTeam(res.data.team || null);
    } catch {
      setTeam(null);
    } finally {
      setTeamLoading(false);
    }
  };

  const [leavingTeam, setLeavingTeam] = useState(false);
  const [dismantlingTeam, setDismantlingTeam] = useState(false);
  const [confirmLeaveModal, setConfirmLeaveModal] = useState(false);
  const [confirmDismantleModal, setConfirmDismantleModal] = useState(false);

  useEffect(() => {
    if (confirmLeaveModal || confirmDismantleModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [confirmLeaveModal, confirmDismantleModal]);

  const handleLeaveTeam = () => {
    if (!team) return;
    if (isSubmissionApproved) {
      toast.error("You cannot leave the team after submission has been approved by admin.");
      return;
    }
    setConfirmLeaveModal(true);
  };

  const executeLeaveTeam = async () => {
    if (!team) return;
    setLeavingTeam(true);
    try {
      await axiosInstance.post("/ich2026/team/leave", { teamId: team.id });
      toast.success("Successfully left the team");
      setConfirmLeaveModal(false);
      setTeam(null);
      setStatusData({ team: null, submissions: [] });
      window.dispatchEvent(new Event("hackathon-team-updated"));
      window.dispatchEvent(new Event("team-dismantled"));
      await Promise.all([refreshTeam(), refreshStatus()]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to leave team");
    } finally {
      setLeavingTeam(false);
    }
  };

  const handleDismantleTeam = () => {
    if (!team) return;
    if (isSubmissionApproved) {
      toast.error("You cannot dismantle the team after submission has been approved by admin.");
      return;
    }
    setConfirmDismantleModal(true);
  };

  const executeDismantleTeam = async () => {
    if (!team) return;
    setDismantlingTeam(true);
    try {
      await axiosInstance.post("/ich2026/team/dismantle", { teamId: team.id });
      toast.success("Team dismantled successfully");
      setConfirmDismantleModal(false);
      setTeam(null);
      setStatusData({ team: null, submissions: [] });
      window.dispatchEvent(new Event("hackathon-team-updated"));
      window.dispatchEvent(new Event("team-dismantled"));
      await Promise.all([refreshTeam(), refreshStatus()]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to dismantle team");
    } finally {
      setDismantlingTeam(false);
    }
  };

  const refreshStatus = async () => {
    if (!hackathonUser) return;
    setStatusLoading(true);
    try {
      const hackId = selectedStudentHackathonId ? `?hackathonId=${selectedStudentHackathonId}` : "";
      const res = await axiosInstance.get(`/ich2026/status${hackId}`);
      setStatusData(res.data || { team: null, submissions: [] });
    } catch {
      setStatusData({ team: null, submissions: [] });
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    // Load team + status when dashboard mounts or selected event changes.
    refreshTeam();
    refreshStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hackathonUser?.id, selectedStudentHackathonId]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await axiosInstance.get("/ich2026/registration-status");
        if (!active) return;
        setRegistrationClosed(Boolean(res.data?.registrationClosed));
        setRegistrationClosedMessage(res.data?.message || "");
      } catch {
        if (active) {
          setRegistrationClosed(false);
          setRegistrationClosedMessage("");
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

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
    return [
      { key: "team", label: "Team" },
      { key: "problems", label: "Problems" },
      { key: "submit", label: "Submit" },
      { key: "status", label: "Status" },
    ];
  }, []);

  const mentorTabs = [
    { key: "team", label: "Team" },
    { key: "status", label: "Status" },
  ];

  const tabs = role === "mentor" ? mentorTabs : studentTabs;

  const isCustomMode =
    selectedStudentHackathon?.problemStatementType === "custom" ||
    String(selectedStudentHackathonId) === "2" ||
    String(selectedStudentHackathonId) === "6";

  const selectedProblemId = isCustomMode
    ? team?.id || 1
    : selectedProblem?.problemId || team?.problemId || null;

  const showResults = selectedStudentHackathon?.showResults === true;
  const isAbstractionApproved = !isCustomMode || (showResults && team?.abstractionStatus === "approved");

  // Backend auto-activates team status on submission when needed.
  const canSubmit = Boolean(team);
  const submissionBlockedReason = !team
    ? "You are not part of any team yet. Create or join a team first."
    : teamHasSubmitted
      ? "Your team has already submitted. Only one submission is allowed per team."
      : registrationBlocksSubmission
        ? registrationClosedMessage ||
          "Registration is closed. PoC and submission uploads are no longer accepted."
        : isCustomMode && !showResults
          ? "The selection results have not been released yet. Submit, Status, and Payment tabs will unlock once results are announced."
          : isCustomMode && !isAbstractionApproved
            ? "Your problem statement (abstraction) must be approved by your theme reviewer before unlocking submission."
            : !isCustomMode && !selectedProblemId && !team?.topic
              ? "Please select a Problem Statement under the PROBLEMS tab first."
              : isCustomMode && !team?.theme
                ? "Please select your Project Theme under the PROBLEMS tab first."
                : null;

  const submitAllowed =
    role === "student" &&
    canSubmit &&
    isAbstractionApproved &&
    (isCustomMode ? Boolean(team?.theme) : Boolean(selectedProblemId || team?.topic)) &&
    !teamHasSubmitted &&
    !registrationBlocksSubmission;

  const fetchProblems = async () => {
    if (problemsLoading) return;
    setProblemsLoading(true);
    try {
      const q = selectedStudentHackathonId ? `?hackathonId=${selectedStudentHackathonId}` : "";
      const res = await axiosInstance.get(`/ich2026/problems${q}`);
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
    }
    if (activeTab === "status") refreshStatus();
    if (activeTab === "submit" && role === "student") refreshStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, role, selectedStudentHackathonId]);

  const teamHasSubmissionForProblem = (pid) =>
    (statusData?.submissions || []).some((s) => Number(s.problemId) === Number(pid));

  const problemIsFull = (p) => {
    if (!p) return false;
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
      mentors: Array.isArray(p.mentors) ? p.mentors : p.mentor ? [p.mentor] : [],
      teamRegistrationLimit: p.teamRegistrationLimit,
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

    if (!whyParticipate?.trim()) {
      setSubmissionStep(1);
      return setSubmitError("Please answer why your team wants to participate in Step 1.");
    }
    if (!problemToSolve?.trim()) {
      setSubmissionStep(1);
      return setSubmitError("Please describe the problem your team is trying to solve in Step 1.");
    }
    if (!plannedTech?.trim()) {
      setSubmissionStep(1);
      return setSubmitError("Please enter technologies your team plans to use in Step 1.");
    }
    if (!agreedTerms) {
      setSubmissionStep(1);
      return setSubmitError("You must check the agreement terms box in Step 1 to submit.");
    }

    const targetProblemId = selectedProblemId || team?.problemId || (isCustomMode ? team?.id || 1 : 1);

    if (!files || files.length === 0) return setSubmitError("Please choose and upload at least one PDF or DOCX file.");

    const fileErr = validateSubmissionFiles(files);
    if (fileErr) {
      setSubmitError(fileErr);
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("problemId", String(targetProblemId));
      fd.append("title", selectedProblem?.title || team?.topic || "Submission");
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

  const teamSubmission = (statusData?.submissions || []).find((s) => Number(s.teamId) === Number(team?.id));
  const latestSubmission = teamSubmission || (statusData?.submissions || [])[0] || null;

  const formatSubmissionStatus = (submission) => {
    if (!submission) return { label: "Not submitted yet", color: "bg-stone-900 border-amber-500/30 text-amber-300" };
    if (submission.status === "rejected") {
      return { label: "Rejected", color: "bg-rose-500/20 border-rose-500/40 text-rose-300" };
    }
    if (submission.status === "approved") {
      return { label: "Approved & Accepted ✓", color: "bg-emerald-500/20 border-emerald-500/40 text-emerald-300" };
    }
    if (submission.mentorApproved) {
      return { label: "Mentor Approved ✓", color: "bg-emerald-500/20 border-emerald-500/40 text-emerald-300" };
    }
    return { label: "Pending Mentor Approval", color: "bg-amber-500/20 border-amber-500/40 text-amber-300" };
  };
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
        className={`flex items-start gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur-xl font-sans ${
          isSuccess
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
            : "bg-amber-500/10 border-amber-500/30 text-amber-200"
        }`}
      >
        <AlertTriangle className={`mt-0.5 w-5 h-5 shrink-0 ${isSuccess ? "text-emerald-400" : "text-amber-400"}`} />
        <div className="text-xs font-medium normal-case tracking-normal leading-relaxed">{children}</div>
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
      toast.success("Submission approved by mentor! ✓");
      if (updated?.id) {
        setStatusData((prev) => ({
          ...(prev || {}),
          submissions: (prev?.submissions || []).map((s) => (Number(s.id) === Number(updated.id) ? { ...s, ...updated } : s)),
        }));
      }
      fetchStatus();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to approve submission");
    }
  };

  if (role === "reviewer") {
    return <ReviewerDashboard />;
  }

  return (
    <div className="text-stone-100 font-sans relative z-10">
      <div className="relative z-10 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-serif text-3xl text-stone-100 uppercase tracking-wide font-normal">
            {role === "mentor" ? "Mentor Evaluation Workspace" : "Participant Dashboard"}
          </h2>
          <p className="text-xs font-dancing text-amber-200/90 mt-1">
            {role === "mentor"
              ? "Review team submissions, examine project code & files, and provide technical approvals."
              : "Track your team, select problems, and submit PoC / Prototype."}
          </p>
          {selectedStudentHackathon && (
            <div className="mt-2.5 text-xs font-sans text-stone-300 flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30 font-bold uppercase tracking-wider text-[10px]">
                🏆 {selectedStudentHackathon.name}
              </span>
              <span className="text-stone-400">•</span>
              <span><strong className="text-amber-200">Organized By:</strong> {selectedStudentHackathon.organizedBy || "AICTE IDEA Lab, KCT"}</span>
              <span className="text-stone-400">•</span>
              <span><strong className="text-amber-200">Venue:</strong> {selectedStudentHackathon.venue || "Kumaraguru College of Technology"}</span>
            </div>
          )}
        </div>
      </div>

      {role === "student" && registrationClosed ? (
        <div className="mt-3 relative z-10 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-xs font-medium text-amber-200">
          {registrationClosedMessage ||
            "Registration is closed. New PoC / submission uploads are not accepted."}
        </div>
      ) : null}

      {/* Student Hackathons Explorer (Current, Upcoming, Participated) */}
      {role === "student" && (
        <div className="mt-4 mb-6 relative z-10 serene-glass-card rounded-3xl p-5 text-stone-100 shadow-xl border border-amber-500/25">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <div>
              <h3 className="font-serif uppercase tracking-wider text-base flex items-center gap-2 text-stone-100 font-normal">
                <span>🏆 Hackathons</span>
              </h3>
              <p className="text-xs text-stone-400 font-sans">Explore active events, upcoming schedules, and your participated hackathons.</p>
            </div>
            <div className="flex items-center gap-1.5 bg-stone-900/80 p-1 rounded-xl border border-amber-500/20 font-sans">
              <button
                type="button"
                onClick={() => setHFilterTab("registered")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                  hFilterTab === "registered" ? "bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 shadow" : "text-stone-300 hover:text-amber-300"
                }`}
              >
                Registered ({registeredHackathons.length})
              </button>
              <button
                type="button"
                onClick={() => setHFilterTab("participated")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                  hFilterTab === "participated" ? "bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 shadow" : "text-stone-300 hover:text-amber-300"
                }`}
              >
                Participated ({participatedHackathons.length})
              </button>
            </div>
          </div>

          {(hFilterTab === "participated" ? participatedHackathons : registeredHackathons).length === 0 ? (
            <div className="text-center py-10 serene-glass-card rounded-2xl border border-amber-500/20 max-w-xl mx-auto w-full">
              <Trophy className="w-10 h-10 text-amber-400/40 mx-auto mb-2" />
              <div className="font-serif text-lg text-stone-200 uppercase tracking-wide">
                No {hFilterTab === "participated" ? "Participated" : "Registered"} Hackathons
              </div>
              <p className="text-xs font-sans text-stone-400 mt-1 max-w-md mx-auto">
                {hFilterTab === "participated"
                  ? "You have not completed participation in any hackathons yet."
                  : "You have not registered for any active hackathons yet. Browse our active events and confirm your registration."}
              </p>
              <Link
                to="/Hackathon"
                className="mt-4 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 font-sans font-bold text-xs uppercase tracking-wider shadow-lg hover:brightness-110 transition"
              >
                Browse & Register for Hackathons
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 font-sans">
              {(hFilterTab === "participated" ? participatedHackathons : registeredHackathons).map((h) => {
                const isSelected = String(h.id) === String(selectedStudentHackathonId);
                return (
                  <div
                    key={h.id}
                    onClick={() => handleSelectStudentHackathon(h.id)}
                    className={`rounded-2xl p-3.5 flex flex-col justify-between transition cursor-pointer border ${
                      isSelected
                        ? "bg-amber-400/15 border-amber-400 ring-1 ring-amber-400/50"
                        : "bg-stone-900/60 border-amber-500/20 hover:bg-stone-900/90"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-serif uppercase text-sm text-stone-100 line-clamp-1">{h.name}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize shrink-0 border ${
                            isSelected
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                              : h.status === "ended" || h.slug === "ich2026" || String(h.id) === "1"
                              ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                              : "bg-amber-400/10 text-amber-300 border-amber-400/30"
                          }`}
                        >
                          {isSelected ? "Selected ✓" : (h.status === "ended" || h.slug === "ich2026" || String(h.id) === "1") ? "Ended" : (h.status || "active")}
                        </span>
                      </div>
                      <p className="text-xs text-stone-400 mt-1 line-clamp-2">{h.description || "No details provided."}</p>
                      <div className="mt-1.5 text-[10px] text-amber-300/80 font-sans uppercase tracking-wider font-semibold">
                        Organized By: <span className="text-stone-300 font-normal normal-case">{h.organizedBy || "AICTE IDEA Lab, KCT"}</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-amber-500/15 flex items-center justify-between text-[11px] text-stone-400">
                      <span>{h.startDate ? new Date(h.startDate).toLocaleDateString() : "TBD"}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectStudentHackathon(h.id);
                        }}
                        className={`text-xs font-bold px-3 py-1 rounded-xl transition cursor-pointer ${
                          isSelected
                            ? "bg-amber-400 text-stone-950 font-bold"
                            : "bg-stone-900 border border-amber-500/30 text-amber-300 hover:bg-amber-400/20"
                        }`}
                      >
                        {isSelected ? "Selected ✓" : "Select Event"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="mt-5 relative z-20 flex items-center gap-3 overflow-x-auto whitespace-nowrap pb-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => changeTab(t.key)}
            className={`px-5 py-2.5 rounded-xl text-xs font-sans uppercase font-extrabold tracking-wider transition border focus:outline-none cursor-pointer ${
              activeTab === t.key
                ? "bg-amber-400 text-stone-950 font-extrabold border border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                : "bg-stone-900/90 border border-amber-500/30 text-stone-200 hover:text-amber-300 hover:border-amber-400/50"
            }`}
          >
            {t.label}
          </button>
        ))}
        {role === "student" ? (
          <button
            onClick={() => setGuidelinesOpen(true)}
            className="px-5 py-2.5 rounded-xl text-xs font-sans uppercase font-extrabold tracking-wider transition border bg-stone-900/90 border-amber-500/30 text-stone-200 hover:text-amber-300 hover:border-amber-400/50 cursor-pointer"
          >
            Guidelines
          </button>
        ) : null}
      </div>

      {/* TEAM TAB */}
      {activeTab === "team" ? (
        <div className="mt-5">
          {teamLoading ? (
            <div className="text-stone-400 text-xs font-sans uppercase tracking-widest">Loading team...</div>
          ) : role === "mentor" ? (
            <div className="space-y-6 font-sans">
              <div className="serene-glass-card rounded-3xl border border-amber-500/25 p-6 md:p-8 shadow-2xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="font-serif text-2xl uppercase tracking-wider text-stone-100 font-normal">
                      Registered Teams & Submissions ({statusData.submissions?.length || 0})
                    </div>
                    <p className="mt-1 text-xs text-stone-400 font-sans leading-relaxed">
                      Review registered teams, examine project proposals & files, and grant mentor approvals.
                    </p>
                  </div>
                  <button
                    onClick={() => changeTab("status")}
                    className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-sans uppercase font-extrabold tracking-wider shadow-lg transition cursor-pointer border border-amber-300 shrink-0"
                  >
                    View Status Board →
                  </button>
                </div>
              </div>

              {statusData.submissions?.length ? (
                <div className="space-y-5">
                  {statusData.submissions.map((s) => (
                    <div key={s.id} className="serene-glass-card rounded-3xl border border-amber-500/25 p-6 md:p-8 shadow-2xl space-y-5">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                          <div className="inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Team Registered
                          </div>
                          <div className="font-serif text-3xl uppercase tracking-wider text-stone-100 mt-2 font-normal">
                            {s.team?.teamName || "Unnamed Team"}
                          </div>
                          <div className="mt-2 inline-flex items-center gap-3 px-4 py-2 bg-stone-900/90 border border-amber-500/30 rounded-2xl text-xs font-sans">
                            <span className="font-bold text-amber-300 uppercase tracking-wider">🔑 Invite Code:</span>
                            <span className="font-mono font-bold text-stone-100 tracking-widest text-base select-all">{s.team?.inviteCode || "—"}</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2.5 font-sans">
                          <div className="text-right">
                            <div className="text-xs uppercase font-bold tracking-wider text-stone-400">Submission Status</div>
                            <div className={`mt-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${formatSubmissionStatus(s).color}`}>
                              {formatSubmissionStatus(s).label}
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={Boolean(s.mentorApproved)}
                            onClick={() => mentorApproveSubmission(s.id)}
                            className="mt-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-110 text-stone-950 font-extrabold uppercase text-xs tracking-wider disabled:opacity-60 transition shadow-lg cursor-pointer border border-amber-300"
                          >
                            {s.mentorApproved ? "Mentor Approved ✓" : "Mentor Approve"}
                          </button>
                        </div>
                      </div>

                      {/* Team Members */}
                      {s.team?.members?.length ? (
                        <div className="font-sans pt-2">
                          <div className="font-serif text-sm uppercase tracking-wider text-amber-300 font-normal">Team Members</div>
                          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {s.team.members.map((m) => (
                              <div key={m.userId} className="flex items-center justify-between gap-2 bg-stone-900/80 border border-amber-500/20 rounded-2xl p-3.5">
                                <div>
                                  <div className="font-semibold text-xs text-stone-100">{m.user?.fullName || "Member"}</div>
                                  <div className="text-[11px] text-stone-400 font-mono">{m.user?.email || "—"}</div>
                                </div>
                                {m.isLeader ? (
                                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold uppercase">Leader</span>
                                ) : (
                                  <span className="px-2.5 py-0.5 rounded-full bg-stone-950 text-stone-400 border border-amber-500/15 text-[10px] font-bold uppercase">Member</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {/* Selected Problem & Technical Proposal */}
                      <div className="font-sans grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div className="bg-stone-900/60 border border-amber-500/15 rounded-2xl p-4">
                          <div className="text-[11px] uppercase font-bold text-amber-300 tracking-wider font-serif flex items-center justify-between">
                            <span>Selected Problem Statement</span>
                            {formatProblemStatementDisplay(s).isPersonalized && (
                              <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[9px] font-bold uppercase tracking-wider">
                                Personalized
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-stone-100 font-semibold mt-1">
                            {formatProblemStatementDisplay(s).title}
                          </div>
                          {formatProblemStatementDisplay(s).theme && (
                            <div className="text-[11px] text-stone-400 mt-1 font-sans">
                              <strong className="text-amber-200/90 font-semibold">Theme:</strong> {formatProblemStatementDisplay(s).theme}
                            </div>
                          )}
                        </div>
                        <div className="bg-stone-900/60 border border-amber-500/15 rounded-2xl p-4">
                          <div className="text-[11px] uppercase font-bold text-amber-300 tracking-wider font-serif">Submission Summary</div>
                          <div className="text-xs text-stone-200 font-semibold mt-1 uppercase">{s.submissionPhase} phase</div>
                          {s.description && <div className="text-xs text-stone-400 mt-1">{s.description}</div>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-stone-400 text-xs font-sans serene-glass-card rounded-3xl border border-amber-500/25">
                  No registered team submissions found for this hackathon yet.
                </div>
              )}
            </div>
          ) : !team ? (
            <div className="mt-3 serene-glass-card rounded-3xl border border-amber-500/25 p-6 md:p-8 shadow-2xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="font-serif text-xl uppercase tracking-wider text-stone-100 font-normal">
                    {role === "mentor"
                      ? "Mentor Guidance Dashboard"
                      : `You are not part of a team in ${selectedStudentHackathon?.name || "this hackathon"} yet`}
                  </div>
                  <div className="mt-1.5 text-xs text-stone-400 max-w-xl font-sans leading-relaxed">
                    {role === "mentor"
                      ? "As a mentor, you can evaluate and approve PoC / Prototype submissions assigned to your problem statements under the Assigned Submissions tab."
                      : "Create a new team to become Team Leader, or enter an 8-character invite code to join an existing team."}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {role === "mentor" ? (
                    <button
                      onClick={() => changeTab("status")}
                      className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-sans uppercase font-extrabold tracking-wider shadow-lg transition cursor-pointer border border-amber-300"
                    >
                      Go to Assigned Submissions →
                    </button>
                  ) : (
                    <>
                      <Link
                        to={`/Hackathon/create-team${selectedStudentHackathonId ? `?hackathonId=${selectedStudentHackathonId}` : ""}`}
                        className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-sans uppercase font-extrabold tracking-wider shadow-lg transition flex items-center gap-1.5 cursor-pointer border border-amber-300"
                      >
                        <span>+ Create Team</span>
                      </Link>
                      <Link
                        to={`/Hackathon/join-team${selectedStudentHackathonId ? `?hackathonId=${selectedStudentHackathonId}` : ""}`}
                        className="px-5 py-2.5 rounded-xl border border-amber-500/30 bg-stone-900/80 hover:bg-amber-400/10 text-amber-300 text-xs font-sans uppercase font-bold tracking-wider shadow-lg transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>🔑 Join Team</span>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-3 serene-glass-card rounded-3xl border border-amber-500/25 p-6 md:p-8 shadow-2xl space-y-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {team?.status === "approved" ? "Team Registered" : team?.status || "Active"}
                  </div>
                  <div className="font-serif text-3xl uppercase tracking-wider text-stone-100 mt-2 font-normal">{team?.teamName}</div>
                  <div className="mt-3 inline-flex items-center gap-3 px-4 py-2 bg-stone-900/90 border border-amber-500/30 rounded-2xl text-xs font-sans">
                    <span className="font-bold text-amber-300 uppercase tracking-wider">🔑 Team Invite Code:</span>
                    <span className="font-mono font-bold text-stone-100 tracking-widest text-base select-all">{team?.inviteCode}</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (team?.inviteCode) {
                          navigator.clipboard.writeText(team.inviteCode);
                          setCopiedCode(true);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 shadow-sm flex items-center gap-1.5 cursor-pointer ${
                        copiedCode
                          ? "bg-emerald-500 text-stone-950 scale-105 font-bold"
                          : "bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/30"
                      }`}
                    >
                      {copiedCode ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2.5 font-sans">
                  <div className="text-right">
                    <div className="text-xs uppercase font-bold tracking-wider text-stone-400">Submission Status</div>
                    <div className={`mt-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${formatSubmissionStatus(latestSubmission).color}`}>
                      {formatSubmissionStatus(latestSubmission).label}
                    </div>
                  </div>
                  {!isSubmissionApproved && role === "student" && (
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      {team?.isLeader && (
                        <button
                          type="button"
                          disabled={dismantlingTeam}
                          onClick={handleDismantleTeam}
                          className="px-3.5 py-1.5 rounded-xl border border-rose-500/30 bg-rose-600/20 text-rose-300 text-xs font-bold uppercase tracking-wider hover:bg-rose-600/30 transition disabled:opacity-60 shadow-sm flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{dismantlingTeam ? "Dismantling..." : "Dismantle Team"}</span>
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={leavingTeam}
                        onClick={handleLeaveTeam}
                        className="px-3.5 py-1.5 rounded-xl border border-rose-500/30 bg-rose-600/10 text-rose-300 text-xs font-bold uppercase tracking-wider hover:bg-rose-600/20 transition disabled:opacity-60 shadow-sm flex items-center gap-1.5 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{leavingTeam ? "Leaving..." : "Leave Team"}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 font-sans">
                <div className="font-serif text-lg uppercase tracking-wider text-amber-300 font-normal">Team Members</div>
                <div className="mt-3 space-y-2">
                  {(team?.members || []).map((m) => (
                    <div
                      key={m.userId}
                      className="flex items-start justify-between gap-3 bg-stone-900/80 border border-amber-500/20 rounded-2xl p-4"
                    >
                      <div>
                        <div className="font-semibold text-stone-100">{m.member?.fullName || "Member"}</div>
                        <div className="text-xs text-stone-400 font-mono">{m.member?.email}</div>
                      </div>
                      {m.isLeader ? (
                        <div className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold uppercase tracking-wider">
                          Leader
                        </div>
                      ) : (
                        <div className="px-3 py-1 rounded-full bg-stone-950 text-stone-400 border border-amber-500/15 text-xs font-bold uppercase tracking-wider">
                          Member
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 font-sans">
                <div className="font-serif text-lg uppercase tracking-wider text-amber-300 font-normal">
                  {isCustomMode ? "Project Theme & Topic" : "Selected Problem"}
                </div>
                <div className="mt-2 text-stone-200 font-sans text-sm">
                  {isCustomMode
                    ? team?.topic
                      ? `${team.topic} (${team.theme || "No Theme"})`
                      : team?.theme
                        ? `Theme: ${team.theme}`
                        : "Not configured yet"
                    : selectedProblem
                      ? selectedProblem.title
                      : team?.topic
                        ? team.topic
                        : "Not selected yet"}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* PROBLEMS TAB */}
      {activeTab === "problems" && role === "student" ? (
        <div className="mt-5 w-full max-w-6xl mx-auto font-sans">
          {teamHasSubmitted ? (
            <div className="mb-6">
              <AlertCard tone="success">
                Your team has already submitted. You can review your entry under the <strong className="underline underline-offset-2">Status</strong> tab.
              </AlertCard>
            </div>
          ) : null}
          {selectedStudentHackathon?.problemStatementType === "custom" ? (
            <div className="serene-glass-card rounded-3xl border border-amber-500/25 p-6 sm:p-8 max-w-3xl mx-auto shadow-2xl text-stone-100 font-sans">
              <div className="flex items-center justify-between gap-3 mb-5 pb-4 border-b border-amber-500/20 flex-wrap">
                <div>
                  <h3 className="font-serif text-2xl uppercase tracking-wider text-stone-100 flex items-center gap-2 font-normal">
                    <span>✨ Personalized Problem Statement (Abstraction)</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-sans font-bold">
                      {selectedStudentHackathon?.name || "Selected Event"}
                    </span>
                  </h3>
                  <p className="text-xs text-stone-400 mt-1 font-sans">
                    Select your project theme and enter your personalized problem statement title and abstraction details below.
                  </p>
                </div>
                {!showResults ? (
                  <span className="text-xs font-bold px-3.5 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider animate-pulse">
                    PENDING ⏳
                  </span>
                ) : team?.abstractionStatus === "approved" ? (
                  <span className="text-xs font-bold px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                    Approved by Reviewer ✓
                  </span>
                ) : team?.abstractionStatus === "rejected" || team?.abstractionStatus === "needs_revision" ? (
                  <span className="text-xs font-bold px-3.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase tracking-wider">
                    Not Selected ❌
                  </span>
                ) : (
                  <span className="text-xs font-bold px-3.5 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider animate-pulse">
                    PENDING ⏳
                  </span>
                )}
              </div>

              {showResults && team?.reviewerFeedback && (
                <div className="mb-5 p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200 font-sans">
                  <strong className="block uppercase tracking-wider font-bold text-rose-300 mb-1">
                    Reviewer Notes / Feedback:
                  </strong>
                  <p className="italic">"{team.reviewerFeedback}"</p>
                </div>
              )}

              <form onSubmit={handleSaveCustomProblem} className="space-y-5">
                <div>
                  <label className="block text-xs font-serif uppercase tracking-wider text-amber-300 mb-2 font-normal">
                    Select Project Theme *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {(
                      Array.isArray(selectedStudentHackathon?.themes) && selectedStudentHackathon.themes.length > 0
                        ? selectedStudentHackathon.themes
                        : [
                            "Disaster Resilience",
                            "Waste Management",
                            "Energy Solutions",
                            "Smart Agriculture",
                            "Pollution Control",
                            "Smart Mobility & Parking",
                            "Smart Healthcare",
                          ]
                    ).map((t) => {
                      const isSel = customTheme === t;
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setCustomTheme(t)}
                          className={`p-3 rounded-2xl border text-left text-xs font-sans transition flex items-center gap-2 cursor-pointer ${
                            isSel
                              ? "bg-amber-400/20 border-amber-400 text-amber-200 font-bold shadow-md ring-1 ring-amber-400/40"
                              : "bg-stone-900/80 border-amber-500/20 text-stone-300 hover:border-amber-400/50 hover:bg-stone-900"
                          }`}
                        >
                          <span className={`w-3 h-3 rounded-full shrink-0 ${isSel ? "bg-amber-400 ring-2 ring-amber-400/40" : "bg-stone-600"}`} />
                          <span>{t}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-serif uppercase tracking-wider text-amber-300 mb-1.5 font-normal">
                    Problem Statement Title / Topic *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AI-driven Autonomous Water Quality Monitoring System"
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-amber-500/30 bg-stone-900/90 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-serif uppercase tracking-wider text-amber-300 mb-1.5 font-normal">
                    Project Description (Abstraction) (in ~300 words) *
                  </label>
                  <textarea
                    rows={6}
                    required
                    placeholder="Describe the problem, key objectives, proposed technology stack, and expected outcomes in about 300 words..."
                    value={customDesc}
                    onChange={(e) => setCustomDesc(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-amber-500/30 bg-stone-900/90 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400 font-sans"
                  />
                </div>

                {customProblemMsg ? (
                  <div
                    className={`p-3.5 rounded-xl text-xs font-bold ${
                      customProblemSuccess
                        ? "bg-emerald-950/40 text-emerald-300 border border-emerald-500/40"
                        : "bg-rose-950/40 text-rose-200 border border-rose-500/40"
                    }`}
                  >
                    {customProblemMsg}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={savingCustomProblem}
                  className="w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 font-extrabold text-xs uppercase tracking-wider transition shadow-lg disabled:opacity-60 cursor-pointer border border-amber-300 flex items-center justify-center gap-2"
                >
                  <span>{savingCustomProblem ? "SUBMITTING..." : "SUBMIT THE PROBLEM"}</span>
                </button>
              </form>
            </div>
          ) : problemsLoading ? (
            <div className="text-stone-400 font-sans text-xs uppercase tracking-widest">Loading problems...</div>
          ) : problems.length ? (
            <div className="flex flex-col gap-8 sm:gap-10">
              {problems.map((p) => (
                <HackathonProblemArticleCard
                  key={p.id}
                  problem={p}
                  footerMeta={
                    <div className="font-sans text-xs text-stone-400">
                      {p.teamRegistrationLimit != null && p.teamRegistrationLimit > 0 ? (
                        <span>
                          Teams registered:{" "}
                          <strong className="font-bold text-amber-300">{p.registeredTeams ?? 0}</strong> /{" "}
                          <strong className="font-bold text-stone-200">{p.teamRegistrationLimit}</strong>
                        </span>
                      ) : (
                        <span>
                          Teams registered:{" "}
                          <strong className="font-bold text-amber-300">{p.registeredTeams ?? 0}</strong>
                        </span>
                      )}
                      {problemIsFull(p) ? (
                        <span className="block mt-1 text-amber-400 font-bold uppercase tracking-wider">Registration full</span>
                      ) : null}
                    </div>
                  }
                  action={
                    teamHasSubmitted ? (
                      <div className="px-6 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Submitted</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={problemIsFull(p)}
                        onClick={() => onSelectProblem(p)}
                        className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 font-extrabold text-xs uppercase tracking-wider hover:brightness-110 transition shadow-lg border border-amber-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {problemIsFull(p) ? "Full" : "Select Problem"}
                      </button>
                    )
                  }
                />
              ))}
            </div>
          ) : (
            <div className="serene-glass-card rounded-3xl border border-amber-500/25 p-8 shadow-2xl text-stone-400 font-sans leading-relaxed text-center text-xs uppercase tracking-widest">
              No problems available yet.
            </div>
          )}
        </div>
      ) : null}

      {/* SUBMIT TAB */}
      {activeTab === "submit" && role === "student" ? (
        <div className="mt-5 w-full max-w-5xl mx-auto font-sans">
          {teamLoading || problemsLoading ? <div className="text-stone-400 font-sans text-xs uppercase tracking-widest mb-4">Loading team status...</div> : null}
          
          {teamHasSubmitted ? (
            <div className="serene-glass-card rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-8 md:p-10 shadow-2xl space-y-6 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto text-2xl font-bold shadow-lg">
                ✓
              </div>
              <div className="space-y-2">
                <div className="font-serif text-3xl uppercase tracking-wider text-stone-100 font-normal">
                  Form Submitted Successfully!
                </div>
                <p className="text-stone-300 text-sm max-w-lg mx-auto leading-relaxed font-sans">
                  Your team (<strong className="text-amber-300 font-semibold">{team?.teamName}</strong>) has already submitted your project proposal and documents for this hackathon.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-extrabold uppercase tracking-wider">
                Status: Under Review by Faculty Mentor
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => changeTab("status")}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 font-extrabold text-xs uppercase tracking-wider hover:brightness-110 transition shadow-lg border border-amber-300 cursor-pointer"
                >
                  Track Status on Status Tab →
                </button>
              </div>
            </div>
          ) : (
            <>
              {!submitAllowed ? (
                <div className="mb-5">
                  <AlertCard tone="warning">
                    {submissionBlockedReason || "You are not part of any team yet. Create or join a team first."}
                  </AlertCard>
                </div>
              ) : team?.status === "pending" ? (
                <div className="mb-5">
                  <AlertCard tone="warning">Team approval is automatic. You can submit now.</AlertCard>
                </div>
              ) : null}

              <div className="serene-glass-card rounded-3xl border border-amber-500/25 p-6 md:p-8 shadow-2xl text-stone-100 font-sans" aria-disabled={!submitAllowed}>
                
                {/* Step 1 / Step 2 Tabs */}
                <div className="mb-6 rounded-2xl border border-amber-500/20 bg-stone-900/80 p-1.5 shadow-inner">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSubmissionStep(1)}
                      className={`rounded-xl px-4 py-3 text-center transition cursor-pointer font-sans ${
                        submissionStep === 1
                          ? "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 font-bold shadow-lg border border-amber-300"
                          : "bg-stone-950/60 text-stone-400 border border-amber-500/10 hover:text-amber-300 hover:border-amber-500/30"
                      }`}
                    >
                      <div className="text-[10px] font-bold uppercase tracking-widest">Step 1</div>
                      <div className="text-xs font-serif uppercase tracking-wider font-semibold mt-0.5">Participation Questions</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (submitAllowed) goToSubmitStep2();
                      }}
                      className={`rounded-xl px-4 py-3 text-center transition cursor-pointer font-sans ${
                        submissionStep === 2
                          ? "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 font-bold shadow-lg border border-amber-300"
                          : "bg-stone-950/60 text-stone-400 border border-amber-500/10 hover:text-amber-300 hover:border-amber-500/30"
                      }`}
                    >
                      <div className="text-[10px] font-bold uppercase tracking-widest">Step 2</div>
                      <div className="text-xs font-serif uppercase tracking-wider font-semibold mt-0.5">File & Proposal Upload</div>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {submissionStep === 1 ? (
                    <div className="rounded-2xl border border-amber-500/20 bg-stone-900/40 p-6 space-y-5 transition-all duration-300">
                      <div>
                        <label className="block text-xs font-serif uppercase tracking-wider text-amber-300 mb-2 font-normal">
                          1. Why does your team want to participate in this hackathon? *
                        </label>
                        <textarea
                          rows={3}
                          value={whyParticipate}
                          onChange={(e) => setWhyParticipate(e.target.value)}
                          placeholder="Explain your team's motivation and goals..."
                          className="w-full rounded-xl border border-amber-500/30 bg-stone-900/90 p-3.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 font-sans"
                          disabled={!submitAllowed}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-serif uppercase tracking-wider text-amber-300 mb-2 font-normal">
                          2. What problem are you trying to solve? *
                        </label>
                        <textarea
                          rows={3}
                          value={problemToSolve}
                          onChange={(e) => setProblemToSolve(e.target.value)}
                          placeholder="Describe the core problem statement, target audience, and pain points..."
                          className="w-full rounded-xl border border-amber-500/30 bg-stone-900/90 p-3.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 font-sans"
                          disabled={!submitAllowed}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-serif uppercase tracking-wider text-amber-300 mb-2 font-normal">
                          3. What technologies are you planning to use? *
                        </label>
                        <input
                          type="text"
                          value={plannedTech}
                          onChange={(e) => setPlannedTech(e.target.value)}
                          placeholder="e.g. React, Node.js, Python, OpenCV, TensorFlow, Raspberry Pi"
                          className="w-full rounded-xl border border-amber-500/30 bg-stone-900/90 p-3.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 font-sans"
                          disabled={!submitAllowed}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-serif uppercase tracking-wider text-amber-300 mb-2 font-normal">
                          4. Have you worked on this idea before?
                        </label>
                        <select
                          value={workedBefore}
                          onChange={(e) => setWorkedBefore(e.target.value)}
                          className="w-full rounded-xl border border-amber-500/30 bg-stone-900/90 p-3.5 text-xs text-stone-100 focus:outline-none focus:border-amber-400 font-sans"
                          disabled={!submitAllowed}
                        >
                          <option value="no">No — Fresh idea for this hackathon</option>
                          <option value="yes_concept">Yes — Early concept phase</option>
                          <option value="yes_prototype">Yes — Existing prototype being expanded</option>
                        </select>
                      </div>

                      <div className="pt-2 flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="agreedTerms"
                          checked={agreedTerms}
                          onChange={(e) => setAgreedTerms(e.target.checked)}
                          className="w-4 h-4 rounded border-amber-500/40 text-amber-400 focus:ring-amber-400 cursor-pointer accent-amber-400"
                          disabled={!submitAllowed}
                        />
                        <label htmlFor="agreedTerms" className="text-xs text-stone-300 font-sans cursor-pointer select-none">
                          I agree to the official terms, rules, and code of conduct of the hackathon
                        </label>
                      </div>

                      <div className="pt-3">
                        <button
                          type="button"
                          onClick={goToSubmitStep2}
                          disabled={!submitAllowed}
                          className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 font-extrabold text-xs uppercase tracking-wider hover:brightness-110 disabled:opacity-50 transition shadow-lg border border-amber-300 cursor-pointer"
                        >
                          Continue to Step 2 →
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={onSubmit} className="rounded-2xl border border-amber-500/20 bg-stone-900/40 p-6 space-y-5 transition-all duration-300">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-serif uppercase tracking-wider text-amber-300 mb-1.5 font-normal">
                            {isCustomMode ? "Personalized Problem Topic / Theme" : "Selected Problem Statement"}
                          </label>
                          <input
                            type="text"
                            readOnly
                            value={
                              isCustomMode
                                ? (team?.topic || team?.theme || "Personalized Problem Statement")
                                : (selectedProblem ? selectedProblem.title : team?.topic || "Selected Problem Statement")
                            }
                            className="w-full rounded-xl border border-amber-500/20 bg-stone-950/80 px-4 py-3 text-xs text-stone-300 font-sans cursor-not-allowed font-semibold"
                          />
                          {!isCustomMode && selectedProblem && (
                            <div className="mt-1.5 text-[11px] text-stone-400 font-sans">Mentors: {mentorNamesForProblem(selectedProblem)}</div>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-serif uppercase tracking-wider text-amber-300 mb-1.5 font-normal">
                            Submission Phase
                          </label>
                          <select
                            value={phase}
                            onChange={(e) => {
                              setPhase(e.target.value);
                              setFiles([]);
                            }}
                            className="w-full rounded-xl border border-amber-500/30 bg-stone-900/90 px-4 py-3 text-xs text-stone-100 focus:outline-none focus:border-amber-400 font-sans"
                            disabled={!submitAllowed}
                          >
                            <option value="poc">Proof of Concept (PoC)</option>
                            <option value="prototype">Working Prototype</option>
                            <option value="final">Final Presentation / Codebase</option>
                          </select>
                        </div>
                      </div>

                      {phase === "poc" ? (
                        <div className="rounded-2xl border border-amber-500/30 bg-amber-400/10 p-4 text-xs text-amber-200 flex items-center justify-between gap-3 flex-wrap">
                          <div>
                            <div className="font-bold uppercase tracking-wider text-stone-100 font-serif">PoC Submission Template</div>
                            <p className="mt-1 text-stone-300 font-sans text-xs">
                              Follow the official PDF structure for your PoC document upload.
                            </p>
                          </div>
                          {templatePdfHref ? (
                            <a
                              href={templatePdfHref}
                              download="hackathon_poc_template.pdf"
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs uppercase font-extrabold tracking-wider transition shadow-md border border-amber-300"
                            >
                              <span>Download Template PDF</span>
                              <span className="font-sans">📄</span>
                            </a>
                          ) : null}
                        </div>
                      ) : null}

                      <div>
                        <label className="block text-xs font-serif uppercase tracking-wider text-amber-300 mb-1.5 font-normal">
                          Submission Summary / Approach *
                        </label>
                        <textarea
                          rows={4}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Summarize your technical implementation, methodology, architecture, and current progress..."
                          className="w-full rounded-xl border border-amber-500/30 bg-stone-900/90 p-4 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 font-sans"
                          disabled={!submitAllowed}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-serif uppercase tracking-wider text-amber-300 mb-1.5 font-normal">
                          Upload {phase === "poc" ? "PoC Document" : phase === "prototype" ? "Prototype Files" : "Final Submission"} *
                        </label>
                        <input
                          type="file"
                          accept=".pdf,.docx"
                          multiple={phase !== "poc"}
                          onChange={(e) => {
                            const selectedFiles = Array.from(e.target.files || []);
                            const fileErr = validateSubmissionFiles(selectedFiles);
                            if (fileErr) {
                              setSubmitError(fileErr);
                              setFiles([]);
                            } else {
                              setSubmitError(null);
                              setFiles(selectedFiles);
                            }
                          }}
                          className="w-full text-xs text-stone-300 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border file:border-amber-500/30 file:text-xs file:font-bold file:uppercase file:tracking-wider file:bg-amber-400 file:text-stone-950 hover:file:brightness-110 transition cursor-pointer"
                        />
                        <p className="mt-1 text-[11px] text-stone-400 font-sans">Accepted formats: PDF or DOCX documents only.</p>
                      </div>

                      <div className="pt-3 flex flex-col sm:flex-row gap-3">
                        <button
                          type="button"
                          onClick={() => setSubmissionStep(1)}
                          className="px-6 py-3 rounded-xl bg-stone-900 border border-amber-500/30 text-stone-300 font-bold text-xs uppercase tracking-wider hover:bg-stone-800 hover:text-amber-300 transition cursor-pointer"
                        >
                          ← Back to Questions
                        </button>
                        <button
                          type="submit"
                          disabled={submitting || !submitAllowed}
                          className="flex-1 px-8 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 font-extrabold text-xs uppercase tracking-wider hover:brightness-110 disabled:opacity-50 transition shadow-lg border border-amber-300 cursor-pointer"
                        >
                          {submitting ? "Submitting Proposal..." : "Submit Proposal & Files 🚀"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {submitError ? (
                  <div className="mt-5">
                    <AlertCard tone="warning">{submitError}</AlertCard>
                  </div>
                ) : null}
              </div>
            </>
          )}
        </div>
      ) : null}

      {/* STATUS TAB */}
      {activeTab === "status" ? (
        <div className="mt-5 font-sans">
          {statusLoading ? <div className="text-stone-400 text-xs font-sans uppercase tracking-widest">Loading status...</div> : null}
          <div className="max-w-4xl mx-auto space-y-4">
          {role === "mentor" ? (
            <div className="serene-glass-card rounded-3xl border border-amber-500/25 p-6 md:p-8 shadow-2xl text-stone-100">
              <div className="font-serif text-2xl uppercase tracking-wider text-stone-100 font-normal">Assigned Submissions</div>
              <p className="text-xs text-stone-400 mt-1 font-sans">
                Submissions for the problems assigned to you for technical review and mentor approval.
              </p>

              {statusData.submissions?.length ? (
                <div className="mt-6 space-y-5">
                  {statusData.submissions.map((s) => (
                    <div key={s.id} className="p-6 rounded-2xl border border-amber-500/20 bg-stone-900/90 text-stone-100 space-y-4 shadow-xl">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <div className="font-serif text-lg text-amber-300 uppercase tracking-wider font-normal flex items-center gap-2 flex-wrap">
                            <span>{formatProblemStatementDisplay(s).title} ({s.submissionPhase} phase)</span>
                            {formatProblemStatementDisplay(s).isPersonalized && (
                              <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[9px] font-bold uppercase tracking-wider">
                                Personalized
                              </span>
                            )}
                          </div>
                          {formatProblemStatementDisplay(s).theme && (
                            <div className="text-xs text-amber-200/90 font-sans mt-0.5">
                              <strong>Theme:</strong> {formatProblemStatementDisplay(s).theme}
                            </div>
                          )}
                          <div className="text-xs text-stone-300 mt-1 font-sans">
                            Team: <span className="font-bold text-stone-100">{s.team?.teamName || "—"}</span>
                          </div>
                        </div>
                        <div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${formatSubmissionStatus(s).color}`}>
                            {formatSubmissionStatus(s).label}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3 font-sans text-xs">
                        <div className="rounded-2xl border border-amber-500/20 bg-stone-950/70 p-4">
                          <div className="text-xs uppercase font-bold text-amber-300 tracking-wider">Team members</div>
                          <div className="text-xs text-stone-200 mt-1">
                            {(s.team?.members || [])
                              .map((m) => (m?.user?.fullName ? `${m.user.fullName}${m.isLeader ? " (Leader)" : ""}` : null))
                              .filter(Boolean)
                              .join(", ") || "—"}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-amber-500/20 bg-stone-950/70 p-4 space-y-2">
                          <div className="text-xs uppercase font-bold text-amber-300 tracking-wider">Participation details</div>
                          <div className="space-y-2.5 text-stone-200 pt-1">
                            <div>
                              <div className="font-bold text-stone-300">
                                1. Why does your team want to participate in this hackathon?
                              </div>
                              <div className="text-stone-400 whitespace-pre-wrap mt-0.5">{s.whyParticipate || "—"}</div>
                            </div>
                            <div>
                              <div className="font-bold text-stone-300">2. What problem are you trying to solve?</div>
                              <div className="text-stone-400 whitespace-pre-wrap mt-0.5">{s.problemToSolve || "—"}</div>
                            </div>
                            <div>
                              <div className="font-bold text-stone-300">3. What technologies are you planning to use?</div>
                              <div className="text-stone-400 whitespace-pre-wrap mt-0.5">{s.plannedTech || "—"}</div>
                            </div>
                            <div>
                              <div className="font-bold text-stone-300">4. Have you worked on this idea before?</div>
                              <div className="text-stone-400 mt-0.5">{s.workedBefore ? String(s.workedBefore) : "—"}</div>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-amber-500/20 bg-stone-950/70 p-4">
                          <div className="text-xs uppercase font-bold text-amber-300 tracking-wider">Description</div>
                          <div className="text-xs text-stone-300 mt-1 whitespace-pre-wrap">{s.description || "—"}</div>
                        </div>

                        <div className="rounded-2xl border border-amber-500/20 bg-stone-950/70 p-4">
                          <div className="text-xs uppercase font-bold text-amber-300 tracking-wider">Uploaded files</div>
                          {getSubmissionFiles(s).length ? (
                            <div className="mt-2 space-y-2">
                              {getSubmissionFiles(s).map((u, idx) => (
                                <div key={`${u}-${idx}`} className="flex flex-wrap items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => void downloadHackathonSubmissionFile(u)}
                                    className="inline-flex items-center rounded-xl bg-amber-400/20 border border-amber-400/30 px-3 py-1 text-xs font-bold uppercase text-amber-300 hover:bg-amber-400/30 transition cursor-pointer"
                                  >
                                    Download
                                  </button>
                                  <a
                                    href={fileHref(u)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-amber-300 hover:underline font-mono break-all"
                                  >
                                    {fileNameFromUrl(u)}
                                  </a>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-xs text-stone-500 mt-1">—</div>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-3 flex-wrap pt-2">
                          <div className="text-xs text-stone-300 font-sans">
                            Mentor approval:{" "}
                            <span className={`font-bold ${s.mentorApproved ? "text-emerald-400" : "text-amber-300"}`}>
                              {s.mentorApproved ? "Approved ✓" : "Not approved"}
                            </span>
                          </div>
                          <button
                            type="button"
                            disabled={Boolean(s.mentorApproved)}
                            onClick={() => mentorApproveSubmission(s.id)}
                            className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold uppercase text-xs tracking-wider disabled:opacity-60 transition shadow-lg cursor-pointer border border-amber-300"
                          >
                            {s.mentorApproved ? "Mentor Approved ✓" : "Mentor Approve"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-6 p-6 text-center text-stone-400 text-xs font-sans border border-amber-500/15 rounded-2xl bg-stone-950/60">
                  No submissions found for your assigned problems yet.
                </div>
              )}
            </div>
          ) : !statusData?.team ? (
            <AlertCard tone="warning">No team found. Create/join a team to track submissions.</AlertCard>
          ) : (
            <div className="serene-glass-card rounded-3xl border border-amber-500/25 p-6 md:p-8 shadow-2xl text-stone-100 space-y-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {statusData?.team?.status === "approved" ? "Team Registered" : statusData?.team?.status || "Active"}
                  </div>
                  <div className="font-serif text-3xl uppercase tracking-wider text-stone-100 mt-2 font-normal">{statusData?.team?.teamName}</div>
                  <div className="text-xs text-stone-400 mt-1 font-mono">
                    Invite Code: <span className="text-amber-300 font-bold">{statusData?.team?.inviteCode}</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="font-serif text-xl uppercase tracking-wider text-amber-300 font-normal border-b border-amber-500/20 pb-2 mb-4">
                  Submissions
                </div>
                {statusData.submissions?.length ? (
                  <div className="space-y-4 font-sans text-xs">
                    {statusData.submissions.map((s) => (
                      <div key={s.id} className="p-5 rounded-2xl border border-amber-500/20 bg-stone-900/90 text-stone-100 space-y-3">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div>
                            <div className="font-serif text-base uppercase text-stone-100 font-normal">
                              {s.problem?.title || "Problem Track"} ({s.submissionPhase} phase)
                            </div>
                            <div className="text-xs text-stone-300 mt-0.5">{s.title}</div>
                          </div>
                          <div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${formatSubmissionStatus(s).color}`}>
                              {formatSubmissionStatus(s).label}
                            </span>
                            {s.winnerAmount ? (
                              <div className="text-xs text-emerald-400 font-bold mt-2">
                                Winner Prize: ₹{s.winnerAmount}
                              </div>
                            ) : null}
                          </div>
                        </div>
                        {s.description ? (
                          <div className="text-xs text-stone-300 whitespace-pre-wrap border-t border-amber-500/15 pt-3">
                            {s.description}
                          </div>
                        ) : null}
                        <div className="rounded-2xl border border-amber-500/20 bg-stone-950/60 p-4">
                          <div className="text-xs uppercase font-bold text-amber-300 tracking-wider">
                            {s.submissionPhase === "poc"
                              ? "PoC files"
                              : s.submissionPhase === "prototype"
                                ? "Prototype files"
                                : "Final files"}
                          </div>
                          {getSubmissionFiles(s).length ? (
                            <div className="mt-2 space-y-2">
                              {getSubmissionFiles(s).map((u, idx) => (
                                <div key={`${u}-${idx}`} className="flex flex-wrap items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => void downloadHackathonSubmissionFile(u)}
                                    className="inline-flex items-center rounded-xl bg-amber-400/20 border border-amber-400/30 px-3 py-1 text-xs font-bold uppercase text-amber-300 hover:bg-amber-400/30 transition cursor-pointer"
                                  >
                                    Download
                                  </button>
                                  <a
                                    href={fileHref(u)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-amber-300 hover:underline font-mono break-all"
                                  >
                                    {fileNameFromUrl(u)}
                                  </a>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-xs text-stone-500 mt-1">No files for this phase.</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-stone-400 text-xs font-sans border border-amber-500/15 rounded-2xl bg-stone-950/60">
                    No submissions found yet.
                  </div>
                )}
              </div>
            </div>
          )}
          </div>
        </div>
      ) : null}

      {guidelinesOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 font-sans">
          <div className="w-full max-w-2xl serene-glass-card rounded-3xl border border-amber-500/30 p-6 md:p-8 shadow-2xl text-stone-100">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-serif text-2xl uppercase tracking-wider text-amber-300 font-normal">Hackathon Guidelines</h3>
                <p className="text-xs text-stone-400 font-dancing mt-1">Official rules and guidelines for participation.</p>
              </div>
              <button
                onClick={() => setGuidelinesOpen(false)}
                className="px-4 py-2 rounded-xl border border-amber-500/30 bg-stone-900/80 hover:bg-amber-400/10 text-amber-300 text-xs font-bold uppercase transition cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="mt-5 space-y-3 text-xs">
              <div className="bg-stone-900/90 border border-amber-500/20 rounded-2xl p-4 space-y-1">
                <div className="font-serif text-sm uppercase tracking-wider text-amber-300 font-normal">Team Rules</div>
                <ul className="mt-2 space-y-1.5 text-stone-300 list-disc list-inside">
                  <li>Max 4 members per team</li>
                  <li>Team approval is automatic for submissions</li>
                  <li>Submit PoC / Prototype only once</li>
                </ul>
              </div>
              <div className="bg-stone-900/90 border border-amber-500/20 rounded-2xl p-4 space-y-1">
                <div className="font-serif text-sm uppercase tracking-wider text-amber-300 font-normal">Prizes & Support</div>
                <ul className="mt-2 space-y-1.5 text-stone-300 list-disc list-inside">
                  <li>Prize pool up to ₹60,000</li>
                  <li>Internship opportunities for selected top performing teams</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 flex gap-3 flex-wrap">
              <button
                onClick={() => {
                  setGuidelinesOpen(false);
                  changeTab("problems");
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 font-bold uppercase text-xs tracking-wider hover:brightness-110 transition shadow-lg cursor-pointer"
              >
                Select Problems
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Leave Team Warning Modal */}
      {confirmLeaveModal ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-fadeIn">
          <div className="serene-glass-card rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-amber-500/30 text-stone-100 font-sans">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-serif text-xl uppercase tracking-wider text-stone-100 font-normal">
                  Leave Team Confirmation
                </h3>
                <div className="text-[11px] font-mono text-amber-300 font-bold uppercase">
                  Team: {team?.teamName || "—"}
                </div>
              </div>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed font-sans mb-4">
              {team?.isLeader
                ? "Are you sure you want to leave this team? Since you are the Team Leader, leadership will automatically transfer to the next team member (or the team will be deleted if you are the only member)."
                : "Are you sure you want to leave this team? You will be removed from the team roster and freed to join or create another team."}
            </p>

            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200 font-semibold mb-6 flex items-start gap-2">
              <span className="text-amber-400 font-bold">⚠️ Notice:</span>
              <span>This action will unassign you from this team's project track.</span>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmLeaveModal(false)}
                className="px-4 py-2.5 rounded-xl border border-stone-700 bg-stone-900/80 text-stone-300 text-xs uppercase font-bold tracking-wider hover:bg-stone-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={leavingTeam}
                onClick={executeLeaveTeam}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-stone-950 text-xs uppercase font-extrabold tracking-wider hover:brightness-110 transition shadow-lg disabled:opacity-60 cursor-pointer"
              >
                {leavingTeam ? "Leaving..." : "Yes, Leave Team"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Dismantle Team Warning Modal */}
      {confirmDismantleModal ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-fadeIn">
          <div className="serene-glass-card rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-rose-500/40 text-stone-100 font-sans">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-300 shrink-0">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="font-serif text-xl uppercase tracking-wider text-stone-100 font-normal">
                  Dismantle Team Confirmation
                </h3>
                <div className="text-[11px] font-mono text-rose-300 font-bold uppercase">
                  Team: {team?.teamName || "—"}
                </div>
              </div>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed font-sans mb-4">
              Are you sure you want to dismantle <strong className="text-stone-100">{team?.teamName || "this team"}</strong>? The team will be completely deleted and all members will be freed to join or create new teams.
            </p>

            <div className="p-3.5 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-[11px] text-rose-200 font-semibold mb-6 flex items-start gap-2">
              <span className="text-rose-400 font-bold">🚨 Warning:</span>
              <span>This will permanently delete the team invite code and roster.</span>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDismantleModal(false)}
                className="px-4 py-2.5 rounded-xl border border-stone-700 bg-stone-900/80 text-stone-300 text-xs uppercase font-bold tracking-wider hover:bg-stone-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={dismantlingTeam}
                onClick={executeDismantleTeam}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 via-rose-600 to-rose-700 text-stone-100 text-xs uppercase font-extrabold tracking-wider hover:brightness-110 transition shadow-lg disabled:opacity-60 cursor-pointer"
              >
                {dismantlingTeam ? "Dismantling..." : "Yes, Dismantle Team"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default HackathonDashboard;

