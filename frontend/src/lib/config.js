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
  const separator = cleanPath.includes("?") ? "&" : "?";
  return `${API_BASE}${cleanPath}${separator}v=6`;
}

export function getEquipmentFallbackSvg(title = "IDEA Lab Equipment") {
  const clean = String(title || "IDEA Lab Equipment")
    .replace(/[<>&"']/g, "")
    .slice(0, 36)
    .toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="none">
    <rect width="600" height="400" fill="#141211"/>
    <defs>
      <radialGradient id="g" cx="50%" cy="50%" r="55%">
        <stop offset="0%" stop-color="#d4af37" stop-opacity="0.18"/>
        <stop offset="100%" stop-color="#141211" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#d4af37"/>
        <stop offset="100%" stop-color="#f59e0b"/>
      </linearGradient>
    </defs>
    <rect width="600" height="400" fill="url(#g)"/>
    <rect x="24" y="24" width="552" height="352" rx="16" stroke="#d4af37" stroke-width="1.5" stroke-opacity="0.3" stroke-dasharray="6 6"/>
    <circle cx="300" cy="165" r="46" fill="#1c1917" stroke="url(#goldGrad)" stroke-width="2"/>
    <path d="M284 165L300 149L316 165M300 152V180" stroke="#d4af37" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="300" cy="195" r="3" fill="#f59e0b"/>
    <text x="300" y="250" text-anchor="middle" fill="#fef3c7" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="700" letter-spacing="1.5">${clean}</text>
    <text x="300" y="276" text-anchor="middle" fill="#d4af37" font-family="system-ui, -apple-system, sans-serif" font-size="10" font-weight="600" letter-spacing="3" opacity="0.85">AICTE IDEA LAB • KCT</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

