import React, { useEffect, useMemo, useState } from "react";
import { axiosInstance } from "../../lib/axios.js";
import { useLocation } from "react-router-dom";
import { CheckCircle, XCircle, Search, ArrowUpDown, Download, Printer, UserCheck, Shield, Clock } from "lucide-react";
import { toast } from "react-hot-toast";

export default function HackathonAdminAttendance() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const hackathonId = searchParams.get("hackathonId") || "1";

  const [data, setData] = useState({ stats: { total: 0, present: 0, absent: 0, rate: 0 }, teams: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterMode, setFilterMode] = useState("all"); // 'all' | 'present' | 'absent'
  const [sortBy, setSortBy] = useState("present_first"); // 'present_first' | 'absent_first' | 'team_name' | 'bench'
  const [updatingId, setUpdatingId] = useState(null);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/ich2026/admin/attendance?hackathonId=${hackathonId}`);
      setData(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load attendance list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [hackathonId]);

  const handleTogglePresent = async (teamId, currentVal, benchNumber) => {
    setUpdatingId(teamId);
    try {
      const res = await axiosInstance.post("/ich2026/admin/attendance/toggle", {
        teamId,
        isPresent: !currentVal,
        benchNumber,
      });
      toast.success(res.data.message || "Attendance updated");
      fetchAttendance();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to toggle attendance");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdateBench = async (teamId, benchNumber) => {
    try {
      await axiosInstance.post("/ich2026/admin/attendance/toggle", {
        teamId,
        benchNumber,
      });
      toast.success("Bench updated");
    } catch (err) {
      toast.error("Failed to update bench");
    }
  };

  const filteredTeams = useMemo(() => {
    return (data.teams || [])
      .filter((t) => {
        if (filterMode === "present" && !t.isPresent) return false;
        if (filterMode === "absent" && t.isPresent) return false;
        if (search.trim()) {
          const q = search.toLowerCase().trim();
          const matchName = (t.teamName || "").toLowerCase().includes(q);
          const matchCode = (t.inviteCode || "").toLowerCase().includes(q);
          const matchBench = (t.benchNumber || "").toLowerCase().includes(q);
          const matchLeader = (t.leaderName || "").toLowerCase().includes(q);
          return matchName || matchCode || matchBench || matchLeader;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "present_first") {
          return (b.isPresent ? 1 : 0) - (a.isPresent ? 1 : 0);
        }
        if (sortBy === "absent_first") {
          return (a.isPresent ? 1 : 0) - (b.isPresent ? 1 : 0);
        }
        if (sortBy === "team_name") {
          return (a.teamName || "").localeCompare(b.teamName || "");
        }
        if (sortBy === "bench") {
          return (a.benchNumber || "").localeCompare(b.benchNumber || "");
        }
        return 0;
      });
  }, [data.teams, filterMode, search, sortBy]);

  const handleExportCSV = () => {
    const headers = ["Team Name", "Invite Code", "Leader Name", "Leader Email", "Members", "Status", "Bench", "Marked At", "Marked By"];
    const rows = filteredTeams.map((t) => [
      `"${t.teamName}"`,
      `"${t.inviteCode}"`,
      `"${t.leaderName}"`,
      `"${t.leaderEmail}"`,
      t.memberCount,
      t.isPresent ? "PRESENT" : "ABSENT",
      `"${t.benchNumber || ""}"`,
      `"${t.attendanceMarkedAt ? new Date(t.attendanceMarkedAt).toLocaleString() : ""}"`,
      `"${t.attendanceMarkedBy || ""}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Live On-Campus Operations</span>
          </div>
          <h1 className="font-serif text-3xl text-stone-100 uppercase tracking-wider mt-2 font-normal">
            Attendance & Bench Allocation Desk
          </h1>
          <p className="text-xs text-stone-400 mt-1 max-w-xl">
            Real-time physical check-in tracker for arriving student teams, bench table assignments, and on-campus presence validation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl border border-stone-700 bg-stone-900/80 hover:bg-stone-800 text-stone-300 text-xs font-bold uppercase tracking-wider transition flex items-center gap-2"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 text-xs font-bold uppercase tracking-wider hover:brightness-110 shadow-lg transition flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="serene-glass-card rounded-2xl border border-amber-500/25 p-4 shadow-xl">
          <div className="text-[11px] uppercase tracking-wider text-stone-400 font-bold">Total Registered Teams</div>
          <div className="text-2xl font-serif text-stone-100 font-bold mt-1">{data.stats.total}</div>
        </div>

        <div className="serene-glass-card rounded-2xl border border-emerald-500/30 p-4 shadow-xl bg-emerald-500/5">
          <div className="text-[11px] uppercase tracking-wider text-emerald-400 font-bold">Present / Checked In</div>
          <div className="text-2xl font-serif text-emerald-300 font-bold mt-1">{data.stats.present}</div>
        </div>

        <div className="serene-glass-card rounded-2xl border border-rose-500/30 p-4 shadow-xl bg-rose-500/5">
          <div className="text-[11px] uppercase tracking-wider text-rose-400 font-bold">Absent / Pending</div>
          <div className="text-2xl font-serif text-rose-300 font-bold mt-1">{data.stats.absent}</div>
        </div>

        <div className="serene-glass-card rounded-2xl border border-amber-500/30 p-4 shadow-xl bg-amber-500/5">
          <div className="text-[11px] uppercase tracking-wider text-amber-400 font-bold">Attendance Rate</div>
          <div className="text-2xl font-serif text-amber-300 font-bold mt-1">{data.stats.rate}%</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="serene-glass-card rounded-2xl border border-amber-500/25 p-4 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search team, code, bench, or leader..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-xl border border-amber-500/30 bg-stone-900/90 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto flex-wrap justify-end">
            <div className="flex items-center gap-1 bg-stone-900/90 border border-amber-500/30 rounded-xl p-1">
              <button
                onClick={() => setFilterMode("all")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  filterMode === "all" ? "bg-amber-400 text-stone-950" : "text-stone-400 hover:text-stone-200"
                }`}
              >
                All ({data.stats.total})
              </button>
              <button
                onClick={() => setFilterMode("present")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  filterMode === "present" ? "bg-emerald-500 text-stone-950" : "text-stone-400 hover:text-emerald-300"
                }`}
              >
                Present ({data.stats.present})
              </button>
              <button
                onClick={() => setFilterMode("absent")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  filterMode === "absent" ? "bg-rose-500 text-white" : "text-stone-400 hover:text-rose-300"
                }`}
              >
                Absent ({data.stats.absent})
              </button>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-xl border border-amber-500/30 bg-stone-900/90 text-stone-200 font-semibold focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="present_first">Sort: Present First</option>
              <option value="absent_first">Sort: Absent First</option>
              <option value="team_name">Sort: Team Name</option>
              <option value="bench">Sort: Bench Number</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-12 text-center text-stone-400 text-xs font-mono uppercase tracking-widest">
            Loading attendance records...
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="py-12 text-center text-stone-500 text-xs font-sans">
            No teams match the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-amber-500/20 text-stone-400 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Team</th>
                  <th className="py-3 px-3">Bench Allocation</th>
                  <th className="py-3 px-3">Leader Contact</th>
                  <th className="py-3 px-3">Checked-in Timestamp</th>
                  <th className="py-3 px-3 text-right">Desk Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-500/10">
                {filteredTeams.map((t) => (
                  <tr key={t.id} className="hover:bg-amber-500/5 transition">
                    <td className="py-3 px-3">
                      {t.isPresent ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          <span>Present</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-800 text-stone-400 border border-stone-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-stone-500"></span>
                          <span>Absent</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-stone-100 text-sm">{t.teamName}</div>
                      <div className="text-[11px] text-stone-400 font-mono mt-0.5 flex items-center gap-2">
                        <span>Code: {t.inviteCode}</span>
                        <span>•</span>
                        <span>{t.memberCount} Members</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <input
                        type="text"
                        defaultValue={t.benchNumber || ""}
                        placeholder="Assign Table"
                        onBlur={(e) => handleUpdateBench(t.id, e.target.value)}
                        className="w-28 px-2.5 py-1 rounded-lg border border-amber-500/30 bg-stone-950 text-amber-300 font-mono text-xs uppercase text-center focus:outline-none focus:border-amber-400"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-stone-200 font-medium">{t.leaderName}</div>
                      <div className="text-[11px] text-stone-400 font-mono">{t.leaderEmail}</div>
                    </td>
                    <td className="py-3 px-3 text-stone-400 font-mono text-[11px]">
                      {t.attendanceMarkedAt ? (
                        <div>
                          <div className="text-stone-200">{new Date(t.attendanceMarkedAt).toLocaleTimeString()}</div>
                          <div className="text-[10px] text-stone-500">by {t.attendanceMarkedBy || "Volunteer Desk"}</div>
                        </div>
                      ) : (
                        <span className="text-stone-600">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleTogglePresent(t.id, t.isPresent, t.benchNumber)}
                        disabled={updatingId === t.id}
                        className={`px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider text-[11px] transition shadow-sm cursor-pointer ${
                          t.isPresent
                            ? "border border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                            : "border border-emerald-500/40 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                        }`}
                      >
                        {updatingId === t.id ? "Saving..." : t.isPresent ? "Mark Absent" : "Mark Present"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
