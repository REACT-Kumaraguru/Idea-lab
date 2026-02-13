import React from "react";
import { Link } from "react-router-dom";
import { Search, X, MapPin, ShoppingCart } from "lucide-react";
import Logo from ".././assets/idea-lab.png"

const Navbar = ({
  searchQuery = "",
  setSearchQuery = () => {},
  cartCount = 0,
}) => {
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
            to="/"
            className="text-blue-700 font-semibold text-sm border-b-2 border-blue-700 pb-1"
          >
            Equipment
          </Link>

          <a
            href="#"
            className="text-gray-700 hover:text-blue-700 font-medium text-sm"
          >
            My Reserve
          </a>

          {/* Cart Link */}
          <Link
            to="/cart"
            className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Cart: {cartCount}</span>
          </Link>

          {/* Campus Indicator */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-gray-500 ml-4">
            <MapPin className="w-3.5 h-3.5 text-gray-500" />
            KCT Campus
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
