import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../lib/axios.js";

const HackathonAdminMentors = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    expertise: "",
  });

  const [createMentor, setCreateMentor] = useState({
    fullName: "",
    email: "",
    expertise: "",
  });

  const loadMentors = async () => {
    const mRes = await axiosInstance.get("/ich2026/admin/mentors");
    setMentors(mRes.data.mentors || []);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        await loadMentors();
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
      await loadMentors();
      setCreateMentor({ fullName: "", email: "", expertise: "" });
    } catch (e2) {
      setError(e2.response?.data?.message || "Failed to create mentor");
    }
  };

  const startEdit = (m) => {
    setEditingId(m.id);
    setEditForm({
      fullName: m.user?.fullName || "",
      email: m.user?.email || "",
      expertise: m.expertise || "",
    });
    setError(null);
  };

  const onUpdateMentor = async (e) => {
    e.preventDefault();
    if (!editingId) return;
    setError(null);
    try {
      await axiosInstance.put(`/ich2026/admin/mentors/${editingId}`, {
        fullName: editForm.fullName,
        email: editForm.email,
        expertise: editForm.expertise || null,
      });
      setEditingId(null);
      await loadMentors();
    } catch (e2) {
      setError(e2.response?.data?.message || "Failed to update mentor");
    }
  };

  const onDeleteMentor = async (mentorId) => {
    if (!window.confirm("Delete this mentor? Problem assignments to this mentor will be cleared.")) return;
    setError(null);
    try {
      await axiosInstance.delete(`/ich2026/admin/mentors/${mentorId}`);
      if (editingId === mentorId) setEditingId(null);
      await loadMentors();
    } catch (e2) {
      setError(e2.response?.data?.message || "Failed to delete mentor");
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
            <div key={m.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              {editingId === m.id ? (
                <form onSubmit={onUpdateMentor} className="space-y-3">
                  <input
                    value={editForm.fullName}
                    onChange={(e) => setEditForm((p) => ({ ...p, fullName: e.target.value }))}
                    placeholder="Full Name"
                    required
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    value={editForm.email}
                    onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                    placeholder="Email"
                    type="email"
                    required
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    value={editForm.expertise}
                    onChange={(e) => setEditForm((p) => ({ ...p, expertise: e.target.value }))}
                    placeholder="Expertise (optional)"
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-gray-900">{m.user?.fullName}</div>
                      <div className="text-sm text-gray-600">{m.user?.email}</div>
                      {m.expertise ? <div className="text-sm text-gray-700 mt-2">Expertise: {m.expertise}</div> : null}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(m)}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteMentor(m.id)}
                        className="px-3 py-1.5 rounded-lg border border-red-200 text-sm font-semibold text-red-700 hover:bg-red-50 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
          {mentors.length === 0 ? <div className="text-gray-700">No mentors yet.</div> : null}
        </div>
      </div>
    </div>
  );
};

export default HackathonAdminMentors;

