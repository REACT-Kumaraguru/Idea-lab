export async function ensureHackathonColumns({ sequelize }) {
  try {
    const dialect = sequelize.getDialect();
    if (dialect === "postgres") {
      await sequelize.query(`
        ALTER TABLE "hackathons" ADD COLUMN IF NOT EXISTS "show_results" BOOLEAN DEFAULT false;
        ALTER TABLE "hackathons" ADD COLUMN IF NOT EXISTS "guidelines" TEXT;
        ALTER TABLE "hackathons" ADD COLUMN IF NOT EXISTS "is_registration_locked" BOOLEAN DEFAULT false;
        ALTER TABLE "hackathons" ADD COLUMN IF NOT EXISTS "is_poc_submission_locked" BOOLEAN DEFAULT false;
        ALTER TABLE "hackathons" ADD COLUMN IF NOT EXISTS "is_problem_statement_locked" BOOLEAN DEFAULT false;
        ALTER TABLE "hackathons" ADD COLUMN IF NOT EXISTS "is_on_campus_event_active" BOOLEAN DEFAULT false;
        ALTER TABLE "hackathons" ADD COLUMN IF NOT EXISTS "whatsapp_invite_link" VARCHAR(255);
        ALTER TABLE "hackathons" ADD COLUMN IF NOT EXISTS "faculty_coordinates" TEXT;
        ALTER TABLE "hackathons" ADD COLUMN IF NOT EXISTS "student_coordinates" TEXT;
        ALTER TABLE "hackathons" ADD COLUMN IF NOT EXISTS "gallery" TEXT;

        ALTER TABLE "hackathon_teams" ADD COLUMN IF NOT EXISTS "hackathon_id" INTEGER DEFAULT 1;
        ALTER TABLE "hackathon_teams" ADD COLUMN IF NOT EXISTS "theme" VARCHAR(255);
        ALTER TABLE "hackathon_teams" ADD COLUMN IF NOT EXISTS "is_present" BOOLEAN DEFAULT false;
        ALTER TABLE "hackathon_teams" ADD COLUMN IF NOT EXISTS "bench_number" VARCHAR(255);
        ALTER TABLE "hackathon_teams" ADD COLUMN IF NOT EXISTS "attendance_marked_at" TIMESTAMPTZ;
        ALTER TABLE "hackathon_teams" ADD COLUMN IF NOT EXISTS "attendance_marked_by" VARCHAR(255);
        ALTER TABLE "hackathon_problems" ADD COLUMN IF NOT EXISTS "hackathon_id" INTEGER DEFAULT 1;
        ALTER TABLE "hackathon_mentors" ADD COLUMN IF NOT EXISTS "hackathon_id" INTEGER;
        ALTER TABLE "hackathon_submissions" ADD COLUMN IF NOT EXISTS "hackathon_id" INTEGER DEFAULT 1;
        ALTER TABLE "hackathon_registrations" ADD COLUMN IF NOT EXISTS "hackathon_id" INTEGER DEFAULT 1;
        ALTER TABLE "hackathon_logs" ADD COLUMN IF NOT EXISTS "hackathon_id" INTEGER;
      `);
      console.log("[db] Added missing hackathon columns to PostgreSQL tables");
    } else if (dialect === "sqlite") {
      const [cols] = await sequelize.query("PRAGMA table_info(hackathons);");
      const names = (cols || []).map((c) => c.name);
      if (!names.includes("schedule")) {
        await sequelize.query("ALTER TABLE hackathons ADD COLUMN schedule TEXT;");
        console.log("[db] Added column schedule to hackathons");
      }
      if (!names.includes("show_results")) {
        await sequelize.query("ALTER TABLE hackathons ADD COLUMN show_results INTEGER DEFAULT 0;");
        console.log("[db] Added column show_results to hackathons");
      }
      if (!names.includes("venue")) {
        await sequelize.query("ALTER TABLE hackathons ADD COLUMN venue VARCHAR(255) DEFAULT 'Kumaraguru College of Technology';");
        console.log("[db] Added column venue to hackathons");
      }
      if (!names.includes("organized_by")) {
        await sequelize.query("ALTER TABLE hackathons ADD COLUMN organized_by VARCHAR(255) DEFAULT 'AICTE IDEA Lab, KCT';");
        console.log("[db] Added column organized_by to hackathons");
      }
      if (!names.includes("coordinators")) {
        await sequelize.query("ALTER TABLE hackathons ADD COLUMN coordinators TEXT;");
        console.log("[db] Added column coordinators to hackathons");
      }
      if (!names.includes("tagline")) {
        await sequelize.query("ALTER TABLE hackathons ADD COLUMN tagline VARCHAR(255);");
      }
      if (!names.includes("in_association_with")) {
        await sequelize.query("ALTER TABLE hackathons ADD COLUMN in_association_with VARCHAR(255);");
      }
      if (!names.includes("prizes")) {
        await sequelize.query("ALTER TABLE hackathons ADD COLUMN prizes VARCHAR(255);");
      }
      if (!names.includes("refreshments")) {
        await sequelize.query("ALTER TABLE hackathons ADD COLUMN refreshments TEXT;");
      }
      if (!names.includes("required_documents")) {
        await sequelize.query("ALTER TABLE hackathons ADD COLUMN required_documents TEXT;");
      }
      if (!names.includes("themes")) {
        await sequelize.query("ALTER TABLE hackathons ADD COLUMN themes TEXT;");
      }
      if (!names.includes("guidelines")) {
        await sequelize.query("ALTER TABLE hackathons ADD COLUMN guidelines TEXT;");
      }
      if (!names.includes("is_registration_locked")) {
        await sequelize.query("ALTER TABLE hackathons ADD COLUMN is_registration_locked INTEGER DEFAULT 0;");
      }
      if (!names.includes("is_poc_submission_locked")) {
        await sequelize.query("ALTER TABLE hackathons ADD COLUMN is_poc_submission_locked INTEGER DEFAULT 0;");
      }
      if (!names.includes("is_problem_statement_locked")) {
        await sequelize.query("ALTER TABLE hackathons ADD COLUMN is_problem_statement_locked INTEGER DEFAULT 0;");
      }
      if (!names.includes("is_on_campus_event_active")) {
        await sequelize.query("ALTER TABLE hackathons ADD COLUMN is_on_campus_event_active INTEGER DEFAULT 0;");
      }
      if (!names.includes("whatsapp_invite_link")) {
        await sequelize.query("ALTER TABLE hackathons ADD COLUMN whatsapp_invite_link VARCHAR(255);");
      }
      if (!names.includes("faculty_coordinates")) {
        await sequelize.query("ALTER TABLE hackathons ADD COLUMN faculty_coordinates TEXT;");
      }
      if (!names.includes("student_coordinates")) {
        await sequelize.query("ALTER TABLE hackathons ADD COLUMN student_coordinates TEXT;");
      }
      if (!names.includes("gallery")) {
        await sequelize.query("ALTER TABLE hackathons ADD COLUMN gallery TEXT;");
      }

      const [teamCols] = await sequelize.query("PRAGMA table_info(hackathon_teams);").catch(() => [[]]);
      const teamColNames = (teamCols || []).map((c) => c.name);
      if (!teamColNames.includes("theme")) {
        await sequelize.query("ALTER TABLE hackathon_teams ADD COLUMN theme VARCHAR(255);").catch(() => {});
        console.log("[db] Added column theme to hackathon_teams");
      }
      if (!teamColNames.includes("hackathon_id")) {
        await sequelize.query("ALTER TABLE hackathon_teams ADD COLUMN hackathon_id INTEGER DEFAULT 1;").catch(() => {});
      }
      if (!teamColNames.includes("is_present")) {
        await sequelize.query("ALTER TABLE hackathon_teams ADD COLUMN is_present INTEGER DEFAULT 0;").catch(() => {});
      }
      if (!teamColNames.includes("bench_number")) {
        await sequelize.query("ALTER TABLE hackathon_teams ADD COLUMN bench_number VARCHAR(255);").catch(() => {});
      }
      if (!teamColNames.includes("attendance_marked_at")) {
        await sequelize.query("ALTER TABLE hackathon_teams ADD COLUMN attendance_marked_at DATETIME;").catch(() => {});
      }
      if (!teamColNames.includes("attendance_marked_by")) {
        await sequelize.query("ALTER TABLE hackathon_teams ADD COLUMN attendance_marked_by VARCHAR(255);").catch(() => {});
      }
    }
  } catch (err) {
    console.error("Error in ensureHackathonColumns:", err.message);
  }
}

