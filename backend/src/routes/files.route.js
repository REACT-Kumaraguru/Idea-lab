import express from "express";
import fs from "fs";
import path from "path";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

const authenticateFileAccess = (req, res, next) => {
  if (req.session?.user) {
    return protectRoute(req, res, next);
  }
  if (req.session?.hackathonUser?.id) {
    req.user = req.session.hackathonUser;
    return next();
  }
  return res.status(401).json({ error: "Not authenticated", message: "Authentication required to access files" });
};

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
function validateSafeFilename(raw) {
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

  if (!/^[a-zA-Z0-9._-]+\.(pdf|docx?|xlsx?|pptx?|txt|csv|png|jpe?g|webp)$/i.test(base)) {
    return { ok: false, status: 400, message: "Disallowed file type or invalid filename" };
  }

  return { ok: true, basename: base };
}

/**
 * GET /api/files/:filename
 * Secure download for files under the uploads root.
 */
router.get("/:filename", authenticateFileAccess, (req, res) => {
  const validation = validateSafeFilename(req.params.filename);
  if (!validation.ok) {
    return res.status(validation.status).json({ message: validation.message });
  }

  const potentialRoots = [
    getUploadsRoot(),
    path.join(process.cwd(), "src", "uploads"),
    path.join(process.cwd(), "uploads", "problem_documents"),
  ];

  let targetFile = null;
  let targetFilename = validation.basename;

  for (const root of potentialRoots) {
    const resolvedRoot = path.resolve(root);
    const candidate = path.resolve(root, validation.basename);

    if (candidate === resolvedRoot || !candidate.startsWith(resolvedRoot + path.sep)) {
      continue;
    }

    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      try {
        const realRoot = fs.realpathSync(resolvedRoot);
        const realFile = fs.realpathSync(candidate);
        if (realFile === realRoot || !realFile.startsWith(realRoot + path.sep)) {
          continue;
        }
        targetFile = realFile;
        break;
      } catch {
        continue;
      }
    }
  }

  if (!targetFile) {
    return res.status(404).json({ message: "File not found" });
  }

  return res.download(targetFile, validation.basename, (err) => {
    if (err) {
      if (!res.headersSent) {
        res.status(500).json({ message: "Download failed" });
      }
    }
  });
});

export default router;
