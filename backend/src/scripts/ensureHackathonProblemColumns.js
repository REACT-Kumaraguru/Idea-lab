export async function ensureHackathonProblemColumns({ sequelize }) {
  await sequelize.query(`
    ALTER TABLE "hackathon_problems" ADD COLUMN IF NOT EXISTS "team_registration_limit" INTEGER;
  `);
  await sequelize.query(`
    ALTER TABLE "hackathon_problems" ADD COLUMN IF NOT EXISTS "mentor_id" INTEGER;
  `);
  await sequelize.query(`
    ALTER TABLE "hackathon_problems" DROP COLUMN IF EXISTS "prize_amount";
  `);
  await sequelize.query(`
    ALTER TABLE "hackathon_problems" DROP COLUMN IF EXISTS "seed_money_amount";
  `);
}
