import React, { useState, useEffect } from "react";
import { UserPlus, Loader2, Key, X, Trash2 } from "lucide-react";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-hot-toast";
import AmbientBackground from "../AmbientBackground";

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
    try {
      setLoadingList(true);
      setListError("");
      const res = await axiosInstance.get("/admin/list");
      if (res.data?.success && Array.isArray(res.data.data)) {
        setAdmins(res.data.data);
      } else {
        setAdmins([]);
      }
    } catch (err) {
      setListError(err.response?.data?.message || "Failed to load admins");
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
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Min 6 characters required";
    if (formData.confirmYes.trim().toUpperCase() !== "YES") {
      newErrors.confirmYes = 'Please type "Yes" to confirm';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await axiosInstance.post("/admin/register", {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });
      if (res.data?.success) {
        toast.success("Admin created successfully!");
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

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!passwordForm.newPassword) errs.newPassword = "New password is required";
    else if (passwordForm.newPassword.length < 6) errs.newPassword = "Min 6 characters required";
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }
    setPasswordErrors(errs);
    if (Object.keys(errs).length > 0) return;

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
    <div className="min-h-screen bg-[#0a0809] text-stone-100 font-sans relative overflow-x-hidden p-6 md:p-8 space-y-6">
      <AmbientBackground height="fixed inset-0" />

      <div className="relative z-10 space-y-6">
        <div>
          <h1 className="font-serif text-3xl text-stone-100 uppercase tracking-widest font-normal">Admin Access Control</h1>
          <p className="text-xs font-sans text-amber-200/90 mt-1">
            Grant administrative privileges, manage credentials, and update system admin accounts
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,380px)_1fr] gap-6">
          <div className="serene-glass-card border border-amber-500/25 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[calc(100vh-12rem)]">
            <div className="px-5 py-4 border-b border-amber-500/20 shrink-0">
              <h2 className="font-serif text-lg text-amber-300 uppercase tracking-wider font-normal">Admin Registry</h2>
              <p className="text-xs text-stone-400 font-sans mt-0.5">Active administrators with portal privileges</p>
            </div>
            <div className="p-4 overflow-auto flex-1 min-h-0">
              {loadingList ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                </div>
              ) : listError ? (
                <p className="text-xs text-rose-300 py-4 font-sans">{listError}</p>
              ) : admins.length === 0 ? (
                <p className="text-xs text-stone-400 py-4 font-sans">No admins registered yet. Create one using the form.</p>
              ) : (
                <ul className="space-y-3 font-sans">
                  {admins.map((admin) => (
                    <li
                      key={admin.id}
                      className="border border-amber-500/20 rounded-2xl p-4 bg-stone-900/80 hover:bg-amber-400/5 transition space-y-2"
                    >
                      <div className="font-serif text-base text-stone-100 uppercase tracking-wider truncate">{admin.fullName}</div>
                      <div className="text-xs text-amber-300/80 font-mono truncate">{admin.email}</div>
                      <div className="text-[11px] text-stone-500 font-mono">Created: {formatDate(admin.createdAt)}</div>
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-amber-500/10 text-xs">
                        <button
                          type="button"
                          onClick={() => openPasswordModal(admin)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-400/10 border border-amber-400/30 text-amber-300 hover:bg-amber-400/20 rounded-xl font-bold uppercase tracking-wider text-[10px] transition cursor-pointer"
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
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-600 text-stone-950 font-extrabold uppercase tracking-wider text-[10px] rounded-xl hover:bg-rose-500 disabled:opacity-50 transition cursor-pointer"
                            >
                              {deletingId === admin.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                              Confirm Delete
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelDelete}
                              className="inline-flex items-center px-3 py-1.5 border border-amber-500/30 text-stone-300 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-stone-800 transition cursor-pointer"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(admin.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-rose-400 hover:bg-rose-500/10 border border-rose-500/30 rounded-xl text-[10px] font-bold uppercase tracking-wider transition cursor-pointer"
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

          <div className="serene-glass-card border border-amber-500/25 rounded-3xl overflow-hidden shadow-2xl p-6 md:p-8 space-y-6">
            <div className="border-b border-amber-500/20 pb-4">
              <h2 className="font-serif text-xl text-stone-100 uppercase tracking-wider font-normal">Add New Administrator</h2>
              <p className="text-xs text-stone-400 font-sans mt-1">
                Configure account parameters for new administrative users
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
              <div>
                <label htmlFor="fullName" className="block text-stone-300 font-bold uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Full name"
                  className={`w-full px-4 py-2.5 rounded-xl border bg-stone-900/90 text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400 transition ${
                    errors.fullName ? "border-rose-500" : "border-amber-500/30"
                  }`}
                />
                {errors.fullName && <p className="text-rose-400 text-xs mt-1 font-sans">{errors.fullName}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-stone-300 font-bold uppercase tracking-wider mb-1.5">
                  Email Address <span className="text-amber-400">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@example.com"
                  className={`w-full px-4 py-2.5 rounded-xl border bg-stone-900/90 text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400 transition ${
                    errors.email ? "border-rose-500" : "border-amber-500/30"
                  }`}
                />
                {errors.email && <p className="text-rose-400 text-xs mt-1 font-sans">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block text-stone-300 font-bold uppercase tracking-wider mb-1.5">
                  Initial Password <span className="text-amber-400">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  className={`w-full px-4 py-2.5 rounded-xl border bg-stone-900/90 text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400 transition ${
                    errors.password ? "border-rose-500" : "border-amber-500/30"
                  }`}
                />
                {errors.password && <p className="text-rose-400 text-xs mt-1 font-sans">{errors.password}</p>}
              </div>

              <div>
                <label htmlFor="confirmYes" className="block text-stone-300 font-bold uppercase tracking-wider mb-1.5">
                  Type <strong className="text-amber-300 font-mono">Yes</strong> to Confirm <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  id="confirmYes"
                  name="confirmYes"
                  value={formData.confirmYes}
                  onChange={handleChange}
                  placeholder="Type Yes here"
                  className={`w-full px-4 py-2.5 rounded-xl border bg-stone-900/90 text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400 transition ${
                    errors.confirmYes ? "border-rose-500" : "border-amber-500/30"
                  }`}
                />
                {errors.confirmYes && (
                  <p className="text-rose-400 text-xs mt-1 font-sans">{errors.confirmYes}</p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!isConfirmValid || submitting}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 rounded-xl text-xs uppercase font-extrabold tracking-wider hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg cursor-pointer border border-amber-300"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                  Create Admin Account
                </button>
              </div>
            </form>
          </div>
        </div>

        {passwordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md">
            <div className="serene-glass-card rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl border border-amber-500/30 text-stone-100 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-serif text-xl uppercase tracking-wider text-amber-300 font-normal">Change Password</h3>
                  <p className="text-xs text-stone-400 font-sans mt-1">
                    {passwordModal.fullName} ({passwordModal.email})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closePasswordModal}
                  className="text-stone-400 hover:text-amber-300 p-1 cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleChangePasswordSubmit} className="space-y-4 font-sans text-xs">
                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-stone-300 font-bold uppercase tracking-wider mb-1.5"
                  >
                    New Password <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
                    }
                    placeholder="Minimum 6 characters"
                    className={`w-full px-4 py-2.5 rounded-xl border bg-stone-900/90 text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400 transition ${
                      passwordErrors.newPassword ? "border-rose-500" : "border-amber-500/30"
                    }`}
                  />
                  {passwordErrors.newPassword && (
                    <p className="text-rose-400 text-xs mt-1 font-sans">{passwordErrors.newPassword}</p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-stone-300 font-bold uppercase tracking-wider mb-1.5"
                  >
                    Confirm New Password <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                    }
                    placeholder="Re-enter password"
                    className={`w-full px-4 py-2.5 rounded-xl border bg-stone-900/90 text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400 transition ${
                      passwordErrors.confirmPassword ? "border-rose-500" : "border-amber-500/30"
                    }`}
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="text-rose-400 text-xs mt-1 font-sans">{passwordErrors.confirmPassword}</p>
                  )}
                </div>
                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={closePasswordModal}
                    className="flex-1 px-4 py-2.5 border border-amber-500/30 text-stone-300 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-stone-800 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 rounded-xl text-xs font-extrabold uppercase tracking-wider transition disabled:opacity-50 border border-amber-300 cursor-pointer"
                  >
                    {changingPassword ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Key className="w-4 h-4" />
                        Update Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
