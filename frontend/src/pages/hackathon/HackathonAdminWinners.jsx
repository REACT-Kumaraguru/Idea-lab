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

  if (loading) return <div className="text-gray-600">Loading...</div>;

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900">Winners</h2>
      {error ? <div className="mt-3 text-sm text-red-600 font-medium">{error}</div> : null}

      <div className="mt-4 space-y-4">
        {submissions.map((s) => (
          <div key={s.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="font-semibold text-gray-900">
                  {s.team?.teamName || "Team"} – {s.problem?.title || "Problem"} ({s.submissionPhase})
                </div>
                <div className="text-sm text-gray-600">{s.title}</div>
                <div className="mt-2">
                  <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                    {s.status}
                  </span>
                </div>
              </div>
              <div className="text-right">
                {s.winnerAmount ? (
                  <div className="text-sm text-blue-700 font-semibold">
                    ₹{s.winnerAmount} prize
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-4 grid md:grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-800">Winner Prize (₹)</label>
                <input
                  value={winnerAmount[s.id] || ""}
                  onChange={(e) => setWinnerAmount((p) => ({ ...p, [s.id]: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 60000"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-800">Seed Money (₹)</label>
                <input
                  value={seedMoneyAmount[s.id] || ""}
                  onChange={(e) => setSeedMoneyAmount((p) => ({ ...p, [s.id]: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 20000"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => selectWinner(s)}
                  className="w-full px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-60"
                  disabled={s.status !== "approved" || !!s.winnerAmount}
                >
                  {s.status === "approved" && s.winnerAmount ? "Selected" : "Select Winner"}
                </button>
              </div>
            </div>
          </div>
        ))}

        {submissions.length === 0 ? <div className="text-gray-700">No submissions yet.</div> : null}
      </div>
    </div>
  );
};

export default HackathonAdminWinners;

