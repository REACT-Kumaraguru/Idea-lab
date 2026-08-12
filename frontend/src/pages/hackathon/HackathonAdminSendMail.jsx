import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../lib/axios.js";

import { useLocation } from "react-router-dom";

const HackathonAdminSendMail = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const hackathonId = searchParams.get("hackathonId") || localStorage.getItem("selectedHackathonId") || "";

  const [teams, setTeams] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [approvedSubmissionTeamIds, setApprovedSubmissionTeamIds] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(true);

  const [audience, setAudience] = useState("teams");
  const [mailType, setMailType] = useState("all");
  const [singleTeamId, setSingleTeamId] = useState("");
  const [multiTeamIds, setMultiTeamIds] = useState([]);
  const [singleMentorId, setSingleMentorId] = useState("");
  const [multiMentorIds, setMultiMentorIds] = useState([]);
  const [searchTeams, setSearchTeams] = useState("");
  const [searchMentors, setSearchMentors] = useState("");

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoadingTeams(true);
      try {
        const query = hackathonId ? `?hackathonId=${hackathonId}` : "";
        const [teamRes, mentorRes, submissionRes] = await Promise.all([
          axiosInstance.get(`/ich2026/admin/teams${query}`),
          axiosInstance.get(`/ich2026/admin/mentors${query}`),
          axiosInstance.get(`/ich2026/admin/submissions`),
        ]);
        setTeams(teamRes.data.teams || []);
        setMentors(mentorRes.data.mentors || []);
        const approvedIds = [
          ...new Set(
            (submissionRes.data.submissions || [])
              .filter((s) => String(s.status || "").toLowerCase() === "approved")
              .map((s) => Number(s.team?.id ?? s.teamId))
              .filter((id) => Number.isInteger(id))
          ),
        ];
        setApprovedSubmissionTeamIds(approvedIds);
      } catch (e) {
        setError(e.response?.data?.message || "Failed to load recipients");
      } finally {
        setLoadingTeams(false);
      }
    };
    load();
  }, [hackathonId]);

  const approvedSubmissionTeams = teams.filter((t) => approvedSubmissionTeamIds.includes(Number(t.id)));
  const filteredApprovedSubmissionTeams = approvedSubmissionTeams.filter((t) => {
    const q = searchTeams.trim().toLowerCase();
    if (!q) return true;
    return `${t.teamName} ${t.leader?.email || ""}`.toLowerCase().includes(q);
  });
  const filteredMentors = mentors.filter((m) => {
    const q = searchMentors.trim().toLowerCase();
    if (!q) return true;
    return `${m.user?.fullName || ""} ${m.user?.email || ""}`.toLowerCase().includes(q);
  });

  const toggleTeam = (id) => {
    setMultiTeamIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };
  const toggleMentor = (id) => {
    setMultiMentorIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (audience === "teams" && mailType === "team") {
      const id = Number(singleTeamId);
      if (!Number.isInteger(id)) {
        setError("Please select a team.");
        return;
      }
    }
    if (audience === "teams" && mailType === "multiple" && multiTeamIds.length === 0) {
      setError("Select at least one team.");
      return;
    }
    if (audience === "mentors" && mailType === "team") {
      const id = Number(singleMentorId);
      if (!Number.isInteger(id)) {
        setError("Please select a mentor.");
        return;
      }
    }
    if (audience === "mentors" && mailType === "multiple" && multiMentorIds.length === 0) {
      setError("Select at least one mentor.");
      return;
    }

    const body = {
      audience,
      type: mailType,
      teamIds: audience === "teams" ? (mailType === "team" ? [Number(singleTeamId)] : mailType === "multiple" ? multiTeamIds : []) : [],
      mentorIds:
        audience === "mentors"
          ? mailType === "team"
            ? [Number(singleMentorId)]
            : mailType === "multiple"
              ? multiMentorIds
              : []
          : [],
      subject: subject.trim(),
      message: message.trim(),
      hackathonId: hackathonId ? Number(hackathonId) : null,
    };

    setSending(true);
    try {
      const res = await axiosInstance.post("/ich2026/admin/send-mail", body);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send email");
    } finally {
      setSending(false);
    }
  };

  if (loadingTeams) return <div className="text-gray-600">Loading teams...</div>;

  return (
    <div className="space-y-6 font-sans text-stone-100">
      <div>
        <h2 className="font-serif text-3xl text-stone-100 uppercase tracking-widest font-normal">Broadcasting & Mail Control</h2>
        <p className="text-xs font-dancing text-amber-200/90 mt-1">Send announcements and notifications to team leaders or mentors</p>
      </div>

      {error ? (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200">{error}</div>
      ) : null}

      {result ? (
        <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-200 space-y-1">
          <div className="font-serif text-base text-emerald-300 uppercase tracking-wider font-normal">Email Batch Dispatched</div>
          <div className="font-mono">
            Sent: <b>{result.sent}</b>
            {typeof result.failed === "number" ? (
              <> · Failed: <b>{result.failed}</b></>
            ) : null}
            {typeof result.skipped === "number" ? (
              <> · Skipped: <b>{result.skipped}</b></>
            ) : null}
          </div>
          {Array.isArray(result.errors) && result.errors.length ? (
            <ul className="mt-2 list-disc pl-5 text-xs text-rose-300 space-y-1">
              {result.errors.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="serene-glass-card rounded-3xl border border-amber-500/25 p-6 shadow-2xl space-y-6 text-stone-100 font-sans text-xs">
        <div>
          <div className="text-xs uppercase tracking-wider font-bold text-amber-300 mb-2">Audience</div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="audience"
                checked={audience === "teams"}
                onChange={() => {
                  setAudience("teams");
                  setMailType("all");
                }}
                className="accent-amber-400"
              />
              <span className="text-sm font-medium text-stone-200">Team leaders</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="audience"
                checked={audience === "mentors"}
                onChange={() => {
                  setAudience("mentors");
                  setMailType("all");
                }}
                className="accent-amber-400"
              />
              <span className="text-sm font-medium text-stone-200">Mentors</span>
            </label>
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wider font-bold text-amber-300 mb-2">Recipients</div>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="mailType"
                checked={mailType === "all"}
                onChange={() => setMailType("all")}
                className="accent-amber-400"
              />
              <span className="text-sm font-medium text-stone-200">
                {audience === "teams" ? "All teams" : "All mentors"}
              </span>
            </label>
            {audience === "teams" ? (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="mailType"
                  checked={mailType === "approved"}
                  onChange={() => setMailType("approved")}
                  className="accent-amber-400"
                />
                <span className="text-sm font-medium text-stone-200">Admin approved submissions</span>
              </label>
            ) : null}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="mailType"
                checked={mailType === "team"}
                onChange={() => setMailType("team")}
                className="accent-amber-400"
              />
              <span className="text-sm font-medium text-stone-200">
                {audience === "teams" ? "Specific team" : "Specific mentor"}
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="mailType"
                checked={mailType === "multiple"}
                onChange={() => setMailType("multiple")}
                className="accent-amber-400"
              />
              <span className="text-sm font-medium text-stone-200">
                {audience === "teams" ? "Multiple teams" : "Multiple mentors"}
              </span>
            </label>
          </div>
        </div>

        {audience === "teams" && mailType === "approved" ? (
          <div>
            <label className="block text-xs uppercase tracking-wider font-bold text-stone-300 mb-1.5">Approved teams to receive this email</label>
            <div className="w-full max-w-md rounded-xl border border-amber-500/20 bg-stone-900/80 max-h-64 overflow-auto p-3 space-y-2 text-stone-200">
              {approvedSubmissionTeams.map((t) => (
                <div key={t.id} className="text-xs text-stone-200">
                  {t.teamName} <span className="text-stone-400">— {t.leader?.email || "no email"}</span>
                </div>
              ))}
              {approvedSubmissionTeams.length === 0 ? (
                <div className="text-xs text-stone-500">No admin-approved submissions found.</div>
              ) : null}
            </div>
            <p className="mt-1.5 text-xs text-stone-400">{approvedSubmissionTeams.length} approved team(s)</p>
          </div>
        ) : null}

        {audience === "teams" && mailType === "team" ? (
          <div>
            <label className="block text-xs uppercase tracking-wider font-bold text-stone-300 mb-1.5">Team</label>
            <select
              value={singleTeamId}
              onChange={(e) => setSingleTeamId(e.target.value)}
              required
              className="w-full max-w-md rounded-xl border border-amber-500/30 bg-stone-900 text-stone-100 px-3 py-2.5 text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="" className="bg-stone-950 text-stone-300">Select a team</option>
              {approvedSubmissionTeams.map((t) => (
                <option key={t.id} value={t.id} className="bg-stone-950 text-stone-100">
                  {t.teamName} — {t.leader?.email || "no email"}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {audience === "mentors" && mailType === "team" ? (
          <div>
            <label className="block text-xs uppercase tracking-wider font-bold text-stone-300 mb-1.5">Mentor</label>
            <select
              value={singleMentorId}
              onChange={(e) => setSingleMentorId(e.target.value)}
              required
              className="w-full max-w-md rounded-xl border border-amber-500/30 bg-stone-900 text-stone-100 px-3 py-2.5 text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="" className="bg-stone-950 text-stone-300">Select a mentor</option>
              {mentors.map((m) => (
                <option key={m.id} value={m.id} className="bg-stone-950 text-stone-100">
                  {m.user?.fullName || "Mentor"} — {m.user?.email || "no email"}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {audience === "teams" && mailType === "multiple" ? (
          <div>
            <label className="block text-xs uppercase tracking-wider font-bold text-stone-300 mb-1.5">Teams</label>
            <input
              value={searchTeams}
              onChange={(e) => setSearchTeams(e.target.value)}
              placeholder="Search team or email..."
              className="w-full max-w-md rounded-xl border border-amber-500/30 bg-stone-900/90 text-stone-100 placeholder-stone-500 px-3 py-2 text-xs focus:outline-none focus:border-amber-400"
            />
            <div className="mt-2 w-full max-w-md rounded-xl border border-amber-500/20 bg-stone-900/80 max-h-64 overflow-auto p-3 space-y-2">
              {filteredApprovedSubmissionTeams.map((t) => (
                <label key={t.id} className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={multiTeamIds.includes(Number(t.id))}
                    onChange={() => toggleTeam(Number(t.id))}
                    className="mt-0.5 accent-amber-400"
                  />
                  <span className="text-xs text-stone-200">
                    {t.teamName} <span className="text-stone-400">— {t.leader?.email || "no email"}</span>
                  </span>
                </label>
              ))}
              {filteredApprovedSubmissionTeams.length === 0 ? (
                <div className="text-xs text-stone-500">No approved teams found.</div>
              ) : null}
            </div>
            <p className="mt-1.5 text-xs text-stone-400">{multiTeamIds.length} team(s) selected</p>
          </div>
        ) : null}

        {audience === "mentors" && mailType === "multiple" ? (
          <div>
            <label className="block text-xs uppercase tracking-wider font-bold text-stone-300 mb-1.5">Mentors</label>
            <input
              value={searchMentors}
              onChange={(e) => setSearchMentors(e.target.value)}
              placeholder="Search mentor or email..."
              className="w-full max-w-md rounded-xl border border-amber-500/30 bg-stone-900/90 text-stone-100 placeholder-stone-500 px-3 py-2 text-xs focus:outline-none focus:border-amber-400"
            />
            <div className="mt-2 w-full max-w-md rounded-xl border border-amber-500/20 bg-stone-900/80 max-h-64 overflow-auto p-3 space-y-2">
              {filteredMentors.map((m) => (
                <label key={m.id} className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={multiMentorIds.includes(Number(m.id))}
                    onChange={() => toggleMentor(Number(m.id))}
                    className="mt-0.5 accent-amber-400"
                  />
                  <span className="text-xs text-stone-200">
                    {m.user?.fullName || "Mentor"} <span className="text-stone-400">— {m.user?.email || "no email"}</span>
                  </span>
                </label>
              ))}
              {filteredMentors.length === 0 ? <div className="text-xs text-stone-500">No mentors found.</div> : null}
            </div>
            <p className="mt-1.5 text-xs text-stone-400">{multiMentorIds.length} mentor(s) selected</p>
          </div>
        ) : null}

        <div>
          <label className="block text-xs uppercase tracking-wider font-bold text-stone-300 mb-1.5">Subject</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            placeholder="e.g. Payment reminder"
            className="w-full rounded-xl border border-amber-500/30 bg-stone-900/90 text-stone-100 placeholder-stone-500 px-4 py-2.5 text-xs focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider font-bold text-stone-300 mb-1.5">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={8}
            placeholder="Write your reminder or announcement for team leaders..."
            className="w-full rounded-xl border border-amber-500/30 bg-stone-900/90 text-stone-100 placeholder-stone-500 px-4 py-2.5 text-xs focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
          />
        </div>

        <button
          type="submit"
          disabled={
            sending ||
            (audience === "teams" && mailType === "team" && !singleTeamId) ||
            (audience === "teams" && mailType === "multiple" && multiTeamIds.length === 0) ||
            (audience === "mentors" && mailType === "team" && !singleMentorId) ||
            (audience === "mentors" && mailType === "multiple" && multiMentorIds.length === 0)
          }
          className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 text-xs font-sans uppercase font-bold tracking-widest hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg cursor-pointer"
        >
          {sending ? "Sending…" : "Send email"}
        </button>
      </form>
    </div>
  );
};

export default HackathonAdminSendMail;
