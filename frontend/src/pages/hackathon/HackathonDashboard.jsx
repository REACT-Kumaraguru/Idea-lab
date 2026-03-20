import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { axiosInstance } from "../../lib/axios.js";
import { useHackathonAuthStore } from "../../store/useHackathonAuthStore";

const HackathonDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { hackathonUser } = useHackathonAuthStore();

  const mapSubmissionStatus = (s) => {
    if (!s) return null;
    if (s === "submitted" || s === "under_review") return "pending";
    return s;
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosInstance.get("/hackathon/dashboard");
        setData(res.data);
      } catch (e) {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="text-gray-600">Loading...</div>;

  const team = data?.team;
  const selectedProblem = data?.selectedProblem;
  const submissionStatus = mapSubmissionStatus(data?.submissionStatus);

  return (
    <div>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600 mt-1">Track your team and submissions.</p>
        </div>
        {!team ? (
          <div className="flex gap-3">
            {hackathonUser?.role === "mentor" ? (
              <div className="text-gray-700">No assigned team yet.</div>
            ) : (
              <>
                <Link
                  to="/hackathon/create-team"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                >
                  Create Team
                </Link>
                <Link
                  to="/hackathon/join-team"
                  className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-800 font-semibold hover:bg-gray-50 transition"
                >
                  Join Team
                </Link>
              </>
            )}
          </div>
        ) : null}
      </div>

      <div className="mt-6 grid md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-900">Team</h3>
          {!team ? (
            <div className="mt-3 text-gray-700">You have not joined a team yet.</div>
          ) : (
            <div className="mt-3 space-y-2 text-sm text-gray-700">
              <div>
                <span className="font-semibold">Name:</span> {team.teamName}
              </div>
              <div>
                <span className="font-semibold">Status:</span> {team.status}
              </div>
              <div>
                <span className="font-semibold">Invite Code:</span>{" "}
                <span className="font-mono">{team.inviteCode}</span>
              </div>

              <div className="pt-2">
                <div className="font-semibold mb-2">Members ({team.members?.length || 0})</div>
                <div className="space-y-2">
                  {(team.members || []).map((m) => (
                    <div key={m.userId} className="p-3 rounded-xl border border-gray-100 bg-gray-50 flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-gray-900">{m.member?.fullName || "Member"}</div>
                        <div className="text-xs text-gray-600">{m.member?.email}</div>
                      </div>
                      {m.isLeader ? (
                        <div className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold whitespace-nowrap">
                          Leader
                        </div>
                      ) : (
                        <div className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold whitespace-nowrap">
                          Member
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <div className="font-semibold">Selected Problem</div>
                <div className="text-gray-700 mt-1">
                  {selectedProblem ? selectedProblem.title : "Not selected yet"}
                </div>
                {submissionStatus ? (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm font-semibold">Submission:</span>
                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                      {submissionStatus}
                    </span>
                  </div>
                ) : (
                  <div className="mt-2 text-sm text-gray-600">Submission: Not submitted yet</div>
                )}
              </div>
            </div>
          )}
          <div className="mt-4">
            <Link to="/hackathon/team" className="text-blue-700 font-semibold hover:underline">
              View team details
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-900">Mentor</h3>
          {data?.mentor ? (
            <div className="mt-3 text-sm text-gray-700">
              <div className="font-semibold">{data.mentor.fullName}</div>
              <div className="text-gray-600">{data.mentor.email}</div>
            </div>
          ) : (
            <div className="mt-3 text-gray-700">Mentor assignment will appear here once assigned.</div>
          )}
        </div>
      </div>

      <div className="mt-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-900">Submissions</h3>
        {data?.submissions?.length ? (
          <div className="mt-4 space-y-3">
            {data.submissions.map((s) => (
              <div key={s.id} className="p-4 rounded-xl border border-gray-100">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="font-semibold text-gray-900">
                      {s.problem?.title || "Problem"} ({s.submissionPhase})
                    </div>
                    <div className="text-gray-600 text-sm">{s.title}</div>
                  </div>
                  <div className="text-sm font-semibold">
                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                      {mapSubmissionStatus(s.status) || s.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-3 text-gray-700">No submissions yet. Select a problem and submit your PoC / Prototype.</div>
        )}

        <div className="mt-4 flex gap-3 flex-wrap">
          {hackathonUser?.role === "student" ? (
            <>
              <Link
                to="/hackathon/problems"
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
              >
                Select Problem
              </Link>
              <Link
                to="/hackathon/submit"
                className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-800 font-semibold hover:bg-gray-50 transition"
              >
                Submit
              </Link>
            </>
          ) : null}

          <Link
            to="/hackathon/status"
            className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-800 font-semibold hover:bg-gray-50 transition"
          >
            View Status
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HackathonDashboard;

