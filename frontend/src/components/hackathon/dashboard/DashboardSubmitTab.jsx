import React from "react";
import { AlertTriangle, ExternalLink } from "lucide-react";

export default function DashboardSubmitTab({
  teamLoading,
  problemsLoading,
  teamHasSubmitted,
  team,
  changeTab,
  submitAllowed,
  submissionBlockedReason,
  submissionStep,
  setSubmissionStep,
  goToSubmitStep2,
  whyParticipate,
  setWhyParticipate,
  problemToSolve,
  setProblemToSolve,
  plannedTech,
  setPlannedTech,
  workedBefore,
  setWorkedBefore,
  agreedTerms,
  setAgreedTerms,
  onSubmit,
  isCustomMode,
  selectedProblem,
  mentorNamesForProblem,
  phase,
  setPhase,
  setFiles,
  templatePdfHref,
  selectedStudentHackathon,
  repoLink,
  setRepoLink,
  description,
  setDescription,
  validateSubmissionFiles,
  setSubmitError,
  submitting,
  submitError,
}) {
  return (
    <div className="mt-5 w-full max-w-5xl mx-auto font-sans">
      {teamLoading || problemsLoading ? (
        <div className="text-stone-400 font-sans text-xs uppercase tracking-widest mb-4">
          Loading team status...
        </div>
      ) : null}

      {teamHasSubmitted ? (
        <div className="serene-glass-card rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-8 md:p-10 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto text-2xl font-bold shadow-lg">
            ✓
          </div>
          <div className="space-y-2">
            <div className="font-serif text-3xl uppercase tracking-wider text-stone-100 font-normal">
              Form Submitted Successfully!
            </div>
            <p className="text-stone-300 text-sm max-w-lg mx-auto leading-relaxed font-sans">
              Your team (<strong className="text-amber-300 font-semibold">{team?.teamName}</strong>) has already submitted your project proposal and documents for this hackathon.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-extrabold uppercase tracking-wider">
            Status: Under Review by Faculty Mentor
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => changeTab("status")}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 font-extrabold text-xs uppercase tracking-wider hover:brightness-110 transition shadow-lg border border-amber-300 cursor-pointer"
            >
              Track Status on Status Tab →
            </button>
          </div>
        </div>
      ) : (
        <>
          {!submitAllowed ? (
            <div className="mb-5 flex items-start gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur-xl font-sans bg-amber-500/10 border-amber-500/30 text-amber-200">
              <AlertTriangle className="mt-0.5 w-5 h-5 shrink-0 text-amber-400" />
              <div className="text-xs font-medium leading-relaxed">
                {submissionBlockedReason || "You are not part of any team yet. Create or join a team first."}
              </div>
            </div>
          ) : (
            <div className="mb-5 flex items-start gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur-xl font-sans bg-emerald-500/10 border-emerald-500/30 text-emerald-200">
              <AlertTriangle className="mt-0.5 w-5 h-5 shrink-0 text-emerald-400" />
              <div className="text-xs font-medium leading-relaxed">
                Reviewer Approved ✓. Complete the questions below and submit your proposal for Faculty Mentor review.
              </div>
            </div>
          )}

          <div className="serene-glass-card rounded-3xl border border-amber-500/25 p-6 md:p-8 shadow-2xl text-stone-100 font-sans" aria-disabled={!submitAllowed}>
            {/* Step 1 / Step 2 Tabs */}
            <div className="mb-6 rounded-2xl border border-amber-500/20 bg-stone-900/80 p-1.5 shadow-inner">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSubmissionStep(1)}
                  className={`rounded-xl px-4 py-3 text-center transition cursor-pointer font-sans ${
                    submissionStep === 1
                      ? "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 font-bold shadow-lg border border-amber-300"
                      : "bg-stone-950/60 text-stone-400 border border-amber-500/10 hover:text-amber-300 hover:border-amber-500/30"
                  }`}
                >
                  <div className="text-[10px] font-bold uppercase tracking-widest">Step 1</div>
                  <div className="text-xs font-serif uppercase tracking-wider font-semibold mt-0.5">Participation Questions</div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (submitAllowed) goToSubmitStep2();
                  }}
                  className={`rounded-xl px-4 py-3 text-center transition cursor-pointer font-sans ${
                    submissionStep === 2
                      ? "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 font-bold shadow-lg border border-amber-300"
                      : "bg-stone-950/60 text-stone-400 border border-amber-500/10 hover:text-amber-300 hover:border-amber-500/30"
                  }`}
                >
                  <div className="text-[10px] font-bold uppercase tracking-widest">Step 2</div>
                  <div className="text-xs font-serif uppercase tracking-wider font-semibold mt-0.5">File & Proposal Upload</div>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {submissionStep === 1 ? (
                <div className="rounded-2xl border border-amber-500/20 bg-stone-900/40 p-6 space-y-5 transition-all duration-300">
                  <div>
                    <label className="block text-xs font-serif uppercase tracking-wider text-amber-300 mb-2 font-normal">
                      1. Why does your team want to participate in this hackathon? *
                    </label>
                    <textarea
                      rows={3}
                      value={whyParticipate}
                      onChange={(e) => setWhyParticipate(e.target.value)}
                      placeholder="Explain your team's motivation and goals..."
                      className="w-full rounded-xl border border-amber-500/30 bg-stone-900/90 p-3.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 font-sans"
                      disabled={!submitAllowed}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-serif uppercase tracking-wider text-amber-300 mb-2 font-normal">
                      2. What problem are you trying to solve? *
                    </label>
                    <textarea
                      rows={3}
                      value={problemToSolve}
                      onChange={(e) => setProblemToSolve(e.target.value)}
                      placeholder="Describe the core problem statement, target audience, and pain points..."
                      className="w-full rounded-xl border border-amber-500/30 bg-stone-900/90 p-3.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 font-sans"
                      disabled={!submitAllowed}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-serif uppercase tracking-wider text-amber-300 mb-2 font-normal">
                      3. What technologies are you planning to use? *
                    </label>
                    <input
                      type="text"
                      value={plannedTech}
                      onChange={(e) => setPlannedTech(e.target.value)}
                      placeholder="e.g. React, Node.js, Python, OpenCV, TensorFlow, Raspberry Pi"
                      className="w-full rounded-xl border border-amber-500/30 bg-stone-900/90 p-3.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 font-sans"
                      disabled={!submitAllowed}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-serif uppercase tracking-wider text-amber-300 mb-2 font-normal">
                      4. Have you worked on this idea before?
                    </label>
                    <select
                      value={workedBefore}
                      onChange={(e) => setWorkedBefore(e.target.value)}
                      className="w-full rounded-xl border border-amber-500/30 bg-stone-900/90 p-3.5 text-xs text-stone-100 focus:outline-none focus:border-amber-400 font-sans"
                      disabled={!submitAllowed}
                    >
                      <option value="no">No — Fresh idea for this hackathon</option>
                      <option value="yes_concept">Yes — Early concept phase</option>
                      <option value="yes_prototype">Yes — Existing prototype being expanded</option>
                    </select>
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="agreedTerms"
                      checked={agreedTerms}
                      onChange={(e) => setAgreedTerms(e.target.checked)}
                      className="w-4 h-4 rounded border-amber-500/40 text-amber-400 focus:ring-amber-400 cursor-pointer accent-amber-400"
                      disabled={!submitAllowed}
                    />
                    <label htmlFor="agreedTerms" className="text-xs text-stone-300 font-sans cursor-pointer select-none">
                      I agree to the official terms, rules, and code of conduct of the hackathon
                    </label>
                  </div>

                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={goToSubmitStep2}
                      disabled={!submitAllowed}
                      className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 font-extrabold text-xs uppercase tracking-wider hover:brightness-110 disabled:opacity-50 transition shadow-lg border border-amber-300 cursor-pointer"
                    >
                      Continue to Step 2 →
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="rounded-2xl border border-amber-500/20 bg-stone-900/40 p-6 space-y-5 transition-all duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-serif uppercase tracking-wider text-amber-300 mb-1.5 font-normal">
                        {isCustomMode ? "Personalized Problem Topic / Theme" : "Selected Problem Statement"}
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={
                          isCustomMode
                            ? (team?.topic || team?.theme || "Personalized Problem Statement")
                            : (selectedProblem ? selectedProblem.title : team?.topic || "Selected Problem Statement")
                        }
                        className="w-full rounded-xl border border-amber-500/20 bg-stone-950/80 px-4 py-3 text-xs text-stone-300 font-sans cursor-not-allowed font-semibold"
                      />
                      {!isCustomMode && selectedProblem && (
                        <div className="mt-1.5 text-[11px] text-stone-400 font-sans">
                          Mentors: {mentorNamesForProblem(selectedProblem)}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-serif uppercase tracking-wider text-amber-300 mb-1.5 font-normal">
                        Submission Phase
                      </label>
                      <select
                        value={phase}
                        onChange={(e) => {
                          setPhase(e.target.value);
                          setFiles([]);
                        }}
                        className="w-full rounded-xl border border-amber-500/30 bg-stone-900/90 px-4 py-3 text-xs text-stone-100 focus:outline-none focus:border-amber-400 font-sans"
                        disabled={!submitAllowed}
                      >
                        <option value="poc">Proof of Concept (PoC)</option>
                        <option value="prototype">Working Prototype</option>
                        <option value="final">Final Presentation / Codebase</option>
                      </select>
                    </div>
                  </div>

                  {phase === "poc" ? (
                    <div className="rounded-2xl border border-amber-500/30 bg-amber-400/10 p-4 text-xs text-amber-200 flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <div className="font-bold uppercase tracking-wider text-stone-100 font-serif">PoC Submission Template</div>
                        <p className="mt-1 text-stone-300 font-sans text-xs">
                          Follow the official PDF structure for your PoC document upload.
                        </p>
                      </div>
                      {templatePdfHref ? (
                        <a
                          href={templatePdfHref}
                          download="hackathon_poc_template.pdf"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs uppercase font-extrabold tracking-wider transition shadow-md border border-amber-300"
                        >
                          <span>Download Template PDF</span>
                          <span className="font-sans">📄</span>
                        </a>
                      ) : null}
                    </div>
                  ) : null}

                  {phase !== "poc" ? (
                    <div className="rounded-2xl border border-amber-500/30 bg-amber-400/10 p-4 text-xs text-amber-200 flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <div className="font-bold uppercase tracking-wider text-stone-100 font-serif">Official Presentation Slide Template</div>
                        <p className="mt-1 text-stone-300 font-sans text-xs">
                          Use the official 10-slide deck format covering problem statement, system design, tech stack, and demonstration.
                        </p>
                      </div>
                      <a
                        href={selectedStudentHackathon?.slideTemplateUrl || "https://docs.google.com/presentation/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/copy"}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs uppercase font-extrabold tracking-wider transition shadow-md border border-amber-300 cursor-pointer"
                      >
                        <span>Open Slide Template</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ) : null}

                  <div>
                    <label className="block text-xs font-serif uppercase tracking-wider text-amber-300 mb-1.5 font-normal">
                      Project Code Repository / Cloud Drive Link (Optional)
                    </label>
                    <input
                      type="url"
                      value={repoLink}
                      onChange={(e) => setRepoLink(e.target.value)}
                      placeholder="https://github.com/username/project or https://drive.google.com/..."
                      className="w-full rounded-xl border border-amber-500/30 bg-stone-900/90 p-3.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 font-mono"
                      disabled={!submitAllowed}
                    />
                    {repoLink && !repoLink.startsWith("http://") && !repoLink.startsWith("https://") && (
                      <p className="text-[11px] text-rose-400 mt-1 font-sans">
                        ⚠️ Please provide a valid URL starting with https://
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-serif uppercase tracking-wider text-amber-300 mb-1.5 font-normal">
                      Submission Summary / Approach *
                    </label>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Summarize your technical implementation, methodology, architecture, and current progress..."
                      className="w-full rounded-xl border border-amber-500/30 bg-stone-900/90 p-4 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 font-sans"
                      disabled={!submitAllowed}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-serif uppercase tracking-wider text-amber-300 mb-1.5 font-normal">
                      Upload {phase === "poc" ? "PoC Document" : phase === "prototype" ? "Prototype Files" : "Final Submission"} *
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.docx"
                      multiple={phase !== "poc"}
                      onChange={(e) => {
                        const selectedFiles = Array.from(e.target.files || []);
                        const fileErr = validateSubmissionFiles(selectedFiles);
                        if (fileErr) {
                          setSubmitError(fileErr);
                          setFiles([]);
                        } else {
                          setSubmitError(null);
                          setFiles(selectedFiles);
                        }
                      }}
                      className="w-full text-xs text-stone-300 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border file:border-amber-500/30 file:text-xs file:font-bold file:uppercase file:tracking-wider file:bg-amber-400 file:text-stone-950 hover:file:brightness-110 transition cursor-pointer"
                    />
                    <p className="mt-1 text-[11px] text-stone-400 font-sans">Accepted formats: PDF or DOCX documents only.</p>
                  </div>

                  <div className="pt-3 flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => setSubmissionStep(1)}
                      className="px-6 py-3 rounded-xl bg-stone-900 border border-amber-500/30 text-stone-300 font-bold text-xs uppercase tracking-wider hover:bg-stone-800 hover:text-amber-300 transition cursor-pointer"
                    >
                      ← Back to Questions
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || !submitAllowed}
                      className="flex-1 px-8 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 font-extrabold text-xs uppercase tracking-wider hover:brightness-110 disabled:opacity-50 transition shadow-lg border border-amber-300 cursor-pointer"
                    >
                      {submitting ? "Submitting Proposal..." : "Submit Proposal & Files 🚀"}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {submitError ? (
              <div className="mt-5 flex items-start gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur-xl font-sans bg-amber-500/10 border-amber-500/30 text-amber-200">
                <AlertTriangle className="mt-0.5 w-5 h-5 shrink-0 text-amber-400" />
                <div className="text-xs font-medium leading-relaxed">{submitError}</div>
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
