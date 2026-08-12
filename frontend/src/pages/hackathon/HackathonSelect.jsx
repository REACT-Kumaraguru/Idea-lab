import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { axiosInstance } from "../../lib/axios.js";
import { useHackathonAuthStore } from "../../store/useHackathonAuthStore.js";
import AmbientBackground from "../../components/AmbientBackground";
import {
  Trophy,
  Calendar,
  ArrowRight,
  Sparkles,
  Search,
  Building2,
  ChevronLeft,
  BriefcaseBusiness,
  CheckCircle2,
} from "lucide-react";
import IdeaLabLogo from "../../assets/idea-lab.png";
import KctLogo from "../../assets/kctlogo.png";

const DEFAULT_HACKATHONS = [
  {
    id: "ich2026",
    name: "IDEA LAB Hackathon 2026",
    description:
      "Transform your ideas into real-world industrial prototypes. Collaborate with mentors, solve industry problems, and win exciting prizes.",
    startDate: "2026-04-10",
    endDate: "2026-04-11",
    status: "active",
    problemStatementType: "predefined",
    category: "Hardware & Software",
  },
  {
    id: "airobotics2026",
    name: "AI & Robotics Challenge 2026",
    description:
      "Design intelligent automated systems and futuristic robotics solutions. Compete with top innovators across institutions.",
    startDate: "2026-05-15",
    endDate: "2026-05-16",
    status: "upcoming",
    problemStatementType: "custom",
    category: "AI & Robotics",
  },
];

const HackathonSelect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hackathonUser, logout } = useHackathonAuthStore();
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let isMounted = true;
    const fetchHackathons = async () => {
      try {
        const res = await axiosInstance.get("/ich2026/hackathons");
        const list = res.data?.hackathons || [];
        if (isMounted) {
          if (list.length > 0) {
            setHackathons(list);
          } else {
            setHackathons(DEFAULT_HACKATHONS);
          }
        }
      } catch (err) {
        console.error("Failed to load hackathons list:", err);
        if (isMounted) {
          setHackathons(DEFAULT_HACKATHONS);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHackathons();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredHackathons = useMemo(() => {
    const list = hackathons.filter(
      (h) =>
        h.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const checkEnded = (h) =>
      h.status === "ended" ||
      h.status === "completed" ||
      h.slug === "ich2026" ||
      String(h.id) === "1" ||
      h.name?.toLowerCase().includes("idea lab hackathon 2026");

    return [...list].sort((a, b) => {
      const aEnded = checkEnded(a);
      const bEnded = checkEnded(b);
      if (aEnded && !bEnded) return 1; // b (active) comes first
      if (!aEnded && bEnded) return -1; // a (active) comes first
      return Number(a.id) - Number(b.id);
    });
  }, [hackathons, searchQuery]);

  const getHackathonSlug = (h) => {
    if (h.slug) return h.slug;
    if (String(h.id) === "5" || h.name?.toLowerCase().includes("ai")) return "Ai";
    if (String(h.id) === "1" || h.name?.toLowerCase().includes("idea lab")) return "ich2026";
    return h.id || "ich2026";
  };

  const handleSelectHackathon = (h) => {
    const slug = getHackathonSlug(h);
    navigate(`/Hackathon/${slug}`);
  };

  const formatEventDate = (h) => {
    if (h?.startDate) {
      const d = new Date(h.startDate);
      if (!isNaN(d.getTime())) {
        const month = d.toLocaleDateString("en-US", { month: "long" });
        const day = d.getDate();
        const year = d.getFullYear();
        if (h.endDate) {
          const dEnd = new Date(h.endDate);
          if (!isNaN(dEnd.getTime())) {
            const monthEnd = dEnd.toLocaleDateString("en-US", { month: "long" });
            const dayEnd = dEnd.getDate();
            if (month === monthEnd) {
              return `${month} ${day} - ${dayEnd}, ${year}`;
            }
            return `${month} ${day} - ${monthEnd} ${dayEnd}, ${year}`;
          }
        }
        return `${month} ${day}, ${year}`;
      }
    }
    if (h?.schedule && Array.isArray(h.schedule) && h.schedule.length > 0) {
      const dates = h.schedule.map((s) => s.date).filter(Boolean);
      if (dates.length > 0) return dates.join(" - ");
    }
    return "Date TBA";
  };

  const cardBase =
    "serene-glass-card rounded-3xl border border-amber-500/25 transition-all duration-300 hover:border-amber-400/60 hover:shadow-2xl hover:shadow-amber-500/10";

  return (
    <div className="min-h-screen bg-[#0a0809] text-stone-100 relative overflow-x-hidden flex flex-col font-sans selection:bg-amber-400 selection:text-stone-950">
      <AmbientBackground height="fixed inset-0" />

      {/* Navbar matching HackathonLanding */}
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

              {/* Login / Dashboard / Logout Header Buttons */}
              <div className="flex items-center gap-2 shrink-0 font-sans text-xs">
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

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16 w-full">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-amber-500/30 bg-stone-950/80 text-amber-200 text-xs font-sans uppercase tracking-[0.2em] shadow-xl">
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" />
            <span>AICTE IDEA Lab • Hackathon Portal</span>
          </div>

          <h1 className="mt-4 font-serif text-4xl sm:text-6xl text-stone-100 uppercase tracking-widest leading-none font-normal">
            Select Your <span className="serene-gold-text">Hackathon</span>
          </h1>

          <p className="mt-3 text-stone-400 font-sans text-sm sm:text-base font-light leading-relaxed">
            Choose an active competition to access problem statements, event guidelines, project submission portals, and team registrations.
          </p>

          {/* Search Box */}
          <div className="mt-8 relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/70" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hackathons by title or theme..."
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-stone-900/90 border border-amber-500/30 text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all shadow-xl"
            />
          </div>
        </div>

        {/* Hackathon Cards Grid */}
        {loading ? (
          <div className="flex flex-wrap justify-center gap-8 max-w-5xl mx-auto">
            {[1, 2].map((n) => (
              <div
                key={n}
                className={`${cardBase} h-64 animate-pulse p-6 flex flex-col justify-between w-full md:w-[calc(50%-1rem)]`}
              >
                <div className="h-6 bg-stone-800 rounded w-3/4 mb-4" />
                <div className="h-16 bg-stone-900 rounded w-full mb-4" />
                <div className="h-10 bg-stone-800 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : filteredHackathons.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-8 max-w-5xl mx-auto">
            {filteredHackathons.map((h) => {
              const isEnded = h.status === "ended" || h.status === "completed" || h.slug === "ich2026" || String(h.id) === "1" || h.name?.toLowerCase().includes("idea lab hackathon 2026");
              return (
                <div
                  key={h.id}
                  className={`${cardBase} p-8 flex flex-col justify-between group hover:-translate-y-1 w-full md:w-[calc(50%-1rem)]`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-5">
                      <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0 group-hover:scale-110 transition-transform">
                        <Trophy className="w-7 h-7 text-amber-300" />
                      </div>
                      {isEnded ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-sans font-bold uppercase tracking-widest bg-rose-500/15 text-rose-300 border border-rose-500/30">
                          <span className="w-2 h-2 rounded-full bg-rose-400" />
                          COMPETITION ENDED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-sans font-bold uppercase tracking-widest bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          ACTIVE COMPETITION
                        </span>
                      )}
                    </div>

                    <h2 className="font-serif text-3xl text-stone-100 group-hover:text-amber-300 transition-colors uppercase tracking-wide font-normal">
                      {h.name}
                    </h2>

                    <p className="mt-3 text-xs font-sans text-stone-400 font-light leading-relaxed">
                      {h.description ||
                        "Transform Ideas into Real-World Industrial Solutions"}
                    </p>

                    <div className="mt-6 flex flex-col items-start gap-2.5 text-xs font-sans">
                      <div className="inline-flex items-center gap-2 bg-stone-900/80 px-3.5 py-2 rounded-xl border border-amber-500/20 text-stone-300">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        <span>{formatEventDate(h)}</span>
                      </div>
                      <div className="inline-flex items-center gap-2 bg-stone-900/80 px-3.5 py-2 rounded-xl border border-amber-500/20 text-stone-300" title="Organized By">
                        <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{h.organizedBy || "AICTE IDEA Lab, KCT"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-amber-500/15 flex items-center justify-between gap-4 font-sans text-xs">
                    <div className="text-stone-400 uppercase tracking-wider">
                      Registration Fee: <span className="font-bold font-mono text-amber-300 text-sm">₹500</span> / team
                    </div>

                    <button
                      onClick={() => handleSelectHackathon(h)}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 font-sans font-bold text-xs uppercase tracking-[0.2em] hover:brightness-110 transition-all shadow-lg hover:shadow-amber-500/20 hover:scale-[1.03] cursor-pointer"
                    >
                      <span>Select Event</span>
                      <ArrowRight className="w-4 h-4 text-stone-950" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 serene-glass-card rounded-3xl border border-amber-500/20 max-w-xl mx-auto shadow-2xl">
            <Trophy className="w-12 h-12 text-amber-400/50 mx-auto mb-3" />
            <h3 className="font-serif text-2xl uppercase tracking-wider text-stone-200">No Hackathons Found</h3>
            <p className="text-xs font-sans text-stone-400 mt-1 font-light">Try searching with another keyword or title.</p>
          </div>
        )}
      </main>

      {/* Footer matching HackathonLanding */}
      <footer className="relative z-10 border-t border-amber-500/20 bg-stone-950/90 py-6 text-center text-xs font-sans tracking-wider text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 AICTE IDEA Lab – Kumaraguru College of Technology</p>
          <div className="flex items-center gap-4 font-semibold text-stone-400 uppercase text-[11px]">
            <Link to="/" className="hover:text-amber-300 transition-colors">
              Main Site
            </Link>
            <Link to="/ich2026" className="hover:text-amber-300 transition-colors">
              Direct Portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HackathonSelect;
