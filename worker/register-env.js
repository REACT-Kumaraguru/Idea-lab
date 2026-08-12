/**
 * Must load before any import of backend/src/lib/env.js so process.env is populated.
 */
import { existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

if (existsSync(join(root, "backend", ".env"))) {
  dotenv.config({ path: join(root, "backend", ".env") });
} else if (existsSync(join(root, ".env"))) {
  dotenv.config({ path: join(root, ".env") });
} else {
  dotenv.config();
}
