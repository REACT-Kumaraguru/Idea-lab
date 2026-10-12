import React, { useState, useMemo, useEffect } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import AmbientBackground from "../components/AmbientBackground";
import {
  GraduationCap,
  Calendar,
  Building2,
  ArrowRight,
  Search,
  Sparkles,
  ChevronLeft,
  CheckCircle2,
  Cpu,
  Layers,
  Wrench,
  Flame,
  ShieldCheck,
  MonitorCheck,
  Clock,
  MapPin,
  Award,
  Zap,
  Users,
  X
} from "lucide-react";
import IdeaLabLogo from "../assets/idea-lab.png";
import KctLogo from "../assets/kctlogo.png";

const WORKSHOP_PROGRAMS = [
  {
    id: "pcb-design-fabrication",
    slug: "design_and_fabrication",
    aliases: [
      "design_and fabrication",
      "design_and%20fabrication",
      "design_and_fabrication",
      "design-and-fabrication",
      "pcb",
      "pcb-design-fabrication"
    ],
    name: "Design and Fabrication of Printed Circuit Board",
    tagline: "Turn your circuit ideas into working hardware! ⚡",
    category: "PCB Skilling Program 2026",
    status: "closed",
    statusLabel: "REGISTRATIONS CLOSED • COHORT FULL",
    badgeColor: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    startDate: "2026-10-13",
    endDate: "2026-10-15",
    displayDate: "13–15 October 2026",
    duration: "3 Days Hands-on Workshop",
    timing: "Full-Day Lab Sessions",
    organizedBy: "AICTE IDEA Lab, Kumaraguru College of Technology",
    venue: "IDEA Lab, Kumaraguru College of Technology",
    eligibility: "KCT students only",
    capacity: "Limited to 30 seats (All 30 Seats Filled)",
    fee: "Free / Supported by IDEA Lab for KCTians",
    slogan: "Design it. Fabricate it. Power it! 🔌",
    hashtags: [
      "#KCT",
      "#AICTEIDEALab",
      "#PCBDesign",
      "#SkillingProgram",
      "#HandsOnLearning",
      "#Electronics",
      "#SkillDevelopment"
    ],
    description:
      "Turn your circuit ideas into working hardware! Gain hands-on experience in schematic design, PCB layout, component selection, and PCB fabrication at AICTE IDEA Lab, KCT.",
    longDescription:
      "Join the Design and Fabrication of Printed Circuit Board skilling program and gain hands-on experience in schematic design, PCB layout, component selection, and physical PCB fabrication. Conducted at AICTE IDEA Lab, Kumaraguru College of Technology, this intensive 3-day cohort guides students from circuit schematic drafting all the way to a populated, tested, and working hardware board.",
    curriculum: [
      {
        step: "Phase 01",
        title: "Schematic Capture & EDA Workflow",
        desc: "Convert circuit concepts into formal EDA schematics, netlist generation, symbol assignment, and design rule checks."
      },
      {
        step: "Phase 02",
        title: "Component Selection & Footprints",
        desc: "Selecting passives and active ICs, understanding pitch tolerances, footprint libraries, and mechanical clearance."
      },
      {
        step: "Phase 03",
        title: "PCB Layout & Gerber Generation",
        desc: "Routing critical traces, copper planes, ground bounce mitigation, via sizing, and export of standard manufacturing Gerbers."
      },
      {
        step: "Phase 04",
        title: "Physical PCB Fabrication in IDEA Lab",
        desc: "Hands-on UV exposure/photolithography, chemical etching, CNC mechanical drilling, and copper track inspection."
      },
      {
        step: "Phase 05",
        title: "Assembly, Soldering & Board Power-On",
        desc: "Through-hole and SMD component placement, precision soldering, multimeter continuity validation, and benchtop testing."
      }
    ],
    equipment: [
      "AICTE IDEA Lab Precision PCB Milling & Etching Facility",
      "UV Photolithography & Film Exposure Units",
      "Precision CNC Drill & Isolation Spindles",
      "Temperature-Controlled Professional Soldering Bays",
      "Digital Multimeters & Regulated Bench Power Supplies",
      "Industry Standard EDA Software Tools"
    ],
    coordinators: [
      { name: "Dr. S. Sasikala", role: "Coordinator" },
      { name: "Dr. A. P. Arun", role: "Coordinator" },
      { name: "Dr. K. Anusha", role: "Co-Coordinator" },
      { name: "Dr. P. Maithili", role: "Co-Coordinator" }
    ],
    prerequisites: "Exclusively for KCT students. Basic knowledge of electronic circuits. Bring personal laptops for CAD sessions.",
    takeaways: [
      "Complete hands-on experience: Schematic Design ➔ PCB Layout ➔ Fabrication",
      "Manufacture and take home your own custom functional circuit board",
      "Authorized Skilling Program Certificate from AICTE IDEA Lab, KCT",
      "Mentorship and guidance from faculty coordinators throughout all 3 days"
    ]
  }
];

export default function WorkshopsTraining() {
  const location = useLocation();
  const navigate = useNavigate();
  const { workshopSlug } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);

  // Read URL query params or path on mount to auto-open workshop
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const querySlug = params.get("event") || params.get("id");
    const rawPath = decodeURIComponent(location.pathname.toLowerCase());
    const pathSlug = workshopSlug ? decodeURIComponent(workshopSlug.toLowerCase()) : "";
    const rawTarget = pathSlug || querySlug || "";
    const cleanTarget = rawTarget.toLowerCase().replace(/[^a-z0-9]/g, "");

    const isMatch =
      cleanTarget.includes("design") ||
      cleanTarget.includes("fabrication") ||
      cleanTarget.includes("pcb") ||
      rawPath.includes("design") ||
      rawPath.includes("fabrication") ||
      rawPath.includes("pcb");

    if (isMatch) {
      setSelectedWorkshop(WORKSHOP_PROGRAMS[0]);
    } else {
      setSelectedWorkshop(null);
    }
  }, [location.pathname, location.search, workshopSlug]);

  const categories = [
    { id: "all", label: "PCB Programs" }
  ];

  const filteredWorkshops = useMemo(() => {
    return WORKSHOP_PROGRAMS.filter((w) => {
      const matchesSearch =
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat =
        activeCategory === "all" || w.category === activeCategory;
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, activeCategory]);

  const handleSelectWorkshop = (ws) => {
    setSelectedWorkshop(ws);
    navigate(`/events/workshops/design_and_fabrication`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToGallery = () => {
    setSelectedWorkshop(null);
    navigate("/events/workshops");
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
      {/* 2. MAIN SELECTION VIEW OR SELECTED WORKSHOP DETAIL SANCTUARY              */}
      {/* ========================================================================= */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16 w-full">
        {selectedWorkshop ? (
          /* ========================================================================= */
          /* WORKSHOP DETAIL SANCTUARY (WHEN A PARTICULAR WORKSHOP IS SELECTED)        */
          /* ========================================================================= */
          <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
            {/* Top Navigation & Breadcrumbs */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <button
                onClick={handleBackToGallery}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/30 bg-stone-900/90 text-amber-300 text-xs font-sans uppercase font-bold tracking-wider hover:bg-amber-400/10 hover:border-amber-400 transition cursor-pointer shadow-lg"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to Workshops & Training</span>
              </button>

              <div className="flex items-center gap-2 text-xs font-mono text-stone-400">
                <span className="text-amber-400 font-semibold">AICTE IDEA Lab</span>
                <span>/</span>
                <span>Skilling 2026</span>
                <span>/</span>
                <span className="text-stone-200 font-semibold">PCB Fabrication</span>
              </div>
            </div>

            {/* Workshop Hero Card */}
            <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-stone-900/95 via-stone-950/95 to-[#15100d] p-6 sm:p-12 shadow-[0_20px_70px_rgba(0,0,0,0.7)] relative overflow-hidden">
              
              {/* Ambient Glowing Orbs */}
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Badges & Status Header */}
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-sans font-bold uppercase tracking-widest bg-rose-500/15 text-rose-300 border border-rose-500/30 shadow-md">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    {selectedWorkshop.statusLabel}
                  </span>

                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-wider bg-amber-400/10 text-amber-300 border border-amber-400/25">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>30 Seats Max (Filled)</span>
                  </span>
                </div>

                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-900/80 border border-stone-800 text-xs font-mono text-stone-300">
                  <Cpu className="w-3.5 h-3.5 text-amber-400" />
                  <span>Hardware & Circuit Engineering</span>
                </div>
              </div>

              {/* Title & Tagline */}
              <div className="relative z-10">
                <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-stone-100 via-amber-100 to-amber-300 uppercase tracking-wide leading-tight mb-3">
                  {selectedWorkshop.name}
                </h1>

                <p className="font-dancing text-2xl sm:text-3xl text-amber-300/95 mb-6">
                  {selectedWorkshop.tagline}
                </p>

                <p className="text-stone-300 font-sans text-sm sm:text-base leading-relaxed max-w-3xl mb-8 font-light">
                  {selectedWorkshop.longDescription}
                </p>
              </div>

              {/* Slogan Banner */}
              <div className="relative z-10 mb-8 p-4 sm:p-5 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-lg">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
                    <Zap className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-amber-200 font-serif text-xl tracking-wider uppercase font-semibold">
                      "{selectedWorkshop.slogan}"
                    </div>
                    <div className="text-stone-400 text-xs font-sans mt-0.5">
                      Hands-on PCB Skilling Program 2026 • AICTE IDEA Lab, Kumaraguru College of Technology
                    </div>
                  </div>
                </div>
                <span className="px-4 py-2 rounded-full text-xs font-sans font-bold uppercase tracking-wider bg-rose-500/15 text-rose-300 border border-rose-500/30 shrink-0">
                  Cohort Full
                </span>
              </div>

              {/* Bento Metric Cards */}
              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                <div className="p-4 sm:p-5 rounded-2xl bg-stone-900/80 border border-amber-500/20 hover:border-amber-400/40 transition duration-300 flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-300 shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block mb-0.5">
                      Program Dates
                    </span>
                    <span className="text-base font-semibold text-stone-100 block">
                      {selectedWorkshop.displayDate}
                    </span>
                    <span className="text-[11px] text-amber-400/80 block mt-0.5 font-light">
                      3 Days Intensive Labs
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-stone-900/80 border border-sky-500/20 hover:border-sky-400/40 transition duration-300 flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-sky-400/10 border border-sky-400/20 text-sky-300 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block mb-0.5">
                      Venue / Facility
                    </span>
                    <span className="text-base font-semibold text-stone-100 block">
                      IDEA Lab, KCT
                    </span>
                    <span className="text-[11px] text-sky-400/80 block mt-0.5 font-light">
                      PCB Clean-Room Facility
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-stone-900/80 border border-emerald-500/20 hover:border-emerald-400/40 transition duration-300 flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-emerald-400/10 border border-emerald-400/20 text-emerald-300 shrink-0">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block mb-0.5">
                      Eligibility
                    </span>
                    <span className="text-base font-semibold text-stone-100 block">
                      KCT Students Only
                    </span>
                    <span className="text-[11px] text-emerald-400/80 block mt-0.5 font-light">
                      Kumaraguru exclusive
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-rose-950/40 via-stone-900/80 to-stone-900/80 border border-rose-500/30 shadow-lg flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 shrink-0">
                    <Users className="w-5 h-5 text-rose-300" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-rose-300/80 block mb-0.5">
                      Cohort Limit
                    </span>
                    <span className="text-base font-bold text-rose-300 block">
                      30 / 30 Seats Full
                    </span>
                    <span className="text-[11px] text-stone-300 block mt-0.5 font-light">
                      First Come, First Served
                    </span>
                  </div>
                </div>
              </div>

              {/* 3-Day Technical Roadmap Flow */}
              <div className="relative z-10 mb-12 p-6 sm:p-7 rounded-2xl bg-stone-900/60 border border-stone-800 shadow-xl">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-amber-400" />
                    <h3 className="font-serif text-xl sm:text-2xl uppercase tracking-wider text-amber-200">
                      3-Day Hands-on Engineering Pipeline
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-amber-400 uppercase tracking-widest hidden sm:inline">
                    Schematic ➔ Layout ➔ Fabrication
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
                  <div className="p-5 rounded-xl bg-stone-950/80 border border-amber-500/25 hover:border-amber-400/50 transition">
                    <div className="text-amber-400 font-mono text-[11px] font-bold uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Step 01</span>
                      <span className="text-[10px] text-stone-400">Day 1</span>
                    </div>
                    <div className="text-sm font-semibold text-stone-100 mb-1.5">Schematic Capture & EDA Design</div>
                    <div className="text-stone-400 text-xs font-light leading-relaxed">
                      Circuit concepts drafting in KiCad/Altium, electrical rule checking (ERC), netlist creation, and custom footprint assignments.
                    </div>
                  </div>

                  <div className="p-5 rounded-xl bg-stone-950/80 border border-amber-500/25 hover:border-amber-400/50 transition">
                    <div className="text-amber-400 font-mono text-[11px] font-bold uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Step 02</span>
                      <span className="text-[10px] text-stone-400">Day 2</span>
                    </div>
                    <div className="text-sm font-semibold text-stone-100 mb-1.5">PCB Layout & Routing</div>
                    <div className="text-stone-400 text-xs font-light leading-relaxed">
                      Component placement, power planes, impedance trace geometry, design rule checks (DRC), and exporting Gerber manufacturing packages.
                    </div>
                  </div>

                  <div className="p-5 rounded-xl bg-stone-950/80 border border-amber-500/25 hover:border-amber-400/50 transition">
                    <div className="text-amber-400 font-mono text-[11px] font-bold uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Step 03</span>
                      <span className="text-[10px] text-stone-400">Day 3</span>
                    </div>
                    <div className="text-sm font-semibold text-stone-100 mb-1.5">Chemical & CNC Fabrication</div>
                    <div className="text-stone-400 text-xs font-light leading-relaxed">
                      UV photolithography exposure, chemical spray etching, CNC high-speed drilling, through-hole soldering, and oscilloscope bring-up.
                    </div>
                  </div>
                </div>
              </div>

              {/* Hands-on Curriculum Pipeline (Phases 1 to 5) */}
              <div className="relative z-10 mb-12">
                <h3 className="font-serif text-2xl uppercase tracking-wider text-amber-200 mb-6">
                  Detailed Technical Curriculum
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedWorkshop.curriculum.map((cur, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-stone-900/70 border border-stone-800 hover:border-amber-500/30 transition duration-300"
                    >
                      <div className="font-mono text-xs text-amber-400 font-bold mb-1">
                        {cur.step}
                      </div>
                      <h4 className="text-sm font-semibold text-stone-100 mb-2">
                        {cur.title}
                      </h4>
                      <p className="text-xs text-stone-400 leading-relaxed font-light">
                        {cur.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Machinery & Hardware Used */}
              <div className="relative z-10 mb-12">
                <h3 className="font-serif text-xl uppercase tracking-wider text-amber-200 mb-4">
                  Industrial Machinery & Software You Will Operate
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {selectedWorkshop.equipment.map((eq, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-stone-900/60 border border-stone-800 flex items-center gap-3 hover:border-amber-500/25 transition"
                    >
                      <Wrench className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="text-xs text-stone-200 font-medium">{eq}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Faculty Coordinators Showcase */}
              <div className="relative z-10 mb-12 p-6 rounded-2xl bg-stone-900/60 border border-stone-800 shadow-xl">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-serif text-xl uppercase tracking-wider text-amber-200 flex items-center gap-2">
                    <Users className="w-5 h-5 text-amber-400" /> Program Faculty Coordinators
                  </h3>
                  <span className="text-xs font-mono text-stone-400 uppercase tracking-widest hidden sm:inline">
                    IDEA Lab Mentors
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {selectedWorkshop.coordinators.map((c, cIdx) => (
                    <div
                      key={cIdx}
                      className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 hover:border-amber-500/30 transition flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300 font-serif font-bold text-sm shrink-0">
                        {c.name.split(" ")[1]?.[0] || "D"}
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase text-amber-400 block tracking-wider">
                          {c.role}
                        </span>
                        <span className="text-sm font-semibold text-stone-100 block">
                          {c.name}
                        </span>
                        <span className="text-[11px] text-stone-400 block font-light">
                          AICTE IDEA Lab, KCT
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prerequisites & Benefits */}
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 text-xs">
                <div className="p-6 rounded-2xl bg-stone-900/50 border border-stone-800 shadow-lg">
                  <h4 className="font-serif text-base uppercase text-stone-100 mb-2.5 font-normal flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400" /> Eligibility & Prerequisites
                  </h4>
                  <p className="text-stone-300 leading-relaxed font-light">{selectedWorkshop.prerequisites}</p>
                </div>

                <div className="p-6 rounded-2xl bg-stone-900/50 border border-stone-800 shadow-lg">
                  <h4 className="font-serif text-base uppercase text-stone-100 mb-2.5 font-normal flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" /> Key Takeaways
                  </h4>
                  <ul className="space-y-2 text-stone-300 font-light">
                    {selectedWorkshop.takeaways.map((tk, tIdx) => (
                      <li key={tIdx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>{tk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Cohort Full & Participant Reporting Announcement Box */}
              <div className="relative z-10 rounded-3xl border border-rose-500/35 bg-gradient-to-b from-stone-900/95 via-stone-950 to-[#0e0a0c] p-6 sm:p-10 shadow-2xl overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-sans font-bold uppercase tracking-widest bg-rose-500/15 text-rose-300 border border-rose-500/30 mb-3">
                      <span className="w-2 h-2 rounded-full bg-rose-400" />
                      Registrations Closed • 30/30 Seats Filled
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl uppercase tracking-wider text-stone-100">
                      Cohort Full — Registrations Concluded
                    </h3>
                  </div>
                  <div className="px-4 py-2 rounded-xl bg-stone-900/90 border border-stone-800 text-stone-400 text-xs font-mono">
                    Cohort Status: <span className="text-rose-300 font-bold">LOCKED</span>
                  </div>
                </div>

                <p className="text-stone-300 text-sm leading-relaxed mb-6 font-light">
                  All 30 seats for the <strong>13–15 October 2026</strong> cohort of the <em>Design and Fabrication of Printed Circuit Board</em> Skilling Program have been allocated on a first-come, first-served basis. Online and offline registrations are now officially closed.
                </p>

                <div className="p-4 sm:p-5 rounded-2xl bg-stone-950/80 border border-stone-800 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                  <div className="text-stone-400">
                    <span className="text-stone-200 font-semibold block mb-1">Notice for Admitted Participants</span>
                    Registered students should report to the <strong>IDEA Lab, Kumaraguru College of Technology</strong> on <strong>13 October 2026</strong>. Please bring your personal laptop and valid KCT student ID card.
                  </div>
                  <div className="text-right text-amber-300 font-mono text-[11px] shrink-0 bg-stone-900 px-3 py-1.5 rounded-lg border border-stone-800">
                    Venue: IDEA Lab, KCT
                  </div>
                </div>

                {/* Slogan & Hashtags Strip */}
                <div className="pt-6 border-t border-stone-800 flex flex-wrap items-center justify-between gap-4">
                  <div className="text-amber-300 font-serif text-lg tracking-wider">
                    "{selectedWorkshop.slogan}"
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {selectedWorkshop.hashtags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2.5 py-1 rounded-lg bg-stone-900 text-stone-400 text-[11px] font-mono border border-stone-800 hover:text-amber-300 transition"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* SELECTION GALLERY (MATCHING HACKATHONSELECT)                              */
          /* ========================================================================= */
          <>
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12">
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-amber-500/30 bg-stone-950/80 text-amber-200 text-xs font-sans uppercase tracking-[0.2em] shadow-xl">
                <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" />
                <span>AICTE IDEA Lab • Workshops & Training</span>
              </div>

              <h1 className="mt-4 font-serif text-4xl sm:text-6xl text-stone-100 uppercase tracking-widest leading-none font-normal">
                Select Your <span className="serene-gold-text">Workshop</span>
              </h1>

              <p className="mt-3 text-stone-400 font-sans text-sm sm:text-base font-light leading-relaxed">
                Explore the signature hands-on PCB design and fabrication masterclass conducted by KCT. Learn schematic drafting, UV photolithography, chemical etching, mechanical LPKF routing, and SMD reflow soldering.
              </p>

              {/* Search Box */}
              <div className="mt-8 relative max-w-md w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/70" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search PCB workshop..."
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-stone-900/90 border border-amber-500/30 text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all shadow-xl"
                />
              </div>
            </div>

            {/* Workshop Cards Grid */}
            {filteredWorkshops.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-8 max-w-2xl mx-auto">
                {filteredWorkshops.map((ws) => (
                  <div
                    key={ws.id}
                    className={`${cardBase} p-8 flex flex-col justify-between group hover:-translate-y-1 w-full`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-4 mb-5">
                        <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0 group-hover:scale-110 transition-transform">
                          <GraduationCap className="w-7 h-7 text-amber-300" />
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-sans font-bold uppercase tracking-widest border ${ws.badgeColor}`}>
                          <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                          {ws.statusLabel}
                        </span>
                      </div>

                      <h2 className="font-serif text-2xl sm:text-3xl text-stone-100 group-hover:text-amber-300 transition-colors uppercase tracking-wide font-normal">
                        {ws.name}
                      </h2>

                      <div className="mt-2 text-xs font-serif text-amber-300">
                        {ws.tagline}
                      </div>

                      <p className="mt-2.5 text-xs font-sans text-stone-400 font-light leading-relaxed">
                        {ws.description}
                      </p>

                      <div className="mt-6 flex flex-col items-start gap-2 text-xs font-sans">
                        <div className="inline-flex items-center gap-2 bg-stone-900/80 px-3.5 py-1.5 rounded-xl border border-amber-500/20 text-stone-300">
                          <Calendar className="w-3.5 h-3.5 text-amber-400" />
                          <span>{ws.displayDate}</span>
                        </div>
                        <div className="inline-flex items-center gap-2 bg-stone-900/80 px-3.5 py-1.5 rounded-xl border border-amber-500/20 text-stone-300" title="Venue">
                          <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>{ws.venue}</span>
                        </div>
                        <div className="inline-flex items-center gap-2 bg-stone-900/80 px-3.5 py-1.5 rounded-xl border border-amber-500/20 text-amber-300/90" title="Eligibility">
                          <GraduationCap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>{ws.eligibility}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-amber-500/15 flex items-center justify-between gap-4 font-sans text-xs">
                      <div className="text-stone-400 uppercase tracking-wider text-[11px] truncate max-w-[180px]">
                        Track: <span className="font-bold text-amber-300">{ws.category}</span>
                      </div>

                      <button
                        onClick={() => handleSelectWorkshop(ws)}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 font-sans font-bold text-xs uppercase tracking-[0.2em] hover:brightness-110 transition-all shadow-lg hover:shadow-amber-500/20 hover:scale-[1.03] cursor-pointer"
                      >
                        <span>Select Program</span>
                        <ArrowRight className="w-4 h-4 text-stone-950" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 serene-glass-card rounded-3xl border border-amber-500/20 max-w-xl mx-auto shadow-2xl">
                <GraduationCap className="w-12 h-12 text-amber-400/50 mx-auto mb-3" />
                <h3 className="font-serif text-2xl uppercase tracking-wider text-stone-200">
                  No Workshops Found
                </h3>
                <p className="text-xs font-sans text-stone-400 mt-1 font-light">
                  Try searching with another keyword or category filter.
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
            <Link to="/events/outreach" className="hover:text-amber-300 transition-colors">
              Outreach
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
