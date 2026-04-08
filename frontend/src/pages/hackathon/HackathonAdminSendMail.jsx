import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../lib/axios.js";

const HackathonAdminSendMail = () => {
  const [teams, setTeams] = useState([]);
  const [mentors, setMentors] = useState([]);
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
      try {
        const [teamRes, mentorRes] = await Promise.all([
          axiosInstance.get("/ich2026/admin/teams"),
          axiosInstance.get("/ich2026/admin/mentors"),
        ]);
        setTeams(teamRes.data.teams || []);
        setMentors(mentorRes.data.mentors || []);
      } catch (e) {
        setError(e.response?.data?.message || "Failed to load recipients");
      } finally {
        setLoadingTeams(false);
      }
    };
    load();
  }, []);

  const approvedTeams = teams.filter((t) => String(t.status || "").toLowerCase() === "approved");
  const filteredApprovedTeams = approvedTeams.filter((t) => {
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
    <div>
      <h2 className="text-xl font-bold text-gray-900">Send Mail</h2>
      <p className="text-gray-600 mt-1 text-sm">
        Send announcements to <span className="font-semibold text-gray-800">team leaders or mentors</span>.
      </p>

      {error ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      ) : null}

      {result ? (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <div className="font-semibold">Email batch finished</div>
          <div className="mt-1">
            Sent: <b>{result.sent}</b>
            {typeof result.failed === "number" ? (
              <>
                {" "}
                · Failed: <b>{result.failed}</b>
              </>
            ) : null}
            {typeof result.skipped === "number" ? (
              <>
                {" "}
                · Skipped (no leader email): <b>{result.skipped}</b>
              </>
            ) : null}
          </div>
          {Array.isArray(result.errors) && result.errors.length ? (
            <ul className="mt-2 list-disc pl-5 text-xs text-red-800 space-y-1">
              {result.errors.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <div>
          <div className="text-sm font-medium text-gray-800">Audience</div>
          <div className="mt-3 flex flex-wrap gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="audience"
                checked={audience === "teams"}
                onChange={() => {
                  setAudience("teams");
                  setMailType("all");
                }}
                className="text-blue-600"
              />
              <span className="text-sm font-medium text-gray-800">Team leaders</span>
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
                className="text-blue-600"
              />
              <span className="text-sm font-medium text-gray-800">Mentors</span>
            </label>
          </div>
        </div>

        <div>
          <div className="text-sm font-medium text-gray-800">Recipients</div>
          <div className="mt-3 flex flex-col gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="mailType"
                checked={mailType === "all"}
                onChange={() => setMailType("all")}
                className="text-blue-600"
              />
              <span className="text-sm font-medium text-gray-800">
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
                  className="text-blue-600"
                />
                <span className="text-sm font-medium text-gray-800">Admin approved teams</span>
              </label>
            ) : null}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="mailType"
                checked={mailType === "team"}
                onChange={() => setMailType("team")}
                className="text-blue-600"
              />
              <span className="text-sm font-medium text-gray-800">
                {audience === "teams" ? "Specific team" : "Specific mentor"}
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="mailType"
                checked={mailType === "multiple"}
                onChange={() => setMailType("multiple")}
                className="text-blue-600"
              />
              <span className="text-sm font-medium text-gray-800">
                {audience === "teams" ? "Multiple teams" : "Multiple mentors"}
              </span>
            </label>
          </div>
        </div>

        {audience === "teams" && mailType === "team" ? (
          <div>
            <label className="text-sm font-medium text-gray-800">Team</label>
            <select
              value={singleTeamId}
              onChange={(e) => setSingleTeamId(e.target.value)}
              required
              className="mt-2 w-full max-w-md rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a team</option>
              {approvedTeams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.teamName} — {t.leader?.email || "no email"}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {audience === "mentors" && mailType === "team" ? (
          <div>
            <label className="text-sm font-medium text-gray-800">Mentor</label>
            <select
              value={singleMentorId}
              onChange={(e) => setSingleMentorId(e.target.value)}
              required
              className="mt-2 w-full max-w-md rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a mentor</option>
              {mentors.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.user?.fullName || "Mentor"} — {m.user?.email || "no email"}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {audience === "teams" && mailType === "multiple" ? (
          <div>
            <label className="text-sm font-medium text-gray-800">Teams</label>
            <input
              value={searchTeams}
              onChange={(e) => setSearchTeams(e.target.value)}
              placeholder="Search team or email..."
              className="mt-2 w-full max-w-md rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="mt-2 w-full max-w-md rounded-xl border border-gray-200 bg-white max-h-64 overflow-auto p-3 space-y-2">
              {filteredApprovedTeams.map((t) => (
                <label key={t.id} className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={multiTeamIds.includes(Number(t.id))}
                    onChange={() => toggleTeam(Number(t.id))}
                    className="mt-0.5 text-blue-600"
                  />
                  <span className="text-sm text-gray-800">
                    {t.teamName} <span className="text-gray-500">— {t.leader?.email || "no email"}</span>
                  </span>
                </label>
              ))}
              {filteredApprovedTeams.length === 0 ? <div className="text-xs text-gray-500">No approved teams found.</div> : null}
            </div>
            <p className="mt-1 text-xs text-gray-500">{multiTeamIds.length} team(s) selected</p>
          </div>
        ) : null}

        {audience === "mentors" && mailType === "multiple" ? (
          <div>
            <label className="text-sm font-medium text-gray-800">Mentors</label>
            <input
              value={searchMentors}
              onChange={(e) => setSearchMentors(e.target.value)}
              placeholder="Search mentor or email..."
              className="mt-2 w-full max-w-md rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="mt-2 w-full max-w-md rounded-xl border border-gray-200 bg-white max-h-64 overflow-auto p-3 space-y-2">
              {filteredMentors.map((m) => (
                <label key={m.id} className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={multiMentorIds.includes(Number(m.id))}
                    onChange={() => toggleMentor(Number(m.id))}
                    className="mt-0.5 text-blue-600"
                  />
                  <span className="text-sm text-gray-800">
                    {m.user?.fullName || "Mentor"} <span className="text-gray-500">— {m.user?.email || "no email"}</span>
                  </span>
                </label>
              ))}
              {filteredMentors.length === 0 ? <div className="text-xs text-gray-500">No mentors found.</div> : null}
            </div>
            <p className="mt-1 text-xs text-gray-500">{multiMentorIds.length} mentor(s) selected</p>
          </div>
        ) : null}

        <div>
          <label className="text-sm font-medium text-gray-800">Subject</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            placeholder="e.g. Payment reminder"
            className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-800">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={8}
            placeholder="Write your reminder or announcement for team leaders..."
            className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? "Sending…" : "Send email"}
        </button>
      </form>
    </div>
  );
};

export default HackathonAdminSendMail;
