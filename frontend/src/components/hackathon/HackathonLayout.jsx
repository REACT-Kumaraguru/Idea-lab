import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useHackathonAuthStore } from "../../store/useHackathonAuthStore";

const navClasses = (active) =>
  `px-3 py-2 rounded-lg text-sm font-medium transition ${
    active ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-blue-50"
  }`;

const HackathonLayout = ({ children }) => {
  const { hackathonUser, logout } = useHackathonAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const role = hackathonUser?.role;

  const studentNav = [
    { to: "/hackathon/dashboard", label: "Dashboard" },
    { to: "/hackathon/team", label: "Team" },
    { to: "/hackathon/problems", label: "Problems" },
    { to: "/hackathon/create-team", label: "Create Team" },
    { to: "/hackathon/join-team", label: "Join Team" },
    { to: "/hackathon/submit", label: "Submit" },
    { to: "/hackathon/status", label: "Status" },
    { to: "/hackathon/guidelines", label: "Guidelines" },
  ];

  const mentorNav = [
    { to: "/hackathon/dashboard", label: "Dashboard" },
    { to: "/hackathon/team", label: "Team" },
    { to: "/hackathon/status", label: "Status" },
  ];

  const adminNav = [
    { to: "/hackathon/admin", label: "Admin Home" },
    { to: "/hackathon/admin/teams", label: "Teams" },
    { to: "/hackathon/admin/problems", label: "Problems" },
    { to: "/hackathon/admin/submissions", label: "Submissions" },
    { to: "/hackathon/admin/mentors", label: "Mentors" },
    { to: "/hackathon/admin/winners", label: "Winners" },
  ];

  const nav = role === "admin" ? adminNav : role === "mentor" ? mentorNav : studentNav;

  const handleLogout = async () => {
    await logout();
    navigate("/hackathon/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-blue-100">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          <aside className="w-72 hidden md:block">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs font-semibold text-gray-500">AICTE IDEA Lab</div>
                  <div className="text-lg font-bold text-gray-900">Hackathon 2026</div>
                </div>
              </div>

              <div className="text-sm text-gray-700 mb-4">
                Signed in as <span className="font-semibold">{hackathonUser?.fullName}</span>
                <div className="text-xs text-gray-500">{hackathonUser?.role}</div>
              </div>

              <nav className="flex flex-col gap-2">
                {nav.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={navClasses(location.pathname === item.to)}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <button
                onClick={handleLogout}
                className="mt-5 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </aside>

          <main className="flex-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default HackathonLayout;

