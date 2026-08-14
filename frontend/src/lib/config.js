/**
 * API base URL (origin, no /api and no trailing slash).
 * If VITE_API_URL is explicitly set, use it.
 * Otherwise, in a production browser environment (e.g. idealab.kct.ac.in), use current window.location.origin.
 * Fall back to http://localhost:5003 only during local development.
 */
const getApiBase = () => {
  if (typeof window !== "undefined") {
    const { hostname, origin } = window.location;
    const isLocalHost = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0";
    if (!isLocalHost) {
      return origin;
    }
  }
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && String(envUrl).trim() && !String(envUrl).includes("undefined") && !String(envUrl).includes("localhost")) {
    return String(envUrl).replace(/\/$/, "");
  }
  return typeof window !== "undefined" ? window.location.origin : "http://localhost:5003";
};

export const API_BASE = getApiBase();

/** Official PoC template PDF (served by API for Nginx-safe download). */
export function getHackathonTemplatePdfHref() {
  return `${API_BASE}/api/ich2026/templatehackthon.pdf`;
}

export function getImageUrl(imagePath) {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `${API_BASE}${cleanPath}`;
}

