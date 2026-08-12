import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, X, ShoppingCart, LogOut, User, Mail, Phone, ArrowLeft } from "lucide-react";
import Logo from ".././assets/idea-lab.png";
import { useBookingStore } from "../store/useBookingStore";
import { useAuthStore } from "../store/useAuthStore";

const Navbar = ({
  searchQuery = "",
  setSearchQuery = () => {},
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const bookings = useBookingStore((state) => state.bookings);
  const cartCount = (Array.isArray(bookings) ? bookings : []).filter((b) => b.status === "draft").length;
  const { logout, authUser } = useAuthStore();

  const getLinkClass = (path) => {
    const isActive = location.pathname === path;
    return isActive
      ? "text-amber-300 font-serif text-sm uppercase tracking-wider border-b-2 border-amber-400 pb-1"
      : "text-stone-300 hover:text-amber-300 font-sans text-xs uppercase tracking-widest transition-colors";
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };
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

  const handleGoBack = () => {
    if (window.history.state && typeof window.history.state.idx === "number" && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <nav className="bg-stone-950/85 border-b border-amber-500/25 backdrop-blur-xl shadow-2xl px-6 py-4 sticky top-0 z-50 font-sans text-stone-100">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-6">
        
        {/* Back Button + College Logo + Title */}
        <div className="flex items-center gap-4 shrink-0">
          <button
            onClick={handleGoBack}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-amber-500/30 bg-stone-900/80 text-amber-300 hover:bg-amber-400/20 hover:border-amber-300 rounded-xl text-xs font-sans uppercase font-bold tracking-wider transition-all shadow-md cursor-pointer group"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4 text-amber-300 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-stone-900 border border-amber-500/30 flex items-center justify-center rounded-xl p-1 shadow-lg group-hover:scale-105 transition-transform">
              <img src={Logo} alt="IDEA Lab" className="w-full h-full object-contain" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-serif tracking-widest uppercase font-semibold text-stone-100 group-hover:text-amber-300 transition-colors">
                IDEA Lab Portal
              </div>
              <div className="text-[10px] font-dancing text-amber-200/90">
                Kumaraguru College of Technology
              </div>
            </div>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="relative flex-grow max-w-xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400/70 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-12 py-2.5 border border-amber-500/30 rounded-xl bg-stone-900/80 text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
            placeholder="Search equipment, specifications, or category..."
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-amber-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-6 shrink-0">
          <Link
            to="/products"
            className={getLinkClass("/products")}
          >
            Equipment
          </Link>

          <Link
            to="/reserved"
            className={getLinkClass("/reserved")}
          >
            My Reserve
          </Link>

          <Link
            to="/upload-problem"
            className={getLinkClass("/upload-problem")}
          >
            Upload Problem
          </Link>

          <Link
            to="/my-submissions"
            className={getLinkClass("/my-submissions")}
          >
            My Submissions
          </Link>

          {/* Cart Link */}
          <Link
            to="/cart"
            className={`flex items-center gap-2 border px-4 py-2 rounded-xl text-xs font-sans uppercase font-medium tracking-wider transition ${
              location.pathname === "/cart"
                ? "border-amber-400 bg-amber-400/20 text-amber-300 shadow-md shadow-amber-500/10"
                : "border-amber-500/30 bg-stone-900/60 text-amber-200 hover:bg-amber-400/10 hover:border-amber-300"
            }`}
          >
            <ShoppingCart className="w-4 h-4 text-amber-300" />
            <span>Cart: {cartCount}</span>
          </Link>

          {/* Profile Dropdown or Login Button */}
          {authUser ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-full border border-amber-500/40 bg-stone-900 text-amber-300 hover:bg-amber-400 hover:text-stone-950 transition-all duration-300 shadow-md cursor-pointer"
              >
                <User className="w-5 h-5" />
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 serene-glass-card rounded-2xl border border-amber-500/30 py-2 shadow-2xl z-50">
                  {/* User Info Section */}
                  <div className="px-4 py-3 border-b border-amber-500/15">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center">
                        <User className="w-5 h-5 text-amber-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-serif uppercase tracking-wider text-stone-100 truncate">
                          {authUser?.fullName || "User Account"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 font-sans text-xs">
                      <div className="flex items-center gap-2 text-stone-300">
                        <Mail className="w-3.5 h-3.5 text-amber-400/70" />
                        <span className="truncate">{authUser?.email || "N/A"}</span>
                      </div>
                      {authUser?.phoneNumber ? (
                        <div className="flex items-center gap-2 text-stone-300">
                          <Phone className="w-3.5 h-3.5 text-amber-400/70" />
                          <span>{authUser.phoneNumber}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Logout Button */}
                  <div className="px-2 py-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-sans uppercase font-semibold tracking-wider text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 border border-amber-400/50 bg-stone-900/80 text-amber-300 px-4 py-2 rounded-xl text-xs font-sans uppercase font-bold tracking-widest hover:bg-amber-400 hover:text-stone-950 transition duration-300 shadow-md cursor-pointer"
            >
              <User className="w-4 h-4" />
              <span>Login</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
