import React from "react";
import { Link } from "react-router-dom";
import { Check, Copy, LogOut, Trash2, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export default function DashboardTeamTab({
  teamLoading,
  role,
  statusData,
  changeTab,
  team,
  selectedStudentHackathon,
  selectedStudentHackathonId,
  copiedCode,
  setCopiedCode,
  isSubmissionApproved,
  dismantlingTeam,
  handleDismantleTeam,
  leavingTeam,
  handleLeaveTeam,
  setMemberToRemove,
  isCustomMode,
  selectedProblem,
  mentorApproveSubmission,
  formatSubmissionStatus,
  formatProblemStatementDisplay,
}) {
  if (teamLoading) {
    return <div className="mt-5 text-stone-400 text-xs font-sans uppercase tracking-widest">Loading team...</div>;
  }

  if (role === "mentor") {
    return (
      <div className="mt-5 space-y-6 font-sans">
        <div className="serene-glass-card rounded-3xl border border-amber-500/25 p-6 md:p-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="font-serif text-2xl uppercase tracking-wider text-stone-100 font-normal">
                Registered Teams & Submissions ({statusData?.submissions?.length || 0})
              </div>
              <p className="mt-1 text-xs text-stone-400 font-sans leading-relaxed">
                Review registered teams, examine project proposals & files, and grant mentor approvals.
              </p>
            </div>
            <button
              onClick={() => changeTab("status")}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-sans uppercase font-extrabold tracking-wider shadow-lg transition cursor-pointer border border-amber-300 shrink-0"
            >
              View Status Board →
            </button>
          </div>
        </div>

        {statusData?.submissions?.length ? (
          <div className="space-y-5">
            {statusData.submissions.map((s) => (
              <div key={s.id} className="serene-glass-card rounded-3xl border border-amber-500/25 p-6 md:p-8 shadow-2xl space-y-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Team Registered
                    </div>
                    <div className="font-serif text-3xl uppercase tracking-wider text-stone-100 mt-2 font-normal">
                      {s.team?.teamName || "Unnamed Team"}
                    </div>
                    <div className="mt-2 inline-flex items-center gap-3 px-4 py-2 bg-stone-900/90 border border-amber-500/30 rounded-2xl text-xs font-sans">
                      <span className="font-bold text-amber-300 uppercase tracking-wider">🔑 Invite Code:</span>
                      <span className="font-mono font-bold text-stone-100 tracking-widest text-base select-all">{s.team?.inviteCode || "—"}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3 font-sans">
                    <div className="flex items-center gap-4 flex-wrap justify-end">
                      <div className="text-right">
                        <div className="text-[10px] uppercase font-extrabold tracking-wider text-stone-400">
                          Problem Statement Status
                        </div>
                        <div className={`mt-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                          (s.team?.abstractionStatus === "submitted" || s.team?.abstractionStatus === "approved")
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                        }`}>
                          {(s.team?.abstractionStatus === "submitted" || s.team?.abstractionStatus === "approved") ? "Submitted ✓" : "Not Submitted Yet"}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] uppercase font-extrabold tracking-wider text-stone-400">
                          Final PoC Submission Status
                        </div>
                        <div className={`mt-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${formatSubmissionStatus(s).color}`}>
                          {formatSubmissionStatus(s).label}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={Boolean(s.mentorApproved)}
                      onClick={() => mentorApproveSubmission(s.id)}
                      className="mt-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-110 text-stone-950 font-extrabold uppercase text-xs tracking-wider disabled:opacity-60 transition shadow-lg cursor-pointer border border-amber-300"
                    >
                      {s.mentorApproved ? "Mentor Approved ✓" : "Mentor Approve"}
                    </button>
                  </div>
                </div>

                {/* Team Members */}
                {s.team?.members?.length ? (
                  <div className="font-sans pt-2">
                    <div className="font-serif text-sm uppercase tracking-wider text-amber-300 font-normal">Team Members</div>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {s.team.members.map((m) => (
                        <div key={m.userId} className="flex items-center justify-between gap-2 bg-stone-900/80 border border-amber-500/20 rounded-2xl p-3.5">
                          <div>
                            <div className="font-semibold text-xs text-stone-100">{m.user?.fullName || "Member"}</div>
                            <div className="text-[11px] text-stone-400 font-mono">{m.user?.email || "—"}</div>
                          </div>
                          {m.isLeader ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold uppercase">Leader</span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-stone-950 text-stone-400 border border-amber-500/15 text-[10px] font-bold uppercase">Member</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Selected Problem & Technical Proposal */}
                <div className="font-sans grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="bg-stone-900/60 border border-amber-500/15 rounded-2xl p-4">
                    <div className="text-[11px] uppercase font-bold text-amber-300 tracking-wider font-serif flex items-center justify-between">
                      <span>Selected Problem Statement</span>
                      {formatProblemStatementDisplay(s).isPersonalized && (
                        <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[9px] font-bold uppercase tracking-wider">
                          Personalized
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-stone-100 font-semibold mt-1">
                      {formatProblemStatementDisplay(s).title}
                    </div>
                    {formatProblemStatementDisplay(s).theme && (
                      <div className="text-[11px] text-stone-400 mt-1 font-sans">
                        <strong className="text-amber-200/90 font-semibold">Theme:</strong> {formatProblemStatementDisplay(s).theme}
                      </div>
                    )}
                  </div>
                  <div className="bg-stone-900/60 border border-amber-500/15 rounded-2xl p-4">
                    <div className="text-[11px] uppercase font-bold text-amber-300 tracking-wider font-serif">Submission Summary</div>
                    <div className="text-xs text-stone-200 font-semibold mt-1 uppercase">{s.submissionPhase} phase</div>
                    {s.description && <div className="text-xs text-stone-400 mt-1">{s.description}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-stone-400 text-xs font-sans serene-glass-card rounded-3xl border border-amber-500/25">
            No registered team submissions found for this hackathon yet.
          </div>
        )}
      </div>
    );
  }

  if (!team) {
    return (
      <div className="mt-5 serene-glass-card rounded-3xl border border-amber-500/25 p-6 md:p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="font-serif text-xl uppercase tracking-wider text-stone-100 font-normal">
              You are not part of a team in {selectedStudentHackathon?.name || "this hackathon"} yet
            </div>
            <div className="mt-1.5 text-xs text-stone-400 max-w-xl font-sans leading-relaxed">
              Create a new team to become Team Leader, or enter an 8-character invite code to join an existing team.
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to={`/Hackathon/create-team${selectedStudentHackathonId ? `?hackathonId=${selectedStudentHackathonId}` : ""}`}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-sans uppercase font-extrabold tracking-wider shadow-lg transition flex items-center gap-1.5 cursor-pointer border border-amber-300"
            >
              <span>+ Create Team</span>
            </Link>
            <Link
              to={`/Hackathon/join-team${selectedStudentHackathonId ? `?hackathonId=${selectedStudentHackathonId}` : ""}`}
              className="px-5 py-2.5 rounded-xl border border-amber-500/30 bg-stone-900/80 hover:bg-amber-400/10 text-amber-300 text-xs font-sans uppercase font-bold tracking-wider shadow-lg transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>🔑 Join Team</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5 serene-glass-card rounded-3xl border border-amber-500/25 p-6 md:p-8 shadow-2xl space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          {team?.abstractionStatus === "approved" ? (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>🏆 Selected for Level 1 ✓</span>
            </div>
          ) : team?.abstractionStatus === "rejected" ? (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm">
              <span>✕ Level 1: Not Shortlisted</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <span>⏳ Under Evaluation</span>
            </div>
          )}
          <div className="font-serif text-3xl uppercase tracking-wider text-stone-100 mt-2 font-normal">{team?.teamName}</div>
          <div className="mt-3 inline-flex items-center gap-3 px-4 py-2 bg-stone-900/90 border border-amber-500/30 rounded-2xl text-xs font-sans">
            <span className="font-bold text-amber-300 uppercase tracking-wider">🔑 Team Invite Code:</span>
            <span className="font-mono font-bold text-stone-100 tracking-widest text-base select-all">{team?.inviteCode}</span>
            <button
              type="button"
              onClick={() => {
                if (team?.inviteCode) {
                  navigator.clipboard.writeText(team.inviteCode);
                  setCopiedCode(true);
                }
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 shadow-sm flex items-center gap-1.5 cursor-pointer ${
                copiedCode
                  ? "bg-emerald-500 text-stone-950 scale-105 font-bold"
                  : "bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/30"
              }`}
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
        </div>

        {!isSubmissionApproved && role === "student" && (
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {team?.isLeader && (
              <button
                type="button"
                disabled={dismantlingTeam}
                onClick={handleDismantleTeam}
                className="px-3.5 py-1.5 rounded-xl border border-rose-500/30 bg-rose-600/20 text-rose-300 text-xs font-bold uppercase tracking-wider hover:bg-rose-600/30 transition disabled:opacity-60 shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{dismantlingTeam ? "Dismantling..." : "Dismantle Team"}</span>
              </button>
            )}
            <button
              type="button"
              disabled={leavingTeam}
              onClick={handleLeaveTeam}
              className="px-3.5 py-1.5 rounded-xl border border-rose-500/30 bg-stone-900/80 hover:bg-rose-500/10 text-rose-300 text-xs font-bold uppercase tracking-wider transition disabled:opacity-60 shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>{leavingTeam ? "Leaving..." : "Leave Team"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Status Section Grid directly under Invite Code */}
      <div className="pt-4 border-t border-amber-500/20 font-sans">
        <div className="p-4 rounded-2xl bg-stone-900/80 border border-amber-500/20 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-[11px] uppercase font-extrabold tracking-wider text-amber-300/90">
              Problem Statement & Abstraction Status
            </div>
            <div className="text-xs text-stone-400 mt-0.5 font-medium">Stage 1 Evaluation</div>
          </div>
          <div className={`px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider border shadow-sm ${
            team?.abstractionStatus === "approved"
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
              : team?.abstractionStatus === "rejected"
              ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
              : "bg-amber-500/20 text-amber-300 border-amber-500/40"
          }`}>
            {team?.abstractionStatus === "approved"
              ? "Selected for Level 1 ✓"
              : team?.abstractionStatus === "rejected"
              ? "Not Shortlisted"
              : "Submitted / Under Review"}
          </div>
        </div>
      </div>

      {/* Official Digital Team Pass (Phase 14.14) */}
      <div className="mt-6 p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-stone-900/90 to-stone-950 border border-amber-500/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 font-sans">
        <div className="space-y-3 text-center md:text-left flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <QrCode className="w-3.5 h-3.5" />
            <span>Official On-Campus Event Pass</span>
          </div>
          <div className="font-serif text-2xl sm:text-3xl text-stone-100 uppercase tracking-wider font-normal">
            {team?.teamName}
          </div>
          <p className="text-xs text-stone-400 max-w-md leading-relaxed font-sans">
            Present this digital badge to event volunteers at the entrance desk for attendance check-in and bench table allocation.
          </p>

          <div className="flex items-center gap-4 flex-wrap justify-center md:justify-start text-xs font-mono pt-1">
            <span className="text-stone-300">Invite Code: <strong className="text-amber-300 text-sm font-bold">{team?.inviteCode}</strong></span>
            <span className="text-stone-600">•</span>
            <span className="text-stone-300">Table / Bench: <strong className="text-amber-300">{team?.benchNumber || "Allocated on check-in"}</strong></span>
            <span className="text-stone-600">•</span>
            {team?.isPresent ? (
              <span className="text-emerald-400 font-bold uppercase">Checked In ✓</span>
            ) : (
              <span className="text-amber-400 font-bold uppercase">Check-in Pending ⏳</span>
            )}
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-2xl shadow-2xl shrink-0 flex flex-col items-center gap-1.5 border border-amber-400/40">
          <QRCodeSVG
            value={JSON.stringify({
              tCode: team?.inviteCode,
              tName: team?.teamName,
              members: (team?.members || []).map((m) => m.member?.fullName || m.fullName),
              count: team?.members?.length || 1,
            })}
            size={140}
            level="M"
            includeMargin={false}
          />
          <span className="text-[9px] text-stone-950 font-mono font-extrabold tracking-widest uppercase">
            SCAN TO VERIFY
          </span>
        </div>
      </div>

      <div className="mt-6 font-sans">
        <div className="font-serif text-lg uppercase tracking-wider text-amber-300 font-normal">Team Members</div>
        <div className="mt-3 space-y-2">
          {(team?.members || []).map((m) => (
            <div
              key={m.userId}
              className="flex items-start justify-between gap-3 bg-stone-900/80 border border-amber-500/20 rounded-2xl p-4"
            >
              <div>
                <div className="font-semibold text-stone-100">{m.member?.fullName || "Member"}</div>
                <div className="text-xs text-stone-400 font-mono">{m.member?.email}</div>
              </div>
              <div className="flex items-center gap-2">
                {m.isLeader ? (
                  <div className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold uppercase tracking-wider">
                    Leader
                  </div>
                ) : (
                  <div className="px-3 py-1 rounded-full bg-stone-950 text-stone-400 border border-amber-500/15 text-xs font-bold uppercase tracking-wider">
                    Member
                  </div>
                )}
                {team?.isLeader && !m.isLeader && (
                  <button
                    type="button"
                    onClick={() => setMemberToRemove(m.member || { fullName: "Team Member", userId: m.userId })}
                    className="p-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 text-xs transition cursor-pointer"
                    title="Remove member"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 font-sans">
        <div className="font-serif text-lg uppercase tracking-wider text-amber-300 font-normal">
          {isCustomMode ? "Project Theme & Topic" : "Selected Problem"}
        </div>
        <div className="mt-2 text-stone-200 font-sans text-sm">
          {isCustomMode
            ? team?.topic
              ? `${team.topic} (${team.theme || "No Theme"})`
              : team?.theme
                ? `Theme: ${team.theme}`
                : "Not configured yet"
            : selectedProblem
              ? selectedProblem.title
              : team?.topic
                ? team.topic
                : "Not selected yet"}
        </div>
      </div>
    </div>
  );
}
