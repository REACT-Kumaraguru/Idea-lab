import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

/** Root directory for user uploads (e.g. /app/uploads in Docker). */
function getUploadsRoot() {
  return process.env.UPLOADS_DIR
    ? path.resolve(process.env.UPLOADS_DIR)
    : path.join(process.cwd(), "uploads");
}

/**
 * Reject path traversal and unsafe names. Only simple PDF basenames allowed.
 * @param {string} raw
 * @returns {{ ok: true, basename: string } | { ok: false, status: number, message: string }}
 */
function validatePdfFilename(raw) {
  if (raw == null || typeof raw !== "string") {
    return { ok: false, status: 400, message: "filename is required" };
  }

  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return { ok: false, status: 400, message: "Invalid filename encoding" };
  }

  if (decoded.length === 0 || decoded.length > 255) {
    return { ok: false, status: 400, message: "Invalid filename" };
  }

  if (/[/\\]/.test(decoded) || decoded.includes("\0") || decoded.includes("..")) {
    return { ok: false, status: 400, message: "Invalid filename" };
  }

  const base = path.basename(decoded);
  if (base !== decoded) {
    return { ok: false, status: 400, message: "Invalid filename" };
  }

  if (!/^[a-zA-Z0-9._-]+\.pdf$/i.test(base)) {
    return { ok: false, status: 400, message: "Only PDF filenames are allowed" };
  }

  return { ok: true, basename: base };
}

/**
 * GET /api/files/:filename
 * Secure download for PDFs under the uploads root (e.g. /app/uploads).
 */
router.get("/:filename", (req, res) => {
  const validation = validatePdfFilename(req.params.filename);
  if (!validation.ok) {
    return res.status(validation.status).json({ message: validation.message });
  }

  const uploadsRoot = getUploadsRoot();
  const resolvedRoot = path.resolve(uploadsRoot);
  const candidate = path.resolve(uploadsRoot, validation.basename);

  if (candidate !== resolvedRoot && !candidate.startsWith(resolvedRoot + path.sep)) {
    return res.status(400).json({ message: "Invalid path" });
  }

  if (!fs.existsSync(candidate) || !fs.statSync(candidate).isFile()) {
    return res.status(404).json({ message: "File not found" });
  }

  let realRoot;
  let realFile;
  try {
    realRoot = fs.realpathSync(resolvedRoot);
    realFile = fs.realpathSync(candidate);
  } catch {
    return res.status(404).json({ message: "File not found" });
  }

  if (realFile !== realRoot && !realFile.startsWith(realRoot + path.sep)) {
    return res.status(400).json({ message: "Invalid path" });
  }

  return res.download(realFile, validation.basename, (err) => {
    if (err) {
      if (!res.headersSent) {
        res.status(500).json({ message: "Download failed" });
      }
    }
  });
});

export default router;
