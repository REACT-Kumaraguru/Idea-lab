import React from "react";
import { AlertTriangle, Check, Lock } from "lucide-react";
import { HackathonProblemArticleCard } from "../HackathonProblemArticleCard.jsx";

export default function DashboardProblemsTab({
  teamHasSubmitted,
  selectedStudentHackathon,
  showResults,
  team,
  problemsLoading,
  problems,
  problemIsFull,
  onSelectProblem,
}) {
  return (
    <div className="mt-5 w-full max-w-6xl mx-auto font-sans">
      {teamHasSubmitted ? (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur-xl font-sans bg-emerald-500/10 border-emerald-500/30 text-emerald-200">
          <AlertTriangle className="mt-0.5 w-5 h-5 shrink-0 text-emerald-400" />
          <div className="text-xs font-medium leading-relaxed">
            Your team has already submitted. You can review your entry under the <strong className="underline underline-offset-2">Status</strong> tab.
          </div>
        </div>
      ) : null}

      {selectedStudentHackathon?.problemStatementType === "custom" ? (
        <div className="serene-glass-card rounded-3xl border border-amber-500/25 p-6 sm:p-8 max-w-3xl mx-auto shadow-2xl text-stone-100 font-sans">
          <div className="flex items-center justify-between gap-3 mb-5 pb-4 border-b border-amber-500/20 flex-wrap">
            <div>
              <h3 className="font-serif text-2xl uppercase tracking-wider text-stone-100 flex items-center gap-2 font-normal">
                <span>✨ Personalized Problem Statement (Abstraction)</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-sans font-bold">
                  {selectedStudentHackathon?.name || "Selected Event"}
                </span>
              </h3>
              <p className="text-xs text-stone-400 mt-1 font-sans">
                Select your project theme and enter your personalized problem statement title and abstraction details below.
              </p>
            </div>
            {!showResults ? (
              <span className="text-xs font-bold px-3.5 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider animate-pulse">
                PENDING ⏳
              </span>
            ) : team?.abstractionStatus === "approved" ? (
              <span className="text-xs font-bold px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                Approved by Reviewer ✓
              </span>
            ) : team?.abstractionStatus === "rejected" || team?.abstractionStatus === "needs_revision" ? (
              <span className="text-xs font-bold px-3.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase tracking-wider">
                Not Selected ❌
              </span>
            ) : (
              <span className="text-xs font-bold px-3.5 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider animate-pulse">
                PENDING ⏳
              </span>
            )}
          </div>

          {showResults && team?.reviewerFeedback && (
            <div className="mb-5 p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200 font-sans">
              <strong className="block uppercase tracking-wider font-bold text-rose-300 mb-1">
                Reviewer Notes / Feedback:
              </strong>
              <p className="italic">"{team.reviewerFeedback}"</p>
            </div>
          )}

          {team?.abstractionStatus === "submitted" || team?.abstractionStatus === "approved" ? (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 font-sans flex items-center justify-between gap-3">
                <span className="font-bold uppercase tracking-wider">Your team has submitted the problem statement ✓</span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold uppercase text-[10px]">Submitted</span>
              </div>

              <div>
                <label className="block text-xs font-serif uppercase tracking-wider text-amber-300 mb-1 font-normal">
                  Selected Project Theme
                </label>
                <div className="p-3.5 rounded-2xl border border-amber-500/20 bg-stone-900/90 text-stone-100 text-xs font-sans font-semibold">
                  {team?.theme || "Not configured"}
                </div>
              </div>

              <div>
                <label className="block text-xs font-serif uppercase tracking-wider text-amber-300 mb-1 font-normal">
                  Problem Statement Title / Topic
                </label>
                <div className="p-3.5 rounded-2xl border border-amber-500/20 bg-stone-900/90 text-stone-100 text-xs font-sans">
                  {team?.topic || "Not configured"}
                </div>
              </div>

              <div>
                <label className="block text-xs font-serif uppercase tracking-wider text-amber-300 mb-1 font-normal">
                  Project Description (Abstraction)
                </label>
                <div className="p-4 rounded-2xl border border-amber-500/20 bg-stone-900/90 text-stone-200 text-xs font-sans whitespace-pre-wrap leading-relaxed">
                  {team?.description || team?.abstractText || "Not configured"}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-300">
                <Lock className="w-7 h-7 text-amber-300" />
              </div>
              <h4 className="font-serif text-xl uppercase tracking-wider text-amber-300 font-normal">
                Submissions Closed
              </h4>
              <p className="text-stone-300 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                Problem statement (abstraction) submissions are now closed. New problem statement submissions are no longer accepted.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
                <span>Problem Statement Submissions Closed 🔒</span>
              </div>
            </div>
          )}
        </div>
      ) : problemsLoading ? (
        <div className="text-stone-400 font-sans text-xs uppercase tracking-widest">Loading problems...</div>
      ) : problems.length ? (
        <div className="flex flex-col gap-8 sm:gap-10">
          {problems.map((p) => (
            <HackathonProblemArticleCard
              key={p.id}
              problem={p}
              footerMeta={
                <div className="font-sans text-xs text-stone-400">
                  {p.teamRegistrationLimit != null && p.teamRegistrationLimit > 0 ? (
                    <span>
                      Teams registered:{" "}
                      <strong className="font-bold text-amber-300">{p.registeredTeams ?? 0}</strong> /{" "}
                      <strong className="font-bold text-stone-200">{p.teamRegistrationLimit}</strong>
                    </span>
                  ) : (
                    <span>
                      Teams registered:{" "}
                      <strong className="font-bold text-amber-300">{p.registeredTeams ?? 0}</strong>
                    </span>
                  )}
                  {problemIsFull(p) ? (
                    <span className="block mt-1 text-amber-400 font-bold uppercase tracking-wider">Registration full</span>
                  ) : null}
                </div>
              }
              action={
                teamHasSubmitted ? (
                  <div className="px-6 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Submitted</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={problemIsFull(p)}
                    onClick={() => onSelectProblem(p)}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 font-extrabold text-xs uppercase tracking-wider hover:brightness-110 transition shadow-lg border border-amber-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {problemIsFull(p) ? "Full" : "Select Problem"}
                  </button>
                )
              }
            />
          ))}
        </div>
      ) : (
        <div className="serene-glass-card rounded-3xl border border-amber-500/25 p-8 shadow-2xl text-stone-400 font-sans leading-relaxed text-center text-xs uppercase tracking-widest">
          No problems available yet.
        </div>
      )}
    </div>
  );
}
