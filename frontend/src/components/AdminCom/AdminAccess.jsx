import React, { useState, useEffect } from "react";
import { UserPlus, Loader2, Key, X, Trash2 } from "lucide-react";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-hot-toast";

export default function AdminAccess() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmYes: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [admins, setAdmins] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState("");

  const [passwordModal, setPasswordModal] = useState(null);
  const [passwordForm, setPasswordForm] = useState({ newPassword: "", confirmPassword: "" });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [changingPassword, setChangingPassword] = useState(false);

  const [deletePendingId, setDeletePendingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchAdmins = async () => {
    setLoadingList(true);
    setListError("");
    try {
      const res = await axiosInstance.get("/admin/list");
      if (res.data?.success && Array.isArray(res.data.data)) {
        setAdmins(res.data.data);
      } else {
        setAdmins([]);
      }
    } catch (err) {
      setListError(err.response?.data?.message || "Failed to load admin list");
      setAdmins([]);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Enter a valid email";
    }
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (formData.confirmYes.trim().toUpperCase() !== "YES") {
      newErrors.confirmYes = "Type Yes to confirm";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await axiosInstance.post("/admin/create", {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });
      if (res.data?.success) {
        toast.success("Admin created successfully");
        setFormData({ fullName: "", email: "", password: "", confirmYes: "" });
        fetchAdmins();
      } else {
        toast.error(res.data?.message || "Failed to create admin");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create admin");
    } finally {
      setSubmitting(false);
    }
  };

  const openPasswordModal = (admin) => {
    setPasswordModal(admin);
    setPasswordForm({ newPassword: "", confirmPassword: "" });
    setPasswordErrors({});
  };

  const closePasswordModal = () => {
    setPasswordModal(null);
    setPasswordForm({ newPassword: "", confirmPassword: "" });
    setPasswordErrors({});
  };

  const validatePasswordForm = () => {
    const newErrors = {};
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordModal || !validatePasswordForm()) return;

    setChangingPassword(true);
    try {
      const res = await axiosInstance.put(`/admin/${passwordModal.id}/password`, {
        newPassword: passwordForm.newPassword,
      });
      if (res.data?.success) {
        toast.success("Password updated successfully");
        closePasswordModal();
      } else {
        toast.error(res.data?.message || "Failed to update password");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update password");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteClick = (adminId) => {
    if (deletePendingId === adminId) return;
    setDeletePendingId(adminId);
  };

  const handleCancelDelete = () => {
    setDeletePendingId(null);
  };

  const handleConfirmDelete = async (adminId) => {
    setDeletingId(adminId);
    try {
      const res = await axiosInstance.delete(`/admin/${adminId}`);
      if (res.data?.success) {
        toast.success("Admin removed");
        setDeletePendingId(null);
        fetchAdmins();
      } else {
        toast.error(res.data?.message || "Failed to delete admin");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete admin");
    } finally {
      setDeletingId(null);
    }
  };

  const isConfirmValid = formData.confirmYes.trim().toUpperCase() === "YES";

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Access</h1>
        <p className="text-gray-600 text-sm mt-0.5">
          Add new admins and manage existing ones. You can change any admin&apos;s password.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,380px)_1fr] gap-6">
        {/* Admin list – side */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col max-h-[calc(100vh-12rem)]">
          <div className="px-4 py-3 border-b border-gray-100 shrink-0">
            <h2 className="text-base font-semibold text-gray-900">Admin list</h2>
            <p className="text-xs text-gray-500 mt-0.5">All admins who can access this panel</p>
          </div>
          <div className="p-4 overflow-auto flex-1 min-h-0">
            {loadingList ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
              </div>
            ) : listError ? (
              <p className="text-sm text-red-600 py-4">{listError}</p>
            ) : admins.length === 0 ? (
              <p className="text-sm text-gray-500 py-4">No admins yet. Add one on the right.</p>
            ) : (
              <ul className="space-y-2">
                {admins.map((admin) => (
                  <li
                    key={admin.id}
                    className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="font-medium text-gray-900 truncate">{admin.fullName}</div>
                    <div className="text-xs text-gray-500 truncate mt-0.5">{admin.email}</div>
                    <div className="text-xs text-gray-400 mt-1">{formatDate(admin.createdAt)}</div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <button
                        type="button"
                        onClick={() => openPasswordModal(admin)}
                        className="inline-flex items-center gap-1 px-2 py-1.5 text-teal-600 hover:bg-teal-50 rounded-lg text-xs font-medium"
                      >
                        <Key className="w-3.5 h-3.5" />
                        Password
                      </button>
                      {deletePendingId === admin.id ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleConfirmDelete(admin.id)}
                            disabled={deletingId === admin.id}
                            className="inline-flex items-center gap-1 px-2 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 disabled:opacity-50"
                          >
                            {deletingId === admin.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                            Confirm delete
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelDelete}
                            className="inline-flex items-center px-2 py-1.5 border border-gray-300 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(admin.id)}
                          className="inline-flex items-center gap-1 px-2 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-medium"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Add admin form – main area */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Add new admin</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            They can log in with the email and password you set.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Full name"
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                errors.fullName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@example.com"
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min 6 characters"
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <div>
            <label htmlFor="confirmYes" className="block text-sm font-medium text-gray-700 mb-1">
              Type <strong className="font-mono text-teal-600">Yes</strong> to confirm{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="confirmYes"
              name="confirmYes"
              value={formData.confirmYes}
              onChange={handleChange}
              placeholder="Type Yes here"
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                errors.confirmYes ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.confirmYes && (
              <p className="text-red-500 text-xs mt-1">{errors.confirmYes}</p>
            )}
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="submit"
              disabled={!isConfirmValid || submitting}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              Add Admin
            </button>
          </div>
        </form>
      </div>
      </div>

      {/* Change password modal */}
      {passwordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Change password</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {passwordModal.fullName} ({passwordModal.email})
                </p>
              </div>
              <button
                type="button"
                onClick={closePasswordModal}
                className="text-gray-400 hover:text-gray-600 p-1"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  New password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
                  }
                  placeholder="Min 6 characters"
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                    passwordErrors.newPassword ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {passwordErrors.newPassword && (
                  <p className="text-red-500 text-xs mt-1">{passwordErrors.newPassword}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Confirm new password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                  }
                  placeholder="Re-enter password"
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                    passwordErrors.confirmPassword ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{passwordErrors.confirmPassword}</p>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={closePasswordModal}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50"
                >
                  {changingPassword ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                      Update password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
