import { Sequelize } from "sequelize";
import path from "path";
import { fileURLToPath } from "url";
import { ENV } from "./env.js";
import { ensureHackathonProblemColumns } from "../scripts/ensureHackathonProblemColumns.js";
import { ensureHackathonProblemMentors } from "../scripts/ensureHackathonProblemMentors.js";
import { ensureHackathonSubmissionPhaseColumns } from "../scripts/ensureHackathonSubmissionPhaseColumns.js";
import { ensureHackathonSubmissionColumns } from "../scripts/ensureHackathonSubmissionColumns.js";
import { ensureHackathonColumns } from "../scripts/ensureHackathonColumns.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../../..");
export const canonicalDbPath = path.resolve(projectRoot, "database_multi_hackathon.sqlite");

const isPostgres = ENV.DATABASE_URL && ENV.DATABASE_URL.startsWith("postgres");

export const sequelize = isPostgres
  ? new Sequelize(ENV.DATABASE_URL, {
      dialect: "postgres",
      logging: false,
      pool: {
        min: 2,
        max: 25,
        acquire: 30000,
        idle: 10000,
      },
      dialectOptions: {
        ssl: (process.env.DATABASE_SSL === "true" || (ENV.DATABASE_URL && ENV.DATABASE_URL.includes("sslmode=require")))
          ? {
              require: true,
              rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === "false" ? false : true,
            }
          : false,
      },
    })
  : new Sequelize({
      dialect: "sqlite",
      storage: canonicalDbPath,
      logging: false,
      pool: {
        min: 1,
        max: 1, // Single connection for SQLite prevents multi-thread locking while WAL mode allows high-concurrency reads
        acquire: 30000,
        idle: 10000,
      },
    });

async function usersTableExists() {
  if (sequelize.getDialect() !== "postgres") return false;
  const [rows] = await sequelize.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'users'
    ) AS exists;
  `);
  return Boolean(rows[0]?.exists);
}

/** Rename legacy `password` column and add `is_verified` before Sequelize sync. */
async function migrateLegacyUsers() {
  if (sequelize.getDialect() !== "postgres" || !(await usersTableExists())) return;

  await sequelize.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'password'
      ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'password_hash'
      ) THEN
        ALTER TABLE "users" RENAME COLUMN "password" TO "password_hash";
      END IF;
    END$$;
  `);

  await sequelize.query(`
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_verified" BOOLEAN NOT NULL DEFAULT true;
  `);

  await sequelize.query(`
    UPDATE "users" SET "is_verified" = true WHERE "is_verified" IS NULL;
  `);
}

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`Database connected (${sequelize.getDialect()})`);

    if (sequelize.getDialect() === "sqlite") {
      await sequelize.query("PRAGMA journal_mode = WAL;");
      await sequelize.query("PRAGMA synchronous = NORMAL;");
      await sequelize.query("PRAGMA busy_timeout = 30000;");
      await sequelize.query("PRAGMA cache_size = -64000;");
      await sequelize.query("PRAGMA foreign_keys = ON;");
      await sequelize.query("PRAGMA temp_store = MEMORY;");
      console.log("[db] SQLite configured: WAL mode, 30s busy timeout, and 64MB cache enabled");
    }

    await ensureHackathonColumns({ sequelize });
    await sequelize.sync();
    await migrateLegacyUsers();
    await ensureHackathonProblemColumns({ sequelize });
    await ensureHackathonProblemMentors({ sequelize });
    await ensureHackathonSubmissionPhaseColumns({ sequelize });
    await ensureHackathonSubmissionColumns({ sequelize });

    if (sequelize.getDialect() === "postgres") {
      await sequelize.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_users_role') THEN
            CREATE TYPE "enum_users_role" AS ENUM ('student', 'external');
          END IF;
        END$$;
      `);
      await sequelize.query(`
        ALTER TABLE "users"
        ADD COLUMN IF NOT EXISTS "role" "enum_users_role" NOT NULL DEFAULT 'student';
      `);
    }
    console.log("Database synced");
  } catch (error) {
    console.error("Error connecting to database:", error.message);
    process.exit(1);
  }
};
