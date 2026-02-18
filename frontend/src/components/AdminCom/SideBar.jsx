import React from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Layers,
  LogOut,
  ClipboardClock,
  PackageSearch,
  UserPlus,
  FileText,
  QrCode
} from 'lucide-react';
import Logo from "../../assets/idea-lab.png";
import { useAuthStore } from "../../store/useAuthStore";

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();

  const menuItems = [
    { id: 'home', icon: Home, label: 'Home', path: '/admin' },
    { id: 'equipment', icon: PackageSearch, label: 'Equipment', path: '/admin/equipment' },
    { id: 'approval', icon: ClipboardClock, label: 'Approval', path: '/admin/approval' },
    { id: 'problemStatements', icon: FileText, label: 'Problem Statements', path: '/admin/problem-statements' },
    { id: 'qrScanner', icon: QrCode, label: 'QR Scanner', path: '/admin/qr-scanner' },
    { id: 'adminUser', icon: UserPlus, label: 'Admin Access', path: '/admin/users' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="fixed top-0 left-0 flex flex-col h-screen w-16 bg-white border-r border-gray-200 py-4 items-center justify-between z-50">

      {/* Top Section */}
      <div className="flex flex-col items-center space-y-2 w-full">
        {/* Logo Container */}
        <div className="flex flex-col items-center w-full mb-2">
          <img src={Logo} alt="Idea Lab" className="h-10 mb-3 object-contain" />
          <div className="w-10 border-b border-gray-200"></div>
        </div>

        {/* Main Menu Items */}
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 relative group ${isActive
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-gray-500 hover:bg-teal-50 hover:text-teal-600'
                }`}
            >
              <Icon className="w-5 h-5" />

              {/* Tooltip - appears on hover */}
              <span className="absolute left-14 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity duration-200 shadow-lg z-50">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom Section - Logout */}
      <div className="flex flex-col items-center space-y-2 w-full">
        <button
          onClick={handleLogout}
          className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors relative group"
        >
          <LogOut className="w-5 h-5" />
          <span className="absolute left-14 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity duration-200 shadow-lg z-50">
            Logout
          </span>
        </button>
      </div>
    </div>
  );
};