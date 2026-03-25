import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../lib/axios.js";

const emptyCreate = { fullName: "", email: "", phoneNumber: "", password: "" };
const emptyUpdate = { id: null, fullName: "", email: "", phoneNumber: "", password: "" };

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
      password: createForm.password,
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
    // Only send password if user entered something; backend treats `password != null` as update.
    if (updateForm.password.trim()) payload.password = updateForm.password;

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

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900">Admin Accounts</h2>
      <p className="text-sm text-gray-600 mt-1">
        Create, update, and delete hackathon admin accounts.
      </p>

      {error ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="mt-6 text-gray-600">Loading admins...</div>
      ) : (
        <>
          <div className="mt-5 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3">Full Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Created</th>
                    <th className="p-3 min-w-[180px]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((a) => (
                    <tr key={a.id} className="border-t border-gray-100">
                      <td className="p-3 font-semibold text-gray-900">{a.fullName}</td>
                      <td className="p-3 font-mono text-gray-700">{a.email}</td>
                      <td className="p-3 font-mono text-gray-700">{a.phoneNumber}</td>
                      <td className="p-3 text-gray-600">
                        {a.createdAt ? String(a.createdAt).slice(0, 10) : "—"}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() =>
                              setUpdateForm({
                                id: a.id,
                                fullName: a.fullName || "",
                                email: a.email || "",
                                phoneNumber: a.phoneNumber || "",
                                password: "",
                              })
                            }
                            className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-800 text-xs font-semibold hover:bg-gray-50 transition"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(a.id)}
                            className="px-3 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition disabled:opacity-60"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {admins.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-gray-600">
                        No admins found.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 grid lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900">Create Admin</h3>
              <form onSubmit={onCreateSubmit} className="mt-4 space-y-3">
                <input
                  value={createForm.fullName}
                  onChange={(e) => setCreateForm((p) => ({ ...p, fullName: e.target.value }))}
                  placeholder="Full Name"
                  required
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  value={createForm.email}
                  onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="Email"
                  type="email"
                  required
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  value={createForm.phoneNumber}
                  onChange={(e) => setCreateForm((p) => ({ ...p, phoneNumber: e.target.value }))}
                  placeholder="Phone Number"
                  required
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  value={createForm.password}
                  onChange={(e) => setCreateForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="Password (min 6 chars)"
                  type="password"
                  required
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="w-full px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                >
                  Create
                </button>
              </form>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900">Update Admin</h3>
              {updateForm.id ? (
                <p className="text-sm text-gray-600 mt-1">Editing admin id: {updateForm.id}</p>
              ) : (
                <p className="text-sm text-gray-600 mt-1">Click “Edit” on an admin to update.</p>
              )}

              <form onSubmit={onUpdateSubmit} className="mt-4 space-y-3">
                <input
                  value={updateForm.fullName}
                  onChange={(e) => setUpdateForm((p) => ({ ...p, fullName: e.target.value }))}
                  placeholder="Full Name (optional)"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  value={updateForm.email}
                  onChange={(e) => setUpdateForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="Email (optional)"
                  type="email"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  value={updateForm.phoneNumber}
                  onChange={(e) => setUpdateForm((p) => ({ ...p, phoneNumber: e.target.value }))}
                  placeholder="Phone Number (optional)"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  value={updateForm.password}
                  onChange={(e) => setUpdateForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="New Password (optional)"
                  type="password"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={!updateForm.id}
                    className="flex-1 px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-60"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setUpdateForm(emptyUpdate)}
                    className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-800 font-semibold hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HackathonAdminUsers;

