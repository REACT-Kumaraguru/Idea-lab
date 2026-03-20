import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../lib/axios.js";

const HackathonStatus = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosInstance.get("/hackathon/status");
        setData(res.data);
      } catch {
        setData({ team: null, submissions: [] });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="text-gray-600">Loading...</div>;

  const team = data?.team;
  const submissions = data?.submissions || [];
  const mapSubmissionStatus = (s) => {
    if (!s) return null;
    if (s === "submitted" || s === "under_review") return "pending";
    return s;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Submission Status</h2>
      <p className="text-gray-600 mt-1">Track your PoC / Prototype review progress.</p>

      {!team ? (
        <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm text-gray-700">
          No team found. Please create or join a team first.
        </div>
      ) : (
        <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="text-sm font-semibold text-blue-700">{team.status}</div>
          <div className="text-2xl font-extrabold text-gray-900 mt-2">{team.teamName}</div>
          <div className="text-sm text-gray-600 mt-1">Invite Code: <span className="font-mono">{team.inviteCode}</span></div>
        </div>
      )}

      <div className="mt-5 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="font-bold text-gray-900">Submissions</h3>
        {submissions.length ? (
          <div className="mt-4 space-y-4">
            {submissions.map((s) => (
              <div key={s.id} className="p-5 rounded-2xl border border-gray-100">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="font-semibold text-gray-900">
                      {s.problem?.title || "Problem"} ({s.submissionPhase})
                    </div>
                    <div className="text-sm text-gray-600">{s.title}</div>
                    {s.description ? <div className="text-sm text-gray-700 mt-2 whitespace-pre-line">{s.description}</div> : null}
                  </div>
                  <div>
                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                      {mapSubmissionStatus(s.status) || s.status}
                    </span>
                    {s.winnerAmount ? (
                      <div className="text-xs text-blue-700 font-semibold mt-2">
                        Winner Prize: ₹{s.winnerAmount}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 grid md:grid-cols-2 gap-3">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">PoC Files</div>
                    <div className="text-xs text-gray-500">({Array.isArray(s.pocFilePaths) ? s.pocFilePaths.length : 0} files)</div>
                    <div className="mt-2 space-y-2">
                      {(s.pocFilePaths || []).map((f, idx) => (
                        <a key={idx} href={f} target="_blank" rel="noreferrer" className="block text-blue-700 hover:underline text-sm break-all">
                          {f.split("/").pop()}
                        </a>
                      ))}
                      {!s.pocFilePaths?.length ? <div className="text-sm text-gray-600">—</div> : null}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Prototype Files</div>
                    <div className="text-xs text-gray-500">({Array.isArray(s.prototypeFilePaths) ? s.prototypeFilePaths.length : 0} files)</div>
                    <div className="mt-2 space-y-2">
                      {(s.prototypeFilePaths || []).map((f, idx) => (
                        <a key={idx} href={f} target="_blank" rel="noreferrer" className="block text-blue-700 hover:underline text-sm break-all">
                          {f.split("/").pop()}
                        </a>
                      ))}
                      {!s.prototypeFilePaths?.length ? <div className="text-sm text-gray-600">—</div> : null}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 text-gray-700">No submissions found yet.</div>
        )}
      </div>
    </div>
  );
};

export default HackathonStatus;

