import React, { useState } from "react";
import { UserPlus, Loader2, CheckCircle } from "lucide-react";
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
      newErrors.confirmYes = 'Type Yes to confirm';
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
      } else {
        toast.error(res.data?.message || "Failed to create admin");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create admin");
    } finally {
      setSubmitting(false);
    }
  };

  const isConfirmValid = formData.confirmYes.trim().toUpperCase() === "YES";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Access</h1>
        <p className="text-gray-600 text-sm mt-0.5">
          Add a new admin. They can log in with the email and password you set.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm max-w-lg overflow-hidden">
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
            {errors.fullName && (
              <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
            )}
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
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
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
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmYes" className="block text-sm font-medium text-gray-700 mb-1">
              Type <strong className="font-mono text-teal-600">Yes</strong> to confirm <span className="text-red-500">*</span>
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
  );
}
