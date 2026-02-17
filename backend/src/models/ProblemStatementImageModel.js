import { DataTypes } from "sequelize";
import { sequelize } from "../lib/db.js";

const ProblemStatementImage = sequelize.define(
  "ProblemStatementImage",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    problemStatementId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "problem_statement_id",
    },
    imagePath: {
      type: DataTypes.STRING(500),
      allowNull: false,
      field: "image_path",
    },
    imageName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "image_name",
    },
    imageSize: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "image_size",
    },
    imageType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "image_type",
    },
  },
  {
    tableName: "problem_statement_images",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

export default ProblemStatementImage;
