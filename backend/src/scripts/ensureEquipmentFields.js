import { sequelize } from "../lib/db.js";

/**
 * Ensures the equipments table has the new pricing field:
 * - kct_price_per_hour (DECIMAL(10, 2), default 0.00)
 * 
 * Rules:
 * - Users with email ending in @kct.ac.in receive cost 0 (kct_price_per_hour = 0.00).
 * - Users with any other email receive price_per_hour.
 */
export const ensureEquipmentFields = async () => {
  try {
    const queryInterface = sequelize.getQueryInterface();
    const tableDescription = await queryInterface.describeTable("equipments");

    if (!tableDescription.kct_price_per_hour) {
      console.log("[Migration] Adding kct_price_per_hour column to equipments...");
      await queryInterface.addColumn("equipments", "kct_price_per_hour", {
        type: sequelize.Sequelize.DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.00,
      });
      // Backfill existing rows with 0.00
      await sequelize.query("UPDATE equipments SET kct_price_per_hour = 0.00 WHERE kct_price_per_hour IS NULL;");
      console.log("[Migration] ✓ Added kct_price_per_hour column (default 0.00 for @kct.ac.in users)");
    } else {
      // Ensure no NULL values exist
      await sequelize.query("UPDATE equipments SET kct_price_per_hour = 0.00 WHERE kct_price_per_hour IS NULL;");
    }

    console.log("[Migration] Equipment pricing fields verified successfully");

    if (!tableDescription.category) {
      console.log("[Migration] Adding category column to equipments...");
      await queryInterface.addColumn("equipments", "category", {
        type: sequelize.Sequelize.DataTypes.STRING,
        allowNull: true,
        defaultValue: "Mandatory Machines",
      });
      console.log("[Migration] ✓ Added category column");
    }

    // Populate / Backfill categories for all equipment
    const computingIds = [49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,111,135,136,137,138,139,140,141,142,143,144,145,147,148,149,158,159,160,169];
    const electronicIds = [12,13,22,23,24,25,26,40,44,46,47,48,146,150,151,152,153,154,155,156,157];
    const mechanicalIds = [29,30,31,32,33,34,35,36,37,38,39,41,42,43,45];

    // Bulk update categories
    await sequelize.query(`UPDATE equipments SET category = 'Computing' WHERE id IN (${computingIds.join(",")});`);
    await sequelize.query(`UPDATE equipments SET category = 'Electronic Tools' WHERE id IN (${electronicIds.join(",")}) OR (id >= 67 AND id <= 110) OR (id >= 112 AND id <= 134);`);
    await sequelize.query(`UPDATE equipments SET category = 'Mechanical Tools' WHERE id IN (${mechanicalIds.join(",")});`);
    await sequelize.query(`UPDATE equipments SET category = 'Mandatory Machines' WHERE category IS NULL OR category = '' OR (id <= 28 AND category NOT IN ('Electronic Tools', 'Computing'));`);

    console.log("[Migration] ✓ Equipment categories backfilled successfully");

    // Also verify equipment_bookings consumables fields
    const bookingTableDesc = await queryInterface.describeTable("equipment_bookings").catch(() => null);
    if (bookingTableDesc) {
      if (!bookingTableDesc.consumables_requested) {
        console.log("[Migration] Adding consumables_requested column to equipment_bookings...");
        await queryInterface.addColumn("equipment_bookings", "consumables_requested", {
          type: sequelize.Sequelize.DataTypes.TEXT,
          allowNull: true,
        });
        console.log("[Migration] ✓ Added consumables_requested column");
      }
      if (!bookingTableDesc.consumables_purpose) {
        console.log("[Migration] Adding consumables_purpose column to equipment_bookings...");
        await queryInterface.addColumn("equipment_bookings", "consumables_purpose", {
          type: sequelize.Sequelize.DataTypes.TEXT,
          allowNull: true,
        });
        console.log("[Migration] ✓ Added consumables_purpose column");
      }
    }
  } catch (error) {
    console.error("[Migration Error] ensureEquipmentFields:", error.message);
    throw error;
  }
};

