import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { axiosInstance } from "../../lib/axios.js";

const HackathonJoinTeam = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hackathonId = searchParams.get("hackathonId");

  const [team, setTeam] = useState(null);
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosInstance.get(`/ich2026/team${hackathonId ? `?hackathonId=${hackathonId}` : ""}`);
        setTeam(res.data.team);
      } catch {
        setTeam(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [hackathonId]);

  const onJoin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await axiosInstance.post("/ich2026/team/join", { inviteCode, hackathonId });
      navigate("/Hackathon/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to join team");
    }
  };

  if (loading) return <div className="text-stone-400 font-sans text-xs uppercase tracking-widest">Loading team info...</div>;

  if (team) {
    return (
      <div className="font-sans text-stone-100 space-y-4 max-w-2xl">
        <h2 className="font-serif text-3xl text-stone-100 uppercase tracking-widest font-normal">Join Team</h2>
        <div className="rounded-2xl border border-amber-500/30 bg-amber-400/10 p-5 text-xs text-amber-200">
          You already belong to: <span className="font-bold text-stone-100 uppercase font-serif tracking-wider">{team.teamName}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans text-stone-100 space-y-6 max-w-2xl">
      <div>
        <h2 className="font-serif text-3xl text-stone-100 uppercase tracking-widest font-normal">Join Team</h2>
        <p className="text-xs font-dancing text-amber-200/90 mt-1">
          Enter an 8-character invite code provided by your Team Leader to join their team.
        </p>
      </div>

      <form onSubmit={onJoin} className="serene-glass-card rounded-3xl border border-amber-500/25 p-6 md:p-8 shadow-2xl space-y-5 text-stone-100">
        <div>
          <label className="block text-xs font-serif uppercase tracking-wider text-amber-300 mb-1.5 font-normal">Invite Code *</label>
          <input
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            required
            placeholder="e.g. A8B9C0D1"
            className="w-full rounded-xl border border-amber-500/30 bg-stone-900/90 px-3.5 py-2.5 text-xs text-amber-300 placeholder-stone-600 focus:outline-none focus:border-amber-400 font-mono uppercase tracking-widest text-base select-all"
          />
        </div>

        {error ? <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200">{error}</div> : null}

        <button
          type="submit"
          className="w-full px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold uppercase text-xs tracking-wider transition shadow-lg cursor-pointer border border-amber-300"
        >
          Join Team
        </button>
      </form>
    </div>
  );
};

export default HackathonJoinTeam;

