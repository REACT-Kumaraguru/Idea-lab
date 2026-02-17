import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, X, ShoppingCart, LogOut, User, Mail, Phone } from "lucide-react";
import Logo from ".././assets/idea-lab.png";
import { useBookingStore } from "../store/useBookingStore";
import { useAuthStore } from "../store/useAuthStore";

const Navbar = ({
  searchQuery = "",
  setSearchQuery = () => {},
}) => {
  const bookings = useBookingStore((state) => state.bookings);
  const cartCount = (Array.isArray(bookings) ? bookings : []).filter((b) => b.status === "draft").length;
  const { logout, authUser } = useAuthStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-white border-b shadow-sm px-6 py-4 sticky top-0 z-50 font-sans">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-8">
        
        {/* College Logo + Title */}
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10  text-white flex items-center justify-center rounded-md font-bold">
            <img src={Logo} alt="" />
          </div>
          <div className="leading-tight">
            <div className="text-base font-semibold text-gray-900">
              IDEA Lab Portal
            </div>
            <div className="text-xs text-gray-500">
              Kumaraguru College of Technology
            </div>
          </div>
        </Link>

        {/* Search Bar */}
        <div className="relative flex-grow max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-md bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            placeholder="Search equipment, specifications, or category..."
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-6 shrink-0">
          <Link
            to="/products"
            className="text-blue-700 font-semibold text-sm border-b-2 border-blue-700 pb-1"
          >
            Equipment
          </Link>

          <Link
            to="/reserved"
            className="text-gray-700 hover:text-blue-700 font-medium text-sm"
          >
            My Reserve
          </Link>

          <Link
            to="/upload-problem"
            className="text-gray-700 hover:text-blue-700 font-medium text-sm"
          >
            Upload Problem
          </Link>

          <Link
            to="/my-submissions"
            className="text-gray-700 hover:text-blue-700 font-medium text-sm"
          >
            My Submissions
          </Link>

          {/* Cart Link */}
          <Link
            to="/cart"
            className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Cart: {cartCount}</span>
          </Link>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
            >
              <User className="w-5 h-5" />
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                {/* User Info Section */}
                <div className="px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {authUser?.fullName || "User"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{authUser?.email || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{authUser?.phoneNumber || "N/A"}</span>
                    </div>
                  </div>
                </div>

                {/* Logout Button */}
                <div className="px-2 py-2">
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
