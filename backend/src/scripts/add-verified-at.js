/**
 * Add verified_at column to equipment_bookings (for QR verification).
 * Run from project root: node backend/src/scripts/add-verified-at.js
 * Or from backend: node src/scripts/add-verified-at.js
 */
import { sequelize } from "../lib/db.js";

const run = async () => {
  try {
    await sequelize.authenticate();
    console.log("MySQL connected.");
    await sequelize.query(`
      ALTER TABLE equipment_bookings
      ADD COLUMN verified_at DATETIME NULL
    `);
    console.log("✓ Column equipment_bookings.verified_at added.");
    process.exit(0);
  } catch (err) {
    if (err.original?.code === "ER_DUP_FIELD_NAME") {
      console.log("Column verified_at already exists. Nothing to do.");
      process.exit(0);
      return;
    }
    console.error("Error:", err.message);
    process.exit(1);
  }
};

run();
