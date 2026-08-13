import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Shield,
  Tag,
  UploadCloud,
  Users,
} from "lucide-react";
import { useHackathonAuthStore } from "../../store/useHackathonAuthStore";
import { axiosInstance } from "../../lib/axios.js";
import AmbientBackground from "../AmbientBackground";

const baseNavItem =
  "w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-semibold transition";

const HackathonLayout = ({ children }) => {
  const { hackathonUser, logout, checkAuth, isCheckingAuth } = useHackathonAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!isCheckingAuth) {
      if (!hackathonUser) {
        window.location.href = "/Hackathon/login";
      } else if (location.pathname.toLowerCase().includes("/admin") && hackathonUser.role !== "admin") {
        navigate("/Hackathon/dashboard", { replace: true });
      }
    }
  }, [isCheckingAuth, hackathonUser, location.pathname, navigate]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-gray-600">Loading Hackathon Portal...</p>
        </div>
      </div>
    );
  }

  if (!hackathonUser) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const role = hackathonUser?.role;

  const [teamHasSubmitted, setTeamHasSubmitted] = useState(false);
  const [teamAbstractionStatus, setTeamAbstractionStatus] = useState("draft");

  useEffect(() => {
    if (role !== "student") {
      setTeamHasSubmitted(false);
      setTeamAbstractionStatus("draft");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await axiosInstance.get("/ich2026/status");
        if (!cancelled) {
          setTeamHasSubmitted((res.data?.submissions || []).length > 0);
          setTeamAbstractionStatus(res.data?.team?.abstractionStatus || "draft");
        }
      } catch {
        if (!cancelled) {
          setTeamHasSubmitted(false);
          setTeamAbstractionStatus("draft");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [role, hackathonUser?.id, location.pathname, location.search]);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Multi-hackathon states
  const [hackathonsList, setHackathonsList] = useState([]);
  const [selectedHackathonId, setSelectedHackathonId] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get("hackathonId") || "";
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const paramId = params.get("hackathonId") || "";
    if (paramId !== selectedHackathonId) {
      setSelectedHackathonId(paramId);
    }
  }, [location.search]);

  const tab = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("tab");
  }, [location.search]);

  const currentSlug = useMemo(() => {
    const parts = location.pathname.split("/").filter(Boolean);
    if (parts[0]?.toLowerCase() === "hackathon") {
      if (parts[1] && !["dashboard", "admin", "register", "login"].includes(parts[1].toLowerCase())) {
        return parts[1];
      }
      if (parts.length >= 4 && parts[1]?.toLowerCase() === "dashboard") {
        return parts[3];
      }
    }
    const searchId = new URLSearchParams(location.search).get("hackathonId");
    if (searchId) return searchId === "5" ? "Ai" : searchId;
    if (selectedHackathonId) return selectedHackathonId === "5" ? "Ai" : selectedHackathonId;
    return "ich2026";
  }, [location.pathname, location.search, selectedHackathonId]);

  const backToEventUrl = "/Hackathon";

  const activeTabKey = useMemo(() => {
    const p = location.pathname.toLowerCase();
    if (p.includes("/dashboard/team") || p.includes("/team")) return "team";
    if (p.includes("/dashboard/problems") || p.includes("/dashboard/problem") || p.includes("/problems")) return "problems";
    if (p.includes("/dashboard/submit") || p.includes("/submit")) return "submit";
    if (p.includes("/dashboard/status") || p.includes("/status")) return "status";
    if (p.includes("/dashboard/guidelines") || p.includes("/guidelines")) return "guidelines";

    const searchTab = new URLSearchParams(location.search).get("tab");
    if (searchTab) return searchTab === "problem" ? "problems" : searchTab;
    return "dashboard";
  }, [location.pathname, location.search]);

  const makeUrl = (subPath) => {
    const cleanSubPath = (subPath || "").split("?")[0];
    const searchId = new URLSearchParams(location.search).get("hackathonId");
    const activeId = searchId || selectedHackathonId;
    if (!activeId) {
      if (!currentSlug || currentSlug.toLowerCase() === "ich2026") {
        return `/Hackathon${cleanSubPath}`;
      }
      return `/Hackathon/${currentSlug}${cleanSubPath}`;
    }
    const cleanId = String(activeId).split("?")[0].split("&")[0];
    if (!currentSlug || currentSlug.toLowerCase() === "ich2026") {
      return `/Hackathon${cleanSubPath}?hackathonId=${cleanId}`;
    }
    return `/Hackathon/${currentSlug}${cleanSubPath}?hackathonId=${cleanId}`;
  };

  const cleanSelectedHackathonId = useMemo(() => {
    const searchId = new URLSearchParams(location.search).get("hackathonId");
    if (searchId) return String(searchId).split("?")[0].split("&")[0];
    if (selectedHackathonId) return String(selectedHackathonId).split("?")[0].split("&")[0];
    return "";
  }, [location.search, selectedHackathonId]);

  const selectedHackathonObj = useMemo(() => {
    if (!cleanSelectedHackathonId) return null;
    return hackathonsList.find((h) => String(h.id) === String(cleanSelectedHackathonId)) || null;
  }, [hackathonsList, cleanSelectedHackathonId]);

  const isCustomHackathonMode = useMemo(() => {
    if (selectedHackathonObj) {
      return selectedHackathonObj.problemStatementType === "custom" || String(selectedHackathonObj.id) === "2" || String(selectedHackathonObj.id) === "6";
    }
    return cleanSelectedHackathonId === "2" || cleanSelectedHackathonId === "6";
  }, [selectedHackathonObj, cleanSelectedHackathonId]);

  const showResults = selectedHackathonObj?.showResults === true;
  const isTeamApproved = teamAbstractionStatus === "approved";

  const studentNav = useMemo(() => {
    const isUnlockedCustom = showResults && isTeamApproved;
    const isLockedCustom = isCustomHackathonMode && !isUnlockedCustom;

    if (isLockedCustom) {
      return [
        { to: makeUrl("/dashboard"), label: "Dashboard", tabKey: "dashboard", icon: LayoutDashboard },
        { to: makeUrl("/dashboard/team"), label: "Team", tabKey: "team", icon: Users },
        { to: makeUrl("/dashboard/problems"), label: "Problems", tabKey: "problems", icon: ClipboardList },
      ];
    }
    const base = [
      { to: makeUrl("/dashboard"), label: "Dashboard", tabKey: "dashboard", icon: LayoutDashboard },
      { to: makeUrl("/dashboard/team"), label: "Team", tabKey: "team", icon: Users },
      { to: makeUrl("/dashboard/problems"), label: "Problems", tabKey: "problems", icon: ClipboardList },
      { to: makeUrl("/payment-details"), label: "Payment", icon: CreditCard },
    ];
    const submitItem = { to: makeUrl("/dashboard/submit"), label: "Submit", tabKey: "submit", icon: UploadCloud };
    const statusItem = { to: makeUrl("/dashboard/status"), label: "Status", tabKey: "status", icon: Activity };
    return teamHasSubmitted ? [...base, statusItem] : [...base, submitItem, statusItem];
  }, [currentSlug, teamHasSubmitted, isCustomHackathonMode, showResults, isTeamApproved]);

  const mentorNav = useMemo(
    () => {
      return [
        { to: makeUrl("/dashboard"), label: "Dashboard", tabKey: "dashboard", icon: LayoutDashboard },
        { to: makeUrl("/dashboard/team"), label: "Team", tabKey: "team", icon: Users },
        { to: makeUrl("/dashboard/status"), label: "Status", tabKey: "status", icon: Activity },
      ];
    },
    [currentSlug]
  );

  useEffect(() => {
    if (
      role === "admin" &&
      isCustomHackathonMode &&
      location.pathname.includes("/admin/problems")
    ) {
      navigate(makeUrl("/admin"), { replace: true });
    }
  }, [role, isCustomHackathonMode, location.pathname, currentSlug, navigate]);

  const adminNav = useMemo(
    () => {
      const items = [
        { to: makeUrl("/admin"), label: "Admin Home", icon: Shield },
        { to: makeUrl("/admin/teams"), label: "Teams", icon: Users },
        { to: makeUrl("/admin/mentors"), label: "Mentors", icon: Users },
        { to: makeUrl("/admin/problems"), label: "Problems", icon: ClipboardList },
        { to: makeUrl("/admin/submissions"), label: "Submissions", icon: Activity },
        { to: makeUrl("/admin/payment-details"), label: "Payment Details", icon: CreditCard },
        { to: makeUrl("/admin/send-mail"), label: "Send Mail", icon: Mail },
        { to: makeUrl("/admin/users"), label: "Admins", icon: Users },
      ];
      if (isCustomHackathonMode) {
        return items.map((i) =>
          i.to.includes("/admin/problems")
            ? { to: makeUrl("/admin/themes"), label: "Themes & Reviewers", icon: Tag }
            : i
        );
      }
      return items;
    },
    [currentSlug, isCustomHackathonMode]
  );

  const reviewerNav = useMemo(
    () => [
      { to: makeUrl("/dashboard"), label: "Reviewer Workspace", tabKey: "dashboard", icon: Shield },
    ],
    [currentSlug]
  );

  const nav = role === "admin" ? adminNav : role === "mentor" ? mentorNav : role === "reviewer" ? reviewerNav : studentNav;

  const checkIsActive = (item) => {
    const currentPath = location.pathname.toLowerCase();
    const itemPath = item.to.split("?")[0].toLowerCase();
    if (role === "admin") {
      const isAdminHome = itemPath.endsWith("/admin") || itemPath === "/hackathon/admin";
      if (isAdminHome) {
        return currentPath === itemPath || currentPath === `${itemPath}/`;
      }
      return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
    }
    if (item.tabKey) {
      if (!currentPath.includes("/dashboard")) return false;
      return item.tabKey === activeTabKey;
    }
    return currentPath === itemPath;
  };

  const navActiveLabel = nav.find((n) => checkIsActive(n))?.label || "Dashboard";

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newHackathonName, setNewHackathonName] = useState("");
  const [newHackathonDesc, setNewHackathonDesc] = useState("");
  const [newHackathonStartDate, setNewHackathonStartDate] = useState("");
  const [newHackathonEndDate, setNewHackathonEndDate] = useState("");
  const [newHackathonVenue, setNewHackathonVenue] = useState("Kumaraguru College of Technology");
  const [newHackathonOrganizedBy, setNewHackathonOrganizedBy] = useState("AICTE IDEA Lab, KCT");
  const [newHackathonProblemMode, setNewHackathonProblemMode] = useState("predefined");
  const [newHackathonTagline, setNewHackathonTagline] = useState("");
  const [newHackathonInAssociationWith, setNewHackathonInAssociationWith] = useState("");
  const [newHackathonPrizes, setNewHackathonPrizes] = useState("");
  const [newHackathonRefreshments, setNewHackathonRefreshments] = useState("");
  const [newHackathonRequiredDocuments, setNewHackathonRequiredDocuments] = useState("");
  const [newHackathonThemes, setNewHackathonThemes] = useState("");
  const [scheduleDays, setScheduleDays] = useState([
    {
      dayNum: "01",
      date: "April 10, 2026",
      title: "Prototype Development & Mentoring",
      detailsText: "Build and refine your prototype.\nFollow technical guidance from mentors.\nImprove your solution based on suggestions.",
    },
    {
      dayNum: "02",
      date: "April 11, 2026",
      title: "Final Review & Presentation",
      detailsText: "Final refinement of the solution.\nProject presentation before the jury panel.\nDemonstration of your PoC / Prototype.",
    },
  ]);
  const [createLoading, setCreateLoading] = useState(false);

  const fetchHackathons = async () => {
    try {
      const endpoint = role === "admin" ? "/ich2026/admin/hackathons" : "/ich2026/hackathons";
      const res = await axiosInstance.get(endpoint);
      const list = res.data?.hackathons || [];
      setHackathonsList(list);
      if (list.length > 0 && selectedHackathonId !== "") {
        const exists = list.some((h) => String(h.id) === String(selectedHackathonId));
        if (!exists) {
          setSelectedHackathonId("");
          localStorage.removeItem("selectedHackathonId");
        }
      }
    } catch (e) {
      console.error("Failed to load hackathons:", e);
    }
  };

  useEffect(() => {
    fetchHackathons();
    const handleUpdate = () => void fetchHackathons();
    window.addEventListener("hackathons-updated", handleUpdate);
    return () => {
      window.removeEventListener("hackathons-updated", handleUpdate);
    };
  }, [role]);

  const handleHackathonChange = (e) => {
    const val = e.target.value;
    setSelectedHackathonId(val);
    if (val) {
      localStorage.setItem("selectedHackathonId", val);
    } else {
      localStorage.removeItem("selectedHackathonId");
    }

    const chosen = hackathonsList.find((h) => String(h.id) === String(val));
    const targetIdOrSlug = chosen?.slug || val;

    if (role === "admin") {
      const searchParams = new URLSearchParams(location.search);
      if (val) searchParams.set("hackathonId", val);
      else searchParams.delete("hackathonId");
      const q = searchParams.toString();
      navigate(q ? `${location.pathname}?${q}` : location.pathname);
    } else if (targetIdOrSlug) {
      navigate(`/Hackathon/${targetIdOrSlug}/dashboard`);
    }
  };

  const addScheduleDay = () => {
    const nextNum = String(scheduleDays.length + 1).padStart(2, "0");
    setScheduleDays((prev) => [
      ...prev,
      {
        dayNum: nextNum,
        date: "",
        title: "",
        detailsText: "",
      },
    ]);
  };

  const removeScheduleDay = (index) => {
    setScheduleDays((prev) => prev.filter((_, i) => i !== index));
  };

  const updateScheduleDay = (index, field, value) => {
    setScheduleDays((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleCreateHackathon = async (e) => {
    e.preventDefault();
    if (!newHackathonName.trim()) return;
    setCreateLoading(true);

    const formattedSchedule = scheduleDays.map((d) => ({
      dayNum: d.dayNum || "01",
      date: d.date || "",
      title: d.title || "",
      details: (d.detailsText || "").split("\n").map((s) => s.trim()).filter(Boolean),
    }));

    try {
      const res = await axiosInstance.post("/ich2026/admin/hackathons", {
        name: newHackathonName.trim(),
        description: newHackathonDesc.trim(),
        startDate: newHackathonStartDate || null,
        endDate: newHackathonEndDate || null,
        status: "active",
        schedule: formattedSchedule,
        venue: newHackathonVenue.trim(),
        organizedBy: newHackathonOrganizedBy.trim(),
        problemStatementType: newHackathonProblemMode,
        tagline: newHackathonTagline.trim(),
        inAssociationWith: newHackathonInAssociationWith.trim(),
        prizes: newHackathonPrizes.trim(),
        refreshments: newHackathonRefreshments.trim(),
        requiredDocuments: newHackathonRequiredDocuments.split("\n").map((s) => s.trim()).filter(Boolean),
        themes: newHackathonThemes.split("\n").map((s) => s.trim()).filter(Boolean),
      });
      const created = res.data?.hackathon;
      if (created) {
        setHackathonsList((prev) => [created, ...prev]);
        setSelectedHackathonId(String(created.id));
        localStorage.setItem("selectedHackathonId", String(created.id));
        setNewHackathonName("");
        setNewHackathonDesc("");
        setNewHackathonStartDate("");
        setNewHackathonEndDate("");
        setCreateModalOpen(false);
        window.dispatchEvent(new Event("hackathons-updated"));
        const searchParams = new URLSearchParams(location.search);
        searchParams.set("hackathonId", String(created.id));
        navigate(`${location.pathname}?${searchParams.toString()}`);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create hackathon");
    } finally {
      setCreateLoading(false);
    }
  };

  const showMobileDock =
    Boolean(hackathonUser) && (location.pathname.startsWith("/Hackathon/dashboard") || location.pathname.includes("/dashboard")) && role !== "admin";

  const mobileDockItems = useMemo(() => {
    if (role === "mentor") {
      return [
        { to: makeUrl("/dashboard?tab=team"), label: "Team", tabKey: "team", icon: Users },
        { to: makeUrl("/dashboard?tab=status"), label: "Status", tabKey: "status", icon: Activity },
      ];
    }
    const base = [
      { to: makeUrl("/dashboard?tab=team"), label: "Team", tabKey: "team", icon: Users },
      { to: makeUrl("/dashboard?tab=problems"), label: "Problems", tabKey: "problems", icon: ClipboardList },
    ];
    const submit = { to: makeUrl("/dashboard?tab=submit"), label: "Submit", tabKey: "submit", icon: UploadCloud };
    const status = { to: makeUrl("/dashboard?tab=status"), label: "Status", tabKey: "status", icon: Activity };
    return teamHasSubmitted ? [...base, status] : [...base, submit, status];
  }, [role, teamHasSubmitted, currentSlug]);

  const handleLogout = async () => {
    setMobileOpen(false);
    try {
      await logout();
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      window.location.href = "/Hackathon/login";
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0809] text-stone-100 font-sans selection:bg-amber-400 selection:text-stone-950 relative overflow-x-hidden">
      <AmbientBackground height="fixed inset-0" />
      
      {/* Sidebar (desktop fixed) */}
      <aside
        className={`hidden md:block fixed top-4 bottom-4 left-4 z-40 transition-all duration-300 ${
          collapsed ? "w-[88px]" : "w-[260px]"
        }`}
      >
        <div className="h-full overflow-y-auto serene-glass-card rounded-3xl border border-amber-500/25 shadow-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6 px-1 pt-1">
              {!collapsed ? (
                <div>
                  <div className="text-[10px] font-dancing text-amber-200/90">AICTE IDEA Lab</div>
                  <div className="mt-0.5 text-xl font-serif uppercase tracking-widest text-stone-100 font-normal">Hackathon</div>
                </div>
              ) : (
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 font-serif font-bold">H</div>
              )}
              <button
                onClick={() => setCollapsed((v) => !v)}
                className="w-8 h-8 rounded-xl bg-stone-900 hover:bg-amber-400/10 border border-amber-500/30 text-amber-300 flex items-center justify-center transition cursor-pointer"
                aria-label="Toggle sidebar"
              >
                {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            </div>

            {!collapsed ? (
              <div className="mb-6 px-3 py-2.5 rounded-2xl bg-stone-900/80 border border-amber-500/15 text-xs text-stone-300">
                <div className="text-[10px] font-sans uppercase tracking-widest text-stone-500">Participant</div>
                <div className="font-serif text-sm uppercase tracking-wider text-stone-100 truncate">{hackathonUser?.fullName}</div>
                <div className="mt-0.5 text-[10px] font-sans uppercase font-bold text-amber-400">{hackathonUser?.role}</div>
              </div>
            ) : null}

            <nav className="flex flex-col gap-1.5 font-sans text-xs">
              {nav.map((item) => {
                const isActive = checkIsActive(item);
                const ItemIcon = item.icon;
                const targetUrl =
                  role === "admin" && selectedHackathonId
                    ? `${item.to}?hackathonId=${selectedHackathonId}`
                    : item.to;

                return (
                  <Link
                    key={role === "admin" ? item.to : item.tabKey}
                    to={targetUrl}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl uppercase tracking-wider font-semibold transition-all ${collapsed ? "justify-center px-2" : ""} ${
                      isActive
                        ? "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 font-bold shadow-lg shadow-amber-500/20"
                        : "text-stone-300 hover:bg-amber-400/10 hover:text-amber-300"
                    }`}
                    title={item.label}
                  >
                    <ItemIcon className="w-4 h-4 shrink-0" />
                    {!collapsed ? item.label : null}
                  </Link>
                );
              })}
            </nav>
          </div>

          <button
            onClick={handleLogout}
            className={`mt-6 w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-sans uppercase tracking-widest font-bold transition border border-rose-500/30 cursor-pointer ${
              collapsed ? "px-2" : ""
            }`}
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            {!collapsed ? "Logout" : null}
          </button>
        </div>
      </aside>

      <div
        className={`px-4 py-5 transition-all duration-300 relative z-10 ${collapsed ? "md:ml-[104px]" : "md:ml-[280px]"} ${
          showMobileDock ? "pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:pb-5" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto">
          {/* Main */}
          <main className="flex-1">
            {/* Top header */}
            <div className="flex items-center justify-between mb-6 gap-3 flex-wrap p-4 serene-glass-card rounded-2xl border border-amber-500/25 shadow-xl">
              <div className="flex items-center gap-3">
                <button
                  className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl bg-stone-900 border border-amber-500/30 text-amber-300 shadow-sm"
                  onClick={() => setMobileOpen(true)}
                  aria-label="Open menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <Link
                  to={backToEventUrl}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-amber-500/30 bg-stone-900/90 text-xs font-sans uppercase font-bold tracking-wider text-stone-300 hover:text-amber-300 hover:border-amber-400 transition shadow-md shrink-0 cursor-pointer"
                  title="Back to All Hackathons"
                >
                  <ArrowLeft className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Back to Hackathons</span>
                </Link>
                <div>
                  <div className="text-xl sm:text-2xl font-serif uppercase tracking-widest text-stone-100 font-normal">Hackathon Workspace</div>
                  <div className="text-xs font-sans text-stone-400">Viewing: <span className="text-amber-300 font-semibold">{navActiveLabel}</span></div>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
                {/* Event Selector Dropdown - ADMIN ONLY */}
                {role === "admin" && hackathonsList.length > 0 && (
                  <div className="flex items-center gap-2 bg-stone-900/90 border border-amber-500/30 rounded-xl px-3 py-1.5 shadow-md font-sans shrink-0">
                    <span className="text-[11px] font-serif uppercase tracking-wider text-amber-300 font-bold hidden sm:inline">
                      SELECT EVENT:
                    </span>
                    <select
                      value={cleanSelectedHackathonId || ""}
                      onChange={handleHackathonChange}
                      className="bg-transparent text-amber-300 text-xs font-sans font-bold focus:outline-none cursor-pointer max-w-[210px] truncate"
                    >
                      <option value="" className="bg-stone-950 text-stone-200">All Hackathons</option>
                      {hackathonsList.map((h) => (
                        <option key={h.id} value={h.id} className="bg-stone-950 text-stone-100 font-sans">
                          🏆 {h.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {role === "admin" && (
                  <button
                    onClick={() => setCreateModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 text-xs font-sans uppercase font-bold tracking-wider hover:brightness-110 transition flex items-center gap-1 shadow-lg cursor-pointer shrink-0"
                  >
                    <span>+ Create Hackathon</span>
                  </button>
                )}

                <div className="text-xs font-sans text-stone-300 hidden sm:block">
                  <span className="font-serif text-sm uppercase tracking-wider text-stone-100 font-semibold">{hackathonUser?.fullName}</span>
                </div>
                <span className="text-xs font-sans uppercase font-bold px-3 py-1 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30">
                  {hackathonUser?.role}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-xl border border-amber-500/30 bg-stone-900/80 text-stone-300 hover:text-amber-300 text-xs font-sans uppercase font-bold tracking-wider transition cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </div>

            <div className="serene-glass-card rounded-2xl sm:rounded-3xl border border-amber-500/25 shadow-2xl p-4 sm:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-[280px] bg-[#0B1220] border-r border-white/10 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="text-xs font-semibold text-white/60">AICTE IDEA Lab</div>
                <div className="mt-1 text-xl font-extrabold text-white">Hackathon 2026</div>
              </div>
              <button
                className="w-11 h-11 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <span className="text-white font-bold text-lg leading-none">x</span>
              </button>
            </div>

            <div className="mb-5 text-sm text-white/80">
              <div>
                Signed in as{" "}
                <span className="font-semibold text-white">{hackathonUser?.fullName}</span>
              </div>
              <div className="mt-1 text-xs text-white/55">{hackathonUser?.role}</div>
            </div>

            <nav className="flex flex-col gap-2">
              {nav.map((item) => {
                const isActive = checkIsActive(item);
                const ItemIcon = item.icon;
                return (
                  <Link
                    key={role === "admin" ? item.to : item.tabKey}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={`${baseNavItem} ${
                      isActive
                        ? "bg-[#2563EB] text-white"
                        : "bg-white/0 text-white/80 hover:bg-white/5"
                    }`}
                  >
                    <ItemIcon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <button
              onClick={handleLogout}
              className="mt-5 w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-sm font-semibold transition border border-white/10"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </aside>
        </div>
      ) : null}

      {showMobileDock ? (
        <nav
          className="fixed bottom-0 left-0 right-0 z-30 md:hidden border-t border-[#E2E8F0] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85 shadow-[0_-4px_16px_rgba(15,23,42,0.08)]"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
          aria-label="Dashboard sections"
        >
          <div className="flex items-stretch justify-around max-w-7xl mx-auto px-1 pt-1.5 pb-1">
            {mobileDockItems.map((item) => {
              const isActive = item.tabKey === activeTabKey;
              const ItemIcon = item.icon;
              return (
                <Link
                  key={item.tabKey}
                  to={item.to}
                  className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-2 px-1 text-[11px] font-semibold transition ${
                    isActive ? "text-[#2563EB]" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <ItemIcon className={`h-5 w-5 shrink-0 ${isActive ? "text-[#2563EB]" : "text-gray-500"}`} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      ) : null}

      {/* Create Hackathon Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-fadeIn">
          <div className="serene-glass-card rounded-3xl p-6 md:p-8 w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl border border-amber-500/30 text-stone-100">
            <h3 className="font-serif text-2xl text-stone-100 uppercase tracking-widest mb-1 font-normal">Create New Hackathon 🏆</h3>
            <p className="text-xs font-sans text-stone-400 mb-6">Set up a new hackathon instance with custom dates, schedule days & isolated database scoping.</p>

            <form onSubmit={handleCreateHackathon} className="space-y-4 font-sans text-xs">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-stone-300 mb-1.5">Hackathon Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI & Robotics Hackathon 2026"
                  value={newHackathonName}
                  onChange={(e) => setNewHackathonName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-amber-500/30 bg-stone-900/90 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-stone-300 mb-1.5">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief description of the event, themes or objectives..."
                  value={newHackathonDesc}
                  onChange={(e) => setNewHackathonDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-amber-500/30 bg-stone-900/90 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-stone-300 mb-1.5">Venue</label>
                  <input
                    type="text"
                    value={newHackathonVenue}
                    onChange={(e) => setNewHackathonVenue(e.target.value)}
                    placeholder="e.g. MGATE, KCT, COIMBATORE"
                    className="w-full px-4 py-2.5 rounded-xl border border-amber-500/30 bg-stone-900/90 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-stone-300 mb-1.5">Organized By</label>
                  <input
                    type="text"
                    value={newHackathonOrganizedBy}
                    onChange={(e) => setNewHackathonOrganizedBy(e.target.value)}
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
                    value={newHackathonTagline}
                    onChange={(e) => setNewHackathonTagline(e.target.value)}
                    placeholder="e.g. An Initiative under IEEE Smart Cities"
                    className="w-full px-4 py-2.5 rounded-xl border border-amber-500/30 bg-stone-900/90 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-stone-300 mb-1.5">In Association With</label>
                  <input
                    type="text"
                    value={newHackathonInAssociationWith}
                    onChange={(e) => setNewHackathonInAssociationWith(e.target.value)}
                    placeholder="e.g. KCT IEEE Student Branch | KCT IEEE WIE"
                    className="w-full px-4 py-2.5 rounded-xl border border-amber-500/30 bg-stone-900/90 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-stone-300 mb-1.5">Prizes & Awards</label>
                  <input
                    type="text"
                    value={newHackathonPrizes}
                    onChange={(e) => setNewHackathonPrizes(e.target.value)}
                    placeholder="e.g. ₹ 15,000"
                    className="w-full px-4 py-2.5 rounded-xl border border-amber-500/30 bg-stone-900/90 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-amber-300 mb-2">Problem Statement Mode</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition ${newHackathonProblemMode === "predefined" ? "border-amber-400 bg-amber-400/15" : "border-amber-500/20 bg-stone-900/60 hover:bg-stone-900/90"}`}>
                    <input
                      type="radio"
                      name="createProblemMode"
                      value="predefined"
                      checked={newHackathonProblemMode === "predefined"}
                      onChange={() => setNewHackathonProblemMode("predefined")}
                      className="accent-amber-400"
                    />
                    <div>
                      <div className="text-xs font-bold text-stone-100">Predefined Problems</div>
                      <div className="text-[11px] text-stone-400">Admin sets problems, students pick from list</div>
                    </div>
                  </label>
                  <label className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition ${newHackathonProblemMode === "custom" ? "border-amber-400 bg-amber-400/15" : "border-amber-500/20 bg-stone-900/60 hover:bg-stone-900/90"}`}>
                    <input
                      type="radio"
                      name="createProblemMode"
                      value="custom"
                      checked={newHackathonProblemMode === "custom"}
                      onChange={() => setNewHackathonProblemMode("custom")}
                      className="accent-amber-400"
                    />
                    <div>
                      <div className="text-xs font-bold text-stone-100">Student's Own Problem</div>
                      <div className="text-[11px] text-stone-400">Students enter their own topic & description</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Schedule Days Builder */}
              <div className="pt-3 border-t border-amber-500/20">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-bold text-amber-300">Event Schedule (Flexible Days)</label>
                    <span className="text-[11px] text-stone-400">Configure days, titles & bullet point details displayed on landing page.</span>
                  </div>
                  <button
                    type="button"
                    onClick={addScheduleDay}
                    className="px-3 py-1.5 rounded-xl bg-amber-400/10 text-amber-300 hover:bg-amber-400/20 border border-amber-400/30 text-xs font-bold transition cursor-pointer"
                  >
                    + Add Day
                  </button>
                </div>

                <div className="space-y-3">
                  {scheduleDays.map((day, idx) => (
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
                            onChange={(e) => updateScheduleDay(idx, "date", e.target.value)}
                            className="px-3 py-1 text-xs rounded-xl border border-amber-500/30 bg-stone-950 text-stone-100 focus:outline-none focus:border-amber-400 font-medium"
                          />
                        </div>
                        {scheduleDays.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeScheduleDay(idx)}
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
                          onChange={(e) => updateScheduleDay(idx, "title", e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-amber-500/30 bg-stone-950 text-stone-100 font-semibold focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <textarea
                          rows={3}
                          placeholder="Bullet point details (one per line)&#10;e.g. Build and refine your prototype.&#10;Follow technical guidance from mentors."
                          value={day.detailsText}
                          onChange={(e) => updateScheduleDay(idx, "detailsText", e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-amber-500/30 bg-stone-950 text-stone-100 font-normal focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-amber-500/20">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs uppercase font-bold text-stone-400 hover:text-stone-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 text-xs font-bold uppercase tracking-widest hover:brightness-110 transition disabled:opacity-50 shadow-lg cursor-pointer"
                >
                  {createLoading ? "Creating..." : "Create Hackathon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HackathonLayout;

