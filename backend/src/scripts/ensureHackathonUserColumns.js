export async function ensureHackathonUserColumns({ sequelize }) {
  // Sequelize sync() won't add new columns in this project.
  // So we ensure required columns exist with best-effort ALTER TABLE.
  const queries = [
    `ALTER TABLE "hackathon_users" ADD COLUMN IF NOT EXISTS "name" VARCHAR(255);`,
    `ALTER TABLE "hackathon_users" ADD COLUMN IF NOT EXISTS "phone" VARCHAR(32);`,
    `ALTER TABLE "hackathon_users" ADD COLUMN IF NOT EXISTS "degree" VARCHAR(32);`,
    `ALTER TABLE "hackathon_users" ADD COLUMN IF NOT EXISTS "college" VARCHAR(255);`,
    `ALTER TABLE "hackathon_users" ADD COLUMN IF NOT EXISTS "branch" VARCHAR(255);`,
    `ALTER TABLE "hackathon_users" ADD COLUMN IF NOT EXISTS "graduation_year" INTEGER;`,
  ];

  for (const q of queries) {
    await sequelize.query(q);
  }
}

