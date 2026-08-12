import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../lib/axios.js";

const HackathonAdminWinners = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [winnerAmount, setWinnerAmount] = useState({});
  const [seedMoneyAmount, setSeedMoneyAmount] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosInstance.get("/ich2026/admin/submissions");
        setSubmissions(res.data.submissions || []);
      } catch (e) {
        setError(e.response?.data?.message || "Failed to load submissions");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const selectWinner = async (s) => {
    setError(null);
    try {
      const res = await axiosInstance.post("/ich2026/admin/winners/select", {
        submissionId: s.id,
        winnerAmount: winnerAmount[s.id] ? Number(winnerAmount[s.id]) : null,
        seedMoneyAmount: seedMoneyAmount[s.id] ? Number(seedMoneyAmount[s.id]) : null,
      });
      setSubmissions((prev) => prev.map((x) => (x.id === s.id ? res.data.submission : x)));
    } catch (e) {
      setError(e.response?.data?.message || "Failed to select winner");
    }
  };

  if (loading) return <div className="text-stone-400 font-sans text-xs uppercase tracking-widest">Loading winners...</div>;

  const inputClass = "w-full rounded-xl border border-amber-500/30 px-3.5 py-2 text-xs text-stone-100 bg-stone-900/80 placeholder-stone-600 focus:outline-none focus:border-amber-400 font-sans";

  return (
    <div className="space-y-6 font-sans text-stone-100">
      <div>
        <h2 className="font-serif text-3xl text-stone-100 uppercase tracking-widest font-normal">Winners & Prize Grants</h2>
        <p className="text-xs font-dancing text-amber-200/90 mt-1">Select winners and award seed money support</p>
      </div>

      {error ? <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200">{error}</div> : null}

      <div className="space-y-4">
        {submissions.map((s) => (
          <div key={s.id} className="serene-glass-card rounded-2xl border border-amber-500/20 p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="font-serif text-lg text-stone-100 uppercase tracking-wider font-normal">{s.team?.teamName || "Team"}</div>
                <div className="text-xs text-amber-300 font-sans mt-0.5">{s.problem?.title || "Problem Track"}</div>
                <div className="text-xs text-stone-400 mt-1 font-sans">{s.title}</div>
                <div className="mt-2 text-xs font-bold uppercase tracking-wider text-stone-500">Phase: {s.submissionPhase}</div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <input
                  type="number"
                  placeholder="Winner Amount (₹)"
                  value={winnerAmount[s.id] ?? s.winnerAmount ?? ""}
                  onChange={(e) => setWinnerAmount((p) => ({ ...p, [s.id]: e.target.value }))}
                  className={inputClass}
                />
                <input
                  type="number"
                  placeholder="Seed Money (₹)"
                  value={seedMoneyAmount[s.id] ?? s.seedMoneyAmount ?? ""}
                  onChange={(e) => setSeedMoneyAmount((p) => ({ ...p, [s.id]: e.target.value }))}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => selectWinner(s)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 font-sans text-xs uppercase font-bold tracking-wider hover:brightness-110 transition shadow-md whitespace-nowrap cursor-pointer disabled:opacity-50"
                  disabled={s.status !== "approved" && s.status !== "winner"}
                >
                  {s.status === "winner" ? "Winner Selected" : "Select Winner"}
                </button>
              </div>
            </div>
          </div>
        ))}

        {submissions.length === 0 ? <div className="text-stone-400 font-sans text-xs">No submissions yet.</div> : null}
      </div>
    </div>
  );
};

export default HackathonAdminWinners;

