import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import { axiosInstance } from "../../lib/axios.js";
import { useHackathonAuthStore } from "../../store/useHackathonAuthStore";
import { toast } from "react-hot-toast";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Calendar,
  CheckCircle2,
  Lightbulb,
  LogIn,
  MapPin,
  Menu,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  X,
} from "lucide-react";

import IdeaLabLogo from "../../assets/idea-lab.png";
import KctLogo from "../../assets/kctlogo.png";
import AmbientBackground from "../../components/AmbientBackground";

const scrollToId = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

const HackathonLanding = () => {
  const { hackathonSlug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { hackathonUser, logout } = useHackathonAuthStore();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [registrationClosed, setRegistrationClosed] = useState(false);
  const [registrationClosedMessage, setRegistrationClosedMessage] = useState("");
  const [activeHackathons, setActiveHackathons] = useState([]);
  const [selectedHackathon, setSelectedHackathon] = useState(null);
  const [problems, setProblems] = useState([]);
  const [userRegisteredIds, setUserRegisteredIds] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showLoginPromptModal, setShowLoginPromptModal] = useState(false);
  const [registering, setRegistering] = useState(false);

  const fetchProblems = async (hId) => {
    try {
      const url = hId ? `/ich2026/problems?hackathonId=${hId}` : "/ich2026/problems";
      const res = await axiosInstance.get(url);
      setProblems(res.data?.problems || []);
    } catch {
      setProblems([]);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    let active = true;
    (async () => {
      try {
        const [statusRes, hackathonRes] = await Promise.all([
          axiosInstance.get("/ich2026/registration-status"),
          axiosInstance.get("/ich2026/hackathons"),
        ]);
        if (!active) return;
        setRegistrationClosed(Boolean(statusRes.data?.registrationClosed));
        setRegistrationClosedMessage(statusRes.data?.message || "");
        const list = hackathonRes.data?.hackathons || [];
        setActiveHackathons(list);

        const searchId = hackathonSlug || new URLSearchParams(window.location.search).get("hackathonId");
        let matched = null;
        if (list.length > 0) {
          if (searchId) {
            const targetLower = String(searchId).toLowerCase();
            matched = list.find((h) => {
              const hId = String(h.id).toLowerCase();
              const hSlug = String(h.slug || "").toLowerCase();
              const hName = String(h.name || "").toLowerCase();
              return (
                hId === targetLower ||
                hSlug === targetLower ||
                (targetLower === "ai" && (hId === "5" || hName.includes("ai") || hSlug.includes("ai"))) ||
                hName.includes(targetLower)
              );
            });
          }
          if (!matched) matched = list[0];
          setSelectedHackathon(matched);
        }
        fetchProblems(matched?.id);
      } catch {
        if (active) {
          setRegistrationClosed(false);
          setRegistrationClosedMessage("");
        }
        fetchProblems();
      }
    })();
    return () => {
      active = false;
    };
  }, [hackathonSlug]);

  useEffect(() => {
    if (selectedHackathon?.id) {
      fetchProblems(selectedHackathon.id);
    }
  }, [selectedHackathon?.id]);

  useEffect(() => {
    if (hackathonUser) {
      axiosInstance
        .get("/ich2026/my-registrations")
        .then((res) => {
          setUserRegisteredIds(res.data?.registeredIds || []);
        })
        .catch(() => setUserRegisteredIds([]));
    }
  }, [hackathonUser]);

  useEffect(() => {
    if (!hackathonUser || !selectedHackathon) return;
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get("confirmRegister") === "1") {
      const isAlreadyReg = userRegisteredIds.includes(String(selectedHackathon.id));
      if (!isAlreadyReg) {
        setShowConfirmModal(true);
      }
    }
  }, [hackathonUser, selectedHackathon, location.search, userRegisteredIds]);

  const isUserRegistered = useMemo(() => {
    if (!selectedHackathon?.id) return false;
    return userRegisteredIds.includes(String(selectedHackathon.id));
  }, [selectedHackathon?.id, userRegisteredIds]);

  const handleRegisterClick = () => {
    if (!hackathonUser) {
      setShowLoginPromptModal(true);
      return;
    }
    if (isUserRegistered) {
      const slug = selectedHackathon?.slug || selectedHackathon?.id || "ich2026";
      navigate(`/Hackathon/${slug}/dashboard`);
      return;
    }
    setShowConfirmModal(true);
  };

  const handleProceedToLogin = () => {
    const currentSlug = selectedHackathon?.slug || hackathonSlug || selectedHackathon?.id || "ich2026";
    const targetUrl = `/Hackathon/${currentSlug}?confirmRegister=1`;
    localStorage.setItem("loginRedirect", targetUrl);
    setShowLoginPromptModal(false);
    navigate(`/Hackathon/login?redirect=${encodeURIComponent(targetUrl)}`);
  };

  const handleConfirmRegister = async () => {
    if (!selectedHackathon?.id) return;
    setRegistering(true);
    try {
      const res = await axiosInstance.post("/ich2026/hackathons/register-event", {
        hackathonId: selectedHackathon.id,
      });
      toast.success(res.data?.message || `Registered for ${selectedHackathon.name}!`);
      setUserRegisteredIds((prev) => [...prev, String(selectedHackathon.id)]);
      setShowConfirmModal(false);
      const slug = selectedHackathon.slug || selectedHackathon.id;
      navigate(`/Hackathon/${slug}/dashboard`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to register for hackathon.");
    } finally {
      setRegistering(false);
    }
  };

  const isExpired = useMemo(() => {
    if (!selectedHackathon?.endDate) return false;
    const end = new Date(selectedHackathon.endDate);
    return !Number.isNaN(end.getTime()) && new Date() > end;
  }, [selectedHackathon]);

  const formattedEventDate = useMemo(() => {
    const getOrdinal = (d) => {
      const num = parseInt(d, 10);
      if (isNaN(num)) return d;
      if (num > 3 && num < 21) return `${num}th`;
      switch (num % 10) {
        case 1:  return `${num}st`;
        case 2:  return `${num}nd`;
        case 3:  return `${num}rd`;
        default: return `${num}th`;
      }
    };

    const getYear = () => {
      if (selectedHackathon?.endDate) {
        const y = new Date(selectedHackathon.endDate).getFullYear();
        if (!isNaN(y)) return y;
      }
      if (selectedHackathon?.startDate) {
        const y = new Date(selectedHackathon.startDate).getFullYear();
        if (!isNaN(y)) return y;
      }
      return 2026;
    };

    const formatDayMonth = (rawStr) => {
      const match = String(rawStr || "").match(/^([A-Za-z]+)\s+(\d+)/);
      if (match) {
        const [, month, dayNum] = match;
        return `${month} ${getOrdinal(dayNum)}`;
      }
      return rawStr;
    };

    if (selectedHackathon?.schedule && selectedHackathon.schedule.length > 0) {
      const dates = selectedHackathon.schedule.map((s) => s.date).filter(Boolean);
      const year = getYear();
      if (dates.length === 1) {
        return `${formatDayMonth(dates[0])}, ${year}`;
      }
      if (dates.length === 2) {
        return `${formatDayMonth(dates[0])} and ${formatDayMonth(dates[1])}, ${year}`;
      }
      if (dates.length > 2) {
        return `${formatDayMonth(dates[0])} to ${formatDayMonth(dates[dates.length - 1])}, ${year}`;
      }
    }

    if (selectedHackathon?.startDate && selectedHackathon?.endDate) {
      const s = new Date(selectedHackathon.startDate);
      const e = new Date(selectedHackathon.endDate);
      if (!Number.isNaN(s.getTime()) && !Number.isNaN(e.getTime())) {
        const startMonth = s.toLocaleDateString("en-US", { month: "long" });
        const endMonth = e.toLocaleDateString("en-US", { month: "long" });
        const startDay = getOrdinal(s.getDate());
        const endDay = getOrdinal(e.getDate());
        const year = e.getFullYear();
        const diffDays = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;

        if (diffDays === 1) {
          return `${startMonth} ${startDay}, ${year}`;
        }
        const joiner = diffDays === 2 ? "and" : "to";
        return `${startMonth} ${startDay} ${joiner} ${endMonth} ${endDay}, ${year}`;
      }
    }

    return `April 10th and April 11th, ${getYear()}`;
  }, [selectedHackathon]);

  const closeAndScroll = (id) => {
    setMobileNavOpen(false);
    setTimeout(() => scrollToId(id), 0);
  };

  const cardBase =
    "serene-glass-card rounded-3xl border border-amber-500/25 transition-all duration-300 hover:border-amber-400/60 hover:shadow-2xl hover:shadow-amber-500/10";

  return (
    <div className="min-h-screen bg-[#0a0809] text-stone-100 relative overflow-x-hidden font-sans selection:bg-amber-400 selection:text-stone-950">
      <AmbientBackground height="fixed inset-0" />

      {/* Navbar */}
      <header className="relative z-50 w-full sticky top-0">
        <div className="border-b border-amber-500/20 bg-stone-950/85 backdrop-blur-xl shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="shrink-0 rounded-xl bg-stone-900 border border-amber-500/30 px-2 py-1.5 shadow-md">
                  <img
                    src={KctLogo}
                    alt="Kumaraguru College of Technology"
                    className="h-7 sm:h-8 w-auto max-h-8 object-contain block filter brightness-110"
                  />
                </div>
                <div className="h-7 w-px bg-amber-500/20 shrink-0" />
                <img src={IdeaLabLogo} alt="AICTE IDEA Lab" className="h-8 sm:h-9 w-auto object-contain shrink-0" />
                <span className="hidden sm:inline font-serif text-stone-100 uppercase tracking-widest text-sm md:text-base whitespace-nowrap font-normal">
                  AICTE IDEA LAB
                </span>
              </div>

              <nav className="hidden lg:flex items-center justify-center gap-8 text-xs font-sans uppercase tracking-widest text-stone-300 flex-1">
                <a className="hover:text-amber-300 transition-colors" href="#event">
                  Event
                </a>
                <a className="hover:text-amber-300 transition-colors" href="#schedule">
                  Schedule
                </a>
                <a className="hover:text-amber-300 transition-colors" href="#outcomes">
                  Outcomes
                </a>
                <a className="hover:text-amber-300 transition-colors" href="#benefits">
                  Benefits
                </a>
              </nav>

              <div className="flex items-center gap-2 shrink-0 font-sans text-xs">
                <button
                  type="button"
                  className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-amber-500/30 bg-stone-900 text-amber-300 shadow-sm"
                  aria-label="Open menu"
                  aria-expanded={mobileNavOpen}
                  onClick={() => setMobileNavOpen(true)}
                >
                  <Menu className="w-5 h-5" />
                </button>
                <Link
                  to="/hackathon"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-amber-500/30 bg-stone-900/80 text-amber-200 text-xs font-sans uppercase tracking-wider font-semibold hover:bg-amber-400/10 transition"
                >
                  🏆 All Events
                </Link>
                {hackathonUser ? (
                  <>
                    <Link
                      to={hackathonUser.role === "admin" ? "/Hackathon/admin" : "/Hackathon/dashboard"}
                      className="px-4 py-2 rounded-full font-bold uppercase tracking-wider bg-amber-400 text-stone-950 hover:bg-amber-300 transition shadow-md border border-amber-300 cursor-pointer"
                    >
                      Dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={() => void logout()}
                      className="px-4 py-2 rounded-full font-bold uppercase tracking-wider border border-amber-500/30 bg-stone-900/80 text-stone-200 hover:text-rose-400 hover:border-rose-500/30 transition cursor-pointer"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to={`/Hackathon/login?redirect=${encodeURIComponent(location.pathname)}`}
                    className="px-5 py-2 rounded-full font-bold uppercase tracking-wider border border-amber-500/30 bg-stone-900/80 text-amber-300 hover:bg-amber-400/10 transition cursor-pointer"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {registrationClosed ? (
        <div className="relative z-40 bg-amber-500/20 border-b border-amber-500/30 text-amber-200 text-center text-xs font-sans uppercase tracking-wider px-4 py-2.5 backdrop-blur-md">
          {registrationClosedMessage || "Registration is closed."}
        </div>
      ) : null}

      {mobileNavOpen ? (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm" onClick={() => setMobileNavOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[min(100%,320px)] bg-white border-l border-gray-200 shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <span className="font-extrabold text-gray-900">Menu</span>
              <button
                type="button"
                className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-900 hover:bg-gray-100"
                aria-label="Close menu"
                onClick={() => setMobileNavOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex flex-col p-4 gap-1 text-base font-semibold">
              <button type="button" className="text-left px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100" onClick={() => closeAndScroll("event")}>
                Event
              </button>
              <button type="button" className="text-left px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100" onClick={() => closeAndScroll("schedule")}>
                Schedule
              </button>
              <button type="button" className="text-left px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100" onClick={() => closeAndScroll("outcomes")}>
                Outcomes
              </button>
              <button type="button" className="text-left px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100" onClick={() => closeAndScroll("benefits")}>
                Benefits
              </button>
              <button type="button" className="text-left px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100" onClick={() => closeAndScroll("about")}>
                About
              </button>
              <button type="button" className="text-left px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100" onClick={() => closeAndScroll("flow")}>
                Flow
              </button>
              <button type="button" className="text-left px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100" onClick={() => closeAndScroll("guidelines")}>
                Guidelines
              </button>
              <button type="button" className="text-left px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100" onClick={() => closeAndScroll("contact")}>
                Contact
              </button>
            </nav>
            <div className="mt-auto p-4 border-t border-gray-200 flex flex-col gap-2">
              <Link
                to="/Hackathon/login"
                className="w-full text-center px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 font-semibold hover:bg-gray-50"
                onClick={() => setMobileNavOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/Hackathon/register"
                className="w-full text-center px-4 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-extrabold"
                onClick={() => setMobileNavOpen(false)}
              >
                Register Now
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      {/* Hero */}
      <section id="event" className="relative z-10 pt-12 pb-14 md:pt-16 md:pb-20 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-amber-500/30 bg-stone-950/80 text-amber-200 text-xs font-sans uppercase tracking-[0.2em] shadow-xl">
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" />
              <span>{selectedHackathon?.organizedBy ? `Organized by ${selectedHackathon.organizedBy}` : "AICTE IDEA Lab – KCT Presents"}</span>
            </div>

            {selectedHackathon?.tagline && (
              <div className="mt-3 text-xs font-serif italic text-amber-300/90 tracking-wide">
                "{selectedHackathon.tagline}"
              </div>
            )}

            <p className="mt-4 text-[10px] sm:text-xs font-dancing tracking-widest text-amber-200/90 uppercase">{selectedHackathon?.venue || "KUMARAGURU COLLEGE OF TECHNOLOGY"}</p>

            <h1 className="mt-3 font-serif text-4xl sm:text-6xl md:text-7xl text-stone-100 uppercase tracking-widest leading-none font-normal">
              {selectedHackathon ? selectedHackathon.name : "Industry Connect Hackathon 2026"}
            </h1>

            {selectedHackathon?.status === "ended" || selectedHackathon?.slug === "ich2026" ? (
              <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-sans font-bold uppercase tracking-widest bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-lg">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <span>COMPETITION ENDED</span>
              </div>
            ) : null}

            {selectedHackathon?.inAssociationWith && (
              <p className="mt-2 text-xs font-sans text-stone-400">
                In association with <span className="text-stone-200 font-semibold">{selectedHackathon.inAssociationWith}</span>
              </p>
            )}

            <p className="mt-4 text-lg md:text-xl font-serif italic serene-gold-text">Build. Innovate. Implement.</p>

            <p className="mt-4 max-w-2xl text-stone-400 font-sans text-sm md:text-base font-light leading-relaxed">
              {selectedHackathon?.description || "Transform Ideas into Real-World Industrial Solutions"}
            </p>

            {/* Event Dates, Venue & Prizes Metadata Strip */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs font-sans">
              <div className="flex items-center gap-2 bg-stone-900/80 px-4 py-2.5 rounded-xl border border-amber-500/20 text-stone-300">
                <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                <span><strong className="text-amber-200 font-semibold uppercase tracking-wider text-[11px]">Dates:</strong> {formattedEventDate}</span>
              </div>
              <div className="flex items-center gap-2 bg-stone-900/80 px-4 py-2.5 rounded-xl border border-amber-500/20 text-stone-300">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span><strong className="text-amber-200 font-semibold uppercase tracking-wider text-[11px]">Venue:</strong> {selectedHackathon?.venue || "Kumaraguru College of Technology"}</span>
              </div>
              {selectedHackathon?.prizes && (
                <div className="flex items-center gap-2 bg-stone-900/80 px-4 py-2.5 rounded-xl border border-amber-500/20 text-stone-300">
                  <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                  <span><strong className="text-amber-200 font-semibold uppercase tracking-wider text-[11px]">Prizes:</strong> {selectedHackathon.prizes}</span>
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center w-full sm:w-auto font-sans text-xs">
              {isUserRegistered ? (
                <button
                  type="button"
                  onClick={handleRegisterClick}
                  className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 font-bold uppercase tracking-[0.2em] transition-all shadow-xl hover:shadow-amber-500/20 hover:scale-[1.03] cursor-pointer"
                >
                  Go to Workspace
                </button>
              ) : (
                <div className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold uppercase tracking-[0.2em] shadow-xl text-xs">
                  ⚠️ Registration Closed
                </div>
              )}
              {selectedHackathon?.problemStatementType === "custom" ? (
                <div className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-stone-900/90 border border-amber-500/30 text-amber-300 font-sans font-bold text-xs uppercase tracking-[0.2em]">
                  Personalized Problem Statements
                </div>
              ) : (
                <button
                  onClick={() => scrollToId("problem-statements-list")}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-stone-900/90 border border-amber-500/30 text-stone-200 hover:text-amber-300 hover:border-amber-400/50 font-sans font-bold text-xs uppercase tracking-[0.2em] transition-all shadow-lg cursor-pointer"
                >
                  <span>View Problem Statements</span> <ArrowRight className="w-4 h-4 text-amber-400" />
                </button>
              )}
            </div>

            <div className="mt-10 w-full max-w-4xl">
              {!isExpired && (
                <div className={`${cardBase} px-6 py-5 text-left mb-8`}>
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300">
                      <BriefcaseBusiness className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-serif text-xl uppercase tracking-wider text-stone-100 font-normal">Important Notice</div>
                      <div className="text-stone-400 text-xs font-sans mt-1 leading-relaxed">
                        A registration fee of <span className="font-bold text-amber-300 font-mono">₹500</span> per team must be paid
                        only after shortlisting of the submitted solution/abstract/design by the assigned mentor.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Problem Statements Cards Section (Visible only when event is expired AND not in custom problem mode) */}
              {isExpired && selectedHackathon?.problemStatementType !== "custom" && (
                <div id="problem-statements-list" className="w-full scroll-mt-24 text-center">
                  <div className="flex flex-col items-center justify-center mb-6">
                    <h2 className="font-serif text-2xl md:text-3xl font-normal text-stone-100 uppercase tracking-wider flex items-center justify-center gap-3">
                      <span>📋 Problem Statements</span>
                      <span className="text-xs font-sans font-bold px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        {problems.length} Available
                      </span>
                    </h2>
                    <p className="text-xs text-stone-400 font-sans mt-1">Industry challenges for {selectedHackathon?.name || "this Hackathon"}</p>
                  </div>

                  <div className="flex flex-wrap justify-center items-stretch gap-6 w-full max-w-5xl mx-auto">
                    {problems.map((p) => (
                      <div key={p.id} className={`${cardBase} p-6 flex flex-col justify-between items-center text-center hover:border-amber-400/40 transition-all w-full max-w-sm shrink-0`}>
                        <div className="flex flex-col items-center text-center w-full">
                          {p.sector && (
                            <span className="text-[10px] font-sans font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 mb-2">
                              {p.sector}
                            </span>
                          )}
                          <h3 className="font-serif text-lg text-amber-300 font-normal mt-2">{p.title}</h3>
                          <p className="text-xs text-stone-300 font-sans mt-2 line-clamp-3 leading-relaxed text-center">{p.description}</p>
                        </div>
                        {p.teamRegistrationLimit && (
                          <div className="mt-4 pt-3 border-t border-amber-500/20 text-[11px] text-stone-400 font-mono w-full text-center">
                            Registration Limit: {p.teamRegistrationLimit} teams
                          </div>
                        )}
                      </div>
                    ))}
                    {problems.length === 0 && (
                      <div className="w-full text-center py-8 serene-glass-card rounded-2xl border border-amber-500/20 text-stone-400 text-xs font-sans">
                        No problem statements published for this event yet.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <main className="relative z-10 pb-16 space-y-14 md:space-y-20">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="serene-gold-text text-xl md:text-2xl font-serif tracking-wider uppercase">
            Industry Challenges
            {" · "}
            <span className="text-stone-100 font-normal">Real-World Implementation</span>
            {" · "}
            <span className="text-stone-100 font-normal">Innovative Technology Development</span>
          </p>
        </section>

        {/* Expected Outcomes */}
        <section id="outcomes" className="max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-24">
          <h2 className="font-serif text-3xl md:text-4xl text-stone-100 uppercase tracking-widest text-left font-normal mb-8">Expected Outcomes</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Proof of Concept", body: "Proof of Concept (PoC)", Icon: Lightbulb },
              { title: "Knowledge Integration", body: "Knowledge Integration (KI)", Icon: Sparkles },
              { title: "Innovative Technology", body: "Innovative technology development", Icon: ShieldCheck },
            ].map(({ title, body, Icon }) => (
              <div key={title} className={`${cardBase} p-8`}>
                <div className="inline-flex p-3 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-300 mb-5">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-2xl text-stone-100 uppercase tracking-wide font-normal">{title}</h3>
                <p className="mt-2 text-stone-400 font-sans text-xs font-light leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Event Timeline */}
        <section id="schedule" className="max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-24">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl md:text-4xl text-stone-100 uppercase tracking-widest font-normal">Hackathon Day Schedule</h2>
            <p className="text-xs font-dancing text-amber-200/90 mt-1">Timeline of Innovation & Review</p>
          </div>
          {(() => {
            const schedule = selectedHackathon?.schedule && selectedHackathon.schedule.length > 0
              ? selectedHackathon.schedule
              : [
                  {
                    dayNum: "01",
                    date: "April 10, 2026",
                    title: "Prototype Development & Mentoring",
                    details: [
                      "Build and refine your prototype.",
                      "Follow technical guidance from mentors.",
                      "Improve your solution based on suggestions.",
                    ],
                  },
                  {
                    dayNum: "02",
                    date: "April 11, 2026",
                    title: "Final Review & Presentation",
                    details: [
                      "Final refinement of the solution.",
                      "Project presentation before the jury panel.",
                      "Demonstration of your PoC / Prototype.",
                    ],
                  },
                ];

            const isOdd = schedule.length % 2 !== 0;

            return (
              <div className="grid md:grid-cols-2 gap-6">
                {schedule.map((day, idx) => {
                  const dayNumStr = day.dayNum || String(idx + 1).padStart(2, "0");
                  const detailsList = Array.isArray(day.details)
                    ? day.details
                    : typeof day.details === "string"
                    ? day.details.split("\n")
                    : [];
                  const isLastAndOdd = isOdd && idx === schedule.length - 1;
                  return (
                    <div key={idx} className={`${cardBase} p-8 flex flex-col sm:flex-row gap-6 ${
                        isLastAndOdd ? "md:col-span-2 max-w-xl mx-auto w-full" : ""
                      }`}>
                      <div className="shrink-0 text-center sm:text-left">
                        <div className="text-5xl font-mono font-bold text-amber-400 leading-none">{dayNumStr}</div>
                        <div className="mt-2 text-xs font-sans uppercase font-bold tracking-widest text-amber-300">Day {idx + 1}</div>
                        {day.date && <div className="text-[11px] font-sans text-stone-400 mt-1">{day.date}</div>}
                      </div>
                      <div className="flex-1 space-y-4 text-left border-t sm:border-t-0 sm:border-l border-amber-500/15 sm:pl-6 pt-4 sm:pt-0">
                        <div>
                          <div className="font-serif text-2xl text-stone-100 uppercase tracking-wide">{day.title || `Day ${idx + 1}`}</div>
                          {detailsList.length > 0 && (
                            <ul className="mt-3 space-y-2 text-stone-400 font-sans text-xs font-light">
                              {detailsList.map((d, dIdx) => (
                                <li key={dIdx} className="flex items-start gap-2">
                                  <span className="text-amber-400">•</span>
                                  <span>{String(d).replace(/^•\s*/, "")}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </section>

        {/* How to Participate */}
        <section id="how" className="max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-24">
          <h2 className="font-serif text-3xl md:text-4xl text-stone-100 uppercase tracking-widest text-center font-normal mb-8">How to Participate</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { n: "01", title: "Register", text: "Create your account and complete the hackathon registration form." },
              { n: "02", title: "Choose Problem", text: "Select your preferred problem statement from the available industry challenges." },
              { n: "03", title: "Submit Solution", text: "Upload your abstract / proposed solution / design before the submission deadline." },
              { n: "04", title: "Shortlisting & Fee", text: "If shortlisted, you will receive confirmation and can complete the registration fee payment." },
              { n: "05", title: "Hackathon Day", text: "Join the hackathon event and present your solution before the jury." },
            ].map((c) => (
              <div
                key={c.title}
                className={`${cardBase} p-6 relative overflow-hidden ${
                  c.n === "05" ? "sm:col-span-2 lg:col-span-4 max-w-sm mx-auto w-full" : ""
                }`}
              >
                <div className="text-6xl font-mono font-bold text-amber-500/10 absolute -right-2 -top-2 select-none">{c.n}</div>
                <div className="relative z-10">
                  <div className="font-serif text-xl text-stone-100 uppercase tracking-wide">{c.title}</div>
                  <p className="mt-3 text-stone-400 font-sans text-xs font-light leading-relaxed">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Post Event Benefits */}
        <section id="benefits" className="max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-24">
          <div className="text-center mb-8">
            <h2 className="font-serif text-3xl md:text-4xl text-stone-100 uppercase tracking-widest font-normal">Post Event Benefits</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Awards & Cash Prizes", text: "Prize pool up to ₹60,000", Icon: Sparkles },
              { title: "Reimbursement", text: "Reimbursement for hardware MUP as per guidelines", Icon: BriefcaseBusiness },
              { title: "Industry Connect", text: "Direct mentorship with leading industry experts", Icon: Users },
              { title: "Real-world Impact", text: "Patent eligibility & incubation support", Icon: Building2 },
            ].map(({ title, text, Icon }) => (
              <div key={title} className={`${cardBase} p-6 text-center`}>
                <div className="inline-flex p-3 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-300 mx-auto mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="font-serif text-xl text-stone-100 uppercase tracking-wide">{title}</div>
                <p className="mt-2 text-stone-400 font-sans text-xs font-light leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* About */}
        <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-24">
          <div className={`${cardBase} p-8 md:p-10`}>
            <h2 className="font-serif text-3xl md:text-4xl text-stone-100 uppercase tracking-widest font-normal">About the Hackathon</h2>
            <p className="mt-4 text-stone-300 font-sans text-sm md:text-base font-light leading-relaxed max-w-3xl">
              {selectedHackathon?.description || "An exclusive platform connecting students with industries to solve real-time industry challenges."}
            </p>
            <div className="mt-6 pt-6 border-t border-amber-500/20 grid sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-sans">
              <div className="serene-glass-card p-4 rounded-xl border border-amber-500/20 flex items-start gap-3">
                <Building2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-amber-400 font-bold uppercase tracking-wider text-[10px]">Organized By</div>
                  <div className="text-stone-100 font-serif text-base mt-0.5">{selectedHackathon?.organizedBy || "AICTE IDEA Lab, KCT"}</div>
                </div>
              </div>
              <div className="serene-glass-card p-4 rounded-xl border border-amber-500/20 flex items-start gap-3">
                <Building2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-amber-400 font-bold uppercase tracking-wider text-[10px]">Venue</div>
                  <div className="text-stone-100 font-serif text-base mt-0.5">{selectedHackathon?.venue || "Kumaraguru College of Technology"}</div>
                </div>
              </div>
              {selectedHackathon?.prizes && (
                <div className="serene-glass-card p-4 rounded-xl border border-amber-500/20 flex items-start gap-3 sm:col-span-2 md:col-span-1">
                  <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-amber-400 font-bold uppercase tracking-wider text-[10px]">Prizes & Awards</div>
                    <div className="text-stone-100 font-serif text-base mt-0.5">{selectedHackathon.prizes}</div>
                  </div>
                </div>
              )}
            </div>

            {selectedHackathon?.themes && selectedHackathon.themes.length > 0 && (
              <div className="mt-6 pt-6 border-t border-amber-500/20">
                <h3 className="font-serif text-xl text-amber-300 uppercase tracking-wider mb-4 font-normal">Themes & Problem Domains</h3>
                <div className="flex flex-wrap gap-2.5">
                  {selectedHackathon.themes.map((theme, i) => (
                    <span key={i} className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs font-sans font-semibold">
                      🎯 {theme}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Flow */}
        <section id="flow" className="max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-24">
          <div className={`${cardBase} p-8 md:p-10`}>
            <h2 className="font-serif text-3xl md:text-4xl text-stone-100 uppercase tracking-widest font-normal mb-8">Hackathon Flow</h2>
            <div className="flex flex-col md:flex-row md:items-stretch gap-3">
              {[
                "Industry Problems",
                "Ideation",
                "PoC",
                "Prototype (MUP)",
                "Internships",
                "Industry Deployment",
              ].map((step, idx, arr) => (
                <React.Fragment key={step}>
                  <div className="min-w-0 flex-1 flex flex-col">
                    <div className="h-full serene-glass-card p-5 rounded-2xl border border-amber-500/20">
                      <div className="text-xs font-mono font-bold text-amber-400">{String(idx + 1).padStart(2, "0")}</div>
                      <div className="mt-2 font-serif text-lg text-stone-100 uppercase tracking-wide">{step}</div>
                    </div>
                  </div>
                  {idx < arr.length - 1 ? (
                    <div className="flex justify-center py-2 md:py-0 md:items-center shrink-0">
                      <ArrowRight className="w-4 h-4 text-amber-400 rotate-90 md:rotate-0" />
                    </div>
                  ) : null}
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>

        {/* Guidelines */}
        <section id="guidelines" className="max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-24">
          <div className={`${cardBase} p-8 md:p-10`}>
            <h2 className="font-serif text-3xl md:text-4xl text-stone-100 uppercase tracking-widest font-normal mb-6">Important Guidelines & Logistics</h2>

            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-6 py-4 mb-6">
              <div className="font-serif text-lg text-amber-300 uppercase tracking-wider">Registration Fee Rule</div>
              <div className="text-stone-300 font-sans text-xs mt-1 leading-relaxed">
                 A registration fee of ₹500 per team must be paid only after shortlisting of the submitted solution/abstract/design by the assigned mentor.
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="serene-glass-card p-6 rounded-2xl border border-amber-500/20">
                <div className="font-serif text-xl text-stone-100 uppercase tracking-wide flex items-center gap-2 mb-4">
                  <Building2 className="w-5 h-5 text-amber-400" />
                  Team & Competition Rules
                </div>
                <ul className="space-y-2 text-stone-400 font-sans text-xs font-light">
                  <li>• Team Size: 1 to 4 members</li>
                  <li>• Seed Money reimbursement for hardware MUP</li>
                  <li>• Prize Pool: {selectedHackathon?.prizes || "₹ 15,000"}</li>
                  <li>• Abstract must be submitted before deadline</li>
                </ul>
              </div>

              <div className="serene-glass-card p-6 rounded-2xl border border-amber-500/20">
                <div className="font-serif text-xl text-stone-100 uppercase tracking-wide mb-4">🍱 Refreshments</div>
                <p className="text-stone-300 font-sans text-xs font-light leading-relaxed">
                  {selectedHackathon?.refreshments || "Working lunch / refreshments will be provided on both demo days at KCT."}
                </p>
              </div>

              <div className="serene-glass-card p-6 rounded-2xl border border-amber-500/20">
                <div className="font-serif text-xl text-stone-100 uppercase tracking-wide mb-4">🪪 Required Documents</div>
                <div className="text-stone-300 font-sans text-xs font-light space-y-1.5">
                  <p className="text-amber-300 font-semibold mb-1">Each team member must carry for demo days:</p>
                  {(selectedHackathon?.requiredDocuments && selectedHackathon.requiredDocuments.length > 0
                    ? selectedHackathon.requiredDocuments
                    : ["College ID Card", "Bona-fide Letter"]
                  ).map((doc, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-amber-400 font-bold">✓</span>
                      <span>{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-24">
          <div className={`${cardBase} p-8 md:p-10`}>
            <h2 className="font-serif text-3xl md:text-4xl text-stone-100 uppercase tracking-widest font-normal mb-8">Contact & Coordinators</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Faculty Coordinators */}
              <div className="serene-glass-card p-6 rounded-2xl border border-amber-500/20">
                <div className="font-serif text-xl text-stone-100 uppercase tracking-wide mb-5 flex items-center gap-3">
                  <span className="w-9 h-9 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300 font-sans font-bold text-xs">
                    FC
                  </span>
                  Faculty Coordinators
                </div>
                <div className="space-y-4 font-sans text-xs">
                  {(
                    selectedHackathon?.coordinators?.facultyCoordinators?.length > 0
                      ? selectedHackathon.coordinators.facultyCoordinators
                      : [
                          { name: "Dr. S. Sasikala", email: "sasikala.s.ece@kct.ac.in" },
                          { name: "Dr. A. P. Arun", email: "arun.ap.mec@kct.ac.in" },
                        ]
                  ).map((fc, i) => (
                    <div key={i} className="p-4 rounded-xl bg-stone-900/80 border border-amber-500/20">
                      <div className="font-serif text-base text-stone-100 uppercase tracking-wider">{fc.name}</div>
                      {fc.email && <div className="text-amber-300/80 mt-0.5">{fc.email}</div>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Student Coordinators */}
              <div className="serene-glass-card p-6 rounded-2xl border border-amber-500/20">
                <div className="font-serif text-xl text-stone-100 uppercase tracking-wide mb-5 flex items-center gap-3">
                  <span className="w-9 h-9 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300 font-sans font-bold text-xs">
                    SC
                  </span>
                  Student Coordinators
                </div>
                <div className="space-y-4 font-sans text-xs">
                  {(
                    selectedHackathon?.coordinators?.studentCoordinators?.length > 0
                      ? selectedHackathon.coordinators.studentCoordinators
                      : [
                          { name: "M. Sriarunachaleeshwaran", phone: "+91 9361883441" },
                          { name: "S. Sanjith Krishna", phone: "+91 7339660186" },
                        ]
                  ).map((sc, i) => (
                    <div key={i} className="p-4 rounded-xl bg-stone-900/80 border border-amber-500/20">
                      <div className="font-serif text-base text-stone-100 uppercase tracking-wider">{sc.name}</div>
                      {sc.phone && <div className="text-amber-300/80 mt-0.5 font-mono">{sc.phone}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-amber-500/20 bg-stone-950/90 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans text-stone-500">
          <p>© {new Date().getFullYear()} AICTE IDEA Lab – Kumaraguru College of Technology. All rights reserved.</p>
          <div className="flex items-center gap-4 font-semibold text-stone-400 uppercase text-[11px]">
            <Link to="/" className="hover:text-amber-300 transition-colors">Main Site</Link>
            <Link to="/hackathon" className="hover:text-amber-300 transition-colors">Events Portal</Link>
          </div>
        </div>
      </footer>

      {/* Event Registration Confirmation Modal */}
      {showConfirmModal && selectedHackathon && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-fade-in">
          <div className="serene-glass-card rounded-3xl border border-amber-500/40 p-6 sm:p-8 max-w-lg w-full shadow-2xl relative text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mx-auto mb-4 text-amber-300">
              <Trophy className="w-8 h-8 text-amber-300" />
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl text-stone-100 uppercase tracking-wider font-normal">
              Confirm Registration
            </h3>

            <p className="mt-3 font-sans text-sm text-stone-300 font-light leading-relaxed">
              Are you willing to register for <strong className="text-amber-300 font-semibold">{selectedHackathon.name}</strong>?
            </p>

            <div className="mt-5 p-4 rounded-2xl bg-stone-900/90 border border-amber-500/20 text-left text-xs font-sans space-y-2.5">
              <div className="flex justify-between items-center text-stone-400">
                <span>Organized By:</span>
                <span className="text-stone-200 font-semibold">{selectedHackathon.organizedBy || "AICTE IDEA Lab, KCT"}</span>
              </div>
              <div className="flex justify-between items-center text-stone-400">
                <span>Event Dates:</span>
                <span className="text-amber-300 font-semibold">{formattedEventDate}</span>
              </div>
              <div className="flex justify-between items-center text-stone-400">
                <span>Venue:</span>
                <span className="text-stone-200 font-semibold">{selectedHackathon.venue || "Kumaraguru College of Technology"}</span>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3 justify-center">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-6 py-3 rounded-full border border-stone-700 bg-stone-900 text-stone-300 text-xs font-sans uppercase font-bold tracking-wider hover:bg-stone-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={registering}
                onClick={handleConfirmRegister}
                className="px-8 py-3 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 text-xs font-sans uppercase font-bold tracking-[0.2em] shadow-lg hover:brightness-110 transition cursor-pointer disabled:opacity-50"
              >
                {registering ? "Registering..." : "Yes, Register Me"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Login Required Modal (When Not Logged In) */}
      {showLoginPromptModal && selectedHackathon && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-fade-in">
          <div className="serene-glass-card rounded-3xl border border-amber-500/40 p-6 sm:p-8 max-w-lg w-full shadow-2xl relative text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mx-auto mb-4 text-amber-300">
              <LogIn className="w-8 h-8 text-amber-300" />
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl text-stone-100 uppercase tracking-wider font-normal">
              Login Required
            </h3>

            <p className="mt-3 font-sans text-sm text-stone-300 font-light leading-relaxed">
              You must log in to register for <strong className="text-amber-300 font-semibold">{selectedHackathon.name}</strong>.
            </p>

            <div className="mt-5 p-4 rounded-2xl bg-stone-900/90 border border-amber-500/20 text-left text-xs font-sans space-y-2.5">
              <div className="flex justify-between items-center text-stone-400">
                <span>Organized By:</span>
                <span className="text-stone-200 font-semibold">{selectedHackathon.organizedBy || "AICTE IDEA Lab, KCT"}</span>
              </div>
              <div className="flex justify-between items-center text-stone-400">
                <span>Event Dates:</span>
                <span className="text-amber-300 font-semibold">{formattedEventDate}</span>
              </div>
              <div className="flex justify-between items-center text-stone-400">
                <span>Venue:</span>
                <span className="text-stone-200 font-semibold">{selectedHackathon.venue || "Kumaraguru College of Technology"}</span>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3 justify-center">
              <button
                type="button"
                onClick={() => setShowLoginPromptModal(false)}
                className="px-6 py-3 rounded-full border border-stone-700 bg-stone-900 text-stone-300 text-xs font-sans uppercase font-bold tracking-wider hover:bg-stone-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProceedToLogin}
                className="px-8 py-3 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 text-xs font-sans uppercase font-bold tracking-[0.2em] shadow-lg hover:brightness-110 transition cursor-pointer"
              >
                Proceed to Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HackathonLanding;