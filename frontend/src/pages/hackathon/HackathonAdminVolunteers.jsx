import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../lib/axios.js";
import { Link } from "react-router-dom";
import { Users, Plus, Trash2, QrCode, Shield, Check, Mail, Lock, UserCheck } from "lucide-react";
import { toast } from "react-hot-toast";

export default function HackathonAdminVolunteers() {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchVolunteers = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/ich2026/admin/volunteers");
      setVolunteers(res.data?.volunteers || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load volunteers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const handleCreateVolunteer = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Email and password are required");
      return;
    }
    setCreating(true);
    try {
      await axiosInstance.post("/ich2026/admin/volunteers", {
        email: email.trim(),
        password,
        fullName: fullName.trim() || "Student Volunteer",
      });
      toast.success("Volunteer account created!");
      setEmail("");
      setPassword("");
      setFullName("");
      setShowAddModal(false);
      fetchVolunteers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create volunteer");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteVolunteer = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove volunteer "${name}"?`)) return;
    setDeletingId(id);
    try {
      await axiosInstance.delete(`/ich2026/admin/volunteers/${id}`);
      toast.success("Volunteer removed");
      setVolunteers((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete volunteer");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Shield className="w-3.5 h-3.5" />
            <span>Event Operations Staff</span>
          </div>
          <h1 className="font-serif text-3xl text-stone-100 uppercase tracking-wider mt-2 font-normal">
            Volunteer Management
          </h1>
          <p className="text-xs text-stone-400 mt-1 max-w-xl">
            Create and manage authorized volunteer accounts for the on-campus QR check-in scanner desk and bench allocation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/Hackathon/volunteer"
            className="px-4 py-2.5 rounded-xl border border-amber-500/30 bg-stone-900/80 hover:bg-amber-400/10 text-amber-300 text-xs font-bold uppercase tracking-wider transition flex items-center gap-2"
          >
            <QrCode className="w-4 h-4" />
            <span>Launch QR Scanner</span>
          </Link>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 text-xs font-bold uppercase tracking-wider hover:brightness-110 shadow-lg transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Volunteer</span>
          </button>
        </div>
      </div>

      {/* Volunteer List */}
      <div className="serene-glass-card rounded-2xl border border-amber-500/25 p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-semibold text-stone-200 uppercase tracking-wider">
            Active Volunteers ({volunteers.length})
          </div>
          <span className="text-xs text-stone-400">
            Zero-friction onboarding: email & password only
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-stone-400 text-xs font-mono uppercase tracking-widest">
            Loading volunteers...
          </div>
        ) : volunteers.length === 0 ? (
          <div className="py-12 text-center text-stone-500 text-xs font-sans">
            No volunteer accounts created yet. Click "+ Add Volunteer" to onboard event staff.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-amber-500/20 text-stone-400 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-500/10">
                {volunteers.map((vol) => (
                  <tr key={vol.id} className="hover:bg-amber-500/5 transition">
                    <td className="py-3.5 px-4 font-semibold text-stone-100 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 font-bold">
                        {vol.fullName?.charAt(0) || "V"}
                      </div>
                      <span>{vol.fullName}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-stone-300">{vol.email}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {vol.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-stone-400 font-mono text-[11px]">
                      {vol.created_at ? new Date(vol.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteVolunteer(vol.id, vol.fullName)}
                        disabled={deletingId === vol.id}
                        className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition cursor-pointer"
                        title="Remove Volunteer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Volunteer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm p-4">
          <div className="serene-glass-card rounded-2xl border border-amber-500/30 p-6 w-full max-w-md shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
              <h2 className="font-serif text-xl text-stone-100 uppercase tracking-wider">
                Add Volunteer Account
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-200 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateVolunteer} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-stone-300 uppercase tracking-wider font-semibold mb-1">
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Adithya Volunteer"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-500/30 bg-stone-900/90 text-stone-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-stone-300 uppercase tracking-wider font-semibold mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="volunteer@kct.ac.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-500/30 bg-stone-900/90 text-stone-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-stone-300 uppercase tracking-wider font-semibold mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-500/30 bg-stone-900/90 text-stone-100 focus:outline-none focus:border-amber-400"
                />
                <p className="mt-1 text-[11px] text-stone-400">
                  No phone number or profile constraints required.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-amber-500/20">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-stone-400 hover:text-stone-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 font-bold uppercase tracking-wider hover:brightness-110 transition disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Save Volunteer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
