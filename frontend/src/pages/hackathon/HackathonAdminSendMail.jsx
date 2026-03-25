import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../lib/axios.js";

const HackathonAdminSendMail = () => {
  const [teams, setTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(true);

  const [mailType, setMailType] = useState("all");
  const [singleTeamId, setSingleTeamId] = useState("");
  const [multiTeamIds, setMultiTeamIds] = useState([]);

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosInstance.get("/ich2026/admin/teams");
        setTeams(res.data.teams || []);
      } catch (e) {
        setError(e.response?.data?.message || "Failed to load teams");
      } finally {
        setLoadingTeams(false);
      }
    };
    load();
  }, []);

  const onMultiSelectChange = (e) => {
    const selected = Array.from(e.target.selectedOptions).map((o) => Number(o.value));
    setMultiTeamIds(selected.filter((n) => Number.isInteger(n)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (mailType === "team") {
      const id = Number(singleTeamId);
      if (!Number.isInteger(id)) {
        setError("Please select a team.");
        return;
      }
    }
    if (mailType === "multiple" && multiTeamIds.length === 0) {
      setError("Select at least one team.");
      return;
    }

    const body = {
      type: mailType,
      teamIds:
        mailType === "team"
          ? [Number(singleTeamId)]
          : mailType === "multiple"
            ? multiTeamIds
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
        Messages are sent to <span className="font-semibold text-gray-800">team leaders only</span> (from their registered email).
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
              <span className="text-sm font-medium text-gray-800">All teams</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="mailType"
                checked={mailType === "team"}
                onChange={() => setMailType("team")}
                className="text-blue-600"
              />
              <span className="text-sm font-medium text-gray-800">Specific team</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="mailType"
                checked={mailType === "multiple"}
                onChange={() => setMailType("multiple")}
                className="text-blue-600"
              />
              <span className="text-sm font-medium text-gray-800">Multiple teams</span>
            </label>
          </div>
        </div>

        {mailType === "team" ? (
          <div>
            <label className="text-sm font-medium text-gray-800">Team</label>
            <select
              value={singleTeamId}
              onChange={(e) => setSingleTeamId(e.target.value)}
              required
              className="mt-2 w-full max-w-md rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a team</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.teamName} — {t.leader?.email || "no email"}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {mailType === "multiple" ? (
          <div>
            <label className="text-sm font-medium text-gray-800">Teams (hold Ctrl / Cmd to select several)</label>
            <select
              multiple
              size={Math.min(12, Math.max(6, teams.length))}
              value={multiTeamIds.map(String)}
              onChange={onMultiSelectChange}
              className="mt-2 w-full max-w-md rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.teamName} — {t.leader?.email || "no email"}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">{multiTeamIds.length} team(s) selected</p>
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
            (mailType === "team" && !singleTeamId) ||
            (mailType === "multiple" && multiTeamIds.length === 0)
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
