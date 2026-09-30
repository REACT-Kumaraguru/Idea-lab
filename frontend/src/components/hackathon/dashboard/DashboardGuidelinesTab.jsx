import React from "react";
import { FileText } from "lucide-react";

export default function DashboardGuidelinesTab({ selectedStudentHackathon }) {
  return (
    <div className="mt-5 w-full max-w-5xl mx-auto font-sans space-y-6">
      <div className="serene-glass-card rounded-3xl border border-amber-500/25 p-6 md:p-8 shadow-2xl space-y-5">
        <div className="flex items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <FileText className="w-3.5 h-3.5" />
              <span>Official Event Regulation</span>
            </div>
            <h3 className="font-serif text-3xl text-stone-100 uppercase tracking-wider mt-2 font-normal">
              {selectedStudentHackathon?.name || "Hackathon"} Guidelines
            </h3>
          </div>
        </div>

        {selectedStudentHackathon?.guidelines ? (
          <div className="p-6 rounded-2xl bg-stone-900/80 border border-amber-500/20 text-xs text-stone-200 leading-relaxed font-sans whitespace-pre-wrap">
            {selectedStudentHackathon.guidelines}
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <div className="bg-stone-900/90 border border-amber-500/20 rounded-2xl p-5 space-y-2">
              <div className="font-serif text-base uppercase tracking-wider text-amber-300 font-normal">Team Composition & Rules</div>
              <ul className="space-y-1.5 text-stone-300 list-disc list-inside">
                <li>Teams must consist of 1 to 4 members. Cross-department teams are highly encouraged.</li>
                <li>Each participant can only be part of one registered team per hackathon edition.</li>
                <li>All code, hardware, and design assets must be developed during the hackathon period.</li>
              </ul>
            </div>

            <div className="bg-stone-900/90 border border-amber-500/20 rounded-2xl p-5 space-y-2">
              <div className="font-serif text-base uppercase tracking-wider text-amber-300 font-normal">Reviewer Evaluation & Stage 1 Selection</div>
              <ul className="space-y-1.5 text-stone-300 list-disc list-inside">
                <li>Problem statements and technical abstractions are reviewed by designated domain faculty and industry evaluators.</li>
                <li>Shortlisted Level 1 teams receive official verification badges on their dashboards and can proceed with PoC build.</li>
              </ul>
            </div>

            <div className="bg-stone-900/90 border border-amber-500/20 rounded-2xl p-5 space-y-2">
              <div className="font-serif text-base uppercase tracking-wider text-amber-300 font-normal">Prizes & Recognitions</div>
              <p className="text-stone-300">
                {selectedStudentHackathon?.prizes || "Exciting cash prizes, innovation grants, and incubation access for winning teams."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
