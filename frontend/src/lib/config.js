/**
 * API base URL (origin, no /api and no trailing slash).
 * Example: http://idealab.kct.ac.in
 *
 * MUST be provided via Vite env:
 * VITE_API_URL=http://idealab.kct.ac.in
 */
export const API_BASE = import.meta.env.VITE_API_URL;

export function getImageUrl(imagePath) {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  return `${API_BASE}/${imagePath}`;
}
