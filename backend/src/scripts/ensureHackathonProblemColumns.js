export async function ensureHackathonProblemColumns({ sequelize }) {
  if (sequelize.getDialect() !== "postgres") return;
  await sequelize.query(`
    ALTER TABLE "hackathon_problems" ADD COLUMN IF NOT EXISTS "team_registration_limit" INTEGER;
  `);
  /* mentor_id replaced by hackathon_problem_mentors (see ensureHackathonProblemMentors.js) */
  await sequelize.query(`
    ALTER TABLE "hackathon_problems" DROP COLUMN IF EXISTS "prize_amount";
  `);
  await sequelize.query(`
    ALTER TABLE "hackathon_problems" DROP COLUMN IF EXISTS "seed_money_amount";
  `);
}
