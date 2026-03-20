import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../lib/axios.js";

const HackathonAdminSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [adminNotes, setAdminNotes] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosInstance.get("/hackathon/admin/submissions");
        setSubmissions(res.data.submissions || []);
      } catch (e) {
        setError(e.response?.data?.message || "Failed to load submissions");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const notes = adminNotes[id] || "";
      const res = await axiosInstance.post(`/hackathon/admin/submissions/${id}/status`, {
        status,
        adminNotes: notes,
      });
      setSubmissions((prev) => prev.map((s) => (s.id === id ? res.data.submission : s)));
    } catch (e) {
      setError(e.response?.data?.message || "Failed to update status");
    }
  };

  if (loading) return <div className="text-gray-600">Loading...</div>;

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900">Submissions</h2>
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
                <div className="mt-2 text-xs">
                  <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                    {s.status}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <button
                  className="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
                  onClick={() => updateStatus(s.id, "approved")}
                >
                  Approve
                </button>
                <button
                  className="px-3 py-1 rounded-lg border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition"
                  onClick={() => updateStatus(s.id, "under_review")}
                >
                  Under Review
                </button>
                <button
                  className="px-3 py-1 rounded-lg border border-red-200 text-red-700 text-xs font-semibold hover:bg-red-50 transition"
                  onClick={() => updateStatus(s.id, "rejected")}
                >
                  Reject
                </button>
              </div>
            </div>

            <div className="mt-4">
              <label className="text-sm font-medium text-gray-800">Admin Notes (optional)</label>
              <textarea
                value={adminNotes[s.id] || ""}
                onChange={(e) => setAdminNotes((prev) => ({ ...prev, [s.id]: e.target.value }))}
                rows={3}
                className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Needs more details on methodology"
              />
            </div>
          </div>
        ))}

        {submissions.length === 0 ? (
          <div className="text-gray-700">No submissions found.</div>
        ) : null}
      </div>
    </div>
  );
};

export default HackathonAdminSubmissions;

