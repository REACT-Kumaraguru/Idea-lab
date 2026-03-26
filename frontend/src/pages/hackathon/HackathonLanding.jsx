import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Lightbulb,
  Menu,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";

import IdeaLabLogo from "../../assets/idea-lab.png";
import KctLogo from "../../assets/kctlogo.png";

const scrollToId = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

const HackathonLanding = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const closeAndScroll = (id) => {
    setMobileNavOpen(false);
    setTimeout(() => scrollToId(id), 0);
  };

  const sectionShell =
    "rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_8px_40px_-12px_rgba(15,23,42,0.9),inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-300 hover:border-cyan-400/20 hover:shadow-[0_12px_48px_-8px_rgba(56,189,248,0.15)]";

  return (
    <div className="min-h-screen bg-[#030712] text-white relative overflow-x-hidden">
      {/* Background: gradient + grid + glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(56,189,248,0.18),transparent_50%),radial-gradient(ellipse_80%_50%_at_100%_50%,rgba(99,102,241,0.12),transparent),radial-gradient(ellipse_60%_40%_at_0%_80%,rgba(168,85,247,0.1),transparent)]" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: `linear-gradient(rgba(148,163,184,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.07) 1px, transparent 1px)`,
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse 80% 70% at 50% 30%, black, transparent)",
          }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(100%,1200px)] h-[520px] bg-[radial-gradient(closest-side,rgba(56,189,248,0.2),transparent)] blur-3xl opacity-60" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(closest-side,rgba(99,102,241,0.15),transparent)] blur-3xl opacity-50" />
      </div>

      {/* Header — glass navbar */}
      <header className="relative z-50 w-full sticky top-0">
        <div className="border-b border-white/10 bg-black/35 backdrop-blur-xl supports-[backdrop-filter]:bg-black/25 shadow-[0_4px_30px_-10px_rgba(0,0,0,0.5)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <img src={KctLogo} alt="Kumaraguru College of Technology" className="h-9 sm:h-10 w-auto object-contain shrink-0 drop-shadow-[0_0_12px_rgba(255,255,255,0.15)]" />
                <div className="h-8 w-px bg-gradient-to-b from-transparent via-white/25 to-transparent shrink-0" />
                <img src={IdeaLabLogo} alt="AICTE IDEA Lab" className="h-9 sm:h-10 w-auto object-contain shrink-0 drop-shadow-[0_0_12px_rgba(56,189,248,0.2)]" />
              </div>

              <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/85">
                <a className="relative hover:text-cyan-300 transition-colors duration-200 after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-cyan-400 after:transition-all hover:after:w-full" href="#about">
                  About
                </a>
                <a className="relative hover:text-cyan-300 transition-colors duration-200 after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-cyan-400 after:transition-all hover:after:w-full" href="#flow">
                  Flow
                </a>
                <a className="relative hover:text-cyan-300 transition-colors duration-200 after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-cyan-400 after:transition-all hover:after:w-full" href="#guidelines">
                  Guidelines
                </a>
                <a className="relative hover:text-cyan-300 transition-colors duration-200 after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-cyan-400 after:transition-all hover:after:w-full" href="#contact">
                  Contact
                </a>
              </nav>

              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <button
                  type="button"
                  className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white transition-all duration-200 hover:shadow-[0_0_20px_rgba(56,189,248,0.2)]"
                  aria-label="Open menu"
                  aria-expanded={mobileNavOpen}
                  onClick={() => setMobileNavOpen(true)}
                >
                  <Menu className="w-5 h-5" />
                </button>
                <Link
                  to="/ich2026/login"
                  className="hidden sm:inline-flex px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white font-semibold transition-all duration-200 hover:border-cyan-400/30 hover:shadow-[0_0_24px_rgba(56,189,248,0.15)]"
                >
                  Login
                </Link>
                <Link
                  to="/ich2026/register"
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-500 hover:from-cyan-300 hover:to-sky-400 text-slate-950 font-extrabold text-sm transition-all duration-300 shadow-[0_0_28px_rgba(34,211,238,0.4)] hover:shadow-[0_0_40px_rgba(34,211,238,0.55)]"
                >
                  Register
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {mobileNavOpen ? (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setMobileNavOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[min(100%,320px)] bg-slate-950/95 border-l border-white/10 shadow-2xl shadow-cyan-500/10 flex flex-col backdrop-blur-xl">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <span className="font-extrabold text-white tracking-tight">Menu</span>
              <button
                type="button"
                className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                aria-label="Close menu"
                onClick={() => setMobileNavOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex flex-col p-4 gap-1 text-base font-semibold">
              <button
                type="button"
                className="text-left px-4 py-3 rounded-xl text-white/90 hover:bg-white/10 transition-colors"
                onClick={() => closeAndScroll("about")}
              >
                About
              </button>
              <button
                type="button"
                className="text-left px-4 py-3 rounded-xl text-white/90 hover:bg-white/10 transition-colors"
                onClick={() => closeAndScroll("flow")}
              >
                Flow
              </button>
              <button
                type="button"
                className="text-left px-4 py-3 rounded-xl text-white/90 hover:bg-white/10 transition-colors"
                onClick={() => closeAndScroll("guidelines")}
              >
                Guidelines
              </button>
              <button
                type="button"
                className="text-left px-4 py-3 rounded-xl text-white/90 hover:bg-white/10 transition-colors"
                onClick={() => closeAndScroll("contact")}
              >
                Contact
              </button>
            </nav>
            <div className="mt-auto p-4 border-t border-white/10 flex flex-col gap-2">
              <Link
                to="/ich2026/login"
                className="w-full text-center px-4 py-3 rounded-xl border border-white/15 bg-white/5 text-white font-semibold hover:bg-white/10 transition-all"
                onClick={() => setMobileNavOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/ich2026/register"
                className="w-full text-center px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 font-extrabold shadow-[0_0_24px_rgba(34,211,238,0.35)]"
                onClick={() => setMobileNavOpen(false)}
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      {/* Hero */}
      <section className="relative z-10 pt-10 pb-16 md:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-400/25 bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 text-cyan-200 font-semibold text-sm shadow-[0_0_30px_rgba(34,211,238,0.12)]">
              <Sparkles className="w-4 h-4 text-cyan-300" />
              AICTE IDEA Lab – KCT Presents
            </div>

            <h1 className="mt-8 text-3xl sm:text-4xl md:text-6xl font-extrabold leading-[1.08] tracking-tight">
              <span className="text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.08)]">INDUSTRY INTEGRATED INNOVATION</span>
              <span className="block mt-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-indigo-300 to-fuchsia-300 [text-shadow:0_0_60px_rgba(56,189,248,0.3)]">
                INDUSTRY CONNECT – HACKATHON 2026
              </span>
            </h1>

            <p className="mt-6 max-w-3xl text-white/80 text-lg md:text-xl leading-relaxed">
              Transform Ideas into Real-World Industrial Solutions
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
              <Link
                to="/ich2026/register"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-sky-500 hover:from-cyan-300 hover:to-sky-400 text-slate-950 font-extrabold transition-all duration-300 shadow-[0_0_36px_rgba(34,211,238,0.45)] hover:shadow-[0_0_48px_rgba(34,211,238,0.6)] hover:scale-[1.02]"
              >
                Register Now
              </Link>
              <button
                onClick={() => scrollToId("guidelines")}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl border border-white/15 bg-white/[0.06] hover:bg-white/[0.1] text-white font-semibold transition-all duration-300 hover:border-cyan-400/35 hover:shadow-[0_0_28px_rgba(99,102,241,0.2)]"
              >
                View Guidelines <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-10 w-full max-w-3xl">
              <div className="rounded-2xl border border-amber-400/25 bg-gradient-to-br from-amber-500/10 to-yellow-500/5 px-5 py-4 text-left shadow-[0_8px_32px_-8px_rgba(250,204,21,0.15)]">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-2 rounded-xl bg-amber-400/15 border border-amber-400/20">
                    <BriefcaseBusiness className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <div className="font-extrabold text-amber-200">Important Notice</div>
                    <div className="text-white/80 text-sm mt-1 leading-relaxed">
                      Each team must pay <span className="font-bold text-white">₹500</span> registration fee.
                      Payment should be made only after the team and selected problem statement are approved by the admin.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="relative z-10 pb-20 space-y-12 md:space-y-16">
        {/* About */}
        <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-28">
          <div className={`${sectionShell} p-8 md:p-10`}>
            <div className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-cyan-400/90 mb-3">About</div>
            <h2 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              About the Hackathon
            </h2>
            <p className="mt-4 text-white/80 leading-relaxed text-lg max-w-3xl">
              An exclusive platform connecting students with industries to solve real-time industry challenges in the Digital and Manufacturing
              sectors.
            </p>
          </div>
        </section>

        {/* Flow */}
        <section id="flow" className="max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-28">
          <div className={`${sectionShell} p-8 md:p-10`}>
            <div className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-indigo-400/90 mb-3">Journey</div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">Hackathon Flow</h2>
            <div className="mt-8 flex flex-col md:flex-row md:items-stretch gap-0 md:gap-0">
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
                    <div className="group h-full rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-5 md:p-6 relative overflow-hidden transition-all duration-300 hover:border-cyan-400/30 hover:shadow-[0_0_32px_rgba(56,189,248,0.12)]">
                      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-cyan-500/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="text-xs font-bold uppercase tracking-wider text-cyan-300/90">{String(idx + 1).padStart(2, "0")}</div>
                      <div className="mt-3 font-extrabold text-white text-sm md:text-base leading-snug">{step}</div>
                    </div>
                  </div>
                  {idx < arr.length - 1 ? (
                    <div className="flex justify-center py-3 md:py-0 md:items-center md:px-1 shrink-0">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-white/5 text-cyan-400/90 shadow-[0_0_20px_rgba(56,189,248,0.15)]">
                        <ArrowRight className="w-5 h-5 rotate-90 md:rotate-0 transition-transform" />
                      </div>
                    </div>
                  ) : null}
                </React.Fragment>
              ))}
            </div>
            <div className="mt-6 text-white/55 text-sm leading-relaxed border-t border-white/10 pt-6">
              Follow each stage to transform your solution into deployment-ready innovation.
            </div>
          </div>
        </section>

        {/* Why Participate */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className={`${sectionShell} p-8 md:p-10`}>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">Why Participate?</h2>
            <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { icon: Lightbulb, title: "Industry Challenges", text: "Work on real industry problems." },
                { icon: Users, title: "Mentor Guidance", text: "Get guided by Industry & Academic Mentors." },
                { icon: Sparkles, title: "Build Solutions", text: "Build deployable solutions." },
                { icon: ShieldCheck, title: "Career Growth", text: "Gain hands-on experience." },
              ].map((c) => (
                <div
                  key={c.title}
                  className="group rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent p-6 transition-all duration-300 hover:border-indigo-400/35 hover:shadow-[0_12px_40px_-8px_rgba(99,102,241,0.25)]"
                >
                  <div className="inline-flex p-3 rounded-2xl bg-indigo-500/15 border border-indigo-400/20 text-cyan-300 shadow-[0_0_24px_rgba(99,102,241,0.2)] group-hover:scale-105 transition-transform duration-300">
                    <c.icon className="w-6 h-6" />
                  </div>
                  <div className="mt-4 font-extrabold text-white">{c.title}</div>
                  <div className="mt-2 text-white/70 text-sm leading-relaxed">{c.text}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Guidelines */}
        <section id="guidelines" className="max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-28">
          <div className={`${sectionShell} p-8 md:p-10`}>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">Guidelines</h2>

            <div className="mt-6 rounded-2xl border border-amber-400/25 bg-gradient-to-br from-amber-500/10 to-transparent px-5 py-4 shadow-[0_8px_32px_-8px_rgba(250,204,21,0.12)]">
              <div className="font-extrabold text-amber-200">Registration Fee Rule</div>
              <div className="text-white/80 text-sm mt-1 leading-relaxed">
                Each team must pay <span className="font-bold text-white">₹500</span>. Payment should be made only after the team and selected problem statement are
                approved by the admin.
              </div>
            </div>

            <div className="mt-8 grid lg:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-500/5 to-transparent p-6 md:p-8 transition-all duration-300 hover:border-cyan-400/25 hover:shadow-[0_8px_32px_-8px_rgba(56,189,248,0.15)]">
                <div className="font-extrabold text-white flex items-center gap-3">
                  <span className="inline-flex p-2 rounded-xl bg-cyan-500/15 border border-cyan-400/20">
                    <Building2 className="w-5 h-5 text-cyan-300" />
                  </span>
                  Team & Competition Rules
                </div>
                <ul className="mt-5 space-y-2 text-white/80 text-sm">
                  <li>• Team Size: Maximum 4 members</li>
                  <li>• Seed Money reimbursement for hardware MUP</li>
                  <li>• Prize upto ₹60,000</li>
                  <li>• Real industry problem statements</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-fuchsia-500/5 to-transparent p-6 md:p-8 transition-all duration-300 hover:border-fuchsia-400/25 hover:shadow-[0_8px_32px_-8px_rgba(192,38,211,0.12)]">
                <div className="font-extrabold text-white">Opportunities</div>
                <ul className="mt-4 space-y-2 text-white/80 text-sm">
                  <li>• Industry Internship</li>
                  <li>• Patent eligibility</li>
                </ul>

                <div className="mt-5 text-white/55 text-xs leading-relaxed border-t border-white/10 pt-5">
                  Submit PoC/Prototype as per selected problem flow. Final decisions are subject to admin review.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Outcomes */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className={`${sectionShell} p-8 md:p-10`}>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">Expected Outcomes</h2>
            <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { label: "Proof of Concept (PoC)", Icon: Lightbulb },
                { label: "Knowledge Integration (KI)", Icon: Sparkles },
                { label: "Real-world implementation", Icon: Building2 },
                { label: "Innovative technology development", Icon: ShieldCheck },
              ].map(({ label, Icon }) => (
                <div
                  key={label}
                  className="group rounded-2xl border border-white/10 bg-gradient-to-b from-violet-500/10 to-transparent p-6 transition-all duration-300 hover:border-violet-400/35 hover:shadow-[0_12px_40px_-8px_rgba(139,92,246,0.2)]"
                >
                  <div className="inline-flex p-3 rounded-2xl bg-violet-500/15 border border-violet-400/25 text-violet-200 mb-4 group-hover:shadow-[0_0_28px_rgba(139,92,246,0.35)] transition-shadow duration-300">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-white/55 text-xs font-semibold uppercase tracking-wider">Outcome</div>
                  <div className="mt-2 font-extrabold text-white text-sm md:text-base leading-snug">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Who can participate */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className={`${sectionShell} p-8 md:p-10`}>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">Who Can Participate</h2>
            <p className="mt-4 text-white/80 leading-relaxed text-lg max-w-3xl">
              All UG & PG students interested in Innovation, Product Development, Industry Solutions.
            </p>

            <div className="mt-8 grid md:grid-cols-2 gap-5">
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-500/10 to-transparent p-6 md:p-8 transition-all duration-300 hover:border-emerald-400/30">
                <div className="text-white/55 text-xs font-semibold uppercase tracking-wider">Venue</div>
                <div className="mt-2 font-extrabold text-white text-lg">Kumaraguru College of Technology</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-sky-500/10 to-transparent p-6 md:p-8 transition-all duration-300 hover:border-sky-400/30">
                <div className="text-white/55 text-xs font-semibold uppercase tracking-wider">Date</div>
                <div className="mt-2 font-extrabold text-white text-lg">10th and 11th April 2026</div>
              </div>
            </div>
          </div>
        </section>

        {/* Organized by */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-indigo-600/20 via-cyan-600/15 to-violet-600/20 backdrop-blur-xl p-8 md:p-10 text-center shadow-[0_12px_48px_-12px_rgba(99,102,241,0.35)]">
            <div className="text-white/70 text-xs font-bold uppercase tracking-[0.25em]">ORGANIZED BY</div>
            <div className="mt-3 text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-white via-cyan-100 to-indigo-200 bg-clip-text text-transparent">
              AICTE IDEA Lab, KCT
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-28">
          <div className={`${sectionShell} p-8 md:p-10`}>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">Contact</h2>
            <div className="mt-8 grid md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent p-6 md:p-8 transition-all duration-300 hover:border-cyan-400/25">
                <div className="font-extrabold text-white text-lg mb-6 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400/30 to-indigo-500/30 border border-white/15 text-sm font-bold text-white shadow-[0_0_20px_rgba(56,189,248,0.2)]">
                    FC
                  </span>
                  Faculty Coordinators
                </div>
                <div className="space-y-5 text-white/80 text-sm">
                  <div className="rounded-xl border border-white/5 bg-black/20 p-4 hover:border-white/15 transition-colors">
                    <div className="font-semibold text-white">Dr. S. Sasikala</div>
                    <div className="text-white/70 mt-1">sasikala.s.ece@kct.ac.in</div>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-black/20 p-4 hover:border-white/15 transition-colors">
                    <div className="font-semibold text-white">Dr. A. P. Arun</div>
                    <div className="text-white/70 mt-1">arun.ap.mec@kct.ac.in</div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent p-6 md:p-8 transition-all duration-300 hover:border-indigo-400/25">
                <div className="font-extrabold text-white text-lg mb-6 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400/30 to-fuchsia-500/30 border border-white/15 text-sm font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                    SC
                  </span>
                  Student Coordinators
                </div>
                <div className="space-y-5 text-white/80 text-sm">
                  <div className="rounded-xl border border-white/5 bg-black/20 p-4 hover:border-white/15 transition-colors">
                    <div className="font-semibold text-white">M. Sriarunachaleeshwaran - +91 9361883441
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-black/20 p-4 hover:border-white/15 transition-colors">
                    <div className="font-semibold text-white">S. Sanjith Krishna - +91 7339660186</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-gradient-to-b from-slate-950 via-indigo-950/40 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-14">
          <div className="text-sm text-white/75">
            AICTE IDEA Lab – KCT
            <div className="text-white/60 mt-2">Hackathon 2026</div>
            <div className="text-white/45 mt-3 text-xs tracking-wide">All rights reserved</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HackathonLanding;
