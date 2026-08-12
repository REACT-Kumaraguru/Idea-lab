import fs from "fs";
import path from "path";
import multer from "multer";

// Store uploads outside source tree for production deployments.
const destination = path.join(process.cwd(), "uploads", "hackathon");

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
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safeName}`);
  },
});

export const hackathonUpload = multer({ storage });

