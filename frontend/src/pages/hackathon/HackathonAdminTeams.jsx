import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../lib/axios.js";

const HackathonAdminTeams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosInstance.get("/hackathon/admin/teams");
        setTeams(res.data.teams || []);
      } catch (e) {
        setError(e.response?.data?.message || "Failed to load teams");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="text-gray-600">Loading...</div>;

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900">Teams</h2>
      <p className="text-sm text-gray-600 mt-1">
        Teams are participant-created. A team becomes active automatically when it reaches 4 members.
      </p>
      {error ? <div className="mt-3 text-sm text-red-600 font-medium">{error}</div> : null}

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm border border-gray-100 rounded-2xl bg-white shadow-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">Team</th>
              <th className="p-3">Invite Code</th>
              <th className="p-3">Leader</th>
              <th className="p-3">Members</th>
              <th className="p-3">Status</th>
              <th className="p-3 min-w-[140px]">Details</th>
              <th className="p-3">Activation</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((t) => (
              <tr key={t.id} className="border-t border-gray-100">
                <td className="p-3 font-semibold">{t.teamName}</td>
                <td className="p-3 font-mono">{t.inviteCode}</td>
                <td className="p-3">
                  {t.leader?.fullName || "—"}
                  <div className="text-xs text-gray-600">{t.leader?.email}</div>
                </td>
                <td className="p-3">{t.members?.length || 0} / 4</td>
                <td className="p-3">
                  <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                    {t.status === "approved" ? "active" : t.status}
                  </span>
                </td>
                <td className="p-3 align-top">
                  <details className="max-w-xs">
                    <summary className="cursor-pointer text-blue-600 text-xs font-semibold hover:underline">
                      View team details
                    </summary>
                    <div className="mt-2 pl-2 border-l-2 border-gray-200 text-xs text-gray-700 space-y-2">
                      <div>
                        <span className="font-semibold text-gray-900">Team name:</span> {t.teamName}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">Invite code:</span>{" "}
                        <span className="font-mono">{t.inviteCode}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">Status:</span> {t.status}
                      </div>
                      <div className="font-semibold text-gray-900 pt-1">Members</div>
                      <ul className="space-y-2">
                        {(t.members || []).map((m) => (
                          <li key={m.id} className="border-b border-gray-100 pb-2 last:border-0">
                            <div>
                              {m.fullName || "—"}
                              {m.isLeader ? (
                                <span className="ml-1 text-[10px] uppercase text-blue-600 font-bold">Leader</span>
                              ) : null}
                            </div>
                            <div className="text-gray-500">{m.email || "—"}</div>
                            {m.phoneNumber ? <div className="text-gray-500">{m.phoneNumber}</div> : null}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </details>
                </td>
                <td className="p-3 align-top">
                  <span className="text-xs text-gray-600">
                    {t.members?.length || 0} / 4 members{" "}
                    {(t.members?.length || 0) >= 4 ? "(active)" : "(waiting)"}
                  </span>
                </td>
              </tr>
            ))}
            {teams.length === 0 && (
              <tr>
                <td colSpan={7} className="p-4 text-gray-700">
                  No teams found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HackathonAdminTeams;
