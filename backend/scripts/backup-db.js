import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { ENV } from "../src/lib/env.js";

const execAsync = promisify(exec);

async function runBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = path.resolve(process.cwd(), "backups");

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const isPostgres = ENV.DATABASE_URL && ENV.DATABASE_URL.startsWith("postgres");

  if (isPostgres) {
    const targetFile = path.join(backupDir, `backup-postgres-${timestamp}.sql`);
    console.log(`[backup] Initiating PostgreSQL backup to: ${targetFile}`);
    try {
      await execAsync(`pg_dump "${ENV.DATABASE_URL}" -F c -b -v -f "${targetFile}"`);
      console.log(`[backup] PostgreSQL backup complete: ${targetFile}`);
    } catch (err) {
      console.error("[backup] PostgreSQL backup failed:", err.message);
    }
  } else {
    // SQLite backup
    const candidates = [
      path.resolve(process.cwd(), "database_multi_hackathon.sqlite"),
      path.resolve(process.cwd(), "backend", "database_multi_hackathon.sqlite"),
      path.resolve(process.cwd(), "../database_multi_hackathon.sqlite"),
    ];
    const sourceDb = candidates.find((p) => fs.existsSync(p));

    if (sourceDb) {
      const targetFile = path.join(backupDir, `backup-sqlite-${timestamp}.sqlite`);
      fs.copyFileSync(sourceDb, targetFile);
      console.log(`[backup] SQLite backup successfully created at: ${targetFile}`);
    } else {
      console.warn("[backup] No SQLite database file found to backup.");
    }
  }

  // 30-day retention pruning
  try {
    const files = fs.readdirSync(backupDir);
    const now = Date.now();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

    for (const file of files) {
      const fullPath = path.join(backupDir, file);
      const stat = fs.statSync(fullPath);
      if (now - stat.mtimeMs > thirtyDaysMs) {
        fs.unlinkSync(fullPath);
        console.log(`[backup-pruning] Deleted stale backup: ${file}`);
      }
    }
  } catch (err) {
    console.warn("[backup-pruning] Retention cleanup error:", err.message);
  }
}

runBackup();
