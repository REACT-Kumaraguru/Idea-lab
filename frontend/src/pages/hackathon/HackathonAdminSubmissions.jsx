import React, { useEffect, useMemo, useState } from "react";
import { axiosInstance } from "../../lib/axios.js";
import { downloadHackathonSubmissionFile, fileHref } from "../../lib/hackathonSubmissionFiles.js";
import { handleDownloadSubmissionsPDF } from "../../lib/hackathonDownloadStudentsPdf.js";
import { useLocation } from "react-router-dom";

const formatStatus = (s) => {
  if (!s) return "—";
  if (s === "submitted" || s === "under_review") return "pending";
  return s;
};

const isDecisionLocked = (status) =>
  status === "approved" || status === "rejected" || status === "winner";

function SubmissionCard({ s, adminNotes, setAdminNotes, updateStatus }) {
  const locked = isDecisionLocked(s.status);
  const files =
    s.submissionPhase === "poc"
      ? Array.isArray(s.pocFilePaths)
        ? s.pocFilePaths
        : []
      : Array.isArray(s.prototypeFilePaths)
        ? s.prototypeFilePaths
        : [];

  return (
    <div className="serene-glass-card rounded-2xl border border-amber-500/20 p-5 shadow-xl">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="text-[10px] font-sans font-bold uppercase tracking-widest text-amber-400">{s.submissionPhase} Phase</div>
          <div className="font-serif text-lg text-stone-100 uppercase tracking-wider mt-0.5 font-normal">{s.problem?.title || "Problem Track"}</div>
          <div className="text-sm text-stone-300 mt-1 font-sans">{s.title}</div>
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-full bg-stone-900 border border-amber-500/30 text-amber-300 text-xs font-sans uppercase font-bold tracking-wider">
              Status: {formatStatus(s.status)}
            </span>
            <span
              className={[
                "px-2.5 py-1 rounded-full text-xs font-sans uppercase font-bold tracking-wider border",
                s.mentorApproved ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-stone-900 border-amber-500/20 text-stone-400",
              ].join(" ")}
            >
              Mentor: {s.mentorApproved ? "Approved" : "Pending"}
            </span>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          {!locked ? (
            <>
              <button
                type="button"
                onClick={() => updateStatus(s.id, "approved")}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 font-sans text-xs uppercase font-bold tracking-wider hover:brightness-110 transition shadow-md cursor-pointer"
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => updateStatus(s.id, "rejected")}
                className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 font-sans text-xs uppercase font-bold tracking-wider hover:bg-rose-500/30 transition cursor-pointer"
              >
                Reject
              </button>
            </>
          ) : (
            <span className="px-3 py-1 rounded-xl bg-stone-900 border border-amber-500/20 text-stone-400 text-xs font-sans uppercase font-bold tracking-wider">
              Decision Recorded
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-amber-500/15">
        <label className="text-xs font-sans uppercase font-bold tracking-wider text-stone-400">Admin Notes (optional)</label>
        <textarea
          value={adminNotes[s.id] ?? ""}
          onChange={(e) => setAdminNotes((prev) => ({ ...prev, [s.id]: e.target.value }))}
          disabled={locked}
          rows={2}
          className="mt-1.5 w-full rounded-xl border border-amber-500/30 bg-stone-900/80 px-3 py-2 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400 font-sans disabled:opacity-50"
          placeholder="e.g., Needs more details on methodology"
        />
      </div>
      {files.length > 0 && (
        <div className="mt-3 pt-3 border-t border-amber-500/15 text-xs font-sans">
          <span className="font-bold text-stone-400 uppercase tracking-wider text-[10px]">Files: </span>
          <div className="flex flex-wrap gap-2 mt-1.5">
            {files.map((fp, i) => (
              <button
                key={i}
                type="button"
                onClick={() => downloadHackathonSubmissionFile(fp)}
                className="text-amber-300 hover:text-amber-200 underline font-mono text-xs cursor-pointer"
              >
                {fp.split("/").pop()}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const HackathonAdminSubmissions = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const hackathonId = searchParams.get("hackathonId") || "";

  const [submissions, setSubmissions] = useState([]);
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [mentorApprovalFilter, setMentorApprovalFilter] = useState("all");
  const [themeFilter, setThemeFilter] = useState("all");

  const [adminNotes, setAdminNotes] = useState({});

  const [problems, setProblems] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const query = hackathonId ? `?hackathonId=${hackathonId}` : "";
        const [res, hRes, pRes] = await Promise.all([
          axiosInstance.get(`/ich2026/admin/submissions${query}`),
          axiosInstance.get(`/ich2026/admin/hackathons`),
          axiosInstance.get(`/ich2026/problems${query}`),
        ]);
        setSubmissions(res.data.submissions || []);
        setHackathons(hRes.data.hackathons || []);
        setProblems(pRes.data.problems || []);
      } catch (e) {
        setError(e.response?.data?.message || "Failed to load submissions");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [hackathonId]);

  const currentHackathon = useMemo(() => {
    if (!hackathonId) return null;
    return hackathons.find((h) => String(h.id) === String(hackathonId)) || null;
  }, [hackathons, hackathonId]);

  const isCustomMode = currentHackathon?.problemStatementType === "custom";

  const currentHackathonName = useMemo(() => {
    if (!hackathonId) return "All Hackathons";
    return currentHackathon?.name || "All Hackathons";
  }, [currentHackathon, hackathonId]);

  const filterOptions = useMemo(() => {
    if (!hackathonId) return [];
    if (isCustomMode) {
      const set = new Set();
      submissions.forEach((s) => {
        const t = s.theme || s.team?.theme;
        if (t) set.add(t);
      });
      [
        "Disaster Resilience",
        "Waste Management",
        "Energy Solutions",
        "Smart Agriculture",
        "Pollution Control",
        "Smart Mobility & Parking",
        "Smart Healthcare",
      ].forEach((t) => set.add(t));
      return Array.from(set);
    } else {
      const set = new Set();
      problems.forEach((p) => { if (p.title) set.add(p.title); });
      submissions.forEach((s) => {
        const t = s.problem?.title || s.title || s.team?.topic;
        if (t) set.add(t);
      });
      return Array.from(set);
    }
  }, [hackathonId, isCustomMode, submissions, problems]);

  const teamsGrouped = useMemo(() => {
    const filteredSubmissions = submissions.filter((s) => {
      if (mentorApprovalFilter === "approved" && !s.mentorApproved) return false;
      if (mentorApprovalFilter === "not_approved" && s.mentorApproved) return false;
      if (hackathonId && themeFilter !== "all") {
        if (isCustomMode) {
          const sTheme = s.theme || s.team?.theme || "";
          if (sTheme.toLowerCase() !== themeFilter.toLowerCase()) return false;
        } else {
          const sProb = s.problem?.title || s.title || s.team?.topic || "";
          if (sProb.toLowerCase() !== themeFilter.toLowerCase()) return false;
        }
      }
      return true;
    });
    const map = new Map();
    for (const s of filteredSubmissions) {
      const tid = s.team?.id ?? s.teamId;
      if (tid == null) continue;
      if (!map.has(tid)) map.set(tid, []);
      map.get(tid).push(s);
    }
    const groups = [];
    for (const [teamId, list] of map.entries()) {
      const teamName = list[0]?.team?.teamName || `Team #${teamId}`;
      const theme = list[0]?.team?.theme || list[0]?.theme || "—";
      const problemTitle = list[0]?.problem?.title || list[0]?.title || list[0]?.team?.topic || "—";
      const poc = list.filter((x) => x.submissionPhase === "poc");
      const proto = list.filter((x) => x.submissionPhase === "prototype");
      groups.push({ teamId, teamName, theme, problemTitle, poc, prototype: proto });
    }
    groups.sort((a, b) => a.teamName.localeCompare(b.teamName));
    return groups;
  }, [submissions, mentorApprovalFilter, themeFilter, hackathonId, isCustomMode]);

  const downloadExcel = async () => {
    setExportLoading(true);
    setError(null);
    try {
      const query = hackathonId ? `?hackathonId=${hackathonId}` : "";
      const res = await axiosInstance.get(`/ich2026/admin/submissions/export-xlsx${query}`, {
        responseType: "blob",
      });
      const dateStr = new Date().toISOString().slice(0, 10);
      const blobUrl = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = blobUrl;
      const cleanTitle = currentHackathonName.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
      a.download = `submissions_${cleanTitle}_${dateStr}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      let msg = "Failed to download Excel export";
      if (e.response?.data instanceof Blob) {
        try {
          const text = await e.response.data.text();
          const j = JSON.parse(text);
          if (j?.message) msg = j.message;
        } catch {
          // ignore
        }
      } else if (typeof e.response?.data?.message === "string") {
        msg = e.response.data.message;
      }
      setError(msg);
    } finally {
      setExportLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const notes = adminNotes[id] || "";
      const res = await axiosInstance.post(`/ich2026/admin/submissions/${id}/status`, {
        status,
        adminNotes: notes,
      });
      setSubmissions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...res.data.submission } : s))
      );
    } catch (e) {
      setError(e.response?.data?.message || "Failed to update status");
    }
  };

  if (loading) return <div className="text-stone-400 font-sans text-xs uppercase tracking-widest">Loading submissions...</div>;

  return (
    <div className="space-y-6 font-sans text-stone-100">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl text-stone-100 uppercase tracking-widest font-normal">Submissions Review</h2>
          <div className="text-xs font-sans font-bold uppercase tracking-widest text-amber-300 mt-1">
            Event: {currentHackathonName}
          </div>
          <p className="text-xs font-dancing text-amber-200/90 mt-1">
            Review PoC and Prototype submissions per team track
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void downloadExcel()}
            disabled={exportLoading}
            className="shrink-0 rounded-xl border border-amber-500/30 bg-stone-900/80 px-4 py-2.5 text-xs font-sans uppercase font-bold tracking-wider text-amber-300 shadow-lg hover:bg-amber-400/10 transition disabled:opacity-60 cursor-pointer"
          >
            {exportLoading ? "Preparing…" : "Download Excel"}
          </button>
          <button
            type="button"
            onClick={() => handleDownloadSubmissionsPDF(submissions, currentHackathonName)}
            className="shrink-0 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 px-4 py-2.5 text-xs font-sans uppercase font-bold tracking-wider text-stone-950 shadow-lg hover:brightness-110 transition cursor-pointer"
          >
            Download PDF
          </button>
        </div>
      </div>

      {/* Filter controls (Shown ONLY when a specific hackathon is selected) */}
      {hackathonId ? (
        <div className="serene-glass-card rounded-2xl border border-amber-500/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div>
              <label className="block text-[10px] font-sans uppercase font-bold tracking-widest text-amber-300 mb-1">
                Mentor Approval
              </label>
              <select
                value={mentorApprovalFilter}
                onChange={(e) => setMentorApprovalFilter(e.target.value)}
                className="rounded-xl border border-amber-500/30 bg-stone-900/80 px-3.5 py-2 text-xs font-sans text-stone-100 focus:outline-none focus:border-amber-400 transition"
              >
                <option value="all">All Submissions</option>
                <option value="approved">Mentor Approved</option>
                <option value="not_approved">Mentor Not Approved</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-sans uppercase font-bold tracking-widest text-amber-300 mb-1">
                {isCustomMode ? "Filter by Selected Theme" : "Filter by Problem Statement"}
              </label>
              <select
                value={themeFilter}
                onChange={(e) => setThemeFilter(e.target.value)}
                className="rounded-xl border border-amber-500/30 bg-stone-900/80 px-3.5 py-2 text-xs font-sans text-stone-100 focus:outline-none focus:border-amber-400 transition max-w-xs truncate"
              >
                <option value="all">{isCustomMode ? "All Themes" : "All Problem Statements"}</option>
                {filterOptions.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-xs text-stone-400">
            Showing <span className="font-bold text-amber-300">{teamsGrouped.length}</span> submission groups
          </div>
        </div>
      ) : null}

      {error ? <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200">{error}</div> : null}

      <div className="space-y-6">
        {teamsGrouped.map(({ teamId, teamName, theme, problemTitle, poc, prototype }) => (
          <div key={teamId} className="serene-glass-card rounded-3xl border border-amber-500/25 shadow-2xl overflow-hidden">
            <div className="bg-stone-900/90 border-b border-amber-500/20 px-6 py-4 flex items-center justify-between flex-wrap gap-2">
              <div>
                <div className="font-serif text-lg text-stone-100 uppercase tracking-wider font-normal">{teamName}</div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    {isCustomMode ? "Theme:" : "Problem Statement:"}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold font-sans">
                    {isCustomMode ? theme : problemTitle}
                  </span>
                </div>
              </div>
              <div className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">Team ID: #{teamId}</div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-serif text-base uppercase tracking-wider text-amber-300 border-b border-amber-500/15 pb-2 mb-4 font-normal">
                  PoC (Proof of Concept)
                </h3>
                {poc.length === 0 ? (
                  <p className="text-xs text-stone-400 font-sans">No PoC submission recorded for this team yet.</p>
                ) : (
                  <div className="space-y-4">
                    {poc.map((s) => (
                      <SubmissionCard
                        key={s.id}
                        s={s}
                        adminNotes={adminNotes}
                        setAdminNotes={setAdminNotes}
                        updateStatus={updateStatus}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-serif text-base uppercase tracking-wider text-amber-300 border-b border-amber-500/15 pb-2 mb-4 font-normal">
                  Prototype
                </h3>
                {prototype.length === 0 ? (
                  <p className="text-xs text-stone-400 font-sans">No prototype submission recorded for this team yet.</p>
                ) : (
                  <div className="space-y-4">
                    {prototype.map((s) => (
                      <SubmissionCard
                        key={s.id}
                        s={s}
                        adminNotes={adminNotes}
                        setAdminNotes={setAdminNotes}
                        updateStatus={updateStatus}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {teamsGrouped.length === 0 ? (
          <div className="text-stone-400 text-xs font-sans">No submissions found.</div>
        ) : null}
      </div>
    </div>
  );
};

export default HackathonAdminSubmissions;
