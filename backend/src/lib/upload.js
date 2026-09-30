
import fs from "fs";
import path from "path";
import crypto from "crypto";
import multer from "multer";

const destination = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : (fs.existsSync(path.join(process.cwd(), "src", "uploads"))
      ? path.join(process.cwd(), "src", "uploads")
      : path.join(process.cwd(), "uploads"));

const ensureDir = () => {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureDir();
    cb(null, destination);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 50);
    const uniqueId = crypto.randomUUID();
    cb(null, `${uniqueId}-${baseName}${ext}`);
  },
});

const ALLOWED_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".webp", ".gif",
  ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt", ".csv"
]);

const BLOCKED_EXTENSIONS = new Set([
  ".html", ".htm", ".svg", ".xml", ".xhtml",
  ".exe", ".bat", ".cmd", ".sh", ".bash", ".ps1", ".vbs",
  ".js", ".mjs", ".ts", ".php", ".phtml", ".py", ".rb", ".pl", ".cgi"
]);

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (BLOCKED_EXTENSIONS.has(ext)) {
    return cb(new Error(`File format '${ext}' is disallowed for security reasons (executable/script files are blocked).`));
  }
  if (ALLOWED_EXTENSIONS.has(ext)) {
    return cb(null, true);
  }
  return cb(new Error(`File type '${ext}' is not permitted.`));
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB max per file
    files: 10,
  },
  fileFilter,
});

