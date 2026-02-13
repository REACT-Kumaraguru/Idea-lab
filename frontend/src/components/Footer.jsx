const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-primary to-secondary p-2 rounded-lg">
                <span className="material-symbols-outlined text-white text-2xl">
                  <img src="/Idea lab.png" alt="AICTE IDEA Lab" width="30" />
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">AICTE IDEA Lab</h2>
                <p className="text-xs text-slate-400">Innovation Hub</p>
              </div>
            </div>

            <p className="text-slate-400 leading-relaxed mb-6 max-w-md">
              Empowering the next generation of innovators through state-of-the-art facilities,
              mentorship, and hands-on learning experiences.
            </p>

            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-primary transition-colors">
                <span className="material-symbols-outlined text-lg">share</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-primary transition-colors">
                <span className="material-symbols-outlined text-lg">link</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-primary transition-colors">
                <span className="material-symbols-outlined text-lg">language</span>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-6">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#about" className="hover:text-primary transition-colors">About Lab</a></li>
              <li><a href="#facilities" className="hover:text-primary transition-colors">Facilities</a></li>
              <li><a href="#activities" className="hover:text-primary transition-colors">Activities</a></li>
              <li><a href="#benefits" className="hover:text-primary transition-colors">Benefits</a></li>
              <li><a href="#contact" className="hover:text-primary transition-colors">Contact Us</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-6">Resources</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-primary transition-colors">Application Form</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Lab Guidelines</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Project Showcase</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">FAQs</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Support</a></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
          <p>© 2026 AICTE IDEA Lab, Kumaraguru College of Technology. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;