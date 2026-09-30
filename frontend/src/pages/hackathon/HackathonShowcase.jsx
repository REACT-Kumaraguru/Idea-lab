import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { axiosInstance } from "../../lib/axios.js";
import { Trophy, Github, ExternalLink, Award, Users, Search, Sparkles, Filter, ChevronRight, Image as ImageIcon } from "lucide-react";
import AmbientBackground from "../../components/AmbientBackground";

export default function HackathonShowcase() {
  const { slug = "ich2026" } = useParams();
  const [data, setData] = useState({ hackathon: null, showcase: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("all");
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    setLoading(true);
    axiosInstance
      .get(`/ich2026/hackathons/${slug}/showcase`)
      .then((res) => {
        setData(res.data || { hackathon: null, showcase: [] });
      })
      .catch((err) => {
        console.error("Failed to load showcase:", err);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const themes = Array.from(new Set(data.showcase.map((p) => p.theme).filter(Boolean)));

  const filteredProjects = data.showcase.filter((p) => {
    if (selectedTheme !== "all" && p.theme !== selectedTheme) return false;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const matchTitle = (p.title || "").toLowerCase().includes(q);
      const matchTeam = (p.teamName || "").toLowerCase().includes(q);
      const matchDesc = (p.description || "").toLowerCase().includes(q);
      return matchTitle || matchTeam || matchDesc;
    }
    return true;
  });

  return (
    <div className="relative min-h-screen bg-[#070b14] text-stone-100 selection:bg-amber-500/30 selection:text-amber-200">
      <AmbientBackground />

      {/* Navigation Header */}
      <nav className="relative z-20 border-b border-amber-500/20 bg-stone-950/60 backdrop-blur-xl px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to={`/Hackathon/${slug}`} className="flex items-center gap-3 text-stone-300 hover:text-amber-300 transition">
            <span className="font-serif text-lg tracking-wider font-semibold text-amber-200 uppercase">
              AICTE IDEA Lab
            </span>
            <span className="text-stone-600">/</span>
            <span className="text-xs uppercase font-sans tracking-widest text-stone-400">
              Project Showcase
            </span>
          </Link>

          <Link
            to={`/Hackathon/${slug}`}
            className="px-4 py-2 rounded-xl border border-amber-500/30 bg-stone-900/80 hover:bg-amber-400/10 text-amber-300 text-xs font-bold uppercase tracking-wider transition"
          >
            ← Back to Hackathon
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-8">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-lg">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Hall of Fame & Innovation Showcase</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl text-stone-100 uppercase tracking-wide font-normal">
            {data.hackathon?.name || "Student Prototype Innovations"}
          </h1>

          <p className="text-sm text-stone-400 font-sans leading-relaxed">
            Explore cutting-edge prototypes, abstracts, and engineering solutions developed by student innovator teams during the hackathon.
          </p>
        </div>

        {/* Gallery Preview if available */}
        {data.hackathon?.gallery?.length > 0 && (
          <div className="mt-8 serene-glass-card rounded-3xl border border-amber-500/25 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300">
              <ImageIcon className="w-4 h-4" />
              <span>Event Media Gallery</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {data.hackathon.gallery.map((img, idx) => (
                <div key={idx} className="group relative rounded-2xl overflow-hidden border border-amber-500/20 aspect-video bg-stone-950">
                  <img src={img.url || img} alt={img.title || "Hackathon event"} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  {img.title && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
                      <span className="text-[10px] font-sans text-stone-200 truncate">{img.title}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search prototype, team, or idea..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-amber-500/30 bg-stone-900/90 text-stone-100 text-xs placeholder-stone-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            <button
              onClick={() => setSelectedTheme("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition cursor-pointer ${
                selectedTheme === "all"
                  ? "bg-amber-400 text-stone-950 shadow-md"
                  : "bg-stone-900/80 text-stone-400 hover:text-stone-200 border border-stone-800"
              }`}
            >
              All Domains
            </button>
            {themes.map((theme) => (
              <button
                key={theme}
                onClick={() => setSelectedTheme(theme)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition cursor-pointer ${
                  selectedTheme === theme
                    ? "bg-amber-400 text-stone-950 shadow-md"
                    : "bg-stone-900/80 text-stone-400 hover:text-stone-200 border border-stone-800"
                }`}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="py-20 text-center text-stone-500 text-xs font-mono uppercase tracking-widest">
            Loading innovation showcase...
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="py-20 text-center serene-glass-card rounded-3xl border border-amber-500/20 p-8 mt-6">
            <div className="text-amber-400/60 font-serif text-2xl font-normal">No Prototypes Found</div>
            <p className="text-stone-400 text-xs mt-1">Try adjusting your search query or domain filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className="serene-glass-card rounded-3xl border border-amber-500/25 hover:border-amber-400/50 p-6 shadow-xl hover:shadow-2xl transition duration-300 flex flex-col justify-between cursor-pointer group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      {project.theme || "General Track"}
                    </span>

                    {project.awardCategory && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 shadow-sm">
                        <Trophy className="w-3 h-3" />
                        <span>{project.awardCategory}</span>
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif text-xl text-stone-100 group-hover:text-amber-200 transition font-normal">
                    {project.title || project.topic || project.teamName}
                  </h3>

                  <p className="text-xs text-stone-400 font-sans line-clamp-3 leading-relaxed">
                    {project.description || "Innovative engineering solution solving critical community and industry challenges."}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-amber-500/15 space-y-2">
                  <div className="flex items-center justify-between text-xs text-stone-300 font-sans">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-semibold">{project.teamName}</span>
                    </div>
                    <span className="text-[11px] text-stone-400 font-mono">
                      {project.members?.length || 1} Members
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-stone-400 truncate max-w-[180px]">
                      {project.college}
                    </span>
                    {project.githubRepo && (
                      <a
                        href={project.githubRepo}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-amber-300 hover:bg-amber-400/10 transition"
                        title="View GitHub Repository"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm p-4">
          <div className="serene-glass-card rounded-3xl border border-amber-500/30 p-6 md:p-8 w-full max-w-2xl shadow-2xl space-y-5">
            <div className="flex items-start justify-between gap-4 border-b border-amber-500/20 pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {selectedProject.theme}
                </span>
                <h2 className="font-serif text-2xl text-stone-100 uppercase tracking-wider mt-2 font-normal">
                  {selectedProject.title || selectedProject.topic || selectedProject.teamName}
                </h2>
                <div className="text-xs text-amber-400 mt-1 font-semibold">
                  Team: {selectedProject.teamName} • {selectedProject.college}
                </div>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-stone-400 hover:text-stone-100 text-lg font-mono p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs font-sans text-stone-300 leading-relaxed">
              <div>
                <h4 className="text-[11px] uppercase font-bold tracking-wider text-stone-400 mb-1">Project Abstract</h4>
                <p className="p-4 rounded-2xl bg-stone-900/80 border border-amber-500/20 text-stone-200">
                  {selectedProject.description || "No detailed abstract submitted."}
                </p>
              </div>

              <div>
                <h4 className="text-[11px] uppercase font-bold tracking-wider text-stone-400 mb-1">Team Roster</h4>
                <div className="flex items-center gap-2 flex-wrap">
                  {(selectedProject.members || []).map((m, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-xl bg-stone-900 border border-stone-700 text-stone-200 font-semibold">
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {selectedProject.githubRepo && (
                <div className="pt-2">
                  <a
                    href={selectedProject.githubRepo}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 border border-amber-500/30 text-amber-300 hover:bg-amber-400/10 font-bold uppercase tracking-wider text-xs transition"
                  >
                    <Github className="w-4 h-4" />
                    <span>View GitHub Repository</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
