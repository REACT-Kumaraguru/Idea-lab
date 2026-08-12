/**
 * API base URL (origin, no /api and no trailing slash).
 * Example: http://idealab.kct.ac.in
 *
 * MUST be provided via Vite env:
 * VITE_API_URL=http://idealab.kct.ac.in
 */
export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5003";

/** Official PoC template PDF (served by API for Nginx-safe download). */
export function getHackathonTemplatePdfHref() {
  const raw = import.meta.env.VITE_API_URL;
  if (raw && String(raw).trim()) {
    return `${String(raw).replace(/\/$/, "")}/api/ich2026/templatehackthon.pdf`;
  }
  return "/api/ich2026/templatehackthon.pdf";
}

export function getImageUrl(imagePath) {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  return `${API_BASE}/${imagePath}`;
}
