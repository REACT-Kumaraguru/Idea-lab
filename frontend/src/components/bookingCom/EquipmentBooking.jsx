import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  X,
  Package,
  Plus,
  Minus,
  Trash2,
  Search,
  Sparkles,
  Layers,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Tag
} from "lucide-react";
import { useBookingStore } from "../../store/useBookingStore";
import { useAuthStore } from "../../store/useAuthStore";
import { getImageUrl, getEquipmentFallbackSvg } from "../../lib/config.js";
import { LAB_CONSUMABLE_CATEGORIES, ALL_PRESET_CONSUMABLES } from "../../lib/consumablesData.js";

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
    purposeOfUsage: "",
    benefitsForKCT: "",
    benefitsReason: "",
    notes: "",
  });
  const [error, setError] = useState("");

  // Consumables requisition state
  const [needsConsumables, setNeedsConsumables] = useState(false);
  const [selectedConsumables, setSelectedConsumables] = useState([]);
  const [consumablesPurpose, setConsumablesPurpose] = useState("");
  const [consumableSearch, setConsumableSearch] = useState("");
  const [selectedCategoryTab, setSelectedCategoryTab] = useState("all");
  const [customItem, setCustomItem] = useState({ name: "", quantity: 1, unit: "Pcs" });
  const [showCustomForm, setShowCustomForm] = useState(false);

  const {
    equipmentBookings: existingBookings,
    isCreatingBooking: loading,
    fetchEquipmentBookings,
    createBooking,
  } = useBookingStore();

  const resetForm = () => {
    setBookingData({
      bookingDate: "",
      startTime: "",
      endTime: "",
      purposeOfUsage: "",
      benefitsForKCT: "",
      benefitsReason: "",
      notes: "",
    });
    setNeedsConsumables(false);
    setSelectedConsumables([]);
    setConsumablesPurpose("");
    setConsumableSearch("");
    setSelectedCategoryTab("all");
    setCustomItem({ name: "", quantity: 1, unit: "Pcs" });
    setShowCustomForm(false);
    setError("");
  };

  useEffect(() => {
    if (isOpen && equipment) {
      fetchEquipmentBookings(equipment.id);
      resetForm();
    }
  }, [isOpen, equipment]);

  // Smart preset category recommendation based on equipment type
  useEffect(() => {
    if (equipment?.equipmentName) {
      const name = equipment.equipmentName.toLowerCase();
      if (
        name.includes("3d") ||
        name.includes("print") ||
        name.includes("filament") ||
        name.includes("prusa") ||
        name.includes("bambu") ||
        name.includes("scanner")
      ) {
        setSelectedCategoryTab("3d-printing");
      } else if (
        name.includes("laser") ||
        name.includes("vinyl") ||
        name.includes("cutter") ||
        name.includes("plotter")
      ) {
        setSelectedCategoryTab("laser-cutting");
      } else if (
        name.includes("pcb") ||
        name.includes("solder") ||
        name.includes("circuit") ||
        name.includes("electronics") ||
        name.includes("smd")
      ) {
        setSelectedCategoryTab("pcb-soldering");
      } else if (
        name.includes("cnc") ||
        name.includes("lathe") ||
        name.includes("milling") ||
        name.includes("drill") ||
        name.includes("weld")
      ) {
        setSelectedCategoryTab("mechanical-welding");
      } else {
        setSelectedCategoryTab("all");
      }
    }
  }, [equipment]);

  const handleToggleConsumable = (item) => {
    setSelectedConsumables((prev) => {
      const exists = prev.find((c) => c.id === item.id);
      if (exists) {
        return prev.filter((c) => c.id !== item.id);
      } else {
        return [
          ...prev,
          {
            id: item.id,
            name: item.name,
            quantity: item.defaultQty || 1,
            unit: item.unit || "Pcs",
            categoryName: item.categoryName || "General",
          },
        ];
      }
    });
  };

  const handleUpdateConsumableQty = (id, delta) => {
    setSelectedConsumables((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const next = Math.max(1, (Number(c.quantity) || 1) + delta);
          return { ...c, quantity: next };
        }
        return c;
      })
    );
  };

  const handleSetConsumableQty = (id, val) => {
    const qty = Math.max(1, Number(val) || 1);
    setSelectedConsumables((prev) =>
      prev.map((c) => (c.id === id ? { ...c, quantity: qty } : c))
    );
  };

  const handleRemoveConsumable = (id) => {
    setSelectedConsumables((prev) => prev.filter((c) => c.id !== id));
  };

  const handleAddCustomConsumable = (e) => {
    if (e) e.preventDefault();
    if (!customItem.name.trim()) return;
    const newItem = {
      id: `custom-${Date.now()}`,
      name: customItem.name.trim(),
      quantity: Math.max(1, Number(customItem.quantity) || 1),
      unit: customItem.unit.trim() || "Pcs",
      categoryName: "Custom Requisition",
      custom: true,
    };
    setSelectedConsumables((prev) => [...prev, newItem]);
    setCustomItem({ name: "", quantity: 1, unit: "Pcs" });
    setShowCustomForm(false);
  };

  const filteredPresetConsumables = useMemo(() => {
    let list = ALL_PRESET_CONSUMABLES;
    if (selectedCategoryTab !== "all") {
      list = list.filter((c) => c.categoryId === selectedCategoryTab);
    }
    const q = consumableSearch.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.unit.toLowerCase().includes(q) ||
          (c.categoryName && c.categoryName.toLowerCase().includes(q))
      );
    }
    return list;
  }, [selectedCategoryTab, consumableSearch]);

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

  const maxQuantity = Math.max(1, parseInt(equipment?.quantity, 10) || 1);

  // Active bookings on the selected date (pending and approved)
  const dateBookings = useMemo(() => {
    if (!bookingData.bookingDate) return [];
    return (existingBookings || [])
      .filter((b) => b.bookingDate === bookingData.bookingDate && ["pending", "approved"].includes(b.status))
      .map((b) => {
        const startMin = timeToMinutes(b.bookingTime);
        const durationHours = parseFloat(b.duration) || 1;
        const endMin = startMin + Math.round(durationHours * 60);
        return { startMin, endMin };
      });
  }, [bookingData.bookingDate, existingBookings]);

  // Returns maximum concurrent active bookings during any minute in [startMin, endMin)
  const getConcurrentCount = (startMin, endMin) => {
    const points = new Set([startMin]);
    for (const b of dateBookings) {
      if (b.startMin >= startMin && b.startMin < endMin) {
        points.add(b.startMin);
      }
    }
    let maxConcurrent = 0;
    for (const t of points) {
      let count = 0;
      for (const b of dateBookings) {
        if (b.startMin <= t && b.endMin > t) {
          count++;
        }
      }
      if (count > maxConcurrent) maxConcurrent = count;
    }
    return maxConcurrent;
  };

  // Remaining units available at start time slot (for 30 min starting at timeStr)
  const getSlotAvailability = (timeStr) => {
    const min = timeToMinutes(timeStr);
    const concurrent = getConcurrentCount(min, min + 30);
    const remaining = Math.max(0, maxQuantity - concurrent);
    return {
      concurrent,
      remaining,
      isFullyBooked: remaining <= 0,
    };
  };

  const isStartDisabled = (timeStr) => {
    return getSlotAvailability(timeStr).isFullyBooked;
  };

  const isEndDisabled = (timeStr) => {
    const startMin = timeToMinutes(bookingData.startTime);
    const endMin = timeToMinutes(timeStr);
    if (endMin <= startMin) return true;
    const peakConcurrent = getConcurrentCount(startMin, endMin);
    return peakConcurrent >= maxQuantity;
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

  const authUser = useAuthStore((state) => state.authUser);
  const userEmail = String(authUser?.email || "").trim().toLowerCase();
  const isKct = userEmail.endsWith("@kct.ac.in") || userEmail.endsWith(".kct.ac.in");

  const effectivePricePerHour = isKct
    ? (parseFloat(equipment?.kctPricePerHour ?? 0) || 0)
    : (parseFloat(equipment?.pricePerHour ?? 0) || 0);

  const pricePerHour = effectivePricePerHour;
  const totalAmount = durationInHours * effectivePricePerHour;

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
    const peakConcurrent = getConcurrentCount(newStartMin, newEndMin);
    if (peakConcurrent >= maxQuantity) {
      setError(`All ${maxQuantity} unit(s) of this equipment are already reserved for this time window. Please choose another time slot.`);
      return false;
    }

    if (!bookingData.purposeOfUsage.trim()) {
      setError("Please enter the purpose of usage");
      return false;
    }
    if (!bookingData.benefitsForKCT) {
      setError("Please select whether this benefits KCT");
      return false;
    }
    if (!bookingData.benefitsReason.trim()) {
      setError("Please specify the reason for your Benefits for KCT selection");
      return false;
    }

    if (needsConsumables) {
      if (selectedConsumables.length === 0) {
        setError("You indicated that you need lab consumables. Please select at least one material item from the catalog, or untick the consumables option.");
        return false;
      }
      if (!consumablesPurpose || consumablesPurpose.trim().length < 5) {
        setError("Please enter the purpose of consumables usage (required for IDEA Lab accountability & material tracking).");
        return false;
      }
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
      purposeOfUsage: bookingData.purposeOfUsage,
      benefitsForKCT: bookingData.benefitsForKCT,
      benefitsReason: bookingData.benefitsReason,
      notes: bookingData.notes,
      consumablesRequested: needsConsumables && selectedConsumables.length > 0 ? selectedConsumables : null,
      consumablesPurpose: needsConsumables && selectedConsumables.length > 0 ? consumablesPurpose.trim() : null,
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
    <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 font-sans text-stone-100">
      <div className="serene-glass-card border border-amber-500/30 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-stone-950/90 border-b border-amber-500/20 p-6 flex items-center justify-between z-10 backdrop-blur-xl">
          <div>
            <h2 className="text-3xl font-serif tracking-wider uppercase text-stone-100 font-normal">Book Equipment</h2>
            <p className="text-xs font-dancing text-amber-200/90">Sanctuary Schedule Access</p>
          </div>
          <button type="button" onClick={onClose} className="w-9 h-9 rounded-full border border-amber-500/30 bg-stone-900 flex items-center justify-center text-stone-400 hover:text-amber-300 hover:border-amber-400 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 bg-stone-900/60 border-b border-amber-500/20">
          <div className="flex gap-4">
            <img
              src={getImageUrl(equipment?.image) || getEquipmentFallbackSvg(equipment?.equipmentName)}
              alt={equipment?.equipmentName}
              className="w-24 h-24 object-cover rounded-2xl border border-amber-500/30"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = getEquipmentFallbackSvg(equipment?.equipmentName);
              }}
            />
            <div className="flex-1">
              <h3 className="text-2xl font-serif text-stone-100 uppercase tracking-wide mb-1">{equipment?.equipmentName}</h3>
              <p className="text-xs font-dancing text-amber-200/90 mb-2">{equipment?.brandName}</p>
              <p className="text-xs font-sans text-stone-400 font-light line-clamp-2">{equipment?.equipmentDetails}</p>
              <div className="mt-3 flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-sans font-bold px-3 py-1 rounded-full">
                  <span>Prototyping Hardware</span>
                </span>
                <span className="inline-block bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-sans font-semibold uppercase tracking-wider px-3 py-1 rounded-full">
                  {equipment?.quantity} {equipment?.quantity === 1 ? "Unit Installed" : "Units Installed"}
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
                {TIME_SLOTS.map((time) => {
                  const { remaining, isFullyBooked } = getSlotAvailability(time);
                  let label = time;
                  if (bookingData.bookingDate) {
                    if (maxQuantity > 1) {
                      label = isFullyBooked
                        ? `${time} (Fully Booked)`
                        : `${time} (${remaining} of ${maxQuantity} available)`;
                    } else {
                      label = isFullyBooked ? `${time} (Booked)` : `${time} (Available)`;
                    }
                  }
                  return (
                    <option key={time} value={time} disabled={isStartDisabled(time)}>
                      {label}
                    </option>
                  );
                })}
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
                    {time}{isEndDisabled(time) ? " (capacity full)" : ""}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">End time must be after start time. Over-capacity slots are not selectable.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Purpose of Usage *</label>
              <textarea
                name="purposeOfUsage"
                value={bookingData.purposeOfUsage}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Describe the purpose for which you are using this equipment..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Benefits for KCT *</label>
              <div className="flex gap-6 mb-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="benefitsForKCT"
                    value="yes"
                    checked={bookingData.benefitsForKCT === "yes"}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="benefitsForKCT"
                    value="no"
                    checked={bookingData.benefitsForKCT === "no"}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">No</span>
                </label>
              </div>
              {bookingData.benefitsForKCT && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    {bookingData.benefitsForKCT === "yes"
                      ? "Specify why this benefits KCT *"
                      : "Specify why this does not benefit KCT *"}
                  </label>
                  <textarea
                    name="benefitsReason"
                    value={bookingData.benefitsReason}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder={
                      bookingData.benefitsForKCT === "yes"
                        ? "Explain how this usage benefits KCT..."
                        : "Explain why this usage does not benefit KCT..."
                    }
                    required
                  />
                </div>
              )}
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

            {/* Consumables & Raw Materials Requisition (For Accountability) */}
            <div className="border border-amber-500/30 rounded-2xl p-5 bg-gradient-to-b from-stone-900/90 to-stone-950/90 backdrop-blur-md shadow-lg text-stone-100 font-sans">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-100 uppercase tracking-wider flex items-center gap-2 flex-wrap">
                      Consumables & Raw Materials Requisition
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-mono normal-case">
                        Accountability Tracking
                      </span>
                    </h4>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Will you be using any lab raw materials (filaments, acrylic sheets, solder, etc.) during this session?
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={needsConsumables}
                    onChange={(e) => {
                      setNeedsConsumables(e.target.checked);
                      if (!e.target.checked) {
                        setError("");
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              {needsConsumables && (
                <div className="mt-5 space-y-4 pt-4 border-t border-amber-500/20 animate-fadeIn">
                  {/* Category Filter Tabs */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300/90">
                        1. Select Consumables by Category
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {filteredPresetConsumables.length} available items
                      </span>
                    </div>
                    <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
                      <button
                        type="button"
                        onClick={() => setSelectedCategoryTab("all")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                          selectedCategoryTab === "all"
                            ? "bg-amber-400 text-stone-950 font-bold shadow-md shadow-amber-400/20"
                            : "bg-stone-800/80 text-stone-300 hover:bg-stone-800 hover:text-stone-100 border border-stone-700/50"
                        }`}
                      >
                        All Materials
                      </button>
                      {LAB_CONSUMABLE_CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSelectedCategoryTab(cat.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                            selectedCategoryTab === cat.id
                              ? "bg-amber-400 text-stone-950 font-bold shadow-md shadow-amber-400/20"
                              : "bg-stone-800/80 text-stone-300 hover:bg-stone-800 hover:text-stone-100 border border-stone-700/50"
                          }`}
                        >
                          {cat.name.split("&")[0].trim()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      value={consumableSearch}
                      onChange={(e) => setConsumableSearch(e.target.value)}
                      placeholder="Search consumables (e.g. PLA, Acrylic, Solder, MDF)..."
                      className="w-full pl-9 pr-3 py-2 bg-stone-950/70 border border-amber-500/25 rounded-lg text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 font-sans"
                    />
                  </div>

                  {/* Consumable Items Grid (scrollable) */}
                  <div className="max-h-56 overflow-y-auto pr-1 space-y-1.5 scrollbar-thin">
                    {filteredPresetConsumables.map((item) => {
                      const isSelected = selectedConsumables.some((c) => c.id === item.id);
                      const currentSelected = selectedConsumables.find((c) => c.id === item.id);

                      return (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                            isSelected
                              ? "bg-amber-500/15 border-amber-400/50 shadow-sm"
                              : "bg-stone-900/60 border-stone-800 hover:border-amber-500/30"
                          }`}
                        >
                          <div className="min-w-0 flex-1 pr-3">
                            <p className="text-xs font-semibold text-stone-100 truncate">{item.name}</p>
                            <p className="text-[10px] text-amber-200/70 font-mono">
                              Unit: {item.unit} • Standard: {item.standardPack || "Direct"}
                            </p>
                          </div>

                          {isSelected ? (
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleUpdateConsumableQty(item.id, -1)}
                                className="w-6 h-6 rounded-md bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-300 hover:bg-stone-700 cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-9 text-center text-xs font-mono font-bold text-amber-300">
                                {currentSelected.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleUpdateConsumableQty(item.id, 1)}
                                className="w-6 h-6 rounded-md bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-300 hover:bg-stone-700 cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveConsumable(item.id)}
                                className="ml-1 text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                                title="Remove"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggleConsumable(item)}
                              className="px-3 py-1 bg-stone-800 hover:bg-amber-500 hover:text-stone-950 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-lg transition shrink-0 flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              Add
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Add Custom / Non-Catalog Material Option */}
                  <div className="pt-2">
                    {!showCustomForm ? (
                      <button
                        type="button"
                        onClick={() => setShowCustomForm(true)}
                        className="text-xs text-amber-300/90 hover:text-amber-300 font-semibold flex items-center gap-1.5 cursor-pointer underline underline-offset-4 decoration-amber-500/40"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Can't find a material? Request custom / non-catalog consumable
                      </button>
                    ) : (
                      <div className="p-3 bg-stone-900/90 border border-amber-500/30 rounded-xl space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-stone-200 uppercase tracking-wider">
                            Add Custom Consumable
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowCustomForm(false)}
                            className="text-stone-400 hover:text-stone-200 text-xs cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input
                            type="text"
                            placeholder="Material name (e.g. Copper Wire)"
                            value={customItem.name}
                            onChange={(e) => setCustomItem({ ...customItem, name: e.target.value })}
                            className="sm:col-span-1 px-3 py-1.5 bg-stone-950 border border-stone-700 rounded-lg text-xs text-stone-100"
                          />
                          <input
                            type="number"
                            min="1"
                            placeholder="Quantity"
                            value={customItem.quantity}
                            onChange={(e) => setCustomItem({ ...customItem, quantity: e.target.value })}
                            className="px-3 py-1.5 bg-stone-950 border border-stone-700 rounded-lg text-xs text-stone-100"
                          />
                          <input
                            type="text"
                            placeholder="Unit (e.g. Meters, Pcs)"
                            value={customItem.unit}
                            onChange={(e) => setCustomItem({ ...customItem, unit: e.target.value })}
                            className="px-3 py-1.5 bg-stone-950 border border-stone-700 rounded-lg text-xs text-stone-100"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleAddCustomConsumable}
                          disabled={!customItem.name.trim()}
                          className="w-full py-1.5 bg-amber-400 text-stone-950 font-bold text-xs rounded-lg hover:brightness-110 disabled:opacity-50 cursor-pointer"
                        >
                          Add Material to List
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Summary of Selected Consumables */}
                  {selectedConsumables.length > 0 && (
                    <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                          Requisition List ({selectedConsumables.length} items)
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedConsumables([])}
                          className="text-[10px] text-rose-400 hover:underline cursor-pointer"
                        >
                          Clear all
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedConsumables.map((c) => (
                          <span
                            key={c.id}
                            className="inline-flex items-center gap-1.5 bg-stone-900 border border-amber-500/40 text-stone-200 text-xs px-2.5 py-1 rounded-lg"
                          >
                            <span className="font-medium text-stone-100">{c.name}:</span>
                            <span className="font-mono text-amber-300 font-bold">
                              {c.quantity} {c.unit}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveConsumable(c.id)}
                              className="text-stone-400 hover:text-rose-400 ml-0.5 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mandatory Purpose Field for Accountability */}
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <div className="flex items-center gap-2 mb-1.5 text-amber-300">
                      <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
                      <label className="text-xs font-bold uppercase tracking-wider">
                        Purpose of Consumables Usage (Required for Accountability) *
                      </label>
                    </div>
                    <p className="text-[11px] text-stone-300 mb-2 font-light">
                      AICTE IDEA Lab tracks material consumption per user for audit, inventory, and replenishment purposes.
                      Please specify what component/project will be fabricated.
                    </p>
                    <textarea
                      value={consumablesPurpose}
                      onChange={(e) => {
                        setConsumablesPurpose(e.target.value);
                        setError("");
                      }}
                      rows={3}
                      className="w-full px-3.5 py-2.5 bg-stone-950 border border-amber-500/30 rounded-lg text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 resize-none font-sans"
                      placeholder="e.g., Fabricating the chassis base plate using 3mm acrylic and 80g white PLA filament for motor brackets for AICTE smart rover project..."
                      required={needsConsumables}
                    />
                    <div className="flex justify-between items-center mt-1.5 text-[10px] text-amber-400/80 font-mono">
                      <span>IDEA Lab Material Accountability Protocol</span>
                      <span>{consumablesPurpose.length} characters</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-stone-900/80 border border-amber-500/20 rounded-2xl p-4 text-xs font-sans">
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-300 mb-2.5">
                Reservation Summary
              </p>
              <div className="space-y-2 text-stone-200">
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">Scheduled Date:</span>
                  <span className="font-medium text-stone-100">
                    {bookingData.bookingDate
                      ? new Date(bookingData.bookingDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "Not selected"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">Time Window:</span>
                  <span className="font-medium text-amber-300 font-mono">
                    {bookingData.startTime && bookingData.endTime
                      ? `${bookingData.startTime} — ${bookingData.endTime}`
                      : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">Total Duration:</span>
                  <span className="font-bold text-stone-100">
                    {durationInHours > 0 ? `${durationInHours} hour(s)` : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-amber-500/15 pt-2">
                  <span className="text-stone-400">Equipment Capacity:</span>
                  <span className="text-emerald-400 font-medium">
                    {equipment?.quantity} {equipment?.quantity === 1 ? "Unit Installed" : "Units Installed"} • IDEA LAB
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-amber-500/30 rounded-xl font-sans text-xs uppercase font-bold tracking-wider text-stone-300 hover:bg-stone-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 rounded-xl font-sans text-xs uppercase font-bold tracking-widest hover:brightness-110 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                  Adding to Cart...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
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
