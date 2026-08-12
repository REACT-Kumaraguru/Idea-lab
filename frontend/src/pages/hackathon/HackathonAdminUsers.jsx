import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../lib/axios.js";

const emptyCreate = { fullName: "", email: "", phoneNumber: "" };
const emptyUpdate = { id: null, fullName: "", email: "", phoneNumber: "" };

const HackathonAdminUsers = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [createForm, setCreateForm] = useState(emptyCreate);
  const [updateForm, setUpdateForm] = useState(emptyUpdate);

  const loadAdmins = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await axiosInstance.get("/ich2026/admin/users");
      setAdmins(res.data.admins || []);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load admins");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAdmins();
  }, []);

  const onCreateSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const payload = {
      fullName: createForm.fullName.trim(),
      email: createForm.email.trim(),
      phoneNumber: createForm.phoneNumber.trim(),
    };

    try {
      await axiosInstance.post("/ich2026/admin/users", payload);
      setCreateForm(emptyCreate);
      await loadAdmins();
    } catch (e2) {
      setError(e2.response?.data?.message || "Failed to create admin");
    }
  };

  const onUpdateSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!updateForm.id) {
      setError("Select an admin to update.");
      return;
    }

    const payload = {};
    if (updateForm.fullName.trim()) payload.fullName = updateForm.fullName.trim();
    if (updateForm.email.trim()) payload.email = updateForm.email.trim();
    if (updateForm.phoneNumber.trim()) payload.phoneNumber = updateForm.phoneNumber.trim();

    try {
      await axiosInstance.put(`/ich2026/admin/users/${updateForm.id}`, payload);
      setUpdateForm(emptyUpdate);
      await loadAdmins();
    } catch (e2) {
      setError(e2.response?.data?.message || "Failed to update admin");
    }
  };

  const onDelete = async (id) => {
    setError(null);
    if (!window.confirm("Delete this admin?")) return;
    try {
      await axiosInstance.delete(`/ich2026/admin/users/${id}`);
      if (updateForm.id === id) setUpdateForm(emptyUpdate);
      await loadAdmins();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to delete admin");
    }
  };

  const inputClass = "w-full rounded-xl border border-amber-500/30 px-3.5 py-2.5 text-xs text-stone-100 bg-stone-900/80 placeholder-stone-600 focus:outline-none focus:border-amber-400 font-sans";

  return (
    <div className="space-y-6 font-sans text-stone-100">
      <div>
        <h2 className="font-serif text-3xl text-stone-100 uppercase tracking-widest font-normal">Admin Users & Access</h2>
        <p className="text-xs font-dancing text-amber-200/90 mt-1">Manage administrative permissions and credentials</p>
      </div>

      {error ? (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="text-stone-400 text-xs uppercase tracking-widest">Loading admins...</div>
      ) : (
        <div className="space-y-8">
          <div className="serene-glass-card rounded-3xl border border-amber-500/25 p-6 shadow-2xl overflow-hidden">
            <h3 className="font-serif text-xl text-amber-300 uppercase tracking-wider mb-4 font-normal">Current System Admins ({admins.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-amber-500/20 text-stone-400 uppercase tracking-wider font-bold">
                    <th className="py-3 px-4">Full Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Created</th>
                    <th className="py-3 px-4 min-w-[180px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-500/10">
                  {admins.map((a) => (
                    <tr key={a.id} className="hover:bg-amber-400/5 transition">
                      <td className="py-3 px-4 font-serif text-sm text-stone-100 uppercase tracking-wide">{a.fullName}</td>
                      <td className="py-3 px-4 font-mono text-amber-300/90">{a.email}</td>
                      <td className="py-3 px-4 font-mono text-stone-400">{a.phoneNumber}</td>
                      <td className="py-3 px-4 text-stone-500">
                        {a.createdAt ? String(a.createdAt).slice(0, 10) : "—"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() =>
                              setUpdateForm({
                                id: a.id,
                                fullName: a.fullName || "",
                                email: a.email || "",
                                phoneNumber: a.phoneNumber || "",
                              })
                            }
                            className="px-3 py-1.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-sans uppercase font-bold transition"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => void onDeleteAdmin(a.id)}
                            className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-sans uppercase font-bold transition"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Create Admin Form */}
          <div className="serene-glass-card rounded-3xl border border-amber-500/25 p-6 shadow-2xl">
            <h3 className="font-serif text-xl text-stone-100 uppercase tracking-wider mb-4 font-normal">Add New Admin Account</h3>
            <form onSubmit={onCreateSubmit} className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={createForm.fullName}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, fullName: e.target.value }))}
                  required
                  className={inputClass}
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={createForm.email}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, email: e.target.value }))}
                  required
                  className={inputClass}
                />
                <input
                  type="text"
                  placeholder="Phone Number"
                  value={createForm.phoneNumber}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                  required
                  className={inputClass}
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 text-xs font-sans uppercase font-bold tracking-wider hover:brightness-110 transition shadow-lg cursor-pointer"
              >
                Create Admin User
              </button>
            </form>
          </div>

          {/* Update Modal */}
          {updateForm.id ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md">
              <div className="serene-glass-card rounded-3xl border border-amber-500/30 p-6 max-w-lg w-full shadow-2xl space-y-4">
                <h3 className="font-serif text-xl text-stone-100 uppercase tracking-wider font-normal">Update Admin #{updateForm.id}</h3>
                <form onSubmit={onUpdateSubmit} className="space-y-3">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={updateForm.fullName}
                    onChange={(e) => setUpdateForm((prev) => ({ ...prev, fullName: e.target.value }))}
                    required
                    className={inputClass}
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={updateForm.email}
                    onChange={(e) => setUpdateForm((prev) => ({ ...prev, email: e.target.value }))}
                    required
                    className={inputClass}
                  />
                  <input
                    type="text"
                    placeholder="Phone Number"
                    value={updateForm.phoneNumber}
                    onChange={(e) => setUpdateForm((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                    required
                    className={inputClass}
                  />
                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 text-xs font-sans uppercase font-bold tracking-wider hover:brightness-110 transition"
                    >
                      Save Updates
                    </button>
                    <button
                      type="button"
                      onClick={() => setUpdateForm(emptyUpdate)}
                      className="px-5 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-stone-300 text-xs font-sans uppercase font-bold tracking-wider hover:bg-stone-800 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default HackathonAdminUsers;
