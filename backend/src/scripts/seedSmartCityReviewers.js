import bcrypt from "bcryptjs";
import { sequelize } from "../lib/db.js";
import HackathonUser from "../models/hackathon/HackathonUserModel.js";

const REVIEWER_SPECS = [
  { theme: "Disaster Resilience", emails: ["reviewer.disaster1@kct.ac.in", "reviewer.disaster2@kct.ac.in"], names: ["Reviewer Disaster Resilience 1", "Reviewer Disaster Resilience 2"] },
  { theme: "Waste Management", emails: ["reviewer.waste1@kct.ac.in", "reviewer.waste2@kct.ac.in"], names: ["Reviewer Waste Management 1", "Reviewer Waste Management 2"] },
  { theme: "Energy Solutions", emails: ["reviewer.energy1@kct.ac.in", "reviewer.energy2@kct.ac.in"], names: ["Reviewer Energy Solutions 1", "Reviewer Energy Solutions 2"] },
  { theme: "Smart Agriculture", emails: ["reviewer.agriculture1@kct.ac.in", "reviewer.agriculture2@kct.ac.in"], names: ["Reviewer Smart Agriculture 1", "Reviewer Smart Agriculture 2"] },
  { theme: "Pollution Control", emails: ["reviewer.pollution1@kct.ac.in", "reviewer.pollution2@kct.ac.in"], names: ["Reviewer Pollution Control 1", "Reviewer Pollution Control 2"] },
  { theme: "Smart Mobility & Parking", emails: ["reviewer.mobility1@kct.ac.in", "reviewer.mobility2@kct.ac.in"], names: ["Reviewer Smart Mobility 1", "Reviewer Smart Mobility 2"] },
  { theme: "Smart Healthcare", emails: ["reviewer.healthcare1@kct.ac.in", "reviewer.healthcare2@kct.ac.in"], names: ["Reviewer Smart Healthcare 1", "Reviewer Smart Healthcare 2"] },
];

async function main() {
  console.log("=== SEEDING 14 SMART CITY HACKATHON REVIEWERS ===");
  await sequelize.authenticate();

  // Add missing columns safely if not present
  const dialect = sequelize.getDialect();
  const alterCol = async (table, col, def) => {
    try {
      if (dialect === "postgres") {
        await sequelize.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${col} ${def};`);
      } else {
        await sequelize.query(`ALTER TABLE ${table} ADD COLUMN ${col} ${def};`);
      }
    } catch (e) {
      // Ignore duplicate column errors
    }
  };

  await alterCol("hackathon_users", "assigned_theme", "VARCHAR(255)");
  await alterCol("hackathon_teams", "abstraction_status", "VARCHAR(50) DEFAULT 'draft'");
  await alterCol("hackathon_teams", "reviewer_id", "INTEGER");
  await alterCol("hackathon_teams", "reviewer_feedback", "TEXT");
  await alterCol("hackathon_teams", "reviewed_at", "TIMESTAMP");

  const credentialsList = [];

  for (const spec of REVIEWER_SPECS) {
    for (let i = 0; i < spec.emails.length; i++) {
      const email = spec.emails[i];
      const fullName = spec.names[i];
      const prefix = email.split("@")[0];
      const passwordHash = await bcrypt.hash(prefix, 10);

      const [user, created] = await HackathonUser.findOrCreate({
        where: { email },
        defaults: {
          fullName,
          email,
          password: passwordHash,
          role: "reviewer",
          assignedTheme: spec.theme,
          phoneNumber: `999000${Math.floor(1000 + Math.random() * 9000)}`,
        },
      });

      if (!created) {
        await user.update({
          fullName,
          password: passwordHash,
          role: "reviewer",
          assignedTheme: spec.theme,
        });
      }

      credentialsList.push({
        theme: spec.theme,
        fullName,
        email,
        password: prefix,
        role: "reviewer",
      });
    }
  }

  console.log("\n=======================================================");
  console.log("SUCCESSFULLY PROVISIONED 14 SMART CITY REVIEWER ACCOUNTS");
  console.log("=======================================================");
  console.table(credentialsList);

  process.exit(0);
}

main().catch((err) => {
  console.error("Failed to seed reviewers:", err);
  process.exit(1);
});
