import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { axiosInstance } from "../../lib/axios";
import { X, Megaphone, Send, Trash2, Radio } from "lucide-react";

const HackathonAdminHome = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const hackathonId = searchParams.get("hackathonId") || "";

  const [hackathons, setHackathons] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Broadcast announcement state (Phase 14.13)
  const [broadcastText, setBroadcastText] = useState("");
  const [broadcastLevel, setBroadcastLevel] = useState("info");
  const [broadcastTarget, setBroadcastTarget] = useState("all");
  const [broadcasting, setBroadcasting] = useState(false);
  const [activeAnnouncements, setActiveAnnouncements] = useState([]);

  const fetchAnnouncements = async () => {
    try {
      const res = await axiosInstance.get("/ich2026/announcements");
      setActiveAnnouncements(res.data?.announcements || []);
    } catch {}
  };

  const handlePublishAnnouncement = async (e) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;
    setBroadcasting(true);
    try {
      await axiosInstance.post("/ich2026/admin/announcement", {
        message: broadcastText.trim(),
        level: broadcastLevel,
        targetRole: broadcastTarget,
      });
      setBroadcastText("");
      fetchAnnouncements();
      alert("Broadcast announced live to all participants!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to publish broadcast");
    } finally {
      setBroadcasting(false);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    try {
      await axiosInstance.delete(`/ich2026/admin/announcement/${id}`);
      setActiveAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch {
      alert("Failed to delete announcement");
    }
  };

  // Deletion modal state
  const [deletingHackathon, setDeletingHackathon] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Edit modal state
  const [editingHackathon, setEditingHackathon] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editVenue, setEditVenue] = useState("Kumaraguru College of Technology");
  const [editOrganizedBy, setEditOrganizedBy] = useState("AICTE IDEA Lab, KCT");
  const [editProblemMode, setEditProblemMode] = useState("predefined");
  const [editTagline, setEditTagline] = useState("");
  const [editInAssociationWith, setEditInAssociationWith] = useState("");
  const [editPrizes, setEditPrizes] = useState("");
  const [editRefreshments, setEditRefreshments] = useState("");
  const [editRequiredDocuments, setEditRequiredDocuments] = useState("");
  const [editThemes, setEditThemes] = useState("");
  const [editGuidelines, setEditGuidelines] = useState("");
  const [editIsRegistrationLocked, setEditIsRegistrationLocked] = useState(false);
  const [editIsPoCSubmissionLocked, setEditIsPoCSubmissionLocked] = useState(false);
  const [editIsProblemStatementLocked, setEditIsProblemStatementLocked] = useState(false);
  const [editIsOnCampusEventActive, setEditIsOnCampusEventActive] = useState(false);
  const [editWhatsappInviteLink, setEditWhatsappInviteLink] = useState("");
  const [editScheduleDays, setEditScheduleDays] = useState([]);
  const [editFacultyCoordinators, setEditFacultyCoordinators] = useState([]);
  const [editStudentCoordinators, setEditStudentCoordinators] = useState([]);
  const [editShowResults, setEditShowResults] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const selectedHackathonObj = hackathons.find((h) => String(h.id) === String(hackathonId)) || null;
  const isCustomMode = selectedHackathonObj?.problemStatementType === "custom";

  const loadData = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const [hRes, logRes] = await Promise.all([
        axiosInstance.get("/ich2026/admin/hackathons"),
        axiosInstance.get("/ich2026/admin/hackathons/logs"),
      ]);
      setHackathons(hRes.data?.hackathons || []);
      setLogs(logRes.data?.logs || []);
      await fetchAnnouncements();
    } catch (e) {
      console.error("Failed to load hackathons or audit logs:", e);
      setErrorMsg(e.response?.data?.message || e.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const confirmDeleteHackathon = async () => {
    if (!deletingHackathon) return;
    setDeleteLoading(true);
    try {
      await axiosInstance.delete(`/ich2026/admin/hackathons/${deletingHackathon.id}`);
      setDeletingHackathon(null);
      window.dispatchEvent(new Event("hackathons-updated"));
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete hackathon");
    } finally {
      setDeleteLoading(false);
    }
  };

  const startEditHackathon = (h) => {
    setEditingHackathon(h);
    setEditName(h.name || "");
    setEditDesc(h.description || "");
    setEditStartDate(h.startDate ? new Date(h.startDate).toISOString().slice(0, 10) : "");
    setEditEndDate(h.endDate ? new Date(h.endDate).toISOString().slice(0, 10) : "");
    setEditVenue(h.venue || "Kumaraguru College of Technology");
    setEditOrganizedBy(h.organizedBy || "AICTE IDEA Lab, KCT");
    setEditProblemMode(h.problemStatementType || "predefined");
    setEditShowResults(h.showResults === true);
    setEditTagline(h.tagline || "");
    setEditInAssociationWith(h.inAssociationWith || "");
    setEditPrizes(h.prizes || "");
    setEditRefreshments(h.refreshments || "");
    setEditRequiredDocuments(Array.isArray(h.requiredDocuments) ? h.requiredDocuments.join("\n") : (h.requiredDocuments || ""));
    setEditThemes(Array.isArray(h.themes) ? h.themes.join("\n") : (h.themes || ""));
    setEditGuidelines(h.guidelines || "");
    setEditIsRegistrationLocked(Boolean(h.isRegistrationLocked));
    setEditIsPoCSubmissionLocked(Boolean(h.isPoCSubmissionLocked));
    setEditIsProblemStatementLocked(Boolean(h.isProblemStatementLocked));
    setEditIsOnCampusEventActive(Boolean(h.isOnCampusEventActive));
    setEditWhatsappInviteLink(h.whatsappInviteLink || "");
    const sched = Array.isArray(h.schedule) && h.schedule.length > 0
      ? h.schedule.map((d) => ({
          dayNum: d.dayNum || "01",
          date: d.date || "",
          title: d.title || "",
          detailsText: Array.isArray(d.details) ? d.details.join("\n") : String(d.details || ""),
        }))
      : [
          { dayNum: "01", date: "", title: "", detailsText: "" }
        ];
    setEditScheduleDays(sched);

    const fc = h.coordinators?.facultyCoordinators && Array.isArray(h.coordinators.facultyCoordinators) && h.coordinators.facultyCoordinators.length > 0
      ? h.coordinators.facultyCoordinators
      : [
          { name: "Dr. S. Sasikala", email: "sasikala.s.ece@kct.ac.in" },
          { name: "Dr. A. P. Arun", email: "arun.ap.mec@kct.ac.in" }
        ];
    const sc = h.coordinators?.studentCoordinators && Array.isArray(h.coordinators.studentCoordinators) && h.coordinators.studentCoordinators.length > 0
      ? h.coordinators.studentCoordinators
      : [
          { name: "M. Sriarunachaleeshwaran", phone: "+91 9361883441" },
          { name: "S. Sanjith Krishna", phone: "+91 7339660186" }
        ];
    setEditFacultyCoordinators(fc);
    setEditStudentCoordinators(sc);
  };

  const addEditScheduleDay = () => {
    const nextNum = String(editScheduleDays.length + 1).padStart(2, "0");
    setEditScheduleDays((prev) => [...prev, { dayNum: nextNum, date: "", title: "", detailsText: "" }]);
  };

  const removeEditScheduleDay = (idx) => {
    setEditScheduleDays((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateEditScheduleDay = (idx, field, value) => {
    setEditScheduleDays((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const addFacultyCoordinator = () => {
    setEditFacultyCoordinators((prev) => [...prev, { name: "", email: "" }]);
  };
  const removeFacultyCoordinator = (idx) => {
    setEditFacultyCoordinators((prev) => prev.filter((_, i) => i !== idx));
  };
  const updateFacultyCoordinator = (idx, field, value) => {
    setEditFacultyCoordinators((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const addStudentCoordinator = () => {
    setEditStudentCoordinators((prev) => [...prev, { name: "", phone: "" }]);
  };
  const removeStudentCoordinator = (idx) => {
    setEditStudentCoordinators((prev) => prev.filter((_, i) => i !== idx));
  };
  const updateStudentCoordinator = (idx, field, value) => {
    setEditStudentCoordinators((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const handleSaveEditHackathon = async (e) => {
    e.preventDefault();
    if (!editingHackathon || !editName.trim()) return;
    setEditLoading(true);

    const formattedSchedule = editScheduleDays.map((d) => ({
      dayNum: d.dayNum || "01",
      date: d.date || "",
      title: d.title || "",
      details: (d.detailsText || "").split("\n").map((s) => s.trim()).filter(Boolean),
    }));

    try {
      await axiosInstance.put(`/ich2026/admin/hackathons/${editingHackathon.id}`, {
        name: editName.trim(),
        description: editDesc.trim(),
        startDate: editStartDate || null,
        endDate: editEndDate || null,
        schedule: formattedSchedule,
        venue: editVenue.trim(),
        organizedBy: editOrganizedBy.trim(),
        problemStatementType: editProblemMode,
        showResults: editShowResults,
        coordinators: {
          facultyCoordinators: editFacultyCoordinators,
          studentCoordinators: editStudentCoordinators,
        },
        tagline: editTagline.trim(),
        inAssociationWith: editInAssociationWith.trim(),
        prizes: editPrizes.trim(),
        refreshments: editRefreshments.trim(),
        requiredDocuments: editRequiredDocuments.split("\n").map((s) => s.trim()).filter(Boolean),
        themes: editThemes.split("\n").map((s) => s.trim()).filter(Boolean),
        guidelines: editGuidelines.trim(),
        isRegistrationLocked: editIsRegistrationLocked,
        isPoCSubmissionLocked: editIsPoCSubmissionLocked,
        isProblemStatementLocked: editIsProblemStatementLocked,
        isOnCampusEventActive: editIsOnCampusEventActive,
        whatsappInviteLink: editWhatsappInviteLink.trim(),
      });
      setEditingHackathon(null);
      window.dispatchEvent(new Event("hackathons-updated"));
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update hackathon");
    } finally {
      setEditLoading(false);
    }
  };

  const querySuffix = hackathonId ? `?hackathonId=${hackathonId}` : "";

  const selectHackathon = (h) => {
    localStorage.setItem("selectedHackathonId", String(h.id));
    window.dispatchEvent(new Event("hackathons-updated"));
    const sp = new URLSearchParams(location.search);
    sp.set("hackathonId", String(h.id));
    navigate(`${location.pathname}?${sp.toString()}`);
  };

  return (
    <div className="space-y-6 font-sans text-stone-100">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h2 className="font-serif text-3xl text-stone-100 uppercase tracking-widest font-normal">Admin Control Center</h2>
          <p className="text-xs font-dancing text-amber-200/90 mt-1">Manage multi-hackathon instances, problems, teams, mentors, and mail.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-rose-950/40 border border-rose-500/40 rounded-2xl text-rose-200 text-xs font-sans flex items-center justify-between">
          <span>⚠️ {errorMsg}</span>
          <button onClick={loadData} className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-stone-100 font-bold uppercase tracking-wider rounded-lg text-xs">Retry</button>
        </div>
      )}

      {/* Live Broadcast Announcement Desk (Phase 14.13) */}
      <div className="serene-glass-card rounded-3xl p-6 border border-amber-500/25 text-stone-100 shadow-2xl space-y-4 mb-8">
        <div className="flex items-center justify-between gap-4 border-b border-amber-500/20 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
            <h3 className="font-serif text-lg uppercase tracking-wider text-stone-100 font-normal flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-amber-400" />
              <span>Live Emergency Broadcast & Announcements</span>
            </h3>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400/80 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
            Real-Time SSE Stream
          </span>
        </div>

        <p className="text-xs text-stone-400 font-sans">
          Push instantaneous live banner updates to all logged-in students and faculty across active dashboards.
        </p>

        <form onSubmit={handlePublishAnnouncement} className="space-y-3 font-sans text-xs">
          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            <input
              type="text"
              required
              placeholder="e.g. Lunch is served at dining hall • Pitch session commences at 2:00 PM!"
              value={broadcastText}
              onChange={(e) => setBroadcastText(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-amber-500/30 bg-stone-900/90 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
            />

            <select
              value={broadcastLevel}
              onChange={(e) => setBroadcastLevel(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-amber-500/30 bg-stone-900/90 text-stone-200 font-semibold focus:outline-none focus:border-amber-400 cursor-pointer shrink-0"
            >
              <option value="info">Info (Amber)</option>
              <option value="warning">Alert (Orange)</option>
              <option value="critical">Urgent (Red)</option>
            </select>

            <button
              type="submit"
              disabled={broadcasting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 font-bold uppercase tracking-wider hover:brightness-110 transition shadow-lg shrink-0 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{broadcasting ? "Broadcasting..." : "Broadcast Live"}</span>
            </button>
          </div>
        </form>

        {/* Active broadcasts */}
        {activeAnnouncements.length > 0 && (
          <div className="pt-2 space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
              Active Broadcasts ({activeAnnouncements.length})
            </div>
            <div className="space-y-2">
              {activeAnnouncements.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-stone-900/80 border border-amber-500/15 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                        a.level === "critical"
                          ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                          : a.level === "warning"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                          : "bg-blue-500/20 text-blue-300 border-blue-500/30"
                      }`}
                    >
                      {a.level}
                    </span>
                    <span className="text-stone-200 font-sans">{a.message}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteAnnouncement(a.id)}
                    className="p-1 rounded text-stone-500 hover:text-rose-400 transition"
                    title="Dismiss Announcement"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Active Hackathons Section */}
      <div className="serene-glass-card rounded-3xl p-6 border border-amber-500/25 text-stone-100 mb-8 shadow-2xl">
        <h3 className="text-base font-serif uppercase tracking-widest text-amber-300 flex items-center gap-2 font-normal">
          <span>🏆 Active Hackathons</span>
          <span className="text-[10px] font-sans font-bold px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30">
            {hackathons.length} Total
          </span>
        </h3>
        <p className="text-xs font-sans text-stone-400 mt-1 mb-4">
          Click any hackathon card below or select from top bar dropdown to scope your view:
        </p>

        {loading ? (
          <div className="text-xs text-stone-500">Loading hackathons...</div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {hackathons.map((h) => {
              const isSelected = String(h.id) === String(hackathonId);
              const isEnded = h.endDate ? new Date() > new Date(h.endDate) : false;
              const displayStatus = isEnded ? "Ended" : (h.status || "Active");
              return (
                <div
                  key={h.id}
                  onClick={() => selectHackathon(h)}
                  className={`rounded-2xl p-4 transition border relative flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? "bg-amber-400/15 border-amber-400 ring-1 ring-amber-400/40"
                      : "bg-stone-900/60 border-amber-500/20 hover:border-amber-400/50 hover:bg-stone-900/80"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-serif text-base text-stone-100 uppercase tracking-wider">{h.name}</div>
                      <span
                        className={`text-[10px] font-sans uppercase font-bold px-2 py-0.5 rounded-full shrink-0 border ${
                          isEnded
                            ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        }`}
                      >
                        {displayStatus}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 mt-2 line-clamp-2">{h.description || "No description provided."}</p>
                    <div className="mt-2 text-[11px] font-sans text-stone-300 space-y-0.5">
                      <div><strong className="text-amber-300 font-semibold">Organized By:</strong> {h.organizedBy || "AICTE IDEA Lab, KCT"}</div>
                      <div><strong className="text-amber-300 font-semibold">Venue:</strong> {h.venue || "Kumaraguru College of Technology"}</div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-amber-500/15 flex items-center justify-between">
                    <span className="text-[11px] text-stone-500">
                      {h.schedule?.length || 0} Event Day(s)
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditHackathon(h);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-sans uppercase font-bold transition"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingHackathon(h);
                        }}
                        className="px-2 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-300 border border-red-500/30 text-xs font-bold transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        <Link to={`/Hackathon/admin/cluster-approvals${querySuffix}`} className="serene-glass-card rounded-2xl border border-amber-500/40 p-6 shadow-xl hover:border-amber-400 hover:shadow-amber-500/20 transition group bg-gradient-to-br from-amber-500/10 via-transparent to-transparent">
          <div className="flex items-center justify-between">
            <div className="font-serif text-lg text-amber-300 uppercase tracking-wider group-hover:text-amber-200 transition-colors font-bold">
              ⭐ Clusteral Team Approval
            </div>
            <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider border border-amber-400/30">
              New
            </span>
          </div>
          <div className="text-stone-300 mt-1.5 text-xs font-sans">
            Ranked leaderboard sorted by faculty marks (out of 10). Approve shortlisted teams across clusters.
          </div>
        </Link>
        <Link to={`/Hackathon/admin/teams${querySuffix}`} className="serene-glass-card rounded-2xl border border-amber-500/25 p-6 shadow-xl hover:border-amber-400/60 hover:shadow-amber-500/10 transition group">
          <div className="font-serif text-lg text-stone-100 uppercase tracking-wider group-hover:text-amber-300 transition-colors">Teams</div>
          <div className="text-stone-400 mt-1.5 text-xs font-sans">Monitor participant-created teams and membership.</div>
        </Link>
        {isCustomMode ? (
          <Link to={`/Hackathon/admin/themes${querySuffix}`} className="serene-glass-card rounded-2xl border border-amber-500/25 p-6 shadow-xl hover:border-amber-400/60 hover:shadow-amber-500/10 transition group">
            <div className="font-serif text-lg text-stone-100 uppercase tracking-wider group-hover:text-amber-300 transition-colors">Themes & Reviewers</div>
            <div className="text-stone-400 mt-1.5 text-xs font-sans">Manage hackathon themes and monitor the 14 assigned theme reviewers.</div>
          </Link>
        ) : (
          <Link to={`/Hackathon/admin/problems${querySuffix}`} className="serene-glass-card rounded-2xl border border-amber-500/25 p-6 shadow-xl hover:border-amber-400/60 hover:shadow-amber-500/10 transition group">
            <div className="font-serif text-lg text-stone-100 uppercase tracking-wider group-hover:text-amber-300 transition-colors">Problems</div>
            <div className="text-stone-400 mt-1.5 text-xs font-sans">Add, search, and remove industry problems.</div>
          </Link>
        )}
        <Link to={`/Hackathon/admin/mentors${querySuffix}`} className="serene-glass-card rounded-2xl border border-amber-500/25 p-6 shadow-xl hover:border-amber-400/60 hover:shadow-amber-500/10 transition group">
          <div className="font-serif text-lg text-stone-100 uppercase tracking-wider group-hover:text-amber-300 transition-colors">Mentors</div>
          <div className="text-stone-400 mt-1.5 text-xs font-sans">Manually create mentor accounts and assign teams.</div>
        </Link>
        <Link
          to={`/Hackathon/admin/submissions${querySuffix}`}
          className="serene-glass-card rounded-2xl border border-amber-500/25 p-6 shadow-xl hover:border-amber-400/60 hover:shadow-amber-500/10 transition group"
        >
          <div className="font-serif text-lg text-stone-100 uppercase tracking-wider group-hover:text-amber-300 transition-colors">Submissions</div>
          <div className="text-stone-400 mt-1.5 text-xs font-sans">Review PoC / Prototype submissions.</div>
        </Link>
        <Link
          to={`/Hackathon/admin/payment-details${querySuffix}`}
          className="serene-glass-card rounded-2xl border border-amber-500/25 p-6 shadow-xl hover:border-amber-400/60 hover:shadow-amber-500/10 transition group"
        >
          <div className="font-serif text-lg text-stone-100 uppercase tracking-wider group-hover:text-amber-300 transition-colors">Payment Details</div>
          <div className="text-stone-400 mt-1.5 text-xs font-sans">View payment records, verify submissions, and export Excel.</div>
        </Link>
        <Link
          to={`/Hackathon/admin/send-mail${querySuffix}`}
          className="serene-glass-card rounded-2xl border border-amber-500/25 p-6 shadow-xl hover:border-amber-400/60 hover:shadow-amber-500/10 transition group"
        >
          <div className="font-serif text-lg text-stone-100 uppercase tracking-wider group-hover:text-amber-300 transition-colors">Send Mail</div>
          <div className="text-stone-400 mt-1.5 text-xs font-sans">Email team leaders (reminders, payment, approvals).</div>
        </Link>
      </div>

      {/* Audit Logs Section */}
      <div className="serene-glass-card rounded-3xl border border-amber-500/25 p-6 shadow-2xl">
        <h3 className="font-serif text-xl uppercase tracking-wider text-amber-300 mb-1 font-normal">📋 Hackathon Audit Logs</h3>
        <p className="text-xs font-sans text-stone-400 mb-5">Historical record of all hackathon creation, edit and deletion jobs, including admin details & timestamp.</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-stone-900/90 text-amber-300 font-serif uppercase tracking-wider border-b border-amber-500/20">
              <tr>
                <th className="p-3">Hackathon</th>
                <th className="p-3">Job / Action</th>
                <th className="p-3">Admin Name</th>
                <th className="p-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-500/10 text-stone-300">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-amber-400/5 transition">
                  <td className="p-3 font-serif uppercase text-stone-100">{log.hackathonName}</td>
                  <td className="p-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-sans font-bold uppercase border ${
                        log.action === "created"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : log.action === "edited"
                          ? "bg-amber-400/20 text-amber-300 border-amber-400/30"
                          : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3 text-stone-300 font-medium">
                    {log.adminName}
                    {log.adminEmail && <span className="text-stone-500 text-[11px] block">{log.adminEmail}</span>}
                  </td>
                  <td className="p-3 text-stone-400 font-medium">
                    {log.created_at ? new Date(log.created_at).toLocaleString() : "—"}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-stone-500 font-sans">
                    No audit logs recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Hackathon Modal */}
      {editingHackathon && ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-fadeIn">
          <div className="serene-glass-card rounded-3xl p-6 md:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-amber-500/30 text-stone-100">
            <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-amber-500/20">
              <div>
                <h3 className="font-serif text-2xl text-stone-100 uppercase tracking-widest font-normal">EDIT HACKATHON ✏️</h3>
                <p className="text-xs font-sans text-stone-400 mt-1">Modify event details, dates, and flexible schedule days.</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingHackathon(null)}
                className="w-9 h-9 rounded-xl bg-stone-900 border border-amber-500/30 text-stone-400 hover:text-stone-100 flex items-center justify-center transition cursor-pointer shrink-0"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditHackathon} className="space-y-4 font-sans text-xs">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-stone-300 mb-1.5">Hackathon Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI & Robotics Hackathon 2026"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-amber-500/30 bg-stone-900/90 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-stone-300 mb-1.5">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief description of the event, themes or objectives..."
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-amber-500/30 bg-stone-900/90 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-stone-300 mb-1.5">Venue</label>
                  <input
                    type="text"
                    value={editVenue}
                    onChange={(e) => setEditVenue(e.target.value)}
                    placeholder="e.g. MGATE, KCT, COIMBATORE"
                    className="w-full px-4 py-2.5 rounded-xl border border-amber-500/30 bg-stone-900/90 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-stone-300 mb-1.5">Organized By</label>
                  <input
                    type="text"
                    value={editOrganizedBy}
                    onChange={(e) => setEditOrganizedBy(e.target.value)}
                    placeholder="e.g. IDEA Lab, KCT & IEEE Smart Cities"
                    className="w-full px-4 py-2.5 rounded-xl border border-amber-500/30 bg-stone-900/90 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-stone-300 mb-1.5">Tagline / Subtitle</label>
                  <input
                    type="text"
                    value={editTagline}
                    onChange={(e) => setEditTagline(e.target.value)}
                    placeholder="e.g. An Initiative under IEEE Smart Cities"
                    className="w-full px-4 py-2.5 rounded-xl border border-amber-500/30 bg-stone-900/90 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-stone-300 mb-1.5">In Association With</label>
                  <input
                    type="text"
                    value={editInAssociationWith}
                    onChange={(e) => setEditInAssociationWith(e.target.value)}
                    placeholder="e.g. KCT IEEE Student Branch | KCT IEEE WIE"
                    className="w-full px-4 py-2.5 rounded-xl border border-amber-500/30 bg-stone-900/90 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-stone-300 mb-1.5">Prizes & Awards</label>
                  <input
                    type="text"
                    value={editPrizes}
                    onChange={(e) => setEditPrizes(e.target.value)}
                    placeholder="e.g. ₹ 15,000"
                    className="w-full px-4 py-2.5 rounded-xl border border-amber-500/30 bg-stone-900/90 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-stone-300 mb-1.5">Refreshments Information</label>
                  <textarea
                    rows={2}
                    value={editRefreshments}
                    onChange={(e) => setEditRefreshments(e.target.value)}
                    placeholder="e.g. Working lunch / refreshments will be provided on both demo days..."
                    className="w-full px-4 py-2.5 rounded-xl border border-amber-500/30 bg-stone-900/90 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-stone-300 mb-1.5">Required Documents (one per line)</label>
                  <textarea
                    rows={2}
                    value={editRequiredDocuments}
                    onChange={(e) => setEditRequiredDocuments(e.target.value)}
                    placeholder="College ID Card&#10;Bona-fide Letter"
                    className="w-full px-4 py-2.5 rounded-xl border border-amber-500/30 bg-stone-900/90 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-stone-300 mb-1.5">Themes / Problem Domains (one per line)</label>
                <textarea
                  rows={2}
                  value={editThemes}
                  onChange={(e) => setEditThemes(e.target.value)}
                  placeholder="Disaster Resilience&#10;Waste Management&#10;Energy Solutions&#10;Smart Agriculture"
                  className="w-full px-4 py-2.5 rounded-xl border border-amber-500/30 bg-stone-900/90 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-amber-300 mb-2">Problem Statement Mode</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition ${editProblemMode === "predefined" ? "border-amber-400 bg-amber-400/15" : "border-amber-500/20 bg-stone-900/60 hover:bg-stone-900/90"}`}>
                    <input
                      type="radio"
                      name="editProblemMode"
                      value="predefined"
                      checked={editProblemMode === "predefined"}
                      onChange={() => setEditProblemMode("predefined")}
                      className="accent-amber-400"
                    />
                    <div>
                      <div className="text-xs font-bold text-stone-100">Predefined Problems</div>
                      <div className="text-[11px] text-stone-400">Admin sets problems, students pick from list</div>
                    </div>
                  </label>
                  <label className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition ${editProblemMode === "custom" ? "border-amber-400 bg-amber-400/15" : "border-amber-500/20 bg-stone-900/60 hover:bg-stone-900/90"}`}>
                    <input
                      type="radio"
                      name="editProblemMode"
                      value="custom"
                      checked={editProblemMode === "custom"}
                      onChange={() => setEditProblemMode("custom")}
                      className="accent-amber-400"
                    />
                    <div>
                      <div className="text-xs font-bold text-stone-100">Personalized Problem Statement</div>
                      <div className="text-[11px] text-stone-400">Students enter their own theme, topic & abstraction</div>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-amber-300 mb-2">
                  Selection Results Release Status
                </label>
                <label className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition ${editShowResults ? "border-emerald-400 bg-emerald-950/30" : "border-amber-500/20 bg-stone-900/60"}`}>
                  <div>
                    <div className="text-xs font-bold text-stone-100 flex items-center gap-2">
                      <span>Release Selection Results to Students</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${editShowResults ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-stone-800 text-stone-400 border-stone-700"}`}>
                        {editShowResults ? "RESULTS RELEASED ✓" : "RESULTS HIDDEN (OFF)"}
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-400 mt-0.5">
                      When OFF (default), student abstraction status displays as 'PENDING' and Submit/Status/Payment tabs remain locked. When ON, approved teams unlock.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={editShowResults}
                    onChange={(e) => setEditShowResults(e.target.checked)}
                    className="w-5 h-5 accent-amber-400 rounded cursor-pointer shrink-0"
                  />
                </label>
              </div>

              {/* Event Guidelines (Phase 14.2) */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-stone-300 mb-1.5">
                  Official Event Guidelines & Rules
                </label>
                <textarea
                  rows={3}
                  value={editGuidelines}
                  onChange={(e) => setEditGuidelines(e.target.value)}
                  placeholder="Enter detailed rules, evaluation criteria, and conduct guidelines for this event..."
                  className="w-full px-4 py-2.5 rounded-xl border border-amber-500/30 bg-stone-900/90 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-xs"
                />
              </div>

              {/* WhatsApp Community Invite Link (Phase 14.8) */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-stone-300 mb-1.5">
                  Official WhatsApp Community / Group Invite Link
                </label>
                <input
                  type="url"
                  value={editWhatsappInviteLink}
                  onChange={(e) => setEditWhatsappInviteLink(e.target.value)}
                  placeholder="https://chat.whatsapp.com/..."
                  className="w-full px-4 py-2.5 rounded-xl border border-amber-500/30 bg-stone-900/90 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-mono text-xs"
                />
              </div>

              {/* Administrative Event Locking Controls (Phase 14.3, 14.5, 14.6, 14.19) */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs uppercase tracking-wider font-bold text-amber-300">
                  Event Authority & Locking Controls
                </label>

                {/* Registration Lock */}
                <label className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${editIsRegistrationLocked ? "border-rose-400 bg-rose-950/30" : "border-amber-500/20 bg-stone-900/60"}`}>
                  <div>
                    <div className="text-xs font-bold text-stone-100 flex items-center gap-2">
                      <span>Lock Team Registrations</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${editIsRegistrationLocked ? "bg-rose-500/20 text-rose-300 border-rose-500/30" : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"}`}>
                        {editIsRegistrationLocked ? "LOCKED 🔒" : "OPEN FOR REGISTRATION"}
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-400 mt-0.5">
                      Prevents participants from creating new teams or joining existing teams for this event.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={editIsRegistrationLocked}
                    onChange={(e) => setEditIsRegistrationLocked(e.target.checked)}
                    className="w-4 h-4 accent-amber-400 cursor-pointer shrink-0 ml-3"
                  />
                </label>

                {/* PoC Submission Lock */}
                <label className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${editIsPoCSubmissionLocked ? "border-rose-400 bg-rose-950/30" : "border-amber-500/20 bg-stone-900/60"}`}>
                  <div>
                    <div className="text-xs font-bold text-stone-100 flex items-center gap-2">
                      <span>Lock PoC & Prototype Submissions</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${editIsPoCSubmissionLocked ? "bg-rose-500/20 text-rose-300 border-rose-500/30" : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"}`}>
                        {editIsPoCSubmissionLocked ? "SUBMISSIONS LOCKED 🔒" : "SUBMISSIONS ACCEPTED"}
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-400 mt-0.5">
                      Prevents teams from submitting, updating, or replacing submission files.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={editIsPoCSubmissionLocked}
                    onChange={(e) => setEditIsPoCSubmissionLocked(e.target.checked)}
                    className="w-4 h-4 accent-amber-400 cursor-pointer shrink-0 ml-3"
                  />
                </label>

                {/* Problem Statement Lock */}
                <label className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${editIsProblemStatementLocked ? "border-rose-400 bg-rose-950/30" : "border-amber-500/20 bg-stone-900/60"}`}>
                  <div>
                    <div className="text-xs font-bold text-stone-100 flex items-center gap-2">
                      <span>Lock Problem Statement / Abstraction Selection</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${editIsProblemStatementLocked ? "bg-rose-500/20 text-rose-300 border-rose-500/30" : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"}`}>
                        {editIsProblemStatementLocked ? "LOCKED 🔒" : "SELECTION OPEN"}
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-400 mt-0.5">
                      Prevents teams from switching themes or changing problem statement abstractions.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={editIsProblemStatementLocked}
                    onChange={(e) => setEditIsProblemStatementLocked(e.target.checked)}
                    className="w-4 h-4 accent-amber-400 cursor-pointer shrink-0 ml-3"
                  />
                </label>

                {/* On-Campus Event Active */}
                <label className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${editIsOnCampusEventActive ? "border-amber-400 bg-amber-950/30" : "border-amber-500/20 bg-stone-900/60"}`}>
                  <div>
                    <div className="text-xs font-bold text-stone-100 flex items-center gap-2">
                      <span>Activate On-Campus Live Event Mode</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${editIsOnCampusEventActive ? "bg-amber-500/20 text-amber-300 border-amber-500/30" : "bg-stone-800 text-stone-400 border-stone-700"}`}>
                        {editIsOnCampusEventActive ? "LIVE ON CAMPUS ⚡" : "OFFLINE / UPCOMING"}
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-400 mt-0.5">
                      Enables volunteer QR check-in scanning, bench allocation, and live on-campus telemetry.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={editIsOnCampusEventActive}
                    onChange={(e) => setEditIsOnCampusEventActive(e.target.checked)}
                    className="w-4 h-4 accent-amber-400 cursor-pointer shrink-0 ml-3"
                  />
                </label>
              </div>

              {/* Edit Schedule Days Builder */}
              <div className="pt-3 border-t border-amber-500/20">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-bold text-amber-300">Event Schedule (Flexible Days)</label>
                    <span className="text-[11px] text-stone-400">Configure days, titles & bullet point details displayed on landing page.</span>
                  </div>
                  <button
                    type="button"
                    onClick={addEditScheduleDay}
                    className="px-3 py-1.5 rounded-xl bg-amber-400/10 text-amber-300 hover:bg-amber-400/20 border border-amber-400/30 text-xs font-bold transition cursor-pointer"
                  >
                    + Add Day
                  </button>
                </div>

                <div className="space-y-3">
                  {editScheduleDays.map((day, idx) => (
                    <div key={idx} className="p-4 rounded-2xl border border-amber-500/20 bg-stone-900/80 space-y-2.5 relative">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30">
                            Day #{day.dayNum || String(idx + 1).padStart(2, "0")}
                          </span>
                          <input
                            type="text"
                            placeholder="e.g. April 10, 2026"
                            value={day.date}
                            onChange={(e) => updateEditScheduleDay(idx, "date", e.target.value)}
                            className="px-3 py-1 text-xs rounded-xl border border-amber-500/30 bg-stone-950 text-stone-100 focus:outline-none focus:border-amber-400 font-medium"
                          />
                        </div>
                        {editScheduleDays.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeEditScheduleDay(idx)}
                            className="text-xs text-rose-400 hover:text-rose-300 font-bold px-2 py-1 cursor-pointer"
                          >
                            ✕ Remove
                          </button>
                        )}
                      </div>

                      <div>
                        <input
                          type="text"
                          placeholder="Day Title (e.g. Prototype Development & Mentoring)"
                          value={day.title}
                          onChange={(e) => updateEditScheduleDay(idx, "title", e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-amber-500/30 bg-stone-950 text-stone-100 font-semibold focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <textarea
                          rows={3}
                          placeholder="Bullet point details (one per line)"
                          value={day.detailsText}
                          onChange={(e) => updateEditScheduleDay(idx, "detailsText", e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-amber-500/30 bg-stone-950 text-stone-100 font-normal focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coordinators Builder */}
              <div className="pt-3 border-t border-amber-500/20 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Faculty Coordinators */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs uppercase tracking-wider font-bold text-amber-300">Faculty Coordinators</label>
                    <button
                      type="button"
                      onClick={addFacultyCoordinator}
                      className="px-2.5 py-1 rounded-lg bg-amber-400/10 text-amber-300 hover:bg-amber-400/20 border border-amber-400/30 text-[10px] font-bold transition cursor-pointer"
                    >
                      + Add Faculty
                    </button>
                  </div>
                  <div className="space-y-2">
                    {editFacultyCoordinators.map((fc, idx) => (
                      <div key={idx} className="p-3 rounded-xl border border-amber-500/20 bg-stone-900/80 space-y-2 relative">
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            placeholder="Faculty Name (e.g. Dr. S. Sasikala)"
                            value={fc.name}
                            onChange={(e) => updateFacultyCoordinator(idx, "name", e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-amber-500/30 bg-stone-950 text-stone-100 font-medium focus:outline-none focus:border-amber-400"
                          />
                          {editFacultyCoordinators.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeFacultyCoordinator(idx)}
                              className="text-[10px] text-rose-400 hover:text-rose-300 font-bold shrink-0 cursor-pointer"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                        <input
                          type="email"
                          placeholder="Email (e.g. sasikala.s.ece@kct.ac.in)"
                          value={fc.email}
                          onChange={(e) => updateFacultyCoordinator(idx, "email", e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-amber-500/30 bg-stone-950 text-amber-300 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Student Coordinators */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs uppercase tracking-wider font-bold text-amber-300">Student Coordinators</label>
                    <button
                      type="button"
                      onClick={addStudentCoordinator}
                      className="px-2.5 py-1 rounded-lg bg-amber-400/10 text-amber-300 hover:bg-amber-400/20 border border-amber-400/30 text-[10px] font-bold transition cursor-pointer"
                    >
                      + Add Student
                    </button>
                  </div>
                  <div className="space-y-2">
                    {editStudentCoordinators.map((sc, idx) => (
                      <div key={idx} className="p-3 rounded-xl border border-amber-500/20 bg-stone-900/80 space-y-2 relative">
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            placeholder="Student Name (e.g. M. Sriarunachaleeshwaran)"
                            value={sc.name}
                            onChange={(e) => updateStudentCoordinator(idx, "name", e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-amber-500/30 bg-stone-950 text-stone-100 font-medium focus:outline-none focus:border-amber-400"
                          />
                          {editStudentCoordinators.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeStudentCoordinator(idx)}
                              className="text-[10px] text-rose-400 hover:text-rose-300 font-bold shrink-0 cursor-pointer"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          placeholder="Phone (e.g. +91 9361883441)"
                          value={sc.phone}
                          onChange={(e) => updateStudentCoordinator(idx, "phone", e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-amber-500/30 bg-stone-950 text-amber-300 focus:outline-none focus:border-amber-400 font-mono"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-amber-500/20">
                <button
                  type="button"
                  onClick={() => setEditingHackathon(null)}
                  className="px-4 py-2 rounded-xl text-xs uppercase font-bold text-stone-400 hover:text-stone-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 text-xs font-bold uppercase tracking-widest hover:brightness-110 transition disabled:opacity-50 shadow-lg cursor-pointer"
                >
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {deletingHackathon && ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-fadeIn">
          <div className="serene-glass-card rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl border border-amber-500/30 text-stone-100">
            <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-amber-500/20">
              <div>
                <h3 className="font-serif text-xl uppercase tracking-wider text-stone-100 font-normal">CONFIRM DELETION ⚠️</h3>
                <p className="text-xs font-sans text-stone-400 mt-1">Permanently remove this hackathon instance.</p>
              </div>
              <button
                type="button"
                onClick={() => setDeletingHackathon(null)}
                className="w-9 h-9 rounded-xl bg-stone-900 border border-amber-500/30 text-stone-400 hover:text-stone-100 flex items-center justify-center transition cursor-pointer shrink-0"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs font-sans text-stone-300 mb-6 leading-relaxed">
              Are you sure you want to delete <strong className="text-amber-300">{deletingHackathon.name}</strong>?
              <br />
              This action cannot be undone. An audit log entry will be saved recording your name and timestamp.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-amber-500/20">
              <button
                type="button"
                onClick={() => setDeletingHackathon(null)}
                className="px-4 py-2 rounded-xl text-xs uppercase font-bold text-stone-400 hover:text-stone-200 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={confirmDeleteHackathon}
                className="px-5 py-2.5 rounded-xl bg-rose-600 text-stone-100 text-xs font-sans uppercase font-bold tracking-wider hover:bg-rose-500 transition disabled:opacity-50 shadow-lg cursor-pointer"
              >
                {deleteLoading ? "Deleting..." : "Yes, Delete Hackathon"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default HackathonAdminHome;
