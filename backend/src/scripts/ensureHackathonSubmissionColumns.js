export async function ensureHackathonSubmissionColumns({ sequelize }) {
  // Add mentor approval + participation detail columns (safe, idempotent).
  await sequelize.query(`
    ALTER TABLE "hackathon_submissions"
      ADD COLUMN IF NOT EXISTS "why_participate" TEXT,
      ADD COLUMN IF NOT EXISTS "problem_to_solve" TEXT,
      ADD COLUMN IF NOT EXISTS "planned_tech" TEXT,
      ADD COLUMN IF NOT EXISTS "worked_before" VARCHAR(32),
      ADD COLUMN IF NOT EXISTS "agreed_terms" BOOLEAN,
      ADD COLUMN IF NOT EXISTS "mentor_approved" BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS "mentor_approved_by_user_id" INTEGER,
      ADD COLUMN IF NOT EXISTS "mentor_approved_at" TIMESTAMP WITH TIME ZONE;
  `);
}

