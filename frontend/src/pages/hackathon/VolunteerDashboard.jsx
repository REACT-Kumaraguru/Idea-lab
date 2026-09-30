import React, { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { axiosInstance } from "../../lib/axios.js";
import {
  Camera,
  CheckCircle,
  XCircle,
  Search,
  Users,
  Shield,
  MapPin,
  Clock,
  Sparkles,
  QrCode,
} from "lucide-react";

const QR_READER_ID = "volunteer-qr-reader";

export default function VolunteerDashboard() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [team, setTeam] = useState(null);
  const [error, setError] = useState(null);
  const [benchNumber, setBenchNumber] = useState("");
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkInSuccess, setCheckInSuccess] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [recentAttendance, setRecentAttendance] = useState([]);

  const html5QrcodeRef = useRef(null);

  useEffect(() => {
    fetchRecentAttendance();
    return () => {
      stopScanning();
    };
  }, []);

  const fetchRecentAttendance = async () => {
    try {
      const res = await axiosInstance.get("/ich2026/volunteer/attendance");
      setRecentAttendance(res.data.attendance || []);
    } catch {
      // ignore
    }
  };

  const startScanning = async () => {
    setError(null);
    setScanning(true);
    setTeam(null);
    setCheckInSuccess(null);

    try {
      const html5Qr = new Html5Qrcode(QR_READER_ID);
      html5QrcodeRef.current = html5Qr;

      await html5Qr.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          stopScanning();
          handleLookup(decodedText);
        },
        () => {}
      );
    } catch (err) {
      setError(err.message || "Failed to start camera. Please ensure camera permissions are allowed.");
      setScanning(false);
    }
  };

  const stopScanning = () => {
    if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
      html5QrcodeRef.current
        .stop()
        .then(() => {
          html5QrcodeRef.current.clear();
          html5QrcodeRef.current = null;
        })
        .catch(() => {});
    }
    setScanning(false);
  };

  const handleLookup = async (codeToSearch) => {
    const target = codeToSearch || query;
    if (!target?.trim()) return;

    setLoading(true);
    setError(null);
    setCheckInSuccess(null);
    try {
      const res = await axiosInstance.get(`/ich2026/volunteer/scan?query=${encodeURIComponent(target.trim())}`);
      setTeam(res.data.team);
      if (res.data.team?.benchNumber) {
        setBenchNumber(res.data.team.benchNumber);
      }
    } catch (err) {
      setError(err.response?.data?.message || "No team found matching that code or scan.");
      setTeam(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!team) return;
    setCheckingIn(true);
    setError(null);
    try {
      const res = await axiosInstance.post("/ich2026/volunteer/check-in", {
        teamId: team.id,
        benchNumber: benchNumber.trim() || undefined,
        isPresent: true,
      });
      setCheckInSuccess(res.data.message || "Attendance recorded successfully!");
      setTeam((prev) => ({
        ...prev,
        isPresent: true,
        benchNumber: res.data.team?.benchNumber || benchNumber,
        attendanceMarkedAt: res.data.team?.attendanceMarkedAt,
        attendanceMarkedBy: res.data.team?.attendanceMarkedBy,
      }));
      fetchRecentAttendance();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to record check-in.");
    } finally {
      setCheckingIn(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-serif text-3xl font-normal text-stone-100 tracking-tight">
            Volunteer On-Campus Check-In
          </h2>
          <p className="text-xs text-amber-300/80 font-sans uppercase tracking-widest mt-1">
            Live QR Scanner & Bench Allocation Desk
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Scanner & Search Input */}
        <div className="lg:col-span-2 space-y-6">
          <div className="serene-glass-card rounded-3xl border border-amber-500/20 p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h3 className="font-serif text-xl font-normal text-stone-100 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-amber-300" />
                <span>Scan Team QR or Enter Code</span>
              </h3>

              {!scanning ? (
                <button
                  onClick={startScanning}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 font-semibold text-xs uppercase tracking-wider hover:bg-amber-400 transition flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>Start Camera Scanner</span>
                </button>
              ) : (
                <button
                  onClick={stopScanning}
                  className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold text-xs uppercase tracking-wider hover:bg-rose-500/30 transition flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Stop Scanner</span>
                </button>
              )}
            </div>

            {/* Video container for html5-qrcode */}
            <div
              id={QR_READER_ID}
              className={`rounded-2xl overflow-hidden border border-amber-500/20 bg-stone-950 ${
                scanning ? "min-h-[280px]" : "hidden"
              }`}
            />

            {/* Manual Entry Fallback */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                  placeholder="Enter Team Invite Code (e.g. TM-9402) or Team Name..."
                  className="w-full rounded-xl border border-amber-500/30 bg-stone-950 px-3.5 py-2.5 pl-10 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 transition font-mono"
                />
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              </div>
              <button
                onClick={() => handleLookup()}
                disabled={loading || !query.trim()}
                className="px-5 py-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition text-xs font-bold uppercase tracking-wider disabled:opacity-50"
              >
                {loading ? "Searching..." : "Lookup"}
              </button>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {checkInSuccess && (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{checkInSuccess}</span>
              </div>
            )}
          </div>

          {/* Team Verification Result */}
          {team && (
            <div className="serene-glass-card rounded-3xl border border-amber-500/30 p-6 shadow-2xl space-y-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-amber-300">
                    {team.hackathonTitle}
                  </span>
                  <h3 className="font-serif text-2xl font-medium text-stone-100 mt-1">{team.teamName}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-mono">
                      {team.inviteCode}
                    </span>
                    {team.isPresent ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                        Checked In ✓
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider">
                        Awaiting Check-in
                      </span>
                    )}
                  </div>
                </div>

                {/* Bench Assignment & Action */}
                <div className="bg-stone-950/80 p-4 rounded-2xl border border-amber-500/20 space-y-3 min-w-[220px]">
                  <label className="block text-[10px] font-sans font-bold uppercase tracking-widest text-amber-300">
                    Assign Lab Bench Number
                  </label>
                  <input
                    type="text"
                    value={benchNumber}
                    onChange={(e) => setBenchNumber(e.target.value)}
                    placeholder="e.g. BENCH-B04"
                    className="w-full rounded-xl border border-amber-500/30 bg-stone-900 px-3 py-1.5 text-xs text-stone-100 font-mono uppercase focus:outline-none focus:border-amber-400"
                  />
                  <button
                    onClick={handleCheckIn}
                    disabled={checkingIn}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-stone-950 font-bold text-xs uppercase tracking-wider hover:from-emerald-400 hover:to-emerald-500 transition shadow-lg disabled:opacity-50"
                  >
                    {checkingIn ? "Recording..." : team.isPresent ? "Update Bench" : "Confirm Attendance"}
                  </button>
                </div>
              </div>

              {/* Leader & Roster */}
              <div className="pt-4 border-t border-amber-500/15">
                <h4 className="text-xs font-sans font-bold uppercase tracking-widest text-stone-400 mb-3">
                  Verified Team Members ({team.members?.length || 0})
                </h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  {(team.members || []).map((m) => (
                    <div
                      key={m.userId}
                      className="p-3 rounded-xl bg-stone-950/60 border border-amber-500/10 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-stone-100">{m.fullName}</span>
                        {m.isLeader && (
                          <span className="text-[9px] font-bold uppercase text-amber-300">Leader</span>
                        )}
                      </div>
                      <div className="text-[11px] text-stone-400 font-mono">{m.email}</div>
                      {m.phone && <div className="text-[11px] text-stone-400">{m.phone}</div>}
                      {m.college && <div className="text-[10px] text-stone-500">{m.college}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Attendance Stream */}
        <div className="space-y-6">
          <div className="serene-glass-card rounded-3xl border border-amber-500/20 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-medium text-stone-100 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-300" />
                <span>Recent Check-Ins ({recentAttendance.length})</span>
              </h3>
              <button
                onClick={fetchRecentAttendance}
                className="text-[10px] font-mono text-amber-300 hover:underline"
              >
                Refresh
              </button>
            </div>

            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {recentAttendance.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3 rounded-xl bg-stone-950/70 border border-amber-500/10 text-xs flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="font-semibold text-stone-200">{rec.teamName}</div>
                    <div className="text-[10px] text-stone-400 font-mono mt-0.5">
                      Code: {rec.inviteCode}
                    </div>
                    {rec.benchNumber && (
                      <div className="text-[10px] text-amber-300 font-semibold flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        <span>{rec.benchNumber}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-bold uppercase">
                      Present
                    </span>
                    <div className="text-[9px] text-stone-500 mt-1">
                      {rec.attendanceMarkedAt ? new Date(rec.attendanceMarkedAt).toLocaleTimeString() : ""}
                    </div>
                  </div>
                </div>
              ))}

              {recentAttendance.length === 0 && (
                <div className="p-6 text-center text-xs text-stone-500">
                  No attendance recorded yet today.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
