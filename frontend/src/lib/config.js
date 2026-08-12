/**
 * API base URL (origin, no /api and no trailing slash).
 * If VITE_API_URL is explicitly set, use it.
 * Otherwise, in a production browser environment (e.g. idealab.kct.ac.in), use current window.location.origin.
 * Fall back to http://localhost:5003 only during local development.
 */
const getApiBase = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && String(envUrl).trim() && !String(envUrl).includes("undefined")) {
    return String(envUrl).replace(/\/$/, "");
  }
  if (typeof window !== "undefined") {
    const { hostname, port, origin } = window.location;
    const isLocalDevPort = ["5173", "5174", "5175", "5176", "5205", "3000", "5000"].includes(port);
    const isLocalHost = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0";
    if (!isLocalHost || (isLocalHost && !isLocalDevPort && port !== "")) {
      return origin;
    }
    if (!isLocalDevPort && port === "") {
      return origin;
    }
  }
  return "http://localhost:5003";
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

