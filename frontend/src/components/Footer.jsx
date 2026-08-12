import React from "react";
import IdeaLabLogo from "../assets/idea-lab.png";

const Footer = () => {
  return (
    <footer className="bg-[#0a0809] border-t border-amber-500/20 text-stone-300 py-16 relative overflow-hidden select-none">
      <div className="absolute inset-0 spectral-prism-shimmer opacity-10 pointer-events-none" />
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-stone-900 border border-amber-500/30 p-2.5 rounded-xl shadow-lg">
                <img src={IdeaLabLogo} alt="AICTE IDEA Lab Logo" className="w-8 h-8 object-contain" />
              </div>
              <div>
                <h2 className="text-2xl font-serif tracking-widest uppercase text-stone-100 font-normal">AICTE IDEA Lab</h2>
                <p className="text-xs font-dancing text-amber-200/90">Sanctuary of Mindful Innovation</p>
              </div>
            </div>

            <p className="text-stone-400 font-sans text-sm font-light leading-relaxed mb-6 max-w-md">
              Empowering the next generation of technical innovators, researchers, and entrepreneurs through state-of-the-art infrastructure, expert mentorship, and hands-on rapid prototyping experiences.
            </p>

            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-full border border-amber-500/30 bg-stone-900/60 flex items-center justify-center text-amber-300 hover:bg-amber-400 hover:text-stone-950 transition-all duration-300 shadow-md">
                <span className="material-symbols-outlined text-lg">share</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-amber-500/30 bg-stone-900/60 flex items-center justify-center text-amber-300 hover:bg-amber-400 hover:text-stone-950 transition-all duration-300 shadow-md">
                <span className="material-symbols-outlined text-lg">link</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-amber-500/30 bg-stone-900/60 flex items-center justify-center text-amber-300 hover:bg-amber-400 hover:text-stone-950 transition-all duration-300 shadow-md">
                <span className="material-symbols-outlined text-lg">language</span>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-serif text-lg tracking-wider text-amber-100 uppercase mb-6 font-normal">Quick Links</h4>
            <ul className="space-y-3 font-sans text-xs tracking-widest uppercase text-stone-400">
              <li><a href="#about" className="hover:text-amber-300 transition-colors">About Lab</a></li>
              <li><a href="#facilities" className="hover:text-amber-300 transition-colors">Facilities</a></li>
              <li><a href="#activities" className="hover:text-amber-300 transition-colors">Activities</a></li>
              <li><a href="#benefits" className="hover:text-amber-300 transition-colors">Benefits</a></li>
              <li><a href="#contact" className="hover:text-amber-300 transition-colors">Contact Us</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg tracking-wider text-amber-100 uppercase mb-6 font-normal">Resources</h4>
            <ul className="space-y-3 font-sans text-xs tracking-widest uppercase text-stone-400">
              <li><a href="/products" className="hover:text-amber-300 transition-colors">Application Form</a></li>
              <li><a href="#about" className="hover:text-amber-300 transition-colors">Lab Guidelines</a></li>
              <li><a href="#activities" className="hover:text-amber-300 transition-colors">Project Showcase</a></li>
              <li><a href="#contact" className="hover:text-amber-300 transition-colors">FAQs</a></li>
              <li><a href="#contact" className="hover:text-amber-300 transition-colors">Support</a></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-amber-500/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans tracking-wider text-stone-500">
          <p>© 2026 AICTE IDEA Lab, Kumaraguru College of Technology. All rights reserved.</p>
          <p className="font-dancing text-amber-200/80 text-sm">Innovate • Prototype • Transform</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;