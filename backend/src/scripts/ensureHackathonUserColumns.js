export async function ensureHackathonUserColumns({ sequelize }) {
  const isPostgres = sequelize.getDialect() === "postgres";

  const alterTableAddColumn = async (table, col, def) => {
    try {
      if (isPostgres) {
        await sequelize.query(`ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "${col}" ${def};`);
      } else {
        const [results] = await sequelize.query(`PRAGMA table_info("${table}");`);
        const exists = (results || []).some((row) => row.name === col);
        if (!exists) {
          await sequelize.query(`ALTER TABLE "${table}" ADD COLUMN "${col}" ${def};`);
          console.log(`[db] Added column ${col} to ${table} (sqlite)`);
        }
      }
    } catch (err) {
      console.warn(`Could not add column ${col} to ${table}:`, err.message);
    }
  };

  // Ensure hackathon_users columns
  await alterTableAddColumn("hackathon_users", "name", "VARCHAR(255)");
  await alterTableAddColumn("hackathon_users", "phone", "VARCHAR(32)");
  await alterTableAddColumn("hackathon_users", "phone_number", "VARCHAR(32)");
  await alterTableAddColumn("hackathon_users", "degree", "VARCHAR(32)");
  await alterTableAddColumn("hackathon_users", "college", "VARCHAR(255)");
  await alterTableAddColumn("hackathon_users", "branch", "VARCHAR(255)");
  await alterTableAddColumn("hackathon_users", "graduation_year", "INTEGER");
  await alterTableAddColumn("hackathon_users", "assigned_theme", "VARCHAR(255)");
  await alterTableAddColumn("hackathon_users", "assigned_cluster", "VARCHAR(255)");

  // Ensure hackathons columns
  await alterTableAddColumn("hackathons", "venue", "VARCHAR(255) DEFAULT 'Kumaraguru College of Technology'");
  await alterTableAddColumn("hackathons", "organized_by", "VARCHAR(255) DEFAULT 'AICTE IDEA Lab, KCT'");
  await alterTableAddColumn("hackathons", "problem_statement_type", "VARCHAR(50) DEFAULT 'predefined'");
  await alterTableAddColumn("hackathons", "show_results", "BOOLEAN DEFAULT false");
  await alterTableAddColumn("hackathons", "guidelines", "TEXT");
  await alterTableAddColumn("hackathons", "is_registration_locked", "BOOLEAN DEFAULT false");
  await alterTableAddColumn("hackathons", "is_poc_submission_locked", "BOOLEAN DEFAULT false");
  await alterTableAddColumn("hackathons", "is_problem_statement_locked", "BOOLEAN DEFAULT false");
  await alterTableAddColumn("hackathons", "is_on_campus_event_active", "BOOLEAN DEFAULT false");
  await alterTableAddColumn("hackathons", "whatsapp_invite_link", "VARCHAR(255)");
  await alterTableAddColumn("hackathons", "faculty_coordinates", "TEXT");
  await alterTableAddColumn("hackathons", "student_coordinates", "TEXT");
  await alterTableAddColumn("hackathons", "gallery", "TEXT");

  // Ensure hackathon_teams columns
  await alterTableAddColumn("hackathon_teams", "theme", "VARCHAR(255)");
  await alterTableAddColumn("hackathon_teams", "topic", "VARCHAR(255)");
  await alterTableAddColumn("hackathon_teams", "description", "TEXT");
  await alterTableAddColumn("hackathon_teams", "cluster", "VARCHAR(255)");
  await alterTableAddColumn("hackathon_teams", "cluster_marks", "FLOAT");
  await alterTableAddColumn("hackathon_teams", "cluster_feedback", "TEXT");
  await alterTableAddColumn("hackathon_teams", "cluster_evaluated_by", "VARCHAR(255)");
  await alterTableAddColumn("hackathon_teams", "cluster_evaluated_by_id", "INTEGER");
  await alterTableAddColumn("hackathon_teams", "cluster_evaluated_at", "DATETIME");
  await alterTableAddColumn("hackathon_teams", "assigned_faculty_id", "INTEGER");
  await alterTableAddColumn("hackathon_teams", "assigned_faculty_name", "VARCHAR(255)");
  await alterTableAddColumn("hackathon_teams", "assigned_faculty_email", "VARCHAR(255)");
  await alterTableAddColumn("hackathon_teams", "reviewer_id", "INTEGER");
  await alterTableAddColumn("hackathon_teams", "reviewer_feedback", "TEXT");
  await alterTableAddColumn("hackathon_teams", "reviewed_at", "DATETIME");
  await alterTableAddColumn("hackathon_teams", "abstraction_status", "VARCHAR(50) DEFAULT 'draft'");
  await alterTableAddColumn("hackathon_teams", "is_present", "BOOLEAN DEFAULT false");
  await alterTableAddColumn("hackathon_teams", "bench_number", "VARCHAR(255)");
  await alterTableAddColumn("hackathon_teams", "attendance_marked_at", "DATETIME");
  await alterTableAddColumn("hackathon_teams", "attendance_marked_by", "VARCHAR(255)");
}

export default ensureHackathonUserColumns;
