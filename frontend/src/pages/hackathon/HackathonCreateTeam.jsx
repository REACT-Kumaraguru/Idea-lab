import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../../lib/axios.js";

const HackathonCreateTeam = () => {
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const onCreate = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await axiosInstance.post("/hackathon/team/create", { teamName });
      setTeam(res.data);
      navigate("/hackathon/team");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create team");
    }
  };

  if (loading) return <div className="text-gray-600">Loading...</div>;

  if (team) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Create Team</h2>
        <div className="mt-4 bg-blue-50 border border-blue-100 rounded-2xl p-5 text-gray-700">
          You already have a team: <span className="font-semibold">{team.teamName}</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Create Team</h2>
      <p className="text-gray-600 mt-2">Team name is required. Max 4 members per team.</p>

      <form onSubmit={onCreate} className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <label className="text-sm font-medium text-gray-800">Team Name</label>
        <input
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          required
          className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {error ? <div className="mt-3 text-sm text-red-600 font-medium">{error}</div> : null}

        <button
          type="submit"
          className="mt-5 w-full px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
        >
          Create Team
        </button>
      </form>
    </div>
  );
};

export default HackathonCreateTeam;

