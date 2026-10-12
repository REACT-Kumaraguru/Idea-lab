import React, { useState, useEffect } from "react";
import { Bell, X, AlertCircle, Info, Sparkles } from "lucide-react";
import { axiosInstance } from "../../lib/axios.js";

export default function HackathonAnnouncementBanner() {
  const [announcements, setAnnouncements] = useState([]);
  const [dismissed, setDismissed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // 1. Initial REST fetch
    axiosInstance
      .get("/ich2026/announcements")
      .then((res) => {
        if (res.data?.announcements?.length) {
          setAnnouncements(res.data.announcements);
        }
      })
      .catch(() => {});

    // 2. Try real-time EventSource SSE pipeline
    let es;
    try {
      es = new EventSource("/api/ich2026/announcements/stream", { withCredentials: true });
      es.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === "SYNC" && payload.announcements) {
            setAnnouncements(payload.announcements);
          } else if (payload.type === "NEW_ANNOUNCEMENT" && payload.announcements) {
            setAnnouncements(payload.announcements);
            setDismissed(false); // Un-dismiss when a new broadcast arrives
          } else if (payload.type === "DELETE_ANNOUNCEMENT" && payload.announcements) {
            setAnnouncements(payload.announcements);
          }
        } catch {}
      };
      es.onerror = () => {
        if (es) es.close();
      };
    } catch {}

    return () => {
      if (es) es.close();
    };
  }, []);

  // Auto-rotate if multiple announcements
  useEffect(() => {
    if (announcements.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [announcements.length]);

  if (dismissed || !announcements.length) return null;

  const current = announcements[currentIndex] || announcements[0];

  return (
    <aside aria-label="Live announcements" className="relative z-40 w-full overflow-hidden bg-gradient-to-r from-amber-500/15 via-amber-400/20 to-amber-600/15 border-b border-amber-500/30 backdrop-blur-md px-4 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>

          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-300 font-extrabold uppercase tracking-wider text-[10px] shrink-0">
            <Bell className="w-3 h-3" />
            <span>Live Broadcast</span>
          </div>

          <div className="truncate font-sans font-medium text-stone-200 text-xs">
            <span className="text-amber-200 font-semibold">{current.author ? `[${current.author}] ` : ""}</span>
            <span>{current.message}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {announcements.length > 1 && (
            <span className="text-[10px] text-stone-400 font-mono">
              {currentIndex + 1}/{announcements.length}
            </span>
          )}
          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-stone-400 hover:text-stone-200 hover:bg-stone-800/50 rounded-lg transition"
            title="Dismiss notification"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
