import React, { useEffect, useState, useRef } from "react";
import { axiosInstance } from "../../lib/axios.js";
import { useLocation } from "react-router-dom";
import {
  Paperclip,
  FileText,
  X,
  Sparkles,
  Users,
  CheckCircle2,
  AlertCircle,
  Upload,
  Send,
  Layers,
  History,
  Mail,
  Search,
  Eye,
  RefreshCw,
  Clock,
  UserCheck,
} from "lucide-react";
import { toast } from "react-hot-toast";

const HackathonAdminSendMail = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const hackathonId = searchParams.get("hackathonId") || localStorage.getItem("selectedHackathonId") || "";

  const [teams, setTeams] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [approvedSubmissionTeamIds, setApprovedSubmissionTeamIds] = useState([]);
  const [loadingRecipients, setLoadingRecipients] = useState(true);

  const [audience, setAudience] = useState("teams"); // "teams" | "mentors" | "faculty"
  const [mailType, setMailType] = useState("all"); // "all" | "approved" | "team" | "multiple" | "cluster"
  const [selectedCluster, setSelectedCluster] = useState("Computer Science");
  const [singleTeamId, setSingleTeamId] = useState("");
  const [multiTeamIds, setMultiTeamIds] = useState([]);
  const [singleMentorId, setSingleMentorId] = useState("");
  const [multiMentorIds, setMultiMentorIds] = useState([]);
  const [singleFacultyId, setSingleFacultyId] = useState("");
  const [multiFacultyIds, setMultiFacultyIds] = useState([]);
  const [searchTeams, setSearchTeams] = useState("");
  const [searchMentors, setSearchMentors] = useState("");
  const [searchFaculty, setSearchFaculty] = useState("");

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  // Document / File Attachments
  const [attachedFiles, setAttachedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // Email Audit Log State
  const [activeTab, setActiveTab] = useState("compose"); // "compose" | "logs"
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logSearch, setLogSearch] = useState("");
  const [logStatus, setLogStatus] = useState("all");
  const [logPage, setLogPage] = useState(1);
  const [logTotal, setLogTotal] = useState(0);
  const [logTotalPages, setLogTotalPages] = useState(1);
  const [selectedLogForModal, setSelectedLogForModal] = useState(null);

  const fetchLogs = async (targetPage = logPage, targetSearch = logSearch, targetStatus = logStatus) => {
    setLoadingLogs(true);
    try {
      const params = new URLSearchParams({
        page: targetPage,
        limit: 20,
      });
      if (hackathonId) params.append("hackathonId", hackathonId);
      if (targetStatus && targetStatus !== "all") params.append("status", targetStatus);
      if (targetSearch.trim()) params.append("search", targetSearch.trim());

      const res = await axiosInstance.get(`/ich2026/admin/email-logs?${params.toString()}`);
      setLogs(res.data.logs || []);
      setLogTotal(res.data.total || 0);
      setLogTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Failed to load email logs:", err);
      toast.error("Failed to load email audit logs");
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (activeTab === "logs") {
      fetchLogs(logPage, logSearch, logStatus);
    }
  }, [activeTab, logPage, logStatus]);

  useEffect(() => {
    const load = async () => {
      setLoadingRecipients(true);
      try {
        const query = hackathonId ? `?hackathonId=${hackathonId}` : "";
        const [teamRes, mentorRes, submissionRes, facultyRes] = await Promise.all([
          axiosInstance.get(`/ich2026/admin/teams${query}`),
          axiosInstance.get(`/ich2026/admin/mentors${query}`),
          axiosInstance.get(`/ich2026/admin/submissions`),
          axiosInstance.get(`/ich2026/admin/cluster-faculty-list`).catch(() => ({ data: { faculty: [] } })),
        ]);
        setTeams(teamRes.data.teams || []);
        setMentors(mentorRes.data.mentors || []);
        setFacultyList(facultyRes.data?.faculty || []);

        const approvedIds = (teamRes.data.teams || [])
          .filter((t) => String(t.abstractionStatus || "").toLowerCase() === "approved")
          .map((t) => Number(t.id));
        setApprovedSubmissionTeamIds(approvedIds);
      } catch (e) {
        setError(e.response?.data?.message || "Failed to load recipients");
      } finally {
        setLoadingRecipients(false);
      }
    };
    load();
  }, [hackathonId]);

  const approvedSubmissionTeams = teams.filter((t) => approvedSubmissionTeamIds.includes(Number(t.id)));
  const filteredApprovedSubmissionTeams = approvedSubmissionTeams.filter((t) => {
    const q = searchTeams.trim().toLowerCase();
    if (!q) return true;
    return `${t.teamName} ${t.inviteCode || ""} ${t.leader?.email || ""} ${t.cluster || ""} ${t.theme || ""}`.toLowerCase().includes(q);
  });

  const filteredMentors = mentors.filter((m) => {
    const q = searchMentors.trim().toLowerCase();
    if (!q) return true;
    return `${m.user?.fullName || ""} ${m.user?.email || ""}`.toLowerCase().includes(q);
  });

  const filteredFaculty = facultyList.filter((f) => {
    const q = searchFaculty.trim().toLowerCase();
    if (!q) return true;
    return `${f.fullName || ""} ${f.email || ""} ${f.assignedCluster || ""}`.toLowerCase().includes(q);
  });

  const toggleTeam = (id) => {
    setMultiTeamIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };
  const toggleMentor = (id) => {
    setMultiMentorIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };
  const toggleFaculty = (id) => {
    setMultiFacultyIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  // Attachment handler
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // Check size limit: 15MB per file
    const oversized = files.find((f) => f.size > 15 * 1024 * 1024);
    if (oversized) {
      toast.error(`File "${oversized.name}" exceeds the 15MB limit.`);
      return;
    }

    setAttachedFiles((prev) => [...prev, ...files]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Insert Shortlisted Teams Level 1 Notification Template
  const handleInsertShortlistTemplate = () => {
    setSubject("Congratulations! Selection for Level 1 | Smart City Hackathon 2026 — AICTE IDEA Lab, KCT");
    setMessage(
`Dear Team Leader & Members,

Warm Greetings from AICTE IDEA Lab, Kumaraguru College of Technology!

We are thrilled to inform you that your team has been successfully shortlisted for the next stage of the Smart City Hackathon 2026 following the evaluation of your problem statement and abstraction proposal!

Your proposed solution demonstrated strong technical merit, creativity, and relevance toward solving real-world urban and smart-city challenges.

--------------------------------------------------
HACKATHON PROGRESSION & ROADMAP
--------------------------------------------------

The competition features rewards and prizes at both levels:

🚀 Level 1: Proof of Concept (PoC)/prototype Evaluation
• Submission & Demo Date: September 15, 2026 (15.09.2026)
• Requirement: Submission and presentation of your Proof of Concept (PoC) / Prototype.
• Key Deliverables: System architecture, feasibility study, core algorithm/circuit design, preliminary results, and implementation roadmap.
• Note: Only a selected set of top-performing teams from Level 1 will be shortlisted and advanced to Level 2.

🏆 Level 2: Real time Functional Prototype Evaluation
• Milestone Date: October 12, 2026 (12.10.2026)
• Requirement: Live demonstration and exhibition of your Real-Time Functional Prototype.
• Prize Pool: Grand cash rewards & prizes for top prototype winners.
• Key Deliverables: Fully functional real-time working hardware/software model, deployment, live demo, and presentation before the jury.

--------------------------------------------------
REGISTRATION FEE & CONFIRMATION
--------------------------------------------------
• Registration Fee: ₹500 per team (for shortlisted teams entering Level 1).
• Payment Deadline: August 31, 2026 (31.08.2026).
• Payment Link: The official payment link and confirmation instructions will be shared shortly via email and your student portal dashboard.

--------------------------------------------------
NEXT STEPS FOR YOUR TEAM
--------------------------------------------------
1. Dashboard Access: Log in to your student portal at https://idealab.kct.ac.in to stay updated on guidelines and announcements.
2. Fee Payment: Once the payment link is shared, kindly ensure your team completes the ₹500 registration payment on or before August 31, 2026 to confirm your slot.
3. Prepare Your PoC / Prototype: Start building and refining your technical implementation ahead of the September 15, 2026 submission deadline.

We commend your dedication and look forward to witnessing your innovative ideas transform into impactful solutions.

Wishing you and your team the very best!

Warm regards,
Organizing Committee — Smart City Hackathon 2026
AICTE IDEA Lab | Kumaraguru College of Technology (KCT)
Coimbatore – 641049
🌐 Website: https://idealab.kct.ac.in
✉️ Email: idealab@kct.ac.in`
    );
    toast.success("Level 1 Shortlist template inserted! ✓");
  };

  // Insert Date Clarification Template
  const handleInsertDateCorrigendumTemplate = () => {
    setSubject("Important Date Clarification: Level 1 PoC Evaluation Date (15.09.2026) | Smart City Hackathon 2026");
    setMessage(
`Dear Team Leader & Members ({teamName}),

Warm Greetings from AICTE IDEA Lab, Kumaraguru College of Technology!

Please take note of an important date update regarding the Level 1: Proof of Concept (PoC) / Prototype Evaluation for the Smart City Hackathon 2026:

📅 REVISED LEVEL 1 EVALUATION & DEMO DATE:
• Date: September 15, 2026 (15.09.2026)
• Venue / Platform: AICTE IDEA Lab, Kumaraguru College of Technology

Key Dates Summary:
• Registration Fee (₹500/team) Deadline: August 31, 2026
• Level 1 PoC / Prototype Evaluation: September 15, 2026 (₹15,000 Prize Pool)
• Level 2 Real-Time Prototype Exhibition: October 12, 2026

Kindly log in to your student dashboard at https://idealab.kct.ac.in to stay updated on competition guidelines and submit your registration payment details.

We regret any confusion caused by the date mentioned in the earlier email and look forward to your participation on September 15, 2026.

Warm regards,
Organizing Committee — Smart City Hackathon 2026
AICTE IDEA Lab | Kumaraguru College of Technology (KCT)
Coimbatore – 641049
🌐 Website: https://idealab.kct.ac.in
✉️ Email: idealab@kct.ac.in`
    );
    toast.success("Date Clarification template inserted! ✓");
  };

  // Insert Bank & Fee Details Template
  const handleInsertPaymentBankDetailsTemplate = () => {
    setSubject("Smart City Hackathon 2026: Level 1 Shortlisting & Registration Fee Payment Details");
    setMessage(
`Dear Team Leader & Members ({teamName}),

Congratulations on being shortlisted for Level 1 of the Smart City Hackathon 2026 organized by AICTE IDEA Lab, Kumaraguru College of Technology!

To confirm your team's participation and advance to the Level 1 Presentation & Demo round on September 15, 2026, please complete the registration fee payment using the bank details below:

--------------------------------------------------
BANK ACCOUNT DETAILS FOR REGISTRATION FEE PAYMENT
--------------------------------------------------
• Account Name: AICTE IDEA LAB KCT
• Account Number: 1245155000089732
• Bank: Karur Vysya Bank
• Branch: KCT, Saravanampatti
• IFSC Code: KVBL0001245
• Registration Fee: ₹500 per team

--------------------------------------------------
MANDATORY NEXT STEPS AFTER PAYMENT:
--------------------------------------------------
1. Complete the transfer via UPI / IMPS / NEFT and save the transaction receipt / UTR number.
2. Log in to the official student portal: https://idealab.kct.ac.in
3. Navigate to the "Payment Details" section on your dashboard.
4. Enter the Transaction Reference ID (UTR / Transaction No.), Paid Person Name, Email, and Contact Number, and click Submit.
5. Our organizing team will verify your payment and activate your Level 1 confirmation on your dashboard.

📅 Key Dates to Remember:
• Registration Fee Payment Deadline: August 31, 2026
• Level 1 PoC / Prototype Evaluation: September 15, 2026 (₹15,000 Prize Pool)
• Level 2 Real-Time Prototype Exhibition: October 12, 2026

We look forward to seeing your team's innovative solution in action on September 15, 2026!

Warm regards,
Organizing Committee — Smart City Hackathon 2026
AICTE IDEA Lab | Kumaraguru College of Technology (KCT)
Coimbatore – 641049
🌐 Website: https://idealab.kct.ac.in
✉️ Email: idealab@kct.ac.in`
    );
    toast.success("Bank & Fee Details template inserted! ✓");
  };

  // Insert WhatsApp Group Invite Template
  const handleInsertWhatsAppTemplate = () => {
    setSubject("Smart City Hackathon 2026: Official WhatsApp Group Invitation (Level 1 Shortlisted Teams)");
    setMessage(
`Dear Team Leader & Members ({teamName}),

Congratulations once again on being shortlisted for Level 1 of the Smart City Hackathon 2026!

To ensure seamless coordination, real-time announcements, technical guidance, and immediate communication with the organizing committee and mentors, we have created the official WhatsApp group for all Level 1 participant teams.

--------------------------------------------------
OFFICIAL WHATSAPP GROUP INVITE LINK:
--------------------------------------------------
👉 https://chat.whatsapp.com/LONu6tNN0WdIgTHdpAbwUK

Group Name: Smart City Hackathon - Level 1

--------------------------------------------------
IMPORTANT GUIDELINES FOR PARTICIPANTS:
--------------------------------------------------
1. All team leaders and registered members are requested to join using the invite link above.
2. Please set your WhatsApp profile name to your Full Name and Team Name (e.g., "Full Name - {teamName}") for easy identification.
3. Official updates regarding the Level 1 Demo schedule (September 15, 2026), jury guidelines, evaluation criteria, and venue arrangements will be shared in this group.
4. If your team has not yet completed the ₹500 registration fee payment, please do so on or before August 31, 2026 and submit your UTR reference on the student dashboard (https://idealab.kct.ac.in).

We look forward to interacting with your team!

Warm regards,
Organizing Committee — Smart City Hackathon 2026
AICTE IDEA Lab | Kumaraguru College of Technology (KCT)
Coimbatore – 641049
🌐 Website: https://idealab.kct.ac.in
✉️ Email: idealab@kct.ac.in`
    );
    toast.success("WhatsApp Group Invite template inserted! ✓");
  };

  // Insert Faculty Credentials Quick Template
  const handleInsertFacultyTemplate = () => {
    setSubject("Action Required: Cluster Faculty Evaluation & Login Credentials - Smart City Hackathon 2026 ({cluster} Cluster)");
    setMessage(
`Dear {facultyName},

Greetings from AICTE IDEA Lab, Kumaraguru College of Technology!

You have been designated as a specialized Faculty Evaluator for the {cluster} Cluster in the Smart City Hackathon 2026.

⏰ EVALUATION DEADLINE (URGENT):
Please complete the grading and evaluation for all your assigned teams by TOMORROW (5:00 PM).

📋 Your Evaluation Allocation & Credentials:
• Assigned Cluster: {cluster} Cluster
• Allocated Batch: {assignedCount} Teams
• Evaluation Portal URL: https://idealab.kct.ac.in/Hackathon/login
• Login Email ID: {email}
• Default Password: {password}

📋 Step-by-Step Evaluation Instructions:
1. Log in to the Evaluation Portal using the credentials provided above.
2. Under your cluster workspace, access your allocated batch of {assignedCount} teams.
3. Review the project abstraction (~300 words), methodology, and tech stack submitted by each team.
4. Type your evaluation score directly (out of 10.0) in the score box.
5. Provide constructive feedback / remarks and click "Save Grade" to record your evaluation.

📎 Attached Document:
Please refer to the attached Faculty Team Allocation spreadsheet for the complete roster.

For any queries or login assistance, please contact the IDEA Lab Organizing Committee.

Best regards,
Organizing Committee
AICTE IDEA Lab • Kumaraguru College of Technology`
    );
    toast.success("Faculty Evaluator template with deadline inserted! ✓");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (audience === "teams" && mailType === "team") {
      const id = Number(singleTeamId);
      if (!Number.isInteger(id)) {
        setError("Please select a team.");
        return;
      }
    }
    if (audience === "teams" && mailType === "multiple" && multiTeamIds.length === 0) {
      setError("Select at least one team.");
      return;
    }
    if (audience === "mentors" && mailType === "team") {
      const id = Number(singleMentorId);
      if (!Number.isInteger(id)) {
        setError("Please select a mentor.");
        return;
      }
    }
    if (audience === "mentors" && mailType === "multiple" && multiMentorIds.length === 0) {
      setError("Select at least one mentor.");
      return;
    }
    if (audience === "faculty" && mailType === "team") {
      const id = Number(singleFacultyId);
      if (!Number.isInteger(id)) {
        setError("Please select a faculty member.");
        return;
      }
    }
    if (audience === "faculty" && mailType === "multiple" && multiFacultyIds.length === 0) {
      setError("Select at least one faculty member.");
      return;
    }

    setSending(true);
    try {
      const formData = new FormData();
      formData.append("audience", audience);
      formData.append("type", mailType);
      formData.append("subject", subject.trim());
      formData.append("message", message.trim());
      if (hackathonId) formData.append("hackathonId", hackathonId);

      if (audience === "teams") {
        const ids = mailType === "team" ? [Number(singleTeamId)] : mailType === "multiple" ? multiTeamIds : [];
        formData.append("teamIds", JSON.stringify(ids));
      } else if (audience === "mentors") {
        const ids = mailType === "team" ? [Number(singleMentorId)] : mailType === "multiple" ? multiMentorIds : [];
        formData.append("mentorIds", JSON.stringify(ids));
      } else if (audience === "faculty") {
        if (mailType === "cluster") {
          formData.append("cluster", selectedCluster);
        } else if (mailType === "team") {
          formData.append("facultyIds", JSON.stringify([Number(singleFacultyId)]));
        } else if (mailType === "multiple") {
          formData.append("facultyIds", JSON.stringify(multiFacultyIds));
        }
      }

      // Append attached documents/files
      attachedFiles.forEach((file) => {
        formData.append("attachments", file);
      });

      const res = await axiosInstance.post("/ich2026/admin/send-mail", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResult(res.data);
      toast.success(res.data?.message || "Email batch dispatched successfully! ✓");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send email");
      toast.error(err.response?.data?.message || "Failed to send email");
    } finally {
      setSending(false);
    }
  };

  if (loadingRecipients) {
    return <div className="p-8 text-center text-stone-400 font-sans text-xs">Loading recipients...</div>;
  }

  return (
    <div className="space-y-6 font-sans text-stone-100 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h2 className="font-serif text-3xl text-stone-100 uppercase tracking-widest font-normal">
          Broadcasting & Mail Control
        </h2>
        <p className="text-xs font-dancing text-amber-200/90 mt-1">
          Send announcements, credentials, and notifications with document attachments to team leaders, mentors, or cluster faculties
        </p>
      </div>

      {/* Top Tabs: Compose vs Audit History */}
      <div className="flex items-center gap-3 border-b border-amber-500/20 pb-4 flex-wrap">
        <button
          type="button"
          onClick={() => setActiveTab("compose")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-sans text-xs uppercase font-extrabold tracking-wider transition cursor-pointer ${
            activeTab === "compose"
              ? "bg-amber-400 text-stone-950 shadow-lg border border-amber-300"
              : "bg-stone-900/80 text-stone-400 border border-amber-500/20 hover:text-amber-300 hover:border-amber-500/40"
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Compose & Broadcast</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("logs");
            fetchLogs(1, logSearch, logStatus);
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-sans text-xs uppercase font-extrabold tracking-wider transition cursor-pointer ${
            activeTab === "logs"
              ? "bg-amber-400 text-stone-950 shadow-lg border border-amber-300"
              : "bg-stone-900/80 text-stone-400 border border-amber-500/20 hover:text-amber-300 hover:border-amber-500/40"
          }`}
        >
          <History className="w-4 h-4" />
          <span>Sent Emails & Audit History</span>
          {logTotal > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              activeTab === "logs" ? "bg-stone-950 text-amber-300" : "bg-amber-400/20 text-amber-300"
            }`}>
              {logTotal}
            </span>
          )}
        </button>
      </div>

      {activeTab === "compose" && (
        <div className="space-y-6">

      {error ? (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      ) : null}

      {result ? (
        <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-200 space-y-2 shadow-lg">
          <div className="flex items-center gap-2 font-serif text-base text-emerald-300 uppercase tracking-wider font-normal">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Email Batch Dispatched Successfully</span>
          </div>
          <div className="font-mono">
            Sent: <b>{result.sent}</b>
            {typeof result.failed === "number" ? <> · Failed: <b>{result.failed}</b></> : null}
            {typeof result.skipped === "number" ? <> · Skipped: <b>{result.skipped}</b></> : null}
            {result.hasAttachment ? <> · Attachments: <b>{result.attachmentCount} file(s) attached</b></> : null}
          </div>
          {Array.isArray(result.errors) && result.errors.length ? (
            <ul className="mt-2 list-disc pl-5 text-xs text-rose-300 space-y-1">
              {result.errors.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="serene-glass-card rounded-3xl border border-amber-500/25 p-6 sm:p-8 shadow-2xl space-y-6 text-stone-100 font-sans text-xs"
      >
        {/* AUDIENCE SELECTOR */}
        <div>
          <div className="text-xs uppercase tracking-wider font-bold text-amber-300 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>Audience</span>
          </div>
          <div className="flex flex-wrap gap-4 sm:gap-6">
            <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl border border-stone-800 bg-stone-900/60 hover:border-amber-500/40 transition">
              <input
                type="radio"
                name="audience"
                checked={audience === "teams"}
                onChange={() => {
                  setAudience("teams");
                  setMailType("all");
                }}
                className="accent-amber-400 cursor-pointer"
              />
              <span className="text-sm font-medium text-stone-200">Team leaders</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl border border-stone-800 bg-stone-900/60 hover:border-amber-500/40 transition">
              <input
                type="radio"
                name="audience"
                checked={audience === "mentors"}
                onChange={() => {
                  setAudience("mentors");
                  setMailType("all");
                }}
                className="accent-amber-400 cursor-pointer"
              />
              <span className="text-sm font-medium text-stone-200">Mentors</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl border border-purple-500/40 bg-purple-950/30 hover:border-purple-400 transition shadow-md">
              <input
                type="radio"
                name="audience"
                checked={audience === "faculty"}
                onChange={() => {
                  setAudience("faculty");
                  setMailType("all");
                }}
                className="accent-purple-400 cursor-pointer"
              />
              <span className="text-sm font-bold text-purple-200 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-300" />
                <span>Cluster Faculties (14 Evaluators)</span>
              </span>
            </label>
          </div>
        </div>

        {/* RECIPIENTS OPTIONS */}
        <div>
          <div className="text-xs uppercase tracking-wider font-bold text-amber-300 mb-3">Recipients</div>
          <div className="flex flex-col gap-3">
            {/* All Option */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="mailType"
                checked={mailType === "all"}
                onChange={() => setMailType("all")}
                className="accent-amber-400 cursor-pointer"
              />
              <span className="text-sm font-medium text-stone-200">
                {audience === "teams"
                  ? `All teams (${teams.length} total)`
                  : audience === "mentors"
                  ? `All mentors (${mentors.length} total)`
                  : `All 14 Cluster Faculties (${facultyList.length} evaluators, 121 teams total)`}
              </span>
            </label>

            {/* Approved Teams (Only for Teams) */}
            {audience === "teams" ? (
              <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl border border-emerald-500/30 bg-emerald-950/20 hover:border-emerald-500/50 transition">
                <input
                  type="radio"
                  name="mailType"
                  checked={mailType === "approved"}
                  onChange={() => setMailType("approved")}
                  className="accent-emerald-400 cursor-pointer"
                />
                <span className="text-sm font-bold text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Shortlisted / Approved Teams ({approvedSubmissionTeamIds.length} Teams)</span>
                </span>
              </label>
            ) : null}

            {/* By Cluster (Only for Faculty) */}
            {audience === "faculty" ? (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="mailType"
                  checked={mailType === "cluster"}
                  onChange={() => setMailType("cluster")}
                  className="accent-amber-400 cursor-pointer"
                />
                <span className="text-sm font-medium text-stone-200">By Cluster</span>
              </label>
            ) : null}

            {/* Specific Recipient */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="mailType"
                checked={mailType === "team"}
                onChange={() => setMailType("team")}
                className="accent-amber-400 cursor-pointer"
              />
              <span className="text-sm font-medium text-stone-200">
                {audience === "teams"
                  ? "Specific team"
                  : audience === "mentors"
                  ? "Specific mentor"
                  : "Specific cluster faculty member"}
              </span>
            </label>

            {/* Multiple Recipients */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="mailType"
                checked={mailType === "multiple"}
                onChange={() => setMailType("multiple")}
                className="accent-amber-400 cursor-pointer"
              />
              <span className="text-sm font-medium text-stone-200">
                {audience === "teams"
                  ? "Multiple teams"
                  : audience === "mentors"
                  ? "Multiple mentors"
                  : "Multiple cluster faculty members"}
              </span>
            </label>
          </div>
        </div>

        {/* SHORTLISTED / APPROVED TEAMS PREVIEW LIST */}
        {audience === "teams" && mailType === "approved" && (
          <div className="pl-6 pt-1 space-y-2">
            <div className="flex items-center justify-between max-w-2xl">
              <label className="block text-xs uppercase tracking-wider font-bold text-emerald-300">
                Shortlisted / Approved Teams ({approvedSubmissionTeams.length} Total)
              </label>
              <span className="text-[11px] text-stone-400">All {approvedSubmissionTeams.length} teams will receive this broadcast</span>
            </div>
            <input
              type="text"
              value={searchTeams}
              onChange={(e) => setSearchTeams(e.target.value)}
              placeholder="Search approved team name, code, theme, cluster, or email..."
              className="w-full max-w-2xl rounded-xl border border-emerald-500/30 bg-stone-900 text-stone-100 placeholder-stone-500 px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-400"
            />
            <div className="w-full max-w-2xl rounded-xl border border-emerald-500/20 bg-stone-900/90 max-h-64 overflow-auto p-3 space-y-2">
              {filteredApprovedSubmissionTeams.map((t) => (
                <div key={t.id} className="flex items-start justify-between p-2.5 rounded-lg bg-stone-950/70 border border-stone-800 hover:border-emerald-500/30 text-xs">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-200">{t.teamName}</span>
                      <span className="font-mono text-emerald-400 text-[10px] bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">{t.inviteCode}</span>
                    </div>
                    <span className="text-stone-400 text-[11px]">{t.leader?.email || "No leader email"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 text-[10px] font-medium border border-amber-500/30">
                      {t.theme || "Smart City"}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 text-[10px] font-medium border border-purple-500/30">
                      {t.cluster || "Cluster"}
                    </span>
                  </div>
                </div>
              ))}
              {filteredApprovedSubmissionTeams.length === 0 ? (
                <div className="text-xs text-stone-500 py-2 text-center">No approved teams match your filter.</div>
              ) : null}
            </div>
          </div>
        )}

        {/* CLUSTER SELECTION (WHEN AUDIENCE = FACULTY & MAILTYPE = CLUSTER) */}
        {audience === "faculty" && mailType === "cluster" && (
          <div className="pl-6 pt-1 space-y-2">
            <label className="block text-xs uppercase tracking-wider font-bold text-purple-300">
              Select Cluster
            </label>
            <select
              value={selectedCluster}
              onChange={(e) => setSelectedCluster(e.target.value)}
              className="w-full max-w-md rounded-xl border border-purple-500/40 bg-stone-900 px-3.5 py-2.5 text-xs text-stone-100 focus:outline-none focus:border-purple-400 transition cursor-pointer"
            >
              <option value="Computer Science">Computer Science Cluster (4 Faculty, 39 Teams)</option>
              <option value="Electronics">Electronics Cluster (4 Faculty, 36 Teams)</option>
              <option value="Civil">Civil Cluster (2 Faculty, 28 Teams)</option>
              <option value="Electrical">Electrical Cluster (1 Faculty, 9 Teams)</option>
              <option value="Mechanical">Mechanical Cluster (3 Faculty, 9 Teams)</option>
            </select>
          </div>
        )}

        {/* SPECIFIC FACULTY DROPDOWN */}
        {audience === "faculty" && mailType === "team" && (
          <div className="pl-6 pt-1 space-y-2">
            <label className="block text-xs uppercase tracking-wider font-bold text-purple-300">
              Select Faculty Evaluator
            </label>
            <select
              value={singleFacultyId}
              onChange={(e) => setSingleFacultyId(e.target.value)}
              className="w-full max-w-lg rounded-xl border border-purple-500/40 bg-stone-900 px-3.5 py-2.5 text-xs text-stone-100 focus:outline-none focus:border-purple-400 transition cursor-pointer"
            >
              <option value="">-- Select Faculty Member --</option>
              {facultyList.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.fullName} — {f.assignedCluster} Cluster ({f.assignedCount} teams) [{f.email}]
                </option>
              ))}
            </select>
          </div>
        )}

        {/* MULTIPLE FACULTIES CHECKBOX LIST */}
        {audience === "faculty" && mailType === "multiple" && (
          <div className="pl-6 pt-1 space-y-2">
            <label className="block text-xs uppercase tracking-wider font-bold text-purple-300">
              Select Multiple Faculties ({multiFacultyIds.length} selected)
            </label>
            <input
              type="text"
              value={searchFaculty}
              onChange={(e) => setSearchFaculty(e.target.value)}
              placeholder="Search faculty name, cluster, email..."
              className="w-full max-w-lg rounded-xl border border-purple-500/30 bg-stone-900 text-stone-100 placeholder-stone-500 px-3.5 py-2 text-xs focus:outline-none focus:border-purple-400"
            />
            <div className="w-full max-w-lg rounded-xl border border-purple-500/20 bg-stone-900/90 max-h-64 overflow-auto p-3 space-y-2">
              {filteredFaculty.map((f) => (
                <label key={f.id} className="flex items-start justify-between p-2 rounded-lg bg-stone-950/70 border border-stone-800 hover:border-purple-500/30 cursor-pointer text-xs">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={multiFacultyIds.includes(Number(f.id))}
                      onChange={() => toggleFaculty(Number(f.id))}
                      className="accent-purple-400 cursor-pointer"
                    />
                    <span className="font-semibold text-stone-200">{f.fullName}</span>
                    <span className="text-stone-400">({f.email})</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                    {f.assignedCluster} • {f.assignedCount}T
                  </span>
                </label>
              ))}
              {filteredFaculty.length === 0 ? (
                <div className="text-xs text-stone-500 py-2 text-center">No faculty matched search.</div>
              ) : null}
            </div>
          </div>
        )}

        {/* SPECIFIC TEAM DROPDOWN */}
        {audience === "teams" && mailType === "team" && (
          <div className="pl-6 pt-1 space-y-2">
            <select
              value={singleTeamId}
              onChange={(e) => setSingleTeamId(e.target.value)}
              className="w-full max-w-md rounded-xl border border-amber-500/30 bg-stone-900 px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-400"
            >
              <option value="">Select a team</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.teamName} — Leader: {t.leader?.fullName || t.leader?.email || "—"}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* MULTIPLE TEAMS CHECKBOX LIST */}
        {audience === "teams" && mailType === "multiple" && (
          <div className="pl-6 pt-1 space-y-2">
            <input
              type="text"
              value={searchTeams}
              onChange={(e) => setSearchTeams(e.target.value)}
              placeholder="Search team or leader email..."
              className="w-full max-w-md rounded-xl border border-amber-500/30 bg-stone-900/90 text-stone-100 placeholder-stone-500 px-3 py-2 text-xs focus:outline-none focus:border-amber-400"
            />
            <div className="mt-2 w-full max-w-md rounded-xl border border-amber-500/20 bg-stone-900/80 max-h-64 overflow-auto p-3 space-y-2">
              {filteredApprovedSubmissionTeams.map((t) => (
                <label key={t.id} className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={multiTeamIds.includes(Number(t.id))}
                    onChange={() => toggleTeam(Number(t.id))}
                    className="mt-0.5 accent-amber-400"
                  />
                  <span className="text-xs text-stone-200">
                    {t.teamName} <span className="text-stone-400">— {t.leader?.email || "no leader"}</span>
                  </span>
                </label>
              ))}
              {filteredApprovedSubmissionTeams.length === 0 ? (
                <div className="text-xs text-stone-500">No teams found.</div>
              ) : null}
            </div>
            <p className="mt-1.5 text-xs text-stone-400">{multiTeamIds.length} team(s) selected</p>
          </div>
        )}

        {/* SPECIFIC MENTOR DROPDOWN */}
        {audience === "mentors" && mailType === "team" && (
          <div className="pl-6 pt-1 space-y-2">
            <select
              value={singleMentorId}
              onChange={(e) => setSingleMentorId(e.target.value)}
              className="w-full max-w-md rounded-xl border border-amber-500/30 bg-stone-900 px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-400"
            >
              <option value="">Select a mentor</option>
              {mentors.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.user?.fullName || "Mentor"} ({m.user?.email || "—"})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* MULTIPLE MENTORS CHECKBOX LIST */}
        {audience === "mentors" && mailType === "multiple" && (
          <div className="pl-6 pt-1 space-y-2">
            <input
              type="text"
              value={searchMentors}
              onChange={(e) => setSearchMentors(e.target.value)}
              placeholder="Search mentor or email..."
              className="w-full max-w-md rounded-xl border border-amber-500/30 bg-stone-900/90 text-stone-100 placeholder-stone-500 px-3 py-2 text-xs focus:outline-none focus:border-amber-400"
            />
            <div className="mt-2 w-full max-w-md rounded-xl border border-amber-500/20 bg-stone-900/80 max-h-64 overflow-auto p-3 space-y-2">
              {filteredMentors.map((m) => (
                <label key={m.id} className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={multiMentorIds.includes(Number(m.id))}
                    onChange={() => toggleMentor(Number(m.id))}
                    className="mt-0.5 accent-amber-400"
                  />
                  <span className="text-xs text-stone-200">
                    {m.user?.fullName || "Mentor"} <span className="text-stone-400">— {m.user?.email || "no email"}</span>
                  </span>
                </label>
              ))}
              {filteredMentors.length === 0 ? <div className="text-xs text-stone-500">No mentors found.</div> : null}
            </div>
            <p className="mt-1.5 text-xs text-stone-400">{multiMentorIds.length} mentor(s) selected</p>
          </div>
        )}

        {/* QUICK TEMPLATE BUTTON FOR SHORTLISTED TEAMS */}
        {audience === "teams" && mailType === "approved" && (
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-3 shadow-md">
            <div>
              <div className="font-bold text-emerald-200 flex items-center gap-1.5 text-xs">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Level 1 Shortlisted Teams Quick Templates</span>
              </div>
              <p className="text-[11px] text-stone-300 mt-0.5">
                Quick 1-click templates for Level 1 Announcement, Date Clarification (Sept 15), or Fee & Bank Payment Details.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleInsertShortlistTemplate}
                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md transition"
              >
                <span>⚡ Full Announcement</span>
              </button>
              <button
                type="button"
                onClick={handleInsertDateCorrigendumTemplate}
                className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md transition"
              >
                <span>📅 Date Update (Sept 15)</span>
              </button>
              <button
                type="button"
                onClick={handleInsertPaymentBankDetailsTemplate}
                className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md transition border border-cyan-400/40"
              >
                <span>💳 Bank & Fee Details Notice</span>
              </button>
              <button
                type="button"
                onClick={handleInsertWhatsAppTemplate}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md transition border border-emerald-400/40"
              >
                <span>💬 WhatsApp Group Invite</span>
              </button>
            </div>
          </div>
        )}

        {/* QUICK TEMPLATE BUTTON FOR FACULTY */}
        {audience === "faculty" && (
          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-bold text-purple-200 flex items-center gap-1.5 text-xs">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Cluster Faculty Evaluation Notice Template</span>
              </div>
              <p className="text-[11px] text-stone-300 mt-0.5">
                Automatically fills subject and body with evaluator credentials, team counts, portal links, and evaluation instructions.
              </p>
            </div>
            <button
              type="button"
              onClick={handleInsertFacultyTemplate}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md transition"
            >
              <span>⚡ Insert Template</span>
            </button>
          </div>
        )}

        {/* SUBJECT INPUT */}
        <div>
          <label className="block text-xs uppercase tracking-wider font-bold text-stone-300 mb-1.5">
            Subject
          </label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            placeholder={
              audience === "faculty"
                ? "e.g. Smart City Hackathon 2026 - Cluster Evaluation Credentials ({cluster} Cluster)"
                : "e.g. Important Announcement / Payment Reminder"
            }
            className="w-full rounded-xl border border-amber-500/30 bg-stone-900/90 text-stone-100 placeholder-stone-500 px-4 py-2.5 text-xs focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-sans"
          />
        </div>

        {/* MESSAGE TEXTAREA */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs uppercase tracking-wider font-bold text-stone-300">
              Message
            </label>
            {audience === "faculty" && (
              <span className="text-[10px] text-purple-300 font-mono">
                Variables: {'{facultyName}'}, {'{cluster}'}, {'{assignedCount}'}, {'{email}'}, {'{password}'}, {'{loginUrl}'}
              </span>
            )}
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={9}
            placeholder={
              audience === "faculty"
                ? "Write your message for faculty evaluators..."
                : "Write your reminder or announcement for team leaders or mentors..."
            }
            className="w-full rounded-xl border border-amber-500/30 bg-stone-900/90 text-stone-100 placeholder-stone-500 p-4 text-xs focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-sans leading-relaxed"
          />
        </div>

        {/* ATTACH DOCUMENTS / FILES FEATURE */}
        <div className="p-4 rounded-2xl bg-stone-900/80 border border-amber-500/20 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-amber-300" />
              <span className="text-xs uppercase tracking-wider font-bold text-stone-200">
                Attach Document / Files (Optional)
              </span>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition"
            >
              <Upload className="w-3.5 h-3.5 text-amber-300" />
              <span>Choose Files (PDF, Word, Excel, Images)</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {attachedFiles.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-800">
              {attachedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-950 border border-amber-500/30 text-stone-200 text-xs shadow"
                >
                  <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                  <div className="max-w-xs truncate">
                    <span className="font-semibold">{file.name}</span>
                    <span className="text-stone-400 ml-1.5">({formatFileSize(file.size)})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="p-0.5 rounded-md hover:bg-stone-800 text-stone-400 hover:text-rose-400 transition cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-stone-500 italic">
              No files attached. You can attach rubrics, evaluation spreadsheets, problem statements, or guidelines (up to 15MB each).
            </p>
          )}
        </div>

        {/* SUBMIT BUTTON */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={
              sending ||
              (audience === "teams" && mailType === "team" && !singleTeamId) ||
              (audience === "teams" && mailType === "multiple" && multiTeamIds.length === 0) ||
              (audience === "mentors" && mailType === "team" && !singleMentorId) ||
              (audience === "mentors" && mailType === "multiple" && multiMentorIds.length === 0) ||
              (audience === "faculty" && mailType === "team" && !singleFacultyId) ||
              (audience === "faculty" && mailType === "multiple" && multiFacultyIds.length === 0)
            }
            className={`w-full sm:w-auto px-8 py-3.5 rounded-xl text-xs font-sans uppercase font-extrabold tracking-widest transition shadow-xl flex items-center justify-center gap-2 cursor-pointer ${
              audience === "faculty"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border border-purple-400"
                : "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 hover:brightness-110 border border-amber-300"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {sending ? (
              <>
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Sending Email Batch...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>
                  {audience === "faculty"
                    ? "Dispatch Faculty Emails"
                    : "Send Email Broadcast"}
                  {attachedFiles.length > 0 ? ` (${attachedFiles.length} Attachment${attachedFiles.length > 1 ? "s" : ""})` : ""}
                </span>
              </>
            )}
          </button>
        </div>
      </form>
      </div>
      )}

      {/* SENT EMAILS & AUDIT HISTORY TAB */}
      {activeTab === "logs" && (
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="serene-glass-card rounded-2xl border border-amber-500/20 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") fetchLogs(1, logSearch, logStatus);
                }}
                placeholder="Search by recipient email, name, team, subject, or admin..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-900/90 border border-amber-500/30 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 font-sans"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
              <select
                value={logStatus}
                onChange={(e) => {
                  setLogStatus(e.target.value);
                  fetchLogs(1, logSearch, e.target.value);
                }}
                className="px-3 py-2.5 rounded-xl bg-stone-900/90 border border-amber-500/30 text-xs text-stone-200 focus:outline-none focus:border-amber-400 font-sans cursor-pointer"
              >
                <option value="all">All Delivery Statuses</option>
                <option value="sent">Sent Successfully ✓</option>
                <option value="failed">Failed Delivery ❌</option>
              </select>

              <button
                type="button"
                onClick={() => fetchLogs(logPage, logSearch, logStatus)}
                className="px-4 py-2.5 rounded-xl bg-stone-900 border border-amber-500/30 text-xs font-bold uppercase tracking-wider text-amber-300 hover:bg-amber-400/10 transition flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="serene-glass-card rounded-2xl border border-amber-500/20 overflow-hidden shadow-2xl">
            {loadingLogs ? (
              <div className="p-12 text-center text-xs text-stone-400 uppercase tracking-widest font-sans">
                Loading email audit logs...
              </div>
            ) : logs.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <Mail className="w-8 h-8 text-stone-600 mx-auto" />
                <p className="text-xs text-stone-400 font-sans">No sent emails recorded yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-stone-950/80 border-b border-amber-500/20 text-stone-400 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Date & Time</th>
                      <th className="py-3 px-4">Sent By</th>
                      <th className="py-3 px-4">Recipient</th>
                      <th className="py-3 px-4">Role / Team</th>
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-500/10 text-stone-200">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-stone-900/60 transition">
                        <td className="py-3 px-4 text-stone-400 font-mono text-[11px] whitespace-nowrap">
                          {new Date(log.sentAt || log.createdAt).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-stone-100">{log.senderName}</div>
                          <div className="text-[10px] text-stone-500 font-mono">{log.senderEmail}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-stone-100">{log.recipientName || "—"}</div>
                          <div className="text-[10px] text-amber-300/80 font-mono">{log.recipientEmail}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-stone-900 border border-amber-500/20 text-stone-300">
                            {log.teamName ? `${log.teamName}` : log.recipientRole || "team"}
                          </span>
                        </td>
                        <td className="py-3 px-4 max-w-xs truncate font-medium">
                          <span>{log.subject}</span>
                          {log.hasAttachments && (
                            <span className="ml-1.5 px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-300 text-[10px] font-mono">
                              📎 Attached
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          {log.status === "sent" ? (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                              Sent ✓
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold uppercase tracking-wider" title={log.errorMessage}>
                              Failed ❌
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedLogForModal(log)}
                            className="px-3 py-1.5 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[11px] font-bold transition inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Content</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {logTotalPages > 1 && (
              <div className="p-4 border-t border-amber-500/15 flex items-center justify-between gap-4 text-xs font-sans">
                <span className="text-stone-400">
                  Showing page <strong className="text-stone-200">{logPage}</strong> of{" "}
                  <strong className="text-stone-200">{logTotalPages}</strong> ({logTotal} total logs)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={logPage <= 1}
                    onClick={() => {
                      const prev = logPage - 1;
                      setLogPage(prev);
                      fetchLogs(prev, logSearch, logStatus);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-stone-900 border border-amber-500/20 text-stone-300 disabled:opacity-40 transition cursor-pointer"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={logPage >= logTotalPages}
                    onClick={() => {
                      const next = logPage + 1;
                      setLogPage(next);
                      fetchLogs(next, logSearch, logStatus);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-stone-900 border border-amber-500/20 text-stone-300 disabled:opacity-40 transition cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: View Full Sent Email Content */}
      {selectedLogForModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-fadeIn font-sans">
          <div className="serene-glass-card rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl border border-amber-500/30 text-stone-100 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-amber-500/20 pb-4">
              <div>
                <div className="text-[10px] uppercase font-bold text-amber-300 tracking-wider font-serif">
                  Sent Email Audit Record #{selectedLogForModal.id}
                </div>
                <h3 className="font-serif text-xl uppercase tracking-wider text-stone-100 font-normal mt-1">
                  {selectedLogForModal.subject}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLogForModal(null)}
                className="p-1.5 rounded-xl bg-stone-900 border border-amber-500/20 hover:border-amber-400 text-stone-400 hover:text-stone-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Email Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-stone-950/60 border border-amber-500/15 rounded-2xl p-4">
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">To Recipient:</span>
                <span className="text-stone-100 font-semibold">{selectedLogForModal.recipientName || "—"}</span>
                <span className="block text-amber-300 font-mono text-[11px]">{selectedLogForModal.recipientEmail}</span>
                {selectedLogForModal.teamName && (
                  <span className="text-[10px] text-stone-400 block mt-0.5">Team: {selectedLogForModal.teamName}</span>
                )}
              </div>

              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Sent By (Admin):</span>
                <span className="text-stone-100 font-semibold">{selectedLogForModal.senderName}</span>
                <span className="block text-stone-400 font-mono text-[11px]">{selectedLogForModal.senderEmail}</span>
                <span className="text-[10px] text-stone-500 block mt-0.5 font-mono">
                  {new Date(selectedLogForModal.sentAt || selectedLogForModal.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            {selectedLogForModal.hasAttachments && (
              <div className="p-3 bg-amber-400/10 border border-amber-500/20 rounded-xl text-xs text-amber-200 flex items-center gap-2 font-mono">
                <span>📎 Attached Files:</span>
                <span className="font-bold">{selectedLogForModal.attachmentNames || "Documents attached"}</span>
              </div>
            )}

            {selectedLogForModal.status === "failed" && (
              <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-xs text-rose-200">
                <strong className="block uppercase tracking-wider font-bold text-rose-300 mb-0.5">Delivery Error:</strong>
                <p>{selectedLogForModal.errorMessage || "Unknown error during transmission"}</p>
              </div>
            )}

            {/* Email Body Pane */}
            <div>
              <label className="block text-[10px] font-serif uppercase tracking-wider text-amber-300 mb-1.5 font-normal">
                Dispatched Email Body:
              </label>
              <div className="p-4 rounded-2xl border border-amber-500/20 bg-stone-900/90 text-stone-200 text-xs font-sans whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                {selectedLogForModal.content}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLogForModal(null)}
                className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-md"
              >
                Close Audit Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HackathonAdminSendMail;
