export async function ensureHackathonSubmissionPhaseColumns({ sequelize }) {
  await sequelize.query(`
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_hackathon_submissions_submission_phase') THEN
        ALTER TYPE "enum_hackathon_submissions_submission_phase" ADD VALUE IF NOT EXISTS 'final';
      END IF;
    END$$;
  `);
}
