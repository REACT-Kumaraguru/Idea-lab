import { sequelize } from "../lib/db.js";

/**
 * Ensures the equipment_bookings table has the new fields:
 * - purpose_of_usage (TEXT)
 * - benefits_for_kct (ENUM 'yes', 'no')
 * - benefits_reason (TEXT)
 */
export const ensureBookingFields = async () => {
  try {
    const queryInterface = sequelize.getQueryInterface();

    // Check if columns exist and add them if they don't
    const tableDescription = await queryInterface.describeTable("equipment_bookings");

    // Add purpose_of_usage if it doesn't exist
    if (!tableDescription.purpose_of_usage) {
      console.log("[Migration] Adding purpose_of_usage column to equipment_bookings...");
      await queryInterface.addColumn("equipment_bookings", "purpose_of_usage", {
        type: sequelize.Sequelize.DataTypes.TEXT,
        allowNull: true,
      }); 
      console.log("[Migration] ✓ Added purpose_of_usage column");
    }

    // Add benefits_for_kct if it doesn't exist
    if (!tableDescription.benefits_for_kct) {
      console.log("[Migration] Adding benefits_for_kct column to equipment_bookings...");
      await queryInterface.addColumn("equipment_bookings", "benefits_for_kct", {
        type: sequelize.Sequelize.DataTypes.ENUM("yes", "no"),
        allowNull: true,
      });
      console.log("[Migration] ✓ Added benefits_for_kct column");
    }

    // Add benefits_reason if it doesn't exist
    if (!tableDescription.benefits_reason) {
      console.log("[Migration] Adding benefits_reason column to equipment_bookings...");
      await queryInterface.addColumn("equipment_bookings", "benefits_reason", {
        type: sequelize.Sequelize.DataTypes.TEXT,
        allowNull: true,
      });
      console.log("[Migration] ✓ Added benefits_reason column");
    }

    console.log("[Migration] Booking fields are up to date");
  } catch (error) {
    console.error("[Migration Error] ensureBookingFields:", error.message);
    throw error;
  }
};
