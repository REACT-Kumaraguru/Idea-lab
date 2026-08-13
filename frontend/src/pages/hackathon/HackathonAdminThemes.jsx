import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { axiosInstance } from "../../lib/axios";
import { Shield, Tag, Users, CheckCircle2, AlertCircle, Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

const DEFAULT_THEME_REVIEWERS = {
  "Disaster Resilience": ["reviewer.disaster1@kct.ac.in", "reviewer.disaster2@kct.ac.in"],
  "Waste Management": ["reviewer.waste1@kct.ac.in", "reviewer.waste2@kct.ac.in"],
  "Energy Solutions": ["reviewer.energy1@kct.ac.in", "reviewer.energy2@kct.ac.in"],
  "Smart Agriculture": ["reviewer.agriculture1@kct.ac.in", "reviewer.agriculture2@kct.ac.in"],
  "Pollution Control": ["reviewer.pollution1@kct.ac.in", "reviewer.pollution2@kct.ac.in"],
  "Smart Mobility & Parking": ["reviewer.mobility1@kct.ac.in", "reviewer.mobility2@kct.ac.in"],
  "Smart Healthcare": ["reviewer.healthcare1@kct.ac.in", "reviewer.healthcare2@kct.ac.in"],
};

const HackathonAdminThemes = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const hackathonId = searchParams.get("hackathonId") || "";

  const [hackathon, setHackathon] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newThemeName, setNewThemeName] = useState("");
  const [addingTheme, setAddingTheme] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const query = hackathonId ? `?hackathonId=${hackathonId}` : "";
      const [hRes, teamsRes] = await Promise.all([
        axiosInstance.get("/ich2026/admin/hackathons"),
        axiosInstance.get(`/ich2026/admin/teams${query}`),
      ]);
      const allHackathons = hRes.data?.hackathons || [];
      const current = allHackathons.find((h) => String(h.id) === String(hackathonId)) || allHackathons[0] || null;
      setHackathon(current);
      setTeams(teamsRes.data?.teams || []);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load themes data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [hackathonId]);

  const activeThemes = [
    "Disaster Resilience",
    "Waste Management",
    "Energy Solutions",
    "Smart Agriculture",
    "Pollution Control",
    "Smart Mobility & Parking",
    "Smart Healthcare",
    ...(hackathon?.themes || []).filter(
      (t) =>
        ![
          "Disaster Resilience",
          "Waste Management",
          "Energy Solutions",
          "Smart Agriculture",
          "Pollution Control",
          "Smart Mobility & Parking",
          "Smart Healthcare",
        ].includes(t)
    ),
  ];

  const handleAddTheme = async (e) => {
    e.preventDefault();
    if (!newThemeName.trim() || !hackathon) return;
    setAddingTheme(true);
    try {
      const updatedThemes = Array.from(new Set([...(hackathon.themes || []), newThemeName.trim()]));
      await axiosInstance.put(`/ich2026/admin/hackathons/${hackathon.id}`, {
        themes: updatedThemes,
      });
      toast.success(`Theme "${newThemeName.trim()}" added successfully!`);
      setNewThemeName("");
      await loadData();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to add theme");
    } finally {
      setAddingTheme(false);
    }
  };

  if (loading) {
    return (
      <div className="text-stone-400 font-sans text-xs uppercase tracking-widest p-8">
        Loading hackathon themes & reviewer assignments...
      </div>
    );
  }

  return (
    <div className="space-y-8 text-stone-100 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-amber-500/20">
        <div>
          <h1 className="font-serif text-3xl uppercase tracking-wider text-stone-100 font-normal flex items-center gap-2">
            <Tag className="w-7 h-7 text-amber-400" />
            <span>Hackathon Themes & Reviewers</span>
          </h1>
          <p className="text-xs text-stone-400 mt-1 font-sans">
            Manage themes for {hackathon?.name || "Smart City Hackathon 2026"} and monitor reviewer allocations (2 reviewers per theme).
          </p>
        </div>

        {/* Stats Pill */}
        <div className="flex items-center gap-3">
          <div className="serene-glass-card px-4 py-2 rounded-2xl border border-amber-500/30 text-center">
            <div className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">Themes</div>
            <div className="text-lg font-serif text-stone-100">{activeThemes.length}</div>
          </div>
          <div className="serene-glass-card px-4 py-2 rounded-2xl border border-amber-500/30 text-center">
            <div className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">Reviewers</div>
            <div className="text-lg font-serif text-emerald-400">14 Active</div>
          </div>
        </div>
      </div>

      {/* Add Theme Card */}
      <div className="serene-glass-card rounded-3xl border border-amber-500/25 p-6 shadow-2xl">
        <h3 className="font-serif text-xl uppercase tracking-wider text-amber-300 mb-2 font-normal">
          ✨ Add New Theme
        </h3>
        <form onSubmit={handleAddTheme} className="flex items-center gap-3 max-w-xl">
          <input
            type="text"
            value={newThemeName}
            onChange={(e) => setNewThemeName(e.target.value)}
            placeholder="e.g. Smart Urban Governance / Autonomous Transport"
            className="flex-1 px-4 py-2.5 rounded-xl border border-amber-500/30 bg-stone-950 text-stone-100 placeholder-stone-500 text-xs focus:outline-none focus:border-amber-400"
          />
          <button
            type="submit"
            disabled={addingTheme || !newThemeName.trim()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-extrabold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>{addingTheme ? "Adding..." : "Add Theme"}</span>
          </button>
        </form>
      </div>

      {/* Themes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeThemes.map((themeName) => {
          const themeTeams = teams.filter((t) => (t.theme || "").toLowerCase() === themeName.toLowerCase());
          const approvedTeams = themeTeams.filter((t) => t.abstractionStatus === "approved");
          const pendingTeams = themeTeams.filter((t) => t.abstractionStatus === "submitted");
          const reviewers = DEFAULT_THEME_REVIEWERS[themeName] || [
            `reviewer.${themeName.toLowerCase().replace(/\s+/g, "")}1@kct.ac.in`,
            `reviewer.${themeName.toLowerCase().replace(/\s+/g, "")}2@kct.ac.in`,
          ];

          return (
            <div key={themeName} className="serene-glass-card rounded-3xl border border-amber-500/25 p-6 shadow-2xl space-y-4">
              <div className="flex items-start justify-between gap-3 border-b border-amber-500/20 pb-3">
                <div>
                  <h4 className="font-serif text-xl text-stone-100 uppercase tracking-wider font-semibold">
                    {themeName}
                  </h4>
                  <div className="text-[11px] text-stone-400 mt-0.5 flex items-center gap-2">
                    <span>Teams Registered: <strong className="text-amber-300">{themeTeams.length}</strong></span>
                    <span>•</span>
                    <span>Approved: <strong className="text-emerald-400">{approvedTeams.length}</strong></span>
                    <span>•</span>
                    <span>Pending: <strong className="text-amber-400">{pendingTeams.length}</strong></span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30 text-[10px] font-bold uppercase tracking-wider">
                  2 Reviewers Assigned
                </span>
              </div>

              {/* Reviewers List */}
              <div className="space-y-2">
                <div className="text-[10px] font-serif uppercase tracking-widest text-amber-300 font-bold">
                  Assigned Theme Reviewers
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {reviewers.map((revEmail, idx) => (
                    <div key={revEmail} className="bg-stone-900/80 p-3 rounded-2xl border border-stone-800 text-xs flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-amber-400/20 text-amber-300 font-serif font-bold text-xs flex items-center justify-center border border-amber-400/30 shrink-0">
                        R{idx + 1}
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-semibold text-stone-200 truncate">Reviewer {idx + 1}</div>
                        <div className="text-[11px] text-stone-400 font-mono truncate">{revEmail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HackathonAdminThemes;
