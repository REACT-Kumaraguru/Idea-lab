import React from "react";
import { Link, Navigate } from "react-router-dom";
import { useHackathonAuthStore } from "../../store/useHackathonAuthStore";

const HackathonGuidelines = () => {
  const { hackathonUser } = useHackathonAuthStore();
  // Students/Mentors: guidelines are shown as a modal inside the dashboard.
  if (hackathonUser?.role === "mentor") return <Navigate to="/hackathon/dashboard?tab=status" replace />;
  if (hackathonUser?.role === "student") return <Navigate to="/hackathon/dashboard?tab=team" replace />;

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900">Hackathon Guidelines</h2>
      <p className="text-gray-700 mt-2">
        A structured flow to transform ideas into real-world industrial solutions.
      </p>

      <div className="mt-6 grid md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-3">Flow</h3>
          <ol className="space-y-2 text-gray-700">
            <li>Industry Problems → Ideation</li>
            <li>PoC → Prototype</li>
            <li>Internship → Deployment</li>
          </ol>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-3">Participation</h3>
          <ul className="space-y-2 text-gray-700">
            <li>Max 4 members per team</li>
            <li>Seed money reimbursement for hardware prototype</li>
            <li>Prize up to ₹60,000</li>
            <li>Internship opportunity</li>
            <li>Patent eligibility</li>
          </ul>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-6">
        <div className="font-bold text-gray-900">Need help?</div>
        <div className="text-gray-700 mt-2">
          Start by selecting a problem, then create or join a team, and submit your PoC / prototype.
        </div>
        <div className="mt-4 flex gap-3 flex-wrap">
          <Link to="/hackathon/problems" className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">
            Problems
          </Link>
          <Link to="/hackathon/dashboard" className="px-4 py-2 rounded-xl border border-gray-300 bg-white font-semibold text-gray-800 hover:bg-gray-50 transition">
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HackathonGuidelines;

