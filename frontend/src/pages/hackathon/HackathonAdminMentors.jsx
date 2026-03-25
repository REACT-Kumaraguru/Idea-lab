import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../lib/axios.js";

const HackathonAdminMentors = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [createMentor, setCreateMentor] = useState({
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "",
    expertise: "",
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const mRes = await axiosInstance.get("/ich2026/admin/mentors");
        setMentors(mRes.data.mentors || []);
      } catch (e) {
        setError(e.response?.data?.message || "Failed to load mentors");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const onCreateMentor = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await axiosInstance.post("/ich2026/admin/mentors", {
        ...createMentor,
        expertise: createMentor.expertise || null,
      });
      const res = await axiosInstance.get("/ich2026/admin/mentors");
      setMentors(res.data.mentors || []);
      setCreateMentor({ fullName: "", email: "", password: "", phoneNumber: "", expertise: "" });
    } catch (e2) {
      setError(e2.response?.data?.message || "Failed to create mentor");
    }
  };

  if (loading) return <div className="text-gray-600">Loading...</div>;

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900">Mentors</h2>
      {error ? <div className="mt-3 text-sm text-red-600 font-medium">{error}</div> : null}

      <div className="mt-5 grid lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-900">Create Mentor Account (Manual)</h3>
          <form onSubmit={onCreateMentor} className="mt-4 space-y-3">
            <input
              value={createMentor.fullName}
              onChange={(e) => setCreateMentor((p) => ({ ...p, fullName: e.target.value }))}
              placeholder="Full Name"
              required
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              value={createMentor.email}
              onChange={(e) => setCreateMentor((p) => ({ ...p, email: e.target.value }))}
              placeholder="Email"
              type="email"
              required
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              value={createMentor.phoneNumber}
              onChange={(e) => setCreateMentor((p) => ({ ...p, phoneNumber: e.target.value }))}
              placeholder="Phone Number"
              required
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              value={createMentor.password}
              onChange={(e) => setCreateMentor((p) => ({ ...p, password: e.target.value }))}
              placeholder="Password"
              type="password"
              required
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              value={createMentor.expertise}
              onChange={(e) => setCreateMentor((p) => ({ ...p, expertise: e.target.value }))}
              placeholder="Expertise (optional)"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="w-full px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">
              Create Mentor
            </button>
          </form>
        </div>
      </div>

      <div className="mt-5">
        <h3 className="font-bold text-gray-900 mb-3">Existing Mentors</h3>
        <div className="space-y-3">
          {mentors.map((m) => (
            <div key={m.userId} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="font-semibold text-gray-900">{m.user?.fullName}</div>
              <div className="text-sm text-gray-600">{m.user?.email}</div>
              {m.expertise ? <div className="text-sm text-gray-700 mt-2">Expertise: {m.expertise}</div> : null}
            </div>
          ))}
          {mentors.length === 0 ? <div className="text-gray-700">No mentors yet.</div> : null}
        </div>
      </div>
    </div>
  );
};

export default HackathonAdminMentors;

