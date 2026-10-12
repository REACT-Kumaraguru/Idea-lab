import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { axiosInstance } from "../../lib/axios.js";
import { QRCodeSVG } from "qrcode.react";
import { Users, Copy, Check, QrCode, Shield, Sparkles } from "lucide-react";

const HackathonTeam = () => {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosInstance.get("/ich2026/team");
        setTeam(res.data.team);
      } catch {
        setTeam(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleCopyCode = () => {
    if (!team?.inviteCode) return;
    navigator.clipboard.writeText(team.inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-stone-400 font-sans text-xs uppercase tracking-widest animate-pulse">
        Loading team information...
      </div>
    );
  }

  if (!team) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-serif text-3xl font-normal text-stone-100 tracking-tight">Your Team</h2>
          <p className="text-xs text-stone-400 font-sans uppercase tracking-widest mt-1">AICTE IDEA Lab Multi-Hackathon Portal</p>
        </div>
        <div className="serene-glass-card rounded-3xl border border-amber-500/20 p-8 shadow-2xl">
          <div className="flex items-center gap-3 text-amber-300 mb-3">
            <Users className="w-6 h-6" />
            <h3 className="font-serif text-xl font-medium text-stone-100">No Team Formed Yet</h3>
          </div>
          <p className="text-sm text-stone-300 leading-relaxed max-w-2xl">
            You are not part of any team yet. Participants form teams themselves; any participant can create a team and automatically become Team Leader.
            Your team becomes active and registered as soon as you create or join a team.
          </p>
          <div className="mt-6 flex gap-4 flex-wrap">
            <Link
              to="/ich2026/create-team"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-semibold text-xs uppercase tracking-wider hover:from-amber-400 hover:to-amber-500 transition shadow-lg shadow-amber-500/20"
            >
              Create Team
            </Link>
            <Link
              to="/ich2026/join-team"
              className="px-5 py-2.5 rounded-xl border border-amber-500/30 bg-stone-900/60 text-stone-200 font-semibold text-xs uppercase tracking-wider hover:bg-stone-800 transition"
            >
              Join Existing Team
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const leader = team.members?.find((m) => m.isLeader)?.member;
  const qrData = JSON.stringify({
    teamId: team.id,
    teamName: team.teamName,
    inviteCode: team.inviteCode,
    memberCount: team.members?.length || 0,
    leaderName: leader?.fullName || "Leader",
    status: team.status,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-serif text-3xl font-normal text-stone-100 tracking-tight">Your Team</h2>
          <p className="text-xs text-amber-300/80 font-sans uppercase tracking-widest mt-1">Official Team Headquarters & Check-in Pass</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
            {team.status === "approved" ? "Active Team" : team.status}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Team Metadata & Members */}
        <div className="lg:col-span-2 space-y-6">
          <div className="serene-glass-card rounded-3xl border border-amber-500/20 p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-amber-300">Team Name</span>
                <h3 className="font-serif text-2xl font-medium text-stone-100 mt-1">{team.teamName}</h3>
                {team.theme && (
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{team.theme}</span>
                  </div>
                )}
              </div>

              {/* Invite Code Box */}
              <div className="bg-stone-950/80 p-3.5 rounded-2xl border border-amber-500/30 text-right">
                <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-stone-400 block mb-1">
                  Team Invite Code
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-bold text-amber-300">{team.inviteCode}</span>
                  <button
                    onClick={handleCopyCode}
                    className="p-1.5 rounded-lg bg-stone-900 border border-amber-500/20 text-stone-300 hover:text-amber-300 hover:border-amber-400 transition"
                    title="Copy code"
                  >
                    {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 grid sm:grid-cols-2 gap-4 pt-6 border-t border-amber-500/15 text-xs text-stone-300">
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">Team Leader</span>
                <span className="text-stone-100 font-semibold mt-0.5 block">{leader?.fullName || "—"}</span>
                <span className="text-stone-400 font-mono text-[11px]">{leader?.email}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">Members Enrolled</span>
                <span className="text-amber-300 font-semibold mt-0.5 block">{team.members?.length || 0} / 4 Members</span>
                <span className="text-stone-400 text-[11px]">Minimum 1 required for active status</span>
              </div>
            </div>
          </div>

          {/* Members List */}
          <div className="serene-glass-card rounded-3xl border border-amber-500/20 p-6 shadow-xl">
            <h4 className="font-serif text-lg font-normal text-stone-100 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-300" />
              <span>Team Roster ({team.members?.length || 0})</span>
            </h4>
            <div className="space-y-3">
              {(team.members || []).map((m) => (
                <div
                  key={m.userId}
                  className="p-4 rounded-2xl bg-stone-950/60 border border-amber-500/15 flex items-center justify-between gap-4 flex-wrap"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-stone-100 text-sm">{m.member?.fullName || "Member"}</span>
                      {m.isLeader ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1">
                          <Shield className="w-2.5 h-2.5" /> Leader
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 border border-stone-700 text-[10px] font-bold uppercase tracking-wider">
                          Member
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-stone-400 font-mono mt-0.5">{m.member?.email}</div>
                    {m.member?.college && (
                      <div className="text-[11px] text-stone-500 mt-1">
                        {m.member.college} {m.member.branch ? `• ${m.member.branch}` : ""}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Unique Team Entry QR Code (Phase 14.14) */}
        <div className="space-y-6">
          <div className="serene-glass-card rounded-3xl border border-amber-500/30 p-6 shadow-2xl flex flex-col items-center text-center">
            <div className="flex items-center gap-2 text-amber-300 mb-4">
              <QrCode className="w-5 h-5" />
              <h4 className="font-serif text-lg font-medium text-stone-100">Check-in Pass</h4>
            </div>

            <div className="p-4 bg-white rounded-2xl shadow-xl border-4 border-amber-500/30">
              <QRCodeSVG
                value={qrData}
                size={180}
                level="M"
                includeMargin={false}
              />
            </div>

            <span className="mt-4 text-[10px] font-sans font-bold uppercase tracking-widest text-amber-300">
              Official Team QR
            </span>
            <span className="text-xs font-mono font-bold text-stone-200 mt-1">
              {team.inviteCode}
            </span>

            <p className="mt-3 text-xs text-stone-400 leading-relaxed max-w-xs">
              Present this QR code to the volunteer desk upon arriving at the IDEA Lab. Used for instant team check-in and attendance verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HackathonTeam;
