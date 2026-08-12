/**
 * Many-to-many: problems ↔ mentors via hackathon_problem_mentors.
 * Migrates legacy hackathon_problems.mentor_id then drops that column.
 */
export async function ensureHackathonProblemMentors({ sequelize }) {
  if (sequelize.getDialect() !== "postgres") return;
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS "hackathon_problem_mentors" (
      "problem_id" INTEGER NOT NULL REFERENCES "hackathon_problems"("id") ON DELETE CASCADE,
      "mentor_id" INTEGER NOT NULL REFERENCES "hackathon_mentors"("id") ON DELETE CASCADE,
      PRIMARY KEY ("problem_id", "mentor_id")
    );
  `);

  await sequelize.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'hackathon_problems' AND column_name = 'mentor_id'
      ) THEN
        INSERT INTO "hackathon_problem_mentors" ("problem_id", "mentor_id")
        SELECT p."id", p."mentor_id"
        FROM "hackathon_problems" p
        WHERE p."mentor_id" IS NOT NULL
        ON CONFLICT DO NOTHING;

        ALTER TABLE "hackathon_problems" DROP COLUMN "mentor_id";
      END IF;
    END$$;
  `);
}
