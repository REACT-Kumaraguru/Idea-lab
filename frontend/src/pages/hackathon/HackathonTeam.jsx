import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { axiosInstance } from "../../lib/axios.js";

const HackathonTeam = () => {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosInstance.get("/hackathon/team");
        setTeam(res.data.team);
      } catch {
        setTeam(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="text-gray-600">Loading...</div>;

  if (!team) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Your Team</h2>
        <div className="mt-3 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="text-gray-700">
            You are not part of any team yet. Participants form teams themselves; any participant can create a team and the creator automatically becomes Team Leader.
            Team becomes active automatically when it has 4 members.
          </div>
          <div className="mt-4 flex gap-3 flex-wrap">
            <Link to="/hackathon/create-team" className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">
              Create Team
            </Link>
            <Link to="/hackathon/join-team" className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-800 font-semibold hover:bg-gray-50 transition">
              Join Team
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Your Team</h2>
      <div className="mt-5 grid md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="text-sm font-semibold text-blue-700">{team.status}</div>
          <div className="text-2xl font-extrabold text-gray-900 mt-2">{team.teamName}</div>
          <div className="mt-4 text-sm text-gray-700 space-y-2">
            <div>
              <span className="font-semibold">Invite Code:</span>{" "}
              <span className="font-mono">{team.inviteCode}</span>
            </div>
            <div>
              <span className="font-semibold">Leader:</span> {team.members?.find((m) => m.isLeader)?.member?.fullName || "—"}
            </div>
            <div>
              <span className="font-semibold">Members:</span> {team.members?.length || 0} / 4
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-900">Team Members</h3>
          <div className="mt-4 space-y-3">
            {(team.members || []).map((m) => (
              <div key={m.userId} className="p-4 rounded-xl border border-gray-100">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="font-semibold text-gray-900">{m.member?.fullName}</div>
                    <div className="text-sm text-gray-600">{m.member?.email}</div>
                  </div>
                  {m.isLeader ? (
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                      Leader
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                      Member
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HackathonTeam;

