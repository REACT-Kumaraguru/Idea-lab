export async function ensurePerformanceIndexes({ sequelize }) {
  try {
    const dialect = sequelize.getDialect();
    if (dialect === "postgres") {
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_equipment_bookings_eq_date_status ON "equipment_bookings" ("equipment_id", "booking_date", "status");
        CREATE INDEX IF NOT EXISTS idx_hackathon_teams_hid_status ON "hackathon_teams" ("hackathon_id", "status");
        CREATE INDEX IF NOT EXISTS idx_hackathon_submissions_tid_phase ON "hackathon_submissions" ("team_id", "submission_phase");
        CREATE INDEX IF NOT EXISTS idx_otp_codes_email_type_exp ON "otp_codes" ("email", "type", "expires_at");
        CREATE UNIQUE INDEX IF NOT EXISTS uq_hackathon_team_members_team_user ON "hackathon_team_members" ("team_id", "user_id");
        CREATE INDEX IF NOT EXISTS idx_hackathon_email_logs_recipient ON "hackathon_email_logs" ("recipient_email", "status", "created_at");
        CREATE INDEX IF NOT EXISTS idx_hackathon_payments_utr ON "hackathon_payment_details" ("transaction_id");
      `);
      console.log("[db] Ensured composite performance indexes on PostgreSQL tables");
    } else if (dialect === "sqlite") {
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_equipment_bookings_eq_date_status ON equipment_bookings (equipment_id, booking_date, status);
      `).catch(() => {});
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_hackathon_teams_hid_status ON hackathon_teams (hackathon_id, status);
      `).catch(() => {});
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_hackathon_submissions_tid_phase ON hackathon_submissions (team_id, submission_phase);
      `).catch(() => {});
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_otp_codes_email_type_exp ON otp_codes (email, type, expires_at);
      `).catch(() => {});
      await sequelize.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS uq_hackathon_team_members_team_user ON hackathon_team_members (team_id, user_id);
      `).catch(() => {});
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_hackathon_email_logs_recipient ON hackathon_email_logs (recipient_email, status, created_at);
      `).catch(() => {});
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_hackathon_payments_utr ON hackathon_payment_details (transaction_id);
      `).catch(() => {});
      console.log("[db] Ensured composite performance indexes on SQLite tables");
    }
  } catch (err) {
    console.warn("[db] Index creation warning:", err.message);
  }
}
