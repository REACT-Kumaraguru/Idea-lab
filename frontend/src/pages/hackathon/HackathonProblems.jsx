import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { axiosInstance } from "../../lib/axios.js";
import { useHackathonAuthStore } from "../../store/useHackathonAuthStore";

const HackathonProblems = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { hackathonUser } = useHackathonAuthStore();

  // Mentors should not browse problems/guidelines; they only view assigned progress.
  if (hackathonUser?.role === "mentor") return <Navigate to="/hackathon/dashboard?tab=status" replace />;
  if (hackathonUser?.role === "student") return <Navigate to="/hackathon/dashboard?tab=problems" replace />;

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosInstance.get("/hackathon/problems");
        setProblems(res.data.problems || []);
      } catch (e) {
        setProblems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Industry Problems</h2>
          <p className="text-gray-600 mt-1">Pick a problem and submit your PoC / Prototype.</p>
        </div>
        <Link
          to="/hackathon/guidelines"
          className="px-4 py-2 rounded-xl bg-white border border-gray-300 text-gray-800 font-semibold hover:bg-gray-50 transition"
        >
          Guidelines
        </Link>
      </div>

      {loading ? (
        <div className="mt-6 text-gray-600">Loading problems...</div>
      ) : (
        <div className="mt-6 grid md:grid-cols-2 gap-5">
          {problems.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="text-xs font-semibold text-blue-700">
                {p.sector || "Sector Unspecified"}
              </div>
              <div className="text-lg font-bold text-gray-900 mt-2">{p.title}</div>
              <div className="text-gray-700 mt-3 text-sm whitespace-pre-line">
                {p.description?.slice(0, 320)}
                {p.description?.length > 320 ? "..." : ""}
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="text-xs text-gray-500">
                  Prize: {p.prizeAmount ? `₹${p.prizeAmount}` : "TBD"}
                </div>
                <Link
                  to={`/hackathon/submit?problemId=${p.id}`}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                >
                  Select & Submit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {problems.length === 0 && !loading && (
        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-6 text-gray-700">
          No problems added yet. Please check back later.
        </div>
      )}
    </div>
  );
};

export default HackathonProblems;

