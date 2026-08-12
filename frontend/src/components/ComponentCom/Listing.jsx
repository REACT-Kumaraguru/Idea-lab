import React, { useState, useEffect } from "react";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import EquipmentBooking from "../bookingCom/EquipmentBooking";
import { Calendar, Users, MapPin, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { getImageUrl as getImageUrlFromConfig } from "../../lib/config.js";
import { axiosInstance } from "../../lib/axios.js";
import AmbientBackground from "../AmbientBackground";

const Listing = ({ cart, setCart }) => {

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

      const response = await axiosInstance.get("/equipment");

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

  const getImageUrl = getImageUrlFromConfig;

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

  // Handle Book Now
  const handleBookNow = (item) => {
    if (!item.isAvailable) {
      alert("This equipment is currently unavailable");
      return;
    }
    setSelectedEquipment(item);
    setIsBookingModalOpen(true);
  };

  // Handle successful booking — also add to cart with booking details
  const handleBookingSuccess = (booking) => {
    // Build cart item with equipment info + booking details
    const cartItem = {
      id: `booking-${booking.id}`, // unique cart ID per booking
      equipmentId: booking.equipment?.id || selectedEquipment?.id,
      bookingId: booking.id,
      equipmentName: booking.equipment?.equipmentName || selectedEquipment?.equipmentName,
      brandName: booking.equipment?.brandName || selectedEquipment?.brandName,
      image: booking.equipment?.image || selectedEquipment?.image,
      pricePerHour: booking.equipment?.pricePerHour ?? selectedEquipment?.pricePerHour,
      quantity: selectedEquipment?.quantity,
      bookingDate: booking.bookingDate,
      bookingTime: booking.bookingTime,
      duration: booking.duration,
      totalAmount: booking.totalAmount,
      notes: booking.notes,
      status: booking.status,
    };

    setCart((prev) => [...prev, cartItem]);
    toast.success("Equipment booked & added to cart!");

    // Refresh equipment list to update availability
    fetchEquipment();
  };

  return (
    <div className="min-h-screen bg-[#0a0809] text-stone-100 font-sans selection:bg-amber-400 selection:text-stone-950 relative overflow-x-hidden">
      <AmbientBackground height="fixed inset-0" />

      {/* Navbar */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cartCount={cart.length}
      />

      {/* Main Content */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-64 shrink-0 serene-glass-card p-6 rounded-2xl border border-amber-500/20 h-fit">
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
          </div>

          {/* Main Content Area */}
          <main className="flex-1">
            {/* Header */}
            <div className="mb-8">
              <div className="text-xs font-sans uppercase tracking-widest text-amber-200/80 mb-2">
                Home / Lab Equipment Catalog
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h1 className="text-3xl sm:text-4xl font-serif uppercase tracking-widest text-stone-100">
                    Lab Equipment
                  </h1>
                  <span className="text-xs font-sans uppercase font-bold tracking-wider text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1 rounded-full">
                    {filteredEquipment.length} Items Available
                  </span>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-rose-950/40 border border-rose-500/40 rounded-xl flex items-start gap-3 text-rose-200">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-sans uppercase tracking-wider font-semibold text-rose-300">Error</p>
                  <p className="text-sm font-sans text-stone-300">{error}</p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-xs font-sans uppercase tracking-widest text-amber-200/80">Loading Prototyping Hardware...</p>
              </div>
            )}

            {/* Equipment Grid */}
            {!loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEquipment.map((item) => (
                  <div
                    key={item.id}
                    className="serene-glass-card rounded-2xl overflow-hidden border border-amber-500/20 hover:border-amber-400/50 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 flex flex-col justify-between"
                  >
                    {/* Equipment Image */}
                    <div className="relative h-52 overflow-hidden bg-stone-950">
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.equipmentName}
                        className="w-full h-full object-cover filter brightness-95 contrast-105 hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/500x400/191618/d4af37?text=" +
                            encodeURIComponent(item.equipmentName);
                        }}
                      />
                      {!item.isAvailable && (
                        <div className="absolute top-3 left-3 bg-amber-600/90 backdrop-blur-md text-stone-950 px-3 py-1 rounded-full text-[10px] font-sans font-bold uppercase tracking-widest shadow-lg border border-amber-400/50">
                          In Use
                        </div>
                      )}
                      {item.isAvailable && (
                        <div className="absolute top-3 left-3 bg-emerald-500/90 backdrop-blur-md text-stone-950 px-3 py-1 rounded-full text-[10px] font-sans font-bold uppercase tracking-widest shadow-lg border border-emerald-300">
                          Available
                        </div>
                      )}
                    </div>

                    {/* Equipment Info */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-serif text-2xl text-stone-100 mb-1 uppercase tracking-wide">
                          {item.equipmentName}
                        </h3>
                        <p className="text-xs font-dancing text-amber-200/90 mb-2">
                          {item.brandName}
                        </p>
                        <p className="text-xs font-sans text-stone-400 mb-4 font-light leading-relaxed line-clamp-2">
                          {item.equipmentDetails}
                        </p>
                      </div>

                      <div>
                        {/* Details */}
                        <div className="space-y-2 mb-5 font-sans text-xs border-t border-amber-500/10 pt-3 text-stone-300">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2 text-stone-400">
                              <MapPin className="w-3.5 h-3.5 text-amber-400" />
                              <span>Sanctuary Location</span>
                            </span>
                            <span className="text-amber-200 font-semibold uppercase">IDEA LAB</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2 text-stone-400">
                              <Users className="w-3.5 h-3.5 text-amber-400" />
                              <span>Units Installed</span>
                            </span>
                            <span className="text-stone-200 font-mono">{item.quantity}</span>
                          </div>
                          {item.pricePerHour != null && (
                            <div className="flex items-center justify-between font-semibold pt-1">
                              <span className="text-stone-400 font-normal">Hourly Rate</span>
                              <span className="text-amber-300 font-mono text-sm font-bold">₹{item.pricePerHour}/hr</span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <button
                          onClick={() => handleBookNow(item)}
                          className={`w-full py-3 px-4 rounded-xl font-sans text-xs uppercase font-bold tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-lg ${
                            item.isAvailable
                              ? "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 hover:brightness-110 hover:shadow-amber-500/20 cursor-pointer"
                              : "bg-stone-900 text-stone-600 border border-stone-800 cursor-not-allowed"
                          }`}
                          disabled={!item.isAvailable}
                        >
                          <Calendar className="w-4 h-4" />
                          {item.isAvailable ? "Schedule Equipment" : "Unavailable"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No Results */}
            {!loading && filteredEquipment.length === 0 && (
              <div className="text-center py-16 serene-glass-card rounded-2xl border border-amber-500/20">
                <div className="text-5xl mb-4 opacity-70">🔍</div>
                <h3 className="font-serif text-2xl text-stone-200 mb-2 uppercase tracking-wide">
                  No Equipment Matches Your Filter
                </h3>
                <p className="text-stone-400 font-sans text-sm font-light">
                  Try clearing your search query or selecting alternate category filters
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