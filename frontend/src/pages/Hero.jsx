import useScrollAnimation from '../hooks/useScrollAnimation';
import {
  Check,
  ArrowRight,
  Verified,
  MapPin,
  Mail,
  Phone
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  useScrollAnimation();

  return (
    <>
      {/* Hero Section */}
      <section className="bg-slate-50 py-20 lg:py-28 hero-gradient">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Text Content */}
            <div className="flex flex-col gap-8">

              {/* Badge */}
              <div className="animate-on-scroll fade-in-up duration-1000 ease-out inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wide w-fit">
                <Verified className="w-4 h-4" />

                AICTE Initiative
              </div>

              {/* Heading */}
              <h1 className="animate-on-scroll fade-in-up duration-1500 delay-100 ease-out text-5xl lg:text-6xl font-bold leading-tight text-slate-900">
                AICTE IDEA Lab –
                <span className="text-blue-700">
                  Innovate. Prototype. Transform.
                </span>
              </h1>

              {/* Description */}
              <p className="animate-on-scroll fade-in-up duration-1500 delay-200 ease-out text-lg text-slate-600 leading-relaxed">
                Empowering students and faculty to transform innovative ideas into real-world solutions through hands-on learning, modern tools, and interdisciplinary collaboration.
              </p>

              {/* Buttons */}
              <div className="animate-on-scroll fade-in-up duration-1500 delay-300 ease-out flex flex-wrap gap-4 pt-4">
                <button className="bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-base hover:bg-blue-800 transition-all shadow-sm flex items-center gap-2 hover:scale-105 hover:shadow-lg">
                  Explore the Lab
                  <ArrowRight className="w-4 h-4" />

                </button>

                <button
                  onClick={() => navigate("/products")}
                  className="bg-white text-slate-700 border border-slate-300 px-8 py-4 rounded-lg font-semibold text-base hover:border-blue-700 hover:text-blue-700 transition-all hover:scale-105"
                >
                  Apply for Access
                </button>
              </div>
            </div>

            {/* Image */}
            <div className="relative animate-on-scroll fade-in-right duration-2000 delay-200 ease-out">
              <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200 hover:shadow-2xl transition-shadow duration-500">
                <img
                  src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop"
                  alt="AICTE IDEA Lab"
                  className="w-full h-[500px] object-cover"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="animate-on-scroll fade-in-up duration-1000 ease-out">
              <h4 className="text-primary font-semibold uppercase tracking-wider text-sm mb-4">About AICTE IDEA Lab</h4>
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-6">
                Fostering Innovation & Entrepreneurship
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-6">
                AICTE IDEA Lab is an initiative by the All India Council for Technical Education (AICTE) to promote innovation, creativity, and entrepreneurship among students.
              </p>
              <p className="text-slate-600 leading-relaxed mb-8">
                The lab provides access to modern tools, machines, and software that allow students to convert ideas into prototypes, work on interdisciplinary projects, develop real-world problem-solving skills, and prepare for startups and research careers.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-1">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-slate-700">Convert ideas into prototypes</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-1">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-slate-700">Interdisciplinary projects</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-1">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-slate-700">Real-world problem-solving</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-1">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-slate-700">Startup & research careers</p>
                </div>
              </div>
            </div>

            <div className="relative animate-on-scroll fade-in-left duration-1500 delay-200 ease-out">
              <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop" alt="Team collaboration" className="rounded-2xl shadow-xl border border-slate-200 w-full h-[450px] object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Vision Card */}
            <div className="animate-on-scroll fade-in-up duration-1000 ease-out bg-white p-10 rounded-2xl border border-slate-200 shadow-sm card-hover">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-white text-3xl">visibility</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Vision</h3>
              <p className="text-slate-600 leading-relaxed">
                To create a culture of innovation, design thinking, and entrepreneurship among students by providing state-of-the-art infrastructure and mentorship.
              </p>
            </div>

            {/* Mission Card */}
            <div className="animate-on-scroll fade-in-up duration-1000 delay-200 ease-out bg-white p-10 rounded-2xl border border-slate-200 shadow-sm card-hover">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-secondary to-purple-600 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-white text-3xl">flag</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Mission</h3>
              <ul className="space-y-3 text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary text-sm mt-0.5">arrow_right</span>
                  Encourage hands-on learning and experimentation
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary text-sm mt-0.5">arrow_right</span>
                  Support interdisciplinary innovation projects
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary text-sm mt-0.5">arrow_right</span>
                  Foster startup culture among students
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary text-sm mt-0.5">arrow_right</span>
                  Provide access to modern prototyping tools
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16 animate-on-scroll fade-in-up duration-1000 ease-out">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">Key Features</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">Everything you need to bring your ideas to life</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="animate-on-scroll fade-in-up duration-1000 delay-100 ease-out bg-slate-50 p-8 rounded-xl border border-slate-200 card-hover">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-primary text-2xl">print</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Advanced Prototyping</h3>
              <p className="text-slate-600 text-sm">State-of-the-art equipment for rapid prototyping and manufacturing</p>
            </div>

            <div className="animate-on-scroll fade-in-up duration-1000 delay-200 ease-out bg-slate-50 p-8 rounded-xl border border-slate-200 card-hover">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-secondary text-2xl">view_in_ar</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">3D Printing & Manufacturing</h3>
              <p className="text-slate-600 text-sm">Multiple 3D printers and rapid manufacturing technologies</p>
            </div>

            <div className="animate-on-scroll fade-in-up duration-1000 delay-300 ease-out bg-slate-50 p-8 rounded-xl border border-slate-200 card-hover">
              <div className="w-12 h-12 rounded-lg bg-cyan-100 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-accent text-2xl">memory</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Electronics & IoT</h3>
              <p className="text-slate-600 text-sm">Development kits for electronics and IoT projects</p>
            </div>

            <div className="animate-on-scroll fade-in-up duration-1000 delay-400 ease-out bg-slate-50 p-8 rounded-xl border border-slate-200 card-hover">
              <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-indigo-600 text-2xl">computer</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Design & Simulation Software</h3>
              <p className="text-slate-600 text-sm">Industry-standard CAD/CAM and simulation tools</p>
            </div>

            <div className="animate-on-scroll fade-in-up duration-1000 delay-500 ease-out bg-slate-50 p-8 rounded-xl border border-slate-200 card-hover">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-green-600 text-2xl">groups</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Collaborative Workspaces</h3>
              <p className="text-slate-600 text-sm">Modern spaces designed for teamwork and innovation</p>
            </div>

            <div className="animate-on-scroll fade-in-up duration-1000 delay-700 ease-out bg-slate-50 p-8 rounded-xl border border-slate-200 card-hover">
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-orange-600 text-2xl">school</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Expert Mentorship</h3>
              <p className="text-slate-600 text-sm">Guidance from faculty and industry professionals</p>
            </div>
          </div>
        </div>
      </section>

      {/* Facilities Available */}
      <section id="facilities" className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16 animate-on-scroll fade-in-up duration-1000 ease-out">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">Facilities Available</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">Access to cutting-edge hardware and software</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Hardware */}
            <div className="animate-on-scroll fade-in-up duration-1000 ease-out bg-white p-10 rounded-2xl border border-slate-200 shadow-sm card-hover">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-2xl">hardware</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Hardware</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-slate-700">
                  <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                  3D Printers
                </li>
                <li className="flex items-center gap-3 text-slate-700">
                  <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                  Laser Cutting Machines
                </li>
                <li className="flex items-center gap-3 text-slate-700">
                  <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                  CNC Machines
                </li>
                <li className="flex items-center gap-3 text-slate-700">
                  <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                  PCB Prototyping Tools
                </li>
                <li className="flex items-center gap-3 text-slate-700">
                  <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                  Robotics Kits
                </li>
              </ul>
            </div>

            {/* Software */}
            <div className="animate-on-scroll fade-in-up duration-1000 delay-200 ease-out bg-white p-10 rounded-2xl border border-slate-200 shadow-sm card-hover">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary text-2xl">developer_board</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Software</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-slate-700">
                  <span className="material-symbols-outlined text-secondary text-xl">check_circle</span>
                  CAD/CAM Tools
                </li>
                <li className="flex items-center gap-3 text-slate-700">
                  <span className="material-symbols-outlined text-secondary text-xl">check_circle</span>
                  Simulation Software
                </li>
                <li className="flex items-center gap-3 text-slate-700">
                  <span className="material-symbols-outlined text-secondary text-xl">check_circle</span>
                  Embedded Systems Development Tools
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Who Can Use */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16 animate-on-scroll fade-in-up duration-1000 ease-out">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">Who Can Use the Lab?</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">Our facilities are open to various members of the academic community</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <div className="text-center animate-on-scroll fade-in-up duration-1000 delay-100 ease-out">
              <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4 scale-in duration-500">
                <span className="material-symbols-outlined text-primary text-3xl">person</span>
              </div>
              <h4 className="font-semibold text-slate-900 mb-1">Undergraduate Students</h4>
            </div>

            <div className="text-center animate-on-scroll fade-in-up duration-1000 delay-200 ease-out">
              <div className="w-20 h-20 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-4 scale-in duration-500">
                <span className="material-symbols-outlined text-secondary text-3xl">school</span>
              </div>
              <h4 className="font-semibold text-slate-900 mb-1">Postgraduate Students</h4>
            </div>

            <div className="text-center animate-on-scroll fade-in-up duration-1000 delay-300 ease-out">
              <div className="w-20 h-20 rounded-full bg-cyan-50 flex items-center justify-center mx-auto mb-4 scale-in duration-500">
                <span className="material-symbols-outlined text-accent text-3xl">badge</span>
              </div>
              <h4 className="font-semibold text-slate-900 mb-1">Faculty Members</h4>
            </div>

            <div className="text-center animate-on-scroll fade-in-up duration-1000 delay-400 ease-out">
              <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-4 scale-in duration-500">
                <span className="material-symbols-outlined text-indigo-600 text-3xl">science</span>
              </div>
              <h4 className="font-semibold text-slate-900 mb-1">Research Scholars</h4>
            </div>

            <div className="text-center animate-on-scroll fade-in-up duration-1000 delay-500 ease-out">
              <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4 scale-in duration-500">
                <span className="material-symbols-outlined text-green-600 text-3xl">rocket_launch</span>
              </div>
              <h4 className="font-semibold text-slate-900 mb-1">Startup Teams</h4>
            </div>
          </div>
        </div>
      </section>

      {/* Activities */}
      <section id="activities" className="py-20 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16 animate-on-scroll fade-in-up duration-1000 ease-out">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">Activities Conducted</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">Engage in various innovation-focused programs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="animate-on-scroll fade-in-up duration-1000 delay-100 ease-out bg-white p-8 rounded-xl border border-slate-200 shadow-sm card-hover">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-white text-2xl">code</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Hackathons</h3>
              <p className="text-slate-600">Intensive coding and problem-solving events to build innovative solutions</p>
            </div>

            <div className="animate-on-scroll fade-in-up duration-1000 delay-200 ease-out bg-white p-8 rounded-xl border border-slate-200 shadow-sm card-hover">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-white text-2xl">emoji_events</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Innovation Challenges</h3>
              <p className="text-slate-600">Competitions to solve real-world problems with creative solutions</p>
            </div>

            <div className="animate-on-scroll fade-in-up duration-1000 delay-300 ease-out bg-white p-8 rounded-xl border border-slate-200 shadow-sm card-hover">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-white text-2xl">workspace_premium</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Workshops & Bootcamps</h3>
              <p className="text-slate-600">Hands-on training sessions on cutting-edge technologies</p>
            </div>

            <div className="animate-on-scroll fade-in-up duration-1000 delay-400 ease-out bg-white p-8 rounded-xl border border-slate-200 shadow-sm card-hover">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-white text-2xl">trending_up</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Startup Incubation</h3>
              <p className="text-slate-600">Support programs to nurture and grow student startups</p>
            </div>

            <div className="animate-on-scroll fade-in-up duration-1000 delay-500 ease-out bg-white p-8 rounded-xl border border-slate-200 shadow-sm card-hover">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-white text-2xl">gallery_thumbnail</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Project Exhibitions</h3>
              <p className="text-slate-600">Showcase innovative projects to industry and academic leaders</p>
            </div>

            <div className="animate-on-scroll fade-in-up duration-1000 delay-600 ease-out bg-white p-8 rounded-xl border border-slate-200 shadow-sm card-hover">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-white text-2xl">hub</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Networking Events</h3>
              <p className="text-slate-600">Connect with mentors, investors, and fellow innovators</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="animate-on-scroll fade-in-left duration-1500 ease-out">
              <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=600&fit=crop" alt="Students working" className="rounded-2xl shadow-xl border border-slate-200 w-full h-[500px] object-cover" />
            </div>

            <div className="animate-on-scroll fade-in-up duration-1000 ease-out">
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-8">Benefits for Students</h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-xl border border-slate-200 card-hover">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary">home</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-lg mb-1">Hands-on Practical Experience</h4>
                    <p className="text-slate-600 text-sm">Learn by doing with real equipment and projects</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-xl border border-slate-200 card-hover">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-secondary">devices</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-lg mb-1">Access to Modern Technology</h4>
                    <p className="text-slate-600 text-sm">Work with industry-standard tools and equipment</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-xl border border-slate-200 card-hover">
                  <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-accent">support_agent</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-lg mb-1">Mentorship and Guidance</h4>
                    <p className="text-slate-600 text-sm">Expert support from faculty and industry professionals</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-xl border border-slate-200 card-hover">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-green-600">copyright</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-lg mb-1">Patents and Startups</h4>
                    <p className="text-slate-600 text-sm">Opportunities to file patents and launch ventures</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-xl border border-slate-200 card-hover">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-orange-600">military_tech</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-lg mb-1">National-Level Competitions</h4>
                    <p className="text-slate-600 text-sm">Participate in prestigious innovation contests</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Contact Info */}
            <div className="animate-on-scroll fade-in-up duration-1000 ease-out">
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
                Get in Touch
              </h2>
              <p className="text-slate-600 text-lg mb-8">
                Ready to start your innovation journey? Contact us to learn more about accessing the AICTE IDEA Lab.
              </p>

              <div className="space-y-6">

                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-slate-900/5 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-slate-700 text-2xl">location_on</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-lg mb-1">Address</h4>
                    <p className="text-slate-600">
                      AICTE IDEA Lab<br />
                      Kumaraguru College of Technology<br />
                      Coimbatore, Tamil Nadu, India
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-slate-900/5 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-slate-700 text-2xl">mail</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-lg mb-1">Email</h4>
                    <p className="text-slate-600">idealab@kct.ac.in</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-slate-900/5 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-slate-700 text-2xl">call</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-lg mb-1">Phone</h4>
                    <p className="text-slate-600">
                      Dr. S. Sasikala, Coordinator<br />
                      +91 9443525425
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Contact Form */}
            <div className="animate-on-scroll fade-in-up duration-1000 delay-200 ease-out bg-white p-10 rounded-2xl shadow-lg border border-slate-200">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">
                Send us a Message
              </h3>
              <form className="space-y-4">

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name
                  </label>
                  <input type="text"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    placeholder="Your name" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address
                  </label>
                  <input type="email"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    placeholder="you@example.com" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Category
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600">
                    <option>Select your category</option>
                    <option>Undergraduate Student</option>
                    <option>Postgraduate Student</option>
                    <option>Faculty Member</option>
                    <option>Research Scholar</option>
                    <option>Startup Team</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Message
                  </label>
                  <textarea rows="4"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    placeholder="Tell us about your project or inquiry"></textarea>
                </div>

                <button type="submit"
                  className="w-full bg-slate-900 text-white py-4 rounded-lg font-semibold text-base hover:bg-slate-800 transition-all">
                  Submit Inquiry
                </button>

              </form>
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;