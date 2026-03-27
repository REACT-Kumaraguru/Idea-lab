import { axiosInstance } from "./axios.js";
import { API_BASE } from "./config.js";

/** Resolve stored path to a browser-openable URL (same logic as admin submissions). */
export function fileHref(path) {
  if (!path) return "#";
  if (path.startsWith("http")) return path;

  let p = path;
  if (path.startsWith("/src/uploads/hackathon/")) {
    const filename = path.split("/").pop();
    p = `/api/ich2026/download/hackathon/${filename}`;
  }
  if (path.startsWith("/api/ich2026/uploads/hackathon/")) {
    const filename = path.split("/").pop();
    p = `/api/ich2026/download/hackathon/${filename}`;
  }

  const origin = API_BASE?.replace(/\/$/, "") || "";
  return p.startsWith("/") ? `${origin}${p}` : `${origin}/${p}`;
}

function basenameFromStoredPath(storedPath) {
  try {
    const last = String(storedPath || "").split("/").pop();
    return decodeURIComponent(last || "");
  } catch {
    return String(storedPath || "");
  }
}

/** One-click download (uses session cookies; falls back to opening URL). */
export async function downloadHackathonSubmissionFile(storedPath) {
  const filename = basenameFromStoredPath(storedPath);
  if (!filename) return;

  try {
    const res = await axiosInstance.get(`/ich2026/download/hackathon/${encodeURIComponent(filename)}`, {
      responseType: "blob",
    });
    const blobUrl = URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(blobUrl);
  } catch {
    window.open(fileHref(storedPath), "_blank", "noopener,noreferrer");
  }
}
