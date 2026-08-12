import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useScrollAnimation from '../hooks/useScrollAnimation';
import Footer from '../components/Footer';
import {
  Sparkles,
  ArrowRight,
  ChevronRight,
  Verified,
  MapPin,
  Mail,
  Phone,
  Check,
  ArrowDown,
  Compass,
  ShieldCheck,
  Clock,
  Award,
  Zap,
  Cpu
} from 'lucide-react';

const Hero = () => {
  const navigate = useNavigate();
  useScrollAnimation();

  const [timeState, setTimeState] = useState({
    ist: ''
  });

  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      setTimeState({
        ist: now.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });
    };
    updateClocks();
    const timer = setInterval(updateClocks, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleScrollTo = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0809] text-stone-100 font-sans selection:bg-amber-400 selection:text-stone-950 relative overflow-x-hidden">

      {/* ========================================================================= */}
      {/* 1. HERO SANCTUARY SECTION (WITH VIDEO BACKDROP)                           */}
      {/* ========================================================================= */}
      <section
        id="hero-sanctuary"
        className="min-h-screen w-full relative overflow-hidden flex flex-col justify-between bg-[#0a0809] text-stone-100 select-none pt-24 pb-8"
      >
        {/* Background Video Layer */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover scale-105 filter brightness-[0.40] contrast-125 saturate-90 transition-transform duration-10000 ease-out"
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_065045_c44942da-53c6-4804-b734-f9e07fc22e08.mp4"
          />

          {/* Ambient Dark Gradient & Prism Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0809] via-[#0a0809]/60 to-[#0a0809]/80" />
          <div className="absolute inset-0 serene-rainbow-overlay opacity-30" />
          <div className="absolute inset-0 spectral-prism-shimmer opacity-25 pointer-events-none" />
        </div>

        {/* Top Spacer */}
        <div className="h-12 z-10" />

        {/* Main Hero Center Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center flex flex-col items-center justify-center my-auto">
          
          {/* Top Gold Badge */}
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-stone-950/80 border border-amber-500/40 backdrop-blur-xl text-amber-200 text-xs font-sans tracking-[0.25em] uppercase mb-6 shadow-2xl animate-fade-in">
            <Verified className="w-4 h-4 text-amber-300 animate-spin-slow" />
            <span>AICTE Initiative • Kumaraguru College of Technology</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          </div>

          {/* Script Accent Tagline */}
          <p className="font-dancing text-3xl sm:text-4xl md:text-5xl text-amber-200/90 mb-2 font-normal drop-shadow-md tracking-wide">
            Innovate. Prototype. Transform.
          </p>

          {/* Grand Instrument Serif Title */}
          <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl lg:text-9xl leading-none font-normal tracking-[0.12em] uppercase serene-gold-text drop-shadow-2xl my-3">
            AICTE IDEA LAB
          </h1>

          {/* Sub-headline Description */}
          <p className="max-w-3xl text-stone-300 font-sans text-sm sm:text-base md:text-lg font-light leading-relaxed tracking-wide mt-3 mb-8 drop-shadow">
            Empowering students and faculty to transform innovative ideas into real-world solutions through hands-on learning, cutting-edge prototyping tools, and interdisciplinary collaboration.
          </p>

          {/* Dual Call To Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto">
            <button
              onClick={() => handleScrollTo('about')}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 font-sans text-xs uppercase font-bold tracking-[0.25em] hover:brightness-110 hover:shadow-2xl hover:shadow-amber-500/30 hover:scale-105 transition-all duration-300 cursor-pointer flex items-center justify-center gap-3 shadow-xl"
            >
              <span>Explore the Lab</span>
              <ChevronRight className="w-4 h-4 text-stone-950" />
            </button>

            <button
              onClick={() => navigate("/login")}
              className="w-full sm:w-auto px-8 py-4 rounded-full border border-amber-400/40 bg-stone-950/70 backdrop-blur-md text-amber-200 font-sans text-xs uppercase font-medium tracking-[0.25em] hover:bg-amber-400/10 hover:border-amber-300 transition-all duration-300 cursor-pointer flex items-center justify-center gap-3 shadow-lg"
            >
              <Compass className="w-4 h-4 text-amber-300" />
              <span>Apply for Access</span>
            </button>
          </div>

          {/* Highlighted Benefits Pill Strip */}
          <div className="mt-12 hidden md:flex items-center justify-center gap-8 border-t border-amber-500/20 pt-6 text-stone-400 text-xs font-sans tracking-widest uppercase">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Rapid Prototyping Infrastructure</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-amber-500/40" />
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Industry-Grade 3D & CNC Labs</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-amber-500/40" />
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>24/7 Access For Project Teams</span>
            </div>
          </div>

        </div>

        {/* Bottom Telemetry & Scroll Down Bar */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full pt-8 pb-4 flex items-center justify-between border-t border-white/10 text-stone-400 font-sans text-[11px] tracking-widest uppercase">
          
          {/* Live Campus Telemetry & IST Clock */}
          <div className="hidden lg:flex items-center gap-5 font-mono text-stone-400 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-md shadow-emerald-500/50" />
              <span className="text-stone-300 font-semibold uppercase tracking-wider">KCT CAMPUS</span>
            </div>
            <span className="text-stone-700">•</span>
            <div>
              <span className="text-stone-500 mr-1.5 uppercase">STATUS</span>
              <span className="text-emerald-300 font-bold tracking-wider">24/7 ONLINE</span>
            </div>
            <span className="text-stone-700">•</span>
            <div>
              <span className="text-stone-500 mr-1.5 uppercase">COIMBATORE</span>
              <span className="text-amber-200 font-semibold">{timeState.ist || '01:27 AM'}</span>
            </div>
          </div>

          {/* Central Scroll Prompt */}
          <button
            onClick={() => handleScrollTo('about')}
            className="mx-auto lg:mx-0 flex items-center gap-3 text-amber-300/80 hover:text-amber-200 transition-colors group cursor-pointer"
          >
            <span className="font-sans text-[10px] tracking-[0.3em]">SCROLL TO EXPLORE</span>
            <div className="w-7 h-7 rounded-full border border-amber-400/40 flex items-center justify-center group-hover:border-amber-300 group-hover:translate-y-1 transition-all">
              <ArrowDown className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
            </div>
          </button>

          {/* Environment Metrics */}
          <div className="hidden sm:flex items-center gap-4 text-stone-400">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Status: Active Sanctuary</span>
            </span>
            <span className="text-stone-700">|</span>
            <span>Location: KCT Coimbatore</span>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. ABOUT SECTION (#about)                                                */}
      {/* ========================================================================= */}
      <section id="about" className="py-28 relative bg-[#0d0a0b] text-stone-100">
        <div className="absolute inset-0 bg-radial from-amber-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="font-dancing text-3xl text-amber-200/90 mb-2">Fostering Innovation & Entrepreneurship</p>
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl uppercase tracking-widest text-stone-100 font-normal">
              About AICTE IDEA Lab
            </h2>
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Left Content */}
            <div className="animate-on-scroll fade-in-up duration-1000">
              <h3 className="text-2xl font-serif text-amber-200 mb-4 uppercase tracking-wider">
                Transforming Concepts Into Reality
              </h3>
              <p className="text-stone-300 text-base leading-relaxed mb-6 font-sans font-light">
                AICTE IDEA Lab is an initiative by the All India Council for Technical Education (AICTE) to promote innovation, creativity, and entrepreneurship among students.
              </p>
              <p className="text-stone-400 leading-relaxed mb-8 font-sans text-sm font-light">
                The lab provides access to modern tools, machines, and software that allow students to convert ideas into prototypes, work on interdisciplinary projects, develop real-world problem-solving skills, and prepare for startups and research careers.
              </p>

              {/* Key Check Highlights Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {[
                  "Convert ideas into prototypes",
                  "Interdisciplinary projects",
                  "Real-world problem-solving",
                  "Startup & research careers"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 serene-glass-card p-4 rounded-xl border border-amber-500/20 hover:border-amber-400/40 transition-all">
                    <div className="w-7 h-7 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4 text-amber-300" />
                    </div>
                    <span className="text-stone-200 text-sm font-sans font-medium">{item}</span>
                  </div>
                ))}
              </div>

            </div>

            {/* Right Image Showcase */}
            <div className="relative animate-on-scroll fade-in-right duration-1500">
              <div className="serene-glass-card p-3 rounded-3xl border border-amber-500/30 shadow-2xl relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 via-transparent to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <img
                  src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop"
                  alt="AICTE IDEA Lab Facilities"
                  className="w-full h-[450px] object-cover rounded-2xl filter brightness-95 contrast-105"
                />
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-stone-950/80 backdrop-blur-md border border-amber-500/30 text-center">
                  <p className="font-serif text-amber-200 text-lg uppercase tracking-wider">Hands-On Prototyping Laboratory</p>
                  <p className="font-sans text-stone-400 text-xs mt-0.5">Kumaraguru College of Technology Campus</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. VISION & MISSION SECTION                                               */}
      {/* ========================================================================= */}
      <section className="py-24 bg-[#0a0809] relative border-t border-amber-500/15">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="font-dancing text-3xl text-amber-200/90 mb-2">Guiding Principles of Excellence</p>
            <h2 className="font-serif text-4xl sm:text-5xl uppercase tracking-widest text-stone-100">
              Vision & Mission
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Vision Card */}
            <div className="serene-glass-card p-10 rounded-3xl border border-amber-500/25 relative overflow-hidden group hover:border-amber-400/50 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
              <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-amber-300 text-3xl">visibility</span>
              </div>
              <h3 className="font-serif text-3xl text-stone-100 mb-4 uppercase tracking-wider">Vision</h3>
              <p className="text-stone-300 font-sans text-base font-light leading-relaxed">
                To create a culture of innovation, design thinking, and entrepreneurship among students by providing state-of-the-art infrastructure, specialized tools, and expert mentorship.
              </p>
            </div>

            {/* Mission Card */}
            <div className="serene-glass-card p-10 rounded-3xl border border-amber-500/25 relative overflow-hidden group hover:border-amber-400/50 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />
              <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-amber-300 text-3xl">flag</span>
              </div>
              <h3 className="font-serif text-3xl text-stone-100 mb-4 uppercase tracking-wider">Mission</h3>
              <ul className="space-y-3 font-sans text-stone-300 text-sm font-light">
                {[
                  "Encourage hands-on learning and experimentation",
                  "Support interdisciplinary innovation projects",
                  "Foster startup culture among students",
                  "Provide access to modern prototyping tools"
                ].map((mission, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                    <span>{mission}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. KEY FEATURES SECTION                                                   */}
      {/* ========================================================================= */}
      <section className="py-28 bg-[#0d0a0b] relative border-t border-amber-500/15">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="font-dancing text-3xl text-amber-200/90 mb-2">End-to-End Innovation Ecosystem</p>
            <h2 className="font-serif text-4xl sm:text-5xl uppercase tracking-widest text-stone-100">
              Key Features
            </h2>
            <p className="text-stone-400 font-sans text-sm tracking-wider uppercase mt-3">Everything you need to bring your ideas to life</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "print",
                title: "Advanced Prototyping",
                desc: "State-of-the-art equipment for rapid prototyping and precision manufacturing"
              },
              {
                icon: "view_in_ar",
                title: "3D Printing & Manufacturing",
                desc: "Multiple high-precision 3D printers and rapid manufacturing technologies"
              },
              {
                icon: "memory",
                title: "Electronics & IoT",
                desc: "Advanced development kits and testing instruments for electronics projects"
              },
              {
                icon: "computer",
                title: "Design & Simulation Software",
                desc: "Industry-standard CAD/CAM, EDA, and simulation software suites"
              },
              {
                icon: "groups",
                title: "Collaborative Workspaces",
                desc: "Modern open workspaces designed for interdisciplinary teamwork"
              },
              {
                icon: "school",
                title: "Expert Mentorship",
                desc: "Technical guidance from experienced faculty and industry leaders"
              }
            ].map((feat, idx) => (
              <div
                key={idx}
                className="serene-glass-card p-8 rounded-2xl border border-amber-500/20 hover:border-amber-400/50 hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-amber-300 text-2xl">{feat.icon}</span>
                </div>
                <h3 className="font-serif text-2xl text-stone-100 mb-2 uppercase tracking-wide">{feat.title}</h3>
                <p className="text-stone-400 font-sans text-sm font-light leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. FACILITIES AVAILABLE SECTION (#facilities)                              */}
      {/* ========================================================================= */}
      <section id="facilities" className="py-28 bg-[#0a0809] relative border-t border-amber-500/15">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="font-dancing text-3xl text-amber-200/90 mb-2">Cutting-Edge Infrastructure</p>
            <h2 className="font-serif text-4xl sm:text-5xl uppercase tracking-widest text-stone-100">
              Facilities Available
            </h2>
            <p className="text-stone-400 font-sans text-sm tracking-wider uppercase mt-3">Access to world-class hardware and software resources</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Hardware Card */}
            <div className="serene-glass-card p-10 rounded-3xl border border-amber-500/30 hover:border-amber-400/50 transition-all">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/40 flex items-center justify-center">
                  <span className="material-symbols-outlined text-amber-300 text-3xl">hardware</span>
                </div>
                <div>
                  <h3 className="font-serif text-3xl text-stone-100 uppercase tracking-wider">Hardware Infrastructure</h3>
                  <p className="text-amber-200/80 font-dancing text-lg">Physical Prototyping & Fabrication</p>
                </div>
              </div>
              <ul className="space-y-4 font-sans text-stone-200 text-sm">
                {[
                  "Industrial & Desktop 3D Printers (FDM/SLA)",
                  "Laser Cutting & Engraving Machines",
                  "CNC Milling & Turning Machines",
                  "PCB Prototyping & Soldering Stations",
                  "Robotics & Embedded Hardware Kits"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3.5 p-3 rounded-xl bg-stone-900/60 border border-white/5">
                    <span className="material-symbols-outlined text-amber-400 text-lg">check_circle</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Software Card */}
            <div className="serene-glass-card p-10 rounded-3xl border border-amber-500/30 hover:border-amber-400/50 transition-all">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/40 flex items-center justify-center">
                  <span className="material-symbols-outlined text-amber-300 text-3xl">developer_board</span>
                </div>
                <div>
                  <h3 className="font-serif text-3xl text-stone-100 uppercase tracking-wider">Software Suite</h3>
                  <p className="text-amber-200/80 font-dancing text-lg">Virtual Design & Simulation Tools</p>
                </div>
              </div>
              <ul className="space-y-4 font-sans text-stone-200 text-sm">
                {[
                  "Industry-Standard CAD/CAM Modeling Tools",
                  "Finite Element Analysis & Simulation Software",
                  "Embedded Systems & IoT Development IDEs",
                  "Circuit Design & PCB Layout Suites",
                  "3D Slicing & CAM Post-Processor Suites"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3.5 p-3 rounded-xl bg-stone-900/60 border border-white/5">
                    <span className="material-symbols-outlined text-amber-400 text-lg">check_circle</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. WHO CAN USE THE LAB SECTION (#people)                                  */}
      {/* ========================================================================= */}
      <section id="people" className="py-28 bg-[#0d0a0b] relative border-t border-amber-500/15">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="font-dancing text-3xl text-amber-200/90 mb-2">Open to All Innovators</p>
            <h2 className="font-serif text-4xl sm:text-5xl uppercase tracking-widest text-stone-100">
              Who Can Use the Lab?
            </h2>
            <p className="text-stone-400 font-sans text-sm tracking-wider uppercase mt-3">Our facilities welcome all members of the academic & research community</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { title: "Undergraduate Students", icon: "person" },
              { title: "Postgraduate Students", icon: "school" },
              { title: "Faculty Members", icon: "badge" },
              { title: "Research Scholars", icon: "science" },
              { title: "Startup Teams", icon: "rocket_launch" }
            ].map((persona, idx) => (
              <div
                key={idx}
                className="serene-glass-card p-6 rounded-2xl text-center border border-amber-500/20 hover:border-amber-400/50 hover:scale-105 transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-amber-300 text-3xl">{persona.icon}</span>
                </div>
                <h4 className="font-serif text-lg text-stone-100 uppercase tracking-wide font-normal">{persona.title}</h4>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. ACTIVITIES CONDUCTED SECTION (#activities)                              */}
      {/* ========================================================================= */}
      <section id="activities" className="py-28 bg-[#0a0809] relative border-t border-amber-500/15">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="font-dancing text-3xl text-amber-200/90 mb-2">Engage & Excel</p>
            <h2 className="font-serif text-4xl sm:text-5xl uppercase tracking-widest text-stone-100">
              Activities Conducted
            </h2>
            <p className="text-stone-400 font-sans text-sm tracking-wider uppercase mt-3">Regular innovation challenges, hackathons, and training bootcamps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Hackathons",
                icon: "code",
                desc: "Intensive coding and hardware problem-solving hackathons to build functional working prototypes"
              },
              {
                title: "Innovation Challenges",
                icon: "emoji_events",
                desc: "Competitive challenges sponsored by industry partners to address real-world industrial problems"
              },
              {
                title: "Workshops & Bootcamps",
                icon: "workspace_premium",
                desc: "Hands-on training sessions on 3D printing, embedded Systems, IoT, and AI prototyping"
              },
              {
                title: "Startup Incubation",
                icon: "trending_up",
                desc: "Structured support programs helping student teams turn validated prototypes into viable startups"
              },
              {
                title: "Project Exhibitions",
                icon: "gallery_thumbnail",
                desc: "Annual showcases presenting student innovations to academic, corporate, and investor leaders"
              },
              {
                title: "Networking Events",
                icon: "hub",
                desc: "Interdisciplinary meetups connecting aspiring student creators with alumni and industry mentors"
              }
            ].map((act, idx) => (
              <div
                key={idx}
                className="serene-glass-card p-8 rounded-2xl border border-amber-500/20 hover:border-amber-400/50 hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mb-5">
                  <span className="material-symbols-outlined text-amber-300 text-2xl">{act.icon}</span>
                </div>
                <h3 className="font-serif text-2xl text-stone-100 mb-2 uppercase tracking-wide">{act.title}</h3>
                <p className="text-stone-400 font-sans text-sm font-light leading-relaxed">{act.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. BENEFITS FOR STUDENTS SECTION (#benefits)                             */}
      {/* ========================================================================= */}
      <section id="benefits" className="py-28 bg-[#0d0a0b] relative border-t border-amber-500/15">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Image */}
            <div className="animate-on-scroll fade-in-left duration-1500">
              <div className="serene-glass-card p-3 rounded-3xl border border-amber-500/30 relative">
                <img
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=600&fit=crop"
                  alt="Students Collaborating"
                  className="w-full h-[520px] object-cover rounded-2xl filter brightness-95 contrast-105"
                />
                <div className="absolute top-8 left-8 bg-stone-950/80 backdrop-blur-md border border-amber-500/30 px-5 py-2.5 rounded-full text-amber-200 font-serif text-sm uppercase tracking-wider">
                  ✦ Student Empowerment
                </div>
              </div>
            </div>

            {/* Right Benefits List */}
            <div className="animate-on-scroll fade-in-up duration-1000">
              <p className="font-dancing text-3xl text-amber-200/90 mb-2">Unlocking Student Potential</p>
              <h2 className="font-serif text-4xl sm:text-5xl uppercase tracking-widest text-stone-100 mb-8">
                Benefits for Students
              </h2>

              <div className="space-y-4">
                {[
                  {
                    icon: "home",
                    title: "Hands-on Practical Experience",
                    desc: "Learn by doing with industrial tools, CNC machines, and real-world engineering projects"
                  },
                  {
                    icon: "devices",
                    title: "Access to Modern Technology",
                    desc: "Work with cutting-edge 3D scanners, printers, and design simulation software"
                  },
                  {
                    icon: "support_agent",
                    title: "Mentorship and Guidance",
                    desc: "One-on-one technical advice from specialized faculty and veteran industry advisors"
                  },
                  {
                    icon: "copyright",
                    title: "Patents and Startups Support",
                    desc: "Dedicated guidance for filing intellectual property patents and launching technology ventures"
                  },
                  {
                    icon: "military_tech",
                    title: "National-Level Competitions",
                    desc: "Sponsorship and training to participate in prestigious national innovation contests"
                  }
                ].map((b, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 p-5 serene-glass-card rounded-xl border border-amber-500/20 hover:border-amber-400/40 transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-amber-300 text-xl">{b.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-serif text-xl text-stone-100 uppercase tracking-wide mb-1">{b.title}</h4>
                      <p className="text-stone-400 font-sans text-xs font-light leading-relaxed">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. CONTACT US SECTION (#contact)                                          */}
      {/* ========================================================================= */}
      <section id="contact" className="py-28 bg-[#0a0809] relative border-t border-amber-500/15">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="font-dancing text-3xl text-amber-200/90 mb-2">Connect With Our Team</p>
            <h2 className="font-serif text-4xl sm:text-5xl uppercase tracking-widest text-stone-100">
              Get in Touch
            </h2>
            <p className="text-stone-400 font-sans text-sm tracking-wider uppercase mt-3">Ready to start your innovation journey? Contact us to access the AICTE IDEA Lab</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Contact Info */}
            <div className="space-y-8 animate-on-scroll fade-in-up duration-1000">
              
              {/* Address */}
              <div className="flex items-start gap-5 serene-glass-card p-6 rounded-2xl border border-amber-500/20">
                <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-amber-300 text-2xl">location_on</span>
                </div>
                <div>
                  <h4 className="font-serif text-2xl text-stone-100 uppercase tracking-wide mb-1 font-normal">Sanctuary Address</h4>
                  <p className="text-stone-300 font-sans text-sm font-light leading-relaxed">
                    AICTE IDEA Lab<br />
                    Kumaraguru College of Technology<br />
                    Coimbatore, Tamil Nadu, India
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-5 serene-glass-card p-6 rounded-2xl border border-amber-500/20">
                <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-amber-300 text-2xl">mail</span>
                </div>
                <div>
                  <h4 className="font-serif text-2xl text-stone-100 uppercase tracking-wide mb-1 font-normal">Electronic Mail</h4>
                  <p className="text-amber-200 font-sans text-sm font-light">idealab@kct.ac.in</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-5 serene-glass-card p-6 rounded-2xl border border-amber-500/20">
                <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-amber-300 text-2xl">call</span>
                </div>
                <div>
                  <h4 className="font-serif text-2xl text-stone-100 uppercase tracking-wide mb-1 font-normal">Coordinator Hotline</h4>
                  <p className="text-stone-300 font-sans text-sm font-light">
                    Dr. S. Sasikala, Coordinator<br />
                    <span className="text-amber-200 font-medium">+91 9443525425</span>
                  </p>
                </div>
              </div>

            </div>

            {/* Interactive Form */}
            <div className="serene-glass-card p-10 rounded-3xl border border-amber-500/30 shadow-2xl relative">
              <h3 className="font-serif text-3xl text-stone-100 uppercase tracking-wider mb-6">
                Send Us an Inquiry
              </h3>
              <form className="space-y-4 font-sans text-stone-200" onSubmit={(e) => e.preventDefault()}>
                
                <div>
                  <label className="block text-xs font-sans uppercase tracking-widest text-stone-400 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3.5 rounded-xl bg-stone-900/80 border border-amber-500/30 text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all text-sm"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans uppercase tracking-widest text-stone-400 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3.5 rounded-xl bg-stone-900/80 border border-amber-500/30 text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all text-sm"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans uppercase tracking-widest text-stone-400 mb-2">
                    Category
                  </label>
                  <select
                    className="w-full px-4 py-3.5 rounded-xl bg-stone-900/80 border border-amber-500/30 text-stone-100 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all text-sm"
                  >
                    <option className="bg-stone-900 text-stone-200">Select your category</option>
                    <option className="bg-stone-900 text-stone-200">Undergraduate Student</option>
                    <option className="bg-stone-900 text-stone-200">Postgraduate Student</option>
                    <option className="bg-stone-900 text-stone-200">Faculty Member</option>
                    <option className="bg-stone-900 text-stone-200">Research Scholar</option>
                    <option className="bg-stone-900 text-stone-200">Startup Team</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-sans uppercase tracking-widest text-stone-400 mb-2">
                    Message
                  </label>
                  <textarea
                    rows="4"
                    className="w-full px-4 py-3.5 rounded-xl bg-stone-900/80 border border-amber-500/30 text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all text-sm"
                    placeholder="Tell us about your project or inquiry"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 font-sans text-xs uppercase font-bold tracking-[0.25em] hover:brightness-110 hover:shadow-xl hover:shadow-amber-500/20 hover:scale-[1.02] transition-all duration-300 cursor-pointer shadow-lg mt-2"
                >
                  Submit Inquiry
                </button>

              </form>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. LUXURY FOOTER                                                         */}
      {/* ========================================================================= */}
      <Footer />

    </div>
  );
};

export default Hero;