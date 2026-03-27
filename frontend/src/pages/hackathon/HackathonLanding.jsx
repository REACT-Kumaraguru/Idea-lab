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
    "rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:bg-gray-100";

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 relative overflow-x-hidden">
      {/* Background gradient + grid + glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50 via-gray-50 to-gray-50" />
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: `linear-gradient(rgba(229,231,235,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(229,231,235,0.9) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[radial-gradient(closest-side,rgba(99,102,241,0.08),transparent)] blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(closest-side,rgba(124,58,237,0.06),transparent)] blur-3xl" />
      </div>

      {/* Navbar */}
      <header className="relative z-50 w-full sticky top-0">
        <div className="border-b border-gray-200 bg-white/90 backdrop-blur-xl shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="shrink-0 rounded-lg bg-white px-2 py-1.5 shadow-sm ring-1 ring-gray-200">
                  <img
                    src={KctLogo}
                    alt="Kumaraguru College of Technology"
                    className="h-7 sm:h-8 w-auto max-h-8 object-contain block"
                  />
                </div>
                <div className="h-7 w-px bg-gray-200 shrink-0" />
                <img src={IdeaLabLogo} alt="AICTE IDEA Lab" className="h-8 sm:h-9 w-auto object-contain shrink-0" />
                <span className="hidden sm:inline font-extrabold text-gray-900 tracking-tight text-sm md:text-base whitespace-nowrap">
                  ICH2026
                </span>
              </div>

              <nav className="hidden lg:flex items-center justify-center gap-8 text-sm font-medium text-gray-500 flex-1">
                <a className="hover:text-blue-600 transition-colors" href="#event">
                  Event
                </a>
                <a className="hover:text-blue-600 transition-colors" href="#schedule">
                  Schedule
                </a>
                <a className="hover:text-blue-600 transition-colors" href="#outcomes">
                  Outcomes
                </a>
                <a className="hover:text-blue-600 transition-colors" href="#benefits">
                  Benefits
                </a>
              </nav>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 bg-white text-gray-900 shadow-sm hover:bg-gray-50"
                  aria-label="Open menu"
                  aria-expanded={mobileNavOpen}
                  onClick={() => setMobileNavOpen(true)}
                >
                  <Menu className="w-5 h-5" />
                </button>
                <Link
                  to="/ich2026/login"
                  className="hidden sm:inline-flex px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/ich2026/register"
                  className="px-3 sm:px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-extrabold text-sm transition-colors shadow-sm"
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
          <div className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm" onClick={() => setMobileNavOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[min(100%,320px)] bg-white border-l border-gray-200 shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <span className="font-extrabold text-gray-900">Menu</span>
              <button
                type="button"
                className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-900 hover:bg-gray-100"
                aria-label="Close menu"
                onClick={() => setMobileNavOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex flex-col p-4 gap-1 text-base font-semibold">
              <button type="button" className="text-left px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100" onClick={() => closeAndScroll("event")}>
                Event
              </button>
              <button type="button" className="text-left px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100" onClick={() => closeAndScroll("schedule")}>
                Schedule
              </button>
              <button type="button" className="text-left px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100" onClick={() => closeAndScroll("outcomes")}>
                Outcomes
              </button>
              <button type="button" className="text-left px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100" onClick={() => closeAndScroll("benefits")}>
                Benefits
              </button>
              <button type="button" className="text-left px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100" onClick={() => closeAndScroll("about")}>
                About
              </button>
              <button type="button" className="text-left px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100" onClick={() => closeAndScroll("flow")}>
                Flow
              </button>
              <button type="button" className="text-left px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100" onClick={() => closeAndScroll("guidelines")}>
                Guidelines
              </button>
              <button type="button" className="text-left px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100" onClick={() => closeAndScroll("contact")}>
                Contact
              </button>
            </nav>
            <div className="mt-auto p-4 border-t border-gray-200 flex flex-col gap-2">
              <Link
                to="/ich2026/login"
                className="w-full text-center px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 font-semibold hover:bg-gray-50"
                onClick={() => setMobileNavOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/ich2026/register"
                className="w-full text-center px-4 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-extrabold"
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs sm:text-sm font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-blue-600" />
              AICTE IDEA Lab – KCT Presents
            </div>

            <p className="mt-6 text-[11px] sm:text-xs font-bold tracking-[0.2em] text-gray-500">KUMARAGURU COLLEGE OF TECHNOLOGY</p>

            <h1 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight">
              Industry Connect Hackathon 2026
            </h1>

            <p className="mt-4 text-xl md:text-2xl font-semibold text-blue-600">Build. Innovate. Implement.</p>

            <p className="mt-6 max-w-2xl text-gray-500 text-base md:text-lg leading-relaxed">
              Transform Ideas into Real-World Industrial Solutions
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
              <Link
                to="/ich2026/register"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-extrabold transition-all shadow-md hover:scale-[1.02]"
              >
                Register Now
              </Link>
              <Link
                to="/ich2026/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold hover:bg-gray-100 transition-all"
              >
                View Problem Statements <ArrowRight className="w-4 h-4 text-blue-600" />
              </Link>
            </div>

            <div className="mt-10 w-full max-w-3xl">
              <div className={`${cardBase} px-5 py-4 text-left`}>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-yellow-50 border border-yellow-200">
                    <BriefcaseBusiness className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <div className="font-extrabold text-gray-900">Important Notice</div>
                    <div className="text-gray-500 text-sm mt-1 leading-relaxed">
                      Each team must pay <span className="font-bold text-gray-900">₹500</span> registration fee.
                      Payment should be made only after the team and selected problem statement are approved by the mentor.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="relative z-10 pb-16 space-y-14 md:space-y-20">
        {/* Expected Outcomes */}
        <section id="outcomes" className="max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-24">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 text-left">Expected Outcomes</h2>
          <div className="mt-8 grid md:grid-cols-3 gap-5">
            {[
              { title: "Proof of Concept", body: "Proof of Concept (PoC)", Icon: Lightbulb },
              { title: "Knowledge Integration", body: "Knowledge Integration (KI)", Icon: Sparkles },
              { title: "Innovative Technology", body: "Innovative technology development", Icon: ShieldCheck },
            ].map(({ title, body, Icon }) => (
              <div key={title} className={`${cardBase} p-6 md:p-7`}>
                <div className="inline-flex p-2.5 rounded-xl bg-indigo-50 border border-indigo-100 text-blue-600 mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-gray-900 text-lg">{title}</h3>
                <p className="mt-2 text-gray-500 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-gray-500 text-sm md:text-base max-w-3xl mx-auto leading-relaxed">
            <span className="text-gray-900 font-semibold">Real-world implementation</span>
            {" · "}
            <span className="text-gray-900 font-semibold">Innovative technology development</span>
          </p>
        </section>

        {/* Event Timeline */}
        <section id="schedule" className="max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-24">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Event Timeline</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className={`${cardBase} p-6 md:p-8 flex flex-col sm:flex-row gap-6`}>
              <div className="shrink-0 text-center sm:text-left">
                <div className="text-4xl font-black text-purple-600 leading-none">01</div>
                <div className="mt-2 text-sm font-bold text-blue-600">Day 1</div>
                <div className="text-xs text-gray-500 mt-1">April 10, 2026</div>
              </div>
              <div className="flex-1 space-y-4 text-left border-t sm:border-t-0 sm:border-l border-gray-200 sm:pl-6 pt-4 sm:pt-0">
                <div>
                  <div className="font-extrabold text-gray-900">Morning & afternoon</div>
                  <ul className="mt-2 space-y-1.5 text-gray-500 text-sm">
                    <li>• Industry Problems</li>
                    <li>• Ideation</li>
                    <li>• PoC</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className={`${cardBase} p-6 md:p-8 flex flex-col sm:flex-row gap-6`}>
              <div className="shrink-0 text-center sm:text-left">
                <div className="text-4xl font-black text-purple-600 leading-none">02</div>
                <div className="mt-2 text-sm font-bold text-blue-600">Day 2</div>
                <div className="text-xs text-gray-500 mt-1">April 11, 2026</div>
              </div>
              <div className="flex-1 space-y-4 text-left border-t sm:border-t-0 sm:border-l border-gray-200 sm:pl-6 pt-4 sm:pt-0">
                <div>
                  <div className="font-extrabold text-gray-900">Final stretch</div>
                  <ul className="mt-2 space-y-1.5 text-gray-500 text-sm">
                    <li>• Prototype (MUP)</li>
                    <li>• Internships</li>
                    <li>• Industry Deployment</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How to Participate */}
        <section id="how" className="max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-24">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 text-center">How to Participate</h2>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { n: "01", title: "Explore", text: "Work on real industry problems." },
              { n: "02", title: "Submit", text: "Get guided by Industry & Academic Mentors." },
              { n: "03", title: "Shortlist", text: "Build deployable solutions." },
              { n: "04", title: "Participate", text: "Gain hands-on experience." },
            ].map((c) => (
              <div key={c.title} className={`${cardBase} p-6 relative overflow-hidden`}>
                <div className="text-5xl font-black text-gray-200 absolute -right-1 -top-1 select-none">{c.n}</div>
                <div className="relative">
                  <div className="font-extrabold text-gray-900 text-lg">{c.title}</div>
                  <p className="mt-3 text-gray-500 text-sm leading-relaxed">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Post Event Benefits */}
        <section id="benefits" className="max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-24">
          <div className="text-left md:text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Post Event Benefits</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { title: "Awards & Cash Prizes", text: "Prize upto ₹60,000", Icon: Sparkles },
              { title: "Reimbursement", text: "Seed Money reimbursement for hardware MUP", Icon: BriefcaseBusiness },
              { title: "Industry Internship", text: "Industry Internship", Icon: Users },
              { title: "Real-world Implementation", text: "Patent eligibility", Icon: Building2 },
            ].map(({ title, text, Icon }) => (
              <div key={title} className={`${cardBase} p-6 text-center`}>
                <div className="inline-flex p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-purple-600 mx-auto">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="mt-4 font-extrabold text-gray-900 text-sm md:text-base">{title}</div>
                <p className="mt-2 text-gray-500 text-xs leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* About */}
        <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-24">
          <div className={`${cardBase} p-8 md:p-10`}>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">About the Hackathon</h2>
            <p className="mt-4 text-gray-500 leading-relaxed text-lg max-w-3xl">
              An exclusive platform connecting students with industries to solve real-time industry challenges in the Digital and Manufacturing
              sectors.
            </p>
          </div>
        </section>

        {/* Flow */}
        <section id="flow" className="max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-24">
          <div className={`${cardBase} p-8 md:p-10`}>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Hackathon Flow</h2>
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
                    <div className={`h-full ${cardBase} p-5 md:p-6`}>
                      <div className="text-xs font-bold uppercase tracking-wider text-blue-600">{String(idx + 1).padStart(2, "0")}</div>
                      <div className="mt-3 font-extrabold text-gray-900 text-sm md:text-base leading-snug">{step}</div>
                    </div>
                  </div>
                  {idx < arr.length - 1 ? (
                    <div className="flex justify-center py-3 md:py-0 md:items-center md:px-1 shrink-0">
                      <div className="flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 bg-indigo-50 text-blue-600">
                        <ArrowRight className="w-4 h-4 rotate-90 md:rotate-0" />
                      </div>
                    </div>
                  ) : null}
                </React.Fragment>
              ))}
            </div>
            <div className="mt-6 text-gray-500 text-sm leading-relaxed border-t border-gray-200 pt-6">
              Follow each stage to transform your solution into deployment-ready innovation.
            </div>
          </div>
        </section>

        {/* Why Participate */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className={`${cardBase} p-8 md:p-10`}>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Why Participate?</h2>
            <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { icon: Lightbulb, title: "Industry Challenges", text: "Work on real industry problems." },
                { icon: Users, title: "Mentor Guidance", text: "Get guided by Industry & Academic Mentors." },
                { icon: Sparkles, title: "Build Solutions", text: "Build deployable solutions." },
                { icon: ShieldCheck, title: "Career Growth", text: "Gain hands-on experience." },
              ].map((c) => (
                <div key={c.title} className={`${cardBase} p-6`}>
                  <div className="inline-flex p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-blue-600">
                    <c.icon className="w-6 h-6" />
                  </div>
                  <div className="mt-4 font-extrabold text-gray-900">{c.title}</div>
                  <div className="mt-2 text-gray-500 text-sm leading-relaxed">{c.text}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Guidelines */}
        <section id="guidelines" className="max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-24">
          <div className={`${cardBase} p-8 md:p-10`}>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Guidelines</h2>

            <div className="mt-6 rounded-xl border border-yellow-200 bg-yellow-50 px-5 py-4">
              <div className="font-extrabold text-yellow-700">Registration Fee Rule</div>
              <div className="text-gray-500 text-sm mt-1 leading-relaxed">
                Each team must pay <span className="font-bold text-gray-900">₹500</span>. Payment should be made only after the team and selected problem statement are
                approved by the Mentor and Industry Partner.
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-5 py-4">
              <div className="font-extrabold text-blue-600">Accommodation</div>
              <div className="text-gray-500 text-sm mt-1 leading-relaxed">
                Accommodation will be provided on request with additional charges. Participants can opt for accommodation if needed. It is not mandatory.
              </div>
            </div>

            <div className="mt-8 grid lg:grid-cols-2 gap-6">
              <div className={`${cardBase} p-6 md:p-8`}>
                <div className="font-extrabold text-gray-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  Team & Competition Rules
                </div>
                <ul className="mt-5 space-y-2 text-gray-500 text-sm">
                  <li>• Team Size: Maximum 4 members</li>
                  <li>• Seed Money reimbursement for hardware MUP</li>
                  <li>• Prize upto ₹60,000</li>
                  <li>• Real industry problem statements</li>
                </ul>
              </div>

              <div className={`${cardBase} p-6 md:p-8`}>
                <div className="font-extrabold text-gray-900">Opportunities</div>
                <ul className="mt-4 space-y-2 text-gray-500 text-sm">
                  <li>• Industry Internship</li>
                  <li>• Patent eligibility</li>
                </ul>

                <div className="mt-5 text-gray-400 text-xs leading-relaxed border-t border-gray-200 pt-5">
                  Submit PoC/Prototype as per selected problem flow. Final decisions are subject to admin review.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Who can participate */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className={`${cardBase} p-8 md:p-10`}>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Who Can Participate</h2>
            <p className="mt-4 text-gray-500 leading-relaxed text-lg max-w-3xl">
              All UG & PG students interested in Innovation, Product Development, Industry Solutions.
            </p>

            <div className="mt-8 grid md:grid-cols-2 gap-5">
              <div className={`${cardBase} p-6 md:p-8`}>
                <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Venue</div>
                <div className="mt-2 font-extrabold text-gray-900 text-lg">Kumaraguru College of Technology</div>
              </div>
              <div className={`${cardBase} p-6 md:p-8`}>
                <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Date</div>
                <div className="mt-2 font-extrabold text-gray-900 text-lg">10th and 11th April 2026</div>
              </div>
            </div>
          </div>
        </section>

        {/* Organized by */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-indigo-50 p-8 md:p-10 text-center shadow-sm">
            <div className="text-gray-500 text-xs font-bold uppercase tracking-[0.25em]">ORGANIZED BY</div>
            <div className="mt-3 text-2xl md:text-3xl font-extrabold text-gray-900">AICTE IDEA Lab, KCT</div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-24">
          <div className={`${cardBase} p-8 md:p-10`}>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Contact</h2>
            <div className="mt-8 grid md:grid-cols-2 gap-6">
              <div className={`${cardBase} p-6 md:p-8`}>
                <div className="font-extrabold text-gray-900 text-lg mb-6 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 border border-blue-100 text-sm font-bold text-blue-600">
                    FC
                  </span>
                  Faculty Coordinators
                </div>
                <div className="space-y-5 text-gray-500 text-sm">
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 hover:border-blue-300 transition-colors">
                    <div className="font-semibold text-gray-900">Dr. S. Sasikala</div>
                    <div className="text-gray-500 mt-1">sasikala.s.ece@kct.ac.in</div>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 hover:border-blue-300 transition-colors">
                    <div className="font-semibold text-gray-900">Dr. A. P. Arun</div>
                    <div className="text-gray-500 mt-1">arun.ap.mec@kct.ac.in</div>
                  </div>
                </div>
              </div>

              <div className={`${cardBase} p-6 md:p-8`}>
                <div className="font-extrabold text-gray-900 text-lg mb-6 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50 border border-purple-100 text-sm font-bold text-purple-600">
                    SC
                  </span>
                  Student Coordinators
                </div>
                <div className="space-y-5 text-gray-500 text-sm">
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 hover:border-purple-300 transition-colors">
                    <div className="font-semibold text-gray-900">M. Sriarunachaleeshwaran - +91 9361883441</div>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 hover:border-purple-300 transition-colors">
                    <div className="font-semibold text-gray-900">S. Sanjith Krishna - +91 7339660186</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-10 md:p-14 text-center shadow-sm relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-30 pointer-events-none"
              style={{
                backgroundImage: `linear-gradient(rgba(99,102,241,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.08) 1px, transparent 1px)`,
                backgroundSize: "24px 24px",
              }}
            />
            <div className="relative z-10">
              <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900">Ready to Build Your Innovation?</h2>
              <Link
                to="/ich2026/register"
                className="mt-8 inline-flex items-center justify-center px-10 py-3.5 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-extrabold transition-all shadow-md hover:scale-[1.02]"
              >
                Register Now
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-14">
          <div className="flex flex-col md:flex-row md:justify-between gap-10">
            <div className="text-sm max-w-md">
              <div className="font-extrabold text-gray-900 text-lg">IDEA LAB</div>
              <div className="text-gray-500 mt-2">Kumaraguru College of Technology</div>
              <div className="text-gray-400 mt-4 text-xs leading-relaxed">
                AICTE IDEA Lab – KCT · Hackathon 2026 · All rights reserved
              </div>
            </div>
            <div className="text-sm">
              <div className="font-bold text-gray-900 mb-3">Links</div>
              <button type="button" onClick={() => scrollToId("contact")} className="block text-gray-500 hover:text-blue-600 transition-colors text-left">
                Contact
              </button>
            </div>
          </div>
          <div className="mt-10 pt-8 border-t border-gray-200 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} Kumaraguru College of Technology. IDEA LAB Hackathon. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HackathonLanding;