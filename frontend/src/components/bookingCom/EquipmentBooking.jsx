import React, { useState, useEffect } from "react";
import { Calendar, Clock, AlertCircle, CheckCircle, X, Info } from "lucide-react";
import { useBookingStore } from "../../store/useBookingStore";

const EquipmentBooking = ({ equipment, isOpen, onClose, onBookingSuccess }) => {
  const [bookingData, setBookingData] = useState({
    bookingDate: "",
    bookingTime: "",
    duration: 1,
    notes: "",
  });
  const [error, setError] = useState("");

  const {
    equipmentBookings: existingBookings,
    isCreatingBooking: loading,
    isFetchingEquipmentBookings: loadingBookings,
    fetchEquipmentBookings,
    createBooking,
  } = useBookingStore();

  useEffect(() => {
    if (isOpen && equipment) {
      fetchEquipmentBookings(equipment.id);
      resetForm();
    }
  }, [isOpen, equipment]);

  const resetForm = () => {
    setBookingData({
      bookingDate: "",
      bookingTime: "",
      duration: 1,
      notes: "",
    });
    setError("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const validateBooking = () => {
    if (!bookingData.bookingDate) {
      setError("Please select a booking date");
      return false;
    }

    if (!bookingData.bookingTime) {
      setError("Please select a booking time");
      return false;
    }

    if (bookingData.duration < 1 || bookingData.duration > 12) {
      setError("Working hours must be between 1 and 12 hours");
      return false;
    }

    const selectedDate = new Date(bookingData.bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setError("Cannot book for past dates");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateBooking()) {
      return;
    }

    setError("");

    const result = await createBooking({
      equipmentId: equipment.id,
      bookingDate: bookingData.bookingDate,
      bookingTime: bookingData.bookingTime,
      duration: parseInt(bookingData.duration),
      notes: bookingData.notes,
    });

    if (result) {
      if (onBookingSuccess) {
        onBookingSuccess(result);
      }
      resetForm();
      onClose();
    }
  };

  const calculateTotalAmount = () => {
    // Daily rate - same regardless of hours
    return parseFloat(equipment?.rentAmount || 0).toFixed(2);
  };

  // Generate time slots (9 AM to 6 PM)
  const timeSlots = [];
  for (let hour = 9; hour <= 18; hour++) {
    const time = `${hour.toString().padStart(2, "0")}:00`;
    timeSlots.push(time);
    if (hour < 18) {
      const halfHour = `${hour.toString().padStart(2, "0")}:30`;
      timeSlots.push(halfHour);
    }
  }

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Book Equipment</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Equipment Info */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="flex gap-4">
            <img
              src={equipment?.image || "https://via.placeholder.com/150"}
              alt={equipment?.equipmentName}
              className="w-24 h-24 object-cover rounded-lg"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/150";
              }}
            />
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800 mb-1">
                {equipment?.equipmentName}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {equipment?.brandName}
              </p>
              <p className="text-sm text-gray-700 line-clamp-2">
                {equipment?.equipmentDetails}
              </p>
              <div className="mt-2 flex items-center gap-3">
                <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                  ₹{equipment?.rentAmount}/day
                </span>
                <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                  {equipment?.quantity} Available
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Date Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Booking Date *
              </label>
              <input
                type="date"
                name="bookingDate"
                value={bookingData.bookingDate}
                onChange={handleInputChange}
                min={getMinDate()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Time Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Booking Time *
              </label>
              <select
                name="bookingTime"
                value={bookingData.bookingTime}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select time</option>
                {timeSlots.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Working Hours *
              </label>
              <input
                type="number"
                name="duration"
                value={bookingData.duration}
                onChange={handleInputChange}
                min="1"
                max="12"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                How many hours will you work on this date? (1-12 hours)
              </p>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={bookingData.notes}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Any special requirements or notes..."
              />
            </div>

            {/* Total Amount */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">
                  Daily Rental:
                </span>
                <span className="text-lg font-bold text-gray-800">
                  ₹{equipment?.rentAmount}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-blue-300 pt-2">
                <span className="text-sm font-semibold text-gray-700">
                  Total Amount:
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  ₹{calculateTotalAmount()}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Booking for 1 day • {bookingData.duration} working hour(s)
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Note: Rental is charged per day, regardless of hours used
              </p>
            </div>
          </div>

          {/* Existing Bookings Info */}
          {loadingBookings ? (
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600">Loading existing bookings...</p>
            </div>
          ) : existingBookings.length > 0 ? (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-yellow-700 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-yellow-800 mb-2">
                    Existing Bookings:
                  </p>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    {existingBookings.slice(0, 3).map((booking, index) => (
                      <li key={index}>
                        • {formatDate(booking.bookingDate)} at {booking.bookingTime} ({booking.duration}h) - {booking.status}
                      </li>
                    ))}
                    {existingBookings.length > 3 && (
                      <li className="text-yellow-600">
                        + {existingBookings.length - 3} more bookings
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          ) : null}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adding to Cart...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Add to Cart
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EquipmentBooking;