import React, { useState } from "react";
import Navbar from "./Navbar";
import { Trash2, MapPin, Users, Calendar } from "lucide-react";

const Cart = ({ cart = [], setCart = () => {} }) => {
  // Single booking date for whole cart
  const [bookingDate, setBookingDate] = useState("");

  // Popup state
  const [showModal, setShowModal] = useState(false);
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
  });

  const today = new Date().toISOString().split("T")[0];

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  // Update quantity
  const updateQuantity = (id, qty) => {
    setCart(
      cart.map((item) =>
        item.id === id ? { ...item, selectedQty: qty } : item
      )
    );
  };

  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx6woAuphC9LX2eQPOKxEyLBVhUOS_BKYo4x-PRufBI0j4tm4DKFvzGFwPuxJFgxH0a/exec";

  const handleSubmit = async () => {
    if (!userDetails.name || !userDetails.email) {
      alert("Please fill in all details.");
      return;
    }

    const payload = {
      name: userDetails.name,
      email: userDetails.email,
      bookingDate,
      cart,
    };

    try {
      await fetch(SCRIPT_URL, {
  method: "POST",
  mode: "no-cors", // important for Apps Script
  body: JSON.stringify(payload),
  headers: {
    "Content-Type": "application/json",
  },
});


      alert("Request submitted successfully!");
      setShowModal(false);
      setCart([]);
      setBookingDate("");
    } catch (error) {
      console.error(error);
      alert("Error submitting request.");
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar cartCount={cart.length} />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Your Cart
        </h1>

        {cart.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🛒</div>
            <h2 className="text-xl font-semibold text-gray-700">
              Your cart is empty
            </h2>
            <p className="text-gray-500 mt-2">
              Add equipment from the listing page.
            </p>
          </div>
        ) : (
          <>
            {/* Single Booking Date */}
            <div className="bg-white border rounded-lg shadow-sm p-4 mb-4">
              <div className="flex items-center gap-4 text-sm">
                <Calendar className="w-4 h-4 text-gray-500" />
                <label className="text-gray-600 font-medium">
                  Booking Date:
                </label>
                <input
                  type="date"
                  min={today}
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Cart Items */}
            <div className="bg-white border rounded-lg shadow-sm">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-4 p-4 border-b last:border-none"
                >
                  {/* Image */}
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-20 h-20 object-cover rounded-md"
                  />

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-800">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {item.specs}
                    </p>

                    <div className="flex gap-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {item.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        Available: {item.qty}
                      </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className="mt-3 flex items-center gap-2">
                      <label className="text-sm text-gray-600">
                        Quantity:
                      </label>
                      <select
                        value={item.selectedQty || 1}
                        onChange={(e) =>
                          updateQuantity(item.id, Number(e.target.value))
                        }
                        className="border border-gray-300 rounded-md px-2 py-1"
                      >
                        {Array.from(
                          { length: item.qty },
                          (_, i) => i + 1
                        ).map((num) => (
                          <option key={num} value={num}>
                            {num}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}

              {/* Footer */}
              <div className="flex justify-between items-center p-4 bg-gray-50">
                <span className="font-semibold text-gray-700">
                  Total items: {cart.length}
                </span>

                <button
                  disabled={!bookingDate}
                  onClick={() => setShowModal(true)}
                  className={`px-6 py-2 rounded-lg font-semibold ${
                    bookingDate
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Proceed to Request
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Popup Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">
              Enter Your Details
            </h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                value={userDetails.name}
                onChange={(e) =>
                  setUserDetails({
                    ...userDetails,
                    name: e.target.value,
                  })
                }
                className="w-full border rounded-md px-3 py-2"
              />

              <input
                type="email"
                placeholder="Email Address"
                value={userDetails.email}
                onChange={(e) =>
                  setUserDetails({
                    ...userDetails,
                    email: e.target.value,
                  })
                }
                className="w-full border rounded-md px-3 py-2"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-md border"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
