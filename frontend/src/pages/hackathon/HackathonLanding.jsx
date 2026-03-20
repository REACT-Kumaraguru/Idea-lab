import React from "react";
import { Link } from "react-router-dom";

const HackathonLanding = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-blue-100">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <div className="text-sm font-semibold text-blue-700">AICTE IDEA Lab – KCT</div>
          <h1 className="mt-2 text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
            INDUSTRY CONNECT – HACKATHON 2026
          </h1>
          <p className="mt-3 text-gray-700 text-lg">
            Transform Ideas into Real-World Industrial Solutions
          </p>

          <div className="mt-6 grid md:grid-cols-2 gap-5">
            <div className="p-5 rounded-2xl bg-blue-50 border border-blue-100">
              <h2 className="font-bold text-gray-900 mb-2">About</h2>
              <p className="text-gray-700">
                An exclusive platform connecting students with industries
                to solve real-time challenges in Digital and Manufacturing sectors.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-gray-100">
              <h2 className="font-bold text-gray-900 mb-2">Guidelines</h2>
              <ul className="text-gray-700 space-y-2">
                <li>Max 4 members per team</li>
                <li>Seed money reimbursement for hardware prototype</li>
                <li>Prize up to ₹60,000</li>
                <li>Internship opportunity</li>
                <li>Patent eligibility</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 grid md:grid-cols-2 gap-5">
            <div className="p-5 rounded-2xl bg-white border border-gray-100">
              <div className="text-sm text-gray-500">Venue</div>
              <div className="font-bold text-gray-900 mt-1">Kumaraguru College of Technology</div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-gray-100">
              <div className="text-sm text-gray-500">Date</div>
              <div className="font-bold text-gray-900 mt-1">10th and 11th April 2026</div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              to="/hackathon/problems"
              className="text-center w-full sm:w-auto px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            >
              View Problems
            </Link>
            <Link
              to="/hackathon/login"
              className="text-center w-full sm:w-auto px-5 py-3 rounded-xl border border-gray-300 bg-white font-semibold text-gray-800 hover:bg-gray-50 transition"
            >
              Login
            </Link>
            <Link
              to="/hackathon/register"
              className="text-center w-full sm:w-auto px-5 py-3 rounded-xl border border-gray-300 bg-white font-semibold text-gray-800 hover:bg-gray-50 transition"
            >
              Register
            </Link>
          </div>

          <div className="mt-6 text-xs text-gray-500">
            Note: This hackathon module is isolated from the main Idea Lab system.
          </div>
        </div>
      </div>
    </div>
  );
};

export default HackathonLanding;

