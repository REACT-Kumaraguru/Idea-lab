import React from "react";
import { MessageSquare, ExternalLink } from "lucide-react";

export default function DashboardContactTab({ selectedStudentHackathon }) {
  return (
    <div className="mt-5 w-full max-w-5xl mx-auto font-sans space-y-6">
      <div className="serene-glass-card rounded-3xl border border-amber-500/25 p-6 md:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Participant Community & Support</span>
            </div>
            <h3 className="font-serif text-3xl text-stone-100 uppercase tracking-wider mt-2 font-normal">
              Contact & Organizing Committee
            </h3>
          </div>
        </div>

        {/* WhatsApp Community Box */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-stone-900/80 to-stone-950 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="font-serif text-lg text-emerald-300 uppercase tracking-wider font-normal">
              Official WhatsApp Announcement Group
            </div>
            <p className="text-xs text-stone-400 max-w-md">
              Join the official participant group for instant announcements, real-time schedule updates, and mentor Q&A.
            </p>
          </div>

          {selectedStudentHackathon?.whatsappInviteLink ? (
            <a
              href={selectedStudentHackathon.whatsappInviteLink}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-bold uppercase tracking-wider shadow-lg transition flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Join WhatsApp Group</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <span className="text-xs text-stone-500 font-mono">Link configured by organizing desk</span>
          )}
        </div>

        {/* Coordinates Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Faculty Coordinates */}
          <div className="p-5 rounded-2xl bg-stone-900/80 border border-amber-500/20 space-y-3">
            <div className="font-serif text-base uppercase tracking-wider text-amber-300 font-normal">
              Faculty Coordinators
            </div>
            {(() => {
              let faculty = [];
              try {
                const raw = selectedStudentHackathon?.facultyCoordinates;
                faculty = typeof raw === "string" ? JSON.parse(raw) : (raw || []);
              } catch {}
              if (!Array.isArray(faculty) || faculty.length === 0) {
                return (
                  <div className="text-xs text-stone-400 space-y-1">
                    <div><strong>Dr. Sasikala</strong> — AICTE IDEA Lab Coordinator</div>
                    <div className="text-stone-500 font-mono">idealab@kct.ac.in</div>
                  </div>
                );
              }
              return (
                <div className="space-y-2 text-xs">
                  {faculty.map((f, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-stone-950/60 border border-stone-800">
                      <div className="font-semibold text-stone-200">{f.name || f.fullName}</div>
                      <div className="text-stone-400 font-mono text-[11px]">{f.email || f.phone || f.dept}</div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Student Coordinates */}
          <div className="p-5 rounded-2xl bg-stone-900/80 border border-amber-500/20 space-y-3">
            <div className="font-serif text-base uppercase tracking-wider text-amber-300 font-normal">
              Student Coordinators
            </div>
            {(() => {
              let students = [];
              try {
                const raw = selectedStudentHackathon?.studentCoordinates;
                students = typeof raw === "string" ? JSON.parse(raw) : (raw || []);
              } catch {}
              if (!Array.isArray(students) || students.length === 0) {
                return (
                  <div className="text-xs text-stone-400 space-y-1">
                    <div><strong>Adithya</strong> — Student Lead (25BCS016)</div>
                    <div className="text-stone-500 font-mono">react@kct.ac.in</div>
                  </div>
                );
              }
              return (
                <div className="space-y-2 text-xs">
                  {students.map((s, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-stone-950/60 border border-stone-800">
                      <div className="font-semibold text-stone-200">{s.name || s.fullName}</div>
                      <div className="text-stone-400 font-mono text-[11px]">{s.phone || s.email}</div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Venue Details */}
        <div className="p-4 rounded-2xl bg-stone-900/60 border border-amber-500/15 text-xs text-stone-400 flex items-center justify-between flex-wrap gap-2">
          <span><strong>Event Venue:</strong> {selectedStudentHackathon?.venue || "Kumaraguru College of Technology, Coimbatore"}</span>
          <span className="font-mono text-amber-300/80">AICTE IDEA Lab Center</span>
        </div>
      </div>
    </div>
  );
}
