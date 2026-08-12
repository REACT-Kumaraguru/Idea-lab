import { DataTypes } from "sequelize";
import { sequelize } from "../lib/db.js";

const EquipmentBooking = sequelize.define(
  "EquipmentBooking",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    equipmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "equipment_id",
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "user_id",
    },
    bookingDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: "booking_date",
    },
    bookingTime: {
      type: DataTypes.TIME,
      allowNull: false,
      field: "booking_time",
    },
    duration: {
      // If DB exists: ALTER TABLE equipment_bookings MODIFY COLUMN duration DECIMAL(4,2) NOT NULL DEFAULT 1;
      type: DataTypes.DECIMAL(4, 2),
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 0.5,
        max: 12,
      },
    },
    status: {
      // If DB already exists: ALTER TABLE equipment_bookings MODIFY COLUMN status ENUM('draft','pending','approved','rejected','completed','cancelled') NOT NULL DEFAULT 'draft';
      type: DataTypes.ENUM("draft", "pending", "approved", "rejected", "completed", "cancelled"),
      defaultValue: "draft",
      allowNull: false,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: "total_amount",
    },
    purposeOfUsage: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "purpose_of_usage",
    },
    benefitsForKCT: {
      type: DataTypes.ENUM("yes", "no"),
      allowNull: true,
      field: "benefits_for_kct",
    },
    benefitsReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "benefits_reason",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    submissionBatchId: {
      type: DataTypes.STRING(64),
      allowNull: true,
      field: "submission_batch_id",
    },
    verifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "verified_at",
    },
  },
  {
    tableName: "equipment_bookings",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default EquipmentBooking;
