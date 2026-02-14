
import { DataTypes } from "sequelize";
import { sequelize } from "../lib/db.js";

const Equipment = sequelize.define(
  "Equipment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    equipmentName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "equipment_name",
    },
    brandName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "brand_name",
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    rentAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.00,
      field: "rent_amount",
    },
    equipmentDetails: {
      type: DataTypes.TEXT, // Use TEXT for potentially longer descriptions
      allowNull: true,
      field: "equipment_details",
    },
    isAvailable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: "is_available",
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true, // Image might be optional or added later
    },
  },
  {
    tableName: "equipments",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Equipment;
