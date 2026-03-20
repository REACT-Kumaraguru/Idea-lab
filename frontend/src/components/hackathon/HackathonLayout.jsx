import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Crown,
  LayoutDashboard,
  LogOut,
  Menu,
  Shield,
  UploadCloud,
  Users,
} from "lucide-react";
import { useHackathonAuthStore } from "../../store/useHackathonAuthStore";

const baseNavItem =
  "w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-semibold transition";

const HackathonLayout = ({ children }) => {
  const { hackathonUser, logout } = useHackathonAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const role = hackathonUser?.role;

  const tab = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("tab");
  }, [location.search]);

  const activeTabKey = useMemo(() => {
    if (location.pathname !== "/hackathon/dashboard") return null;
    if (!tab) return "dashboard";
    if (["team", "problems", "submit", "status"].includes(tab)) return tab;
    return "dashboard";
  }, [location.pathname, tab]);

  const studentNav = useMemo(
    () => [
      { to: "/hackathon/dashboard", label: "Dashboard", tabKey: "dashboard", icon: LayoutDashboard },
      { to: "/hackathon/dashboard?tab=team", label: "Team", tabKey: "team", icon: Users },
      { to: "/hackathon/dashboard?tab=problems", label: "Problems", tabKey: "problems", icon: ClipboardList },
      { to: "/hackathon/dashboard?tab=submit", label: "Submit", tabKey: "submit", icon: UploadCloud },
      { to: "/hackathon/dashboard?tab=status", label: "Status", tabKey: "status", icon: Activity },
    ],
    []
  );

  // Mentors also use the same portal sections (some pages redirect internally).
  const mentorNav = useMemo(
    () => [
      { to: "/hackathon/dashboard", label: "Dashboard", tabKey: "dashboard", icon: LayoutDashboard },
      { to: "/hackathon/dashboard?tab=team", label: "Team", tabKey: "team", icon: Users },
      { to: "/hackathon/dashboard?tab=status", label: "Problems", tabKey: "problems", icon: ClipboardList },
      { to: "/hackathon/dashboard?tab=status", label: "Submit", tabKey: "submit", icon: UploadCloud },
      { to: "/hackathon/dashboard?tab=status", label: "Status", tabKey: "status", icon: Activity },
    ],
    []
  );

  const adminNav = useMemo(
    () => [
      { to: "/hackathon/admin", label: "Admin Home", icon: Shield },
      { to: "/hackathon/admin/teams", label: "Teams", icon: Users },
      { to: "/hackathon/admin/problems", label: "Problems", icon: ClipboardList },
      { to: "/hackathon/admin/submissions", label: "Submissions", icon: Activity },
      { to: "/hackathon/admin/mentors", label: "Mentors", icon: Users },
      { to: "/hackathon/admin/winners", label: "Winners", icon: Crown },
    ],
    []
  );

  const nav = role === "admin" ? adminNav : role === "mentor" ? mentorNav : studentNav;
  const navActiveLabel =
    role === "admin"
      ? nav.find((n) => n.to === location.pathname)?.label || "Dashboard"
      : nav.find((n) => n.tabKey === activeTabKey)?.label || "Dashboard";

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/hackathon/login");
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB]">
      {/* Sidebar (desktop fixed) */}
      <aside
        className={`hidden md:block fixed top-4 bottom-4 left-4 z-40 transition-all duration-300 ${
          collapsed ? "w-[88px]" : "w-[250px]"
        }`}
      >
        <div className="h-full overflow-y-auto bg-[#0B1220] rounded-3xl border border-white/10 shadow-sm p-3">
          <div className="flex items-center justify-between mb-5 px-1 pt-2">
            {!collapsed ? (
              <div>
                <div className="text-xs font-semibold text-white/60 tracking-wide">AICTE IDEA Lab</div>
                <div className="mt-1 text-lg font-extrabold text-white">Hackathon 2026</div>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-xl bg-white/10" />
            )}
            <button
              onClick={() => setCollapsed((v) => !v)}
              className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white flex items-center justify-center transition"
              aria-label="Toggle sidebar"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {!collapsed ? (
            <div className="mb-5 px-1 text-sm text-white/80">
              <div>
                Signed in as{" "}
                <span className="font-semibold text-white">{hackathonUser?.fullName}</span>
              </div>
              <div className="mt-1 text-xs text-white/55">{hackathonUser?.role}</div>
            </div>
          ) : null}

          <nav className="flex flex-col gap-2">
            {nav.map((item) => {
              const isActive =
                role === "admin"
                  ? item.to === location.pathname
                  : item.tabKey === activeTabKey;
              const ItemIcon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`${baseNavItem} ${collapsed ? "justify-center px-2" : ""} ${
                    isActive
                      ? "bg-[#2563EB] text-white"
                      : "bg-white/0 text-white/80 hover:bg-white/5"
                  }`}
                  title={item.label}
                >
                  <ItemIcon className="w-4 h-4 shrink-0" />
                  {!collapsed ? item.label : null}
                </Link>
              );
            })}
          </nav>

          <button
            onClick={handleLogout}
            className={`mt-5 w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-sm font-semibold transition border border-white/10 ${
              collapsed ? "px-2" : ""
            }`}
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            {!collapsed ? "Logout" : null}
          </button>
        </div>
      </aside>

      <div className={`px-4 py-5 transition-all duration-300 ${collapsed ? "md:ml-[104px]" : "md:ml-[266px]"}`}>
        <div className="max-w-7xl mx-auto">
          {/* Main */}
          <main className="flex-1">
            {/* Top header */}
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <button
                  className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm"
                  onClick={() => setMobileOpen(true)}
                  aria-label="Open menu"
                >
                  <Menu className="w-5 h-5 text-gray-800" />
                </button>
                <div>
                  <div className="text-lg sm:text-xl font-semibold tracking-wide text-gray-800">Hackathon Portal</div>
                  <div className="text-xs text-gray-600">You are viewing: {navActiveLabel}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
                <div className="text-sm text-gray-700 hidden sm:block">
                  <span className="font-semibold text-gray-900">{hackathonUser?.fullName}</span>
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20">
                  {hackathonUser?.role}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white text-gray-700 text-sm font-semibold hover:bg-[#F5F7FB] transition"
                >
                  Logout
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E2E8F0] shadow-sm p-3 sm:p-6">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-[280px] bg-[#0B1220] border-r border-white/10 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="text-xs font-semibold text-white/60">AICTE IDEA Lab</div>
                <div className="mt-1 text-xl font-extrabold text-white">Hackathon 2026</div>
              </div>
              <button
                className="w-11 h-11 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <span className="text-white font-bold text-lg leading-none">x</span>
              </button>
            </div>

            <div className="mb-5 text-sm text-white/80">
              <div>
                Signed in as{" "}
                <span className="font-semibold text-white">{hackathonUser?.fullName}</span>
              </div>
              <div className="mt-1 text-xs text-white/55">{hackathonUser?.role}</div>
            </div>

            <nav className="flex flex-col gap-2">
              {nav.map((item) => {
                const isActive =
                  role === "admin"
                    ? item.to === location.pathname
                    : item.tabKey === activeTabKey;
                const ItemIcon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={`${baseNavItem} ${
                      isActive
                        ? "bg-[#2563EB] text-white"
                        : "bg-white/0 text-white/80 hover:bg-white/5"
                    }`}
                  >
                    <ItemIcon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <button
              onClick={handleLogout}
              className="mt-5 w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-sm font-semibold transition border border-white/10"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </aside>
        </div>
      ) : null}
    </div>
  );
};

export default HackathonLayout;

