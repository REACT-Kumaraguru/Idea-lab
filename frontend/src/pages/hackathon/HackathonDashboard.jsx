import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams, useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { axiosInstance } from "../../lib/axios.js";
import { getHackathonTemplatePdfHref } from "../../lib/config.js";
import { isAllowedSubmissionFile, validateSubmissionFiles } from "../../lib/hackathonSubmissionFileTypes.js";
import { downloadHackathonSubmissionFile, fileHref } from "../../lib/hackathonSubmissionFiles.js";
import { useHackathonAuthStore } from "../../store/useHackathonAuthStore";
import { AlertTriangle, Check, Copy, LogOut, Trash2, Trophy, Lock, QrCode, FileText, MessageSquare, ExternalLink, Download, Printer, UserX, ShieldCheck, Sparkles } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import {
  HackathonProblemArticleCard,
  mentorNamesForProblem,
} from "../../components/hackathon/HackathonProblemArticleCard.jsx";
import AmbientBackground from "../../components/AmbientBackground";
import ReviewerDashboard from "./ReviewerDashboard";
import ClusterDashboard from "./ClusterDashboard";
import HackathonPaymentDetails from "./HackathonPaymentDetails";
import DashboardGuidelinesTab from "../../components/hackathon/dashboard/DashboardGuidelinesTab.jsx";
import DashboardContactTab from "../../components/hackathon/dashboard/DashboardContactTab.jsx";
import DashboardTeamTab from "../../components/hackathon/dashboard/DashboardTeamTab.jsx";
import DashboardProblemsTab from "../../components/hackathon/dashboard/DashboardProblemsTab.jsx";
import DashboardSubmitTab from "../../components/hackathon/dashboard/DashboardSubmitTab.jsx";
import DashboardStatusTab from "../../components/hackathon/dashboard/DashboardStatusTab.jsx";

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
    if (t && ["team", "problems", "submit", "status", "guidelines", "contact"].includes(t)) return t;
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

  const [memberToRemove, setMemberToRemove] = useState(null);
  const [removingMember, setRemovingMember] = useState(false);

  const confirmRemoveMember = async () => {
    if (!memberToRemove || !team?.id) return;
    setRemovingMember(true);
    try {
      await axiosInstance.delete(`/ich2026/team/members/${memberToRemove.userId || memberToRemove.id}`);
      toast.success(`Removed ${memberToRemove.fullName || "member"} from team`);
      setMemberToRemove(null);
      const res = await axiosInstance.get(`/ich2026/team${selectedStudentHackathonId ? `?hackathonId=${selectedStudentHackathonId}` : ""}`);
      setTeam(res.data?.team || null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove member");
    } finally {
      setRemovingMember(false);
    }
  };

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
  const [repoLink, setRepoLink] = useState("");
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
  const [isEditingAbstraction, setIsEditingAbstraction] = useState(false);

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

  const isCustomMode =
    selectedStudentHackathon?.problemStatementType === "custom" ||
    String(selectedStudentHackathonId) === "2" ||
    String(selectedStudentHackathonId) === "6";

  const showResults = selectedStudentHackathon?.showResults === true;
  const isAbstractionApproved = team?.abstractionStatus === "approved";

  const studentTabs = useMemo(() => {
    const base = [
      { key: "team", label: "Team" },
      { key: "problems", label: "Problems" },
    ];
    if (isAbstractionApproved) {
      base.push({ key: "payment", label: "Payment Details" });
    }
    return base;
  }, [isAbstractionApproved]);

  const mentorTabs = [
    { key: "team", label: "Team" },
    { key: "status", label: "Status" },
  ];

  const tabs = role === "mentor" ? mentorTabs : studentTabs;

  useEffect(() => {
    if (role === "student" && !isAbstractionApproved) {
      if (activeTab === "payment" || activeTab === "submit" || activeTab === "status") {
        changeTab("team");
      }
    }
  }, [role, isAbstractionApproved, activeTab]);

  const formatProblemStatementDisplay = (s) => {
    if (!s) return { title: "—", isPersonalized: false, theme: null };
    const teamTopic = s.team?.topic;
    const teamTheme = s.team?.theme;
    const subTitle = s.title;

    const isPersonalized = isCustomMode || Boolean(teamTopic && teamTheme);

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

  const selectedProblemId = isCustomMode
    ? team?.id || 1
    : selectedProblem?.problemId || team?.problemId || null;

  const registrationBlocksSubmission = Boolean(registrationClosed);

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

  const resetSubmissionSteps = () => {
    setSubmissionStep(1);
    setWhyParticipate("");
    setProblemToSolve("");
    setPlannedTech("");
    setWorkedBefore("no");
    setAgreedTerms(false);
    setRepoLink("");
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
      const finalDescription = (description || "") + (repoLink?.trim() ? `\n\nProject Link / Repository: ${repoLink.trim()}` : "");
      fd.append("description", finalDescription);
      if (repoLink?.trim()) fd.append("repoLink", repoLink.trim());
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

  if (role === "reviewer" || role === "faculty") {
    return <ClusterDashboard />;
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

      {/* LEVEL 1 EVALUATION STATUS NOTIFICATION BANNER */}
      {role === "student" && team && (
        <div className="mt-4 mb-2">
          {team.abstractionStatus === "approved" ? (
            <div className="serene-glass-card rounded-3xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/70 via-stone-900/90 to-emerald-950/50 p-6 md:p-8 shadow-2xl backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-extrabold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>🏆 Shortlisted & Selected for Level 1 (PoC / Prototype Evaluation)</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold">Fee: ₹500 / Team</span>
                  <span className="px-3 py-1 rounded-full bg-stone-800 text-stone-300 border border-stone-700">Due: Aug 31, 2026</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-serif text-2xl md:text-3xl text-stone-100 uppercase tracking-wide">
                  Congratulations, <span className="text-amber-300">{team.teamName}</span>!
                </h3>
                <p className="text-stone-300 text-xs md:text-sm font-sans leading-relaxed max-w-3xl">
                  Your team has been <strong>successfully shortlisted for Level 1</strong> of the Smart City Hackathon 2026 following cluster faculty evaluation of your problem statement and abstraction.
                </p>
              </div>

              <div className="grid sm:grid-cols-3 gap-3 pt-2 font-sans text-xs">
                <div className="bg-stone-950/70 border border-emerald-500/25 rounded-2xl p-4">
                  <div className="text-[10px] text-amber-300 uppercase font-bold tracking-wider font-mono">🚀 Level 1 PoC Demo</div>
                  <div className="text-stone-100 font-bold mt-1 text-sm">September 15, 2026</div>
                  <div className="text-emerald-400/90 text-[11px] mt-0.5 font-semibold">Prize Worth: ₹15,000</div>
                </div>
                <div className="bg-stone-950/70 border border-emerald-500/25 rounded-2xl p-4">
                  <div className="text-[10px] text-amber-300 uppercase font-bold tracking-wider font-mono">🏆 Level 2 Real-Time Prototype</div>
                  <div className="text-stone-100 font-bold mt-1 text-sm">October 12, 2026</div>
                  <div className="text-stone-400 text-[11px] mt-0.5">Shortlisted from Level 1</div>
                </div>
                <div className="bg-stone-950/70 border border-emerald-500/25 rounded-2xl p-4">
                  <div className="text-[10px] text-amber-300 uppercase font-bold tracking-wider font-mono">💳 Registration Fee</div>
                  <div className="text-amber-300 font-bold mt-1 text-sm">₹500 / Team</div>
                  <div className="text-stone-400 text-[11px] mt-0.5">Payment due before Aug 31</div>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => changeTab("payment")}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 text-xs font-extrabold uppercase tracking-wider shadow-lg hover:brightness-110 transition cursor-pointer border border-amber-300"
                >
                  Proceed to Payment Details Tab →
                </button>
              </div>
            </div>
          ) : team.abstractionStatus === "rejected" ? (
            <div className="serene-glass-card rounded-3xl border border-rose-500/30 bg-gradient-to-r from-rose-950/40 via-stone-900/90 to-stone-950/80 p-6 md:p-8 shadow-2xl backdrop-blur-xl space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-extrabold uppercase tracking-wider">
                  <span>✕ Level 1 Evaluation Outcome: Not Shortlisted</span>
                </div>
                <span className="text-xs text-stone-400 font-mono">Status: Rejected</span>
              </div>

              <div className="space-y-2">
                <h3 className="font-serif text-2xl text-stone-100 uppercase tracking-wide">
                  Evaluation Outcome for <span className="text-stone-300">{team.teamName}</span>
                </h3>
                <p className="text-stone-300 text-xs md:text-sm font-sans leading-relaxed max-w-3xl">
                  Thank you for your active participation and commitment in the Smart City Hackathon 2026. Following the comprehensive evaluation of all project abstractions by our Cluster Faculty Panel, your team has <strong>not been shortlisted</strong> for the Level 1 stage.
                </p>
              </div>
            </div>
          ) : (
            <div className="serene-glass-card rounded-3xl border border-amber-500/30 bg-stone-900/80 p-6 shadow-xl space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold uppercase tracking-wider">
                <span>⏳ Status: Under Review</span>
              </div>
              <div className="text-xs text-stone-300">
                Your problem abstraction is recorded and currently undergoing faculty evaluation.
              </div>
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
        <DashboardTeamTab
          teamLoading={teamLoading}
          role={role}
          statusData={statusData}
          changeTab={changeTab}
          team={team}
          selectedStudentHackathon={selectedStudentHackathon}
          selectedStudentHackathonId={selectedStudentHackathonId}
          copiedCode={copiedCode}
          setCopiedCode={setCopiedCode}
          isSubmissionApproved={isSubmissionApproved}
          dismantlingTeam={dismantlingTeam}
          handleDismantleTeam={handleDismantleTeam}
          leavingTeam={leavingTeam}
          handleLeaveTeam={handleLeaveTeam}
          setMemberToRemove={setMemberToRemove}
          isCustomMode={isCustomMode}
          selectedProblem={selectedProblem}
          mentorApproveSubmission={mentorApproveSubmission}
          formatSubmissionStatus={formatSubmissionStatus}
          formatProblemStatementDisplay={formatProblemStatementDisplay}
        />
      ) : null}

      {/* PROBLEMS TAB */}
      {activeTab === "problems" && role === "student" ? (
        <DashboardProblemsTab
          teamHasSubmitted={teamHasSubmitted}
          selectedStudentHackathon={selectedStudentHackathon}
          showResults={showResults}
          team={team}
          problemsLoading={problemsLoading}
          problems={problems}
          problemIsFull={problemIsFull}
          onSelectProblem={onSelectProblem}
        />
      ) : null}

      {/* SUBMIT TAB */}
      {activeTab === "submit" && role === "student" ? (
        <DashboardSubmitTab
          teamLoading={teamLoading}
          problemsLoading={problemsLoading}
          teamHasSubmitted={teamHasSubmitted}
          team={team}
          changeTab={changeTab}
          submitAllowed={submitAllowed}
          submissionBlockedReason={submissionBlockedReason}
          submissionStep={submissionStep}
          setSubmissionStep={setSubmissionStep}
          goToSubmitStep2={goToSubmitStep2}
          whyParticipate={whyParticipate}
          setWhyParticipate={setWhyParticipate}
          problemToSolve={problemToSolve}
          setProblemToSolve={setProblemToSolve}
          plannedTech={plannedTech}
          setPlannedTech={setPlannedTech}
          workedBefore={workedBefore}
          setWorkedBefore={setWorkedBefore}
          agreedTerms={agreedTerms}
          setAgreedTerms={setAgreedTerms}
          onSubmit={onSubmit}
          isCustomMode={isCustomMode}
          selectedProblem={selectedProblem}
          mentorNamesForProblem={mentorNamesForProblem}
          phase={phase}
          setPhase={setPhase}
          setFiles={setFiles}
          templatePdfHref={templatePdfHref}
          selectedStudentHackathon={selectedStudentHackathon}
          repoLink={repoLink}
          setRepoLink={setRepoLink}
          description={description}
          setDescription={setDescription}
          validateSubmissionFiles={validateSubmissionFiles}
          setSubmitError={setSubmitError}
          submitting={submitting}
          submitError={submitError}
        />
      ) : null}

      {/* STATUS TAB */}
      {activeTab === "status" ? (
        <DashboardStatusTab
          statusLoading={statusLoading}
          role={role}
          statusData={statusData}
          formatProblemStatementDisplay={formatProblemStatementDisplay}
          formatSubmissionStatus={formatSubmissionStatus}
          mentorApproveSubmission={mentorApproveSubmission}
          getSubmissionFiles={getSubmissionFiles}
          downloadHackathonSubmissionFile={downloadHackathonSubmissionFile}
          fileHref={fileHref}
          fileNameFromUrl={fileNameFromUrl}
        />
      ) : null}

      {/* PAYMENT DETAILS TAB FOR APPROVED SHORTLISTED TEAMS */}
      {activeTab === "payment" && role === "student" ? (
        <div className="mt-5 w-full max-w-5xl mx-auto font-sans">
          <HackathonPaymentDetails />
        </div>
      ) : null}

      {/* GUIDELINES TAB (Phase 14.2) */}
      {activeTab === "guidelines" ? (
        <DashboardGuidelinesTab selectedStudentHackathon={selectedStudentHackathon} />
      ) : null}

      {/* CONTACT & COMMUNITY TAB (Phase 14.8) */}
      {activeTab === "contact" ? (
        <DashboardContactTab selectedStudentHackathon={selectedStudentHackathon} />
      ) : null}

      {/* Member Removal Warning Modal (Phase 14.9) */}
      {memberToRemove ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-fadeIn">
          <div className="serene-glass-card rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-rose-500/40 text-stone-100 font-sans space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-300 shrink-0">
                <UserX className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="font-serif text-xl uppercase tracking-wider text-stone-100 font-normal">
                  Remove Team Member
                </h3>
                <div className="text-[11px] font-mono text-rose-300 font-bold">
                  {memberToRemove.fullName || "Student"}
                </div>
              </div>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed font-sans">
              Are you sure you want to remove <strong className="text-stone-100">{memberToRemove.fullName || "this student"}</strong> from your team? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMemberToRemove(null)}
                className="px-4 py-2.5 rounded-xl border border-stone-700 bg-stone-900/80 text-stone-300 text-xs uppercase font-bold tracking-wider hover:bg-stone-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={removingMember}
                onClick={confirmRemoveMember}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-stone-100 text-xs uppercase font-extrabold tracking-wider hover:brightness-110 transition shadow-lg disabled:opacity-60 cursor-pointer"
              >
                {removingMember ? "Removing..." : "Yes, Remove Member"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {guidelinesOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 font-sans">
          <div className="w-full max-w-2xl serene-glass-card rounded-3xl border border-amber-500/30 p-6 md:p-8 shadow-2xl text-stone-100">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-serif text-2xl uppercase tracking-wider text-amber-300 font-normal">
                  {selectedStudentHackathon?.name ? `${selectedStudentHackathon.name} Guidelines` : "Hackathon Guidelines"}
                </h3>
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
                <div className="font-serif text-sm uppercase tracking-wider text-amber-300 font-normal">Reviewer Evaluation & Selection</div>
                <ul className="mt-2 space-y-1.5 text-stone-300 list-disc list-inside">
                  <li>Problem statements & abstractions are evaluated by designated Theme Reviewers for selection</li>
                  <li>Shortlisted teams will be notified for the Hackathon build phase & final presentation</li>
                </ul>
              </div>
              <div className="bg-stone-900/90 border border-amber-500/20 rounded-2xl p-4 space-y-1">
                <div className="font-serif text-sm uppercase tracking-wider text-amber-300 font-normal">Prizes</div>
                <ul className="mt-2 space-y-1.5 text-stone-300 list-disc list-inside">
                  <li>{selectedStudentHackathon?.prizePool ? `Prizes worth ${selectedStudentHackathon.prizePool}` : "Prizes worth ₹15,000"}</li>
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

