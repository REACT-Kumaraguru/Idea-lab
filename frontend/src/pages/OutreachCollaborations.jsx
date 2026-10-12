import React, { useState, useMemo, useEffect } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import AmbientBackground from "../components/AmbientBackground";
import {
  Handshake,
  Calendar,
  Building2,
  ArrowRight,
  Search,
  Sparkles,
  ChevronLeft,
  CheckCircle2,
  Trophy,
  Users,
  Target,
  Rocket,
  ShieldCheck,
  Send,
  ExternalLink,
  MapPin,
  Clock,
  Award,
  Globe2,
  FileCheck,
  Briefcase,
  FileText,
  Lightbulb,
  Fan,
  Droplets,
  Zap
} from "lucide-react";
import IdeaLabLogo from "../assets/idea-lab.png";
import KctLogo from "../assets/kctlogo.png";

const ATOMQUEST_EVENT = {
  id: "atomquest-2026",
  slug: "atomquest2026",
  aliases: ["atomquest2026", "atomquest-2026", "atomquest"],
  name: "AtomQuest 2026 – National Open Innovation Championship",
  headline: "A National-Level Student Innovation Challenge by Atomberg Technologies Ltd.",
  category: "National Student Innovation Challenge",
  status: "active",
  statusLabel: "REGISTRATION OPEN",
  badgeColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  startDate: "2026-10-08",
  endDate: "2026-10-09",
  displayDate: "8 - 9 October 2026",
  internalRegDate: "8 October 2026",
  reviewDate: "9 October 2026",
  organizedBy: "Atomberg Technologies Ltd. & AICTE IDEA Lab, KCT",
  venue: "AICTE IDEA Lab, Kumaraguru College of Technology (KCT)",
  teamSize: "1 – 5 Students per team",
  prizePool: "₹2,00,000 (₹2 Lakhs)",
  registrationUrl:
    "https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=loKLa_-92EqTrYS8vzhC9XaCScQweT1Mith4IThPzdpUOVIxUFgxN0c0QUJQOVIzM1c0QU1JVlE5Sy4u",
  gradPartnersUrl: "https://gradpartners.in/e/AtomQuest-2026-339",
  description:
    "AICTE IDEA Lab, KCT invites student teams to participate in AtomQuest 2026, an innovation challenge by Atomberg Technologies to turn your ideas into real-world solutions.",
  longDescription:
    "AICTE IDEA Lab, KCT is inviting student teams to participate in AtomQuest 2026, an innovation challenge by Atomberg Technologies Ltd. Choose one track and develop an innovative solution / design from concept to a working prototype. Teams who develop the prototype will be provided with mentorship and technical support by AICTE IDEA Lab, KCT.",
  tracks: [
    {
      title: "Fan",
      badge: "Track 01",
      icon: <Fan className="w-5 h-5 text-amber-400" />,
      desc: "Develop an innovative solution/design related to a fan product."
    },
    {
      title: "Water Purifier",
      badge: "Track 02",
      icon: <Droplets className="w-5 h-5 text-sky-400" />,
      desc: "Develop an innovative solution/design for a water-purification product."
    },
    {
      title: "Mixer Grinder",
      badge: "Track 03",
      icon: <Zap className="w-5 h-5 text-amber-400" />,
      desc: "Develop an innovative solution/design for a mixer-grinder product."
    }
  ],
  importantDates: [
    {
      label: "Internal Registration Last Date",
      date: "8 October 2026",
      desc: "Submit your team details via Microsoft Forms before deadline."
    },
    {
      label: "Final Review & PPT Presentation",
      date: "9 October 2026",
      desc: "Initial scrutiny and mandatory PPT review at AICTE IDEA Lab, KCT."
    }
  ],
  highlights: [
    {
      title: "Team Size: 1 – 5 Students",
      desc: "Interdisciplinary teams welcomed across engineering branches.",
      icon: <Users className="w-4 h-4 text-amber-400" />
    },
    {
      title: "Open to UG, PG & Dual Degree",
      desc: "Eligible for all engineering and technical students.",
      icon: <Award className="w-4 h-4 text-amber-400" />
    },
    {
      title: "Total Prize Pool: ₹2,00,000",
      desc: "₹2 Lakhs in awards for top standing innovator teams.",
      icon: <Trophy className="w-4 h-4 text-amber-400" />
    },
    {
      title: "Pre-Placement Interviews (PPI)",
      desc: "PPI opportunities at Atomberg for the three podium teams.",
      icon: <Briefcase className="w-4 h-4 text-amber-400" />
    },
    {
      title: "Paid Internships & Full-Time Roles",
      desc: "Career opportunities for selected standout performers.",
      icon: <Rocket className="w-4 h-4 text-amber-400" />
    },
    {
      title: "Mentorship from Atomberg Engineers",
      desc: "Direct guidance and technical reviews from industry leaders.",
      icon: <Lightbulb className="w-4 h-4 text-amber-400" />
    }
  ],
  supportStatement:
    "AICTE IDEA Lab, KCT will provide mentorship and technical support to teams developing their prototypes.",
  pptRequirement:
    "The Final Review PPT must clearly present the individual participation, role, and contribution of each team member."
};

const OUTREACH_EVENTS = [ATOMQUEST_EVENT];

export default function OutreachCollaborations() {
  const location = useLocation();
  const navigate = useNavigate();
  const { eventSlug } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Read URL params or path on mount to auto-open event (/events/outreach/atomquest2026)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const querySlug = params.get("event") || params.get("id");
    const pathSlug = eventSlug || (location.pathname.toLowerCase().includes("atomquest") ? "atomquest2026" : "");
    const rawTarget = pathSlug || querySlug || "";
    const cleanTarget = rawTarget.toLowerCase().replace(/[^a-z0-9]/g, "");

    if (cleanTarget) {
      const match = OUTREACH_EVENTS.find((e) => {
        const cleanSlug = e.slug.toLowerCase().replace(/[^a-z0-9]/g, "");
        const cleanId = e.id.toLowerCase().replace(/[^a-z0-9]/g, "");
        const aliasMatch = e.aliases?.some(
          (a) => a.toLowerCase().replace(/[^a-z0-9]/g, "") === cleanTarget
        );
        return cleanSlug === cleanTarget || cleanId === cleanTarget || aliasMatch || cleanTarget.includes("atomquest");
      });
      if (match) setSelectedEvent(match);
    } else {
      setSelectedEvent(null);
    }
  }, [location.pathname, location.search, eventSlug]);

  const filteredEvents = useMemo(() => {
    return OUTREACH_EVENTS.filter((e) => {
      return (
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [searchQuery]);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    navigate(`/events/outreach/${event.slug || "atomquest2026"}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToGallery = () => {
    setSelectedEvent(null);
    navigate("/events/outreach");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cardBase =
    "serene-glass-card rounded-3xl border border-amber-500/25 transition-all duration-300 hover:border-amber-400/60 hover:shadow-2xl hover:shadow-amber-500/10";

  return (
    <div className="min-h-screen bg-[#0a0809] text-stone-100 relative overflow-x-hidden flex flex-col font-sans selection:bg-amber-400 selection:text-stone-950">
      <AmbientBackground height="fixed inset-0" />

      {/* ========================================================================= */}
      {/* 1. TOP HEADER                                                             */}
      {/* ========================================================================= */}
      <header className="relative z-50 w-full sticky top-0">
        <div className="border-b border-amber-500/20 bg-stone-950/85 backdrop-blur-xl shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <Link
                  to="/"
                  className="flex items-center gap-1.5 text-stone-300 hover:text-amber-300 transition-colors text-xs font-sans uppercase tracking-widest font-semibold mr-2"
                >
                  <ChevronLeft className="w-4 h-4 text-amber-400" />
                  <span>Main Portal</span>
                </Link>
                <div className="h-6 w-px bg-amber-500/20 shrink-0" />
                <div className="shrink-0 rounded-xl bg-stone-900 border border-amber-500/30 px-2 py-1.5 shadow-md">
                  <img
                    src={KctLogo}
                    alt="Kumaraguru College of Technology"
                    className="h-7 sm:h-8 w-auto max-h-8 object-contain block filter brightness-110"
                  />
                </div>
                <div className="h-7 w-px bg-amber-500/20 shrink-0" />
                <img
                  src={IdeaLabLogo}
                  alt="AICTE IDEA Lab"
                  className="h-8 sm:h-9 w-auto object-contain shrink-0"
                />
                <span className="hidden sm:inline font-serif text-stone-100 uppercase tracking-widest text-sm md:text-base whitespace-nowrap font-normal">
                  AICTE IDEA Lab
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN CONTENT                                                           */}
      {/* ========================================================================= */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16 w-full">
        {selectedEvent ? (
          /* ========================================================================= */
          /* EVENT DETAIL VIEW FOR ATOMQUEST 2026                                      */
          /* ========================================================================= */
          <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
            {/* Top Navigation & Breadcrumbs */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <button
                onClick={handleBackToGallery}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/30 bg-stone-900/90 text-amber-300 text-xs font-sans uppercase font-bold tracking-wider hover:bg-amber-400/10 hover:border-amber-400 transition cursor-pointer shadow-lg"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to Outreach Initiatives</span>
              </button>

              <div className="flex items-center gap-2 text-xs font-mono text-stone-400">
                <span className="text-amber-400 font-semibold">AICTE IDEA Lab</span>
                <span>/</span>
                <span>Collaborations</span>
                <span>/</span>
                <span className="text-stone-200 font-semibold">AtomQuest 2026</span>
              </div>
            </div>

            {/* Event Hero Card */}
            <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-stone-900/95 via-stone-950/95 to-[#140e10] p-6 sm:p-12 shadow-[0_20px_70px_rgba(0,0,0,0.7)] relative overflow-hidden">
              
              {/* Ambient Glowing Orbs */}
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Badges & Host Header */}
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-sans font-bold uppercase tracking-widest bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-md">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    {selectedEvent.statusLabel}
                  </span>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-wider bg-amber-400/10 text-amber-300 border border-amber-400/25">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>₹2 Lakhs Prize Pool</span>
                  </span>
                </div>

                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-900/80 border border-stone-800 text-xs font-mono text-stone-300">
                  <Building2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Atomberg Technologies × KCT</span>
                </div>
              </div>

              {/* Title & Tagline */}
              <div className="relative z-10">
                <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-stone-100 via-amber-100 to-amber-300 uppercase tracking-wide leading-tight mb-3">
                  {selectedEvent.name}
                </h1>

                <p className="font-dancing text-2xl sm:text-3xl text-amber-300/95 mb-6">
                  Innovate. Design. Build.
                </p>

                <p className="text-stone-300 font-sans text-sm sm:text-base leading-relaxed max-w-3xl mb-8 font-light">
                  {selectedEvent.longDescription}
                </p>
              </div>

              {/* Bento Metric Cards */}
              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                <div className="p-4 sm:p-5 rounded-2xl bg-stone-900/80 border border-amber-500/20 hover:border-amber-400/40 transition duration-300 flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-300 shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block mb-0.5">
                      Internal Reg Deadline
                    </span>
                    <span className="text-base font-semibold text-stone-100 block">
                      {selectedEvent.internalRegDate}
                    </span>
                    <span className="text-[11px] text-amber-400/80 block mt-0.5 font-light">
                      Via Microsoft Forms
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-stone-900/80 border border-sky-500/20 hover:border-sky-400/40 transition duration-300 flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-sky-400/10 border border-sky-400/20 text-sky-300 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block mb-0.5">
                      Final Review & PPT
                    </span>
                    <span className="text-base font-semibold text-stone-100 block">
                      {selectedEvent.reviewDate}
                    </span>
                    <span className="text-[11px] text-sky-400/80 block mt-0.5 font-light">
                      IDEA Lab presentation
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-stone-900/80 border border-emerald-500/20 hover:border-emerald-400/40 transition duration-300 flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-emerald-400/10 border border-emerald-400/20 text-emerald-300 shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block mb-0.5">
                      Team Structure
                    </span>
                    <span className="text-base font-semibold text-stone-100 block">
                      {selectedEvent.teamSize}
                    </span>
                    <span className="text-[11px] text-emerald-400/80 block mt-0.5 font-light">
                      Cross-dept teams allowed
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-950/40 via-stone-900/80 to-stone-900/80 border border-amber-400/40 shadow-lg flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 shrink-0">
                    <Trophy className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300/80 block mb-0.5">
                      Total Prize Pool
                    </span>
                    <span className="text-base font-bold text-amber-300 block">
                      {selectedEvent.prizePool}
                    </span>
                    <span className="text-[11px] text-stone-300 block mt-0.5 font-light">
                      + Atomberg PPI Opportunities
                    </span>
                  </div>
                </div>
              </div>

              {/* Interactive Tracks Section */}
              <div className="relative z-10 mb-12">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-400" />
                    <h3 className="font-serif text-2xl uppercase tracking-wider text-amber-200">
                      Challenge Tracks
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-stone-400 uppercase tracking-widest hidden sm:inline">
                    Select 1 Track for Team Project
                  </span>
                </div>
                <p className="text-xs text-stone-400 mb-6 font-light">
                  Choose one track and develop an innovative consumer solution / design from initial concept into a functional working hardware prototype:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Track 1: Fan */}
                  <div className="p-6 rounded-2xl bg-gradient-to-b from-sky-950/30 to-stone-900/90 border border-sky-500/30 hover:border-sky-400 transition-all duration-300 group hover:-translate-y-1 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/25 text-sky-400 group-hover:rotate-45 transition-transform duration-500">
                        <Fan className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-mono text-sky-300 font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-sky-950/80 border border-sky-800">
                        Track 01
                      </span>
                    </div>
                    <h4 className="font-serif text-2xl uppercase tracking-wide text-stone-100 mb-2 group-hover:text-sky-300 transition-colors">
                      Smart Ceiling Fan
                    </h4>
                    <p className="text-xs text-stone-300 leading-relaxed font-light mb-4">
                      Reinvent airflow dynamics, brushless BLDC motor energy efficiency, silent blade aerodynamics, and smart IoT control interfaces.
                    </p>
                    <div className="pt-3 border-t border-stone-800 flex items-center justify-between text-[11px] text-sky-400/90 font-mono">
                      <span>• BLDC Motor Drives</span>
                      <span>• Aero Design</span>
                    </div>
                  </div>

                  {/* Track 2: Water Purifier */}
                  <div className="p-6 rounded-2xl bg-gradient-to-b from-emerald-950/30 to-stone-900/90 border border-emerald-500/30 hover:border-emerald-400 transition-all duration-300 group hover:-translate-y-1 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 group-hover:scale-110 transition-transform duration-300">
                        <Droplets className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-mono text-emerald-300 font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-800">
                        Track 02
                      </span>
                    </div>
                    <h4 className="font-serif text-2xl uppercase tracking-wide text-stone-100 mb-2 group-hover:text-emerald-300 transition-colors">
                      Water Purifier
                    </h4>
                    <p className="text-xs text-stone-300 leading-relaxed font-light mb-4">
                      Create advanced domestic water purification with real-time water quality sensing, high water-recovery membranes, and compact form factor.
                    </p>
                    <div className="pt-3 border-t border-stone-800 flex items-center justify-between text-[11px] text-emerald-400/90 font-mono">
                      <span>• TDS Sensor Tech</span>
                      <span>• Zero-Waste</span>
                    </div>
                  </div>

                  {/* Track 3: Mixer Grinder */}
                  <div className="p-6 rounded-2xl bg-gradient-to-b from-amber-950/30 to-stone-900/90 border border-amber-500/30 hover:border-amber-400 transition-all duration-300 group hover:-translate-y-1 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 group-hover:scale-110 transition-transform duration-300">
                        <Zap className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-mono text-amber-300 font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-800">
                        Track 03
                      </span>
                    </div>
                    <h4 className="font-serif text-2xl uppercase tracking-wide text-stone-100 mb-2 group-hover:text-amber-300 transition-colors">
                      Mixer Grinder
                    </h4>
                    <p className="text-xs text-stone-300 leading-relaxed font-light mb-4">
                      Design high-torque motor innovations, active acoustic noise dampening, thermal dissipation, and fail-safe ergonomic locking mechanisms.
                    </p>
                    <div className="pt-3 border-t border-stone-800 flex items-center justify-between text-[11px] text-amber-400/90 font-mono">
                      <span>• Low-Noise Motor</span>
                      <span>• Thermal Safety</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AICTE IDEA Lab Prototype Support Sandbox */}
              <div className="relative z-10 mb-10 p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-amber-500/10 via-stone-900/80 to-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-xl">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
                    <Handshake className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-amber-200 font-serif text-lg tracking-wide uppercase font-semibold mb-1">
                      Prototype Development Support at AICTE IDEA Lab, KCT
                    </div>
                    <p className="text-stone-300 text-xs sm:text-sm font-light leading-relaxed max-w-2xl">
                      {selectedEvent.supportStatement} Registered student teams get access to rapid 3D printing, laser cutting, PCB fabrication bays, and continuous mentorship by IDEA Lab technical fellows.
                    </p>
                  </div>
                </div>
                <div className="px-4 py-2 rounded-xl bg-stone-950/80 border border-amber-500/25 text-amber-300 text-xs font-mono uppercase tracking-wider shrink-0 text-center">
                  Full Lab Access
                </div>
              </div>

              {/* PPT Presentation Requirement Callout */}
              <div className="relative z-10 mb-10 p-6 rounded-2xl bg-stone-900/70 border border-stone-800 flex items-start gap-4">
                <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 shrink-0 mt-0.5">
                  <FileText className="w-5 h-5 text-sky-400" />
                </div>
                <div className="text-xs">
                  <h4 className="font-semibold text-stone-100 text-sm uppercase tracking-wider mb-1 flex items-center gap-2">
                    <span>Mandatory PPT Requirement for Final Review (9 October 2026)</span>
                  </h4>
                  <p className="text-stone-300 leading-relaxed font-light mb-3">
                    {selectedEvent.pptRequirement}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-stone-400">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" /> Team roles & contributions
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" /> Engineering feasibility
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" /> Prototype fabrication roadmap
                    </span>
                  </div>
                </div>
              </div>

              {/* Career & Incentive Highlights */}
              <div className="relative z-10 mb-12">
                <h3 className="font-serif text-2xl uppercase tracking-wider text-amber-200 mb-5">
                  Career Incentives & Industry Perks
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  {selectedEvent.highlights.map((hl, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-stone-900/60 border border-stone-800 hover:border-amber-500/30 transition duration-300 flex items-start gap-3"
                    >
                      <div className="p-2 rounded-lg bg-stone-950 border border-stone-800 shrink-0 mt-0.5">
                        {hl.icon}
                      </div>
                      <div>
                        <h5 className="font-semibold text-stone-100 mb-0.5">{hl.title}</h5>
                        <p className="text-stone-400 font-light leading-snug">{hl.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Registration Action Hub */}
              <div className="relative z-10 rounded-2xl border border-amber-500/40 bg-gradient-to-b from-stone-950 to-[#0e090b] p-8 sm:p-10 text-center shadow-2xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-mono uppercase tracking-widest mb-4">
                  <Rocket className="w-4 h-4" />
                  <span>📢 Official Team Registration</span>
                </div>

                <h3 className="font-serif text-3xl sm:text-4xl uppercase tracking-wider text-stone-100 mb-3">
                  Register Your Team For AtomQuest 2026
                </h3>

                <p className="text-xs sm:text-sm text-stone-400 font-light max-w-xl mx-auto mb-8">
                  Internal registration closes on <strong>8 October 2026</strong>. Final Review PPT presentation will be held on <strong>9 October 2026</strong> at AICTE IDEA Lab, KCT.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-4">
                  <a
                    href={selectedEvent.registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 font-sans font-bold text-xs uppercase tracking-[0.2em] hover:brightness-110 transition-all shadow-xl hover:shadow-amber-500/30 hover:scale-105 cursor-pointer"
                  >
                    <span>Register Here (Microsoft Forms)</span>
                    <ExternalLink className="w-4 h-4 text-stone-950" />
                  </a>

                  <a
                    href={selectedEvent.gradPartnersUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-4 rounded-full border border-stone-700 bg-stone-900/80 text-stone-300 hover:text-amber-300 hover:border-amber-500/40 font-sans font-semibold text-xs uppercase tracking-wider transition-all"
                  >
                    <span>Official Portal (GradPartners)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="mt-8 pt-6 border-t border-stone-800/80 flex flex-wrap items-center justify-center gap-6 text-xs text-stone-400 font-mono">
                  <span>🚀 Solve</span>
                  <span>•</span>
                  <span>Innovate</span>
                  <span>•</span>
                  <span>Create Impact</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* SELECTION GALLERY                                                         */
          /* ========================================================================= */
          <>
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12">
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-amber-500/30 bg-stone-950/80 text-amber-200 text-xs font-sans uppercase tracking-[0.2em] shadow-xl">
                <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" />
                <span>AICTE IDEA Lab • Outreach & Collaborations</span>
              </div>

              <h1 className="mt-4 font-serif text-4xl sm:text-6xl text-stone-100 uppercase tracking-widest leading-none font-normal">
                Select Your <span className="serene-gold-text">Initiative</span>
              </h1>

              <p className="mt-3 text-stone-400 font-sans text-sm sm:text-base font-light leading-relaxed">
                AICTE IDEA Lab, KCT invites student teams to participate in AtomQuest 2026, an innovation challenge by Atomberg Technologies Ltd. to turn your ideas into real-world solutions.
              </p>

              {/* Search Box */}
              <div className="mt-8 relative max-w-md w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/70" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search AtomQuest 2026..."
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-stone-900/90 border border-amber-500/30 text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all shadow-xl"
                />
              </div>
            </div>

            {/* Event Cards Grid */}
            {filteredEvents.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-8 max-w-2xl mx-auto">
                {filteredEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className={`${cardBase} p-8 flex flex-col justify-between group hover:-translate-y-1 w-full`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-4 mb-5">
                        <div className="w-14 h-14 rounded-2xl bg-sky-400/10 border border-sky-400/30 flex items-center justify-center text-sky-300 shrink-0 group-hover:scale-110 transition-transform">
                          <Handshake className="w-7 h-7 text-sky-400" />
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-sans font-bold uppercase tracking-widest border ${evt.badgeColor}`}>
                          <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                          {evt.statusLabel}
                        </span>
                      </div>

                      <h2 className="font-serif text-2xl sm:text-3xl text-stone-100 group-hover:text-amber-300 transition-colors uppercase tracking-wide font-normal">
                        {evt.name}
                      </h2>

                      <p className="text-xs font-mono text-amber-400 uppercase tracking-widest mt-1 mb-3">
                        {evt.headline}
                      </p>

                      <p className="mt-3 text-xs font-sans text-stone-400 font-light leading-relaxed">
                        {evt.description}
                      </p>

                      {/* Tracks Summary */}
                      <div className="mt-5 p-3 rounded-xl bg-stone-900/60 border border-stone-800">
                        <div className="text-[10px] font-mono text-stone-400 uppercase tracking-wider mb-1.5">
                          Tracks (Choose One):
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <span className="px-2.5 py-1 rounded-lg bg-stone-950 border border-stone-800 text-stone-200 font-medium flex items-center gap-1.5">
                            <Fan className="w-3.5 h-3.5 text-amber-400" /> Fan
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-stone-950 border border-stone-800 text-stone-200 font-medium flex items-center gap-1.5">
                            <Droplets className="w-3.5 h-3.5 text-sky-400" /> Water Purifier
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-stone-950 border border-stone-800 text-stone-200 font-medium flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-amber-400" /> Mixer Grinder
                          </span>
                        </div>
                      </div>

                      <div className="mt-6 flex flex-col items-start gap-2.5 text-xs font-sans">
                        <div className="inline-flex items-center gap-2 bg-stone-900/80 px-3.5 py-2 rounded-xl border border-amber-500/20 text-stone-300">
                          <Calendar className="w-3.5 h-3.5 text-amber-400" />
                          <span>Internal Reg Deadline: <strong>8 October 2026</strong></span>
                        </div>
                        <div className="inline-flex items-center gap-2 bg-stone-900/80 px-3.5 py-2 rounded-xl border border-amber-500/20 text-stone-300">
                          <Trophy className="w-3.5 h-3.5 text-amber-400" />
                          <span>Prize Pool: <strong>₹2 Lakhs</strong> • Team Size: <strong>1–5</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-amber-500/15 flex items-center justify-between gap-4 font-sans text-xs">
                      <div className="text-stone-400 uppercase tracking-wider text-[11px] truncate max-w-[180px]">
                        Organizer: <span className="font-bold text-amber-300">Atomberg & KCT</span>
                      </div>

                      <button
                        onClick={() => handleSelectEvent(evt)}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 font-sans font-bold text-xs uppercase tracking-[0.2em] hover:brightness-110 transition-all shadow-lg hover:shadow-amber-500/20 hover:scale-[1.03] cursor-pointer"
                      >
                        <span>Select Event</span>
                        <ArrowRight className="w-4 h-4 text-stone-950" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 serene-glass-card rounded-3xl border border-amber-500/20 max-w-xl mx-auto shadow-2xl">
                <Handshake className="w-12 h-12 text-amber-400/50 mx-auto mb-3" />
                <h3 className="font-serif text-2xl uppercase tracking-wider text-stone-200">
                  No Initiatives Found
                </h3>
                <p className="text-xs font-sans text-stone-400 mt-1 font-light">
                  Try searching with another keyword.
                </p>
              </div>
            )}
          </>
        )}
      </main>

      {/* ========================================================================= */}
      {/* 3. FOOTER                                                                 */}
      {/* ========================================================================= */}
      <footer className="relative z-10 border-t border-amber-500/20 bg-stone-950/90 py-6 text-center text-xs font-sans tracking-wider text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 AICTE IDEA Lab – Kumaraguru College of Technology</p>
          <div className="flex items-center gap-4 font-semibold text-stone-400 uppercase text-[11px]">
            <Link to="/" className="hover:text-amber-300 transition-colors">
              Main Site
            </Link>
            <Link to="/events" className="hover:text-amber-300 transition-colors">
              Events Hub
            </Link>
            <Link to="/events/workshops" className="hover:text-amber-300 transition-colors">
              Workshops
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
