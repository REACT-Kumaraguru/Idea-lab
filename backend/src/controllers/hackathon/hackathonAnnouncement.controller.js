import crypto from "crypto";
import HackathonAnnouncement from "../../models/hackathon/HackathonAnnouncementModel.js";

// In-memory real-time SSE clients registry
const sseClients = new Set();

const fetchRecentAnnouncements = async () => {
  try {
    const list = await HackathonAnnouncement.findAll({
      order: [["created_at", "DESC"]],
      limit: 20,
    });
    return list.map((a) => ({
      id: a.id,
      message: a.message,
      severity: a.severity,
      author: a.author,
      createdAt: a.createdAt,
    }));
  } catch (err) {
    console.error("Error fetching announcements:", err.message);
    return [];
  }
};

/**
 * SSE Stream endpoint: GET /api/ich2026/announcements/stream
 * Pushes live announcements to all connected student & volunteer dashboards.
 */
export const streamAnnouncements = async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  const announcements = await fetchRecentAnnouncements();
  const initialData = JSON.stringify({ type: "SYNC", announcements });
  res.write(`data: ${initialData}\n\n`);

  sseClients.add(res);

  // Heartbeat every 25 seconds to keep connection alive through proxies
  const heartbeat = setInterval(() => {
    try {
      res.write(": heartbeat\n\n");
    } catch {
      clearInterval(heartbeat);
      sseClients.delete(res);
    }
  }, 25000);

  req.on("close", () => {
    clearInterval(heartbeat);
    sseClients.delete(res);
  });
};

/**
 * REST Fallback: GET /api/ich2026/announcements
 */
export const getActiveAnnouncements = async (req, res) => {
  const announcements = await fetchRecentAnnouncements();
  return res.json({ announcements });
};

/**
 * Admin Publish: POST /api/ich2026/admin/announcement
 */
export const publishAnnouncement = async (req, res) => {
  try {
    const { message, severity = "info", hackathonId } = req.body || {};
    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Announcement message is required" });
    }

    const newRecord = await HackathonAnnouncement.create({
      id: "ann-" + crypto.randomBytes(4).toString("hex"),
      message: message.trim(),
      severity,
      author:
        req.session?.hackathonUser?.fullName ||
        req.hackathonUser?.fullName ||
        req.session?.user?.fullName ||
        "Hackathon Admin",
      hackathonId: hackathonId && !isNaN(Number(hackathonId)) ? Number(hackathonId) : null,
    });

    const newAnnouncement = {
      id: newRecord.id,
      message: newRecord.message,
      severity: newRecord.severity,
      author: newRecord.author,
      createdAt: newRecord.createdAt,
    };

    const announcements = await fetchRecentAnnouncements();

    // Broadcast to all active SSE clients
    const broadcastPayload = JSON.stringify({ type: "NEW_ANNOUNCEMENT", announcement: newAnnouncement, announcements });
    for (const client of sseClients) {
      try {
        client.write(`data: ${broadcastPayload}\n\n`);
      } catch {
        sseClients.delete(client);
      }
    }

    return res.status(201).json({ success: true, announcement: newAnnouncement });
  } catch (error) {
    console.error("Error publishing announcement:", error);
    return res.status(500).json({ message: "Failed to publish announcement" });
  }
};

/**
 * Admin Delete: DELETE /api/ich2026/admin/announcement/:id
 */
export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    await HackathonAnnouncement.destroy({ where: { id } });

    const announcements = await fetchRecentAnnouncements();

    const broadcastPayload = JSON.stringify({ type: "DELETE_ANNOUNCEMENT", id, announcements });
    for (const client of sseClients) {
      try {
        client.write(`data: ${broadcastPayload}\n\n`);
      } catch {
        sseClients.delete(client);
      }
    }

    return res.json({ success: true, message: "Announcement removed" });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return res.status(500).json({ message: "Failed to delete announcement" });
  }
};
