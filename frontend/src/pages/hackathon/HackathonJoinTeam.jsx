import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../../lib/axios.js";

const HackathonJoinTeam = () => {
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState(null);
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

  const onJoin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await axiosInstance.post("/hackathon/team/join", { inviteCode });
      navigate("/hackathon/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to join team");
    }
  };

  if (loading) return <div className="text-gray-600">Loading...</div>;

  if (team) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Join Team</h2>
        <div className="mt-4 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm text-gray-700">
          You already belong to: <span className="font-semibold">{team.teamName}</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Join Team</h2>
      <p className="text-gray-600 mt-2">
        Participants form teams themselves. Use a Team Leader invite code to join. Team becomes active automatically when it has 4 members.
      </p>

      <form onSubmit={onJoin} className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <label className="text-sm font-medium text-gray-800">Invite Code</label>
        <input
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          required
          className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
        />

        {error ? <div className="mt-3 text-sm text-red-600 font-medium">{error}</div> : null}

        <button type="submit" className="mt-5 w-full px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">
          Join Team
        </button>
      </form>
    </div>
  );
};

export default HackathonJoinTeam;

