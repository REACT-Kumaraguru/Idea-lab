import React from "react";
import { AlertTriangle } from "lucide-react";

export default function DashboardStatusTab({
  statusLoading,
  role,
  statusData,
  formatProblemStatementDisplay,
  formatSubmissionStatus,
  mentorApproveSubmission,
  getSubmissionFiles,
  downloadHackathonSubmissionFile,
  fileHref,
  fileNameFromUrl,
}) {
  return (
    <div className="mt-5 font-sans">
      {statusLoading ? (
        <div className="text-stone-400 text-xs font-sans uppercase tracking-widest">
          Loading status...
        </div>
      ) : null}

      <div className="max-w-4xl mx-auto space-y-4">
        {role === "mentor" ? (
          <div className="serene-glass-card rounded-3xl border border-amber-500/25 p-6 md:p-8 shadow-2xl text-stone-100">
            <div className="font-serif text-2xl uppercase tracking-wider text-stone-100 font-normal">
              Assigned Submissions
            </div>
            <p className="text-xs text-stone-400 mt-1 font-sans">
              Submissions for the problems assigned to you for technical review and mentor approval.
            </p>

            {statusData?.submissions?.length ? (
              <div className="mt-6 space-y-5">
                {statusData.submissions.map((s) => (
                  <div key={s.id} className="p-6 rounded-2xl border border-amber-500/20 bg-stone-900/90 text-stone-100 space-y-4 shadow-xl">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <div className="font-serif text-lg text-amber-300 uppercase tracking-wider font-normal flex items-center gap-2 flex-wrap">
                          <span>{formatProblemStatementDisplay(s).title} ({s.submissionPhase} phase)</span>
                          {formatProblemStatementDisplay(s).isPersonalized && (
                            <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[9px] font-bold uppercase tracking-wider">
                              Personalized
                            </span>
                          )}
                        </div>
                        {formatProblemStatementDisplay(s).theme && (
                          <div className="text-xs text-amber-200/90 font-sans mt-0.5">
                            <strong>Theme:</strong> {formatProblemStatementDisplay(s).theme}
                          </div>
                        )}
                        <div className="text-xs text-stone-300 mt-1 font-sans">
                          Team: <span className="font-bold text-stone-100">{s.team?.teamName || "—"}</span>
                        </div>
                      </div>
                      <div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${formatSubmissionStatus(s).color}`}>
                          {formatSubmissionStatus(s).label}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 font-sans text-xs">
                      <div className="rounded-2xl border border-amber-500/20 bg-stone-950/70 p-4">
                        <div className="text-xs uppercase font-bold text-amber-300 tracking-wider">Team members</div>
                        <div className="text-xs text-stone-200 mt-1">
                          {(s.team?.members || [])
                            .map((m) => (m?.user?.fullName ? `${m.user.fullName}${m.isLeader ? " (Leader)" : ""}` : null))
                            .filter(Boolean)
                            .join(", ") || "—"}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-amber-500/20 bg-stone-950/70 p-4 space-y-2">
                        <div className="text-xs uppercase font-bold text-amber-300 tracking-wider">Participation details</div>
                        <div className="space-y-2.5 text-stone-200 pt-1">
                          <div>
                            <div className="font-bold text-stone-300">
                              1. Why does your team want to participate in this hackathon?
                            </div>
                            <div className="text-stone-400 whitespace-pre-wrap mt-0.5">{s.whyParticipate || "—"}</div>
                          </div>
                          <div>
                            <div className="font-bold text-stone-300">2. What problem are you trying to solve?</div>
                            <div className="text-stone-400 whitespace-pre-wrap mt-0.5">{s.problemToSolve || "—"}</div>
                          </div>
                          <div>
                            <div className="font-bold text-stone-300">3. What technologies are you planning to use?</div>
                            <div className="text-stone-400 whitespace-pre-wrap mt-0.5">{s.plannedTech || "—"}</div>
                          </div>
                          <div>
                            <div className="font-bold text-stone-300">4. Have you worked on this idea before?</div>
                            <div className="text-stone-400 mt-0.5">{s.workedBefore ? String(s.workedBefore) : "—"}</div>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-amber-500/20 bg-stone-950/70 p-4">
                        <div className="text-xs uppercase font-bold text-amber-300 tracking-wider">Description</div>
                        <div className="text-xs text-stone-300 mt-1 whitespace-pre-wrap">{s.description || "—"}</div>
                      </div>

                      <div className="rounded-2xl border border-amber-500/20 bg-stone-950/70 p-4">
                        <div className="text-xs uppercase font-bold text-amber-300 tracking-wider">Uploaded files</div>
                        {getSubmissionFiles(s).length ? (
                          <div className="mt-2 space-y-2">
                            {getSubmissionFiles(s).map((u, idx) => (
                              <div key={`${u}-${idx}`} className="flex flex-wrap items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => void downloadHackathonSubmissionFile(u)}
                                  className="inline-flex items-center rounded-xl bg-amber-400/20 border border-amber-400/30 px-3 py-1 text-xs font-bold uppercase text-amber-300 hover:bg-amber-400/30 transition cursor-pointer"
                                >
                                  Download
                                </button>
                                <a
                                  href={fileHref(u)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs text-amber-300 hover:underline font-mono break-all"
                                >
                                  {fileNameFromUrl(u)}
                                </a>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-stone-500 mt-1">—</div>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-3 flex-wrap pt-2">
                        <div className="text-xs text-stone-300 font-sans">
                          Mentor approval:{" "}
                          <span className={`font-bold ${s.mentorApproved ? "text-emerald-400" : "text-amber-300"}`}>
                            {s.mentorApproved ? "Approved ✓" : "Not approved"}
                          </span>
                        </div>
                        <button
                          type="button"
                          disabled={Boolean(s.mentorApproved)}
                          onClick={() => mentorApproveSubmission(s.id)}
                          className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold uppercase text-xs tracking-wider disabled:opacity-60 transition shadow-lg cursor-pointer border border-amber-300"
                        >
                          {s.mentorApproved ? "Mentor Approved ✓" : "Mentor Approve"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 p-6 text-center text-stone-400 text-xs font-sans border border-amber-500/15 rounded-2xl bg-stone-950/60">
                No submissions found for your assigned problems yet.
              </div>
            )}
          </div>
        ) : !statusData?.team ? (
          <div className="flex items-start gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur-xl font-sans bg-amber-500/10 border-amber-500/30 text-amber-200">
            <AlertTriangle className="mt-0.5 w-5 h-5 shrink-0 text-amber-400" />
            <div className="text-xs font-medium leading-relaxed">
              No team found. Create or join a team to track submissions.
            </div>
          </div>
        ) : (
          <div className="serene-glass-card rounded-3xl border border-amber-500/25 p-6 md:p-8 shadow-2xl text-stone-100 space-y-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {statusData?.team?.status === "approved" ? "Team Registered" : statusData?.team?.status || "Active"}
                </div>
                <div className="font-serif text-3xl uppercase tracking-wider text-stone-100 mt-2 font-normal">
                  {statusData?.team?.teamName}
                </div>
                <div className="text-xs text-stone-400 mt-1 font-mono">
                  Invite Code: <span className="text-amber-300 font-bold">{statusData?.team?.inviteCode}</span>
                </div>
              </div>
            </div>

            <div>
              <div className="font-serif text-xl uppercase tracking-wider text-amber-300 font-normal border-b border-amber-500/20 pb-2 mb-4">
                Submissions
              </div>
              {statusData.submissions?.length ? (
                <div className="space-y-4 font-sans text-xs">
                  {statusData.submissions.map((s) => (
                    <div key={s.id} className="p-5 rounded-2xl border border-amber-500/20 bg-stone-900/90 text-stone-100 space-y-3">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <div className="font-serif text-base uppercase text-stone-100 font-normal">
                            {s.problem?.title || "Problem Track"} ({s.submissionPhase} phase)
                          </div>
                          <div className="text-xs text-stone-300 mt-0.5">{s.title}</div>
                        </div>
                        <div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${formatSubmissionStatus(s).color}`}>
                            {formatSubmissionStatus(s).label}
                          </span>
                          {s.winnerAmount ? (
                            <div className="text-xs text-emerald-400 font-bold mt-2">
                              Winner Prize: ₹{s.winnerAmount}
                            </div>
                          ) : null}
                        </div>
                      </div>
                      {s.description ? (
                        <div className="text-xs text-stone-300 whitespace-pre-wrap border-t border-amber-500/15 pt-3">
                          {s.description}
                        </div>
                      ) : null}
                      <div className="rounded-2xl border border-amber-500/20 bg-stone-950/60 p-4">
                        <div className="text-xs uppercase font-bold text-amber-300 tracking-wider">
                          {s.submissionPhase === "poc"
                            ? "PoC files"
                            : s.submissionPhase === "prototype"
                              ? "Prototype files"
                              : "Final files"}
                        </div>
                        {getSubmissionFiles(s).length ? (
                          <div className="mt-2 space-y-2">
                            {getSubmissionFiles(s).map((u, idx) => (
                              <div key={`${u}-${idx}`} className="flex flex-wrap items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => void downloadHackathonSubmissionFile(u)}
                                  className="inline-flex items-center rounded-xl bg-amber-400/20 border border-amber-400/30 px-3 py-1 text-xs font-bold uppercase text-amber-300 hover:bg-amber-400/30 transition cursor-pointer"
                                >
                                  Download
                                </button>
                                <a
                                  href={fileHref(u)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs text-amber-300 hover:underline font-mono break-all"
                                >
                                  {fileNameFromUrl(u)}
                                </a>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-stone-500 mt-1">No files for this phase.</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-stone-400 text-xs font-sans border border-amber-500/15 rounded-2xl bg-stone-950/60">
                  No submissions found yet.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
