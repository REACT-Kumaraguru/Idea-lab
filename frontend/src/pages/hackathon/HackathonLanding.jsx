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

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Tunnel / futuristic background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(56,189,248,0.35),transparent_55%),radial-gradient(circle_at_20%_80%,rgba(99,102,241,0.25),transparent_50%),radial-gradient(circle_at_80%_75%,rgba(34,197,94,0.18),transparent_55%)]" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[1400px] h-[900px] bg-[conic-gradient(from_180deg_at_50%_50%,rgba(56,189,248,0.22),rgba(99,102,241,0.18),rgba(56,189,248,0.22))] blur-3xl opacity-50" />
        <div className="absolute left-1/2 -translate-x-1/2 top-10 w-[900px] h-[700px] bg-[radial-gradient(closest-side,rgba(56,189,248,0.35),transparent)] opacity-40 blur-xl" />
        {/* Perspective tunnel lines */}
        <div className="absolute inset-0 opacity-35">
          <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[900px] h-[900px] border border-white/10 rounded-[50%] rotate-0" />
          <div className="absolute left-1/2 -translate-x-1/2 top-24 w-[760px] h-[760px] border border-white/10 rounded-[50%]" />
          <div className="absolute left-1/2 -translate-x-1/2 top-48 w-[620px] h-[620px] border border-white/10 rounded-[50%]" />
          <div className="absolute left-1/2 -translate-x-1/2 top-72 w-[500px] h-[500px] border border-white/10 rounded-[50%]" />
        </div>
      </div>

      {/* Header */}
      <header className="relative z-10 w-full">
        <div className="max-w-7xl mx-auto px-4 pt-5">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src={KctLogo} alt="Kumaraguru College of Technology" className="h-10 w-auto object-contain" />
              <div className="h-8 w-px bg-white/20" />
              <img src={IdeaLabLogo} alt="AICTE IDEA Lab" className="h-10 w-auto object-contain" />
            </div>

            <nav className="hidden md:flex items-center gap-7 text-sm text-white/90">
              <a className="hover:text-cyan-300 transition" href="#about">
                About
              </a>
              <a className="hover:text-cyan-300 transition" href="#flow">
                Flow
              </a>
              <a className="hover:text-cyan-300 transition" href="#guidelines">
                Guidelines
              </a>
              <a className="hover:text-cyan-300 transition" href="#contact">
                Contact
              </a>
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white"
                aria-label="Open menu"
                aria-expanded={mobileNavOpen}
                onClick={() => setMobileNavOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </button>
              <Link
                to="/ich2026/login"
                className="hidden sm:inline-flex px-4 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white font-semibold transition"
              >
                Login
              </Link>
              <Link
                to="/ich2026/register"
                className="px-4 py-2 rounded-xl bg-cyan-500/95 hover:bg-cyan-500 text-black font-extrabold transition shadow-[0_0_30px_rgba(34,211,238,0.35)]"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </header>

      {mobileNavOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileNavOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[min(100%,320px)] bg-[#0a0f18] border-l border-white/10 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <span className="font-extrabold text-white">Menu</span>
              <button
                type="button"
                className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white"
                aria-label="Close menu"
                onClick={() => setMobileNavOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex flex-col p-4 gap-1 text-base font-semibold">
              <button
                type="button"
                className="text-left px-4 py-3 rounded-xl text-white/90 hover:bg-white/10"
                onClick={() => closeAndScroll("about")}
              >
                About
              </button>
              <button
                type="button"
                className="text-left px-4 py-3 rounded-xl text-white/90 hover:bg-white/10"
                onClick={() => closeAndScroll("flow")}
              >
                Flow
              </button>
              <button
                type="button"
                className="text-left px-4 py-3 rounded-xl text-white/90 hover:bg-white/10"
                onClick={() => closeAndScroll("guidelines")}
              >
                Guidelines
              </button>
              <button
                type="button"
                className="text-left px-4 py-3 rounded-xl text-white/90 hover:bg-white/10"
                onClick={() => closeAndScroll("contact")}
              >
                Contact
              </button>
            </nav>
            <div className="mt-auto p-4 border-t border-white/10 flex flex-col gap-2">
              <Link
                to="/ich2026/login"
                className="w-full text-center px-4 py-3 rounded-xl border border-white/15 bg-white/5 text-white font-semibold"
                onClick={() => setMobileNavOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/ich2026/register"
                className="w-full text-center px-4 py-3 rounded-xl bg-cyan-500/95 text-black font-extrabold"
                onClick={() => setMobileNavOpen(false)}
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      {/* Hero */}
      <section className="relative z-10 mt-8 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/5 text-cyan-200 font-semibold text-sm">
              <Sparkles className="w-4 h-4" />
              AICTE IDEA Lab – KCT Presents
            </div>

            <h1 className="mt-5 text-4xl md:text-6xl font-extrabold leading-[1.05] drop-shadow-[0_0_22px_rgba(56,189,248,0.35)]">
              INDUSTRY INTEGRATED INNOVATION
              <span className="block mt-3 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-indigo-300 to-emerald-300">
                INDUSTRY CONNECT – HACKATHON 2026
              </span>
            </h1>

            <p className="mt-5 max-w-3xl text-white/85 text-lg md:text-xl">
              Transform Ideas into Real-World Industrial Solutions
            </p>

            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Link
                to="/ich2026/register"
                className="px-7 py-3 rounded-2xl bg-cyan-500/95 hover:bg-cyan-400 text-black font-extrabold transition shadow-[0_0_30px_rgba(34,211,238,0.35)]"
              >
                Register Now
              </Link>
              <button
                onClick={() => scrollToId("guidelines")}
                className="px-7 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-semibold transition flex items-center justify-center gap-2"
              >
                View Guidelines <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Fee notice */}
            <div className="mt-6 w-full max-w-3xl">
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl px-5 py-4 text-left">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <BriefcaseBusiness className="w-5 h-5 text-yellow-300" />
                  </div>
                  <div>
                    <div className="font-extrabold text-yellow-200">Important Notice</div>
                    <div className="text-white/80 text-sm mt-1">
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

      {/* Content sections */}
      <main className="relative z-10 pb-16">
        {/* About */}
        <section id="about" className="max-w-7xl mx-auto px-4 mt-10">
          <div className="glass-card p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur">
            <h2 className="text-2xl md:text-3xl font-extrabold">About the Hackathon</h2>
            <p className="mt-3 text-white/80 leading-relaxed text-lg">
              An exclusive platform connecting students with industries to solve real-time industry challenges in the Digital and Manufacturing
              sectors.
            </p>
          </div>
        </section>

        {/* Flow */}
        <section id="flow" className="max-w-7xl mx-auto px-4 mt-10">
          <div className="glass-card p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur">
            <h2 className="text-2xl md:text-3xl font-extrabold">Hackathon Flow</h2>
            <div className="mt-6 flex flex-col md:flex-row md:items-stretch gap-4 overflow-x-auto md:overflow-visible">
              {[
                "Industry Problems",
                "Ideation",
                "PoC",
                "Prototype (MUP)",
                "Internships",
                "Industry Deployment",
              ].map((step, idx, arr) => (
                <div key={step} className="min-w-[210px] md:min-w-0 flex-1">
                  <div className="h-full bg-black/30 border border-white/10 rounded-2xl p-5 relative">
                    <div className="text-sm font-bold text-cyan-200">{String(idx + 1).padStart(2, "0")}</div>
                    <div className="mt-2 font-extrabold text-white">{step}</div>
                    {idx < arr.length - 1 ? (
                      <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 opacity-70">
                        <ArrowRight className="w-7 h-7 text-white" />
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-white/60 text-sm">Follow each stage to transform your solution into deployment-ready innovation.</div>
          </div>
        </section>

        {/* Why Participate */}
        <section className="max-w-7xl mx-auto px-4 mt-10">
          <div className="glass-card p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur">
            <h2 className="text-2xl md:text-3xl font-extrabold">Why Participate?</h2>
            <div className="mt-6 grid md:grid-cols-4 gap-4">
              {[
                { icon: Lightbulb, title: "Industry Challenges", text: "Work on real industry problems." },
                { icon: Users, title: "Mentor Guidance", text: "Get guided by Industry & Academic Mentors." },
                { icon: Sparkles, title: "Build Solutions", text: "Build deployable solutions." },
                { icon: ShieldCheck, title: "Career Growth", text: "Gain hands-on experience." },
              ].map((c) => (
                <div key={c.title} className="bg-black/30 border border-white/10 rounded-2xl p-5">
                  <c.icon className="w-6 h-6 text-cyan-300" />
                  <div className="mt-3 font-extrabold text-white">{c.title}</div>
                  <div className="mt-2 text-white/70 text-sm">{c.text}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Guidelines */}
        <section id="guidelines" className="max-w-7xl mx-auto px-4 mt-10">
          <div className="glass-card p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur">
            <h2 className="text-2xl md:text-3xl font-extrabold">Guidelines</h2>

            {/* Fee notice in guidelines */}
            <div className="mt-5 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl px-5 py-4">
              <div className="font-extrabold text-yellow-200">Registration Fee Rule</div>
              <div className="text-white/80 text-sm mt-1">
                Each team must pay <span className="font-bold text-white">₹500</span>. Payment should be made only after the team and selected problem statement are
                approved by the admin.
              </div>
            </div>

            <div className="mt-6 grid lg:grid-cols-2 gap-6">
              <div className="bg-black/30 border border-white/10 rounded-2xl p-6">
                <div className="font-extrabold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-cyan-300" />
                  Team & Competition Rules
                </div>
                <ul className="mt-4 space-y-2 text-white/80 text-sm">
                  <li>• Team Size: Maximum 4 members</li>
                  <li>• Seed Money reimbursement for hardware MUP</li>
                  <li>• Prize upto ₹60,000</li>
                  <li>• Real industry problem statements</li>
                </ul>
              </div>

              <div className="bg-black/30 border border-white/10 rounded-2xl p-6">
                <div className="font-extrabold text-white">Opportunities</div>
                <ul className="mt-4 space-y-2 text-white/80 text-sm">
                  <li>• Industry Internship</li>
                  <li>• Patent eligibility</li>
                </ul>

                <div className="mt-4 text-white/60 text-xs">
                  Submit PoC/Prototype as per selected problem flow. Final decisions are subject to admin review.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Outcomes */}
        <section className="max-w-7xl mx-auto px-4 mt-10">
          <div className="glass-card p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur">
            <h2 className="text-2xl md:text-3xl font-extrabold">Expected Outcomes</h2>
            <div className="mt-6 grid md:grid-cols-4 gap-4">
              {[
                "Proof of Concept (PoC)",
                "Knowledge Integration (KI)",
                "Real-world implementation",
                "Innovative technology development",
              ].map((x) => (
                <div key={x} className="bg-black/30 border border-white/10 rounded-2xl p-5">
                  <div className="text-white/60 text-sm">Outcome</div>
                  <div className="mt-2 font-extrabold text-white">{x}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Who can participate */}
        <section className="max-w-7xl mx-auto px-4 mt-10">
          <div className="glass-card p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur">
            <h2 className="text-2xl md:text-3xl font-extrabold">Who Can Participate</h2>
            <p className="mt-3 text-white/80 leading-relaxed text-lg">
              All UG & PG students interested in Innovation, Product Development, Industry Solutions.
            </p>

            <div className="mt-6 grid md:grid-cols-2 gap-4">
              <div className="bg-black/30 border border-white/10 rounded-2xl p-6">
                <div className="text-white/60 text-sm">Venue</div>
                <div className="mt-2 font-extrabold text-white">Kumaraguru College of Technology</div>
              </div>
              <div className="bg-black/30 border border-white/10 rounded-2xl p-6">
                <div className="text-white/60 text-sm">Date</div>
                <div className="mt-2 font-extrabold text-white">10th and 11th April 2026</div>
              </div>
            </div>
          </div>
        </section>

        {/* Organized by */}
        <section className="max-w-7xl mx-auto px-4 mt-10">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur">
            <div className="text-white/60 text-sm">ORGANIZED BY</div>
            <div className="mt-2 text-2xl font-extrabold">AICTE IDEA Lab, KCT</div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="max-w-7xl mx-auto px-4 mt-10">
          <div className="glass-card p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur">
            <h2 className="text-2xl md:text-3xl font-extrabold">Contact</h2>
            <div className="mt-6 grid md:grid-cols-2 gap-6">
              <div className="bg-black/30 border border-white/10 rounded-2xl p-6">
                <div className="font-extrabold text-white">Faculty Coordinators</div>
                <div className="mt-4 space-y-3 text-white/80 text-sm">
                  <div>
                    <div className="font-semibold text-white">Dr. S. Sasikala</div>
                    <div className="text-white/70">sasikala.s.ece@kct.ac.in</div>
                  </div>
                  <div>
                    <div className="font-semibold text-white">Dr. A. P. Arun</div>
                    <div className="text-white/70">arun.ap.mec@kct.ac.in</div>
                  </div>
                </div>
              </div>

              <div className="bg-black/30 border border-white/10 rounded-2xl p-6">
                <div className="font-extrabold text-white">Student Coordinators</div>
                <div className="mt-4 space-y-3 text-white/80 text-sm">
                  <div>
                    <div className="font-semibold text-white">M. Sriarunachaleeshwaran - +91 9361883441
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-white">S. Sanjith Krishna - +91 7339660186</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="text-sm text-white/70">
            AICTE IDEA Lab – KCT
            <div className="text-white/60 mt-1">Hackathon 2026</div>
            <div className="text-white/50 mt-1">All rights reserved</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HackathonLanding;

