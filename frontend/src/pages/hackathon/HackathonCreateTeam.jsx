import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { axiosInstance } from "../../lib/axios.js";

const DEFAULT_THEMES = [
  "Disaster Resilience",
  "Waste Management",
  "Energy Solutions",
  "Smart Agriculture",
  "Pollution Control",
  "Smart Mobility & Parking",
  "Smart Healthcare",
];

const HackathonCreateTeam = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hackathonId = searchParams.get("hackathonId");

  const [team, setTeam] = useState(null);
  const [currentHackathon, setCurrentHackathon] = useState(null);
  const [problems, setProblems] = useState([]);

  const [teamName, setTeamName] = useState("");
  const [theme, setTheme] = useState("");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [selectedProblemId, setSelectedProblemId] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const query = hackathonId ? `?hackathonId=${hackathonId}` : "";
        const [teamRes, hackathonsRes, problemsRes] = await Promise.all([
          axiosInstance.get(`/ich2026/team${query}`).catch(() => ({ data: { team: null } })),
          axiosInstance.get(`/ich2026/hackathons`).catch(() => ({ data: { hackathons: [] } })),
          axiosInstance.get(`/ich2026/problems${query}`).catch(() => ({ data: { problems: [] } })),
        ]);

        setTeam(teamRes.data?.team || null);

        const hList = hackathonsRes.data?.hackathons || [];
        const found = hList.find((h) => String(h.id) === String(hackathonId)) || hList[0] || null;
        setCurrentHackathon(found);

        const pList = problemsRes.data?.problems || [];
        setProblems(pList);
      } catch (e) {
        console.error("Failed to load initial create team data:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [hackathonId]);

  const isCustomMode = currentHackathon?.problemStatementType === "custom";

  const handleSelectPredefinedProblem = (probId) => {
    setSelectedProblemId(probId);
    if (!probId) {
      setTopic("");
      setDescription("");
      return;
    }
    const found = problems.find((p) => String(p.id) === String(probId));
    if (found) {
      setTopic(found.title || "");
      setDescription(found.description || "");
    }
  };

  const onCreate = async (e) => {
    e.preventDefault();
    setError(null);

    if (!teamName.trim()) {
      setError("Please enter a team name.");
      return;
    }

    if (isCustomMode) {
      if (!theme) {
        setError("Please select a project theme.");
        return;
      }
      if (!topic.trim()) {
        setError("Please enter a problem statement title / topic.");
        return;
      }
      if (!description.trim()) {
        setError("Please enter a project description (abstraction).");
        return;
      }
    } else {
      if (!topic.trim()) {
        setError("Please select or enter a problem statement.");
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await axiosInstance.post("/ich2026/team/create", {
        teamName: teamName.trim(),
        theme: isCustomMode ? theme : null,
        topic: topic.trim(),
        description: description.trim(),
        hackathonId,
      });
      setTeam(res.data);
      navigate("/Hackathon/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create team");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-stone-400 font-sans text-xs uppercase tracking-widest">Loading team workspace...</div>;

  if (team) {
    return (
      <div className="font-sans text-stone-100 space-y-4 max-w-2xl">
        <h2 className="font-serif text-3xl text-stone-100 uppercase tracking-widest font-normal">Create Team</h2>
        <div className="rounded-2xl border border-amber-500/30 bg-amber-400/10 p-5 text-xs text-amber-200">
          You already have a team: <span className="font-bold text-stone-100 uppercase font-serif tracking-wider">{team.teamName}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans text-stone-100 space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="font-serif text-3xl text-stone-100 uppercase tracking-widest font-normal">Create Team</h2>
          <span className="px-3 py-1 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30 text-xs font-bold font-sans">
            {isCustomMode ? "Personalized Problem Statement Mode" : "Predefined Problem Statement Mode"}
          </span>
        </div>
        <p className="text-xs font-dancing text-amber-200/90 mt-1">
          Form your team. As creator, you automatically become Team Leader and receive a shareable invite code.
        </p>
      </div>

      <form onSubmit={onCreate} className="serene-glass-card rounded-3xl border border-amber-500/25 p-6 md:p-8 shadow-2xl space-y-6 text-stone-100">
        <div>
          <label className="block text-xs font-serif uppercase tracking-wider text-amber-300 mb-1.5 font-normal">Team Name *</label>
          <input
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            required
            placeholder="e.g. Innovators Club"
            className="w-full rounded-xl border border-amber-500/30 bg-stone-900/90 px-4 py-3 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400 font-sans"
          />
        </div>

        {/* Personalized Problem Statement Mode: Pick Theme */}
        {isCustomMode ? (
          <>
            <div>
              <label className="block text-xs font-serif uppercase tracking-wider text-amber-300 mb-2 font-normal">
                Select Project Theme *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {DEFAULT_THEMES.map((t) => {
                  const isSel = theme === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTheme(t)}
                      className={`p-3 rounded-2xl border text-left text-xs font-sans transition flex items-center gap-2.5 cursor-pointer ${
                        isSel
                          ? "bg-amber-400/20 border-amber-400 text-amber-200 font-bold shadow-md ring-1 ring-amber-400/40"
                          : "bg-stone-900/80 border-amber-500/20 text-stone-300 hover:border-amber-400/50 hover:bg-stone-900"
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${isSel ? "bg-amber-400 ring-2 ring-amber-400/40" : "bg-stone-700"}`} />
                      <span>{t}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-serif uppercase tracking-wider text-amber-300 mb-1.5 font-normal">
                Problem Statement Title / Topic *
              </label>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
                placeholder="e.g. AI-driven Autonomous Water Quality Monitoring System"
                className="w-full rounded-xl border border-amber-500/30 bg-stone-900/90 px-4 py-3 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400 font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-serif uppercase tracking-wider text-amber-300 mb-1.5 font-normal">
                Project Description (Abstraction) *
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="Brief overview of your project idea, objectives, technical stack, and proposed approach..."
                className="w-full rounded-xl border border-amber-500/30 bg-stone-900/90 px-4 py-3 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400 font-sans"
              />
            </div>
          </>
        ) : (
          /* Predefined Problem Statement Mode: Pick Problem Statement */
          <>
            <div>
              <label className="block text-xs font-serif uppercase tracking-wider text-amber-300 mb-1.5 font-normal">
                Select Problem Statement *
              </label>
              <select
                value={selectedProblemId}
                onChange={(e) => handleSelectPredefinedProblem(e.target.value)}
                required
                className="w-full rounded-xl border border-amber-500/30 bg-stone-900/90 px-4 py-3 text-xs text-stone-100 focus:outline-none focus:border-amber-400 font-sans cursor-pointer"
              >
                <option value="">-- Choose a Problem Statement --</option>
                {problems.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} {p.sector ? `(${p.sector})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {selectedProblemId ? (
              <div className="p-4 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-xs space-y-1.5">
                <div className="font-bold text-amber-300 font-serif uppercase tracking-wider">
                  Selected Problem Details
                </div>
                <div className="text-stone-200">{topic}</div>
                {description ? <div className="text-stone-400 text-[11px] line-clamp-3">{description}</div> : null}
              </div>
            ) : null}

            <div>
              <label className="block text-xs font-serif uppercase tracking-wider text-amber-300 mb-1.5 font-normal">
                Problem Statement Title *
              </label>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
                placeholder="Selected Problem Statement Title"
                className="w-full rounded-xl border border-amber-500/30 bg-stone-900/90 px-4 py-3 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400 font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-serif uppercase tracking-wider text-amber-300 mb-1.5 font-normal">
                Project Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Overview of your proposed approach..."
                className="w-full rounded-xl border border-amber-500/30 bg-stone-900/90 px-4 py-3 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400 font-sans"
              />
            </div>
          </>
        )}

        {error ? <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200">{error}</div> : null}

        <button
          type="submit"
          disabled={submitting}
          className="w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 font-extrabold uppercase text-xs tracking-wider transition shadow-lg hover:brightness-110 disabled:opacity-60 cursor-pointer border border-amber-300"
        >
          {submitting ? "Creating Team..." : "Create Team"}
        </button>
      </form>
    </div>
  );
};

export default HackathonCreateTeam;
