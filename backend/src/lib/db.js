import { Sequelize } from "sequelize";
import { ENV } from "./env.js";
import { ensureHackathonProblemColumns } from "../scripts/ensureHackathonProblemColumns.js";
import { ensureHackathonSubmissionPhaseColumns } from "../scripts/ensureHackathonSubmissionPhaseColumns.js";
import { ensureHackathonSubmissionColumns } from "../scripts/ensureHackathonSubmissionColumns.js";

export const sequelize = new Sequelize(ENV.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
});

async function usersTableExists() {
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
  if (!(await usersTableExists())) return;

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
    console.log("PostgreSQL connected");

    await migrateLegacyUsers();
    await ensureHackathonProblemColumns({ sequelize });
    await ensureHackathonSubmissionPhaseColumns({ sequelize });
    await ensureHackathonSubmissionColumns({ sequelize });
    await sequelize.sync();

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
    console.log("Database synced");
  } catch (error) {
    console.error("Error connecting to PostgreSQL:", error.message);
    process.exit(1);
  }
};
