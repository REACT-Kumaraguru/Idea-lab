import React, { useEffect, useMemo, useState } from "react";
import { axiosInstance } from "../../lib/axios.js";

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

  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("create");

  const loadProblems = async () => {
    try {
      const [problemsRes, mentorsRes] = await Promise.all([
        axiosInstance.get("/ich2026/admin/problems"),
        axiosInstance.get("/ich2026/admin/mentors"),
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
  }, []);

  const filteredProblems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return problems;
    return problems.filter((p) => {
      const blob = `${p.title || ""} ${p.sector || ""} ${p.description || ""}`.toLowerCase();
      return blob.includes(q);
    });
  }, [problems, search]);

  const addProblem = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const mentorIds = [...selectedMentorIds].map(Number).filter((n) => Number.isInteger(n) && n > 0);
      if (mentorIds.length < 1) {
        setError("Select at least one mentor");
        return;
      }
      const payload = {
        title,
        description,
        sector,
        mentorIds,
        teamRegistrationLimit: teamRegistrationLimit.trim() === "" ? null : teamRegistrationLimit,
      };
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
      setTitle("");
      setSector("");
      setDescription("");
      setSelectedMentorIds(new Set());
      setTeamRegistrationLimit("");
      setActiveTab("details");
    } catch (e2) {
      setError(e2.response?.data?.message || "Failed to add problem");
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

  if (loading) return <div className="text-gray-600">Loading...</div>;

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900">Manage Problems</h2>
      {error ? <div className="mt-3 text-sm text-red-600 font-medium">{error}</div> : null}

      <div className="mt-5 border-b border-gray-200">
        <nav className="-mb-px flex gap-8" aria-label="Problem sections">
          {tabs.map((t) => {
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`whitespace-nowrap border-b-2 pb-3 px-0.5 text-sm font-semibold transition-colors ${
                  active
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </nav>
      </div>

      {activeTab === "create" ? (
        <form onSubmit={addProblem} className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-800">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-800">Sector</label>
              <input
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                placeholder="Digital / Manufacturing"
                className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-800">Mentors</label>
              <p className="mt-1 text-xs text-gray-500">Select one or more mentors for this problem.</p>
              <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-gray-300 px-3 py-2 space-y-2">
                {mentors.length === 0 ? (
                  <div className="text-sm text-gray-500">No mentors yet. Add mentors under Admin → Mentors.</div>
                ) : (
                  mentors.map((m) => {
                    const checked = selectedMentorIds.has(Number(m.id));
                    return (
                      <label key={m.id} className="flex items-start gap-2 cursor-pointer text-sm">
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
                          className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-800">
                          {m.user?.fullName || "Mentor"}
                          {m.user?.email ? <span className="text-gray-500"> ({m.user.email})</span> : null}
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium text-gray-800">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={5}
              className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mt-4 max-w-md">
            <label className="text-sm font-medium text-gray-800">Team registration limit</label>
            <input
              type="number"
              min={1}
              step={1}
              value={teamRegistrationLimit}
              onChange={(e) => setTeamRegistrationLimit(e.target.value)}
              placeholder="Leave empty for no limit"
              className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Maximum distinct teams that can submit to this problem. Empty means unlimited.
            </p>
          </div>

          <button type="submit" className="mt-5 w-full px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700">
            Add Problem
          </button>
        </form>
      ) : null}

      {activeTab === "details" ? (
        <div className="mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h3 className="font-bold text-gray-900">Per-problem statistics</h3>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, sector, description…"
              className="w-full sm:max-w-xs rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mt-4 hidden md:block overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  <th className="px-4 py-3">Problem</th>
                  <th className="px-4 py-3 whitespace-nowrap">Mentors</th>
                  <th className="px-4 py-3 whitespace-nowrap">Teams (submitted)</th>
                  <th className="px-4 py-3 whitespace-nowrap">Approved</th>
                  <th className="px-4 py-3 whitespace-nowrap">Pending</th>
                  <th className="px-4 py-3 whitespace-nowrap">Rejected</th>
                  <th className="px-4 py-3 whitespace-nowrap">Limit</th>
                  <th className="px-4 py-3 whitespace-nowrap">PoC / Proto</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProblems.map((p) => (
                  <tr key={p.id} className="align-top">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">{p.title}</div>
                      <div className="text-xs text-blue-700 mt-0.5">{p.sector || "—"}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-800 max-w-xs">
                      {mentorNamesText(p)}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{p.teamsSubmitted ?? 0}</td>
                    <td className="px-4 py-3 text-gray-800">{p.teamsApproved ?? 0}</td>
                    <td className="px-4 py-3 text-gray-800">{p.teamsPending ?? 0}</td>
                    <td className="px-4 py-3 text-gray-800">{p.teamsRejected ?? 0}</td>
                    <td className="px-4 py-3 text-gray-800 whitespace-nowrap">
                      {p.teamRegistrationLimit != null ? p.teamRegistrationLimit : "∞"}
                    </td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {p.pocSubmissionCount ?? 0} / {p.prototypeSubmissionCount ?? 0}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => deleteProblem(p.id)}
                        disabled={deletingId === p.id}
                        className="px-3 py-1.5 rounded-lg border border-red-200 text-red-700 text-xs font-semibold hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingId === p.id ? "Deleting…" : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProblems.length === 0 ? (
            <div className="mt-4 text-gray-700">{problems.length === 0 ? "No problems yet." : "No matches for your search."}</div>
          ) : null}

          <div className="mt-6 space-y-4 md:hidden">
            {filteredProblems.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="text-xs font-semibold text-blue-700">{p.sector || "Sector"}</div>
                <div className="text-base font-bold text-gray-900 mt-1">{p.title}</div>
                <div className="mt-1 text-xs text-gray-600">Mentors: {mentorNamesText(p)}</div>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-700">
                  <div>
                    <dt className="text-gray-500">Submitted</dt>
                    <dd className="font-semibold">{p.teamsSubmitted ?? 0}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Approved</dt>
                    <dd>{p.teamsApproved ?? 0}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Pending</dt>
                    <dd>{p.teamsPending ?? 0}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Rejected</dt>
                    <dd>{p.teamsRejected ?? 0}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Limit</dt>
                    <dd>{p.teamRegistrationLimit != null ? p.teamRegistrationLimit : "∞"}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">PoC / Proto</dt>
                    <dd>
                      {p.pocSubmissionCount ?? 0} / {p.prototypeSubmissionCount ?? 0}
                    </dd>
                  </div>
                </dl>
                <button
                  type="button"
                  onClick={() => deleteProblem(p.id)}
                  disabled={deletingId === p.id}
                  className="mt-3 w-full px-3 py-2 rounded-lg border border-red-200 text-red-700 text-xs font-semibold hover:bg-red-50 disabled:opacity-50"
                >
                  {deletingId === p.id ? "Deleting…" : "Delete"}
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default HackathonAdminProblems;
