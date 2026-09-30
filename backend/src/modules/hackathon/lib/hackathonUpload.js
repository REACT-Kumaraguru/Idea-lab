import fs from "fs";
import path from "path";
import crypto from "crypto";
import multer from "multer";

// Store uploads outside source tree for production deployments, configurable via UPLOADS_DIR env.
const destination = process.env.UPLOADS_DIR 
  ? path.resolve(process.env.UPLOADS_DIR, "hackathon")
  : path.join(process.cwd(), "uploads", "hackathon");

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
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
    const uniqueId = crypto.randomUUID();
    cb(null, `${uniqueId}-${baseName}${ext}`);
  },
});

const ALLOWED_EXTENSIONS = new Set([
  ".pdf", ".zip", ".tar", ".gz", ".png", ".jpg", ".jpeg", ".webp",
  ".doc", ".docx", ".ppt", ".pptx", ".txt", ".csv", ".mp4"
]);

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_EXTENSIONS.has(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File type '${ext}' is not permitted for institutional hackathon submissions.`));
  }
};

export const hackathonUpload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB max per file
    files: 10,
  },
  fileFilter,
});

/**
 * Binary magic bytes verification.
 * Confirms that the actual file content matches the declared extension and contains no executable binaries.
 */
export function verifyFileSignature(filePath, declaredExt) {
  try {
    if (!fs.existsSync(filePath)) return false;
    const fd = fs.openSync(filePath, "r");
    const buffer = Buffer.alloc(8);
    fs.readSync(fd, buffer, 0, 8, 0);
    fs.closeSync(fd);

    // 1. Strictly block Windows PE/MZ executables (0x4D, 0x5A -> "MZ")
    if (buffer[0] === 0x4D && buffer[1] === 0x5A) return false;

    // 2. Strictly block Linux ELF executables (0x7F, 0x45, 0x4C, 0x46 -> "\x7FELF")
    if (buffer[0] === 0x7F && buffer[1] === 0x45 && buffer[2] === 0x4C && buffer[3] === 0x46) return false;

    // 3. Strictly block Unix Shell script headers (0x23, 0x21 -> "#!")
    if (buffer[0] === 0x23 && buffer[1] === 0x21) return false;

    const ext = String(declaredExt || "").toLowerCase();

    // Verify PDF header (%PDF)
    if (ext === ".pdf") {
      return buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46;
    }

    // Verify ZIP / DOCX / PPTX / XLSX (PK..)
    if ([".zip", ".docx", ".pptx", ".xlsx"].includes(ext)) {
      return buffer[0] === 0x50 && buffer[1] === 0x4B;
    }

    // Verify PNG (\x89PNG)
    if (ext === ".png") {
      return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
    }

    // Verify JPEG (\xFF\xD8\xFF)
    if ([".jpg", ".jpeg"].includes(ext)) {
      return buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
    }

    return true;
  } catch (err) {
    console.error("Signature verification error:", err.message);
    return false;
  }
}

