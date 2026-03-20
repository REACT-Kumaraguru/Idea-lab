import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";
import { useHackathonAuthStore } from "../../store/useHackathonAuthStore";

const HackathonRegister = () => {
  const navigate = useNavigate();
  const { register, isSigningUp } = useHackathonAuthStore();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await register({ fullName, email, phoneNumber, password });
      navigate("/hackathon/dashboard");
    } catch {
      // errors handled by store/toast
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-900">Hackathon Register</h2>
      <p className="text-gray-600 mt-2">Create your hackathon account.</p>

      <form onSubmit={onSubmit} className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-800">Full Name</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium text-gray-800">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium text-gray-800">Phone Number</label>
          <input
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
            className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium text-gray-800">Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-5 text-sm text-gray-600">
          Registration is for <span className="font-semibold text-gray-900">students</span> only.
          Admin/mentor accounts are managed by the hackathon team.
        </div>

        <button
          type="submit"
          disabled={isSigningUp}
          className="w-full px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
        >
          {isSigningUp ? (
            <span className="flex items-center justify-center gap-2">
              <Loader className="size-4 animate-spin" />
              Creating...
            </span>
          ) : (
            "Register"
          )}
        </button>

        <div className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/hackathon/login" className="text-blue-700 font-semibold hover:underline">
            Login
          </Link>
        </div>
      </form>
    </div>
  );
};

export default HackathonRegister;

