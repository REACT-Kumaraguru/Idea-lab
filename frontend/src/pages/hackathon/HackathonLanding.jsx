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

  const cardBase =
    "rounded-2xl border border-[#3B2A6B] bg-[#2A0A5A] shadow-[0_12px_40px_-12px_rgba(11,2,32,0.8)] transition-all duration-300 hover:bg-[#3A0F7A] hover:shadow-[0_0_32px_rgba(79,140,255,0.12)]";

  return (
    <div className="min-h-screen bg-[#0B0220] text-white relative overflow-x-hidden">
      {/* Background gradient + grid + glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A0440] via-[#0B0220] to-[#0B0220]" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `linear-gradient(rgba(59,42,107,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(59,42,107,0.4) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[radial-gradient(closest-side,rgba(79,140,255,0.18),transparent)] blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(closest-side,rgba(124,58,237,0.12),transparent)] blur-3xl" />
      </div>

      {/* Navbar */}
      <header className="relative z-50 w-full sticky top-0">
        <div className="border-b border-[#3B2A6B]/80 bg-[#0B0220]/70 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <img src={KctLogo} alt="Kumaraguru College of Technology" className="h-8 sm:h-9 w-auto object-contain shrink-0" />
                <div className="h-7 w-px bg-[#3B2A6B] shrink-0" />
                <img src={IdeaLabLogo} alt="AICTE IDEA Lab" className="h-8 sm:h-9 w-auto object-contain shrink-0" />
                <span className="hidden sm:inline font-extrabold text-white tracking-tight text-sm md:text-base whitespace-nowrap">
                  ICH2026
                </span>
              </div>

              <nav className="hidden lg:flex items-center justify-center gap-8 text-sm font-medium text-[#C9C9D4] flex-1">
                <a className="hover:text-[#4F8CFF] transition-colors" href="#event">
                  Event
                </a>
                <a className="hover:text-[#4F8CFF] transition-colors" href="#schedule">
                  Schedule
                </a>
                <a className="hover:text-[#4F8CFF] transition-colors" href="#outcomes">
                  Outcomes
                </a>
                <a className="hover:text-[#4F8CFF] transition-colors" href="#benefits">
                  Benefits
                </a>
              </nav>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-[#3B2A6B] bg-[#2A0A5A] text-white"
                  aria-label="Open menu"
                  aria-expanded={mobileNavOpen}
                  onClick={() => setMobileNavOpen(true)}
                >
                  <Menu className="w-5 h-5" />
                </button>
                <Link
                  to="/ich2026/login"
                  className="hidden sm:inline-flex px-3 py-2 rounded-xl border border-[#3B2A6B] bg-[#2A0A5A] text-[#C9C9D4] text-sm font-semibold hover:bg-[#3A0F7A] transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/ich2026/register"
                  className="px-3 sm:px-4 py-2 rounded-xl bg-[#FFC107] hover:bg-[#E6AC00] text-black font-extrabold text-sm transition-colors shadow-[0_0_24px_rgba(255,193,7,0.35)]"
                >
                  Register Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {mobileNavOpen ? (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-[#0B0220]/85 backdrop-blur-sm" onClick={() => setMobileNavOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[min(100%,320px)] bg-[#1A0440] border-l border-[#3B2A6B] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[#3B2A6B]">
              <span className="font-extrabold text-white">Menu</span>
              <button
                type="button"
                className="w-10 h-10 rounded-xl bg-[#2A0A5A] border border-[#3B2A6B] flex items-center justify-center text-white"
                aria-label="Close menu"
                onClick={() => setMobileNavOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex flex-col p-4 gap-1 text-base font-semibold">
              <button type="button" className="text-left px-4 py-3 rounded-xl text-[#C9C9D4] hover:bg-[#2A0A5A]" onClick={() => closeAndScroll("event")}>
                Event
              </button>
              <button type="button" className="text-left px-4 py-3 rounded-xl text-[#C9C9D4] hover:bg-[#2A0A5A]" onClick={() => closeAndScroll("schedule")}>
                Schedule
              </button>
              <button type="button" className="text-left px-4 py-3 rounded-xl text-[#C9C9D4] hover:bg-[#2A0A5A]" onClick={() => closeAndScroll("outcomes")}>
                Outcomes
              </button>
              <button type="button" className="text-left px-4 py-3 rounded-xl text-[#C9C9D4] hover:bg-[#2A0A5A]" onClick={() => closeAndScroll("benefits")}>
                Benefits
              </button>
              <button type="button" className="text-left px-4 py-3 rounded-xl text-[#C9C9D4] hover:bg-[#2A0A5A]" onClick={() => closeAndScroll("about")}>
                About
              </button>
              <button type="button" className="text-left px-4 py-3 rounded-xl text-[#C9C9D4] hover:bg-[#2A0A5A]" onClick={() => closeAndScroll("flow")}>
                Flow
              </button>
              <button type="button" className="text-left px-4 py-3 rounded-xl text-[#C9C9D4] hover:bg-[#2A0A5A]" onClick={() => closeAndScroll("guidelines")}>
                Guidelines
              </button>
              <button type="button" className="text-left px-4 py-3 rounded-xl text-[#C9C9D4] hover:bg-[#2A0A5A]" onClick={() => closeAndScroll("contact")}>
                Contact
              </button>
            </nav>
            <div className="mt-auto p-4 border-t border-[#3B2A6B] flex flex-col gap-2">
              <Link
                to="/ich2026/login"
                className="w-full text-center px-4 py-3 rounded-xl border border-[#3B2A6B] bg-[#2A0A5A] text-white font-semibold"
                onClick={() => setMobileNavOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/ich2026/register"
                className="w-full text-center px-4 py-3 rounded-xl bg-[#FFC107] hover:bg-[#E6AC00] text-black font-extrabold"
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#3B2A6B] bg-[#2A0A5A]/80 text-[#C9C9D4] text-xs sm:text-sm font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-[#4F8CFF]" />
              AICTE IDEA Lab – KCT Presents
            </div>

            <p className="mt-6 text-[11px] sm:text-xs font-bold tracking-[0.2em] text-[#C9C9D4]">KUMARAGURU COLLEGE OF TECHNOLOGY</p>

            <h1 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight drop-shadow-[0_0_40px_rgba(79,140,255,0.2)]">
              Industry Connect Hackathon 2026
            </h1>

            <p className="mt-4 text-xl md:text-2xl font-semibold text-[#4F8CFF]">Build. Innovate. Implement.</p>

            <p className="mt-6 max-w-2xl text-[#C9C9D4] text-base md:text-lg leading-relaxed">
              Transform Ideas into Real-World Industrial Solutions
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
              <Link
                to="/ich2026/register"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-[#FFC107] hover:bg-[#E6AC00] text-black font-extrabold transition-all shadow-[0_0_28px_rgba(255,193,7,0.4)] hover:scale-[1.02]"
              >
                Register Now
              </Link>
              <Link
                to="/ich2026/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-[#3B2A6B] bg-[#2A0A5A] text-white font-semibold hover:bg-[#3A0F7A] transition-all"
              >
                View Problem Statements <ArrowRight className="w-4 h-4 text-[#4F8CFF]" />
              </Link>
            </div>

            <div className="mt-10 w-full max-w-3xl">
              <div className={`${cardBase} px-5 py-4 text-left`}>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-[#1A0440] border border-[#3B2A6B]">
                    <BriefcaseBusiness className="w-5 h-5 text-[#FFC107]" />
                  </div>
                  <div>
                    <div className="font-extrabold text-white">Important Notice</div>
                    <div className="text-[#C9C9D4] text-sm mt-1 leading-relaxed">
                      Each team must pay <span className="font-bold text-white">₹500</span> registration fee.
                      Payment should be made only after the team and selected problem statement are approved by the metnor.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="relative z-10 pb-16 space-y-14 md:space-y-20">
        {/* Expected Outcomes — 3 cards + preserved 4th outcome */}
        <section id="outcomes" className="max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-24">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white text-left">Expected Outcomes</h2>
          <div className="mt-8 grid md:grid-cols-3 gap-5">
            {[
              { title: "Proof of Concept", body: "Proof of Concept (PoC)", Icon: Lightbulb },
              { title: "Knowledge Integration", body: "Knowledge Integration (KI)", Icon: Sparkles },
              { title: "Innovative Technology", body: "Innovative technology development", Icon: ShieldCheck },
            ].map(({ title, body, Icon }) => (
              <div key={title} className={`${cardBase} p-6 md:p-7`}>
                <div className="inline-flex p-2.5 rounded-xl bg-[#1A0440] border border-[#3B2A6B] text-[#4F8CFF] mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-white text-lg">{title}</h3>
                <p className="mt-2 text-[#C9C9D4] text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-[#C9C9D4] text-sm md:text-base max-w-3xl mx-auto leading-relaxed">
            <span className="text-white font-semibold">Real-world implementation</span>
            {" · "}
            <span className="text-white font-semibold">Innovative technology development</span>
          </p>
        </section>

        {/* Event Timeline */}
        <section id="schedule" className="max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-24">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">Event Timeline</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className={`${cardBase} p-6 md:p-8 flex flex-col sm:flex-row gap-6`}>
              <div className="shrink-0 text-center sm:text-left">
                <div className="text-4xl font-black text-[#7C3AED]/90 leading-none">01</div>
                <div className="mt-2 text-sm font-bold text-[#4F8CFF]">Day 1</div>
                <div className="text-xs text-[#C9C9D4] mt-1">April 10, 2026</div>
              </div>
              <div className="flex-1 space-y-4 text-left border-t sm:border-t-0 sm:border-l border-[#3B2A6B] sm:pl-6 pt-4 sm:pt-0">
                <div>
                  <div className="font-extrabold text-white">Morning & afternoon</div>
                  <ul className="mt-2 space-y-1.5 text-[#C9C9D4] text-sm">
                    <li>• Industry Problems</li>
                    <li>• Ideation</li>
                    <li>• PoC</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className={`${cardBase} p-6 md:p-8 flex flex-col sm:flex-row gap-6`}>
              <div className="shrink-0 text-center sm:text-left">
                <div className="text-4xl font-black text-[#7C3AED]/90 leading-none">02</div>
                <div className="mt-2 text-sm font-bold text-[#4F8CFF]">Day 2</div>
                <div className="text-xs text-[#C9C9D4] mt-1">April 11, 2026</div>
              </div>
              <div className="flex-1 space-y-4 text-left border-t sm:border-t-0 sm:border-l border-[#3B2A6B] sm:pl-6 pt-4 sm:pt-0">
                <div>
                  <div className="font-extrabold text-white">Final stretch</div>
                  <ul className="mt-2 space-y-1.5 text-[#C9C9D4] text-sm">
                    <li>• Prototype (MUP)</li>
                    <li>• Internships</li>
                    <li>• Industry Deployment</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How to Participate — design labels + original Why Participate copy */}
        <section id="how" className="max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-24">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white text-center">How to Participate</h2>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { n: "01", title: "Explore", text: "Work on real industry problems." },
              { n: "02", title: "Submit", text: "Get guided by Industry & Academic Mentors." },
              { n: "03", title: "Shortlist", text: "Build deployable solutions." },
              { n: "04", title: "Participate", text: "Gain hands-on experience." },
            ].map((c) => (
              <div key={c.title} className={`${cardBase} p-6 relative overflow-hidden`}>
                <div className="text-5xl font-black text-[#3B2A6B]/80 absolute -right-1 -top-1 select-none">{c.n}</div>
                <div className="relative">
                  <div className="font-extrabold text-white text-lg">{c.title}</div>
                  <p className="mt-3 text-[#C9C9D4] text-sm leading-relaxed">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Post Event Benefits */}
        <section id="benefits" className="max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-24">
          <div className="text-left md:text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">Post Event Benefits</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { title: "Awards & Cash Prizes", text: "Prize upto ₹60,000", Icon: Sparkles },
              { title: "Reimbursement", text: "Seed Money reimbursement for hardware MUP", Icon: BriefcaseBusiness },
              { title: "Industry Internship", text: "Industry Internship", Icon: Users },
              { title: "Real-world Implementation", text: "Patent eligibility", Icon: Building2 },
            ].map(({ title, text, Icon }) => (
              <div key={title} className={`${cardBase} p-6 text-center`}>
                <div className="inline-flex p-3 rounded-xl bg-[#1A0440] border border-[#3B2A6B] text-[#7C3AED] mx-auto">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="mt-4 font-extrabold text-white text-sm md:text-base">{title}</div>
                <p className="mt-2 text-[#C9C9D4] text-xs leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* About */}
        <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-24">
          <div className={`${cardBase} p-8 md:p-10`}>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">About the Hackathon</h2>
            <p className="mt-4 text-[#C9C9D4] leading-relaxed text-lg max-w-3xl">
              An exclusive platform connecting students with industries to solve real-time industry challenges in the Digital and Manufacturing
              sectors.
            </p>
          </div>
        </section>

        {/* Flow */}
        <section id="flow" className="max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-24">
          <div className={`${cardBase} p-8 md:p-10`}>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">Hackathon Flow</h2>
            <div className="mt-8 flex flex-col md:flex-row md:items-stretch gap-0">
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
                    <div className={`h-full ${cardBase} p-5 md:p-6 border-[#3B2A6B]`}>
                      <div className="text-xs font-bold uppercase tracking-wider text-[#4F8CFF]">{String(idx + 1).padStart(2, "0")}</div>
                      <div className="mt-3 font-extrabold text-white text-sm md:text-base leading-snug">{step}</div>
                    </div>
                  </div>
                  {idx < arr.length - 1 ? (
                    <div className="flex justify-center py-3 md:py-0 md:items-center md:px-1 shrink-0">
                      <div className="flex items-center justify-center w-9 h-9 rounded-full border border-[#3B2A6B] bg-[#1A0440] text-[#4F8CFF]">
                        <ArrowRight className="w-4 h-4 rotate-90 md:rotate-0" />
                      </div>
                    </div>
                  ) : null}
                </React.Fragment>
              ))}
            </div>
            <div className="mt-6 text-[#C9C9D4] text-sm leading-relaxed border-t border-[#3B2A6B] pt-6">
              Follow each stage to transform your solution into deployment-ready innovation.
            </div>
          </div>
        </section>

        {/* Why Participate — original section preserved */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className={`${cardBase} p-8 md:p-10`}>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">Why Participate?</h2>
            <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { icon: Lightbulb, title: "Industry Challenges", text: "Work on real industry problems." },
                { icon: Users, title: "Mentor Guidance", text: "Get guided by Industry & Academic Mentors." },
                { icon: Sparkles, title: "Build Solutions", text: "Build deployable solutions." },
                { icon: ShieldCheck, title: "Career Growth", text: "Gain hands-on experience." },
              ].map((c) => (
                <div key={c.title} className={`${cardBase} p-6 border-[#3B2A6B]`}>
                  <div className="inline-flex p-3 rounded-xl bg-[#1A0440] border border-[#3B2A6B] text-[#4F8CFF]">
                    <c.icon className="w-6 h-6" />
                  </div>
                  <div className="mt-4 font-extrabold text-white">{c.title}</div>
                  <div className="mt-2 text-[#C9C9D4] text-sm leading-relaxed">{c.text}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Guidelines */}
        <section id="guidelines" className="max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-24">
          <div className={`${cardBase} p-8 md:p-10`}>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">Guidelines</h2>

            <div className="mt-6 rounded-xl border border-[#3B2A6B] bg-[#1A0440]/50 px-5 py-4">
              <div className="font-extrabold text-[#FFC107]">Registration Fee Rule</div>
              <div className="text-[#C9C9D4] text-sm mt-1 leading-relaxed">
                Each team must pay <span className="font-bold text-white">₹500</span>. Payment should be made only after the team and selected problem statement are
                approved by the admin.
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-[#3B2A6B] bg-[#1A0440]/50 px-5 py-4">
              <div className="font-extrabold text-[#4F8CFF]">Accommodation</div>
              <div className="text-[#C9C9D4] text-sm mt-1 leading-relaxed">
                Accommodation will be provided on request with additional charges. Participants can opt for accommodation if needed. It is not mandatory.
              </div>
            </div>

            <div className="mt-8 grid lg:grid-cols-2 gap-6">
              <div className={`${cardBase} p-6 md:p-8`}>
                <div className="font-extrabold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#4F8CFF]" />
                  Team & Competition Rules
                </div>
                <ul className="mt-5 space-y-2 text-[#C9C9D4] text-sm">
                  <li>• Team Size: Maximum 4 members</li>
                  <li>• Seed Money reimbursement for hardware MUP</li>
                  <li>• Prize upto ₹60,000</li>
                  <li>• Real industry problem statements</li>
                </ul>
              </div>

              <div className={`${cardBase} p-6 md:p-8`}>
                <div className="font-extrabold text-white">Opportunities</div>
                <ul className="mt-4 space-y-2 text-[#C9C9D4] text-sm">
                  <li>• Industry Internship</li>
                  <li>• Patent eligibility</li>
                </ul>

                <div className="mt-5 text-[#C9C9D4]/80 text-xs leading-relaxed border-t border-[#3B2A6B] pt-5">
                  Submit PoC/Prototype as per selected problem flow. Final decisions are subject to admin review.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Who can participate */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className={`${cardBase} p-8 md:p-10`}>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">Who Can Participate</h2>
            <p className="mt-4 text-[#C9C9D4] leading-relaxed text-lg max-w-3xl">
              All UG & PG students interested in Innovation, Product Development, Industry Solutions.
            </p>

            <div className="mt-8 grid md:grid-cols-2 gap-5">
              <div className={`${cardBase} p-6 md:p-8`}>
                <div className="text-[#C9C9D4] text-xs font-semibold uppercase tracking-wider">Venue</div>
                <div className="mt-2 font-extrabold text-white text-lg">Kumaraguru College of Technology</div>
              </div>
              <div className={`${cardBase} p-6 md:p-8`}>
                <div className="text-[#C9C9D4] text-xs font-semibold uppercase tracking-wider">Date</div>
                <div className="mt-2 font-extrabold text-white text-lg">10th and 11th April 2026</div>
              </div>
            </div>
          </div>
        </section>

        {/* Organized by */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="rounded-2xl border border-[#3B2A6B] bg-gradient-to-r from-[#2A0A5A] via-[#1A0440] to-[#2A0A5A] p-8 md:p-10 text-center shadow-[0_12px_48px_-12px_rgba(124,58,237,0.25)]">
            <div className="text-[#C9C9D4] text-xs font-bold uppercase tracking-[0.25em]">ORGANIZED BY</div>
            <div className="mt-3 text-2xl md:text-3xl font-extrabold text-white">AICTE IDEA Lab, KCT</div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-24">
          <div className={`${cardBase} p-8 md:p-10`}>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">Contact</h2>
            <div className="mt-8 grid md:grid-cols-2 gap-6">
              <div className={`${cardBase} p-6 md:p-8`}>
                <div className="font-extrabold text-white text-lg mb-6 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1A0440] border border-[#3B2A6B] text-sm font-bold text-[#4F8CFF]">
                    FC
                  </span>
                  Faculty Coordinators
                </div>
                <div className="space-y-5 text-[#C9C9D4] text-sm">
                  <div className="rounded-xl border border-[#3B2A6B] bg-[#0B0220]/50 p-4 hover:border-[#4F8CFF]/40 transition-colors">
                    <div className="font-semibold text-white">Dr. S. Sasikala</div>
                    <div className="text-[#C9C9D4] mt-1">sasikala.s.ece@kct.ac.in</div>
                  </div>
                  <div className="rounded-xl border border-[#3B2A6B] bg-[#0B0220]/50 p-4 hover:border-[#4F8CFF]/40 transition-colors">
                    <div className="font-semibold text-white">Dr. A. P. Arun</div>
                    <div className="text-[#C9C9D4] mt-1">arun.ap.mec@kct.ac.in</div>
                  </div>
                </div>
              </div>

              <div className={`${cardBase} p-6 md:p-8`}>
                <div className="font-extrabold text-white text-lg mb-6 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1A0440] border border-[#3B2A6B] text-sm font-bold text-[#7C3AED]">
                    SC
                  </span>
                  Student Coordinators
                </div>
                <div className="space-y-5 text-[#C9C9D4] text-sm">
                  <div className="rounded-xl border border-[#3B2A6B] bg-[#0B0220]/50 p-4 hover:border-[#7C3AED]/40 transition-colors">
                    <div className="font-semibold text-white">M. Sriarunachaleeshwaran - +91 9361883441
                    </div>
                  </div>
                  <div className="rounded-xl border border-[#3B2A6B] bg-[#0B0220]/50 p-4 hover:border-[#7C3AED]/40 transition-colors">
                    <div className="font-semibold text-white">S. Sanjith Krishna - +91 7339660186</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="rounded-2xl border border-[#3B2A6B] bg-gradient-to-br from-[#2A0A5A] via-[#1A0440] to-[#0B0220] p-10 md:p-14 text-center shadow-[0_0_60px_rgba(79,140,255,0.15)] relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: `linear-gradient(rgba(79,140,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(79,140,255,0.15) 1px, transparent 1px)`,
                backgroundSize: "24px 24px",
              }}
            />
            <div className="relative z-10">
              <h2 className="text-2xl md:text-4xl font-extrabold text-white">Ready to Build Your Innovation?</h2>
              <Link
                to="/ich2026/register"
                className="mt-8 inline-flex items-center justify-center px-10 py-3.5 rounded-xl bg-[#FFC107] hover:bg-[#E6AC00] text-black font-extrabold transition-all shadow-[0_0_32px_rgba(255,193,7,0.4)] hover:scale-[1.02]"
              >
                Register Now
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#3B2A6B] bg-gradient-to-b from-[#1A0440] to-[#0B0220]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-14">
          <div className="flex flex-col md:flex-row md:justify-between gap-10">
            <div className="text-sm max-w-md">
              <div className="font-extrabold text-white text-lg">IDEA LAB</div>
              <div className="text-[#C9C9D4] mt-2">Kumaraguru College of Technology</div>
              <div className="text-[#C9C9D4]/80 mt-4 text-xs leading-relaxed">
                AICTE IDEA Lab – KCT · Hackathon 2026 · All rights reserved
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-sm">
              <div>
                <div className="font-bold text-white mb-3">Links</div>
                <button type="button" onClick={() => scrollToId("contact")} className="block text-[#C9C9D4] hover:text-[#4F8CFF] transition-colors text-left">
                  Contact
                </button>
              </div>
              <div>
                <div className="font-bold text-white mb-3">Explore</div>
                <Link to="/ich2026/problems" className="block text-[#C9C9D4] hover:text-[#4F8CFF] transition-colors">
                  Problem Statements
                </Link>
              </div>
              <div>
                <div className="font-bold text-white mb-3">Rules</div>
                <Link to="/ich2026/guidelines" className="block text-[#C9C9D4] hover:text-[#4F8CFF] transition-colors">
                  Code of Conduct
                </Link>
              </div>
              <div>
                <div className="font-bold text-white mb-3">Legal</div>
                <a href="#" className="block text-[#C9C9D4] hover:text-[#4F8CFF] transition-colors">
                  Privacy Policy
                </a>
              </div>
            </div>
          </div>
          <div className="mt-10 pt-8 border-t border-[#3B2A6B] text-center text-xs text-[#C9C9D4]/70">
            © {new Date().getFullYear()} Kumaraguru College of Technology. IDEA LAB Hackathon. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HackathonLanding;
