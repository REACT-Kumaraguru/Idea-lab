import React, { useState, useEffect, useMemo } from "react";
import { Calendar, Clock, AlertCircle, CheckCircle, X } from "lucide-react";
import { useBookingStore } from "../../store/useBookingStore";

// Generate time slots (9 AM to 6 PM, 30-min steps)
const TIME_SLOTS = (() => {
  const slots = [];
  for (let hour = 9; hour <= 18; hour++) {
    slots.push(`${hour.toString().padStart(2, "0")}:00`);
    if (hour < 18) slots.push(`${hour.toString().padStart(2, "0")}:30`);
  }
  return slots;
})();

const timeToMinutes = (t) => {
  const s = String(t);
  const [h, m] = s.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

const EquipmentBooking = ({ equipment, isOpen, onClose, onBookingSuccess }) => {
  const [bookingData, setBookingData] = useState({
    bookingDate: "",
    startTime: "",
    endTime: "",
    notes: "",
  });
  const [error, setError] = useState("");

  const {
    equipmentBookings: existingBookings,
    isCreatingBooking: loading,
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
      startTime: "",
      endTime: "",
      notes: "",
    });
    setError("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "startTime" && prev.endTime && timeToMinutes(value) >= timeToMinutes(prev.endTime)) {
        next.endTime = "";
      }
      if (name === "endTime" && prev.startTime && timeToMinutes(value) <= timeToMinutes(prev.startTime)) {
        next.endTime = value;
      }
      return next;
    });
    setError("");
  };

  // Blocked ranges for selected date (approved bookings only – from API)
  const blockedRanges = useMemo(() => {
    if (!bookingData.bookingDate) return [];
    const list = (existingBookings || []).filter((b) => b.bookingDate === bookingData.bookingDate);
    return list.map((b) => {
      const startMin = timeToMinutes(b.bookingTime);
      const durationHours = parseFloat(b.duration) || 1;
      const endMin = startMin + Math.round(durationHours * 60);
      return [startMin, endMin];
    });
  }, [bookingData.bookingDate, existingBookings]);

  const isStartDisabled = (timeStr) => {
    const min = timeToMinutes(timeStr);
    return blockedRanges.some(([start, end]) => min >= start && min < end);
  };

  const isEndDisabled = (timeStr) => {
    const startMin = timeToMinutes(bookingData.startTime);
    const endMin = timeToMinutes(timeStr);
    if (endMin <= startMin) return true;
    return blockedRanges.some(([exStart, exEnd]) => startMin < exEnd && endMin > exStart);
  };

  const endTimeOptions = useMemo(() => {
    if (!bookingData.startTime) return TIME_SLOTS;
    const startMin = timeToMinutes(bookingData.startTime);
    return TIME_SLOTS.filter((t) => timeToMinutes(t) > startMin);
  }, [bookingData.startTime]);

  const durationInHours = useMemo(() => {
    if (!bookingData.startTime || !bookingData.endTime) return 0;
    const startMin = timeToMinutes(bookingData.startTime);
    const endMin = timeToMinutes(bookingData.endTime);
    if (endMin <= startMin) return 0;
    return (endMin - startMin) / 60;
  }, [bookingData.startTime, bookingData.endTime]);

  const pricePerHour = parseFloat(equipment?.pricePerHour ?? 0) || 0;
  const totalAmount = durationInHours * pricePerHour;

  const validateBooking = () => {
    if (!bookingData.bookingDate) {
      setError("Please select a booking date");
      return false;
    }
    if (!bookingData.startTime) {
      setError("Please select a start time");
      return false;
    }
    if (!bookingData.endTime) {
      setError("Please select an end time");
      return false;
    }
    if (durationInHours < 0.5) {
      setError("End time must be after start time (minimum 0.5 hours)");
      return false;
    }
    if (durationInHours > 12) {
      setError("Maximum booking duration is 12 hours");
      return false;
    }

    const selectedDate = new Date(bookingData.bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      setError("Cannot book for past dates");
      return false;
    }

    const isToday = selectedDate.toDateString() === today.toDateString();
    if (isToday) {
      const startMin = timeToMinutes(bookingData.startTime);
      const now = new Date();
      const currentMin = now.getHours() * 60 + now.getMinutes();
      if (startMin < currentMin) {
        setError("Cannot book a start time in the past");
        return false;
      }
    }

    const newStartMin = timeToMinutes(bookingData.startTime);
    const newEndMin = timeToMinutes(bookingData.endTime);
    const overlaps = blockedRanges.some(([exStart, exEnd]) => newStartMin < exEnd && newEndMin > exStart);
    if (overlaps) {
      setError("This time slot overlaps an existing booking");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateBooking()) return;
    setError("");

    const result = await createBooking({
      equipmentId: equipment.id,
      bookingDate: bookingData.bookingDate,
      bookingTime: bookingData.startTime,
      duration: Math.round(durationInHours * 100) / 100,
      notes: bookingData.notes,
    });

    if (result) {
      if (onBookingSuccess) onBookingSuccess(result);
      resetForm();
      onClose();
    }
  };

  const getMinDate = () => new Date().toISOString().split("T")[0];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Book Equipment</h2>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="flex gap-4">
            <img
              src={equipment?.image || "https://via.placeholder.com/150"}
              alt={equipment?.equipmentName}
              className="w-24 h-24 object-cover rounded-lg"
              onError={(e) => { e.target.src = "https://via.placeholder.com/150"; }}
            />
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800 mb-1">{equipment?.equipmentName}</h3>
              <p className="text-sm text-gray-600 mb-2">{equipment?.brandName}</p>
              <p className="text-sm text-gray-700 line-clamp-2">{equipment?.equipmentDetails}</p>
              <div className="mt-2 flex items-center gap-3">
                <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                  ₹{pricePerHour}/hr
                </span>
                <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                  {equipment?.quantity} Available
                </span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-4">
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

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Start Time *
              </label>
              <select
                name="startTime"
                value={bookingData.startTime}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select start time</option>
                {TIME_SLOTS.map((time) => (
                  <option key={time} value={time} disabled={isStartDisabled(time)}>
                    {time}{isStartDisabled(time) ? " (booked)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                End Time *
              </label>
              <select
                name="endTime"
                value={bookingData.endTime}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={!bookingData.startTime}
              >
                <option value="">Select end time</option>
                {endTimeOptions.map((time) => (
                  <option key={time} value={time} disabled={isEndDisabled(time)}>
                    {time}{isEndDisabled(time) ? " (overlaps)" : ""}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">End time must be after start time. Booked slots are not selectable.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Notes (Optional)</label>
              <textarea
                name="notes"
                value={bookingData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Any special requirements or notes..."
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Duration</span>
                <span className="text-lg font-bold text-gray-800">
                  {durationInHours > 0 ? `${durationInHours} hour(s)` : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Price per hour</span>
                <span className="text-lg font-bold text-gray-800">₹{pricePerHour.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-blue-300 pt-2">
                <span className="text-sm font-semibold text-gray-700">Total Amount</span>
                <span className="text-2xl font-bold text-blue-600">₹{totalAmount.toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">Total updates based on selected hours.</p>
            </div>
          </div>

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
