import React from "react";
import { Link } from "react-router-dom";

const HackathonAdminHome = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Admin Panel</h2>
      <p className="text-gray-600 mt-1">Manage hackathon problems, teams, and submissions.</p>

      <div className="mt-6 grid md:grid-cols-2 gap-5">
        <Link to="/ich2026/admin/teams" className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition">
          <div className="font-bold text-gray-900">Teams</div>
          <div className="text-gray-600 mt-1">Monitor participant-created teams and membership.</div>
        </Link>
        <Link to="/ich2026/admin/problems" className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition">
          <div className="font-bold text-gray-900">Problems</div>
          <div className="text-gray-600 mt-1">Add, search, and remove industry problems.</div>
        </Link>
        <Link to="/ich2026/admin/mentors" className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition">
          <div className="font-bold text-gray-900">Mentors</div>
          <div className="text-gray-600 mt-1">Manually create mentor accounts.</div>
        </Link>
        <Link
          to="/ich2026/admin/submissions"
          className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition"
        >
          <div className="font-bold text-gray-900">Submissions</div>
          <div className="text-gray-600 mt-1">Review PoC / Prototype submissions.</div>
        </Link>
        <Link
          to="/ich2026/admin/payment-details"
          className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition"
        >
          <div className="font-bold text-gray-900">Payment Details</div>
          <div className="text-gray-600 mt-1">View payment records, verify submissions, and export Excel.</div>
        </Link>
        <Link
          to="/ich2026/admin/send-mail"
          className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition"
        >
          <div className="font-bold text-gray-900">Send Mail</div>
          <div className="text-gray-600 mt-1">Email team leaders (reminders, payment, approvals).</div>
        </Link>
        <Link
          to="/ich2026/admin/users"
          className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition"
        >
          <div className="font-bold text-gray-900">Admins</div>
          <div className="text-gray-600 mt-1">Create, update, and delete admin accounts.</div>
        </Link>
      </div>
    </div>
  );
};

export default HackathonAdminHome;
