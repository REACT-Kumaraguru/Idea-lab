export async function ensureHackathonUserColumns({ sequelize }) {
  const isPostgres = sequelize.getDialect() === "postgres";

  const alterTableAddColumn = async (table, col, def) => {
    try {
      if (isPostgres) {
        await sequelize.query(`ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "${col}" ${def};`);
      } else {
        // SQLite: check if column exists first
        const [results] = await sequelize.query(`PRAGMA table_info("${table}");`);
        const exists = results.some((row) => row.name === col);
        if (!exists) {
          await sequelize.query(`ALTER TABLE "${table}" ADD COLUMN "${col}" ${def};`);
        }
      }
    } catch (err) {
      console.warn(`Could not add column ${col} to ${table}:`, err.message);
    }
  };

  if (isPostgres) {
    const userQueries = [
      `ALTER TABLE "hackathon_users" ADD COLUMN IF NOT EXISTS "name" VARCHAR(255);`,
      `ALTER TABLE "hackathon_users" ADD COLUMN IF NOT EXISTS "phone" VARCHAR(32);`,
      `ALTER TABLE "hackathon_users" ADD COLUMN IF NOT EXISTS "degree" VARCHAR(32);`,
      `ALTER TABLE "hackathon_users" ADD COLUMN IF NOT EXISTS "college" VARCHAR(255);`,
      `ALTER TABLE "hackathon_users" ADD COLUMN IF NOT EXISTS "branch" VARCHAR(255);`,
      `ALTER TABLE "hackathon_users" ADD COLUMN IF NOT EXISTS "graduation_year" INTEGER;`,
    ];
    for (const q of userQueries) {
      try { await sequelize.query(q); } catch {}
    }
    try {
      await sequelize.query(`ALTER TABLE "hackathon_users" ALTER COLUMN "phone_number" DROP NOT NULL;`);
    } catch {}
  }

  // Ensure hackathons columns
  await alterTableAddColumn("hackathons", "venue", "VARCHAR(255) DEFAULT 'Kumaraguru College of Technology'");
  await alterTableAddColumn("hackathons", "organized_by", "VARCHAR(255) DEFAULT 'AICTE IDEA Lab, KCT'");
  await alterTableAddColumn("hackathons", "problem_statement_type", "VARCHAR(50) DEFAULT 'predefined'");

  // Ensure hackathon_teams columns
  await alterTableAddColumn("hackathon_teams", "topic", "VARCHAR(255)");
  await alterTableAddColumn("hackathon_teams", "description", "TEXT");
}

