import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import IdeaLabLogo from "../assets/idea-lab.png";
import KctLogo from "../assets/kctlogo.png";
import { Link } from "react-router-dom";
import {
  Calendar,
  ChevronDown,
  Trophy,
  Handshake,
  GraduationCap
} from "lucide-react";

const sections = ["about", "facilities", "activities", "benefits", "People", "contact"];

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close Events dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setEventsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <motion.header
        animate={{
          width: scrolled ? "92%" : "98%",
          paddingTop: scrolled ? "0.35rem" : "0.6rem",
          paddingBottom: scrolled ? "0.35rem" : "0.6rem",
          borderRadius: scrolled ? "9999px" : "1rem",
          backdropFilter: scrolled ? "blur(20px)" : "blur(12px)",
          opacity: scrolled ? 0.96 : 1,
        }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="
          fixed top-3 left-1/2 -translate-x-1/2 z-50
          bg-stone-950/75 border border-amber-500/25 shadow-2xl shadow-black/80
        "
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-between">

            {/* Logos */}
            <Link to="/" className="flex items-center gap-3 group cursor-pointer">
              {/* KCT LOGO */}
              <img
                src={KctLogo}
                alt="Kumaraguru College of Technology"
                className={`object-contain transition-all duration-300 filter brightness-110 group-hover:scale-105 ${
                  scrolled ? "w-12 h-12" : "w-14 h-14"
                }`}
              />

              {/* Divider */}
              <div className="h-6 w-px bg-amber-500/30" />

              {/* IDEA Lab Logo */}
              <img
                src={IdeaLabLogo}
                alt="AICTE IDEA Lab"
                className="w-10 h-10 object-contain filter drop-shadow-md group-hover:scale-105 transition-transform"
              />

              {/* Text */}
              <div className="hidden sm:block ml-1">
                <h2 className="text-xs font-serif tracking-widest uppercase text-stone-100 font-semibold group-hover:text-amber-300 transition-colors">
                  AICTE IDEA Lab
                </h2>
                <p className="text-[10px] font-dancing text-amber-200/90 tracking-wide">
                  Innovation Sanctuary
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {sections.map((item) => (
                <a
                  key={item}
                  href={`/#${item.toLowerCase()}`}
                  className="text-xs font-sans uppercase tracking-[0.2em] text-stone-300 hover:text-amber-300 transition-all duration-200 hover:scale-105"
                >
                  {item}
                </a>
              ))}
            </nav>

            {/* CTA + Events Dropdown + Login + Mobile Menu */}
            <div className="flex items-center gap-3">

              {/* Events Dropdown Trigger */}
              <div className="relative hidden sm:block" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setEventsOpen(!eventsOpen)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-sans uppercase font-bold tracking-widest transition duration-300 cursor-pointer shadow-lg ${
                    eventsOpen
                      ? "bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-stone-950 shadow-amber-500/25 scale-105"
                      : "bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-stone-950 shadow-amber-500/20 hover:brightness-110 hover:scale-105"
                  }`}
                  aria-expanded={eventsOpen}
                  aria-haspopup="true"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Events</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${eventsOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu Card matching the user's design */}
                <AnimatePresence>
                  {eventsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 top-full mt-3 w-[390px] bg-stone-950/95 backdrop-blur-2xl border border-stone-800 rounded-2xl shadow-2xl shadow-black/90 p-2 z-50 text-left select-none"
                    >
                      {/* Header Item: Events (The main navigation item) + Parent page badge */}
                      <div className="flex items-center justify-between p-3 border-b border-stone-800/80 mb-1">
                        <Link
                          to="/events"
                          onClick={() => setEventsOpen(false)}
                          className="flex items-center gap-3 group/header hover:opacity-95 transition-opacity"
                        >
                          <div className="p-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-200">
                            <Calendar className="w-5 h-5 text-amber-300" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-stone-100 group-hover/header:text-amber-300 transition-colors">
                              Events
                            </div>
                            <div className="text-[11px] text-stone-400">
                              The main navigation item
                            </div>
                          </div>
                        </Link>
                        <Link
                          to="/events"
                          onClick={() => setEventsOpen(false)}
                          className="text-[11px] font-sans font-medium px-3 py-1 rounded-full bg-stone-900 border border-stone-700 text-stone-300 hover:text-amber-300 hover:border-amber-500/50 transition-colors"
                        >
                          Parent page
                        </Link>
                      </div>

                      {/* Dropdown Sub-Items */}
                      <div className="space-y-1">
                        {/* 1. Hackathons */}
                        <Link
                          to="/hackathon"
                          onClick={() => setEventsOpen(false)}
                          className="flex items-start gap-3.5 p-3 rounded-xl hover:bg-stone-900/90 transition-all group/item"
                        >
                          <div className="p-2.5 rounded-xl bg-sky-950/40 border border-sky-500/30 text-sky-400 group-hover/item:border-sky-400 group-hover/item:bg-sky-950/60 transition-colors shrink-0">
                            <Trophy className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-stone-100 group-hover/item:text-amber-300 transition-colors">
                              Hackathons
                            </div>
                            <div className="text-xs text-stone-400 leading-snug">
                              Hackathons and innovation challenges
                            </div>
                          </div>
                        </Link>

                        {/* 2. Outreach & Collaborations */}
                        <Link
                          to="/events/outreach"
                          onClick={() => setEventsOpen(false)}
                          className="flex items-start gap-3.5 p-3 rounded-xl hover:bg-stone-900/90 transition-all group/item"
                        >
                          <div className="p-2.5 rounded-xl bg-sky-950/40 border border-sky-500/30 text-sky-400 group-hover/item:border-sky-400 group-hover/item:bg-sky-950/60 transition-colors shrink-0">
                            <Handshake className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-stone-100 group-hover/item:text-amber-300 transition-colors">
                              Outreach & Collaborations
                            </div>
                            <div className="text-xs text-stone-400 leading-snug">
                              AtomQuest 2026 and external opportunities
                            </div>
                          </div>
                        </Link>

                        {/* 3. Workshops & Training */}
                        <Link
                          to="/events/workshops"
                          onClick={() => setEventsOpen(false)}
                          className="flex items-start gap-3.5 p-3 rounded-xl hover:bg-stone-900/90 transition-all group/item"
                        >
                          <div className="p-2.5 rounded-xl bg-sky-950/40 border border-sky-500/30 text-sky-400 group-hover/item:border-sky-400 group-hover/item:bg-sky-950/60 transition-colors shrink-0">
                            <GraduationCap className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-stone-100 group-hover/item:text-amber-300 transition-colors">
                              Workshops & Training
                            </div>
                            <div className="text-xs text-stone-400 leading-snug">
                              PCB design and fabrication programs conducted by KCT
                            </div>
                          </div>
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Login Button */}
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 border border-amber-400/50 bg-stone-900/90 text-amber-300 px-4 py-2 rounded-full text-xs font-sans uppercase font-bold tracking-widest hover:bg-amber-400/20 hover:border-amber-300 transition duration-300 shadow-md cursor-pointer"
              >
                Login
              </Link>

              {/* Mobile Hamburger Button */}
              <button
                className="md:hidden text-amber-300 text-2xl p-1"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? '✕' : '☰'}
              </button>
            </div>

          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="
              fixed top-20 left-1/2 -translate-x-1/2
              w-[90%] max-w-md bg-stone-950/95 backdrop-blur-2xl border border-amber-500/30
              rounded-2xl shadow-2xl z-40 p-6 text-center
            "
          >
            <nav className="flex flex-col gap-3">
              {sections.map((item) => (
                <a
                  key={item}
                  href={`/#${item.toLowerCase()}`}
                  onClick={() => setMenuOpen(false)}
                  className="text-stone-200 font-sans text-sm tracking-widest uppercase hover:text-amber-300 py-2 border-b border-white/5"
                >
                  {item}
                </a>
              ))}
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="text-amber-300 font-sans text-sm tracking-widest uppercase font-bold py-2 hover:text-amber-200"
              >
                Portal Login
              </Link>

              {/* Mobile Events List */}
              <div className="pt-2 text-left border-t border-stone-800">
                <div className="flex items-center justify-between px-2 py-1.5 mb-1">
                  <span className="text-[11px] font-serif uppercase tracking-widest text-amber-300">
                    Events
                  </span>
                  <Link
                    to="/events"
                    onClick={() => setMenuOpen(false)}
                    className="text-[10px] text-stone-400 hover:text-stone-200 underline"
                  >
                    Parent page
                  </Link>
                </div>

                <div className="flex flex-col gap-2">
                  <Link
                    to="/hackathon"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-start gap-3 p-2.5 rounded-xl bg-stone-900/80 border border-stone-800 hover:border-amber-500/40 text-stone-200"
                  >
                    <Trophy className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold">Hackathons</div>
                      <div className="text-[10px] text-stone-400 leading-tight">Hackathons and innovation challenges</div>
                    </div>
                  </Link>

                  <Link
                    to="/events/outreach"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-start gap-3 p-2.5 rounded-xl bg-stone-900/80 border border-stone-800 hover:border-amber-500/40 text-stone-200"
                  >
                    <Handshake className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold">Outreach & Collaborations</div>
                      <div className="text-[10px] text-stone-400 leading-tight">AtomQuest 2026 and external opportunities</div>
                    </div>
                  </Link>

                  <Link
                    to="/events/workshops"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-start gap-3 p-2.5 rounded-xl bg-stone-900/80 border border-stone-800 hover:border-amber-500/40 text-stone-200"
                  >
                    <GraduationCap className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold">Workshops & Training</div>
                      <div className="text-[10px] text-stone-400 leading-tight">PCB design and fabrication programs conducted by KCT</div>
                    </div>
                  </Link>
                </div>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
