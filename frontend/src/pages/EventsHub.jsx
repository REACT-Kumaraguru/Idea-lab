import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AmbientBackground from "../components/AmbientBackground";
import {
  Calendar,
  Trophy,
  Handshake,
  GraduationCap,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Flame,
  CheckCircle2
} from "lucide-react";

export default function EventsHub() {
  const eventCategories = [
    {
      id: "hackathons",
      title: "Hackathons",
      subtitle: "Hackathons and innovation challenges",
      badge: "Flagship Competitions",
      icon: <Trophy className="w-8 h-8 text-amber-400" />,
      colorBorder: "border-amber-500/40",
      colorGlow: "from-amber-500/20 to-transparent",
      link: "/hackathon",
      desc: "Multi-tiered hackathons and 48-hour hardware innovation challenges solving industrial and societal problem statements.",
      features: [
        "ICH 2026 and national innovation marathons",
        "Direct IDEA Lab prototype sandbox access",
        "Cash awards, angel investment & patents"
      ],
      btnText: "Explore Hackathons"
    },
    {
      id: "outreach",
      title: "Outreach & Collaborations",
      subtitle: "AtomQuest 2026 and external opportunities",
      badge: "Partnership Ecosystem",
      icon: <Handshake className="w-8 h-8 text-sky-400" />,
      colorBorder: "border-sky-500/40",
      colorGlow: "from-sky-500/20 to-transparent",
      link: "/events/outreach",
      desc: "Flagship AtomQuest 2026 national innovation championship by Atomberg Technologies, prototype mentoring, and ecosystem tie-ups.",
      features: [
        "AtomQuest 2026 national challenge by Atomberg",
        "₹2 Lakhs prize pool (Fan, Water Purifier, Mixer Grinder)",
        "IDEA Lab prototype development & mentorship support"
      ],
      btnText: "View Outreach & Initiatives"
    },
    {
      id: "workshops",
      title: "Workshops & Training",
      subtitle: "PCB design and fabrication skilling program",
      badge: "Skill Certification",
      icon: <GraduationCap className="w-8 h-8 text-emerald-400" />,
      colorBorder: "border-emerald-500/40",
      colorGlow: "from-emerald-500/20 to-transparent",
      link: "/events/workshops",
      desc: "Hands-on engineering bootcamps utilizing industrial machinery at AICTE IDEA Lab, Kumaraguru College of Technology.",
      features: [
        "From circuit schematic to working hardware PCB",
        "EDA layout, UV photolithography, chemical etching & CNC drilling",
        "Exclusively for KCT students (30-seat cohort)"
      ],
      btnText: "Browse Workshops"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0809] text-stone-100 font-sans selection:bg-amber-400 selection:text-stone-950 relative overflow-x-hidden">
      <Header />
      <AmbientBackground height="h-[800px] top-0 inset-x-0" />

      {/* Hero */}
      <section className="relative pt-36 pb-20 px-6 max-w-7xl mx-auto z-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-900/90 border border-amber-500/30 text-amber-300 text-xs font-sans tracking-widest uppercase mb-6 shadow-md backdrop-blur-md">
          <Link to="/" className="hover:text-amber-200">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
          <span className="text-stone-300">Events Hub</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 text-amber-400 text-xs font-mono uppercase tracking-[0.25em] mb-3">
            <Calendar className="w-4 h-4" />
            <span>AICTE IDEA Lab • Programs, Challenges & Workshops</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-normal tracking-[0.08em] uppercase text-stone-100 drop-shadow-2xl mb-4">
            Events & <span className="serene-gold-text">Initiatives</span>
          </h1>

          <p className="font-dancing text-2xl sm:text-3xl text-amber-200/90 mb-6">
            The epicenter of innovation, skill building, and national championships
          </p>

          <p className="text-stone-400 font-sans text-sm sm:text-base font-light leading-relaxed max-w-2xl mx-auto mb-12">
            Explore our three core event pillars: competitive hackathons, regional outreach and collaborations, and hands-on fabrication workshops conducted at Kumaraguru College of Technology.
          </p>
        </motion.div>

        {/* The 3 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left mt-4">
          {eventCategories.map((item) => (
            <div
              key={item.id}
              className={`rounded-3xl border ${item.colorBorder} bg-gradient-to-b from-stone-900/80 to-stone-950/90 p-8 flex flex-col justify-between hover:scale-[1.02] transition-all duration-300 shadow-2xl relative overflow-hidden group`}
            >
              <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl ${item.colorGlow} rounded-full blur-2xl pointer-events-none`} />

              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider px-3 py-1 rounded-full bg-stone-900 border border-stone-700 text-stone-300">
                    {item.badge}
                  </span>
                </div>

                <h3 className="font-serif text-2xl uppercase tracking-wider text-stone-100 mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-amber-300/90 font-mono mb-4">
                  {item.subtitle}
                </p>

                <p className="text-stone-400 text-xs sm:text-sm leading-relaxed mb-6 font-light">
                  {item.desc}
                </p>

                <ul className="space-y-2 mb-8 text-xs text-stone-300">
                  {item.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                to={item.link}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:brightness-110 transition shadow-lg group-hover:shadow-amber-500/20"
              >
                <span>{item.btnText}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
