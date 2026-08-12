import React, { useEffect, useMemo, useState } from "react";
import { axiosInstance } from "../../lib/axios.js";
import { useLocation, useNavigate } from "react-router-dom";

function mentorNamesText(p) {
  const list = Array.isArray(p.mentors) && p.mentors.length ? p.mentors : p.mentor ? [p.mentor] : [];
  const names = list.map((m) => m?.user?.fullName).filter(Boolean);
  return names.length ? names.join(", ") : "—";
}

const tabs = [
  { id: "create", label: "Add problem" },
  { id: "details", label: "Problem details" },
];

const HackathonAdminProblems = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const hackathonId = searchParams.get("hackathonId") || "";

  useEffect(() => {
    if (!hackathonId) return;
    axiosInstance.get("/ich2026/admin/hackathons").then((res) => {
      const list = res.data?.hackathons || [];
      const current = list.find((h) => String(h.id) === String(hackathonId));
      if (current?.problemStatementType === "custom") {
        navigate(`/ich2026/admin${location.search}`, { replace: true });
      }
    }).catch(() => {});
  }, [hackathonId, location.search, navigate]);

  const [problems, setProblems] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [sector, setSector] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMentorIds, setSelectedMentorIds] = useState(() => new Set());
  const [teamRegistrationLimit, setTeamRegistrationLimit] = useState("");

  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("create");

  const resetForm = () => {
    setTitle("");
    setSector("");
    setDescription("");
    setSelectedMentorIds(new Set());
    setTeamRegistrationLimit("");
    setEditingId(null);
  };

  const startEdit = (p) => {
    setError(null);
    setEditingId(p.id);
    setTitle(p.title || "");
    setSector(p.sector || "");
    setDescription(p.description || "");
    setTeamRegistrationLimit(p.teamRegistrationLimit != null ? String(p.teamRegistrationLimit) : "");
    const ids = new Set((p.mentors || []).map((m) => Number(m.id)).filter((n) => Number.isInteger(n)));
    setSelectedMentorIds(ids);
    setActiveTab("create");
  };

  const loadProblems = async () => {
    try {
      const query = hackathonId ? `?hackathonId=${hackathonId}` : "";
      const [problemsRes, mentorsRes] = await Promise.all([
        axiosInstance.get(`/ich2026/admin/problems${query}`),
        axiosInstance.get(`/ich2026/admin/mentors${query}`),
      ]);
      setProblems(problemsRes.data.problems || []);
      setMentors(mentorsRes.data.mentors || []);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load problems");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProblems();
  }, [hackathonId]);

  const filteredProblems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return problems;
    return problems.filter((p) => {
      const blob = `${p.title || ""} ${p.sector || ""} ${p.description || ""}`.toLowerCase();
      return blob.includes(q);
    });
  }, [problems, search]);

  const saveProblem = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const mentorIds = [...selectedMentorIds].map(Number).filter((n) => Number.isInteger(n) && n > 0);
      if (mentorIds.length < 1) {
        setError("Select at least one mentor");
        return;
      }
      const payload = {
        title: title.trim(),
        description: description.trim(),
        sector: sector.trim() || null,
        mentorIds,
        teamRegistrationLimit: teamRegistrationLimit.trim() === "" ? null : Number(teamRegistrationLimit),
        hackathonId: hackathonId ? Number(hackathonId) : null,
      };

      if (editingId != null) {
        const res = await axiosInstance.put(`/ich2026/admin/problems/${editingId}`, payload);
        const p = res.data.problem;
        setProblems((prev) => prev.map((x) => (Number(x.id) === Number(editingId) ? { ...p } : x)));
        resetForm();
        setActiveTab("details");
      } else {
        const res = await axiosInstance.post("/ich2026/admin/problems", payload);
        const p = res.data.problem;
        setProblems((prev) => [
          {
            ...p,
            submissionCount: 0,
            pocSubmissionCount: 0,
            prototypeSubmissionCount: 0,
            teamsSubmitted: 0,
            teamsPending: 0,
            teamsApproved: 0,
            teamsRejected: 0,
          },
          ...prev,
        ]);
        resetForm();
        setActiveTab("details");
      }
    } catch (e2) {
      setError(e2.response?.data?.message || (editingId != null ? "Failed to update problem" : "Failed to add problem"));
    }
  };

  const deleteProblem = async (id) => {
    if (!window.confirm("Delete this problem? Related submissions will also be removed.")) return;
    setDeletingId(id);
    setError(null);
    try {
      await axiosInstance.delete(`/ich2026/admin/problems/${id}`);
      setProblems((prev) => prev.filter((p) => p.id !== id));
    } catch (e2) {
      setError(e2.response?.data?.message || "Failed to delete problem");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div className="text-stone-400 font-sans text-xs uppercase tracking-widest">Loading problem statements...</div>;

  return (
    <div className="space-y-6 font-sans text-stone-100">
      <div>
        <h2 className="font-serif text-3xl text-stone-100 uppercase tracking-widest font-normal">Manage Problem Statements</h2>
        <p className="text-xs font-dancing text-amber-200/90 mt-1">Configure competition problem tracks and mentor assignments</p>
      </div>

      {error ? <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200">{error}</div> : null}

      <div className="border-b border-amber-500/20">
        <nav className="-mb-px flex gap-6" aria-label="Problem sections">
          {tabs.map((t) => {
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`whitespace-nowrap border-b-2 pb-3 px-1 text-xs font-sans uppercase tracking-widest font-bold transition-all cursor-pointer ${
                  active
                    ? "border-amber-400 text-amber-300"
                    : "border-transparent text-stone-400 hover:text-stone-200"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </nav>
      </div>

      {activeTab === "create" ? (
        <form onSubmit={saveProblem} className="mt-6 serene-glass-card rounded-3xl border border-amber-500/25 shadow-2xl p-6 md:p-8 space-y-5 text-stone-100 font-sans text-xs">
          {editingId != null ? (
            <div className="mb-4 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-xs text-amber-200 flex items-center justify-between">
              <span>Editing problem #{editingId}</span>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setError(null);
                }}
                className="font-bold text-amber-300 uppercase tracking-wider underline cursor-pointer"
              >
                Cancel edit
              </button>
            </div>
          ) : null}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-stone-300 mb-1.5">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g. Autonomous Traffic Optimization System"
                className="w-full rounded-xl border border-amber-500/30 bg-stone-900/90 text-stone-100 placeholder-stone-500 px-4 py-2.5 text-xs focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-stone-300 mb-1.5">Sector</label>
              <input
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                placeholder="Digital / Manufacturing"
                className="w-full rounded-xl border border-amber-500/30 bg-stone-900/90 text-stone-100 placeholder-stone-500 px-4 py-2.5 text-xs focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-wider font-bold text-stone-300 mb-1">Mentors</label>
              <p className="text-[11px] text-stone-400 mb-2">Select one or more mentors for this problem.</p>
              <div className="max-h-48 overflow-y-auto rounded-2xl border border-amber-500/20 bg-stone-900/80 p-3 space-y-2">
                {mentors.length === 0 ? (
                  <div className="text-xs text-stone-500">No mentors yet. Add mentors under Admin → Mentors.</div>
                ) : (
                  mentors.map((m) => {
                    const checked = selectedMentorIds.has(Number(m.id));
                    return (
                      <label key={m.id} className="flex items-center gap-2.5 cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            setSelectedMentorIds((prev) => {
                              const next = new Set(prev);
                              const id = Number(m.id);
                              if (e.target.checked) next.add(id);
                              else next.delete(id);
                              return next;
                            });
                          }}
                          className="accent-amber-400"
                        />
                        <span className="text-stone-200">
                          {m.user?.fullName || "Mentor"}
                          {m.user?.email ? <span className="text-stone-400 font-mono"> ({m.user.email})</span> : null}
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-bold text-stone-300 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={5}
              placeholder="Detailed description of the problem statement and objectives..."
              className="w-full rounded-xl border border-amber-500/30 bg-stone-900/90 text-stone-100 placeholder-stone-500 px-4 py-2.5 text-xs focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            />
          </div>

          <div className="max-w-md">
            <label className="block text-xs uppercase tracking-wider font-bold text-stone-300 mb-1.5">Team registration limit</label>
            <input
              type="number"
              min={1}
              step={1}
              value={teamRegistrationLimit}
              onChange={(e) => setTeamRegistrationLimit(e.target.value)}
              placeholder="Leave empty for no limit"
              className="w-full rounded-xl border border-amber-500/30 bg-stone-900/90 text-stone-100 placeholder-stone-500 px-4 py-2.5 text-xs focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            />
            <p className="mt-1.5 text-[11px] text-stone-400">
              Maximum distinct teams that can submit to this problem. Empty means unlimited.
            </p>
          </div>

          <button
            type="submit"
            className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 text-xs font-sans uppercase font-bold tracking-widest hover:brightness-110 shadow-lg cursor-pointer transition"
          >
            {editingId != null ? "Save changes" : "Add Problem"}
          </button>
        </form>
      ) : null}

      {activeTab === "details" ? (
        <div className="mt-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h3 className="font-serif text-xl uppercase tracking-wider text-amber-300 font-normal">Per-problem statistics</h3>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, sector, description…"
              className="w-full sm:max-w-xs rounded-xl border border-amber-500/30 bg-stone-900/90 text-stone-100 placeholder-stone-500 px-3 py-2 text-xs focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="hidden md:block overflow-x-auto serene-glass-card rounded-3xl border border-amber-500/25 p-4 shadow-2xl">
            <table className="min-w-full text-xs font-sans">
              <thead>
                <tr className="border-b border-amber-500/20 bg-stone-900/90 text-left font-serif uppercase tracking-wider text-amber-300">
                  <th className="px-4 py-3">Problem</th>
                  <th className="px-4 py-3 whitespace-nowrap">Mentors</th>
                  <th className="px-4 py-3 whitespace-nowrap">Teams (submitted)</th>
                  <th className="px-4 py-3 whitespace-nowrap">Approved</th>
                  <th className="px-4 py-3 whitespace-nowrap">Pending</th>
                  <th className="px-4 py-3 whitespace-nowrap">Rejected</th>
                  <th className="px-4 py-3 whitespace-nowrap">Limit</th>
                  <th className="px-4 py-3 whitespace-nowrap">PoC / Proto</th>
                  <th className="px-4 py-3 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-500/10 text-stone-300">
                {filteredProblems.map((p) => (
                  <tr key={p.id} className="align-top hover:bg-amber-400/5 transition">
                    <td className="px-4 py-3">
                      <div className="font-serif uppercase text-stone-100 font-medium">{p.title}</div>
                      <div className="text-[11px] text-amber-300 mt-0.5">{p.sector || "—"}</div>
                    </td>
                    <td className="px-4 py-3 text-stone-300 max-w-xs">
                      {mentorNamesText(p)}
                    </td>
                    <td className="px-4 py-3 font-bold text-amber-300">{p.teamsSubmitted ?? 0}</td>
                    <td className="px-4 py-3 text-emerald-300 font-semibold">{p.teamsApproved ?? 0}</td>
                    <td className="px-4 py-3 text-amber-300 font-semibold">{p.teamsPending ?? 0}</td>
                    <td className="px-4 py-3 text-rose-300 font-semibold">{p.teamsRejected ?? 0}</td>
                    <td className="px-4 py-3 text-stone-300 whitespace-nowrap font-mono">
                      {p.teamRegistrationLimit != null ? p.teamRegistrationLimit : "∞"}
                    </td>
                    <td className="px-4 py-3 text-stone-300 whitespace-nowrap font-mono">
                      {p.pocSubmissionCount ?? 0} / {p.prototypeSubmissionCount ?? 0}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(p)}
                          className="px-3 py-1.5 rounded-xl border border-amber-400/30 bg-amber-400/10 text-amber-300 text-xs font-bold uppercase hover:bg-amber-400/20 transition cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteProblem(p.id)}
                          disabled={deletingId === p.id}
                          className="px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs font-bold uppercase hover:bg-rose-500/20 disabled:opacity-50 transition cursor-pointer"
                        >
                          {deletingId === p.id ? "Deleting…" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProblems.length === 0 ? (
            <div className="mt-4 text-stone-500 text-xs">{problems.length === 0 ? "No problems yet." : "No matches for your search."}</div>
          ) : null}

          <div className="mt-6 space-y-4 md:hidden">
            {filteredProblems.map((p) => (
              <div key={p.id} className="serene-glass-card rounded-2xl border border-amber-500/25 p-4 shadow-xl space-y-2">
                <div className="text-xs font-bold text-amber-300 uppercase">{p.sector || "Sector"}</div>
                <div className="text-sm font-serif uppercase text-stone-100 font-medium">{p.title}</div>
                <div className="text-xs text-stone-400">Mentors: {mentorNamesText(p)}</div>
                <dl className="grid grid-cols-2 gap-2 text-xs text-stone-300 pt-2 border-t border-amber-500/15">
                  <div>
                    <dt className="text-stone-500">Submitted</dt>
                    <dd className="font-bold text-amber-300">{p.teamsSubmitted ?? 0}</dd>
                  </div>
                  <div>
                    <dt className="text-stone-500">Approved</dt>
                    <dd className="text-emerald-300 font-bold">{p.teamsApproved ?? 0}</dd>
                  </div>
                  <div>
                    <dt className="text-stone-500">Pending</dt>
                    <dd className="text-amber-300">{p.teamsPending ?? 0}</dd>
                  </div>
                  <div>
                    <dt className="text-stone-500">Rejected</dt>
                    <dd className="text-rose-300">{p.teamsRejected ?? 0}</dd>
                  </div>
                </dl>
                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(p)}
                    className="flex-1 px-3 py-2 rounded-xl border border-amber-400/30 bg-amber-400/10 text-amber-300 text-xs font-bold uppercase hover:bg-amber-400/20 transition cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteProblem(p.id)}
                    disabled={deletingId === p.id}
                    className="flex-1 px-3 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs font-bold uppercase hover:bg-rose-500/20 disabled:opacity-50 transition cursor-pointer"
                  >
                    {deletingId === p.id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default HackathonAdminProblems;
