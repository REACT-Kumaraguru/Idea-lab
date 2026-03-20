import fs from "fs";
import multer from "multer";

const destination = "./src/uploads/hackathon";

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

