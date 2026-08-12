
import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure this directory exists or create it
    cb(null, "./src/uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const upload = multer({ storage: storage });
