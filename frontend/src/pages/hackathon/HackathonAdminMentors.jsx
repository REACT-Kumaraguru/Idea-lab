import React, { useEffect, useState, useMemo } from "react";
import { axiosInstance } from "../../lib/axios.js";
import { useLocation } from "react-router-dom";
import { handleDownloadMentorsPDF } from "../../lib/hackathonDownloadStudentsPdf.js";

const HackathonAdminMentors = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const hackathonId = searchParams.get("hackathonId") || "";

  const [mentors, setMentors] = useState([]);
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [excelLoading, setExcelLoading] = useState(false);
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
    const query = hackathonId ? `?hackathonId=${hackathonId}` : "";
    const [mRes, hRes] = await Promise.all([
      axiosInstance.get(`/ich2026/admin/mentors${query}`),
      axiosInstance.get("/ich2026/admin/hackathons"),
    ]);
    setMentors(mRes.data.mentors || []);
    setHackathons(hRes.data.hackathons || []);
  };

  const currentHackathonName = useMemo(() => {
    if (!hackathonId) return "All Hackathons";
    const found = hackathons.find((h) => Number(h.id) === Number(hackathonId));
    return found?.name || "All Hackathons";
  }, [hackathons, hackathonId]);

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
  }, [hackathonId]);

  const handleDownloadExcel = async () => {
    setExcelLoading(true);
    setError(null);
    try {
      const query = hackathonId ? `?hackathonId=${hackathonId}` : "";
      const res = await axiosInstance.get(`/ich2026/admin/mentors/export-xlsx${query}`, {
        responseType: "blob",
      });
      const dateStr = new Date().toISOString().slice(0, 10);
      const blobUrl = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = blobUrl;
      const cleanTitle = currentHackathonName.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
      a.download = `mentors_${cleanTitle}_${dateStr}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to download mentors Excel");
    } finally {
      setExcelLoading(false);
    }
  };

  const onCreateMentor = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await axiosInstance.post("/ich2026/admin/mentors", {
        ...createMentor,
        hackathonId: hackathonId ? Number(hackathonId) : null,
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

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ fullName: "", email: "", expertise: "" });
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

  if (loading) return <div className="text-stone-400 font-sans text-xs uppercase tracking-widest">Loading mentors...</div>;

  const inputClass = "w-full rounded-xl border border-amber-500/30 px-3.5 py-2.5 text-xs text-stone-100 bg-stone-900/80 placeholder-stone-600 focus:outline-none focus:border-amber-400 font-sans";

  return (
    <div className="space-y-6 font-sans text-stone-100">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl text-stone-100 uppercase tracking-widest font-normal">Mentors Management</h2>
          <div className="text-xs font-sans font-bold uppercase tracking-widest text-amber-300 mt-1">
            Event: {currentHackathonName}
          </div>
          <p className="text-xs font-dancing text-amber-200/90 mt-1">Assign and configure technical domain mentors</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void handleDownloadExcel()}
            disabled={excelLoading}
            className="shrink-0 rounded-xl border border-amber-500/30 bg-stone-900/80 px-4 py-2.5 text-xs font-sans uppercase font-bold tracking-wider text-amber-300 shadow-lg hover:bg-amber-400/10 transition disabled:opacity-60 cursor-pointer"
          >
            {excelLoading ? "Preparing Excel..." : "Download Excel"}
          </button>
          <button
            type="button"
            onClick={() => handleDownloadMentorsPDF(mentors, currentHackathonName)}
            className="shrink-0 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 px-4 py-2.5 text-xs font-sans uppercase font-bold tracking-wider text-stone-950 shadow-lg hover:brightness-110 transition cursor-pointer"
          >
            Download PDF
          </button>
        </div>
      </div>

      {error ? <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200">{error}</div> : null}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="serene-glass-card rounded-3xl border border-amber-500/25 p-6 shadow-2xl">
          <h3 className="font-serif text-lg text-amber-300 uppercase tracking-wider font-normal">Create Mentor Account</h3>
          <form onSubmit={onCreateMentor} className="mt-4 space-y-3">
            <input
              value={createMentor.fullName}
              onChange={(e) => setCreateMentor((p) => ({ ...p, fullName: e.target.value }))}
              placeholder="Full Name"
              required
              className={inputClass}
            />
            <input
              value={createMentor.email}
              onChange={(e) => setCreateMentor((p) => ({ ...p, email: e.target.value }))}
              placeholder="Email"
              type="email"
              required
              className={inputClass}
            />
            <input
              value={createMentor.expertise}
              onChange={(e) => setCreateMentor((p) => ({ ...p, expertise: e.target.value }))}
              placeholder="Expertise (optional)"
              className={inputClass}
            />
            <button className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 text-xs font-sans uppercase font-bold tracking-wider hover:brightness-110 transition shadow-lg cursor-pointer">
              Create Mentor
            </button>
          </form>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="font-serif text-xl text-stone-100 uppercase tracking-wider mb-4 font-normal">Existing Mentors ({mentors.length})</h3>
        <div className="space-y-4">
          {mentors.map((m) => (
            <div key={m.id} className="serene-glass-card rounded-2xl border border-amber-500/20 p-5 shadow-xl">
              {editingId === m.id ? (
                <form onSubmit={onUpdateMentor} className="space-y-3">
                  <input
                    value={editForm.fullName}
                    onChange={(e) => setEditForm((p) => ({ ...p, fullName: e.target.value }))}
                    placeholder="Full Name"
                    required
                    className={inputClass}
                  />
                  <input
                    value={editForm.email}
                    onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                    placeholder="Email"
                    type="email"
                    required
                    className={inputClass}
                  />
                  <input
                    value={editForm.expertise}
                    onChange={(e) => setEditForm((p) => ({ ...p, expertise: e.target.value }))}
                    placeholder="Expertise (optional)"
                    className={inputClass}
                  />
                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 text-xs font-sans uppercase font-bold tracking-wider hover:brightness-110 transition"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-4 py-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-300 text-xs font-sans uppercase font-bold tracking-wider hover:bg-stone-800 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <div className="font-serif text-lg text-stone-100 uppercase tracking-wider font-normal">{m.user?.fullName || m.fullName || "Mentor"}</div>
                    <div className="text-xs text-amber-300/90 font-mono mt-0.5">{m.user?.email || m.email}</div>
                    <div className="text-xs text-stone-400 mt-2 font-sans">
                      <span className="text-stone-500 uppercase tracking-wider text-[10px] font-bold">Expertise: </span>
                      {m.expertise || "General Mentor"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(m)}
                      className="px-3 py-1.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-sans uppercase font-bold transition"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteMentor(m.id)}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-sans uppercase font-bold transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {mentors.length === 0 && (
            <div className="serene-glass-card rounded-2xl border border-amber-500/15 p-8 text-center text-xs text-stone-400 uppercase tracking-widest font-sans">
              No mentors registered yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HackathonAdminMentors;

