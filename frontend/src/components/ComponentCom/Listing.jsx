import React, { useState, useEffect } from "react";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import EquipmentBooking from "../bookingCom/EquipmentBooking";
import { Calendar, Users, MapPin, ShoppingCart, LogOut, AlertCircle } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import axios from "axios";

const Listing = ({ cart, setCart }) => {
  const { logout } = useAuthStore();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [categoryOpen, setCategoryOpen] = useState(true);
  const [typeOpen, setTypeOpen] = useState(true);
  const [labEquipment, setLabEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Fetch equipment from backend
  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get("http://localhost:5001/api/equipment");

      // Handle response - it returns array directly or data object
      const equipmentData = Array.isArray(response.data) 
        ? response.data 
        : response.data.data || [];
      
      setLabEquipment(equipmentData);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch equipment");
      console.error("Error fetching equipment:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) return imagePath;
    // Otherwise, construct the full URL
    return `http://localhost:5001/${imagePath}`;
  };

  // Filter equipment
  const filteredEquipment = labEquipment.filter((item) => {
    const matchesSearch =
      item.equipmentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brandName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.equipmentDetails?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(item.category);

    return matchesSearch && matchesCategory;
  });

  // Handle Add to Cart
  const handleAddToCart = (item) => {
    if (!cart.find((cartItem) => cartItem.id === item.id)) {
      setCart([...cart, item]);
      alert(`${item.equipmentName} added to cart!`);
    } else {
      alert(`${item.equipmentName} is already in the cart.`);
    }
  };

  // Handle Book Now
  const handleBookNow = (item) => {
    if (!item.isAvailable) {
      alert("This equipment is currently unavailable");
      return;
    }
    setSelectedEquipment(item);
    setIsBookingModalOpen(true);
  };

  // Handle successful booking
  const handleBookingSuccess = (booking) => {
    alert(
      `Booking successful! Your booking ID is ${booking.id}. Status: ${booking.status}`
    );
    // Refresh equipment list to update availability
    fetchEquipment();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cartCount={cart.length}
      />

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <Sidebar
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            selectedTypes={selectedTypes}
            setSelectedTypes={setSelectedTypes}
            categoryOpen={categoryOpen}
            setCategoryOpen={setCategoryOpen}
            typeOpen={typeOpen}
            setTypeOpen={setTypeOpen}
          />

          {/* Main Content Area */}
          <main className="flex-1">
            {/* Header */}
            <div className="mb-6">
              <div className="text-sm text-gray-600 mb-2">
                Home / Lab Equipment
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-gray-800">
                    Lab Equipment
                  </h1>
                  <span className="text-sm text-gray-600 bg-gray-200 px-3 py-1 rounded-full">
                    {filteredEquipment.length} Items
                  </span>
                </div>
                {/* Cart Status Indicator */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium">
                    <ShoppingCart className="w-5 h-5" />
                    <span>Cart: {cart.length} items</span>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-800">Error</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {/* Equipment Grid */}
            {!loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredEquipment.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
                  >
                    {/* Equipment Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.equipmentName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/500x400/e5e7eb/6b7280?text=" +
                            encodeURIComponent(item.equipmentName);
                        }}
                      />
                      {!item.isAvailable && (
                        <div className="absolute top-3 left-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          In Use
                        </div>
                      )}
                      {item.isAvailable && (
                        <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          Available
                        </div>
                      )}
                    </div>

                    {/* Equipment Info */}
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-1 text-gray-800">
                        {item.equipmentName}
                      </h3>
                      <p className="text-xs text-gray-500 mb-1">
                        {item.brandName}
                      </p>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {item.equipmentDetails}
                      </p>

                      {/* Details */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>IDEA LAB</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span>Quantity: {item.quantity}</span>
                        </div>
                        {item.rentAmount && (
                          <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
                            <span>₹{item.rentAmount}/day</span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleBookNow(item)}
                          className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${
                            item.isAvailable
                              ? "bg-blue-600 text-white hover:bg-blue-700"
                              : "bg-gray-200 text-gray-500 cursor-not-allowed"
                          }`}
                          disabled={!item.isAvailable}
                        >
                          <Calendar className="w-4 h-4" />
                          {item.isAvailable ? "Schedule Equipment" : "Unavailable"}
                        </button>
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-700"
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No Results */}
            {!loading && filteredEquipment.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No equipment found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your filters or search query
                </p>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Booking Modal */}
      <EquipmentBooking
        equipment={selectedEquipment}
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setSelectedEquipment(null);
        }}
        onBookingSuccess={handleBookingSuccess}
      />
    </div>
  );
};

export default Listing;