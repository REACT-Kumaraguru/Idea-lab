import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { axiosInstance } from "../../lib/axios.js";
import { useHackathonAuthStore } from "../../store/useHackathonAuthStore";
import { HackathonProblemArticleCard } from "../../components/hackathon/HackathonProblemArticleCard.jsx";

const HackathonProblems = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { hackathonUser } = useHackathonAuthStore();

  // Mentors should not browse problems/guidelines; they only view assigned progress.
  if (hackathonUser?.role === "mentor") return <Navigate to="/ich2026/dashboard?tab=status" replace />;
  if (hackathonUser?.role === "student") return <Navigate to="/ich2026/dashboard?tab=problems" replace />;

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosInstance.get("/ich2026/problems");
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
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h2 className="font-article text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">Industry Problems</h2>
          <p className="font-sans text-stone-600 mt-2 text-base leading-relaxed max-w-2xl">
            Read each problem statement in full, then select a challenge and submit your PoC or prototype.
          </p>
        </div>
        <Link
          to="/ich2026/guidelines"
          className="inline-flex shrink-0 items-center justify-center px-4 py-2.5 rounded-xl bg-white border border-stone-200 text-stone-800 text-sm font-semibold hover:bg-stone-50 transition shadow-sm"
        >
          Guidelines
        </Link>
      </div>

      {loading ? (
        <div className="mt-10 font-sans text-stone-600">Loading problems...</div>
      ) : (
        <div className="mt-10 sm:mt-12 flex flex-col gap-10 sm:gap-12 lg:gap-14">
          {problems.map((p) => (
            <HackathonProblemArticleCard
              key={p.id}
              problem={p}
              footerMeta={
                <>
                  {p.teamRegistrationLimit != null && p.teamRegistrationLimit > 0 ? (
                    <span>
                      Teams registered:{" "}
                      <strong className="font-semibold text-stone-800">{p.registeredTeams ?? 0}</strong> /{" "}
                      {p.teamRegistrationLimit}
                    </span>
                  ) : (
                    <span>
                      Teams registered:{" "}
                      <strong className="font-semibold text-stone-800">{p.registeredTeams ?? 0}</strong>
                    </span>
                  )}
                </>
              }
              action={
                <Link
                  to={`/ich2026/submit?problemId=${p.id}`}
                  className="inline-flex w-full sm:w-auto min-w-[10rem] justify-center px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow-sm"
                >
                  Select &amp; Submit
                </Link>
              }
            />
          ))}
        </div>
      )}

      {problems.length === 0 && !loading && (
        <div className="mt-10 rounded-2xl border border-stone-200 bg-stone-50/80 p-8 sm:p-10 text-stone-700 font-sans leading-relaxed">
          No problems added yet. Please check back later.
        </div>
      )}
    </div>
  );
};

export default HackathonProblems;
