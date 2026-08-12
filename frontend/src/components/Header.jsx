import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import IdeaLabLogo from "../assets/idea-lab.png";
import KctLogo from "../assets/kctlogo.png";
import { Link } from "react-router-dom";


const sections = ["about", "facilities", "activities", "benefits","People", "contact"];

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
            <div className="flex items-center gap-3">
              {/* KCT LOGO */}
              <img
                src={KctLogo}
                alt="Kumaraguru College of Technology"
                className={`object-contain transition-all duration-300 filter brightness-110 ${
                  scrolled ? "w-12 h-12" : "w-14 h-14"
                }`}
              />

              {/* Divider */}
              <div className="h-6 w-px bg-amber-500/30" />

              {/* IDEA Lab Logo */}
              <img
                src={IdeaLabLogo}
                alt="AICTE IDEA Lab"
                className="w-10 h-10 object-contain filter drop-shadow-md"
              />

              {/* Text */}
              <div className="hidden sm:block ml-1">
                <h2 className="text-xs font-serif tracking-widest uppercase text-stone-100 font-semibold">
                  AICTE IDEA Lab
                </h2>
                <p className="text-[10px] font-dancing text-amber-200/90 tracking-wide">
                  Innovation Sanctuary
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {sections.map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-xs font-sans uppercase tracking-[0.2em] text-stone-300 hover:text-amber-300 transition-all duration-200 hover:scale-105"
                >
                  {item}
                </a>
              ))}
            </nav>

            {/* CTA + Mobile Menu */}
            <div className="flex items-center gap-3">
              <Link
                to="/hackathon"
                className="hidden sm:inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-stone-950 px-4 py-2 rounded-full text-xs font-sans uppercase font-bold tracking-widest shadow-lg shadow-amber-500/20 hover:brightness-110 hover:scale-105 transition duration-300"
              >
                🏆 Hackathon
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 border border-amber-400/50 bg-stone-900/90 text-amber-300 px-4 py-2 rounded-full text-xs font-sans uppercase font-bold tracking-widest hover:bg-amber-400/20 hover:border-amber-300 transition duration-300 shadow-md cursor-pointer"
              >
                Login
              </Link>

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
              w-[90%] bg-stone-950/95 backdrop-blur-2xl border border-amber-500/30
              rounded-2xl shadow-2xl z-40 p-6 text-center
            "
          >
            <nav className="flex flex-col gap-4">
              {sections.map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
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
              <div className="flex flex-col gap-3 pt-2">
                <Link
                  to="/hackathon"
                  onClick={() => setMenuOpen(false)}
                  className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-stone-950 py-3 rounded-full text-xs font-bold uppercase tracking-widest"
                >
                  🏆 Hackathon
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
