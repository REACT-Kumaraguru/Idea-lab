import { DataTypes } from "sequelize";
import { sequelize } from "../lib/db.js";

const ProblemStatementDocument = sequelize.define(
  "ProblemStatementDocument",
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
    documentPath: {
      type: DataTypes.STRING(500),
      allowNull: false,
      field: "document_path",
    },
    documentName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "document_name",
    },
    documentSize: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "document_size",
    },
    documentType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "document_type",
    },
  },
  {
    tableName: "problem_statement_documents",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

export default ProblemStatementDocument;
