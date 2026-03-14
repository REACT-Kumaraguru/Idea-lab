import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import { Trash2, MapPin, Users, Calendar, Clock } from "lucide-react";
import { useBookingStore } from "../store/useBookingStore";
import { axiosInstance } from "../lib/axios";
import { getImageUrl } from "../lib/config.js";

const Cart = ({ cart = [], setCart = () => {} }) => {
  const { bookings, fetchMyBookings, isFetchingBookings, submitCart, isSubmittingCart } = useBookingStore();

  const [cancellingId, setCancellingId] = useState(null);

  // Fetch user's bookings from backend when Cart mounts
  useEffect(() => {
    fetchMyBookings();
  }, [fetchMyBookings]);


  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (time) => {
    if (!time) return "";
    const str = String(time);
    if (str.length >= 5) return str.slice(0, 5);
    return str;
  };

  const canCancel = (status) => {
    return status === "draft" || status === "pending" || status === "approved";
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Remove this scheduled equipment from your cart?")) return;
    try {
      setCancellingId(bookingId);
      await axiosInstance.put(`/bookings/${bookingId}/cancel`);
      await fetchMyBookings();
    } catch (err) {
      console.error("Error cancelling booking:", err);
      alert(err.response?.data?.message || "Failed to remove from cart");
    } finally {
      setCancellingId(null);
    }
  };

  const displayBookings = (Array.isArray(bookings) ? bookings : []).filter((b) => b.status === "draft");
  const draftCount = displayBookings.length;
  const cartCount = draftCount;

  const handleProceedToRequest = async () => {
    if (draftCount === 0) {
      alert("No items in cart to submit. Add equipment from the listing and click \"Add to Cart\" in the schedule form.");
      return;
    }
    if (!window.confirm("Submit your cart to admin for approval? Your name and email are already linked to your account.")) return;
    await submitCart();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar cartCount={cartCount} />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Cart</h1>

        {isFetchingBookings ? (
          <div className="flex justify-center items-center py-16">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : displayBookings.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🛒</div>
            <h2 className="text-xl font-semibold text-gray-700">
              Your cart is empty
            </h2>
            <p className="text-gray-500 mt-2">
              Schedule equipment from the listing page to see your booked items here.
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white border rounded-lg shadow-sm">
              {displayBookings.map((booking) => {
                const eq = booking.equipment || {};
                const imageUrl = getImageUrl(eq.image);

                return (
                  <div
                    key={booking.id}
                    className="flex items-start gap-4 p-4 border-b last:border-none"
                  >
                    <img
                      src={imageUrl || "https://via.placeholder.com/80/e5e7eb/6b7280?text=Equipment"}
                      alt={eq.equipmentName}
                      className="w-20 h-20 object-cover rounded-md"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/80/e5e7eb/6b7280?text=Equipment";
                      }}
                    />

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-gray-800">
                        {eq.equipmentName}
                      </h3>
                      {eq.brandName && (
                        <p className="text-xs text-gray-500 mt-0.5">{eq.brandName}</p>
                      )}
                      {eq.equipmentDetails && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {eq.equipmentDetails}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          IDEA LAB
                        </div>
                        {eq.quantity != null && (
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-gray-400" />
                            Qty: {eq.quantity}
                          </div>
                        )}
                        {eq.pricePerHour != null && (
                          <span className="font-medium text-blue-600">
                            ₹{eq.pricePerHour}/hr
                          </span>
                        )}
                      </div>

                      {/* Scheduled slot */}
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                          Scheduled
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-700">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {formatDate(booking.bookingDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-gray-400" />
                            {formatTime(booking.bookingTime)} • {booking.duration}h
                          </span>
                          {booking.totalAmount != null && (
                            <span className="font-semibold text-gray-800">
                              ₹{booking.totalAmount}
                            </span>
                          )}
                        </div>
                        {booking.notes && (
                          <p className="text-xs text-gray-600 mt-2 italic">
                            Note: {booking.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {canCancel(booking.status) && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        disabled={cancellingId === booking.id}
                        className="text-red-500 hover:text-red-700 disabled:opacity-50 p-1"
                        title="Remove from cart"
                      >
                        {cancellingId === booking.id ? (
                          <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    )}
                  </div>
                );
              })}

              <div className="flex justify-between items-center p-4 bg-gray-50">
                <span className="font-semibold text-gray-700">
                  Total items: {displayBookings.length}
                </span>

                <button
                  onClick={handleProceedToRequest}
                  disabled={draftCount === 0 || isSubmittingCart}
                  className={`px-6 py-2 rounded-lg font-semibold ${
                    draftCount > 0 && !isSubmittingCart
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {isSubmittingCart ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin align-middle mr-2" />
                      Submitting...
                    </>
                  ) : (
                    "Proceed to Request"
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;
