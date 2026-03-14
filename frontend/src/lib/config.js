/**
 * API base URL (origin, no trailing slash).
 * Set VITE_API_URL when building for production (e.g. https://api.yourdomain.com).
 */
export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";

export function getImageUrl(imagePath) {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  return `${API_BASE}/${imagePath}`;
}
