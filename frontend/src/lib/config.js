/**
 * API base URL (origin + /api, no trailing slash after /api).
 * Example: http://idealab.kct.ac.in/api
 *
 * MUST be provided via Vite env:
 * VITE_API_URL=http://idealab.kct.ac.in/api
 */
export const API_BASE = import.meta.env.VITE_API_URL;

export function getImageUrl(imagePath) {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  return `${API_BASE}/${imagePath}`;
}
