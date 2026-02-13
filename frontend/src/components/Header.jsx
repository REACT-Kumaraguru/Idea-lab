import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import IdeaLabLogo from "../assets/idea-lab.png";
import KctLogo from "../assets/kctlogo.png";
import { Link } from "react-router-dom";


const sections = ["about", "facilities", "activities", "benefits", "contact"];

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
          width: scrolled ? "92%" : "100%",
          paddingTop: scrolled ? "0.25rem" : "0.45rem",
          paddingBottom: scrolled ? "0.25rem" : "0.45rem",
          borderRadius: scrolled ? "9999px" : "0px",
          backdropFilter: scrolled ? "blur(18px)" : "blur(10px)",
          opacity: scrolled ? 0.95 : 1,
        }}

        transition={{ duration: 0.35, ease: "easeOut" }}
        className="
          fixed top-3 left-1/2 -translate-x-1/2 z-50
          bg-white/10 border border-white/20 shadow-lg
        "
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center justify-between">

            {/* Logos */}
          <div className="flex items-center gap-3">
            {/* KCT LOGO */}
            <img
              src={KctLogo}
              alt="Kumaraguru College of Technology"
              className={`object-contain transition-all duration-300 ${
                scrolled ? "w-14 h-14" : "w-18 h-18"
              }`}
            />

            {/* Divider */}
            <div className="h-6 w-px bg-slate-300/60" />

            {/* IDEA Lab Logo */}
            <img
              src={IdeaLabLogo}
              alt="AICTE IDEA Lab"
              className="w-12 h-12 object-contain"
            />

            {/* Text */}
            <div className="hidden sm:block ml-1">
              <h2 className="text-sm font-semibold text-slate-900">
                AICTE IDEA Lab
              </h2>
              <p className="text-[11px] text-slate-600">
                Innovation Hub
              </p>
            </div>
          </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {sections.map((item) => (
                <a
                  key={item}
                  href={`#${item}`}
                  className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors"
                >
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </a>
              ))}
            </nav>

            {/* CTA + Mobile Menu */}
            <div className="flex items-center gap-3">
              <Link
                to="/products"
                className="hidden sm:block bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-blue-700 transition"
              >
                Apply
              </Link>


              <button
                className="md:hidden text-slate-800 text-xl"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                ☰
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
              w-[90%] bg-white/90 backdrop-blur-xl
              rounded-2xl shadow-xl z-40 p-6
            "
          >
            <nav className="flex flex-col gap-4">
              {sections.map((item) => (
                <a
                  key={item}
                  href={`#${item}`}
                  onClick={() => setMenuOpen(false)}
                  className="text-slate-800 font-medium"
                >
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </a>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;