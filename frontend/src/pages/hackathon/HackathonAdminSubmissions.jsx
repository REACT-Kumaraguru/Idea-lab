import React, { useEffect, useMemo, useState } from "react";
import { axiosInstance } from "../../lib/axios.js";
import { downloadHackathonSubmissionFile, fileHref } from "../../lib/hackathonSubmissionFiles.js";

const formatStatus = (s) => {
  if (!s) return "—";
  if (s === "submitted" || s === "under_review") return "pending";
  return s;
};

const isDecisionLocked = (status) =>
  status === "approved" || status === "rejected" || status === "winner";

function SubmissionCard({ s, adminNotes, setAdminNotes, updateStatus }) {
  const locked = isDecisionLocked(s.status);
  const files =
    s.submissionPhase === "poc"
      ? Array.isArray(s.pocFilePaths)
        ? s.pocFilePaths
        : []
      : Array.isArray(s.prototypeFilePaths)
        ? s.prototypeFilePaths
        : [];

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="text-xs font-semibold uppercase text-gray-500">{s.submissionPhase}</div>
          <div className="font-semibold text-gray-900 mt-0.5">{s.problem?.title || "Problem"}</div>
          <div className="text-sm text-gray-600 mt-1">{s.title}</div>
          <div className="mt-2">
            <span className="px-2 py-1 rounded-full bg-white border border-gray-200 text-gray-700 text-xs font-semibold">
              {formatStatus(s.status)}
            </span>
            <span
              className={[
                "ml-2 px-2 py-1 rounded-full text-xs font-semibold",
                s.mentorApproved ? "bg-green-50 border border-green-100 text-green-700" : "bg-gray-100 text-gray-700",
              ].join(" ")}
            >
              Mentor: {s.mentorApproved ? "Approved" : "Not approved"}
            </span>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          {!locked ? (
            <>
              <button
                type="button"
                className="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                onClick={() => updateStatus(s.id, "approved")}
                disabled={locked}
              >
                Approve
              </button>
              <button
                type="button"
                className="px-3 py-1 rounded-lg border border-red-200 text-red-700 text-xs font-semibold hover:bg-red-50 transition disabled:opacity-50"
                onClick={() => updateStatus(s.id, "rejected")}
                disabled={locked}
              >
                Reject
              </button>
            </>
          ) : (
            <span className="text-xs text-gray-500 font-medium">Decision recorded</span>
          )}
        </div>
      </div>

      {files.length > 0 ? (
        <div className="mt-3 text-xs">
          <span className="font-semibold text-gray-700">
            {s.submissionPhase === "poc" ? "PoC files" : "Prototype files"}:
          </span>
          <ul className="mt-1 space-y-2 list-none">
            {files.map((f, i) => (
              <li key={i} className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => void downloadHackathonSubmissionFile(f)}
                  className="inline-flex rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  Download
                </button>
                <a
                  href={fileHref(f)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all text-xs"
                >
                  {f.split("/").pop() || f}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-2 text-xs text-gray-500">No files uploaded for this phase.</p>
      )}

      <div className="mt-3">
        <label className="text-xs font-medium text-gray-800">Admin Notes (optional)</label>
        <textarea
          value={adminNotes[s.id] ?? ""}
          onChange={(e) => setAdminNotes((prev) => ({ ...prev, [s.id]: e.target.value }))}
          disabled={locked}
          rows={2}
          className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-white"
          placeholder="e.g., Needs more details on methodology"
        />
      </div>
    </div>
  );
}

const HackathonAdminSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);

  const [adminNotes, setAdminNotes] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosInstance.get("/ich2026/admin/submissions");
        setSubmissions(res.data.submissions || []);
      } catch (e) {
        setError(e.response?.data?.message || "Failed to load submissions");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const teamsGrouped = useMemo(() => {
    const map = new Map();
    for (const s of submissions) {
      const tid = s.team?.id ?? s.teamId;
      if (tid == null) continue;
      if (!map.has(tid)) map.set(tid, []);
      map.get(tid).push(s);
    }
    const groups = [];
    for (const [teamId, list] of map.entries()) {
      const teamName = list[0]?.team?.teamName || `Team #${teamId}`;
      const poc = list.filter((x) => x.submissionPhase === "poc");
      const proto = list.filter((x) => x.submissionPhase === "prototype");
      groups.push({ teamId, teamName, poc, prototype: proto });
    }
    groups.sort((a, b) => a.teamName.localeCompare(b.teamName));
    return groups;
  }, [submissions]);

  const downloadExcel = async () => {
    setExportLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("/ich2026/admin/submissions/export-xlsx", {
        responseType: "blob",
      });
      const dateStr = new Date().toISOString().slice(0, 10);
      const blobUrl = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `submissions_${dateStr}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      let msg = "Failed to download Excel export";
      if (e.response?.data instanceof Blob) {
        try {
          const text = await e.response.data.text();
          const j = JSON.parse(text);
          if (j?.message) msg = j.message;
        } catch {
          // ignore
        }
      } else if (typeof e.response?.data?.message === "string") {
        msg = e.response.data.message;
      }
      setError(msg);
    } finally {
      setExportLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const notes = adminNotes[id] || "";
      const res = await axiosInstance.post(`/ich2026/admin/submissions/${id}/status`, {
        status,
        adminNotes: notes,
      });
      setSubmissions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...res.data.submission } : s))
      );
    } catch (e) {
      setError(e.response?.data?.message || "Failed to update status");
    }
  };

  if (loading) return <div className="text-gray-600">Loading...</div>;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Submissions</h2>
          <p className="text-sm text-gray-600 mt-1">
            Review by team. PoC and Prototype are listed separately with uploaded files.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void downloadExcel()}
          disabled={exportLoading}
          className="shrink-0 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-60"
        >
          {exportLoading ? "Preparing…" : "Download Excel"}
        </button>
      </div>
      {error ? <div className="mt-3 text-sm text-red-600 font-medium">{error}</div> : null}

      <div className="mt-4 space-y-8">
        {teamsGrouped.map(({ teamId, teamName, poc, prototype }) => (
          <div key={teamId} className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="bg-slate-900 text-white px-4 py-3">
              <div className="text-sm font-semibold">{teamName}</div>
              <div className="text-xs text-white/70 mt-0.5">Team ID: {teamId}</div>
            </div>

            <div className="p-4 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 mb-3">
                  PoC (Proof of Concept)
                </h3>
                {poc.length === 0 ? (
                  <p className="text-sm text-gray-500">No PoC submission for this team yet.</p>
                ) : (
                  <div className="space-y-3">
                    {poc.map((s) => (
                      <SubmissionCard
                        key={s.id}
                        s={s}
                        adminNotes={adminNotes}
                        setAdminNotes={setAdminNotes}
                        updateStatus={updateStatus}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 mb-3">
                  Prototype
                </h3>
                {prototype.length === 0 ? (
                  <p className="text-sm text-gray-500">No prototype submission for this team yet.</p>
                ) : (
                  <div className="space-y-3">
                    {prototype.map((s) => (
                      <SubmissionCard
                        key={s.id}
                        s={s}
                        adminNotes={adminNotes}
                        setAdminNotes={setAdminNotes}
                        updateStatus={updateStatus}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {submissions.length === 0 ? (
          <div className="text-gray-700">No submissions found.</div>
        ) : null}
      </div>
    </div>
  );
};

export default HackathonAdminSubmissions;
